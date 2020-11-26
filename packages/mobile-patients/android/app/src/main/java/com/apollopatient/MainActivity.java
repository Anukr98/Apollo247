package com.apollopatient;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    public static final String NOTIFICATION_ID = "NOTIFICATION_ID";
    private static final String TAG = "intentlogs";
    private static String referrer = "";
    private Ringtone ringtone;

    @Override
    protected String getMainComponentName() {
        return "ApolloPatient";
    }

    public static String getIntentReferrer() {
        return referrer;
    }

    private static void setReferrer(String value) {
        referrer = value;
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = getIntent();
        String action = intent.getAction();
        Uri data = intent.getData();
        Log.d("intent recieved now", intent.toString());
        Bundle bundle = intent.getExtras();
        if (bundle != null) {
            for (String key : bundle.keySet()) {
                Log.d(TAG, key + " : " + (bundle.get(key) != null ? bundle.get(key) : "NULL"));
            }
            String referrerString = bundle.get(Intent.EXTRA_REFERRER) != null ? bundle.get(Intent.EXTRA_REFERRER).toString() : "";
            Log.d(TAG, referrerString);
            setReferrer(referrerString);
        }

        try {
            //start
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                ringtone = RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
                Log.e("notificationActivity", String.valueOf(getIntent().getIntExtra(NOTIFICATION_ID, -1)));
                NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                manager.cancel(getIntent().getIntExtra(NOTIFICATION_ID, -1));
                ringtone.stop();
            }
        } catch (Exception e) {
            Log.e("overlay permission err", e.getMessage() + "\n" + e.toString());
        }
        //end
    }

    @Override
    protected void onResume() {
        super.onResume();
        try {
            // to close notification when activity is brought front 
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                NotificationManager notificationManager = (NotificationManager) this.getSystemService(Context.NOTIFICATION_SERVICE);
                notificationManager.cancelAll();
                Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                ringtone = RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
                ringtone.stop();
            }
        } catch (Exception e) {
            Log.e("overlay permission err", e.getMessage() + "\n" + e.toString());
        }
    }

    public static PendingIntent getActionIntent(int notificationId, Uri uri, Context context) {
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra(NOTIFICATION_ID, notificationId);
        PendingIntent acceptIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);
        return acceptIntent;
    }

}
