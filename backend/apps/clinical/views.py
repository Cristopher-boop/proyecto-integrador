from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ArchivoFuente
from apps.patients.models import Admision
from .serializers import ArchivoFuenteSerializer

class ArchivoUploadView(APIView):
    # Esto le dice a Django que no va a recibir texto, sino un archivo físico pesado.
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo_fisico = request.FILES.get('archivo_fisico')
        tipo_documento = request.data.get('tipo_documento')
        numero_episodio = request.data.get('numero_episodio')

        if not all([archivo_fisico, tipo_documento, numero_episodio]):
            return Response(
                {"error": "Faltan datos obligatorios."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            admision = Admision.objects.get(numero_episodio=numero_episodio)
        except Admision.DoesNotExist:
            return Response(
                {"error": "No se encontró el episodio médico."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Guardamos en la base de datos
        archivo = ArchivoFuente.objects.create(
            admision=admision,
            nombre_archivo=archivo_fisico.name,
            tipo_documento=tipo_documento,
            archivo_fisico=archivo_fisico
        )

        serializer = ArchivoFuenteSerializer(archivo)
        return Response(serializer.data, status=status.HTTP_201_CREATED)