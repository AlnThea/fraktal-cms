declare global {
    interface Window {
        route: (name: string, params?: any, absolute?: boolean) => string;
    }
}

declare module '@alnthea/react-tailwind-modal' {
    import * as React from "react";

    interface TModalProps {
        isOpen: boolean;
        onClose: () => void;
        maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | string;
        disableClickOutside?: boolean;
        children?: React.ReactNode;
    }

    const Modal: React.FC<TModalProps>;
    export default Modal;
}
