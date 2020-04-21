import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  NativeModules,
  NavState,
  Alert,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

export interface CovidScanProps extends NavigationScreenProps {}
export const CovidScan: React.FC<CovidScanProps> = (props) => {
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();

  const handleResponse = (data: NavState) => {
    const url = data.url;
    if (url && url.indexOf('redirectTo=doctor') > -1 && url.indexOf('#details') < 0) {
      props.navigation.navigate(AppRoutes.DoctorSearch);
    }
  };

  return (
    <WebView
      source={{ uri: 'https://covidtest.apollo247.com?utm_source=mobile_app' }}
      onNavigationStateChange={(data) => handleResponse(data)}
    />
  );
};
