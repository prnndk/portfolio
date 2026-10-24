import { Button } from '@/components/ui/button';
import { type PdfjsDoc, openPdf } from '@/lib/doc-trace/pdf-render';
import { type BuildOptions, buildProtectedPdf } from '@/lib/doc-trace/pdf-watermark';
import { loadImage, qrPng } from '@/lib/doc-trace/qr';
import { DEFAULT_SETTINGS, type ProtectSettings, type TextContext, parseRange } from '@/lib/doc-trace/template';
import { ApiError, createTrace, finalizeTrace } from '@/lib/doc-trace/trace-api';
import { extractFromFile } from '@/lib/doc-trace/verify';
import { downloadBlob, formatFileSize } from '@/lib/pdf-utils';
import { ChevronLeft, ChevronRight, FileText, Loader2, ShieldCheck, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Panel } from './fields';
import { PagePreview } from './page-preview';
import { type SignatureBlob, SignaturePanel } from './signature-panel';
import { EMPTY_TRACE, TraceForm, type TraceFormValues, traceProblem } from './trace-form';
import { type TraceReceipt, TraceResult } from './trace-result';
import { WatermarkControls } from './watermark-controls';

const MAX_PAGES = 500;
const SAMPLE = { code: 'ABCDEFGHJK', pageCode: 'KLMNPQRS' };

/** "Sign" mode starts with only the signature on; "watermark" mode starts with the watermark and footer on. */
const signDefaults: ProtectSettings = {
    ...DEFAULT_SETTINGS,
    watermark: { ...DEFAULT_SETTINGS.watermark, enabled: false },
    footer: { ...DEFAULT_SETTINGS.footer, enabled: false },
};

export function PdfProtectTool({ mode }: { mode: 'watermark' | 'sign' }) {
    const [file, setFile] = useState<File | null>(null);
    const [doc, setDoc] = useState<PdfjsDoc | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<ProtectSettings>(mode === 'sign' ? signDefaults : DEFAULT_SETTINGS);
    const [trace, setTrace] = useState<TraceFormValues>(EMPTY_TRACE);
    const [signatures, setSignatures] = useState<SignatureBlob[]>([]);
    const [customFont, setCustomFont] = useState<{ bytes: Uint8Array; name: string } | null>(null);
    const [qr, setQr] = useState<ImageBitmap | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [done, setDone] = useState<{ bytes: Uint8Array; name: string; receipt: TraceReceipt | null } | null>(null);

    const pages = doc?.numPages ?? 0;

    const onDrop = useCallback(async (accepted: File[]) => {
        const f = accepted[0];
        if (!f) return;
        setLoading(true);
        try {
            const d = await openPdf(f);
            if (d.numPages > MAX_PAGES) throw new Error(`Documents of more than ${MAX_PAGES} pages cannot be registered.`);
            setFile(f);
            setDoc(d);
            setPage(1);
            setDone(null);
        } catch (e) {
            toast.error(
                (e as Error).message?.includes('pages')
                    ? (e as Error).message
                    : 'This PDF could not be read. It may be password protected or damaged.',
            );
        } finally {
            setLoading(false);
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

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
            // unregistered documents have no names or codes, so the preview shows none either
            recipient: trace.enabled ? trace.recipient || 'Recipient name' : '',
            issuer: trace.enabled ? trace.issuer || 'Your name' : '',
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            year: String(new Date().getFullYear()),
            page,
            pages: pages || 1,
            code: trace.enabled ? SAMPLE.code : '',
            pageCode: trace.enabled ? SAMPLE.pageCode : '',
        }),
        [trace.enabled, trace.recipient, trace.issuer, page, pages],
    );

    const reset = () => {
        signatures.forEach((s) => URL.revokeObjectURL(s.url));
        setFile(null);
        setDoc(null);
        setSignatures([]);
        setDone(null);
        setTrace({ ...EMPTY_TRACE });
    };

    const generate = async () => {
        if (!file || !doc) return;
        if (trace.enabled) {
            const problem = traceProblem(trace);
            if (problem) return toast.error(problem);
        }
        if (!trace.enabled && !signatures.length && !settings.watermark.enabled && !settings.footer.enabled) {
            return toast.error('Nothing to add yet. Turn on the watermark or footer, or add a signature.');
        }

        try {
            setBusy('Preparing…');
            const created = trace.enabled
                ? await createTrace({
                      kind: 'pdf',
                      mode: settings.mode,
                      pages,
                      recipient: trace.recipient.trim(),
                      issuer: trace.issuer.trim(),
                      details: { purpose: trace.purpose, note: trace.note, issuerContact: trace.issuerContact, originalFilename: file.name },
                      passphrase: trace.passphrase,
                      settings,
                  })
                : null;

            const opts: BuildOptions = {
                file,
                settings,
                customFont: customFont?.bytes,
                trace: created
                    ? {
                          recipient: trace.recipient.trim(),
                          issuer: trace.issuer.trim(),
                          code: created.code,
                          pageCodes: created.pageCodes,
                          verifyUrl: created.verifyUrl,
                      }
                    : undefined,
                signatures: signatures.map((s) => ({
                    id: s.id,
                    png: s.png,
                    x: s.x,
                    y: s.y,
                    w: s.w,
                    aspect: s.aspect,
                    pages: s.range.trim().toLowerCase() === 'all' ? 'all' : [...parseRange(s.range, pages)],
                })),
                onProgress: (n, total) => setBusy(`Building page ${n} of ${total}…`),
            };
            const bytes = await buildProtectedPdf(opts);
            const name = file.name.replace(/\.pdf$/i, '') + (created ? '_traced.pdf' : mode === 'sign' ? '_signed.pdf' : '_watermarked.pdf');

            let receipt: TraceReceipt | null = null;
            if (created) {
                setBusy('Sealing…');
                const fp = await extractFromFile(new File([bytes as BlobPart], name, { type: 'application/pdf' }));
                const { seal } = await finalizeTrace(created.code, created.token, fp.sha256, fp.phashes);
                receipt = { code: created.code, verifyUrl: created.verifyUrl, sha256: fp.sha256, seal, pageCodes: created.pageCodes };
            }

            downloadBlob(bytes, name);
            setDone({ bytes, name, receipt });
            toast.success(created ? 'Registered and downloaded.' : 'Downloaded.');
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : (e as Error).message || 'Something went wrong.');
            console.error(e);
        } finally {
            setBusy(null);
        }
    };

    if (!file || !doc) {
        return (
            <div
                {...getRootProps()}
                className={`flex min-h-[16rem] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 text-center transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5'}`}
            >
                <input {...getInputProps()} />
                {loading ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : <Upload className="h-10 w-10 text-primary" />}
                <div>
                    <h2 className="text-lg font-semibold">{isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF here'}</h2>
                    <p className="text-sm text-muted-foreground">or click to choose a file. It never leaves your device.</p>
                </div>
            </div>
        );
    }

    const controls = (
        <>
            <WatermarkControls
                settings={settings}
                onChange={setSettings}
                traced={trace.enabled}
                onCustomFont={(bytes) => setCustomFont({ bytes, name: 'Custom font loaded' })}
                customFontName={customFont?.name ?? null}
            />
        </>
    );

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
            <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-6 w-6 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {pages} pages · {formatFileSize(file.size)}
                            </p>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={reset}>
                        New file
                    </Button>
                </div>

                <PagePreview
                    source={{ kind: 'pdf', doc, pageNo: page }}
                    settings={settings}
                    text={text}
                    visible={visible}
                    qr={qr}
                    customFont={customFont?.bytes}
                    signatures={signatures}
                    onMoveSignature={(id, x, y) => setSignatures((list) => list.map((s) => (s.id === id ? { ...s, x, y } : s)))}
                    className="max-w-[40rem]"
                />

                <div className="flex items-center justify-center gap-3">
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label="Previous page"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-mono text-sm tabular-nums">
                        Page {page} / {pages}
                    </span>
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label="Next page"
                        disabled={page >= pages}
                        onClick={() => setPage(page + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                    Preview uses sample codes. Real, different codes go on each page when you generate.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {mode === 'sign' && <SignaturePanel signatures={signatures} onChange={setSignatures} pageCount={pages} currentPage={page} />}
                <TraceForm value={trace} onChange={setTrace} />
                {controls}
                {mode === 'watermark' && <SignaturePanel signatures={signatures} onChange={setSignatures} pageCount={pages} currentPage={page} />}

                {settings.flatten && (
                    <Panel title="Flattened output">
                        <p className="text-sm text-muted-foreground">Each page becomes a picture. Large documents take longer and the file grows.</p>
                    </Panel>
                )}

                {done ? (
                    <TraceResult receipt={done.receipt} onDownload={() => downloadBlob(done.bytes, done.name)} onReset={reset} />
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
    );
}
