import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AccountIdentitySettings } from "../components/account-identity-settings";
import { ProfileAvatar } from "../components/profile-avatar";
import { ProfileAvatarSettings } from "../components/profile-avatar-settings";
import { Toast } from "../components/toast";
import { useAuth } from "../hooks/use-auth";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { useProfile } from "../hooks/use-profile";
import {
  type ProfileErrorCode,
  parseProfileServerError,
  profileErrorMessage,
} from "../lib/profile-errors";
import { normalizeField, validateBio, validatePublicUsername } from "../lib/profile-validation";
import { m } from "../paraglide/messages.js";

function ProfilePage() {
  useInterfaceLocale();
  const { me } = useAuth();
  const { save } = useProfile();
  const [publicUsername, setPublicUsername] = useState("");
  const [bio, setBio] = useState("");
  const [serverUsernameError, setServerUsernameError] = useState<ProfileErrorCode | null>(null);
  const [serverBioError, setServerBioError] = useState<ProfileErrorCode | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setPublicUsername(me.publicUsername ?? "");
    setBio(me.bio ?? "");
  }, [me]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const normalizedUsername = normalizeField(publicUsername);
  const normalizedBio = normalizeField(bio);
  const usernameErrorCode = serverUsernameError ?? validatePublicUsername(normalizedUsername);
  const bioErrorCode = serverBioError ?? validateBio(normalizedBio);
  const usernameError = usernameErrorCode ? profileErrorMessage(usernameErrorCode) : null;
  const bioError = bioErrorCode ? profileErrorMessage(bioErrorCode) : null;
  const hasError = usernameErrorCode !== null || bioErrorCode !== null;

  const isDirty = useMemo(() => {
    const currentUsername = me?.publicUsername ?? null;
    const currentBio = me?.bio ?? null;
    return currentUsername !== normalizedUsername || currentBio !== normalizedBio;
  }, [me, normalizedUsername, normalizedBio]);

  return (
    <div className="mx-auto min-w-0 w-full max-w-5xl pt-5 [animation:page-fade-in_0.2s_ease-out] sm:pt-8">
      <header data-interface-copy className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-fg">{m.profile_title()}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-fg-muted">{m.profile_subtitle()}</p>
      </header>
      <section data-interface-copy className="border-b border-border py-6 sm:py-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold text-fg">{m.profile_public_title()}</h2>
          <p className="mt-1 text-sm text-fg-muted">{m.profile_public_description()}</p>
        </header>
        <div className="flex min-w-0 max-w-2xl flex-col gap-5">
          {me && (
            <div className="flex min-w-0 items-center gap-3">
              <ProfileAvatar me={me} className="h-12 w-12" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-fg">
                  {me.publicUsername ?? m.profile_no_public_username()}
                </p>
                <p className="break-all text-xs text-fg-soft">{me.id}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="publicUsername" className="text-xs text-fg-muted">
              {m.profile_username_label()}
            </label>
            <input
              id="publicUsername"
              value={publicUsername}
              onChange={(event) => setPublicUsername(event.target.value)}
              onFocus={() => setServerUsernameError(null)}
              placeholder={m.ui_john_doe()}
              className="h-10 min-w-0 w-full rounded-sm border border-border-strong bg-app px-3 text-sm text-fg"
            />
            <p className={`text-xs ${usernameError ? "text-danger-strong" : "text-fg-soft"}`}>
              {usernameError ?? m.profile_username_help()}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="bio" className="text-xs text-fg-muted">
              {m.profile_bio_label()}
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              onFocus={() => setServerBioError(null)}
              placeholder={m.profile_bio_placeholder()}
              maxLength={280}
              rows={4}
              className="min-w-0 w-full resize-none rounded-sm border border-border-strong bg-app px-3 py-2 text-sm text-fg"
            />
            <div className="flex items-center justify-between text-xs">
              <p className={bioError ? "text-danger-strong" : "text-fg-soft"}>
                {bioError ?? m.profile_bio_help()}
              </p>
              <p className="text-fg-soft">{bio.length}/280</p>
            </div>
          </div>

          <div className="flex justify-stretch sm:justify-end">
            <button
              type="button"
              disabled={save.isPending || hasError || !isDirty}
              onClick={() => {
                setServerUsernameError(null);
                setServerBioError(null);
                save.mutate(
                  { publicUsername: normalizedUsername, bio: normalizedBio },
                  {
                    onSuccess: () => setToast(m.profile_saved()),
                    onError: (error) => {
                      const parsed = parseProfileServerError(error);
                      if (parsed.field === "publicUsername") {
                        setServerUsernameError(parsed.code);
                        return;
                      }
                      if (parsed.field === "bio") {
                        setServerBioError(parsed.code);
                        return;
                      }
                      setToast(profileErrorMessage(parsed.code));
                    },
                  },
                );
              }}
              className="h-9 w-full rounded-sm border border-transparent bg-fg px-4 text-xs font-medium text-app disabled:border-border disabled:bg-transparent disabled:text-fg-soft sm:w-auto"
            >
              {m.profile_save()}
            </button>
          </div>
        </div>
      </section>
      <AccountIdentitySettings
        enabled={Boolean(me && !me.id.startsWith("guest:"))}
        onMessage={setToast}
      />
      {me && !me.id.startsWith("guest:") && (
        <section
          data-interface-copy
          className="flex flex-col items-start gap-4 border-b border-border py-6 sm:flex-row sm:items-center sm:justify-between sm:py-8"
        >
          <div>
            <h2 className="text-base font-semibold text-fg">{m.account_password_title()}</h2>
            <p className="mt-1 text-sm text-fg-muted">{m.account_password_description()}</p>
          </div>
          <Link
            to="/reset-password"
            className="inline-flex h-9 w-full items-center justify-center rounded-sm border border-border-strong px-3 text-xs text-fg transition-colors hover:border-fg-soft sm:w-auto"
          >
            {m.account_password_reset()}
          </Link>
        </section>
      )}
      <ProfileAvatarSettings />
      <Toast message={toast} />
    </div>
  );
}

export const Route = createFileRoute("/profile")({ component: ProfilePage });
