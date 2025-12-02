import React, { forwardRef } from 'react';

interface BlocksModalProps {}

const BlocksModal = forwardRef<HTMLDivElement, BlocksModalProps>((props, ref) => {
    return (
        <div
            ref={ref}
            className="fullscreen-blocks-modal"
            style={{
                display: 'none',
                position: 'fixed',
                top: '50px',
                left: '50px',
                width: '400px',
                height: 'calc(100vh - 100px)',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10001,
                overflow: 'hidden'
            }}
        >
            <div className="blocks-modal-header" style={{
                padding: '15px',
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa'
            }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Blocks Library</h3>
                <button
                    id="close-blocks-modal"
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '3px'
                    }}
                    title="Close Blocks"
                >
                    ✕
                </button>
            </div>
            <div className="blocks-modal-content" style={{
                padding: '15px',
                height: 'calc(100% - 60px)',
                overflowY: 'auto'
            }}>
                {/* Blocks content will be populated dynamically */}
            </div>
        </div>
    );
});

BlocksModal.displayName = 'BlocksModal';

export default BlocksModal;
