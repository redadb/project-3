import React from 'react';
import { Outlet } from 'react-router-dom';
import SubscriberHeader from './SubscriberHeader';
import SubscriberSidebar from './SubscriberSidebar';

export default function SubscriberLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <SubscriberSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <SubscriberHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}