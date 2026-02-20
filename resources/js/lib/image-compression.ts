// Image Compression Utilities
import { CompressedImage, ImageEditOptions, OutputFormat } from '@/types/image-compressor';

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

export function validateFileType(file: File): boolean {
    return ALLOWED_FORMATS.includes(file.type);
}

export function filterValidFiles(files: File[]): { valid: File[]; invalid: File[] } {
    const valid: File[] = [];
    const invalid: File[] = [];

    files.forEach((file) => {
        if (validateFileType(file)) {
            valid.push(file);
        } else {
            invalid.push(file);
        }
    });

    return { valid, invalid };
}

export function generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getOutputMimeType(format: OutputFormat, originalType: string): string {
    switch (format) {
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        default:
            return originalType === 'image/gif' ? 'image/png' : originalType;
    }
}

export function getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/bmp': 'bmp',
    };
    return extensions[mimeType] || 'jpg';
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export async function applyEditsToImage(
    file: File,
    options: ImageEditOptions
): Promise<Blob> {
    const { quality, outputFormat, crop, rotation, flipHorizontal, flipVertical, maxWidth, maxHeight } = options;

    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);

    try {
        const img = await loadImage(objectUrl);

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        // Calculate dimensions after rotation
        const isRotated90or270 = rotation === 90 || rotation === 270;
        let sourceWidth = crop ? crop.width : img.naturalWidth;
        let sourceHeight = crop ? crop.height : img.naturalHeight;

        if (isRotated90or270) {
            [sourceWidth, sourceHeight] = [sourceHeight, sourceWidth];
        }

        // Apply max dimensions if specified
        let targetWidth = sourceWidth;
        let targetHeight = sourceHeight;

        if (maxWidth && targetWidth > maxWidth) {
            const ratio = maxWidth / targetWidth;
            targetWidth = maxWidth;
            targetHeight = Math.round(targetHeight * ratio);
        }

        if (maxHeight && targetHeight > maxHeight) {
            const ratio = maxHeight / targetHeight;
            targetHeight = maxHeight;
            targetWidth = Math.round(targetWidth * ratio);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Apply transformations
        ctx.save();

        // Move to center for rotation/flip
        ctx.translate(targetWidth / 2, targetHeight / 2);

        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);

        // Apply flips
        ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);

        // Calculate drawing dimensions (swap back if rotated)
        const drawWidth = isRotated90or270 ? targetHeight : targetWidth;
        const drawHeight = isRotated90or270 ? targetWidth : targetHeight;

        // Draw image
        if (crop) {
            ctx.drawImage(
                img,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
            );
        } else {
            ctx.drawImage(
                img,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
            );
        }

        ctx.restore();

        // Convert to blob
        const mimeType = getOutputMimeType(outputFormat, file.type);
        const qualityValue = mimeType === 'image/png' ? undefined : quality / 100;

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                mimeType,
                qualityValue
            );
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export async function compressImage(
    image: CompressedImage,
    quality: number,
    outputFormat: OutputFormat
): Promise<CompressedImage> {
    try {
        const blob = await applyEditsToImage(image.originalFile, {
            quality,
            outputFormat,
            crop: image.cropData,
            rotation: image.rotation,
            flipHorizontal: image.flipHorizontal,
            flipVertical: image.flipVertical,
        });

        const compressedPreview = URL.createObjectURL(blob);
        const compressionRatio = ((image.originalSize - blob.size) / image.originalSize) * 100;

        return {
            ...image,
            compressedBlob: blob,
            compressedSize: blob.size,
            compressedPreview,
            compressionRatio: Math.max(0, compressionRatio),
            status: 'completed',
        };
    } catch (error) {
        return {
            ...image,
            status: 'error',
            error: error instanceof Error ? error.message : 'Compression failed',
        };
    }
}

export async function processImages(
    images: CompressedImage[],
    quality: number,
    outputFormat: OutputFormat,
    onProgress?: (current: number, total: number) => void
): Promise<CompressedImage[]> {
    const results: CompressedImage[] = [];

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (onProgress) {
            onProgress(i + 1, images.length);
        }

        const compressed = await compressImage(image, quality, outputFormat);
        results.push(compressed);
    }

    return results;
}

export function downloadImage(image: CompressedImage, format: OutputFormat): void {
    if (!image.compressedBlob) return;

    const mimeType = getOutputMimeType(format, image.originalFile.type);
    const extension = getFileExtension(mimeType);
    const originalName = image.originalFile.name.replace(/\.[^/.]+$/, '');
    const fileName = `${originalName}_compressed.${extension}`;

    const url = URL.createObjectURL(image.compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function downloadAllAsZip(images: CompressedImage[], format: OutputFormat): Promise<void> {
    // Simple approach: download each file individually if no zip library
    // For a better UX, you could add JSZip library
    for (const image of images) {
        if (image.compressedBlob && image.status === 'completed') {
            downloadImage(image, format);
            // Small delay between downloads
            await new Promise((resolve) => setTimeout(resolve, 300));
        }
    }
}

export function createInitialImageState(file: File): CompressedImage {
    return {
        id: generateImageId(),
        originalFile: file,
        originalSize: file.size,
        compressedBlob: null,
        compressedSize: 0,
        compressionRatio: 0,
        preview: URL.createObjectURL(file),
        compressedPreview: null,
        status: 'pending',
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
    };
}
