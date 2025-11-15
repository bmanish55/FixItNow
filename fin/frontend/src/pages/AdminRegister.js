import React from 'react';
import { Link } from 'react-router-dom';

const AdminRegister = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Registration Disabled
          </h2>
          <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-semibold">
                  Admin registration is disabled for security reasons.
                </p>
                <p className="mt-2 text-sm text-yellow-700">
                  Only one admin account exists in the system to prevent unauthorized access and maintain security.
                </p>
                <p className="mt-2 text-sm text-yellow-700">
                  If you need admin access, please contact the system administrator.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Admin Login
            </Link>
            <div className="text-center">
              <Link
                to="/"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                 Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
