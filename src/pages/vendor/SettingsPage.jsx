import React, { useEffect, useState } from 'react';
import vendorApi from '../../services/vendorApi';
import { toast } from 'react-hot-toast';

const Input = ({ label, id, type = 'text', value, onChange, placeholder = '', disabled = false, required = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${disabled ? 'bg-gray-100 text-gray-600' : ''}`}
    />
  </div>
);

const VendorSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
    city: '',
    address: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await vendorApi.get('/vendors/profile');
        const data = res.data?.data || res.data;
        if (!data) throw new Error('Invalid profile response');
        setProfile({
          name: data.name || '',
          email: data.email || '',
          primaryPhone: data.primaryPhone || '',
          secondaryPhone: data.secondaryPhone || '',
          city: data.city || '',
          address: data.address || ''
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: profile.name,
        primaryPhone: profile.primaryPhone,
        secondaryPhone: profile.secondaryPhone,
        city: profile.city,
        address: profile.address
      };
      await vendorApi.put('/vendors/profile', payload);
      toast.success('Profile updated');
    } catch (err) {
      console.error('Failed to update profile', err);
      const msg = err.response?.data?.error || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    try {
      setChangingPassword(true);
      await vendorApi.put('/vendors/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error('Failed to change password', err);
      const msg = err.response?.data?.error || 'Failed to change password';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Update your profile and change your password.</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
        </div>
        <form className="p-4 space-y-4" onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" id="name" value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} required />
            <Input label="Email" id="email" value={profile.email} onChange={() => {}} disabled />
            <Input label="Primary Phone" id="primaryPhone" value={profile.primaryPhone} onChange={(v) => setProfile((p) => ({ ...p, primaryPhone: v }))} required />
            <Input label="Secondary Phone" id="secondaryPhone" value={profile.secondaryPhone} onChange={(v) => setProfile((p) => ({ ...p, secondaryPhone: v }))} />
            <Input label="City" id="city" value={profile.city} onChange={(v) => setProfile((p) => ({ ...p, city: v }))} required />
            <Input label="Address" id="address" value={profile.address} onChange={(v) => setProfile((p) => ({ ...p, address: v }))} />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
        </div>
        <form className="p-4 space-y-4" onSubmit={handleChangePassword}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))}
              required
            />
            <Input
              label="New Password"
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
              required
            />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorSettingsPage;


