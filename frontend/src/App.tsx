import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { useAuth } from './features/auth/auth-context';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { EmployeeAvailabilityPage } from './pages/EmployeeAvailabilityPage';
import { ShiftsPage } from './pages/ShiftsPage';
import { MyLeavePage } from './pages/MyLeavePage';
import { LeaveManagementPage } from './pages/LeaveManagementPage';
import { RosterPage } from './pages/RosterPage';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? (user.role === 'MANAGER' ? '/dashboard' : '/my-schedule') : '/login'} replace />;
}

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={<ProtectedRoute roles={['MANAGER']}><DashboardPage /></ProtectedRoute>} />
    <Route path="/shifts" element={<ProtectedRoute roles={['MANAGER']}><ShiftsPage /></ProtectedRoute>} />
    <Route path="/leave-requests" element={<ProtectedRoute roles={['MANAGER']}><LeaveManagementPage /></ProtectedRoute>} />
    <Route path="/roster" element={<ProtectedRoute roles={['MANAGER']}><RosterPage /></ProtectedRoute>} />
    <Route path="/employees" element={<ProtectedRoute roles={['MANAGER']}><EmployeesPage /></ProtectedRoute>} />
    <Route path="/employees/:id" element={<ProtectedRoute roles={['MANAGER']}><EmployeeDetailPage /></ProtectedRoute>} />
    <Route path="/employees/:id/availability" element={<ProtectedRoute roles={['MANAGER']}><EmployeeAvailabilityPage /></ProtectedRoute>} />
    <Route path="/my-schedule" element={<ProtectedRoute roles={['EMPLOYEE']}><DashboardPage employee /></ProtectedRoute>} />
    <Route path="/availability" element={<ProtectedRoute roles={['EMPLOYEE']}><AvailabilityPage /></ProtectedRoute>} />
    <Route path="/my-leave" element={<ProtectedRoute roles={['EMPLOYEE']}><MyLeavePage /></ProtectedRoute>} />
    <Route path="/my-roster" element={<ProtectedRoute roles={['EMPLOYEE']}><RosterPage mine /></ProtectedRoute>} />
    <Route path="*" element={<HomeRedirect />} />
  </Routes></AuthProvider></BrowserRouter>;
}
