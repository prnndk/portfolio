import fontkit from '@pdf-lib/fontkit';
import { type PDFDocument, type PDFFont, StandardFonts } from 'pdf-lib';

export type FontId =
    | 'helvetica'
    | 'helvetica-bold'
    | 'times'
    | 'times-bolditalic'
    | 'courier'
    | 'courier-bold'
    | 'inter'
    | 'bricolage'
    | 'jetbrains'
    | 'custom';

interface FontDef {
    id: FontId;
    label: string;
    /** CSS family and weight/style for canvas drawing. */
    family: string;
    style?: string;
    standard?: StandardFonts;
    /** Same-origin font file, fetched only when the font is picked (the CSP allows no other origin). */
    url?: () => Promise<string>;
}

export const FONTS: FontDef[] = [
    { id: 'helvetica', label: 'Helvetica', family: 'Helvetica, Arial, sans-serif', standard: StandardFonts.Helvetica },
    { id: 'helvetica-bold', label: 'Helvetica Bold', family: 'Helvetica, Arial, sans-serif', style: 'bold', standard: StandardFonts.HelveticaBold },
    { id: 'times', label: 'Times', family: "'Times New Roman', Times, serif", standard: StandardFonts.TimesRoman },
    {
        id: 'times-bolditalic',
        label: 'Times Bold Italic',
        family: "'Times New Roman', Times, serif",
        style: 'italic bold',
        standard: StandardFonts.TimesRomanBoldItalic,
    },
    { id: 'courier', label: 'Courier', family: "'Courier New', Courier, monospace", standard: StandardFonts.Courier },
    { id: 'courier-bold', label: 'Courier Bold', family: "'Courier New', Courier, monospace", style: 'bold', standard: StandardFonts.CourierBold },
    { id: 'inter', label: 'Inter Bold', family: "'DT Inter', sans-serif", url: async () => '/fonts/Inter-Bold.ttf' },
    {
        id: 'bricolage',
        label: 'Bricolage Grotesque',
        family: "'DT Bricolage', sans-serif",
        url: () => import('@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff?url').then((m) => m.default),
    },
    {
        id: 'jetbrains',
        label: 'JetBrains Mono Bold',
        family: "'DT JetBrains', monospace",
        url: () => import('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff?url').then((m) => m.default),
    },
    { id: 'custom', label: 'Upload your own (TTF/OTF)', family: "'DT Custom', sans-serif" },
];

export const fontDef = (id: FontId) => FONTS.find((f) => f.id === id) ?? FONTS[0];

const bytesCache = new Map<string, Promise<Uint8Array>>();

async function loadBytes(id: FontId, custom?: Uint8Array): Promise<Uint8Array> {
    if (id === 'custom') return custom ?? new Uint8Array();
    const def = fontDef(id);
    if (!bytesCache.has(id)) {
        bytesCache.set(
            id,
            def.url!().then((u) => fetch(u).then(async (r) => new Uint8Array(await r.arrayBuffer()))),
        );
    }
    return bytesCache.get(id)!;
}

const embedded = new WeakMap<PDFDocument, Map<string, Promise<PDFFont>>>();

/** Embeds a font once per document; web and custom fonts are subset so only the glyphs used add weight. */
export function embedFont(pdf: PDFDocument, id: FontId, custom?: Uint8Array): Promise<PDFFont> {
    const per = embedded.get(pdf) ?? new Map();
    embedded.set(pdf, per);
    if (!per.has(id)) {
        per.set(
            id,
            (async () => {
                const def = fontDef(id);
                if (def.standard) return pdf.embedFont(def.standard);
                pdf.registerFontkit(fontkit);
                return pdf.embedFont(await loadBytes(id, custom), { subset: true });
            })(),
        );
    }
    return per.get(id)!;
}

/** Makes a font usable on a canvas; returns a function that gives the `ctx.font` string for a size. */
export async function loadCanvasFont(id: FontId, custom?: Uint8Array): Promise<(size: number) => string> {
    const def = fontDef(id);
    const css = (size: number) => `${def.style ?? ''} ${size}px ${def.family}`.trim();
    if (def.standard) return css;
    const name = def.family.split(',')[0].replace(/'/g, '');
    if (id === 'custom') [...document.fonts].filter((f) => f.family.replace(/"/g, '') === name).forEach((f) => document.fonts.delete(f));
    if (![...document.fonts].some((f) => f.family.replace(/"/g, '') === name)) {
        const face = new FontFace(name, (await loadBytes(id, custom)).slice().buffer as ArrayBuffer);
        document.fonts.add(await face.load());
    }
    return css;
}

/** False when the font cannot draw some character (standard PDF fonts only know Latin-1). */
export function canEncode(font: PDFFont, text: string): boolean {
    try {
        font.encodeText(text);
        return true;
    } catch {
        return false;
    }
}
