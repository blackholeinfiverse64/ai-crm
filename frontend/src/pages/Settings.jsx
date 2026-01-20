import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold tracking-tight">System Settings</h1>
      </div>
      <p className="text-muted-foreground">Settings features coming soon...</p>
    </div>
  );
};

export default Settings;
