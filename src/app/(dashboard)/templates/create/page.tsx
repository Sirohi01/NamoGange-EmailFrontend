'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Code, 
  Layout, 
  Loader2,
  Tag,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/services/api-client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateTemplatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #2563eb;">Welcome to MailFlow!</h1>
    </div>
    <p>Hello there,</p>
    <p>Thank you for joining us. We're excited to have you on board!</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" class="btn">Get Started Now</a>
    </div>
    <p>Cheers,<br>The Team</p>
  </div>
</body>
</html>`,
    category: 'Marketing'
  });

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Please enter a template name');
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.post('/templates', formData);
      toast.success('Template saved successfully!');
      router.push('/templates');
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-6 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-8 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Design Studio</h1>
            <p className="text-xs text-slate-500">Create a high-impact email template</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-200 dark:shadow-none font-bold"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Controls */}
        <div className="w-80 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 p-6 space-y-8 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Template Details</Label>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Internal Name</Label>
                  <Input 
                    id="name"
                    placeholder="e.g. Summer Welcome"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-900 border-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Default Subject Line</Label>
                  <Input 
                    id="subject"
                    placeholder="Subject your users will see"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-900 border-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label className="text-xs font-bold uppercase text-slate-400">Organization</Label>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val: string | null) => setFormData({...formData, category: val || 'Marketing'})}
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marketing">
                      <div className="flex items-center gap-2"><Tag className="w-3 h-3" /> Marketing</div>
                    </SelectItem>
                    <SelectItem value="Welcome">
                      <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> Welcome</div>
                    </SelectItem>
                    <SelectItem value="Transactional">
                      <div className="flex items-center gap-2"><Layout className="w-3 h-3" /> Transactional</div>
                    </SelectItem>
                    <SelectItem value="Newsletter">
                      <div className="flex items-center gap-2"><Code className="w-3 h-3" /> Newsletter</div>
                    </SelectItem>
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
