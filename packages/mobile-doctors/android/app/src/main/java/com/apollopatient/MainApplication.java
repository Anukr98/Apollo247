package com.apollopatient;

import android.app.AlertDialog;
import android.app.Application;
import android.content.Context;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.masteratul.exceptionhandler.NativeExceptionHandlerIfc;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerModule;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;

// import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
// import com.opentokreactnative.OTPackage;
// import org.devio.rn.splashscreen.SplashScreenReactPackage;
// import io.invertase.firebase.RNFirebasePackage;
// import com.oblador.vectoricons.VectorIconsPackage;
// import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
// import com.centaurwarchief.smslistener.SmsListenerPackage;
// import com.facebook.react.shell.MainReactPackage;
// import java.util.Arrays;

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
            // new ImagePickerPackage(),
            // new RNFirebasePackage(),
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
            // packages.add(new ReactNativeExceptionHandlerPackage());
            // packages.add(new RNExitAppPackage());
            packages.add(new RNFirebaseAnalyticsPackage());
            packages.add(new RNFirebaseAuthPackage());
            packages.add(new RNFirebaseMessagingPackage());
            packages.add(new RNFirebaseNotificationsPackage());
            // packages.add(new ImagePickerPackage());
            // packages.add(new PickerPackage());
            // packages.add(new AsyncStoragePackage());
            // packages.add(new StreamPackage());
            // packages.add(new RNFirebaseRemoteConfigPackage());
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

        ReactNativeExceptionHandlerModule.setNativeExceptionHandler(new NativeExceptionHandlerIfc() {
            @Override
            public void handleNativeException(Thread thread, Throwable throwable, Thread.UncaughtExceptionHandler originalHandler) {
                // Put your error handling code here
                AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(getApplicationContext());
                alertDialogBuilder.setTitle("Uh oh.. :(");
                alertDialogBuilder.setMessage("Oops! Unexpected error occurred. We have reported this to our team. Please close the app and start again.");
                alertDialogBuilder.setPositiveButton("OK, GOT IT", null);
                AlertDialog alertDialog = alertDialogBuilder.create();
                alertDialog.show();
            }
        });

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
