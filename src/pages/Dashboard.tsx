import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, CreditCard, DollarSign, AlertCircle, TrendingUp, Package } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Table from '../components/ui/Table';
import { db } from '../lib/supabase';
import { format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: db.getDashboardStats,
  });

  const { data: recentSubscriptions } = useQuery({
    queryKey: ['recent-subscriptions'],
    queryFn: async () => {
      const subs = await db.getSubscriptions();
      return subs.slice(0, 5);
    },
  });

  const subscriptionColumns = [
    { key: 'user.name', label: 'User', render: (value: string) => value || 'N/A' },
    { key: 'plan.name', label: 'Plan', render: (value: string) => value || 'N/A' },
    { key: 'status', label: 'Status', render: (value: string) => <StatusBadge status={value} /> },
    { key: 'createdAt', label: 'Created', render: (value: string) => format(new Date(value), 'MMM dd, yyyy') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your SaaS platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Monthly Growth"
          value={`${stats?.monthlyGrowth || 0}%`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Pending Transactions"
          value={stats?.pendingTransactions || 0}
          icon={AlertCircle}
        />
        <StatCard
          title="Expired Trials"
          value={stats?.expiredTrials || 0}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Subscriptions</h2>
          <Table
            columns={subscriptionColumns}
            data={recentSubscriptions || []}
            loading={!recentSubscriptions}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <div className="font-medium text-gray-900">Create New Plan</div>
              <div className="text-sm text-gray-500">Add a new subscription plan</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <div className="font-medium text-gray-900">Send Email Campaign</div>
              <div className="text-sm text-gray-500">Create and send marketing emails</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <div className="font-medium text-gray-900">Review Transactions</div>
              <div className="text-sm text-gray-500">Check pending payments</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}