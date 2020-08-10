package com.apollopatient;


import android.app.Activity;
import android.app.ActivityManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;


import com.google.firebase.messaging.FirebaseMessagingService;
import com.webengage.sdk.android.WebEngage;
import com.google.firebase.messaging.RemoteMessage;

import io.vitacloud.life.careplan.VitaTasksNotificationsManager;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class MyFirebaseMessagingService
        extends FirebaseMessagingService {

    private static DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = null;

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        try {
            Log.e("RemoteMessage", remoteMessage.getData().toString());

            String notifDataType = remoteMessage.getData().get("type");
            String startCallType="call_start";
            String disconnectCallType="call_disconnect";
            if(startCallType.equals(notifDataType)|| disconnectCallType.equals(notifDataType)) {
                    showUnlockScreen(remoteMessage,!isAppRunning());
                    return;
            }

            Map<String, String> data = remoteMessage.getData();
            if (data != null && data.containsKey("source") && "webengage".equals(data.get("source"))) {
                WebEngage.get().receive(data);
            } else {
                try {

                    if(remoteMessage.getData().get("author") != null){
                        VitaTasksNotificationsManager.INSTANCE.createNotificationTwilio(this, remoteMessage.getData());
                    } else  {

                            (new io.invertase.firebase.messaging.RNFirebaseMessagingService()).onMessageReceived(remoteMessage);

                    }


                } catch (Exception e) {
                    Log.e("new io.invertase error", e.getMessage() + "\n" + e.toString());
                }
            }
        } catch (Exception e) {
            Log.e("onMessageReceived error", e.getMessage() + "\n" + e.toString());
        }
    }

    private void showUnlockScreen(RemoteMessage remoteMessage,boolean isAppRunning) {
        String notifDataType = remoteMessage.getData().get("type");
        String startCallType="call_start";
        String disconnectCallType="call_disconnect";
        if( startCallType.equals(notifDataType)) {
                Intent i = new Intent(getApplicationContext(), UnlockScreenActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                i.putExtra("DOCTOR_NAME", remoteMessage.getData().get("doctorName"));
                i.putExtra("APPOINTMENT_ID",remoteMessage.getData().get("appointmentId"));
                i.putExtra("APP_STATE",isAppRunning);
                startActivity(i);
        }else if(disconnectCallType.equals((notifDataType))){
            LocalBroadcastManager localBroadcastManager = LocalBroadcastManager
                    .getInstance(MyFirebaseMessagingService.this);
            localBroadcastManager.sendBroadcast(new Intent(
                    "com.unlockscreenactivity.action.close"));
        }
        }

    private boolean isAppRunning() {
        ActivityManager m = (ActivityManager) this.getSystemService( ACTIVITY_SERVICE );
        List<ActivityManager.RunningTaskInfo> runningTaskInfoList =  m.getRunningTasks(10);
        Iterator<ActivityManager.RunningTaskInfo> itr = runningTaskInfoList.iterator();
        int n=0;
        while(itr.hasNext()){
            n++;
            itr.next();
        }
        if(n==1){ // App is killed
            return false;
        }
        return true; // App is in background or foreground
    }
}
