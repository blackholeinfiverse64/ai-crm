import React from 'react';
import { UsersRound } from 'lucide-react';

export const Users = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <UsersRound className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold tracking-tight">User Management</h1>
      </div>
      <p className="text-muted-foreground">User management features coming soon...</p>
    </div>
  );
};

export default Users;
