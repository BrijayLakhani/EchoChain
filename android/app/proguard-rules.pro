# Add project specific ProGuard rules here.
# Appended to the default proguard-android.txt (see build.gradle proguardFiles).

# ── React Native core / Hermes ────────────────────────────────────────────
-keep,allowobfuscation @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

# ── Reanimated / Worklets ─────────────────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }

# ── Gesture Handler ───────────────────────────────────────────────────────
-keep class com.swmansion.gesturehandler.** { *; }

# ── react-native-svg (heavily used on the Journey screen) ─────────────────
-keep class com.horcrux.svg.** { *; }
-keepnames class com.horcrux.svg.** { *; }
-dontwarn com.horcrux.svg.**

# ── Lottie ────────────────────────────────────────────────────────────────
-keep class com.airbnb.lottie.** { *; }
-dontwarn com.airbnb.lottie.**

# ── Keep JS-callable native modules & view managers generally ─────────────
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
