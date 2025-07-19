import { BACKEND_URL } from './config.js';
import { getToken } from './auth.js';

async function request(endpoint, options = {}) {
    const url = `${BACKEND_URL}${endpoint}`;
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || '请求失败');
    }
    // Handle cases where the response might be empty (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return {}; // Return empty object for non-json responses
}

// --- Auth ---
export const loginUser = (username, password) => request('/api/users/login', { method: 'POST', body: JSON.stringify({ username, password }) });
export const registerUser = (username, password) => request('/api/users/register', { method: 'POST', body: JSON.stringify({ username, password }) });

// --- Friends ---
export const getFriends = () => request('/api/users/friends');
export const getFriendRequests = () => request('/api/users/friend-requests');
export const searchUsers = (query) => request(`/api/users/search?q=${query}`);
export const sendFriendRequest = (recipientId) => request('/api/users/friend-request', { method: 'POST', body: JSON.stringify({ recipientId }) });
export const respondToFriendRequest = (senderId, accept) => request('/api/users/friend-request/respond', { method: 'POST', body: JSON.stringify({ senderId, accept }) });

// --- Chat ---
export const getChatHistory = (friendId) => request(`/api/users/chat-history/${friendId}`);```

#### **5. `js/socket.js` (Heavily Updated)**

Manages all real-time event emissions and listeners as defined by your backend logic.

```javascript
import { io } from "https://cdn.socket.io/4.7.5/socket.io.min.js";
import { BACKEND_URL } from './config.js';
import { getToken } from './auth.js';

let socket;

// Connects to the socket server and sets up listeners
export function initSocket(listeners) {
    const token = getToken();
    if (!token || socket?.connected) return;

    // Use the token for authentication in query or auth object as per backend setup
    // The reference file implies an 'go-online' event is used for auth after connecting.
    socket = io(BACKEND_URL, {
        // auth: { token } // Alternative auth method if backend supports it
    });

    // --- SETUP LISTENERS (from main.js) ---
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        listeners.onConnect(); // Notify main.js
    });

    socket.on('online-users-list', listeners.onOnlineUsersUpdate);
    socket.on('receive-message', listeners.onReceiveMessage);
    socket.on('new-friend-request', listeners.onNewFriendRequest);
    socket.on('friend-list-update', listeners.onFriendListUpdate);

    socket.on('disconnect', () => console.log('Socket disconnected.'));
    socket.on('connect_error', (err) => console.error('Socket connection error:', err));
}

export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
}

// --- EMITTERS ---
export const notifyOnline = (userId) => socket?.emit('go-online', userId);
export const sendPrivateMessage = (messageData) => socket?.emit('private-message', messageData);
export const markMessageAsRead = (messageId) => socket?.emit('message-read', { messageId });
