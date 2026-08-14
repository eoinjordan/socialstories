package org.socialstories.app.auth

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.google.android.gms.auth.api.identity.AuthorizationRequest
import com.google.android.gms.auth.api.identity.AuthorizationResult
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.api.Scope
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Google authorization for Drive access.
 *
 * We ask only for `drive.file`, the narrowest scope that does the job: the app
 * can see the files it created and nothing else in the user's Drive. Consent is
 * requested once; afterwards Play Services hands back a fresh access token
 * silently, so a carer is not asked to sign in again every hour.
 */
class GoogleAuth(private val context: Context) {

    sealed interface Outcome {
        /** A usable access token. */
        data class Token(val accessToken: String) : Outcome

        /** The user must approve; launch this and feed the result back in. */
        data class NeedsConsent(val pendingIntent: PendingIntent) : Outcome
    }

    private val request = AuthorizationRequest.builder()
        .setRequestedScopes(listOf(Scope(DRIVE_FILE_SCOPE)))
        .build()

    suspend fun authorize(): Outcome = suspendCancellableCoroutine { cont ->
        Identity.getAuthorizationClient(context)
            .authorize(request)
            .addOnSuccessListener { result -> cont.resume(result.toOutcome()) }
            .addOnFailureListener { e -> cont.resumeWithException(e) }
    }

    /** Reads the token out of the consent screen's result intent. */
    fun tokenFromConsent(data: Intent?): String? = runCatching {
        Identity.getAuthorizationClient(context)
            .getAuthorizationResultFromIntent(data)
            .accessToken
    }.getOrNull()

    private fun AuthorizationResult.toOutcome(): Outcome {
        val resolution = pendingIntent
        return when {
            hasResolution() && resolution != null -> Outcome.NeedsConsent(resolution)
            accessToken != null -> Outcome.Token(accessToken!!)
            // Play Services says no resolution is needed but gave us nothing —
            // treat as "not authorized" rather than crashing the sync.
            else -> Outcome.NeedsConsent(
                PendingIntent.getActivity(
                    context,
                    0,
                    Intent(),
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
                ),
            )
        }
    }

    companion object {
        const val DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file"
    }
}
