import { embedImageData } from './dct-watermark';
import { loadCanvasFont } from './fonts';
import { writeTraceMeta } from './image-meta';
import { type PlacedImage, paintOverlay } from './overlay-canvas';
import type { SignaturePlacement, TraceInfo } from './pdf-watermark';
import { loadImage } from './qr';
import { type ProtectSettings, styleForPage } from './template';

export interface ImageBuild {
    bitmap: ImageBitmap;
    settings: ProtectSettings;
    format: 'jpeg' | 'png';
    trace?: Omit<TraceInfo, 'pageCodes'> & { pageCode: string };
    signatures?: SignaturePlacement[];
    customFont?: Uint8Array;
    qr?: ImageBitmap | null;
}

const MAX_SIDE = 8000;

/** Draws the watermark, footer, QR and signatures into the picture's pixels, then hides the code in brightness and metadata. */
export async function buildProtectedImage(o: ImageBuild): Promise<Uint8Array> {
    const k = Math.min(1, MAX_SIDE / Math.max(o.bitmap.width, o.bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(o.bitmap.width * k);
    canvas.height = Math.round(o.bitmap.height * k);
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(o.bitmap, 0, 0, canvas.width, canvas.height);

    const visible = !o.trace || o.settings.mode !== 'hidden';
    const hidden = !!o.trace && o.settings.mode !== 'visible';
    const style = styleForPage(o.settings, 1, 1);
    const now = new Date();

    const signatures: PlacedImage[] = [];
    for (const s of o.signatures ?? []) signatures.push({ source: await loadImage(s.png), x: s.x, y: s.y, w: s.w, aspect: s.aspect });

    paintOverlay({
        ctx,
        pageW: canvas.width,
        pageH: canvas.height,
        scale: 1,
        sizeScale: canvas.width / 595,
        settings: o.settings,
        text: {
            recipient: o.trace?.recipient ?? '',
            issuer: o.trace?.issuer ?? '',
            date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            year: String(now.getFullYear()),
            page: 1,
            pages: 1,
            code: o.trace?.code ?? '',
            pageCode: o.trace?.pageCode ?? '',
        },
        font: { watermark: await loadCanvasFont(style.font, o.customFont), footer: await loadCanvasFont(o.settings.footer.font, o.customFont) },
        visible,
        qr: o.qr,
        signatures,
    });

    if (hidden && o.trace) {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        embedImageData(data, o.trace.code);
        ctx.putImageData(data, 0, 0);
    }

    const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not export the picture.'))), `image/${o.format}`, 0.92),
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());

    return hidden && o.trace ? writeTraceMeta(bytes, o.trace.code) : bytes;
}
