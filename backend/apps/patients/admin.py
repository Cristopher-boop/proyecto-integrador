from django.contrib import admin
from .models import Paciente, Admision

admin.site.register(Paciente)
admin.site.register(Admision)