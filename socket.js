// socket.js
// 负责所有与Socket.IO服务器的连接、事件监听和发送

import { state, setState } from './state.js';

let socket;

export function connect(userId, callbacks) {
    if (socket) disconnect();
    
    // 从API模块获取基础URL，或者直接硬编码
    const SOCKET_URL = 'https://www.maochat.dpdns.org'; 
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('Socket连接成功, ID:', socket.id);
        socket.emit('go-online', userId);
    });

    socket.on('online-users-list', callbacks.onOnlineUsersUpdate);
    socket.on('receive-message', callbacks.onNewMessage);
    socket.on('message-status-update', callbacks.onMessageStatusUpdate);
    
    setState({ socket });
}

export function disconnect() {
    if (socket) {
        socket.disconnect();
        setState({ socket: null });
    }
}

export function emitSendMessage(messageData) {
    if (socket) {
        socket.emit('private-message', messageData);
    }
}

export function emitMessageRead(data) {
    if (socket) {
        socket.emit('message-read', data);
    }
}
