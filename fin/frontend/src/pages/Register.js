import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';
  const isUpgrade = searchParams.get('upgrade') === 'true';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    location: '',
    phone: '',
    bio: '',
    experience: '',
    serviceArea: '',
    documentType: '',
    verificationDocument: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Clear errors when user starts typing
    if (errors[name] || errors.general) {
      setErrors({});
    }
    
    if (name === 'verificationDocument' && files && files[0]) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [name]: reader.result
        });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.role === 'provider' && !formData.documentType) {
      newErrors.documentType = 'Please select a document type';
    }

    if (formData.role === 'provider' && !formData.verificationDocument) {
      newErrors.verificationDocument = 'Please upload a business document';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        const successMsg = formData.role === 'provider' 
          ? 'Registration successful! Your profile is under admin review.' 
          : 'Registration successful! Please login to continue.';
        toast.success(successMsg);
        navigate('/login');
      } else {
        // Display specific error from backend
        const errorMessage = result.message || 'Registration failed';
        
        // Check for specific error types
        if (errorMessage.toLowerCase().includes('email already exists') || errorMessage.toLowerCase().includes('email is already')) {
          setErrors({ email: 'This email is already registered. Please login instead.' });
        } else if (errorMessage.toLowerCase().includes('phone')) {
          setErrors({ phone: 'This phone number is already registered.' });
        } else {
          setErrors({ general: errorMessage });
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMsg = 'Unable to connect to server. Please try again.';
      setErrors({ general: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-20 xl:px-24 overflow-y-auto">
        <div className="max-w-2xl w-full py-12">
          {/* Logo with Icon */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-purple-700 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">FIXITNOW</h1>
            </div>
            <p className="text-gray-600 ml-15">Create your account to get started</p>
            <p className="text-sm text-gray-500 mt-1 ml-15">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-700 hover:text-purple-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'customer'})}
                  className={`py-4 px-4 rounded-lg font-medium transition-all text-sm border-2 ${
                    formData.role === 'customer'
                      ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-purple-700'
                  }`}
                >
                  <div className="text-2xl mb-1">👤</div>
                  <div>Book Services</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'provider'})}
                  className={`py-4 px-4 rounded-lg font-medium transition-all text-sm border-2 ${
                    formData.role === 'provider'
                      ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-purple-700'
                  }`}
                >
                  <div className="text-2xl mb-1">🔧</div>
                  <div>Offer Services</div>
                </button>
              </div>
            </div>

            {/* Two Column Layout for Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                  placeholder="New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.role === 'provider' && (
              <div className="space-y-4 p-5 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs">P</span>
                  Provider Details
                </h3>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm shadow-sm"
                    placeholder="Tell us about your expertise..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      id="experience"
                      name="experience"
                      type="text"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                      placeholder="5 years"
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700 mb-2">
                      Service Area
                    </label>
                    <input
                      id="serviceArea"
                      name="serviceArea"
                      type="text"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                      placeholder="Areas you serve"
                      value={formData.serviceArea}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['ShopAct', 'MSME Certificate', 'Udyam'].map((type) => (
                      <label 
                        key={type} 
                        className={`flex items-center justify-center py-2.5 px-2 rounded-lg cursor-pointer transition-all text-xs font-medium border-2 ${
                          formData.documentType === type
                            ? 'bg-purple-700 text-white border-purple-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="documentType"
                          value={type}
                          checked={formData.documentType === type}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-center">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="verificationDocument" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document *
                  </label>
                  <input
                    id="verificationDocument"
                    name="verificationDocument"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer text-xs shadow-sm"
                    required
                  />
                  {formData.verificationDocument && (
                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Document uploaded successfully
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 uppercase text-sm shadow-lg"
            >
              {loading ? 'Creating account...' : 'SIGN UP'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-purple-700 relative overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074" 
            alt="Team collaboration" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Geometric Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 border-4 border-white/10 rounded-3xl rotate-12"></div>
        <div className="absolute bottom-32 left-20 w-48 h-48 border-4 border-white/10 rounded-full"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20 text-white">
          <div className="max-w-lg">
            <h2 className="text-6xl font-bold mb-6 leading-tight">
              {formData.role === 'provider' ? (
                <>Grow your<br />business with us.</>
              ) : (
                <>Join our<br />community today.</>
              )}
            </h2>
            <p className="text-purple-100 text-lg mb-10 leading-relaxed">
              {formData.role === 'provider' 
                ? 'Start offering your professional services and connect with customers who need quality work.'
                : 'Book trusted service providers for all your needs. Safe, secure, and reliable platform.'}
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {formData.role === 'provider' ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-purple-100">Verification & profile management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-purple-100">Manage bookings & schedule</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-purple-100">Secure payment processing</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-purple-100">Browse verified service providers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-purple-100">Book services instantly</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-purple-100">Track & manage your bookings</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
