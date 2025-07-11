import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Eye, Send } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { db } from '../lib/supabase';
import { format } from 'date-fns';

export default function EmailCampaigns() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: db.getEmailCampaigns,
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'subject', label: 'Subject' },
    { 
      key: 'template.name', 
      label: 'Template',
      render: (value: string) => value || 'N/A'
    },
    { 
      key: 'recipientCount', 
      label: 'Recipients',
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'sentCount', 
      label: 'Sent',
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'scheduledAt', 
      label: 'Scheduled',
      render: (value: string) => value ? format(new Date(value), 'MMM dd, yyyy HH:mm') : 'Not scheduled'
    },
    { 
      key: 'createdAt', 
      label: 'Created',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" icon={Eye}>
            View
          </Button>
          {row.status === 'DRAFT' && (
            <Button variant="ghost" size="sm" icon={Send}>
              Send
            </Button>
          )}
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
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600">Create and manage email marketing campaigns</p>
        </div>
        <Button icon={Plus}>
          Create Campaign
        </Button>
      </div>

      <Table columns={columns} data={campaigns || []} loading={isLoading} />
    </div>
  );
}