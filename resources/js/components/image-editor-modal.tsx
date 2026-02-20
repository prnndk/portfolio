'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    X,
    Crop,
    RotateCcw,
    RotateCw,
    FlipHorizontal,
    FlipVertical,
    Check,
    Move,
    RectangleHorizontal,
    Square,
    Smartphone,
    Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CompressedImage, CropData } from '@/types/image-compressor';

const aspectRatios = [
    { id: 'free', label: 'Free', icon: Move, ratio: null },
    { id: '1:1', label: '1:1', icon: Square, ratio: 1 },
    { id: '4:3', label: '4:3', icon: RectangleHorizontal, ratio: 4 / 3 },
    { id: '16:9', label: '16:9', icon: Monitor, ratio: 16 / 9 },
    { id: '9:16', label: '9:16', icon: Smartphone, ratio: 9 / 16 },
    { id: '3:2', label: '3:2', icon: RectangleHorizontal, ratio: 3 / 2 },
];

interface ImageEditorModalProps {
    image: CompressedImage | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: {
        cropData?: CropData;
        rotation: number;
        flipHorizontal: boolean;
        flipVertical: boolean;
    }) => void;
}

interface CropBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function ImageEditorModal({
    image,
    isOpen,
    onClose,
    onSave,
}: ImageEditorModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Local edit state
    const [rotation, setRotation] = useState(0);
    const [flipHorizontal, setFlipHorizontal] = useState(false);
    const [flipVertical, setFlipVertical] = useState(false);

    // Crop state
    const [isCropping, setIsCropping] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState<string>('free');
    const [cropBox, setCropBox] = useState<CropBox | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState<'move' | 'resize' | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number; box: CropBox } | null>(null);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

    // Reset state when image changes
    useEffect(() => {
        if (image) {
            setRotation(image.rotation);
            setFlipHorizontal(image.flipHorizontal);
            setFlipVertical(image.flipVertical);
            setIsCropping(false);
            setCropBox(null);
            setSelectedRatio('free');
            setImageLoaded(false);
        }
    }, [image]);

    // Initialize crop box when enabling crop mode
    const initializeCropBox = useCallback(() => {
        if (!imageRef.current) return;

        const img = imageRef.current;
        const rect = img.getBoundingClientRect();

        // Set initial crop box to 80% of image
        const ratio = aspectRatios.find(r => r.id === selectedRatio)?.ratio;
        let width = rect.width * 0.8;
        let height = rect.height * 0.8;

        if (ratio) {
            // Adjust to maintain aspect ratio
            if (width / height > ratio) {
                width = height * ratio;
            } else {
                height = width / ratio;
            }
        }

        const x = (rect.width - width) / 2;
        const y = (rect.height - height) / 2;

        setCropBox({ x, y, width, height });
    }, [selectedRatio]);

    // When entering crop mode or changing ratio
    useEffect(() => {
        if (isCropping && imageLoaded) {
            initializeCropBox();
        }
    }, [isCropping, imageLoaded, initializeCropBox]);

    // Update crop box when ratio changes
    useEffect(() => {
        if (isCropping && cropBox && imageRef.current) {
            const ratio = aspectRatios.find(r => r.id === selectedRatio)?.ratio;
            if (ratio) {
                const img = imageRef.current;
                const rect = img.getBoundingClientRect();

                // Adjust current box to new ratio
                let newWidth = cropBox.width;
                let newHeight = cropBox.width / ratio;

                // Make sure it fits within image
                if (newHeight > rect.height * 0.9) {
                    newHeight = rect.height * 0.9;
                    newWidth = newHeight * ratio;
                }

                const x = Math.max(0, Math.min(cropBox.x, rect.width - newWidth));
                const y = Math.max(0, Math.min(cropBox.y, rect.height - newHeight));

                setCropBox({ x, y, width: newWidth, height: newHeight });
            }
        }
    }, [selectedRatio, isCropping, cropBox]);

    const handleRotateCW = () => setRotation((r) => (r + 90) % 360);
    const handleRotateCCW = () => setRotation((r) => (r - 90 + 360) % 360);
    const handleFlipH = () => setFlipHorizontal((f) => !f);
    const handleFlipV = () => setFlipVertical((f) => !f);

    const getTransformStyle = () => {
        const transforms: string[] = [];
        if (rotation !== 0) {
            transforms.push(`rotate(${rotation}deg)`);
        }
        if (flipHorizontal) {
            transforms.push('scaleX(-1)');
        }
        if (flipVertical) {
            transforms.push('scaleY(-1)');
        }
        return transforms.join(' ');
    };

    // Mouse handlers for crop
    const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize', handle?: string) => {
        if (!cropBox) return;
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(true);
        setDragType(type);
        setResizeHandle(handle || null);
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            box: { ...cropBox },
        });
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !dragStart || !cropBox || !imageRef.current) return;

        const img = imageRef.current;
        const rect = img.getBoundingClientRect();
        const ratio = aspectRatios.find(r => r.id === selectedRatio)?.ratio;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        const newBox = { ...dragStart.box };

        if (dragType === 'move') {
            newBox.x = Math.max(0, Math.min(dragStart.box.x + dx, rect.width - cropBox.width));
            newBox.y = Math.max(0, Math.min(dragStart.box.y + dy, rect.height - cropBox.height));
        } else if (dragType === 'resize' && resizeHandle) {
            // Handle resize based on which corner/edge is being dragged
            switch (resizeHandle) {
                case 'se': // Bottom-right
                    newBox.width = Math.max(50, dragStart.box.width + dx);
                    if (ratio) {
                        newBox.height = newBox.width / ratio;
                    } else {
                        newBox.height = Math.max(50, dragStart.box.height + dy);
                    }
                    break;
                case 'sw': { // Bottom-left
                    const newWidthSW = Math.max(50, dragStart.box.width - dx);
                    newBox.x = dragStart.box.x + (dragStart.box.width - newWidthSW);
                    newBox.width = newWidthSW;
                    if (ratio) {
                        newBox.height = newBox.width / ratio;
                    } else {
                        newBox.height = Math.max(50, dragStart.box.height + dy);
                    }
                    break;
                }
                case 'ne': // Top-right
                    newBox.width = Math.max(50, dragStart.box.width + dx);
                    if (ratio) {
                        const newHeightNE = newBox.width / ratio;
                        newBox.y = dragStart.box.y + (dragStart.box.height - newHeightNE);
                        newBox.height = newHeightNE;
                    } else {
                        const newHeightNE = Math.max(50, dragStart.box.height - dy);
                        newBox.y = dragStart.box.y + (dragStart.box.height - newHeightNE);
                        newBox.height = newHeightNE;
                    }
                    break;
                case 'nw': { // Top-left
                    const newWidthNW = Math.max(50, dragStart.box.width - dx);
                    newBox.x = dragStart.box.x + (dragStart.box.width - newWidthNW);
                    newBox.width = newWidthNW;
                    if (ratio) {
                        const newHeightNW = newBox.width / ratio;
                        newBox.y = dragStart.box.y + (dragStart.box.height - newHeightNW);
                        newBox.height = newHeightNW;
                    } else {
                        const newHeightNW = Math.max(50, dragStart.box.height - dy);
                        newBox.y = dragStart.box.y + (dragStart.box.height - newHeightNW);
                        newBox.height = newHeightNW;
                    }
                    break;
                }
            }

            // Constrain to image bounds
            newBox.x = Math.max(0, newBox.x);
            newBox.y = Math.max(0, newBox.y);
            newBox.width = Math.min(newBox.width, rect.width - newBox.x);
            newBox.height = Math.min(newBox.height, rect.height - newBox.y);
        }

        setCropBox(newBox);
    }, [isDragging, dragStart, cropBox, dragType, resizeHandle, selectedRatio]);

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragType(null);
        setDragStart(null);
        setResizeHandle(null);
    };

    const handleImageLoad = () => {
        if (imageRef.current) {
            setNaturalSize({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight,
            });
            setImageLoaded(true);
        }
    };

    const clearCrop = () => {
        setCropBox(null);
        setIsCropping(false);
    };

    const handleSave = () => {
        let cropData: CropData | undefined;

        if (cropBox && imageRef.current) {
            const img = imageRef.current;
            const rect = img.getBoundingClientRect();

            // Convert display coordinates to actual image coordinates
            const scaleX = naturalSize.width / rect.width;
            const scaleY = naturalSize.height / rect.height;

            cropData = {
                x: Math.round(cropBox.x * scaleX),
                y: Math.round(cropBox.y * scaleY),
                width: Math.round(cropBox.width * scaleX),
                height: Math.round(cropBox.height * scaleY),
            };
        }

        onSave({
            cropData,
            rotation,
            flipHorizontal,
            flipVertical,
        });
        onClose();
    };

    const handleReset = () => {
        setRotation(0);
        setFlipHorizontal(false);
        setFlipVertical(false);
        setCropBox(null);
        setIsCropping(false);
        setSelectedRatio('free');
    };

    if (!image) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center justify-between">
                        <span>Edit Image</span>
                        <span className="text-sm font-normal text-muted-foreground truncate max-w-[200px]">
                            {image.originalFile.name}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b bg-muted/30">
                    <div className="flex items-center gap-1">
                        <Button
                            size="sm"
                            variant={isCropping ? 'default' : 'outline'}
                            onClick={() => setIsCropping(!isCropping)}
                        >
                            <Crop className="h-4 w-4 mr-1" />
                            Crop
                        </Button>
                        {cropBox && (
                            <Button size="sm" variant="ghost" onClick={clearCrop}>
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleRotateCCW} title="Rotate Left">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleRotateCW} title="Rotate Right">
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button
                            size="icon"
                            className="h-8 w-8"
                            variant={flipHorizontal ? 'default' : 'outline'}
                            onClick={handleFlipH}
                            title="Flip Horizontal"
                        >
                            <FlipHorizontal className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            className="h-8 w-8"
                            variant={flipVertical ? 'default' : 'outline'}
                            onClick={handleFlipV}
                            title="Flip Vertical"
                        >
                            <FlipVertical className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button size="sm" variant="ghost" onClick={handleReset}>
                        Reset
                    </Button>
                </div>

                {/* Aspect Ratio Selector - Only show when cropping */}
                {isCropping && (
                    <div className="flex items-center gap-1 p-2 border-b bg-muted/20 overflow-x-auto">
                        <span className="text-xs text-muted-foreground mr-2 whitespace-nowrap">Aspect Ratio:</span>
                        {aspectRatios.map((ar) => (
                            <button
                                key={ar.id}
                                onClick={() => setSelectedRatio(ar.id)}
                                className={cn(
                                    'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap',
                                    selectedRatio === ar.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                            >
                                <ar.icon className="h-3 w-3" />
                                {ar.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Image Preview Area */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-hidden bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] flex items-center justify-center p-4"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div className="relative inline-block">
                        <img
                            ref={imageRef}
                            src={image.preview}
                            alt={image.originalFile.name}
                            className="max-w-full max-h-[50vh] object-contain"
                            style={{ transform: getTransformStyle() }}
                            draggable={false}
                            onLoad={handleImageLoad}
                        />

                        {/* Crop Overlay */}
                        {isCropping && cropBox && (
                            <>
                                {/* Darkened areas outside crop */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Top */}
                                    <div
                                        className="absolute bg-black/50"
                                        style={{
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: cropBox.y,
                                        }}
                                    />
                                    {/* Bottom */}
                                    <div
                                        className="absolute bg-black/50"
                                        style={{
                                            top: cropBox.y + cropBox.height,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                        }}
                                    />
                                    {/* Left */}
                                    <div
                                        className="absolute bg-black/50"
                                        style={{
                                            top: cropBox.y,
                                            left: 0,
                                            width: cropBox.x,
                                            height: cropBox.height,
                                        }}
                                    />
                                    {/* Right */}
                                    <div
                                        className="absolute bg-black/50"
                                        style={{
                                            top: cropBox.y,
                                            right: 0,
                                            left: cropBox.x + cropBox.width,
                                            height: cropBox.height,
                                        }}
                                    />
                                </div>

                                {/* Crop Box */}
                                <div
                                    className="absolute border-2 border-white cursor-move"
                                    style={{
                                        left: cropBox.x,
                                        top: cropBox.y,
                                        width: cropBox.width,
                                        height: cropBox.height,
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                                >
                                    {/* Grid lines */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50" />
                                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50" />
                                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
                                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50" />
                                    </div>

                                    {/* Resize Handles */}
                                    {/* Corners */}
                                    <div
                                        className="absolute -top-2 -left-2 w-4 h-4 bg-white border border-gray-300 rounded-sm cursor-nw-resize"
                                        onMouseDown={(e) => handleMouseDown(e, 'resize', 'nw')}
                                    />
                                    <div
                                        className="absolute -top-2 -right-2 w-4 h-4 bg-white border border-gray-300 rounded-sm cursor-ne-resize"
                                        onMouseDown={(e) => handleMouseDown(e, 'resize', 'ne')}
                                    />
                                    <div
                                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border border-gray-300 rounded-sm cursor-sw-resize"
                                        onMouseDown={(e) => handleMouseDown(e, 'resize', 'sw')}
                                    />
                                    <div
                                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-gray-300 rounded-sm cursor-se-resize"
                                        onMouseDown={(e) => handleMouseDown(e, 'resize', 'se')}
                                    />

                                    {/* Dimension indicator */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                        {Math.round(cropBox.width * (naturalSize.width / (imageRef.current?.getBoundingClientRect().width || 1)))} × {Math.round(cropBox.height * (naturalSize.height / (imageRef.current?.getBoundingClientRect().height || 1)))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Edit Summary */}
                <div className="p-3 border-t bg-muted/30">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                            {rotation !== 0 && (
                                <span className="flex items-center gap-1">
                                    <RotateCw className="h-3 w-3" />
                                    {rotation}°
                                </span>
                            )}
                            {flipHorizontal && (
                                <span className="flex items-center gap-1">
                                    <FlipHorizontal className="h-3 w-3" />
                                    Flipped H
                                </span>
                            )}
                            {flipVertical && (
                                <span className="flex items-center gap-1">
                                    <FlipVertical className="h-3 w-3" />
                                    Flipped V
                                </span>
                            )}
                            {cropBox && (
                                <span className="flex items-center gap-1">
                                    <Crop className="h-3 w-3" />
                                    Cropped ({selectedRatio})
                                </span>
                            )}
                            {rotation === 0 && !flipHorizontal && !flipVertical && !cropBox && (
                                <span>No edits applied</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 p-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        <Check className="h-4 w-4 mr-2" />
                        Apply Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
