import { PDFDict, PDFDocument, type PDFFont, PDFName, type PDFPage, PDFString, degrees, rgb } from 'pdf-lib';
import { embedImageData } from './dct-watermark';
import { canEncode, embedFont, loadCanvasFont } from './fonts';
import { type PlacedImage, paintOverlay } from './overlay-canvas';
import { openPdf, renderPage } from './pdf-render';
import { loadImage, qrPng } from './qr';
import { type ProtectSettings, type TextContext, fillFooter, fillLines, layoutMarks, resolveSize, styleForPage } from './template';

export interface TraceInfo {
    recipient: string;
    issuer: string;
    code: string;
    /** One per page, in order. */
    pageCodes: string[];
    verifyUrl: string;
}

export interface SignaturePlacement {
    id: string;
    png: Uint8Array;
    pages: 'all' | number[];
    /** Left / top / width as fractions of the visible page. */
    x: number;
    y: number;
    w: number;
    /** Picture height divided by width. */
    aspect: number;
}

export interface BuildOptions {
    file: File;
    settings: ProtectSettings;
    /** Present when the document is registered: enables the page codes, QR and hidden layers. */
    trace?: TraceInfo;
    signatures?: SignaturePlacement[];
    customFont?: Uint8Array;
    onProgress?: (done: number, total: number) => void;
}

export const TRACE_MARK = 'GADING-TRACE';

const hex = (c: string) => {
    const n = parseInt(c.replace('#', ''), 16);

    return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/** Maps the visible, upright page (origin bottom-left) onto the page's real user space, whatever its rotation and crop box. */
function geometry(page: PDFPage) {
    const { x: x0, y: y0, width: w, height: h } = page.getCropBox();
    const R = (((page.getRotation().angle % 360) + 360) % 360) as 0 | 90 | 180 | 270;
    const swap = R === 90 || R === 270;
    const map = (vx: number, vy: number): [number, number] => {
        switch (R) {
            case 90:
                return [x0 + (w - vy), y0 + vx];
            case 180:
                return [x0 + w - vx, y0 + h - vy];
            case 270:
                return [x0 + vy, y0 + h - vx];
            default:
                return [x0 + vx, y0 + vy];
        }
    };

    return { VW: swap ? h : w, VH: swap ? w : h, R, map };
}

type Geo = ReturnType<typeof geometry>;

const printable = (font: PDFFont, text: string) => (canEncode(font, text) ? text : [...text].map((c) => (canEncode(font, c) ? c : '?')).join(''));

function textContext(o: BuildOptions, page: number, pages: number): TextContext {
    const now = new Date();

    return {
        recipient: o.trace?.recipient ?? '',
        issuer: o.trace?.issuer ?? '',
        date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        year: String(now.getFullYear()),
        page,
        pages,
        code: o.trace?.code ?? '',
        pageCode: o.trace?.pageCodes[page - 1] ?? '',
    };
}

/** Draws the watermark, footer, QR and signatures as real PDF content on one page. */
async function drawVisible(
    doc: PDFDocument,
    page: PDFPage,
    g: Geo,
    o: BuildOptions,
    n: number,
    total: number,
    qr: Awaited<ReturnType<PDFDocument['embedPng']>> | null,
) {
    const ctx = textContext(o, n, total);
    const { settings } = o;
    const style = styleForPage(settings, n, total);

    if (style.enabled && fillLines(style.text, ctx).length) {
        const font = await embedFont(doc, style.font, o.customFont);
        const lines = fillLines(style.text, ctx).map((l) => printable(font, l));
        const size = resolveSize(style, g.VW, Math.max(...lines.map((l) => font.widthOfTextAtSize(l, 1))));
        const lh = size * 1.2;
        const th = lh * lines.length;
        const tw = Math.max(...lines.map((l) => font.widthOfTextAtSize(l, size)));
        const rad = (style.angle * Math.PI) / 180;

        for (const m of layoutMarks(g.VW, g.VH, tw, th, style)) {
            lines.forEach((line, i) => {
                const ty = -(i - (lines.length - 1) / 2) * lh - size * 0.32;
                const tx = -font.widthOfTextAtSize(line, size) / 2;
                const [x, y] = g.map(m.x + tx * Math.cos(rad) - ty * Math.sin(rad), m.y + tx * Math.sin(rad) + ty * Math.cos(rad));
                page.drawText(line, { x, y, size, font, color: hex(style.color), opacity: style.opacity, rotate: degrees(style.angle + g.R) });
            });
        }
    }

    if (qr && settings.qr) {
        const q = 40;
        const [bx, by] = g.map(g.VW - q - 12, 4);
        page.drawRectangle({ x: bx, y: by, width: q + 4, height: q + 4, color: rgb(1, 1, 1), rotate: degrees(g.R) });
        const [x, y] = g.map(g.VW - q - 10, 6);
        page.drawImage(qr, { x, y, width: q, height: q, rotate: degrees(g.R) });
    }

    const f = settings.footer;
    if (f.enabled && fillFooter(f.text, ctx)) {
        const font = await embedFont(doc, f.font, o.customFont);
        const text = printable(font, fillFooter(f.text, ctx));
        const room = g.VW - 28 - (qr && settings.qr ? 48 : 0);
        let size = f.size;
        while (font.widthOfTextAtSize(text, size) > room && size > 3) size -= 0.25;
        const w = font.widthOfTextAtSize(text, size);
        const vx = f.align === 'left' ? 14 : f.align === 'right' ? 14 + room - w : 14 + (room - w) / 2;
        const [x, y] = g.map(vx, 12);
        page.drawText(text, { x, y, size, font, color: hex(f.color), rotate: degrees(g.R) });
    }
}

async function drawSignatures(
    doc: PDFDocument,
    page: PDFPage,
    g: Geo,
    list: SignaturePlacement[],
    n: number,
    cache: Map<string, Awaited<ReturnType<PDFDocument['embedPng']>>>,
) {
    for (const s of list) {
        if (s.pages !== 'all' && !s.pages.includes(n)) continue;
        if (!cache.has(s.id)) cache.set(s.id, await doc.embedPng(s.png));
        const w = s.w * g.VW;
        const h = w * s.aspect;
        const [x, y] = g.map(s.x * g.VW, g.VH - s.y * g.VH - h);
        page.drawImage(cache.get(s.id)!, { x, y, width: w, height: h, rotate: degrees(g.R) });
    }
}

/** Text a viewer cannot see but a copy-paste or text extraction picks up: the code and page code. */
async function drawHiddenText(doc: PDFDocument, page: PDFPage, g: Geo, o: BuildOptions, n: number) {
    if (!o.trace) return;
    const font = await embedFont(doc, 'helvetica');
    const [x, y] = g.map(6, 6);
    page.drawText(`${TRACE_MARK}:${o.trace.code}:${o.trace.pageCodes[n - 1]}`, { x, y, size: 4, font, opacity: 0, rotate: degrees(g.R) });
}

function writeInfo(doc: PDFDocument, o: BuildOptions) {
    doc.setProducer('Gading Trace');
    doc.setCreator('Gading Trace');
    const info = doc.context.lookup(doc.context.trailerInfo.Info, PDFDict);
    if (info && o.trace) info.set(PDFName.of('GadingTrace'), PDFString.of(o.trace.code));
}

const canvasBlob = (c: HTMLCanvasElement, type: string, q: number) =>
    new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Canvas export failed'))), type, q));

/** Builds a flattened copy: every page becomes a picture with the watermark burned in, so it cannot be peeled off. */
async function flatten(o: BuildOptions, hidden: boolean, visible: boolean): Promise<PDFDocument> {
    const src = await openPdf(o.file);
    const out = await PDFDocument.create();
    const total = src.numPages;
    const qrBytes = o.trace && o.settings.qr ? await qrPng(o.trace.verifyUrl) : null;
    const qrImg = qrBytes ? await loadImage(qrBytes) : null;
    const sigImgs = new Map<string, ImageBitmap>();
    const fontCache = new Map<string, (size: number) => string>();
    const cssFont = async (id: ProtectSettings['watermark']['font']) => {
        if (!fontCache.has(id)) fontCache.set(id, await loadCanvasFont(id, o.customFont));

        return fontCache.get(id)!;
    };

    for (let n = 1; n <= total; n++) {
        const probe = (await src.getPage(n)).getViewport({ scale: 1 });
        const pxPerPt = Math.min(2.5, 2400 / Math.max(probe.width, probe.height));
        const canvas = await renderPage(src, n, pxPerPt);
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const style = styleForPage(o.settings, n, total);

        const signatures: PlacedImage[] = [];
        for (const s of o.signatures ?? []) {
            if (s.pages !== 'all' && !s.pages.includes(n)) continue;
            if (!sigImgs.has(s.id)) sigImgs.set(s.id, await loadImage(s.png));
            signatures.push({ source: sigImgs.get(s.id)!, x: s.x, y: s.y, w: s.w, aspect: s.aspect });
        }

        paintOverlay({
            ctx,
            pageW: probe.width,
            pageH: probe.height,
            scale: pxPerPt,
            settings: o.settings,
            text: textContext(o, n, total),
            font: { watermark: await cssFont(style.font), footer: await cssFont(o.settings.footer.font) },
            visible,
            qr: qrImg,
            signatures,
        });

        if (hidden && o.trace) {
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            embedImageData(data, o.trace.code);
            ctx.putImageData(data, 0, 0);
        }

        const jpg = await out.embedJpg(await (await canvasBlob(canvas, 'image/jpeg', 0.9)).arrayBuffer());
        const page = out.addPage([probe.width, probe.height]);
        page.drawImage(jpg, { x: 0, y: 0, width: probe.width, height: probe.height });
        o.onProgress?.(n, total);
    }

    return out;
}

/**
 * Applies everything to a PDF: the visible layers (watermark, footer, QR, signatures) and, for registered documents,
 * the hidden ones (invisible text, metadata, and the pixel watermark when flattened).
 */
export async function buildProtectedPdf(o: BuildOptions): Promise<Uint8Array> {
    const visible = !o.trace || o.settings.mode !== 'hidden';
    const hidden = !!o.trace && o.settings.mode !== 'visible';

    let doc: PDFDocument;
    if (o.settings.flatten) {
        doc = await flatten(o, hidden, visible);
    } else {
        try {
            doc = await PDFDocument.load(await o.file.arrayBuffer());
        } catch {
            throw new Error('This PDF is password protected or damaged.');
        }
    }

    const pages = doc.getPages();
    const qr = !o.settings.flatten && visible && o.trace && o.settings.qr ? await doc.embedPng(await qrPng(o.trace.verifyUrl)) : null;
    const sigCache = new Map<string, Awaited<ReturnType<PDFDocument['embedPng']>>>();

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const g = geometry(page);
        if (!o.settings.flatten) {
            if (visible) await drawVisible(doc, page, g, o, i + 1, pages.length, qr);
            await drawSignatures(doc, page, g, o.signatures ?? [], i + 1, sigCache);
            o.onProgress?.(i + 1, pages.length);
        }
        if (hidden) await drawHiddenText(doc, page, g, o, i + 1);
    }

    if (hidden) writeInfo(doc, o);

    return doc.save();
}
