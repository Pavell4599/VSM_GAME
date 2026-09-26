from django.contrib import admin
from .models import GameTip, LeaderboardEntry

@admin.register(GameTip)
class GameTipAdmin(admin.ModelAdmin):
    list_display = ['text', 'category', 'is_active']
    list_editable = ['is_active']

@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'scenario', 'created_at']