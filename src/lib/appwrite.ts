/**
 * Appwrite Client Configuration
 * 
 * Self-hosted Appwrite instance
 */

import { Client, Account, ID, OAuthProvider, Models } from "appwrite";

// Appwrite configuration from environment variables
const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "http://localhost/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
};

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Account service for authentication
export const account = new Account(client);

// Export client for other services if needed
export { client, ID, OAuthProvider };

// Type exports
export type { Models };

/**
 * Auth helper functions
 */
export const appwriteAuth = {
  /**
   * Create a new account with email and password
   */
  async createAccount(email: string, password: string, name?: string) {
    return account.create(ID.unique(), email, password, name);
  },

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string) {
    return account.createEmailPasswordSession(email, password);
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle(successUrl?: string, failureUrl?: string) {
    // Use callback page to properly handle session establishment
    const success = successUrl || `${window.location.origin}/auth/callback`;
    const failure = failureUrl || `${window.location.origin}/auth/callback?error=oauth_failed`;

    account.createOAuth2Token(
      OAuthProvider.Google,
      success,
      failure
    );
  },

  /**
   * Create a session using an OAuth2 token (userId and secret)
   */
  async createSession(userId: string, secret: string) {
    return account.createSession(userId, secret);
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      return await account.getSession("current");
    } catch {
      return null;
    }
  },

  /**
   * Get current user
   */
  async getUser() {
    try {
      return await account.get();
    } catch {
      return null;
    }
  },

  /**
   * Sign out
   */
  async signOut() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  },

  /**
   * Get JWT token for API calls
   * Caches the JWT for 14 minutes (JWT expires in 15 minutes)
   */
  _jwtCache: null as { token: string; expiresAt: number } | null,
  
  async getJWT() {
    try {
      // Return cached JWT if still valid
      const now = Date.now();
      if (this._jwtCache && this._jwtCache.expiresAt > now) {
        return this._jwtCache.token;
      }

      console.log('[Appwrite] Creating JWT...');
      const jwt = await account.createJWT();
      console.log('[Appwrite] JWT created successfully');
      
      // Cache JWT for 14 minutes (expires in 15)
      this._jwtCache = {
        token: jwt.jwt,
        expiresAt: now + (14 * 60 * 1000),
      };
      
      return jwt.jwt;
    } catch (error) {
      console.error('[Appwrite] Failed to create JWT:', error);
      return null;
    }
  },

  /**
   * Send password recovery email
   */
  async sendPasswordRecovery(email: string) {
    const url = `${window.location.origin}/reset-password`;
    return account.createRecovery(email, url);
  },

  /**
   * Complete password recovery
   */
  async completePasswordRecovery(userId: string, secret: string, password: string) {
    return account.updateRecovery(userId, secret, password);
  },

  /**
   * Send email verification
   */
  async sendEmailVerification() {
    const url = `${window.location.origin}/verify-email`;
    return account.createVerification(url);
  },

  /**
   * Complete email verification
   */
  async completeEmailVerification(userId: string, secret: string) {
    return account.updateVerification(userId, secret);
  },
};

