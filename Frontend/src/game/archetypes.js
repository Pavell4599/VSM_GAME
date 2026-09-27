// Архетипы пассажиров с разными характерами (Синтетические данные, 152-ФЗ)
export const ARCHETYPES = [
    {
        id: 'business',
        name: 'Бизнес-турист',
        description: 'Предприниматель или топ-менеджер. Ценит время, требователен.',
        traits: { patience: 30, demanding: 90, aggression: 40, politeness: 70 },
        phrases: ['Мне нужно работать, здесь слишком шумно!', 'У меня встреча через час, почему вагон не готов?', 'Где Wi-Fi? Мне нужно отправить отчёт!']
    },
    {
        id: 'veteran',
        name: 'Ветеран СВО',
        description: 'Военнослужащий. Сдержан, уважает дисциплину и четкость.',
        traits: { patience: 60, demanding: 50, aggression: 30, politeness: 80 },
        phrases: ['Служу России!', 'В армии было сложнее...', 'Проводник, где мой чай?', 'Дисциплина должна быть!']
    },
    {
        id: 'student',
        name: 'Студент',
        description: 'Молодёжь или цифровой кочевник. Расслаблен, но может быть шумным.',
        traits: { patience: 70, demanding: 30, aggression: 20, politeness: 60 },
        phrases: ['А можно зарядку? Телефон садится...', 'Тут слишком громко, я не могу учиться!', 'А когда следующая остановка?']
    },
    {
        id: 'family',
        name: 'Семья с детьми',
        description: 'Отпускники или многодетные родители. Нуждаются в помощи и внимании.',
        traits: { patience: 50, demanding: 70, aggression: 20, politeness: 80 },
        phrases: ['Ребёнок плачет, помогите пожалуйста!', 'Где можно погреть бутылочку?', 'Нам нужно дополнительное одеяло!']
    },
    {
        id: 'senior',
        name: 'Пенсионер',
        description: 'Пожилой человек или дачник. Медлителен, нуждается в заботе.',
        traits: { patience: 80, demanding: 40, aggression: 10, politeness: 90 },
        phrases: ['Молодой человек, мне трудно нести сумку...', 'А когда обед? Я голодный...', 'Помогите мне найти моё место, я плохо вижу.']
    },
    {
        id: 'foreigner',
        name: 'Иностранный турист',
        description: 'Не знает языка, может быть дезориентирован.',
        traits: { patience: 60, demanding: 50, aggression: 10, politeness: 70 },
        phrases: ['Excuse me, where is my seat?', 'I don\'t understand Russian...', 'Can you help me with luggage?']
    },
    {
        id: 'worker',
        name: 'Вахтовик',
        description: 'Рабочий или строитель. Уставший, может быть резким.',
        traits: { patience: 40, demanding: 60, aggression: 50, politeness: 40 },
        phrases: ['Эй, проводник! Где мой чай?', 'Я устал, хочу спать, тут слишком шумно!', 'Быстрее обслуживай, я тороплюсь!']
    },
    {
        id: 'railway',
        name: 'Железнодорожник',
        description: 'Инспектор или сменный проводник. Знает все регламенты.',
        traits: { patience: 70, demanding: 80, aggression: 20, politeness: 70 },
        phrases: ['По регламенту вы должны...', 'Я знаю, как должна работать эта магистраль!', 'Проверьте документы, пожалуйста.']
    }
];

export const PASSENGER_NAMES = {
    business: ['Александр Петров', 'Дмитрий Соколов', 'Елена Волкова'],
    veteran: ['Иван Сидоров', 'Андрей Кузнецов', 'Сергей Морозов'],
    student: ['Артём Новиков', 'Максим Лебедев', 'Анна Смирнова'],
    family: ['Ольга Белова', 'Татьяна Орлова', 'Ирина Соколова'],
    senior: ['Владимир Семёнов', 'Геннадий Фёдоров', 'Зинаида Морозова'],
    foreigner: ['John Smith', 'Marie Dupont', 'Hans Mueller'],
    worker: ['Василий Строгов', 'Пётр Кузнецов', 'Алексей Сварщиков'],
    railway: ['Виктор Рельсов', 'Борис Вагонов', 'Светлана Путёвкина']
};

export function getRandomArchetype() {
    return ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
}

export function getRandomName(archetypeId) {
    const names = PASSENGER_NAMES[archetypeId] || PASSENGER_NAMES.business;
    return names[Math.floor(Math.random() * names.length)];
}