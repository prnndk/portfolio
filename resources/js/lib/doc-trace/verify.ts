import { extractImageData } from './dct-watermark';
import { phashFromCanvas, sha256Hex } from './hash';
import { readTraceMeta } from './image-meta';
import { openPdf, pageText, renderPage } from './pdf-render';
import { TRACE_MARK } from './pdf-watermark';

export interface Extracted {
    sha256: string;
    kind: 'pdf' | 'image';
    code: string | null;
    pageCodes: string[];
    phashes: string[];
    /** Which hidden or visible layers were found, for display. */
    layers: string[];
}

const MAX_PAGES = 300;
const HIDDEN = new RegExp(`${TRACE_MARK}:([A-Z2-7]{10}):([A-Z2-7]{8})`, 'g');
const VISIBLE = /\b([A-Z2-7]{10})-([A-Z2-7]{8})\b/g;

export const isPdf = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);

/** Reads every trace layer out of a file in the browser. Only the hashes and codes found here are sent to the server. */
export async function extractFromFile(file: File, onProgress?: (done: number, total: number) => void): Promise<Extracted> {
    const buf = await file.arrayBuffer();
    const sha256 = await sha256Hex(buf);
    return isPdf(file) ? extractPdf(buf, sha256, onProgress) : extractImage(buf, file.type, sha256);
}

async function extractPdf(buf: ArrayBuffer, sha256: string, onProgress?: (d: number, t: number) => void): Promise<Extracted> {
    const doc = await openPdf(buf);
    const total = Math.min(doc.numPages, MAX_PAGES);
    const layers: string[] = [];
    const pageCodes = new Set<string>();
    let code: string | null = null;

    const meta = await doc.getMetadata().catch(() => null);
    // pdf.js hands custom Info keys back as a Map (older versions used a plain object)
    const custom = (meta?.info as { Custom?: Map<string, unknown> | Record<string, unknown> } | undefined)?.Custom;
    const metaCode = custom instanceof Map ? custom.get('GadingTrace') : custom?.GadingTrace;
    if (typeof metaCode === 'string' && /^[A-Z2-7]{10}$/.test(metaCode)) {
        code = metaCode;
        layers.push('PDF metadata');
    }

    const phashes: string[] = [];
    let hiddenText = false;
    let visibleText = false;
    for (let n = 1; n <= total; n++) {
        const text = await pageText(doc, n);
        for (const m of text.matchAll(HIDDEN)) {
            code ??= m[1];
            pageCodes.add(m[2]);
            hiddenText = true;
        }
        for (const m of text.matchAll(VISIBLE)) {
            code ??= m[1];
            pageCodes.add(m[2]);
            visibleText = true;
        }
        phashes.push(phashFromCanvas(await renderPage(doc, n, 0.3)));
        onProgress?.(n, total);
    }
    if (hiddenText) layers.push('Invisible text layer');
    if (visibleText) layers.push('Visible page ID');

    return { sha256, kind: 'pdf', code, pageCodes: [...pageCodes], phashes, layers };
}

async function extractImage(buf: ArrayBuffer, type: string, sha256: string): Promise<Extracted> {
    const layers: string[] = [];
    let code = readTraceMeta(new Uint8Array(buf));
    if (code) layers.push('File metadata');

    const bmp = await createImageBitmap(new Blob([buf], { type }));
    const phash = phashFromCanvas(bmp);
    // the pixel watermark needs the original pixel grid, so decode at full size
    if (bmp.width * bmp.height <= 24_000_000) {
        const c = document.createElement('canvas');
        c.width = bmp.width;
        c.height = bmp.height;
        const ctx = c.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(bmp, 0, 0);
        const dct = extractImageData(ctx.getImageData(0, 0, c.width, c.height));
        if (dct) {
            layers.push('Invisible pixel watermark');
            code ??= dct;
        }
    }

    return { sha256, kind: 'image', code, pageCodes: [], phashes: [phash], layers };
}
