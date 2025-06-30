# Django Project/Task Management Backend

## Features

- JWT Authentication (SimpleJWT)
- User roles: Admin, Contributor
- Admins: manage projects and tasks
- Contributors: manage only tasks
- Projects: title, description, created_at, owner
- Tasks: title, description, status, due_date, created_at, assigned_to, project,
  soft-delete
- Filtering and pagination for tasks
- Activity Log: tracks last state of each task before update (previous assignee,
  status, due date)
- Admin dashboard includes Activity Log section

## Setup

1. Create and activate virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```powershell
   pip install django djangorestframework djangorestframework-simplejwt django-filter
   ```
3. Run migrations:
   ```powershell
   python manage.py migrate
   ```
4. Create superuser:
   ```powershell
   python manage.py createsuperuser
   ```
5. Start development server:
   ```powershell
   python manage.py runserver
   ```

## API Endpoints

- `/api/token/` - Obtain JWT token
- `/api/token/refresh/` - Refresh JWT token
- `/api/projects/` - Project CRUD (Admin only)
- `/api/tasks/` - Task CRUD (Admin & Contributor)
- `/api/activity-logs/` - Activity Log (Admin only)
- `/api/users/` - User list (Admin only)

## Notes

- Use the Django admin at `/admin/` to manage users, projects, tasks, and
  activity logs.
- Only one ActivityLog per task, updated on each task modification.
