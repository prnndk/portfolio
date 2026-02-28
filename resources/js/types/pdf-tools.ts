// Types for PDF Tools

export interface PdfFile {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    thumbnail: string | null;
    status: 'loading' | 'ready' | 'processing' | 'completed' | 'error';
    error?: string;
}

export interface PdfPage {
    pageNumber: number;
    thumbnail: string | null;
    width: number;
    height: number;
    rotation: number;
    selected: boolean;
}

export interface ImageFile {
    id: string;
    file: File;
    name: string;
    size: number;
    preview: string;
    width: number;
    height: number;
}

export type PageSize = 'a4' | 'letter' | 'legal' | 'a3' | 'a5' | 'fit';
export type PageOrientation = 'portrait' | 'landscape' | 'auto';
export type ImageFormat = 'jpeg' | 'png';
export type RotationAngle = 0 | 90 | 180 | 270;

export interface PageSizeOption {
    value: PageSize;
    label: string;
    width: number; // in points (72 dpi)
    height: number;
}

export const PAGE_SIZES: PageSizeOption[] = [
    { value: 'a4', label: 'A4', width: 595.28, height: 841.89 },
    { value: 'letter', label: 'Letter', width: 612, height: 792 },
    { value: 'legal', label: 'Legal', width: 612, height: 1008 },
    { value: 'a3', label: 'A3', width: 841.89, height: 1190.55 },
    { value: 'a5', label: 'A5', width: 419.53, height: 595.28 },
    { value: 'fit', label: 'Fit to Image', width: 0, height: 0 },
];
