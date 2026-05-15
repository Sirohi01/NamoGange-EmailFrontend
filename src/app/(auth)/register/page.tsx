'use client';

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms/FormField';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { registerUser } from '@/redux/slices/authSlice';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(2, 'Company name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await dispatch(registerUser(data)).unwrap();
      if (result.success) {
        toast.success('Account created! Welcome.');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error || 'Registration failed');
    }
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Join MailFlow today and start scaling your marketing</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                name="name"
                label="Full Name"
                placeholder="John Doe"
                error={methods.formState.errors.name?.message}
              />
              <FormField
                name="email"
                label="Email"
                placeholder="john@company.com"
                error={methods.formState.errors.email?.message}
              />
            </div>
            <FormField
              name="companyName"
              label="Company Name"
              placeholder="Acme Corp"
              error={methods.formState.errors.companyName?.message}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                error={methods.formState.errors.password?.message}
              />
              <FormField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={methods.formState.errors.confirmPassword?.message}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? 'Creating account...' : 'Get Started'}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
