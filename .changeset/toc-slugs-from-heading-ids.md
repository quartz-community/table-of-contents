---
"@quartz-community/table-of-contents": patch
---

TOC links now always reach their heading. Each entry takes its link from the heading's actual `id` instead of slugging the heading separately, which missed or reached the wrong heading for headings with inline HTML or SmartyPants changes, and for a heading name repeated at a depth below `maxDepth`. With `linkHeadings: false` in github-flavored-markdown, headings listed in the TOC now get an id so its links work.
