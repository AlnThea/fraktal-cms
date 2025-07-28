import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Editor from '@/Components/Editor';

interface Props {
    page: {
        id: number;
        title: string;
        content: any;
    };
}

const EditPage = ({ page }: Props) => {
    const [title, setTitle] = useState(page.title);

    const handleSave = (data: string) => {
        router.put(`/pages/${page.id}`, {
            title,
            content: JSON.parse(data),
        });
    };

    return (
        <>
            <Head title="Edit Page" />
            <div className="h-screen flex flex-col">
                <div className="p-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border p-2 rounded w-full mb-4"
                        placeholder="Page Title"
                    />
                </div>
                <Editor
                    onSave={handleSave}
                    initialData={JSON.stringify(page.content || {})}
                />
            </div>
        </>
    );
};

export default EditPage;
