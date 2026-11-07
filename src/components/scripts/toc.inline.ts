let headers: Element[] = [];

// A heading is "in view" once its top has scrolled above the bottom of the viewport.
// Recompute every heading from its position: when scrolling fast (scrollbar drag, End key,
// instant jumps) a heading can skip past the viewport in a single frame without ever
// intersecting it, so IntersectionObserver entries alone miss it.
function updateTocHighlight() {
  const windowHeight = window.innerHeight;
  for (const header of headers) {
    const inView = header.getBoundingClientRect().y < windowHeight;
    document
      .querySelectorAll(`a[data-for="${header.id}"]`)
      .forEach((tocEntryElement) => tocEntryElement.classList.toggle("in-view", inView));
  }
}

let frame: number | undefined;
function scheduleTocHighlight() {
  if (frame !== undefined) return;
  frame = requestAnimationFrame(() => {
    frame = undefined;
    updateTocHighlight();
  });
}

const observer = new IntersectionObserver(scheduleTocHighlight);

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
  observer.disconnect();
  headers = Array.from(
    document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"),
  ).filter((header) => document.querySelector(`a[data-for="${header.id}"]`));
  headers.forEach((header) => observer.observe(header));
  updateTocHighlight();
}

document.addEventListener("scroll", scheduleTocHighlight, { passive: true });
window.addEventListener("resize", scheduleTocHighlight, { passive: true });

document.addEventListener("nav", handleNavOrRender);
document.addEventListener("render", handleNavOrRender);
