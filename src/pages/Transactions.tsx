import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Eye } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { db } from '../lib/supabase';
import { format } from 'date-fns';

export default function Transactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: db.getTransactions,
  });

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value: number, row: any) => `$${value.toLocaleString()} ${row.currency}`
    },
    { 
      key: 'paymentMethod', 
      label: 'Payment Method',
      render: (value: string) => value?.replace('_', ' ') || 'N/A'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'transactionDate', 
      label: 'Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy HH:mm')
    },
    { 
      key: 'createdAt', 
      label: 'Created',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" icon={Eye}>
            View
          </Button>
          <Button variant="ghost" size="sm" icon={Edit}>
            Edit
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Track payments and financial transactions</p>
        </div>
        <Button icon={Plus}>
          Add Transaction
        </Button>
      </div>

      <Table columns={columns} data={transactions || []} loading={isLoading} />
    </div>
  );
}