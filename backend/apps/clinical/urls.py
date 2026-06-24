from django.urls import path
from .views import ArchivoUploadView, ObservacionBiomedicaListCreateAPIView, ObservacionBiomedicaDetailAPIView, ArchivoProcesarOCRAPIView, ExpertSystemDataAPIView, DashboardGlobalStatsAPIView, ReportsDataAPIView, ExportReportsAPIView

urlpatterns = [
    path('archivos/', ArchivoUploadView.as_view(), name='archivo-upload'),
    path('archivos/admision/<str:id_admision>/', ArchivoUploadView.as_view(), name='archivo-list'),
    path('archivos/<uuid:pk>/procesar/', ArchivoProcesarOCRAPIView.as_view(), name='archivo-procesar-ocr'),

    path('observaciones/', ObservacionBiomedicaListCreateAPIView.as_view(), name='observacion-create-bulk'),
    path('observaciones/admision/<str:id_admision>/', ObservacionBiomedicaListCreateAPIView.as_view(), name='observacion-list'),
    
    path('observaciones/<uuid:pk>/', ObservacionBiomedicaDetailAPIView.as_view(), name='observacion-detail'),

    path('expert-system/data/', ExpertSystemDataAPIView.as_view(), name='expert_system_data'),

    path('dashboard/stats/', DashboardGlobalStatsAPIView.as_view(), name='dashboard_stats'),

    path('reports/data/', ReportsDataAPIView.as_view(), name='reports_data'),
    path('reports/export/', ExportReportsAPIView.as_view(), name='export_reports'),
]