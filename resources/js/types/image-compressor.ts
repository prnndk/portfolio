// Types for Image Compressor Tool
export interface CompressedImage {
    id: string;
    originalFile: File;
    originalSize: number;
    compressedBlob: Blob | null;
    compressedSize: number;
    compressionRatio: number;
    preview: string;
    compressedPreview: string | null;
    status: 'pending' | 'compressing' | 'completed' | 'error';
    error?: string;
    // Edit state
    cropData?: CropData;
    rotation: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
}

export interface CropData {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageCompressorState {
    images: CompressedImage[];
    quality: number;
    outputFormat: OutputFormat;
    isProcessing: boolean;
    progress: number;
}

export type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp';

export interface ImageEditOptions {
    quality: number;
    outputFormat: OutputFormat;
    crop?: CropData;
    rotation: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
    maxWidth?: number;
    maxHeight?: number;
}

// Tool type for listing
export interface Tool {
    id: string;
    name: string;
    description: string;
    icon: string;
    href: string;
    category: 'image' | 'text' | 'utility' | 'converter';
    isNew?: boolean;
    isFeatured?: boolean;
}
