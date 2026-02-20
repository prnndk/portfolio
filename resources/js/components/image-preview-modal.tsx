'use client';

import { useState } from 'react';
import { ArrowLeftRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CompressedImage } from '@/types/image-compressor';
import { formatFileSize } from '@/lib/image-compression';

interface ImagePreviewModalProps {
    image: CompressedImage | null;
    isOpen: boolean;
    onClose: () => void;
    onDownload?: () => void;
}

type ViewMode = 'side-by-side' | 'slider' | 'original' | 'compressed';

export function ImagePreviewModal({
    image,
    isOpen,
    onClose,
    onDownload,
}: ImagePreviewModalProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('slider');
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);

    if (!image) return null;

    const hasCompressed = image.status === 'completed' && image.compressedPreview;

    const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, x)));
    };

    const handleSliderStart = () => setIsDragging(true);
    const handleSliderEnd = () => setIsDragging(false);

    // Calculate savings
    const savings = image.originalSize - image.compressedSize;
    const savingsPercent = ((savings / image.originalSize) * 100).toFixed(1);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-4">
                        <span>Image Preview</span>
                        {hasCompressed && (
                            <span className="text-sm font-normal text-green-600 dark:text-green-400">
                                Saved {formatFileSize(savings)} ({savingsPercent}%)
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {/* View Mode Tabs */}
                {hasCompressed && (
                    <div className="flex items-center justify-center gap-1 p-2 border-b bg-muted/30">
                        {[
                            { id: 'slider', label: 'Slider Compare' },
                            { id: 'side-by-side', label: 'Side by Side' },
                            { id: 'original', label: 'Original Only' },
                            { id: 'compressed', label: 'Compressed Only' },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setViewMode(mode.id as ViewMode)}
                                className={cn(
                                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                                    viewMode === mode.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Preview Area */}
                <div className="flex-1 overflow-hidden bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
                    {/* Slider Compare Mode */}
                    {viewMode === 'slider' && hasCompressed && (
                        <div
                            className="relative w-full h-full flex items-center justify-center cursor-ew-resize select-none"
                            onMouseMove={handleSliderMove}
                            onMouseUp={handleSliderEnd}
                            onMouseLeave={handleSliderEnd}
                        >
                            {/* Original Image (Full) */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <img
                                    src={image.preview}
                                    alt="Original"
                                    className="max-w-full max-h-full object-contain"
                                    draggable={false}
                                />
                            </div>

                            {/* Compressed Image (Clipped) */}
                            <div
                                className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden"
                                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                            >
                                <img
                                    src={image.compressedPreview!}
                                    alt="Compressed"
                                    className="max-w-full max-h-full object-contain"
                                    draggable={false}
                                />
                            </div>

                            {/* Slider Handle */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
                                style={{ left: `${sliderPosition}%` }}
                                onMouseDown={handleSliderStart}
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                                    <ArrowLeftRight className="h-5 w-5 text-gray-600" />
                                </div>
                            </div>

                            {/* Labels */}
                            <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                                Original ({formatFileSize(image.originalSize)})
                            </div>
                            <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                                Compressed ({formatFileSize(image.compressedSize)})
                            </div>
                        </div>
                    )}

                    {/* Side by Side Mode */}
                    {viewMode === 'side-by-side' && hasCompressed && (
                        <div className="flex h-full">
                            <div className="flex-1 flex flex-col items-center justify-center p-4 border-r">
                                <div className="text-sm font-medium text-muted-foreground mb-2">
                                    Original ({formatFileSize(image.originalSize)})
                                </div>
                                <img
                                    src={image.preview}
                                    alt="Original"
                                    className="max-w-full max-h-[60vh] object-contain"
                                />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <div className="text-sm font-medium text-muted-foreground mb-2">
                                    Compressed ({formatFileSize(image.compressedSize)})
                                </div>
                                <img
                                    src={image.compressedPreview!}
                                    alt="Compressed"
                                    className="max-w-full max-h-[60vh] object-contain"
                                />
                            </div>
                        </div>
                    )}

                    {/* Original Only */}
                    {(viewMode === 'original' || !hasCompressed) && (
                        <div className="flex flex-col items-center justify-center h-full p-4">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                Original ({formatFileSize(image.originalSize)})
                            </div>
                            <img
                                src={image.preview}
                                alt="Original"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                    )}

                    {/* Compressed Only */}
                    {viewMode === 'compressed' && hasCompressed && (
                        <div className="flex flex-col items-center justify-center h-full p-4">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                Compressed ({formatFileSize(image.compressedSize)})
                            </div>
                            <img
                                src={image.compressedPreview!}
                                alt="Compressed"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        {image.originalFile.name}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {hasCompressed && onDownload && (
                            <Button onClick={onDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
