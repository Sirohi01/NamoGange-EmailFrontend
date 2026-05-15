'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Shield, Building, Loader2, RefreshCw, Globe, MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toast } from 'sonner';
import { updateProfile, updatePassword, setCredentials } from '@/redux/slices/authSlice';
import apiClient from '@/services/api-client';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);
  
  const [profileData, setProfileData] = useState({ name: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [companyData, setCompanyData] = useState({ name: '', website: '', address: '' });

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [userRes, companyRes] = await Promise.all([
        apiClient.get('/auth/me'),
        apiClient.get('/company/me')
      ]);
      
      if (userRes.data.success) {
        dispatch(setCredentials({ user: userRes.data.data, token: localStorage.getItem('token') || '' }));
        setProfileData({ name: userRes.data.data.name || '' });
      }
      
      if (companyRes.data.success && companyRes.data.data) {
        setCompanyData({ 
          name: companyRes.data.data.name || '', 
          website: companyRes.data.data.website || '',
          address: companyRes.data.data.address || ''
        });
      }
    } catch (error) {
      console.error('Fetch Settings Error:', error);
      toast.error('Failed to load settings data');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving profile...', profileData);
    setIsUpdatingProfile(true);
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving password...');
    if (passwordData.newPassword !== passwordData.confirm) {
        return toast.error('Passwords do not match');
    }
    setIsUpdatingPassword(true);
    try {
      await dispatch(updatePassword({ 
        currentPassword: passwordData.currentPassword, 
        newPassword: passwordData.newPassword 
      })).unwrap();
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error: any) {
      toast.error(error || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving company...', companyData);
    setIsUpdatingCompany(true);
    try {
      await apiClient.put('/company/update', companyData);
      toast.success('Company details updated successfully');
    } catch (error: any) {
      console.error('Update Company Error:', error);
      toast.error('Failed to update company details');
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account and platform preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" /> Company
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({ name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={user?.email} disabled className="bg-slate-50" />
                  <p className="text-xs text-slate-500 italic">Email cannot be changed once verified.</p>
                </div>
                <Button type="submit" disabled={isUpdatingProfile} className="bg-blue-600 hover:bg-blue-700">
                  {isUpdatingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Keep your account secure by updating your password regularly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input 
                    id="current" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input 
                    id="new" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input 
                    id="confirm" 
                    type="password" 
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={isUpdatingPassword} className="bg-blue-600 hover:bg-blue-700">
                  {isUpdatingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Update your organization's official information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCompany} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Organization Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        id="companyName" 
                        className="pl-10"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                        required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        id="website" 
                        className="pl-10"
                        placeholder="https://yourcompany.com"
                        value={companyData.website}
                        onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Office Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea 
                        id="address" 
                        className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        placeholder="Enter your full office address"
                        value={companyData.address}
                        onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isUpdatingCompany} className="bg-blue-600 hover:bg-blue-700">
                  {isUpdatingCompany ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Company Details'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
