package com.apollopatient;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.bugsnag.BugsnagReactNative;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.imagepicker.ImagePickerPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.geolocation.GeolocationPackage;

// import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
// import com.opentokreactnative.OTPackage;
// import org.devio.rn.splashscreen.SplashScreenReactPackage;
// import io.invertase.firebase.RNFirebasePackage;
// import com.oblador.vectoricons.VectorIconsPackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage; 
// import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
// import com.centaurwarchief.smslistener.SmsListenerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
// import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;

import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;

// import java.util.Arrays;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
            // new MainReactPackage(),

           // new PickerPackage(),
            //new ImagePickerPackage(),
//            new RNFirebasePackage(),
            // new DocumentPickerPackage(),
            // new OTPackage(),
            // new SplashScreenReactPackage(),
            // new RNFirebasePackage(),
            // new VectorIconsPackage(),
            // new RNGestureHandlerPackage(),
            // new SmsListenerPackage(),
            // new RNFirebaseAnalyticsPackage(), // <-- Add this line
            // new RNFirebaseAuthPackage(),
            // new RNFirebaseMessagingPackage(),
            // new RNFirebaseNotificationsPackage()
            packages.add(new RNFirebaseAnalyticsPackage());
            packages.add(new RNFirebaseAuthPackage());
            packages.add(new RNFirebaseMessagingPackage());
            packages.add(new RNFirebaseNotificationsPackage());
//      packages.add(new ImagePickerPackage());
//      packages.add(new PickerPackage());

//            packages.add(new AsyncStoragePackage());
//            packages.add(new StreamPackage());
//            packages.add(new RNFirebaseRemoteConfigPackage());
          return packages;
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
    initializeFlipper(this); // Remove this line if you don't want Flipper enabled
  }
   /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  private static void initializeFlipper(Context context) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
