'use client';

import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight-new';
import GuestLayout from '@/layouts/guest-layout';
import { downloadBlob, formatFileSize, getPdfPages, rotatePdfPages } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';
import type { PdfPage } from '@/types/pdf-tools';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Download, Eye, FileText, Loader2, RotateCcw, RotateCw, Shield, Upload, X, Zap } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export default function PdfRotate() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(0);
    const [pages, setPages] = useState<PdfPage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rotatedData, setRotatedData] = useState<Uint8Array | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const previewUrl = useMemo(() => {
        if (!rotatedData) return null;
        const blob = new Blob([rotatedData as BlobPart], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    }, [rotatedData]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const pdfFile = acceptedFiles[0];
        setFile(pdfFile);
        setFileName(pdfFile.name);
        setFileSize(pdfFile.size);
        setIsLoading(true);

        try {
            const pdfPages = await getPdfPages(pdfFile, 0.3);
            setPages(pdfPages);
        } catch {
            toast.error('Failed to read PDF file.');
            setFile(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    const rotatePage = (pageNumber: number, angle: number) => {
        setPages((prev) => prev.map((p) => (p.pageNumber === pageNumber ? { ...p, rotation: (((p.rotation + angle) % 360) + 360) % 360 } : p)));
    };

    const rotateAll = (angle: number) => {
        setPages((prev) => prev.map((p) => ({ ...p, rotation: (((p.rotation + angle) % 360) + 360) % 360 })));
    };

    const resetRotations = () => {
        setPages((prev) => prev.map((p) => ({ ...p, rotation: 0 })));
    };

    const hasRotations = pages.some((p) => p.rotation !== 0);

    const handleSave = async () => {
        if (!file || !hasRotations) return;
        setIsProcessing(true);
        setRotatedData(null);

        try {
            const rotations = pages.filter((p) => p.rotation !== 0).map((p) => ({ pageIndex: p.pageNumber - 1, rotation: p.rotation }));

            const pdfData = await rotatePdfPages(file, rotations);
            setRotatedData(pdfData);
            toast.success('PDF rotated! Preview or download below.');
        } catch (err) {
            toast.error('Failed to rotate PDF.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!rotatedData) return;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        downloadBlob(rotatedData, `rotated_${timestamp}.pdf`);
        toast.success('Rotated PDF downloaded!');
    };

    const reset = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setFileName('');
        setFileSize(0);
        setPages([]);
        setRotatedData(null);
        setShowPreview(false);
    };

    return (
        <GuestLayout>
            <Seo
                title="Free PDF Rotator – Rotate PDF Pages Online (No Upload)"
                description="Rotate individual or all pages of a PDF by 90°, 180°, or 270°. Preview changes instantly before downloading. 100% free, private — all processing happens locally in your browser."
                url="/tools/pdf-rotate"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'PDF Rotator',
                        description:
                            'Rotate individual or all pages of a PDF by 90°, 180°, or 270°. Preview changes instantly — all processing happens locally in your browser.',
                        url: 'https://aryagading.com/tools/pdf-rotate',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Any (Browser-based)',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                        featureList: 'Rotate PDF pages, 90° 180° 270° rotation, Individual page rotation, Instant preview',
                        browserRequirements: 'Requires a modern web browser with JavaScript enabled',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aryagading.com' },
                            { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aryagading.com/tools' },
                            { '@type': 'ListItem', position: 3, name: 'PDF Rotate', item: 'https://aryagading.com/tools/pdf-rotate' },
                        ],
                    },
                ]}
            />

            <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden dark:block">
                <div className="absolute -top-[20%] -right-[10%] h-[70vh] w-[70vh] rounded-full bg-red-600/20 opacity-20 blur-[100px]" />
                <div className="absolute top-[40%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-rose-600/20 opacity-20 blur-[100px]" />
            </div>

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
                                <RotateCw className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-bold md:text-3xl">PDF Rotate</h1>
                                <p className="text-sm text-muted-foreground">Rotate PDF pages • 100% private</p>
                            </div>
                        </div>

                        {file && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={reset}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    New File
                                </Button>
                                {hasRotations && (
                                    <Button onClick={handleSave} disabled={isProcessing}>
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4" />
                                                Save & Download
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="my-10 pb-24">
                <div className="container mx-auto space-y-6 px-4">
                    {!file ? (
                        <>
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
                                            {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF file here'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">or click to select a file • PDF only</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium">Individual or Batch</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Rotate individual pages or all pages at once with a single click.
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        <Eye className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium">Visual Preview</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">See page thumbnails with rotation applied before saving.</p>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium">100% Private</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Your files never leave your device. Complete privacy guaranteed.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading PDF pages...</p>
                        </div>
                    ) : (
                        <>
                            {/* Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                                <div className="flex items-center gap-4">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{fileName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {pages.length} pages • {formatFileSize(fileSize)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => rotateAll(90)}>
                                        <RotateCw className="mr-2 h-4 w-4" />
                                        Rotate All 90°
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => rotateAll(-90)}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Rotate All -90°
                                    </Button>
                                    {hasRotations && (
                                        <Button variant="outline" size="sm" onClick={resetRotations}>
                                            Reset All
                                        </Button>
                                    )}
                                    <Button size="sm" onClick={handleSave} disabled={isProcessing || !hasRotations}>
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4" />
                                                Save & Download
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Pages Grid */}
                            <AnimatePresence mode="popLayout">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {pages.map((page) => (
                                        <motion.div
                                            key={page.pageNumber}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group relative overflow-hidden rounded-xl border border-border bg-card"
                                        >
                                            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-muted">
                                                {page.thumbnail && (
                                                    <img
                                                        src={page.thumbnail}
                                                        alt={`Page ${page.pageNumber}`}
                                                        className="max-h-full max-w-full object-contain transition-transform duration-300"
                                                        style={{ transform: `rotate(${page.rotation}deg)` }}
                                                    />
                                                )}

                                                {page.rotation !== 0 && (
                                                    <div className="absolute top-1 right-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                                        {page.rotation}°
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 p-2">
                                                <p className="text-center text-xs font-medium">Page {page.pageNumber}</p>
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => rotatePage(page.pageNumber, -90)}
                                                        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                        title="Rotate -90°"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => rotatePage(page.pageNumber, 90)}
                                                        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                        title="Rotate 90°"
                                                    >
                                                        <RotateCw className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => rotatePage(page.pageNumber, 180)}
                                                        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                        title="Rotate 180°"
                                                    >
                                                        <RotateCw className="h-3.5 w-3.5" />
                                                        <span className="sr-only">180°</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>

                            {/* Rotated Result */}
                            {rotatedData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6"
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-green-500/10 p-2.5">
                                            <RotateCw className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-green-700 dark:text-green-300">Rotated PDF Ready</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(rotatedData.byteLength)} • {pages.length} page{pages.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setShowPreview(true)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview
                                        </Button>
                                        <Button onClick={handleDownload}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* PDF Preview Modal */}
            <AnimatePresence>
                {showPreview && previewUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b px-6 py-4">
                                <h3 className="font-semibold">PDF Preview — Rotated</h3>
                                <div className="flex items-center gap-3">
                                    <Button size="sm" onClick={handleDownload}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                    <button onClick={() => setShowPreview(false)} className="rounded-lg p-1 hover:bg-accent">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <iframe src={previewUrl} className="w-full flex-1" title="PDF Preview" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
