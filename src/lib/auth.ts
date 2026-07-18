import "server-only";

import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins";
import { authDatabase } from "@/lib/auth/database";
import { sendAuthEmail } from "@/lib/auth/email";
import {
  isValidClientInvitation,
  markClientInvitationUsed,
} from "@/lib/auth/invitations";
import { getAdminEmails, normalizeEmail, roleForEmail } from "@/lib/auth/types";
import { siteConfig } from "@/lib/site-config";

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  siteConfig.siteUrl;

const trustedOrigins = Array.from(
  new Set([
    baseURL,
    siteConfig.siteUrl,
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ])
);

export const auth = betterAuth({
  appName: `${siteConfig.name} Portal`,
  baseURL,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "local-development-secret-change-before-deploying"
      : undefined),
  database: authDatabase,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        url,
        kind: "password-reset",
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        url,
        kind: "verification",
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60 * 5, max: 5 },
      "/request-password-reset": { window: 60 * 5, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 10 },
      "/two-factor/verify-backup-code": { window: 60, max: 5 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-up/email") return;

      const body = context.body as
        | { email?: unknown; invitationToken?: unknown }
        | undefined;
      const email = typeof body?.email === "string" ? body.email : "";
      const token =
        typeof body?.invitationToken === "string"
          ? body.invitationToken
          : "";

      if (getAdminEmails().has(normalizeEmail(email))) return;

      if (!token || !(await isValidClientInvitation(token, email))) {
        throw new APIError("FORBIDDEN", {
          message: "A valid invitation is required to create an account.",
        });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: roleForEmail(user.email),
          },
        }),
        after: async (user) => {
          if (roleForEmail(user.email) === "client") {
            await markClientInvitationUsed(user.email);
          }
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "client",
      adminRoles: ["admin"],
    }),
    twoFactor({
      issuer: `${siteConfig.name} Portal`,
      skipVerificationOnEnable: false,
      totpOptions: {
        digits: 6,
        period: 30,
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
      },
    }),
    nextCookies(),
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type AuthSession = typeof auth.$Infer.Session;
