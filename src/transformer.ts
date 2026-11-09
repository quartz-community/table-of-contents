import type { QuartzTransformerPlugin } from "@quartz-community/types";
import type { Root } from "mdast";
import type { Root as HastRoot, Element, Nodes as HastNodes } from "hast";
import type { VFile } from "vfile";
import { visit, SKIP } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import { HeadingSlugger } from "@quartz-community/utils";

export interface TableOfContentsTransformerOptions {
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6;
  minEntries: number;
  showByDefault: boolean;
  collapseByDefault: boolean;
}

const defaultOptions: TableOfContentsTransformerOptions = {
  maxDepth: 3,
  minEntries: 1,
  showByDefault: true,
  collapseByDefault: false,
};

export interface TocEntry {
  depth: number;
  text: string;
  slug: string; // this is just the anchor (#some-slug), not the canonical slug
}

/**
 * hast property marking a heading listed in the TOC with its entry's index, so that the HTML stage
 * can take the entry's slug from the heading's real `id`.
 */
const ENTRY_PROPERTY = "dataTocEntry";

function hastText(node: HastNodes): string {
  if (node.type === "text") return node.value;
  return "children" in node ? node.children.map(hastText).join("") : "";
}

/**
 * HTML stage: point each TOC entry at its heading's `id`, as given by github-flavored-markdown
 * (which runs earlier, at order 30). A heading without an id (`linkHeadings: false`) is given one
 * with the same shared slugger, so TOC links always reach their heading.
 */
function rehypeTocSlugsFromIds() {
  return (tree: HastRoot, file: VFile) => {
    const toc = file.data.toc as TocEntry[] | undefined;
    const slugger = new HeadingSlugger();
    visit(tree, "element", (el: Element) => {
      if (!/^h[1-6]$/.test(el.tagName)) return;
      const entry = el.properties[ENTRY_PROPERTY];
      delete el.properties[ENTRY_PROPERTY];
      if (!toc) return;
      if (typeof el.properties.id !== "string" || el.properties.id === "") {
        el.properties.id = slugger.slug(hastText(el));
      }
      const index = Number(entry);
      if (entry !== undefined && toc[index]) toc[index].slug = el.properties.id as string;
    });
  };
}
// `callout` is the mdast node remark-obsidian produces for `> [!type]` blocks
const QUOTE_TYPES = new Set<string>(["blockquote", "callout"]);
export const TableOfContentsTransformer: QuartzTransformerPlugin<
  Partial<TableOfContentsTransformerOptions>
> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "TableOfContents",
    markdownPlugins() {
      return [
        () => {
          return async (tree: Root, file: VFile) => {
            const frontmatter = file.data.frontmatter as Record<string, unknown> | undefined;
            const display = frontmatter?.enableToc ?? opts.showByDefault;
            if (display) {
              // Fallback slugs, used only if a heading's id can't be read in the HTML stage. Every
              // heading counts towards repeats (-1, -2), as with the ids themselves.
              const slugAnchor = new HeadingSlugger();
              const toc: TocEntry[] = [];
              let highestDepth: number = opts.maxDepth;
              visit(tree, (node) => {
                // Obsidian omits headings inside blockquotes and callouts from the outline
                if (QUOTE_TYPES.has(node.type)) {
                  // ...but they still get ids, so keep the slugger in sync for duplicates
                  visit(node, "heading", (h) => {
                    slugAnchor.slug(toString(h, { includeHtml: false }));
                  });
                  return SKIP;
                }
                if (node.type !== "heading") return;
                const slug = slugAnchor.slug(toString(node, { includeHtml: false }));
                if (node.depth <= opts.maxDepth) {
                  const text = toString(node);
                  highestDepth = Math.min(highestDepth, node.depth);
                  // `hProperties` become the heading element's properties (mdast-util-to-hast)
                  const data = (node.data ??= {}) as { hProperties?: Record<string, unknown> };
                  data.hProperties = { ...data.hProperties, [ENTRY_PROPERTY]: String(toc.length) };
                  toc.push({ depth: node.depth, text, slug });
                }
              });

              if (toc.length > 0 && toc.length > opts.minEntries) {
                file.data.toc = toc.map((entry) => ({
                  ...entry,
                  depth: entry.depth - highestDepth,
                }));
                file.data.collapseToc = opts.collapseByDefault;
              }
            }
          };
        },
      ];
    },
    htmlPlugins() {
      return [rehypeTocSlugsFromIds];
    },
  };
};
