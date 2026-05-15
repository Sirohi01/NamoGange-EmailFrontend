'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  RefreshCw,
  Loader2,
  Server,
  Key,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import apiClient from '@/services/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function SenderEmailsPage() {
  const [senders, setSenders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const [newSender, setNewSender] = useState({
    email: '',
    name: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: ''
  });

  const fetchSenders = async () => {
    try {
      const response = await apiClient.get('/sender-emails');
      setSenders(response.data.data);
    } catch (error) {
      toast.error('Failed to load senders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSenders();
  }, []);

  const handleAddSender = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/sender-emails', {
        ...newSender,
        smtpPort: parseInt(newSender.smtpPort)
      });
      toast.success('Sender email added successfully!');
      setIsDialogOpen(false);
      setNewSender({ email: '', name: '', smtpHost: '', smtpPort: '587', smtpUser: '', smtpPass: '' });
      fetchSenders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add sender');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySender = async (id: string) => {
    setVerifyingId(id);
    try {
      await apiClient.patch(`/sender-emails/${id}/verify`);
      toast.success('Sender email verified!');
      fetchSenders();
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteSender = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiClient.delete(`/sender-emails/${id}`);
      toast.success('Sender deleted');
      fetchSenders();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading sender identities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sender Identities</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage verified emails and SMTP settings</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Sender
            </Button>
          } />
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleAddSender}>
              <DialogHeader>
                <DialogTitle>Configure Sender SMTP</DialogTitle>
                <DialogDescription>Add a verified email and its SMTP server details.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. John Doe" 
                    value={newSender.name}
                    onChange={(e) => setNewSender({...newSender, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={newSender.email}
                    onChange={(e) => setNewSender({...newSender, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="col-span-2 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-blue-600">
                        <Server className="w-4 h-4" /> SMTP Settings
                    </h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="host">SMTP Host</Label>
                  <Input 
                    id="host" 
                    placeholder="smtp.gmail.com" 
                    value={newSender.smtpHost}
                    onChange={(e) => setNewSender({...newSender, smtpHost: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">SMTP Port</Label>
                  <Input 
                    id="port" 
                    placeholder="587" 
                    value={newSender.smtpPort}
                    onChange={(e) => setNewSender({...newSender, smtpPort: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user">SMTP Username</Label>
                  <Input 
                    id="user" 
                    placeholder="Username/Email" 
                    value={newSender.smtpUser}
                    onChange={(e) => setNewSender({...newSender, smtpUser: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass">SMTP Password</Label>
                  <Input 
                    id="pass" 
                    type="password" 
                    placeholder="••••••••" 
                    value={newSender.smtpPass}
                    onChange={(e) => setNewSender({...newSender, smtpPass: e.target.value})}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600">
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Verify & Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {senders.map((sender) => (
          <Card key={sender._id} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                    <CardTitle className="text-base font-bold">{sender.name}</CardTitle>
                    <p className="text-xs text-slate-500">{sender.email}</p>
                </div>
              </div>
              <Badge variant={sender.isVerified ? "default" : "secondary"} className={sender.isVerified ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-600 border-none"}>
                {sender.isVerified ? "Verified" : "Pending"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 uppercase font-bold tracking-widest">SMTP Server</span>
                    <span className="font-mono">{sender.smtpHost}:{sender.smtpPort}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 uppercase font-bold tracking-widest">Username</span>
                    <span className="font-mono">{sender.smtpUser}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-6">
                {!sender.isVerified && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleVerifySender(sender._id)}
                    disabled={verifyingId === sender._id}
                    className="text-xs h-8"
                  >
                    {verifyingId === sender._id ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-2" />}
                    Verify Now
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteSender(sender._id)}
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
