import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from "@/Layouts/AppLayout";
import React, { useState, useEffect, useRef } from "react";
import TextInput from "@/Components/TextInput";
import {
    IconBubbleText,
    IconChevronDown,
    IconChevronUp,
    IconLineDashed,
    IconPencil,
    IconSearch,
    IconTrash,
    IconCheck,
    IconClock,
} from '@tabler/icons-react';

// Definisikan interface Page
export interface Page {
    id: number;
    title: string;
    content: any;
    status?: 'published' | 'draft' | 'scheduled';
    author?: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
    slug: string;
    scheduled_at?: string | null;
}

// Definisikan interface Paginator
export interface Paginator {
    data: Page[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    per_page: number;
}

// Definisikan interface PageProps
interface PageProps {
    pages: Paginator;
    filters: {
        perPage: number;
        search: string;
        sortColumn: string;
        sortDirection: string;
    };
}

// Fungsi debounce untuk pencarian
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Fungsi utilitas untuk memotong string
const truncateString = (str: string, num: number) => {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
};

export default function Index({ pages, filters }: PageProps) {
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [hoverRowId, setHoverRowId] = useState<number | null>(null);
    const [perPage, setPerPage] = useState(filters.perPage || 10);
    const [search, setSearch] = useState(filters.search || '');
    const [sortColumn, setSortColumn] = useState(filters.sortColumn || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sortDirection || 'desc');

    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [pageToScheduleId, setPageToScheduleId] = useState<number | null>(null);
    const [scheduledDateTime, setScheduledDateTime] = useState('');

    const isInitialMount = useRef(true);

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(route('pages.index'), {
            search: debouncedSearch,
            perPage: perPage,
            sortColumn: sortColumn,
            sortDirection: sortDirection,
        }, {
            preserveState: true,
            replace: true,
        } as any); // <--- Perbaikan di sini
    }, [debouncedSearch, perPage, sortColumn, sortDirection]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = pages.data.map(page => page.id);
            setSelectedPages(prev => [...new Set([...prev, ...allIds])]);
        } else {
            const currentIds = pages.data.map(page => page.id);
            setSelectedPages(prev => prev.filter(pageId => !currentIds.includes(pageId)));
        }
    };

    const handleSelectPage = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) {
            setSelectedPages(prev => [...prev, id]);
        } else {
            setSelectedPages(prev => prev.filter(pageId => pageId !== id));
        }
    };

    const handleDeleteSelected = () => {
        if (selectedPages.length === 0) {
            alert("Pilih halaman yang ingin dihapus terlebih dahulu.");
            return;
        }

        if (confirm(`Yakin ingin menghapus ${selectedPages.length} halaman yang dipilih?`)) {
            router.delete(route('pages.destroy.multiple'), {
                data: { ids: selectedPages },
                onSuccess: () => {
                    setSelectedPages([]);
                },
            });
        }
    };

    const handleDeleteSingle = (id: number) => {
        if (confirm('Yakin ingin menghapus halaman ini?')) {
            router.delete(route('pages.destroy', id), {
                onSuccess: () => {
                    setSelectedPages(prev => prev.filter(pageId => pageId !== id));
                }
            });
        }
    };

    const handleUpdateStatus = (id: number, status: 'published' | 'draft') => {
        router.put(route('pages.update.status', { page: id }), { status }, {
            onSuccess: () => {
                router.reload({ preserveState: true } as any);
            }
        });
    };

    const handleOpenScheduleModal = (id: number) => {
        setPageToScheduleId(id);
        setIsScheduleModalOpen(true);
    };

    const handleSchedulePage = () => {
        if (!pageToScheduleId || !scheduledDateTime) {
            alert("Tanggal dan waktu harus diisi.");
            return;
        }

        router.put(route('pages.update.status', { page: pageToScheduleId }), {
            status: 'scheduled',
            scheduled_at: scheduledDateTime,
        }, {
            onSuccess: () => {
                setIsScheduleModalOpen(false);
                setPageToScheduleId(null);
                setScheduledDateTime('');
                router.reload({ preserveState: true } as any);
            },
        });
    };

    const handleUpdateSelectedStatus = (status: 'published' | 'draft' | 'scheduled') => {
        if (selectedPages.length === 0) {
            alert("Pilih halaman yang ingin diubah statusnya terlebih dahulu.");
            return;
        }

        if (confirm(`Yakin ingin mengubah status ${selectedPages.length} halaman menjadi ${status}?`)) {
            router.put(route('pages.update.multiple.status'), {
                ids: selectedPages,
                status: status
            }, {
                onSuccess: () => {
                    setSelectedPages([]);
                },
                onError: (errors) => { // <-- Tambahkan bagian ini
                    console.error('Terjadi kesalahan:', errors);
                },
            });
        }
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setPerPage(value);
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const isAllCurrentPagesSelected = pages.data.every(page => selectedPages.includes(page.id));

    const renderSortIcon = (column: string) => {
        if (sortColumn !== column) {
            return null;
        }
        return sortDirection === 'asc'
            ? <IconChevronUp size={16} className="inline-block ml-1" />
            : <IconChevronDown size={16} className="inline-block ml-1" />;
    };

    return (
        <AppLayout
            title="All Pages"
            breadcrumb={() => (
                <>
                    <div className={'flex items-center'}>
                        <span className="mx-3 text-gray-300 dark:text-gray-300"> / </span>
                    </div>
                    <div className={'flex items-center'}>
                        <span className="mx-3 text-gray-300 dark:text-gray-300"> Page </span>
                    </div>
                    <div className={'flex items-center'}>
                        <span className="mx-3 text-gray-300 dark:text-gray-300"> / </span>
                    </div>
                </>
            )}
            renderHeader={() => (
                <span className="">All Pages</span>
            )}
        >
            <div className="py-12">
                <div className="w-full">
                    <div
                        className="w-full dark:bg-gray-800 dark:bg-gradient-to-bl dark:from-gray-700/50 dark:via-transparent">
                        <div className="w-full">
                            <h1 className="text-xl font-bold mb-4">Pages</h1>
                            <div className={'flex justify-between items-center gap-2 text-xs my-4'}>
                                <div className={'flex gap-2'}>
                                    <span>All ({pages.total})</span>
                                    <span>|</span>
                                    <span>Published ({pages.data.filter(p => p.status === 'published').length})</span>
                                    <span>|</span>
                                    <span>Draft ({pages.data.filter(p => p.status !== 'published').length})</span>

                                </div>
                                <div className="relative justify-end">
                                    <TextInput
                                        type="text"
                                        placeholder="Search pages..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className={'rounded-md shadow-sm text-sm py-2 px-3 pl-8 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'}
                                    />
                                    <div className={'w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400'}>
                                        <IconSearch size={16}/>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-2 mt-8 mb-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="perPage" className={'text-sm'}>per page:</label>
                                    <select
                                        id="perPage"
                                        value={perPage}
                                        onChange={handlePerPageChange}
                                        className="text-sm"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                                <div className={'flex items-center text-xs '}>
                                    <div className={`bg-white px-4 py-1  hover:bg-teal-300 ${selectedPages.length > 0  ? 'rounded-l-2xl ease-in-out duration-300':'rounded-2xl'}`}>
                                        <Link href={route('pages.create')} className="text-blue-600 ">
                                            + New Page
                                        </Link>
                                    </div>

                                    {selectedPages.length > 0 && (
                                        <div className={'flex items-center gap-2 bg-white rounded-r-2xl'}>
                                            <div className={'flex items-center px-3 py-1 hover:bg-teal-300 '}>
                                                <button
                                                    onClick={() => handleUpdateSelectedStatus('published')}
                                                    className="cursor-pointer text-teal-600 hover:text-teal-800 "
                                                >
                                                    <div className={'flex gap-1'}>
                                                        <IconCheck size={16}/> Publish Selected ({selectedPages.length})
                                                    </div>
                                                </button>
                                            </div>
                                            <div className={'flex items-center px-3 py-1 hover:bg-teal-300 '}>
                                                <button
                                                    onClick={() => handleUpdateSelectedStatus('draft')}
                                                    className="cursor-pointer text-gray-600 hover:text-gray-800"
                                                >
                                                    <div className={'flex gap-1'}>
                                                        <IconLineDashed size={16}/> Draft Selected ({selectedPages.length})
                                                    </div>
                                                </button>
                                            </div>
                                            <div className={'flex items-center px-3 py-1 hover:bg-teal-300 '}>
                                                <button onClick={handleDeleteSelected} className="text-red-600 cursor-pointer ">
                                                    <div className={'flex gap-1'}>
                                                        <IconTrash size={16}/> Delete Selected ({selectedPages.length})
                                                    </div>
                                                </button>
                                            </div>
                                            <div className={'flex items-center px-3 py-1 hover:bg-teal-300 '}>
                                                {/* Tambahkan tombol 'Schedule' jika diperlukan */}
                                                <button
                                                    onClick={() => handleUpdateSelectedStatus('scheduled')}
                                                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                                                >
                                                    <div className={'flex gap-1'}>
                                                        <IconClock size={16}/> Schedule Selected ({selectedPages.length})
                                                    </div>
                                                </button>
                                            </div>

                                        </div>
                                    )}
                                </div>

                            </div>
                            <div className={' bg-white w-full dark:bg-gray-800 rounded-2xl shadow shadow-teal-300'}>
                                <table className={'w-full'}>
                                    <thead>
                                    <tr className={'text-gray-500 text-sm font-bold shadow '}>
                                        <td className="px-4 py-2 w-10">
                                            <input
                                                type={'checkbox'}
                                                onChange={handleSelectAll}
                                                checked={isAllCurrentPagesSelected}
                                            />
                                        </td>
                                        <td className="px-3 py-2 cursor-pointer" onClick={() => handleSort('title')}>
                                            <div className="flex items-center">
                                                <span>Title</span>
                                                {renderSortIcon('title')}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 cursor-pointer" onClick={() => handleSort('author')}>
                                            <div className="flex items-center">
                                                <span>Author</span>
                                                {renderSortIcon('author')}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span><IconBubbleText /></span>
                                        </td>
                                        <td className="px-3 py-2 cursor-pointer" onClick={() => handleSort('updated_at')}>
                                            <div className="flex items-center">
                                                <span>Date</span>
                                                {renderSortIcon('updated_at')}
                                            </div>
                                        </td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {pages.data.map((page: Page) => (
                                        <tr key={page.id} className={'bg-slate-100 border-b border-gray-200 hover:bg-slate-200 dark:hover:bg-gray-700'}
                                            onMouseEnter={() => setHoverRowId(page.id)}
                                            onMouseLeave={() => setHoverRowId(null)}
                                        >
                                            <td className="px-4 py-2">
                                                <input
                                                    type={'checkbox'}
                                                    checked={selectedPages.includes(page.id)}
                                                    onChange={(e) => handleSelectPage(e, page.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col  ">
                                                    <div className={'flex items-center'}>
                                                        {truncateString(page.title, 50)} <IconLineDashed />
                                                        <span className={'ml-1 text-sm font-bold text-gray-400'}>
                                                            {page.status ? (page.status.charAt(0).toUpperCase() + page.status.slice(1)) : 'Draft'}
                                                        </span>
                                                    </div>
                                                    <div className={`flex justify-between items-center ${hoverRowId === page.id ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300`}>
                                                        <div className={'flex'}>
                                                            <Link
                                                                href={route('pages.edit', { slug: page.slug, page: page.id })}
                                                                className="text-sm hover:text-teal-500"
                                                            >
                                                                <div className={'flex gap-1'}>
                                                                    <IconPencil size={16}/> Edit
                                                                </div>
                                                            </Link>
                                                            <span className={'mx-2 text-sm text-gray-400'}>|</span>
                                                            <button
                                                                onClick={() => handleDeleteSingle(page.id)}
                                                                className="text-sm cursor-pointer text-red-600 hover:text-red-800"
                                                            >
                                                                <div className={'flex gap-1'}>
                                                                    <IconTrash size={16}/> Trash
                                                                </div>
                                                            </button>
                                                        </div>
                                                        <div>
                                                            <div className={'flex'}>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(page.id, 'published')}
                                                                    className="text-sm cursor-pointer text-teal-600 hover:text-teal-800"
                                                                >
                                                                    <div className={'flex gap-1'}>
                                                                        <IconCheck size={16}/> Publish
                                                                    </div>
                                                                </button>
                                                                <span className={'mx-2 text-sm text-gray-400'}>|</span>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(page.id, 'draft')}
                                                                    className="text-sm cursor-pointer text-gray-600 hover:text-gray-800"
                                                                >
                                                                    <div className={'flex gap-1'}>
                                                                        <IconLineDashed size={16}/> Draft
                                                                    </div>
                                                                </button>
                                                                <span className={'mx-2 text-sm text-gray-400'}>|</span>
                                                                <button
                                                                    onClick={() => handleOpenScheduleModal(page.id)} // <--- Ubah di sini
                                                                    className="text-sm cursor-pointer text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <div className={'flex gap-1'}>
                                                                        <IconClock size={16}/> Schedule
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 justify-center">
                                                <div className={'text-xs'}>
                                                    {page.author?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 justify-center">-</td>
                                            <td className="px-4 py-2 justify-center">
                                                <div className={'text-xs'}>Updated at</div>
                                                <div className={'text-xs'}>
                                                    {page.updated_at
                                                        ? `${new Date(page.updated_at).toLocaleDateString()} ${new Date(page.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr className={'text-gray-500 text-sm font-bold  '}>
                                        <td className="px-4 py-2 w-10">
                                            <input
                                                type={'checkbox'}
                                                onChange={handleSelectAll}
                                                checked={isAllCurrentPagesSelected}
                                            />
                                        </td>
                                        <td className="px-3 py-2 cursor-pointer" onClick={() => handleSort('title')}>
                                            <div className="flex items-center">
                                                <span>Title</span>
                                                {renderSortIcon('title')}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 cursor-pointer" onClick={() => handleSort('author')}>
                                            <div className="flex items-center">
                                                <span>Author</span>
                                                {renderSortIcon('author')}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span><IconBubbleText /></span>
                                        </td>
                                        <td className="px-3 py-2 cursor-pointer" onClick={() => handleSort('updated_at')}>
                                            <div className="flex items-center">
                                                <span>Date</span>
                                                {renderSortIcon('updated_at')}
                                            </div>
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {pages.links.length > 3 && (
                                <div className="mt-6 flex justify-end">
                                    <nav className="flex items-center space-x-2">
                                        {pages.links.map((link, key) => (
                                            <Link
                                                key={key}
                                                href={link.url || '#'}
                                                className={`
                                                    px-3 py-2 rounded-md text-sm font-medium
                                                    ${link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                                                    ${!link.url ? 'cursor-not-allowed opacity-50' : ''}
                                                `}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                preserveState
                                                replace
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {isScheduleModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white p-6 rounded-lg shadow-xl dark:bg-gray-800">
                                        <h2 className="text-xl font-bold mb-4">Schedule Page</h2>
                                        <div className="mb-4">
                                            <label htmlFor="scheduled-at" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Scheduled At:
                                            </label>
                                            <input
                                                type="datetime-local"
                                                id="scheduled-at"
                                                value={scheduledDateTime}
                                                onChange={(e) => setScheduledDateTime(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => setIsScheduleModalOpen(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSchedulePage}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                            >
                                                Schedule
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
