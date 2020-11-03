package com.apollopatient;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

import static com.webengage.sdk.android.WebEngage.getApplicationContext;

public class ReferrerReceiver extends BroadcastReceiver {
    private static String referrer = "";

    public static String getReferrer() {
        return referrer;
    }

    private static void setReferrer(String value) {
        referrer = value;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        Toast.makeText( getApplicationContext(),"hey you", Toast.LENGTH_SHORT).show();
        Toast.makeText( getApplicationContext(),intent.toString(), Toast.LENGTH_SHORT).show();
        String referrerString = intent.getStringExtra(Intent.EXTRA_REFERRER);
        Toast.makeText( getApplicationContext(),referrerString, Toast.LENGTH_SHORT).show();
        Log.d("referrer recieved", referrerString);
        setReferrer(referrerString);
    }
}
