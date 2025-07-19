import { getUserInfo } from './auth.js';

const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const messageList = document.getElementById('message-list');
const messageInput = document.getElementById('message-input');
const userList = document.getElementById('user-list');
const authError = document.getElementById('auth-error');

export function showChatInterface() {
    authContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    chatContainer.classList.add('fade-in');
}

export function showLoginInterface() {
    chatContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    authContainer.classList.add('fade-in');
}

// 渲染消息到界面
export function displayMessage(message) {
    const self = getUserInfo();
    const isOutgoing = message.sender.id === self.id;

    const messageEl = document.createElement('div');
    messageEl.classList.add('message', isOutgoing ? 'outgoing' : 'incoming', 'slide-in-up');
    
    messageEl.innerHTML = `
        <div class="sender">${message.sender.username}</div>
        <div class="text">${message.text}</div>
    `;

    messageList.appendChild(messageEl);
    // 自动滚动到底部
    messageList.scrollTop = messageList.scrollHeight;
}

// 更新在线用户列表
export function updateUserList(users) {
    userList.innerHTML = ''; // 清空
    users.forEach(user => {
        const userEl = document.createElement('li');
        userEl.textContent = user.username;
        userList.appendChild(userEl);
    });
}

export function clearMessageInput() {
    messageInput.value = '';
}

export function setAuthError(message) {
    authError.textContent = message;
}

export function clearAuthError() {
    authError.textContent = '';
}
