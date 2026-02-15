/**
 * Shared TypeScript types for the Favicon admin app.
 *
 * @package FormaFavicon
 */

export interface FaviconOption {
    source_id: number;
    generated: boolean;
    theme_color: string;
    bg_color: string;
    padding: number;
    border_radius: number;
    icon_bg_color: string;
}

export interface ConflictingPlugin {
    basename: string;
    name: string;
}

export interface WindowData {
    nonce: string;
    restUrl: string;
    faviconUrl: string;
    sourceUrl: string;
    option: FaviconOption;
    conflicts: ConflictingPlugin[];
    siteIconId: number;
    siteTitle: string;
    siteUrl: string;
}

export interface Notice {
    type: 'success' | 'error';
    message: string;
}

export interface PreviewSize {
    file: string;
    label: string;
    desc: string;
}
