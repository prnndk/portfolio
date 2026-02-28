'use client';

import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight-new';
import GuestLayout from '@/layouts/guest-layout';
import { downloadAsZip, downloadBlob, formatFileSize, getPdfPages, splitPdf, splitPdfToIndividual } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';
import type { PdfPage } from '@/types/pdf-tools';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Download, Eye, FileText, Loader2, Package, Scissors, Shield, Upload, X, Zap } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export default function PdfSplit() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(0);
    const [pages, setPages] = useState<PdfPage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<Uint8Array | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const previewUrl = useMemo(() => {
        if (!extractedData) return null;
        const blob = new Blob([extractedData as BlobPart], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    }, [extractedData]);

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

    const togglePage = (pageNumber: number) => {
        setPages((prev) => prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p)));
    };

    const selectAll = () => setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
    const deselectAll = () => setPages((prev) => prev.map((p) => ({ ...p, selected: false })));

    const selectedCount = pages.filter((p) => p.selected).length;

    const handleExtractSelected = async () => {
        if (!file || selectedCount === 0) return;
        setIsProcessing(true);
        setExtractedData(null);

        try {
            const selectedPages = pages.filter((p) => p.selected).map((p) => p.pageNumber);
            const pdfData = await splitPdf(file, selectedPages);
            setExtractedData(pdfData);
            toast.success(`${selectedCount} page${selectedCount !== 1 ? 's' : ''} extracted! Preview or download below.`);
        } catch (err) {
            toast.error('Failed to extract pages.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadExtracted = () => {
        if (!extractedData) return;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        downloadBlob(extractedData, `extracted_${timestamp}.pdf`);
        toast.success('PDF downloaded!');
    };

    const handleSplitAll = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const results = await splitPdfToIndividual(file);
            await downloadAsZip(
                results.map((r) => ({ name: r.name, data: r.data })),
                `${fileName.replace(/\.pdf$/i, '')}_split.zip`,
            );
            toast.success('All pages split and downloaded as ZIP!');
        } catch (err) {
            toast.error('Failed to split PDF.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setFileName('');
        setFileSize(0);
        setPages([]);
        setExtractedData(null);
        setShowPreview(false);
    };

    return (
        <GuestLayout>
            <Seo
                title="Free PDF Splitter – Split & Extract PDF Pages Online (No Upload)"
                description="Extract specific pages or split a PDF into multiple smaller files. Select exactly the pages you need. 100% free, private — all processing happens locally in your browser."
                url="/tools/pdf-split"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'PDF Splitter',
                        description:
                            'Extract specific pages or split a PDF into multiple files. Select the pages you need — all processing happens locally in your browser.',
                        url: 'https://aryagading.com/tools/pdf-split',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Any (Browser-based)',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                        featureList: 'Split PDF, Extract pages, Page selection, Multi-file output',
                        browserRequirements: 'Requires a modern web browser with JavaScript enabled',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aryagading.com' },
                            { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aryagading.com/tools' },
                            { '@type': 'ListItem', position: 3, name: 'PDF Split', item: 'https://aryagading.com/tools/pdf-split' },
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
                                <Scissors className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-bold md:text-3xl">PDF Split</h1>
                                <p className="text-sm text-muted-foreground">Extract pages from PDF • 100% private</p>
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
                                            {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF file here'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">or click to select a file • PDF only</p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Cards */}
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium">Visual Page Selection</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        See thumbnails of every page and select exactly which ones to extract.
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium">Split All Pages</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Split into individual single-page PDF files, downloaded as ZIP.
                                    </p>
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
                            {/* File Info & Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                                <div className="flex items-center gap-4">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{fileName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {pages.length} pages • {formatFileSize(fileSize)} •{' '}
                                            <span className="font-medium text-primary">{selectedCount} selected</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={selectAll}>
                                        Select All
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={deselectAll}>
                                        Deselect All
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleSplitAll} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                                        Split All Pages
                                    </Button>
                                    <Button size="sm" onClick={handleExtractSelected} disabled={isProcessing || selectedCount === 0}>
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4" />
                                                Extract Selected ({selectedCount})
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Pages Grid */}
                            <AnimatePresence mode="popLayout">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {pages.map((page) => (
                                        <motion.div
                                            key={page.pageNumber}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={cn(
                                                'group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200',
                                                page.selected
                                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                    : 'border-border bg-card hover:border-primary/50',
                                            )}
                                            onClick={() => togglePage(page.pageNumber)}
                                        >
                                            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                                {page.thumbnail && (
                                                    <img
                                                        src={page.thumbnail}
                                                        alt={`Page ${page.pageNumber}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )}

                                                {/* Selection overlay */}
                                                {page.selected && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                                                        <div className="rounded-full bg-primary p-1.5">
                                                            <Check className="h-4 w-4 text-primary-foreground" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-2 text-center">
                                                <p className="text-xs font-medium">Page {page.pageNumber}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>

                            {/* Extracted Result */}
                            {extractedData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6"
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-green-500/10 p-2.5">
                                            <Scissors className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-green-700 dark:text-green-300">Extracted PDF Ready</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(extractedData.byteLength)} • {selectedCount} page{selectedCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setShowPreview(true)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview
                                        </Button>
                                        <Button onClick={handleDownloadExtracted}>
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
                                <h3 className="font-semibold">PDF Preview — Extracted Pages</h3>
                                <div className="flex items-center gap-3">
                                    <Button size="sm" onClick={handleDownloadExtracted}>
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
