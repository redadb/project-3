import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use mock data when Supabase is not configured or has placeholder values
const isSupabaseConfigured = supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'your-supabase-url' && 
  supabaseKey !== 'your-supabase-anon-key' &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseKey !== 'your-anon-key-here';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Authentication helpers
export const auth = {
  signIn: async (email: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.signInWithOtp({ email });
  },
  signOut: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.signOut();
  },
  getCurrentUser: async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  }
};

// Mock data for development
const mockUsers = [
  { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'ADMIN', isActive: true, isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', email: 'user1@example.com', name: 'John Doe', role: 'USER', isActive: true, isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', email: 'user2@example.com', name: 'Jane Smith', role: 'USER', isActive: true, isVerified: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const mockPlans = [
  { id: '1', name: 'Basic Plan', description: 'Perfect for small businesses', price: 29.99, currency: 'USD', billingPeriod: 'MONTHLY', features: { users: 5, storage: '10GB', support: 'email' }, isActive: true, trialDays: 7, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Pro Plan', description: 'For growing companies', price: 99.99, currency: 'USD', billingPeriod: 'MONTHLY', features: { users: 25, storage: '100GB', support: 'priority' }, isActive: true, trialDays: 14, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Enterprise Plan', description: 'For large organizations', price: 299.99, currency: 'USD', billingPeriod: 'MONTHLY', features: { users: 'unlimited', storage: '1TB', support: 'dedicated' }, isActive: true, trialDays: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const mockSubscriptions = [
  { id: '1', userId: '2', planId: '1', status: 'ACTIVE', startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), autoRenewal: true, paymentMethod: 'CARD', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: mockUsers[1], plan: mockPlans[0] },
  { id: '2', userId: '3', planId: '2', status: 'TRIALING', startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), autoRenewal: true, paymentMethod: 'BANK_TRANSFER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: mockUsers[2], plan: mockPlans[1] }
];

const mockTransactions = [
  { id: '1', subscriptionId: '1', amount: 29.99, currency: 'USD', paymentMethod: 'CARD', status: 'COMPLETED', transactionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', subscriptionId: '2', amount: 99.99, currency: 'USD', paymentMethod: 'BANK_TRANSFER', status: 'PENDING', transactionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const mockEmailTemplates = [
  { id: '1', name: 'Welcome Email', subject: 'Welcome to {{companyName}}!', htmlContent: '<h1>Welcome {{userName}}!</h1><p>Thanks for joining {{companyName}}.</p>', textContent: 'Welcome {{userName}}! Thanks for joining {{companyName}}.', category: 'ONBOARDING', variables: ['userName', 'companyName'], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Magic Link', subject: 'Your login link for {{companyName}}', htmlContent: '<p>Click here to login: {{magicLink}}</p>', textContent: 'Click here to login: {{magicLink}}', category: 'AUTHENTICATION', variables: ['magicLink', 'companyName'], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const mockEmailCampaigns = [
  { id: '1', name: 'Monthly Newsletter', subject: 'Your Monthly Update', templateId: '1', recipientCount: 150, sentCount: 150, status: 'SENT', sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), template: mockEmailTemplates[0] },
  { id: '2', name: 'Product Launch', subject: 'New Feature Announcement', templateId: '2', recipientCount: 0, sentCount: 0, status: 'DRAFT', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), template: mockEmailTemplates[1] }
];

// Database helpers
export const db = {
  // Users
  getUsers: async () => {
    if (!supabase) return mockUsers;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Plans
  getPlans: async () => {
    if (!supabase) return mockPlans;
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Subscriptions
  getSubscriptions: async () => {
    if (!supabase) return mockSubscriptions;
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        user:users(*),
        plan:plans(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Transactions
  getTransactions: async () => {
    if (!supabase) return mockTransactions;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Email Templates
  getEmailTemplates: async () => {
    if (!supabase) return mockEmailTemplates;
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Email Campaigns
  getEmailCampaigns: async () => {
    if (!supabase) return mockEmailCampaigns;
    const { data, error } = await supabase
      .from('email_campaigns')
      .select(`
        *,
        template:email_templates(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    if (!supabase) {
      return {
        totalUsers: mockUsers.length,
        activeSubscriptions: mockSubscriptions.filter(s => s.status === 'ACTIVE').length,
        totalRevenue: mockTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        monthlyGrowth: 12.5,
        pendingTransactions: mockTransactions.filter(t => t.status === 'PENDING').length,
        expiredTrials: 3
      };
    }

    const [users, subscriptions, transactions] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('subscriptions').select('*'),
      supabase.from('transactions').select('*')
    ]);

    const activeSubscriptions = subscriptions.data?.filter(s => s.status === 'ACTIVE') || [];
    const totalRevenue = transactions.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const pendingTransactions = transactions.data?.filter(t => t.status === 'PENDING') || [];

    return {
      totalUsers: users.data?.length || 0,
      activeSubscriptions: activeSubscriptions.length,
      totalRevenue,
      monthlyGrowth: 12.5, // Mock data
      pendingTransactions: pendingTransactions.length,
      expiredTrials: 3 // Mock data
    };
  }
};