'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Users, 
  BarChart3, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Send
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-bold tracking-tight">MailFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Sign in</Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-6">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
                Now in Public Beta
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                Scale your marketing with <br />
                <span className="text-blue-600">precision and speed</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                The all-in-one platform for professional email campaigns, 
                advanced audience segmentation, and real-time analytics.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 py-6 text-lg h-auto group">
                    Start Sending for Free
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg h-auto border-slate-200 dark:border-slate-800">
                  Book a Demo
                </Button>
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-20 relative"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-w-5xl mx-auto">
                <div className="h-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="h-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
                      <div className="text-sm text-slate-500 mb-1">Subscribers</div>
                      <div className="text-2xl font-bold">12,482</div>
                    </div>
                    <div className="h-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
                      <div className="text-sm text-slate-500 mb-1">Emails Sent</div>
                      <div className="text-2xl font-bold">45.2k</div>
                    </div>
                    <div className="h-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
                      <div className="text-sm text-slate-500 mb-1">Open Rate</div>
                      <div className="text-2xl font-bold">24.8%</div>
                    </div>
                  </div>
                  <div className="h-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
                </div>
              </div>
              
              {/* Decorative Gradients */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[120px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full" />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Powerful tools designed to simplify your marketing workflow while 
                delivering professional results at scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Mail,
                  title: "Campaign Builder",
                  desc: "Create beautiful, responsive emails in minutes with our intuitive wizard.",
                  color: "text-blue-600 bg-blue-50 dark:bg-blue-950"
                },
                {
                  icon: Users,
                  title: "Audience Management",
                  desc: "Segment your lists with precision to send the right message to the right person.",
                  color: "text-purple-600 bg-purple-50 dark:bg-purple-950"
                },
                {
                  icon: BarChart3,
                  title: "Deep Analytics",
                  desc: "Track every open, click, and conversion with our real-time analytics engine.",
                  color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                },
                {
                  icon: Zap,
                  title: "Fast Delivery",
                  desc: "Our optimized sending engine ensures your emails arrive instantly.",
                  color: "text-amber-600 bg-amber-50 dark:bg-amber-950"
                },
                {
                  icon: CheckCircle2,
                  title: "Verified Senders",
                  desc: "Easily manage and verify your sender identities for maximum deliverability.",
                  color: "text-rose-600 bg-rose-50 dark:bg-rose-950"
                },
                {
                  icon: Send,
                  title: "Batch Sending",
                  desc: "Intelligent batching logic to handle millions of emails without breaking a sweat.",
                  color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <span className="font-bold text-slate-900 dark:text-white">MailFlow</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
          <p>© 2024 MailFlow SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
