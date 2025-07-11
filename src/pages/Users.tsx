import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { db } from '../lib/supabase';
import { format } from 'date-fns';

export default function Users() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: db.getUsers,
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Role',
      render: (value: string) => (
        <Badge variant={value === 'ADMIN' ? 'info' : 'default'}>
          {value}
        </Badge>
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
      key: 'isVerified', 
      label: 'Verified',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'warning'}>
          {value ? 'Verified' : 'Unverified'}
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
      render: (_: any, row: any) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button icon={Plus}>
          Add User
        </Button>
      </div>

      <Table columns={columns} data={users || []} loading={isLoading} />
    </div>
  );
}