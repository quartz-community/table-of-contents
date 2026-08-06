---
"@quartz-community/table-of-contents": patch
---

Fix TOC highlight getting stuck stale on fast scroll. Highlighting relied on `IntersectionObserver`, which only fires when a header's intersection ratio crosses a threshold; a fast/large scroll jump could move a header from fully below the viewport to fully above it (or vice versa) between two frames without ever registering as intersecting, leaving its highlight stuck at the old state. Highlighting now recomputes from live `getBoundingClientRect()` geometry on scroll/resize instead.
