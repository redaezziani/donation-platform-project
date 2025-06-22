import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Welcome{user?.full_name ? `, ${user.full_name}` : user?.username ? `, ${user.username}` : ''}!</h1>
      <p className="mb-8 text-muted-foreground">This is your dashboard. Here you can view and manage your fundraising campaigns, see your donations, and more features coming soon.</p>
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Your Campaigns</h2>
        <p className="text-muted-foreground">Campaign listing will appear here.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
