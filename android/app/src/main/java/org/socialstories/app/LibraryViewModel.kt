package org.socialstories.app

import android.app.Application
import android.app.PendingIntent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.socialstories.app.auth.GoogleAuth
import org.socialstories.app.data.CachedStory
import org.socialstories.app.data.DriveClient
import org.socialstories.app.data.StoryRepository
import java.io.IOException

data class LibraryState(
    val stories: List<CachedStory> = emptyList(),
    val loading: Boolean = true,
    val syncing: Boolean = false,
    /** Set when we showed the cache because Drive was unreachable. */
    val offline: Boolean = false,
    val message: String? = null,
    /** Non-null when the user has to approve Drive access. */
    val consent: PendingIntent? = null,
)

class LibraryViewModel(app: Application) : AndroidViewModel(app) {

    private val repo = StoryRepository(app)
    private val auth = GoogleAuth(app)

    private val _state = MutableStateFlow(LibraryState())
    val state: StateFlow<LibraryState> = _state.asStateFlow()

    init {
        // Show whatever is on the device immediately, then try to refresh. The
        // library must never be blank just because the network is slow.
        viewModelScope.launch {
            _state.value = _state.value.copy(stories = repo.cachedStories(), loading = false)
            sync()
        }
    }

    fun sync() {
        if (_state.value.syncing) return
        viewModelScope.launch {
            _state.value = _state.value.copy(syncing = true, message = null)
            try {
                when (val outcome = auth.authorize()) {
                    is GoogleAuth.Outcome.NeedsConsent ->
                        _state.value = _state.value.copy(
                            syncing = false,
                            consent = outcome.pendingIntent,
                        )

                    is GoogleAuth.Outcome.Token -> syncWithToken(outcome.accessToken)
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    syncing = false,
                    offline = true,
                    message = "Could not reach Google. Showing the saved copy.",
                )
            }
        }
    }

    fun onConsentResult(data: android.content.Intent?) {
        val token = auth.tokenFromConsent(data)
        _state.value = _state.value.copy(consent = null)
        if (token == null) {
            _state.value = _state.value.copy(message = "Drive access was not granted.")
            return
        }
        viewModelScope.launch {
            _state.value = _state.value.copy(syncing = true)
            syncWithToken(token)
        }
    }

    fun consentHandled() {
        _state.value = _state.value.copy(consent = null)
    }

    fun dismissMessage() {
        _state.value = _state.value.copy(message = null)
    }

    private suspend fun syncWithToken(token: String) {
        try {
            val result = repo.sync(token)
            _state.value = _state.value.copy(
                stories = repo.cachedStories(),
                syncing = false,
                offline = false,
                message = when {
                    result.updated == 0 && result.removed == 0 -> null
                    else -> "Updated ${result.updated}, removed ${result.removed}."
                },
            )
        } catch (e: DriveClient.NotAuthorized) {
            _state.value = _state.value.copy(
                syncing = false,
                message = "Google access expired. Press refresh to sign in again.",
            )
        } catch (e: IOException) {
            _state.value = _state.value.copy(
                syncing = false,
                offline = true,
                stories = repo.cachedStories(),
                message = null,
            )
        }
    }

    fun repository(): StoryRepository = repo
}
