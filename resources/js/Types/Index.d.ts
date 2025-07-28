export interface PageProps<T = {}> {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    errors: Record<string, string>;
}

export interface Page {
    id: number;
    title: string;
    content: any;
}
