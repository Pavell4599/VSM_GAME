from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.png')
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)

class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=100)
    description = models.TextField()
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-unlocked_at']