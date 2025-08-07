// NewPage.tsx
import React, { useRef } from 'react';
import { Head } from '@inertiajs/react';
import Editor from '@/Components/Editor';
import axios from 'axios';
import { route } from 'ziggy-js';
import Banner from '@/Components/Banner';

export default function NewPage() {
    const grapesEditorRef = useRef<any>(null); // Referensi untuk editor

    const handleSave = () => {
        const editor = grapesEditorRef.current;
        if (editor) {
            // Mengambil project data dari editor
            const projectData = editor.getProjectData();

            // Mengambil HTML dan CSS jika diperlukan
            // const htmlContent = editor.getHtml();
            // const cssContent = editor.getCss();

            console.log('📦 Project Data:', projectData);

            // Mengirim data ke server
            axios.post('/pages', {
                title: 'Untitled Page',
                content: projectData, // Kirim projectData, bukan hanya HTML/CSS
            })
                .then((res) => {
                    console.log('✅ Disimpan ke server:', res.data);
                    alert('Disimpan!');
                })
                .catch((err) => {
                    console.error('❌ Gagal simpan:', err);
                    alert('Gagal simpan!');
                });
        } else {
            alert('Editor tidak siap.');
        }
    };

    const handleLoad = () => {
        const input = prompt('Masukkan data JSON Editor:');
        const editor = grapesEditorRef.current;

        if (input && editor) {
            try {
                const data = JSON.parse(input);
                editor.loadProjectData(data); // Muat data ke editor
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
                        <span className="text-emerald-600">New Page</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-700"
                        >
                            Simpan
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
                        <Editor editorRef={grapesEditorRef} /> {/* Kirim ref ke Editor */}
                    </main>
                </div>
            </div>
        </>
    );
}
