import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      await apiService.forgotPassword(email);
      toast.success('Reset code sent to your email!');
      setCodeSent(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error sending reset code';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (!code || code.trim().length !== 6) {
      toast.error('Please enter the 6-digit code from your email');
      return;
    }
    navigate('/reset-password', { state: { email, code } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {!codeSent ? "Enter your email to receive a reset code" : "Enter the 6-digit code from your email"}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={!codeSent ? handleSendCode : handleVerifyCode}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email" name="email" type="email" required disabled={codeSent} className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {codeSent && (
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Reset Code</label>
                <input id="code" name="code" type="text" required maxLength="6" className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest font-mono" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus />
                <p className="mt-2 text-sm text-gray-500 text-center">Check your email for the 6-digit code</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Please wait...' : (!codeSent ? 'Send Code' : 'Proceed to Reset Password')}
          </button>
          <div className="flex items-center justify-between text-sm">
            {codeSent && <button type="button" onClick={() => { setCodeSent(false); setCode(''); }} className="font-medium text-blue-600 hover:text-blue-500"> Change Email</button>}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
