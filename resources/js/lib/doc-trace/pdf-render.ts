import * as pdfjsLib from 'pdfjs-dist';
import { readFileAsArrayBuffer } from '../pdf-utils'; // also configures the pdf.js worker

export type PdfjsDoc = pdfjsLib.PDFDocumentProxy;

export async function openPdf(file: File | ArrayBuffer): Promise<PdfjsDoc> {
    const data = file instanceof ArrayBuffer ? file.slice(0) : await readFileAsArrayBuffer(file);

    return pdfjsLib.getDocument({ data }).promise;
}

/** Visible size of a page in PDF points (rotation applied). */
export async function pageSize(doc: PdfjsDoc, pageNo: number) {
    const v = (await doc.getPage(pageNo)).getViewport({ scale: 1 });

    return { w: v.width, h: v.height };
}

export async function renderPage(doc: PdfjsDoc, pageNo: number, pxPerPt: number): Promise<HTMLCanvasElement> {
    const page = await doc.getPage(pageNo);
    const viewport = page.getViewport({ scale: pxPerPt });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;

    return canvas;
}

export async function pageText(doc: PdfjsDoc, pageNo: number): Promise<string> {
    const content = await (await doc.getPage(pageNo)).getTextContent();

    return content.items.map((it) => ('str' in it ? it.str : '')).join(' ');
}
