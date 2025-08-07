// EditPage.tsx
import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import Editor from '@/Components/Editor';
import Banner from "@/Components/Banner";
import {route} from "ziggy-js";

interface Props {
    page: {
        id: number;
        title: string;
        content: any; // Ini sekarang adalah objek/array, bukan string
    };
}

const EditPage = ({ page }: Props) => {
    const [title, setTitle] = useState(page.title);
    const grapesEditorRef = useRef<any>(null);

    const handleSave = () => {
        const editor = grapesEditorRef.current;
        if (editor) {
            const projectData = editor.getProjectData();
            router.put(`/pages/${page.id}`, {
                title,
                content: projectData,
            });
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-200 text-gray-800 dark:text-gray-100">
                <Head title="Edit Page" />

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
                    </div>
                </header>

                <div className="flex flex-col pt-20 dark:bg-gray-900">

                    <main className="w-screen pr-6 z-10 relative overflow-visible">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 rounded w-full mb-4"
                            placeholder="Page Title"
                        />
                        <Editor
                            editorRef={grapesEditorRef}
                            initialData={page.content || {}} // Kirim objek langsung
                        />
                    </main>
                </div>
            </div>
        </>
    );
};

export default EditPage;
