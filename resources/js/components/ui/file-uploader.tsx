import { useCallback, useEffect, useState } from 'react';
import { useDropzone, type FileRejection, type DropzoneOptions } from 'react-dropzone';
import { Upload, X, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploaderProps {
    value: File[];
    onValueChange: (files: File[]) => void;
    multiple?: boolean;
    accept?: DropzoneOptions['accept'];
    maxSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    className?: string;
    description?: string;
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    return (
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-background group/preview">
            {preview ? (
                <img
                    src={preview}
                    alt={file.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/preview:scale-105"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                </div>
            )}

            <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover/preview:opacity-100">
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-md"
                    onClick={onRemove}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 opacity-0 transition-opacity group-hover/preview:opacity-100">
                <p className="truncate text-[10px] text-white">
                    {file.name}
                </p>
            </div>
        </div>
    );
}

export function FileUploader({
    value,
    onValueChange,
    multiple = false,
    accept = { 'image/*': [] },
    maxSize = 1024 * 1024 * 4, // 4MB
    maxFiles = multiple ? 0 : 1,
    disabled = false,
    className,
    description = 'Drag & drop files here, or click to select',
}: FileUploaderProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (rejectedFiles.length > 0) {
                rejectedFiles.forEach((rej) => {
                    if (rej.errors[0]?.code === 'file-too-large') {
                        toast.error(`File ${rej.file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`);
                    } else if (rej.errors[0]?.code === 'too-many-files') {
                        toast.error(`Too many files selected. Max allowed is ${maxFiles}`);
                    } else {
                        toast.error(`File ${rej.file.name} is invalid`);
                    }
                });
            }

            if (acceptedFiles.length > 0) {
                if (multiple) {
                    onValueChange([...value, ...acceptedFiles]);
                } else {
                    onValueChange(acceptedFiles);
                }
            }
        },
        [multiple, value, onValueChange, maxSize, maxFiles]
    );

    const removeFile = (index: number) => {
        const newFiles = [...value];
        newFiles.splice(index, 1);
        onValueChange(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles: maxFiles || undefined,
        multiple,
        disabled,
    });

    return (
        <div className={cn('w-full space-y-4', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'group relative flex min-h-[10rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 transition-all hover:border-primary hover:bg-primary/5',
                    isDragActive && 'border-primary bg-primary/10',
                    disabled && 'pointer-events-none opacity-60'
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-background p-3 shadow-sm ring-1 ring-border transition-all group-hover:scale-110 group-hover:ring-primary/50">
                        <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-foreground">
                            {isDragActive ? 'Drop files here' : description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Max size: {Math.round(maxSize / 1024 / 1024)}MB
                            {maxFiles > 0 && ` • Max files: ${maxFiles}`}
                        </p>
                    </div>
                </div>
            </div>

            {value.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {value.map((file, index) => (
                        <FilePreview
                            key={`${file.name}-${index}`}
                            file={file}
                            onRemove={() => removeFile(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
