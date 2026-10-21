import { Mascot, MascotMark } from '@/components/portfolio/mascot';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const root = () => document.documentElement;
// never hold the page hostage to a slow font/CDN request
const MAX_MS = 3000;
const EASE = [0.76, 0, 0.24, 1] as const;
// Same areas the blade gate skips: the intro/transition is for the public site only
const PRIVATE_PATH = /^\/(admin|login|register|dashboard|settings|forgot-password|reset-password|verify-email|confirm-password|two-factor-challenge)/;

type Phase = 'loading' | 'done' | 'exit';

/** Orange curtain edge. `top` curves the leading edge while sliding in, otherwise the trailing edge while sliding out. */
function CurtainEdge({ position }: { position: 'top' | 'bottom' }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className={`pointer-events-none absolute left-0 h-[9vw] w-full fill-primary ${position === 'top' ? 'bottom-[calc(100%-1px)] rotate-180' : 'top-[calc(100%-1px)]'}`}
        >
            <path d="M0 0H100Q50 20 0 0Z" />
        </svg>
    );
}

/**
 * Full-screen intro. The gate lives in app.blade.php, which puts `is-loading` on <html>:
 * - first visit of a session: the full version (counter to 100, mascot waves) of about 2s
 * - any later hard load or refresh: `is-quick`, a short mark-only curtain of about 0.6s
 * Either way the orange curtain lifts and the page eases in underneath.
 */
export function Preloader() {
    const [active] = useState(() => typeof document !== 'undefined' && root().classList.contains('is-loading'));
    const [quick] = useState(() => typeof document !== 'undefined' && root().classList.contains('is-quick'));
    const [phase, setPhase] = useState<Phase>('loading');
    const [value, setValue] = useState(0);
    const [gone, setGone] = useState(false);
    const shown = useRef(0);
    const minMs = quick ? 350 : 1500;

    useEffect(() => {
        if (!active) return;
        const start = performance.now();
        let loaded = document.readyState === 'complete';
        const onLoad = () => (loaded = true);
        window.addEventListener('load', onLoad);
        let fontsReady = false;
        document.fonts.ready.then(() => (fontsReady = true));

        let frame = 0;
        let last = start;
        const tick = (now: number) => {
            const elapsed = now - start;
            const dt = now - last;
            last = now;
            // quick variant only covers hydration, so it never waits on fonts or remote images
            const ready = elapsed >= minMs && (quick || (loaded && fontsReady) || elapsed >= MAX_MS);
            if (quick) {
                if (ready) return setPhase('done');
            } else {
                // crawl toward 90 on a clock; only the final stretch waits for real readiness
                const target = ready ? 100 : Math.min(90, (elapsed / minMs) * 90);
                // time-based easing so a throttled (background) tab still finishes on schedule
                shown.current += (target - shown.current) * (1 - Math.exp(-dt / 110));
                if (ready && shown.current > 99.4) shown.current = 100;
                setValue(Math.round(shown.current));
                if (shown.current >= 100) return setPhase('done');
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('load', onLoad);
        };
    }, [active, quick, minMs]);

    // short beat (mascot waves on the full version), then lift the curtain and reveal the page
    useEffect(() => {
        if (phase !== 'done') return;
        const t = setTimeout(
            () => {
                setPhase('exit');
                root().classList.remove('is-loading', 'is-quick');
                root().classList.add(quick ? 'is-revealing-quick' : 'is-revealing');
                try {
                    sessionStorage.setItem('preloaded', '1');
                } catch {
                    /* private mode: the full intro just plays again next visit */
                }
                setTimeout(() => root().classList.remove('is-revealing', 'is-revealing-quick'), 1400);
            },
            quick ? 80 : 550,
        );
        return () => clearTimeout(t);
    }, [phase, quick]);

    if (!active || gone) return null;

    return (
        <motion.div
            data-preloader
            role="status"
            aria-label="Loading"
            initial={{ y: 0 }}
            animate={{ y: phase === 'exit' ? '-105%' : 0 }}
            transition={{ duration: quick ? 0.6 : 1, ease: EASE }}
            onAnimationComplete={() => phase === 'exit' && setGone(true)}
            className="fixed inset-0 z-100 flex flex-col items-center justify-between bg-primary p-6 text-[#0D0D0F] sm:p-10"
        >
            {quick ? (
                <div className="m-auto flex flex-col items-center gap-4">
                    <MascotMark className="size-20 [animation:var(--animate-bob)]" />
                    <span className="font-mono text-xs tracking-[0.14em] uppercase">gading.</span>
                </div>
            ) : (
                <>
                    <div className="flex w-full items-center justify-between font-mono text-xs tracking-[0.14em] uppercase">
                        <span>gading.</span>
                        <span>Portfolio · {new Date().getFullYear()}</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <Mascot pose={phase === 'loading' ? 'coding' : 'wave'} follow={false} className="h-56 w-48 sm:h-72 sm:w-60" />
                        <p className="font-mono text-xs tracking-[0.14em] uppercase">
                            {phase === 'loading' ? 'Booting up the portfolio' : 'Hello, world!'}
                        </p>
                    </div>

                    <div className="flex w-full items-end justify-between gap-6">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#0D0D0F]/20">
                            <div className="h-full origin-left rounded-full bg-[#0D0D0F]" style={{ transform: `scaleX(${value / 100})` }} />
                        </div>
                        <span className="font-heading text-7xl leading-[0.8] font-extrabold tracking-[-0.06em] tabular-nums sm:text-9xl">
                            {value}
                        </span>
                    </div>
                </>
            )}
            <CurtainEdge position="bottom" />
        </motion.div>
    );
}

/** Quick curtain between pages: slides up over the old page, lifts away once the new one has rendered. */
export function NavLoader() {
    const [show, setShow] = useState(false);
    const startedAt = useRef(0);
    const active = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const offStart = router.on('start', (event) => {
            const { visit } = event.detail;
            // only full page-to-page moves: skip form posts, partial reloads, same-page filters and the admin area
            const eligible =
                visit.method === 'get' &&
                !visit.only.length &&
                !visit.preserveState &&
                visit.url.pathname !== window.location.pathname &&
                !PRIVATE_PATH.test(visit.url.pathname) &&
                !PRIVATE_PATH.test(window.location.pathname);
            if (!eligible) return;
            clearTimeout(timer.current);
            startedAt.current = Date.now();
            active.current = true;
            setShow(true);
        });

        const offFinish = router.on('finish', () => {
            if (!active.current) return;
            const wait = Math.max(0, 220 - (Date.now() - startedAt.current));
            timer.current = setTimeout(() => {
                active.current = false;
                root().classList.add('is-revealing-quick');
                setShow(false);
                setTimeout(() => root().classList.remove('is-revealing-quick'), 800);
            }, wait);
        });

        return () => {
            offStart();
            offFinish();
            clearTimeout(timer.current);
        };
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="nav-loader"
                    role="status"
                    aria-label="Loading page"
                    initial={{ y: '105%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-105%' }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="fixed inset-0 z-90 flex items-center justify-center bg-primary"
                >
                    <CurtainEdge position="top" />
                    <MascotMark className="size-16 [animation:var(--animate-bob)]" />
                    <CurtainEdge position="bottom" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
