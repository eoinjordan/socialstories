package org.socialstories.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import org.socialstories.app.LibraryState
import org.socialstories.app.data.CachedStory
import org.socialstories.app.data.Media
import java.io.File

@Composable
fun LibraryScreen(
    state: LibraryState,
    mediaFile: (Media) -> File?,
    onOpen: (CachedStory) -> Unit,
    onRefresh: () -> Unit,
) {
    Scaffold { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp),
        ) {
            Row(
                Modifier.fillMaxWidth().padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("My library", style = MaterialTheme.typography.headlineSmall)
                Button(onClick = onRefresh, enabled = !state.syncing) {
                    Text(if (state.syncing) "Refreshing…" else "Refresh")
                }
            }

            if (state.offline) {
                Card(Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
                    Text(
                        "Offline — showing the copy saved on this device.",
                        Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyLarge,
                    )
                }
            }
            state.message?.let {
                Card(Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
                    Text(it, Modifier.padding(16.dp))
                }
            }

            when {
                state.loading -> Box(Modifier.fillMaxSize(), Alignment.Center) {
                    CircularProgressIndicator()
                }

                state.stories.isEmpty() -> Box(Modifier.fillMaxSize(), Alignment.Center) {
                    Text(
                        "Nothing here yet.\n\nCreate a story on the website, " +
                            "then press Refresh.",
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.bodyLarge,
                    )
                }

                else -> LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 220.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    items(state.stories, key = { it.driveFileId }) { cached ->
                        StoryCard(cached, mediaFile(cached.story.cover), onOpen)
                    }
                }
            }
        }
    }
}

@Composable
private fun StoryCard(
    cached: CachedStory,
    cover: File?,
    onOpen: (CachedStory) -> Unit,
) {
    Card {
        Column(Modifier.padding(16.dp)) {
            Box(
                Modifier.fillMaxWidth().aspectRatio(4f / 3f),
                contentAlignment = Alignment.Center,
            ) {
                if (cover != null && cover.exists()) {
                    AsyncImage(
                        model = cover,
                        contentDescription = null,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.fillMaxSize(),
                    )
                } else {
                    Text("No picture", style = MaterialTheme.typography.bodyLarge)
                }
            }
            Text(
                when {
                    cached.story.purpose == "celebrate" -> "CELEBRATES"
                    cached.story.kind == "pathway" -> "PATHWAY"
                    else -> "STORY"
                },
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                cached.story.title,
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.heightIn(min = 64.dp),
            )
            Text("${cached.story.steps.size} steps")
            OutlinedButton(
                onClick = { onOpen(cached) },
                modifier = Modifier.fillMaxWidth().height(64.dp).padding(top = 12.dp),
            ) {
                Text("Play")
            }
        }
    }
}
