import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';

export default function Billing() {
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

  const totalSpent = transactions?.reduce((sum, transaction) => 
    transaction.status === 'COMPLETED' ? sum + transaction.amount : sum, 0
  ) || 0;

  const pendingAmount = transactions?.reduce((sum, transaction) => 
    transaction.status === 'PENDING' ? sum + transaction.amount : sum, 0
  ) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600">View your payment history and manage billing information</p>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Methods</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
          <Button icon={CreditCard}>Add Payment Method</Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Default</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          <Button variant="outline" icon={Download}>Export</Button>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Subscription Payment</p>
                        <p className="text-sm text-gray-500">{transaction.paymentMethod?.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount} {transaction.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button variant="ghost" size="sm" icon={Download}>
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>
          <Button variant="outline">Edit</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Billing Address</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{user?.name}</p>
              <p>123 Business Street</p>
              <p>Suite 100</p>
              <p>San Francisco, CA 94105</p>
              <p>United States</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Email: {user?.email}</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Tax ID: 12-3456789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}