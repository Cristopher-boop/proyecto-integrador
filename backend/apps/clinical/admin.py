from django.contrib import admin
from .models import CatComorbilidad, CatDiagnostico, ArchivoFuente, ObservacionBiomedica, MedicamentoAdmision, ComorbilidadAdmision, DiagnosticoEpisodio

admin.site.register(CatComorbilidad)
admin.site.register(CatDiagnostico)
admin.site.register(ArchivoFuente)
admin.site.register(ObservacionBiomedica)
admin.site.register(MedicamentoAdmision)
admin.site.register(ComorbilidadAdmision)
admin.site.register(DiagnosticoEpisodio)