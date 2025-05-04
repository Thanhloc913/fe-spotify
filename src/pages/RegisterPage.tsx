import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/authApi';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    avatarUrl: '',
    bio: '',
    dateOfBirth: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerApi(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Đăng ký tài khoản
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="text"
                name="username"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="text"
                name="fullName"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="text"
                name="phoneNumber"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Số điện thoại"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="date"
                name="dateOfBirth"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div>
              <textarea
                name="bio"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Giới thiệu bản thân"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="text"
                name="avatarUrl"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Link ảnh đại diện (avatar)"
                value={formData.avatarUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đăng ký
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-gray-400">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 