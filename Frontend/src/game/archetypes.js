// Архетипы пассажиров с разными характерами (Синтетические данные, 152-ФЗ)
export const ARCHETYPES = [
    {
        id: 'business',
        name: 'Бизнес-турист',
        sprite: '/assets/sprites&bg/npcs/business.png',
        description: 'Предприниматель или топ-менеджер. Ценит время, требователен, не любит ждать.',
        traits: { patience: 30, demanding: 90, aggression: 40, politeness: 70 },
        phrases: [
            'Мне нужно работать, здесь слишком шумно!',
            'У меня встреча через час, почему вагон не готов?',
            'Где Wi-Fi? Мне нужно срочно отправить отчёт!',
            'Я ожидаю соответствующего сервиса за эти деньги.'
        ]
    },
    {
        id: 'veteran',
        name: 'Ветеран СВО',
        sprite: '/assets/sprites&bg/npcs/veteran.png',
        description: 'Военнослужащий. Сдержан, уважает дисциплину, четкость и субординацию.',
        traits: { patience: 60, demanding: 50, aggression: 30, politeness: 80 },
        phrases: [
            'Служу России!',
            'В армии было сложнее, но порядок должен быть.',
            'Проводник, где мой чай?',
            'Дисциплина должна соблюдаться неукоснительно.'
        ]
    },
    {
        id: 'student',
        name: 'Студент',
        sprite: '/assets/sprites&bg/npcs/student.png',
        description: 'Молодёжь или цифровой кочевник. Расслаблен, может быть шумным, но обычно не конфликтен.',
        traits: { patience: 70, demanding: 30, aggression: 20, politeness: 60 },
        phrases: [
            'А можно зарядку? Телефон садится...',
            'Тут слишком громко, я не могу учиться!',
            'А когда следующая остановка?',
            'Можно мне дополнительную подушку?'
        ]
    },
    {
        id: 'family',
        name: 'Семья с детьми',
        sprite: '/assets/sprites&bg/npcs/family.png',
        description: 'Отпускники или многодетные родители. Нуждаются в помощи, внимании и терпении.',
        traits: { patience: 50, demanding: 70, aggression: 20, politeness: 80 },
        phrases: [
            'Ребёнок плачет, помогите пожалуйста!',
            'Где можно погреть бутылочку?',
            'Нам нужно дополнительное одеяло!',
            'Дети шумят? Мы стараемся их успокоить...'
        ]
    },
    {
        id: 'senior',
        name: 'Пенсионер',
        sprite: '/assets/sprites&bg/npcs/senior.png',
        description: 'Пожилой человек или дачник. Медлителен, нуждается в заботе и уважении.',
        traits: { patience: 80, demanding: 40, aggression: 10, politeness: 90 },
        phrases: [
            'Молодой человек, мне трудно нести сумку...',
            'А когда обед? Я голодный...',
            'В моё время проводники были внимательнее...',
            'Помогите мне найти моё место, я плохо вижу.'
        ]
    },
    {
        id: 'foreigner',
        name: 'Иностранный турист',
        sprite: '/assets/sprites&bg/npcs/foreigner.png',
        description: 'Не знает языка, может быть дезориентирован или напуган.',
        traits: { patience: 60, demanding: 50, aggression: 10, politeness: 70 },
        phrases: [
            'Excuse me, where is my seat?',
            'I don\'t understand Russian...',
            'Can you help me with luggage?',
            'When we arrive to Moscow?'
        ]
    },
    {
        id: 'worker',
        name: 'Вахтовик',
        sprite: '/assets/sprites&bg/npcs/worker.png',
        description: 'Рабочий или строитель. Уставший после смены, может быть резким и прямым.',
        traits: { patience: 40, demanding: 60, aggression: 50, politeness: 40 },
        phrases: [
            'Эй, проводник! Где мой чай?',
            'Я устал, хочу спать, тут слишком шумно!',
            'Почему так дорого? Сервис никакой!',
            'Быстрее обслуживай, я тороплюсь!'
        ]
    },
    {
        id: 'railway',
        name: 'Железнодорожник',
        sprite: '/assets/sprites&bg/npcs/railway.png',
        description: 'Инспектор или сменный проводник. Знает все регламенты и любит делать замечания.',
        traits: { patience: 70, demanding: 80, aggression: 20, politeness: 70 },
        phrases: [
            'По регламенту вы должны...',
            'Я знаю, как должна работать эта магистраль!',
            'Проверьте документы, пожалуйста.',
            'В моё время мы работали лучше и без напоминаний.'
        ]
    }
];

// Случайные имена для пассажиров по архетипам
export const PASSENGER_NAMES = {
    business: ['Александр Петров', 'Дмитрий Соколов', 'Елена Волкова', 'Михаил Козлов'],
    veteran: ['Иван Сидоров', 'Андрей Кузнецов', 'Сергей Морозов', 'Николай Павлов'],
    student: ['Артём Новиков', 'Максим Лебедев', 'Анна Смирнова', 'Дарья Иванова'],
    family: ['Ольга Белова', 'Татьяна Орлова', 'Ирина Соколова', 'Мария Попова'],
    senior: ['Владимир Семёнов', 'Геннадий Фёдоров', 'Зинаида Морозова', 'Валентина Козлова'],
    foreigner: ['John Smith', 'Marie Dupont', 'Hans Mueller', 'Yuki Tanaka'],
    worker: ['Василий Строгов', 'Пётр Кузнецов', 'Алексей Сварщиков', 'Григорий Монтажев'],
    railway: ['Виктор Рельсов', 'Борис Вагонов', 'Светлана Путёвкина', 'Анатолий Шпалов']
};

// Функция случайного выбора архетипа
export function getRandomArchetype() {
    return ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
}

// Функция случайного имени по архетипу
export function getRandomName(archetypeId) {
    const names = PASSENGER_NAMES[archetypeId] || PASSENGER_NAMES.business;
    return names[Math.floor(Math.random() * names.length)];
}