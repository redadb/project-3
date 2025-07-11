import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { db } from '../lib/supabase';
import { format } from 'date-fns';

export default function Plans() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: db.getPlans,
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { 
      key: 'price', 
      label: 'Price',
      render: (value: number, row: any) => `$${value}/${row.billingPeriod?.toLowerCase()}`
    },
    { 
      key: 'trialDays', 
      label: 'Trial Days',
      render: (value: number) => value ? `${value} days` : 'No trial'
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'error'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
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
          <Button variant="ghost" size="sm" icon={Edit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
          <p className="text-gray-600">Manage subscription plans and pricing</p>
        </div>
        <Button icon={Plus}>
          Add Plan
        </Button>
      </div>

      <Table columns={columns} data={plans || []} loading={isLoading} />
    </div>
  );
}