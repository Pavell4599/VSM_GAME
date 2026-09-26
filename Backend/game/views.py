from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

class LeaderboardView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.order_by('-total_score')[:10]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = [{
            'rank': idx + 1,
            'username': user.username,
            'level': user.level,
            'total_score': user.total_score
        } for idx, user in enumerate(queryset)]
        return Response(data)