package org.socialstories.app

import android.app.Activity
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import org.socialstories.app.data.CachedStory
import org.socialstories.app.ui.LibraryScreen
import org.socialstories.app.ui.PlayerScreen
import org.socialstories.app.ui.SocialStoriesTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        setContent {
            SocialStoriesTheme {
                AppRoot()
            }
        }
    }

    /**
     * Screen pinning. On an ordinary device Android shows a confirmation the
     * first time, and the standard back+overview gesture releases it; on a
     * device where this app is set as device owner it locks hard. Either way it
     * stops a story being swiped away by accident.
     */
    fun setKiosk(enabled: Boolean) {
        runCatching {
            if (enabled) startLockTask() else stopLockTask()
        }
        window.setFlags(
            if (enabled) WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON else 0,
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
        )
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        if (enabled) {
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } else {
            controller.show(WindowInsetsCompat.Type.systemBars())
        }
    }
}

@Composable
private fun AppRoot(vm: LibraryViewModel = viewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    var open by remember { mutableStateOf<CachedStory?>(null) }

    // Google's consent screen arrives as a PendingIntent we have to launch.
    val consentLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult(),
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            vm.onConsentResult(result.data)
        } else {
            vm.consentHandled()
        }
    }
    LaunchedEffect(state.consent) {
        val pending = state.consent ?: return@LaunchedEffect
        consentLauncher.launch(IntentSenderRequest.Builder(pending.intentSender).build())
    }

    val story = open
    if (story == null) {
        LibraryScreen(
            state = state,
            mediaModel = { vm.repository().mediaModel(it) },
            onOpen = { open = it },
            onRefresh = vm::sync,
        )
        return
    }

    // Kiosk mode is entered when a locked story opens and released when it
    // closes, so the rest of the device stays usable in between.
    DisposableEffect(story.driveFileId, story.story.display.lockOpen) {
        val activity = context as? MainActivity
        if (story.story.display.lockOpen) activity?.setKiosk(true)
        onDispose { activity?.setKiosk(false) }
    }

    PlayerScreen(
        story = story.story,
        mediaModel = { vm.repository().mediaModel(it) },
        onExit = { open = null },
    )
}
