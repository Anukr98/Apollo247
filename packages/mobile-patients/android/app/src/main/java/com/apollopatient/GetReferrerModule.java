package com.apollopatient;
import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


public class GetReferrerModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    GetReferrerModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "GetReferrer";
    }

    @ReactMethod
    public void referrer(Promise promise) {
        Context context = getReactApplicationContext();
        promise.resolve(MainActivity.getIntentReferrer());
    }
}
