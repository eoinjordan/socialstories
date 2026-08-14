# Social Stories & Care Pathways

Picture-led social stories and care pathways for people with literacy,
communication or learning differences — authored on the web, played on an
Android tablet, stored in the family's own Google Drive.

| | |
|---|---|
| **Web app** | <https://socialstories-chi.vercel.app> |
| **Offline builder** (no account) | <https://eoinjordan.github.io/socialstories/> |
| **Android APK** | [latest release](https://github.com/eoinjordan/socialstories/releases/latest) |

Three clients, one file format:

| | |
|---|---|
| `web/` | Next.js app (deploys to Vercel). Google sign-in, story/pathway editor, symbol library, full-screen play mode. |
| `android/` | Kotlin + Jetpack Compose app. Syncs from Drive, caches everything on device, plays offline, can be locked open as a status radiator. |
| `pages/` | Static site for GitHub Pages: a builder needing no account and no server, sharing the same format, checks and symbols. |
| `catalog/` | Licence, provenance and method notes for the starter catalogue. |

40 CC0 starter templates ship in `web/lib/catalog.ts` — 20 that explain a
situation and 20 that celebrate something the reader already does well, all
original wording, all validated against the story checker in CI.

## Principles

**The family chooses where the data lives.** Stories can be kept in an account
on the site, or as plain JSON files in a `Social Stories` folder in the user's
own Google Drive, with a one-button backup from the first to the second. Both
hold the identical document, so nothing is trapped in either.

**Signing in asks for nothing it does not need.** Sign-in requests only
`openid email profile` — no access to anyone's Drive. Drive is connected
separately from Settings, and even then the scope is `drive.file`, the narrowest
one Google offers: the app sees only files it created itself.

**It has to work when the network doesn't.** Hospital corridors, buses and
respite centres all have bad signal. The Android app treats its on-device cache
as the thing it reads from, and Drive only as the thing that refreshes it.

**Nothing surprising.** Flat colours, no animation by default, very large touch
targets, one picture and one short sentence per screen. The palette does not
follow the system wallpaper, because an app that looks different from one day to
the next is exactly wrong for someone who depends on it being predictable.

**A single tap must never close a story.** In locked mode, exiting needs a
three-second hold, and on Android the app additionally pins itself to the screen.

**The editor helps you write well, and admits what it cannot judge.** A live
story check implements the **Social Stories 10.4 criteria** — the Story Rating
(describing ÷ coaching, which must reach 4), the one-coaching-sentence limit,
second person, judging vocabulary, the WH questions, and the rule that a story
never replaces supervision. The library separately checks the criterion that at
least half of a person's stories celebrate what they do well. It is a drafting
aid, not a certification, and says so on screen.
See [`catalog/SOURCES.md`](catalog/SOURCES.md).

## The file format

`web/lib/types.ts` and `android/.../data/Model.kt` describe the same document.
Change one and you must change the other.

```jsonc
{
  "schemaVersion": 1,
  "id": "uuid",
  "kind": "story",              // or "pathway"
  "title": "Going to the dentist",
  "carerNotes": "…",            // never shown in play mode
  "cover":  { "kind": "pictogram", "id": 2694, "label": "dentist" },
  "steps": [
    {
      "id": "uuid",
      "text": "I sit in a big chair.",
      "media": { "kind": "drive", "fileId": "1a2b…", "label": "our chair" },
      "spoken": "optional extra words, read aloud but not shown"
    }
  ],
  "display": {
    "readAloud": true,
    "textScale": 1.0,
    "highContrast": false,
    "autoAdvanceSeconds": 0,     // >0 turns it into an unattended radiator
    "lockOpen": false            // exit needs a 3-second hold
  },
  "createdAt": "…", "updatedAt": "…"
}
```

Pictures are either an ARASAAC pictogram id or a Drive file id for an uploaded
photo. Both clients resolve them to a local cached image.

## Status

The web app typechecks, lints, passes the catalogue check and builds clean.

231 ARASAAC pictograms covering 239 terms ship with both clients, so the symbol
picker works with no network.

The Android app **compiles**: CI assembles an ~11 MB debug APK on every push and
uploads it as a build artifact. It has not yet been run on a device.

## CI/CD

| Workflow | What it does |
|---|---|
| [`web.yml`](.github/workflows/web.yml) | Typecheck, lint, catalogue check, `next build`. A second non-blocking job confirms every template picture keyword still resolves against ARASAAC. |
| [`android.yml`](.github/workflows/android.yml) | Lint and assemble the debug APK, uploaded as a build artifact. On a `v*` tag, builds a release APK — signed if keystore secrets are configured, unsigned otherwise. |
| [`deploy-vercel.yml`](.github/workflows/deploy-vercel.yml) | Preview deploy per PR, production deploy on `main`. Skips itself entirely unless `VERCEL_TOKEN` is set, because Vercel's own Git integration is the simpler option and you only want one of the two. |

None of the workflows need secrets to pass. The deploy and signing jobs detect
missing credentials and skip with a notice rather than failing, so a fresh clone
is green out of the box.

## Setup

See [`web/README.md`](web/README.md) and [`android/README.md`](android/README.md).
Both clients talk to the same Google Cloud project.

## Licence and attribution

Code: MIT (see `LICENSE`).

Template wording in `web/lib/catalog.ts` is original to this project and
released under CC0-1.0 — see [`catalog/README.md`](catalog/README.md) for why
that matters and what may and may not be added to it.

Symbols come from **ARASAAC**. Author: Sergio Palao. Origin:
[ARASAAC](https://arasaac.org). Owner: Government of Aragón. Licensed
CC BY-NC-SA. That licence is non-commercial and share-alike, which constrains
how this project may be distributed — read `catalog/README.md` before shipping
it commercially.
