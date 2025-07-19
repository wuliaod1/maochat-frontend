// state.js
// 负责管理应用的全局状态

export let state = {
    token: null,
    user: null,
    socket: null,
    friends: [],
    onlineUsers: [],
    friendRequests: [],
    currentChat: null,
    messages: [],
};

export function setState(newState) {
    state = { ...state, ...newState };
}

export function clearState() {
    state = {
        token: null,
        user: null,
        socket: null,
        friends: [],
        onlineUsers: [],
        friendRequests: [],
        currentChat: null,
        messages: [],
    };
}
