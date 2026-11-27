import { describe, expect, it, vi } from "vitest";
import type { ComponentChildren, VNode } from "preact";
import TableOfContents from "../src/components/TableOfContents";

// The bundler imports the browser script as a string; here it would run (and need a DOM).
vi.mock("../src/components/scripts/toc.inline.ts", () => ({ default: "" }));

type Props = Record<string, unknown> & { children?: ComponentChildren };
type Node = { type: string; props: Props; children: Node[] };

// Resolve function components down to the host elements they render.
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

function find(nodes: Node[], type: string): Node[] {
  return nodes.flatMap((n) => [...(n.type === type ? [n] : []), ...find(n.children, type)]);
}

// fileData.toc as Quartz's TableOfContents transformer writes it (github-slugger ids).
const toc = [
  { depth: 0, text: "Getting Started", slug: "getting-started" },
  { depth: 1, text: "Install Quartz", slug: "install-quartz" },
];

function renderToc(component: ReturnType<typeof TableOfContents>, collapseToc = false) {
  return render(
    component({
      fileData: { toc, collapseToc },
      cfg: { locale: "en-US" },
    } as never) as ComponentChildren,
  );
}

describe("TableOfContents (modern layout)", () => {
  it("points the toggle button's aria-controls at the list's toc-list-<n> id", () => {
    const tree = renderToc(TableOfContents());
    const [button] = find(tree, "button");
    const [ul] = find(tree, "ul");
    expect(button!.props["aria-controls"]).toMatch(/^toc-list-\d+$/);
    expect(button!.props["aria-controls"]).toBe(ul!.props.id);
    expect(button!.props["aria-expanded"]).toBe(true);
    expect(ul!.props.class).toBe("toc-content overflow");
    expect(find(tree, "a").map((a) => a.props.href)).toEqual([
      "#getting-started",
      "#install-quartz",
    ]);
  });

  it("gives two instances distinct list ids, each matching its own button", () => {
    const first = renderToc(TableOfContents());
    const second = renderToc(TableOfContents(), true);
    const firstId = find(first, "ul")[0]!.props.id;
    const secondId = find(second, "ul")[0]!.props.id;
    expect(firstId).toMatch(/^toc-list-\d+$/);
    expect(secondId).toMatch(/^toc-list-\d+$/);
    expect(secondId).not.toBe(firstId);
    expect(find(second, "button")[0]!.props["aria-controls"]).toBe(secondId);
    expect(find(second, "button")[0]!.props["aria-expanded"]).toBe(false);
  });
});
