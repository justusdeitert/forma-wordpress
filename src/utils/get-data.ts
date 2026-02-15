/**
 * Read the inline window data injected by PHP.
 *
 * @package FormaFavicon
 */

import type { WindowData } from '../types';

const DEFAULT_DATA: WindowData = {
    nonce: '',
    restUrl: '',
    faviconUrl: '',
    sourceUrl: '',
    option: { source_id: 0, generated: false, theme_color: '#ffffff', bg_color: '#ffffff', padding: 0, border_radius: 0, icon_bg_color: '' },
    conflicts: [],
    siteIconId: 0,
    siteTitle: '',
    siteUrl: '',
};

export function getWindowData(): WindowData {
    return (window as any).formaFaviconAdmin ?? DEFAULT_DATA;
}
