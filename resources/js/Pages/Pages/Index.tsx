import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from "@/Layouts/AppLayout";
import React from "react";

// Definisikan interface Page
export interface Page {
    id: number;
    title: string;
    content: any; // atau bisa lebih spesifik, misal Record<string, any>
    status?: 'published' | 'draft'; // optional berdasarkan data JSON
    author?: {
        id: number;
        name: string;
    } | null; // optional dan bisa null berdasarkan data JSON
    created_at: string; // format ISO string dari backend
    updated_at: string;
}

// Definisikan interface PageProps
interface PageProps {
    pages: Page[];
    // tambahkan props lain dari Inertia jika diperlukan, misal:
    // auth?: any;
    // errors?: any;
    // flash?: any;
}

// Gunakan PageProps untuk mengetik props komponen
export default function Index({ pages }: PageProps) {
    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus halaman ini?')) {
            router.delete(route('pages.destroy', id));
        }
    };

    return (
        <AppLayout
            title="All Pages"
            breadcrumb={() => (
                <>
                    <div className={'flex items-center'}>
                        <span className="mx-3 text-gray-300 dark:text-gray-300"> / </span>
                    </div>
                    <div className={'flex items-center'}>
                        <span className="mx-3 text-gray-300 dark:text-gray-300"> Page </span>
                    </div>
                    <div className={'flex items-center'}>
                        <span className="mx-3 text-gray-300 dark:text-gray-300"> / </span>
                    </div>
                </>
            )}
            renderHeader={() => (
                <span className="">All Pages</span>
            )}
        >
            <div className="py-12">
                <div className="">
                    <div
                        className="w-full dark:bg-gray-800 dark:bg-gradient-to-bl dark:from-gray-700/50 dark:via-transparent border-b border-gray-200 dark:border-gray-700">
                        <div className="w-full">
                            <h1 className="text-xl font-bold mb-4">Pages</h1>

                            <div className={'flex gap-2 text-xs my-4'}>
                                {/* Gunakan panjang array untuk nilai dinamis */}
                                <span>All ({pages.length})</span>
                                <span>|</span>
                                {/* Hitung Published dan Draft jika perlu, atau hardcode untuk sementara */}
                                {/* Misal, hitung status jika ada */}
                                <span>Published ({pages.filter(p => p.status === 'published').length})</span>
                                <span>|</span>
                                <span>Draft ({pages.filter(p => p.status !== 'published').length})</span>

                                <Link href={route('pages.create')} className="text-blue-600 underline">
                                    + New Page
                                </Link>
                            </div>

                            <div className={'mt-8 bg-white w-full dark:bg-gray-800'}>
                                <table className={'w-full'}>
                                    <thead>
                                    <tr className={'border-b border-gray-200 shadow'}>
                                        <td className="px-4 py-2 w-10"><input type={'checkbox'} /></td>
                                        <td className="flex justify-start px-3 py-2">
                                            <div>Title</div>
                                        </td>
                                        <td className="justify-start px-3 py-2">Author</td>
                                        <td className="justify-start px-3 py-2">Comment</td>
                                        <td className="justify-start px-3 py-2">Date</td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Ketik parameter page sebagai Page */}
                                    {pages.map((page: Page) => (
                                        <tr key={page.id} className={'border-b border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}>
                                            <td className="px-4 py-2"><input type={'checkbox'} /></td>
                                            <td className="px-4 py-2">
                                                <div>
                                                    {page.title} - {page.status ? (page.status.charAt(0).toUpperCase() + page.status.slice(1)) : 'Draft'}
                                                    <div>
                                                        <Link
                                                            href={route('pages.edit', page.id)}
                                                            className="text-sm text-green-600 underline"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(page.id)}
                                                            className="text-sm text-red-600 underline ml-2"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 justify-center">
                                                <div className={'text-xs'}>
                                                    {page.author?.name || 'N/A'} {/* Gunakan optional chaining */}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 justify-center">-</td>
                                            <td className="px-4 py-2 justify-center">
                                                <div className={'text-xs'}>Updated at</div>
                                                <div className={'text-xs'}>
                                                    {/* Gunakan updated_at untuk tanggal "Updated at" */}
                                                    {page.updated_at
                                                        ? `${new Date(page.updated_at).toLocaleDateString()} ${new Date(page.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
