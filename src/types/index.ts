export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  features: Record<string, any>;
  isActive: boolean;
  trialDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'TRIALING' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PAST_DUE';
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  autoRenewal: boolean;
  paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
  createdAt: string;
  updatedAt: string;
  user?: User;
  plan?: Plan;
}

export interface Transaction {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailProvider {
  id: string;
  name: string;
  type: 'AUTHENTICATION' | 'TRANSACTIONAL' | 'MARKETING' | 'NOTIFICATIONS';
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: 'AUTHENTICATION' | 'ONBOARDING' | 'MARKETING' | 'TRANSACTIONAL' | 'SUPPORT' | 'SECURITY' | 'FEEDBACK' | 'REPORT' | 'INVITATION' | 'REMINDER' | 'ALERT' | 'COMPLIANCE' | 'EDUCATIONAL';
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  recipientCount: number;
  sentCount: number;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  template?: EmailTemplate;
}

export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyGrowth: number;
  pendingTransactions: number;
  expiredTrials: number;
}