import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-mobile-h1 md:text-3xl lg:text-4xl font-bold font-heading text-gray-900">
              Check Your Email
            </h1>
          </div>

          <div className="bg-white py-8 px-4 shadow-mobile rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
                <svg className="h-6 w-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Reset Email Sent</h2>
              <p className="text-sm text-gray-600 mb-6">
                We've sent password reset instructions to {email}. Please check your email and follow the link to reset your password.
                The link will expire in 10 minutes.
              </p>
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => window.location.href = `mailto:${email}`}
                  className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md text-sm font-medium transition duration-300"
                >
                  Open Email App
                </button>
              </div>
              <p className="mt-6 text-xs text-gray-500">
                If you don't see the email, check your spam folder or{' '}
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-primary-500 hover:text-primary-600"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-mobile-h1 md:text-3xl lg:text-4xl font-bold font-heading text-gray-900">
            Forgot Password
          </h1>
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-mobile rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-secondary-100 border border-secondary-200 text-secondary-800 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;