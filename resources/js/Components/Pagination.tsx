// Components/Pagination.tsx
import { Link } from '@inertiajs/react';

interface PaginationProps {
    links: { url: string | null; label: string; active: boolean }[];
}

export default function Pagination({ links }: PaginationProps) {
    // Pastikan ada setidaknya 3 link: 'previous', '...p...', 'next'
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-6 flex justify-end">
            <nav className="flex items-center space-x-2">
                {links.map((link, key) => (
                    <Link
                        key={key}
                        href={link.url || '#'}
                        className={`
                            px-3 py-1 rounded-md text-sm font-medium
                            ${link.active
                            ? 'outline-2 outline-teal-400 text-teal-500 bg-white'
                            : 'outline-2 outline-teal-400 text-teal-500 bg-teal-100/40 hover:bg-teal-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                            ${!link.url ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveState
                        replace
                    />
                ))}
            </nav>
        </div>
    );
}
