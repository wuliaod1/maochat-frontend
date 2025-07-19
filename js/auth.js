const TOKEN_KEY = 'maochat_token';
const USER_INFO_KEY = 'maochat_user';

export function saveAuthData(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUserInfo() {
    const user = localStorage.getItem(USER_INFO_KEY);
    return user ? JSON.parse(user) : null;
}

export function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
}

export function isLoggedIn() {
    return !!getToken();
}
