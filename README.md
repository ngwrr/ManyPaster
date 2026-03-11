# ManyPaster

Pixso plugin for bulk text paste into multiple text layers. Inspired by [Many Paster](https://www.figma.com/community/plugin/742635866097079612) for Figma.

## Features

- **Bulk paste** — paste multiple lines of text into multiple text layers
- **Copy selected** — extract text from selected layers
- **Sort order** — row-by-row (Z-pattern) or column-by-column (N-pattern)
- **Loop paste** — cycle through lines if more layers than lines
- **Reverse order** — paste lines in reverse
- **Ignore symbols** — remove specified characters when pasting
- **Persistent settings** — options are saved between sessions

## Installation

### For development

```bash
cd ~/Projects/ManyPaster
npm install
npm run dev
```

Then in Pixso:
1. Open any file
2. Plugins → Development → Import plugin from manifest
3. Select `manifest.json`

### Browser setup (required for dev mode)

Pixso blocks localhost connections by default. Run Chromium with:

```bash
chromium --disable-web-security --disable-features=OutOfBlinkCors,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessRespectPreflightResults,PrivateNetworkAccessSendPreflights --user-data-dir=/tmp/chromium-dev
```

## Usage

1. Select multiple text layers in Pixso
2. Enter text in the plugin (each line = one layer)
3. Choose sort order (row/column)
4. Click "Paste data"

## Development

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run test     # Run tests in watch mode
npm run test:run # Run tests once
```

## Project Structure

```
ManyPaster/
├── src/
│   ├── main.ts      # Plugin logic (Pixso sandbox)
│   └── utils.ts     # Pure utility functions
├── ui/
│   └── ui.ts        # UI code (iframe)
├── tests/
│   └── utils.test.ts
├── dist/            # Built files
├── manifest.json    # Plugin manifest
└── plugin.config.ts # Build config
```

## License

MIT
