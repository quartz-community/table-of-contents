# @quartz-community/table-of-contents

Renders an interactive table of contents for pages. Also includes a transformer that extracts heading structure from markdown.

## Installation

```bash
npx quartz plugin add @quartz-community/table-of-contents
```

The table of contents is already in Quartz's default configuration.

## Usage

```yaml title="quartz.config.yaml"
plugins:
  - source: "@quartz-community/table-of-contents"
    enabled: true
    options:
      maxDepth: 3
      layout: modern
    order: 50
    layout:
      position: right
      priority: 30
```

One plugin entry provides both the transformer that collects the headings and the component that displays them: `options` takes the options of both, and `layout` places the component.

For advanced use cases, you can override in TypeScript:

```ts title="quartz.ts (override)"
import * as ExternalPlugin from "./.quartz/plugins";

// Transformer
ExternalPlugin.TableOfContentsTransformer({ maxDepth: 3 });

// Component
ExternalPlugin.TableOfContents({ layout: "modern" });
```

## Configuration

### Component Options

| Option   | Type                   | Default    | Description                                |
| -------- | ---------------------- | ---------- | ------------------------------------------ |
| `layout` | `"modern" \| "legacy"` | `"modern"` | The layout style of the table of contents. |

### Transformer Options

| Option              | Type      | Default | Description                                                                                               |
| ------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `maxDepth`          | `number`  | `3`     | The maximum heading depth to include in the table of contents (1-6).                                      |
| `minEntries`        | `number`  | `1`     | The table of contents is only shown when it has more than this many entries.                              |
| `showByDefault`     | `boolean` | `true`  | Whether to show the table of contents by default. Override per page with the `enableToc` frontmatter key. |
| `collapseByDefault` | `boolean` | `false` | Whether to collapse the table of contents by default.                                                     |

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/plugins/TableOfContents) for more information.

## License

MIT
