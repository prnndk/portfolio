import QRCode from 'qrcode';

/** QR code for the verify link, as PNG bytes (for pdf-lib) and as an image element (for canvas). */
export async function qrPng(url: string): Promise<Uint8Array> {
    const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 240, errorCorrectionLevel: 'M' });
    const bin = atob(dataUrl.split(',')[1]);

    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function loadImage(bytes: Uint8Array, type = 'image/png'): Promise<ImageBitmap> {
    return createImageBitmap(new Blob([bytes as BlobPart], { type }));
}
