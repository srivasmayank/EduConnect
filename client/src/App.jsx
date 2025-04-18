import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CourseListingPage from './pages/CourseListingPage';
import CoursePage from './pages/CoursePage';
import SearchPage from './pages/SearchPage';

// Protected pages for any authenticated user
import ProfilePage from './pages/ProfilePage';
import StudentDashboard from './pages/StudentDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

// Teacher pages
import TeacherDashboard from './pages/TeacherDashboard';
import CreateCoursePage from './pages/CreateCoursePage';
import BatchManagementPage from './pages/BatchManagementPage';
import EarningsPage from './pages/EarningsPage';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsersPage from './pages/ManageUsersPage';
import MonitorTransactionsPage from './pages/MonitorTransactionsPage';

// Payment page
import PaymentPage from './pages/PaymentPage';
import ManageLecturesPage from './pages/ManageLecturesPage';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  console.log("chhh",isAuthenticated)
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/courses" element={<CourseListingPage />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* Protected Routes for any authenticated user */}
          <Route element={<ProtectedRoute isAllowed={isAuthenticated} />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Route>

          {/* Teacher Protected Routes */}
          <Route element={<ProtectedRoute isAllowed={isAuthenticated} allowedRoles={['teacher']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/create-course" element={<CreateCoursePage />} />
            <Route path="/teacher/batch-management" element={<BatchManagementPage />} />
            <Route path="/teacher/earnings" element={<EarningsPage />} />
            <Route path="/courses/:courseId/manage" element={<ManageLecturesPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute isAllowed={isAuthenticated} allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/manage-users" element={<ManageUsersPage />} />
            <Route path="/admin/monitor-transactions" element={<MonitorTransactionsPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
