import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email && location.state?.code) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email,
        code: location.state.code
      }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('Email is required');
      return;
    }
    if (!formData.code || formData.code.length !== 6) {
      toast.error('Valid 6-digit reset code is required');
      return;
    }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiService.resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword
      });
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error resetting password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Create your new password</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input name="email" type="email" required readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reset Code</label>
              <input name="code" type="text" required maxLength="6" readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-center text-xl tracking-widest font-mono" value={formData.code} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input name="newPassword" type={showPassword ? 'text' : 'password'} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter new password" value={formData.newPassword} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {showPassword ? '' : ''}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleChange} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {showConfirmPassword ? '' : ''}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
