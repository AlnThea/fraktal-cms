import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { RouteContext } from '@/Hooks/useRoute';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { route,  } from 'ziggy-js';

const appName =
    window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

// ✅ Inject global route helper ke window
(window as any).route = (name: string, params?: any, absolute?: boolean) =>
    route(name, params, absolute,);

createInertiaApp({
    title: title => `${title} - ${appName}`,
    progress: {
        color: '#4B5563',
    },
    resolve: name =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el!);
        root.render(
            <RouteContext.Provider value={(window as any).route}>
                <App {...props} />
            </RouteContext.Provider>
        );
    },
});
