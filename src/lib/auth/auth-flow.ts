import { supabase, db } from '../supabase';
import { EmailAuthProvider } from './email-provider';
import { AuthTokenManager } from './auth-tokens';

export interface AuthFlowResult {
  success: boolean;
  message: string;
  requiresVerification?: boolean;
  redirectUrl?: string;
}

/**
 * Authentication Flow Management
 * 
 * Centralized management of authentication scenarios including:
 * - Existing user login
 * - Email verification requests
 * - Magic link authentication
 * - Token verification
 */
export class AuthFlowManager {
  /**
   * Handle login request for existing user
   * 
   * @param email - User email address
   * @returns Promise with authentication flow result
   */
  static async handleExistingUserLogin(email: string): Promise<AuthFlowResult> {
    try {
      if (!supabase) {
        // Mock implementation for development
        return {
          success: true,
          message: 'Mock login email sent! Check your inbox.',
          redirectUrl: email.includes('admin') ? '/admin' : '/dashboard'
        };
      }

      // Get user from database
      const users = await db.getUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        return {
          success: false,
          message: 'User not found. Please register first.'
        };
      }

      // Determine authentication method based on user status
      const authRequest = {
        email,
        isNewUser: false,
        isUnverified: !user.isVerified,
        userRole: user.role as 'ADMIN' | 'USER'
      };

      const result = await EmailAuthProvider.processAuthRequest(authRequest);
      
      return {
        success: result.success,
        message: result.message,
        requiresVerification: !user.isVerified,
        redirectUrl: result.redirectUrl
      };
    } catch (error) {
      console.error('Login flow error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Handle email verification request
   * 
   * @param email - User email address
   * @returns Promise with verification flow result
   */
  static async handleEmailVerification(email: string): Promise<AuthFlowResult> {
    try {
      // Generate verification token
      const token = await AuthTokenManager.generateVerificationToken(email);
      
      if (!token) {
        return {
          success: false,
          message: 'Failed to generate verification token.'
        };
      }

      // Send verification email
      const authRequest = {
        email,
        isNewUser: false,
        isUnverified: true
      };

      const result = await EmailAuthProvider.processAuthRequest(authRequest);
      
      return {
        success: result.success,
        message: result.message,
        requiresVerification: true
      };
    } catch (error) {
      console.error('Email verification flow error:', error);
      return {
        success: false,
        message: 'Verification email failed. Please try again.'
      };
    }
  }

  /**
   * Handle magic link login request
   * 
   * @param email - User email address
   * @param userRole - User role for redirect determination
   * @returns Promise with magic link flow result
   */
  static async handleMagicLinkLogin(email: string, userRole?: 'ADMIN' | 'USER'): Promise<AuthFlowResult> {
    try {
      // Generate magic link token
      const token = await AuthTokenManager.generateMagicLinkToken(email);
      
      if (!token) {
        return {
          success: false,
          message: 'Failed to generate magic link.'
        };
      }

      // Send magic link email
      const authRequest = {
        email,
        isNewUser: false,
        isUnverified: false,
        userRole
      };

      const result = await EmailAuthProvider.processAuthRequest(authRequest);
      
      return {
        success: result.success,
        message: result.message,
        redirectUrl: result.redirectUrl
      };
    } catch (error) {
      console.error('Magic link flow error:', error);
      return {
        success: false,
        message: 'Magic link failed. Please try again.'
      };
    }
  }

  /**
   * Verify email token and complete authentication
   * 
   * @param token - Verification or magic link token
   * @param tokenType - Type of token being verified
   * @returns Promise with verification result
   */
  static async verifyEmailToken(token: string, tokenType: 'VERIFICATION' | 'MAGIC_LINK'): Promise<AuthFlowResult> {
    try {
      // Validate and consume token
      const tokenData = await AuthTokenManager.validateAndConsumeToken(token, tokenType);
      
      if (!tokenData) {
        return {
          success: false,
          message: 'Invalid or expired token.'
        };
      }

      // Update user verification status if needed
      if (tokenType === 'VERIFICATION') {
        await this.markUserAsVerified(tokenData.email);
      }

      // Determine redirect URL based on user role
      const redirectUrl = await this.getRedirectUrl(tokenData.email);
      
      return {
        success: true,
        message: 'Authentication successful!',
        redirectUrl
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: 'Token verification failed.'
      };
    }
  }

  /**
   * Mark user as verified in database
   */
  private static async markUserAsVerified(email: string): Promise<void> {
    if (!supabase) {
      console.log(`Mock: User ${email} marked as verified`);
      return;
    }

    // In real implementation, update user verification status
    // await supabase.from('users').update({ is_verified: true }).eq('email', email);
  }

  /**
   * Get appropriate redirect URL based on user role
   */
  private static async getRedirectUrl(email: string): Promise<string> {
    if (!supabase) {
      return email.includes('admin') ? '/admin' : '/dashboard';
    }

    const users = await db.getUsers();
    const user = users.find(u => u.email === email);
    
    return user?.role === 'ADMIN' ? '/admin' : '/dashboard';
  }
}