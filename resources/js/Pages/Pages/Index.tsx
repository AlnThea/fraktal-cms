import { PageProps, Page } from '@/Types/Index';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props extends PageProps {
    pages: Page[];
}

export default function Index({ pages }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus halaman ini?')) {
            router.delete(route('pages.destroy', id));
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-xl font-bold mb-4">Pages  </h1>

            <Link href={route('pages.create')} className="text-blue-600 underline">
                + New Page
            </Link>

            <ul className="mt-4 space-y-2">
                {pages.map((page) => (
                    <li key={page.id} className="border p-2 rounded">
                        <strong>{page.title}</strong>
                        <div className="flex gap-2 mt-2">
                            <Link
                                href={route('pages.edit', page.id)}
                                className="text-sm text-green-600 underline"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(page.id)}
                                className="text-sm text-red-600 underline"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
