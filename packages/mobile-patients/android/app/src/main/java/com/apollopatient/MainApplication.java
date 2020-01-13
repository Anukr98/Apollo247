package com.apollopatient;

import android.app.Application;

import com.crashlytics.android.Crashlytics;
import com.facebook.react.ReactApplication;
import com.opentokreactnative.OTPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.imagepicker.ImagePickerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import org.wonday.pdf.RCTPdfView;
import com.bugsnag.BugsnagReactNative;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.heanoria.library.reactnative.locationenabler.RNAndroidLocationEnablerPackage;
import io.fabric.sdk.android.Fabric;
import io.github.mr03web.softinputmode.SoftInputModePackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // <-- Add this line
import io.invertase.firebase.auth.RNFirebaseAuthPackage; 
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage; // <-- Add this line
import io.invertase.firebase.database.RNFirebaseDatabasePackage; // <-- Add this line

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new OTPackage(),
            new RNFirebasePackage(),
            new VectorIconsPackage(),
            new SplashScreenReactPackage(),
            new DocumentPickerPackage(),
            new AsyncStoragePackage(),
            new RNDeviceInfo(),
            new InCallManagerPackage(),
            new KCKeepAwakePackage(),
            new PickerPackage(),
            new ImagePickerPackage(),
            new RNGestureHandlerPackage(),
            new RCTPdfView(),
            BugsnagReactNative.getPackage(),
            new RNFetchBlobPackage(),
            new RNAndroidLocationEnablerPackage(),
            new SoftInputModePackage(),
            new RNFirebaseAnalyticsPackage(), // <-- Add this line
            new RNFirebaseAuthPackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseRemoteConfigPackage(),
            new RNFirebaseNotificationsPackage(),
            new RNFirebaseDatabasePackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fabric.with(this, new Crashlytics());
    SoLoader.init(this, /* native exopackage */ false);
  }
}
