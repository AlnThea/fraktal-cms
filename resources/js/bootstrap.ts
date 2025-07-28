import axios from 'axios';
import _ from 'lodash';

window._ = _;

/**
 * Konfigurasi Axios untuk Laravel
 */
const token = document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.getAttribute('content');

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
} else {
    console.warn('⚠️ CSRF token not found! Laravel mungkin akan blokir POST request!');
}

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// ✅ Assign ke window.setelah deklarasi global ada
window.axios = axios;

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';
// window.Pusher = Pusher;

// window.Echo = new Echo({
//   broadcaster: 'pusher',
//   key: import.meta.env.VITE_PUSHER_APP_KEY,
//   wsHost: import.meta.env.VITE_PUSHER_HOST ?? `ws-${import.meta.env.VITE_PUSHER_CLUSTER}.pusher.com`,
//   wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
//   wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
//   forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
//   enabledTransports: ['ws', 'wss'],
// });
