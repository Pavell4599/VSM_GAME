from django.db import models

class GameTip(models.Model):
    text = models.TextField()
    is_active = models.BooleanField(default=True)
    category = models.CharField(max_length=50, default='general')

class LeaderboardEntry(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    scenario = models.ForeignKey('scenarios.Scenario', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']