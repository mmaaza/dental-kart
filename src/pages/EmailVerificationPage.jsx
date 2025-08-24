import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/api';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const { login, setCurrentUser } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendEnabled, setResendEnabled] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setResendEnabled(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('pendingVerificationEmail');
      if (!email) {
        setError('Email not found. Please try registering again.');
        return;
      }

      const response = await axios.post('/auth/verify-email', {
        email,
        otp: otp.join('')
      });

      if (response.data.success) {
        console.log('Verification successful:', response.data);
        
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Update the current user context
        if (setCurrentUser) {
          setCurrentUser(response.data.user);
        }
        
        // Clean up storage
        localStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('tempLoginPassword');
        
        // Navigate to dashboard or home
        navigate('/account');
        return;
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      // Check if account was already verified
      if (error.response?.data?.error === 'Email already verified') {
        // If already verified, attempt to log in with stored credentials
        const email = localStorage.getItem('pendingVerificationEmail');
        const password = sessionStorage.getItem('tempLoginPassword');
        
        if (email && password) {
          try {
            await login(email, password);
            
            // Clean up storage
            localStorage.removeItem('pendingVerificationEmail');
            sessionStorage.removeItem('tempLoginPassword');
            
            // Navigate to dashboard
            navigate('/dashboard');
            return;
          } catch (loginError) {
            console.error('Auto-login error:', loginError);
            setError('Verification succeeded but login failed. Please log in manually.');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          setError('Your email has been verified. Please log in.');
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setError(error.response?.data?.error || 'Verification failed');
        // Clear OTP input on error
        setOtp(['', '', '', '', '', '']);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('pendingVerificationEmail');
      if (!email) {
        setError('Email not found. Please try registering again.');
        return;
      }

      await axios.post('/auth/resend-verification', { email });
      setError('');
      setResendEnabled(false);
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-mobile-h1 md:text-3xl lg:text-4xl font-bold font-heading text-gray-900">
            Verify Your Email
          </h1>
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-mobile rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-secondary-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                onClick={handleResendOTP}
                disabled={!resendEnabled || loading}
                className="text-primary-500 hover:text-primary-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;