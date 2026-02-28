'use client';

import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Spotlight } from '@/components/ui/spotlight-new';
import GuestLayout from '@/layouts/guest-layout';
import { compressPdf, downloadBlob, formatFileSize, generateId, getImageDimensions, imagesToPdf, readFileAsDataURL } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';
import type { ImageFile, PageOrientation, PageSize } from '@/types/pdf-tools';
import { PAGE_SIZES } from '@/types/pdf-tools';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    FileImage,
    GripVertical,
    Loader2,
    Minimize2,
    Settings2,
    Shield,
    Trash2,
    Upload,
    X,
    Zap,
    ZoomIn,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

/**
 * Convert a HEIC/HEIF file to JPEG using heic2any
 */
async function convertHeicToJpeg(file: File): Promise<File> {
    const heic2any = (await import('heic2any')).default;
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    const resultBlob = Array.isArray(blob) ? blob[0] : blob;
    const newName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
    return new File([resultBlob], newName, { type: 'image/jpeg' });
}

/**
 * Compress an image by re-drawing on canvas at reduced quality
 */
async function compressImage(file: File, maxWidth: number, quality: number): Promise<{ file: File; preview: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width;
            let h = img.height;

            // Downscale if wider than maxWidth
            if (maxWidth > 0 && w > maxWidth) {
                const ratio = maxWidth / w;
                w = maxWidth;
                h = Math.round(h * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, w, h);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('Compression failed'));
                    const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                    const preview = canvas.toDataURL('image/jpeg', quality);
                    resolve({ file: compressedFile, preview, width: w, height: h });
                },
                'image/jpeg',
                quality,
            );
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(file);
    });
}

export default function JpgToPdf() {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pageSize, setPageSize] = useState<PageSize>('a4');
    const [orientation, setOrientation] = useState<PageOrientation>('auto');
    const [margin, setMargin] = useState(20);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Image compression settings
    const [compressImages, setCompressImages] = useState(false);
    const [imageQuality, setImageQuality] = useState(75);
    const [maxImageWidth, setMaxImageWidth] = useState(1920);

    // PDF compression after convert
    const [compressPdfAfter, setCompressPdfAfter] = useState(false);
    const [pdfResult, setPdfResult] = useState<{ original: Uint8Array; compressed: Uint8Array | null } | null>(null);

    // Preview modal state
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [pdfPreviewTarget, setPdfPreviewTarget] = useState<'original' | 'compressed'>('original');

    // Create blob URL for PDF preview
    const pdfPreviewUrl = useMemo(() => {
        if (!pdfResult) return null;
        const data = pdfPreviewTarget === 'compressed' && pdfResult.compressed ? pdfResult.compressed : pdfResult.original;
        const blob = new Blob([data as BlobPart], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    }, [pdfResult, pdfPreviewTarget]);

    const isHeic = (file: File) => {
        return /\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif';
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newImages: ImageFile[] = [];
        for (let file of acceptedFiles) {
            try {
                // Auto-convert HEIC to JPEG
                if (isHeic(file)) {
                    toast.info(`Converting ${file.name} from HEIC...`);
                    file = await convertHeicToJpeg(file);
                    toast.success(`Converted to ${file.name}`);
                }

                const dims = await getImageDimensions(file);
                const preview = await readFileAsDataURL(file);
                newImages.push({
                    id: generateId(),
                    file,
                    name: file.name,
                    size: file.size,
                    preview,
                    width: dims.width,
                    height: dims.height,
                });
            } catch {
                toast.error(`Failed to load ${file.name}`);
            }
        }
        setImages((prev) => [...prev, ...newImages]);
        setPdfResult(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp'],
            'image/heic': ['.heic'],
            'image/heif': ['.heif'],
        },
        multiple: true,
    });

    const removeImage = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setPdfResult(null);
    };

    const clearAll = () => {
        setImages([]);
        if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
        setPdfResult(null);
        setShowPdfPreview(false);
    };

    const moveImage = (from: number, to: number) => {
        setImages((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            return updated;
        });
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            moveImage(draggedIndex, index);
            setDraggedIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleConvert = async () => {
        if (images.length === 0) return;
        setIsProcessing(true);
        setPdfResult(null);

        try {
            // Optionally compress images first
            let processedImages = images.map((img) => ({ file: img.file, width: img.width, height: img.height }));

            if (compressImages) {
                toast.info('Compressing images...');
                const compressed: typeof processedImages = [];
                for (const img of images) {
                    const result = await compressImage(img.file, maxImageWidth, imageQuality / 100);
                    compressed.push({ file: result.file, width: result.width, height: result.height });
                }
                processedImages = compressed;
            }

            const sizeOption = PAGE_SIZES.find((s) => s.value === pageSize)!;
            const fitToPage = pageSize === 'fit';

            const pdfData = await imagesToPdf(
                processedImages,
                sizeOption.width || 595.28,
                sizeOption.height || 841.89,
                orientation,
                margin,
                fitToPage,
            );

            // Optionally compress the resulting PDF
            let compressedData: Uint8Array | null = null;
            if (compressPdfAfter) {
                toast.info('Compressing PDF...');
                const pdfBlob = new Blob([pdfData as BlobPart], { type: 'application/pdf' });
                const pdfFile = new File([pdfBlob], 'converted.pdf', { type: 'application/pdf' });
                compressedData = await compressPdf(pdfFile);
            }

            setPdfResult({ original: pdfData, compressed: compressedData });
            toast.success('PDF created! Choose a download option below.');
        } catch (err) {
            toast.error('Failed to create PDF. Please try again.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = (compressed: boolean) => {
        if (!pdfResult) return;
        const data = compressed && pdfResult.compressed ? pdfResult.compressed : pdfResult.original;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const suffix = compressed ? 'compressed' : 'converted';
        downloadBlob(data, `${suffix}_${timestamp}.pdf`);
        toast.success('PDF downloaded!');
    };

    const openPdfPreview = (target: 'original' | 'compressed') => {
        setPdfPreviewTarget(target);
        setShowPdfPreview(true);
    };

    return (
        <GuestLayout>
            <Seo
                title="Free JPG to PDF Converter – Convert Images to PDF Online (No Upload)"
                description="Convert JPG, PNG, and other images into a PDF document. Arrange pages, set custom page size and orientation. 100% free, private — all processing happens locally in your browser."
                url="/tools/jpg-to-pdf"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'JPG to PDF Converter',
                        description:
                            'Convert JPG, PNG, and other images into a PDF document. Arrange pages, set size and orientation — all processing happens locally in your browser.',
                        url: 'https://aryagading.com/tools/jpg-to-pdf',
                        applicationCategory: 'MultimediaApplication',
                        operatingSystem: 'Any (Browser-based)',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                        featureList: 'JPG to PDF, PNG to PDF, Image arrangement, Custom page size, Landscape/Portrait orientation',
                        browserRequirements: 'Requires a modern web browser with JavaScript enabled',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aryagading.com' },
                            { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aryagading.com/tools' },
                            { '@type': 'ListItem', position: 3, name: 'JPG to PDF', item: 'https://aryagading.com/tools/jpg-to-pdf' },
                        ],
                    },
                ]}
            />

            {/* Ambient Background */}
            <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden dark:block">
                <div className="absolute -top-[20%] -right-[10%] h-[70vh] w-[70vh] rounded-full bg-red-600/20 opacity-20 blur-[100px]" />
                <div className="absolute top-[40%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-rose-600/20 opacity-20 blur-[100px]" />
            </div>

            {/* Header */}
            <section className="relative pt-24 pb-8">
                <Spotlight />
                <div className="container mx-auto px-4">
                    <Link
                        href="/tools"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tools
                    </Link>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <FileImage className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-bold md:text-3xl">JPG to PDF</h1>
                                <p className="text-sm text-muted-foreground">Convert images to PDF • 100% private</p>
                            </div>
                        </div>

                        {images.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={clearAll}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear All
                                </Button>
                                <Button onClick={handleConvert} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Converting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Convert to PDF
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="my-10 pb-24">
                <div className="container mx-auto space-y-6 px-4">
                    {/* Settings */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-2.5">
                                <Settings2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">PDF Settings</h3>
                                <p className="text-sm text-muted-foreground">Configure page size and layout</p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Page Size */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Page Size</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PAGE_SIZES.map((size) => (
                                        <button
                                            key={size.value}
                                            onClick={() => setPageSize(size.value)}
                                            className={cn(
                                                'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                                                pageSize === size.value
                                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                    : 'border-border hover:border-primary/50',
                                            )}
                                        >
                                            {size.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orientation */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Orientation</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['auto', 'portrait', 'landscape'] as PageOrientation[]).map((o) => (
                                        <button
                                            key={o}
                                            onClick={() => setOrientation(o)}
                                            className={cn(
                                                'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all',
                                                orientation === o
                                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                    : 'border-border hover:border-primary/50',
                                            )}
                                        >
                                            {o}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Margin */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Margin</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'None', value: 0 },
                                        { label: 'Small', value: 20 },
                                        { label: 'Large', value: 40 },
                                    ].map((m) => (
                                        <button
                                            key={m.value}
                                            onClick={() => setMargin(m.value)}
                                            className={cn(
                                                'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                                                margin === m.value
                                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                    : 'border-border hover:border-primary/50',
                                            )}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Image Compression & PDF Compression Options */}
                        <div className="mt-6 grid gap-6 border-t border-border pt-6 md:grid-cols-2">
                            {/* Image Compression Toggle */}
                            <div className="space-y-4">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={compressImages}
                                        onChange={(e) => setCompressImages(e.target.checked)}
                                        className="h-4 w-4 rounded border-border accent-primary"
                                    />
                                    <div>
                                        <span className="text-sm font-medium">Compress Images</span>
                                        <p className="text-xs text-muted-foreground">Reduce image size before embedding in PDF</p>
                                    </div>
                                </label>

                                {compressImages && (
                                    <div className="space-y-4 pl-7">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">Quality</span>
                                                <span className="text-xs font-semibold text-primary">{imageQuality}%</span>
                                            </div>
                                            <Slider
                                                value={[imageQuality]}
                                                onValueChange={([v]) => setImageQuality(v)}
                                                min={20}
                                                max={100}
                                                step={5}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">Max Width</span>
                                                <span className="text-xs font-semibold text-primary">{maxImageWidth}px</span>
                                            </div>
                                            <Slider
                                                value={[maxImageWidth]}
                                                onValueChange={([v]) => setMaxImageWidth(v)}
                                                min={640}
                                                max={4096}
                                                step={320}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PDF Compression Toggle */}
                            <div className="space-y-4">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={compressPdfAfter}
                                        onChange={(e) => setCompressPdfAfter(e.target.checked)}
                                        className="h-4 w-4 rounded border-border accent-primary"
                                    />
                                    <div>
                                        <span className="text-sm font-medium">Compress PDF After Conversion</span>
                                        <p className="text-xs text-muted-foreground">Optimize PDF file size after creation</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Drop Zone */}
                    <div
                        {...getRootProps()}
                        className={cn(
                            'group relative flex min-h-[14rem] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300',
                            isDragActive
                                ? 'scale-[1.02] border-primary bg-primary/10'
                                : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5',
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-4 px-6 text-center">
                            <motion.div
                                animate={{ scale: isDragActive ? 1.1 : 1, rotate: isDragActive ? 5 : 0 }}
                                className="rounded-2xl bg-primary/10 p-4 transition-colors group-hover:bg-primary/20"
                            >
                                <Upload className="h-8 w-8 text-primary" />
                            </motion.div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {isDragActive ? 'Drop your images here' : 'Drag & drop images here'}
                                </h3>
                                <p className="text-sm text-muted-foreground">or click to select files • JPG, PNG, WebP, BMP, HEIC</p>
                            </div>
                        </div>
                    </div>

                    {/* Images List */}
                    {images.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {images.length} image{images.length !== 1 ? 's' : ''} • Drag to reorder
                                </p>
                                <Button onClick={handleConvert} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Converting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Convert to PDF
                                        </>
                                    )}
                                </Button>
                            </div>

                            <AnimatePresence mode="popLayout">
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {images.map((img, index) => (
                                        <motion.div
                                            key={img.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, index)}
                                            onDragEnd={handleDragEnd}
                                            className={cn(
                                                'group relative cursor-grab overflow-hidden rounded-xl border border-border bg-card active:cursor-grabbing',
                                                draggedIndex === index && 'opacity-50',
                                            )}
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                                <img src={img.preview} alt={img.name} className="h-full w-full object-contain" />
                                                <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                                                    {index + 1}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewIndex(index);
                                                    }}
                                                    className="absolute bottom-2 left-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                                                    title="Preview image"
                                                >
                                                    <ZoomIn className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeImage(img.id)}
                                                    className="absolute top-2 right-2 rounded-full bg-red-500/90 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                                <div className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <GripVertical className="h-5 w-5 text-white drop-shadow-md" />
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <p className="truncate text-xs font-medium">{img.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {img.width}×{img.height} • {formatFileSize(img.size)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        </div>
                    )}

                    {/* PDF Result / Download Section */}
                    {pdfResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-xl bg-green-500/10 p-2.5">
                                    <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700 dark:text-green-300">PDF Ready</h3>
                                    <p className="text-sm text-muted-foreground">Your PDF has been generated successfully</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-border bg-card p-4">
                                    <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">Original</p>
                                    <p className="text-lg font-bold">{formatFileSize(pdfResult.original.byteLength)}</p>
                                    <div className="mt-3 flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => openPdfPreview('original')}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview
                                        </Button>
                                        <Button className="flex-1" onClick={() => handleDownload(false)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                </div>

                                {pdfResult.compressed && (
                                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                                        <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">Compressed</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-lg font-bold">{formatFileSize(pdfResult.compressed.byteLength)}</p>
                                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                {Math.round((1 - pdfResult.compressed.byteLength / pdfResult.original.byteLength) * 100)}% smaller
                                            </span>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <Button variant="outline" className="flex-1" onClick={() => openPdfPreview('compressed')}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview
                                            </Button>
                                            <Button className="flex-1" variant="outline" onClick={() => handleDownload(true)}>
                                                <Minimize2 className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Feature Cards */}
                    {images.length === 0 && (
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium">Instant Conversion</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Convert images to PDF instantly in your browser.</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Settings2 className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium">Customizable Layout</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Choose page size, orientation, and margins.</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium">100% Private</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Your files never leave your device. Complete privacy guaranteed.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* PDF Preview Modal */}
            <AnimatePresence>
                {showPdfPreview && pdfPreviewUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={() => setShowPdfPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl bg-card shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">
                                        PDF Preview ({pdfPreviewTarget === 'compressed' ? 'Compressed' : 'Original'})
                                    </span>
                                    {pdfResult && (
                                        <span className="text-xs text-muted-foreground">
                                            —{' '}
                                            {formatFileSize(
                                                pdfPreviewTarget === 'compressed' && pdfResult.compressed
                                                    ? pdfResult.compressed.byteLength
                                                    : pdfResult.original.byteLength,
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={() => handleDownload(pdfPreviewTarget === 'compressed')}>
                                        <Download className="mr-1.5 h-3.5 w-3.5" />
                                        Download
                                    </Button>
                                    <button onClick={() => setShowPdfPreview(false)} className="rounded-lg p-1.5 transition-colors hover:bg-muted">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <iframe src={pdfPreviewUrl} className="h-[calc(85vh-3.25rem)] w-full" title="PDF Preview" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewIndex !== null && images[previewIndex] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={() => setPreviewIndex(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-h-[90vh] max-w-[90vw]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={images[previewIndex].preview}
                                alt={images[previewIndex].name}
                                className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
                            />
                            <div className="absolute -bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-3">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    disabled={previewIndex === 0}
                                    onClick={() => setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="min-w-[5rem] text-center text-sm font-medium text-white">
                                    {previewIndex + 1} / {images.length}
                                </span>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    disabled={previewIndex === images.length - 1}
                                    onClick={() => setPreviewIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev))}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <button
                                onClick={() => setPreviewIndex(null)}
                                className="absolute -top-3 -right-3 rounded-full bg-white/90 p-2 text-black shadow-lg transition-colors hover:bg-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-3 py-1.5">
                                <p className="text-xs font-medium text-white">{images[previewIndex].name}</p>
                                <p className="text-xs text-white/70">
                                    {images[previewIndex].width}×{images[previewIndex].height} • {formatFileSize(images[previewIndex].size)}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
