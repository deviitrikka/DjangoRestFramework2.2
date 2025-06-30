from rest_framework import serializers
from .models import UserProfile, Project, Task, ActivityLog
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'role']

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserProfileSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'created_at', 'owner']

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=UserProfile.objects.all(), required=False, allow_null=True)
    assigned_to_detail = UserProfileSerializer(source='assigned_to', read_only=True)
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'due_date', 'created_at', 'assigned_to', 'assigned_to_detail', 'project', 'is_deleted']

class ActivityLogSerializer(serializers.ModelSerializer):
    task: serializers.PrimaryKeyRelatedField = serializers.PrimaryKeyRelatedField(read_only=True)
    previous_assignee = UserProfileSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'task', 'previous_assignee', 'previous_status', 'previous_due_date', 'updated_at']