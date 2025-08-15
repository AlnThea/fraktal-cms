// resources/js/Pages/NewPage.tsx

import React, { useRef, useState, lazy, Suspense } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { route } from 'ziggy-js';
import Banner from '@/Components/Banner';
import AppLayout from '@/Layouts/AppLayout';
const Editor = lazy(() => import('@/Components/Editor'));
export default function NewPage() {
    const grapesEditorRef = useRef<any>(null);
    const [pageId, setPageId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pageTitle, setPageTitle] = useState('Untitled Page');

    // Menangani aksi simpan atau update
    const handleSaveOrUpdate = () => {
        const editor = grapesEditorRef.current;
        if (!editor || isSaving) {
            return;
        }

        setIsSaving(true);
        const projectData = editor.getProjectData();

        // Menentukan URL dan metode HTTP berdasarkan status pageId
        const url = pageId
            ? route('pages.update', { page: pageId })
            : route('pages.store');
        const method = pageId ? 'put' : 'post';

        axios({
            method: method,
            url: url,
            data: {
                title: pageTitle,
                content: projectData,
            },
        })
            .then((res) => {
                console.log('✅ Berhasil disimpan/diupdate:', res.data);
                alert('Berhasil disimpan!');

                // Jika ini adalah POST request pertama, simpan ID halaman
                if (method === 'post' && res.data.id) {
                    setPageId(res.data.id);
                }
            })
            .catch((err) => {
                console.error('❌ Gagal menyimpan/mengupdate:', err.response || err);
                alert('Gagal menyimpan!');
            })
            .finally(() => {
                setIsSaving(false);
            });
    };

    const handleLoad = () => {
        const input = prompt('Masukkan data JSON Editor:');
        const editor = grapesEditorRef.current;

        if (input && editor) {
            try {
                const data = JSON.parse(input);
                editor.loadProjectData(data);
            } catch (e) {
                alert('Data tidak valid');
                console.error('❌ JSON Parse Error:', e);
            }
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-200 text-gray-800 dark:text-gray-100">
                <Head title="New Page" />

                <Banner />

                <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 bg-white border-b-2 border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <a href={route('homepage')}>
                            <span className="w-auto h-7 font-bold text-teal-500">FRAKTAL CMS</span>
                        </a>
                        <span className="mx-3 text-gray-300">/</span>
                        <span className="text-emerald-600">{pageId ? 'Edit Page' : 'New Page'}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveOrUpdate}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                            disabled={isSaving}
                        >
                            {pageId ? 'Update' : 'Simpan'}
                        </button>
                        <button
                            onClick={handleLoad}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-700"
                        >
                            Muat
                        </button>
                    </div>
                </header>

                <div className="flex pt-20 dark:bg-gray-900">
                    <main className="w-screen pr-6 z-10 relative overflow-visible">
                        <Suspense fallback={<div>Loading Editor...</div>}>
                            <Editor editorRef={grapesEditorRef} />
                        </Suspense>
                    </main>
                </div>
            </div>
        </>
    );
}
