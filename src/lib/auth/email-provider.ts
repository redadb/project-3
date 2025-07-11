import { supabase } from '../supabase';

export interface EmailAuthRequest {
  email: string;
  isNewUser?: boolean;
  isUnverified?: boolean;
  userRole?: 'ADMIN' | 'USER';
}

export interface EmailAuthResponse {
  success: boolean;
  message: string;
  templateUsed: string;
  redirectUrl?: string;
}

/**
 * Email Authentication Provider
 * 
 * Handles email-based authentication requests with dynamic template selection
 * based on user status and role. Supports new user registration, email verification,
 * and magic link authentication.
 */
export class EmailAuthProvider {
  /**
   * Process authentication request and send appropriate email
   * 
   * @param request - Authentication request details
   * @returns Promise with authentication response
   */
  static async processAuthRequest(request: EmailAuthRequest): Promise<EmailAuthResponse> {
    try {
      const { email, isNewUser, isUnverified, userRole } = request;

      // Determine appropriate template and flow
      const authFlow = this.determineAuthFlow(isNewUser, isUnverified, userRole);
      
      // Generate appropriate token and send email
      const result = await this.sendAuthEmail(email, authFlow);
      
      return {
        success: true,
        message: this.getSuccessMessage(authFlow),
        templateUsed: authFlow.template,
        redirectUrl: authFlow.redirectUrl
      };
    } catch (error) {
      console.error('Email authentication error:', error);
      return {
        success: false,
        message: 'Failed to send authentication email. Please try again.',
        templateUsed: 'error'
      };
    }
  }

  /**
   * Determine authentication flow based on user status
   */
  private static determineAuthFlow(
    isNewUser?: boolean, 
    isUnverified?: boolean, 
    userRole?: 'ADMIN' | 'USER'
  ) {
    // New user registration flow
    if (isNewUser) {
      return {
        type: 'registration',
        template: 'registration',
        tokenType: 'VERIFICATION',
        redirectUrl: '/dashboard'
      };
    }

    // Unverified user - send verification email
    if (isUnverified) {
      return {
        type: 'verification',
        template: 'verification',
        tokenType: 'VERIFICATION',
        redirectUrl: '/dashboard'
      };
    }

    // Admin user - special handling
    if (userRole === 'ADMIN') {
      return {
        type: 'admin_login',
        template: 'admin_magic_link',
        tokenType: 'MAGIC_LINK',
        redirectUrl: '/admin'
      };
    }

    // Regular verified user - magic link
    return {
      type: 'magic_link',
      template: 'magic_link',
      tokenType: 'MAGIC_LINK',
      redirectUrl: '/dashboard'
    };
  }

  /**
   * Send authentication email with appropriate template
   */
  private static async sendAuthEmail(email: string, authFlow: any) {
    if (!supabase) {
      // Mock implementation for development
      console.log(`Mock email sent to ${email} using template: ${authFlow.template}`);
      return { success: true };
    }

    // In real implementation, this would:
    // 1. Generate secure token
    // 2. Store token in database
    // 3. Send email using appropriate template
    // 4. Return success/failure status

    return { success: true };
  }

  /**
   * Get success message based on auth flow
   */
  private static getSuccessMessage(authFlow: any): string {
    switch (authFlow.type) {
      case 'registration':
        return 'Registration email sent! Please check your inbox to verify your account.';
      case 'verification':
        return 'Verification email sent! Please check your inbox to verify your email address.';
      case 'admin_login':
        return 'Admin login link sent! Please check your inbox to access the admin panel.';
      case 'magic_link':
        return 'Magic link sent! Please check your inbox to sign in.';
      default:
        return 'Authentication email sent! Please check your inbox.';
    }
  }
}