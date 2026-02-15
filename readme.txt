=== Forma Favicon ===
Contributors: justusdeitert
Tags: favicon, icon, generator, browser icon, site icon
Requires at least: 6.2
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Favicon generator — upload a source, customize styling, and generate all required favicon sizes including ICO, Apple Touch, and Android Chrome.

== Description ==

Forma Favicon is a modern favicon generator built into your WordPress admin. Upload any image — PNG, JPEG, GIF, WebP, or SVG — and the plugin generates every favicon format and size your site needs, all from a single source.

**What it generates:**

* `favicon.ico` with 16×16, 32×32, and 48×48 embedded
* Apple Touch Icon (180×180)
* Android Chrome icons (192×192 and 512×512)
* `site.webmanifest` for PWA support
* `browserconfig.xml` for Windows tiles

**Icon styling controls:**

* Adjustable padding (0–40%) to give your icon breathing room
* Border radius (0–50%) for rounded or circular icons
* Custom icon background color behind transparent images
* Configurable theme color and background color for manifests

**Live preview:**

* Browser-tab mockup shows exactly how your favicon will look
* Light and dark mode toggle to preview against both backgrounds
* Changes update in real time via client-side canvas rendering
* "Unsaved" indicator when settings differ from the generated output

**Smart features:**

* Detects and resolves conflicts with other favicon plugins
* Automatically overrides the WordPress default Site Icon
* SVG source images are rasterized client-side before upload
* Clean admin page under **Appearance → Favicon**

== Installation ==

1. Upload the `forma-favicon` folder to `/wp-content/plugins/`
2. Activate the plugin through the **Plugins** menu
3. Go to **Appearance → Favicon**
4. Upload a source image and click **Generate Favicons**

= Requirements =

* WordPress 6.2 or higher
* PHP 7.4 or higher with the GD extension enabled

== Frequently Asked Questions ==

= What image formats can I use as a source? =

PNG, JPEG, GIF, WebP, and SVG. SVG files are converted to raster images client-side before processing.

= What favicon sizes are generated? =

16×16, 32×32, 48×48 (bundled into favicon.ico), 180×180 (Apple Touch Icon), 192×192 and 512×512 (Android Chrome / PWA).

= Does this replace the WordPress Site Icon? =

Yes. When Forma Favicon is active and favicons have been generated, it automatically overrides the default WordPress Site Icon output to avoid duplicates.

= What happens if I have another favicon plugin installed? =

Forma Favicon detects known conflicting plugins (like Favicon by RealFaviconGenerator) and gives you the option to deactivate or delete them from the settings page.

= Can I use a transparent PNG? =

Absolutely. You can set a background color behind transparent images using the icon background color option, or leave it transparent.

= Where are the generated files stored? =

All files are saved to `wp-content/uploads/favicon/`.

= Will deactivating the plugin remove my favicons? =

No. Generated files remain in the uploads directory. You can delete them from the plugin settings before deactivating if you want a clean removal.

== Screenshots ==

1. Admin page with source image upload and color pickers
2. Browser tab preview in light mode
3. Browser tab preview in dark mode
4. Icon styling controls — padding, border radius, and background color

== Changelog ==

= 1.0.0 =
* Initial release
* Upload PNG, JPEG, GIF, WebP, or SVG as favicon source
* Generate all standard sizes: 16×16, 32×32, 48×48, 180×180, 192×192, 512×512
* Create favicon.ico with multiple sizes embedded
* Generate site.webmanifest and browserconfig.xml
* Configurable theme color and background color
* Icon styling: padding, border radius, and icon background color
* Live browser-tab preview with light/dark mode toggle
* Real-time client-side canvas preview
* Unsaved changes indicator
* Conflict detection for other favicon plugins
* Automatic WordPress Site Icon override

== Upgrade Notice ==

= 1.0.0 =
Initial release.
