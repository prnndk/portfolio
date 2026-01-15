'use client';

import { Toaster as Sonner } from 'sonner';
import { useAppearance } from '@/hooks/use-appearance';

export function Toaster() {
    const { appearance } = useAppearance();

    return (
        <Sonner
            theme={appearance as 'light' | 'dark' | 'system'}
            position="top-right"
            richColors
            closeButton
        />
    );
}
