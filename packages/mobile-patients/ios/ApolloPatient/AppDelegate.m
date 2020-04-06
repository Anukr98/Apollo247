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
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>
#import "RNSplashScreen.h"  // here
#import "RNFirebaseNotifications.h"
#import "RNFirebaseMessaging.h"
#import <React/RCTLinkingManager.h>
#import <WebEngage/WebEngage.h>
@import AppsFlyerLib;
#import <FBSDKCoreKit/FBSDKCoreKit.h>

#if __has_include(<AppsFlyerLib/AppsFlyerTracker.h>) // from Pod
#import <AppsFlyerLib/AppsFlyerTracker.h>
#else
#import "AppsFlyerTracker.h"
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
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
  //  [RNSplashScreen show];  // here
  [RNSplashScreen showSplash:@"LaunchScreen" inRootView:rootView];
  
  [FIRApp configure];
  [RNFirebaseNotifications configure];
  [Fabric with:@[[Crashlytics class]]];
  
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
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];
  
  return YES;
}

- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
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
    
    [[AppsFlyerTracker sharedTracker] registerUninstall:deviceToken];
    
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
    
    
    [[AppsFlyerTracker sharedTracker] handleOpenUrl:url options:options];
    
    [RCTLinkingManager application:application
                           openURL:url
                 sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                        annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
    
    if ([[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
      return YES;
    }
  } @catch (NSException *exception) {
    NSLog(@"%@",exception );
  }
  
  return YES;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  [RCTLinkingManager application:application
            continueUserActivity:userActivity
              restorationHandler:restorationHandler];
  [[AppsFlyerTracker sharedTracker] continueUserActivity:userActivity restorationHandler:restorationHandler];
  
  return true;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
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
