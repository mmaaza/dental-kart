import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Root as Card, Content as CardContent, Title as CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const SignupPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if phone number is provided
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(\+977-?)?[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      setError('Please enter a valid Nepali phone number (10 digits, optionally starting with +977-)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (response.data.success) {
        // Store email for verification
        localStorage.setItem('pendingVerificationEmail', formData.email);
        // Navigate to verification page
        navigate('/verify-email');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:text-left">
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900">
              Create an Account
            </h1>
            <p className="mt-2 text-gray-600 text-sm">
              Join Dental Kart Nepal and get access to quality medical supplies
            </p>
          </div>

          <Card className="shadow-mobile lg:shadow-lg border-0">
            <CardContent className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-secondary-100 border border-secondary-200 text-secondary-800 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="98XXXXXXXXX or +977-98XXXXXXXXX"
                    pattern="^(\+977-?)?[0-9]{10}$"
                    title="Please enter a valid Nepali phone number (10 digits, optionally starting with +977-)"
                  />
                  <p className="text-xs text-gray-500">
                    Enter your 10-digit Nepali phone number
                  </p>
                </div>

               

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="••••••••"
                    />
                  </div>
                  
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="showPassword"
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="showPassword" className="text-sm font-medium text-gray-700">
                      Show password
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 px-4 text-sm font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <Separator className="my-4" />

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Branding/Visual Content */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-primary-500 to-primary-600 px-8 py-12">
        <div className="text-center text-white max-w-lg">
          <div className="mb-6">
            <div className="mb-6">
              <img 
                src="/uploads/logo-main.png" 
                alt="Dental Kart Nepal Logo" 
                className="h-32 mx-auto mb-4"
              />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Dental Kart Nepal
            </h2>
            <p className="text-base text-primary-100 leading-relaxed">
              Your trusted source for quality medical supplies and equipment.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-primary-100 text-sm">Quality medical supplies</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-primary-100 text-sm">Fast delivery nationwide</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-primary-100 text-sm">Expert customer support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;