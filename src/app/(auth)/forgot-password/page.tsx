import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password - Aegis GRC",
  description: "Reset your Aegis GRC account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
