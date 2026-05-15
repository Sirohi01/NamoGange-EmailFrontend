import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
}

export function StatsCard({ title, value, change, trend, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
            <p className={cn(
              "text-xs font-medium mt-1 flex items-center gap-1",
              trend === 'up' ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend === 'up' ? '↑' : '↓'} {change} 
              <span className="text-slate-400">vs last month</span>
            </p>
          </div>
          <div className={cn(
            "p-3 rounded-xl transition-transform group-hover:scale-110 duration-300",
            color
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
