package com.apollopatient;

import android.app.AlertDialog;
import android.app.Application;
import android.content.Context;

import com.BV.LinearGradient.LinearGradientPackage;
import com.apollopatient.appsignature.RNAppSignatureHelperPackage;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import com.masteratul.exceptionhandler.NativeExceptionHandlerIfc;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerModule;
import com.apollopatient.GetReferrerPackage;

import com.microsoft.codepush.react.CodePush;
import com.webengage.sdk.android.WebEngage;
import com.webengage.sdk.android.WebEngageActivityLifeCycleCallbacks;
import com.webengage.sdk.android.WebEngageConfig;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
            new ReactNativeHost(this) {
                @Override
                protected String getJSBundleFile() {
                    return CodePush.getJSBundleFile();
                }

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
                    packages.add(new StreamPackage());
                    packages.add(new RNAppSignatureHelperPackage());
                    packages.add(new LinearGradientPackage());
                    packages.add(new GetReferrerPackage());
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
