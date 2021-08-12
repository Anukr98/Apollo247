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

RCT_EXTERN_METHOD(vitalsToExport: (NSString)token buildSpecify:(NSString)specify comingFrom:(NSString)name)
RCT_EXTERN_METHOD(goToReactNative: (NSString)token)

@end