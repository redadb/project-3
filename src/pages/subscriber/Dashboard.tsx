import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, FileText, User, Settings, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';

export default function SubscriberDashboard() {
  const { user } = useAuth();

  const { data: subscriptions } = useQuery({
    queryKey: ['user-subscriptions', user?.id],
    queryFn: async () => {
      const allSubs = await db.getSubscriptions();
      return allSubs.filter(sub => sub.userId === user?.id);
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['user-transactions', user?.id],
    queryFn: async () => {
      const allTransactions = await db.getTransactions();
      const userSubscriptionIds = subscriptions?.map(sub => sub.id) || [];
      return allTransactions.filter(transaction => 
        userSubscriptionIds.includes(transaction.subscriptionId)
      );
    },
    enabled: !!subscriptions,
  });

  const activeSubscription = subscriptions?.find(sub => sub.status === 'ACTIVE' || sub.status === 'TRIALING');
  const totalSpent = transactions?.reduce((sum, transaction) => 
    transaction.status === 'COMPLETED' ? sum + transaction.amount : sum, 0
  ) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">Manage your subscription and account settings</p>
        </div>
        <Button icon={Settings}>
          Account Settings
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Subscriptions"
          value={subscriptions?.filter(sub => sub.status === 'ACTIVE' || sub.status === 'TRIALING').length || 0}
          icon={CreditCard}
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          title="Invoices"
          value={transactions?.length || 0}
          icon={FileText}
        />
      </div>

      {/* Current Subscription */}
      {activeSubscription && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
            <StatusBadge status={activeSubscription.status} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{activeSubscription.plan?.name}</h3>
              <p className="text-gray-600 mb-4">{activeSubscription.plan?.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-medium">${activeSubscription.plan?.price}/{activeSubscription.plan?.billingPeriod?.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-medium">{activeSubscription.paymentMethod?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Auto Renewal:</span>
                  <span className="font-medium">{activeSubscription.autoRenewal ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="font-medium">{format(new Date(activeSubscription.startDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date:</span>
                  <span className="font-medium">{format(new Date(activeSubscription.endDate), 'MMM dd, yyyy')}</span>
                </div>
                {activeSubscription.trialEndDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trial Ends:</span>
                    <span className="font-medium">{format(new Date(activeSubscription.trialEndDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
                <Button variant="outline" className="w-full">
                  Update Payment Method
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">${transaction.amount} {transaction.currency}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')} • {transaction.paymentMethod?.replace('_', ' ')}
                  </p>
                </div>
                <StatusBadge status={transaction.status} />
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Transactions
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" icon={User} className="justify-start">
            Update Profile
          </Button>
          <Button variant="outline" icon={CreditCard} className="justify-start">
            Billing History
          </Button>
          <Button variant="outline" icon={Calendar} className="justify-start">
            Schedule Changes
          </Button>
          <Button variant="outline" icon={Settings} className="justify-start">
            Account Settings
          </Button>
        </div>
      </div>
    </div>
  );
}