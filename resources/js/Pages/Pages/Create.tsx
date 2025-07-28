import React from 'react';
import { Head } from '@inertiajs/react';
import Editor from '@/Components/Editor';import axios from 'axios';

const NewPage = () => {

    // ✅ Fungsi yang dipanggil saat tombol "Simpan" ditekan dari dalam komponen Editor
    const handleSave = (data: string) => {
        console.log('🔥 handleSave dipanggil dari <Editor>');

        try {
            const parsed = JSON.parse(data);
            console.log('📦 Parsed Data:', parsed);

            axios.post('/pages', {
                title: 'Untitled Page',
                content: parsed,
            })
                .then((res) => {
                    console.log('✅ Disimpan ke server:', res.data);
                    alert('Disimpan!');
                })
                .catch((err) => {
                    console.error('❌ Gagal simpan:', err);
                    alert('Gagal simpan!');
                });
        } catch (e) {
            alert('Data tidak valid');
            console.error('❌ JSON Parse Error:', e);
        }
    };

    return (
        <>
            <Head title="Editor" />
            <div className="h-screen">
                {/* 🟢 Kirim handleSave sebagai prop */}
                <Editor onSave={handleSave} />
            </div>
        </>
    );
};

export default NewPage;
