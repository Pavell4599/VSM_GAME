from django.contrib import admin
from .models import Scenario, ScenarioNode, ScenarioChoice

class ScenarioChoiceInline(admin.TabularInline):
    model = ScenarioChoice
    fk_name = 'node'  # <-- ДОБАВЬ ЭТУ СТРОКУ
    extra = 2

class ScenarioNodeInline(admin.StackedInline):
    model = ScenarioNode
    extra = 1

@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'time_limit', 'xp_reward', 'is_active']
    list_filter = ['difficulty', 'is_active']
    inlines = [ScenarioNodeInline]

@admin.register(ScenarioNode)
class ScenarioNodeAdmin(admin.ModelAdmin):
    list_display = ['node_id', 'scenario', 'node_type', 'speaker']
    list_filter = ['node_type']
    inlines = [ScenarioChoiceInline]