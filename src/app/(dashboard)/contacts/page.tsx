'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  UserPlus, 
  Upload, 
  Filter,
  RefreshCw,
  Trash2,
  Users as UsersIcon,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import apiClient from '@/services/api-client';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', firstName: '', lastName: '' });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = useCallback(async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/contacts?page=${page}&limit=${pagination.limit}&search=${search}`);
      setContacts(response.data.data);
      setPagination(response.data.meta);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  // Handle Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    fetchContacts(1, debouncedQuery);
  }, [debouncedQuery, fetchContacts]);

  const handleAddContact = async () => {
    if (!newContact.email) return;
    setIsAdding(true);
    try {
      await apiClient.post('/contacts', newContact);
      toast.success('Contact added successfully');
      setNewContact({ email: '', firstName: '', lastName: '' });
      setIsDialogOpen(false);
      fetchContacts(1, debouncedQuery);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add contact');
    } finally {
      setIsAdding(false);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsImporting(true);
    try {
      const response = await apiClient.post('/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message || 'Contacts imported successfully');
      fetchContacts(1, debouncedQuery);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import contacts');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiClient.delete(`/contacts/${id}`);
      toast.success('Contact deleted');
      fetchContacts(pagination.page, debouncedQuery);
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contacts</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your subscribers and audience lists</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportCSV}
          />
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-slate-200"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isImporting ? 'Importing...' : 'Import CSV/Excel'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100">
                <UserPlus className="w-4 h-4" /> Add Contact
                </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Enter the details for the new contact.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="e.g. John"
                      value={newContact.firstName}
                      onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="e.g. Doe"
                      value={newContact.lastName}
                      onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email Address</Label>
                  <Input 
                    id="contactEmail" 
                    type="email" 
                    placeholder="e.g. hello@example.com"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddContact} 
                  disabled={isAdding || !newContact.email}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isAdding ? 'Adding...' : 'Add Contact'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 border-slate-100 focus:ring-blue-500 bg-slate-50/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isLoading && searchQuery !== '' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-none">
              <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest pl-6">Contact Details</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Added At</TableHead>
              <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                  <p className="font-medium">Searching subscribers...</p>
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-slate-500">
                  <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="font-bold text-xl text-slate-900 dark:text-white">No contacts found</p>
                  <p className="text-sm max-w-xs mx-auto mt-1">Try adjusting your search query or add a new contact to your list.</p>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-slate-50 dark:border-slate-800">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-100 dark:border-blue-800">
                        {contact.firstName?.[0] || contact.email[0].toUpperCase()}
                        {contact.lastName?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {contact.firstName ? `${contact.firstName} ${contact.lastName || ''}` : contact.email}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{contact.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      contact.isBlacklisted 
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-none px-3 py-1" 
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none px-3 py-1"
                    }>
                      {contact.isBlacklisted ? 'Blacklisted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-bold">
                    {new Date(contact.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteContact(contact._id)}
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination UI */}
        {!isLoading && contacts.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900 dark:text-white">{Math.min(pagination.total, (pagination.page - 1) * pagination.limit + 1)} - {Math.min(pagination.page * pagination.limit, pagination.total)}</span> of {pagination.total}
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchContacts(pagination.page - 1, debouncedQuery)}
                    disabled={pagination.page === 1}
                    className="h-8 text-xs border-slate-200"
                >
                    <ChevronLeft className="w-3 h-3 mr-1" /> Prev
                </Button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.pages, 3) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                            <Button 
                                key={pageNum}
                                variant={pagination.page === pageNum ? "default" : "outline"}
                                size="sm"
                                className={cn("w-8 h-8 p-0 text-xs", pagination.page === pageNum ? "bg-blue-600" : "border-slate-200")}
                                onClick={() => fetchContacts(pageNum, debouncedQuery)}
                            >
                                {pageNum}
                            </Button>
                        )
                    })}
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchContacts(pagination.page + 1, debouncedQuery)}
                    disabled={pagination.page === pagination.pages}
                    className="h-8 text-xs border-slate-200"
                >
                    Next <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
