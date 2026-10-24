import { Button } from '@/components/ui/button';
import { type SignatureImage, signatureFromCanvas, signatureFromFile } from '@/lib/doc-trace/signature';
import { Eraser, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, Field, Panel, Range, Segmented, inputCls } from './fields';
import type { PlacedSignature } from './page-preview';

export type SignatureBlob = PlacedSignature & { png: Uint8Array };

const INKS = ['#111827', '#1D4ED8', '#7C3AED'];

function DrawPad({ onDone }: { onDone: (s: SignatureImage) => void }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const [ink, setInk] = useState(INKS[0]);
    const drawing = useRef(false);
    const dirty = useRef(false);

    useEffect(() => {
        const c = ref.current!;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        c.width = c.clientWidth * dpr;
        c.height = c.clientHeight * dpr;
        c.getContext('2d')!.scale(dpr, dpr);
    }, []);

    const point = (e: React.PointerEvent) => {
        const r = ref.current!.getBoundingClientRect();

        return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const start = (e: React.PointerEvent) => {
        const ctx = ref.current!.getContext('2d')!;
        drawing.current = true;
        dirty.current = true;
        ref.current!.setPointerCapture(e.pointerId);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.6;
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.beginPath();
        const [x, y] = point(e);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.01, y); // a tap leaves a dot
        ctx.stroke();
    };
    const move = (e: React.PointerEvent) => {
        if (!drawing.current) return;
        const ctx = ref.current!.getContext('2d')!;
        const [x, y] = point(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };
    const clear = () => {
        const c = ref.current!;
        c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
        dirty.current = false;
    };

    return (
        <div className="flex flex-col gap-3">
            <canvas
                ref={ref}
                className="h-40 w-full cursor-crosshair touch-none rounded-lg border border-dashed border-border bg-white"
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={() => (drawing.current = false)}
                onPointerCancel={() => (drawing.current = false)}
                aria-label="Signature drawing area"
            />
            <div className="flex flex-wrap items-center gap-2">
                {INKS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        aria-label={`Ink ${c}`}
                        aria-pressed={ink === c}
                        onClick={() => setInk(c)}
                        className="size-7 rounded-full border-2"
                        style={{ background: c, borderColor: ink === c ? 'var(--color-primary)' : 'transparent' }}
                    />
                ))}
                <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={clear}>
                    <Eraser className="mr-1 h-4 w-4" />
                    Clear
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={async () => {
                        if (!dirty.current) return toast.error('Draw your signature first.');
                        try {
                            onDone(await signatureFromCanvas(ref.current!));
                            clear();
                        } catch (e) {
                            toast.error((e as Error).message);
                        }
                    }}
                >
                    <Plus className="mr-1 h-4 w-4" />
                    Use this signature
                </Button>
            </div>
        </div>
    );
}

interface Props {
    signatures: SignatureBlob[];
    onChange: (s: SignatureBlob[]) => void;
    pageCount: number;
    currentPage: number;
}

/** Add a signature by uploading a PNG (or a photo of one) or by drawing it, then place it anywhere on the page preview. */
export function SignaturePanel({ signatures, onChange, pageCount, currentPage }: Props) {
    const [tab, setTab] = useState<'upload' | 'draw'>('upload');
    const [removeBg, setRemoveBg] = useState(false);

    const add = (img: SignatureImage) =>
        onChange([
            ...signatures,
            { id: crypto.randomUUID(), url: img.url, aspect: img.aspect, png: img.png, x: 0.55, y: 0.78, w: 0.22, range: 'all' },
        ]);
    const update = (id: string, p: Partial<SignatureBlob>) => onChange(signatures.map((s) => (s.id === id ? { ...s, ...p } : s)));
    const remove = (id: string) => {
        const s = signatures.find((x) => x.id === id);
        if (s) URL.revokeObjectURL(s.url);
        onChange(signatures.filter((x) => x.id !== id));
    };

    return (
        <Panel title="Signature">
            <Segmented
                value={tab}
                onChange={setTab}
                options={[
                    { value: 'upload', label: 'Upload PNG' },
                    { value: 'draw', label: 'Draw' },
                ]}
            />
            {tab === 'upload' ? (
                <div className="flex flex-col gap-3">
                    <Field
                        label="Signature image"
                        hint="A transparent PNG works best. A photo or scan on white paper works too with the option below."
                    >
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className={inputCls}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                if (!file) return;
                                try {
                                    add(await signatureFromFile(file, removeBg));
                                } catch (err) {
                                    toast.error((err as Error).message || 'Could not read that image.');
                                }
                            }}
                        />
                    </Field>
                    <Check checked={removeBg} onChange={setRemoveBg}>
                        Remove the paper background (choose this before picking the file)
                    </Check>
                </div>
            ) : (
                <DrawPad onDone={add} />
            )}

            {signatures.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    Added signatures appear on the page preview. Drag them where you want them.
                </p>
            ) : (
                signatures.map((s, i) => (
                    <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-3">
                            <img src={s.url} alt={`Signature ${i + 1}`} className="h-10 w-24 rounded bg-white object-contain p-1" />
                            <span className="flex-1 text-sm font-medium">Signature {i + 1}</span>
                            <Button type="button" size="icon" variant="ghost" aria-label="Remove signature" onClick={() => remove(s.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <Range label="Size" value={Math.round(s.w * 100)} min={5} max={60} unit="%" onChange={(v) => update(s.id, { w: v / 100 })} />
                        <Field label="On pages" hint={`"all", or a range like 1-3, ${pageCount}. Now previewing page ${currentPage}.`}>
                            <input value={s.range} onChange={(e) => update(s.id, { range: e.target.value })} className={`${inputCls} font-mono`} />
                        </Field>
                    </div>
                ))
            )}
        </Panel>
    );
}
