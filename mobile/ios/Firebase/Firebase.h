#import <FirebaseCore/FirebaseCore.h>

#if !defined(__has_include)
  #error "Firebase.h won't import anything if your compiler doesn't support __has_include. Please \
          import the headers individually."
#else
  #if __has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
    #import <FirebaseAnalytics/FirebaseAnalytics.h>
  #endif

  #if __has_include(<FirebaseAuth/FirebaseAuth.h>)
    #import <FirebaseAuth/FirebaseAuth.h>
  #endif

  #if __has_include(<FirebaseDatabase/FirebaseDatabase.h>)
    #import <FirebaseDatabase/FirebaseDatabase.h>
  #endif

  #if __has_include(<FirebaseDynamicLinks/FirebaseDynamicLinks.h>)
    #import <FirebaseDynamicLinks/FirebaseDynamicLinks.h>
    #if !__has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
      #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
        #warning "FirebaseAnalytics.framework is not included in your target. Please add \
`Firebase/Analytics` to your Podfile or add FirebaseAnalytics.framework to your project to ensure \
Firebase Dynamic Links works as intended."
      #endif // #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
    #endif
  #endif

  #if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)
    #import <FirebaseFirestore/FirebaseFirestore.h>
  #endif

  #if __has_include(<FirebaseFunctions/FirebaseFunctions.h>)
    #import <FirebaseFunctions/FirebaseFunctions.h>
  #endif

  #if __has_include(<FirebaseInAppMessaging/FirebaseInAppMessaging.h>)
    #import <FirebaseInAppMessaging/FirebaseInAppMessaging.h>
    #if !__has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
      #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
        #warning "FirebaseAnalytics.framework is not included in your target. Please add \
`Firebase/Analytics` to your Podfile or add FirebaseAnalytics.framework to your project to ensure \
Firebase In App Messaging works as intended."
      #endif // #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
    #endif
  #endif

  #if __has_include(<FirebaseInstanceID/FirebaseInstanceID.h>)
    #import <FirebaseInstanceID/FirebaseInstanceID.h>
  #endif

  #if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
    #import <FirebaseMessaging/FirebaseMessaging.h>
      #if !__has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
      #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
        #warning "FirebaseAnalytics.framework is not included in your target. Please add \
`Firebase/Analytics` to your Podfile or add FirebaseAnalytics.framework to your project to ensure \
Firebase Messaging works as intended."
      #endif // #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
    #endif
#endif


  #if __has_include(<FirebasePerformance/FirebasePerformance.h>)
    #import <FirebasePerformance/FirebasePerformance.h>
    #if !__has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
      #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
        #warning "FirebaseAnalytics.framework is not included in your target. Please add \
`Firebase/Analytics` to your Podfile or add FirebaseAnalytics.framework to your project to ensure \
Firebase Performance works as intended."
      #endif // #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
    #endif
  #endif

  #if __has_include(<FirebaseRemoteConfig/FirebaseRemoteConfig.h>)
    #import <FirebaseRemoteConfig/FirebaseRemoteConfig.h>
    #if !__has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
      #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
        #warning "FirebaseAnalytics.framework is not included in your target. Please add \
`Firebase/Analytics` to your Podfile or add FirebaseAnalytics.framework to your project to ensure \
Firebase Remote Config works as intended."
      #endif // #ifndef FIREBASE_ANALYTICS_SUPPRESS_WARNING
    #endif
  #endif

  #if __has_include(<FirebaseStorage/FirebaseStorage.h>)
    #import <FirebaseStorage/FirebaseStorage.h>
  #endif

  #if __has_include(<GoogleMobileAds/GoogleMobileAds.h>)
    #import <GoogleMobileAds/GoogleMobileAds.h>
  #endif

  #if __has_include(<Fabric/Fabric.h>)
    #import <Fabric/Fabric.h>-ObjC
  #endif

  #if __has_include(<Crashlytics/Crashlytics.h>)
    #import <Crashlytics/Crashlytics.h>
  #endif

#endif  // defined(__has_include)
