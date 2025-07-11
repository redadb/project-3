import React, { useState } from 'react';
import { X, CreditCard, Building, FileText, DollarSign } from 'lucide-react';
import Button from '../ui/Button';
import { Plan } from '../../types';
import { SubscriptionManager } from '../../lib/subscription/subscription-manager';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  onSuccess: (result: any) => void;
}

export default function SubscriptionCreationModal({
  isOpen,
  onClose,
  plan,
  onSuccess
}: SubscriptionCreationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: 'CARD' as 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH',
    requiresPayment: true,
    hasTrialPeriod: plan.trialDays ? plan.trialDays > 0 : false,
    acceptTerms: false
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const result = await SubscriptionManager.createSubscription({
        userId: user.id,
        planId: plan.id,
        paymentMethod: formData.paymentMethod,
        requiresPayment: formData.requiresPayment,
        hasTrialPeriod: formData.hasTrialPeriod,
        trialDays: plan.trialDays
      });

      if (result.success) {
        onSuccess(result);
        onClose();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Subscribe to {plan.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
              <span className="text-gray-600 ml-1">/{plan.billingPeriod.toLowerCase()}</span>
            </div>
            {plan.trialDays && plan.trialDays > 0 && (
              <div className="mt-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {plan.trialDays} day free trial
                </span>
              </div>
            )}
          </div>

          {/* Trial Period Option */}
          {plan.trialDays && plan.trialDays > 0 && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasTrialPeriod}
                  onChange={(e) => handleChange('hasTrialPeriod', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Start with {plan.trialDays}-day free trial
                </span>
              </label>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={formData.paymentMethod === 'CARD'}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <CreditCard className="h-5 w-5 text-gray-400 ml-3 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">Instant activation</div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={formData.paymentMethod === 'BANK_TRANSFER'}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Building className="h-5 w-5 text-gray-400 ml-3 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Bank Transfer</div>
                  <div className="text-sm text-gray-500">Manual verification required</div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Requirement */}
          {!formData.hasTrialPeriod && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requiresPayment}
                  onChange={(e) => handleChange('requiresPayment', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Process payment immediately
                </span>
              </label>
            </div>
          )}

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                required
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!formData.acceptTerms}
              className="flex-1"
            >
              {formData.hasTrialPeriod ? 'Start Trial' : 'Subscribe Now'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}