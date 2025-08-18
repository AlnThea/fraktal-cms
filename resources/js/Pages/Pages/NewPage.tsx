// resources/js/Pages/NewPage.tsx

import React, {useRef, useState, lazy, Suspense} from 'react';
import {Head} from '@inertiajs/react';
import axios from 'axios';
import {route} from 'ziggy-js';
import Banner from '@/Components/Banner';
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import {IconArrowBackUp, IconHome} from "@tabler/icons-react";

const Editor = lazy(() => import('@/Components/Editor'));

export default function NewPage() {
    const grapesEditorRef = useRef<any>(null);
    const [pageId, setPageId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pageTitle, setPageTitle] = useState('Untitled Page');
    const [pageSlug, setPageSlug] = useState('untitled-page');
    const [pageStatus, setPageStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
    const [scheduledAt, setScheduledAt] = useState<string | null>(null);

    const generateSlug = (title: string): string => {
        return title
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .slice(0, 255);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setPageTitle(title);
        setPageSlug(generateSlug(title));
    };

    // Fungsi untuk menangani perubahan status
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as 'draft' | 'published' | 'scheduled';
        setPageStatus(newStatus);
        // Hapus scheduledAt jika status bukan 'scheduled'
        if (newStatus !== 'scheduled') {
            setScheduledAt(null);
        }
    };

    const handleSaveOrUpdate = () => {
        const editor = grapesEditorRef.current;
        if (!editor || isSaving) {
            return;
        }

        setIsSaving(true);
        const projectData = editor.getProjectData();

        const url = pageId
            ? route('pages.update', {page: pageId})
            : route('pages.store');
        const method = pageId ? 'put' : 'post';

        axios({
            method: method,
            url: url,
            data: {
                title: pageTitle,
                slug: pageSlug,
                content: projectData,
                status: pageStatus,
                // Kirim scheduled_at hanya jika statusnya 'scheduled'
                scheduled_at: pageStatus === 'scheduled' ? scheduledAt : null,
            },
        })
            .then((res) => {
                console.log('✅ Berhasil disimpan/diupdate:', res.data);
                alert('Berhasil disimpan!');
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
                <Head title="New Page"/>

                <Banner/>

                <header
                    className="fixed top-0 left-0 right-0 z-50 h-11 px-6 bg-white border-b-2 border-gray-200 flex justify-between items-center">
                    <div className="flex items-center py-4 overflow-x-auto whitespace-nowrap text-xs">
                        <a href={route('homepage')}>
                            <span className="w-auto h-7 font-bold text-teal-500">FRAKTAL CMS</span>
                        </a>
                        <div className={'mx-2'}></div>
                        <span className="text-gray-500 dark:text-gray-200">
                            <a href={route('pages.index')} title={'Back to Pages'} className="cursor-pointer hover:text-emerald-600">
                                <IconArrowBackUp size={16}/>
                            </a>
                        </span>
                        <div className={'mx-2'}></div>
                        <span className="text-gray-300 dark:text-gray-200">
                                <IconHome size={16}/>
                        </span>
                        <span className="mx-3 text-gray-300">/</span>
                        <span className="mx-3 text-gray-300 dark:text-gray-300"> Page </span>
                        <span className="mx-3 text-gray-300">/</span>
                        <span className="text-emerald-300 dark:text-gray-400 hover:text-emerald-600">{pageId ? 'Edit Page' : 'New Page'}</span>
                    </div>
                    <div className="flex gap-2">
                        <PrimaryButton
                            onClick={handleSaveOrUpdate}
                            disabled={isSaving}
                        >
                            {pageId ? 'Update' : 'Save'}
                        </PrimaryButton>
                        <PrimaryButton
                            onClick={handleLoad}
                        >
                            Insert JSON
                        </PrimaryButton>
                    </div>
                </header>

                <div className="flex pt-11 dark:bg-gray-900">
                    <main className="flex-1 w-full z-10 relative overflow-visible">
                        <div className="relative w-full h-13 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
                            <span className="absolute mx-4 top-0 text-gray-400 dark:text-gray-300 text-xs text-nowrap">Page Title:</span>
                            <TextInput
                                className={'bg-white w-full h-13 rounded-none pl-4 text-lg font-semibold focus:border-none border-none shadow-none '}
                                placeholder={'Title'}
                                value={pageTitle}
                                onChange={handleTitleChange}
                            />
                            <span className="absolute mx-4 bottom-0 text-gray-400 dark:text-gray-300 text-xs text-nowrap">Slug: <span className="text-sm font-medium">{pageSlug}</span></span>
                        </div>
                        <Suspense fallback={<div>Loading Editor...</div>}>
                            <Editor editorRef={grapesEditorRef}/>
                        </Suspense>
                    </main>
                    {/* Panel Samping untuk Status dan Scheduled At */}
                    <aside className="w-72 bg-white dark:bg-gray-800 shadow-md p-4">
                        <h2 className="text-lg font-semibold mb-4">Page Settings</h2>
                        <div className="mb-4">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                id="status"
                                value={pageStatus}
                                onChange={handleStatusChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </div>
                        {pageStatus === 'scheduled' && (
                            <div className="mb-4">
                                <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled Date & Time</label>
                                <input
                                    type="datetime-local"
                                    id="scheduled_at"
                                    value={scheduledAt || ''}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}
