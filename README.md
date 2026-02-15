# Forma Favicon

[![WordPress 6.2+](https://img.shields.io/badge/WordPress-6.2%2B-21759b?logo=wordpress&logoColor=white)](https://wordpress.org/)
[![PHP 7.4+](https://img.shields.io/badge/PHP-7.4%2B-777bb4?logo=php&logoColor=white)](https://www.php.net/)
[![License: GPL-2.0-or-later](https://img.shields.io/badge/License-GPL--2.0--or--later-blue)](https://www.gnu.org/licenses/gpl-2.0.html)

WordPress plugin for generating and managing favicons. Upload a source image, configure colors, and generate all required favicon sizes including ICO, Apple Touch Icon, Android Chrome icons, and web manifest.

## Features

- Upload any image (PNG, JPEG, GIF, WebP) or SVG as favicon source
- Generates all standard sizes: 16×16, 32×32, 48×48, 180×180, 192×192, 512×512
- Creates `favicon.ico` with multiple sizes embedded
- Generates `site.webmanifest` and `browserconfig.xml`
- Configurable theme color and background color
- Icon styling: adjustable padding, border radius, and icon background color
- Live browser-tab preview with light/dark mode toggle
- Client-side canvas preview updates in real time as you adjust settings
- SVG rasterization via client-side canvas
- Admin page under **Appearance → Favicon**
- Detects and resolves conflicts with other favicon plugins
- Automatically disables WordPress default site icon when active

## Requirements

- WordPress 6.2+
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
├── forma-favicon.php          # Main plugin file
├── inc/
│   ├── admin.php              # Admin page & asset enqueuing
│   ├── conflicts.php          # Plugin conflict detection
│   ├── frontend.php           # Front-end head output
│   ├── helpers.php            # Shared utilities
│   ├── ico-generator.php      # ICO file creation
│   ├── migration.php          # Settings migration
│   ├── rest-api.php           # REST endpoints & GD image processing
│   └── settings.php           # Option schema & sanitization
├── src/
│   ├── admin-favicon.tsx      # Entry point
│   ├── browser-preview.scss   # Browser preview theming
│   ├── constants.ts           # Shared constants
│   ├── types.ts               # TypeScript types
│   ├── components/
│   │   ├── AdminFaviconApp.tsx # Root component
│   │   ├── BrowserTabPreview.tsx
│   │   ├── IconOptions.tsx     # Padding / radius / bg controls
│   │   ├── ColorPickers.tsx
│   │   ├── Preview.tsx
│   │   └── ...                # Actions, Notices, Modals
│   ├── hooks/
│   │   ├── use-favicon.ts     # Main state & API hook
│   │   └── use-favicon-preview.ts  # Canvas live preview
│   └── utils/
│       ├── get-data.ts        # Window data accessor
│       └── rasterize.ts       # SVG → raster conversion
├── build/                     # Compiled assets (gitignored)
├── package.json
├── webpack.config.ts
├── uno.config.ts
├── postcss.config.js
└── tsconfig.json
```

## License

GPL-2.0-or-later
