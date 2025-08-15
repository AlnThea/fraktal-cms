import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import classNames from 'classnames';
import useRoute from '@/Hooks/useRoute';
import type { MenuItem } from '@/Constants/SideMenu';
import { router } from '@inertiajs/core';

interface Props extends MenuItem {
    collapsed?: boolean;
    currentRoute?: string;
    isLogout?: boolean;
}

export default function SideLinkGroup({
                                          label,
                                          icon,
                                          route: routeName,
                                          children,
                                          collapsed = false,
                                          currentRoute,
                                          isLogout = false,
                                      }: Props) {
    const route = useRoute();
    const [open, setOpen] = useState(() =>
        children?.some((child) => child.route && currentRoute?.startsWith(child.route)) ?? false
    );

    const isActive = routeName && currentRoute === routeName;

    const toggleOpen = () => {
        if (children) setOpen(!open);
    };

    const baseClasses = classNames(
        'flex items-center px-2 py-2 transition-colors duration-200 rounded-lg group',
        isActive && 'bg-emerald-100 dark:bg-gray-800',
        'text-emerald-600 dark:text-gray-200 hover:text-emerald-700 hover:bg-emerald-300 dark:hover:bg-gray-800'
    );

    const renderContent = () => (
        <>
            <span className="w-6 h-6 flex items-center justify-center">{icon?.()}</span>
            {!collapsed && <span className="ml-3 text-sm font-medium flex-1">{label}</span>}
        </>
    );

    if (isLogout) {
        return (
            <div className="relative group">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.post(route('logout'));
                    }}
                >
                    <button type="submit" className={baseClasses}>
                        {renderContent()}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="relative group">
            {children ? (
                <div className={classNames(baseClasses, 'cursor-pointer')} onClick={toggleOpen}>
                    {renderContent()}
                    {!collapsed && (
                        <svg
                            className={classNames('w-4 h-4 transition-transform', open ? 'rotate-90' : '')}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                </div>
            ) : (
                <Link href={route(routeName!)} className={baseClasses}>
                    {renderContent()}
                </Link>
            )}

            {/* Collapsed submenu on hover */}
            {children && collapsed && (
                <div className="fixed hidden group-hover:block ml-11 -mt-10 z-50 shadow-xl">
                    <div className="absolute left-[-11px] top-2 w-2 h-2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white"></div>
                    <div className="bg-white text-gray-600 rounded-md  p-2 space-y-1 min-w-[160px]">
                        {children.map((item, idx) => (
                            <div key={idx} className="hover:border-l-4 hover:border-emerald-600">
                                <Link
                                    href={route(item.route!)}
                                    className="block px-3 py-1 text-sm rounded"
                                >
                                    {item.label}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Expanded submenu */}
            {!collapsed && children && open && (
                <div className="relative ml-8 mt-1 space-y-1 ">
                    {children.map((item, idx) => (
                        <div key={idx} className="hover:border-l-4 hover:border-emerald-600 ">
                            <Link
                                key={idx}
                                href={route(item.route!)}
                                className={classNames(
                                    'block text-sm hover:ml-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 py-1',
                                    currentRoute?.startsWith(item.route!) && 'text-emerald-600 font-semibold'
                                )}
                            >
                                {item.label}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
