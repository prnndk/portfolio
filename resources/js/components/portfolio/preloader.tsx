import { Mascot } from '@/components/portfolio/mascot';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const MIN_MS = 1500;
const root = () => document.documentElement;

type Phase = 'loading' | 'done' | 'exit';

/**
 * Full-screen intro shown once per session (the gate lives in app.blade.php, which adds `is-loading` to <html>).
 * Counts to 100 as fonts and assets finish, waves, then the orange curtain lifts and the page eases in underneath.
 */
export function Preloader() {
    const [active] = useState(() => typeof document !== 'undefined' && root().classList.contains('is-loading'));
    const [phase, setPhase] = useState<Phase>('loading');
    const [value, setValue] = useState(0);
    const [gone, setGone] = useState(false);
    const shown = useRef(0);

    useEffect(() => {
        if (!active) return;
        const start = performance.now();
        let loaded = document.readyState === 'complete';
        const onLoad = () => (loaded = true);
        window.addEventListener('load', onLoad);
        let fontsReady = false;
        document.fonts.ready.then(() => (fontsReady = true));

        let frame = 0;
        const tick = (now: number) => {
            const elapsed = now - start;
            const ready = loaded && fontsReady && elapsed >= MIN_MS;
            // crawl toward 90 on a clock; only the final stretch waits for real readiness
            const target = ready ? 100 : Math.min(90, (elapsed / MIN_MS) * 90);
            shown.current += (target - shown.current) * 0.1;
            if (ready && shown.current > 99.4) shown.current = 100;
            setValue(Math.round(shown.current));
            if (shown.current >= 100) {
                setPhase('done');
                return;
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('load', onLoad);
        };
    }, [active]);

    // short beat on 100 (mascot waves), then lift the curtain and reveal the page
    useEffect(() => {
        if (phase !== 'done') return;
        const t = setTimeout(() => {
            setPhase('exit');
            root().classList.remove('is-loading');
            root().classList.add('is-revealing');
            try {
                sessionStorage.setItem('preloaded', '1');
            } catch {
                /* private mode: the intro just plays again next visit */
            }
            setTimeout(() => root().classList.remove('is-revealing'), 1400);
        }, 550);
        return () => clearTimeout(t);
    }, [phase]);

    if (!active || gone) return null;

    return (
        <motion.div
            data-preloader
            role="status"
            aria-label="Loading"
            initial={{ y: 0 }}
            animate={{ y: phase === 'exit' ? '-105%' : 0 }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => phase === 'exit' && setGone(true)}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-primary p-6 text-[#0D0D0F] sm:p-10"
        >
            <div className="flex w-full items-center justify-between font-mono text-xs tracking-[0.14em] uppercase">
                <span>gading.</span>
                <span>Portfolio · {new Date().getFullYear()}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
                <Mascot pose={phase === 'loading' ? 'coding' : 'wave'} follow={false} className="h-56 w-48 sm:h-72 sm:w-60" />
                <p className="font-mono text-xs tracking-[0.14em] uppercase">{phase === 'loading' ? 'Booting up the portfolio' : 'Hello, world!'}</p>
            </div>

            <div className="flex w-full items-end justify-between gap-6">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#0D0D0F]/20">
                    <div className="h-full origin-left rounded-full bg-[#0D0D0F]" style={{ transform: `scaleX(${value / 100})` }} />
                </div>
                <span className="font-heading text-7xl leading-[0.8] font-extrabold tracking-[-0.06em] tabular-nums sm:text-9xl">{value}</span>
            </div>

            {/* curved lower lip so the curtain peels away rather than wiping flat */}
            <svg
                aria-hidden="true"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
                className="pointer-events-none absolute top-[calc(100%-1px)] left-0 h-[9vw] w-full fill-primary"
            >
                <path d="M0 0H100Q50 20 0 0Z" />
            </svg>
        </motion.div>
    );
}
