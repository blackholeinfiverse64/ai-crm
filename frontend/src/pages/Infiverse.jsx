import React from 'react';
import { UsersRound } from 'lucide-react';

export const Infiverse = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <UsersRound className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold tracking-tight">Employee Monitoring</h1>
      </div>
      <p className="text-muted-foreground">Employee monitoring features coming soon...</p>
    </div>
  );
};

export default Infiverse;
