import React from 'react';
import { ToolbarProps } from '@/Types/editor';

const TopToolbar: React.FC<ToolbarProps> = ({ onCommand }) => {
    const leftSectionButtons = [
        {
            id: 'core:preview',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>',
            title: 'Preview'
        },
        {
            id: 'export-template',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>',
            title: 'Export Code'
        },
        {
            id: 'show-json',
            label: '{...}',
            title: 'View JSON'
        },
    ];

    const centerSectionButtons = [
        {
            id: 'set-device-desktop',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z" /><path d="M7 20h10" /><path d="M9 16v4" /><path d="M15 16v4" /></svg>',
            title: 'Desktop View'
        },
        {
            id: 'set-device-mobile',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z" /><path d="M11 4h2" /><path d="M12 17v.01" /></svg>',
            title: 'Mobile View'
        },
    ];

    const rightSectionButtons = [
        {
            id: 'core:undo',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 13l-4 -4l4 -4m-4 4h11a4 4 0 0 1 0 8h-1" /></svg>',
            title: 'Undo'
        },
        {
            id: 'core:redo',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 13l4 -4l-4 -4m4 4h-11a4 4 0 0 0 0 8h1" /></svg>',
            title: 'Redo'
        },
        {
            id: 'core:fullscreen',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /></svg>',
            title: 'Fullscreen'
        },
    ];

    const propertiesButtons = [
        {
            id: 'show-layers',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" /><path d="M16 16v2a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h2" /></svg>',
            title: 'Layers'
        },
        {
            id: 'show-styles',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M17 17a2 2 0 0 1 -2 -2v-8h-5a2 2 0 0 0 -2 2" /><path d="M7 17a2.775 2.775 0 0 0 2.632 -1.897l.368 -1.103a13.4 13.4 0 0 1 3.236 -5.236l1.764 -1.764" /><path d="M10 14h5" /></svg>',
            title: 'Styles'
        },
        {
            id: 'show-traits',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>',
            title: 'Traits'
        },
    ];

    return (
        <div className="panel__top h-12 w-full flex justify-between items-center px-4 bg-slate-700 text-white z-10">
            <div className={'flex h-12 w-full p-1'}>
                <div className={'flex items-center w-11/12'}>
                    {/* Left Section */}
                    <div className={'w-3/12 flex items-center'}>
                        {leftSectionButtons.map((btn) => (
                            <button
                                key={btn.id}
                                title={btn.title}
                                className="p-2 hover:bg-slate-600 rounded"
                                onClick={() => onCommand(btn.id)}
                                dangerouslySetInnerHTML={{ __html: btn.label }}
                            />
                        ))}
                    </div>

                    {/* Center Section */}
                    <div className={'w-5/12 flex items-center'}>
                        {centerSectionButtons.map((btn) => (
                            <button
                                key={btn.id}
                                title={btn.title}
                                className="p-2 hover:bg-slate-600 rounded"
                                onClick={() => onCommand(btn.id)}
                                dangerouslySetInnerHTML={{ __html: btn.label }}
                            />
                        ))}
                    </div>

                    {/* Plugin Panels Section */}
                    <div className={'w-2/12 flex items-center'}>
                        <div className={'view-plugin-panels'}></div>
                    </div>

                    {/* Right Section */}
                    <div className={'w-2/12 flex items-center justify-end'}>
                        {rightSectionButtons.map((btn) => (
                            <button
                                key={btn.id}
                                title={btn.title}
                                className="p-2 hover:bg-slate-600 rounded"
                                onClick={() => onCommand(btn.id)}
                                dangerouslySetInnerHTML={{ __html: btn.label }}
                            />
                        ))}
                    </div>
                </div>

                {/* Properties Section */}
                <div className={'flex items-center w-1/12'}>
                    <div>
                        {propertiesButtons.map((btn) => (
                            <button
                                key={btn.id}
                                title={btn.title}
                                className="p-2 hover:bg-slate-600 rounded"
                                onClick={() => onCommand(btn.id)}
                                dangerouslySetInnerHTML={{ __html: btn.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopToolbar;
