import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Clock, CheckCircle, XCircle, AlertTriangle,
  Plus, RefreshCw, Settings, FileText, Calendar
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { Modal, ModalFooter } from '../components/common/ui/Modal';
import { emsAPI } from '../services/api/emsAPI';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';

export const Emails = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('send'); // send, scheduled, activity, settings
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [emailActivity, setEmailActivity] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState('restock');

  const metrics = {
    emailsSentToday: 47,
    successRate: 95.2,
    scheduled: 12,
    templates: 8,
  };

  const mockScheduledEmails = [
    {
      id: 1,
      subject: 'Weekly Inventory Report',
      recipients: ['inventory@company.com'],
      scheduledTime: new Date(Date.now() + 86400000),
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 2,
      subject: 'Monthly Supplier Review',
      recipients: ['procurement@company.com', 'manager@company.com'],
      scheduledTime: new Date(Date.now() + 259200000),
      status: 'pending',
      priority: 'high',
    },
  ];

  const mockActivity = [
    { id: 1, type: 'Restock Alert', recipient: 'inventory@company.com', status: 'sent', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, type: 'Purchase Order', recipient: 'supplier@techparts.com', status: 'sent', timestamp: new Date(Date.now() - 7200000) },
    { id: 3, type: 'Shipment Notification', recipient: 'customer@example.com', status: 'sent', timestamp: new Date(Date.now() - 10800000) },
    { id: 4, type: 'Delivery Delay', recipient: 'customer2@example.com', status: 'failed', timestamp: new Date(Date.now() - 14400000) },
  ];

  useEffect(() => {
    setTimeout(() => {
      setScheduledEmails(mockScheduledEmails);
      setEmailActivity(mockActivity);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusVariant = (status) => {
    const variants = {
      sent: 'success',
      pending: 'warning',
      failed: 'destructive',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return <LoadingSpinner text="Loading email automation..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Email Automation</h1>
          <p className="text-muted-foreground mt-1">
            Manage email triggers and automated notifications
          </p>
        </div>
        <Button onClick={() => setShowEmailModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Emails Sent Today"
          value={metrics.emailsSentToday.toLocaleString()}
          icon={Mail}
          variant="primary"
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={CheckCircle}
          variant="success"
        />
        <MetricCard
          title="Scheduled"
          value={metrics.scheduled.toLocaleString()}
          icon={Clock}
          variant="accent"
        />
        <MetricCard
          title="Templates"
          value={metrics.templates.toLocaleString()}
          icon={FileText}
          variant="secondary"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'send'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Send Emails
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'scheduled'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'activity'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Activity Log
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Send Emails Tab */}
      {activeTab === 'send' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card hover onClick={() => { setEmailType('restock'); setShowEmailModal(true); }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-8 w-8 text-warning" />
                    <div>
                      <h3 className="font-semibold">Restock Alert</h3>
                      <p className="text-sm text-muted-foreground">Notify when stock is low</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card hover onClick={() => { setEmailType('purchase'); setShowEmailModal(true); }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Purchase Order</h3>
                      <p className="text-sm text-muted-foreground">Send PO to suppliers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card hover onClick={() => { setEmailType('shipment'); setShowEmailModal(true); }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-8 w-8 text-accent" />
                    <div>
                      <h3 className="font-semibold">Shipment Notification</h3>
                      <p className="text-sm text-muted-foreground">Notify customers of shipments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card hover onClick={() => { setEmailType('delay'); setShowEmailModal(true); }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-8 w-8 text-destructive" />
                    <div>
                      <h3 className="font-semibold">Delivery Delay</h3>
                      <p className="text-sm text-muted-foreground">Notify of delivery delays</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Emails Tab */}
      {activeTab === 'scheduled' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scheduled Emails</CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Process Scheduled
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledEmails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="font-medium">{email.subject}</TableCell>
                    <TableCell>{email.recipients.join(', ')}</TableCell>
                    <TableCell>{formatDate(email.scheduledTime, 'PPpp')}</TableCell>
                    <TableCell>
                      <Badge variant={email.priority === 'high' ? 'destructive' : 'default'}>
                        {email.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(email.status)}>
                        {email.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Cancel</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.type}</TableCell>
                    <TableCell>{activity.recipient}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(activity.status)}>
                        {activity.status === 'sent' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">SMTP Host</label>
                <Input defaultValue="smtp.gmail.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">SMTP Port</label>
                  <Input type="number" defaultValue="587" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">SMTP User</label>
                  <Input defaultValue="your-email@gmail.com" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <label className="text-sm">Enable SSL/TLS</label>
              </div>
              <Button>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Modal */}
      <Modal
        isOpen={showEmailModal}
        title={`Send ${emailType === 'restock' ? 'Restock Alert' : emailType === 'purchase' ? 'Purchase Order' : emailType === 'shipment' ? 'Shipment Notification' : 'Delivery Delay'}`}
        onClose={() => setShowEmailModal(false)}
      >
          <div className="space-y-4">
            <Input label="Recipient Email" placeholder="email@example.com" />
            {emailType === 'restock' && (
              <>
                <Input label="Product ID" placeholder="PROD-001" />
                <Input label="Product Name" placeholder="Wireless Mouse" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Current Stock" type="number" placeholder="5" />
                  <Input label="Restock Quantity" type="number" placeholder="20" />
                </div>
              </>
            )}
            {emailType === 'purchase' && (
              <>
                <Input label="Supplier Email" placeholder="supplier@example.com" />
                <Input label="PO Number" placeholder="PO-2025-001" />
                <Input label="Product Name" placeholder="Wireless Mouse" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Quantity" type="number" placeholder="20" />
                  <Input label="Unit Cost" type="number" placeholder="15.50" />
                </div>
              </>
            )}
            {emailType === 'shipment' && (
              <>
                <Input label="Customer Email" placeholder="customer@example.com" />
                <Input label="Order ID" placeholder="12345" />
                <Input label="Tracking Number" placeholder="FS123456789" />
                <Input label="Courier Name" placeholder="FastShip Express" />
              </>
            )}
            {emailType === 'delay' && (
              <>
                <Input label="Customer Email" placeholder="customer@example.com" />
                <Input label="Order ID" placeholder="12345" />
                <Input label="Tracking Number" placeholder="FS123456789" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Original Delivery" type="date" />
                  <Input label="New Delivery" type="date" />
                </div>
                <Input label="Delay Reason" placeholder="Weather conditions" />
              </>
            )}
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button onClick={() => setShowEmailModal(false)}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </ModalFooter>
      </Modal>
    </div>
  );
};

export default Emails;
