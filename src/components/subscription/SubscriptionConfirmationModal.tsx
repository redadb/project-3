import React from 'react';
import { CheckCircle, X, CreditCard, Building, Calendar, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

interface ConfirmationData {
  title: string;
  description: string;
  instructions?: string[];
  nextSteps?: string[];
}

interface SubscriptionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmationData: ConfirmationData;
  paymentMethod: string;
  isTrialSubscription?: boolean;
}

export default function SubscriptionConfirmationModal({
  isOpen,
  onClose,
  confirmationData,
  paymentMethod,
  isTrialSubscription = false
}: SubscriptionConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (isTrialSubscription) {
      return <Calendar className="h-12 w-12 text-blue-600" />;
    }
    if (paymentMethod === 'BANK_TRANSFER') {
      return <Building className="h-12 w-12 text-yellow-600" />;
    }
    return <CheckCircle className="h-12 w-12 text-green-600" />;
  };

  const getIconBgColor = () => {
    if (isTrialSubscription) return 'bg-blue-100';
    if (paymentMethod === 'BANK_TRANSFER') return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Subscription Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Icon and Title */}
          <div className="text-center mb-6">
            <div className={`mx-auto w-16 h-16 ${getIconBgColor()} rounded-full flex items-center justify-center mb-4`}>
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmationData.title}
            </h3>
            <p className="text-gray-600">
              {confirmationData.description}
            </p>
          </div>

          {/* Instructions */}
          {confirmationData.instructions && confirmationData.instructions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                Important Information
              </h4>
              <ul className="space-y-2">
                {confirmationData.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {confirmationData.nextSteps && confirmationData.nextSteps.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Next Steps</h4>
              <ol className="space-y-2">
                {confirmationData.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-5 h-5 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Payment Method Specific Information */}
          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Building className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h5 className="font-medium text-yellow-800">Bank Transfer Instructions</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please complete the bank transfer within 7 days to activate your subscription.
                    You can find detailed payment instructions in your account dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                onClose();
                // Navigate to appropriate page
                window.location.href = paymentMethod === 'BANK_TRANSFER' ? '/billing' : '/dashboard';
              }}
              className="flex-1"
            >
              {paymentMethod === 'BANK_TRANSFER' ? 'View Payment Details' : 'Go to Dashboard'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}