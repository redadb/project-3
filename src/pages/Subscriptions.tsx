import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { db } from '../lib/supabase';
import { format } from 'date-fns';

export default function Subscriptions() {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: db.getSubscriptions,
  });

  const columns = [
    { 
      key: 'user.name', 
      label: 'User',
      render: (value: string) => value || 'N/A'
    },
    { 
      key: 'plan.name', 
      label: 'Plan',
      render: (value: string) => value || 'N/A'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'paymentMethod', 
      label: 'Payment Method',
      render: (value: string) => value?.replace('_', ' ') || 'N/A'
    },
    { 
      key: 'startDate', 
      label: 'Start Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    { 
      key: 'endDate', 
      label: 'End Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    { 
      key: 'autoRenewal', 
      label: 'Auto Renewal',
      render: (value: boolean) => value ? 'Yes' : 'No'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" icon={Edit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2}>
            Cancel
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">Manage customer subscriptions and billing</p>
        </div>
        <Button icon={Plus}>
          Add Subscription
        </Button>
      </div>

      <Table columns={columns} data={subscriptions || []} loading={isLoading} />
    </div>
  );
}