import React, { useState } from 'react';
import { SafeAreaView, View, ActivityIndicator, NavState, Alert } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Spinner } from './ui/Spinner';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';

export interface CommonWebViewProps extends NavigationScreenProps {}

export const CommonWebView: React.FC<CommonWebViewProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const { setCirclePlanSelected, setDefaultCirclePlan } = useShoppingCart();

  const renderWebView = () => {
    let WebViewRef: any;
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadEnd={() => setLoading!(false)}
        source={{ uri: props.navigation.getParam('url') }}
        renderError={(errorCode) => renderError(WebViewRef)}
        onMessage={(event) => {
          const { data } = event.nativeEvent;
          if (data && JSON.parse(data)?.subPlanId) {
            setDefaultCirclePlan && setDefaultCirclePlan(null);
            setCirclePlanSelected && setCirclePlanSelected(JSON.parse(data));
            AsyncStorage.setItem('circlePlanSelected', data);
            props.navigation.goBack();
          }
        }}
      />
    );
  };

  const handleBack = async () => {
    props.navigation.navigate(AppRoutes.ConsultRoom);
  };

  const renderError = (WebViewRef: any) => {
    props.navigation.navigate(AppRoutes.ConsultRoom);
    return <View style={{ flex: 1 }}></View>;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header leftIcon="logo" onPressLeftIcon={() => handleBack()} />
        <View style={{ flex: 1, overflow: 'hidden' }}>{renderWebView()}</View>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
