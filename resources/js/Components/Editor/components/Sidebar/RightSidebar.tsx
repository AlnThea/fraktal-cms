import React from 'react';

interface RightSidebarProps {
    isOpen: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen }) => {
    return (
        <aside
            className={`bg-white text-xs transition-transform duration-300 ease-in-out z-40
               flex-shrink-0
               lg:relative lg:w-72 lg:translate-x-0 lg:border-l-2 lg:border-teal-300
               absolute top-0 right-0 h-full w-72
               ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="panel__right h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 bg-white">
                    <button className="flex-1 py-2 text-xs font-medium border-b-2 border-teal-500">
                        Properties
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="layers-container" style={{ display: 'none' }}></div>
                    <div className="styles-container"></div>
                    <div className="traits-container" style={{ display: 'none' }}></div>

                    {/* Container untuk Code Editor */}
                    <div id="code-editor-panel" style={{ display: 'none' }}></div>
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;
