// Components/Common/ToggleButtons.tsx
import React from 'react';

interface ToggleButtonsProps {
    isSidebarLeftOpen: boolean;
    isSidebarRightOpen: boolean;
    onToggleLeft: () => void;
    onToggleRight: () => void;
    onCommand: (command: string) => void;
}

const ToggleButtons: React.FC<ToggleButtonsProps> = ({
                                                         isSidebarLeftOpen,
                                                         isSidebarRightOpen,
                                                         onToggleLeft,
                                                         onToggleRight,
                                                         onCommand
                                                     }) => {
    const leftToggleButtons = [
        {
            id: 'core:preview',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>',
            title: 'Preview'
        },
        {
            id: 'export-template',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>',
            title: 'Export Code'
        },
    ];

    return (
        <>
            {/* Toggle Button Kiri */}
            <div className={`absolute top-20 z-40 transition-all duration-300 ease-in-out ${
                isSidebarLeftOpen ? 'left-[17.9rem]' : 'left-0'
            }`}>
                <div className="flex flex-col space-y-2 pt-1 pb-1 items-center w-10 text-teal-400 bg-white border-t-2 border-r-2 border-b-2 rounded-tr-xl rounded-br-xl border-teal-300">
                    <button
                        title="Block Manager"
                        className="p-1 hover:bg-teal-200 rounded-lg"
                        onClick={onToggleLeft}
                        dangerouslySetInnerHTML={{
                            __html: isSidebarLeftOpen
                                ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>'
                                : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-blocks"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 4a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z" /><path d="M3 14h12a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h3a2 2 0 0 1 2 2v12" /></svg>',
                        }}
                    />
                    {isSidebarLeftOpen && leftToggleButtons.map((btn) => (
                        <button
                            key={btn.id}
                            title={btn.title}
                            className="p-1 hover:bg-teal-200 rounded-lg"
                            onClick={() => onCommand(btn.id)}
                            dangerouslySetInnerHTML={{ __html: btn.label }}
                        />
                    ))}
                </div>
            </div>

            {/* Toggle Button Kanan (Mobile Only) */}
            <div className={`absolute top-20 z-40 transition-all duration-300 ease-in-out lg:hidden ${
                isSidebarRightOpen ? 'right-[17.9rem]' : 'right-0'
            }`}>
                <div className="flex items-center w-10 text-teal-400 bg-white border-t-2 border-l-2 border-b-2 rounded-tl-xl rounded-bl-xl border-teal-300">
                    <button
                        title="Style Manager"
                        className="p-1"
                        onClick={onToggleRight}
                        dangerouslySetInnerHTML={{
                            __html: isSidebarRightOpen
                                ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>'
                                : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M17 17a2 2 0 0 1 -2 -2v-8h-5a2 2 0 0 0 -2 2" /><path d="M7 17a2.775 2.775 0 0 0 2.632 -1.897l.368 -1.103a13.4 13.4 0 0 1 3.236 -5.236l1.764 -1.764" /><path d="M10 14h5" /></svg>',
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default ToggleButtons;
