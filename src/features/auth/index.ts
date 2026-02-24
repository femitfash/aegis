// Auth feature barrel export

// Actions
export {
  signInWithPassword,
  signUp,
  signOut,
  signInWithOAuth,
  resetPasswordRequest,
  updatePassword,
} from "./auth.actions";

// Schema
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema";
export type {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "./auth.schema";

// Hooks
export { useAuth } from "./hooks/useAuth";

// Components
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { ResetPasswordForm } from "./components/ResetPasswordForm";
export { AuthAlert } from "./components/AuthAlert";
export { OAuthButtons } from "./components/OAuthButtons";
export { PasswordInput } from "./components/PasswordInput";
export { UserMenu } from "./components/UserMenu";
