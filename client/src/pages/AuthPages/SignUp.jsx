import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | FinSight - Personal Finance Management"
        description="Create your FinSight account to start tracking expenses and managing your budget"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
