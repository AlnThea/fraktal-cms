import { Link } from '@inertiajs/react';
import React, { ReactNode } from 'react';
import classNames from 'classnames';

interface Props {
    href: string;
    active?: boolean;
    icon?: ReactNode;
    label?: string;
    collapsed?: boolean;
}

export default function SideLink({
                                    active,
                                    href,
                                    icon,
                                    label,
                                    collapsed = false,
                                }: Props) {
    const classes = classNames(
        'flex px-2 py-2 transition-colors duration-300 transform rounded-lg',
        'text-emerald-600 dark:text-gray-200 hover:text-emerald-700 hover:bg-emerald-300 dark:hover:bg-gray-800  dark:hover:text-gray-200',
        active && 'bg-emerald-100  dark:bg-gray-800',
        collapsed ? 'justify-center' : 'items-center'
    );

    return (
        <Link href={href} className={classes}>
            {icon && <span className="w-6 h-6 flex items-center justify-center">{icon}</span>}
            {!collapsed && label && <span className="ml-3 text-sm font-medium">{label}</span>}
        </Link>
    );
}
