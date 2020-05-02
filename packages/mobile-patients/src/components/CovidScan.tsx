import React, { useState } from 'react';
import { SafeAreaView, View, ActivityIndicator, NavState, Alert } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface CovidScanProps extends NavigationScreenProps {}

export const CovidScan: React.FC<CovidScanProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);

  const handleResponse = (data: NavState, WebViewRef: any) => {
    const homeURL = 'http://www.apollo247.com/';
    const url = data.url;
    console.log(data);
    if (url && url.indexOf('redirectTo=doctor') > -1 && url.indexOf('#details') < 0) {
      props.navigation.navigate(AppRoutes.DoctorSearch);
    } else if (homeURL === url) {
      props.navigation.goBack();
    }
  };

  const renderWebView = () => {
    let WebViewRef: any;
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        // onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        source={{ uri: props.navigation.getParam('covidUrl') }}
        onNavigationStateChange={(data) => handleResponse(data, WebViewRef)}
        renderError={() => renderError(WebViewRef)}
      />
    );
  };

  const handleBack = async () => {
    props.navigation.goBack();
  };

  const renderError = (WebViewRef:any) => {
    WebViewRef && WebViewRef.reload();
    return(
      <View style={{flex:1}}>

      </View>
    )
  }
  const renderSpinner = () => {
    return (
      <View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            // backgroundColor: 'rgba(0,0,0, 0.3)',
            alignSelf: 'center',
            justifyContent: 'center',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            elevation: 1000,
          },
        ]}
      >
        <ActivityIndicator animating={true} size="large" color="#02475b" />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header leftIcon="backArrow" onPressLeftIcon={() => handleBack()} />
        <View style={{ flex: 1, overflow: 'hidden' }}>{renderWebView()}</View>
      </SafeAreaView>
      {loading && renderSpinner()}
    </View>
  );
};
