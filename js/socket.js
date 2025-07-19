// ！！注意：我们已经删除了顶部的 import { io } from ... 这一行 ！！

import { BACKEND_URL } from './config.js';
import { getToken } from './auth.js';

let socket;

// Connects to the socket server and sets up listeners
export function initSocket(listeners) {
    const token = getToken();
    if (!token || socket?.connected) return;

    // 因为 io 是通过 index.html 中的 <script> 标签全局加载的，
    // 所以我们在这里可以直接使用，无需 import。
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
