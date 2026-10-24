import { loadCanvasFont } from '@/lib/doc-trace/fonts';
import { paintOverlay } from '@/lib/doc-trace/overlay-canvas';
import { type PdfjsDoc, renderPage } from '@/lib/doc-trace/pdf-render';
import { type ProtectSettings, type TextContext, parseRange, styleForPage } from '@/lib/doc-trace/template';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

export interface PlacedSignature {
    id: string;
    url: string;
    /** Picture height divided by width. */
    aspect: number;
    /** Left / top / width as fractions of the page. */
    x: number;
    y: number;
    w: number;
    /** "all" or a range like "1-3,5". */
    range: string;
}

export type PreviewSource = { kind: 'pdf'; doc: PdfjsDoc; pageNo: number } | { kind: 'image'; bitmap: ImageBitmap };

interface Props {
    source: PreviewSource;
    settings: ProtectSettings;
    text: TextContext;
    visible: boolean;
    qr: ImageBitmap | null;
    customFont?: Uint8Array;
    signatures: PlacedSignature[];
    onMoveSignature: (id: string, x: number, y: number) => void;
    className?: string;
}

const inRange = (range: string, page: number, pages: number) => range.trim().toLowerCase() === 'all' || parseRange(range, pages).has(page);

/** Live preview: the page, the watermark exactly as it will be laid out, and draggable signatures on top. */
export function PagePreview({ source, settings, text, visible, qr, customFont, signatures, onMoveSignature, className }: Props) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const base = useRef<{ key: string; owner: object; canvas: HTMLCanvasElement } | null>(null);
    const box = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ w: number; h: number } | null>(null);
    const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

    const sourceKey = source.kind === 'pdf' ? `pdf-${source.pageNo}` : 'image';
    const owner = source.kind === 'pdf' ? source.doc : source.bitmap;

    useEffect(() => {
        let alive = true;
        (async () => {
            const target = canvas.current;
            if (!target) return;

            // the page itself is rendered once per page, only the overlay is repainted on a settings change
            if (base.current?.key !== sourceKey || base.current.owner !== owner) {
                const c = document.createElement('canvas');
                if (source.kind === 'pdf') {
                    const probe = (await source.doc.getPage(source.pageNo)).getViewport({ scale: 1 });
                    const rendered = await renderPage(source.doc, source.pageNo, Math.min(1.6, 900 / probe.width));
                    c.width = rendered.width;
                    c.height = rendered.height;
                    c.getContext('2d')!.drawImage(rendered, 0, 0);
                    c.dataset.pageW = String(probe.width);
                    c.dataset.pageH = String(probe.height);
                } else {
                    const k = Math.min(1, 1000 / source.bitmap.width);
                    c.width = Math.round(source.bitmap.width * k);
                    c.height = Math.round(source.bitmap.height * k);
                    c.getContext('2d')!.drawImage(source.bitmap, 0, 0, c.width, c.height);
                    c.dataset.pageW = String(source.bitmap.width);
                    c.dataset.pageH = String(source.bitmap.height);
                }
                base.current = { key: sourceKey, owner, canvas: c };
            }
            if (!alive) return;

            const b = base.current!.canvas;
            const pageW = Number(b.dataset.pageW);
            const pageH = Number(b.dataset.pageH);
            const style = styleForPage(settings, text.page, text.pages);
            const [wm, ft] = await Promise.all([loadCanvasFont(style.font, customFont), loadCanvasFont(settings.footer.font, customFont)]);
            if (!alive) return;

            target.width = b.width;
            target.height = b.height;
            const ctx = target.getContext('2d')!;
            ctx.drawImage(b, 0, 0);
            paintOverlay({
                ctx,
                pageW,
                pageH,
                scale: b.width / pageW,
                sizeScale: source.kind === 'image' ? pageW / 595 : 1,
                settings,
                text,
                font: { watermark: wm, footer: ft },
                visible,
                qr,
            });
            setSize({ w: b.width, h: b.height });
        })().catch(() => undefined);

        return () => {
            alive = false;
        };
    }, [source, sourceKey, owner, settings, text, visible, qr, customFont]);

    const move = (e: React.PointerEvent) => {
        const d = drag.current;
        const r = box.current?.getBoundingClientRect();
        const sig = d && signatures.find((s) => s.id === d.id);
        if (!d || !r || !sig) return;
        const x = Math.min(1 - sig.w, Math.max(0, (e.clientX - r.left) / r.width - d.dx));
        const y = Math.min(1 - sig.w * sig.aspect * (r.width / r.height), Math.max(0, (e.clientY - r.top) / r.height - d.dy));
        onMoveSignature(d.id, x, y);
    };

    return (
        <div
            ref={box}
            className={cn('relative mx-auto w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm', className)}
            style={size ? { aspectRatio: `${size.w} / ${size.h}` } : { minHeight: 240 }}
            onPointerMove={move}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
        >
            <canvas ref={canvas} className="block h-full w-full" />
            {signatures
                .filter((s) => inRange(s.range, text.page, text.pages))
                .map((s) => (
                    <img
                        key={s.id}
                        src={s.url}
                        alt="Signature, drag to move"
                        draggable={false}
                        className="absolute cursor-move touch-none outline-1 outline-primary/60 outline-dashed hover:outline-2"
                        style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${s.w * 100}%` }}
                        onPointerDown={(e) => {
                            const r = box.current!.getBoundingClientRect();
                            drag.current = { id: s.id, dx: (e.clientX - r.left) / r.width - s.x, dy: (e.clientY - r.top) / r.height - s.y };
                            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        }}
                    />
                ))}
        </div>
    );
}
