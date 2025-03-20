import React, { useState } from "react";
import axios from "axios";
import frogImage from "../assets/images/Avatar.png";
import { useNavigate } from "react-router-dom";
import background from "../assets/images/background1.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:9999/api/v1/users/login",
        {
          email,
          password,
        }
      );
      // console.log("Đăng nhập thành công:", response.data);
      const data = response.data; // Lấy dữ liệu từ response

      // Kiểm tra nếu đăng nhập thành công
      if (data.status === "success") {
        console.log("Login successful", data.user);

        // Lưu token và thông tin người dùng
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Điều hướng người dùng dựa trên vai trò
        if (data.user.role === "student") {

          navigate("/"); // Điều hướng đến trang chủ cho student


        } else if (data.user.role === "admin") {
          navigate("/Admin/manager-reports"); // Điều hướng đến trang quản lý cho admin
        }
      } else {
        console.error("Login failed", data.message);
        setErrors({
          form: data.message || "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
      console.error(
        "Lỗi đăng nhập:",
        error.response?.data?.message || "Đã xảy ra lỗi!"
      );
      alert(
        error.response?.data?.message || "Email hoặc mật khẩu không chính xác!"
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-lg border-[9px] border-gray-300">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign IN</h1>

        <div className="relative flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full border-4 border-orange-500 bg-white overflow-hidden">
            <img
              src={frogImage}
              alt="Frog Icon"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-1 p-2 w-full border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="mt-1 p-2 w-full border rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Sign In
          </button>

          <div className="text-center mt-4">
            Chưa có tài khoản?{" "}
            <a href="/SignUp" className="text-orange-500 hover:underline">
             Register
            </a>
          </div>

          <div className="text-center mt-2">
            <a
              href="/ForgotPassword"
              className="text-orange-500 hover:underline"
            >
             Forgot Password
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
