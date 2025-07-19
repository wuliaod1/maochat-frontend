import { getUserInfo } from './auth.js';

// --- View Selectors ---
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const chatPlaceholder = document.getElementById('chat-placeholder');
const chatWindow = document.getElementById('chat-window');

// --- Element Selectors ---
const friendsListContainer = document.getElementById('friends-list-container');
const requestsContainer = document.getElementById('friend-requests-container');
const searchResultsContainer = document.getElementById('search-results-container');
const messageList = document.getElementById('message-list');
const chatWithUsername = document.getElementById('chat-with-username');
const currentUsername = document.getElementById('current-username');

// --- View Management ---
export function showAuthView() {
    authContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden');
    chatContainer.classList.remove('mobile-chat-active');
}

export function showChatView() {
    authContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    const user = getUserInfo();
    currentUsername.textContent = `你好, ${user.username}`;
}

// --- Chat Window Management ---
export function showChatWindow(friend) {
    chatPlaceholder.classList.add('hidden');
    chatWindow.classList.remove('hidden');
    chatWithUsername.textContent = friend.username;
    if (window.innerWidth <= 768) {
        chatContainer.classList.add('mobile-chat-active');
    }
}
export const hideChatWindow = () => chatContainer.classList.remove('mobile-chat-active');

// --- Rendering Functions ---
export function renderFriendList(friends, onlineUsers = [], currentChatId = null) {
    friendsListContainer.innerHTML = friends.length ? '' : '<p>暂无好友，快去添加吧</p>';
    friends.forEach(friend => {
        const isOnline = onlineUsers.includes(friend._id);
        const isActive = friend._id === currentChatId;
        const item = document.createElement('div');
        item.className = `list-item friend-item ${isActive ? 'active' : ''}`;
        item.dataset.friendId = friend._id;
        item.innerHTML = `
            <div class="friend-info">
                <span class="status-dot ${isOnline ? 'online' : ''}"></span>
                <span>${friend.username}</span>
            </div>
        `;
        friendsListContainer.appendChild(item);
    });
}

export function renderFriendRequests(requests) {
    requestsContainer.innerHTML = requests.length ? '' : '<p>没有新的好友请求</p>';
    requests.forEach(req => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>${req.username}</span>
            <div class="action-buttons">
                <button class="accept" data-id="${req.userId}">✓</button>
                <button class="reject" data-id="${req.userId}">×</button>
            </div>
        `;
        requestsContainer.appendChild(item);
    });
}

export function renderSearchResults(users, friends) {
    searchResultsContainer.innerHTML = users.length ? '' : '<p>未找到用户</p>';
    const friendIds = friends.map(f => f._id);
    users.forEach(user => {
        if (user._id === getUserInfo().id) return; // Don't show self
        const item = document.createElement('div');
        item.className = 'list-item';
        const isFriend = friendIds.includes(user._id);
        item.innerHTML = `
            <span>${user.username}</span>
            ${!isFriend ? `<div class="action-buttons"><button class="add" data-id="${user._id}">+</button></div>` : ''}
        `;
        searchResultsContainer.appendChild(item);
    });
}

export function renderMessages(messages) {
    messageList.innerHTML = '';
    const selfId = getUserInfo().id;
    messages.forEach(msg => {
        const isSent = msg.sender === selfId;
        const bubble = document.createElement('div');
        bubble.className = `message ${isSent ? 'sent' : 'received'}`;
        bubble.textContent = msg.content;
        messageList.appendChild(bubble);
    });
    messageList.scrollTop = messageList.scrollHeight;
}

export const clearSearch = () => { searchResultsContainer.innerHTML = ''; };
export const clearInput = (inputEl) => { inputEl.value = ''; };
export const setAuthError = (msg) => { document.getElementById('auth-error').textContent = msg; };
