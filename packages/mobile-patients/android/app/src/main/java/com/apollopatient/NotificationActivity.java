package com.apollopatient;

import android.app.Activity;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

public class NotificationActivity extends Activity {

    public static final String NOTIFICATION_ID = "NOTIFICATION_ID";
    private Ringtone ringtone;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        this.ringtone= RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
        Log.e("notificationActivity", String.valueOf(getIntent().getIntExtra(NOTIFICATION_ID, -1)));
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        manager.cancel(getIntent().getIntExtra(NOTIFICATION_ID, -1));
        ringtone.stop();
        finish(); // since finish() is called in onCreate(), onDestroy() will be called immediately
    }

    public static PendingIntent getActionIntent(int notificationId, Uri uri, Context context) {
        Intent intent =  new Intent(Intent.ACTION_VIEW,uri);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra(NOTIFICATION_ID, notificationId);
        PendingIntent acceptIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);
        return acceptIntent;
    }


    @Override
    public void onDestroy() {
        super.onDestroy();
        ringtone.stop();
    }

}
