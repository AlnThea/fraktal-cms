import { useState, useCallback, useEffect, useRef } from 'react';

export const useFullscreen = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showMiniToolbar, setShowMiniToolbar] = useState(false);
    const [showBlocksModal, setShowBlocksModal] = useState(false);
    const [showPropertiesModal, setShowPropertiesModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [activePropertiesTab, setActivePropertiesTab] = useState('styles');
    const isSwitchingTab = useRef(false);
    const [isToggling, setIsToggling] = useState(false);

    const fullscreenElements = useRef<{
        toolbar: HTMLElement | null;
        blocksModal: HTMLElement | null;
        propertiesModal: HTMLElement | null;
        codeModal: HTMLElement | null;
        undoBtn: HTMLElement | null;
        redoBtn: HTMLElement | null;
        keyHandler: ((e: KeyboardEvent) => void) | null;
        clickHandler: ((e: MouseEvent) => void) | null;
        originalStyles: HTMLElement | null;
        originalLayers: HTMLElement | null;
        originalTraits: HTMLElement | null;
    }>({
        toolbar: null,
        blocksModal: null,
        propertiesModal: null,
        codeModal: null,
        undoBtn: null,
        redoBtn: null,
        keyHandler: null,
        clickHandler: null,
        originalStyles: null,
        originalLayers: null,
        originalTraits: null
    });

    // Function to MOVE panels to properties modal
    const movePanelsToPropertiesModal = useCallback((currentEditor: any) => {
        if (!currentEditor || !showPropertiesModal) return;

        console.log('Moving panels to properties modal...');

        // Store original panels
        const originalStyles = document.querySelector('.styles-container') as HTMLElement;
        const originalLayers = document.querySelector('.layers-container') as HTMLElement;
        const originalTraits = document.querySelector('.traits-container') as HTMLElement;

        // Get fullscreen containers
        const stylesContainer = document.querySelector('.styles-container-fullscreen') as HTMLElement;
        const layersContainer = document.querySelector('.layers-container-fullscreen') as HTMLElement;
        const traitsContainer = document.querySelector('.traits-container-fullscreen') as HTMLElement;

        // Store originals for later restoration
        fullscreenElements.current.originalStyles = originalStyles;
        fullscreenElements.current.originalLayers = originalLayers;
        fullscreenElements.current.originalTraits = originalTraits;

        // Hide originals
        if (originalStyles) originalStyles.style.display = 'none';
        if (originalLayers) originalLayers.style.display = 'none';
        if (originalTraits) originalTraits.style.display = 'none';

        // Reinitialize panels using helper function
        if (stylesContainer) {
            console.log('Reinitializing styles panel...');
            reinitializeGrapesComponent(currentEditor.StyleManager, stylesContainer, originalStyles);

            // Setup collapse/expand untuk style sectors
            setTimeout(() => {
                setupStyleSectorsCollapse(stylesContainer);
            }, 100);
        }

        if (layersContainer && currentEditor.LayerManager) {
            console.log('Reinitializing layers panel...');
            reinitializeGrapesComponent(currentEditor.LayerManager, layersContainer, originalLayers);
        }

        if (traitsContainer && currentEditor.TraitManager) {
            console.log('Reinitializing traits panel...');
            reinitializeGrapesComponent(currentEditor.TraitManager, traitsContainer, originalTraits);
        }

        // Trigger resize event
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }, [showPropertiesModal]);

    // Helper untuk setup collapse/expand pada style sectors
    // Helper untuk setup collapse/expand pada style sectors
    // Di file useFullscreen.ts, perbaiki fungsi setupStyleSectorsCollapse
    const setupStyleSectorsCollapse = (container: HTMLElement) => {
        if (!container) return;

        // Tunggu hingga DOM benar-benar siap
        setTimeout(() => {
            // Cari semua sector headers menggunakan selector yang lebih spesifik
            const sectorHeaders = container.querySelectorAll('.gjs-sm-sector .gjs-sm-sector__header');

            console.log(`Found ${sectorHeaders.length} style sector headers`);

            sectorHeaders.forEach((header, index) => {
                // Skip jika sudah ada event listener
                if ((header as any).__hasCollapseListener) {
                    console.log(`Sector ${index} already has listener, skipping`);
                    return;
                }

                const sector = header.closest('.gjs-sm-sector');
                if (!sector) {
                    console.log(`No sector found for header ${index}`);
                    return;
                }

                const content = sector.querySelector('.gjs-sm-sector__content');
                if (!content) {
                    console.log(`No content found for sector ${index}`);
                    return;
                }

                // Set initial state
                const isInitiallyOpen = sector.getAttribute('data-open') === 'true' ||
                    sector.getAttribute('data-hidden') !== 'true';

                // Set display berdasarkan state awal
                if (!isInitiallyOpen) {
                    (content as HTMLElement).style.display = 'none';
                    sector.setAttribute('data-hidden', 'true');
                } else {
                    (content as HTMLElement).style.display = 'block';
                    sector.setAttribute('data-hidden', 'false');
                }

                // Add collapse/expand icon
                if (!header.querySelector('.collapse-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'collapse-icon';
                    icon.innerHTML = isInitiallyOpen ? '▼' : '▶';
                    icon.style.fontSize = '10px';
                    icon.style.marginLeft = '8px';
                    icon.style.transition = 'transform 0.2s ease';
                    header.appendChild(icon);
                }

                // Add click event
                header.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const currentSector = (e.currentTarget as HTMLElement).closest('.gjs-sm-sector');
                    const currentContent = currentSector?.querySelector('.gjs-sm-sector__content');
                    const icon = currentSector?.querySelector('.collapse-icon');

                    if (currentSector && currentContent && icon) {
                        const isHidden = currentSector.getAttribute('data-hidden') === 'true';

                        if (isHidden) {
                            // Expand
                            (currentContent as HTMLElement).style.display = 'block';
                            currentSector.setAttribute('data-hidden', 'false');
                            icon.innerHTML = '▼';
                        } else {
                            // Collapse
                            (currentContent as HTMLElement).style.display = 'none';
                            currentSector.setAttribute('data-hidden', 'true');
                            icon.innerHTML = '▶';
                        }

                        // Trigger resize untuk GrapesJS
                        setTimeout(() => {
                            window.dispatchEvent(new Event('resize'));
                            if ((window as any).__fullscreenEditor) {
                                (window as any).__fullscreenEditor.trigger('change:canvasOffset');
                            }
                        }, 50);
                    }
                });

                // Mark as having listener
                (header as any).__hasCollapseListener = true;
            });

            console.log(`Style sectors collapse/expand initialized for ${sectorHeaders.length} sectors`);
        }, 200); // Delay untuk memastikan GrapesJS sudah merender
    };

    // Function to RESTORE panels to main DOM
    const restorePanelsToMainDOM = useCallback(() => {
        console.log('Restoring panels to main DOM...');

        const originalStyles = fullscreenElements.current.originalStyles;
        const originalLayers = fullscreenElements.current.originalLayers;
        const originalTraits = fullscreenElements.current.originalTraits;

        const stylesContainer = document.querySelector('.styles-container-fullscreen') as HTMLElement;
        const layersContainer = document.querySelector('.layers-container-fullscreen') as HTMLElement;
        const traitsContainer = document.querySelector('.traits-container-fullscreen') as HTMLElement;

        if (originalStyles && stylesContainer) {
            originalStyles.style.display = '';
            stylesContainer.innerHTML = '';
        }

        if (originalLayers && layersContainer) {
            originalLayers.style.display = '';
            layersContainer.innerHTML = '';
        }

        if (originalTraits && traitsContainer) {
            originalTraits.style.display = '';
            traitsContainer.innerHTML = '';
        }

        // Clear stored originals
        fullscreenElements.current.originalStyles = null;
        fullscreenElements.current.originalLayers = null;
        fullscreenElements.current.originalTraits = null;

        // Trigger resize
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }, []);

    // Function to switch tab di properties modal
    const switchPropertiesModalTab = (tabName: string, currentEditor: any) => {
        console.log('Switching to tab:', tabName);

        // Prevent recursion
        if (isSwitchingTab.current) return;
        isSwitchingTab.current = true;

        setActivePropertiesTab(tabName);

        const propertiesModal = fullscreenElements.current.propertiesModal;
        if (!propertiesModal) {
            isSwitchingTab.current = false;
            return;
        }

        // Update UI tabs
        const tabContents = propertiesModal.querySelectorAll('.properties-modal-tab-content');
        const tabs = propertiesModal.querySelectorAll('.properties-modal-tab');

        tabs.forEach(tab => tab.classList.remove('active'));
        const selectedTab = propertiesModal.querySelector(`[data-tab="${tabName}"]`);
        if (selectedTab) selectedTab.classList.add('active');

        tabContents.forEach(content => {
            content.classList.remove('active');
            (content as HTMLElement).style.display = 'none';
        });

        const selectedContent = propertiesModal.querySelector(`#${tabName}-tab`);
        if (selectedContent) {
            selectedContent.classList.add('active');
            (selectedContent as HTMLElement).style.display = 'block';
        }

        // Reinitialize component based on tab with delay
        setTimeout(() => {
            try {
                const container = propertiesModal.querySelector(`.${tabName}-container-fullscreen`) as HTMLElement;
                const originalContainer = document.querySelector(`.${tabName}-container`) as HTMLElement;

                if (container) {
                    switch(tabName) {
                        case 'styles':
                            if (currentEditor.StyleManager) {
                                reinitializeGrapesComponent(currentEditor.StyleManager, container, originalContainer);

                                // Setup collapse/expand dengan delay lebih lama
                                setTimeout(() => {
                                    setupStyleSectorsCollapse(container);
                                }, 300); // Delay diperpanjang
                            }
                            break;

                        case 'layers':
                            if (currentEditor.LayerManager) {
                                reinitializeGrapesComponent(currentEditor.LayerManager, container, originalContainer);
                            }
                            break;

                        case 'traits':
                            if (currentEditor.TraitManager) {
                                reinitializeGrapesComponent(currentEditor.TraitManager, container, originalContainer);
                            }
                            break;
                    }
                }

                // Reset flag dengan delay
                setTimeout(() => {
                    isSwitchingTab.current = false;
                }, 100);

            } catch (error) {
                console.error('Error in tab switch:', error);
                isSwitchingTab.current = false;
            }
        }, 100);
    };

    // Enter canvas fullscreen mode
    const enterFullscreen = useCallback((currentEditor: any) => {
        try {
            console.log('Entering canvas fullscreen...');

            if (currentEditor && currentEditor.Canvas) {
                const canvasEl = currentEditor.Canvas.getFrameEl();
                const editorContainer = currentEditor.getContainer();

                if (!canvasEl || !editorContainer) {
                    console.warn('Canvas or editor container not found');
                    return;
                }

                // Add fullscreen classes
                canvasEl.classList.add('fullscreen-mode');
                editorContainer.classList.add('fullscreen-mode');

                // Hide sidebars and toolbars
                document.querySelectorAll('.panel__top, aside, .left-sidebar, .right-sidebar').forEach(el => {
                    (el as HTMLElement).style.display = 'none';
                });

                setIsFullscreen(true);
                setShowMiniToolbar(true);

                // Create mini toolbar
                createMiniToolbar(currentEditor);

                // Create modals
                createFullscreenModals(currentEditor);

                // Store editor reference for later use
                (window as any).__fullscreenEditor = currentEditor;

                // Add keyboard shortcuts
                const handleKeyDown = (e: KeyboardEvent) => {
                    const editorInstance = (window as any).__fullscreenEditor;
                    if (!editorInstance) return;

                    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                        e.preventDefault();
                        editorInstance.runCommand('core:undo');
                    }
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                        e.preventDefault();
                        editorInstance.runCommand('core:redo');
                    }
                    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                        e.preventDefault();
                        exitFullscreen(editorInstance);
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        exitFullscreen(editorInstance);
                    }
                };

                // Handle click outside modals
                const handleClickOutside = (e: MouseEvent) => {
                    const target = e.target as HTMLElement;

                    const blocksModal = fullscreenElements.current.blocksModal;
                    const propertiesModal = fullscreenElements.current.propertiesModal;
                    const codeModal = fullscreenElements.current.codeModal;
                    const toolbar = fullscreenElements.current.toolbar;

                    // Cek jika klik di luar blocks modal
                    if (blocksModal &&
                        blocksModal.classList.contains('modal-visible') &&
                        !blocksModal.contains(target) &&
                        !toolbar?.contains(target)) {
                        setShowBlocksModal(false);
                    }

                    // Cek jika klik di luar properties modal
                    if (propertiesModal &&
                        propertiesModal.classList.contains('modal-visible') &&
                        !propertiesModal.contains(target) &&
                        !toolbar?.contains(target)) {
                        setShowPropertiesModal(false);
                        restorePanelsToMainDOM();
                    }

                    // Cek jika klik di luar code modal
                    if (codeModal &&
                        codeModal.classList.contains('modal-visible') &&
                        !codeModal.contains(target) &&
                        !toolbar?.contains(target)) {
                        setShowCodeModal(false);
                    }
                    // Code modal bisa tetap terbuka bersama modal lain
                };

                // Add event listeners
                document.addEventListener('keydown', handleKeyDown);
                document.addEventListener('mousedown', handleClickOutside);

                // Store handlers for cleanup
                fullscreenElements.current.keyHandler = handleKeyDown;
                fullscreenElements.current.clickHandler = handleClickOutside;

                // Render blocks initially
                renderBlocksToFullscreen(currentEditor);

                console.log('Canvas fullscreen entered successfully');
            } else {
                console.error('Editor or Canvas not available for fullscreen');
            }
        } catch (error) {
            console.error('Error entering canvas fullscreen:', error);
        }
    }, []);

    // Exit fullscreen mode
    // Exit fullscreen mode
    const exitFullscreen = useCallback((currentEditor: any) => {
        try {
            console.log('Exiting canvas fullscreen...');

            const canvasEl = currentEditor?.Canvas?.getFrameEl();
            const editorContainer = currentEditor?.getContainer();

            // Remove fullscreen classes
            if (canvasEl) canvasEl.classList.remove('fullscreen-mode');
            if (editorContainer) editorContainer.classList.remove('fullscreen-mode');

            // Show sidebars and toolbars
            document.querySelectorAll('.panel__top, aside, .left-sidebar, .right-sidebar').forEach(el => {
                (el as HTMLElement).style.display = '';
            });

            setIsFullscreen(false);
            setShowMiniToolbar(false);
            setShowBlocksModal(false);
            setShowPropertiesModal(false);
            setShowCodeModal(false);

            // Reset toggling state
            setIsToggling(false);

            // Restore panels before removing modals
            restorePanelsToMainDOM();

            // Remove mini toolbar and modals
            removeFullscreenElements();

            // Remove event listeners
            if (fullscreenElements.current.keyHandler) {
                document.removeEventListener('keydown', fullscreenElements.current.keyHandler);
                fullscreenElements.current.keyHandler = null;
            }

            if (fullscreenElements.current.clickHandler) {
                document.removeEventListener('mousedown', fullscreenElements.current.clickHandler);
                fullscreenElements.current.clickHandler = null;
            }

            // Clear editor reference
            delete (window as any).__fullscreenEditor;

            console.log('Canvas fullscreen exited successfully');
        } catch (error) {
            console.error('Error exiting canvas fullscreen:', error);
        }
    }, []);

    // Function to render blocks to fullscreen modal
    const renderBlocksToFullscreen = (currentEditor: any) => {
        const blocksContent = document.querySelector('.blocks-modal-content');
        if (!blocksContent || !currentEditor.BlockManager) return;

        console.log('Rendering blocks to fullscreen...');

        const blocks = currentEditor.BlockManager.getAll();
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
                if (blockId && currentEditor.BlockManager) {
                    currentEditor.runCommand('click:grab-block', { id: blockId });
                    const block = currentEditor.BlockManager.get(blockId);
                    if (block) {
                        const component = block.getContent();
                        currentEditor.getSelected()?.append(component);
                        setShowBlocksModal(false);
                    }
                }
            });
        });
    };

    // Create mini toolbar (vertical) sesuai dengan CSS Anda
    const createMiniToolbar = (currentEditor: any) => {
        // Remove existing toolbar
        if (fullscreenElements.current.toolbar) {
            fullscreenElements.current.toolbar.remove();
        }

        const miniToolbar = document.createElement('div');
        miniToolbar.className = 'fullscreen-mini-toolbar';
        miniToolbar.innerHTML = `
            <!-- Group 1: Blocks & Properties -->
            <button class="mini-toolbox-btn" id="toggle-blocks-modal" title="Show Blocks">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 14a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-.5.5"/>
                    <path d="M14 10a3.5 3.5 0 0 0-5 0l-4 4a3.5 3.5 0 0 0 5 5l.5-.5"/>
                </svg>
            </button>
            <button class="mini-toolbox-btn properties-modal-btn" id="toggle-properties-modal" title="Show Properties">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 10h10l-5 -5z"/>
                    <path d="M7 14h10l-5 5z"/>
                </svg>
            </button>

            <!-- Divider -->
            <div class="toolbox-divider"></div>

            <!-- Group 2: Code Editor -->
            <button class="mini-toolbox-btn code-modal-btn" id="toggle-code-modal" title="Show Code Editor">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 8l-4 4l4 4"/>
                    <path d="M17 8l4 4l-4 4"/>
                    <path d="M14 4l-4 16"/>
                </svg>
            </button>

            <!-- Divider -->
            <div class="toolbox-divider"></div>

            <!-- Group 3: Undo/Redo -->
            <button class="mini-toolbox-btn" id="fullscreen-undo-btn" title="Undo (Ctrl+Z)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M9 13l-4 -4l4 -4m-4 4h11a4 4 0 0 1 0 8h-1"/>
                </svg>
            </button>
            <button class="mini-toolbox-btn" id="fullscreen-redo-btn" title="Redo (Ctrl+Y)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M15 13l4 -4l-4 -4m4 4h-11a4 4 0 0 0 0 8h1"/>
                </svg>
            </button>

            <!-- Divider -->
            <div class="toolbox-divider"></div>

            <!-- Group 4: Fullscreen Exit -->
            <button class="mini-toolbox-btn" id="exit-fullscreen-btn" title="Exit Fullscreen">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
            </button>
        `;

        document.body.appendChild(miniToolbar);
        fullscreenElements.current.toolbar = miniToolbar;

        // Store button references
        fullscreenElements.current.undoBtn = document.getElementById('fullscreen-undo-btn');
        fullscreenElements.current.redoBtn = document.getElementById('fullscreen-redo-btn');

        // Add event listeners
        document.getElementById('toggle-blocks-modal')?.addEventListener('click', () => {
            if (isToggling) return;
            setIsToggling(true);

            const editorInstance = (window as any).__fullscreenEditor;

            // Gunakan callback untuk mendapatkan state terbaru
            setShowBlocksModal(prevShowBlocksModal => {
                const newShowBlocksModal = !prevShowBlocksModal;

                if (newShowBlocksModal && editorInstance) {
                    renderBlocksToFullscreen(editorInstance);

                    // Tutup properties modal jika terbuka
                    // Di sini kita bisa akses state showPropertiesModal langsung
                    // atau lebih baik, langsung set ke false
                    setShowPropertiesModal(false);
                    restorePanelsToMainDOM();
                }

                return newShowBlocksModal;
            });

            setTimeout(() => setIsToggling(false), 100);
        });

        document.getElementById('toggle-properties-modal')?.addEventListener('click', () => {
            if (isToggling) return;
            setIsToggling(true);

            const editorInstance = (window as any).__fullscreenEditor;

            setShowPropertiesModal(prevShowPropertiesModal => {
                const newShowPropertiesModal = !prevShowPropertiesModal;

                if (newShowPropertiesModal && editorInstance) {
                    movePanelsToPropertiesModal(editorInstance);

                    // Tutup blocks modal jika terbuka
                    setShowBlocksModal(false);
                } else {
                    restorePanelsToMainDOM();
                }

                return newShowPropertiesModal;
            });

            setTimeout(() => setIsToggling(false), 100);
        });

        document.getElementById('toggle-code-modal')?.addEventListener('click', () => {
            const editorInstance = (window as any).__fullscreenEditor;
            const newShowCodeModal = !showCodeModal;
            setShowCodeModal(newShowCodeModal);

            if (newShowCodeModal && editorInstance) {
                setupCodeEditorInModal(editorInstance);
                // Code modal bisa tetap terbuka bersama modal lain
            }
        });

        fullscreenElements.current.undoBtn?.addEventListener('click', () => {
            const editorInstance = (window as any).__fullscreenEditor;
            if (editorInstance) editorInstance.runCommand('core:undo');
        });

        fullscreenElements.current.redoBtn?.addEventListener('click', () => {
            const editorInstance = (window as any).__fullscreenEditor;
            if (editorInstance) editorInstance.runCommand('core:redo');
        });

        document.getElementById('exit-fullscreen-btn')?.addEventListener('click', () => {
            const editorInstance = (window as any).__fullscreenEditor;
            if (editorInstance) exitFullscreen(editorInstance);
        });

        // Update undo/redo button states
        const updateUndoRedoButtons = () => {
            const editorInstance = (window as any).__fullscreenEditor;
            if (!editorInstance) return;

            const um = editorInstance.UndoManager;
            if (fullscreenElements.current.undoBtn) {
                const hasUndo = um.hasUndo();
                (fullscreenElements.current.undoBtn as HTMLButtonElement).disabled = !hasUndo;
                fullscreenElements.current.undoBtn.title = hasUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo';
            }
            if (fullscreenElements.current.redoBtn) {
                const hasRedo = um.hasRedo();
                (fullscreenElements.current.redoBtn as HTMLButtonElement).disabled = !hasRedo;
                fullscreenElements.current.redoBtn.title = hasRedo ? 'Redo (Ctrl+Y)' : 'Nothing to redo';
            }
        };

        // Listen to undo/redo events
        const editorInstance = (window as any).__fullscreenEditor;
        if (editorInstance) {
            editorInstance.on('undo', updateUndoRedoButtons);
            editorInstance.on('redo', updateUndoRedoButtons);
            editorInstance.on('update', updateUndoRedoButtons);

            // Initial update
            setTimeout(updateUndoRedoButtons, 100);
        }
    };

    // Setup code editor in modal
    const setupCodeEditorInModal = (currentEditor: any) => {
        const codeEditorContainer = document.getElementById('code-editor-panel-fullscreen');
        if (!codeEditorContainer || !currentEditor) return;

        console.log('Setting up code editor in modal...');

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
                        >${currentEditor.getHtml()}</textarea>
                    </div>

                    <!-- CSS Tab Content -->
                    <div class="tab-content" id="css-tab-content" style="flex: 1; display: none; flex-direction: column;">
                        <label style="font-weight: bold; margin-bottom: 8px;">CSS Code:</label>
                        <textarea
                            id="css-code-fullscreen"
                            style="width: 100%; height: 100%; min-height: 400px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.5; padding: 15px; border: 1px solid #ddd; border-radius: 6px; resize: none; background: #f8f9fa;"
                            spellcheck="false"
                            placeholder="Enter your CSS code here..."
                        >${currentEditor.getCss()}</textarea>
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
                        currentEditor.setComponents(html.trim());
                    }
                    if (css.trim()) {
                        currentEditor.setStyle(css.trim());
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

    // Create fullscreen modals
    const createFullscreenModals = (currentEditor: any) => {
        // Create blocks modal
        if (!fullscreenElements.current.blocksModal) {
            const blocksModal = document.createElement('div');
            blocksModal.className = 'fullscreen-blocks-modal';
            blocksModal.innerHTML = `
                <div class="blocks-modal-header">
                    <h3>Blocks Library</h3>
                    <button id="close-blocks-modal" title="Close">✕</button>
                </div>
                <div class="blocks-modal-content"></div>
            `;
            document.body.appendChild(blocksModal);
            fullscreenElements.current.blocksModal = blocksModal;

            document.getElementById('close-blocks-modal')?.addEventListener('click', () => {
                setShowBlocksModal(false);
            });
        }

        // Create properties modal
        if (!fullscreenElements.current.propertiesModal) {
            const propertiesModal = document.createElement('div');
            propertiesModal.className = 'fullscreen-properties-modal';
            propertiesModal.innerHTML = `
                <div class="properties-modal-header">
                    <h3>Properties</h3>
                    <div class="header-left">
                        <div class="properties-modal-tabs horizontal ">
                            <button class="properties-modal-tab active" data-tab="styles" data-title="Edit Styles" data-command="show-styles"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-typeface"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M17 17a2 2 0 0 1 -2 -2v-8h-5a2 2 0 0 0 -2 2" /><path d="M7 17a2.775 2.775 0 0 0 2.632 -1.897l.368 -1.103a13.4 13.4 0 0 1 3.236 -5.236l1.764 -1.764" /><path d="M10 14h5" /></svg></button>
                            <button class="properties-modal-tab " data-tab="layers" data-title="Layer Manager" data-command="show-layers"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-squares"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 10a2 2 0 0 1 2 -2h9a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-9a2 2 0 0 1 -2 -2z" /><path d="M16 8v-3a2 2 0 0 0 -2 -2h-9a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h3" /></svg></button>
                            <button class="properties-modal-tab" data-tab="traits" data-title="Component Traits" data-command="show-traits"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-settings"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg></button>
                        </div>
                    </div>
                    <div class="header-right">
                        <button id="close-properties-modal" title="Close">✕</button>
                    </div>
                </div>
                <div class="properties-modal-content">
                    <div class="properties-modal-tab-content active" id="styles-tab" style="display: block;">
                        <div class="styles-container-fullscreen"></div>
                    </div>
                    <div class="properties-modal-tab-content" id="layers-tab" style="display: none;">
                        <div class="layers-container-fullscreen"></div>
                    </div>
                    <div class="properties-modal-tab-content" id="traits-tab" style="display: none;">
                        <div class="traits-container-fullscreen"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(propertiesModal);
            fullscreenElements.current.propertiesModal = propertiesModal;

            document.getElementById('close-properties-modal')?.addEventListener('click', () => {
                setShowPropertiesModal(false);
                restorePanelsToMainDOM();
            });

            // Add tab switching functionality
            propertiesModal.querySelectorAll('.properties-modal-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const tabName = target.dataset.tab;
                    const editorInstance = (window as any).__fullscreenEditor;
                    if (editorInstance && tabName) {
                        switchPropertiesModalTab(tabName, editorInstance);
                    }
                });
            });
        }

        // Create code modal
        if (!fullscreenElements.current.codeModal) {
            const codeModal = document.createElement('div');
            codeModal.className = 'fullscreen-code-modal';
            codeModal.innerHTML = `
                <div class="code-modal-header">
                    <h3>Code Editor</h3>
                    <button id="close-code-modal" title="Close">✕</button>
                </div>
                <div class="code-modal-content">
                    <div id="code-editor-panel-fullscreen"></div>
                </div>
            `;
            document.body.appendChild(codeModal);
            fullscreenElements.current.codeModal = codeModal;

            document.getElementById('close-code-modal')?.addEventListener('click', () => {
                setShowCodeModal(false);
            });
        }
    };

    // Remove all fullscreen elements
    const removeFullscreenElements = () => {
        if (fullscreenElements.current.toolbar) {
            fullscreenElements.current.toolbar.remove();
            fullscreenElements.current.toolbar = null;
        }
        if (fullscreenElements.current.blocksModal) {
            fullscreenElements.current.blocksModal.remove();
            fullscreenElements.current.blocksModal = null;
        }
        if (fullscreenElements.current.propertiesModal) {
            fullscreenElements.current.propertiesModal.remove();
            fullscreenElements.current.propertiesModal = null;
        }
        if (fullscreenElements.current.codeModal) {
            fullscreenElements.current.codeModal.remove();
            fullscreenElements.current.codeModal = null;
        }

        fullscreenElements.current.undoBtn = null;
        fullscreenElements.current.redoBtn = null;
        fullscreenElements.current.originalStyles = null;
        fullscreenElements.current.originalLayers = null;
        fullscreenElements.current.originalTraits = null;
    };

    // Update modal visibility based on state
    useEffect(() => {
        console.log('Fullscreen state updated:', {
            isFullscreen,
            showPropertiesModal,
            activePropertiesTab,
            showBlocksModal,
            showCodeModal
        });

        // Tidak perlu sinkronisasi paksa di sini, biarkan event handler yang mengatur
        // Remove the conflicting logic here

        // Update visibility CSS classes
        if (fullscreenElements.current.blocksModal) {
            if (showBlocksModal) {
                fullscreenElements.current.blocksModal.classList.add('modal-visible');
            } else {
                fullscreenElements.current.blocksModal.classList.remove('modal-visible');
            }
        }

        if (fullscreenElements.current.propertiesModal) {
            if (showPropertiesModal) {
                fullscreenElements.current.propertiesModal.classList.add('modal-visible');
                // Trigger tab switch to update content
                const editorInstance = (window as any).__fullscreenEditor;
                if (editorInstance) {
                    setTimeout(() => {
                        switchPropertiesModalTab(activePropertiesTab, editorInstance);
                    }, 50);
                }
            } else {
                fullscreenElements.current.propertiesModal.classList.remove('modal-visible');
            }
        }

        if (fullscreenElements.current.codeModal) {
            if (showCodeModal) {
                fullscreenElements.current.codeModal.classList.add('modal-visible');
            } else {
                fullscreenElements.current.codeModal.classList.remove('modal-visible');
            }
        }
    }, [showBlocksModal, showPropertiesModal, showCodeModal, activePropertiesTab]);

    // Helper function to close all modals
    const closeAllModals = () => {
        setShowBlocksModal(false);
        setShowPropertiesModal(false);
        setShowCodeModal(false);
        restorePanelsToMainDOM();
    };

    const reinitializeGrapesComponent = (component: any, container: HTMLElement, originalContainer?: HTMLElement) => {
        if (!component) {
            console.warn('Component is null or undefined');
            return false;
        }

        if (!container) {
            console.warn('Container is null or undefined');
            return false;
        }

        try {
            console.log(`Reinitializing ${component.constructor?.name || 'component'}...`);
            console.log('Component has render?', typeof component.render);

            // Clear container
            container.innerHTML = '';

            // Check if component has render method
            if (typeof component.render !== 'function') {
                console.warn('Component does not have render method:', component);

                // Fallback to original content if available
                if (originalContainer && originalContainer.innerHTML.trim()) {
                    console.log('Using fallback from original container');
                    container.innerHTML = originalContainer.innerHTML;
                    return true;
                }
                return false;
            }

            // Render component
            const rendered = component.render();
            console.log('Render result:', rendered);

            if (rendered) {
                if (rendered.nodeType === Node.ELEMENT_NODE) {
                    // If it's an element, append it
                    container.appendChild(rendered);
                    console.log('Appended element node');
                } else if (typeof rendered === 'string') {
                    // If it's a string, set as innerHTML
                    container.innerHTML = rendered;
                    console.log('Set string as innerHTML');
                } else if (rendered instanceof HTMLElement) {
                    // If it's an HTMLElement
                    container.appendChild(rendered);
                    console.log('Appended HTMLElement');
                } else {
                    console.warn('Unknown render result type:', typeof rendered, rendered);
                    return false;
                }

                // Mark as rendered
                component.__rendered = container;

                console.log(`Component ${component.constructor?.name || 'unknown'} reinitialized successfully`);
                return true;
            } else {
                console.warn('Component.render() returned falsy value');
                return false;
            }
        } catch (error) {
            console.error('Error reinitializing component:', error);

            // Fallback to original content
            if (originalContainer && originalContainer.innerHTML.trim()) {
                console.log('Using fallback content after error');
                container.innerHTML = originalContainer.innerHTML;
                return true;
            }
        }

        return false;
    };


    // Fullscreen Modals component
    const FullscreenModals = () => {
        return null; // Modals are handled via DOM manipulation
    };

    return {
        isFullscreen,
        showMiniToolbar,
        showBlocksModal,
        showPropertiesModal,
        showCodeModal,
        activePropertiesTab,
        enterFullscreen,
        exitFullscreen,
        FullscreenModals,
        setShowBlocksModal,
        setShowPropertiesModal,
        setShowCodeModal,
        movePanelsToPropertiesModal,
        restorePanelsToMainDOM,
        switchPropertiesModalTab,
        renderBlocksToFullscreen,
        setupCodeEditorInModal
    };
};
