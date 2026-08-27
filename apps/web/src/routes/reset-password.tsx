import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthCard } from "../components/auth-card";
import { AuthErrorBanner } from "../components/auth-error-banner";
import { resetPassword } from "../lib/api-auth";
import { m } from "../paraglide/messages.js";

function ResetPasswordPage() {
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setDone(false);
    setError(null);
    try {
      await resetPassword({ resetToken: resetToken.trim(), newPassword });
      setDone(true);
      setResetToken("");
      setNewPassword("");
    } catch {
      setError(m.ui_invalid_or_expired_reset_token());
    }
    setPending(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <AuthCard
        title={m.login_reset_password()}
        subtitle={m.ui_use_the_token_generated_from_the_admin_panel()}
      >
        <AuthErrorBanner message={error} />
        {done && (
          <div className="mb-4 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
            {m.ui_password_updated_you_can_sign_in_with_your_new_password()}
          </div>
        )}
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <input
            type="text"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            placeholder={m.admin_users_reset_token()}
            className="h-10 rounded-lg border border-border-strong bg-app px-3 text-sm text-fg"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={m.ui_new_password()}
            className="h-10 rounded-lg border border-border-strong bg-app px-3 text-sm text-fg"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg bg-fg text-app text-sm font-medium disabled:opacity-60"
          >
            {pending ? m.ui_updating() : m.ui_update_password()}
          </button>
        </form>
        <div className="mt-4 text-xs text-fg-soft">
          <Link to="/login" search={{ redirect: undefined }} className="hover:text-fg-muted">
            {m.ui_back_to_login()}
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}

export const Route = createFileRoute("/reset-password")({ component: ResetPasswordPage });
