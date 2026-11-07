---
"@quartz-community/table-of-contents": patch
---

The highlighted table of contents entries now stay correct after fast or instant scrolling (scrollbar drag, End/Home, jumping to an anchor); highlighting is recomputed from heading positions instead of relying only on IntersectionObserver callbacks (jackyzha0/quartz#2482).
