package com.apollopatient.appsignature;


import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.apollopatient.appsignature.AppSignatureHelper;

import java.util.ArrayList;

public class RNAppSignatureHelperModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    public RNAppSignatureHelperModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNAppSignatureHelper";
    }

    @ReactMethod
    public void getAppSignatures(Promise promise) {
        try {
            AppSignatureHelper mAppSignatureHelper = new AppSignatureHelper(reactContext);
            ArrayList<String> list = mAppSignatureHelper.getAppSignatures();
            String[] stringArray = list.toArray(new String[0]);
            WritableArray promiseArray=Arguments.createArray();
            for(int i=0;i<stringArray.length;i++){
                promiseArray.pushString(stringArray[i]);
            }
            promise.resolve(promiseArray);
        }
        catch (Error e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        /**
         *  Before android 6.0 Marshmallow you dont need to ask for canDrawOverlays permission,
         *  but in newer android versions this is mandatory
         */
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this.reactContext)) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + this.reactContext.getPackageName()));
                this.reactContext.startActivityForResult(intent, 0, null);
            } else {
                promise.resolve(true);
            }
        }
        catch (Error e) {
            promise.reject(e);
        }

    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @ReactMethod
    public void isRequestOverlayPermissionGranted(Callback booleanCallback) {
        boolean equal=!Settings.canDrawOverlays(this.reactContext);
        booleanCallback.invoke(equal);
    }

}
