import {router} from '@inertiajs/core';
import {Head} from '@inertiajs/react';
import classNames from 'classnames';
import React, {useState} from 'react';

import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';

import Banner from '@/Components/Banner';
import Dropdown from '@/Components/Dropdown';
import DropdownLink from '@/Components/DropdownLink';
import SideLink from '@/Components/SideLink';
import { SideMenu } from '@/Constants/SideMenu';
import SideLinkGroup from '@/Components/SideLinkGroup';
import {
    IconBell,
    IconCheck,
    IconLogout,
    IconUsersGroup,
    IconMenu2,
    IconX,
    IconHome, IconUserCircle, IconApi
} from "@tabler/icons-react";

interface Props {
    title: string;
    renderHeader?: () => JSX.Element;
    breadcrumb?: () => JSX.Element;
    children?: React.ReactNode;
}

export default function AppLayout({title, renderHeader, breadcrumb, children}: Props) {
    const route = useRoute();
    const page = useTypedPage();

    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', newState.toString());
    };

    const logout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const switchToTeam = (e: React.FormEvent, team: any) => {
        e.preventDefault();
        router.put(route('current-team.update'), {team_id: team.id});
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-100">
            <Head title={title}/>

            <Banner/>
            {/* Top Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 h-10 px-6 bg-white border-b-2 border-gray-200">
                <div className={'flex justify-between items-center h-full'}>
                    <div className="relative flex items-center z-50">
                        <div className="flex items-center mr-3">
                            <a href={route('homepage')}>
                                <span className="w-auto h-7 font-bold text-teal-500">FRAKTAL CMS</span>
                            </a>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className={'p-0 rounded hover:text-emerald-200 dark:hover:text-gray-700 text-teal-500 dark:text-gray-300 font-mono'}
                            title="Toggle sidebar"
                        >
                            {isCollapsed ? <IconX size={24} /> : <IconMenu2 size={24} />}
                        </button>
                        <div className={'mx-4'}></div>

                        <div className="flex items-center py-4 overflow-x-auto whitespace-nowrap text-xs">
                            <span className="text-gray-300 dark:text-gray-200">
                                <IconHome size={16}/>
                            </span>
                            {breadcrumb && breadcrumb()}
                            <a href="#" className="text-emerald-300 dark:text-gray-400 hover:text-emerald-600">
                                {title}
                            </a>
                        </div>
                    </div>
                    <div className={'text-sm text-gray-600'}>{renderHeader && renderHeader()} </div>
                    <div className="flex items-center ">
                        <div className="relative z-50">
                            {/* Right Side */}
                            <div className="flex items-center gap-4 ">
                                {/* Team Dropdown */}
                                {page.props.jetstream.hasTeamFeatures && (
                                    <Dropdown
                                        align="top-nav"
                                        width="60"
                                        renderTrigger={() => (
                                            <button
                                                className="relative p-2 mx-3 text-gray-400 transition-colors duration-300 rounded-full hover:bg-gray-100 hover:text-gray-600 focus:bg-gray-100">
                                                <span className="sr-only">Notifications</span><span
                                                className="absolute top-0 right-0 w-2 h-2 mt-1 mr-2 bg-green-700 rounded-full"></span><span
                                                className="absolute top-0 right-0 w-2 h-2 mt-1 mr-2 bg-green-700 rounded-full animate-ping"></span>
                                                <div className={'h-6 w-6'}>
                                                    <IconUsersGroup/>
                                                </div>
                                            </button>
                                        )}
                                    >
                                        <DropdownLink href={route('teams.show', [page.props.auth.user?.current_team])}>
                                            Team Settings
                                        </DropdownLink>
                                        {page.props.jetstream.canCreateTeams && (
                                            <DropdownLink href={route('teams.create')}>Create New Team</DropdownLink>
                                        )}
                                        <div className="border-t border-gray-200 dark:border-gray-600"/>
                                        {page.props.auth.user?.all_teams?.map((team) => (
                                            <form onSubmit={(e) => switchToTeam(e, team)} key={team.id}>
                                                <DropdownLink as="button">
                                                    {team.name}
                                                    {team.id === page.props.auth.user?.current_team_id && (
                                                        <span
                                                            className="ml-2 inline-flex text-sm text-green-500 animate-pulse"><IconCheck
                                                            size={18}/></span>
                                                    )}
                                                </DropdownLink>
                                            </form>
                                        ))}
                                    </Dropdown>
                                )}
                            </div>
                        </div>


                        <button
                            className="relative p-2 mx-3 text-gray-400 transition-colors duration-300 rounded-full hover:bg-gray-100 hover:text-gray-600 focus:bg-gray-100">
                            <span className="sr-only">Notifications</span><span
                            className="absolute top-0 right-0 w-2 h-2 mt-1 mr-2 bg-blue-700 rounded-full"></span><span
                            className="absolute top-0 right-0 w-2 h-2 mt-1 mr-2 bg-blue-700 rounded-full animate-ping"></span>
                            <div className={'h-6 w-6'}>
                                <IconBell/>
                            </div>
                        </button>
                    </div>
                </div>

            </header>

            {/* MAIN CONTENT */}
            <div className="flex bg-gray-100 dark:bg-gray-900">
                <div className={'relative'}>
                    {/* SIDEBAR */}
                    <aside className={classNames(
                        'fixed top-10 left-0 bottom-0 z-40 flex flex-col px-3 py-6 overflow-hidden overflow-x-visible border-r-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300',
                        isCollapsed ? 'w-18 items-center' : 'w-50'
                    )}>
                        <div className="flex flex-col justify-between flex-1 mt-1">
                            <nav className="-mx-2 space-y-6 ">
                                <div className="space-y-3 ">

                                    {SideMenu.map((section, idx) => (
                                        <div key={idx} className="space-y-3">
                                            {!isCollapsed && (
                                                <label className="px-3 text-xs text-gray-500 uppercase dark:text-gray-400">
                                                    {section.group}
                                                </label>
                                            )}
                                            {section.items.map((item, i) => (
                                                <SideLinkGroup
                                                    key={i}
                                                    {...item}
                                                    collapsed={isCollapsed}
                                                    currentRoute={route().current()}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </nav>

                            <div className="mt-6">
                                <div className={'border-b border-gray-300/70'}></div>
                                {/* User dropdown */}
                                {!isCollapsed ? (
                                    <div className={classNames(
                                        "flex items-center mt-3 border rounded-2xl border-gray-200 ",
                                        isCollapsed ? "justify-center" : "justify-between"
                                    )}>
                                        <Dropdown
                                            align={isCollapsed ? "top-collapsed" : "top"}
                                            width={isCollapsed ? "10" : "45"}
                                            position={isCollapsed ? "fixed" : "absolute"}
                                            renderTrigger={() => (
                                                <button
                                                    className={`${!isCollapsed ? 'hover:bg-emerald-200 cursor-pointer' : ''} transition-colors duration-300 rounded-lg sm:px-4 sm:py-2 focus:outline-none`}>
                                                    <span className="sr-only">User Menu</span>
                                                    <div
                                                        className={`${isCollapsed ? '-ml-4' : 'mx-0'} flex items-center justify-between gap-2 `}>
                                                        <div
                                                            className="hidden md:mx-1 md:flex md:flex-col md:items-end md:leading-tight">
                                                            {!isCollapsed && (
                                                                <div className={'flex flex-col items-start'}>
                                                            <span
                                                                className="font-semibold text-sm text-gray-800">{page.props.auth.user?.name}</span><span
                                                                    className="text-sm text-gray-600">Administrator</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {page.props.jetstream.managesProfilePhotos ? (
                                                            <img
                                                                className={`flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full md:mx-0 ${isCollapsed ? '' : ''}`}
                                                                src={page.props.auth.user?.profile_photo_url}
                                                                alt={page.props.auth.user?.name}
                                                            />
                                                        ) : (
                                                            <span
                                                                className={`flex-shrink-0 w-10 h-10 text-xs shadow-md flex items-center justify-center overflow-hidden bg-gray-100 rounded-full md:mx-0 ${isCollapsed ? 'hover:bg-emerald-200 cursor-pointer' : ''}`}>
                                                    {page.props.auth.user?.name}
                                                </span>
                                                        )}
                                                    </div>
                                                </button>
                                            )}
                                        >
                                            <DropdownLink href={route('profile.show')}>
                                                <div className={'flex items-center justify-between cursor-pointer'}>
                                                    {!isCollapsed && (
                                                        <div>Profile</div>
                                                    )}
                                                    <div><IconUserCircle size={24}/></div>
                                                </div>
                                            </DropdownLink>
                                            {page.props.jetstream.hasApiFeatures && (
                                                <DropdownLink href={route('api-tokens.index')}>
                                                    <div className={'flex items-center justify-between cursor-pointer'}>
                                                        {!isCollapsed && (
                                                            <div>API Token</div>
                                                        )}
                                                        <div><IconApi size={24}/></div>
                                                    </div>
                                                </DropdownLink>
                                            )}
                                            <div className="border-t border-gray-200 dark:border-gray-600"/>
                                            <form onSubmit={logout}>
                                                <DropdownLink as="button">
                                                    <div className={'flex items-center justify-between cursor-pointer'}>
                                                        {!isCollapsed && (
                                                            <div>Logout</div>
                                                        )}
                                                        <div><IconLogout size={24}/></div>
                                                    </div>
                                                </DropdownLink>
                                            </form>
                                        </Dropdown>
                                    </div>
                                ) : (
                                    <div className={'flex flex-col gap-3'}>
                                        <SideLink
                                            href={route('profile.show')}
                                            active={route().current('profile.show')}
                                            icon={
                                                <div
                                                    className={'flex items-center justify-center '}>
                                                    <div className={'h-6 w-6'}><IconUserCircle/></div>
                                                </div>
                                            }
                                            label="Profile"
                                            collapsed={isCollapsed}
                                        />
                                        {page.props.jetstream.hasApiFeatures && (
                                            <SideLink
                                                href={route('dashboard')}
                                                active={route().current('dashboard')}
                                                icon={
                                                    <div
                                                        className={'flex items-center justify-center '}>
                                                        <div className={'h-6 w-6'}><IconApi/></div>
                                                    </div>
                                                }
                                                label="Dashboard"
                                                collapsed={isCollapsed}
                                            />
                                        )}
                                        <div className={'flex items-center justify-center'}>
                                            <form onSubmit={logout}>
                                                <button className={'flex items-center justify-center cursor-pointer text-gray-500'}
                                                        type="submit"
                                                >
                                                    <div>
                                                        <div className={'h-6 w-6'}><IconLogout/></div>
                                                    </div>
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Page Content */}
                    <main
                        className="flex-1 ml-50 p-6 bg-gray-100 dark:bg-gray-900 z-10 relative overflow-visible">{children}</main>
                </div>

            </div>
        </div>
    );
}
