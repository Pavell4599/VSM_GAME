from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Scenario, ScenarioNode, ScenarioChoice
from .serializers import ScenarioSerializer
from users.models import UserProgress, Achievement
import requests
from django.conf import settings

User = get_user_model()

class ScenarioListView(generics.ListAPIView):
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        difficulty = self.request.query_params.get('difficulty')
        qs = Scenario.objects.filter(is_active=True)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        return qs

class ScenarioDetailView(generics.RetrieveAPIView):
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Scenario.objects.all()

class ScenarioCompleteView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        scenario_id = request.data.get('scenario_id')
        final_loyalty = request.data.get('final_loyalty', 50)
        final_safety = request.data.get('final_safety', 50)
        choices_made = request.data.get('choices_made', [])
        
        try:
            scenario = Scenario.objects.get(id=scenario_id)
        except Scenario.DoesNotExist:
            return Response({'error': 'Сценарий не найден'}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        progress, created = UserProgress.objects.get_or_create(user=user, scenario=scenario)
        progress.attempts += 1
        
        # Подсчет очков
        total_xp = 0
        for choice_id in choices_made:
            try:
                choice = ScenarioChoice.objects.get(id=choice_id)
                total_xp += choice.xp_reward
            except ScenarioChoice.DoesNotExist:
                pass
        
        # Бонус за завершение
        total_xp += scenario.xp_reward
        
        # Обновление прогресса
        progress.best_score = max(progress.best_score, total_xp)
        progress.last_loyalty = final_loyalty
        progress.last_safety = final_safety
        progress.completed = True
        from django.utils import timezone
        progress.completed_at = timezone.now()
        progress.save()
        
        # Обновление пользователя
        user.xp += total_xp
        user.total_score += total_xp
        user.scenarios_completed += 1
        user.loyalty_skill += max(0, final_loyalty - 50)
        user.safety_skill += max(0, final_safety - 50)
        
        # Проверка уровня
        new_level = (user.xp // 500) + 1
        if new_level > user.level:
            user.level = new_level
            Achievement.objects.create(
                user=user,
                title=f'Уровень {new_level} достигнут!',
                description=f'Вы достигли уровня {new_level}',
                achievement_type='level',
                icon='⭐'
            )
        
        user.save()
        
        # Ачивка за первое прохождение
        if created:
            Achievement.objects.create(
                user=user,
                title=f'Сценарий "{scenario.title}" пройден',
                description=f'Вы успешно завершили сценарий',
                achievement_type='scenario',
                icon=''
            )
        
        # Обратная связь
        feedback = []
        for choice_id in choices_made:
            try:
                choice = ScenarioChoice.objects.get(id=choice_id)
                if choice.feedback:
                    feedback.append({
                        'choice': choice.text,
                        'feedback': choice.feedback,
                        'is_optimal': choice.is_optimal
                    })
            except ScenarioChoice.DoesNotExist:
                pass
        
        return Response({
            'success': True,
            'xp_earned': total_xp,
            'new_level': user.level,
            'final_loyalty': final_loyalty,
            'final_safety': final_safety,
            'feedback': feedback,
            'achievements_unlocked': user.achievements.filter(unlocked_at__gte=progress.completed_at).count()
        })

class AIChatView(generics.CreateAPIView):
    """Прокси для ИИ-модели NPC-пассажира"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        message = request.data.get('message', '')
        scenario_context = request.data.get('scenario_context', '')
        
        if not message:
            return Response({'error': 'Сообщение обязательно'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Формирование промпта с контекстом сценария
        system_prompt = f"""Ты — пассажир поезда ВСМ (высокоскоростной магистали). 
Ты участвуешь в обучающем сценарии для проводников.
Контекст сценария: {scenario_context}
Отвечай как реальный пассажир: можешь быть недовольным, встревоженным, вежливым.
Твои ответы должны быть краткими (1-3 предложения)."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]
        
        try:
            # Запрос к vLLM серверу
            response = requests.post(
                settings.AI_MODEL_URL,
                json={
                    "model": settings.AI_MODEL_NAME,
                    "messages": messages,
                    "max_tokens": 150,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            if response.ok:
                data = response.json()
                ai_message = data['choices'][0]['message']['content']
                return Response({'response': ai_message})
            else:
                return Response({'error': 'ИИ-сервер недоступен'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                
        except requests.exceptions.RequestException:
            # Fallback: заглушка если ИИ недоступен
            return Response({
                'response': '[ИИ недоступен] Пассажир молча смотрит в окно...',
                'fallback': True
            })