'use client';

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartWrapperProps {
  children: React.ReactElement;
  height?: number | string;
  minHeight?: number | string;
}

export function ChartWrapper({ children, height = 350, minHeight = 350 }: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Add a slight delay to ensure the DOM is fully settled
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div 
        style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }} 
        className="w-full bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-xl" 
      />
    );
  }

  return (
    <div 
        className="w-full" 
        style={{ 
            height: typeof height === 'number' ? `${height}px` : height, 
            minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
            position: 'relative'
        }}
    >
      <ResponsiveContainer width="99%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
