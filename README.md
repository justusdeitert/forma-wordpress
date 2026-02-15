# Forma Favicon

WordPress plugin for generating and managing favicons. Upload a source image, configure colors, and generate all required favicon sizes including ICO, Apple Touch Icon, Android Chrome icons, and web manifest.

## Features

- Upload any image (PNG, JPEG, GIF, WebP) or SVG as favicon source
- Generates all standard sizes: 16×16, 32×32, 48×48, 180×180, 192×192, 512×512
- Creates `favicon.ico` with multiple sizes embedded
- Generates `site.webmanifest` and `browserconfig.xml`
- Configurable theme color and background color
- SVG rasterization via client-side canvas
- Admin page under **Appearance → Favicon**
- Automatically disables WordPress default site icon when active

## Requirements

- WordPress 6.0+
- PHP 7.4+ with GD extension
- Node.js 22+ (for development)

## Development

```bash
# Install dependencies
npm install

# Start dev server (watch mode)
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

## Tech Stack

- **Frontend:** React (via `@wordpress/element`), TypeScript, UnoCSS
- **Build:** Webpack via `@wordpress/scripts`
- **Backend:** PHP (WordPress REST API, GD image processing)

## File Structure

```
forma-favicon/
├── forma-favicon.php      # Main plugin file (PHP backend)
├── src/
│   └── admin-favicon.tsx   # React admin UI
├── build/                  # Compiled assets (gitignored)
├── package.json
├── webpack.config.ts
├── uno.config.ts
├── postcss.config.js
└── tsconfig.json
```

## License

GPL-2.0-or-later
