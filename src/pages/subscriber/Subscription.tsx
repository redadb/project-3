import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Calendar, DollarSign, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { format, addDays } from 'date-fns';

export default function Subscription() {
  const { user } = useAuth();

  const { data: subscriptions } = useQuery({
    queryKey: ['user-subscriptions', user?.id],
    queryFn: async () => {
      const allSubs = await db.getSubscriptions();
      return allSubs.filter(sub => sub.userId === user?.id);
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: db.getPlans,
  });

  const activeSubscription = subscriptions?.find(sub => sub.status === 'ACTIVE' || sub.status === 'TRIALING');
  const availablePlans = plans?.filter(plan => plan.isActive && plan.id !== activeSubscription?.planId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600">Manage your subscription plan and billing</p>
      </div>

      {/* Current Subscription */}
      {activeSubscription ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
            <StatusBadge status={activeSubscription.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{activeSubscription.plan?.name}</h3>
                <p className="text-gray-600 mb-4">{activeSubscription.plan?.description}</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">${activeSubscription.plan?.price}</span>
                  <span className="text-gray-600 ml-1">/{activeSubscription.plan?.billingPeriod?.toLowerCase()}</span>
                </div>
              </div>

              {/* Plan Features */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
                <div className="space-y-2">
                  {activeSubscription.plan?.features && Object.entries(activeSubscription.plan.features).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              {/* Subscription Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Subscription Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge status={activeSubscription.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">{format(new Date(activeSubscription.startDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Billing</span>
                    <span className="font-medium">{format(new Date(activeSubscription.endDate), 'MMM dd, yyyy')}</span>
                  </div>
                  {activeSubscription.trialEndDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial Ends</span>
                      <span className="font-medium">{format(new Date(activeSubscription.trialEndDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{activeSubscription.paymentMethod?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto Renewal</span>
                    <span className="font-medium">{activeSubscription.autoRenewal ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              {/* Trial Warning */}
              {activeSubscription.status === 'TRIALING' && activeSubscription.trialEndDate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Trial Period Active</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your trial ends on {format(new Date(activeSubscription.trialEndDate), 'MMM dd, yyyy')}. 
                        Make sure your payment method is set up to continue your subscription.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button variant="outline" icon={CreditCard} className="w-full">
                  Update Payment Method
                </Button>
                <Button variant="outline" icon={Settings} className="w-full">
                  Manage Auto-Renewal
                </Button>
                <Button variant="outline" icon={Calendar} className="w-full">
                  Change Billing Date
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-6">Choose a plan to get started with our platform</p>
          <Button>Browse Plans</Button>
        </div>
      )}

      {/* Available Plans */}
      {availablePlans && availablePlans.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {activeSubscription ? 'Upgrade or Change Plan' : 'Available Plans'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.billingPeriod?.toLowerCase()}</span>
                  </div>
                  {plan.trialDays && plan.trialDays > 0 && (
                    <div className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full inline-block mb-4">
                      {plan.trialDays} day free trial
                    </div>
                  )}
                </div>
                
                {/* Plan Features */}
                <div className="mb-6">
                  <div className="space-y-2 text-sm">
                    {plan.features && Object.entries(plan.features).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  variant={activeSubscription ? 'outline' : 'primary'} 
                  className="w-full"
                >
                  {activeSubscription ? 'Switch Plan' : 'Select Plan'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription History */}
      {subscriptions && subscriptions.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription History</h2>
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{subscription.plan?.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(subscription.startDate), 'MMM dd, yyyy')} - {format(new Date(subscription.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <StatusBadge status={subscription.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}