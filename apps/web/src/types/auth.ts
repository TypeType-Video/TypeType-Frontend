import type { AccessMode } from "./user";

export type AuthRole = "admin" | "moderator" | "user";

export type AuthMe = {
  id: string;
  role: AuthRole | null;
  publicUsername: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarType: "custom" | "emoji" | null;
  avatarCode: string | null;
};

export type AuthStatus = "loading" | "authenticated" | "guest" | "signed_out";

export type AuthResponse = {
  accessToken: string;
};

export type AccountProfile = {
  id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  lastUsedAt: number;
  publicUsername: string | null;
  avatarUrl: string | null;
  avatarType: "custom" | "emoji" | null;
  avatarCode: string | null;
};

export type AccountProfilesResponse = {
  profiles: AccountProfile[];
  activeProfileId: string;
  defaultProfileId: string;
};

export type ProfileSwitchResponse = {
  accessToken: string;
  profile: AccountProfile;
};

export type OidcStatus = {
  enabled: boolean;
  providerName: string | null;
  localLoginEnabled: boolean;
  autoRedirect: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  publicUsername: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarType: "custom" | "emoji" | null;
  avatarCode: string | null;
  suspended: boolean;
  verified: boolean;
  accessMode: AccessMode;
  createdAt: number | string;
};

export type PasswordResetToken = {
  resetToken: string;
};
