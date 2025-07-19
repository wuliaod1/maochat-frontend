import * as api from './api.js';
import * as auth from './auth.js';
import * as socket from './socket.js';
import * as ui from './ui.js';

// --- DOM元素获取 ---
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const sendBtn = document.getElementById('send-btn');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const messageInput = document.getElementById('message-input');
const themeSelect = document.getElementById('theme-select');

// --- 事件监听器 ---

// 登录
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    if (!username || !password) {
        ui.setAuthError('用户名和密码不能为空');
        return;
    }
    try {
        ui.clearAuthError();
        const data = await api.loginUser(username, password);
        // 假设登录成功返回 { token, user }
        auth.saveAuthData(data.token, data.user);
        initializeApp();
    } catch (error) {
        ui.setAuthError(error.message);
    }
});

// 注册
registerBtn.addEventListener('click', async () => {
    // ... 注册逻辑与登录类似 ...
});

// 发送消息
sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text) {
        socket.sendMessage(text);
        ui.clearMessageInput();
    }
});
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

// 登出
logoutBtn.addEventListener('click', () => {
    auth.clearAuthData();
    socket.disconnectSocket();
    ui.showLoginInterface();
});

// 切换主题
themeSelect.addEventListener('change', (e) => {
    document.body.className = e.target.value;
});


// --- 应用初始化 ---

function initializeApp() {
    if (auth.isLoggedIn()) {
        ui.showChatInterface();
        socket.initSocket();
    } else {
        ui.showLoginInterface();
    }
}

// 当页面加载完成时，开始初始化流程
document.addEventListener('DOMContentLoaded', initializeApp);
