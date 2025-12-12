import axios from 'axios';

// Dynamic Base URL Strategy
// 1. Check if we are running in browser
// 2. If configured URL is localhost but we are on a different IP, force usage of window.location
// 3. Otherwise use env var or fallback (but avoid hardcoded ports if possible)

let baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    if (typeof window !== 'undefined') {
         const protocol = window.location.protocol;
         const host = window.location.hostname;
         const port = import.meta.env.VITE_API_PORT || '8000'; // Default fallback, but try to avoid if ENV exists
         baseURL = `${protocol}//${host}:${port}`;
    } else {
        baseURL = 'http://localhost:8000'; // Server-side fallback (SSR) if ever used
    }
}

// LAN Override Logic: If explicitly set to localhost via ENV but accessed via LAN IP
if (typeof window !== 'undefined' && baseURL.includes('localhost')) {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
         // Try to preserve port from baseURL if possible, or use current location port logic if backend is on same port (unlikely for separate backend)
         // But here we are assuming backend might be on a specific port.
         // If the user provided a localhost URL, we assume they want to map it to the current LAN IP with the SAME port.
         try {
             const urlObj = new URL(baseURL);
             urlObj.hostname = hostname;
             baseURL = urlObj.toString();
             // Remove trailing slash if present to be consistent
             if (baseURL.endsWith('/')) baseURL = baseURL.slice(0, -1);
             console.log('[API] Detected LAN access, overriding localhost API URL to:', baseURL);
         } catch (e) {
             console.warn("[API] Failed to parse baseURL for LAN override", e);
         }
    }
}

if (!baseURL) {
    console.error("[API] Base URL is undefined!");
} else {
    console.log(`[API] Connecting to Backend at: ${baseURL}`);
}

const api = axios.create({
    baseURL: baseURL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid, logout user
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
