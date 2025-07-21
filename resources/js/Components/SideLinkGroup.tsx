import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import classNames from 'classnames';
import useRoute from '@/Hooks/useRoute';
import type { MenuItem } from '@/Constants/SideMenu';

interface Props extends MenuItem {
    collapsed?: boolean;
    currentRoute?: string;
}

export default function SideLinkGroup({ label, icon, route: routeName, children, collapsed = false, currentRoute }: Props) {
    const route = useRoute();
    const [open, setOpen] = useState(() =>
        children?.some(child => child.route && currentRoute?.startsWith(child.route)) ?? false

    );

    const isActive = routeName && currentRoute === routeName;

    const toggleOpen = () => {
        if (children) setOpen(!open);
    };

    return (
        <div>
            <div
                className={classNames(
                    'flex items-center px-2 py-2 transition-colors duration-200 rounded-lg cursor-pointer group',
                    isActive && 'bg-emerald-100 dark:bg-gray-800',
                    'text-emerald-600 dark:text-gray-200 hover:text-emerald-700 hover:bg-emerald-300 dark:hover:bg-gray-800'
                )}
                onClick={toggleOpen}
            >
        <span className="w-6 h-6 flex items-center justify-center">
          {icon?.()}
        </span>
                {!collapsed && (
                    <span className="ml-3 text-sm font-medium flex-1">{label}</span>
                )}
                {!collapsed && children && (
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

            {/* Submenu */}
            {!collapsed && children && open && (
                <div className="ml-8 mt-1 space-y-1">
                    {children.map((item, idx) => (
                        <Link
                            key={idx}
                            href={route(item.route!)}
                            className={classNames(
                                'block text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 py-1',
                                currentRoute?.startsWith(item.route!) && 'text-emerald-600 font-semibold'
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
