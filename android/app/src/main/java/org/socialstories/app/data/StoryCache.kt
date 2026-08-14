package org.socialstories.app.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import java.io.File

/**
 * The on-device copy of the library.
 *
 * This is the point of the Android app: once a story has been synced it opens
 * instantly and works with no network at all — in a hospital corridor, on a
 * bus, on a tablet with the SIM removed. Drive is treated as the source of
 * truth when it is reachable and simply ignored when it is not.
 *
 * Layout under filesDir:
 *   stories/<driveFileId>.json   the story document plus its sync stamp
 *   media/pictogram-<id>.png     cached ARASAAC symbol
 *   media/drive-<fileId>         cached uploaded photo
 */
class StoryCache(context: Context) {

    private val root = File(context.filesDir, "library").apply { mkdirs() }
    private val storiesDir = File(root, "stories").apply { mkdirs() }
    private val mediaDir = File(root, "media").apply { mkdirs() }

    suspend fun readAll(): List<CachedStory> = withContext(Dispatchers.IO) {
        storiesDir.listFiles { f -> f.extension == "json" }
            .orEmpty()
            .mapNotNull { file ->
                runCatching { StoryJson.decodeFromString<CachedStory>(file.readText()) }
                    // A single corrupt file must not take the library down with
                    // it; drop it and let the next sync replace it.
                    .onFailure { file.delete() }
                    .getOrNull()
            }
            .sortedByDescending { it.syncedModifiedTime }
    }

    suspend fun read(driveFileId: String): CachedStory? = withContext(Dispatchers.IO) {
        val file = File(storiesDir, "$driveFileId.json")
        if (!file.exists()) return@withContext null
        runCatching { StoryJson.decodeFromString<CachedStory>(file.readText()) }.getOrNull()
    }

    suspend fun write(cached: CachedStory) = withContext(Dispatchers.IO) {
        // Write to a temp file and rename, so a kill mid-write cannot leave a
        // half-written story behind.
        val target = File(storiesDir, "${cached.driveFileId}.json")
        val tmp = File(storiesDir, "${cached.driveFileId}.json.tmp")
        tmp.writeText(StoryJson.encodeToString(cached))
        tmp.renameTo(target)
    }

    suspend fun deleteStory(driveFileId: String) = withContext(Dispatchers.IO) {
        File(storiesDir, "$driveFileId.json").delete()
        Unit
    }

    /** Local ids of every story we hold, used to prune ones deleted in Drive. */
    suspend fun storedIds(): Set<String> = withContext(Dispatchers.IO) {
        storiesDir.listFiles { f -> f.extension == "json" }
            .orEmpty()
            .map { it.nameWithoutExtension }
            .toSet()
    }

    fun mediaFile(media: Media): File? = when (media) {
        is Media.Pictogram -> File(mediaDir, "pictogram-${media.id}.png")
        is Media.DriveImage -> File(mediaDir, "drive-${media.fileId}")
        Media.None -> null
    }

    fun hasMedia(media: Media): Boolean =
        mediaFile(media)?.let { it.exists() && it.length() > 0 } == true

    suspend fun writeMedia(media: Media, bytes: ByteArray) = withContext(Dispatchers.IO) {
        if (bytes.isEmpty()) return@withContext
        val target = mediaFile(media) ?: return@withContext
        val tmp = File(target.parentFile, target.name + ".tmp")
        tmp.writeBytes(bytes)
        tmp.renameTo(target)
        Unit
    }

    /** Removes cached images no story refers to any more. */
    suspend fun pruneMedia(keep: Set<String>) = withContext(Dispatchers.IO) {
        mediaDir.listFiles().orEmpty()
            .filter { it.name !in keep }
            .forEach { it.delete() }
        Unit
    }

    suspend fun clear() = withContext(Dispatchers.IO) {
        root.deleteRecursively()
        storiesDir.mkdirs()
        mediaDir.mkdirs()
        Unit
    }
}
