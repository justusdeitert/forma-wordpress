/**
 * Source image upload section.
 *
 * @package FormaFavicon
 */

interface Props {
    sourceUrl: string;
    onSelect: () => void;
}

export const SourceImage = ({ sourceUrl, onSelect }: Props) => (
    <div className="mb-8 p-6 bg-white rounded-xl border-2 border-gray-100">
        <h2 className="text-base font-medium text-gray-700 m-0 mb-4">Source Image</h2>
        <div className="flex items-start gap-6">
            <button
                type="button"
                onClick={onSelect}
                className={[
                    'relative flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed cursor-pointer',
                    'transition-all duration-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300',
                    'flex items-center justify-center overflow-hidden appearance-none outline-none',
                    sourceUrl ? 'border-gray-200' : 'border-gray-300',
                ].join(' ')}
            >
                {sourceUrl ? (
                    <img src={sourceUrl} alt="Favicon source" className="w-full h-full object-contain" />
                ) : (
                    <div className="text-center">
                        <div className="text-3xl text-gray-300 mb-1">+</div>
                        <div className="text-xs text-gray-400">Upload Image</div>
                    </div>
                )}
            </button>
            <div className="flex-1">
                <p className="text-sm text-gray-600 m-0 mb-3">
                    {sourceUrl
                        ? 'Image selected. Configure colors below and click "Generate Favicons".'
                        : 'Click the box or the button below to select an image from the Media Library.'}
                </p>
                <p className="text-xs text-gray-400 m-0 mb-4">
                    Recommended: Square PNG or SVG, at least 512×512 pixels. The image will be resized to all required favicon sizes.
                </p>
                <button
                    type="button"
                    onClick={onSelect}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                    {sourceUrl ? 'Change Image' : 'Select Image'}
                </button>
            </div>
        </div>
    </div>
);
