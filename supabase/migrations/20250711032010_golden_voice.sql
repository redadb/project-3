/*
  # Complete SaaS Platform Schema

  1. New Tables
    - `users` - User accounts with role-based access
    - `plans` - Subscription plans with pricing and features
    - `subscriptions` - User subscriptions with complex status management
    - `transactions` - Payment transactions with multiple methods
    - `invoices` - Billing invoices with payment tracking
    - `email_providers` - SMTP provider configurations
    - `email_templates` - Dynamic email templates with variables
    - `email_campaigns` - Marketing campaigns with tracking
    - `subscription_status_log` - Audit trail for subscription changes
    - `auth_tokens` - Authentication tokens for magic links and verification

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for authenticated users
    - Admin-only access for sensitive operations
    - User-specific data access controls

  3. Features
    - Multi-status subscription workflow
    - Email authentication with magic links
    - Campaign management with template variables
    - Transaction and invoice tracking
    - Audit logging for subscription changes
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  billing_period text NOT NULL DEFAULT 'MONTHLY' CHECK (billing_period IN ('MONTHLY', 'YEARLY')),
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  trial_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'ACTIVE', 'TRIALING', 'INACTIVE', 'SUSPENDED', 'EXPIRED', 'PAST_DUE')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  trial_end_date timestamptz,
  auto_renewal boolean DEFAULT true,
  payment_method text NOT NULL DEFAULT 'CARD' CHECK (payment_method IN ('CARD', 'BANK_TRANSFER', 'CHEQUE', 'CASH')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_method text NOT NULL DEFAULT 'CARD' CHECK (payment_method IN ('CARD', 'BANK_TRANSFER', 'CHEQUE', 'CASH')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  transaction_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE', 'CANCELLED')),
  due_date timestamptz NOT NULL,
  paid_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email providers table
CREATE TABLE IF NOT EXISTS email_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('AUTHENTICATION', 'TRANSACTIONAL', 'MARKETING', 'NOTIFICATIONS')),
  smtp_host text NOT NULL,
  smtp_port integer NOT NULL DEFAULT 587,
  smtp_user text NOT NULL,
  smtp_password text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text NOT NULL,
  category text NOT NULL CHECK (category IN ('AUTHENTICATION', 'ONBOARDING', 'MARKETING', 'TRANSACTIONAL', 'SUPPORT', 'SECURITY', 'FEEDBACK', 'REPORT', 'INVITATION', 'REMINDER', 'ALERT', 'COMPLIANCE', 'EDUCATIONAL')),
  variables text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  template_id uuid REFERENCES email_templates(id) ON DELETE CASCADE,
  recipient_count integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription status log table
CREATE TABLE IF NOT EXISTS subscription_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  reason text,
  changed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Auth tokens table
CREATE TABLE IF NOT EXISTS auth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('VERIFICATION', 'MAGIC_LINK')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON users FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Plans policies
CREATE POLICY "Anyone can read active plans" ON plans FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON plans FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all subscriptions" ON subscriptions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Admins can manage subscriptions" ON subscriptions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Transactions policies
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM subscriptions WHERE id = subscription_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can read all transactions" ON transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Admins can manage transactions" ON transactions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Invoices policies
CREATE POLICY "Users can read own invoices" ON invoices FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM subscriptions WHERE id = subscription_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can read all invoices" ON invoices FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Email providers policies
CREATE POLICY "Admins can manage email providers" ON email_providers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Email templates policies
CREATE POLICY "Authenticated users can read active templates" ON email_templates FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage email templates" ON email_templates FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Email campaigns policies
CREATE POLICY "Admins can manage email campaigns" ON email_campaigns FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Subscription status log policies
CREATE POLICY "Users can read own subscription logs" ON subscription_status_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM subscriptions WHERE id = subscription_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can read all subscription logs" ON subscription_status_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Admins can create subscription logs" ON subscription_status_log FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Auth tokens policies
CREATE POLICY "Users can read own tokens" ON auth_tokens FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can manage tokens" ON auth_tokens FOR ALL TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);

-- Insert sample data
INSERT INTO users (id, email, name, role, is_active, is_verified) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin User', 'ADMIN', true, true),
  ('00000000-0000-0000-0000-000000000002', 'user1@example.com', 'John Doe', 'USER', true, true),
  ('00000000-0000-0000-0000-000000000003', 'user2@example.com', 'Jane Smith', 'USER', true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO plans (id, name, description, price, billing_period, features, is_active, trial_days) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Basic Plan', 'Perfect for small businesses', 29.99, 'MONTHLY', '{"users": 5, "storage": "10GB", "support": "email"}', true, 7),
  ('00000000-0000-0000-0000-000000000002', 'Pro Plan', 'For growing companies', 99.99, 'MONTHLY', '{"users": 25, "storage": "100GB", "support": "priority"}', true, 14),
  ('00000000-0000-0000-0000-000000000003', 'Enterprise Plan', 'For large organizations', 299.99, 'MONTHLY', '{"users": "unlimited", "storage": "1TB", "support": "dedicated"}', true, 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscriptions (id, user_id, plan_id, status, start_date, end_date, trial_end_date, payment_method) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ACTIVE', now() - interval '30 days', now() + interval '30 days', null, 'CARD'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'TRIALING', now() - interval '7 days', now() + interval '23 days', now() + interval '7 days', 'BANK_TRANSFER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO transactions (subscription_id, amount, currency, payment_method, status, transaction_date) VALUES
  ('00000000-0000-0000-0000-000000000001', 29.99, 'USD', 'CARD', 'COMPLETED', now() - interval '30 days'),
  ('00000000-0000-0000-0000-000000000002', 99.99, 'USD', 'BANK_TRANSFER', 'PENDING', now() - interval '7 days');

INSERT INTO invoices (subscription_id, invoice_number, amount, currency, status, due_date, paid_date) VALUES
  ('00000000-0000-0000-0000-000000000001', 'INV-2024-001', 29.99, 'USD', 'PAID', now() - interval '30 days', now() - interval '28 days'),
  ('00000000-0000-0000-0000-000000000002', 'INV-2024-002', 99.99, 'USD', 'UNPAID', now() + interval '7 days', null);

INSERT INTO email_templates (id, name, subject, html_content, text_content, category, variables, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Welcome Email', 'Welcome to {{companyName}}!', '<h1>Welcome {{userName}}!</h1><p>Thanks for joining {{companyName}}.</p>', 'Welcome {{userName}}! Thanks for joining {{companyName}}.', 'ONBOARDING', ARRAY['userName', 'companyName'], true),
  ('00000000-0000-0000-0000-000000000002', 'Magic Link', 'Your login link for {{companyName}}', '<p>Click here to login: {{magicLink}}</p>', 'Click here to login: {{magicLink}}', 'AUTHENTICATION', ARRAY['magicLink', 'companyName'], true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO email_campaigns (id, name, subject, template_id, recipient_count, sent_count, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Monthly Newsletter', 'Your Monthly Update', '00000000-0000-0000-0000-000000000001', 150, 150, 'SENT'),
  ('00000000-0000-0000-0000-000000000002', 'Product Launch', 'New Feature Announcement', '00000000-0000-0000-0000-000000000002', 0, 0, 'DRAFT')
ON CONFLICT (id) DO NOTHING;