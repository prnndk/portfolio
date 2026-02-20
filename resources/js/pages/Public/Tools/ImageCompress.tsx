'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Download,
    Trash2,
    RefreshCw,
    Check,
    X,
    Loader2,
    ArrowLeft,
    Zap,
    Settings2,
    Image as ImageLucide,
    Eye,
    Pencil,
    Crop,
    Sparkles,
    AlertCircle,
} from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import GuestLayout from '@/layouts/guest-layout';
import { Spotlight } from '@/components/ui/spotlight-new';
import { Seo } from '@/components/seo';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useImageCompression } from '@/hooks/use-image-compression';
import { CompressedImage, CropData, OutputFormat } from '@/types/image-compressor';
import { formatFileSize, downloadImage, downloadAllAsZip } from '@/lib/image-compression';
import { ImageEditorModal } from '@/components/image-editor-modal';
import { ImagePreviewModal } from '@/components/image-preview-modal';
import { toast } from 'sonner';

// Format options
const formatOptions: { value: OutputFormat; label: string; desc: string }[] = [
    { value: 'original', label: 'Original', desc: 'Keep format' },
    { value: 'jpeg', label: 'JPEG', desc: 'Best for photos' },
    { value: 'png', label: 'PNG', desc: 'Lossless' },
    { value: 'webp', label: 'WebP', desc: 'Modern & small' },
];

// Image Preview Card Component
function ImagePreviewCard({
    image,
    onRemove,
    onEdit,
    onPreview,
    onCompress,
    onDownload,
}: {
    image: CompressedImage;
    onRemove: () => void;
    onEdit: () => void;
    onPreview: () => void;
    onCompress: () => void;
    onDownload: () => void;
}) {
    const getStatusBadge = () => {
        switch (image.status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-3 w-3" />
                        Ready
                    </span>
                );
            case 'compressing':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                        <Check className="h-3 w-3" />
                        Compressed
                    </span>
                );
            case 'error':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                        <X className="h-3 w-3" />
                        Error
                    </span>
                );
        }
    };

    // Only apply transforms if we're showing the original preview (not compressed)
    // When compressed, the transforms are already baked into the image
    const getTransformStyle = () => {
        // Only apply transforms to original preview, not compressed preview
        if (image.compressedPreview) {
            return undefined;
        }

        const transforms: string[] = [];
        if (image.rotation !== 0) {
            transforms.push(`rotate(${image.rotation}deg)`);
        }
        if (image.flipHorizontal) {
            transforms.push('scaleX(-1)');
        }
        if (image.flipVertical) {
            transforms.push('scaleY(-1)');
        }
        return transforms.length > 0 ? transforms.join(' ') : undefined;
    };

    const hasEdits = image.rotation !== 0 || image.flipHorizontal || image.flipVertical || image.cropData;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative overflow-hidden rounded-xl border border-border bg-card"
        >
            {/* Image Preview */}
            <div
                className="relative aspect-video overflow-hidden bg-muted cursor-pointer"
                onClick={onPreview}
            >
                <img
                    src={image.compressedPreview || image.preview}
                    alt={image.originalFile.name}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    style={{ transform: getTransformStyle() }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-9 w-9"
                            onClick={(e) => { e.stopPropagation(); onPreview(); }}
                            title="Preview"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-9 w-9"
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            title="Edit Image"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Remove Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Status Badge */}
                <div className="absolute left-2 top-2">{getStatusBadge()}</div>

                {/* Edit indicator */}
                {hasEdits && (
                    <div className="absolute right-2 bottom-2 rounded-full bg-primary/90 p-1.5 text-primary-foreground" title="Edited">
                        <Crop className="h-3 w-3" />
                    </div>
                )}
            </div>

            {/* Info & Actions */}
            <div className="p-3 space-y-3">
                <div className="space-y-1">
                    <p className="text-sm font-medium truncate" title={image.originalFile.name}>
                        {image.originalFile.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(image.originalSize)}</span>
                        {image.status === 'completed' && image.compressedSize > 0 && (
                            <>
                                <span>→</span>
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                    {formatFileSize(image.compressedSize)}
                                </span>
                                <span className={image.compressionRatio > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                    ({image.compressionRatio > 0 ? `-${image.compressionRatio.toFixed(1)}%` : `+${Math.abs(image.compressionRatio).toFixed(1)}%`})
                                </span>
                            </>
                        )}
                    </div>
                    {hasEdits && (
                        <p className="text-xs text-primary flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Edits applied
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {image.status !== 'completed' ? (
                        <Button
                            size="sm"
                            className="flex-1"
                            onClick={onCompress}
                            disabled={image.status === 'compressing'}
                        >
                            {image.status === 'compressing' ? (
                                <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Processing
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                                    Compress
                                </>
                            )}
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={onEdit}
                            >
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1"
                                onClick={onDownload}
                            >
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                Download
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Drop Zone Component
function DropZone({ onFilesAdded }: { onFilesAdded: (files: File[]) => void }) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            onFilesAdded(acceptedFiles);
        },
        [onFilesAdded]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp'],
        },
        multiple: true,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                'group relative flex min-h-[14rem] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300',
                isDragActive
                    ? 'border-primary bg-primary/10 scale-[1.02]'
                    : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5'
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4 px-6 text-center">
                <motion.div
                    animate={{
                        scale: isDragActive ? 1.1 : 1,
                        rotate: isDragActive ? 5 : 0,
                    }}
                    className="rounded-2xl bg-primary/10 p-4 transition-colors group-hover:bg-primary/20"
                >
                    <Upload className="h-8 w-8 text-primary" />
                </motion.div>

                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                        {isDragActive ? 'Drop your images here' : 'Drag & drop images here'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        or click to select files • JPEG, PNG, WebP, GIF, BMP
                    </p>
                </div>
            </div>
        </div>
    );
}

// Compression Settings Component - Minimalist with shadcn Slider
function CompressionSettings({
    quality,
    onQualityChange,
    outputFormat,
    onFormatChange,
}: {
    quality: number;
    onQualityChange: (value: number) => void;
    outputFormat: OutputFormat;
    onFormatChange: (format: OutputFormat) => void;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-primary/10 p-2.5">
                    <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">Compression Settings</h3>
                    <p className="text-sm text-muted-foreground">Adjust quality and format</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Quality Slider - Minimalist shadcn style */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Quality</label>
                        <span className="text-sm font-semibold text-primary">{quality}%</span>
                    </div>

                    <Slider
                        value={[quality]}
                        onValueChange={([v]) => onQualityChange(v)}
                        min={10}
                        max={100}
                        step={5}
                        className="w-full"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Smaller file</span>
                        <span>Better quality</span>
                    </div>

                    {/* Quick presets */}
                    <div className="flex gap-2 pt-2">
                        {[
                            { label: 'Low', value: 30 },
                            { label: 'Med', value: 50 },
                            { label: 'Recommended', value: 60 },
                            { label: 'Good', value: 80 },
                            { label: 'High', value: 90 },
                        ].map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => onQualityChange(preset.value)}
                                className={cn(
                                    'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all',
                                    quality === preset.value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Output Format */}
                <div className="space-y-4">
                    <label className="text-sm font-medium">Output Format</label>
                    <div className="grid grid-cols-2 gap-2">
                        {formatOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onFormatChange(option.value)}
                                className={cn(
                                    'rounded-lg border px-3 py-2.5 text-left transition-all',
                                    outputFormat === option.value
                                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                        : 'border-border hover:border-primary/50'
                                )}
                            >
                                <span className="block text-sm font-medium">{option.label}</span>
                                <span className="block text-xs text-muted-foreground">{option.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ImageCompressor() {
    const {
        images,
        quality,
        outputFormat,
        isProcessing,
        progress,
        handleFilesAdded,
        removeImage,
        clearAllImages,
        setQuality,
        setOutputFormat,
        updateImageEditState,
        compressAllImages,
        compressSingleImage,
        reset,
    } = useImageCompression();

    // Modal states
    const [editingImage, setEditingImage] = useState<CompressedImage | null>(null);
    const [previewingImage, setPreviewingImage] = useState<CompressedImage | null>(null);

    const completedCount = images.filter((img) => img.status === 'completed').length;
    const pendingCount = images.filter((img) => img.status === 'pending').length;
    const totalSavings = images
        .filter((img) => img.status === 'completed')
        .reduce((acc, img) => acc + (img.originalSize - img.compressedSize), 0);

    const handleDownloadAll = async () => {
        const completedImages = images.filter((img) => img.status === 'completed');
        if (completedImages.length > 0) {
            await downloadAllAsZip(completedImages, outputFormat);
        }
    };

    const handleEditSave = (updates: {
        cropData?: CropData;
        rotation: number;
        flipHorizontal: boolean;
        flipVertical: boolean;
    }) => {
        if (editingImage) {
            updateImageEditState(editingImage.id, updates);
            // Show toast to indicate edit was saved and image needs to be recompressed
            toast.success('Edits applied! Click "Compress" to apply changes.', {
                description: 'Your edits will be included in the compressed image.',
            });
        }
    };

    // Update the previewing image when the images array changes (e.g., after compression)
    useEffect(() => {
        if (previewingImage) {
            const updatedImage = images.find((img) => img.id === previewingImage.id);
            if (updatedImage && updatedImage !== previewingImage) {
                setPreviewingImage(updatedImage);
            }
        }
    }, [images, previewingImage]);

    // Update the editing image when the images array changes
    useEffect(() => {
        if (editingImage) {
            const updatedImage = images.find((img) => img.id === editingImage.id);
            if (updatedImage && updatedImage !== editingImage) {
                setEditingImage(updatedImage);
            }
        }
    }, [images, editingImage]);

    return (
        <GuestLayout>
            <Seo
                title="Compress Image Tools"
                description="Compress your images locally without uploading to any server. Adjust quality, crop, rotate, flip and convert between formats. 100% free and private."
            />

            {/* Ambient Background */}
            <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] h-[70vh] w-[70vh] rounded-full bg-blue-600/20 blur-[100px] opacity-20" />
                <div className="absolute top-[40%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-cyan-600/20 blur-[100px] opacity-20" />
            </div>

            {/* Header */}
            <section className="relative pt-24 pb-8">
                <Spotlight />
                <div className="container mx-auto px-4">
                    {/* Back Link */}
                    <Link
                        href="/tools"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tools
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <ImageLucide className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-bold md:text-3xl">
                                    Image Compressor
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Compress images locally • 100% private
                                </p>
                            </div>
                        </div>

                        {images.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={reset}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reset All
                                </Button>
                                {completedCount > 0 && (
                                    <Button onClick={handleDownloadAll}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download All ({completedCount})
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="pb-24 my-10">
                <div className="container mx-auto px-4 space-y-6">
                    {/* Compression Settings - Always Visible */}
                    <CompressionSettings
                        quality={quality}
                        onQualityChange={setQuality}
                        outputFormat={outputFormat}
                        onFormatChange={setOutputFormat}
                    />

                    {/* Drop Zone */}
                    <DropZone onFilesAdded={handleFilesAdded} />

                    {/* Stats & Actions - Only when images exist */}
                    {images.length > 0 && (
                        <>
                            {/* Stats Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                                <div className="flex items-center gap-6">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Images:</span>{' '}
                                        <span className="font-medium">{images.length}</span>
                                    </div>
                                    {pendingCount > 0 && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Ready to compress:</span>{' '}
                                            <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                                {pendingCount}
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Completed:</span>{' '}
                                        <span className="font-medium text-green-600 dark:text-green-400">
                                            {completedCount}
                                        </span>
                                    </div>
                                    {totalSavings > 0 && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Total Saved:</span>{' '}
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                                {formatFileSize(totalSavings)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllImages}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear All
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={compressAllImages}
                                        disabled={isProcessing || pendingCount === 0}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing ({progress}%)
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="mr-2 h-4 w-4" />
                                                {pendingCount > 0 ? `Compress All (${pendingCount})` : 'All Compressed'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Images Grid */}
                            <AnimatePresence mode="popLayout">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {images.map((image) => (
                                        <ImagePreviewCard
                                            key={image.id}
                                            image={image}
                                            onRemove={() => removeImage(image.id)}
                                            onEdit={() => setEditingImage(image)}
                                            onPreview={() => setPreviewingImage(image)}
                                            onCompress={() => compressSingleImage(image.id)}
                                            onDownload={() => downloadImage(image, outputFormat)}
                                        />
                                    ))}
                                </div>
                            </AnimatePresence>
                        </>
                    )}

                    {/* Feature Cards (shown when no images) */}
                    {images.length === 0 && (
                        <div className="grid gap-4 md:grid-cols-3 mt-4">
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium">Fast Compression</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Process images instantly in your browser without any uploads.
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Pencil className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium">Edit Before Export</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Crop, rotate, flip, and preview before downloading.
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium">100% Private</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your files never leave your device. Complete privacy guaranteed.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Image Editor Modal */}
            <ImageEditorModal
                image={editingImage}
                isOpen={!!editingImage}
                onClose={() => setEditingImage(null)}
                onSave={handleEditSave}
            />

            {/* Image Preview Modal */}
            <ImagePreviewModal
                image={previewingImage}
                isOpen={!!previewingImage}
                onClose={() => setPreviewingImage(null)}
                onDownload={previewingImage ? () => downloadImage(previewingImage, outputFormat) : undefined}
            />
        </GuestLayout>
    );
}
