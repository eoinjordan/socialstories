package org.socialstories.app.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Deliberately plain and low-contrast-free: flat colours, no gradients, strong
 * text/background contrast, and larger-than-default type everywhere. We do not
 * use dynamic colour — a palette that changes with the wallpaper would make the
 * app look different from one day to the next, which is exactly what we want to
 * avoid for users who rely on it being predictable.
 */
private val Light = lightColorScheme(
    primary = Color(0xFF1F5C3D),
    onPrimary = Color.White,
    secondary = Color(0xFF4A4A4A),
    background = Color(0xFFF6F4EF),
    onBackground = Color(0xFF1A1A1A),
    surface = Color.White,
    onSurface = Color(0xFF1A1A1A),
    error = Color(0xFF8A2020),
)

/** Used for the "low stimulation" display option as well as system dark mode. */
private val Dark = darkColorScheme(
    primary = Color(0xFF7FD6A5),
    onPrimary = Color(0xFF062015),
    secondary = Color(0xFFC9C9C9),
    background = Color(0xFF0D0D0D),
    onBackground = Color(0xFFF5F5F5),
    surface = Color(0xFF1C1C1C),
    onSurface = Color(0xFFF5F5F5),
    error = Color(0xFFFF8A80),
)

private val AppTypography = Typography(
    displayMedium = TextStyle(fontSize = 40.sp, lineHeight = 48.sp, fontWeight = FontWeight.Bold),
    headlineSmall = TextStyle(fontSize = 24.sp, lineHeight = 32.sp, fontWeight = FontWeight.Bold),
    bodyLarge = TextStyle(fontSize = 20.sp, lineHeight = 30.sp),
    labelLarge = TextStyle(fontSize = 20.sp, fontWeight = FontWeight.Bold),
)

@Composable
fun SocialStoriesTheme(
    dark: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (dark) Dark else Light,
        typography = AppTypography,
        content = content,
    )
}
