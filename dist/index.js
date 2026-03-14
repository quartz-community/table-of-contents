import { jsxs, jsx } from 'preact/jsx-runtime';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import Slugger from 'github-slugger';

// src/util/lang.ts
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/i18n/locales/en-US.ts
var en_US_default = {
  components: {
    tableOfContents: {
      title: "Table of Contents"
    }
  }
};

// src/i18n/index.ts
var locales = {
  "en-US": en_US_default
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}

// src/components/styles/legacyToc.scss
var legacyToc_default = "details.toc summary {\n  cursor: pointer;\n}\ndetails.toc summary::marker {\n  color: var(--dark);\n}\ndetails.toc summary > * {\n  padding-left: 0.25rem;\n  display: inline-block;\n  margin: 0;\n}\ndetails.toc ul {\n  list-style: none;\n  margin: 0.5rem 1.25rem;\n  padding: 0;\n}\ndetails.toc .depth-1 {\n  padding-left: calc(1rem * 1);\n}\ndetails.toc .depth-2 {\n  padding-left: calc(1rem * 2);\n}\ndetails.toc .depth-3 {\n  padding-left: calc(1rem * 3);\n}\ndetails.toc .depth-4 {\n  padding-left: calc(1rem * 4);\n}\ndetails.toc .depth-5 {\n  padding-left: calc(1rem * 5);\n}\ndetails.toc .depth-6 {\n  padding-left: calc(1rem * 6);\n}";

// src/components/styles/toc.scss
var toc_default = ".toc {\n  display: flex;\n  flex-direction: column;\n  overflow-y: hidden;\n  min-height: 1.4rem;\n  flex: 0 0.5 auto;\n}\n.toc:has(button.toc-header.collapsed) {\n  flex: 0 1 1.4rem;\n}\n\nbutton.toc-header {\n  background-color: transparent;\n  border: none;\n  text-align: left;\n  cursor: pointer;\n  padding: 0;\n  color: var(--dark);\n  display: flex;\n  align-items: center;\n}\nbutton.toc-header h3 {\n  font-size: 1rem;\n  display: inline-block;\n  margin: 0;\n}\nbutton.toc-header .fold {\n  margin-left: 0.5rem;\n  transition: transform 0.3s ease;\n  opacity: 0.8;\n}\nbutton.toc-header.collapsed .fold {\n  transform: rotateZ(-90deg);\n}\n\nul.toc-content.overflow {\n  list-style: none;\n  position: relative;\n  margin: 0.5rem 0;\n  padding: 0;\n  max-height: calc(100% - 2rem);\n  overscroll-behavior: contain;\n  list-style: none;\n}\nul.toc-content.overflow > li > a {\n  color: var(--dark);\n  opacity: 0.35;\n  transition: 0.5s ease opacity, 0.3s ease color;\n}\nul.toc-content.overflow > li > a.in-view {\n  opacity: 0.75;\n}\nul.toc-content.overflow .depth-0 {\n  padding-left: calc(1rem * 0);\n}\nul.toc-content.overflow .depth-1 {\n  padding-left: calc(1rem * 1);\n}\nul.toc-content.overflow .depth-2 {\n  padding-left: calc(1rem * 2);\n}\nul.toc-content.overflow .depth-3 {\n  padding-left: calc(1rem * 3);\n}\nul.toc-content.overflow .depth-4 {\n  padding-left: calc(1rem * 4);\n}\nul.toc-content.overflow .depth-5 {\n  padding-left: calc(1rem * 5);\n}\nul.toc-content.overflow .depth-6 {\n  padding-left: calc(1rem * 6);\n}";

// src/components/scripts/toc.inline.ts
var toc_inline_default = 'var i=new IntersectionObserver(t=>{for(let e of t){let n=e.target.id,o=document.querySelectorAll(`a[data-for="${n}"]`),s=e.rootBounds?.height;s&&o.length>0&&(e.boundingClientRect.y<s?o.forEach(c=>c.classList.add("in-view")):o.forEach(c=>c.classList.remove("in-view")))}});function r(){this.classList.toggle("collapsed"),this.setAttribute("aria-expanded",this.getAttribute("aria-expanded")==="true"?"false":"true");let t=this.nextElementSibling;t&&t.classList.toggle("collapsed")}function a(){let t=Array.from(document.getElementsByClassName("toc"));for(let e of t){let n=e.querySelector(".toc-header"),o=e.querySelector(".toc-content");if(!n||!o)return;n.addEventListener("click",r);let s=()=>n.removeEventListener("click",r);window.addCleanup&&window.addCleanup(s)}}function d(){a(),i.disconnect(),document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]").forEach(e=>i.observe(e))}document.addEventListener("nav",d);document.addEventListener("render",d);\n';
var OverflowList = ({
  children,
  ...props
}) => {
  return /* @__PURE__ */ jsxs("ul", { ...props, class: [props.class, "overflow"].filter(Boolean).join(" "), id: props.id, children: [
    children,
    /* @__PURE__ */ jsx("li", { class: "overflow-end" })
  ] });
};
var numLists = 0;
var OverflowList_default = () => {
  const id = `list-${numLists++}`;
  return {
    OverflowList: (props) => /* @__PURE__ */ jsx(OverflowList, { ...props, id }),
    overflowListAfterDOMLoaded: `
document.addEventListener("nav", (e) => {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const parentUl = entry.target.parentElement
      if (!parentUl) return
      if (entry.isIntersecting) {
        parentUl.classList.remove("gradient-active")
      } else {
        parentUl.classList.add("gradient-active")
      }
    }
  })

  const ul = document.getElementById("${id}")
  if (!ul) return

  const end = ul.querySelector(".overflow-end")
  if (!end) return

  observer.observe(end)
  const cleanup = () => observer.disconnect()
  if (window.addCleanup) {
    window.addCleanup(cleanup)
  }
})
`
  };
};

// src/util/resources.ts
function concatenateResources(...resources) {
  return resources.filter((resource) => resource !== void 0).flat();
}
var defaultOptions = {
  layout: "modern"
};
var numTocs = 0;
var TableOfContents_default = ((opts) => {
  const layout = opts?.layout ?? defaultOptions.layout;
  const { OverflowList: OverflowList2, overflowListAfterDOMLoaded } = OverflowList_default();
  const TableOfContents = (props) => {
    const { fileData, cfg } = props;
    if (!fileData?.toc) {
      return null;
    }
    const id = `toc-${numTocs++}`;
    return /* @__PURE__ */ jsxs("div", { class: classNames("toc"), children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          class: fileData.collapseToc ? "collapsed toc-header" : "toc-header",
          "aria-controls": id,
          "aria-expanded": !fileData.collapseToc,
          children: [
            /* @__PURE__ */ jsx("h3", { children: i18n(cfg.locale).components.tableOfContents.title }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: "24",
                height: "24",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                class: "fold",
                children: /* @__PURE__ */ jsx("polyline", { points: "6 9 12 15 18 9" })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        OverflowList2,
        {
          id,
          class: fileData.collapseToc ? "collapsed toc-content" : "toc-content",
          children: fileData.toc.map((tocEntry) => {
            const slug = String(tocEntry.slug);
            const depth = String(tocEntry.depth);
            const text = String(tocEntry.text);
            return /* @__PURE__ */ jsx("li", { class: `depth-${depth}`, children: /* @__PURE__ */ jsx("a", { href: `#${slug}`, "data-for": slug, children: text }) }, slug);
          })
        }
      )
    ] });
  };
  TableOfContents.css = toc_default;
  TableOfContents.afterDOMLoaded = concatenateResources(
    toc_inline_default,
    overflowListAfterDOMLoaded
  );
  const LegacyTableOfContents = (props) => {
    const { fileData, cfg } = props;
    if (!fileData?.toc) {
      return null;
    }
    return /* @__PURE__ */ jsxs("details", { class: "toc", open: !fileData.collapseToc, children: [
      /* @__PURE__ */ jsx("summary", { children: /* @__PURE__ */ jsx("h3", { children: i18n(cfg.locale).components.tableOfContents.title }) }),
      /* @__PURE__ */ jsx("ul", { children: fileData.toc.map((tocEntry) => {
        const slug = String(tocEntry.slug);
        const depth = String(tocEntry.depth);
        const text = String(tocEntry.text);
        return /* @__PURE__ */ jsx("li", { class: `depth-${depth}`, children: /* @__PURE__ */ jsx("a", { href: `#${slug}`, "data-for": slug, children: text }) }, slug);
      }) })
    ] });
  };
  LegacyTableOfContents.css = legacyToc_default;
  return layout === "modern" ? TableOfContents : LegacyTableOfContents;
});
var defaultOptions2 = {
  maxDepth: 3,
  minEntries: 1,
  showByDefault: true,
  collapseByDefault: false
};
var slugAnchor = new Slugger();
var TableOfContentsTransformer = (userOpts) => {
  const opts = { ...defaultOptions2, ...userOpts };
  return {
    name: "TableOfContents",
    markdownPlugins() {
      return [
        () => {
          return async (tree, file) => {
            const frontmatter = file.data.frontmatter;
            const display = frontmatter?.enableToc ?? opts.showByDefault;
            if (display) {
              slugAnchor.reset();
              const toc = [];
              let highestDepth = opts.maxDepth;
              visit(tree, "heading", (node) => {
                if (node.depth <= opts.maxDepth) {
                  const text = toString(node);
                  highestDepth = Math.min(highestDepth, node.depth);
                  toc.push({
                    depth: node.depth,
                    text,
                    slug: slugAnchor.slug(text)
                  });
                }
              });
              if (toc.length > 0 && toc.length > opts.minEntries) {
                file.data.toc = toc.map((entry) => ({
                  ...entry,
                  depth: entry.depth - highestDepth
                }));
                file.data.collapseToc = opts.collapseByDefault;
              }
            }
          };
        }
      ];
    }
  };
};

export { TableOfContents_default as TableOfContents, TableOfContentsTransformer };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map