package com.apollopatient;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.bugfender.react.RNBugfenderPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.appsflyer.reactnative.RNAppsFlyerPackage;
import com.webengage.sdk.android.WebEngage;
import com.webengage.sdk.android.WebEngageConfig;
import com.webengage.sdk.android.WebEngageActivityLifeCycleCallbacks;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.imagepicker.ImagePickerPackage;
import com.opentokreactnative.OTPackage;
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.bugsnag.BugsnagReactNative;
import org.wonday.pdf.RCTPdfView;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.heanoria.library.reactnative.locationenabler.RNAndroidLocationEnablerPackage;
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import com.webengage.sdk.android.WebEngage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.List;
import com.masteratul.exceptionhandler.NativeExceptionHandlerIfc;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerModule;
import android.app.AlertDialog;
import com.webengage.sdk.android.Analytics;


// import com.reactnative.ivpusic.imagepicker.PickerPackage;
// import com.corbt.keepawake.KCKeepAwakePackage;
// import com.RNFetchBlob.RNFetchBlobPackage;
// import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
// import com.learnium.RNDeviceInfo.RNDeviceInfo;
// import com.zxcpoiu.incallmanager.InCallManagerPackage;
// import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
// import com.opentokreactnative.OTPackage;
// import org.devio.rn.splashscreen.SplashScreenReactPackage;
// import io.invertase.firebase.RNFirebasePackage;
// import com.oblador.vectoricons.VectorIconsPackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // <-- Add this line
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
// import com.facebook.react.shell.MainReactPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage; // <-- Add this line
import io.invertase.firebase.database.RNFirebaseDatabasePackage; // <-- Add this line
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
            new ReactNativeHost(this) {
                @Override
                public boolean getUseDeveloperSupport() {
                    return BuildConfig.DEBUG;
                }

                @Override
                protected List<ReactPackage> getPackages() {
                    @SuppressWarnings("UnnecessaryLocalVariable")
                    List<ReactPackage> packages = new PackageList(this).getPackages();
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // packages.add(new MyReactNativePackage());

                    // packages.add(new PickerPackage());
                    // packages.add(new KCKeepAwakePackage());
                    // packages.add(new RNFetchBlobPackage());
                    // packages.add(new AsyncStoragePackage());
                    // packages.add(new RNDeviceInfo());
                    // packages.add(new InCallManagerPackage());
                    // packages.add(new DocumentPickerPackage());
                    // packages.add(new OTPackage());
                    // packages.add(new SplashScreenReactPackage());
                    // packages.add(new RNFirebasePackage());
                    // packages.add(new VectorIconsPackage());
                    // packages.add(new RNGestureHandlerPackage());
                    packages.add(new RNFirebaseAnalyticsPackage());
                    packages.add(new RNFirebaseAuthPackage());
                    packages.add(new RNFirebaseMessagingPackage());
                    packages.add(new RNFirebaseNotificationsPackage());
                    packages.add(new StreamPackage());
                    packages.add(new RNFirebaseRemoteConfigPackage());
                    packages.add(new RNFirebaseDatabasePackage());
                    // packages.add(new ReactNativeExceptionHandlerPackage());
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

        FirebaseInstanceId.getInstance().getInstanceId().addOnSuccessListener(new OnSuccessListener<InstanceIdResult>() {
            @Override
            public void onSuccess(InstanceIdResult instanceIdResult) {
                String token = instanceIdResult.getToken();
                WebEngage.get().setRegistrationID(token);
            }
        });

        Fabric.with(this, new Crashlytics());
        SoLoader.init(this, /* native exopackage */ false);
        initializeFlipper(this); // Remove this line if you don't want Flipper enabled

        WebEngageConfig webEngageConfig = new WebEngageConfig.Builder()
                .setWebEngageKey("in~~c2ab3533")
                .setDebugMode(false) // only in development mode
                .build();
        registerActivityLifecycleCallbacks(new WebEngageActivityLifeCycleCallbacks(this, webEngageConfig));

        ReactNativeExceptionHandlerModule.setNativeExceptionHandler(new NativeExceptionHandlerIfc() {
            @Override
            public void handleNativeException(Thread thread, Throwable throwable, Thread.UncaughtExceptionHandler originalHandler) {
                // Put your error handling code here
                AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(getApplicationContext());
                alertDialogBuilder.setTitle("Uh oh.. :(");
                alertDialogBuilder.setMessage("Oops! Unexpected error occurred. We have reported this to our team. Please close the app and start again.");
                alertDialogBuilder.setPositiveButton("OK, GOT IT",null);
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
