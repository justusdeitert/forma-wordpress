/**
 * Forma Favicon — UnoCSS Configuration
 *
 * Shared design tokens (colors, breakpoints, etc.) should stay in sync
 * with the theme's uno.config.ts for visual consistency.
 *
 * @package FormaFavicon
 */
import { defineConfig, presetWind } from 'unocss';
import type { Theme } from '@unocss/preset-wind';

export default defineConfig<Theme>({
    content: {
        pipeline: {
            include: [
                /\.(vue|svelte|[jt]sx?|mdx?|astro|html|php)($|\?)/,
            ],
            exclude: [
                'node_modules',
                '.git',
                /\.json$/,
            ],
        },
        filesystem: [
            '**/*.{css,scss}',
        ],
    },
    presets: [
        presetWind(),
    ],
    theme: {
        colors: {
            primary: {
                DEFAULT: '#0d6efd',
                50: '#eff6ff',
                100: '#dbeafe',
                200: '#bfdbfe',
                300: '#93c5fd',
                400: '#60a5fa',
                500: '#0d6efd',
                600: '#0a58ca',
                700: '#084298',
                800: '#1e40af',
                900: '#1e3a8a',
            },
            secondary: {
                DEFAULT: '#6c757d',
                dark: '#565e64',
                darker: '#41464b',
            },
            dark: '#212529',
            light: '#f8f9fa',
            success: '#198754',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#0dcaf0',
        },
        breakpoints: {
            xs: '375px',
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
        },
    },
});
