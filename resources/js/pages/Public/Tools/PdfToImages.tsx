'use client';

import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Spotlight } from '@/components/ui/spotlight-new';
import GuestLayout from '@/layouts/guest-layout';
import { downloadAsZip, downloadBlob, formatFileSize, getPdfPages, pdfToImages } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';
import type { ImageFormat, PdfPage } from '@/types/pdf-tools';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Download, Eye, FileText, ImageDown, Loader2, Settings2, Shield, Upload, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface ConvertedImage {
    name: string;
    dataUrl: string;
    blob: Blob;
}

export default function PdfToImages() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(0);
    const [format, setFormat] = useState<ImageFormat>('jpeg');
    const [scale, setScale] = useState(2.0);
    const [quality, setQuality] = useState(85);
    const [isProcessing, setIsProcessing] = useState(false);
    const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);

    // Preview state
    const [previewPages, setPreviewPages] = useState<PdfPage[]>([]);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const pdfFile = acceptedFiles[0];
        setFile(pdfFile);
        setFileName(pdfFile.name);
        setFileSize(pdfFile.size);
        setConvertedImages([]);
        setPreviewPages([]);

        // Generate previews
        setIsLoadingPreview(true);
        try {
            const pages = await getPdfPages(pdfFile, 0.4);
            setPreviewPages(pages);
        } catch {
            toast.error('Failed to load PDF preview.');
        } finally {
            setIsLoadingPreview(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const images = await pdfToImages(file, format, scale, quality / 100);
            setConvertedImages(images);
            toast.success(`Converted ${images.length} page${images.length !== 1 ? 's' : ''} to images!`);
        } catch (err) {
            toast.error('Failed to convert PDF to images.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadSingle = (img: ConvertedImage) => {
        downloadBlob(img.blob, img.name);
    };

    const handleDownloadAll = async () => {
        if (convertedImages.length === 0) return;
        await downloadAsZip(
            convertedImages.map((img) => ({ name: img.name, data: img.blob })),
            `${fileName.replace(/\.pdf$/i, '')}_images.zip`,
        );
        toast.success('All images downloaded as ZIP!');
    };

    const reset = () => {
        setFile(null);
        setFileName('');
        setFileSize(0);
        setConvertedImages([]);
        setPreviewPages([]);
    };

    return (
        <GuestLayout>
            <Seo
                title="Free PDF to Images – Convert PDF Pages to JPG/PNG Online (No Upload)"
                description="Convert each page of a PDF into high-quality JPG or PNG images. Download pages individually or as a ZIP archive. 100% free, private — all processing happens locally in your browser."
                url="/tools/pdf-to-images"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'PDF to Images Converter',
                        description:
                            'Convert each page of a PDF into high-quality JPG or PNG images. Download individually or as ZIP — all processing happens locally in your browser.',
                        url: 'https://aryagading.com/tools/pdf-to-images',
                        applicationCategory: 'MultimediaApplication',
                        operatingSystem: 'Any (Browser-based)',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                        featureList: 'PDF to JPG, PDF to PNG, Batch conversion, ZIP download, High-quality output',
                        browserRequirements: 'Requires a modern web browser with JavaScript enabled',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aryagading.com' },
                            { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aryagading.com/tools' },
                            { '@type': 'ListItem', position: 3, name: 'PDF to Images', item: 'https://aryagading.com/tools/pdf-to-images' },
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
                                <ImageDown className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-bold md:text-3xl">PDF to Images</h1>
                                <p className="text-sm text-muted-foreground">Convert PDF pages to images • 100% private</p>
                            </div>
                        </div>

                        {file && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={reset}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    New File
                                </Button>
                                {convertedImages.length > 0 && (
                                    <Button onClick={handleDownloadAll}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download All as ZIP
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
                                    <h3 className="font-medium">High Quality Output</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Render pages at up to 3× scale for crisp, high-resolution images.
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        <Settings2 className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium">Flexible Format</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Choose between JPG and PNG output formats with quality control.
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
                    ) : (
                        <>
                            {/* Settings */}
                            <div className="rounded-2xl border border-border bg-card p-6">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="rounded-xl bg-primary/10 p-2.5">
                                        <Settings2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Output Settings</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {fileName} • {formatFileSize(fileSize)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-8 md:grid-cols-3">
                                    {/* Format */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium">Format</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['jpeg', 'png'] as ImageFormat[]).map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => setFormat(f)}
                                                    className={cn(
                                                        'rounded-lg border px-3 py-2.5 text-left transition-all',
                                                        format === f
                                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                            : 'border-border hover:border-primary/50',
                                                    )}
                                                >
                                                    <span className="block text-sm font-medium uppercase">{f}</span>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {f === 'jpeg' ? 'Smaller files' : 'Lossless'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Scale */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Resolution Scale</label>
                                            <span className="text-sm font-semibold text-primary">{scale}×</span>
                                        </div>
                                        <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={1} max={3} step={0.5} className="w-full" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Standard</span>
                                            <span>High resolution</span>
                                        </div>
                                    </div>

                                    {/* Quality (JPEG only) */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Quality {format === 'png' && '(PNG is lossless)'}</label>
                                            <span className="text-sm font-semibold text-primary">{quality}%</span>
                                        </div>
                                        <Slider
                                            value={[quality]}
                                            onValueChange={([v]) => setQuality(v)}
                                            min={10}
                                            max={100}
                                            step={5}
                                            disabled={format === 'png'}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Smaller file</span>
                                            <span>Better quality</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Button onClick={handleConvert} disabled={isProcessing}>
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Converting...
                                            </>
                                        ) : (
                                            <>
                                                <ImageDown className="mr-2 h-4 w-4" />
                                                Convert to {format.toUpperCase()}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* PDF Page Preview */}
                            {(isLoadingPreview || previewPages.length > 0) && convertedImages.length === 0 && (
                                <div className="rounded-2xl border border-border bg-card p-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-blue-500/10 p-2.5">
                                            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">Page Preview</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {isLoadingPreview
                                                    ? 'Loading preview...'
                                                    : `${previewPages.length} page${previewPages.length !== 1 ? 's' : ''} found`}
                                            </p>
                                        </div>
                                    </div>

                                    {isLoadingPreview ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                            {previewPages.map((page) => (
                                                <motion.div
                                                    key={page.pageNumber}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: page.pageNumber * 0.03 }}
                                                    className="overflow-hidden rounded-lg border border-border bg-muted"
                                                >
                                                    <div className="relative aspect-[3/4] overflow-hidden">
                                                        {page.thumbnail ? (
                                                            <img
                                                                src={page.thumbnail}
                                                                alt={`Page ${page.pageNumber}`}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                                <FileText className="h-8 w-8" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                                            {page.pageNumber}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Converted Images */}
                            {convertedImages.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            {convertedImages.length} image{convertedImages.length !== 1 ? 's' : ''} generated
                                        </p>
                                        <Button onClick={handleDownloadAll} variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download All as ZIP
                                        </Button>
                                    </div>

                                    <AnimatePresence mode="popLayout">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {convertedImages.map((img, index) => (
                                                <motion.div
                                                    key={img.name}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="group relative overflow-hidden rounded-xl border border-border bg-card"
                                                >
                                                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                                        <img src={img.dataUrl} alt={img.name} className="h-full w-full object-contain" />
                                                        <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <p className="truncate text-xs font-medium">{img.name}</p>
                                                        <p className="text-xs text-muted-foreground">{formatFileSize(img.blob.size)}</p>
                                                        <Button size="sm" className="mt-2 w-full" onClick={() => handleDownloadSingle(img)}>
                                                            <Download className="mr-1.5 h-3.5 w-3.5" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </AnimatePresence>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </GuestLayout>
    );
}
