// Headers currently tracked for highlighting, refreshed on each nav/render.
let headers: Element[] = [];

// Recomputed from scratch (rather than patched incrementally from
// IntersectionObserver entries) so that fast scrolling can never leave a
// header's highlight state stale. IntersectionObserver only reports when a
// target's intersection ratio *crosses* a threshold; on a large/fast scroll
// jump a header can go from fully below the viewport to fully above it (or
// vice versa) between two frames without ever registering as intersecting,
// so no entry fires and its class never updates. Reading the live
// bounding rect for every header on every scroll avoids that failure mode
// entirely, and is cheap since the header count is small.
function updateTocHighlight() {
  const windowHeight = window.innerHeight;
  for (const header of headers) {
    const slug = header.id;
    const tocEntryElements = document.querySelectorAll(`a[data-for="${slug}"]`);
    if (tocEntryElements.length === 0) continue;
    const inView = header.getBoundingClientRect().y < windowHeight;
    tocEntryElements.forEach((tocEntryElement) =>
      tocEntryElement.classList.toggle("in-view", inView),
    );
  }
}

let tocHighlightUpdateQueued = false;
function queueTocHighlightUpdate() {
  if (tocHighlightUpdateQueued) return;
  tocHighlightUpdateQueued = true;
  requestAnimationFrame(() => {
    tocHighlightUpdateQueued = false;
    updateTocHighlight();
  });
}

function toggleToc(this: HTMLElement) {
  this.classList.toggle("collapsed");
  this.setAttribute(
    "aria-expanded",
    this.getAttribute("aria-expanded") === "true" ? "false" : "true",
  );
  const content = this.nextElementSibling as HTMLElement | undefined;
  if (!content) return;
  content.classList.toggle("collapsed");
}

function setupToc() {
  const tocElements = Array.from(document.getElementsByClassName("toc"));
  for (const toc of tocElements) {
    const button = toc.querySelector(".toc-header");
    const content = toc.querySelector(".toc-content");
    if (!button || !content) return;
    button.addEventListener("click", toggleToc);
    const cleanup = () => button.removeEventListener("click", toggleToc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).addCleanup) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).addCleanup(cleanup);
    }
  }
}

function handleNavOrRender() {
  setupToc();

  // update toc entry highlighting
  headers = Array.from(document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"));
  updateTocHighlight();
}

document.addEventListener("nav", handleNavOrRender);
document.addEventListener("render", handleNavOrRender);
window.addEventListener("scroll", queueTocHighlightUpdate, { passive: true });
window.addEventListener("resize", queueTocHighlightUpdate);
