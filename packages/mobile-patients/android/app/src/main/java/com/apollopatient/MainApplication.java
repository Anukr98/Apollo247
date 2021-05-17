package com.apollopatient;

import android.app.Application;

import com.BV.LinearGradient.LinearGradientPackage;
import com.apollopatient.appsignature.RNAppSignatureHelperPackage;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.appsflyer.reactnative.RNAppsFlyerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import com.microsoft.codepush.react.CodePush;
import com.webengage.sdk.android.WebEngage;
import com.webengage.sdk.android.WebEngageActivityLifeCycleCallbacks;
import com.webengage.sdk.android.WebEngageConfig;

import java.util.List;

import io.reactivex.Observable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.schedulers.Schedulers;

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

        SoLoader.init(this, /* native exopackage */ false);
        initAppComponents();
    }

    private void initAppComponents() {
        Observable.fromCallable(() -> {
            try {
                FirebaseInstanceId.getInstance().getInstanceId().addOnSuccessListener(new OnSuccessListener<InstanceIdResult>() {
                    @Override
                    public void onSuccess(InstanceIdResult instanceIdResult) {
                        String token = instanceIdResult.getToken();
                        WebEngage.get().setRegistrationID(token);
                    }
                });

                WebEngageConfig webEngageConfig = new WebEngageConfig.Builder()
                        .setWebEngageKey("in~~c2ab3533")
                        .setDebugMode(false) // only in development mode
                        .build();

                registerActivityLifecycleCallbacks(new WebEngageActivityLifeCycleCallbacks(this, webEngageConfig));

                return true;
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe((result) -> {
                }, Throwable::printStackTrace);

    }
}
