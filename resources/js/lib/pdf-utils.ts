// PDF Utilities - Client-side PDF processing helpers
import type { PdfFile, PdfPage } from '@/types/pdf-tools';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up PDF.js worker using the bundled file (avoids CDN 404 issues)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Read a File as ArrayBuffer
 */
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Read a File as data URL
 */
export async function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Get the page count and thumbnail of a PDF file
 */
export async function getPdfInfo(file: File): Promise<{ pageCount: number; thumbnail: string }> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdfDoc.numPages;

    // Generate thumbnail from first page
    const thumbnail = await renderPageToDataURL(pdfDoc, 1, 0.3);

    return { pageCount, thumbnail };
}

/**
 * Render a PDF page to a data URL using pdfjs-dist
 */
export async function renderPageToDataURL(pdfDoc: pdfjsLib.PDFDocumentProxy, pageNumber: number, scale: number = 1.0): Promise<string> {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;
    return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * Get all pages info from a PDF (thumbnails + dimensions)
 */
export async function getPdfPages(file: File, scale: number = 0.25): Promise<PdfPage[]> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: PdfPage[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const thumbnail = await renderPageToDataURL(pdfDoc, i, scale);

        pages.push({
            pageNumber: i,
            thumbnail,
            width: viewport.width,
            height: viewport.height,
            rotation: 0,
            selected: true,
        });
    }

    return pages;
}

/**
 * Create a PdfFile object from a File
 */
export async function createPdfFile(file: File): Promise<PdfFile> {
    const id = generateId();
    try {
        const { pageCount, thumbnail } = await getPdfInfo(file);
        return {
            id,
            file,
            name: file.name,
            size: file.size,
            pageCount,
            thumbnail,
            status: 'ready',
        };
    } catch {
        return {
            id,
            file,
            name: file.name,
            size: file.size,
            pageCount: 0,
            thumbnail: null,
            status: 'error',
            error: 'Failed to read PDF file',
        };
    }
}

/**
 * Merge multiple PDF files into one
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return mergedPdf.save();
}

/**
 * Split a PDF into selected pages
 */
export async function splitPdf(file: File, pageNumbers: number[]): Promise<Uint8Array> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    // Convert 1-based page numbers to 0-based indices
    const indices = pageNumbers.map((n) => n - 1);
    const copiedPages = await newPdf.copyPages(sourcePdf, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    return newPdf.save();
}

/**
 * Split a PDF into individual single-page PDFs
 */
export async function splitPdfToIndividual(file: File): Promise<{ name: string; data: Uint8Array }[]> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const results: { name: string; data: Uint8Array }[] = [];
    const baseName = file.name.replace(/\.pdf$/i, '');

    for (let i = 0; i < sourcePdf.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
        newPdf.addPage(copiedPage);
        const data = await newPdf.save();
        results.push({ name: `${baseName}_page_${i + 1}.pdf`, data });
    }

    return results;
}

/**
 * Rotate PDF pages
 */
export async function rotatePdfPages(file: File, pageRotations: { pageIndex: number; rotation: number }[]): Promise<Uint8Array> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    for (const { pageIndex, rotation } of pageRotations) {
        const page = pdfDoc.getPage(pageIndex);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotation) % 360));
    }

    return pdfDoc.save();
}

/**
 * Compression quality presets
 */
export type CompressionLevel = 'low' | 'medium' | 'high';

interface CompressionPreset {
    /** Image quality (0-1) for JPEG re-encoding */
    quality: number;
    /** Scale factor for rendering pages (lower = smaller images) */
    scale: number;
    /** DPI label for display purposes */
    dpiLabel: string;
}

const COMPRESSION_PRESETS: Record<CompressionLevel, CompressionPreset> = {
    low: { quality: 0.85, scale: 1.5, dpiLabel: '~150 DPI' },
    medium: { quality: 0.65, scale: 1.2, dpiLabel: '~120 DPI' },
    high: { quality: 0.4, scale: 0.9, dpiLabel: '~90 DPI' },
};

/**
 * Compress PDF by re-rendering each page as a compressed JPEG image
 * and rebuilding the PDF. This is the most effective client-side
 * compression method since images typically account for 90%+ of PDF size.
 *
 * @param file - The source PDF file
 * @param level - Compression level: 'low' (best quality), 'medium', or 'high' (smallest size)
 * @param onProgress - Optional callback reporting progress (0-1)
 */
export async function compressPdf(file: File, level: CompressionLevel = 'medium', onProgress?: (progress: number) => void): Promise<Uint8Array> {
    const preset = COMPRESSION_PRESETS[level];
    const arrayBuffer = await readFileAsArrayBuffer(file);

    // Load with pdfjs-dist for rendering
    const sourceDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = sourceDoc.numPages;

    // Create fresh PDF with pdf-lib
    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= totalPages; i++) {
        const page = await sourceDoc.getPage(i);
        const originalViewport = page.getViewport({ scale: 1.0 });

        // Render at the preset scale
        const viewport = page.getViewport({ scale: preset.scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({
            canvasContext: ctx,
            viewport,
            canvas,
        } as unknown as Parameters<typeof page.render>[0]).promise;

        // Convert canvas to compressed JPEG blob
        const jpegBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', preset.quality);
        });
        const jpegBuffer = await jpegBlob.arrayBuffer();

        // Embed the JPEG image into the new PDF
        const jpegImage = await newPdf.embedJpg(new Uint8Array(jpegBuffer));

        // Create a page with the ORIGINAL dimensions (points) so the PDF
        // appears at the same size to the viewer, just with compressed imagery
        const newPage = newPdf.addPage([originalViewport.width, originalViewport.height]);
        newPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height,
        });

        onProgress?.(i / totalPages);
    }

    // Strip metadata for additional savings
    newPdf.setTitle('');
    newPdf.setAuthor('');
    newPdf.setSubject('');
    newPdf.setKeywords([]);
    newPdf.setProducer('');
    newPdf.setCreator('');

    return newPdf.save({ useObjectStreams: true });
}

/**
 * Render all PDF pages to images
 */
export async function pdfToImages(
    file: File,
    format: 'jpeg' | 'png' = 'jpeg',
    scale: number = 2.0,
    quality: number = 0.85,
): Promise<{ name: string; dataUrl: string; blob: Blob }[]> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const results: { name: string; dataUrl: string; blob: Blob }[] = [];
    const baseName = file.name.replace(/\.pdf$/i, '');
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;

        const dataUrl = canvas.toDataURL(mimeType, quality);
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), mimeType, quality);
        });

        const ext = format === 'png' ? 'png' : 'jpg';
        results.push({
            name: `${baseName}_page_${i}.${ext}`,
            dataUrl,
            blob,
        });
    }

    return results;
}

/**
 * Convert images to a PDF document
 */
export async function imagesToPdf(
    images: { file: File; width: number; height: number }[],
    pageWidth: number,
    pageHeight: number,
    orientation: 'portrait' | 'landscape' | 'auto',
    margin: number = 20,
    fitToPage: boolean = false,
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    for (const img of images) {
        const arrayBuffer = await readFileAsArrayBuffer(img.file);
        let embeddedImage;

        if (img.file.type === 'image/png') {
            embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
            embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
        }

        let pw = pageWidth;
        let ph = pageHeight;

        if (fitToPage) {
            // Fit page to image
            pw = embeddedImage.width + margin * 2;
            ph = embeddedImage.height + margin * 2;
        } else if (orientation === 'auto') {
            // Auto-detect orientation based on image aspect ratio
            if (embeddedImage.width > embeddedImage.height) {
                // Landscape
                pw = Math.max(pageWidth, pageHeight);
                ph = Math.min(pageWidth, pageHeight);
            } else {
                // Portrait
                pw = Math.min(pageWidth, pageHeight);
                ph = Math.max(pageWidth, pageHeight);
            }
        } else if (orientation === 'landscape') {
            pw = Math.max(pageWidth, pageHeight);
            ph = Math.min(pageWidth, pageHeight);
        }

        const page = pdfDoc.addPage([pw, ph]);

        const availableWidth = pw - margin * 2;
        const availableHeight = ph - margin * 2;

        // Scale image to fit within available area while maintaining aspect ratio
        const imgAspect = embeddedImage.width / embeddedImage.height;
        const areaAspect = availableWidth / availableHeight;

        let drawWidth, drawHeight;
        if (imgAspect > areaAspect) {
            drawWidth = availableWidth;
            drawHeight = availableWidth / imgAspect;
        } else {
            drawHeight = availableHeight;
            drawWidth = availableHeight * imgAspect;
        }

        // Center image on page
        const x = margin + (availableWidth - drawWidth) / 2;
        const y = margin + (availableHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
        });
    }

    return pdfDoc.save();
}

/**
 * Trigger a browser download from a Uint8Array or Blob
 */
export function downloadBlob(data: Uint8Array | Blob, filename: string): void {
    const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download multiple files as a ZIP
 */
export async function downloadAsZip(files: { name: string; data: Uint8Array | Blob }[], zipName: string = 'files.zip'): Promise<void> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const file of files) {
        zip.file(file.name, file.data);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, zipName);
}

/**
 * Get image dimensions from a File
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            reject(new Error('Failed to load image'));
            URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
    });
}
