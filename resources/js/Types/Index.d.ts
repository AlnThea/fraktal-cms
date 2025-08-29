// resources/js/Types/index.d.ts

import { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface PageProps<T = {}> extends InertiaPageProps<T> {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    errors: Record<string, string>;
}

export interface Page {
    id: number;
    title: string;
    content: any;
    status?: 'published' | 'draft' | 'scheduled';
    author?: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
    slug: string;
    scheduled_at?: string | null;
}

export interface Paginator {
    data: Page[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    per_page: number;
}
