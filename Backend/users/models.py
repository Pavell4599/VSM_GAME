from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.png')
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    loyalty_skill = models.IntegerField(default=0, help_text="Навык лояльности пассажиров")
    safety_skill = models.IntegerField(default=0, help_text="Навык безопасности")
    scenarios_completed = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('scenario', 'Сценарий пройден'),
        ('skill', 'Навык развит'),
        ('level', 'Уровень достигнут'),
        ('special', 'Особое достижение'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=100)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES, default='scenario')
    icon = models.CharField(max_length=50, default='🏆')
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-unlocked_at']

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    scenario = models.ForeignKey('scenarios.Scenario', on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    best_score = models.IntegerField(default=0)
    attempts = models.IntegerField(default=0)
    last_loyalty = models.IntegerField(default=50)
    last_safety = models.IntegerField(default=50)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['user', 'scenario']