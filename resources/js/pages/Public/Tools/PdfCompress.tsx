'use client';

import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight-new';
import GuestLayout from '@/layouts/guest-layout';
import type { CompressionLevel } from '@/lib/pdf-utils';
import { compressPdf, downloadBlob, formatFileSize } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Download, Eye, FileDown, FileText, Loader2, Shield, Upload, X, Zap } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export default function PdfCompress() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const [compressedData, setCompressedData] = useState<Uint8Array | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
    const [progress, setProgress] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    // Create blob URL for PDF preview (memoized so it doesn't recreate on every render)
    const previewUrl = useMemo(() => {
        if (!compressedData) return null;
        const blob = new Blob([compressedData as BlobPart], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    }, [compressedData]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const pdfFile = acceptedFiles[0];
        setFile(pdfFile);
        setFileName(pdfFile.name);
        setOriginalSize(pdfFile.size);
        setCompressedSize(null);
        setCompressedData(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    const handleCompress = async () => {
        if (!file) return;
        setIsProcessing(true);
        setProgress(0);

        try {
            const data = await compressPdf(file, compressionLevel, (p) => setProgress(p));
            setCompressedData(data);
            setCompressedSize(data.length);

            const savings = originalSize - data.length;
            if (savings > 0) {
                toast.success(`Compressed! Saved ${formatFileSize(savings)} (${((savings / originalSize) * 100).toFixed(1)}%)`);
            } else {
                toast.info('PDF is already optimized. Output may be similar or slightly larger.');
            }
        } catch (err) {
            toast.error('Failed to compress PDF.');
            console.error(err);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleDownload = () => {
        if (!compressedData) return;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        downloadBlob(compressedData, `compressed_${timestamp}.pdf`);
    };

    const reset = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setFileName('');
        setOriginalSize(0);
        setCompressedSize(null);
        setCompressedData(null);
        setShowPreview(false);
    };

    const savingsPercent = compressedSize !== null ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

    return (
        <GuestLayout>
            <Seo
                title="Free PDF Compressor – Reduce PDF File Size Online (No Upload)"
                description="Reduce PDF file size by removing metadata and optimizing document structure. Keep quality while shrinking file size. 100% free, private — all processing happens locally in your browser."
                url="/tools/pdf-compress"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'PDF Compressor',
                        description:
                            'Reduce PDF file size by removing metadata and optimizing document structure — all processing happens locally in your browser.',
                        url: 'https://aryagading.com/tools/pdf-compress',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Any (Browser-based)',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                        featureList: 'PDF compression, Metadata removal, File size reduction, Quality preservation',
                        browserRequirements: 'Requires a modern web browser with JavaScript enabled',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aryagading.com' },
                            { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aryagading.com/tools' },
                            { '@type': 'ListItem', position: 3, name: 'PDF Compress', item: 'https://aryagading.com/tools/pdf-compress' },
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
                                <FileDown className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-bold md:text-3xl">PDF Compress</h1>
                                <p className="text-sm text-muted-foreground">Reduce PDF file size • 100% private</p>
                            </div>
                        </div>

                        {file && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={reset}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    New File
                                </Button>
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
                                    <h3 className="font-medium">Smart Compression</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Re-renders pages as optimized images for dramatic size reduction.
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        <FileDown className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium">Instant Results</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">See the compressed size compared to the original right away.</p>
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
                    ) : (
                        <>
                            {/* File Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-border bg-card p-8"
                            >
                                <div className="flex flex-col items-center space-y-6 text-center">
                                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <FileText className="h-10 w-10" />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">{fileName}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">Original size: {formatFileSize(originalSize)}</p>
                                    </div>

                                    {/* Compression Level Selector */}
                                    {compressedSize === null && (
                                        <div className="w-full max-w-md space-y-3">
                                            <label className="text-sm font-medium">Compression Level</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { value: 'low' as CompressionLevel, label: 'Low', desc: 'Best quality, larger file' },
                                                    { value: 'medium' as CompressionLevel, label: 'Medium', desc: 'Balanced quality & size' },
                                                    { value: 'high' as CompressionLevel, label: 'High', desc: 'Smallest file, lower quality' },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setCompressionLevel(opt.value)}
                                                        className={cn(
                                                            'rounded-lg border px-3 py-3 text-left transition-all',
                                                            compressionLevel === opt.value
                                                                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                                : 'border-border hover:border-primary/50',
                                                        )}
                                                    >
                                                        <span className="block text-sm font-medium">{opt.label}</span>
                                                        <span className="mt-0.5 block text-xs text-muted-foreground">{opt.desc}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {compressedSize === null ? (
                                        <div className="w-full max-w-xs space-y-3">
                                            <Button size="lg" className="w-full" onClick={handleCompress} disabled={isProcessing}>
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Compressing... {Math.round(progress * 100)}%
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileDown className="mr-2 h-5 w-5" />
                                                        Compress PDF
                                                    </>
                                                )}
                                            </Button>
                                            {isProcessing && (
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <motion.div
                                                        className="h-full rounded-full bg-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.round(progress * 100)}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-md space-y-6">
                                            {/* Results */}
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-xs tracking-wider text-muted-foreground uppercase">Original</p>
                                                    <p className="text-lg font-semibold">{formatFileSize(originalSize)}</p>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                                <div className="text-center">
                                                    <p className="text-xs tracking-wider text-muted-foreground uppercase">Compressed</p>
                                                    <p className="text-lg font-semibold text-primary">{formatFileSize(compressedSize)}</p>
                                                </div>
                                            </div>

                                            {/* Savings badge */}
                                            <div className="flex justify-center">
                                                {savingsPercent > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                        <Check className="h-4 w-4" />
                                                        Saved {savingsPercent.toFixed(1)}% ({formatFileSize(originalSize - compressedSize)})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                                                        PDF is already well-optimized
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-center gap-3">
                                                <Button variant="outline" onClick={handleCompress} disabled={isProcessing}>
                                                    {isProcessing ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <FileDown className="mr-2 h-4 w-4" />
                                                    )}
                                                    Re-compress
                                                </Button>
                                                <Button variant="outline" onClick={() => setShowPreview(true)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Preview
                                                </Button>
                                                <Button onClick={handleDownload}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={() => setShowPreview(false)}
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
                                    <span className="text-sm font-medium">PDF Preview</span>
                                    <span className="text-xs text-muted-foreground">— {formatFileSize(compressedData!.byteLength)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={handleDownload}>
                                        <Download className="mr-1.5 h-3.5 w-3.5" />
                                        Download
                                    </Button>
                                    <button onClick={() => setShowPreview(false)} className="rounded-lg p-1.5 transition-colors hover:bg-muted">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <iframe src={previewUrl} className="h-[calc(85vh-3.25rem)] w-full" title="Compressed PDF Preview" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
