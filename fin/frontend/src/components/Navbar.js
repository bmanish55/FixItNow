import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, canCreateServices, isProvider } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">FixItNow</h1>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              {isProvider() && (
                <Link
                  to="/my-services"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Services
                </Link>
              )}
              {!isProvider() && (
                <Link
                  to="/services-map"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Browse Services
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                {canCreateServices() && (
                  <Link
                    to="/create-service"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    + Create Service
                  </Link>
                )}
                <Link
                  to="/chat"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Messages
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    isProvider() ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;