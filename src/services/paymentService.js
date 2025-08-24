import { toast } from 'react-hot-toast';

/**
 * Enhanced payment service with robust error handling and retry logic
 */
class PaymentService {
  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffFactor: 2
    };
    
    this.networkTimeout = 30000; // 30 seconds
    this.abortControllers = new Map();
  }

  /**
   * Create a new AbortController for request cancellation
   */
  createAbortController(requestId) {
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);
    return controller;
  }

  /**
   * Remove AbortController after request completion
   */
  removeAbortController(requestId) {
    this.abortControllers.delete(requestId);
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(requestId) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.removeAbortController(requestId);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt) {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt),
      this.retryConfig.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    // Network errors
    if (error.name === 'NetworkError' || error.message?.includes('Network')) {
      return true;
    }
    
    // Timeout errors
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      return true;
    }
    
    // Server errors (5xx)
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    
    // Rate limiting
    if (error.status === 429) {
      return true;
    }
    
    // Connection errors
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
      return true;
    }
    
    return false;
  }

  /**
   * Validate file before upload
   */
  validatePaymentFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only JPG, JPEG, and PNG files are allowed.');
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
    }
    
    // Check if file is corrupted (basic check)
    if (file.size === 0) {
      errors.push('File appears to be corrupted or empty.');
    }
    
    // Additional security checks
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.com', '.scr', '.pif'];
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      errors.push('File type not allowed for security reasons.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize and validate order data
   */
  validateOrderData(orderData) {
    const errors = [];
    
    // Validate shipping details
    if (!orderData.shipping) {
      errors.push('Shipping details are required');
    } else {
      const { fullName, email, phone, address, city, province } = orderData.shipping;
      
      if (!fullName || fullName.trim().length < 2) {
        errors.push('Valid full name is required');
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email address is required');
      }
      
      if (!phone || phone.trim().length < 10) {
        errors.push('Valid phone number is required');
      }
      
      if (!address || address.trim().length < 10) {
        errors.push('Detailed address is required');
      }
      
      if (!city || city.trim().length < 2) {
        errors.push('City is required');
      }
      
      if (!province) {
        errors.push('Province is required');
      }
    }
    
    // Validate payment details
    if (!orderData.payment) {
      errors.push('Payment method is required');
    } else {
      const { paymentMethod } = orderData.payment;
      
      if (!['pay-later', 'pay-now'].includes(paymentMethod)) {
        errors.push('Invalid payment method');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Enhanced order creation with retry logic and comprehensive error handling
   */
  async createOrder(orderData, paymentScreenshot, progressCallback) {
    const requestId = `order_${Date.now()}`;
    let attempt = 0;
    
    // Validate order data
    const orderValidation = this.validateOrderData(orderData);
    if (!orderValidation.isValid) {
      throw new Error(`Validation failed: ${orderValidation.errors.join(', ')}`);
    }
    
    // Validate payment screenshot if provided
    if (paymentScreenshot) {
      const fileValidation = this.validatePaymentFile(paymentScreenshot);
      if (!fileValidation.isValid) {
        throw new Error(`File validation failed: ${fileValidation.errors.join(', ')}`);
      }
    }
    
    while (attempt < this.retryConfig.maxRetries) {
      try {
        // Update progress
        if (progressCallback) {
          progressCallback({
            progress: 10 + (attempt * 20),
            message: attempt === 0 ? 'Creating order...' : `Retrying order creation (${attempt}/${this.retryConfig.maxRetries})...`
          });
        }
        
        // Create abort controller for this attempt
        const controller = this.createAbortController(requestId);
        
        // Prepare form data
        const formData = new FormData();
        
        // Add order data as JSON string (backend will parse it)
        formData.append('shippingDetails', JSON.stringify(orderData.shipping));
        formData.append('paymentMethod', orderData.payment.paymentMethod);
        
        // Add payment screenshot if provided
        if (paymentScreenshot && orderData.payment.paymentMethod === 'pay-now') {
          formData.append('paymentScreenshot', paymentScreenshot);
        }
        
        // Update progress
        if (progressCallback) {
          progressCallback({
            progress: 30 + (attempt * 20),
            message: 'Uploading order data...'
          });
        }
        
        // Make API request with timeout and abort controller
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.networkTimeout);
        });
        
        const requestPromise = fetch('/api/orders', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          signal: controller.signal
        });
        
        const response = await Promise.race([requestPromise, timeoutPromise]);
        
        // Clean up abort controller
        this.removeAbortController(requestId);
        
        // Update progress
        if (progressCallback) {
          progressCallback({
            progress: 70 + (attempt * 10),
            message: 'Processing response...'
          });
        }
        
        // Check if request was successful
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          
          // Determine if error is retryable
          if (this.isRetryableError({ status: response.status, message: errorMessage })) {
            throw new Error(errorMessage);
          } else {
            // Non-retryable error, throw immediately
            throw new Error(`Order creation failed: ${errorMessage}`);
          }
        }
        
        const result = await response.json();
        
        // Update progress
        if (progressCallback) {
          progressCallback({
            progress: 100,
            message: 'Order created successfully!'
          });
        }
        
        // Success!
        return {
          success: true,
          data: result.data,
          message: result.message || 'Order created successfully'
        };
        
      } catch (error) {
        // Clean up abort controller
        this.removeAbortController(requestId);
        
        // Check if request was aborted
        if (error.name === 'AbortError') {
          throw new Error('Order creation was cancelled');
        }
        
        attempt++;
        
        // If this was the last attempt or error is not retryable, throw
        if (attempt >= this.retryConfig.maxRetries || !this.isRetryableError(error)) {
          // Update progress with error
          if (progressCallback) {
            progressCallback({
              progress: 0,
              message: `Failed to create order: ${error.message}`
            });
          }
          
          throw new Error(`Order creation failed after ${attempt} attempts: ${error.message}`);
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateRetryDelay(attempt - 1);
        
        // Update progress
        if (progressCallback) {
          progressCallback({
            progress: 10 + (attempt * 15),
            message: `Retrying in ${Math.round(delay / 1000)} seconds...`
          });
        }
        
        // Wait before retrying
        await this.sleep(delay);
      }
    }
  }

  /**
   * Validate payment method and related data
   */
  validatePaymentMethod(paymentData) {
    const errors = [];
    
    if (!paymentData.paymentMethod) {
      errors.push('Payment method is required');
      return { isValid: false, errors };
    }
    
    if (!['pay-later', 'pay-now'].includes(paymentData.paymentMethod)) {
      errors.push('Invalid payment method selected');
    }
    
    // Additional validation for pay-now method
    if (paymentData.paymentMethod === 'pay-now') {
      if (!paymentData.screenshotFile) {
        errors.push('Payment screenshot is required for online payment');
      } else {
        const fileValidation = this.validatePaymentFile(paymentData.screenshotFile);
        if (!fileValidation.isValid) {
          errors.push(...fileValidation.errors);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check payment status (for future implementation)
   */
  async checkPaymentStatus(orderId) {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Cleanup method to cancel all pending requests
   */
  cleanup() {
    this.cancelAllRequests();
  }
}

// Create singleton instance
const paymentService = new PaymentService();

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    paymentService.cleanup();
  });
}

export default paymentService;
