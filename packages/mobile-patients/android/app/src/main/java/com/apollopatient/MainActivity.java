package com.apollopatient;

import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.provider.Settings;
import androidx.annotation.RequiresApi;

import com.clevertap.android.sdk.CleverTapAPI;
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
        //added for vitals crash when goes in background, for lollipop devices
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
            super.onCreate(savedInstanceState); 
        }
        else{
            //lollipop devices
            super.onCreate(null);
        }

        Intent intent = getIntent();
        Bundle bundle = intent.getExtras();

        if (bundle != null) {
            String referrerString = bundle.get(Intent.EXTRA_REFERRER) != null ? bundle.get(Intent.EXTRA_REFERRER).toString() : "";
            setReferrer(referrerString);
        }
        // CleverTapAPI.setDebugLevel(CleverTapAPI.LogLevel.OFF);     //Switch off logs for Production environment
        CleverTapAPI.setDebugLevel(CleverTapAPI.LogLevel.DEBUG);   //Set Log level to DEBUG log warnings or other important messages
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            CleverTapAPI.createNotificationChannel(getApplicationContext(),"Marketing","Marketing","",NotificationManager.IMPORTANCE_HIGH,true);
        }

        try {
            //start
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                Uri incoming_call_notif = RingtoneManager.getActualDefaultRingtoneUri(getApplicationContext(), RingtoneManager.TYPE_RINGTONE);
                ringtone = RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
                NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                manager.cancel(getIntent().getIntExtra(NOTIFICATION_ID, -1));
                ringtone.stop();
                Vibrator vibrator = (Vibrator) getApplicationContext().getSystemService(Context.VIBRATOR_SERVICE);
                vibrator.cancel();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        //end
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    protected void onResume() {
        super.onResume();
        try {
            // to close notification when activity is brought front 
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                NotificationManager notificationManager = (NotificationManager) this.getSystemService(Context.NOTIFICATION_SERVICE);
                Uri incoming_call_notif = RingtoneManager.getActualDefaultRingtoneUri(getApplicationContext(), RingtoneManager.TYPE_RINGTONE);
                ringtone = RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
                Vibrator vibrator = (Vibrator) getApplicationContext().getSystemService(Context.VIBRATOR_SERVICE);
                KeyguardManager myKM = (KeyguardManager) this.getSystemService(Context.KEYGUARD_SERVICE);
                if (!myKM.inKeyguardRestrictedInputMode()) {
                    // device is not locked
                    notificationManager.cancelAll();
                    ringtone.stop();
                    vibrator.cancel();
                }
                Intent stopIntent = new Intent(this, RingtonePlayingService.class);
                this.stopService(stopIntent);
            }
        } catch (Exception e) {
            e.printStackTrace();
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
