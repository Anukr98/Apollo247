/* Copyright (c) 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <Foundation/Foundation.h>

#import "GMUGeometry.h"
#import "GMUStyle.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * Defines a generic geometry container.
 */
@protocol GMUGeometryContainer<NSObject>

/**
 * The geometry object in the container.
 */
@property(nonatomic, readonly) id<GMUGeometry> geometry;

/**
 * Style information that should be applied to the contained geometry object.
 */
@property(nonatomic, nullable) GMUStyle *style;

@end

NS_ASSUME_NONNULL_END
