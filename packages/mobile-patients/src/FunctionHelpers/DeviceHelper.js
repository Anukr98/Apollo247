//
// Copyright © 2017-Present, Punchh, Inc.
// All rights reserved.
//
'use strict';

import { Dimensions, Platform, PixelRatio } from 'react-native';

export default class DeviceHelper {
  // Check condition for iPhoneX along with iPhone XS and iPhone S Max
  static isIphoneX() {
    let { height, width } = Dimensions.get('window');
    return Platform.OS === 'ios' && !Platform.isPad && (height >= 812 || width >= 812);
  }

  //iPhone X condition helper
  static ifIphoneX(iphoneXStyle, regularStyle) {
    return this.isIphoneX() ? iphoneXStyle : regularStyle;
  }

  //Status bar height
  static getStatusBarHeight() {
    return Platform.select({
      ios: this.ifIphoneX(44, 20),
      android: 0,
    });
  }

  //For iPhone X bottom padding
  static getBottomSpace() {
    return this.isIphoneX() ? 34 : 0;
  }

  // FIXME: make appropriate helper for text scaling stuff
  static normalize(size) {
    const pixelRatio = PixelRatio.get();
    return size * pixelRatio;
  }

  static positionAbsoluteCenterFrame({ width, height }) {
    let { width: dWidth, height: dHeight } = Dimensions.get('window');
    const horizontal = (dWidth - width) / 2;
    const vertical = (dHeight - height) / 2;
    return {
      width,
      height,
      position: 'absolute',
      top: vertical,
      bottom: vertical,
      left: horizontal,
      right: horizontal,
    };
  }
}
