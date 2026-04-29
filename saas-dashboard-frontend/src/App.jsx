import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleBasedRoute from './components/RoleBasedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ProjectCreate from './pages/ProjectCreate'
import ProjectEdit from './pages/ProjectEdit'
import Projects from './pages/Projects'
import Register from './pages/Register'
import TaskCreate from './pages/TaskCreate'
import TaskEdit from './pages/TaskEdit'
import Tasks from './pages/Tasks'
import Users from './pages/Users'
import { getToken } from './utils/auth'

const RootRedirect = () => {
  return getToken() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/users"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <Users />
            </RoleBasedRoute>
          }
        />
        <Route path="/projects" element={<Projects />} />
        <Route
          path="/projects/create"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <ProjectCreate />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/projects/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <ProjectEdit />
            </RoleBasedRoute>
          }
        />
        <Route path="/tasks" element={<Tasks />} />
        <Route
          path="/tasks/create"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <TaskCreate />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/tasks/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <TaskEdit />
            </RoleBasedRoute>
          }
        />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default App
