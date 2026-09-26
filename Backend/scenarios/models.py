from django.db import models

class Scenario(models.Model):
    DIFFICULTY_CHOICES = [
        ('standard', 'Стандарт'),
        ('comfort', 'Комфорт'),
        ('business', 'Бизнес'),
        ('first', 'Первый класс'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='standard')
    is_active = models.BooleanField(default=True)
    time_limit = models.IntegerField(default=60, help_text="Лимит времени в секундах")
    xp_reward = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.get_difficulty_display()})"

class ScenarioNode(models.Model):
    """Узел сценария (сцена диалога)"""
    NODE_TYPES = [
        ('dialog', 'Диалог'),
        ('choice', 'Выбор действия'),
        ('timer', 'Таймер'),
        ('result', 'Результат'),
    ]
    
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, related_name='nodes')
    node_id = models.CharField(max_length=50, unique=True)
    node_type = models.CharField(max_length=20, choices=NODE_TYPES, default='dialog')
    text = models.TextField(help_text="Текст диалога или описания ситуации")
    speaker = models.CharField(max_length=50, default='NPC', help_text="Кто говорит: NPC, Проводник, Система")
    time_limit = models.IntegerField(null=True, blank=True, help_text="Таймер для этого узла (сек)")
    
    def __str__(self):
        return f"{self.node_id} ({self.node_type})"

class ScenarioChoice(models.Model):
    """Вариант выбора в узле сценария"""
    node = models.ForeignKey(ScenarioNode, on_delete=models.CASCADE, related_name='choices')
    text = models.TextField(help_text="Текст варианта ответа")
    next_node = models.ForeignKey(ScenarioNode, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_choices')
    
    # Влияние на шкалы (-100 до +100)
    loyalty_change = models.IntegerField(default=0, help_text="Изменение лояльности пассажира")
    safety_change = models.IntegerField(default=0, help_text="Изменение рейтинга безопасности")
    xp_reward = models.IntegerField(default=0)
    
    # Флаг правильного выбора
    is_optimal = models.BooleanField(default=False, help_text="Оптимальный выбор для обучения")
    feedback = models.TextField(blank=True, help_text="Обратная связь после выбора")
    
    def __str__(self):
        return self.text[:50]