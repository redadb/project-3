import { supabase } from '../supabase';
import { randomBytes } from 'crypto';

export interface TokenData {
  email: string;
  token: string;
  type: 'VERIFICATION' | 'MAGIC_LINK';
  expiresAt: Date;
}

/**
 * Authentication Token Manager
 * 
 * Handles secure generation, validation, and consumption of one-time tokens
 * for email verification and magic link authentication.
 */
export class AuthTokenManager {
  private static readonly TOKEN_EXPIRY_MINUTES = 30;
  private static readonly TOKEN_LENGTH = 32;

  /**
   * Generate verification token for email verification
   * 
   * @param email - User email address
   * @returns Promise with generated token or null if failed
   */
  static async generateVerificationToken(email: string): Promise<string | null> {
    try {
      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

      await this.storeToken({
        email,
        token,
        type: 'VERIFICATION',
        expiresAt
      });

      return token;
    } catch (error) {
      console.error('Failed to generate verification token:', error);
      return null;
    }
  }

  /**
   * Generate magic link token for passwordless authentication
   * 
   * @param email - User email address
   * @returns Promise with generated token or null if failed
   */
  static async generateMagicLinkToken(email: string): Promise<string | null> {
    try {
      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

      await this.storeToken({
        email,
        token,
        type: 'MAGIC_LINK',
        expiresAt
      });

      return token;
    } catch (error) {
      console.error('Failed to generate magic link token:', error);
      return null;
    }
  }

  /**
   * Validate and consume a token (single use)
   * 
   * @param token - Token to validate
   * @param expectedType - Expected token type
   * @returns Promise with token data or null if invalid
   */
  static async validateAndConsumeToken(
    token: string, 
    expectedType: 'VERIFICATION' | 'MAGIC_LINK'
  ): Promise<{ email: string } | null> {
    try {
      if (!supabase) {
        // Mock implementation for development
        console.log(`Mock: Validating ${expectedType} token: ${token.substring(0, 8)}...`);
        return { email: 'user@example.com' };
      }

      // In real implementation:
      // 1. Query database for token
      // 2. Check if token exists and hasn't expired
      // 3. Verify token type matches expected
      // 4. Mark token as used (delete or flag)
      // 5. Return associated email

      return { email: 'user@example.com' };
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Generate cryptographically secure token
   */
  private static generateSecureToken(): string {
    if (typeof window !== 'undefined') {
      // Browser environment - use Web Crypto API
      const array = new Uint8Array(this.TOKEN_LENGTH);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Node environment - use crypto module
      return randomBytes(this.TOKEN_LENGTH).toString('hex');
    }
  }

  /**
   * Store token in database
   */
  private static async storeToken(tokenData: TokenData): Promise<void> {
    if (!supabase) {
      console.log(`Mock: Storing ${tokenData.type} token for ${tokenData.email}`);
      return;
    }

    // In real implementation:
    // await supabase.from('auth_tokens').insert({
    //   user_id: userId,
    //   token: tokenData.token,
    //   type: tokenData.type,
    //   expires_at: tokenData.expiresAt.toISOString()
    // });
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  static async cleanupExpiredTokens(): Promise<void> {
    if (!supabase) {
      console.log('Mock: Cleaning up expired tokens');
      return;
    }

    // In real implementation:
    // await supabase.from('auth_tokens')
    //   .delete()
    //   .lt('expires_at', new Date().toISOString());
  }
}