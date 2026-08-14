package org.socialstories.app.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * Mirror of `web/lib/types.ts`. The exact same JSON bytes are written by the
 * website and read here, so any change to one file has to be made to the other.
 *
 * Unknown fields are ignored rather than fatal: a newer website must never stop
 * an older installed app from opening a story a family depends on.
 */
val StoryJson = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
    explicitNulls = false
    classDiscriminator = "kind"
}

@Serializable
sealed interface Media {
    @Serializable
    @SerialName("none")
    data object None : Media

    @Serializable
    @SerialName("pictogram")
    data class Pictogram(val id: Int, val label: String = "") : Media

    @Serializable
    @SerialName("drive")
    data class DriveImage(val fileId: String, val label: String = "") : Media
}

@Serializable
data class Step(
    val id: String,
    val text: String = "",
    val media: Media = Media.None,
    val spoken: String? = null,
    /**
     * Author's sentence-type tag from the web editor. The app never edits
     * stories, but it must round-trip the field rather than silently dropping
     * it if it ever starts writing them back.
     */
    val sentenceType: String? = null,
)

@Serializable
data class DisplaySettings(
    val readAloud: Boolean = true,
    val textScale: Float = 1f,
    val highContrast: Boolean = false,
    val autoAdvanceSeconds: Int = 0,
    val lockOpen: Boolean = false,
)

@Serializable
data class Story(
    val schemaVersion: Int = 1,
    val id: String,
    val kind: String = "story",
    val title: String = "",
    val carerNotes: String? = null,
    val cover: Media = Media.None,
    val steps: List<Step> = emptyList(),
    val display: DisplaySettings = DisplaySettings(),
    val createdAt: String = "",
    val updatedAt: String = "",
)

/** A story plus the Drive file it came from, as held in the local cache. */
@Serializable
data class CachedStory(
    val driveFileId: String,
    val story: Story,
    /** Drive's modifiedTime when we last downloaded it. */
    val syncedModifiedTime: String = "",
)
