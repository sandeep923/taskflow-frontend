import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      const { user, token } = res.data;

      // Save to Zustand + localStorage
      setUser(user, token);

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md">

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
            TaskFlow
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Create your account
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl font-medium text-sm sm:text-base hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Creating account...
            </span>
          ) : 'Register'}
        </button>

        <p className="text-center text-gray-500 mt-4 text-sm sm:text-base">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;