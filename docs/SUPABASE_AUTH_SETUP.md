# Supabase account setup

The `/auth` page uses the repository's Supabase Auth client. Email/password signup and confirmation, profile provisioning, Google OAuth, and WhatsApp one-time codes are handled by Supabase; there is no demo-mode account creation. Optional provider buttons stay hidden unless the provider is enabled in Supabase and its `VITE_ENABLE_*_AUTH` flag is `true`. The connected Vexon project currently has email auth enabled and Google/phone auth disabled.

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

## 3. Enable signup email codes

In Supabase Dashboard, open **Authentication → Email Templates → Confirm signup** and make sure the template displays the one-time code, for example:

```html
<p>Your Vexon confirmation code is <strong>{{ .Token }}</strong>.</p>
```

The account page accepts a six-digit token and verifies it with Supabase Auth `verifyOtp` using type `signup`. If the template only contains a confirmation link, users will not see the code required by this page. Configure SMTP/deliverability and confirmation policy in Supabase before production use.

Set the Supabase **Site URL** to the deployed Vexon origin and add each intended local and production origin under **Redirect URLs**. The app returns users to the current site origin after confirmation or OAuth. Email signup is enabled in the connected project, signup is not globally disabled, and email confirmations are required; verify that the Confirm signup template includes `{{ .Token }}` because the page accepts a six-digit code.

## 4. Optional social/phone providers

- **Google:** Enable Google under **Authentication → Providers**, configure Google OAuth client credentials and the Supabase callback URL in Google Cloud, then set `VITE_ENABLE_GOOGLE_AUTH=true`. Keep it `false` until the provider is working. Credentials stay in provider settings, not in frontend code.
- **WhatsApp:** Configure phone authentication and the WhatsApp delivery channel/provider in Supabase (including the required Twilio/WhatsApp credentials and templates for the chosen setup), then set `VITE_ENABLE_WHATSAPP_AUTH=true`. Keep it `false` until delivery works. Test to an authorized number and check rate limits before launch. The app submits E.164 numbers such as `+254712345678` and verifies the returned six-digit code through Supabase.
- **Instagram:** Instagram is shown as unavailable rather than as a false login. Supabase Auth does not provide a supported Instagram identity provider for this flow. Do not route it to the public Instagram profile and describe that as authentication. A future implementation needs a supported identity/auth architecture, not an Instagram URL.

## 5. Verify before launch

1. Confirm the Vexon origin is listed in Supabase Auth's site/redirect settings.
2. Confirm all project migrations ran successfully and `public.profiles` has RLS enabled.
3. Test email signup, the actual email code, sign-in, sign-out, Google (if enabled), and WhatsApp (if enabled) with test accounts/numbers.
4. Confirm the profile row is created for a new user and that the browser uses only the publishable key.
5. Configure the production hosting environment variables and redeploy after values are added. A local build without project credentials validates compilation only; it does not prove a live Supabase connection.
