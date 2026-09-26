from rest_framework import serializers
from .models import Scenario, ScenarioNode, ScenarioChoice

class ScenarioChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScenarioChoice
        fields = ['id', 'text', 'next_node', 'loyalty_change', 'safety_change', 
                  'xp_reward', 'is_optimal', 'feedback']

class ScenarioNodeSerializer(serializers.ModelSerializer):
    choices = ScenarioChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = ScenarioNode
        fields = ['node_id', 'node_type', 'text', 'speaker', 'time_limit', 'choices']

class ScenarioSerializer(serializers.ModelSerializer):
    nodes = ScenarioNodeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Scenario
        fields = ['id', 'title', 'description', 'difficulty', 'time_limit', 'xp_reward', 'nodes']