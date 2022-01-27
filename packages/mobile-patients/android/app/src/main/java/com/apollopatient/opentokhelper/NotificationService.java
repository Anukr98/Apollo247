package com.apollopatient.opentokhelper;

import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

import androidx.annotation.Nullable;

public class NotificationService extends Service {
    private NotificationManager nm;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        nm = (NotificationManager) getApplicationContext().getSystemService(NOTIFICATION_SERVICE);
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        nm.cancelAll();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // Dismiss ongoing call notification
        nm.cancelAll();
    }
}

