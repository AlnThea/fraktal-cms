declare global {
    interface Window {
        route: (name: string, params?: any, absolute?: boolean) => string;
    }
}
