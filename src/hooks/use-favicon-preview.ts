/**
 * Generate a live client-side favicon preview via canvas.
 *
 * Returns a data URL that updates whenever the source image
 * or styling options (padding, border radius, bg color) change.
 *
 * @package FormaFavicon
 */

import { useState, useEffect } from '@wordpress/element';

interface PreviewOptions {
    sourceUrl: string;
    padding: number;
    borderRadius: number;
    iconBgColor: string;
    size?: number;
}

/**
 * Draw a rounded-rectangle clipping path on a canvas context.
 */
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

export function useFaviconPreview({ sourceUrl, padding, borderRadius, iconBgColor, size = 128 }: PreviewOptions): string {
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (!sourceUrl) {
            setPreviewUrl('');
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear
            ctx.clearRect(0, 0, size, size);

            // Apply border radius clipping to entire canvas
            const radiusPx = Math.round(size * borderRadius / 100);
            if (radiusPx > 0) {
                roundedRect(ctx, 0, 0, size, size, radiusPx);
                ctx.clip();
            }

            // Fill background color
            if (iconBgColor) {
                ctx.fillStyle = iconBgColor;
                ctx.fillRect(0, 0, size, size);
            }

            // Calculate padding
            const padPx = Math.round(size * padding / 100);
            const iconSize = size - padPx * 2;

            if (iconSize > 0) {
                ctx.drawImage(img, padPx, padPx, iconSize, iconSize);
            }

            setPreviewUrl(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            setPreviewUrl('');
        };

        img.src = sourceUrl;
    }, [sourceUrl, padding, borderRadius, iconBgColor, size]);

    return previewUrl;
}
