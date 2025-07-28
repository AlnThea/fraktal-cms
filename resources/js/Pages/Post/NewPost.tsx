// resources/js/Pages/Editor/GrapesEditorPage.tsx (atau nama file halaman Anda)
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
// Impor menggunakan nama baru 'Editor'
import Editor from '@/Components/Editor'; // Pastikan path ini benar

const NewPost = () => { // Nama halaman bisa tetap
    const [savedData, setSavedData] = useState<string | null>(null);

    const handleSave = (data: string) => {
        setSavedData(data);
        console.log('Data diterima dari editor:', data);
        // axios.post('/api/save-page', { content: data });
    };

    return (
        <>
            <Head title="Editor" />
            <div className="h-screen">
                {/* Gunakan komponen dengan nama baru */}
                <Editor onSave={handleSave} /* initialData={dataDariServer} */ />
            </div>
        </>
    );
};

export default NewPost;
