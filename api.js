// api.js
// 负责所有与后端服务器的HTTP通信

const API_BASE_URL = 'https://www.maochat.dpdns.org'; // 您的后端URL
const api = axios.create({ baseURL: API_BASE_URL });

export const setAuthHeader = (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// --- 用户认证 ---
export const login = (username, password) => api.post('/api/users/login', { username, password });
export const register = (username, password) => api.post('/api/users/register', { username, password });

// --- 好友与数据 ---
export const getFriends = () => api.get('/api/users/friends');
export const getFriendRequests = () => api.get('/api/users/friend-requests');
export const getChatHistory = (friendId) => api.get(`/api/users/chat-history/${friendId}`);
export const searchUsers = (query) => api.get(`/api/users/search?q=${query}`);
export const sendFriendRequest = (recipientId) => api.post('/api/users/friend-request', { recipientId });
export const respondToRequest = (senderId, accept) => api.post('/api/users/friend-request/respond', { senderId, accept });

// --- 推送通知 ---
export const getVapidKey = () => api.get('/api/users/vapid-public-key');
export const saveSubscription = (subscription) => api.post('/api/users/save-subscription', subscription);
