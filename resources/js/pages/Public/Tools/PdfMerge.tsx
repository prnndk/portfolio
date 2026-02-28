'use client';

import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight-new';
import GuestLayout from '@/layouts/guest-layout';
import { createPdfFile, downloadBlob, formatFileSize, mergePdfs } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';
import type { PdfFile } from '@/types/pdf-tools';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Download, Eye, FileText, GripVertical, Loader2, Merge, Shield, Trash2, Upload, X, Zap } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export default function PdfMerge() {
    const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [mergedData, setMergedData] = useState<Uint8Array | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const previewUrl = useMemo(() => {
        if (!mergedData) return null;
        const blob = new Blob([mergedData as BlobPart], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    }, [mergedData]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newFiles: PdfFile[] = [];
        for (const file of acceptedFiles) {
            const pdfFile = await createPdfFile(file);
            newFiles.push(pdfFile);
        }
        setPdfFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: true,
    });

    const removeFile = (id: string) => {
        setPdfFiles((prev) => prev.filter((f) => f.id !== id));
        setMergedData(null);
    };

    const clearAll = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPdfFiles([]);
        setMergedData(null);
        setShowPreview(false);
    };

    const moveFile = (from: number, to: number) => {
        setPdfFiles((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            return updated;
        });
    };

    const handleDragStart = (index: number) => setDraggedIndex(index);

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            moveFile(draggedIndex, index);
            setDraggedIndex(index);
        }
    };

    const handleDragEnd = () => setDraggedIndex(null);

    const handleMerge = async () => {
        const readyFiles = pdfFiles.filter((f) => f.status === 'ready');
        if (readyFiles.length < 2) {
            toast.error('Please add at least 2 PDF files to merge.');
            return;
        }
        setIsProcessing(true);
        setMergedData(null);

        try {
            const pdfData = await mergePdfs(readyFiles.map((f) => f.file));
            setMergedData(pdfData);
            toast.success('PDFs merged! Preview or download below.');
        } catch (err) {
            toast.error('Failed to merge PDFs. Please try again.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!mergedData) return;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        downloadBlob(mergedData, `merged_${timestamp}.pdf`);
        toast.success('PDF downloaded!');
    };

    const totalPages = pdfFiles.filter((f) => f.status === 'ready').reduce((sum, f) => sum + f.pageCount, 0);

    return (
        <GuestLayout>
            <Seo
                title="Free PDF Merge – Combine Multiple PDFs Online (No Upload)"
                description="Combine multiple PDF files into a single document. Drag and drop to reorder pages before merging. 100% free, private — all processing happens locally in your browser."
                url="/tools/pdf-merge"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'PDF Merge',
                        description:
                            'Combine multiple PDF files into a single document. Drag to reorder pages before merging — all processing happens locally in your browser.',
                        url: 'https://aryagading.com/tools/pdf-merge',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Any (Browser-based)',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                        featureList: 'Merge PDFs, Drag-and-drop reorder, Multi-file support, Instant download',
                        browserRequirements: 'Requires a modern web browser with JavaScript enabled',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aryagading.com' },
                            { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aryagading.com/tools' },
                            { '@type': 'ListItem', position: 3, name: 'PDF Merge', item: 'https://aryagading.com/tools/pdf-merge' },
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
                                <Merge className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-bold md:text-3xl">PDF Merge</h1>
                                <p className="text-sm text-muted-foreground">Combine PDFs into one • 100% private</p>
                            </div>
                        </div>

                        {pdfFiles.length >= 2 && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={clearAll}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear All
                                </Button>
                                <Button onClick={handleMerge} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Merging...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Merge & Download
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="my-10 pb-24">
                <div className="container mx-auto space-y-6 px-4">
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
                                    {isDragActive ? 'Drop your PDFs here' : 'Drag & drop PDF files here'}
                                </h3>
                                <p className="text-sm text-muted-foreground">or click to select files • PDF only</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    {pdfFiles.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center gap-6">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Files:</span> <span className="font-medium">{pdfFiles.length}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Total pages:</span> <span className="font-medium">{totalPages}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Total size:</span>{' '}
                                    <span className="font-medium">{formatFileSize(pdfFiles.reduce((s, f) => s + f.size, 0))}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={clearAll}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear All
                                </Button>
                                <Button size="sm" onClick={handleMerge} disabled={isProcessing || pdfFiles.length < 2}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Merging...
                                        </>
                                    ) : (
                                        <>
                                            <Merge className="mr-2 h-4 w-4" />
                                            Merge All
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Files List */}
                    <AnimatePresence mode="popLayout">
                        <div className="space-y-2">
                            {pdfFiles.map((pdfFile, index) => (
                                <motion.div
                                    key={pdfFile.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, index)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        'flex cursor-grab items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all active:cursor-grabbing',
                                        draggedIndex === index && 'opacity-50',
                                        pdfFile.status === 'error' && 'border-red-500/50',
                                    )}
                                >
                                    <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                        {pdfFile.thumbnail ? (
                                            <img src={pdfFile.thumbnail} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <FileText className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{pdfFile.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {pdfFile.pageCount} page{pdfFile.pageCount !== 1 ? 's' : ''} • {formatFileSize(pdfFile.size)}
                                        </p>
                                        {pdfFile.error && <p className="mt-1 text-xs text-red-500">{pdfFile.error}</p>}
                                    </div>

                                    <div className="shrink-0 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">{index + 1}</div>

                                    <button
                                        onClick={() => removeFile(pdfFile.id)}
                                        className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>

                    {/* Merged Result */}
                    {mergedData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-xl bg-green-500/10 p-2.5">
                                    <Merge className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700 dark:text-green-300">Merged PDF Ready</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {formatFileSize(mergedData.byteLength)} • {totalPages} pages combined
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

                    {/* Feature Cards */}
                    {pdfFiles.length === 0 && (
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium">Fast Merging</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Combine PDFs instantly in your browser without any uploads.</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium">Drag to Reorder</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Arrange the order of your PDF files before merging.</p>
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
                                    <span className="text-sm font-medium">Merged PDF Preview</span>
                                    <span className="text-xs text-muted-foreground">— {formatFileSize(mergedData!.byteLength)}</span>
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
                            <iframe src={previewUrl} className="h-[calc(85vh-3.25rem)] w-full" title="Merged PDF Preview" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
