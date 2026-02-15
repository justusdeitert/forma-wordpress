# Favicon Feature Ideas

## Quick Wins

| Feature | Description | Status |
|---------|-------------|--------|
| **Dark mode favicon** | Upload a separate icon for dark mode (`prefers-color-scheme: dark`) — modern browsers support this via `<link media="...">` | |
| ~~**Favicon preview in browser tab**~~ | ~~Live preview showing how the favicon looks in a simulated browser tab~~ | ✅ Done |
| ~~**Padding/margin control**~~ | ~~Slider to add padding around the icon (useful when logos don't fill the square well)~~ | ✅ Done |
| ~~**Background fill option**~~ | ~~Toggle to add a solid background color behind transparent PNGs~~ | ✅ Done |

## Advanced

| Feature | Description |
|---------|-------------|
| **SVG favicon** | Serve native SVG favicon for modern browsers (sharper at any size) — falls back to ICO for old browsers |
| **Maskable icon** | Generate a "safe zone" version for Android adaptive icons |
| **Crop/position tool** | Simple drag-to-reposition if the source isn't perfectly square |
| **PWA manifest editor** | Let users edit app name, short name, display mode, orientation |

## Nice to Have

| Feature | Description |
|---------|-------------|
| **Favicon from text** | Generate a simple letter/emoji favicon (like Notion does with page icons) |
| **History/versioning** | Keep previous favicon versions, easy rollback |
| **Import from URL** | Paste a URL to fetch an existing favicon |
| **Export package** | Download a ZIP with all generated files |

## Implemented

- **Favicon preview in browser tab** — browser-tab mockup with light/dark toggle
- **Padding control** — adjustable 0–40% padding via range slider
- **Border radius** — adjustable 0–50% border radius
- **Background fill** — icon background color picker
- **Live preview** — client-side canvas preview updates in real time
- **Unsaved indicator** — amber badge when settings differ from generated output

## Priority Suggestions

1. **Dark mode favicon** — very modern, easy to implement
2. **SVG favicon output** — better quality, smaller file size
3. **Maskable icon** — Android adaptive icon safe zone
