import { supabase, db } from '../supabase';
import { Subscription, Plan, User, Transaction, Invoice } from '../../types';

export interface SubscriptionCreationRequest {
  userId: string;
  planId: string;
  paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
  requiresPayment: boolean;
  hasTrialPeriod: boolean;
  trialDays?: number;
}

export interface SubscriptionCreationResult {
  success: boolean;
  subscription?: Subscription;
  invoice?: Invoice;
  transaction?: Transaction;
  message: string;
  confirmationData?: {
    title: string;
    description: string;
    instructions?: string[];
    nextSteps?: string[];
  };
}

/**
 * Subscription Management System
 * 
 * Handles the complete subscription lifecycle including:
 * - Subscription creation with various payment methods
 * - Trial period management
 * - Status transitions and workflow management
 * - Invoice and transaction generation
 * - Payment processing coordination
 */
export class SubscriptionManager {
  /**
   * Create a new subscription with comprehensive workflow handling
   * 
   * @param request - Subscription creation parameters
   * @returns Promise with creation result and confirmation data
   */
  static async createSubscription(request: SubscriptionCreationRequest): Promise<SubscriptionCreationResult> {
    try {
      const { userId, planId, paymentMethod, requiresPayment, hasTrialPeriod, trialDays } = request;

      // Get plan details
      const plans = await db.getPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return {
          success: false,
          message: 'Plan not found'
        };
      }

      // Get user details
      const users = await db.getUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Determine subscription workflow
      const workflow = this.determineSubscriptionWorkflow(
        hasTrialPeriod,
        requiresPayment,
        paymentMethod,
        trialDays || plan.trialDays || 0
      );

      // Create subscription
      const subscription = await this.createSubscriptionRecord(
        userId,
        planId,
        workflow,
        paymentMethod
      );

      // Create invoices and transactions
      const { invoice, transaction } = await this.createBillingRecords(
        subscription,
        plan,
        workflow
      );

      // Generate confirmation data
      const confirmationData = this.generateConfirmationData(
        workflow,
        plan,
        subscription,
        paymentMethod
      );

      return {
        success: true,
        subscription,
        invoice,
        transaction,
        message: 'Subscription created successfully',
        confirmationData
      };
    } catch (error) {
      console.error('Subscription creation error:', error);
      return {
        success: false,
        message: 'Failed to create subscription. Please try again.'
      };
    }
  }

  /**
   * Determine the appropriate subscription workflow based on parameters
   */
  private static determineSubscriptionWorkflow(
    hasTrialPeriod: boolean,
    requiresPayment: boolean,
    paymentMethod: string,
    trialDays: number
  ) {
    if (hasTrialPeriod) {
      return {
        type: 'trial',
        initialStatus: 'TRIALING' as const,
        trialDays,
        requiresPayment,
        paymentMethod
      };
    }

    if (paymentMethod === 'CARD' && requiresPayment) {
      return {
        type: 'immediate_card',
        initialStatus: 'ACTIVE' as const,
        requiresPayment: true
      };
    }

    if (paymentMethod === 'BANK_TRANSFER') {
      return {
        type: 'manual_payment',
        initialStatus: 'PENDING_APPROVAL' as const,
        requiresPayment: true
      };
    }

    return {
      type: 'pending',
      initialStatus: 'PENDING_PAYMENT' as const,
      requiresPayment
    };
  }

  /**
   * Create subscription record in database
   */
  private static async createSubscriptionRecord(
    userId: string,
    planId: string,
    workflow: any,
    paymentMethod: string
  ): Promise<Subscription> {
    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    
    let trialEndDate: string | undefined;
    if (workflow.type === 'trial' && workflow.trialDays > 0) {
      trialEndDate = new Date(now.getTime() + workflow.trialDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planId,
      status: workflow.initialStatus,
      startDate,
      endDate,
      trialEndDate,
      autoRenewal: true,
      paymentMethod: paymentMethod as any,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    // In real implementation, save to database
    if (supabase) {
      // await supabase.from('subscriptions').insert(subscription);
    }

    return subscription;
  }

  /**
   * Create billing records (invoices and transactions)
   */
  private static async createBillingRecords(
    subscription: Subscription,
    plan: Plan,
    workflow: any
  ) {
    const now = new Date();

    // Create invoice
    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscriptionId: subscription.id,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      amount: workflow.type === 'trial' && !workflow.requiresPayment ? 0 : plan.price,
      currency: plan.currency,
      status: workflow.initialStatus === 'ACTIVE' ? 'PAID' : 'UNPAID',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      paidDate: workflow.initialStatus === 'ACTIVE' ? now.toISOString() : undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    // Create transaction
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscriptionId: subscription.id,
      amount: invoice.amount,
      currency: plan.currency,
      paymentMethod: subscription.paymentMethod,
      status: workflow.initialStatus === 'ACTIVE' ? 'COMPLETED' : 'PENDING',
      transactionDate: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    // In real implementation, save to database
    if (supabase) {
      // await supabase.from('invoices').insert(invoice);
      // await supabase.from('transactions').insert(transaction);
    }

    return { invoice, transaction };
  }

  /**
   * Generate confirmation data for UI display
   */
  private static generateConfirmationData(
    workflow: any,
    plan: Plan,
    subscription: Subscription,
    paymentMethod: string
  ) {
    const baseData = {
      planName: plan.name,
      amount: plan.price,
      currency: plan.currency,
      billingPeriod: plan.billingPeriod
    };

    switch (workflow.type) {
      case 'trial':
        return {
          title: 'Trial Subscription Started',
          description: `Your ${plan.name} trial is now active for ${workflow.trialDays} days.`,
          instructions: [
            `Trial period: ${workflow.trialDays} days`,
            `Full access to all ${plan.name} features`,
            workflow.requiresPayment 
              ? `Payment of $${plan.price} will be ${paymentMethod === 'CARD' ? 'automatically charged' : 'required'} at trial end`
              : 'Add payment method before trial expires'
          ],
          nextSteps: [
            'Explore all available features',
            'Set up your account preferences',
            paymentMethod === 'BANK_TRANSFER' 
              ? 'Complete bank transfer before trial ends'
              : 'Ensure payment method is valid'
          ]
        };

      case 'immediate_card':
        return {
          title: 'Subscription Confirmed',
          description: `Your ${plan.name} subscription is now active.`,
          instructions: [
            `Payment of $${plan.price} processed successfully`,
            'Full access to all features',
            'Auto-renewal enabled'
          ],
          nextSteps: [
            'Start using your subscription',
            'Check your email for receipt',
            'Explore premium features'
          ]
        };

      case 'manual_payment':
        return {
          title: 'Subscription Pending Payment',
          description: `Your ${plan.name} subscription is awaiting payment confirmation.`,
          instructions: [
            'Complete bank transfer payment',
            `Amount: $${plan.price} ${plan.currency}`,
            'Include subscription ID in transfer reference'
          ],
          nextSteps: [
            'Make the bank transfer payment',
            'Email payment confirmation',
            'Wait for admin approval'
          ]
        };

      default:
        return {
          title: 'Subscription Created',
          description: `Your ${plan.name} subscription has been created.`,
          instructions: [
            'Payment processing required',
            `Amount: $${plan.price} ${plan.currency}`
          ],
          nextSteps: [
            'Complete payment process',
            'Check email for instructions'
          ]
        };
    }
  }

  /**
   * Update subscription status with audit logging
   */
  static async updateSubscriptionStatus(
    subscriptionId: string,
    newStatus: Subscription['status'],
    reason?: string,
    changedBy?: string
  ): Promise<boolean> {
    try {
      if (!supabase) {
        console.log(`Mock: Subscription ${subscriptionId} status changed to ${newStatus}`);
        return true;
      }

      // In real implementation:
      // 1. Update subscription status
      // 2. Log status change in audit table
      // 3. Trigger any necessary notifications
      // 4. Update related records if needed

      return true;
    } catch (error) {
      console.error('Status update error:', error);
      return false;
    }
  }

  /**
   * Process subscription renewal
   */
  static async processRenewal(subscriptionId: string): Promise<boolean> {
    try {
      // Implementation for subscription renewal
      // 1. Check if renewal is due
      // 2. Process payment
      // 3. Extend subscription period
      // 4. Generate new invoice
      // 5. Update status accordingly

      return true;
    } catch (error) {
      console.error('Renewal processing error:', error);
      return false;
    }
  }

  /**
   * Cancel subscription with proper workflow
   */
  static async cancelSubscription(
    subscriptionId: string,
    reason?: string,
    effectiveDate?: Date
  ): Promise<boolean> {
    try {
      // Implementation for subscription cancellation
      // 1. Update subscription status
      // 2. Handle refunds if applicable
      // 3. Set effective cancellation date
      // 4. Send cancellation confirmation
      // 5. Log cancellation reason

      return true;
    } catch (error) {
      console.error('Cancellation error:', error);
      return false;
    }
  }
}