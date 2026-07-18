This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Account portal

The site includes database-backed administrator and client accounts using Better Auth:

- Email/password sign-in, email verification, and password reset
- Authenticator-app 2FA with single-use recovery codes
- Mandatory 2FA enrollment for administrators
- Invite-only client registration
- Role-protected `/admin`, `/portal`, and `/account` routes

Copy `.env.example` to `.env.local` and configure the authentication, database, and Resend values. `ADMIN_EMAILS` is the comma-separated allowlist used to bootstrap administrator accounts.

Run the database migration before starting the app:

```bash
npm run auth:migrate
```

For local development without PostgreSQL:

```bash
AUTH_USE_LOCAL_DB=true \
AUTH_LOCAL_DB_PATH=/tmp/business-site-auth.sqlite \
npm run auth:migrate
```

Then start Next.js with the same `AUTH_USE_LOCAL_DB` and `AUTH_LOCAL_DB_PATH` values. `AUTH_DEV_EMAIL_MODE=console` prints verification, recovery, and invitation links only outside production.

Open `/register/admin` once to create the first allowlisted administrator. After email verification, the administrator is required to enroll authenticator 2FA before `/admin` becomes accessible. Clients are created only from invitation links generated in the admin dashboard.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
