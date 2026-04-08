from django.urls import path
from .views import ArchivoUploadView

urlpatterns = [
    path('upload/', ArchivoUploadView.as_view(), name='archivo-upload'),
]