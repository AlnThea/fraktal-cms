import React, { forwardRef } from 'react';

interface PropertiesModalProps {}

const PropertiesModal = forwardRef<HTMLDivElement, PropertiesModalProps>((props, ref) => {
    return (
        <div
            ref={ref}
            className="fullscreen-properties-modal"
            style={{
                display: 'none',
                position: 'fixed',
                top: '50px',
                right: '50px',
                width: '350px',
                height: 'calc(100vh - 100px)',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10001,
                overflow: 'hidden'
            }}
        >
            <div className="properties-modal-header" style={{
                padding: '15px',
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                backgroundColor: '#f8f9fa'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Properties</h3>
                    <button
                        id="close-properties-modal"
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '5px',
                            borderRadius: '3px'
                        }}
                        title="Close Properties"
                    >
                        ✕
                    </button>
                </div>
                <div className="properties-modal-tabs" style={{ display: 'flex', gap: '5px' }}>
                    <button
                        className="properties-modal-tab"
                        data-tab="styles"
                        data-command="show-styles"
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Styles
                    </button>
                    <button
                        className="properties-modal-tab"
                        data-tab="layers"
                        data-command="show-layers"
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Layers
                    </button>
                    <button
                        className="properties-modal-tab"
                        data-tab="traits"
                        data-command="show-traits"
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Traits
                    </button>
                </div>
            </div>
            <div className="properties-modal-content" style={{
                padding: '15px',
                height: 'calc(100% - 120px)',
                overflowY: 'auto'
            }}>
                <div className="properties-modal-tab-content active" id="styles-tab">
                    <div className="styles-container-fullscreen"></div>
                </div>
                <div className="properties-modal-tab-content" id="layers-tab" style={{ display: 'none' }}>
                    <div className="layers-container-fullscreen"></div>
                </div>
                <div className="properties-modal-tab-content" id="traits-tab" style={{ display: 'none' }}>
                    <div className="traits-container-fullscreen"></div>
                </div>
            </div>
        </div>
    );
});

PropertiesModal.displayName = 'PropertiesModal';

export default PropertiesModal;
