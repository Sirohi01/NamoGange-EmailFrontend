'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  MoreHorizontal, 
  Send, 
  Clock, 
  CheckCircle2, 
  FileEdit,
  Trash2,
  BarChart3,
  RefreshCw,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { toast } from 'sonner';
import apiClient from '@/services/api-client';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const response = await apiClient.get('/campaigns');
      setCampaigns(response.data.data);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSendCampaign = async (id: string) => {
    try {
      await apiClient.post(`/campaigns/${id}/send`);
      toast.success('Campaign sending initiated!');
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Sent</Badge>;
      case 'sending':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none animate-pulse"><Clock className="w-3 h-3 mr-1" /> Sending</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-none"><FileEdit className="w-3 h-3 mr-1" /> Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
          <p className="text-slate-500 dark:text-slate-400">Create and manage your email marketing campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Campaign
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="font-semibold">Campaign Name</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Recipients</TableHead>
              <TableHead className="font-semibold">Stats (O/C)</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading campaigns...
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-lg">No campaigns found</p>
                  <p className="text-sm">Create your first campaign to reach your audience.</p>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-white">{campaign.name}</span>
                      <span className="text-xs text-slate-500">{campaign.subject}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {campaign.stats?.sent || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="text-emerald-600">{campaign.stats?.opens || 0} opens</span>
                      <span className="text-blue-600">{campaign.stats?.clicks || 0} clicks</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    } />
                      <DropdownMenuContent align="end" className="w-48">
                        {campaign.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleSendCampaign(campaign._id)} className="text-blue-600">
                            <Send className="w-4 h-4 mr-2" /> Send Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileEdit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
