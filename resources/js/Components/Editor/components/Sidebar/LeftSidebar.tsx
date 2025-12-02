import React from 'react';

interface LeftSidebarProps {
    isLeftOpen: boolean; // Diubah dari isOpen
    isRightOpen: boolean; // Ditambahkan
    activeBlocksPanel: string; // Diubah dari activePanel
    onBlocksPanelChange: (panel: string) => void; // Diubah dari onPanelChange
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
                                                     isLeftOpen,
                                                     isRightOpen,
                                                     activeBlocksPanel,
                                                     onBlocksPanelChange
                                                 }) => {
    return (
        <aside
            className={`absolute left-0 bg-white w-72 z-40 flex-shrink-0 transition-transform duration-300 ease-in-out h-full ${
                isLeftOpen ? 'translate-x-0' : '-translate-x-full' // Diubah dari isSidebarLeftOpen
            }`}
        >
            <div className="p-1 flex flex-col space-y-4 h-full border-r-2 border-teal-300">
                <div className="flex gap-2 mb-2">
                    <button
                        className={`p-2 rounded flex-1 text-sm ${activeBlocksPanel === 'basic' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => onBlocksPanelChange('basic')} // Diubah dari setActiveBlocksPanel
                    >
                        Basic Blocks
                    </button>
                    <button
                        className={`p-2 rounded flex-1 text-sm ${activeBlocksPanel === 'tailwind' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => onBlocksPanelChange('tailwind')} // Diubah dari setActiveBlocksPanel
                    >
                        Tailwind Blocks
                    </button>
                </div>
                <div className={'h-[87vh] pt-1 pb-1 overflow-y-auto'}>
                    <div className="blocks-container flex-grow "></div>
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;
