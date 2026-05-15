'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Users as UsersIcon,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
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
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', firstName: '', lastName: '' });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = async (page = 1, search = '') => {
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
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchContacts(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddContact = async () => {
    if (!newContact.email) return;
    setIsAdding(true);
    try {
      await apiClient.post('/contacts', newContact);
      toast.success('Contact added successfully');
      setNewContact({ email: '', firstName: '', lastName: '' });
      setIsDialogOpen(false);
      fetchContacts(pagination.page, searchQuery);
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
      fetchContacts(1, searchQuery);
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
      fetchContacts(pagination.page, searchQuery);
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
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isImporting ? 'Importing...' : 'Import CSV/Excel'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
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
                      value={newContact.firstName}
                      onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
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
                  className="bg-blue-600 hover:bg-blue-700"
                >
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
                placeholder="Search contacts..." 
                className="pl-10 border-slate-200 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Added At</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading contacts...
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                  <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-lg">No contacts found</p>
                  <p className="text-sm">Start building your audience by adding contacts.</p>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {contact.firstName?.[0] || contact.email[0].toUpperCase()}
                        {contact.lastName?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {contact.firstName ? `${contact.firstName} ${contact.lastName || ''}` : contact.email}
                        </span>
                        <span className="text-xs text-slate-500">{contact.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      contact.isBlacklisted 
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" 
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }>
                      {contact.isBlacklisted ? 'Blacklisted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteContact(contact._id)}
                      className="text-slate-400 hover:text-rose-600"
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
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-sm text-slate-500">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> contacts
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchContacts(pagination.page - 1, searchQuery)}
                    disabled={pagination.page === 1}
                >
                    <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                        const pageNum = i + 1; // Simplification for now
                        return (
                            <Button 
                                key={pageNum}
                                variant={pagination.page === pageNum ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => fetchContacts(pageNum, searchQuery)}
                            >
                                {pageNum}
                            </Button>
                        )
                    })}
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchContacts(pagination.page + 1, searchQuery)}
                    disabled={pagination.page === pagination.pages}
                >
                    Next <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
