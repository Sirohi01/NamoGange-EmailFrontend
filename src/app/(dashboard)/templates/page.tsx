'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Eye, 
  RefreshCw,
  Trash2,
  ArrowRight,
  Tag,
  Edit3
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import apiClient from '@/services/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/templates');
      setTemplates(response.data.data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't navigate when deleting
    if (!confirm('Delete this template?')) return;
    try {
      await apiClient.delete(`/templates/${id}`);
      toast.success('Template removed');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your designs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Design Library</h1>
          <p className="text-slate-500 dark:text-slate-400">Click a template to preview or edit it</p>
        </div>
        
        <Link href="/templates/create">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-6 shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10 border-none bg-transparent focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card 
            key={template._id} 
            onClick={() => router.push(`/templates/${template._id}`)}
            className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-950 flex flex-col cursor-pointer"
          >
            <CardHeader className="p-0 relative aspect-[3/2] bg-slate-50 dark:bg-slate-900 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                <div className="w-full h-full p-4 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                    <div dangerouslySetInnerHTML={{ __html: template.content }} className="scale-[0.25] origin-top-left w-[400%] h-[400%]" />
                </div>
                
                {/* Visual Indicator on Hover */}
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                  <div className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-2xl">
                    <Edit3 className="w-3.5 h-3.5" /> Edit & Preview
                  </div>
                </div>
                
                <Badge className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-slate-900 border-none px-2 py-0.5 text-[8px] font-bold shadow-sm uppercase">
                  {template.category}
                </Badge>
                
                <Button 
                    onClick={(e) => handleDeleteTemplate(template._id, e)} 
                    size="icon" 
                    variant="ghost" 
                    className="absolute top-2 right-2 w-7 h-7 rounded-full text-slate-400 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </CardHeader>
            
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-bold text-xs truncate text-slate-900 dark:text-white max-w-[120px]">{template.name}</h3>
                <div className="flex items-center gap-1 text-[8px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded uppercase">
                    <Tag className="w-2 h-2" /> {template.category}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-medium">{new Date(template.updatedAt).toLocaleDateString()}</p>
                <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
