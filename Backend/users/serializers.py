from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Achievement

User = get_user_model()

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['title', 'description']

class UserProfileSerializer(serializers.ModelSerializer):
    achievements = AchievementSerializer(many=True, read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'level', 'xp', 'total_score', 'avatar_url', 'achievements']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url)
        return request.build_absolute_uri('/media/avatars/default.png')