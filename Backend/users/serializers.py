from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Achievement, UserProgress

User = get_user_model()

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'title', 'description', 'achievement_type', 'icon', 'unlocked_at']

class UserProgressSerializer(serializers.ModelSerializer):
    scenario_title = serializers.CharField(source='scenario.title', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ['scenario', 'scenario_title', 'completed', 'best_score', 'attempts', 
                  'last_loyalty', 'last_safety', 'completed_at']

class UserProfileSerializer(serializers.ModelSerializer):
    achievements = AchievementSerializer(many=True, read_only=True)
    progress = UserProgressSerializer(many=True, read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'level', 'xp', 'total_score', 
                  'loyalty_skill', 'safety_skill', 'scenarios_completed',
                  'avatar_url', 'achievements', 'progress', 'created_at']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url)
        return request.build_absolute_uri('/media/avatars/default.png')