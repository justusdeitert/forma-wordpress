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
    option: { source_id: 0, generated: false, theme_color: '#ffffff', bg_color: '#ffffff' },
    conflicts: [],
};

export function getWindowData(): WindowData {
    return (window as any).formaFaviconAdmin ?? DEFAULT_DATA;
}
