from rest_framework import serializers
from .models import Paciente, Admision

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'

class AdmisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admision
        fields = '__all__'