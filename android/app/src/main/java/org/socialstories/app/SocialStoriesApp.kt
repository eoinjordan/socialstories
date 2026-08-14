package org.socialstories.app

import android.app.Application

/**
 * Nothing to set up at process start — the cache is created lazily and Drive is
 * only contacted on demand. The class exists so the manifest has a stable
 * application name to point at for future wiring (crash reporting, WorkManager
 * background sync).
 */
class SocialStoriesApp : Application()
