package com.apollopatient;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.legacy.content.WakefulBroadcastReceiver;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class PusherReceiver extends WakefulBroadcastReceiver {
    public static boolean isAppOnForeground(Context context) {
        try {
            ActivityManager activityManager = (ActivityManager) context
                    .getApplicationContext().getSystemService(
                            Context.ACTIVITY_SERVICE);
            String packageName = context.getPackageName();
            List<ActivityManager.RunningAppProcessInfo> appProcesses = activityManager
                    .getRunningAppProcesses();
            if (appProcesses == null) {
                return false;
            }
            for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
                // The name of the process that this object is associated with.
                if (appProcess.processName.equals(packageName)
                        && appProcess.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                    return true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            Log.e( "isAppOnFGException!", e.toString());
        }
        return false;
    }
    public void onReceive(final Context context, Intent intent) {
        if (!isAppOnForeground((context))) {
            String custom = intent.getStringExtra("custom");

            try {
                JSONObject notificationData = new JSONObject(custom);

                // This is the Intent to deliver to our service.
                Intent service = new Intent(context, BackgroundService.class);
                // Put here your data from the json as extra in in the intent

                // Start the service, keeping the device awake while it is launching.
                startWakefulService(context, service);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }
}
