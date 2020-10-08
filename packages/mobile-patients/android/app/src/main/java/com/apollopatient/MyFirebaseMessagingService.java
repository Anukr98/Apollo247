package com.apollopatient;


import android.app.Activity;
import android.app.ActivityManager;
import android.app.Notification;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.Ringtone;
import android.os.SystemClock;
import android.preference.PreferenceManager;
import android.provider.Settings;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.style.ForegroundColorSpan;
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

import androidx.annotation.ColorRes;
import androidx.annotation.RequiresApi;
import androidx.annotation.StringRes;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;


import com.google.firebase.messaging.FirebaseMessagingService;
import com.webengage.sdk.android.WebEngage;
import com.google.firebase.messaging.RemoteMessage;

import io.vitacloud.life.careplan.VitaTasksNotificationsManager;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

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


    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        try {
            Log.e("RemoteMessage", remoteMessage.getData().toString());
            String notifDataType = remoteMessage.getData().get("type");
            String startCallType="call_start";
            String disconnectCallType="call_disconnect";

            if(startCallType.equals(notifDataType)|| disconnectCallType.equals(notifDataType)) {
                if(!Settings.canDrawOverlays(this) && startCallType.equals(notifDataType)){
                    sendNotifications(remoteMessage);
                    return;
                }else {
                    showUnlockScreen(remoteMessage, !isAppRunning());
                    return;
                }

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
                i.putExtra("CALL_TYPE",remoteMessage.getData().get("callType"));
                i.putExtra("APP_STATE",isAppRunning);
                startActivity(i);
        }else if(disconnectCallType.equals((notifDataType))){
            LocalBroadcastManager localBroadcastManager = LocalBroadcastManager
                    .getInstance(MyFirebaseMessagingService.this);
            localBroadcastManager.sendBroadcast(new Intent(
                    "com.unlockscreenactivity.action.close"));
        }
        }

    private Spannable getActionText(String title, @ColorRes int colorRes) {
        Spannable spannable = new SpannableString(title);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N_MR1) {
            spannable.setSpan(
                    new ForegroundColorSpan(this.getColor(colorRes)), 0, spannable.length(), 0);
        }
        return spannable;
    }

    private void sendNotifications(RemoteMessage remoteMessage){
        String appointment_id=remoteMessage.getData().get("appointmentId");
        String incoming_call_type=remoteMessage.getData().get("callType");
        String doctorName=remoteMessage.getData().get("doctorName");
        String deeplinkUri="apollopatients://DoctorCall?"+appointment_id+'+'+incoming_call_type;
        Uri uri = Uri.parse(deeplinkUri);
        Uri uri_home=Uri.parse("apollopatients://ConsultRoom");
        int oneTimeID = (int) SystemClock.uptimeMillis();

        //on notif click start
        Intent intent = new Intent(Intent.ACTION_VIEW,uri);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
                PendingIntent.FLAG_ONE_SHOT);
        //on notif click end


        String channelId = "fcm_FirebaseNotifiction_call_channel";
        String channelName = "Apollo 247 Incoming Call";
        Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);

        //
        int notificationId = new Random().nextInt();
        PendingIntent acptIntent = NotificationActivity.getAcceptIntent(oneTimeID,uri,this);
        PendingIntent rjctIntent = NotificationActivity.getRejectIntent(oneTimeID,uri_home, this);
        //



        long[] v = {500,1000};

        NotificationCompat.Action acceptCall=new NotificationCompat.Action.Builder(R.drawable.acpt_btn,getActionText("Answer",android.R.color.holo_green_light),acptIntent).build();
        NotificationCompat.Action rejectCall=new NotificationCompat.Action.Builder(R.drawable.rjt_btn,getActionText("Decline",android.R.color.holo_red_light),rjctIntent).build();

        NotificationCompat.Builder notificationBuilder =
            new NotificationCompat.Builder(this, channelId)
                    .setContentTitle(doctorName)
                    .setContentText((channelName))
                    .setSmallIcon(R.drawable.ic_notification_white)
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_CALL)
                    .setAutoCancel(true)
                    .setVibrate(v)
                    .setSound(incoming_call_notif)
                    .addAction(acceptCall)
                    .addAction(rejectCall)
                    .setFullScreenIntent(acptIntent, true)
                    .setContentIntent(pendingIntent);

        Log.e("notificationBuilder", String.valueOf(notificationId));
        NotificationManager notificationManager =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        try {
            Ringtone r = RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
            r.play();
        } catch (Exception e) {
            e.printStackTrace();
        }

        int importance = NotificationManager.IMPORTANCE_MAX;

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel mChannel = new NotificationChannel(
                    channelId, channelName, importance);
            notificationManager.createNotificationChannel(mChannel);
        }

        notificationManager.notify(oneTimeID, notificationBuilder.build());
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
