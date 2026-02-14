# @quartz-community/table-of-contents

Renders an interactive table of contents for pages. Also includes a transformer that extracts heading structure from markdown.

## Installation

```bash
npx quartz plugin add github:quartz-community/table-of-contents
```

## Usage

```ts
// quartz.config.ts
import * as ExternalPlugin from "./.quartz/plugins"
plugins: {
  transformers: [ExternalPlugin.TableOfContentsTransformer({ maxDepth: 3 })],
}

// quartz.layout.ts
import * as Plugin from "./.quartz/plugins"
// In layout right sidebar:
Plugin.TableOfContents()
```

## Configuration

### Component Options

| Option   | Type                   | Default    | Description                                |
| -------- | ---------------------- | ---------- | ------------------------------------------ |
| `layout` | `"modern" \| "legacy"` | `"modern"` | The layout style of the table of contents. |

### Transformer Options

| Option              | Type      | Default | Description                                                              |
| ------------------- | --------- | ------- | ------------------------------------------------------------------------ |
| `maxDepth`          | `number`  | `3`     | The maximum heading depth to include in the table of contents (1-6).     |
| `minEntries`        | `number`  | `1`     | The minimum number of entries required to display the table of contents. |
| `showByDefault`     | `boolean` | `true`  | Whether to show the table of contents by default.                        |
| `collapseByDefault` | `boolean` | `false` | Whether to collapse the table of contents by default.                    |

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/) for more information.

## License

MIT
