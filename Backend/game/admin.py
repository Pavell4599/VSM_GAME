from django.contrib import admin
from .models import GameTip

@admin.register(GameTip)
class GameTipAdmin(admin.ModelAdmin):
    list_display = ['text', 'is_active']
    list_editable = ['is_active']