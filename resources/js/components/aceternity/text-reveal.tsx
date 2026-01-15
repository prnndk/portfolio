'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface TextRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function TextReveal({ children, className = '', delay = 0 }: TextRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface TypewriterProps {
    words: string[];
    className?: string;
    cursorClassName?: string;
}

export function Typewriter({ words, className = '', cursorClassName = '' }: TypewriterProps) {
    return (
        <div className={`inline-flex items-center ${className}`}>
            <motion.span
                key={words[0]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {words.map((word, wordIndex) => (
                    <span key={wordIndex}>
                        {word.split('').map((char, charIndex) => (
                            <motion.span
                                key={`${wordIndex}-${charIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 0.05,
                                    delay: wordIndex * 0.3 + charIndex * 0.03,
                                }}
                                className="inline-block"
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        ))}
                        {wordIndex < words.length - 1 && <span> </span>}
                    </span>
                ))}
            </motion.span>
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
                className={`ml-1 inline-block h-6 w-0.5 bg-primary ${cursorClassName}`}
            />
        </div>
    );
}

interface FadeInProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
}

export function FadeIn({ children, className = '', delay = 0, direction = 'up' }: FadeInProps) {
    const directions = {
        up: { y: 40 },
        down: { y: -40 },
        left: { x: 40 },
        right: { x: -40 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
