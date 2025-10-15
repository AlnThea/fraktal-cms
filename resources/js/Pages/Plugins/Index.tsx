import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from "@/Layouts/AppLayout";
import React, { useState, useEffect, useRef } from "react";
import TextInput from "@/Components/TextInput";
import Modal from '@alnthea/react-tailwind-modal';
import Pagination from "@/Components/Pagination";

import {
    IconSearch,
    IconTrash,
    IconCheck,
    IconX,
    IconUpload,
    IconPlug,
    IconSettings,
    IconRefresh,
    IconPackage,
    IconUser,
    IconCalendar,
} from '@tabler/icons-react';
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

// Definisikan interface Plugin
export interface Plugin {
    id: number;
    name: string;
    slug: string;
    version: string;
    description?: string;
    author?: string;
    author_url?: string;
    plugin_url?: string;
    is_active: boolean;
    type: string;
    dependencies?: any;
    settings?: any;
    created_at: string;
    updated_at: string;
}

// Definisikan interface Paginator
export interface Paginator {
    data: Plugin[];
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

// Definisikan interface PluginProps
interface PluginProps {
    plugins: Paginator;
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
    if (!str) return '';
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
};

// Komponen Table untuk Plugins
const PluginTable = ({
                         plugins,
                         selectedPlugins,
                         isAllCurrentPluginsSelected,
                         sortColumn,
                         sortDirection,
                         handleSort,
                         handleSelectAll,
                         handleSelectPlugin,
                         handleDeleteSingle,
                         handleActivatePlugin,
                         handleDeactivatePlugin
                     }: any) => {
    const [hoverRowId, setHoverRowId] = useState<number | null>(null);

    const getPluginTypeBadge = (type: string) => {
        const typeConfig: { [key: string]: { color: string; label: string } } = {
            'grapejs-block': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'GrapeJS Block' },
            'theme': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Theme' },
            'widget': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Widget' },
            'extension': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Extension' },
        };

        const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: type };

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        <input
                            type="checkbox"
                            checked={isAllCurrentPluginsSelected}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer"
                        onClick={() => handleSort('name')}
                    >
                        <div className="flex items-center">
                            Plugin
                            {sortColumn === 'name' && (
                                <span className="ml-1">
                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                    </span>
                            )}
                        </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Version
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Author
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer"
                        onClick={() => handleSort('created_at')}
                    >
                        <div className="flex items-center">
                            Created
                            {sortColumn === 'created_at' && (
                                <span className="ml-1">
                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                    </span>
                            )}
                        </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Actions
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {plugins.data.map((plugin: Plugin) => (
                    <tr
                        key={plugin.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        onMouseEnter={() => setHoverRowId(plugin.id)}
                        onMouseLeave={() => setHoverRowId(null)}
                    >
                        <td className="px-6 py-4 whitespace-nowrap">
                            <input
                                type="checkbox"
                                checked={selectedPlugins.includes(plugin.id)}
                                onChange={(e) => handleSelectPlugin(e, plugin.id)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <IconPackage size={20} className="text-white" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {plugin.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {truncateString(plugin.description || '', 50)}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {plugin.slug}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {getPluginTypeBadge(plugin.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            v{plugin.version}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(plugin.is_active)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {plugin.author ? (
                                <div className="flex items-center">
                                    <IconUser size={16} className="mr-1" />
                                    {plugin.author}
                                </div>
                            ) : (
                                'Unknown'
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                <IconCalendar size={16} className="mr-1" />
                                {new Date(plugin.created_at).toLocaleDateString()}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {!plugin.is_active ? (
                                <button
                                    onClick={() => handleActivatePlugin(plugin.id)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-medium"
                                >
                                    Activate
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleDeactivatePlugin(plugin.id)}
                                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
                                >
                                    Deactivate
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteSingle(plugin.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default function Index({ plugins, filters }: PluginProps) {
    const [selectedPlugins, setSelectedPlugins] = useState<number[]>([]);
    const [perPage, setPerPage] = useState(filters.perPage || 10);
    const [search, setSearch] = useState(filters.search || '');
    const [sortColumn, setSortColumn] = useState(filters.sortColumn || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sortDirection || 'desc');
    const [uploading, setUploading] = useState(false);

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

        router.get(route('plugin.index'), {
            search: debouncedSearch,
            perPage: perPage,
            sortColumn: sortColumn,
            sortDirection: sortDirection,
        }, {
            preserveState: true,
            replace: true,
        } as any);
    }, [debouncedSearch, perPage, sortColumn, sortDirection]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = plugins.data.map(plugin => plugin.id);
            setSelectedPlugins(prev => [...new Set([...prev, ...allIds])]);
        } else {
            const currentIds = plugins.data.map(plugin => plugin.id);
            setSelectedPlugins(prev => prev.filter(pluginId => !currentIds.includes(pluginId)));
        }
    };

    const handleSelectPlugin = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) {
            setSelectedPlugins(prev => [...prev, id]);
        } else {
            setSelectedPlugins(prev => prev.filter(pluginId => pluginId !== id));
        }
    };

    const handleDeleteSelected = () => {
        if (selectedPlugins.length === 0) {
            alert("Pilih plugin yang ingin dihapus terlebih dahulu.");
            return;
        }

        if (confirm(`Yakin ingin menghapus ${selectedPlugins.length} plugin yang dipilih?`)) {
            selectedPlugins.forEach(pluginId => {
                router.delete(route('plugin.destroy', pluginId), {
                    onSuccess: () => {
                        setSelectedPlugins(prev => prev.filter(id => id !== pluginId));
                    }
                });
            });
        }
    };

    const handleDeleteSingle = (id: number) => {
        if (confirm('Yakin ingin menghapus plugin ini?')) {
            router.delete(route('plugin.destroy', id), {
                onSuccess: () => {
                    setSelectedPlugins(prev => prev.filter(pluginId => pluginId !== id));
                }
            });
        }
    };

    const handleActivatePlugin = (id: number) => {
        router.put(route('plugin.activate', id), {}, {
            onSuccess: () => {
                router.reload({ preserveState: true } as any);
            }
        });
    };

    const handleDeactivatePlugin = (id: number) => {
        router.put(route('plugin.deactivate', id), {}, {
            onSuccess: () => {
                router.reload({ preserveState: true } as any);
            }
        });
    };

    const handleActivateSelected = () => {
        if (selectedPlugins.length === 0) {
            alert("Pilih plugin yang ingin diaktifkan terlebih dahulu.");
            return;
        }

        selectedPlugins.forEach(pluginId => {
            router.put(route('plugin.activate', pluginId));
        });
    };

    const handleDeactivateSelected = () => {
        if (selectedPlugins.length === 0) {
            alert("Pilih plugin yang ingin dinonaktifkan terlebih dahulu.");
            return;
        }

        selectedPlugins.forEach(pluginId => {
            router.put(route('plugin.deactivate', pluginId));
        });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('plugin_file', file);

        router.post(route('plugin.store'), formData, {
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                event.target.value = '';
            },
        });
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

    const isAllCurrentPluginsSelected = plugins.data.every(plugin => selectedPlugins.includes(plugin.id));

    const activePluginsCount = plugins.data.filter(p => p.is_active).length;
    const inactivePluginsCount = plugins.data.filter(p => !p.is_active).length;

    return (
        <AppLayout
            title="Plugin Management"
            breadcrumb={() => (
                <>
                    <div className={'flex items-center'}>
                        <span className="mx-1 lg:mx-3 text-gray-300 dark:text-gray-300"> / </span>
                    </div>
                    <div className={'flex items-center'}>
                        <span className="mx-1 lg:mx-3 text-gray-300 dark:text-gray-300"> Plugins </span>
                    </div>
                    <div className={'flex items-center'}>
                        <span className="mx-1 lg:mx-3 text-gray-300 dark:text-gray-300"> / </span>
                    </div>
                </>
            )}
            renderHeader={() => (
                <span className="">Plugin Management</span>
            )}
        >
            <div className="py-12">
                <div className="w-full">
                    <div className="w-full dark:bg-gray-800 dark:bg-gradient-to-bl dark:from-gray-700/50 dark:via-transparent">
                        <div className="w-full">
                            <h1 className="text-xl font-bold mb-2">Plugins</h1>
                            <div className={'flex justify-between items-center gap-2 text-xs'}>
                                <div className={'flex gap-2'}>
                                    <span>All ({plugins.total})</span>
                                    <span>|</span>
                                    <span>Active ({activePluginsCount})</span>
                                    <span>|</span>
                                    <span>Inactive ({inactivePluginsCount})</span>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row justify-between items-center gap-2 mt-8 mb-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="perPage" className={'text-sm'}>per page:</label>
                                    <select
                                        id="perPage"
                                        value={perPage}
                                        onChange={handlePerPageChange}
                                        className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                                <div className={'flex flex-col lg:flex-row items-center text-xs '}>
                                    <div className={`flex items-center bg-white dark:bg-gray-700 ${selectedPlugins.length > 0  ? 'mb-2 lg:mb-0 lg:rounded-l-2xl rounded-2xl bg-green-400 ease-in-out duration-300':'rounded-2xl'}`}>
                                        {selectedPlugins.length < 1 && (
                                            <div className={'relative rounded-l-2xl bg-white dark:bg-gray-700 px-4 py-1 shadow-none hover:bg-teal-300 dark:hover:bg-teal-600'}>
                                                <TextInput
                                                    type="text"
                                                    placeholder="Search plugins..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className={'ml-4 text-xs shadow-none border-none outline-none dark:bg-gray-700 dark:text-white'}
                                                />
                                                <div className={'w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400'}>
                                                    <IconSearch size={16}/>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`relative bg-white dark:bg-gray-700 px-4 py-1 shadow-none hover:bg-teal-300 dark:hover:bg-teal-600 ${selectedPlugins.length > 0  ? 'rounded-2xl lg:rounded-l-2xl lg:rounded-r-none ease-in-out duration-300':'rounded-r-2xl'} `}>
                                            <label className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                                {uploading ? (
                                                    <div className="flex items-center">
                                                        <IconRefresh className="animate-spin mr-1" size={16} />
                                                        Uploading...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <IconUpload size={16} className="mr-1" />
                                                        Upload Plugin
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".zip"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {selectedPlugins.length > 0 && (
                                        <div className={'grid grid-cols-2 lg:flex items-center p-1 lg:p-0 bg-white dark:bg-gray-700 rounded-2xl lg:rounded-r-2xl lg:rounded-l-none'}>
                                            <div className={'flex items-center px-3 py-1 hover:bg-teal-300 dark:hover:bg-teal-600'}>
                                                <button
                                                    onClick={handleActivateSelected}
                                                    className="cursor-pointer text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
                                                >
                                                    <div className={'flex gap-1 items-center'}>
                                                        <IconCheck size={16}/> Activate ({selectedPlugins.length})
                                                    </div>
                                                </button>
                                            </div>
                                            <div className={'flex items-center px-3 py-1 hover:bg-teal-300 dark:hover:bg-teal-600'}>
                                                <button
                                                    onClick={handleDeactivateSelected}
                                                    className="cursor-pointer text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                                                >
                                                    <div className={'flex gap-1 items-center'}>
                                                        <IconX size={16}/> Deactivate ({selectedPlugins.length})
                                                    </div>
                                                </button>
                                            </div>
                                            <div className={'flex items-center px-3 py-1 hover:bg-teal-300 dark:hover:bg-teal-600 hover:rounded-r-2xl'}>
                                                <button
                                                    onClick={handleDeleteSelected}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer"
                                                >
                                                    <div className={'flex gap-1 items-center'}>
                                                        <IconTrash size={16}/> Delete ({selectedPlugins.length})
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={'bg-white dark:bg-gray-800 w-full rounded-2xl shadow shadow-teal-300 dark:shadow-teal-800'}>
                                <PluginTable
                                    plugins={plugins}
                                    selectedPlugins={selectedPlugins}
                                    isAllCurrentPluginsSelected={isAllCurrentPluginsSelected}
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    handleSort={handleSort}
                                    handleSelectAll={handleSelectAll}
                                    handleSelectPlugin={handleSelectPlugin}
                                    handleDeleteSingle={handleDeleteSingle}
                                    handleActivatePlugin={handleActivatePlugin}
                                    handleDeactivatePlugin={handleDeactivatePlugin}
                                />
                            </div>

                            <Pagination links={plugins.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
