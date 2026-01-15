import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
    children: ReactNode;
    defaultAppearance?: Appearance;
    storageKey?: string;
}

interface ThemeProviderState {
    appearance: Appearance;
    updateAppearance: (appearance: Appearance) => void;
}

const initialState: ThemeProviderState = {
    appearance: 'system',
    updateAppearance: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const prefersDark = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    if (typeof document === 'undefined') return;
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
};

export function initializeTheme() {
    if (typeof window === 'undefined') return;
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
    applyTheme(savedAppearance);
}

export function ThemeProvider({
    children,
    defaultAppearance = 'system',
    storageKey = 'appearance',
}: ThemeProviderProps) {
    const [appearance, setAppearance] = useState<Appearance>(
        () => (typeof window !== 'undefined' ? (localStorage.getItem(storageKey) as Appearance) : defaultAppearance) || defaultAppearance
    );

    useEffect(() => {
        applyTheme(appearance);
    }, [appearance]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (appearance === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [appearance]);

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem(storageKey, mode);
        setCookie(storageKey, mode);
    };

    return (
        <ThemeProviderContext.Provider value={{ appearance, updateAppearance }}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useAppearance = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) {
        throw new Error('useAppearance must be used within a ThemeProvider');
    }

    return context;
};
