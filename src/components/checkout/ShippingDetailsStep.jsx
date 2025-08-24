import React, { useState } from 'react';

const ShippingDetailsStep = ({ onNext, onBack, initialData, orderSummary }) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    province: initialData?.province || '',
    panNumber: initialData?.panNumber || '',
    clinicName: initialData?.clinicName || '',
    orderNote: initialData?.orderNote || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle phone number formatting
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, ''); // Keep only digits

    // Add the +977 prefix if not already there
    if (!value.startsWith('977')) {
      value = '977' + value;
    }
    
    // Limit to +977 followed by 10 digits
    if (value.length > 13) {
      value = value.substring(0, 13);
    }
    
    // Format with the '+' sign
    const formattedValue = '+' + value;
    
    setFormData(prev => ({
      ...prev,
      phone: formattedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'province'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Basic phone validation (should have +977 and 10 more digits)
    if (!formData.phone.match(/^\+977\d{10}$/)) {
      alert('Please enter a valid phone number in format +977XXXXXXXXXX');
      return;
    }
    
    // Pass the validated form data to next step
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-mobile p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Details</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+9771234567890"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-1">Format: +977 followed by 10 digits</div>
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address*
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              ></textarea>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Province */}
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                Province*
              </label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Province</option>
                <option value="bagmati">Bagmati Pradesh</option>
                <option value="gandaki">Gandaki Pradesh</option>
                <option value="karnali">Karnali Pradesh</option>
                <option value="lumbini">Lumbini Pradesh</option>
                <option value="madhesh">Madhesh Pradesh</option>
                <option value="province1">Koshi Pradesh</option>
                <option value="sudurpashchim">Sudurpashchim Pradesh</option>
              </select>
            </div>

            {/* PAN Number (Optional) */}
            <div>
              <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                id="panNumber"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Clinic/Hospital Name (Optional) */}
            <div>
              <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700 mb-1">
                Clinic/Hospital Name <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                id="clinicName"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Order Note (Optional) */}
            <div className="md:col-span-2">
              <label htmlFor="orderNote" className="block text-sm font-medium text-gray-700 mb-1">
                Order Note <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                id="orderNote"
                name="orderNote"
                value={formData.orderNote}
                onChange={handleChange}
                rows="3"
                placeholder="Any special instructions for your order"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-1/2 bg-gray-100 text-gray-600 hover:bg-gray-200 py-3 px-4 rounded-md text-sm font-medium transition duration-300"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingDetailsStep;