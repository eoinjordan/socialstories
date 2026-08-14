plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "org.socialstories.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.socialstories.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
        // No OAuth client id appears in the app: the Android OAuth client is
        // matched by package name plus signing certificate, which is why
        // android/README.md asks for the release SHA-1 fingerprint instead.
    }

    // Signing comes entirely from the environment, so no keystore or password
    // is ever committed. Absent those variables the release build is simply
    // unsigned, which is fine for CI and for anyone who has cloned the repo.
    signingConfigs {
        create("release") {
            val keystore = System.getenv("ANDROID_KEYSTORE_PATH")
            if (!keystore.isNullOrBlank()) {
                storeFile = file(keystore)
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_KEY_ALIAS")
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
                .takeIf { !System.getenv("ANDROID_KEYSTORE_PATH").isNullOrBlank() }
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    lint {
        // Fail the build on real errors, but do not let a new lint check in a
        // future AGP version block a release over style.
        abortOnError = true
        warningsAsErrors = false
    }
}

/**
 * The bundled symbol set is shared with the web app rather than duplicated in
 * git: both ship the identical pictograms, so a story looks the same on a
 * tablet as it did in the editor, and the picker works with no network.
 *
 * Images are ARASAAC pictograms (Sergio Palao / Government of Aragon),
 * CC BY-NC-SA. See web/public/symbols/LICENSE.txt.
 */
val bundleSymbols = tasks.register<Copy>("bundleSymbols") {
    from(rootProject.file("../web/public/symbols")) {
        include("*.png")
        include("LICENSE.txt")
    }
    into(layout.buildDirectory.dir("generated/symbolAssets/symbols"))
}

android.sourceSets.getByName("main").assets
    .srcDir(layout.buildDirectory.dir("generated/symbolAssets"))

tasks.named("preBuild") { dependsOn(bundleSymbols) }

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.okhttp)
    implementation(libs.coil.compose)
    implementation(libs.play.services.auth)
    debugImplementation(libs.androidx.ui.tooling)
}
