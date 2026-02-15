/**
 * Warning banner when WordPress has a Site Icon set alongside Forma Favicon.
 *
 * @package FormaFavicon
 */

import { useState } from '@wordpress/element';
import { getWindowData } from '../utils/get-data';

export const SiteIconNotice = () => {
    const data = getWindowData();
    const [visible, setVisible] = useState(data.siteIconId > 0);
    const [clearing, setClearing] = useState(false);

    if (!visible) return null;

    const handleClear = async () => {
        setClearing(true);

        try {
            const res = await fetch(data.restUrl + 'clear-site-icon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': data.nonce },
            });
            const json = await res.json();

            if (res.ok && json.success) {
                setVisible(false);
            }
        } catch {
            // Silently fail — user can retry
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="mb-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
                <span className="text-amber-500 text-xl leading-none mt-0.5">⚠</span>
                <div className="flex-1">
                    <h2 className="text-sm font-semibold text-amber-800 m-0 mb-1">
                        WordPress Site Icon is also set
                    </h2>
                    <p className="text-xs text-amber-600 m-0 mb-4">
                        A Site Icon is configured in WordPress Settings → General. While Forma Favicon overrides it,
                        we recommend removing it to avoid confusion.
                    </p>
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={clearing}
                        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 border-none cursor-pointer hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {clearing ? 'Removing…' : 'Remove WordPress Site Icon'}
                    </button>
                </div>
            </div>
        </div>
    );
};
