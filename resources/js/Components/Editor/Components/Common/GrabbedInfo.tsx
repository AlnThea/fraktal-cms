import React from 'react';

const GrabbedInfo: React.FC = () => {
    return (
        <div
            id="grabbed-info"
            style={{
                position: 'absolute',
                display: 'none',
                padding: '5px 10px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                borderRadius: '5px',
                zIndex: 10000,
                pointerEvents: 'none'
            }}
        ></div>
    );
};

export default GrabbedInfo;
