// app.js
// 应用的主入口和事件协调器

import * as api from './api.js';
import * as ui from './ui.js';
import * as socketHandler from './socket.js';
import { state, setState, clearState } from './state.js';

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initializeApp();
});

function initializeApp() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        setState({ token, user });
        api.setAuthHeader(token);
        initializeChatSession();
    } else {
        ui.showView('login');
    }
}

async function initializeChatSession() {
    ui.showView('chat');
    ui.updateUserInfo(state.user.username);
    
    const callbacks = {
        onOnlineUsersUpdate: (users) => {
            setState({ onlineUsers: users });
            ui.renderFriendList(state.friends, state.onlineUsers, state.currentChat?._id);
        },
        onNewMessage: (message) => {
            if (state.currentChat && message.sender === state.currentChat._id) {
                state.messages.push(message);
                ui.renderMessages(state.messages, state.user.id);
                socketHandler.emitMessageRead({ messageId: message._id });
            }
            // 可以在这里添加桌面通知或声音提示
        },
        onMessageStatusUpdate: ({ messageId, status }) => {
            const msg = state.messages.find(m => m._id === messageId || m.tempId === messageId);
            if (msg) {
                msg.status = status;
                ui.renderMessages(state.messages, state.user.id);
            }
        }
    };
    socketHandler.connect(state.user.id, callbacks);
    
    await fetchData();
    initPWA();
}

async function fetchData() {
    try {
        const [friendsRes, requestsRes] = await Promise.all([
            api.getFriends(),
            api.getFriendRequests()
        ]);
        setState({ friends: friendsRes.data, friendRequests: requestsRes.data });
        ui.renderFriendList(state.friends, state.onlineUsers, state.currentChat?._id);
        ui.renderFriendRequests(state.friendRequests);
    } catch (error) {
        console.error('获取数据失败:', error);
        if (error.response?.status === 401) handleLogout();
    }
}

function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(() => console.log('Service Worker 注册成功'))
                .catch(err => console.log('Service Worker 注册失败: ', err));
        });
    }

    if ('PushManager' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                subscribeToPush();
            }
        });
    }
}

async function subscribeToPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            console.log('用户已订阅推送');
            return;
        }

        const response = await api.getVapidKey();
        const vapidPublicKey = response.data;
        
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
        
        await api.saveSubscription(subscription);
        console.log('成功订阅并保存推送信息');
    } catch (error) {
        console.error('订阅推送通知失败:', error);
    }
}

// --- 事件监听与处理 ---
function initEventListeners() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('message-form').addEventListener('submit', handleSendMessage);
    document.getElementById('search-form').addEventListener('submit', handleSearch);

    document.getElementById('show-register').addEventListener('click', () => { ui.displayError('login', ''); ui.showView('register'); });
    document.getElementById('show-login').addEventListener('click', () => { ui.displayError('register', ''); ui.showView('login'); });
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    document.getElementById('back-to-sidebar-button').addEventListener('click', () => ui.showSidebar());

    document.getElementById('search-results').addEventListener('click', handleAddFriend);
    document.getElementById('friend-requests').addEventListener('click', handleFriendRequestResponse);
    document.getElementById('friends-list-container').addEventListener('click', handleSelectFriend);
}

async function handleLogin(e) {
    e.preventDefault();
    const username = e.target.elements['login-username'].value;
    const password = e.target.elements['login-password'].value;
    try {
        const res = await api.login(username, password);
        const { _id, token } = res.data;
        setState({ user: { id: _id, username }, token });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ id: _id, username }));
        api.setAuthHeader(token);
        initializeChatSession();
    } catch (err) {
        ui.displayError('login', '用户名或密码错误');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = e.target.elements['register-username'].value;
    const password = e.target.elements['register-password'].value;
    if (password.length < 6) {
        ui.displayError('register', '密码长度至少为6位');
        return;
    }
    try {
        const res = await api.register(username, password);
        const { _id, token } = res.data;
        setState({ user: { id: _id, username }, token });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ id: _id, username }));
        api.setAuthHeader(token);
        initializeChatSession();
    } catch (err) {
        ui.displayError('register', '用户名已存在或服务器错误');
    }
}

function handleLogout() {
    localStorage.clear();
    socketHandler.disconnect();
    clearState();
    ui.showView('login');
    ui.showSidebar();
}

async function handleSelectFriend(e) {
    const friendItem = e.target.closest('.friend-item');
    if (!friendItem) return;
    const friendId = friendItem.dataset.id;
    const friend = state.friends.find(f => f._id === friendId);
    if (friend) {
        setState({ currentChat: friend });
        ui.renderFriendList(state.friends, state.onlineUsers, friend._id);
        ui.updateChatHeader(friend.username);
        ui.showChatWindow();
        try {
            const res = await api.getChatHistory(friend._id);
            setState({ messages: res.data });
            ui.renderMessages(state.messages, state.user.id);
        } catch (error) {
            console.error('获取聊天记录失败', error);
        }
    }
}

async function handleSearch(e) {
    e.preventDefault();
    const query = document.getElementById('search-input').value;
    if (!query.trim()) return;
    try {
        const res = await api.searchUsers(query);
        ui.renderSearchResults(res.data);
    } catch (error) {
        console.error('搜索失败', error);
    }
}

async function handleAddFriend(e) {
    if (e.target.classList.contains('add')) {
        const recipientId = e.target.dataset.id;
        try {
            await api.sendFriendRequest(recipientId);
            alert('好友请求已发送');
            ui.clearSearchResults();
        } catch (err) {
            alert(err.response?.data?.message || '发送失败');
        }
    }
}

async function handleFriendRequestResponse(e) {
    if (e.target.matches('button')) {
        const senderId = e.target.dataset.id;
        const accept = e.target.classList.contains('accept');
        try {
            await api.respondToRequest(senderId, accept);
            await fetchData(); // 重新获取数据以更新列表
        } catch (err) {
            alert(err.response?.data?.message || '操作失败');
        }
    }
}

function handleSendMessage(e) {
    e.preventDefault();
    const content = ui.elements.messageInput.value;
    if (!content.trim() || !state.currentChat) return;
    
    const messageData = {
        senderId: state.user.id,
        receiverId: state.currentChat._id,
        content,
    };
    socketHandler.emitSendMessage(messageData);

    // 乐观更新
    const tempMessage = { ...messageData, _id: Date.now().toString(), sender: state.user.id, status: 'sending...' };
    state.messages.push(tempMessage);
    ui.renderMessages(state.messages, state.user.id);
    ui.clearMessageInput();
}

// --- 工具函数 ---
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
