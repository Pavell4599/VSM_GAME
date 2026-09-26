const API_URL = 'http://127.0.0.1:8000/api';

export async function register(username, password) {
    const res = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('token', data.access);
        return { success: true };
    }
    return { success: false, error: data.error };
}

export async function getProfile() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : null;
}

export async function getLeaderboard() {
    const res = await fetch(`${API_URL}/leaderboard/`);
    return res.ok ? await res.json() : [];
}