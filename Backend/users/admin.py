from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from .models import User, Achievement, UserProgress

admin.site.unregister(Group)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'level', 'xp', 'total_score', 'loyalty_skill', 'safety_skill', 'scenarios_completed']
    list_filter = ['level', 'total_score']

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'achievement_type', 'unlocked_at']
    list_filter = ['achievement_type']

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'scenario', 'completed', 'best_score', 'attempts']