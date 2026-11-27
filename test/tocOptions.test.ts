import { describe, expect, it, vi } from "vitest";
import type { Heading, Root } from "mdast";
import type { Element, Root as HastRoot } from "hast";
import type { ComponentChildren, VNode } from "preact";
import { VFile } from "vfile";
import { TableOfContentsTransformer } from "../src/transformer";
import TableOfContents from "../src/components/TableOfContents";

vi.mock("../src/components/scripts/toc.inline.ts", () => ({ default: "" }));

const heading = (depth: 1 | 2 | 3 | 4 | 5 | 6, text: string): Heading => ({
  type: "heading",
  depth,
  children: [{ type: "text", value: text }],
});

async function run(
  headings: Heading[],
  opts: Parameters<typeof TableOfContentsTransformer>[0] = {},
  frontmatter?: Record<string, unknown>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugin = TableOfContentsTransformer(opts) as any;
  const file = new VFile();
  if (frontmatter) file.data.frontmatter = frontmatter as never;
  await plugin.markdownPlugins()[0]()({ type: "root", children: headings } as Root, file);
  return file.data as { toc?: unknown[]; collapseToc?: boolean };
}

describe("when a page gets a table of contents", () => {
  const two = [heading(2, "A"), heading(2, "B")];

  it("needs more than minEntries headings (default 1)", async () => {
    expect((await run([heading(2, "A")])).toc).toBeUndefined();
    expect((await run(two)).toc).toHaveLength(2);
    expect((await run(two, { minEntries: 2 })).toc).toBeUndefined();
    expect((await run([], { minEntries: 0 })).toc).toBeUndefined();
  });

  it("follows the page's enableToc over showByDefault", async () => {
    expect((await run(two, {}, { enableToc: false })).toc).toBeUndefined();
    expect((await run(two, { showByDefault: false })).toc).toBeUndefined();
    expect((await run(two, { showByDefault: false }, { enableToc: true })).toc).toHaveLength(2);
  });

  it("starts collapsed with collapseByDefault", async () => {
    expect((await run(two, { collapseByDefault: true })).collapseToc).toBe(true);
    expect((await run(two)).collapseToc).toBe(false);
  });
});

describe("headings on a page without a table of contents", () => {
  it("are left as they are, without the TOC's marker", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugin = TableOfContentsTransformer({}) as any;
    const file = new VFile();
    const h: Element = {
      type: "element",
      tagName: "h2",
      properties: { dataTocEntry: "0" },
      children: [{ type: "text", value: "Only" }],
    };
    plugin.htmlPlugins()[0]()({ type: "root", children: [h] } as HastRoot, file);
    expect(h.properties).toEqual({});
  });
});

describe("a heading with an empty id", () => {
  it("is given one, which its entry links to", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugin = TableOfContentsTransformer({ minEntries: 0 }) as any;
    const file = new VFile();
    const md = heading(2, "Title");
    await plugin.markdownPlugins()[0]()({ type: "root", children: [md] } as Root, file);
    const h: Element = {
      type: "element",
      tagName: "h2",
      properties: { ...(md.data as { hProperties: Record<string, string> }).hProperties, id: "" },
      children: [
        { type: "text", value: "Custom " },
        {
          type: "element",
          tagName: "em",
          properties: {},
          children: [{ type: "text", value: "Text" }],
        },
      ],
    };
    plugin.htmlPlugins()[0]()({ type: "root", children: [h] } as HastRoot, file);
    expect(h.properties.id).toBe("custom-text");
    expect(file.data.toc).toEqual([{ depth: 0, text: "Title", slug: "custom-text" }]);
  });
});

type Props = Record<string, unknown> & { children?: ComponentChildren };
type Node = { type: string; props: Props; children: Node[] };
function render(child: ComponentChildren): Node[] {
  if (child === null || child === undefined || typeof child === "boolean") return [];
  if (Array.isArray(child)) return child.flatMap(render);
  if (typeof child !== "object") return [];
  const vnode = child as VNode<Props>;
  if (typeof vnode.type === "function") {
    return render((vnode.type as (p: Props) => ComponentChildren)(vnode.props));
  }
  return [
    { type: vnode.type as string, props: vnode.props, children: render(vnode.props.children) },
  ];
}
const find = (nodes: Node[], type: string): Node[] =>
  nodes.flatMap((n) => [...(n.type === type ? [n] : []), ...find(n.children, type)]);
const textOf = (n: Node | string): string =>
  typeof n === "string"
    ? n
    : [n.props.children]
        .flat()
        .map((c) => (typeof c === "string" ? c : ""))
        .join("");

const toc = [
  { depth: 0, text: "Start", slug: "start" },
  { depth: 1, text: "Install", slug: "install" },
];
const draw = (layout: "modern" | "legacy" | undefined, fileData: Record<string, unknown>) =>
  render(
    TableOfContents(layout ? { layout } : undefined)({
      fileData,
      cfg: { locale: "en-US" },
    } as never) as ComponentChildren,
  );

describe("TableOfContents component", () => {
  it("indents entries by depth and links them to their headings", () => {
    for (const layout of ["modern", "legacy"] as const) {
      // (the modern list ends with OverflowList's marker item)
      const items = find(draw(layout, { toc }), "li").filter((li) =>
        String(li.props.class).startsWith("depth-"),
      );
      expect(items.map((li) => li.props.class)).toEqual(["depth-0", "depth-1"]);
      const links = find(items, "a");
      expect(links.map((a) => [a.props.href, a.props["data-for"], textOf(a)])).toEqual([
        ["#start", "start", "Start"],
        ["#install", "install", "Install"],
      ]);
    }
  });

  it("marks a collapsed table of contents", () => {
    const tree = draw(undefined, { toc, collapseToc: true });
    expect(find(tree, "button")[0]!.props.class).toBe("collapsed toc-header");
    expect(find(tree, "ul")[0]!.props.class).toBe("collapsed toc-content overflow");
    expect(find(draw(undefined, { toc }), "button")[0]!.props.class).toBe("toc-header");
  });

  it("is a details element in the legacy layout, open unless collapsed", () => {
    expect(find(draw("legacy", { toc }), "details")[0]!.props.open).toBe(true);
    expect(find(draw("legacy", { toc, collapseToc: true }), "details")[0]!.props.open).toBe(false);
    expect(find(draw("legacy", { toc }), "h3").map(textOf)).toEqual(["Table of Contents"]);
  });

  it("renders nothing for a page without one", () => {
    expect(draw(undefined, {})).toEqual([]);
    expect(draw("legacy", {})).toEqual([]);
  });
});
