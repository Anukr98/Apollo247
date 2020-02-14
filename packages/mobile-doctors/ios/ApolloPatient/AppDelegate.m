/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#import <React/RCTLinkingManager.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Firebase.h>
//#import <Fabric/Fabric.h>
//#import <Crashlytics/Crashlytics.h>
#import "RNSplashScreen.h"
#import "ReactNativeExceptionHandler.h"

@implementation AppDelegate

// iOS 8.x or older
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

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
//  [RNSplashScreen show];
 [RNSplashScreen showSplash:@"LaunchScreen" inRootView:rootView];
  [FIRApp configure];
//  [Fabric with:@[[Crashlytics class]]];
  
  
  [ReactNativeExceptionHandler replaceNativeExceptionHandlerBlock:^(NSException *exception, NSString *readeableException){

    // THE CODE YOU WRITE HERE WILL REPLACE THE EXISTING NATIVE POPUP THAT COMES WITH THIS MODULE.
    //We create an alert box
    UIAlertController* alert = [UIAlertController
                                alertControllerWithTitle:@"Uh oh.. :("
                                message: [NSString stringWithFormat:@"%@\n%@",
                                          @"Oops! Unexpected error occurred. We have reported this to our team. Please close the app and start again.",
                                          readeableException]
                                preferredStyle:UIAlertControllerStyleAlert];

    // We show the alert box using the rootViewController
    [rootViewController presentViewController:alert animated:YES completion:nil];

    // THIS IS THE IMPORTANT PART
    // By default when an exception is raised we will show an alert box as per our code.
    // But since our buttons wont work because our click handlers wont work.
    // to close the app or to remove the UI lockup on exception.
    // we need to call this method
    // [ReactNativeExceptionHandler releaseExceptionHold]; // to release the lock and let the app crash.

    // Hence we set a timer of 4 secs and then call the method releaseExceptionHold to quit the app after
    // 4 secs of showing the popup
    [NSTimer scheduledTimerWithTimeInterval:4.0
                                     target:[ReactNativeExceptionHandler class]
                                   selector:@selector(releaseExceptionHold)
                                   userInfo:nil
                                    repeats:NO];

    // or  you can call
    // [ReactNativeExceptionHandler releaseExceptionHold]; when you are done to release the UI lock.
  }];

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
