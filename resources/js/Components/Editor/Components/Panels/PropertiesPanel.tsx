// Components/PropertiesPanel.tsx
import React, { useEffect, useRef } from 'react';

interface PropertiesPanelProps {
    isOpen: boolean;
    onToggle: () => void;
    editor?: any;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ isOpen, onToggle, editor }) => {
    const stylesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editor && isOpen && stylesContainerRef.current) {
            // Clear container terlebih dahulu
            stylesContainerRef.current.innerHTML = '';

            // Force render style manager dengan delay
            setTimeout(() => {
                if (editor.StyleManager && typeof editor.StyleManager.render === 'function') {
                    try {
                        const styleManager = editor.StyleManager;

                        // Render style manager ke container
                        const stylesEl = styleManager.render();
                        if (stylesEl && stylesContainerRef.current) {
                            stylesContainerRef.current.appendChild(stylesEl);
                        }

                        console.log('✅ Style Manager rendered successfully');
                        console.log('🎯 Available sectors:',
                            Array.from(styleManager.getSectors().map((sector: any) => sector.getName()))
                        );
                    } catch (error) {
                        console.error('❌ Error rendering style manager:', error);
                    }
                }
            }, 300); // Delay lebih lama untuk memastikan editor ready
        }
    }, [editor, isOpen]);

    return (
        <aside
            className={`bg-white transition-all duration-300 ease-in-out z-40
                flex-shrink-0
                lg:relative lg:w-72 lg:translate-x-0 lg:border-l-2 lg:border-teal-300
                absolute top-0 right-0 h-full w-72
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="panel__right h-full flex flex-col">
                <div className="flex border-b border-gray-200 bg-white">
                    <button className="flex-1 py-2 text-xs font-medium border-b-2 border-teal-500">
                        Properties
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {/* Container untuk Style Manager - INI YANG MENAMPILKAN GENERAL, FLEX, DIMENSION, DLL */}
                    <div
                        ref={stylesContainerRef}
                        className="styles-container"
                    ></div>

                    {/* Sembunyikan containers lainnya untuk fokus ke styles dulu */}
                    <div className="layers-container" style={{ display: 'none' }}></div>
                    <div className="traits-container" style={{ display: 'none' }}></div>
                    <div id="code-editor-panel" style={{ display: 'none' }}></div>
                </div>
            </div>
        </aside>
    );
};

export default PropertiesPanel;
