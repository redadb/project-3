import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Star, ArrowRight } from 'lucide-react';
import { db } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import SubscriptionCreationModal from '../../components/subscription/SubscriptionCreationModal';
import SubscriptionConfirmationModal from '../../components/subscription/SubscriptionConfirmationModal';
import { Plan } from '../../types';

export default function PlanSelection() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: db.getPlans,
  });

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowCreationModal(true);
  };

  const handleSubscriptionSuccess = (result: any) => {
    setConfirmationData({
      ...result.confirmationData,
      paymentMethod: result.subscription?.paymentMethod,
      isTrialSubscription: result.subscription?.status === 'TRIALING'
    });
    setShowConfirmationModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activePlans = plans?.filter(plan => plan.isActive) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include our core features 
            with different limits and support levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activePlans.map((plan, index) => {
            const isPopular = index === 1; // Make middle plan popular
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  isPopular ? 'ring-2 ring-blue-600 scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.billingPeriod.toLowerCase()}</span>
                  </div>
                  {plan.trialDays && plan.trialDays > 0 && (
                    <div className="mt-3">
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        {plan.trialDays} day free trial
                      </span>
                    </div>
                  )}
                </div>

                {/* Plan Features */}
                <div className="mb-8">
                  <ul className="space-y-4">
                    {plan.features && Object.entries(plan.features).map(([key, value]) => (
                      <li key={key} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>: {String(value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handlePlanSelect(plan)}
                  variant={isPopular ? 'primary' : 'outline'}
                  className="w-full"
                  icon={ArrowRight}
                >
                  {plan.trialDays && plan.trialDays > 0 ? 'Start Free Trial' : 'Get Started'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected 
                in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, bank transfers, and other payment methods 
                depending on your region.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h3>
              <p className="text-gray-600">
                No, there are no setup fees. You only pay for your chosen plan, and you can 
                start with our free trial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have 
                access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedPlan && (
        <SubscriptionCreationModal
          isOpen={showCreationModal}
          onClose={() => {
            setShowCreationModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSuccess={handleSubscriptionSuccess}
        />
      )}

      {confirmationData && (
        <SubscriptionConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setConfirmationData(null);
          }}
          confirmationData={confirmationData}
          paymentMethod={confirmationData.paymentMethod}
          isTrialSubscription={confirmationData.isTrialSubscription}
        />
      )}
    </div>
  );
}