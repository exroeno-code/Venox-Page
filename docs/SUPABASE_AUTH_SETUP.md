# Supabase account setup

The `/auth` page uses the repository's Supabase Auth client. Email/password signup signs the person in immediately; email confirmation must therefore be disabled in the connected Supabase project. Google and WhatsApp sign-in remain optional providers and are shown only when each provider is enabled in Supabase and its `VITE_ENABLE_*_AUTH` flag is `true`. The connected Vexon project currently has email auth enabled and Google/phone auth disabled.

## 1. Configure the site

Set these browser-safe values in the local environment (`.env.local`) and in the production hosting environment:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_ENABLE_GOOGLE_AUTH=false
VITE_ENABLE_WHATSAPP_AUTH=false
```

The `VITE_` values are shipped to the browser. Use only the Supabase project URL and publishable/anon key here. **Never put a Supabase service-role key, secret key, database password, or other privileged credential in a `VITE_` variable or commit it to Git.** Keep the `.env.local` file untracked.

If the project uses Supabase's legacy anon key rather than a publishable key, the existing client accepts it in the same environment variable. Rotate keys only in Supabase and update the hosting environment there; do not commit them.

## 2. Apply database migrations

The connected project already had the core profile/preferences tables, signup triggers, owner-scoped RLS, and public avatar bucket even though its migration ledger was empty. The following missing additive migrations have now been applied and recorded to the connected project: `20261125010000_user_preferences_role`, `20261125020000_profiles_avatar_bio` (including authenticated column-level update grants), and `20261126010000_online_forex_interest`. Do not blindly replay the entire historical migration set over the existing project; review any other migration against the live schema before applying it. Do not replace owner-scoped access with a broad `service_role` client.

Before applying changes, verify that the Supabase CLI/project link targets the intended project. Account and profile data are durable user data; do not test by deleting production records.

## 3. Allow password-only signup (no email code)

In the Supabase Dashboard, open **Authentication → Sign In / Providers → User Signups** and turn **Confirm email** off. With this setting disabled, Supabase returns a session after email/password signup, and the user is signed in immediately. The VEXON signup flow intentionally does not ask for or resend an email verification code.

If **Confirm email** is still on, Supabase may send a confirmation message and withhold the session; the app will show a setup error rather than pretending that the user is signed in. Disable the setting in the correct Supabase project and test a new account before launch.

**Security tradeoff:** without email confirmation, users can register an email address they do not own, so do not rely on account email as a verified contact address. Password sign-in and the existing profile row-level security remain in place. Consider rate limits or abuse protection if account creation is exposed publicly. Password-reset emails still use Supabase's recovery link; this change removes signup verification codes, not account recovery.

Set the Supabase **Site URL** to the deployed VEXON origin and add each intended local and production origin under **Redirect URLs** for OAuth and password-recovery links.

## 4. Optional social/phone providers

- **Google:** Enable Google under **Authentication → Providers**, configure Google OAuth client credentials and the Supabase callback URL in Google Cloud, then set `VITE_ENABLE_GOOGLE_AUTH=true`. Keep it `false` until the provider is working. Credentials stay in provider settings, not in frontend code.
- **WhatsApp:** Configure phone authentication and the WhatsApp delivery channel/provider in Supabase (including the required Twilio/WhatsApp credentials and templates for the chosen setup), then set `VITE_ENABLE_WHATSAPP_AUTH=true`. WhatsApp phone sign-in still uses a one-time code, independent of email/password sign-in. Test to an authorized number and check rate limits before launch.
- **Instagram:** Instagram is shown as unavailable rather than as a false login. Supabase Auth does not provide a supported Instagram identity provider for this flow. Do not route it to the public Instagram profile and describe that as authentication. A future implementation needs a supported identity/auth architecture, not an Instagram URL.

## 5. Verify before launch

1. Confirm the VEXON origin is listed in Supabase Auth's site/redirect settings.
2. Confirm all project migrations ran successfully and `public.profiles` has RLS enabled.
3. Confirm **Confirm email** is off, then test email/password signup, immediate sign-in, sign-out, and password recovery. Test Google and WhatsApp only if enabled.
4. Confirm the profile row is created for a new user and that the browser uses only the publishable key.
5. Configure the production hosting environment variables and redeploy after values are added. A local build without project credentials validates compilation only; it does not prove a live Supabase connection.
