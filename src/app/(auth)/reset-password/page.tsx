import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata = {
  title: "Reset Password - Aegis GRC",
  description: "Set a new password for your Aegis GRC account",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
