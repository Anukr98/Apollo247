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
    private static Activity ma;
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        try {
            Log.e("RemoteMessage", remoteMessage.getData().toString());

//                ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
//                ReactContext context = mReactInstanceManager.getCurrentReactContext();
            String notifDataType = remoteMessage.getData().get("type");
            String startCallType="call_started";
            String disconnectCallType="call_disconnected";
            if(startCallType.equals(notifDataType)|| disconnectCallType.equals(notifDataType)) {
                isAppRunning();
                startActiviy();
                showUnlockScreen(remoteMessage);
                return;
            }

            Map<String, String> data = remoteMessage.getData();
            if (data != null && data.containsKey("source") && "webengage".equals(data.get("source"))) {
                WebEngage.get().receive(data);
            } else {
                try {
                    // Log.e("Invertase", remoteMessage.getData().toString());

                    if(remoteMessage.getData().get("author") != null){
                        VitaTasksNotificationsManager.INSTANCE.createNotificationTwilio(this, remoteMessage.getData());
                    } else  {

                            (new io.invertase.firebase.messaging.RNFirebaseMessagingService()).onMessageReceived(remoteMessage);

                    }


                } catch (Exception e) {
                    Log.e("new io.invertase error", e.getMessage() + "\n" + e.toString());
                }
            }
            //start

            //end
        } catch (Exception e) {
            Log.e("onMessageReceived error", e.getMessage() + "\n" + e.toString());
        }
    }

    private void showUnlockScreen(RemoteMessage remoteMessage) {
        String notifDataType = remoteMessage.getData().get("type");
        String startCallType="call_started";
        String disconnectCallType="call_disconnected";
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("NOTIF_MESSAGE_TYPE", notifDataType);
        editor.commit();
        Log.e("RemoteMessageUnScreen", String.valueOf(disconnectCallType.equals(notifDataType)));
        if( startCallType.equals(notifDataType)) {
                Intent i = new Intent(getApplicationContext(), UnlockScreenActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                i.putExtra("DOCTOR_NAME", remoteMessage.getData().get("doctor_name"));
                startActivity(i);
        }
        }
    @ReactMethod
    public  void  startActiviy() {
        Intent intent = new Intent(ma,MainActivity.class);
        ma.startActivity(intent);
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
            Log.e("AppKilled==", String.valueOf("app killed"));
            return false;
        }
        Log.e("AppRunning==", String.valueOf("app running"));
        return true; // App is in background or foreground
    }
}
