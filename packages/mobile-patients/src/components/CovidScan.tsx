import React, { useEffect, useState, useRef } from 'react';
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
  ActivityIndicator,
  NavState,
  Alert,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

export interface CovidScanProps extends NavigationScreenProps {}

export const CovidScan: React.FC<CovidScanProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);

  const handleResponse = (data: NavState) => {
    const homeURL = 'http://www.apollo247.com/';
    const url = data.url;

    if (url && url.indexOf('redirectTo=doctor') > -1 && url.indexOf('#details') < 0) {
      props.navigation.navigate(AppRoutes.DoctorSearch);
    } else if (homeURL === url) {
      props.navigation.goBack();
    }
  };

  const renderWebView = () => {
    return (
      <WebView
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        source={{ uri: 'https://covid.apollo247.com?utm_source=mobile_app' }}
        onNavigationStateChange={(data) => handleResponse(data)}
      />
    );
  };

  const handleBack = async () => {
    Alert.alert('Alert', 'Do you want to go back?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => props.navigation.goBack() },
    ]);
  };

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
