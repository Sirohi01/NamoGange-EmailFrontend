'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Mail, 
  Users, 
  Layout, 
  Send,
  Loader2,
  RefreshCw,
  FileText,
  Eye,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/services/api-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const steps = [
  { id: 'setup', title: 'Setup', icon: Mail },
  { id: 'content', title: 'Content', icon: Layout },
  { id: 'audience', title: 'Audience', icon: Users },
  { id: 'review', title: 'Review', icon: Send },
];

interface CampaignFormData {
  name: string;
  subject: string;
  senderEmailId: string;
  content: string;
  templateId: string;
  listIds: string[];
}

export default function CampaignWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [senders, setSenders] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  
  const [templatePage, setTemplatePage] = useState(1);
  const [totalTemplatePages, setTotalTemplatePages] = useState(1);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    subject: '',
    senderEmailId: '',
    content: '<h1>Hello!</h1><p>Start your campaign here.</p>',
    templateId: '',
    listIds: []
  });

  const fetchTemplates = async (page: number) => {
    setIsTemplatesLoading(true);
    try {
      const res = await apiClient.get(`/templates?page=${page}&limit=6`);
      setTemplates(res.data.data);
      setTotalTemplatePages(res.data.pagination.pages);
    } catch (error) {
      console.error('Failed to load templates');
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch Senders
        const sendersRes = await apiClient.get('/sender-emails');
        setSenders(sendersRes.data.data || []);

        // Fetch Contacts Count
        const contactsRes = await apiClient.get('/contacts');
        setContactsCount(contactsRes.data.data?.length || 0);

        // Fetch Templates
        await fetchTemplates(1);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Some data failed to load. Please check your connection.');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentStep === 1) {
        fetchTemplates(templatePage);
    }
  }, [templatePage, currentStep]);

  const handleSelectTemplate = (template: any) => {
    setFormData({ 
        ...formData, 
        templateId: template._id as string,
        content: template.content as string
    });
    toast.success(`${template.name} selected`);
  };

  const nextStep = () => {
    if (currentStep === 0 && (!formData.name || !formData.subject || !formData.senderEmailId)) {
      toast.error('Please fill all setup fields');
      return;
    }
    if (currentStep === 1 && !formData.content) {
        toast.error('Please provide email content');
        return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/campaigns', formData);
      if (response.data.success) {
        toast.success('Campaign launched successfully!');
        router.push('/campaigns');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to launch campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Preparing Campaign Wizard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-16 px-8 relative">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 shadow-sm",
                index <= currentStep 
                  ? "bg-blue-600 border-blue-600 text-white shadow-blue-200 scale-110" 
                  : "bg-white border-slate-200 text-slate-400 dark:bg-slate-900"
              )}>
                {index < currentStep ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
              </div>
              <span className={cn(
                "absolute -bottom-8 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors",
                index <= currentStep ? "text-blue-600" : "text-slate-400"
              )}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-[3px] mx-2 rounded-full",
                index < currentStep ? "bg-blue-600" : "bg-slate-100 dark:bg-slate-800"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-950 rounded-3xl">
        <CardContent className="p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Campaign Setup</h2>
                    <p className="text-slate-500">Configure your sender details and subject line.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-bold">Campaign Name</Label>
                      <Input 
                        id="name"
                        placeholder="Internal reference name" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 border-slate-200 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-slate-700 dark:text-slate-300 font-bold">Email Subject</Label>
                      <Input 
                        id="subject"
                        placeholder="What will users see in their inbox?" 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="h-12 border-slate-200 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-700 dark:text-slate-300 font-bold">Sender Identity</Label>
                      <Select 
                        onValueChange={(val: string | null) => setFormData({ ...formData, senderEmailId: val || '' })}
                        value={formData.senderEmailId}
                      >
                        <SelectTrigger className="h-12 border-slate-200">
                          <SelectValue placeholder="Select a verified sender address" />
                        </SelectTrigger>
                        <SelectContent>
                          {senders.length > 0 ? senders.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{s.name} <span className="text-slate-400">({s.email})</span></span>
                                {!s.isVerified && <Badge variant="outline" className="text-[8px] border-amber-200 text-amber-600">Pending</Badge>}
                              </div>
                            </SelectItem>
                          )) : (
                            <SelectItem value="none" disabled>No senders found. Please add one first.</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Design Content</h2>
                      <p className="text-slate-500">Pick a starting point or design from scratch.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            disabled={templatePage === 1}
                            onClick={() => setTemplatePage(p => p - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-bold px-2">{templatePage} / {totalTemplatePages}</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            disabled={templatePage === totalTemplatePages}
                            onClick={() => setTemplatePage(p => p + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <Label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest">Select Template</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {templates.map((template) => (
                                <div 
                                    key={template._id}
                                    className={cn(
                                        "group relative p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                        formData.templateId === template._id 
                                            ? "border-blue-600 bg-blue-50/50 shadow-md" 
                                            : "border-slate-100 dark:border-slate-800 hover:border-blue-300"
                                    )}
                                    onClick={() => handleSelectTemplate(template)}
                                >
                                    <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                                        <FileText className="w-8 h-8 text-slate-300" />
                                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Button 
                                            size="icon" 
                                            variant="secondary" 
                                            className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                            onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <span className="text-[10px] font-bold block truncate text-center">{template.name}</span>
                                    {formData.templateId === template._id && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <Label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest">Live Editor (HTML)</Label>
                        <textarea 
                            className="w-full h-[380px] p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-inner"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value, templateId: '' })}
                        />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Select Audience</h2>
                    <p className="text-slate-500">Target specific lists or send to everyone.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        className={cn(
                            "flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all",
                            formData.listIds.length === 0 
                                ? "border-blue-600 bg-blue-50/50" 
                                : "border-slate-100 dark:border-slate-800 hover:border-blue-200"
                        )}
                        onClick={() => setFormData({ ...formData, listIds: [] })}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <span className="font-bold block">All Verified Contacts</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">{contactsCount} recipients</span>
                        </div>
                      </div>
                      {formData.listIds.length === 0 && <Check className="w-5 h-5 text-blue-600" />}
                    </div>

                    <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                        <Plus className="w-4 h-4 mr-2" /> Custom Lists coming soon
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Final Review</h2>
                    <p className="text-slate-500">Ready to blast? Double check everything.</p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign</Label>
                                <p className="font-bold text-xl">{formData.name}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sender</Label>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {senders.find(s => s._id === formData.senderEmailId)?.name || 'Not selected'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject Line</Label>
                            <p className="font-bold text-2xl text-blue-600">{formData.subject}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Check className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="font-bold text-sm">Everything looks good!</span>
                        </div>
                        <Badge className="bg-blue-600 text-white border-none px-6 py-2 rounded-full font-bold">READY</Badge>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={currentStep === 0 || isSubmitting}
              className="h-12 px-8 font-bold text-slate-500 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={handleLaunch} 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 h-14 px-12 text-lg rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none font-bold transition-all hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</>
                ) : (
                    <><Send className="w-5 h-5 mr-2" /> Blast Campaign</>
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep} 
                className="bg-blue-600 hover:bg-blue-700 h-12 px-10 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none transition-all hover:translate-x-1"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
            <DialogContent className="max-w-3xl h-[80vh] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                <div className="flex flex-col h-full bg-white dark:bg-slate-950">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="font-bold text-xl">{previewTemplate.name}</h2>
                        <Button variant="ghost" size="icon" onClick={() => setPreviewTemplate(null)} className="rounded-full">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-hidden">
                        <div className="w-full h-full bg-white shadow-xl rounded-2xl overflow-hidden">
                            <iframe 
                                title="Wizard Template Preview"
                                className="w-full h-full border-none"
                                srcDoc={previewTemplate.content}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
