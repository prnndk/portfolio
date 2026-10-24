import { Field, Panel, Segmented } from '@/components/doc-trace/fields';
import { PagePreview } from '@/components/doc-trace/page-preview';
import { type SignatureBlob, SignaturePanel } from '@/components/doc-trace/signature-panel';
import { ToolShell } from '@/components/doc-trace/tool-shell';
import { EMPTY_TRACE, TraceForm, type TraceFormValues, traceProblem } from '@/components/doc-trace/trace-form';
import { type TraceReceipt, TraceResult } from '@/components/doc-trace/trace-result';
import { WatermarkControls } from '@/components/doc-trace/watermark-controls';
import { Button } from '@/components/ui/button';
import { buildProtectedImage } from '@/lib/doc-trace/image-watermark';
import { loadImage, qrPng } from '@/lib/doc-trace/qr';
import { DEFAULT_SETTINGS, type ProtectSettings, type TextContext } from '@/lib/doc-trace/template';
import { ApiError, createTrace, finalizeTrace } from '@/lib/doc-trace/trace-api';
import { extractFromFile } from '@/lib/doc-trace/verify';
import { downloadAsZip, downloadBlob, formatFileSize } from '@/lib/pdf-utils';
import { ImageIcon, Loader2, ShieldCheck, Stamp, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

const SAMPLE = { code: 'ABCDEFGHJK', pageCode: 'KLMNPQRS' };
const MAX_FILES = 30;

interface Item {
    file: File;
    bitmap: ImageBitmap;
}

async function decode(file: File): Promise<ImageBitmap> {
    if (/\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type)) {
        const { default: heic2any } = await import('heic2any');
        const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 });

        return createImageBitmap(Array.isArray(out) ? out[0] : out);
    }

    return createImageBitmap(file);
}

export default function ImageWatermark() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<ProtectSettings>(DEFAULT_SETTINGS);
    const [trace, setTrace] = useState<TraceFormValues>(EMPTY_TRACE);
    const [signatures, setSignatures] = useState<SignatureBlob[]>([]);
    const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
    const [customFont, setCustomFont] = useState<Uint8Array | null>(null);
    const [qr, setQr] = useState<ImageBitmap | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [done, setDone] = useState<{ run: () => void; receipt: TraceReceipt | null } | null>(null);

    const onDrop = useCallback(async (accepted: File[]) => {
        if (!accepted.length) return;
        setLoading(true);
        try {
            const next: Item[] = [];
            for (const file of accepted.slice(0, MAX_FILES)) {
                try {
                    next.push({ file, bitmap: await decode(file) });
                } catch {
                    toast.error(`${file.name} could not be read.`);
                }
            }
            if (accepted.length > MAX_FILES) toast.info(`Only the first ${MAX_FILES} pictures were added.`);
            setItems((cur) => [...cur, ...next].slice(0, MAX_FILES));
            setDone(null);
        } finally {
            setLoading(false);
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/heic': ['.heic'], 'image/heif': ['.heif'] },
    });

    const visible = !trace.enabled || settings.mode !== 'hidden';
    useEffect(() => {
        if (!trace.enabled || !settings.qr) return setQr(null);
        let alive = true;
        qrPng(`${location.origin}/v/${SAMPLE.code}`)
            .then((b) => loadImage(b))
            .then((img) => alive && setQr(img));

        return () => {
            alive = false;
        };
    }, [trace.enabled, settings.qr]);

    const text: TextContext = useMemo(
        () => ({
            recipient: trace.enabled ? trace.recipient || 'Recipient name' : '',
            issuer: trace.enabled ? trace.issuer || 'Your name' : '',
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            year: String(new Date().getFullYear()),
            page: 1,
            pages: 1,
            code: trace.enabled ? SAMPLE.code : '',
            pageCode: trace.enabled ? SAMPLE.pageCode : '',
        }),
        [trace.enabled, trace.recipient, trace.issuer],
    );

    const reset = () => {
        signatures.forEach((s) => URL.revokeObjectURL(s.url));
        setItems([]);
        setSignatures([]);
        setDone(null);
        setTrace({ ...EMPTY_TRACE });
    };

    const generate = async () => {
        if (trace.enabled) {
            const problem = traceProblem(trace);
            if (problem) return toast.error(problem);
        }
        if (!trace.enabled && !signatures.length && !settings.watermark.enabled && !settings.footer.enabled) {
            return toast.error('Nothing to add yet. Turn on the watermark or footer, or add a signature.');
        }

        const out: { name: string; data: Uint8Array }[] = [];
        let receipt: TraceReceipt | null = null;
        try {
            for (const [i, item] of items.entries()) {
                setBusy(`Picture ${i + 1} of ${items.length}…`);
                const created = trace.enabled
                    ? await createTrace({
                          kind: 'image',
                          mode: settings.mode,
                          pages: 1,
                          recipient: trace.recipient.trim(),
                          issuer: trace.issuer.trim(),
                          details: { purpose: trace.purpose, note: trace.note, issuerContact: trace.issuerContact, originalFilename: item.file.name },
                          passphrase: trace.passphrase,
                          settings,
                      })
                    : null;
                const info = created && {
                    recipient: trace.recipient.trim(),
                    issuer: trace.issuer.trim(),
                    code: created.code,
                    pageCode: created.pageCodes[0],
                    verifyUrl: created.verifyUrl,
                };
                const qrImg = info && settings.qr ? await loadImage(await qrPng(info.verifyUrl)) : null;
                const bytes = await buildProtectedImage({
                    bitmap: item.bitmap,
                    settings,
                    format,
                    trace: info ?? undefined,
                    customFont: customFont ?? undefined,
                    qr: qrImg,
                    signatures: signatures.map((s) => ({ id: s.id, png: s.png, x: s.x, y: s.y, w: s.w, aspect: s.aspect, pages: 'all' as const })),
                });
                const name = item.file.name.replace(/\.[^.]+$/, '') + (created ? '_traced' : '_watermarked') + (format === 'jpeg' ? '.jpg' : '.png');

                if (created) {
                    const fp = await extractFromFile(new File([bytes as BlobPart], name, { type: `image/${format}` }));
                    const { seal } = await finalizeTrace(created.code, created.token, fp.sha256, fp.phashes);
                    receipt = { code: created.code, verifyUrl: created.verifyUrl, sha256: fp.sha256, seal, pageCodes: created.pageCodes };
                }
                out.push({ name, data: bytes });
            }

            const run = () =>
                out.length === 1
                    ? downloadBlob(new Blob([out[0].data as BlobPart], { type: `image/${format}` }), out[0].name)
                    : downloadAsZip(out, 'protected_images.zip');
            run();
            setDone({ run, receipt: out.length === 1 ? receipt : null });
            toast.success(out.length === 1 ? 'Downloaded.' : `${out.length} pictures downloaded as a ZIP.`);
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : (e as Error).message || 'Something went wrong.');
            console.error(e);
        } finally {
            setBusy(null);
        }
    };

    return (
        <ToolShell
            title="Image Watermark & Trace"
            subtitle="Visible watermark, copyright footer and an invisible code in the pixels • 100% private"
            seoTitle="Image Watermark – Visible Watermark and Invisible Trace for Photos and ID Scans"
            description="Watermark photos and scans with custom text, tilt and spacing and add a copyright footer. Optionally hide a trace code inside the picture so you can prove where a shared copy came from. Pictures never leave your browser."
            url="/tools/image-watermark"
            icon={Stamp}
        >
            {items.length === 0 ? (
                <div
                    {...getRootProps()}
                    className={`flex min-h-[16rem] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 text-center transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5'}`}
                >
                    <input {...getInputProps()} />
                    {loading ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : <Upload className="h-10 w-10 text-primary" />}
                    <div>
                        <h2 className="text-lg font-semibold">{isDragActive ? 'Drop your pictures here' : 'Drag & drop pictures here'}</h2>
                        <p className="text-sm text-muted-foreground">
                            JPG, PNG, WebP or HEIC, up to {MAX_FILES} at once. They never leave your device.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    {items.length} picture{items.length === 1 ? '' : 's'} ·{' '}
                                    {formatFileSize(items.reduce((n, i) => n + i.file.size, 0))}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <span {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <Button type="button" variant="outline" size="sm">
                                        Add more
                                    </Button>
                                </span>
                                <Button type="button" variant="outline" size="sm" onClick={reset}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <PagePreview
                            source={{ kind: 'image', bitmap: items[0].bitmap }}
                            settings={settings}
                            text={text}
                            visible={visible}
                            qr={qr}
                            customFont={customFont ?? undefined}
                            signatures={signatures}
                            onMoveSignature={(id, x, y) => setSignatures((list) => list.map((s) => (s.id === id ? { ...s, x, y } : s)))}
                            className="max-w-[40rem]"
                        />
                        <p className="text-center text-xs text-muted-foreground">
                            Previewing “{items[0].file.name}”. Settings apply to every picture, each with its own code when registered.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <TraceForm value={trace} onChange={setTrace} />
                        <WatermarkControls
                            settings={settings}
                            onChange={setSettings}
                            traced={trace.enabled}
                            pictures
                            onCustomFont={setCustomFont}
                            customFontName={customFont ? 'Custom font loaded' : null}
                        />
                        <SignaturePanel signatures={signatures} onChange={setSignatures} pageCount={1} currentPage={1} />
                        <Panel title="Output">
                            <Field
                                label="Format"
                                hint={
                                    format === 'jpeg'
                                        ? 'Smaller file. The hidden pixel watermark survives later JPEG recompression.'
                                        : 'Lossless and larger.'
                                }
                            >
                                <Segmented
                                    value={format}
                                    onChange={setFormat}
                                    options={[
                                        { value: 'jpeg', label: 'JPG' },
                                        { value: 'png', label: 'PNG' },
                                    ]}
                                />
                            </Field>
                        </Panel>

                        {done ? (
                            <TraceResult receipt={done.receipt} onDownload={done.run} onReset={reset} />
                        ) : (
                            <Button
                                type="button"
                                size="lg"
                                onClick={generate}
                                disabled={!!busy}
                                className="sticky bottom-3 z-20 min-h-12 shadow-lg shadow-black/30 lg:static lg:shadow-none"
                            >
                                {busy ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {busy}
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="mr-2 h-5 w-5" />
                                        {trace.enabled ? 'Register & download' : 'Generate & download'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </ToolShell>
    );
}
