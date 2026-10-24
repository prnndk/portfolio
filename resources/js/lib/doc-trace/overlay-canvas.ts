import { type ProtectSettings, type TextContext, fillFooter, fillLines, layoutMarks, resolveSize, styleForPage } from './template';

export interface PlacedImage {
    source: CanvasImageSource;
    /** Left / top / width as fractions of the visible page; height follows the picture's own proportions. */
    x: number;
    y: number;
    w: number;
    aspect: number;
}

export interface OverlayInput {
    ctx: CanvasRenderingContext2D;
    /** Visible page size in "page units": points for a PDF, pixels for a picture. */
    pageW: number;
    pageH: number;
    /** Canvas pixels per page unit. */
    scale: number;
    /** Footer text, margins and the QR size are designed for a 595-wide page; pictures pass pageW / 595. */
    sizeScale?: number;
    settings: ProtectSettings;
    text: TextContext;
    font: { watermark: (size: number) => string; footer: (size: number) => string };
    /** False for the hidden-only mode: nothing visible is drawn. */
    visible: boolean;
    qr?: CanvasImageSource | null;
    signatures?: PlacedImage[];
}

/** Paints watermark, footer, QR and signatures onto a canvas. Used for pictures, flattened pages and the live preview. */
export function paintOverlay(i: OverlayInput) {
    const { ctx, pageW, pageH, scale, settings } = i;
    const k = i.sizeScale ?? 1;
    ctx.save();
    ctx.scale(scale, scale);

    const style = styleForPage(settings, i.text.page, i.text.pages);
    const lines = fillLines(style.text, i.text);
    if (i.visible && style.enabled && lines.length) {
        ctx.font = i.font.watermark(100);
        const widest = Math.max(...lines.map((l) => ctx.measureText(l).width / 100));
        const size = resolveSize(style, pageW, widest) * (style.size > 0 ? k : 1);
        const lh = size * 1.2;
        ctx.font = i.font.watermark(size);
        const tw = widest * size;
        const th = lh * lines.length;
        ctx.fillStyle = style.color;
        ctx.globalAlpha = style.opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const m of layoutMarks(pageW, pageH, tw, th, style)) {
            ctx.save();
            ctx.translate(m.x, pageH - m.y);
            ctx.rotate((-m.angle * Math.PI) / 180);
            lines.forEach((l, n) => ctx.fillText(l, 0, (n - (lines.length - 1) / 2) * lh));
            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }

    if (i.visible && settings.qr && i.qr) {
        const q = 40 * k;
        ctx.fillStyle = '#fff';
        ctx.fillRect(pageW - q - 12 * k, pageH - q - 8 * k, q + 4 * k, q + 4 * k);
        ctx.drawImage(i.qr, pageW - q - 10 * k, pageH - q - 6 * k, q, q);
    }

    const f = settings.footer;
    const text = fillFooter(f.text, i.text);
    if (i.visible && f.enabled && text) {
        const margin = 14 * k;
        const room = pageW - margin * 2 - (settings.qr && i.qr ? 48 * k : 0);
        let size = f.size * k;
        ctx.font = i.font.footer(size);
        while (ctx.measureText(text).width > room && size > 3 * k) ctx.font = i.font.footer((size -= 0.25 * k));
        ctx.fillStyle = f.color;
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = f.align;
        ctx.fillText(text, f.align === 'left' ? margin : f.align === 'right' ? margin + room : margin + room / 2, pageH - 12 * k);
    }

    for (const s of i.signatures ?? []) {
        const w = s.w * pageW;
        ctx.drawImage(s.source, s.x * pageW, s.y * pageH, w, w * s.aspect);
    }

    ctx.restore();
}
