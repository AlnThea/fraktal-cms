import React from 'react';

interface MiniToolbarProps {
    onToggleBlocks: () => void;
    onToggleProperties: () => void;
    onToggleCode: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onExitFullscreen: () => void;
}

const MiniToolbar: React.FC<MiniToolbarProps> = ({
                                                     onToggleBlocks,
                                                     onToggleProperties,
                                                     onToggleCode,
                                                     onUndo,
                                                     onRedo,
                                                     onExitFullscreen
                                                 }) => {
    return (
        <div className="fullscreen-mini-toolbar">
            {/* Group 1: Blocks & Properties */}
            <button className="mini-toolbox-btn" id="toggle-blocks-modal" title="Show Blocks" onClick={onToggleBlocks}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 14a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-.5.5"/>
                    <path d="M14 10a3.5 3.5 0 0 0-5 0l-4 4a3.5 3.5 0 0 0 5 5l.5-.5"/>
                </svg>
            </button>
            <button className="mini-toolbox-btn properties-modal-btn" id="toggle-properties-modal" title="Show Properties" onClick={onToggleProperties}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 10h10l-5 -5z"/>
                    <path d="M7 14h10l-5 5z"/>
                </svg>
            </button>

            {/* Divider */}
            <div className="toolbox-divider"></div>

            {/* Group 2: Code Editor */}
            <button className="mini-toolbox-btn code-modal-btn" id="toggle-code-modal" title="Show Code Editor" onClick={onToggleCode}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 8l-4 4l4 4"/>
                    <path d="M17 8l4 4l-4 4"/>
                    <path d="M14 4l-4 16"/>
                </svg>
            </button>

            {/* Divider */}
            <div className="toolbox-divider"></div>

            {/* Group 3: Undo/Redo */}
            <button className="mini-toolbox-btn" id="fullscreen-undo-btn" title="Undo (Ctrl+Z)" onClick={onUndo}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M9 13l-4 -4l4 -4m-4 4h11a4 4 0 0 1 0 8h-1"/>
                </svg>
            </button>
            <button className="mini-toolbox-btn" id="fullscreen-redo-btn" title="Redo (Ctrl+Y)" onClick={onRedo}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M15 13l4 -4l-4 -4m4 4h-11a4 4 0 0 0 0 8h1"/>
                </svg>
            </button>

            {/* Divider */}
            <div className="toolbox-divider"></div>

            {/* Group 4: Fullscreen Exit */}
            <button className="mini-toolbox-btn" id="exit-fullscreen-btn" title="Exit Fullscreen" onClick={onExitFullscreen}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
            </button>
        </div>
    );
};

export default MiniToolbar;
