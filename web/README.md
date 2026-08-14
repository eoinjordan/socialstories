# Web app

Next.js 15 (App Router), Auth.js v5. Deploys to Vercel as-is.

## Where stories are kept

Two interchangeable stores, both holding the identical `Story` JSON document:

- **hosted** - an account on this site, one Postgres row per story, scoped to
  the signed-in user. The default, because it works the moment someone signs in
  with no extra permissions to grant.
- **drive** - plain files in the user's own Google Drive. We keep no copy.

Signing in requests **no Drive access at all**. Drive is connected separately
from Settings, and only then is the `drive.file` scope requested. A hosted user
can back their stories up to Drive with one button; because both stores hold the
same document, that backup is a straight copy rather than an export format.

If `DATABASE_URL` is unset the app is still fully usable - it falls back to
Drive-only, which is how a fork with no database behaves.

## Google Cloud setup

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2. **APIs & Services → Library →** enable the **Google Drive API**.
3. **OAuth consent screen** → External. Add `openid`, `email` and `profile`,
   plus `https://www.googleapis.com/auth/drive.file` for the optional Drive
   storage and backup.
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

**The root directory must be set to `web`.** The repository root holds no app,
so a project left pointing at it deploys successfully and then serves 404 for
every path. Project -> Settings -> Build and Deployment -> Root Directory -> `web`.

Then set the environment variables:

| Variable | Needed for |
|---|---|
| `AUTH_SECRET` | Always. `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Always - sign-in |
| `DATABASE_URL` | Hosted accounts. Storage tab -> add a Neon database and it is set for you |

Auth.js derives the callback URL from the deployment, but the OAuth client needs
the production URL added to its **authorised redirect URIs**:
`https://<your-app>.vercel.app/api/auth/callback/google`.

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
  settings/             storage choice, Drive connection, backup to Drive
lib/
  store/                the storage abstraction
    types.ts              the Store interface both backends implement
    hosted.ts             Postgres rows, scoped per user
    drive.ts              adapter over lib/drive.ts
    media.ts              uploaded photos for hosted accounts
    index.ts              picks the store for the request
  drive.ts              every Drive REST call the app makes
  types.ts              the story document format (mirrored in the Android app)
  quality.ts            the Social Stories 10.4 checks
  catalog.ts            the CC0 starter templates
```

Things worth knowing before changing anything:

- **`user_id` always comes from the server-side session**, never from the
  request, and every hosted query filters on it. This is care information about
  identifiable, often vulnerable people.
- **The Android app syncs from Drive, not from hosted storage.** A hosted user
  who wants the tablet app should switch storage to Drive or use the backup
  button.
- **`StorySummary.driveFileId` is the address the UI navigates by** whichever
  store is in use; it keeps its Drive-era name so existing URLs keep working.

- **The access token never reaches the browser.** Images stored in Drive are
  streamed through `/api/media/[fileId]`, which attaches the token server-side.
- **Story summaries are mirrored into Drive `appProperties`** when a story is
  saved, so the library page costs one Drive request rather than one download
  per story. `appProperties` values are capped at 124 bytes — that is why only a
  small cover reference is stored there.
- **ESLint's `no-img-element` is off** on purpose: images are same-origin
  streams from our own API, so `next/image` would add a proxy hop and a
  `remotePatterns` config for no benefit.
