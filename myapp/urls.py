from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, ActivityLogViewSet, UserViewSet, AssignTaskView, ContributorListView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'activity-logs', ActivityLogViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('assign-task/', AssignTaskView.as_view(), name='assign-task'),
    path('contributors/', ContributorListView.as_view(), name='contributors'),
]