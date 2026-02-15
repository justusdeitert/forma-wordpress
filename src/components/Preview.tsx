/**
 * Preview grid of generated favicon sizes + additional files list.
 *
 * @package FormaFavicon
 */

import { PREVIEW_SIZES, ADDITIONAL_FILES } from '../constants';

interface Props {
    faviconUrl: string;
    cacheBuster: number;
}

export const Preview = ({ faviconUrl, cacheBuster }: Props) => (
    <>
        <hr className="border-gray-200 mb-8" />
        <div>
            <h2 className="text-base font-medium text-gray-700 m-0 mb-2">Generated Files</h2>
            <p className="text-xs text-gray-400 m-0 mb-6">
                All sizes are generated and served from{' '}
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/wp-content/uploads/favicon/</code>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {PREVIEW_SIZES.map(({ file, label, desc }) => (
                    <div
                        key={file}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img
                                src={`${faviconUrl}/${file}?v=${cacheBuster}`}
                                alt={label}
                                className="max-w-full max-h-full"
                                style={{ imageRendering: 'auto' }}
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-medium text-gray-700">{label}</div>
                            <div className="text-[10px] text-gray-400">{desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-600 m-0 mb-3">Additional Files</h3>
                <div className="flex flex-wrap gap-2">
                    {ADDITIONAL_FILES.map((file) => (
                        <span
                            key={file}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            {file}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </>
);
