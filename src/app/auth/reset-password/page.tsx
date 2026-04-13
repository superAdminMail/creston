import ResetPasswordForm from "../_components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  const error = params.error;

  if (error === "INVALID_TOKEN" || !token) {
    return (
      <div>
        <h1>Invalid or expired link</h1>
        <p>This password reset link is invalid or has expired.</p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
