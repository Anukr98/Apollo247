package com.apollopatient;


import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Vibrator;
import android.preference.PreferenceManager;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.RequiresApi;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;


public class UnlockScreenActivity extends ReactActivity implements UnlockScreenActivityInterface {
    private static final String TAG = "MessagingService";
    private Ringtone ringtone;
    private Vibrator vibrator;
    RelativeLayout unlockRelativeLayout;
    LocalBroadcastManager mLocalBroadcastManager;
    BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getAction().equals("com.unlockscreenactivity.action.close")) {
                finish();
            }
        }
    };

    @RequiresApi(api = Build.VERSION_CODES.P)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mLocalBroadcastManager = LocalBroadcastManager.getInstance(this);
        IntentFilter mIntentFilter = new IntentFilter();
        mIntentFilter.addAction("com.unlockscreenactivity.action.close");
        mLocalBroadcastManager.registerReceiver(mBroadcastReceiver, mIntentFilter);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

        setContentView(R.layout.activity_call_incoming);

        Intent intent = getIntent();
        String call_type = intent.getStringExtra("MESSAGE_TYPE");
        String incomingCallDisconnect = "call_disconnected";
        String incomingCallStart = "call_started";
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        String notifMessageType = sharedPref.getString("NOTIF_MESSAGE_TYPE", "call_started");
        Integer notifID = intent.getIntExtra("NOTIFICATION_ID", -1);

        //ringtoneManager start
        Uri incoming_call_notif = RingtoneManager.getActualDefaultRingtoneUri(getApplicationContext(), RingtoneManager.TYPE_RINGTONE);
        this.ringtone = RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
        this.vibrator = (Vibrator) getApplicationContext().getSystemService(Context.VIBRATOR_SERVICE);

        unlockRelativeLayout=findViewById(R.id.unlockLayout);
        KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        if( km.inKeyguardRestrictedInputMode() ) {
            unlockRelativeLayout.setVisibility(View.VISIBLE);
        } else {
            //it is not locked
            unlockRelativeLayout.setVisibility(View.GONE);
        }

        //ringtoneManager end

        Boolean fallBack = intent.getBooleanExtra("FALL_BACK", true);
        if (notifMessageType.equals(incomingCallStart)) {
            if (!fallBack) {
                ringtone.setLooping(true);
                ringtone.play();
                try {
                    NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                    Boolean isDndOn = Settings.Global.getInt(getContentResolver(), "zen_mode") != 0;
                    Boolean isVibrationOn = !isDndOn && (((AudioManager) getSystemService(Context.AUDIO_SERVICE)).getRingerMode() == AudioManager.RINGER_MODE_VIBRATE ||
                            (Settings.System.getInt(getBaseContext().getContentResolver(), "vibrate_when_ringing", 0) == 1));
                    if (isVibrationOn) {
                        long[] pattern = new long[]{100, 200, 300, 400, 500, 400, 300, 200};
                        vibrator.vibrate(pattern, 0);
                    }
                } catch (Exception e) {
                    Log.e("vibration error", e.getMessage() + "\n" + e.toString());
                }
            }
        } else if (notifMessageType.equals(incomingCallDisconnect)) {
            finish();
        }

        String host_name = intent.getStringExtra("DOCTOR_NAME");
        String appointment_id = intent.getStringExtra("APPOINTMENT_ID");
        String incoming_call_type = intent.getStringExtra("CALL_TYPE");
        Boolean isAppRuning = intent.getBooleanExtra("APP_STATE", false);

        TextView tvName = (TextView) findViewById(R.id.callerName);
        tvName.setText(host_name);

        //

        final ReactContext reactContext = getReactInstanceManager().getCurrentReactContext();

        ImageButton acceptCallBtn = (ImageButton) findViewById(R.id.accept_call_btn);
        acceptCallBtn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                WritableMap params = Arguments.createMap();
                params.putBoolean("done", true);
                params.putString("appointment_id", appointment_id);
                params.putString("call_type", incoming_call_type);
                removeNotification(fallBack, notifID);
                String deeplinkUri = "apollopatients://DoctorCall?" + appointment_id + '+' + incoming_call_type;
                Uri uri = Uri.parse(deeplinkUri);
                Log.e("deeplinkUri", uri.toString());
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);

                finish();

                startActivity(intent);
            }
        });

        ImageButton rejectCallBtn = (ImageButton) findViewById(R.id.reject_call_btn);
        rejectCallBtn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                WritableMap params = Arguments.createMap();
                params.putBoolean("done", true);
                params.putString("appointment_id", appointment_id);
                params.putString("call_type", incoming_call_type);
                removeNotification(fallBack, notifID);
                String doctorCallRejectedDeepLink = "apollopatients://DoctorCallRejected?" + appointment_id + '+' + incoming_call_type;
                Uri uri = Uri.parse(doctorCallRejectedDeepLink);
                Log.e("deeplinkUri", uri.toString());
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                finish();
                startActivity(intent);
            }
        });

        Handler handler = new Handler();

        handler.postDelayed(new Runnable() {
            public void run() {
                finish();
            }
        }, 45000);

    }


    @Override
    public void onDestroy() {
        super.onDestroy();
        mLocalBroadcastManager.unregisterReceiver(mBroadcastReceiver);
        ringtone.stop();
        vibrator.cancel();
        if(Build.VERSION.SDK_INT >= 26){
            Log.d("csk","sdk--"+Build.VERSION.SDK_INT);
            KeyguardManager km = (KeyguardManager)getSystemService(Context.KEYGUARD_SERVICE);
            km.requestDismissKeyguard(this, null);

        }
        else
        {

            Log.d("csk","sdk--"+Build.VERSION.SDK_INT);
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
        }


    }

    @Override
    public void onConnected() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
//                ...
            }
        });
    }

    @Override
    public void onConnectFailure() {

    }

    @Override
    public void onIncoming(ReadableMap params) {

    }

    private void removeNotification(Boolean fallBack, Integer notifID) {
        if (fallBack) {
            NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            manager.cancelAll();
        }
    }

}
