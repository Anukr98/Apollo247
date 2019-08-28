package com.apollopatient;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import com.opentokreactnative.OTPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // <-- Add this line
import io.invertase.firebase.auth.RNFirebaseAuthPackage; 
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.centaurwarchief.smslistener.SmsListenerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

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
            new AsyncStoragePackage(),
            new InCallManagerPackage(),
            new DocumentPickerPackage(),
            new OTPackage(),
            new PickerPackage(),
            new SplashScreenReactPackage(),
            new RNFirebasePackage(),
            new VectorIconsPackage(),
            new RNGestureHandlerPackage(),
            new SmsListenerPackage(),
            new RNFirebaseAnalyticsPackage(), // <-- Add this line
            new RNFirebaseAuthPackage()
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
    SoLoader.init(this, /* native exopackage */ false);
  }
}
