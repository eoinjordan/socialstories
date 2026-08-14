# Android app

Kotlin + Jetpack Compose. Reads the same Drive files the web app writes, caches
them on device, and plays them offline.

> **Not yet compiled.** This module was written on a machine with no JDK, so it
> has never been through a Gradle build. Treat the first build as a bring-up
> exercise: open the folder in Android Studio, accept the Gradle wrapper it
> offers to create, and fix version nits as they surface.

## Google Cloud setup

Use the **same Google Cloud project** as the web app, then add an Android OAuth
client:

1. Get your signing certificate fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
2. **Credentials → Create credentials → OAuth client ID → Android.**
   Package name `org.socialstories.app`, plus the SHA-1 from step 1.
3. Repeat for your release keystore before shipping.

No client id goes in the code — Google matches the Android client by package
name and signing certificate. That is why there is no `BuildConfig` field for it.

## Building

```bash
./gradlew assembleDebug
```

Requires JDK 17 and an Android SDK with API 35 platform installed.

## How it is put together

```
data/
  Model.kt           the story format — mirrors web/lib/types.ts
  DriveClient.kt     the same handful of Drive REST calls the web app makes
  StoryCache.kt      on-device copy: stories/ and media/ under filesDir
  StoryRepository.kt joins the two; reads always come from the cache
auth/GoogleAuth.kt   drive.file authorization via Play Services
ui/
  LibraryScreen.kt   the grid of synced stories
  PlayerScreen.kt    full-screen play mode, TTS, hold-to-exit
  Theme.kt           flat, high-contrast, deliberately not dynamic-colour
MainActivity.kt      consent flow, screen pinning, keep-awake
```

### Sync

`StoryRepository.sync()` compares Drive's `modifiedTime` against the stamp saved
with each cached story, so unchanged stories are never re-downloaded. Stories
deleted in Drive are deleted locally — a story a family has withdrawn must not
keep playing on the tablet. Images are fetched once and pruned when no story
refers to them.

Failures are expected states, not errors: no network means the cached library is
shown with an "offline" note, and a single unreadable story is skipped rather
than aborting the sync.

### Locking it open as a status radiator

A story with `lockOpen` set enters kiosk mode when opened:

- `startLockTask()` pins the app to the screen. On an ordinary device Android
  shows a confirmation the first time and the back+overview gesture releases it.
  For a hard lock, provision the tablet with this app as **device owner**:
  ```bash
  adb shell dpm set-device-owner org.socialstories.app/.DeviceAdminReceiver
  ```
  (that receiver is not written yet — it is the next step if you need a tablet
  that cannot be escaped at all);
- `FLAG_KEEP_SCREEN_ON` stops the display sleeping;
- system bars are hidden;
- the exit control needs a three-second hold.

The manifest also declares a `HOME` intent filter, so a carer can set the app as
the device launcher and have it survive a reboot.

### Authoring

There is no editor in the app yet — stories are created on the website and
appear here after a refresh. That is a deliberate first cut, not an oversight:
the editing UI is the largest part of the web app and the tablet is usually the
*playback* device. An in-app editor would need Drive write access, which the
`drive.file` scope already permits.
