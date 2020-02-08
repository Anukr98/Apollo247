package com.apollopatient


import android.content.Intent
import android.util.JsonToken
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.iid.FirebaseInstanceId
import io.vitacloud.life.ConditionalMGMTActivity
import io.vitacloud.life.VitaEnvironment
import io.vitacloud.life.VitaInit
import io.vitacloud.life.VitaNavigationActivity
import timber.log.Timber

class StreamManager(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "KotlinBridge"
    }

        @ReactMethod
        fun show(vitaToken: String, UHID: String, userName: String, consultSource: String,buildSpecify:String) {
            System.out.println("In SHOW......" + vitaToken+" "+buildSpecify);
            System.out.println("In UHID......" + UHID + " "+userName+ " "+consultSource);
            val T2DiabetesAndHypertensionProgram = "diabetes_24_7"
//            Timber.plant(Timber.DebugTree())
            if(buildSpecify=="QA"||buildSpecify=="DEV"){
                System.out.println("buildSpecify......" + buildSpecify);
                VitaInit.setupApp(reactApplicationContext,
                        VitaEnvironment.SANDBOX,/* staging */
                        vitaToken,/* staging */
                        T2DiabetesAndHypertensionProgram,
                        consultSource)
            }else{
                System.out.println("In_UHID_Production......" + UHID + " "+userName+ " "+consultSource);
                System.out.println("production......" + buildSpecify);
                VitaInit.setupApp(reactApplicationContext,
                        VitaEnvironment.PRODUCTION,/* production */
                        vitaToken,/* production */
                        T2DiabetesAndHypertensionProgram,
                        consultSource)
            }


            VitaInit.setUpPushToken(reactApplicationContext, "")

            val intent = Intent(reactApplicationContext, ConditionalMGMTActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }

}