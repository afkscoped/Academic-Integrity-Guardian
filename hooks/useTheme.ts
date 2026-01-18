import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return 'dark'; // Default to dark for a premium experience
    });

    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'neon-alt' : 'dark';
            return next as 'light' | 'dark'; // Type assertion to match existing signature for now
        });
    };

    useEffect(() => {
        const root = document.body; // Applied to body per instructions
        if (theme === 'neon-alt') {
            root.classList.add('neon-alt');
            root.classList.remove('light'); // Ensure clean state
            document.documentElement.style.setProperty('color-scheme', 'dark');
        } else {
            root.classList.remove('neon-alt', 'light');
            document.documentElement.style.setProperty('color-scheme', 'dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return { theme, toggleTheme };
}
