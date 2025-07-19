// ui.js
// 负责所有与DOM相关的操作：获取元素、渲染界面、显示/隐藏元素等

export const elements = {
    loginView: document.getElementById('login-view'),
    registerView: document.getElementById('register-view'),
    chatView: document.getElementById('chat-view'),
    loginError: document.getElementById('login-error'),
    registerError: document.getElementById('register-error'),
    currentUsername: document.getElementById('current-username'),
    friendsListContainer: document.getElementById('friends-list-container'),
    friendRequestsContainer: document.getElementById('friend-requests'),
    searchResultsContainer: document.getElementById('search-results'),
    chatPlaceholder: document.getElementById('chat-placeholder'),
    chatWindowContent: document.getElementById('chat-window-content'),
    chatHeader: document.querySelector('#chat-header h3'),
    messagesContainer: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-input'),
};

export const showView = (viewName) => {
    const views = [elements.loginView, elements.registerView, elements.chatView];
    views.forEach(v => v.style.display = 'none');
    elements[`${viewName}View`].style.display = 'flex';
};

export const displayError = (form, message) => {
    elements[`${form}Error`].textContent = message;
};

export const updateUserInfo = (username) => {
    elements.currentUsername.textContent = `你好, ${username}`;
};

export const renderFriendList = (friends, onlineUsers, currentChatId) => {
    elements.friendsListContainer.innerHTML = '';
    if (!friends.length) {
        elements.friendsListContainer.innerHTML = '<p style="text-align:center; color:#888; padding-top:20px;">快去添加好友吧</p>';
        return;
    }
    friends.forEach(friend => {
        const isOnline = onlineUsers.includes(friend._id);
        const isActive = currentChatId === friend._id;
        const item = document.createElement('div');
        item.className = `friend-item ${isActive ? 'active' : ''}`;
        item.dataset.id = friend._id;
        item.innerHTML = `<div class="friend-name"><span class="status-dot ${isOnline ? 'online' : ''}"></span><span>${friend.username}</span></div>`;
        elements.friendsListContainer.appendChild(item);
    });
};

export const renderFriendRequests = (requests) => {
    elements.friendRequestsContainer.innerHTML = '';
    if (!requests.length) return;
    requests.forEach(req => {
        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `<span>${req.username}</span><div class="action-buttons"><button class="accept" data-id="${req.userId}">✓</button><button class="reject" data-id="${req.userId}">×</button></div>`;
        elements.friendRequestsContainer.appendChild(item);
    });
};

export const renderSearchResults = (results) => {
    elements.searchResultsContainer.innerHTML = '<h4>搜索结果</h4>';
    if (!results.length) {
        elements.searchResultsContainer.innerHTML += '<p>未找到用户</p>';
        return;
    }
    results.forEach(u => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `<span>${u.username}</span><div class="action-buttons"><button class="add" data-id="${u._id}">+</button></div>`;
        elements.searchResultsContainer.appendChild(item);
    });
};

export const renderMessages = (messages, currentUserId) => {
    elements.messagesContainer.innerHTML = '';
    messages.forEach(msg => {
        const isSent = msg.sender === currentUserId;
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${isSent ? 'sent' : 'received'}`;
        bubble.textContent = msg.content;
        elements.messagesContainer.appendChild(bubble);

        if (isSent) {
            const statusDiv = document.createElement('div');
            statusDiv.className = 'message-status';
            statusDiv.textContent = msg.status || 'sent';
            elements.messagesContainer.appendChild(statusDiv);
        }
    });
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
};

export const updateChatHeader = (friendName) => {
    elements.chatHeader.textContent = friendName;
};

export const showChatWindow = () => {
    elements.chatPlaceholder.style.display = 'none';
    elements.chatWindowContent.style.display = 'flex';
    if (window.innerWidth <= 768) {
        elements.chatView.classList.add('mobile-chat-active');
    }
};

export const showSidebar = () => {
    elements.chatView.classList.remove('mobile-chat-active');
};

export const clearMessageInput = () => {
    elements.messageInput.value = '';
};

export const clearSearchResults = () => {
    elements.searchResultsContainer.innerHTML = '';
};
