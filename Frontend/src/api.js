const API_URL = 'http://localhost:8000/api';

export async function registerUser(username, password) {
    const res = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        return { success: true, user: data.user };
    }
    return { success: false, error: data.error };
}

export async function login(username, password) {
    const res = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        return { success: true };
    }
    return { success: false, error: data.detail };
}

export async function fetchProfile() {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : null;
}

export async function fetchLeaderboard() {
    const res = await fetch(`${API_URL}/leaderboard/`);
    return res.ok ? await res.json() : [];
}