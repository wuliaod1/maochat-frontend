import * as api from './api.js';
import * as auth from './auth.js';
import * as socket from './socket.js';
import * as ui from './ui.js';

document.addEventListener('DOMContentLoaded', () => {

    let state = {
        friends: [],
        onlineUsers: [],
        friendRequests: [],
        currentChat: null,
        messages: []
    };

    // --- DOM Elements ---
    const dom = {
        loginBtn: document.getElementById('login-btn'),
        registerBtn: document.getElementById('register-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        sendBtn: document.getElementById('send-btn'),
        backToSidebarBtn: document.getElementById('back-to-sidebar-btn'),
        usernameInput: document.getElementById('username-input'),
        passwordInput: document.getElementById('password-input'),
        messageForm: document.getElementById('message-form'),
        messageInput: document.getElementById('message-input'),
        themeSelect: document.getElementById('theme-select'),
        searchForm: document.getElementById('search-form'),
        searchInput: document.getElementById('search-input'),
        friendsListContainer: document.getElementById('friends-list-container'),
        requestsContainer: document.getElementById('friend-requests-container'),
        searchResultsContainer: document.getElementById('search-results-container'),
    };

    // --- Core Functions ---
    async function initializeApp() {
        if (auth.isLoggedIn()) {
            ui.showChatView();
            await fetchData();
            const socketListeners = {
                onConnect: () => socket.notifyOnline(auth.getUserInfo().id),
                onOnlineUsersUpdate: (users) => {
                    state.onlineUsers = users;
                    ui.renderFriendList(state.friends, state.onlineUsers, state.currentChat?._id);
                },
                onReceiveMessage: (message) => {
                    if (state.currentChat && message.sender === state.currentChat._id) {
                        state.messages.push(message);
                        ui.renderMessages(state.messages);
                    }
                    // Add notification logic here later
                },
                onNewFriendRequest: fetchData,
                onFriendListUpdate: fetchData,
            };
            socket.initSocket(socketListeners);
        } else {
            ui.showAuthView();
        }
    }

    async function fetchData() {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                api.getFriends(),
                api.getFriendRequests()
            ]);
            state.friends = friendsRes;
            state.friendRequests = requestsRes;
            ui.renderFriendList(state.friends, state.onlineUsers, state.currentChat?._id);
            ui.renderFriendRequests(state.friendRequests);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            if(error.message.includes('401') || error.message.includes('Unauthorized')) handleLogout();
        }
    }

    async function handleLogin() {
        ui.setAuthError('');
        try {
            const res = await api.loginUser(dom.usernameInput.value, dom.passwordInput.value);
            auth.saveAuthData(res.token, { id: res._id, username: res.username });
            initializeApp();
        } catch (error) {
            ui.setAuthError(error.message);
        }
    }

    function handleLogout() {
        auth.clearAuthData();
        socket.disconnectSocket();
        state = { friends: [], onlineUsers: [], friendRequests: [], currentChat: null, messages: [] };
        ui.showAuthView();
    }
    
    async function selectChat(friendId) {
        const friend = state.friends.find(f => f._id === friendId);
        if (!friend || friendId === state.currentChat?._id) return;

        state.currentChat = friend;
        ui.renderFriendList(state.friends, state.onlineUsers, state.currentChat._id);
        ui.showChatWindow(friend);
        
        try {
            const history = await api.getChatHistory(friend._id);
            state.messages = history;
            ui.renderMessages(state.messages);
        } catch (error) {
            console.error("Failed to get chat history:", error);
        }
    }

    // --- Event Listeners ---
    dom.loginBtn.addEventListener('click', handleLogin);
    dom.logoutBtn.addEventListener('click', handleLogout);
    dom.backToSidebarBtn.addEventListener('click', ui.hideChatWindow);
    dom.themeSelect.addEventListener('change', (e) => document.body.className = e.target.value);

    dom.searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = dom.searchInput.value.trim();
        if (!query) return;
        try {
            const users = await api.searchUsers(query);
            ui.renderSearchResults(users, state.friends);
        } catch (error) { console.error(error); }
    });

    dom.messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = dom.messageInput.value.trim();
        if (!content || !state.currentChat) return;

        const messageData = {
            senderId: auth.getUserInfo().id,
            receiverId: state.currentChat._id,
            content: content
        };
        socket.sendPrivateMessage(messageData);
        // Optimistic UI update
        state.messages.push({ sender: auth.getUserInfo().id, content: content });
        ui.renderMessages(state.messages);
        ui.clearInput(dom.messageInput);
    });

    // Event Delegation for dynamic lists
    dom.friendsListContainer.addEventListener('click', (e) => {
        const friendItem = e.target.closest('.friend-item');
        if (friendItem) selectChat(friendItem.dataset.friendId);
    });

    dom.requestsContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if(!button) return;
        const accept = button.classList.contains('accept');
        const senderId = button.dataset.id;
        try {
            await api.respondToFriendRequest(senderId, accept);
            await fetchData(); // Refresh lists
        } catch(error) { alert('操作失败'); }
    });
    
    dom.searchResultsContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('button.add');
        if(!button) return;
        try {
            await api.sendFriendRequest(button.dataset.id);
            alert('好友请求已发送！');
            ui.clearInput(dom.searchInput);
            ui.clearSearch();
        } catch(error) { alert(error.message); }
    });

    initializeApp();
});
