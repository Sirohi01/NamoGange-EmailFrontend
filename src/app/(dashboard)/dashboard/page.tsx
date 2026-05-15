'use client';

import React, { useEffect, useState } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { 
  Users, 
  Mail, 
  MousePointer2, 
  Send,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import apiClient from '@/services/api-client';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [detailedData, setDetailedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, detailedRes] = await Promise.all([
        apiClient.get('/analytics/dashboard-stats'),
        apiClient.get('/analytics/detailed-analytics')
      ]);
      setStats(statsRes.data.data);
      setDetailedData(detailedRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Gathering your intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Subscribers"
          value={stats?.subscribers?.toLocaleString() || '0'}
          change="+0%"
          trend="up"
          icon={Users}
          color="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <StatsCard
          title="Emails Sent"
          value={stats?.emailsSent?.toLocaleString() || '0'}
          change="+0%"
          trend="up"
          icon={Send}
          color="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
        />
        <StatsCard
          title="Open Rate"
          value={`${stats?.avgOpenRate}%` || '0%'}
          change="0%"
          trend="up"
          icon={Mail}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        />
        <StatsCard
          title="Total Campaigns"
          value={stats?.campaigns?.toString() || '0'}
          change="0"
          trend="up"
          icon={MousePointer2}
          color="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartWrapper>
                <AreaChart data={detailedData?.lineData || []}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#2563eb" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
                </AreaChart>
            </ChartWrapper>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Subscriber Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartWrapper>
                <BarChart data={detailedData?.lineData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="opens" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartWrapper>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
