//
//  VitalsBridge.m
//  ApolloPatient
//
//  Created by Ranjith Kumar on 12/26/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "VitalsBridge.h"

@implementation VitalsBridge

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"ViewWillAppear"];
}

@end
@interface RCT_EXTERN_MODULE(Vitals, NSObject)

//RCT_EXPORT_METHOD(vitalsToExport:(NSString *)token) {
//  NSString * vitaToken = [NSString stringWithFormat:@"Open %@",token];
//  NSLog(@"vitaToken %@",vitaToken);
//  [[NSUserDefaults standardUserDefaults] setObject:vitaToken forKey:@"CONDITIONMANAGEMENT_VITA_TOKEN"];
//    #if DEVELOPMENT // for the UAT
//        [[NSUserDefaults standardUserDefaults] setObject:@"play" forKey:@"environment"];
//    #else // for Production
//        [[NSUserDefaults standardUserDefaults] setObject:@"prod" forKey:@"environment"];
//    #endif
//  [[NSUserDefaults standardUserDefaults] synchronize];
//}

RCT_EXTERN_METHOD(vitalsToExport: (NSString)token)
RCT_EXTERN_METHOD(goToReactNative: (NSString)token)

@end
