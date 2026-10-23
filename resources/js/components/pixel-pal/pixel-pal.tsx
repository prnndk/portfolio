import { cn } from '@/lib/utils';
import { Footprints } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { drawBench, drawBook, drawDesk, drawGround, drawPal, drawPlant, drawWateringCan, type PalPose } from './sprites';

const STORAGE_KEY = 'pixel-pal';
/** Logical canvas height; at PX 4 this is a 144px strip. */
const H = 36;
const LINES = [
    "Hi! I'm Gading, pixel edition.",
    "Psst... scroll and I'll follow you.",
    'Brb, watering the plant.',
    'Is it coffee o’clock yet?',
    'You can send me home with the little shoes button.',
];
const SECTION_LINES: Record<string, string> = {
    projects: 'Ooh, projects!',
    tech: 'So many tools...',
    resume: 'The story so far.',
    writing: 'Reading time!',
    favorites: 'Good taste, right?',
};

type ActivityName = 'code' | 'water' | 'read' | 'sleep' | 'wander';
interface Activity {
    name: ActivityName;
    spot: number;
    pose: PalPose;
    ms: [number, number];
    say?: string;
}

/** Jakarta night owl rule: sleep between 22:00 and 05:00 local time there. */
const isNight = () => {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(new Date()));
    return hour >= 22 || hour < 5;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * A little pixel version of the site owner that lives on a strip along the bottom of the page.
 * It wanders between a desk, a plant and a bench, follows the scroll position while you scroll,
 * waves when clicked and comments on sections. Everything is drawn on one small canvas.
 */
export function PixelPal() {
    const [mounted, setMounted] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [bubble, setBubble] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const spriteRef = useRef<HTMLButtonElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const sayRef = useRef<(text: string, ms?: number) => void>(() => {});
    const waveRef = useRef<() => void>(() => {});

    // First paint decides the default: on for roomy screens, off for phones and reduced motion
    useEffect(() => {
        let stored: string | null = null;
        try {
            stored = localStorage.getItem(STORAGE_KEY);
        } catch {
            /* storage blocked: fall back to the default */
        }
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setEnabled(stored ? stored === 'on' && !reduced : window.innerWidth >= 768 && !reduced);
        setMounted(true);
    }, []);

    const toggle = () => {
        setEnabled((on) => {
            try {
                localStorage.setItem(STORAGE_KEY, on ? 'off' : 'on');
            } catch {
                /* ignore */
            }
            return !on;
        });
    };

    useEffect(() => {
        if (!enabled) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        let PX = window.innerWidth < 640 ? 3 : 4;
        let W = 0;
        const groundY = H - 2;
        let deskX = 0;
        let plantX = 0;
        let benchX = 0;
        const night = isNight();

        const state = {
            x: 30,
            dir: 1 as 1 | -1,
            pose: 'stand' as PalPose,
            mode: 'walking' as 'walking' | 'doing' | 'following' | 'wave',
            activity: null as Activity | null,
            last: null as ActivityName | null,
            until: 0,
            waveUntil: 0,
            scrollUntil: 0,
            scrollTarget: 30,
            plantStage: 1,
            plantTick: 0,
            bubbleUntil: 0,
            lastQuip: 0,
        };

        const layout = () => {
            PX = window.innerWidth < 640 ? 3 : 4;
            W = Math.ceil(window.innerWidth / PX);
            canvas.width = W;
            canvas.height = H;
            canvas.style.width = `${W * PX}px`;
            canvas.style.height = `${H * PX}px`;
            deskX = Math.round(W * 0.2);
            plantX = Math.round(W * 0.52);
            benchX = Math.round(W * 0.82);
            state.x = Math.min(state.x, W - 20);
        };
        layout();

        const activities = (): Activity[] => [
            { name: 'code', spot: deskX - 8, pose: 'sit-code', ms: [7000, 13000], say: 'Compiling...' },
            { name: 'water', spot: plantX - 14, pose: 'water', ms: [5000, 8000], say: 'Grow, little guy!' },
            { name: 'read', spot: benchX - 2, pose: 'sit-read', ms: [7000, 12000], say: 'Just one more page...' },
            { name: 'sleep', spot: benchX - 18, pose: 'sleep', ms: [18000, 32000] },
            { name: 'wander', spot: rand(14, Math.max(30, W - 30)), pose: 'stand', ms: [1500, 3200] },
        ];

        const pickNext = () => {
            const pool = activities().filter((a) => a.name !== state.last && (a.name !== 'sleep' || night));
            // At night he is mostly asleep; during the day sleeping is never an option
            const weights = pool.map((a) => (a.name === 'sleep' ? 6 : a.name === 'wander' ? 1.2 : 2));
            let roll = Math.random() * weights.reduce((s, w) => s + w, 0);
            let choice = pool[0];
            for (let i = 0; i < pool.length; i++) {
                roll -= weights[i];
                if (roll <= 0) {
                    choice = pool[i];
                    break;
                }
            }
            state.activity = choice;
            state.last = choice.name;
            state.mode = 'walking';
        };
        pickNext();

        const say = (text: string, ms = 2600) => {
            state.bubbleUntil = performance.now() + ms;
            setBubble(text);
        };
        sayRef.current = say;
        waveRef.current = () => {
            state.mode = 'wave';
            state.waveUntil = performance.now() + 1800;
            say(LINES[Math.floor(Math.random() * LINES.length)], 3200);
        };

        // Follow the scroll position so the pal "reads along"
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progress = max > 0 ? window.scrollY / max : 0;
            state.scrollTarget = 12 + progress * Math.max(0, W - 40);
            state.scrollUntil = performance.now() + 700;
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        // One-liners when a section comes into view (rate-limited)
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const line = SECTION_LINES[entry.target.id];
                    const now = performance.now();
                    if (entry.isIntersecting && line && now - state.lastQuip > 14000 && now > state.bubbleUntil) {
                        state.lastQuip = now;
                        say(line, 2400);
                    }
                }
            },
            { threshold: 0.45 },
        );
        document.querySelectorAll('main section[id]').forEach((el) => observer.observe(el));

        const onResize = () => layout();
        window.addEventListener('resize', onResize);

        let raf = 0;
        let prev = performance.now();
        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            if (document.hidden) {
                prev = now;
                return;
            }
            const dt = Math.min(0.05, (now - prev) / 1000);
            prev = now;

            const scrolling = now < state.scrollUntil;
            let pose: PalPose = 'stand';
            let speed = 0;

            if (state.mode === 'wave' && now < state.waveUntil) {
                pose = 'wave';
            } else if (scrolling) {
                state.mode = 'following';
                const diff = state.scrollTarget - state.x;
                if (Math.abs(diff) > 2) {
                    state.dir = diff > 0 ? 1 : -1;
                    speed = 62;
                    pose = 'run';
                }
            } else {
                if (state.mode === 'following' || state.mode === 'wave') {
                    pickNext();
                }
                const act = state.activity!;
                if (state.mode === 'walking') {
                    const diff = act.spot - state.x;
                    if (Math.abs(diff) > 1.5) {
                        state.dir = diff > 0 ? 1 : -1;
                        speed = 26;
                        pose = 'walk';
                    } else {
                        state.mode = 'doing';
                        state.until = now + rand(act.ms[0], act.ms[1]);
                        state.dir = 1;
                        if (act.name === 'water' && state.plantStage >= 3) state.plantStage = 0;
                        if (act.say && now > state.bubbleUntil) say(act.say, 2200);
                    }
                }
                if (state.mode === 'doing') {
                    pose = act.pose;
                    if (act.name === 'water') {
                        state.plantTick += dt;
                        if (state.plantTick > 1.3 && state.plantStage < 3) {
                            state.plantStage += 1;
                            state.plantTick = 0;
                        }
                    }
                    if (now > state.until) pickNext();
                }
            }

            if (speed) {
                state.x += Math.sign(state.dir) * speed * dt;
                state.x = Math.max(10, Math.min(W - 10, state.x));
            }
            state.pose = pose;

            // ── draw ──
            ctx.clearRect(0, 0, W, H);
            drawGround(ctx, W, groundY);
            drawPlant(ctx, plantX, groundY, state.plantStage, now);
            drawBench(ctx, benchX, groundY);
            drawDesk(ctx, deskX, groundY, now, pose === 'sit-code');
            drawPal(ctx, { x: state.x, groundY, dir: state.dir, pose, t: now });
            if (pose === 'water') drawWateringCan(ctx, state.x, groundY, state.dir, now);
            if (pose === 'sit-read') drawBook(ctx, state.x, groundY, state.dir, now);

            // DOM overlays follow the sprite
            const sprite = spriteRef.current;
            if (sprite) sprite.style.transform = `translate(${(state.x - 8) * PX}px, 0)`;
            if (state.bubbleUntil && now > state.bubbleUntil) {
                state.bubbleUntil = 0;
                setBubble(null);
            }
            const bub = bubbleRef.current;
            if (bub) bub.style.transform = `translate(${state.x * PX}px, 0) translateX(-50%)`;
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            observer.disconnect();
        };
    }, [enabled]);

    if (!mounted) return null;

    return (
        <>
            {enabled && (
                <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 print:hidden">
                    <canvas ref={canvasRef} className="block [image-rendering:pixelated]" aria-hidden="true" />
                    <button
                        ref={spriteRef}
                        type="button"
                        tabIndex={-1}
                        aria-label="Say hi to the pixel pal"
                        onClick={() => waveRef.current()}
                        className="pointer-events-auto absolute bottom-0 left-0 h-24 w-16 cursor-pointer"
                    />
                    {bubble && (
                        <div
                            ref={bubbleRef}
                            role="status"
                            className="absolute bottom-24 left-0 w-max max-w-[16rem] border-2 border-foreground bg-background px-3 py-1.5 font-mono text-xs text-foreground [box-shadow:3px_3px_0_0_var(--color-foreground)]"
                        >
                            {bubble}
                        </div>
                    )}
                </div>
            )}
            <button
                type="button"
                onClick={toggle}
                aria-pressed={enabled}
                aria-label={enabled ? 'Hide the pixel pal' : 'Show the pixel pal'}
                title={enabled ? 'Send the pixel pal home' : 'Call the pixel pal'}
                className="fixed bottom-3 left-3 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary print:hidden"
            >
                <Footprints className={cn('h-5 w-5', enabled && 'text-primary')} />
            </button>
        </>
    );
}
