import React from 'react';

const ConfirmDialog = ({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary', // primary, danger, warning, success
  onConfirm,
}) => {
  if (!open) return null;
  
  // Get button color based on variant
  const getButtonClasses = () => {
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white',
      danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 text-white',
      success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
    };
    
    return variants[confirmVariant] || variants.primary;
  };
  
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Dialog positioning */}
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
        <div 
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div>
            {/* Dialog content */}
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-headline"
              >
                {title}
              </h3>
              {description && (
                <p className="mt-2 text-sm text-gray-500">
                  {description}
                </p>
              )}
              
              {/* Custom content */}
              {children}
            </div>
          </div>
          
          {/* Dialog actions */}
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 sm:text-sm"
              onClick={onClose}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${getButtonClasses()}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
