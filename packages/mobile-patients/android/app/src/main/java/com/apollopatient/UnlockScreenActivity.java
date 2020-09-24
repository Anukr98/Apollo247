package com.apollopatient;


import android.app.Activity;
import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
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
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.JsonObject;
import com.pubnub.api.PNConfiguration;
import com.pubnub.api.PubNub;
import com.pubnub.api.callbacks.PNCallback;
import com.pubnub.api.models.consumer.PNPublishResult;
import com.pubnub.api.models.consumer.PNStatus;

import java.util.Iterator;
import java.util.List;


public class UnlockScreenActivity extends ReactActivity implements UnlockScreenActivityInterface {
    //PubNub start
    PNConfiguration pnConfiguration = new PNConfiguration();
    PubNub pubnub = new PubNub(pnConfiguration);
    //PubNub end

    private static final String TAG = "MessagingService";
    private Ringtone ringtone;
    LocalBroadcastManager mLocalBroadcastManager;
    BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if(intent.getAction().equals("com.unlockscreenactivity.action.close")){
                finish();
            }
        }
    };
    @RequiresApi(api = Build.VERSION_CODES.P)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //pubkey=pub-c-75e6dc17-2d81-4969-8410-397064dae70e
        //subkey=sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b
        pnConfiguration.setSubscribeKey("sub-c-517dafbc-d955-11e9-aa3a-6edd521294c5");
        pnConfiguration.setPublishKey("pub-c-e275fde3-09e1-44dd-bc32-5c3d04c3b2ef");
        pnConfiguration.setSecure(true);

        mLocalBroadcastManager = LocalBroadcastManager.getInstance(this);
        IntentFilter mIntentFilter = new IntentFilter();
        mIntentFilter.addAction("com.unlockscreenactivity.action.close");
        mLocalBroadcastManager.registerReceiver(mBroadcastReceiver, mIntentFilter);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

        setContentView(R.layout.activity_call_incoming);

        Intent intent = getIntent();
        String call_type=intent.getStringExtra("MESSAGE_TYPE");
        String incomingCallDisconnect="call_disconnected";
        String incomingCallStart="call_started";
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        String notifMessageType = sharedPref.getString("NOTIF_MESSAGE_TYPE", "call_started");

        //ringtoneManager start
        Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        this.ringtone= RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
        //ringtoneManager end

        if(notifMessageType.equals(incomingCallStart)){
                ringtone.setLooping(true);
                ringtone.play();
        }
        else if(notifMessageType.equals(incomingCallDisconnect)){
                finish();
        }

        String host_name = intent.getStringExtra("DOCTOR_NAME");
        String appointment_id=intent.getStringExtra("APPOINTMENT_ID");
        String incoming_call_type=intent.getStringExtra("CALL_TYPE");
        Boolean isAppRuning=intent.getBooleanExtra("APP_STATE",false);

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
                params.putString("call_type",incoming_call_type);

                if(isAppRuning){
                    String deeplinkUri="apollopatients://DoctorCall?"+appointment_id+'+'+incoming_call_type;
                    Uri uri = Uri.parse(deeplinkUri);
                    Log.e("deeplinkUri", uri.toString());
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    finish();
                    startActivity(intent);
                }
            else{
                    sendEvent(reactContext, "accept", params);
                    finish();
                }
            }
        });

        ImageButton rejectCallBtn = (ImageButton) findViewById(R.id.reject_call_btn);
        rejectCallBtn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                WritableMap params = Arguments.createMap();
                params.putBoolean("done", true);
                params.putString("appointment_id",appointment_id);
                params.putString("call_type",incoming_call_type);
                onDisconnected(appointment_id);
                if(isAppRuning){
                    Intent intent = new Intent(UnlockScreenActivity.this, MainActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY );
                    intent.putExtra("APPOINTMENT_ID",appointment_id);
                    intent.putExtra("CALL_TYPE",incoming_call_type);
                    finish();
                    startActivity(intent);
                }
                else{
                    sendEvent(reactContext, "reject", params);
                    finish();
                }
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

    private void onDisconnected(String appointmentID) {
        String notifyMessage="^^#PATIENT_REJECTED_CALL";
        pubnub.publish()
                .message(notifyMessage)
                .channel(appointmentID)
                .shouldStore(true)
                .usePOST(true)
                .async(new PNCallback<PNPublishResult>() {
                    public void onResponse(PNPublishResult result, PNStatus status) {
                        // handle publish result, status always present, result if successful
                        // status.isError() to see if error happened
                        if(!status.isError()) {
                            System.out.println("pub timetoken: " + result.getTimetoken());
                        }
                        System.out.println("pub status code: " + status.getStatusCode());
                    }
                });
    }

    private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
