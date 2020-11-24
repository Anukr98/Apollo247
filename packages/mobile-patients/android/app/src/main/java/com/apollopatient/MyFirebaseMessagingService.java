package com.apollopatient;

import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.SystemClock;
import android.provider.Settings;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.style.ForegroundColorSpan;
import android.util.Log;

import androidx.annotation.ColorRes;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.webengage.sdk.android.WebEngage;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;

import io.vitacloud.life.careplan.VitaTasksNotificationsManager;

public class MyFirebaseMessagingService
        extends FirebaseMessagingService {

    private static DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = null;

    @Override
    public void onNewToken(String s) {
        super.onNewToken(s);
        WebEngage.get().setRegistrationID(s);
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        try {
            Log.e("RemoteMessage", remoteMessage.getData().toString());
            String notifDataType = remoteMessage.getData().get("type");
            String startCallType = "call_start";
            String disconnectCallType = "call_disconnect";

            if (startCallType.equals(notifDataType) || disconnectCallType.equals(notifDataType)) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                    if (startCallType.equals(notifDataType)) {
                        sendNotifications(remoteMessage);
                    } else if (disconnectCallType.equals(notifDataType)) {
                        SharedPreferences sharedPref = this.getSharedPreferences("com.apollopatient", Context.MODE_PRIVATE);
                        Integer notificationId = sharedPref.getInt("com.apollopatient.call_start", -1);
                        NotificationManager notificationManager = (NotificationManager) getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
                        notificationManager.cancel(notificationId);
                    }
                } else {
                    showUnlockScreen(remoteMessage, !isAppRunning());
                }
                (new io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService()).onMessageReceived(remoteMessage);
                return;
            }

            Map<String, String> data = remoteMessage.getData();
            if (data != null && data.containsKey("source") && "webengage".equals(data.get("source"))) {
                WebEngage.get().receive(data);
            } else {
                try {

                    if (remoteMessage.getData().get("author") != null) {
                        VitaTasksNotificationsManager.INSTANCE.createNotificationTwilio(this, remoteMessage.getData());
                    } else {
                        (new io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService()).onMessageReceived(remoteMessage);

                    }


                } catch (Exception e) {
                    Log.e("new io.invertase error", e.getMessage() + "\n" + e.toString());
                }
            }
        } catch (Exception e) {
            Log.e("onMessageReceived error", e.getMessage() + "\n" + e.toString());
        }
    }

    private void showUnlockScreen(RemoteMessage remoteMessage, boolean isAppRunning) {
        String notifDataType = remoteMessage.getData().get("type");
        String startCallType = "call_start";
        String disconnectCallType = "call_disconnect";
        if (startCallType.equals(notifDataType)) {
            Intent i = new Intent(getApplicationContext(), UnlockScreenActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            i.putExtra("DOCTOR_NAME", remoteMessage.getData().get("doctorName"));
            i.putExtra("APPOINTMENT_ID", remoteMessage.getData().get("appointmentId"));
            i.putExtra("CALL_TYPE", remoteMessage.getData().get("callType"));
            i.putExtra("APP_STATE", isAppRunning);
            i.putExtra("FALL_BACK", false);
            startActivity(i);
        } else if (disconnectCallType.equals((notifDataType))) {
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

    private void sendNotifications(RemoteMessage remoteMessage) {
        String appointment_id = remoteMessage.getData().get("appointmentId");
        String incoming_call_type = remoteMessage.getData().get("callType");
        String doctorName = remoteMessage.getData().get("doctorName");
        String deeplinkUri = "apollopatients://DoctorCall?" + appointment_id + '+' + incoming_call_type;
        Uri uri = Uri.parse(deeplinkUri);
        Uri uri_home = Uri.parse("apollopatients://ConsultRoom");
        int oneTimeID = (int) SystemClock.uptimeMillis();

        //on notif click start
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
                PendingIntent.FLAG_ONE_SHOT);
        //on notif click end

        //when device locked show fullscreen notification start
        Intent i = new Intent(getApplicationContext(), UnlockScreenActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        i.putExtra("DOCTOR_NAME", remoteMessage.getData().get("doctorName"));
        i.putExtra("APPOINTMENT_ID", remoteMessage.getData().get("appointmentId"));
        i.putExtra("CALL_TYPE", remoteMessage.getData().get("callType"));
        i.putExtra("APP_STATE", isAppRunning());
        i.putExtra("FALL_BACK", true);
        i.putExtra("NOTIFICATION_ID", oneTimeID);
        PendingIntent fullScreenIntent = PendingIntent.getActivity(this, 0 /* Request code */, i,
                PendingIntent.FLAG_ONE_SHOT);
        //end

        //channel info start
        String channelId = "fcm_call_channel";
        String channelName = "Incoming Call";
        Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
//                Uri.parse("android.resource://"+this.getPackageName()+"/"+R.raw.incallmanager_ringtone);
//                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        //end

        // notification action buttons start
        int notificationId = new Random().nextInt();
        PendingIntent acptIntent = MainActivity.getActionIntent(oneTimeID, uri, this);
        PendingIntent rjctIntent = MainActivity.getActionIntent(oneTimeID, uri_home, this);

        NotificationCompat.Action acceptCall = new NotificationCompat.Action.Builder(R.drawable.acpt_btn, getActionText("Answer", android.R.color.holo_green_light), acptIntent).build();
        NotificationCompat.Action rejectCall = new NotificationCompat.Action.Builder(R.drawable.rjt_btn, getActionText("Decline", android.R.color.holo_red_light), rjctIntent).build();
        //end

        long[] v = {500, 1000};

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, channelId)
                        .setContentTitle(doctorName)
                        .setContentText(channelName)
                        .setSmallIcon(R.drawable.ic_notification_white)
                        .setPriority(NotificationCompat.PRIORITY_MAX)
                        .setCategory(NotificationCompat.CATEGORY_CALL)
                        .setAutoCancel(true)
                        .setVibrate(v)
                        .setSound(incoming_call_notif)
                        .addAction(acceptCall)
                        .addAction(rejectCall)
                        .setFullScreenIntent(fullScreenIntent, true)
                        .setContentIntent(pendingIntent);

        Log.e("notificationBuilder", String.valueOf(notificationId));
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);


        int importance = NotificationManager.IMPORTANCE_MAX;

        //channel creation start
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel mChannel = new NotificationChannel(
                    channelId, channelName, importance);
            AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
            mChannel.setSound(incoming_call_notif, attributes);
            mChannel.setDescription(channelName);
            mChannel.enableLights(true);
            mChannel.enableVibration(true);
            notificationManager.createNotificationChannel(mChannel);
        }
        //end

        notificationManager.notify(oneTimeID, notificationBuilder.build());
        // Save id to clear notification when activity is brought to front.
        SharedPreferences sharedPref = this.getSharedPreferences("com.apollopatient", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putInt("com.apollopatient.call_start", oneTimeID);
        editor.apply();
    }


    private boolean isAppRunning() {
        ActivityManager m = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
        List<ActivityManager.RunningTaskInfo> runningTaskInfoList = m.getRunningTasks(10);
        Iterator<ActivityManager.RunningTaskInfo> itr = runningTaskInfoList.iterator();
        int n = 0;
        while (itr.hasNext()) {
            n++;
            itr.next();
        }
        if (n == 1) { // App is killed
            return false;
        }
        return true; // App is in background or foreground
    }
}
