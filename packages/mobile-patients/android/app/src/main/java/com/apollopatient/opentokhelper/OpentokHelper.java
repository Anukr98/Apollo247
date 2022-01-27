package com.apollopatient.opentokhelper;


import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.SystemClock;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;

import com.apollopatient.MainActivity;
import com.apollopatient.R;
import com.apollopatient.appsignature.AppSignatureHelper;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;

import java.util.ArrayList;
import java.util.Random;

public class OpentokHelper extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    public OpentokHelper(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "OpentokHelper";
    }

    @ReactMethod
    public void triggerCallNotification() {
        String channelId = "fcm_ong_channel";
        String channelName = "Ongoing Call";
        int oneTimeID = (int) SystemClock.uptimeMillis();
        Bitmap bm = BitmapFactory.decodeResource(this.reactContext.getResources(), R.mipmap.ic_launcher);

        Intent notificationIntent = new Intent(this.reactContext, MainActivity.class);
        notificationIntent.addCategory(Intent. CATEGORY_LAUNCHER ) ;
        notificationIntent.setAction(Intent. ACTION_MAIN ) ;
        notificationIntent.setFlags(Intent. FLAG_ACTIVITY_CLEAR_TOP | Intent. FLAG_ACTIVITY_SINGLE_TOP );
        PendingIntent resultIntent = PendingIntent. getActivity (this.reactContext, 0 , notificationIntent , 0 ) ;

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this.reactContext, channelId)
                        .setContentTitle("Ongoing Doctor Consultation")
                        .setContentText("Tap to continue")
                        .setSmallIcon(R.drawable.ic_notification_white)
                        .setLargeIcon(bm)
                        .setPriority(NotificationCompat.PRIORITY_MAX)
                        .setCategory(NotificationCompat.CATEGORY_CALL)
                        .setAutoCancel(true)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                        .setOngoing(true)
                        .setContentIntent(resultIntent);

        NotificationManager notificationManager =
                (NotificationManager) this.reactContext.getSystemService(Context.NOTIFICATION_SERVICE);

        int importance = NotificationManager.IMPORTANCE_HIGH;

        //channel creation start
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel mChannel = new NotificationChannel(channelId, channelName, importance);
            AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
            mChannel.setSound(null, null);
            mChannel.setDescription(channelName);
            mChannel.enableLights(true);
            notificationManager.createNotificationChannel(mChannel);
        }
        //end

        Notification notification = notificationBuilder.build();
        notification.flags |= Notification.FLAG_INSISTENT;
        notificationManager.notify(oneTimeID, notification);
        this.reactContext.startService(new Intent(this.reactContext, NotificationService.class));
    }
    @ReactMethod
    public void dismissCallNotification() {
        this.reactContext.stopService(new Intent(this.reactContext, NotificationService.class));
    }

}
