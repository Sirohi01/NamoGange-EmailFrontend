'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Code, 
  Loader2,
  Tag,
  Mail,
  History
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/services/api-client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'Marketing'
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await apiClient.get(`/templates/${templateId}`);
        setFormData({
          name: response.data.data.name,
          subject: response.data.data.subject || '',
          content: response.data.data.content,
          category: response.data.data.category || 'Marketing'
        });
      } catch (error) {
        toast.error('Failed to load template');
        router.push('/templates');
      } finally {
        setIsLoading(false);
      }
    };
    if (templateId) fetchTemplate();
  }, [templateId, router]);

  const handleUpdate = async () => {
    if (!formData.name) {
      toast.error('Template name is required');
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.patch(`/templates/${templateId}`, formData);
      toast.success('Template updated successfully!');
      router.push('/templates');
    } catch (error) {
      toast.error('Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your design...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-6 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-8 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
                Edit Template <Badge className="bg-blue-50 text-blue-600 border-none text-[10px]">v1.0</Badge>
            </h1>
            <p className="text-xs text-slate-500">Updating: {formData.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-200 dark:shadow-none font-bold"
            onClick={handleUpdate}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Update Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Controls */}
        <div className="w-80 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 p-6 space-y-8 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Settings</Label>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Internal Name</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-900 border-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Default Subject Line</Label>
                  <Input 
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-900 border-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label className="text-xs font-bold uppercase text-slate-400">Category</Label>
              <div className="space-y-1.5">
                <Select 
                  value={formData.category} 
                  onValueChange={(val: string | null) => setFormData({...formData, category: val || 'Marketing'})}
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Welcome">Welcome</SelectItem>
                    <SelectItem value="Transactional">Transactional</SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </div>

        {/* Main Editor & Preview Area */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 flex flex-col p-6 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <TabsTrigger value="editor" className="rounded-lg px-6 h-9 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Code className="w-4 h-4 mr-2" /> Code Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg px-6 h-9 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Eye className="w-4 h-4 mr-2" /> Live Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 mt-0 h-full focus-visible:outline-none overflow-hidden">
              <div className="h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                <textarea 
                  className="w-full h-full p-8 bg-slate-950 text-slate-300 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  spellCheck="false"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 mt-0 h-full focus-visible:outline-none overflow-hidden">
              <div className="h-full bg-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex justify-center overflow-hidden">
                  <iframe 
                    title="Live Preview"
                    className="w-full h-full border-none"
                    srcDoc={formData.content}
                  />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
