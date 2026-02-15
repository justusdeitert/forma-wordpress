/**
 * Google Search result preview.
 *
 * Shows the favicon at 16×16 alongside the site URL and a mock
 * search-result snippet, matching Google's current SERP layout.
 *
 * @package FormaFavicon
 */

import { getWindowData } from '../utils/get-data';

interface Props {
    faviconUrl: string;
    cacheBuster: number;
    /** Client-side canvas preview data URL (overrides server files when set). */
    livePreviewUrl?: string;
    /** Whether dark mode is active. */
    dark?: boolean;
}

export const GoogleSearchPreview = ({ faviconUrl, cacheBuster, livePreviewUrl, dark = false }: Props) => {
    const { siteTitle, siteUrl } = getWindowData();

    const favicon32 = livePreviewUrl || `${faviconUrl}/favicon-32x32.png?v=${cacheBuster}`;
    const displayTitle = siteTitle || 'My Website';

    /** Strip protocol and trailing slash for the breadcrumb display. */
    const displayUrl = siteUrl
        ? siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
        : 'example.com';

    return (
        <div className="mb-8">
            <h2 className="text-base font-medium text-gray-700 m-0 mb-1">Google Search</h2>
            <p className="text-xs text-gray-400 m-0 mb-4">
                How your favicon appears in Google search results.
            </p>

            {/* Google SERP card */}
            <div className={`forma-favicon-google-preview rounded-lg border border-solid p-5 max-w-[600px] transition-colors ${
                dark
                    ? 'bg-[#202124] border-[#3c4043]'
                    : 'bg-white border-gray-200'
            }`}>
                {/* Site row: favicon + url + dots menu */}
                <div className="flex items-center gap-3 mb-1">
                    <div className={`w-[28px] h-[28px] rounded-full overflow-hidden flex items-center justify-center shrink-0 ${
                        dark
                            ? 'bg-white'
                            : 'bg-[#f3f5f6]'
                    }`}>
                        <img
                            src={favicon32}
                            alt="Search result favicon"
                            className="w-full h-full block object-cover"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className={`text-sm leading-tight truncate ${
                            dark ? 'text-[#bdc1c6]' : 'text-[#202124]'
                        }`}>
                            {displayUrl}
                        </span>
                        <span className={`text-xs leading-tight truncate ${
                            dark ? 'text-[#969ba1]' : 'text-[#4d5156]'
                        }`}>
                            {siteUrl ? siteUrl.replace(/\/$/, '') : 'https://example.com'}
                        </span>
                    </div>
                    {/* Three-dot menu icon */}
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 ml-auto shrink-0"
                        style={{ fill: dark ? '#9aa0a6' : '#70757a' }}
                    >
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                </div>

                {/* Title */}
                <h3
                    className="m-0 mb-1 text-xl font-normal leading-snug cursor-pointer"
                    style={{ color: dark ? '#8ab4f8' : '#1a0dab' }}
                >
                    {displayTitle}
                </h3>

                {/* Meta description snippet */}
                <p
                    className="m-0 text-sm leading-relaxed"
                    style={{ color: dark ? '#bdc1c6' : '#4d5156' }}
                >
                    This is how your site appears in search results. The favicon is displayed at 16×16 pixels next to your URL.
                </p>
            </div>
        </div>
    );
};
