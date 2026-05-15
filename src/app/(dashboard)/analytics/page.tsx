'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StatsCard } from '@/components/shared/StatsCard';
import { Mail, Eye, MousePointer2, AlertCircle, RefreshCw } from 'lucide-react';
import apiClient from '@/services/api-client';
import { toast } from 'sonner';

const COLORS = ['#2563eb', '#8b5cf6', '#0ea5e9', '#64748b'];

export default function AnalyticsPage() {
  const [detailedData, setDetailedData] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, detailedRes] = await Promise.all([
        apiClient.get('/analytics/dashboard-stats'),
        apiClient.get('/analytics/detailed-analytics')
      ]);
      setSummaryStats(statsRes.data.data);
      setDetailedData(detailedRes.data.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Deep dive into your email performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Avg Open Rate"
          value={`${summaryStats?.avgOpenRate}%` || '0%'}
          change="+0%"
          trend="up"
          icon={Eye}
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Avg Click Rate"
          value="0.0%"
          change="0%"
          trend="up"
          icon={MousePointer2}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatsCard
          title="Bounce Rate"
          value="0.0%"
          change="0%"
          trend="down"
          icon={AlertCircle}
          color="bg-rose-50 text-rose-600"
        />
        <StatsCard
          title="Total Sent"
          value={summaryStats?.emailsSent?.toLocaleString() || '0'}
          change="+0%"
          trend="up"
          icon={Mail}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartWrapper height={400}>
                <LineChart data={detailedData?.lineData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="opens" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
            </ChartWrapper>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Email Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartWrapper height={400}>
                <PieChart>
                  <Pie
                    data={detailedData?.pieData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(detailedData?.pieData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
            </ChartWrapper>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
