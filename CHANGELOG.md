# Changelog

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
