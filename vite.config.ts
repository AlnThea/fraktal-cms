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
            // Bisa dihapus jika tidak diperlukan, tapi tidak masalah jika dibiarkan
            // 'react/jsx-runtime.js': 'react/jsx-runtime',
            // "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
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
