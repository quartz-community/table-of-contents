# Changelog

## 1.0.3

### Patch Changes

- 5bee983: Uses Quartz's own `preact` instead of bundling a second copy (`noExternal` in the build overrode the externals). Components now share one Preact instance with Quartz and other plugins, so hooks and context work across them, and the bundle is smaller.

## 1.0.2

### Patch Changes

- e3c8041: TOC links now always reach their heading. Each entry takes its link from the heading's actual `id` instead of slugging the heading separately, which missed or reached the wrong heading for headings with inline HTML or SmartyPants changes, and for a heading name repeated at a depth below `maxDepth`. With `linkHeadings: false` in github-flavored-markdown, headings listed in the TOC now get an id so its links work.

## 1.0.1

### Patch Changes

- afbe510: Headings inside blockquotes and callouts are no longer listed in the table of contents, matching Obsidian (jackyzha0/quartz#2515).
- a566bfc: The highlighted table of contents entries now stay correct after fast or instant scrolling (scrollbar drag, End/Home, jumping to an anchor); highlighting is recomputed from heading positions instead of relying only on IntersectionObserver callbacks (jackyzha0/quartz#2482).
- d662ced: Use sentence case for the French title: "Table des matières" instead of "Table des Matières" (jackyzha0/quartz#2513).
- 5f54438: A long table of contents can now be scrolled to its last entry; previously the TOC could grow past the bottom of the right sidebar, leaving the last headings unreachable (jackyzha0/quartz#2514).

## 1.0.0

### Major Changes

- Stable 1.0 release. All `@quartz-community/*` dependencies now use `^1.0.0` ranges.

  Pre-1.0 caret ranges pinned the minor version (`^0.2.1` means `>=0.2.1 <0.3.0`), so
  published fixes to shared packages could never be resolved by dependents. Moving the
  ecosystem to 1.0 makes caret ranges behave conventionally.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial Quartz community plugin template.
