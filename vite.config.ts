// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig(() => ({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        // Hapus konfigurasi babel khusus
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },

    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
        ],
    },

    ssr: {
        noExternal: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            '@inertiajs/server',
        ],
    },

    build: {
        rollupOptions: {
            external: [],
        },
    },
}));
