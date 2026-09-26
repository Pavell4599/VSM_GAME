export async function aiChat(message, scenarioContext = '') {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/ai/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message, scenario_context: scenarioContext })
        });
        
        if (res.ok) {
            return await res.json();
        }
    } catch (error) {
        console.warn('AI сервер недоступен, используем заглушку (stub)...');
    }

    // === ЗАГЛУШКА (STUB) ДЛЯ ДЕМОНСТРАЦИИ НА ХАКАТОНЕ ===
    // Имитирует задержку "печатания" ИИ
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                response: `[ЗАГЛУШКА ИИ] Понял вас. Это тестовый ответ, так как модель Qwen пока не запущена локально. Но механика изменения шкал работает!`,
                loyalty_change: 5,   // ИИ повышает лояльность
                safety_change: 2     // ИИ немного повышает безопасность
            });
        }, 1200); // Задержка 1.2 секунды для реалистичности
    });
}