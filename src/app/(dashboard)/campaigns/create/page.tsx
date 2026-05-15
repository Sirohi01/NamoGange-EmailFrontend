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
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/services/api-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  listId: string;
}

export default function CampaignWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data from backend
  const [senders, setSenders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Template Pagination
  const [templatePage, setTemplatePage] = useState(1);
  const [totalTemplatePages, setTotalTemplatePages] = useState(1);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    subject: '',
    senderEmailId: '',
    content: '<h1>Hello!</h1><p>This is your email content.</p>',
    templateId: '',
    listId: 'all'
  });

  const fetchTemplates = async (page: number) => {
    setIsTemplatesLoading(true);
    try {
      const res = await apiClient.get(`/templates?page=${page}&limit=6`);
      setTemplates(res.data.data);
      setTotalTemplatePages(res.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sendersRes, contactsRes] = await Promise.all([
          apiClient.get('/sender-emails'),
          apiClient.get('/contacts')
        ]);
        setSenders(sendersRes.data.data.filter((s: any) => s.isVerified));
        setContacts(contactsRes.data.data);
        await fetchTemplates(1);
      } catch (error) {
        toast.error('Failed to load required data');
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
    toast.success(`${template.name} template selected`);
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
    // Cleanup listId if it's "all" to avoid Mongoose casting error
    const finalData = { ...formData };
    if (finalData.listId === 'all') {
        delete (finalData as any).listId;
    }

    try {
      const response = await apiClient.post('/campaigns', finalData);
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
        <p className="text-slate-500 font-medium">Preparing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-12 px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative z-10">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors border-2",
                index <= currentStep 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "bg-white border-slate-200 text-slate-400 dark:bg-slate-900"
              )}>
                {index < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={cn(
                "absolute -bottom-7 text-xs font-medium whitespace-nowrap",
                index <= currentStep ? "text-blue-600" : "text-slate-400"
              )}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-[2px] mx-4",
                index < currentStep ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card className="border-none shadow-xl overflow-hidden bg-white dark:bg-slate-950">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Campaign Setup</h2>
                    <p className="text-slate-500 text-sm">Define the core details of your campaign.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Campaign Name</Label>
                      <Input 
                        id="name"
                        placeholder="e.g. Summer Sale 2024" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input 
                        id="subject"
                        placeholder="What your subscribers will see" 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sender Identity</Label>
                      <Select 
                        onValueChange={(val: string | null) => setFormData({ ...formData, senderEmailId: val || '' })}
                        value={formData.senderEmailId || ''}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a verified sender" />
                        </SelectTrigger>
                        <SelectContent>
                          {senders.map((s) => (
                            <SelectItem key={s._id} value={s._id || ''}>
                              {s.name} ({s.email})
                            </SelectItem>
                          ))}
                          {senders.length === 0 && (
                            <SelectItem value="none" disabled>No verified senders found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Design Content</h2>
                    <p className="text-slate-500 text-sm">Select a template or edit manually.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-blue-600 font-bold">Pick a Template</Label>
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    disabled={templatePage === 1 || isTemplatesLoading}
                                    onClick={() => setTemplatePage(prev => prev - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-xs font-medium px-2">{templatePage} / {totalTemplatePages}</span>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    disabled={templatePage === totalTemplatePages || isTemplatesLoading}
                                    onClick={() => setTemplatePage(prev => prev + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 min-h-[200px] content-start">
                            {isTemplatesLoading ? (
                                <div className="col-span-2 flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            ) : templates.map((template, index) => (
                                <div 
                                    key={template._id || `template-${index}`}
                                    onClick={() => handleSelectTemplate(template)}
                                    className={cn(
                                        "p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-blue-500 flex flex-col items-center justify-center gap-2",
                                        (formData.templateId && template._id && String(formData.templateId) === String(template._id)) ? "border-blue-600 bg-blue-50/50" : "border-slate-100"
                                    )}
                                >
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <span className="text-[10px] font-medium text-center truncate w-full">{template.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label>HTML Content</Label>
                        <textarea 
                            className="w-full h-[280px] p-4 rounded-lg border border-slate-200 dark:bg-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value, templateId: '' })}
                        />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Select Audience</h2>
                    <p className="text-slate-500 text-sm">Choose who should receive this campaign.</p>
                  </div>
                  <div className="space-y-3">
                    <div 
                        className={cn(
                            "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                            formData.listId === 'all' 
                                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20" 
                                : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                        )}
                        onClick={() => setFormData({ ...formData, listId: 'all' })}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <span className="font-bold block">All Verified Contacts</span>
                            <span className="text-xs text-slate-500">{contacts.length} recipients available</span>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        formData.listId === 'all' ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                      )}>
                        {formData.listId === 'all' && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-1">Review & Launch</h2>
                    <p className="text-slate-500 text-sm">Double check everything before sending.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl space-y-6 border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Campaign Name</span>
                            <p className="font-bold text-slate-900 dark:text-white">{formData.name}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Sender Identity</span>
                            <p className="font-bold text-slate-900 dark:text-white">
                                {senders.find(s => s._id === formData.senderEmailId)?.name || 'Not selected'}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email Subject</span>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{formData.subject}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{contacts.length} Recipients</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 border-none px-4 py-1">Ready to Blast</Badge>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={currentStep === 0 || isSubmitting}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={handleLaunch} 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-8 py-6 h-auto text-lg rounded-xl shadow-lg shadow-blue-200 dark:shadow-none font-bold"
              >
                {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Launching...</>
                ) : (
                    <><Send className="w-5 h-5" /> Launch Campaign</>
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep} 
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 font-semibold"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
