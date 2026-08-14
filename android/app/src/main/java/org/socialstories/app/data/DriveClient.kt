package org.socialstories.app.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.TimeUnit

/** One story file as Drive describes it, before we download the contents. */
data class DriveEntry(
    val fileId: String,
    val name: String,
    val modifiedTime: String,
    val title: String,
    val kind: String,
)

/**
 * A deliberately small Drive REST client — the same handful of calls the web app
 * makes. Using the REST API directly instead of the google-api-client library
 * keeps the APK small and means the two implementations can be read side by side.
 */
class DriveClient(private val http: OkHttpClient = defaultHttp()) {

    class NotAuthorized : IOException("Google authorization needed")

    private suspend fun get(url: String, token: String): String =
        withContext(Dispatchers.IO) {
            val req = Request.Builder()
                .url(url)
                .header("Authorization", "Bearer $token")
                .build()
            http.newCall(req).execute().use { res ->
                if (res.code == 401 || res.code == 403) throw NotAuthorized()
                if (!res.isSuccessful) throw IOException("Drive ${res.code}")
                res.body?.string().orEmpty()
            }
        }

    /** Finds the app's folder. Returns null if the user has not created one yet. */
    suspend fun findFolder(token: String): String? {
        val q = "mimeType='application/vnd.google-apps.folder' and " +
            "name='$FOLDER_NAME' and trashed=false and 'root' in parents"
        val body = get(
            "$API/files?q=${q.urlEncoded()}&fields=files(id)&spaces=drive",
            token,
        )
        return StoryJson.parseToJsonElement(body).jsonObject["files"]
            ?.jsonArray?.firstOrNull()?.jsonObject?.get("id")?.jsonPrimitive?.contentOrNull
    }

    /** Lists story files, newest first. */
    suspend fun list(token: String, folderId: String): List<DriveEntry> {
        val q = "'$folderId' in parents and trashed=false and mimeType='application/json'"
        val body = get(
            "$API/files?q=${q.urlEncoded()}" +
                "&fields=files(id,name,modifiedTime,appProperties)" +
                "&orderBy=modifiedTime desc&pageSize=200",
            token,
        )
        val files = StoryJson.parseToJsonElement(body).jsonObject["files"]?.jsonArray
            ?: return emptyList()
        return files.mapNotNull { element ->
            val f = element.jsonObject
            val props = f["appProperties"] as? JsonObject
            // Ignore anything in the folder we did not create (a stray upload,
            // for instance) so a bad file cannot break the whole library.
            if (props?.get("app")?.jsonPrimitive?.contentOrNull != APP_TAG) return@mapNotNull null
            val id = f["id"]?.jsonPrimitive?.contentOrNull ?: return@mapNotNull null
            DriveEntry(
                fileId = id,
                name = f["name"]?.jsonPrimitive?.contentOrNull.orEmpty(),
                modifiedTime = f["modifiedTime"]?.jsonPrimitive?.contentOrNull.orEmpty(),
                title = props["title"]?.jsonPrimitive?.contentOrNull.orEmpty(),
                kind = props["kind"]?.jsonPrimitive?.contentOrNull ?: "story",
            )
        }
    }

    suspend fun downloadStory(token: String, fileId: String): Story =
        StoryJson.decodeFromString(get("$API/files/$fileId?alt=media", token))

    /** Downloads a Drive image as raw bytes for the on-device cache. */
    suspend fun downloadBytes(token: String, fileId: String): ByteArray =
        withContext(Dispatchers.IO) {
            val req = Request.Builder()
                .url("$API/files/$fileId?alt=media")
                .header("Authorization", "Bearer $token")
                .build()
            http.newCall(req).execute().use { res ->
                if (res.code == 401 || res.code == 403) throw NotAuthorized()
                if (!res.isSuccessful) throw IOException("Drive ${res.code}")
                res.body?.bytes() ?: ByteArray(0)
            }
        }

    /** Pictograms are public, so this needs no token. */
    suspend fun downloadPictogram(id: Int): ByteArray = withContext(Dispatchers.IO) {
        val req = Request.Builder()
            .url("https://static.arasaac.org/pictograms/$id/${id}_500.png")
            .build()
        http.newCall(req).execute().use { res ->
            if (!res.isSuccessful) throw IOException("Pictogram ${res.code}")
            res.body?.bytes() ?: ByteArray(0)
        }
    }

    private fun String.urlEncoded() =
        java.net.URLEncoder.encode(this, Charsets.UTF_8.name())

    companion object {
        private const val API = "https://www.googleapis.com/drive/v3"
        const val FOLDER_NAME = "Social Stories"
        const val APP_TAG = "social-stories"

        private fun defaultHttp() = OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
}
