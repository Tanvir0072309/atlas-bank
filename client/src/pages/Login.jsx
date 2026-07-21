import AuthLayout from "../components/auth/AuthLayout.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";

export default function Login() {
  return (
    <AuthLayout
      eyebrow="Welcome Back"
      title="Access Your Account"
      subtitle="Securely log in to manage your connected bank accounts, balances, and card controls."
    >
      <LoginForm />
    </AuthLayout>
  );
}