// resources/js/Pages/NewPage.tsx

import React, {useRef, useState, lazy, Suspense} from 'react';
import {Head} from '@inertiajs/react';
import axios from 'axios';
import {route} from 'ziggy-js';
import Banner from '@/Components/Banner';
import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import {IconArrowBackUp, IconHome} from "@tabler/icons-react";

const Editor = lazy(() => import('@/Components/Editor'));

export default function NewPage() {
    const grapesEditorRef = useRef<any>(null);
    const [pageId, setPageId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pageTitle, setPageTitle] = useState('Untitled Page');
    const [pageSlug, setPageSlug] = useState('untitled-page'); // State baru untuk slug

    // Fungsi untuk menghasilkan slug dari judul
    const generateSlug = (title: string): string => {
        return title
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')       // Ganti spasi dengan tanda hubung
            .replace(/[^\w-]+/g, '')     // Hapus karakter non-word
            .replace(/--+/g, '-')        // Ganti multiple tanda hubung
            .slice(0, 255);               // Batasi panjang slug hingga 255 karakter
    };

    // Menangani perubahan input judul
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setPageTitle(title);
        setPageSlug(generateSlug(title));
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
                slug: pageSlug, // Mengirim slug bersama data
                content: projectData,
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
                        <span className="text-gray-300 dark:text-gray-200">
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
                </div>
            </div>
        </>
    );
}
