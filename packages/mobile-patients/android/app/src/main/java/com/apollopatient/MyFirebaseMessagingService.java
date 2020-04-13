package com.apollopatient;

import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.webengage.sdk.android.WebEngage;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class MyFirebaseMessagingService
        extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        try {
            Map<String, String> data = remoteMessage.getData();
            if (data != null && data.containsKey("source") && "webengage".equals(data.get("source"))) {
                WebEngage.get().receive(data);
            } else {
                try {
                    (new io.invertase.firebase.messaging.RNFirebaseMessagingService()).onMessageReceived(remoteMessage);
                } catch (Exception e) {
                    Log.e("new io.invertase error", e.getMessage() + "\n" + e.toString());
                }
            }
        } catch (Exception e) {
            Log.e("onMessageReceived error", e.getMessage() + "\n" + e.toString());
        }
    }
}
