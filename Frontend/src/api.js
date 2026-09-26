const API_URL = 'http://localhost:8000/api'; // Адрес твоего Django сервера

export async function handleRegisterAPI(username, password) {
    const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.token);
        return true;
    }
    return false;
}

export async function fetchProfile() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok ? await response.json() : null;
}

export async function fetchLeaderboard() {
    const response = await fetch(`${API_URL}/leaderboard/`);
    return response.ok ? await response.json() : [];
}