from rest_framework import serializers
from .models import (
    ArchivoFuente, ObservacionBiomedica, CatComorbilidad, 
    CatDiagnostico, MedicamentoAdmision
)

class ArchivoFuenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchivoFuente
        fields = '__all__'

class ObservacionBiomedicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObservacionBiomedica
        fields = '__all__'

class CatComorbilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatComorbilidad
        fields = '__all__'

class CatDiagnosticoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatDiagnostico
        fields = '__all__'