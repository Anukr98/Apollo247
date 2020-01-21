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
        fun show(vitaToken: String, UHID: String, userName: String, consultSource: String) {
            System.out.println("In SHOW......" + vitaToken);
            System.out.println("In UHID......" + UHID + " "+userName+ " "+consultSource);
            val T2DiabetesAndHypertensionProgram = "t2diabetesandhypertension"
            Timber.plant(Timber.DebugTree())
            VitaInit.setupApp(reactApplicationContext,
                    VitaEnvironment.SANDBOX,
                    vitaToken,
                    T2DiabetesAndHypertensionProgram,
                    consultSource)
          //  VitaInit.setupApp(reactApplicationContext, VitaEnvironment.DEV, vitaToken, T2DiabetesAndHypertensionProgram, consultSource, UHID, userName)

            VitaInit.setUpPushToken(reactApplicationContext, "")

            val intent = Intent(reactApplicationContext, ConditionalMGMTActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }

}