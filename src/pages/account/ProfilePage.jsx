import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Root as Card, 
  Content as CardContent, 
  Header as CardHeader, 
  Title as CardTitle 
} from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge-new';
import { cn } from '../../lib/utils';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zipCode: currentUser?.zipCode || ''
  });

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser && !isEditing) {
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        address: currentUser?.address || '',
        city: currentUser?.city || '',
        state: currentUser?.state || '',
        zipCode: currentUser?.zipCode || ''
      });
    }
  }, [currentUser, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Handle phone number formatting
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      if (digitsOnly.length > 0) {
        // If user starts typing without +977, add it automatically
        if (!value.startsWith('+977')) {
          // If they entered 9 or 10 digits starting with 9, add +977 prefix
          if (digitsOnly.length >= 1 && digitsOnly.startsWith('9')) {
            processedValue = `+977${digitsOnly}`;
          } else if (digitsOnly.startsWith('977')) {
            // If they entered 977xxxxxxxx, format as +977xxxxxxxx
            processedValue = `+977${digitsOnly.slice(3)}`;
          } else {
            processedValue = `+977${digitsOnly}`;
          }
        } else {
          // If it already starts with +977, just clean up the formatting
          const phoneDigits = digitsOnly.startsWith('977') ? digitsOnly.slice(3) : digitsOnly;
          processedValue = `+977${phoneDigits}`;
        }
        
        // Limit to +977 plus 10 digits
        const maxLength = 13; // "+977" + 10 digits
        if (processedValue.length > maxLength) {
          processedValue = processedValue.slice(0, maxLength);
        }
      } else {
        processedValue = '';
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    
    if (formData.zipCode && formData.zipCode.trim()) {
      const zipRegex = /^[0-9]{5}$/;
      if (!zipRegex.test(formData.zipCode)) {
        newErrors.zipCode = 'Please enter a valid 5-digit postal code';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Only send the fields that can be updated (exclude email)
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        zipCode: formData.zipCode?.trim() || ''
      };
      
      const response = await updateProfile(updateData);
      
      // Update the current user context with the new data
      setCurrentUser(response.data);
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error?.error || error?.message || 'Failed to update profile';
      toast.error(errorMessage);
      
      // Handle validation errors from backend
      if (error?.errors) {
        setErrors(error.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      city: currentUser?.city || '',
      state: currentUser?.state || '',
      zipCode: currentUser?.zipCode || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const formatJoinDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch (error) {
      return 'April 2025'; // fallback
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={isEditing ? handleCancel : () => setIsEditing(true)}
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border-slate-200 shadow-mobile hover:shadow-mobile-lg transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback className="bg-primary-100 text-primary-600 text-lg sm:text-xl font-medium">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {currentUser?.name || 'User'}
                </h2>
                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="h-3 w-3" />
                  {currentUser?.email}
                </p>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Member since {formatJoinDate(currentUser?.createdAt)}
                </Badge>
                <Badge variant="success" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {currentUser?.isEmailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing || isLoading}
                    className={cn(
                      "transition-all duration-200",
                      (!isEditing || isLoading) && "bg-gray-50 text-gray-500 cursor-not-allowed",
                      errors.name && "border-red-300 focus:border-red-500 focus:ring-red-500"
                    )}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true}
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing || isLoading}
                    className={cn(
                      "transition-all duration-200",
                      (!isEditing || isLoading) && "bg-gray-50 text-gray-500 cursor-not-allowed",
                      errors.phone && "border-red-300 focus:border-red-500 focus:ring-red-500"
                    )}
                    placeholder="+97798XXXXXXXX"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-gray-500">
                      Enter your 10-digit mobile number. +977 prefix will be added automatically.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing || isLoading}
                    className={cn(
                      "transition-all duration-200",
                      (!isEditing || isLoading) && "bg-gray-50 text-gray-500 cursor-not-allowed"
                    )}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                      className={cn(
                        "transition-all duration-200",
                        (!isEditing || isLoading) && "bg-gray-50 text-gray-500 cursor-not-allowed"
                      )}
                      placeholder="Kathmandu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                      Province
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                      className={cn(
                        "transition-all duration-200",
                        (!isEditing || isLoading) && "bg-gray-50 text-gray-500 cursor-not-allowed"
                      )}
                      placeholder="Bagmati"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                      Postal Code
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                      className={cn(
                        "transition-all duration-200",
                        (!isEditing || isLoading) && "bg-gray-50 text-gray-500 cursor-not-allowed",
                        errors.zipCode && "border-red-300 focus:border-red-500 focus:ring-red-500"
                      )}
                      placeholder="44600"
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <>
                <Separator />
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full sm:w-auto order-2 sm:order-1"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto order-1 sm:order-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;