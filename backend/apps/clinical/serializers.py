from rest_framework import serializers
from .models import ArchivoFuente

class ArchivoFuenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchivoFuente
        fields = '__all__'