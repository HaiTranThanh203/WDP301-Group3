import React, { useState } from 'react';
import axios from 'axios';
import frogImage from '../assets/images/Avatar.png';
import background from '../assets/images/background1.jpg';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Email không đúng định dạng.');
      return;
    }

    // Kiểm tra định dạng mã sinh viên
    const studentCodeRegex = /^(HE|HA|IS|MC)\d+$/i;
    if (!studentCodeRegex.test(studentCode)) {
      setErrorMessage('Mã sinh viên phải bắt đầu bằng HE, HA, IS hoặc MC.');
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('studentCode', studentCode);
    formData.append('password', password);
    if (image) {
      formData.append('image', image);
    }
    else {
      formData.append('image', 'https://mqnvueuojtbesgyibkus.supabase.co/storage/v1/object/public/fpt-image//avatar2.png');
    }

    try {
      const response = await axios.post('http://localhost:9999/api/v1/users/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.');
        setErrorMessage('');
      } else {
        setErrorMessage('Đã có lỗi xảy ra. Vui lòng thử lại!');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Đăng ký thất bại:', error);
      setErrorMessage(error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại!');
      setSuccessMessage('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-lg border-4 border-gray-300">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up New Account</h1>
        <div className="flex justify-center mb-4">
          <img
            src={frogImage}
            alt="Frog Icon"
            className="w-20 h-20 rounded-full border-4 border-orange-500 bg-white"
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên người dùng"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Mã sinh viên</label>
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="Nhập mã sinh viên"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Hình ảnh</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div> */}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Sign Up
          </button>
        </form>

        {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
        {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}

        <div className="mt-4 text-center">
          Đã có tài khoản? <a href="/login" className="text-orange-500 hover:underline">Đăng nhập</a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;