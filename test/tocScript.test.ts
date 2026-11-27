import { afterEach, describe, expect, it, vi } from "vitest";

/** An element with just what the TOC script uses: classes, attributes, listeners. */
function fakeElement(nextElementSibling?: unknown) {
  const classes = new Set<string>();
  const attributes = new Map<string, string>();
  return Object.assign(new EventTarget(), {
    nextElementSibling,
    classList: {
      toggle: (name: string) => (classes.has(name) ? classes.delete(name) : classes.add(name)),
      contains: (name: string) => classes.has(name),
    },
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    getAttribute: (name: string) => attributes.get(name) ?? null,
  });
}

/** A `.toc`: its button (`.toc-header`) and list (`.toc-content`), either left out. */
function fakeToc(parts: { header: boolean; content: boolean }) {
  const content = parts.content ? fakeElement() : null;
  const header = parts.header ? fakeElement(content) : null;
  const toc = {
    querySelector: (selector: string) =>
      selector === ".toc-header" ? header : selector === ".toc-content" ? content : null,
  };
  return { toc, header, content };
}

/** Runs the TOC script against `tocs` and fires `nav`, as Quartz does on each page load. */
async function loadScript(tocs: ReturnType<typeof fakeToc>[]) {
  const cleanups: (() => void)[] = [];
  const document = Object.assign(new EventTarget(), {
    getElementsByClassName: (name: string) => (name === "toc" ? tocs.map((t) => t.toc) : []),
    querySelectorAll: () => [],
    querySelector: () => null,
  });
  const window = Object.assign(new EventTarget(), {
    innerHeight: 800,
    addCleanup: (fn: () => void) => cleanups.push(fn),
  });
  vi.stubGlobal("document", document);
  vi.stubGlobal("window", window);
  vi.stubGlobal("requestAnimationFrame", (fn: () => void) => setTimeout(fn, 0));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.resetModules();
  // @ts-expect-error a browser script, not a module: importing it runs it
  await import("../src/components/scripts/toc.inline");
  document.dispatchEvent(new CustomEvent("nav"));
  return { cleanups };
}

const click = (el: EventTarget | null) => el!.dispatchEvent(new Event("click"));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the TOC script", () => {
  it("collapses and expands a TOC with its button", async () => {
    const toc = fakeToc({ header: true, content: true });
    await loadScript([toc]);
    click(toc.header);
    expect(toc.header!.classList.contains("collapsed")).toBe(true);
    expect(toc.content!.classList.contains("collapsed")).toBe(true);
    expect(toc.header!.getAttribute("aria-expanded")).toBe("true");
    click(toc.header);
    expect(toc.content!.classList.contains("collapsed")).toBe(false);
  });

  it("sets up the TOCs after one without a header or list", async () => {
    const broken = fakeToc({ header: false, content: true });
    const listless = fakeToc({ header: true, content: false });
    const toc = fakeToc({ header: true, content: true });
    const { cleanups } = await loadScript([broken, listless, toc]);
    click(toc.header);
    expect(toc.content!.classList.contains("collapsed")).toBe(true);
    // the TOC without a list gets no listener
    click(listless.header);
    expect(listless.header!.classList.contains("collapsed")).toBe(false);
    expect(cleanups).toHaveLength(1);
  });

  it("removes its listeners on cleanup", async () => {
    const toc = fakeToc({ header: true, content: true });
    const { cleanups } = await loadScript([toc]);
    cleanups.forEach((fn) => fn());
    click(toc.header);
    expect(toc.content!.classList.contains("collapsed")).toBe(false);
  });
});
