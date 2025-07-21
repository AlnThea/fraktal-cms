import { Head } from '@inertiajs/react';
import React, { PropsWithChildren, useState } from 'react';

interface Props {
    title: string;
    renderHeader?(): JSX.Element;
}

export default function AppLayout({ title, children, }: PropsWithChildren<Props>) {
    useState(false);
    return (
        <div>
            <Head title={title} />
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                {/* <!-- Page Content --> */}
                <main>{children}</main>
            </div>
        </div>
    );
}
