# kotlinx.serialization keeps its generated serializers via companion objects.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class org.socialstories.app.data.** {
    *** Companion;
}
-keepclasseswithmembers class org.socialstories.app.data.** {
    kotlinx.serialization.KSerializer serializer(...);
}
