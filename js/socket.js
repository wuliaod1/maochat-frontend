import { io } from "https://cdn.socket.io/4.7.5/socket.io.min.js";
import { BACKEND_URL } from './config.js';
import { getToken } from './auth.js';
import { displayMessage, updateUserList } from './ui.js'; // 导入UI更新函数

let socket;

export function initSocket() {
    const token = getToken();
    if (!token || socket) {
        return;
    }
    
    // 连接Socket.IO服务器，并通过auth选项传递JWT进行身份验证
    socket = io(BACKEND_URL, {
        auth: { token }
    });

    // --- 监听来自服务器的事件 ---

    socket.on('connect', () => {
        console.log('成功连接到 MaoChat 服务器!', socket.id);
    });
    
    // 假设后端会在连接后或有用户上下线时，发送一个'updateUserList'事件
    socket.on('updateUserList', (users) => {
        updateUserList(users);
    });

    // 假设后端用 'newMessage' 事件来广播新消息
    socket.on('newMessage', (message) => {
        displayMessage(message);
    });
    
    socket.on('connect_error', (err) => {
        console.error('连接失败:', err.message);
        // 这里可以处理token过期等情况，例如强制用户登出
    });

    socket.on('disconnect', () => {
        console.log('与服务器断开连接');
    });
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

// --- 向服务器发送事件 ---

// 假设用 'sendMessage' 事件来发送消息
export function sendMessage(text) {
    if (socket && text) {
        // 后端可能需要一个更复杂的消息对象
        const message = {
            text: text,
            // to: 'some_recipient' // 如果是私聊，可能需要指定接收者
        };
        socket.emit('sendMessage', message);
    }
}
