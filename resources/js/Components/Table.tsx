// Components/PageTable.tsx
import React, {useState} from 'react';
import {Link, router} from '@inertiajs/react';
import {route} from 'ziggy-js';
import {
    IconBubbleText,
    IconChevronDown,
    IconChevronUp,
    IconLineDashed,
    IconPencil,
    IconTrash,
    IconCheck,
    IconClock,
} from '@tabler/icons-react';
import {Page, Paginator} from '@/Types/Index';

// Fungsi utilitas untuk memotong string
const truncateString = (str: string, num: number) => {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
};

interface PageTableProps {
    pages: Paginator;
    selectedPages: number[];
    isAllCurrentPagesSelected: boolean;
    sortColumn: string;
    sortDirection: string;
    handleSort: (column: string) => void;
    handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectPage: (e: React.ChangeEvent<HTMLInputElement>, id: number) => void;
    handleDeleteSingle: (id: number) => void;
    handleUpdateStatus: (id: number, status: 'published' | 'draft') => void;
    handleOpenScheduleModal: (id: number) => void;
}

export default function PageTable({
                                      pages,
                                      selectedPages,
                                      isAllCurrentPagesSelected,
                                      sortColumn,
                                      sortDirection,
                                      handleSort,
                                      handleSelectAll,
                                      handleSelectPage,
                                      handleDeleteSingle,
                                      handleUpdateStatus,
                                      handleOpenScheduleModal,
                                  }: PageTableProps) {
    const [hoverRowId, setHoverRowId] = useState<number | null>(null);

    const renderSortIcon = (column: string) => {
        if (sortColumn !== column) {
            return null;
        }
        return sortDirection === 'asc'
            ? <IconChevronUp size={16} className="inline-block ml-1"/>
            : <IconChevronDown size={16} className="inline-block ml-1"/>;
    };

    return (
        <div className={'bg-white w-full dark:bg-gray-800 rounded-2xl shadow shadow-teal-300'}>
            <table className={'w-full'}>
                <thead>
                <tr className={'text-gray-500 text-sm font-bold shadow'}>
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
                    <td className="hidden lg:table-cell px-3 py-2 cursor-pointer" onClick={() => handleSort('author')}>
                        <div className="flex items-center">
                            <span>Author</span>
                            {renderSortIcon('author')}
                        </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-2">
                        <span><IconBubbleText/></span>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-2 cursor-pointer"
                        onClick={() => handleSort('updated_at')}>
                        <div className="flex items-center">
                            <span>Date</span>
                            {renderSortIcon('updated_at')}
                        </div>
                    </td>
                </tr>
                </thead>
                <tbody>
                {pages.data.map((page: Page) => (
                    <tr
                        key={page.id}
                        className={'bg-slate-100 border-b border-gray-200 hover:bg-slate-200 dark:hover:bg-gray-700'}
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
                        <td className=" px-4 py-2">
                            <div className="hidden lg:flex flex-col">
                                <div className={'flex items-center'}>
                                    {truncateString(page.title, 50)}
                                    <IconLineDashed/>
                                    <span className={'ml-1 text-xs font-bold text-gray-400'}>
                                        {page.status ? (page.status.charAt(0).toUpperCase() + page.status.slice(1)) : 'Draft'}
                                    </span>
                                </div>
                                <div
                                    className={`mt-2 flex text-xs justify-between items-center ${hoverRowId === page.id ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300`}>
                                    <div className={'flex'}>
                                        <Link
                                            href={route('pages.edit', {slug: page.slug, page: page.id})}
                                            className=" hover:text-teal-500"
                                        >
                                            <div className={'flex gap-1'}>
                                                <IconPencil size={16}/> Edit
                                            </div>
                                        </Link>
                                        <span className={'mx-2 text-gray-400'}>|</span>
                                        <button
                                            onClick={() => handleDeleteSingle(page.id)}
                                            className="cursor-pointer text-red-600 hover:text-red-800"
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
                                                className="t cursor-pointer text-teal-600 hover:text-teal-800"
                                            >
                                                <div className={'flex gap-1'}>
                                                    <IconCheck size={16}/> Publish
                                                </div>
                                            </button>
                                            <span className={'mx-2 text-gray-400'}>|</span>
                                            <button
                                                onClick={() => handleUpdateStatus(page.id, 'draft')}
                                                className=" cursor-pointer text-gray-600 hover:text-gray-800"
                                            >
                                                <div className={'flex gap-1'}>
                                                    <IconLineDashed size={16}/> Draft
                                                </div>
                                            </button>
                                            <span className={'mx-2  text-gray-400'}>|</span>
                                            <button
                                                onClick={() => handleOpenScheduleModal(page.id)}
                                                className="cursor-pointer text-blue-600 hover:text-blue-800"
                                            >
                                                <div className={'flex gap-1'}>
                                                    <IconClock size={16}/> Schedule
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*  responsive - mobile  */}
                            <div className={'lg:hidden'}>
                                <div className={'flex justify-between items-center text-sm'}>
                                    <span className={'font-bold'}>{truncateString(page.title, 24)}</span>

                                    <div className={'flex items-center'}>
                                        <IconLineDashed/>
                                        <span className={'ml-1 text-xs font-bold text-gray-400'}>
                                        {page.status ? (page.status.charAt(0).toUpperCase() + page.status.slice(1)) : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div className={'flex justify-between'}>
                                    <div className={'text-xs'}>
                                        {page.author?.name || 'N/A'}
                                    </div>
                                    <div className={'text-xs'}>
                                        <span className={'mr-1'}>last up:</span>
                                        {page.updated_at
                                            ? `${new Date(page.updated_at).toLocaleDateString()} ${new Date(page.updated_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}`
                                            : 'N/A'}
                                    </div>
                                </div>
                                <div
                                    className={`flex flex-col gap-5 mt-5 justify-between text-xs`}>
                                    <div className={'flex justify-between'}>
                                        <div className={'flex items-center'}>
                                            <Link
                                                href={route('pages.edit', {slug: page.slug, page: page.id})}
                                                className=" hover:text-teal-500"
                                            >
                                                <div className={'flex gap-1'}>
                                                    <IconPencil size={16}/> Edit
                                                </div>
                                            </Link>
                                            <span className={'mx-2  text-gray-400'}>|</span>
                                            <button
                                                onClick={() => handleDeleteSingle(page.id)}
                                                className=" cursor-pointer text-red-600 hover:text-red-800"
                                            >
                                                <div className={'flex gap-1'}>
                                                    <IconTrash size={16}/> Trash
                                                </div>
                                            </button>
                                        </div>
                                        <div className={'flex items-center justify-end'}>
                                            <span>--</span>
                                        </div>
                                    </div>
                                    <div className={'text-xs'}>
                                        <div className={'flex'}>
                                            <button
                                                onClick={() => handleUpdateStatus(page.id, 'published')}
                                                className=" cursor-pointer text-teal-600 hover:text-teal-800"
                                            >
                                                <div className={'flex gap-1'}>
                                                    <IconCheck size={16}/> Publish
                                                </div>
                                            </button>
                                            <span className={'mx-2  text-gray-400'}>|</span>
                                            <button
                                                onClick={() => handleUpdateStatus(page.id, 'draft')}
                                                className=" cursor-pointer text-gray-600 hover:text-gray-800"
                                            >
                                                <div className={'flex gap-1'}>
                                                    <IconLineDashed size={16}/> Draft
                                                </div>
                                            </button>
                                            <span className={'mx-2 text-gray-400'}>|</span>
                                            <button
                                                onClick={() => handleOpenScheduleModal(page.id)}
                                                className=" cursor-pointer text-blue-600 hover:text-blue-800"
                                            >
                                                <div className={'flex gap-1'}>
                                                    <IconClock size={16}/> Schedule
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*  end responsive - mobile  */}
                        </td>
                        <td className="hidden lg:table-cell px-4 py-2 justify-center">
                            <div className={'text-xs'}>
                                {page.author?.name || 'N/A'}
                            </div>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-2 justify-center">-</td>
                        <td className="hidden lg:table-cell px-4 py-2 justify-center">
                            <div className={'text-xs'}>Updated at</div>
                            <div className={'text-xs'}>
                                {page.updated_at
                                    ? `${new Date(page.updated_at).toLocaleDateString()} ${new Date(page.updated_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}`
                                    : 'N/A'}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                <tr className={'text-gray-500 text-sm font-bold'}>
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
                    <td className="hidden lg:table-cell px-3 py-2 cursor-pointer" onClick={() => handleSort('author')}>
                        <div className="flex items-center">
                            <span>Author</span>
                            {renderSortIcon('author')}
                        </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-2">
                        <span><IconBubbleText/></span>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-2 cursor-pointer"
                        onClick={() => handleSort('updated_at')}>
                        <div className="flex items-center">
                            <span>Date</span>
                            {renderSortIcon('updated_at')}
                        </div>
                    </td>
                </tr>
                </tfoot>
            </table>
        </div>
    );
}
