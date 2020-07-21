package com.apollopatient;


import android.app.Activity;
import android.app.ActivityManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.RequiresApi;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Iterator;
import java.util.List;


public class UnlockScreenActivity extends ReactActivity implements UnlockScreenActivityInterface {

    private static final String TAG = "MessagingService";

    @RequiresApi(api = Build.VERSION_CODES.P)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

        setContentView(R.layout.activity_call_incoming);

        Intent intent = getIntent();
        //ringtoneManager start
        String call_type=intent.getStringExtra("MESSAGE_TYPE");
        Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        Ringtone r = RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
        String incomingCallDisconnect="call_disconnected";
        String incomingCallStart="call_started";
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        String notifMessageType = sharedPref.getString("NOTIF_MESSAGE_TYPE", "call_started");
        Log.e("RemoteMessageAct==", String.valueOf(notifMessageType));
        if(notifMessageType.equals(incomingCallStart)){
            r.setLooping(true);
            r.play();
        }
        else if(notifMessageType.equals(incomingCallDisconnect)){
            finish();
            r.stop();

        }
        //ringtoneManager end
//


        String host_name = intent.getStringExtra("DOCTOR_NAME");
        String appointment_id=intent.getStringExtra("APPOINTMENT_ID");
        TextView tvName = (TextView)findViewById(R.id.callerName);
        tvName.setText(host_name);
        //
        final ReactContext reactContext = getReactInstanceManager().getCurrentReactContext();

        ImageButton acceptCallBtn = (ImageButton) findViewById(R.id.accept_call_btn);
        acceptCallBtn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                WritableMap params = Arguments.createMap();
                params.putBoolean("done", true);
                params.putString("appointment_id",appointment_id);
                sendEvent(reactContext, "accept", params);
                finish();
                r.stop();
            }
        });

        ImageButton rejectCallBtn = (ImageButton) findViewById(R.id.reject_call_btn);
        rejectCallBtn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                WritableMap params = Arguments.createMap();
                params.putBoolean("done", false);
                sendEvent(reactContext, "reject", params);
                finish();
                r.stop();
            }
        });

//        Handler handler = new Handler();
//
//        handler.postDelayed(new Runnable() {
//            public void run() {
//                Uri alarmSound =
//                        RingtoneManager. getDefaultUri (RingtoneManager. TYPE_NOTIFICATION );
//                MediaPlayer mp = MediaPlayer. create (getApplicationContext(), alarmSound);
//                mp.start();
//                finish();
//            }
//        }, 60000);

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
    public void onDisconnected() {

    }

    @Override
    public void onConnectFailure() {

    }

    @Override
    public void onIncoming(ReadableMap params) {

    }

    private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
