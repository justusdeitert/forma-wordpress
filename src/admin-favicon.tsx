/**
 * Forma Favicon — Admin React App
 *
 * Renders a favicon generator UI on the WP Admin "Favicon" page.
 * Upload a source image, configure colors, and generate all favicon sizes + ICO file.
 *
 * @package FormaFavicon
 */
import { render, useState, useEffect } from '@wordpress/element';
import 'uno.css';

interface FaviconOption {
    source_id: number;
    generated: boolean;
    theme_color: string;
    bg_color: string;
}

interface WindowData {
    nonce: string;
    restUrl: string;
    faviconUrl: string;
    sourceUrl: string;
    option: FaviconOption;
}

const getData = (): WindowData => (window as any).formaFaviconAdmin ?? {
    nonce: '',
    restUrl: '',
    faviconUrl: '',
    sourceUrl: '',
    option: { source_id: 0, generated: false, theme_color: '#ffffff', bg_color: '#ffffff' },
};

const rasterizeToBase64 = (imageUrl: string, size = 512): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas not supported'));
            ctx.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
    });
};

const PREVIEW_SIZES = [
    { file: 'favicon-16x16.png', label: '16×16', desc: 'Browser tab' },
    { file: 'favicon-32x32.png', label: '32×32', desc: 'Taskbar' },
    { file: 'favicon-48x48.png', label: '48×48', desc: 'Desktop shortcut' },
    { file: 'apple-touch-icon.png', label: '180×180', desc: 'Apple Touch Icon' },
    { file: 'android-chrome-192x192.png', label: '192×192', desc: 'Android Chrome' },
    { file: 'android-chrome-512x512.png', label: '512×512', desc: 'PWA Splash' },
];

const AdminFaviconApp = () => {
    const data = getData();

    const [sourceId, setSourceId] = useState<number>(data.option?.source_id || 0);
    const [sourceUrl, setSourceUrl] = useState<string>(data.sourceUrl || '');
    const [isSvg, setIsSvg] = useState<boolean>(false);
    const [generated, setGenerated] = useState<boolean>(data.option?.generated || false);
    const [themeColor, setThemeColor] = useState<string>(data.option?.theme_color || '#ffffff');
    const [bgColor, setBgColor] = useState<string>(data.option?.bg_color || '#ffffff');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [cacheBuster, setCacheBuster] = useState<number>(Date.now());
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const showNotice = (type: 'success' | 'error', message: string) => {
        setNotice({ type, message });
        setTimeout(() => setNotice(null), 4000);
    };

    const openMediaLibrary = () => {
        const frame = (wp as any).media({
            title: 'Select Favicon Source Image',
            button: { text: 'Use as Favicon' },
            multiple: false,
            library: { type: 'image' },
        });

        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON();
            const mime = attachment.mime || attachment.type || '';
            const isSvgFile = mime === 'image/svg+xml' || attachment.url?.endsWith('.svg');

            setSourceId(attachment.id);
            setSourceUrl(attachment.sizes?.medium?.url || attachment.sizes?.full?.url || attachment.url);
            setIsSvg(isSvgFile);
            setGenerated(false);
        });

        frame.open();
    };

    const handleGenerate = async () => {
        if (!sourceId) return;
        setSaving(true);
        setNotice(null);

        try {
            let bodyData: Record<string, any> = {
                theme_color: themeColor,
                bg_color: bgColor,
            };

            if (isSvg) {
                try {
                    const base64 = await rasterizeToBase64(sourceUrl, 512);
                    bodyData.source_data = base64;
                    bodyData.attachment_id = sourceId;
                } catch {
                    showNotice('error', 'Failed to process SVG in browser. Try uploading a PNG instead.');
                    setSaving(false);
                    return;
                }
            } else {
                bodyData.attachment_id = sourceId;
            }

            const res = await fetch(data.restUrl + 'generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': data.nonce,
                },
                body: JSON.stringify(bodyData),
            });

            const json = await res.json();

            if (res.ok && json.success) {
                setGenerated(true);
                setCacheBuster(Date.now());
                showNotice('success', 'Favicons generated successfully! All sizes + ICO file created.');
            } else {
                showNotice('error', json.message || 'Failed to generate favicons.');
            }
        } catch {
            showNotice('error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setNotice(null);

        try {
            const res = await fetch(data.restUrl + 'delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': data.nonce,
                },
            });

            const json = await res.json();

            if (res.ok && json.success) {
                setSourceId(0);
                setSourceUrl('');
                setGenerated(false);
                setThemeColor('#ffffff');
                setBgColor('#ffffff');
                showNotice('success', 'All favicons removed.');
            } else {
                showNotice('error', 'Failed to delete favicons.');
            }
        } catch {
            showNotice('error', 'Network error. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 m-0 mb-2">Favicon</h1>
                <p className="text-sm text-gray-500 m-0">
                    Upload a source image (at least 512×512 px) and generate all favicon sizes including ICO, Apple Touch Icon, Android Chrome icons, and web manifest.
                </p>
            </div>

            {/* Notice */}
            {notice && (
                <div className={[
                    'mb-6 px-4 py-3 rounded-lg border text-sm flex items-center gap-2',
                    notice.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700',
                ].join(' ')}>
                    <span>{notice.type === 'success' ? '✓' : '✕'}</span>
                    {notice.message}
                </div>
            )}

            {/* Source Image Section */}
            <div className="mb-8 p-6 bg-white rounded-xl border-2 border-gray-100">
                <h2 className="text-base font-medium text-gray-700 m-0 mb-4">Source Image</h2>
                <div className="flex items-start gap-6">
                    <button
                        type="button"
                        onClick={openMediaLibrary}
                        className={[
                            'relative flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 flex items-center justify-center overflow-hidden appearance-none outline-none',
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
                            onClick={openMediaLibrary}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            {sourceUrl ? 'Change Image' : 'Select Image'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Colors Section */}
            {sourceId > 0 && (
                <div className="mb-8 p-6 bg-white rounded-xl border-2 border-gray-100">
                    <h2 className="text-base font-medium text-gray-700 m-0 mb-4">Colors</h2>
                    <p className="text-xs text-gray-400 m-0 mb-5">
                        These colors are used in the web manifest and browser chrome (address bar, task switcher).
                    </p>
                    <div className="flex gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Theme Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                                <input type="text" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white w-28 font-mono" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Background Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white w-28 font-mono" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate / Actions */}
            {sourceId > 0 && (
                <div className="mb-10 flex items-center gap-3">
                    <button type="button" onClick={handleGenerate} disabled={saving}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-none cursor-pointer bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? 'Generating…' : generated ? 'Regenerate Favicons' : 'Generate Favicons'}
                    </button>
                    {generated && (
                        <button type="button" onClick={() => setShowDeleteModal(true)} disabled={deleting}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border border-red-200 bg-white text-red-600 cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            {deleting ? 'Removing…' : 'Remove All'}
                        </button>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 m-0 mb-2">Remove all favicons?</h3>
                        <p className="text-sm text-gray-500 m-0 mb-6">
                            This will delete all generated favicon files and reset the settings. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-all">
                                Cancel
                            </button>
                            <button type="button" onClick={() => { setShowDeleteModal(false); handleDelete(); }} disabled={deleting}
                                className="px-4 py-2 rounded-lg text-sm font-medium border-none bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-all disabled:opacity-50">
                                {deleting ? 'Removing…' : 'Remove All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Section */}
            {generated && (
                <>
                    <hr className="border-gray-200 mb-8" />
                    <div>
                        <h2 className="text-base font-medium text-gray-700 m-0 mb-2">Generated Files</h2>
                        <p className="text-xs text-gray-400 m-0 mb-6">
                            All sizes are generated and served from <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/wp-content/uploads/favicon/</code>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                            {PREVIEW_SIZES.map(({ file, label, desc }) => (
                                <div key={file} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                    <div className="w-12 h-12 flex items-center justify-center">
                                        <img src={`${data.faviconUrl}/${file}?v=${cacheBuster}`} alt={label} className="max-w-full max-h-full" style={{ imageRendering: 'auto' }} />
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
                                {['favicon.ico', 'site.webmanifest', 'browserconfig.xml'].map((file) => (
                                    <span key={file} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                                        {file}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const root = document.getElementById('forma-favicon-app');
if (root) {
    render(<AdminFaviconApp />, root);
}
