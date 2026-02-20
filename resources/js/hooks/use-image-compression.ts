// Custom hook for image compression logic
import { useCallback, useState } from 'react';
import { CompressedImage, CropData, ImageCompressorState, OutputFormat } from '@/types/image-compressor';
import {
    createInitialImageState,
    filterValidFiles,
    processImages,
    compressImage,
} from '@/lib/image-compression';
import { toast } from 'sonner';

const initialState: ImageCompressorState = {
    images: [],
    quality: 80,
    outputFormat: 'original',
    isProcessing: false,
    progress: 0,
};

export function useImageCompression() {
    const [state, setState] = useState<ImageCompressorState>(initialState);

    const handleFilesAdded = useCallback((files: File[]) => {
        const { valid, invalid } = filterValidFiles(files);

        if (invalid.length > 0) {
            toast.error(`${invalid.length} file(s) were rejected. Only images are allowed.`);
        }

        if (valid.length > 0) {
            const newImages = valid.map((file) => createInitialImageState(file));
            setState((prev) => ({
                ...prev,
                images: [...prev.images, ...newImages],
            }));
            toast.success(`${valid.length} image(s) added successfully.`);
        }
    }, []);

    const removeImage = useCallback((id: string) => {
        setState((prev) => {
            const image = prev.images.find((img) => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.preview);
                if (image.compressedPreview) {
                    URL.revokeObjectURL(image.compressedPreview);
                }
            }
            return {
                ...prev,
                images: prev.images.filter((img) => img.id !== id),
            };
        });
    }, []);

    const clearAllImages = useCallback(() => {
        setState((prev) => {
            prev.images.forEach((img) => {
                URL.revokeObjectURL(img.preview);
                if (img.compressedPreview) {
                    URL.revokeObjectURL(img.compressedPreview);
                }
            });
            return {
                ...prev,
                images: [],
                progress: 0,
            };
        });
    }, []);

    const setQuality = useCallback((quality: number) => {
        setState((prev) => ({ ...prev, quality }));
    }, []);

    const setOutputFormat = useCallback((outputFormat: OutputFormat) => {
        setState((prev) => ({ ...prev, outputFormat }));
    }, []);

    const updateImageEditState = useCallback(
        (id: string, updates: Partial<Pick<CompressedImage, 'cropData' | 'rotation' | 'flipHorizontal' | 'flipVertical'>>) => {
            setState((prev) => ({
                ...prev,
                images: prev.images.map((img) =>
                    img.id === id ? { ...img, ...updates, status: 'pending', compressedBlob: null, compressedPreview: null } : img
                ),
            }));
        },
        []
    );

    const rotateImage = useCallback((id: string, direction: 'cw' | 'ccw') => {
        setState((prev) => ({
            ...prev,
            images: prev.images.map((img) => {
                if (img.id === id) {
                    const newRotation = direction === 'cw'
                        ? (img.rotation + 90) % 360
                        : (img.rotation - 90 + 360) % 360;
                    return { ...img, rotation: newRotation, status: 'pending', compressedBlob: null, compressedPreview: null };
                }
                return img;
            }),
        }));
    }, []);

    const flipImage = useCallback((id: string, axis: 'horizontal' | 'vertical') => {
        setState((prev) => ({
            ...prev,
            images: prev.images.map((img) => {
                if (img.id === id) {
                    return {
                        ...img,
                        flipHorizontal: axis === 'horizontal' ? !img.flipHorizontal : img.flipHorizontal,
                        flipVertical: axis === 'vertical' ? !img.flipVertical : img.flipVertical,
                        status: 'pending',
                        compressedBlob: null,
                        compressedPreview: null,
                    };
                }
                return img;
            }),
        }));
    }, []);

    const setCropData = useCallback((id: string, cropData: CropData | undefined) => {
        updateImageEditState(id, { cropData });
    }, [updateImageEditState]);

    const compressAllImages = useCallback(async () => {
        if (state.images.length === 0) return;

        setState((prev) => ({ ...prev, isProcessing: true, progress: 0 }));

        try {
            const pendingImages = state.images.map((img) => ({ ...img, status: 'compressing' as const }));
            setState((prev) => ({ ...prev, images: pendingImages }));

            const compressed = await processImages(
                state.images,
                state.quality,
                state.outputFormat,
                (current, total) => {
                    setState((prev) => ({ ...prev, progress: Math.round((current / total) * 100) }));
                }
            );

            setState((prev) => ({
                ...prev,
                images: compressed,
                isProcessing: false,
                progress: 100,
            }));

            const successful = compressed.filter((img) => img.status === 'completed').length;
            const failed = compressed.filter((img) => img.status === 'error').length;

            if (successful > 0) {
                toast.success(`Successfully compressed ${successful} image(s).`);
            }
            if (failed > 0) {
                toast.error(`Failed to compress ${failed} image(s).`);
            }
        } catch {
            setState((prev) => ({ ...prev, isProcessing: false }));
            toast.error('An error occurred during compression.');
        }
    }, [state.images, state.quality, state.outputFormat]);

    const compressSingleImage = useCallback(async (id: string) => {
        const image = state.images.find((img) => img.id === id);
        if (!image) return;

        setState((prev) => ({
            ...prev,
            images: prev.images.map((img) =>
                img.id === id ? { ...img, status: 'compressing' } : img
            ),
        }));

        try {
            const compressed = await compressImage(image, state.quality, state.outputFormat);
            setState((prev) => ({
                ...prev,
                images: prev.images.map((img) => (img.id === id ? compressed : img)),
            }));
            toast.success('Image compressed successfully.');
        } catch {
            setState((prev) => ({
                ...prev,
                images: prev.images.map((img) =>
                    img.id === id ? { ...img, status: 'error' } : img
                ),
            }));
            toast.error('Failed to compress image.');
        }
    }, [state.images, state.quality, state.outputFormat]);

    const reset = useCallback(() => {
        clearAllImages();
        setState(initialState);
    }, [clearAllImages]);

    return {
        ...state,
        handleFilesAdded,
        removeImage,
        clearAllImages,
        setQuality,
        setOutputFormat,
        updateImageEditState,
        rotateImage,
        flipImage,
        setCropData,
        compressAllImages,
        compressSingleImage,
        reset,
    };
}
