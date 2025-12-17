import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | FinSight - Personal Finance Management"
        description="Sign in to FinSight to track your expenses and manage your budget"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
