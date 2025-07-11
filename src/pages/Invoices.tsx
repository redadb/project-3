import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Eye, Download } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { format } from 'date-fns';

// Mock data for invoices
const mockInvoices = [
  {
    id: 'INV-001',
    subscriptionId: 'sub_123',
    invoiceNumber: 'INV-2024-001',
    amount: 99.99,
    currency: 'USD',
    status: 'PAID',
    dueDate: '2024-02-15',
    paidDate: '2024-02-10',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-10'
  },
  {
    id: 'INV-002',
    subscriptionId: 'sub_456',
    invoiceNumber: 'INV-2024-002',
    amount: 199.99,
    currency: 'USD',
    status: 'UNPAID',
    dueDate: '2024-02-20',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  }
];

export default function Invoices() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => mockInvoices,
  });

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value: number, row: any) => `$${value.toLocaleString()} ${row.currency}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'dueDate', 
      label: 'Due Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    { 
      key: 'paidDate', 
      label: 'Paid Date',
      render: (value: string) => value ? format(new Date(value), 'MMM dd, yyyy') : 'Not paid'
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
          <Button variant="ghost" size="sm" icon={Download}>
            Download
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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage billing and payment invoices</p>
        </div>
        <Button icon={Plus}>
          Create Invoice
        </Button>
      </div>

      <Table columns={columns} data={invoices || []} loading={isLoading} />
    </div>
  );
}