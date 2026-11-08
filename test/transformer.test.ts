import { describe, it, expect } from "vitest";
import type { Heading, Root, RootContent } from "mdast";
import { VFile } from "vfile";
import { TableOfContentsTransformer } from "../src/transformer";

const heading = (depth: 1 | 2 | 3, text: string): Heading => ({
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
});
