export interface SignatureImage {
    png: Uint8Array;
    /** Picture height divided by width. */
    aspect: number;
    url: string;
}

async function toSignature(canvas: HTMLCanvasElement): Promise<SignatureImage> {
    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Export failed'))), 'image/png'));

    return { png: new Uint8Array(await blob.arrayBuffer()), aspect: canvas.height / canvas.width, url: URL.createObjectURL(blob) };
}

/** Crops transparent margins so the signature sits where the user drops it, not where its empty border ends. */
function trim(src: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = src.getContext('2d', { willReadFrequently: true })!;
    const { data, width, height } = ctx.getImageData(0, 0, src.width, src.height);
    let [x0, y0, x1, y1] = [width, height, -1, -1];
    for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++)
            if (data[(y * width + x) * 4 + 3] > 8) {
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
            }
    if (x1 < 0) throw new Error('The image has no visible signature.');
    const pad = 4;
    const out = document.createElement('canvas');
    out.width = x1 - x0 + 1 + pad * 2;
    out.height = y1 - y0 + 1 + pad * 2;
    out.getContext('2d')!.drawImage(src, x0, y0, x1 - x0 + 1, y1 - y0 + 1, pad, pad, x1 - x0 + 1, y1 - y0 + 1);

    return out;
}

/** A signature picture. `removeBackground` turns white/light paper transparent so only the ink stays (for photos and scans). */
export async function signatureFromFile(file: File, removeBackground: boolean): Promise<SignatureImage> {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / bmp.width);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(bmp, 0, 0, c.width, c.height);

    if (removeBackground) {
        const img = ctx.getImageData(0, 0, c.width, c.height);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
            const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            // paper (light) fades out, ink (dark) stays; the ramp keeps pen edges soft
            const ink = Math.max(0, Math.min(1, (225 - lum) / 90));
            d[i + 3] = Math.round(d[i + 3] * ink);
        }
        ctx.putImageData(img, 0, 0);
    }

    return toSignature(trim(c));
}

/** Pen strokes from the drawing pad, as a signature picture. */
export const signatureFromCanvas = (pad: HTMLCanvasElement) => toSignature(trim(pad));
