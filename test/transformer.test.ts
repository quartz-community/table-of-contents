import { describe, it, expect } from "vitest";
import type { Heading, Root, RootContent } from "mdast";
import type { Element, Root as HastRoot } from "hast";
import { VFile } from "vfile";
import { TableOfContentsTransformer } from "../src/transformer";

const heading = (depth: 1 | 2 | 3 | 4 | 5 | 6, text: string): Heading => ({
  type: "heading",
  depth,
  children: [{ type: "text", value: text }],
});

async function toc(children: RootContent[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugin = TableOfContentsTransformer({ minEntries: 0 }) as any;
  const transform = plugin.markdownPlugins()[0]();
  const file = new VFile();
  await transform({ type: "root", children } as Root, file);
  return file.data.toc;
}

describe("TableOfContentsTransformer", () => {
  it("lists top-level headings", async () => {
    expect(await toc([heading(2, "One"), heading(3, "Two")])).toEqual([
      { depth: 0, text: "One", slug: "one" },
      { depth: 1, text: "Two", slug: "two" },
    ]);
  });

  // jackyzha0/quartz#2515
  it("skips headings inside blockquotes and callouts", async () => {
    const callout = {
      type: "callout",
      children: [heading(3, "Callout heading")],
    } as unknown as RootContent;
    expect(
      await toc([
        heading(2, "Real"),
        { type: "blockquote", children: [heading(2, "Quoted")] },
        callout,
        heading(2, "Second"),
      ]),
    ).toEqual([
      { depth: 0, text: "Real", slug: "real" },
      { depth: 0, text: "Second", slug: "second" },
    ]);
  });

  it("keeps slugs in sync with skipped duplicate headings", async () => {
    expect(
      await toc([{ type: "blockquote", children: [heading(2, "Same")] }, heading(2, "Same")]),
    ).toEqual([{ depth: 0, text: "Same", slug: "same-1" }]);
  });

  // quartz-community/table-of-contents#3
  describe("takes each entry's slug from its heading's id", () => {
    /**
     * Run the Markdown stage, turn the headings into hast (as mdast-util-to-hast does, keeping
     * `hProperties`), give them `ids`, then run the HTML stage.
     */
    async function tocWithIds(children: Heading[], ids: (string | undefined)[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = TableOfContentsTransformer({ minEntries: 0 }) as any;
      const file = new VFile();
      await plugin.markdownPlugins()[0]()({ type: "root", children } as Root, file);
      const elements: Element[] = children.map((h, i) => ({
        type: "element",
        tagName: `h${h.depth}`,
        properties: {
          ...(h.data as { hProperties?: Record<string, string> } | undefined)?.hProperties,
          ...(ids[i] === undefined ? {} : { id: ids[i] }),
        },
        children: h.children.map((c) => ({
          type: "text",
          value: "value" in c ? String(c.value) : "",
        })),
      }));
      const tree: HastRoot = { type: "root", children: elements };
      plugin.htmlPlugins()[0]()(tree, file);
      return { toc: file.data.toc, elements };
    }

    it("a heading name repeated below maxDepth", async () => {
      // rehype-slug ids: the h4 is "foo", the h2 "foo-1"
      const { toc, elements } = await tocWithIds(
        [heading(4, "Foo"), heading(2, "Foo")],
        ["foo", "foo-1"],
      );
      expect(toc).toEqual([{ depth: 0, text: "Foo", slug: "foo-1" }]);
      expect(elements.every((el) => !("dataTocEntry" in el.properties))).toBe(true);
    });

    it("a heading whose id differs from its Markdown text", async () => {
      // e.g. SmartyPants or inline HTML: the id is what the heading really has
      const { toc } = await tocWithIds([heading(2, "Range 1—2")], ["range-1--2"]);
      expect(toc).toEqual([{ depth: 0, text: "Range 1—2", slug: "range-1--2" }]);
    });

    it("gives headings without an id one (linkHeadings: false)", async () => {
      const { toc, elements } = await tocWithIds(
        [heading(2, "Same"), heading(2, "Same")],
        [undefined, undefined],
      );
      expect(toc).toEqual([
        { depth: 0, text: "Same", slug: "same" },
        { depth: 0, text: "Same", slug: "same-1" },
      ]);
      expect(elements.map((el) => el.properties.id)).toEqual(["same", "same-1"]);
    });

    it("falls back to counting every heading, not only those within maxDepth", async () => {
      expect(await toc([heading(4, "Foo"), heading(2, "Foo")])).toEqual([
        { depth: 0, text: "Foo", slug: "foo-1" },
      ]);
    });
  });
});
