import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { permissionHandler } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  NavState,
  StyleSheet,
  SafeAreaView,
  View,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NavigationScreenProps } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface CovidScanProps
  extends NavigationScreenProps<{
    requestMicroPhonePermission: boolean;
  }> {}

export const CovidScan: React.FC<CovidScanProps> = (props) => {
  let WebViewRef: any;
  const microPhonePermission = props.navigation.getParam('requestMicroPhonePermission');
  const [loading, setLoading] = useState<boolean>(true);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);

  useEffect(() => {
    requestMicrophonePermission();
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleAndroidBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleAndroidBack);
    };
  }, [canGoBack]);

  const handleAndroidBack = async () => {
    if (canGoBack && WebViewRef) {
      WebViewRef?.goBack();
      return true;
    } else {
      handleBack();
    }
  };

  const requestMicrophonePermission = () => {
    if (microPhonePermission) {
      setTimeout(() => {
        permissionHandler(string.microphone, string.enableMicrophoneToRecordCough, () => {});
      }, 500);
    }
  };

  const handleResponse = (data: NavState, WebViewRef: any) => {
    const homeURL = 'https://www.apollo247.com/';
    const url = data.url;
    setCanGoBack(data?.canGoBack || false);
    if (url && url.indexOf('redirectTo=doctor') > -1 && url.indexOf('#details') < 0) {
      props.navigation.navigate(AppRoutes.DoctorSearch);
    } else if (homeURL === url) {
      props.navigation.goBack();
    }
  };

  const renderWebView = () => {
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadEnd={() => setLoading?.(false)}
        source={{ uri: props.navigation.getParam('covidUrl') }}
        onNavigationStateChange={(data) => handleResponse(data, WebViewRef)}
        renderError={() => renderError(WebViewRef)}
      />
    );
  };

  const handleBack = async () => {
    props.navigation.goBack();
  };

  const renderError = (WebViewRef: any) => {
    WebViewRef && WebViewRef.reload();
    return <View style={{ flex: 1 }}></View>;
  };

  const renderSpinner = () => {
    return (
      <View style={styles.loaderViewStyle}>
        <ActivityIndicator animating={true} size="large" color="#02475b" />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header leftIcon="logo" onPressLeftIcon={() => handleBack()} />
        <View style={{ flex: 1, overflow: 'hidden' }}>{renderWebView()}</View>
      </SafeAreaView>
      {loading && renderSpinner()}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderViewStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 1000,
  },
});
