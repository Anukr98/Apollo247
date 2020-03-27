//
//  ExportDeviceToken.m
//  ApolloPatient
//
//  Created by sankeeth on 27/08/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ExportDeviceToken.h"

@implementation ExportDeviceToken

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"ViewWillAppear"];
}

RCT_EXPORT_METHOD(getPushNotificationToken:(RCTResponseSenderBlock)callback) {
  callback(@[[[NSUserDefaults standardUserDefaults] objectForKey:@"devicePushToken"]?[[NSUserDefaults standardUserDefaults] objectForKey:@"devicePushToken"]:@""]);
}

@end
