import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TestsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getParameterByName, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Alert,
  NavState,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { WebView } from 'react-native-webview';

const styles = StyleSheet.create({
  popupButtonStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupButtonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.APP_YELLOW,
    lineHeight: 24,
  },
});

export interface TestPaymentProps extends NavigationScreenProps {
  orderId: string;
  displayId: string;
  price: number;
  homeVisitTime: string;
}

export const TestPayment: React.FC<TestPaymentProps> = (props) => {
  const homeVisitTime = props.navigation.getParam('homeVisitTime');
  const price = props.navigation.getParam('price');
  const orderId = props.navigation.getParam('orderId');
  const displayId = props.navigation.getParam('displayId');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const [loading, setLoading] = useState(true);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { clearCartInfo } = useDiagnosticsCart();

  const handleBack = async () => {
    Alert.alert('Alert', 'Do you want to go back?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => props.navigation.goBack() },
    ]);
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderId: string) => {
    hideAphAlert!();
    props.navigation.navigate(AppRoutes.TestOrderDetails, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderId: orderId,
    });
  };

  const handleOrderSuccess = async () => {
    CommonLogEvent(AppRoutes.TestPayment, 'handleOrderSuccess');
    setLoading!(false);
    clearCartInfo!();
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
    showAphAlert!({
      // unDismissable: true,
      title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
      description: 'Your order has been placed successfully.',
      children: (
        <View>
          <View
            style={{
              margin: 20,
              marginTop: 16,
              padding: 16,
              backgroundColor: '#f7f8f5',
              borderRadius: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TestsIcon />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 2,
                  ...theme.fonts.IBMPlexSansMedium(17),
                  lineHeight: 24,
                  color: '#01475b',
                }}
              >
                Tests
              </Text>
              <Text
                style={{
                  flex: 1,
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 24,
                  color: '#01475b',
                  textAlign: 'right',
                }}
              >
                {`#${displayId}`}
              </Text>
            </View>
            {!!homeVisitTime && (
              <>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#02475b',
                    opacity: 0.1,
                    marginBottom: 7.5,
                    marginTop: 15.5,
                  }}
                />
                <View>
                  <Text
                    style={{
                      ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
                    }}
                  >
                    {`Home Visit On: ${homeVisitTime}`}
                  </Text>
                </View>
              </>
            )}
            <View
              style={{
                height: 1,
                backgroundColor: '#02475b',
                opacity: 0.1,
                marginBottom: 7.5,
                marginTop: 15.5,
              }}
            />
            <View style={styles.popupButtonStyle}>
              {/* <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigateToOrderDetails(true, orderId)}
            >
              <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
            </TouchableOpacity> */}
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'flex-end' }}
                onPress={() => navigateToOrderDetails(true, orderId)}
              >
                <Text style={styles.popupButtonTextStyle}>VIEW ORDER SUMMARY</Text>
              </TouchableOpacity>
            </View>
          </View>
          {renderDiagnosticHelpText()}
        </View>
      ),
    });
  };

  const renderDiagnosticHelpText = () => {
    const textMediumStyle = theme.viewStyles.text('M', 14, '#02475b', 1, 22);
    const textBoldStyle = theme.viewStyles.text('B', 14, '#02475b', 1, 22);
    const PhoneNumberTextStyle = theme.viewStyles.text('M', 14, '#fc9916', 1, 22);
    const ontapNumber = (number: string) => {
      Linking.openURL(`tel:${number}`)
        .then(() => {})
        .catch((e) => {
          CommonBugFender('TestPayment_Linking_Call', e);
        });
    };

    return (
      <Text style={{ margin: 20, marginTop: 0 }}>
        <Text style={textMediumStyle}>{'For '}</Text>
        <Text style={textBoldStyle}>{'Test Orders,'}</Text>
        <Text style={textMediumStyle}>
          {' to know the Order Status / Reschedule / Cancel, please call —\n'}
        </Text>
        <Text onPress={() => ontapNumber('040 44442424')} style={PhoneNumberTextStyle}>
          {'040 44442424'}
        </Text>
        <Text style={textMediumStyle}>{' / '}</Text>
        <Text onPress={() => ontapNumber('040 33442424')} style={PhoneNumberTextStyle}>
          {'040 33442424'}
        </Text>
      </Text>
    );
  };

  const handleOrderFailure = () => {
    CommonLogEvent(AppRoutes.TestPayment, 'handleOrderFailure');
    props.navigation.goBack();
    showAphAlert!({
      title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
      description: `We're sorry. :(  There's been a problem with your order. If money was debited from your account, it will be refunded automatically in 5-7 working days.`,
      unDismissable: true,
    });
  };

  const onWebViewStateChange = (data: NavState) => {
    const redirectedUrl = data.url;
    console.log({ data, redirectedUrl });
    console.log(`RedirectedUrl: ${redirectedUrl}`);

    const isMatchesSuccessUrl =
      (redirectedUrl &&
        redirectedUrl.indexOf(AppConfig.Configuration.DIAGNOSTICS_PG_SUCCESS_PATH) > -1) ||
      false;
    const isMatchesFailUrl =
      (redirectedUrl &&
        (redirectedUrl.indexOf(AppConfig.Configuration.DIAGNOSTICS_PG_ERROR_PATH) > -1 ||
          redirectedUrl.indexOf(AppConfig.Configuration.DIAGNOSTICS_PG_CANCEL_PATH) > -1)) ||
      false;

    if (isMatchesSuccessUrl) {
      // BOOKING SUCCESSFULL
      const tk = getParameterByName('tk', redirectedUrl!);
      const status = getParameterByName('status', redirectedUrl!);
      console.log({ tk, status });
      handleOrderSuccess();
    }
    if (isMatchesFailUrl) {
      // BOOKING FAILED
      handleOrderFailure();
    }
  };

  const renderWebView = () => {
    const baseUrl = AppConfig.Configuration.DIAGNOSTICS_PG_BASE_URL;
    const url = `${baseUrl}/diagnosticpayment?patientId=${currentPatiendId}&orderId=${orderId}&price=${price}`;
    // const url =
    //   'https://aph.dev.pmt.popcornapps.com/diagnosticpayment?patientId=1d75146c-029e-4eb9-badb-0574d93c0d9f&orderId=b4548315-1129-4de2-a82d-8c9e5c9695bb&price=100';
    console.log(`%cDIAGNOSTICS_PG_URL:\t${url}`, 'color: #bada55');
    return (
      <WebView
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        bounces={false}
        useWebKit={true}
        source={{ uri: url }}
        domStorageEnabled={true}
        onNavigationStateChange={onWebViewStateChange}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          title="PAYMENT"
          leftText={{
            isBack: false,
            title: 'Cancel',
            onPress: handleBack,
          }}
        />
        <View style={{ flex: 1, overflow: 'hidden' }}>{renderWebView()}</View>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
