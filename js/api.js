import { BACKEND_URL } from './config.js';

async function request(endpoint, options = {}) {
    const url = `${BACKEND_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || '请求失败');
    }
    return response.json();
}

// 假设后端API路径是 /api/auth/login 和 /api/auth/register
export function loginUser(username, password) {
    return request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

export function registerUser(username, password) {
    return request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

// 后续可以增加获取聊天记录、用户列表等的API
