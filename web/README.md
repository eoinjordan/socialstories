# Web app

Next.js 15 (App Router), Auth.js v5, no database. Deploys to Vercel as-is.

## Google Cloud setup

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2. **APIs & Services → Library →** enable the **Google Drive API**.
3. **OAuth consent screen** → External. Add the scopes
   `openid`, `email`, `profile` and `https://www.googleapis.com/auth/drive.file`.
   While the app is in *Testing*, only accounts listed under **Test users** can
   sign in — add yours. `drive.file` is a non-sensitive scope, so publishing does
   not require a security assessment.
4. **Credentials → Create credentials → OAuth client ID → Web application.**
   Authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-app>.vercel.app/api/auth/callback/google`

## Local development

```bash
cp .env.example .env.local
```

Fill in `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET`
(`openssl rand -base64 32`). Then:

```bash
npm install && npm run dev
```

## Deploying to Vercel

Import the repository, set the root directory to `web/`, and add
`AUTH_SECRET`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` as environment
variables. Auth.js derives the callback URL from the deployment, so nothing else
is needed — but remember to add the production URL to the OAuth client's
authorised redirect URIs.

## How it is put together

```
app/
  page.tsx              landing + sign-in
  library/              the user's stories, read from Drive
  templates/            starter catalogue, copies into Drive on demand
  edit/[fileId]/        the authoring UI (autosaves to Drive)
  play/[fileId]/        full-screen play / status-radiator mode
  api/
    stories/            list, read, write, delete story JSON in Drive
    media/              upload a photo; stream one back
    pictograms/         ARASAAC search + image proxy
    templates/          catalogue listing; copy a template into Drive
lib/
  drive.ts              every Drive REST call the app makes
  types.ts              the story document format (mirrored in the Android app)
  catalog.ts            the CC0 starter templates
```

Two things worth knowing before changing anything:

- **The access token never reaches the browser.** Images stored in Drive are
  streamed through `/api/media/[fileId]`, which attaches the token server-side.
- **Story summaries are mirrored into Drive `appProperties`** when a story is
  saved, so the library page costs one Drive request rather than one download
  per story. `appProperties` values are capped at 124 bytes — that is why only a
  small cover reference is stored there.
