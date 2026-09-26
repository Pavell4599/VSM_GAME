from django.db import models

class GameTip(models.Model):
    text = models.TextField(help_text="Текст совета для игрока")
    is_active = models.BooleanField(default=True)