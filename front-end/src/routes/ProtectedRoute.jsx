// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // Lấy thông tin người dùng từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có kiểm tra role và role của user không thuộc danh sách cho phép
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Chuyển hướng về trang chủ hoặc trang unauthorized
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập và có quyền truy cập, render các component con
  return <Outlet />;
};

export default ProtectedRoute;
