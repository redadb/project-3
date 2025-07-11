import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { db } from '../lib/supabase';
import { format } from 'date-fns';

export default function EmailTemplates() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: db.getEmailTemplates,
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'subject', label: 'Subject' },
    { 
      key: 'category', 
      label: 'Category',
      render: (value: string) => (
        <Badge variant="info">
          {value}
        </Badge>
      )
    },
    { 
      key: 'variables', 
      label: 'Variables',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 3).map((variable, index) => (
            <Badge key={index} variant="default" size="sm">
              {variable}
            </Badge>
          ))}
          {value?.length > 3 && (
            <Badge variant="default" size="sm">
              +{value.length - 3}
            </Badge>
          )}
        </div>
      )
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
          <Button variant="ghost" size="sm" icon={Eye}>
            Preview
          </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Create and manage email templates</p>
        </div>
        <Button icon={Plus}>
          Add Template
        </Button>
      </div>

      <Table columns={columns} data={templates || []} loading={isLoading} />
    </div>
  );
}