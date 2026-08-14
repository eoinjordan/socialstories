package org.socialstories.app.data

import android.content.Context
import java.io.IOException

/**
 * Joins Drive to the on-device cache.
 *
 * The rule throughout: reads are served from the cache, so the app is usable
 * with no network; Drive is consulted only to bring the cache up to date.
 */
class StoryRepository(context: Context) {

    private val app = context.applicationContext
    private val cache = StoryCache(app)
    private val drive = DriveClient()

    /**
     * Pictogram ids shipped inside the APK. Listed once at startup: an asset
     * lookup per picture per frame would be wasteful, and this set is small.
     */
    private val bundledSymbols: Set<Int> by lazy {
        runCatching {
            app.assets.list("symbols").orEmpty()
                .mapNotNull { it.removeSuffix(".png").toIntOrNull() }
                .toSet()
        }.getOrDefault(emptySet())
    }

    /**
     * What Coil should load for a picture: a bundled asset when we ship it, the
     * downloaded file otherwise, or null when there is nothing to show yet.
     */
    fun mediaModel(media: Media): Any? = when (media) {
        is Media.Pictogram ->
            if (media.id in bundledSymbols) {
                "file:///android_asset/symbols/${media.id}.png"
            } else {
                cache.mediaFile(media)?.takeIf { it.exists() }
            }

        is Media.DriveImage -> cache.mediaFile(media)?.takeIf { it.exists() }
        Media.None -> null
    }

    data class SyncResult(
        val updated: Int,
        val removed: Int,
        val mediaFetched: Int,
    )

    suspend fun cachedStories(): List<CachedStory> = cache.readAll()

    suspend fun cachedStory(driveFileId: String): CachedStory? = cache.read(driveFileId)

    suspend fun clear() = cache.clear()

    /**
     * Pulls anything new or changed out of Drive.
     *
     * Throws [DriveClient.NotAuthorized] if the token has gone stale, and
     * [IOException] if the network is unavailable — both are expected states
     * that the UI reports without discarding the cached library.
     */
    suspend fun sync(token: String): SyncResult {
        val folderId = drive.findFolder(token)
            ?: return SyncResult(0, 0, 0) // no folder yet: nothing to pull

        val entries = drive.list(token, folderId)
        var updated = 0
        var mediaFetched = 0

        for (entry in entries) {
            val existing = cache.read(entry.fileId)
            // modifiedTime is Drive's own stamp, so this skips unchanged files
            // without downloading them.
            if (existing != null && existing.syncedModifiedTime == entry.modifiedTime) {
                mediaFetched += cacheMediaFor(token, existing.story)
                continue
            }
            val story = try {
                drive.downloadStory(token, entry.fileId)
            } catch (e: IOException) {
                // One unreadable story should not abort the whole sync.
                continue
            }
            cache.write(
                CachedStory(
                    driveFileId = entry.fileId,
                    story = story,
                    syncedModifiedTime = entry.modifiedTime,
                ),
            )
            updated++
            mediaFetched += cacheMediaFor(token, story)
        }

        // Anything deleted in Drive should disappear here too, otherwise a
        // withdrawn story could keep playing on a family's tablet.
        val remote = entries.map { it.fileId }.toSet()
        val stale = cache.storedIds() - remote
        stale.forEach { cache.deleteStory(it) }

        pruneOrphanMedia()
        return SyncResult(updated, stale.size, mediaFetched)
    }

    /** Downloads every picture a story needs that we do not already hold. */
    private suspend fun cacheMediaFor(token: String, story: Story): Int {
        var fetched = 0
        for (media in story.allMedia()) {
            if (media is Media.None || cache.hasMedia(media)) continue
            // Anything shipped in the APK never needs fetching.
            if (media is Media.Pictogram && media.id in bundledSymbols) continue
            val bytes = try {
                when (media) {
                    is Media.Pictogram -> drive.downloadPictogram(media.id)
                    is Media.DriveImage -> drive.downloadBytes(token, media.fileId)
                    Media.None -> ByteArray(0)
                }
            } catch (e: IOException) {
                continue // try again on the next sync
            }
            cache.writeMedia(media, bytes)
            fetched++
        }
        return fetched
    }

    private suspend fun pruneOrphanMedia() {
        val keep = cache.readAll()
            .flatMap { it.story.allMedia() }
            .mapNotNull { cache.mediaFile(it)?.name }
            .toSet()
        cache.pruneMedia(keep)
    }

    private fun Story.allMedia(): List<Media> = buildList {
        add(cover)
        steps.forEach { add(it.media) }
    }
}
