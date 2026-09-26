from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from users.views import RegisterView, UserProfileView
from scenarios.views import ScenarioListView, ScenarioDetailView, ScenarioCompleteView, AIChatView
from game.views import LeaderboardView

def api_root(request):
    return JsonResponse({
        'message': 'VSM Game API - Геймификация для проводников ВСМ',
        'version': '1.0',
        'endpoints': {
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
            },
            'profile': '/api/profile/',
            'scenarios': '/api/scenarios/',
            'scenario_detail': '/api/scenarios/{id}/',
            'scenario_complete': '/api/scenarios/complete/',
            'ai_chat': '/api/ai/chat/',
            'leaderboard': '/api/leaderboard/',
            'admin': '/admin/'
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/profile/', UserProfileView.as_view(), name='profile'),
    path('api/scenarios/', ScenarioListView.as_view(), name='scenarios-list'),
    path('api/scenarios/<int:pk>/', ScenarioDetailView.as_view(), name='scenario-detail'),
    path('api/scenarios/complete/', ScenarioCompleteView.as_view(), name='scenario-complete'),
    path('api/ai/chat/', AIChatView.as_view(), name='ai-chat'),
    path('api/leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)