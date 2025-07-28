// resources/js/types/axios.d.ts
import axios from 'axios';

declare global {
    interface Window {
        axios: typeof axios;
    }
}
