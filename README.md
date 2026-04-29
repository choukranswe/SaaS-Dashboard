# SaaS Dashboard (Multi-Tenant RBAC)

Production-style full-stack SaaS dashboard with strict tenant isolation and role-based access control.

## Overview

This project is a multi-tenant dashboard where each company (tenant) has isolated users, projects, tasks, and dashboard metrics.

- Backend: Laravel REST API + Sanctum token auth
- Frontend: React + Vite + Tailwind CSS
- Database: MySQL (with seed data for two tenants)
- Roles: `admin`, `manager`, `viewer`

## Features

- Company registration (`tenant + admin` creation in one flow)
- Login/logout/me endpoints with Sanctum bearer tokens
- Strict tenant scoping (`tenant_id` on every core table)
- Role-based permissions for users/projects/tasks
- Dashboard metrics endpoint with recent activity
- Full CRUD for users, projects, and tasks
- Responsive dashboard UI with sidebar, navbar, cards, tables, and badges
- Role-aware buttons and route protection in frontend
- Validation errors, loading states, and empty states

## Tech Stack

- Laravel (API)
- Laravel Sanctum
- MySQL
- React + Vite
- Tailwind CSS
- Axios
- React Router

## Project Structure

```txt
saas-dashboard-api/        # Laravel backend
saas-dashboard-frontend/   # React frontend
README.md                  # Project documentation
```

## Backend Setup (Laravel API)

1. Go to backend folder:
```bash
cd saas-dashboard-api
```

2. Install PHP dependencies:
```bash
composer install
```

3. Create env file:
```bash
cp .env.example .env
php artisan key:generate
```

4. Configure MySQL in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=saas_dashboard
DB_USERNAME=root
DB_PASSWORD=
```

5. Run migrations + seeders:
```bash
php artisan migrate:fresh --seed
```

6. Start API:
```bash
php artisan serve
```

Default API base URL: `http://127.0.0.1:8000/api`

## Frontend Setup (React + Vite)

1. Go to frontend folder:
```bash
cd saas-dashboard-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Optional env for API URL (`.env`):
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

4. Start frontend:
```bash
npm run dev
```

Frontend default URL: `http://127.0.0.1:5173`

## API Routes

### Public

- `POST /api/register`
- `POST /api/login`

### Protected (`auth:sanctum`)

- `POST /api/logout`
- `GET /api/me`
- `GET /api/dashboard`

### Users

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

## Roles and Permissions

| Capability | Admin | Manager | Viewer |
|---|---|---|---|
| View dashboard | Yes | Yes | Yes |
| Read users | Yes | Yes | No |
| Create users | Yes | No | No |
| Update users | Yes | No | No |
| Delete users | Yes | No | No |
| Read projects | Yes | Yes | Yes |
| Create projects | Yes | Yes | No |
| Update projects | Yes | Yes | No |
| Delete projects | Yes | No | No |
| Read tasks | Yes | Yes | Yes |
| Create tasks | Yes | Yes | No |
| Update tasks | Yes | Yes | No |
| Delete tasks | Yes | No | No |

## Demo Accounts

Password for all demo users: `password`

### Tenant A: PixelWeb
- `admin@pixelweb.com` (admin)
- `manager@pixelweb.com` (manager)
- `viewer@pixelweb.com` (viewer)

### Tenant B: TechNova
- `admin@technova.com` (admin)
- `manager@technova.com` (manager)
- `viewer@technova.com` (viewer)

## Database Schema Summary

- `tenants`: `id`, `name`, `slug`, timestamps
- `users`: `id`, `tenant_id`, `name`, `email`, `role`, `password`, timestamps
- `projects`: `id`, `tenant_id`, `name`, `description`, `status`, `created_by`, timestamps
- `tasks`: `id`, `tenant_id`, `project_id`, `assigned_to`, `title`, `description`, `status`, `priority`, `due_date`, timestamps
- `personal_access_tokens` for Sanctum

Tenant isolation is enforced by filtering all resource queries using the authenticated user’s `tenant_id`.

## Screenshots

Add screenshots here:

- `docs/screenshots/login.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/projects.png`
- `docs/screenshots/tasks.png`
- `docs/screenshots/users.png`

## Security Notes

- Passwords are hashed
- Password fields are never returned
- Sanctum token authentication on protected routes
- Role middleware guards sensitive actions
- Tenant checks on all show/update/delete/list queries

## Future Improvements

- Automated feature tests for role and tenant isolation matrix
- Pagination, sorting, and search
- Password reset and email verification flows
- Audit logs for critical actions
- Team invitations and custom role permissions
- Docker setup for one-command local startup
