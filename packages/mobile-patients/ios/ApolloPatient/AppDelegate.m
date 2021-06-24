/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Firebase.h>
#import "RNSplashScreen.h"  // here
#import <React/RCTLinkingManager.h>
#import <WebEngage/WebEngage.h>
#import <CodePush/CodePush.h>

#import <RNAppsFlyer.h>
#import <PushKit/PushKit.h>
#import "RNCallKeep.h"
#import "RNVoipPushNotificationManager.h"
@import GoogleMaps;
#import <AppTrackingTransparency/AppTrackingTransparency.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  [GMSServices provideAPIKey:@"AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0"];
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"ApolloPatient"
                                            initialProperties:nil];
  
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  // [RNSplashScreen show];  // here
  [RNSplashScreen showSplash:@"LaunchScreen" inRootView:rootView];
  
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  
  //NEWLY ADDED PERMISSIONS FOR iOS 14
 if (@available(iOS 14, *)) {
   [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {
     switch (status) {
       case ATTrackingManagerAuthorizationStatusAuthorized:
         NSLog(@"%lu Authorised",(unsigned long)status);
         break;
       case ATTrackingManagerAuthorizationStatusDenied:
         NSLog(@"%lu Denied",(unsigned long)status);
         break;
       case ATTrackingManagerAuthorizationStatusRestricted:
         NSLog(@"%lu Restricted",(unsigned long)status);
         break;
       default:
         break;
     }
   }];
 }
  
  //  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
  
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if( !error ) {
      // required to get the app to do anything at all about push notifications
      dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] registerForRemoteNotifications];
      });
      NSLog( @"Push registration success." );
    } else {
      NSLog( @"Push registration FAILED" );
      NSLog( @"ERROR: %@ - %@", error.localizedFailureReason, error.localizedDescription );
      NSLog( @"SUGGESTIONS: %@ - %@", error.localizedRecoveryOptions, error.localizedRecoverySuggestion );
    }
  }];
  
  [[WebEngage sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];
  
  return YES;
}

/* Add PushKit delegate method */

// --- Handle updated push credentials
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}

// --- Handle incoming pushes (for ios <= 10)
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type { 
  [self handleVoipIncomingCall:payload forType:type];
}

// --- Handle incoming pushes (for ios >= 11)
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  [self handleVoipIncomingCall:payload forType:type];
  completion();
}

- (void) handleVoipIncomingCall:(PKPushPayload *)payload forType:(PKPushType)type {
  
  if(payload && payload.dictionaryPayload && payload.dictionaryPayload[@"name"] != nil && payload.dictionaryPayload[@"isVideo"] != nil && payload.dictionaryPayload[@"appointmentId"] != nil &&
     payload.dictionaryPayload[@"disconnectCall"] == nil){
    
    // show incoming call
    
    NSString *appointmentId = payload.dictionaryPayload[@"appointmentId"];
    NSString *name = payload.dictionaryPayload[@"name"];
    BOOL isVideo = [payload.dictionaryPayload[@"isVideo"] boolValue];
    
    [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type]; //sending payload to JS
    
    [RNCallKeep reportNewIncomingCall:appointmentId handle:name handleType:@"generic" hasVideo:isVideo localizedCallerName:name fromPushKit: YES payload:nil];
           
  } else if(payload && payload.dictionaryPayload[@"appointmentId"] != nil && payload.dictionaryPayload[@"disconnectCall"] != nil) {
    
    // disconnect ongoing call
    
    NSString *appointmentId = payload.dictionaryPayload[@"appointmentId"];
    NSString *name = payload.dictionaryPayload[@"name"];
    
    // for now, showing callkit UI and then disconnecting until we find a fix for this
    [RNCallKeep reportNewIncomingCall:appointmentId handle:name handleType:@"generic" hasVideo:false localizedCallerName:@"Call Disconnecting..." fromPushKit: YES payload:nil];
    [RNCallKeep endCallWithUUID:appointmentId reason:2]; // CXCallEndedReasonRemoteEnded
  }
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  application.applicationIconBadgeNumber = 0;
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  
 @try {
   NSLog(@"deviceToken %@",deviceToken);

   [[AppsFlyerLib shared] registerUninstall:deviceToken];

   NSString *pushToken;
   pushToken = [deviceToken description];
   if(deviceToken){
     pushToken = [pushToken stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"<>"]];
     pushToken = [pushToken stringByReplacingOccurrencesOfString:@" " withString:@""];
   } else {
     pushToken= @"";
   }

   if (self.chatClient && self.chatClient.user) {

     [self.chatClient registerWithNotificationToken:deviceToken

                                         completion:^(TCHResult *result) {
       if (![result isSuccessful]) {

         // try registration again or verify token
       }

     }];

   } else {

     [[NSUserDefaults standardUserDefaults] setObject:deviceToken forKey:@"deviceToken"];
   }

   [[NSUserDefaults standardUserDefaults]setObject:pushToken forKey:@"devicePushToken"];
   [[NSUserDefaults standardUserDefaults]synchronize];
 } @catch (NSException *exception) {
   NSLog(@"%@",exception );
 }
  
}

-(void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse* )response
        withCompletionHandler:(void(^)(void))completionHandler

API_AVAILABLE(ios(10.0)){
  @try {
    NSLog(@"didReceiveNotificationResponse ----> %@", response.notification.request.content.userInfo);
    
    NSDictionary *userInfo = response.notification.request.content.userInfo;
    
    
   if (userInfo[@"twi_message_type"]) {
     
     NSBundle *vitalsBundle = [NSBundle bundleWithIdentifier:@"com.apollo.ApolloVitalsFramework"];
     
     UIStoryboard *chatStoryBoard = [UIStoryboard storyboardWithName:@"Chat" bundle:vitalsBundle];
     
     ChatViewController *chatVC = [chatStoryBoard instantiateViewControllerWithIdentifier:@"ChatViewController"];
     [self.window.rootViewController.navigationController pushViewController:chatVC animated:YES];
     
   }
    
    //     NSLog(@"center: %@, response: %@", center, response);
    
    [WEGManualIntegration userNotificationCenter:center didReceiveNotificationResponse:response];
    
    completionHandler();
  } @catch (NSException *exception) {
    NSLog(@"%@",exception );
    
  }
  
}

#pragma mark - Open URL / deep link
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
  
  @try {
    NSString * strHost = [NSString stringWithFormat:@"%@", url.scheme ? url.scheme : @"" ];
    if ([strHost isEqualToString:@"vita-app-chron"]) {
      [[NSNotificationCenter defaultCenter] postNotificationName:@"fitbitLoginNotification" object:nil];
    }
    
    
    [[AppsFlyerAttribution shared] handleOpenUrl:url options:options];
    
    [RCTLinkingManager application:application
                           openURL:url
                 sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                        annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
  } @catch (NSException *exception) {
    NSLog(@"%@",exception );
  }
  
  return YES;
}

// Reports app open from deep link from apps which do not support Universal Links (Twitter) and for iOS8 and below
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString*)sourceApplication annotation:(id)annotation
{
   [[AppsFlyerAttribution shared] handleOpenUrl:url sourceApplication:sourceApplication annotation:annotation];

     return YES;
}

#pragma mark - Universal link

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  [RCTLinkingManager application:application
            continueUserActivity:userActivity
              restorationHandler:restorationHandler];
   [[AppsFlyerAttribution shared] continueUserActivity:userActivity restorationHandler:restorationHandler];

  [RNCallKeep application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [RCTLinkingManager application:application
            continueUserActivity:userActivity
              restorationHandler:restorationHandler];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  #if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
    return [CodePush bundleURL];
  #endif
}

#pragma mark WebEngage

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler{
  
  NSLog(@"center: %@, notification: %@", center, notification);
  
  [WEGManualIntegration userNotificationCenter:center willPresentNotification:notification];
  
  completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
}

// - (void)userNotificationCenter:(UNUserNotificationCenter *)center
// didReceiveNotificationResponse:(UNNotificationResponse *)response
//          withCompletionHandler:(void (^)(void))completionHandler {

//     NSLog(@"center: %@, response: %@", center, response);

//     [WEGManualIntegration userNotificationCenter:center didReceiveNotificationResponse:response];

//     completionHandler();
// }

@end
