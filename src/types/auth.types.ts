import type { User, Session } from "@supabase/supabase-js";

/**
 * OAuth providers supported by the application.
 */
export const OAuthProvider = {
  GOOGLE: "google",
  GITHUB: "github",
  AZURE: "azure",
} as const;

export type OAuthProvider = (typeof OAuthProvider)[keyof typeof OAuthProvider];

/**
 * Application user roles.
 */
export const UserRole = {
  ADMIN: "admin",
  COMPLIANCE_MANAGER: "compliance_manager",
  RISK_OWNER: "risk_owner",
  AUDITOR: "auditor",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Extended user type that includes organization and role data from the users table.
 */
export interface AuthUser extends User {
  organizationId?: string;
  role?: string;
  permissions?: unknown[];
}

/**
 * Extended session type with enriched user data.
 */
export interface AuthSession extends Session {
  user: AuthUser;
}

/**
 * Login form values.
 */
export interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Registration form values.
 */
export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  organizationName?: string;
}

/**
 * Forgot password form values.
 */
export interface ForgotPasswordFormValues {
  email: string;
}

/**
 * Reset password form values.
 */
export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

/**
 * Auth error with user-friendly message.
 */
export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Result of an authentication action.
 */
export interface AuthResult {
  success: boolean;
  error?: AuthError;
  redirectTo?: string;
}
