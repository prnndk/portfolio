import type { FontId } from './fonts';

export type TraceMode = 'visible' | 'hidden' | 'both';

export interface WatermarkStyle {
    enabled: boolean;
    /** May contain {variables} and line breaks. */
    text: string;
    font: FontId;
    /** Points; 0 = fit to the page. */
    size: number;
    /** Degrees, counter-clockwise. */
    angle: number;
    opacity: number;
    color: string;
    layout: 'tile' | 'center' | 'top' | 'bottom' | 'custom';
    /** Space between repeats, as a multiple of the text width / height. */
    gapX: number;
    gapY: number;
    /** Offset every other row by half a cell (brick pattern). */
    stagger: boolean;
    /** Anchor for the custom layout, 0..1 from the top-left. */
    x: number;
    y: number;
}

export interface FooterStyle {
    enabled: boolean;
    text: string;
    font: FontId;
    size: number;
    color: string;
    align: 'left' | 'center' | 'right';
}

export interface PageRule {
    /** "1-3,5" */
    range: string;
    style: Partial<WatermarkStyle>;
}

export interface ProtectSettings {
    mode: TraceMode;
    /** Burn the pages into pictures so the watermark cannot be removed in a PDF editor. */
    flatten: boolean;
    qr: boolean;
    watermark: WatermarkStyle;
    footer: FooterStyle;
    rules: PageRule[];
}

export const DEFAULT_SETTINGS: ProtectSettings = {
    mode: 'both',
    flatten: false,
    qr: true,
    watermark: {
        enabled: true,
        text: 'CONFIDENTIAL\n{recipient}',
        font: 'helvetica-bold',
        size: 0,
        angle: 35,
        opacity: 0.16,
        color: '#B42318',
        layout: 'tile',
        gapX: 0.6,
        gapY: 2.2,
        stagger: true,
        x: 0.5,
        y: 0.5,
    },
    footer: {
        enabled: true,
        text: '© {year} {issuer} · Provided only to {recipient} · {date} · ID {code}-{pageCode} · Do not distribute',
        font: 'helvetica',
        size: 7,
        color: '#555555',
        align: 'center',
    },
    rules: [],
};

export interface TextContext {
    recipient: string;
    issuer: string;
    date: string;
    year: string;
    page: number;
    pages: number;
    code: string;
    pageCode: string;
}

export const fillTemplate = (tpl: string, c: TextContext) =>
    tpl.replace(/\{(\w+)\}/g, (m, k: string) => (k in c ? String(c[k as keyof TextContext]) : m));

/** Lines of a multi-line template, minus any line whose variables came out empty (e.g. {recipient} on an unregistered document). */
export function fillLines(tpl: string, c: TextContext): string[] {
    return tpl
        .split('\n')
        .map((line) => ({ line, out: fillTemplate(line, c) }))
        .filter(({ line, out }) => out.trim() || !line.trim())
        .map(({ out }) => out);
}

/** Footer text where each " · " part is dropped when one of its variables is empty, so no dangling "ID -" or "for ". */
export function fillFooter(tpl: string, c: TextContext): string {
    return tpl
        .split('·')
        .filter((part) => [...part.matchAll(/\{(\w+)\}/g)].every((m) => String(c[m[1] as keyof TextContext] ?? m[0]).trim() !== ''))
        .map((part) => fillTemplate(part, c).trim())
        .filter(Boolean)
        .join(' · ');
}

export function parseRange(range: string, pages: number): Set<number> {
    const out = new Set<number>();
    for (const part of range.split(',')) {
        const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (!m) continue;
        const a = Number(m[1]);
        const b = m[2] ? Number(m[2]) : a;
        for (let p = Math.max(1, Math.min(a, b)); p <= Math.min(pages, Math.max(a, b)); p++) out.add(p);
    }
    return out;
}

/** The base style with every rule that covers this page applied in order. */
export function styleForPage(s: ProtectSettings, page: number, pages: number): WatermarkStyle {
    return s.rules.reduce((acc, r) => {
        if (!parseRange(r.range, pages).has(page)) return acc;
        // a cleared field in the rule editor is undefined and must not wipe the base value
        const set = Object.fromEntries(Object.entries(r.style).filter(([, v]) => v !== undefined));

        return { ...acc, ...set };
    }, s.watermark);
}

/** Font size that makes the text span a sensible share of the page when the user leaves size on auto. */
export function resolveSize(style: WatermarkStyle, pageW: number, widthAtOnePt: number): number {
    if (style.size > 0) return style.size;
    const target = style.layout === 'tile' ? 0.34 * pageW : 0.7 * pageW;

    return Math.max(8, Math.min(160, target / Math.max(widthAtOnePt, 1)));
}

export interface Mark {
    /** Centre of the text block, in points from the bottom-left of the visible page. */
    x: number;
    y: number;
    angle: number;
}

/** Where every copy of the watermark goes. One function feeds the PDF, canvas and preview renderers, so all three agree. */
export function layoutMarks(w: number, h: number, tw: number, th: number, s: WatermarkStyle): Mark[] {
    const angle = s.angle;
    if (s.layout === 'center') return [{ x: w / 2, y: h / 2, angle }];
    if (s.layout === 'top') return [{ x: w / 2, y: h - Math.max(th, h * 0.06) - 20, angle }];
    if (s.layout === 'bottom') return [{ x: w / 2, y: Math.max(th, h * 0.06) + 36, angle }];
    if (s.layout === 'custom') return [{ x: s.x * w, y: h - s.y * h, angle }];

    const cw = tw * (1 + s.gapX);
    const ch = th * (1 + s.gapY);
    const reach = Math.hypot(w, h) / 2 + Math.max(tw, th);
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const marks: Mark[] = [];

    for (let j = -Math.ceil(reach / ch); j <= Math.ceil(reach / ch); j++) {
        const shift = s.stagger && Math.abs(j) % 2 === 1 ? cw / 2 : 0;
        for (let i = -Math.ceil(reach / cw); i <= Math.ceil(reach / cw); i++) {
            const lx = i * cw + shift;
            const ly = j * ch;
            const x = w / 2 + lx * cos - ly * sin;
            const y = h / 2 + lx * sin + ly * cos;
            const pad = Math.max(tw, th) / 2;
            if (x > -pad && x < w + pad && y > -pad && y < h + pad) marks.push({ x, y, angle });
        }
    }

    return marks.slice(0, 1500); // a gap near zero on a big page must not freeze the browser
}
