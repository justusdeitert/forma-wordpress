/**
 * Custom hook encapsulating all favicon admin state and API interactions.
 *
 * @package FormaFavicon
 */

import { useState, useCallback, useRef } from '@wordpress/element';
import type { Notice } from '../types';
import { getWindowData } from '../utils/get-data';
import { rasterizeToBase64 } from '../utils/rasterize';

export function useFavicon() {
    const data = getWindowData();

    const [sourceId, setSourceId] = useState(data.option?.source_id || 0);
    const [sourceUrl, setSourceUrl] = useState(data.sourceUrl || '');
    const [isSvg, setIsSvg] = useState(false);
    const [generated, setGenerated] = useState(data.option?.generated || false);
    const [themeColor, setThemeColor] = useState(data.option?.theme_color || '#ffffff');
    const [bgColor, setBgColor] = useState(data.option?.bg_color || '#ffffff');
    const [padding, setPadding] = useState(data.option?.padding || 0);
    const [borderRadius, setBorderRadius] = useState(data.option?.border_radius || 0);
    const [iconBgColor, setIconBgColor] = useState(data.option?.icon_bg_color || '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [cacheBuster, setCacheBuster] = useState(Date.now());

    // Track the last-generated settings to detect unsaved changes.
    const savedState = useRef({
        padding: data.option?.padding || 0,
        borderRadius: data.option?.border_radius || 0,
        iconBgColor: data.option?.icon_bg_color || '',
        themeColor: data.option?.theme_color || '#ffffff',
        bgColor: data.option?.bg_color || '#ffffff',
    });

    const hasUnsavedChanges = generated && (
        padding !== savedState.current.padding ||
        borderRadius !== savedState.current.borderRadius ||
        iconBgColor !== savedState.current.iconBgColor ||
        themeColor !== savedState.current.themeColor ||
        bgColor !== savedState.current.bgColor
    );

    const showNotice = useCallback((type: Notice['type'], message: string) => {
        setNotice({ type, message });
        setTimeout(() => setNotice(null), 4000);
    }, []);

    const selectImage = useCallback((attachment: any) => {
        const mime = attachment.mime || attachment.type || '';
        const isSvgFile = mime === 'image/svg+xml' || attachment.url?.endsWith('.svg');

        setSourceId(attachment.id);
        setSourceUrl(attachment.sizes?.medium?.url || attachment.sizes?.full?.url || attachment.url);
        setIsSvg(isSvgFile);
        setGenerated(false);
    }, []);

    const openMediaLibrary = useCallback(() => {
        const frame = (wp as any).media({
            title: 'Select Favicon Source Image',
            button: { text: 'Use as Favicon' },
            multiple: false,
            library: { type: 'image' },
        });

        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON();
            selectImage(attachment);
        });

        frame.open();
    }, [selectImage]);

    const generate = useCallback(async () => {
        if (!sourceId) return;
        setSaving(true);
        setNotice(null);

        try {
            const bodyData: Record<string, any> = {
                theme_color: themeColor,
                bg_color: bgColor,
                padding,
                border_radius: borderRadius,
                icon_bg_color: iconBgColor,
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
                savedState.current = { padding, borderRadius, iconBgColor, themeColor, bgColor };
                showNotice('success', 'Favicons generated successfully! All sizes + ICO file created.');
            } else {
                showNotice('error', json.message || 'Failed to generate favicons.');
            }
        } catch {
            showNotice('error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [sourceId, sourceUrl, isSvg, themeColor, bgColor, padding, borderRadius, iconBgColor, data.restUrl, data.nonce, showNotice]);

    const deleteFavicons = useCallback(async () => {
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
                setPadding(0);
                setBorderRadius(0);
                setIconBgColor('');
                showNotice('success', 'All favicons removed.');
            } else {
                showNotice('error', 'Failed to delete favicons.');
            }
        } catch {
            showNotice('error', 'Network error. Please try again.');
        } finally {
            setDeleting(false);
        }
    }, [data.restUrl, data.nonce, showNotice]);

    return {
        // State
        sourceId,
        sourceUrl,
        generated,
        themeColor,
        bgColor,
        padding,
        borderRadius,
        iconBgColor,
        saving,
        deleting,
        notice,
        cacheBuster,
        faviconUrl: data.faviconUrl,
        hasUnsavedChanges,

        // Setters
        setThemeColor,
        setBgColor,
        setPadding,
        setBorderRadius,
        setIconBgColor,

        // Actions
        openMediaLibrary,
        generate,
        deleteFavicons,
    };
}
