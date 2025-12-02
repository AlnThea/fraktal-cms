import React, { forwardRef } from 'react';

interface CodeModalProps {}

const CodeModal = forwardRef<HTMLDivElement, CodeModalProps>((props, ref) => {
    return (
        <div
            ref={ref}
            className="fullscreen-code-modal"
            style={{
                display: 'none',
                position: 'fixed',
                bottom: '50px',
                left: '50px',
                right: '50px',
                height: '500px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10001,
                overflow: 'hidden'
            }}
        >
            <div className="code-modal-header" style={{
                padding: '15px',
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa'
            }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Code Editor</h3>
                <button
                    id="close-code-modal"
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '3px'
                    }}
                    title="Close Code Editor"
                >
                    ✕
                </button>
            </div>
            <div className="code-modal-content" style={{
                padding: '20px',
                height: 'calc(100% - 60px)',
                overflowY: 'auto'
            }}>
                <div id="code-editor-panel-fullscreen">
                    {/* Code editor content will be populated dynamically */}
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                            <button style={{
                                padding: '8px 16px',
                                border: '1px solid #ddd',
                                background: 'white',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}>HTML</button>
                            <button style={{
                                padding: '8px 16px',
                                border: '1px solid #ddd',
                                background: 'white',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}>CSS</button>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontWeight: 'bold', marginBottom: '8px' }}>HTML Code:</label>
                            <textarea
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    minHeight: '300px',
                                    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    resize: 'none',
                                    background: '#f8f9fa'
                                }}
                                spellCheck="false"
                                placeholder="Enter your HTML code here..."
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button style={{
                                padding: '10px 20px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}>Apply Changes</button>
                            <button style={{
                                padding: '10px 20px',
                                background: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CodeModal.displayName = 'CodeModal';

export default CodeModal;
