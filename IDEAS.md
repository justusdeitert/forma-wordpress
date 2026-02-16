# Favicon Feature Ideas

## Quick Wins

| Feature | Description | Status |
|---------|-------------|--------|
| **Dark mode favicon** | Upload a separate icon for dark mode (`prefers-color-scheme: dark`) — modern browsers support this via `<link media="...">` | |
| ~~**Favicon preview in browser tab**~~ | ~~Live preview showing how the favicon looks in a simulated browser tab~~ | ✅ Done |
| ~~**Padding/margin control**~~ | ~~Slider to add padding around the icon (useful when logos don't fill the square well)~~ | ✅ Done |
| ~~**Background fill option**~~ | ~~Toggle to add a solid background color behind transparent PNGs~~ | ✅ Done |
| ~~**Google Search preview**~~ | ~~Realistic SERP mockup showing how the favicon appears in search results~~ | ✅ Done |

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
- **Google Search preview** — realistic SERP mockup with favicon in circular container
- **Padding control** — adjustable 0–40% padding via range slider
- **Border radius** — adjustable 0–50% border radius
- **Background fill** — icon background color picker
- **Live preview** — client-side canvas preview updates in real time
- **Unsaved indicator** — amber badge when settings differ from generated output

## Preview Ideas

| Preview | Description | Priority |
|---------|-------------|----------|
| **iOS / Android home screen** | Apple Touch Icon (180px) and Android Chrome icon (192px) with rounded mask + label text, simulating the actual launcher | High |
| **Bookmark bar** | 16px favicon inline in a row of bookmark items to test legibility at smallest size | High |
| **PWA splash screen** | 512px icon centered on bg_color background, simulating the PWA startup screen | Medium |
| **Multiple tabs** | 4–5 tabs where the favicon is one among others to test distinguishability | Medium |
| **Windows taskbar** | 32px icon in a simulated Windows 11 taskbar strip | Low |
| **macOS Dock** | 512px icon with Dock shelf, showing how it looks as a saved web app | Low |
| **Browser address bar** | 16px favicon next to the URL in Chrome/Safari/Firefox | Low |
| **Discord / Slack link embed** | Favicon next to an unfurled link card | Low |

## Priority Suggestions

1. **Dark mode favicon** — very modern, easy to implement
2. **SVG favicon output** — better quality, smaller file size
3. **Maskable icon** — Android adaptive icon safe zone
