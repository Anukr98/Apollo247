import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { formatUrl, permissionHandler } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
import { NavigationRoute, NavigationScreenProp, NavigationScreenProps } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAllCurrentPatients, useAuth } from '../hooks/authHooks';
import {
  RadiologyBookingCompleted,
  RadiologyLandingPage,
} from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface ProHealthWebViewProps
  extends NavigationScreenProps<{
    requestMicroPhonePermission: boolean;
    goBackCallback?: (navigation: NavigationScreenProp<NavigationRoute<object>, object>) => void;
    source?: string;
    currentPatient?: any;
  }> {}

export const ProHealthWebView: React.FC<ProHealthWebViewProps> = (props) => {
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const { navigation } = props;
  let WebViewRef: any;
  const microPhonePermission = props.navigation.getParam('requestMicroPhonePermission');
  const [loading, setLoading] = useState<boolean>(true);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>('');
  const [userMobileNumber, setUserMobileNumber] = useState<string | null>('');
  const { currentPatient } = useAllCurrentPatients();
  const source = props.navigation.getParam('source');
  const getCurrentPatients = props.navigation.getParam('currentPatient');
  const { returnAuthToken } = useAuth();

  useEffect(() => {
    const saveSessionValues = async () => {
      returnAuthToken?.().then(setToken);
      setUserMobileNumber(currentPatient?.mobileNumber);
    };
    saveSessionValues();
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
        permissionHandler(
          string.microphone,
          string.enableMicrophoneToRecordCough,
          () => {},
          undefined,
          currentPatient
        );
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

  function triggerRadiologyHomePageCT() {
    RadiologyLandingPage(
      getCurrentPatients,
      isDiagnosticCircleSubscription,
      'Home Banner',
      AppConfig.Configuration.RADIOLOGY_URL
    );
  }

  function triggerRadiologySuccessCT(formDetails: any) {
    RadiologyBookingCompleted(
      getCurrentPatients,
      isDiagnosticCircleSubscription,
      'Home Banner',
      AppConfig.Configuration.RADIOLOGY_URL,
      formDetails
    );
  }

  const renderWebView = () => {
    let uri = formatUrl(`${props.navigation.getParam('covidUrl')}`, token, userMobileNumber);
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadEnd={() => setLoading?.(false)}
        source={{ uri }}
        cacheEnabled={true}
        javaScriptEnabled={true}
        onNavigationStateChange={(data) => handleResponse(data, WebViewRef)}
        renderError={() => renderError(WebViewRef)}
        onMessage={(event) => {
          const { data } = event.nativeEvent;
          const callBackData = data && JSON.parse(data);
          if (callBackData === 'back') {
            handleBack();
          }
          if (
            source == string.diagnostics.radiology &&
            callBackData?.event == CleverTapEventName.DIAGNOSTIC_RADIOLOGY_HOME_PAGE
          ) {
            triggerRadiologyHomePageCT();
          }
          if (
            source == string.diagnostics.radiology &&
            callBackData?.event == CleverTapEventName.DIAGNOSTIC_RADIOLOGY_BOOKING_COMPLETE
          ) {
            triggerRadiologySuccessCT(callBackData?.data);
          }
        }}
      />
    );
  };

  const handleBack = async () => {
    props.navigation.goBack();
    navigation.state.params?.goBackCallback?.(props.navigation);
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
