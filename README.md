# Social Stories & Care Pathways

Picture-led social stories and care pathways for people with literacy,
communication or learning differences — authored on the web, played on an
Android tablet, stored in the family's own Google Drive.

Two clients, one file format:

| | |
|---|---|
| `web/` | Next.js app (deploys to Vercel). Google sign-in, story/pathway editor, symbol library, full-screen play mode. |
| `android/` | Kotlin + Jetpack Compose app. Syncs from Drive, caches everything on device, plays offline, can be locked open as a status radiator. |
| `catalog/` | Licence, provenance and method notes for the starter catalogue. |

20 CC0 starter templates ship in `web/lib/catalog.ts`, covering daily routines,
health and care pathways, school, community, feelings and safety — all original
wording, all validated against the story checker.

## Principles

**The family owns the data.** Every story is a plain JSON file in a
`Social Stories` folder in the user's own Google Drive. There is no server-side
database and no account to close — the web app is stateless and holds nothing.
The OAuth scope requested is `drive.file`, the narrowest one available: the app
can only see files it created itself, never the rest of the user's Drive.

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
story check implements Carol Gray's published authoring criteria — the
describe-to-coach ratio, second-person and commanding language, the six
questions, sentence-type balance. It is a drafting aid, not a certification, and
it says so on screen. See [`catalog/SOURCES.md`](catalog/SOURCES.md).

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

The web app builds clean and is ready to deploy. The Android module is complete
source but **has not been compiled** — it was written on a machine with no JDK
installed. Open `android/` in Android Studio, let it create the Gradle wrapper,
and expect to fix the usual first-build version nits.

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
