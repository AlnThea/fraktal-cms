import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from "@/Layouts/AppLayout";
import React, { useState, useEffect, useRef } from "react";
import TextInput from "@/Components/TextInput";
import Modal from '@alnthea/react-tailwind-modal';
import PageTable from "@/Components/Table";
import Pagination from "@/Components/Pagination";


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
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

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

    const [isModalOpen, setIsModalOpen] = useState(false);

    const closeModal = () => {
        setIsModalOpen(false);
    };

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
        setIsModalOpen(true);
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
        setIsModalOpen(false);
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
                        <span className="mx-1 lg:mx-3 text-gray-300 dark:text-gray-300"> / </span>
                    </div>
                    <div className={'flex items-center'}>
                        <span className="mx-1 lg:mx-3 text-gray-300 dark:text-gray-300"> Page </span>
                    </div>
                    <div className={'flex items-center'}>
                        <span className="mx-1 lg:mx-3 text-gray-300 dark:text-gray-300"> / </span>
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
                            <h1 className="text-xl font-bold mb-2">Pages</h1>
                            <div className={'flex justify-between items-center gap-2 text-xs'}>
                                <div className={'flex gap-2'}>
                                    <span>All ({pages.total})</span>
                                    <span>|</span>
                                    <span>Published ({pages.data.filter(p => p.status === 'published').length})</span>
                                    <span>|</span>
                                    <span>Draft ({pages.data.filter(p => p.status !== 'published').length})</span>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row justify-between items-center gap-2 mt-8 mb-2">
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
                                <div className={'flex flex-col lg:flex-row items-center text-xs '}>
                                    <div className={`flex items-center bg-white ${selectedPages.length > 0  ? 'mb-2 lg:mb-0 lg:rounded-l-2xl rounded-2xl bg-green-400  ease-in-out duration-300':'rounded-2xl'}`}>
                                        {selectedPages.length < 1 && (
                                            <div className={'relative rounded-l-2xl bg-white px-4 py-1 shadow-none  hover:bg-teal-300 '}>
                                                <TextInput
                                                    type="text"
                                                    placeholder="Search titles..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className={'ml-4 text-xs shadow-none border-none outline-none'}
                                                />
                                                <div className={'w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400'}>
                                                    <IconSearch size={16}/>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`relative bg-white px-4 py-1 shadow-none  hover:bg-teal-300  ${selectedPages.length > 0  ? 'rounded-2xl lg:rounded-l-2xl lg:rounded-r-none ease-in-out duration-300':'rounded-r-2xl'} `}>
                                            <Link href={route('pages.create')} className="text-blue-600 ">
                                                + New Page
                                            </Link>
                                        </div>
                                    </div>

                                    {selectedPages.length > 0 && (
                                        <div className={'grid grid-cols-2 lg:flex items-center p-1 lg:p-0 bg-white rounded-2xl lg:rounded-r-2xl lg:rounded-l-none'}>
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
                                            <div className={'flex items-center px-3 py-1 hover:bg-teal-300 hover:rounded-r-2xl'}>
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
                                <PageTable
                                    pages={pages}
                                    selectedPages={selectedPages}
                                    isAllCurrentPagesSelected={isAllCurrentPagesSelected}
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    handleSort={handleSort}
                                    handleSelectAll={handleSelectAll}
                                    handleSelectPage={handleSelectPage}
                                    handleDeleteSingle={handleDeleteSingle}
                                    handleUpdateStatus={handleUpdateStatus}
                                    handleOpenScheduleModal={handleOpenScheduleModal}
                                />
                            </div>

                            <Pagination links={pages.links} />

                            {isScheduleModalOpen && (
                                <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-300/60 bg-opacity-50">
                                    <Modal
                                        isOpen={isModalOpen}
                                        onClose={closeModal}
                                        maxWidth="xs"
                                        disableClickOutside={true}
                                    >
                                        {/* Your modal content goes here */}
                                        <div className="">
                                            <div className="mb-4">
                                                <label htmlFor="scheduled-at" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Scheduled At:
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    id="scheduled-at"
                                                    value={scheduledDateTime}
                                                    onChange={(e) => setScheduledDateTime(e.target.value)}
                                                    className="border px-3 py-1 mt-1 block w-full outline outline-teal-400 rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <PrimaryButton
                                                    onClick={() => setIsScheduleModalOpen(false)}

                                                >
                                                    Cancel
                                                </PrimaryButton>
                                                <PrimaryButton
                                                    autoFocus={true}
                                                    onClick={handleSchedulePage}
                                                    className={'text-xs text-blue-500 bg-blue-600 rounded-md hover:bg-blue-700'}
                                                >
                                                    Schedule
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    </Modal>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
