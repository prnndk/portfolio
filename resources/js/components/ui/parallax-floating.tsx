"use client";

import React, {
    createContext,
    useContext,
    useRef,
    useCallback,
} from "react";
import { useMotionValue, useSpring, motion, useTransform, type MotionValue } from "framer-motion";

// Context to share mouse position
const MouseContext = createContext<{
    x: MotionValue<number>;
    y: MotionValue<number>;
} | undefined>(undefined);

interface FloatingProps {
    children: React.ReactNode;
    className?: string;
    sensitivity?: number;
}

export const Floating = ({
    children,
    className = "",
    sensitivity = 1,
}: FloatingProps) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Smooth out the movement
    const smoothX = useSpring(x, { damping: 50, stiffness: 400 });
    const smoothY = useSpring(y, { damping: 50, stiffness: 400 });

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const clientX = e.clientX;
            const clientY = e.clientY;

            // Calculate relative position (-0.5 to 0.5)
            const relativeX = (clientX - rect.left) / rect.width - 0.5;
            const relativeY = (clientY - rect.top) / rect.height - 0.5;

            x.set(relativeX * sensitivity * 100);
            y.set(relativeY * sensitivity * 100);
        },
        [sensitivity, x, y]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent<HTMLDivElement>) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const touch = e.touches[0];
            const clientX = touch.clientX;
            const clientY = touch.clientY;

            const relativeX = (clientX - rect.left) / rect.width - 0.5;
            const relativeY = (clientY - rect.top) / rect.height - 0.5;

            x.set(relativeX * sensitivity * 100);
            y.set(relativeY * sensitivity * 100);
        },
        [sensitivity, x, y]
    );

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <MouseContext.Provider value={{ x: smoothX, y: smoothY }}>
            <div
                ref={containerRef}
                className={`relative ${className}`}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
        </MouseContext.Provider>
    );
};

interface FloatingElementProps {
    children: React.ReactNode;
    depth?: number;
    className?: string;
}

export const FloatingElement = ({
    children,
    depth = 1,
    className = "",
}: FloatingElementProps) => {
    const context = useContext(MouseContext);

    if (!context) {
        throw new Error("FloatingElement must be used within a Floating component");
    }

    const { x, y } = context;

    const xMove = useTransform(x, (latest: number) => latest * depth);
    const yMove = useTransform(y, (latest: number) => latest * depth);

    return (
        <motion.div
            className={className}
            style={{
                x: xMove,
                y: yMove,
            }}
        >
            {children}
        </motion.div>
    );
};
