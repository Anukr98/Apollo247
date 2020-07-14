package com.apollopatient;

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

import java.util.Map;

public class MyFirebaseMessagingService
        extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        try {
            Log.e("RemoteMessage", remoteMessage.getData().toString());

            Map<String, String> data = remoteMessage.getData();
            if (data != null && data.containsKey("source") && "webengage".equals(data.get("source"))) {
                WebEngage.get().receive(data);
            } else {
                try {
                    // Log.e("Invertase", remoteMessage.getData().toString());

                    if(remoteMessage.getData().get("author") != null){
                        VitaTasksNotificationsManager.INSTANCE.createNotificationTwilio(this, remoteMessage.getData());
                    } else  {
//                        (new io.invertase.firebase.messaging.RNFirebaseMessagingService()).onMessageReceived(remoteMessage);
                        sendNotification(remoteMessage);
                    }


                } catch (Exception e) {
                    Log.e("new io.invertase error", e.getMessage() + "\n" + e.toString());
                }
            }
        } catch (Exception e) {
            Log.e("onMessageReceived error", e.getMessage() + "\n" + e.toString());
        }
    }

    private void sendNotification(RemoteMessage remoteMessage) {
        String body = remoteMessage.getNotification().getBody();
        String title = remoteMessage.getNotification().getTitle();

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
                PendingIntent.FLAG_ONE_SHOT);

        String channelId = getString(R.string.default_notification_channel_id);
        String channelName = getString(R.string.default_notification_channel_name);
        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        NotificationCompat.Builder notificationBuilder = 
                new NotificationCompat.Builder(this, channelId)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setAutoCancel(true)
                        .setSmallIcon(R.drawable.ic_notification_white)
                        .setColor(ContextCompat.getColor(this, R.color.notificationColor))
                        .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                        .setSound(defaultSoundUri)
                        .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Since android Oreo notification channel is needed.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(channelId,
                    channelName,
                    NotificationManager.IMPORTANCE_DEFAULT);
            notificationManager.createNotificationChannel(channel);
        }

        notificationManager.notify(0 /* ID of notification */, notificationBuilder.build());
    }
}
