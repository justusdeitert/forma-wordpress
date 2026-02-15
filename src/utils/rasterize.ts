/**
 * Rasterize an image URL (typically SVG) to a base64 PNG via canvas.
 *
 * @package FormaFavicon
 */

export function rasterizeToBase64(imageUrl: string, size = 512): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Canvas not supported'));
            }

            ctx.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
    });
}
