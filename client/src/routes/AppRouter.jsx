import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Layouts
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// User Pages
import HomePage from '../pages/user/HomePage';
import GameDetailPage from '../pages/user/GameDetailPage';
import WishlistPage from '../pages/user/WishlistPage';
import LeaderboardPage from '../pages/user/LeaderboardPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminGamesPage from '../pages/admin/AdminGamesPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCommunityPage from '../pages/admin/AdminCommunityPage';
import AdminBannersPage from '../pages/admin/AdminBannersPage';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* Các trang dành cho Người dùng */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/:id" element={<GameDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Các trang Xác thực (Độc lập, không dính Header/Footer cửa hàng) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Các trang dành cho Quản trị viên (Admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="games" element={<AdminGamesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="community" element={<AdminCommunityPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
      </Route>

      {/* Đường dẫn không tồn tại -> Về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
