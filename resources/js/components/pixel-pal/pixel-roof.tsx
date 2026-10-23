import { type ReactNode, useEffect, useRef, useState } from 'react';
import { type Confetti, drawConfetti, drawLadder, drawPal, drawYard, type PalPose, spawnConfetti } from './sprites';

/** Logical pixels are scaled by this many CSS pixels. */
const PX = 3;
/** Free rows above the card where the character walks and sits (logical px). */
const ROOF_ROWS = 30;
/** Yard width on the right of the card, holding the ladder (logical px). */
const YARD = 20;
const WALK = 26;
const CLIMB = 18;

const CHATTER = ["Hi! I'm Gading, pixel edition.", 'Nice view from up here.', 'Do not mind me.', 'Still here if you need me.'];

type Step = { k: 'walk'; x: number } | { k: 'climb'; to: number } | { k: 'act'; pose: PalPose; ms: number; say?: string; confetti?: boolean };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface Props {
    children: ReactNode;
    className?: string;
}

/**
 * Wraps a card and puts a tiny pixel-art version of the site owner on it. He climbs a ladder on the
 * right, walks the top edge, dangles his legs, points at anything marked `data-pixel-target`, watches
 * you type in form fields, and cheers on the `pixel:celebrate` window event.
 *
 * The first child must be the card itself; the wrapper only adds roof space above and a yard beside it.
 */
export function PixelRoof({ children, className }: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const spriteRef = useRef<HTMLButtonElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const [bubble, setBubble] = useState<string | null>(null);
    const [ladder, setLadder] = useState(false);
    const [animate, setAnimate] = useState(true);
    const waveRef = useRef<() => void>(() => {});

    useEffect(() => {
        setLadder(window.innerWidth >= 768);
        setAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        const onResize = () => setLadder(window.innerWidth >= 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        const card = wrap?.firstElementChild as HTMLElement | null;
        const ctx = canvas?.getContext('2d');
        if (!wrap || !canvas || !card || !ctx) return;

        // ── geometry (logical px) ──
        let W = 0;
        let H = 0;
        let cardTop = ROOF_ROWS;
        let cardLeft = 0;
        let cardRight = 0;
        let ladderX = 0;
        const ladderCx = () => ladderX + 5;
        const groundY = () => H - 1;
        const measure = () => {
            const w = wrap.getBoundingClientRect();
            const c = card.getBoundingClientRect();
            W = Math.ceil(w.width / PX);
            H = Math.ceil(w.height / PX);
            canvas.width = W;
            canvas.height = H;
            canvas.style.width = `${W * PX}px`;
            canvas.style.height = `${H * PX}px`;
            cardTop = Math.round((c.top - w.top) / PX);
            cardLeft = Math.round((c.left - w.left) / PX);
            cardRight = Math.round((c.right - w.left) / PX);
            ladderX = cardRight + 4;
        };
        measure();

        const roofMin = () => cardLeft + 16;
        const roofMax = () => Math.max(roofMin() + 8, cardRight - 16);

        // ── state ──
        const s = {
            x: ladder ? ladderCx() + 6 : roofMin() + 20,
            y: 0,
            dir: -1 as 1 | -1,
            loc: (ladder ? 'yard' : 'roof') as 'yard' | 'ladder' | 'roof',
            pose: 'stand' as PalPose,
            queue: [] as Step[],
            cur: null as Step | null,
            curStart: 0,
            actUntil: 0,
            bubbleUntil: 0,
            confetti: [] as Confetti[],
            lastHover: new WeakMap<Element, number>(),
        };
        s.y = s.loc === 'yard' ? groundY() : cardTop;

        const say = (text: string, ms = 2600) => {
            s.bubbleUntil = performance.now() + ms;
            setBubble(text);
        };

        const roofPlan = (): Step[] => [
            { k: 'walk', x: rand(roofMin(), roofMax()) },
            { k: 'act', pose: 'sit-edge', ms: rand(5000, 9000) },
            { k: 'walk', x: rand(roofMin(), roofMax()) },
            { k: 'act', pose: 'wave', ms: 1800, say: CHATTER[Math.floor(Math.random() * CHATTER.length)] },
            { k: 'walk', x: rand(roofMin(), roofMax()) },
            { k: 'act', pose: 'sit-edge', ms: rand(4000, 7000) },
        ];

        const refill = () => {
            if (!ladder) {
                s.queue.push(...roofPlan());
                return;
            }
            if (s.loc === 'yard') {
                s.queue.push(
                    { k: 'act', pose: 'stand', ms: 1400 },
                    { k: 'walk', x: ladderCx() },
                    { k: 'climb', to: cardTop },
                    ...roofPlan(),
                    { k: 'walk', x: ladderCx() },
                    { k: 'climb', to: groundY() },
                    { k: 'walk', x: ladderCx() + 6 },
                    { k: 'act', pose: 'wave', ms: 1800, say: 'Back down!' },
                );
            } else {
                s.queue.push(...roofPlan());
            }
        };

        /** Run these steps next, dropping an interruptible current step. */
        const interrupt = (steps: Step[]) => {
            if (s.loc === 'ladder') return; // never abandon a ladder mid-climb
            s.queue.unshift(...steps);
            s.cur = null;
        };

        waveRef.current = () => interrupt([{ k: 'act', pose: 'wave', ms: 1800, say: CHATTER[Math.floor(Math.random() * CHATTER.length)] }]);

        // ── reactions ──
        const toLogicalX = (el: Element) => {
            const r = el.getBoundingClientRect();
            const w = wrap.getBoundingClientRect();
            return Math.max(roofMin(), Math.min(roofMax(), Math.round((r.left + r.width / 2 - w.left) / PX)));
        };
        const onOver = (e: PointerEvent) => {
            const el = (e.target as Element | null)?.closest?.('[data-pixel-target]');
            if (!el || !wrap.contains(el) || s.loc !== 'roof') return;
            const now = performance.now();
            if (now - (s.lastHover.get(el) ?? 0) < 7000) return;
            s.lastHover.set(el, now);
            interrupt([
                { k: 'walk', x: toLogicalX(el) },
                { k: 'act', pose: 'point', ms: 2600, say: el.getAttribute('data-pixel-say') ?? 'Click it!' },
            ]);
        };
        const onFocus = (e: FocusEvent) => {
            const el = e.target as Element | null;
            if (!el || !wrap.contains(el) || !el.matches('input, textarea') || s.loc !== 'roof') return;
            interrupt([
                { k: 'walk', x: toLogicalX(el) },
                { k: 'act', pose: 'sit-edge', ms: 6000, say: 'Take your time!' },
            ]);
        };
        const onCelebrate = () => {
            const run = () => {
                interrupt([{ k: 'act', pose: 'cheer', ms: 2800, say: 'Sent! Nice one.', confetti: true }]);
            };
            if (s.loc === 'ladder') window.setTimeout(run, 2500);
            else run();
        };
        window.addEventListener('pointerover', onOver);
        wrap.addEventListener('focusin', onFocus);
        window.addEventListener('pixel:celebrate', onCelebrate);

        // ── drawing ──
        const render = (now: number, dt: number) => {
            ctx.clearRect(0, 0, W, H);
            if (ladder) {
                drawYard(ctx, cardRight + 1, W, groundY());
                drawLadder(ctx, ladderX, cardTop - 2, groundY());
            }
            const drawY = s.pose === 'sit-edge' ? s.y + 3 : s.y;
            drawPal(ctx, { x: s.x, groundY: drawY, dir: s.dir, pose: s.pose, t: now });
            s.confetti = drawConfetti(ctx, s.confetti, dt);

            const sprite = spriteRef.current;
            if (sprite) sprite.style.transform = `translate(${(s.x - 8) * PX}px, ${(s.y - 24) * PX}px)`;
            const bub = bubbleRef.current;
            if (bub) bub.style.transform = `translate(${s.x * PX}px, ${(s.y - 27) * PX}px) translate(-50%, -100%)`;
        };

        // Reduced motion: one still frame of him sitting on the ledge
        if (!animate) {
            s.pose = 'sit-edge';
            s.x = roofMin() + 24;
            s.y = cardTop;
            s.loc = 'roof';
            render(0, 0);
            const ro = new ResizeObserver(() => {
                measure();
                s.y = cardTop;
                render(0, 0);
            });
            ro.observe(wrap);
            return () => {
                ro.disconnect();
                window.removeEventListener('pointerover', onOver);
                wrap.removeEventListener('focusin', onFocus);
                window.removeEventListener('pixel:celebrate', onCelebrate);
            };
        }

        // ── loop ──
        let raf = 0;
        let prev = performance.now();
        let visible = true;

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            const dt = Math.min(0.05, (now - prev) / 1000);
            prev = now;
            if (!visible || document.hidden) return;

            if (!s.cur) {
                if (!s.queue.length) refill();
                s.cur = s.queue.shift() ?? null;
                s.curStart = now;
                if (s.cur?.k === 'act') {
                    s.actUntil = now + s.cur.ms;
                    if (s.cur.say) say(s.cur.say, Math.min(3200, s.cur.ms));
                    if (s.cur.confetti) s.confetti.push(...spawnConfetti(s.x, s.y - 20));
                }
            }
            const step = s.cur;
            if (step?.k === 'walk') {
                const diff = step.x - s.x;
                if (Math.abs(diff) < 1) s.cur = null;
                else {
                    s.dir = diff > 0 ? 1 : -1;
                    s.x += s.dir * WALK * dt;
                    s.pose = 'walk';
                }
            } else if (step?.k === 'climb') {
                s.loc = 'ladder';
                s.x = ladderCx();
                s.dir = 1;
                const diff = step.to - s.y;
                if (Math.abs(diff) < 0.6) {
                    s.y = step.to;
                    s.loc = step.to === cardTop ? 'roof' : 'yard';
                    s.cur = null;
                } else {
                    s.y += Math.sign(diff) * CLIMB * dt;
                    s.pose = 'climb';
                }
            } else if (step?.k === 'act') {
                s.pose = step.pose;
                if (now > s.actUntil) s.cur = null;
            }

            if (s.bubbleUntil && now > s.bubbleUntil) {
                s.bubbleUntil = 0;
                setBubble(null);
            }
            render(now, dt);
        };
        raf = requestAnimationFrame(frame);

        // Only animate while on screen
        const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
        io.observe(wrap);
        const ro = new ResizeObserver(() => {
            measure();
            if (s.loc === 'roof') s.y = cardTop;
            if (s.loc === 'yard') s.y = groundY();
            s.x = Math.max(8, Math.min(W - 8, s.x));
        });
        ro.observe(wrap);
        ro.observe(card);

        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
            window.removeEventListener('pointerover', onOver);
            wrap.removeEventListener('focusin', onFocus);
            window.removeEventListener('pixel:celebrate', onCelebrate);
        };
    }, [ladder, animate]);

    return (
        <div ref={wrapRef} className={`relative ${className ?? ''}`} style={{ paddingTop: ROOF_ROWS * PX, paddingRight: ladder ? YARD * PX : 0 }}>
            {children}
            <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-10 [image-rendering:pixelated]" />
            {animate && (
                <button
                    ref={spriteRef}
                    type="button"
                    tabIndex={-1}
                    aria-label="Wave at the pixel character"
                    onClick={() => waveRef.current()}
                    className="absolute top-0 left-0 z-10 h-[72px] w-12 cursor-pointer"
                />
            )}
            {bubble && (
                <div
                    ref={bubbleRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 left-0 z-20 w-max max-w-[14rem] border-2 border-foreground bg-background px-3 py-1.5 font-mono text-xs text-foreground [box-shadow:3px_3px_0_0_var(--color-foreground)]"
                >
                    {bubble}
                </div>
            )}
        </div>
    );
}
