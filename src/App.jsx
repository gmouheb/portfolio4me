import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  ADMIN_BASE_PATH,
  ADMIN_FORGOT_PASSWORD_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_RESET_PASSWORD_PATH,
} from "./lib/admin";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
      <Route path={ADMIN_FORGOT_PASSWORD_PATH} element={<ForgotPassword />} />
      <Route path={ADMIN_RESET_PASSWORD_PATH} element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route path={ADMIN_BASE_PATH} element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
