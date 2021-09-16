package com.apollopatient


import android.content.Intent
import android.util.JsonToken
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.iid.FirebaseInstanceId
import com.google.firebase.messaging.RemoteMessage
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import io.vitacloud.life.ConditionalMGMTActivity
import io.vitacloud.life.VitaEnvironment
import io.vitacloud.life.VitaInit
import io.vitacloud.life.VitaNavigationActivity
import io.vitacloud.life.careplan.VitaTasksNotificationsManager
import org.json.JSONObject
import timber.log.Timber
import java.util.*
import java.util.stream.Collectors
import kotlin.collections.HashMap

class StreamManager(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "KotlinBridge"
    }

    @ReactMethod
    fun show(vitaToken: String, UHID: String, userName: String, consultSource: String,buildSpecify:String, fcmToken: String, programId : String) {
        try {

        System.out.println("In SHOW......" + vitaToken+" "+buildSpecify);
        System.out.println("In UHID......" + UHID + " "+userName+ " "+consultSource);
        // val T2DiabetesAndHypertensionProgram = "diabetes_24_7"
//            Timber.plant(Timber.DebugTree())
        if(buildSpecify=="QA"||buildSpecify=="DEV"){
            System.out.println("buildSpecify......" + buildSpecify);
            VitaInit.setupApp(reactApplicationContext,
                    VitaEnvironment.SANDBOX,/* staging */
                    vitaToken,/* staging */
                    programId,
                    consultSource)
        }else{
            System.out.println("In_UHID_Production......" + UHID + " "+userName+ " "+consultSource);
            System.out.println("production......" + buildSpecify);
            VitaInit.setupApp(reactApplicationContext,
                    VitaEnvironment.PRODUCTION,/* production */
                    vitaToken,/* production */
                    programId,
                    consultSource)
        }


        VitaInit.setUpPushToken(reactApplicationContext, fcmToken)

        var intent = Intent(reactApplicationContext, ConditionalMGMTActivity::class.java)
        if(programId == "prohealth"){
            intent =  Intent(reactApplicationContext, VitaNavigationActivity::class.java)
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            System.out.println("CMerror......" + e.message + "\n" + e.toString());
        }

    }

    @ReactMethod
    fun cmNotification(data: String) {

        try {
            //some exception
            System.out.println("data......" + data);

            var jsonobject = JSONObject(data)
            var map = HashMap<String,String>()
            map.put("author",jsonobject.get("author").toString())
            map.put("channel_id",jsonobject.get("channel_id").toString())
            map.put("message_id",jsonobject.get("message_id").toString())
            map.put("twi_body",jsonobject.get("twi_body").toString())
            map.put("twi_message_id",jsonobject.get("twi_message_id").toString())
            map.put("channel_sid",jsonobject.get("channel_sid").toString())
            map.put("twi_message_type",jsonobject.get("twi_message_type").toString())
            map.put("twi_sound",jsonobject.get("twi_sound").toString())
            VitaTasksNotificationsManager.createNotificationTwilio(reactApplicationContext,map)
        } catch (e: Exception) {
            System.out.println("CMerror - show..." + e.message + "\n" + e.toString());
        }

    }
}