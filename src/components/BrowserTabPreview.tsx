/**
 * Browser-tab preview inspired by WordPress's built-in Site Icon preview.
 *
 * Shows the generated favicon inside a realistic browser tab mockup
 * alongside a rounded app-icon preview.
 *
 * Uses UnoCSS utilities wherever possible — only CSS-variable-dependent
 * styles (gradients, shadows, dark-mode overrides) remain in the SCSS.
 *
 * @package FormaFavicon
 */

import { useState } from '@wordpress/element';
import { getWindowData } from '../utils/get-data';

interface Props {
    faviconUrl: string;
    cacheBuster: number;
}

export const BrowserTabPreview = ({ faviconUrl, cacheBuster }: Props) => {
    const { siteTitle } = getWindowData();
    const [dark, setDark] = useState(false);

    const favicon32 = `${faviconUrl}/favicon-32x32.png?v=${cacheBuster}`;
    const appleTouchIcon = `${faviconUrl}/apple-touch-icon.png?v=${cacheBuster}`;

    return (
        <div className="mb-8">
            <h2 className="text-base font-medium text-gray-700 m-0 mb-2">Preview</h2>
            <p className="text-xs text-gray-400 m-0 mb-4">
                How your favicon looks in a browser tab and as an app icon.
            </p>

            {/* Light / Dark toggle */}
            <div className="inline-flex items-center gap-1 p-0.5 mb-4 rounded-lg bg-gray-100 text-xs font-medium">
                <button
                    type="button"
                    onClick={() => setDark(false)}
                    className={`px-3 py-1.5 rounded-md border-none cursor-pointer transition-colors ${
                        !dark
                            ? 'bg-white text-gray-800 shadow-sm'
                            : 'bg-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    ☀ Light
                </button>
                <button
                    type="button"
                    onClick={() => setDark(true)}
                    className={`px-3 py-1.5 rounded-md border-none cursor-pointer transition-colors ${
                        dark
                            ? 'bg-gray-800 text-white shadow-sm'
                            : 'bg-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    ☾ Dark
                </button>
            </div>

            <div className="flex flex-wrap gap-6">
                {/* Browser window mockup */}
                <div className={`forma-favicon-browser-preview relative grid gap-4 w-[350px] h-[88px] pt-4 pl-4 overflow-hidden box-border border border-solid rounded-md${dark ? ' is-dark' : ''}`} style={{ gridTemplateColumns: '58px 1fr' }}>
                    {/* Blurred background */}
                    <div
                        className="forma-favicon-browser-preview__bg absolute inset-0 w-[150%] aspect-square opacity-50 bg-cover bg-center pointer-events-none"
                        style={{ backgroundImage: `url(${appleTouchIcon})` }}
                    />

                    {/* App icon */}
                    <img
                        src={appleTouchIcon}
                        alt="App icon preview"
                        className="forma-favicon-browser-preview__app-icon relative z-1 w-[58px] h-[58px] rounded-xl object-cover"
                    />

                    {/* Browser chrome */}
                    <div className="forma-favicon-browser-preview__chrome relative z-1 flex pt-1 pr-1 pl-3 items-start gap-4 flex-1 rounded-tl-[10px] border-t border-l border-b-0 border-r-0 border-solid">
                        {/* Traffic lights */}
                        <svg
                            aria-hidden="true"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 54 40"
                            className="forma-favicon-browser-preview__dots w-12 h-10 shrink-0"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M0 20a6 6 0 1 1 12 0 6 6 0 0 1-12 0Zm18 0a6 6 0 1 1 12 0 6 6 0 0 1-12 0Zm24-6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"
                            />
                        </svg>

                        {/* Tab */}
                        <div className="forma-favicon-browser-preview__tab grid gap-2 p-2 flex-1 items-center rounded" style={{ gridTemplateColumns: '24px auto 24px' }}>
                            <img
                                src={favicon32}
                                alt="Browser tab favicon"
                                className="forma-favicon-browser-preview__tab-icon w-6 h-6"
                            />
                            <span className="forma-favicon-browser-preview__tab-title font-medium text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">
                                {siteTitle || 'My Website'}
                            </span>
                            <svg
                                aria-hidden="true"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="forma-favicon-browser-preview__tab-close w-6 h-6"
                            >
                                <path d="M12 13.0607L15.7123 16.773L16.773 15.7123L13.0607 12L16.773 8.28772L15.7123 7.22706L12 10.9394L8.28771 7.22705L7.22705 8.28771L10.9394 12L7.22706 15.7123L8.28772 16.773L12 13.0607Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
