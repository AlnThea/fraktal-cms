import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import { useEditorConfig } from '@/Components/Editor/Hooks/useEditorConfig';
import { usePlugins } from '@/Components/Editor/Hooks/usePlugins';
import { useFullscreen } from '@/Components/Editor/Hooks/useFullscreen';
import Toolbar from './Components/Toolbar';
import LeftSidebar from './Components/Sidebar/LeftSidebar';
import RightSidebar from './Components/Sidebar/RightSidebar';
import GrabbedInfo from './Components/Common/GrabbedInfo';
import { initializeEditorCommands } from '@/Components/Editor/Utils/editorCommands';
import { setupGrabFunctionality } from '@/Components/Editor/Utils/helpers';
import { log, err } from '@/Types/debug';
import { EditorProps } from '@/Types/editor';

const EditorCore: React.FC<EditorProps> = ({ onSave, initialData, editorRef }) => {
    const editorInstanceRef = useRef<any>(null);
    const editorRefInternal = useRef<any>(null);
    const [isSidebarLeftOpen, setIsSidebarLeftOpen] = useState(false);
    const [isSidebarRightOpen, setIsSidebarRightOpen] = useState(false);
    const [activeBlocksPanel, setActiveBlocksPanel] = useState('basic');
    const [editorReady, setEditorReady] = useState(false);

    const { getEditorConfig } = useEditorConfig();
    const { loadPlugins } = usePlugins();
    const {
        isFullscreen,
        enterFullscreen,
        exitFullscreen,
        FullscreenModals,
        setShowBlocksModal,
        setShowPropertiesModal,
        setShowCodeModal,
        renderBlocksContent,
        movePanelsToPropertiesModal,
        setupCodeEditorInModal
    } = useFullscreen();

    // Auto-open sidebars on desktop
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setIsSidebarLeftOpen(true);
            setIsSidebarRightOpen(true);
        }
    }, []);

    // Initialize editor
    useEffect(() => {
        if (!editorInstanceRef.current) return;

        const initializeEditor = async () => {
            try {
                const plugins = await loadPlugins();
                const config = getEditorConfig(plugins);

                const editor = grapesjs.init({
                    ...config,
                    container: editorInstanceRef.current,
                });

                editorRefInternal.current = editor;
                if (editorRef) editorRef.current = editor;

                // Wait for editor to be fully ready
                editor.on('load', () => {
                    log('Editor loaded successfully');

                    // Initialize commands
                    initializeEditorCommands(editor);

                    // Setup grab functionality
                    setupGrabFunctionality(editor);

                    // Setup fullscreen command - IMPLEMENTASI LENGKAP
                    editor.Commands.add('core:fullscreen', {
                        run: (editor: any) => {
                            if (!isFullscreen) {
                                enterFullscreen(editor);
                                // Hide sidebars when entering fullscreen
                                setIsSidebarLeftOpen(false);
                                setIsSidebarRightOpen(false);

                                // Setup fullscreen functionality
                                setupFullscreenFunctionality(editor);
                            } else {
                                exitFullscreen(editor);
                                // Restore sidebars based on device when exiting
                                const device = editor.getDevice();
                                if (device === 'Desktop') {
                                    setIsSidebarLeftOpen(true);
                                    setIsSidebarRightOpen(true);
                                }

                                // Restore panels to original locations
                                restorePanelsToOriginal(editor);
                            }
                        }
                    });

                    // Setup commands for fullscreen modals
                    editor.Commands.add('fullscreen:show-blocks', {
                        run: () => {
                            setShowBlocksModal(true);
                        }
                    });

                    editor.Commands.add('fullscreen:show-properties', {
                        run: () => {
                            setShowPropertiesModal(true);
                        }
                    });

                    editor.Commands.add('fullscreen:show-code', {
                        run: () => {
                            setShowCodeModal(true);
                        }
                    });

                    // Setup undo/redo commands
                    editor.Commands.add('core:undo', {
                        run: (editor: any) => {
                            editor.UndoManager.undo();
                        }
                    });

                    editor.Commands.add('core:redo', {
                        run: (editor: any) => {
                            editor.UndoManager.redo();
                        }
                    });

                    // Setup device commands
                    editor.Commands.add('set-device-desktop', {
                        run: (editor: any) => {
                            editor.setDevice('Desktop');
                        }
                    });

                    editor.Commands.add('set-device-mobile', {
                        run: (editor: any) => {
                            editor.setDevice('Mobile');
                        }
                    });

                    // Setup event listeners
                    setupEditorEvents(editor);

                    setEditorReady(true);
                });

                // Load initial data if provided
                if (initialData) {
                    setTimeout(() => {
                        editor.loadProjectData(initialData);
                    }, 100);
                }

            } catch (error) {
                err('Failed to initialize editor:', error);
                setEditorReady(true);
            }
        };

        initializeEditor();

        return () => {
            if (editorRefInternal.current) {
                editorRefInternal.current.destroy();
            }
        };
    }, [editorRef, initialData]);

    // Setup fullscreen functionality
    const setupFullscreenFunctionality = (editor: any) => {
        // Function to render blocks to fullscreen modal
        const renderBlocksToFullscreen = () => {
            const blocksContent = document.querySelector('.blocks-modal-content');
            if (!blocksContent) return;

            const blocks = editor.BlockManager.getAll();
            const blocksByCategory: { [key: string]: any[] } = {};

            blocks.forEach((block: any) => {
                const category = block.getCategoryLabel() || 'Basic';
                if (!blocksByCategory[category]) {
                    blocksByCategory[category] = [];
                }
                blocksByCategory[category].push(block);
            });

            let html = '';
            Object.entries(blocksByCategory).forEach(([category, categoryBlocks]) => {
                html += `
                    <div class="blocks-modal-category">
                        <div class="blocks-modal-category-title">${category}</div>
                        <div class="blocks-modal-category-grid">
                `;

                categoryBlocks.forEach((block) => {
                    const media = block.getMedia();
                    html += `
                        <div class="modal-block-item" data-block-id="${block.getId()}">
                            <div class="modal-block-media">
                                ${media || '<div style="width: 20px; height: 20px; background: #6c757d; border-radius: 3px;"></div>'}
                            </div>
                            <div class="modal-block-label">${block.getLabel()}</div>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });

            blocksContent.innerHTML = html;

            // Add click handlers to blocks
            blocksContent.querySelectorAll('.modal-block-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const blockId = (e.currentTarget as HTMLElement).dataset.blockId;
                    if (blockId) {
                        editor.runCommand('click:grab-block', { id: blockId });
                        const block = editor.BlockManager.get(blockId);
                        if (block) {
                            const component = block.getContent();
                            editor.getSelected()?.append(component);
                            setShowBlocksModal(false);
                        }
                    }
                });

                // Add hover effects
                item.addEventListener('mouseenter', () => {
                    (item as HTMLElement).style.backgroundColor = '#ecfdf5';
                    (item as HTMLElement).style.borderColor = '#a7f3d0';
                    (item as HTMLElement).style.transform = 'translateY(-2px)';
                    (item as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 122, 204, 0.15)';
                });

                item.addEventListener('mouseleave', () => {
                    (item as HTMLElement).style.backgroundColor = '#fff';
                    (item as HTMLElement).style.borderColor = '#dee2e6';
                    (item as HTMLElement).style.transform = 'translateY(0)';
                    (item as HTMLElement).style.boxShadow = 'none';
                });
            });
        };

        // Function to move panels to properties modal
        const movePanelsToPropertiesModal = () => {
            const stylesContainer = document.querySelector('.styles-container-fullscreen');
            const layersContainer = document.querySelector('.layers-container-fullscreen');
            const traitsContainer = document.querySelector('.traits-container-fullscreen');

            const originalStyles = document.querySelector('.styles-container');
            const originalLayers = document.querySelector('.layers-container');
            const originalTraits = document.querySelector('.traits-container');

            if (stylesContainer && originalStyles) {
                stylesContainer.innerHTML = originalStyles.innerHTML;
                // Hide original during fullscreen
                (originalStyles as HTMLElement).style.display = 'none';
            }

            if (layersContainer && originalLayers) {
                layersContainer.innerHTML = originalLayers.innerHTML;
                (originalLayers as HTMLElement).style.display = 'none';
            }

            if (traitsContainer && originalTraits) {
                traitsContainer.innerHTML = originalTraits.innerHTML;
                (originalTraits as HTMLElement).style.display = 'none';
            }
        };

        // Function to setup code editor in modal
        const setupCodeEditorInModal = () => {
            const codeEditorContainer = document.getElementById('code-editor-panel-fullscreen');
            if (!codeEditorContainer || !editor) return;

            codeEditorContainer.innerHTML = `
                <div style="height: 100%; display: flex; flex-direction: column;">
                    <!-- Tab Header -->
                    <div style="display: flex; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
                        <button class="code-tab-btn active" data-tab="html" style="padding: 12px 20px; border: none; background: none; cursor: pointer; border-bottom: 2px solid #10b981; font-weight: 500; color: #10b981;">
                            HTML
                        </button>
                        <button class="code-tab-btn" data-tab="css" style="padding: 12px 20px; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; font-weight: 500; color: #6b7280;">
                            CSS
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div style="flex: 1; display: flex; flex-direction: column; padding: 20px; gap: 15px; overflow: hidden;">
                        <!-- HTML Tab Content -->
                        <div class="tab-content active" id="html-tab-content" style="flex: 1; display: flex; flex-direction: column;">
                            <label style="font-weight: bold; margin-bottom: 8px;">HTML Code:</label>
                            <textarea
                                id="html-code-fullscreen"
                                style="width: 100%; height: 100%; min-height: 400px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.5; padding: 15px; border: 1px solid #ddd; border-radius: 6px; resize: none; background: #f8f9fa;"
                                spellcheck="false"
                                placeholder="Enter your HTML code here..."
                            >${editor.getHtml()}</textarea>
                        </div>

                        <!-- CSS Tab Content -->
                        <div class="tab-content" id="css-tab-content" style="flex: 1; display: none; flex-direction: column;">
                            <label style="font-weight: bold; margin-bottom: 8px;">CSS Code:</label>
                            <textarea
                                id="css-code-fullscreen"
                                style="width: 100%; height: 100%; min-height: 400px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.5; padding: 15px; border: 1px solid #ddd; border-radius: 6px; resize: none; background: #f8f9fa;"
                                spellcheck="false"
                                placeholder="Enter your CSS code here..."
                            >${editor.getCss()}</textarea>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="padding: 15px 20px; border-top: 1px solid #dee2e6; background: #f8f9fa; display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="apply-code-fullscreen" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                            Apply Changes
                        </button>
                        <button id="close-code-fullscreen" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                            Close
                        </button>
                    </div>
                </div>
            `;

            // Add tab functionality
            const tabButtons = codeEditorContainer.querySelectorAll('.code-tab-btn');
            const tabContents = codeEditorContainer.querySelectorAll('.tab-content');

            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const tabName = this.getAttribute('data-tab');

                    // Update active tab button
                    tabButtons.forEach(btn => {
                        (btn as HTMLElement).style.borderBottomColor = 'transparent';
                        (btn as HTMLElement).style.color = '#6b7280';
                        btn.classList.remove('active');
                    });
                    (this as HTMLElement).style.borderBottomColor = '#10b981';
                    (this as HTMLElement).style.color = '#10b981';
                    this.classList.add('active');

                    // Show/hide tab content
                    tabContents.forEach(content => {
                        (content as HTMLElement).style.display = 'none';
                        content.classList.remove('active');
                    });

                    const activeContent = codeEditorContainer.querySelector(`#${tabName}-tab-content`);
                    if (activeContent) {
                        (activeContent as HTMLElement).style.display = 'flex';
                        activeContent.classList.add('active');
                    }
                });
            });

            // Add apply functionality
            const applyBtn = document.getElementById('apply-code-fullscreen');
            const closeBtn = document.getElementById('close-code-fullscreen');

            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    try {
                        const html = (document.getElementById('html-code-fullscreen') as HTMLTextAreaElement)?.value || '';
                        const css = (document.getElementById('css-code-fullscreen') as HTMLTextAreaElement)?.value || '';

                        // Use safe methods
                        if (html.trim()) {
                            editor.setComponents(html.trim());
                        }
                        if (css.trim()) {
                            editor.setStyle(css.trim());
                        }

                        // Show success feedback
                        (applyBtn as HTMLElement).textContent = 'Applied!';
                        (applyBtn as HTMLElement).style.backgroundColor = '#059669';

                        setTimeout(() => {
                            (applyBtn as HTMLElement).textContent = 'Apply Changes';
                            (applyBtn as HTMLElement).style.backgroundColor = '#10b981';
                            setShowCodeModal(false);
                        }, 1000);

                    } catch (error) {
                        console.error('Error applying code:', error);
                        (applyBtn as HTMLElement).textContent = 'Error!';
                        (applyBtn as HTMLElement).style.backgroundColor = '#dc2626';

                        setTimeout(() => {
                            (applyBtn as HTMLElement).textContent = 'Apply Changes';
                            (applyBtn as HTMLElement).style.backgroundColor = '#10b981';
                        }, 2000);

                        alert('Error applying code. Please check your HTML/CSS syntax.');
                    }
                });
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    setShowCodeModal(false);
                });
            }
        };

        // Function to restore panels to original locations
        const restorePanelsToOriginal = (editor: any) => {
            const stylesContainer = document.querySelector('.styles-container-fullscreen');
            const layersContainer = document.querySelector('.layers-container-fullscreen');
            const traitsContainer = document.querySelector('.traits-container-fullscreen');

            const originalStyles = document.querySelector('.styles-container');
            const originalLayers = document.querySelector('.layers-container');
            const originalTraits = document.querySelector('.traits-container');

            if (stylesContainer && originalStyles) {
                // originalStyles.innerHTML = stylesContainer.innerHTML;
                (originalStyles as HTMLElement).style.display = '';
                stylesContainer.innerHTML = '';
            }

            if (layersContainer && originalLayers) {
                // originalLayers.innerHTML = layersContainer.innerHTML;
                (originalLayers as HTMLElement).style.display = '';
                layersContainer.innerHTML = '';
            }

            if (traitsContainer && originalTraits) {
                // originalTraits.innerHTML = traitsContainer.innerHTML;
                (originalTraits as HTMLElement).style.display = '';
                traitsContainer.innerHTML = '';
            }

            // Trigger re-render if needed
            if (editor.LayerManager && typeof editor.LayerManager.render === 'function') {
                setTimeout(() => {
                    editor.LayerManager.render();
                }, 50);
            }
        };

        // Store functions for later use
        (editor as any).__fullscreenFunctions = {
            renderBlocksToFullscreen,
            movePanelsToPropertiesModal,
            setupCodeEditorInModal,
            restorePanelsToOriginal
        };

        // Initial render
        renderBlocksToFullscreen();
    };

    const setupEditorEvents = (editor: any) => {
        editor.on('device:change', () => {
            const device = editor.getDevice();
            if (device === 'Mobile') {
                setIsSidebarLeftOpen(false);
                setIsSidebarRightOpen(false);
            } else if (device === 'Desktop' && !isFullscreen) {
                setIsSidebarLeftOpen(true);
                setIsSidebarRightOpen(true);
            }
        });

        editor.on('error', (error: any) => {
            err('Editor error:', error);
        });

        // Update blocks when blocks change
        editor.on('block:add', () => {
            if (isFullscreen && editorRefInternal.current?.__fullscreenFunctions?.renderBlocksToFullscreen) {
                editorRefInternal.current.__fullscreenFunctions.renderBlocksToFullscreen();
            }
        });

        editor.on('block:remove', () => {
            if (isFullscreen && editorRefInternal.current?.__fullscreenFunctions?.renderBlocksToFullscreen) {
                editorRefInternal.current.__fullscreenFunctions.renderBlocksToFullscreen();
            }
        });

        // Update properties when component is selected
        editor.on('component:selected', () => {
            if (isFullscreen && editorRefInternal.current?.__fullscreenFunctions?.movePanelsToPropertiesModal) {
                editorRefInternal.current.__fullscreenFunctions.movePanelsToPropertiesModal();
            }
        });
    };

    const handleCommand = (command: string) => {
        if (editorRefInternal.current && editorReady) {
            try {
                editorRefInternal.current.Commands.run(command);
            } catch (error) {
                err('Command error:', error);
            }
        }
    };

    return (
        <div className="flex bg-slate-300 w-full relative h-screen overflow-hidden">
            <GrabbedInfo />

            {/* Toggle Buttons */}
            <div className={`absolute top-20 z-40 transition-all duration-300 ease-in-out ${
                isSidebarLeftOpen ? 'left-[17.9rem]' : 'left-0'
            }`}>
                <div className="flex flex-col space-y-2 pt-1 pb-1 items-center w-10 text-teal-400 bg-white border-t-2 border-r-2 border-b-2 rounded-tr-xl rounded-br-xl border-teal-300">
                    <button
                        title="Block Manager"
                        className="p-1 hover:bg-teal-200 rounded-lg"
                        onClick={() => setIsSidebarLeftOpen(!isSidebarLeftOpen)}
                        dangerouslySetInnerHTML={{
                            __html: isSidebarLeftOpen
                                ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>'
                                : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-blocks"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 4a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z" /><path d="M3 14h12a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h3a2 2 0 0 1 2 2v12" /></svg>',
                        }}
                    />
                    {isSidebarLeftOpen && [
                        {
                            id: 'core:preview',
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>',
                            title: 'Preview'
                        },
                        {
                            id: 'core:fullscreen',
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>',
                            title: 'Fullscreen'
                        },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            title={btn.title}
                            className="p-1 hover:bg-teal-200 rounded-lg"
                            onClick={() => handleCommand(btn.id)}
                            disabled={!editorReady}
                            dangerouslySetInnerHTML={{ __html: btn.label }}
                        />
                    ))}
                </div>
            </div>

            {/* Panel Kiri */}
            <LeftSidebar
                isLeftOpen={isSidebarLeftOpen}
                isRightOpen={isSidebarRightOpen}
                activeBlocksPanel={activeBlocksPanel}
                onBlocksPanelChange={setActiveBlocksPanel}
            />

            {/* Area Editor Utama */}
            <main className="flex flex-col flex-grow relative bg-slate-300">
                <Toolbar onCommand={handleCommand} editorReady={editorReady} />

                <div className="flex flex-grow w-full">
                    {/* Canvas Utama */}
                    <div className={`${isSidebarLeftOpen ? 'ml-72' : 'ml-0'} transition-all duration-300 ease-in-out flex-1`}>
                        <div className="flex-grow editor-canvas">
                            <div ref={editorInstanceRef}></div>
                        </div>
                    </div>

                    {/* Tombol Toggle Sidebar Kanan */}
                    <div className={`absolute top-20 z-40 transition-all duration-300 ease-in-out lg:hidden ${ isSidebarRightOpen ? 'right-[17.9rem]' : 'right-0' }`}>
                        <div className="flex items-center w-10 text-teal-400 bg-white border-t-2 border-l-2 border-b-2 rounded-tl-xl rounded-bl-xl border-teal-300">
                            <button
                                title="Style Manager"
                                className="p-1"
                                onClick={() => setIsSidebarRightOpen(!isSidebarRightOpen)}
                                dangerouslySetInnerHTML={{
                                    __html: isSidebarRightOpen
                                        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>'
                                        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M17 17a2 2 0 0 1 -2 -2v-8h-5a2 2 0 0 0 -2 2" /><path d="M7 17a2.775 2.775 0 0 0 2.632 -1.897l.368 -1.103a13.4 13.4 0 0 1 3.236 -5.236l1.764 -1.764" /><path d="M10 14h5" /></svg>',
                                }}
                            />
                        </div>
                    </div>

                    {/* Panel Kanan */}
                    <RightSidebar isOpen={isSidebarRightOpen} />
                </div>
            </main>

            {/* Fullscreen Modals */}
            {editorReady && (
                <FullscreenModals />
            )}
        </div>
    );
};

export default EditorCore;
