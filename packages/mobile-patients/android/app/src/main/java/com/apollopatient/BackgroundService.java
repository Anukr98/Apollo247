package com.apollopatient;

import android.app.IntentService;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;

public class BackgroundService extends IntentService {

    public BackgroundService() {
        super("BackgroundService");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    protected void onHandleIntent(@Nullable Intent intent) {
        Intent i = new Intent(getBaseContext(), MainActivity.class);
        Log.e("BackgroundService==", i.toString());
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (intent != null) {
            startActivity(i);

            PusherReceiver.completeWakefulIntent(intent);
        }
    }
}
