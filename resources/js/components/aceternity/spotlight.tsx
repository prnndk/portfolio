'use client';

import { motion, type MotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

interface SpotlightProps extends MotionProps {
    children?: ReactNode;
    className?: string;
    fill?: string;
}

export function Spotlight({ children, className = '', fill = 'white', ...props }: SpotlightProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`pointer-events-none absolute inset-0 z-0 ${className}`}
            {...props}
        >
            <svg
                className="absolute h-[200%] w-[200%] animate-spotlight-rotate"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 1200"
                fill="none"
            >
                <defs>
                    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
                    </filter>
                    <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={fill} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={fill} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <ellipse
                    cx="600"
                    cy="300"
                    rx="400"
                    ry="300"
                    fill="url(#gradient)"
                    filter="url(#blur)"
                    className="opacity-50"
                />
            </svg>
            {children}
        </motion.div>
    );
}

export function SpotlightCard({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`group relative overflow-hidden rounded-xl ${className}`}>
            <motion.div
                className="pointer-events-none absolute -inset-px z-10 opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(96, 165, 250, 0.15), transparent 40%)',
                }}
            />
            {children}
        </div>
    );
}
