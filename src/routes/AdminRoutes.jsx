import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'
import AdminSettings from '@/pages/admin/Settings'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminRoutes() {
  const { user } = useAuth()

  // Verifica se o usuário é admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/settings" element={<AdminSettings />} />
    </Routes>
  )
}