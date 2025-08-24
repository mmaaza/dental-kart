import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Payment context state
const initialState = {
  // Current step in checkout process
  currentStep: 1,
  
  // Order data
  orderData: {
    cart: [],
    shipping: null,
    payment: null
  },
  
  // Payment validation
  paymentValidation: {
    isValid: false,
    errors: {},
    warnings: []
  },
  
  // Payment processing state
  processing: {
    isProcessing: false,
    progress: 0,
    currentAction: null
  },
  
  // Security and validation
  security: {
    sessionId: null,
    csrfToken: null,
    attemptCount: 0,
    lastAttempt: null
  }
};

// Action types
const PAYMENT_ACTION_TYPES = {
  SET_STEP: 'SET_STEP',
  UPDATE_ORDER_DATA: 'UPDATE_ORDER_DATA',
  SET_PAYMENT_VALIDATION: 'SET_PAYMENT_VALIDATION',
  START_PROCESSING: 'START_PROCESSING',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  FINISH_PROCESSING: 'FINISH_PROCESSING',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE',
  INCREMENT_ATTEMPT: 'INCREMENT_ATTEMPT',
  SET_SECURITY_DATA: 'SET_SECURITY_DATA'
};

// Reducer function
const paymentReducer = (state, action) => {
  switch (action.type) {
    case PAYMENT_ACTION_TYPES.SET_STEP:
      return {
        ...state,
        currentStep: action.payload
      };
      
    case PAYMENT_ACTION_TYPES.UPDATE_ORDER_DATA:
      return {
        ...state,
        orderData: {
          ...state.orderData,
          ...action.payload
        }
      };
      
    case PAYMENT_ACTION_TYPES.SET_PAYMENT_VALIDATION:
      return {
        ...state,
        paymentValidation: {
          ...state.paymentValidation,
          ...action.payload
        }
      };
      
    case PAYMENT_ACTION_TYPES.START_PROCESSING:
      return {
        ...state,
        processing: {
          isProcessing: true,
          progress: 0,
          currentAction: action.payload.action || 'Processing...'
        }
      };
      
    case PAYMENT_ACTION_TYPES.UPDATE_PROGRESS:
      return {
        ...state,
        processing: {
          ...state.processing,
          progress: action.payload.progress,
          currentAction: action.payload.action || state.processing.currentAction
        }
      };
      
    case PAYMENT_ACTION_TYPES.FINISH_PROCESSING:
      return {
        ...state,
        processing: {
          isProcessing: false,
          progress: 100,
          currentAction: null
        }
      };
      
    case PAYMENT_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        processing: {
          ...state.processing,
          isProcessing: false
        },
        paymentValidation: {
          ...state.paymentValidation,
          errors: {
            ...state.paymentValidation.errors,
            [action.payload.field]: action.payload.message
          }
        }
      };
      
    case PAYMENT_ACTION_TYPES.INCREMENT_ATTEMPT:
      return {
        ...state,
        security: {
          ...state.security,
          attemptCount: state.security.attemptCount + 1,
          lastAttempt: new Date().toISOString()
        }
      };
      
    case PAYMENT_ACTION_TYPES.SET_SECURITY_DATA:
      return {
        ...state,
        security: {
          ...state.security,
          ...action.payload
        }
      };
      
    case PAYMENT_ACTION_TYPES.RESET_STATE:
      return {
        ...initialState,
        orderData: {
          ...initialState.orderData,
          cart: action.payload?.keepCart ? state.orderData.cart : []
        }
      };
      
    default:
      return state;
  }
};

// Context
const PaymentContext = createContext(undefined);

// Custom hook to use payment context
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// Payment validation schemas
const VALIDATION_SCHEMAS = {
  shipping: {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s]+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      required: true,
      pattern: /^\+?[\d\s-()]+$/,
      minLength: 10
    },
    address: {
      required: true,
      minLength: 10,
      maxLength: 500
    },
    city: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    province: {
      required: true
    }
  },
  payment: {
    paymentMethod: {
      required: true,
      enum: ['pay-later', 'pay-now']
    },
    screenshotFile: {
      requiredWhen: (data) => data.paymentMethod === 'pay-now',
      fileTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      maxSize: 5 * 1024 * 1024 // 5MB
    }
  }
};

// Provider component
export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  // Validation functions
  const validateField = useCallback((field, value, schema) => {
    const errors = [];
    
    if (schema.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(`${field} is required`);
    }
    
    if (value && schema.minLength && value.length < schema.minLength) {
      errors.push(`${field} must be at least ${schema.minLength} characters`);
    }
    
    if (value && schema.maxLength && value.length > schema.maxLength) {
      errors.push(`${field} must be no more than ${schema.maxLength} characters`);
    }
    
    if (value && schema.pattern && !schema.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }
    
    if (schema.enum && value && !schema.enum.includes(value)) {
      errors.push(`${field} must be one of: ${schema.enum.join(', ')}`);
    }
    
    return errors;
  }, []);

  const validateShippingData = useCallback((shippingData) => {
    const errors = {};
    const schema = VALIDATION_SCHEMAS.shipping;
    
    Object.keys(schema).forEach(field => {
      const fieldErrors = validateField(field, shippingData?.[field], schema[field]);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors[0]; // Take first error
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [validateField]);

  const validatePaymentData = useCallback((paymentData) => {
    const errors = {};
    const schema = VALIDATION_SCHEMAS.payment;
    
    Object.keys(schema).forEach(field => {
      const fieldSchema = schema[field];
      const value = paymentData?.[field];
      
      // Handle conditional validation
      if (fieldSchema.requiredWhen && fieldSchema.requiredWhen(paymentData)) {
        if (!value) {
          errors[field] = `${field} is required for this payment method`;
          return;
        }
      } else if (fieldSchema.required) {
        const fieldErrors = validateField(field, value, fieldSchema);
        if (fieldErrors.length > 0) {
          errors[field] = fieldErrors[0];
          return;
        }
      }
      
      // File-specific validation
      if (field === 'screenshotFile' && value) {
        if (fieldSchema.fileTypes && !fieldSchema.fileTypes.includes(value.type)) {
          errors[field] = `File must be one of: ${fieldSchema.fileTypes.join(', ')}`;
        } else if (fieldSchema.maxSize && value.size > fieldSchema.maxSize) {
          errors[field] = `File size must be less than ${fieldSchema.maxSize / 1024 / 1024}MB`;
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [validateField]);

  // Action creators
  const setStep = useCallback((step) => {
    dispatch({ type: PAYMENT_ACTION_TYPES.SET_STEP, payload: step });
  }, []);

  const updateOrderData = useCallback((data) => {
    dispatch({ type: PAYMENT_ACTION_TYPES.UPDATE_ORDER_DATA, payload: data });
  }, []);

  const setShippingData = useCallback((shippingData) => {
    const validation = validateShippingData(shippingData);
    
    dispatch({ type: PAYMENT_ACTION_TYPES.UPDATE_ORDER_DATA, payload: { shipping: shippingData } });
    dispatch({ 
      type: PAYMENT_ACTION_TYPES.SET_PAYMENT_VALIDATION, 
      payload: { 
        isValid: validation.isValid,
        errors: { ...state.paymentValidation.errors, shipping: validation.errors }
      }
    });
    
    return validation.isValid;
  }, [state.paymentValidation.errors, validateShippingData]);

  const setPaymentData = useCallback((paymentData) => {
    const validation = validatePaymentData(paymentData);
    
    dispatch({ type: PAYMENT_ACTION_TYPES.UPDATE_ORDER_DATA, payload: { payment: paymentData } });
    dispatch({ 
      type: PAYMENT_ACTION_TYPES.SET_PAYMENT_VALIDATION, 
      payload: { 
        isValid: validation.isValid,
        errors: { ...state.paymentValidation.errors, payment: validation.errors }
      }
    });
    
    return validation.isValid;
  }, [state.paymentValidation.errors, validatePaymentData]);

  const startProcessing = useCallback((action = 'Processing...') => {
    dispatch({ type: PAYMENT_ACTION_TYPES.START_PROCESSING, payload: { action } });
  }, []);

  const updateProgress = useCallback((progress, action) => {
    dispatch({ 
      type: PAYMENT_ACTION_TYPES.UPDATE_PROGRESS, 
      payload: { progress, action }
    });
  }, []);

  const finishProcessing = useCallback(() => {
    dispatch({ type: PAYMENT_ACTION_TYPES.FINISH_PROCESSING });
  }, []);

  const setError = useCallback((field, message) => {
    dispatch({ 
      type: PAYMENT_ACTION_TYPES.SET_ERROR, 
      payload: { field, message }
    });
    toast.error(message);
  }, []);

  const incrementAttempt = useCallback(() => {
    dispatch({ type: PAYMENT_ACTION_TYPES.INCREMENT_ATTEMPT });
    
    // Security check: too many attempts
    if (state.security.attemptCount >= 3) {
      toast.error('Too many failed attempts. Please try again later.');
      return false;
    }
    
    return true;
  }, [state.security.attemptCount]);

  const resetState = useCallback((keepCart = false) => {
    dispatch({ type: PAYMENT_ACTION_TYPES.RESET_STATE, payload: { keepCart } });
  }, []);

  // Security functions
  const generateSessionId = useCallback(() => {
    const sessionId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ 
      type: PAYMENT_ACTION_TYPES.SET_SECURITY_DATA, 
      payload: { sessionId }
    });
    return sessionId;
  }, []);

  // Comprehensive validation
  const validateCompleteOrder = useCallback(() => {
    const { shipping, payment, cart } = state.orderData;
    
    // Validate cart
    if (!cart || cart.length === 0) {
      setError('cart', 'Cart is empty');
      return false;
    }
    
    // Validate shipping
    const shippingValidation = validateShippingData(shipping);
    if (!shippingValidation.isValid) {
      setError('shipping', Object.values(shippingValidation.errors)[0]);
      return false;
    }
    
    // Validate payment
    const paymentValidation = validatePaymentData(payment);
    if (!paymentValidation.isValid) {
      setError('payment', Object.values(paymentValidation.errors)[0]);
      return false;
    }
    
    return true;
  }, [state.orderData, validateShippingData, validatePaymentData, setError]);

  const contextValue = {
    // State
    ...state,
    
    // Actions
    setStep,
    updateOrderData,
    setShippingData,
    setPaymentData,
    startProcessing,
    updateProgress,
    finishProcessing,
    setError,
    resetState,
    incrementAttempt,
    generateSessionId,
    
    // Validation
    validateShippingData,
    validatePaymentData,
    validateCompleteOrder,
    
    // Computed values
    isStepValid: (step) => {
      switch (step) {
        case 1:
          return state.orderData.cart && state.orderData.cart.length > 0;
        case 2:
          return validateShippingData(state.orderData.shipping).isValid;
        case 3:
          return validatePaymentData(state.orderData.payment).isValid;
        default:
          return false;
      }
    },
    
    canProceedToNextStep: (currentStep) => {
      switch (currentStep) {
        case 1:
          return state.orderData.cart && state.orderData.cart.length > 0;
        case 2:
          return validateShippingData(state.orderData.shipping).isValid;
        case 3:
          return false; // Can't proceed beyond step 3
        default:
          return false;
      }
    }
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};
