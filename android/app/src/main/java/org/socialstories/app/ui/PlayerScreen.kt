package org.socialstories.app.ui

import android.speech.tts.TextToSpeech
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import kotlinx.coroutines.delay
import org.socialstories.app.data.Media
import org.socialstories.app.data.Story
import java.util.Locale

private const val EXIT_HOLD_MS = 3000L

/**
 * Full-screen play mode — the part a supported person actually uses.
 *
 * One picture, one sentence, two very large buttons. When the story is set to
 * "stay locked open", the exit control needs a three-second hold so that an
 * accidental tap (or a deliberate one from someone who does not want to do the
 * routine) cannot close it.
 */
@Composable
fun PlayerScreen(
    story: Story,
    mediaModel: (Media) -> Any?,
    onExit: () -> Unit,
) {
    val context = LocalContext.current
    var index by remember { mutableIntStateOf(0) }
    val step = story.steps.getOrNull(index)
    val dark = story.display.highContrast

    // Text-to-speech. Created once for the screen and shut down with it,
    // because leaking an engine keeps an audio focus request alive.
    var tts by remember { mutableStateOf<TextToSpeech?>(null) }
    DisposableEffect(Unit) {
        var engine: TextToSpeech? = null
        engine = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                engine?.language = Locale.getDefault()
                engine?.setSpeechRate(0.85f)
                tts = engine
            }
        }
        onDispose {
            engine?.stop()
            engine?.shutdown()
            tts = null
        }
    }

    LaunchedEffect(index, tts, story.display.readAloud) {
        if (!story.display.readAloud) return@LaunchedEffect
        val engine = tts ?: return@LaunchedEffect
        val phrase = listOfNotNull(step?.text, step?.spoken)
            .filter { it.isNotBlank() }
            .joinToString(". ")
        if (phrase.isBlank()) return@LaunchedEffect
        engine.speak(phrase, TextToSpeech.QUEUE_FLUSH, null, "step-$index")
    }

    // Unattended radiator mode: advance on a timer and loop.
    LaunchedEffect(index, story.display.autoAdvanceSeconds) {
        val secs = story.display.autoAdvanceSeconds
        if (secs <= 0 || story.steps.isEmpty()) return@LaunchedEffect
        delay(secs * 1000L)
        index = (index + 1) % story.steps.size
    }

    SocialStoriesTheme(dark = dark) {
        Box(
            Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
        ) {
            Column(Modifier.fillMaxSize().padding(20.dp)) {
                ExitControl(locked = story.display.lockOpen, onExit = onExit)

                Column(
                    Modifier.weight(1f).fillMaxWidth(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    val picture = step?.media?.let(mediaModel)
                    if (picture != null) {
                        AsyncImage(
                            model = picture,
                            contentDescription = null,
                            contentScale = ContentScale.Fit,
                            modifier = Modifier.weight(1f).fillMaxWidth(),
                        )
                    }
                    Text(
                        text = step?.text?.takeIf { it.isNotBlank() } ?: story.title,
                        fontSize = (34 * story.display.textScale).sp,
                        lineHeight = (44 * story.display.textScale).sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 24.dp),
                    )
                }

                StepDots(total = story.steps.size, current = index)

                Row(
                    Modifier.fillMaxWidth().padding(top = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    OutlinedButton(
                        onClick = { if (index > 0) index-- },
                        enabled = index > 0,
                        modifier = Modifier.weight(1f).height(96.dp),
                    ) {
                        Text("← Back", fontSize = 24.sp)
                    }
                    Button(
                        onClick = {
                            when {
                                index < story.steps.lastIndex -> index++
                                story.display.lockOpen -> index = 0
                                else -> onExit()
                            }
                        },
                        modifier = Modifier.weight(1f).height(96.dp),
                    ) {
                        Text(
                            when {
                                index < story.steps.lastIndex -> "Next →"
                                story.display.lockOpen -> "Start again"
                                else -> "Finished"
                            },
                            fontSize = 24.sp,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ExitControl(locked: Boolean, onExit: () -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
        if (!locked) {
            OutlinedButton(onClick = onExit) { Text("Exit") }
            return@Row
        }

        var pressed by remember { mutableStateOf(false) }
        var progress by remember { mutableFloatStateOf(0f) }

        // Progress runs only while the finger is down. Lifting early cancels
        // this effect, which resets it — so a stray tap does nothing at all.
        LaunchedEffect(pressed) {
            if (!pressed) {
                progress = 0f
                return@LaunchedEffect
            }
            val start = System.currentTimeMillis()
            while (true) {
                val held = System.currentTimeMillis() - start
                progress = (held.toFloat() / EXIT_HOLD_MS).coerceIn(0f, 1f)
                if (held >= EXIT_HOLD_MS) {
                    pressed = false
                    onExit()
                    return@LaunchedEffect
                }
                delay(50)
            }
        }

        Column(horizontalAlignment = Alignment.End) {
            OutlinedButton(
                onClick = {},
                modifier = Modifier.pointerInput(Unit) {
                    detectTapGestures(
                        onPress = {
                            pressed = true
                            tryAwaitRelease()
                            pressed = false
                        },
                    )
                },
            ) {
                Text("Hold to exit")
            }
            if (progress > 0f) {
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxWidth(0.4f).padding(top = 4.dp),
                )
            }
        }
    }
}

@Composable
private fun StepDots(total: Int, current: Int) {
    Row(
        Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
    ) {
        repeat(total) { i ->
            Box(
                Modifier
                    .size(if (i == current) 20.dp else 14.dp)
                    .clip(CircleShape)
                    .background(
                        if (i <= current) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.secondary.copy(alpha = 0.3f),
                    ),
            )
        }
    }
}
