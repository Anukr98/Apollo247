package com.apollopatient;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.webengage.sdk.android.WebEngage;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class MyFirebaseMessagingService
        extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Map<String, String> data = remoteMessage.getData();
        if (data != null && data.containsKey("source") && "webengage".equals(data.get("source"))) {
            WebEngage.get().receive(data);
        } else {
            (new io.invertase.firebase.messaging.RNFirebaseMessagingService()).onMessageReceived(remoteMessage);
        }
    }
}
