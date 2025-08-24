import React, { useState, useRef, useCallback, useMemo } from "react";
import { useCart } from "../../contexts/CartContext";
import { useCreateOrder } from "../../hooks/queries/useOrderQueries";
import fonepayQR from "../../assets/fonepay-qr.jpeg";
import { toast } from "react-hot-toast";

// Payment method validation schema
const PAYMENT_METHODS = {
  PAY_LATER: 'pay-later',
  PAY_NOW: 'pay-now'
};

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const PaymentStep = ({ onBack, onComplete, orderSummary }) => {
  const { formatPrice } = useCart();
  const createOrderMutation = useCreateOrder();
  
  // Form state
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.PAY_LATER);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  // Validation functions
  const validateFile = useCallback((file) => {
    if (!file) return "Please select a file";
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Only JPG, JPEG, and PNG files are allowed";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    
    return null;
  }, []);

  // Form validation
  const formErrors = useMemo(() => {
    const errors = {};
    
    if (paymentMethod === PAYMENT_METHODS.PAY_NOW && !screenshotFile) {
      errors.screenshot = "Payment screenshot is required for online payment";
    }
    
    if (paymentMethod === PAYMENT_METHODS.PAY_NOW && screenshotFile) {
      const fileValidation = validateFile(screenshotFile);
      if (fileValidation) {
        errors.screenshot = fileValidation;
      }
    }
    
    return errors;
  }, [paymentMethod, screenshotFile, validateFile]);

  const isFormValid = Object.keys(formErrors).length === 0;

  // File handling with validation
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    setFileError("");
    
    if (!file) {
      setScreenshotFile(null);
      setScreenshotPreview("");
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      setScreenshotFile(null);
      setScreenshotPreview("");
      toast.error(validationError);
      return;
    }

    // Set file and create preview
    setScreenshotFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
    };
    reader.onerror = () => {
      setFileError("Failed to read file");
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  const handleFileRemove = useCallback(() => {
    setScreenshotFile(null);
    setScreenshotPreview("");
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        paymentMethod,
        screenshotFile: paymentMethod === PAYMENT_METHODS.PAY_NOW ? screenshotFile : null,
      };

      // Call the parent completion handler
      await onComplete(paymentData);
    } catch (error) {
      console.error("Error in payment step:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [paymentMethod, screenshotFile, isFormValid, onComplete]);

  const handlePaymentMethodChange = useCallback((method) => {
    setPaymentMethod(method);
    
    // Clear file-related state when switching away from pay-now
    if (method !== PAYMENT_METHODS.PAY_NOW) {
      setScreenshotFile(null);
      setScreenshotPreview("");
      setFileError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-mobile p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Payment Method
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Methods */}
          <div className="space-y-6">
            {/* Main Payment Methods */}
            <div className="space-y-4">
              <h4 className="text-base font-medium">Payment Type</h4>
              
              {/* Pay Later Option */}
              <div className="flex items-center">
                <input
                  type="radio"
                  id="pay-later"
                  name="paymentMethod"
                  value={PAYMENT_METHODS.PAY_LATER}
                  checked={paymentMethod === PAYMENT_METHODS.PAY_LATER}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="pay-later"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Pay Later (Cash on Delivery)
                </label>
              </div>

              {/* Pay Now Option */}
              <div className="flex items-center">
                <input
                  type="radio"
                  id="pay-now"
                  name="paymentMethod"
                  value={PAYMENT_METHODS.PAY_NOW}
                  checked={paymentMethod === PAYMENT_METHODS.PAY_NOW}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="pay-now"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Pay Now (Online Payment)
                </label>
              </div>
            </div>

            {/* Payment Options for Pay Now */}
            {paymentMethod === PAYMENT_METHODS.PAY_NOW && (
              <div className="ml-6 pl-2 border-l-2 border-gray-200 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-base font-medium">Scan QR and Pay</h4>
                  
                  {/* QR Code Display */}
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex flex-col items-center space-y-3">
                      <img
                        src={fonepayQR}
                        alt="Fonepay QR Code"
                        className="w-64 h-64 object-contain border border-gray-200 rounded-md"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-qr.png";
                          e.target.onerror = null;
                        }}
                      />
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          Scan this QR code to pay via Fonepay
                        </p>
                        <p className="text-xs text-gray-500">
                          Amount: Rs. {formatPrice(orderSummary?.total || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Payment Screenshot *
                    </label>
                    
                    <div
                      onClick={() => !isSubmitting && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
                        isSubmitting 
                          ? "cursor-not-allowed opacity-50"
                          : screenshotFile
                          ? "border-primary-300 bg-primary-50"
                          : fileError
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={isSubmitting}
                        aria-describedby="file-upload-help"
                      />

                      {screenshotPreview ? (
                        <div className="space-y-3 w-full">
                          <div className="relative">
                            <img
                              src={screenshotPreview}
                              alt="Payment Screenshot Preview"
                              className="max-h-48 mx-auto object-contain rounded-md"
                            />
                            {!isSubmitting && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileRemove();
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                aria-label="Remove image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">
                              {screenshotFile?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {screenshotFile && `${(screenshotFile.size / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-10 w-10 mx-auto ${fileError ? 'text-red-400' : 'text-gray-400'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-sm text-gray-500">
                            Click to upload payment screenshot
                          </p>
                          <p className="text-xs text-gray-400" id="file-upload-help">
                            PNG, JPG, JPEG up to 5MB
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Error Display */}
                    {(fileError || formErrors.screenshot) && (
                      <p className="text-sm text-red-500 mt-1">
                        {fileError || formErrors.screenshot}
                      </p>
                    )}

                    {/* Upload Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex">
                        <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            <strong>Instructions:</strong>
                          </p>
                          <ul className="text-xs text-blue-600 mt-1 space-y-1">
                            <li>1. Scan the QR code with your mobile banking app</li>
                            <li>2. Complete the payment transaction</li>
                            <li>3. Take a screenshot of the successful payment confirmation</li>
                            <li>4. Upload the screenshot here</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orderSummary && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-base font-medium text-gray-900 mb-3">
                Order Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {formatPrice(orderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Rs. {formatPrice(orderSummary.shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>Rs. {formatPrice(orderSummary.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full sm:w-1/2 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-md text-sm font-medium transition duration-300"
            >
              Back to Shipping
            </button>
            
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting || createOrderMutation.isPending}
              className={`w-full sm:w-1/2 py-3 px-4 rounded-md text-sm font-medium transition duration-300 flex items-center justify-center ${
                !isFormValid || isSubmitting || createOrderMutation.isPending
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }`}
            >
              {isSubmitting || createOrderMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>

          {/* Form Error Summary */}
          {Object.keys(formErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 font-medium mb-1">
                Please fix the following errors:
              </p>
              <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                {Object.values(formErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentStep;
