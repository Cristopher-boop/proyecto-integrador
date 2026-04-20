from django.urls import path
from .views import UserListCreateAPIView, UserDetailAPIView, UserReactivarAPIView

urlpatterns = [
    path('', UserListCreateAPIView.as_view(), name='user-list-create'),
    path('<uuid:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('<uuid:pk>/reactivar/', UserReactivarAPIView.as_view(), name='user-reactivar'),
]