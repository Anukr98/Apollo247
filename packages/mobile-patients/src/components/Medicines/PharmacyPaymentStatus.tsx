import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Failure,
  Pending,
  Success,
  Copy,
  CircleLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  GET_PHARMA_TRANSACTION_STATUS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string, { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  BackHandler,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
} from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddedCirclePlanWithValidity } from '@aph/mobile-patients/src/components/ui/AddedCirclePlanWithValidity';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface PharmacyPaymentStatusProps extends NavigationScreenProps {}

export const PharmacyPaymentStatus: React.FC<PharmacyPaymentStatusProps> = (props) => {
  const {
    clearCartInfo,
    setCircleMembershipCharges,
    cartTotalCashback,
    isCircleSubscription,
    setIsCircleSubscription,
  } = useShoppingCart();
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(props.navigation.getParam('status'));
  const [paymentRefId, setpaymentRefId] = useState<string>('');
  const [orderDateTime, setorderDateTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [isCircleBought, setIsCircleBought] = useState<boolean>(false);
  const [totalCashBack, setTotalCashBack] = useState<number>(0);

  const price = props.navigation.getParam('price');
  const orderId = props.navigation.getParam('orderId');
  const circleSavings = cartTotalCashback;
  const [circleSubscriptionID, setCircleSubscriptionID] = useState<string>('');

  const client = useApolloClient();
  const { success, failure, pending, aborted } = Payment;
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [circlePlanDetails, setCirclePlanDetails] = useState({});

  const copyToClipboard = (refId: string) => {
    Clipboard.setString(refId);
    setSnackbarState(true);
  };
  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  useEffect(() => {
    getUserSubscriptionsByStatus();
  }, []);

  useEffect(() => {
    setLoading(true);
    client
      .query({
        query: GET_PHARMA_TRANSACTION_STATUS,
        variables: {
          orderId: orderId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const pharmaPaymentStatus = res?.data?.pharmaPaymentStatus;
        setorderDateTime(pharmaPaymentStatus?.orderDateTime);
        setpaymentRefId(pharmaPaymentStatus?.paymentRefId);
        setStatus(pharmaPaymentStatus?.paymentStatus);
        setPaymentMode(pharmaPaymentStatus?.paymentMode);
        setIsCircleBought(!!pharmaPaymentStatus?.planPurchaseDetails?.planPurchased);
        setTotalCashBack(!!pharmaPaymentStatus?.planPurchaseDetails?.totalCashBack);
        setLoading(false);
        fireCirclePlanActivatedEvent();
      })
      .catch((error) => {
        setLoading(false);
        CommonBugFender('fetchingTxnStutus', error);
        renderErrorPopup(`Something went wrong, please try again after sometime`);
      });
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      setCirclePlanDetails(data?.APOLLO?.[0]);
      setCircleSubscriptionID(data?.APOLLO?.[0]._id);
    } catch (error) {
      CommonBugFender('ConsultRoom_getUserSubscriptionsByStatus', error);
    }
  };

  const clearCircleSubscriptionData = () => {
    clearCartInfo && clearCartInfo();
    AsyncStorage.removeItem('circlePlanSelected');
    setCircleMembershipCharges && setCircleMembershipCharges(0);
    setIsCircleSubscription && setIsCircleSubscription(false);
  };

  const handleBack = () => {
    clearCircleSubscriptionData();
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: AppRoutes.ConsultRoom,
          }),
        ],
      })
    );
    return true;
  };

  const fireCirclePlanActivatedEvent = () => {
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PHARMA_CIRCLE_SUBSCRIPTION_PURCHASE] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
    };
    circleSavings > 0 &&
      !circleSubscriptionID &&
      isCircleSubscription &&
      postWebEngageEvent(
        WebEngageEventName.PHARMA_CIRCLE_SUBSCRIPTION_PURCHASE,
        CircleEventAttributes
      );
  };

  const statusIcon = () => {
    if (status === success) {
      return <Success style={styles.statusIconStyles} />;
    } else if (status === failure || status === aborted) {
      return <Failure style={styles.statusIconStyles} />;
    } else {
      return <Pending style={styles.statusIconStyles} />;
    }
  };

  const textComponent = (
    message: string,
    numOfLines: number | undefined,
    color: string,
    needStyle: boolean
  ) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 13, color, 1, 20),
          marginHorizontal: needStyle ? 0.1 * windowWidth : undefined,
        }}
        numberOfLines={numOfLines}
      >
        {message}
      </Text>
    );
  };

  const statusCardColour = () => {
    if (status == success) {
      return colors.SUCCESS;
    } else if (status == failure || status == aborted) {
      return colors.FAILURE;
    } else {
      return colors.PENDING;
    }
  };

  const statusText = () => {
    let message = 'PAYMENT PENDING';
    let textColor = theme.colors.PENDING_TEXT;
    if (status === success) {
      message = ' PAYMENT SUCCESSFUL';
      textColor = theme.colors.SUCCESS_TEXT;
    } else if (status === failure) {
      message = ' PAYMENT FAILED';
      textColor = theme.colors.FAILURE_TEXT;
    } else if (status === aborted) {
      message = ' PAYMENT ABORTED';
      textColor = theme.colors.FAILURE_TEXT;
    }
    return <Text style={theme.viewStyles.text('SB', 16, textColor)}>{message}</Text>;
  };

  const renderStatusCard = () => {
    const refNumberText = String(paymentRefId != '' && paymentRefId != null ? paymentRefId : '--');
    const priceText = `${string.common.Rs} ` + String(price);
    return (
      <View style={[styles.statusCardStyle, { backgroundColor: statusCardColour() }]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View style={styles.statusCardSubContainerStyle}>{statusIcon()}</View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              {statusText()}
            </View>
          </View>
          <Text style={theme.viewStyles.text('SB', 16, '#02475B', 1, 22, 0.7)}>{priceText}</Text>
        </View>
        <View
          style={{
            marginVertical: 10,
            marginHorizontal: 20,
            borderTopColor: '#E5E5E5',
            borderTopWidth: 1,
          }}
        />
        <View>
          <View
            style={{
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}
          >
            <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 30, 0.7)}>Order ID : </Text>
            <Text style={theme.viewStyles.text('M', 15, theme.colors.SHADE_GREY, 1, 30)}>
              {orderId}
            </Text>
          </View>
          {
            !!paymentRefId && (
              <>
                <View style={{ justifyContent: 'flex-start' }}>
                  <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 30, 0.7)}>
                    Payment Reference Number :{' '}
                  </Text>
                  <TouchableOpacity
                    style={styles.refStyles}
                    onPress={() => copyToClipboard(refNumberText)}
                  >
                    <Text style={theme.viewStyles.text('M', 15, theme.colors.SHADE_GREY, 1, 30)}>
                      {paymentRefId}
                    </Text>
                    <Copy style={styles.iconStyle} />
                  </TouchableOpacity>
                </View>
                <Snackbar
                  style={{ position: 'absolute', zIndex: 1001, bottom: -10 }}
                  visible={snackbarState}
                  onDismiss={() => {
                    setSnackbarState(false);
                  }}
                  duration={1000}
                >
                  Copied
                </Snackbar>
              </>
            )
          }
        </View>
        <View>
          <TouchableOpacity onPress={() => {}}></TouchableOpacity>
        </View>
      </View>
    );
  };

  const appointmentHeader = () => {
    return (
      <View style={styles.appointmentHeaderStyle}>
        {textComponent('BOOKING DETAILS', undefined, theme.colors.ASTRONAUT_BLUE, false)}
      </View>
    );
  };

  const appointmentCard = () => {
    return (
      <View style={styles.appointmentCardStyle}>
        <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <View style={{ justifyContent: 'flex-start' }}>
              {textComponent('Order Date & Time', undefined, theme.colors.ASTRONAUT_BLUE, false)}
            </View>
            <View style={{ justifyContent: 'flex-start', marginTop: 5 }}>
              {textComponent(
                getDate(orderDateTime),
                undefined,
                theme.colors.SHADE_CYAN_BLUE,
                false
              )}
            </View>
          </View>
          {
            !!paymentMode && (
              <View>
                <View style={{ justifyContent: 'flex-start' }}>
                  {textComponent('Mode of Payment', undefined, theme.colors.ASTRONAUT_BLUE, false)}
                </View>
                <View style={{ justifyContent: 'flex-start', marginTop: 5 }}>
                  {textComponent(paymentMode, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
                </View>
              </View>
            )
          }
        </View>
      </View>
    );
  };

  const renderNote = () => {
    let noteText = '';
    if (status === failure) {
      noteText =
        'Note : In case your account has been debited, you should get the refund in 10-14 business days.';
    } else if(paymentMode === 'COD') {
      noteText = 'Note - Your order is confirmed and has been placed successfully.';
    } else if (status != success && status != failure && status != aborted) {
      noteText =
        'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.';
    }
    return textComponent(noteText, undefined, theme.colors.SHADE_GREY, true);
  };

  const getButtonText = () => {
    if (status == success) {
      return 'TRACK ORDER';
    } else if (status == failure || status == aborted) {
      return 'TRY AGAIN';
    } else {
      return 'GO TO HOMEPAGE';
    }
  };

  const handleButton = () => {
    if (status == success) {
      clearCircleSubscriptionData();
      props.navigation.navigate(AppRoutes.OrderDetailsScene, {
        goToHomeOnBack: true,
        showOrderSummaryTab: false,
        orderAutoId: orderId,
      });
    } else if (status == failure || status == aborted) {
      setCircleMembershipCharges && setCircleMembershipCharges(0);
      setIsCircleSubscription && setIsCircleSubscription(false);
      props.navigation.navigate(AppRoutes.MedicineCart);
    } else {
      clearCircleSubscriptionData();
      props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [
            NavigationActions.navigate({
              routeName: AppRoutes.ConsultRoom,
            }),
          ],
        })
      );
    }
  };

  const renderButton = () => {
    return (
      <View>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            handleButton();
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 13, '#ffffff', 1, 24) }}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>
        {status === success && (
          <TouchableOpacity
            style={styles.textButtonStyle}
            onPress={() => {
              clearCircleSubscriptionData();
              props.navigation.navigate(AppRoutes.ConsultRoom);
            }}
          >
            <Text style={{ ...theme.viewStyles.text('B', 13, '#fcb716', 1, 24) }}>
              GO TO HOMEPAGE
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAddedCirclePlanWithValidity = () => {
    return (
      <AddedCirclePlanWithValidity
        circleSavings={circleSavings}
        circlePlanDetails={circlePlanDetails}
        isConsult={false}
      />
    );
  };

  const renderCircleSavingsOnPurchase = () => {
    return (
      <View style={styles.circleSavingsContainer}>
        <View style={styles.rowCenter}>
          <CircleLogo style={styles.circleLogo} />
          <Text
            style={{
              ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 14),
              marginTop: 3,
              left: -5,
            }}
          >
            {' '}You{' '}
            <Text style={theme.viewStyles.text('SB', 14, theme.colors.SEARCH_UNDERLINE_COLOR)}>
              saved {string.common.Rs}
              {circleSavings}{' '}
            </Text>
            on your purchase
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />
      {!loading ? (
        <View style={styles.container}>
          <ScrollView style={styles.container}>
            {renderStatusCard()}
            {status === 'PAYMENT_SUCCESS' &&
            isCircleBought
              ? renderAddedCirclePlanWithValidity()
              : null}
            {(status === 'PAYMENT_SUCCESS' || paymentMode === 'COD') &&
            totalCashBack
              ? renderCircleSavingsOnPurchase()
              : null}
            {appointmentHeader()}
            {appointmentCard()}
            {renderNote()}
            {renderButton()}
          </ScrollView>
        </View>
      ) : (
        <Spinner />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  Payment: {
    fontSize: 14,
    color: theme.colors.ASTRONAUT_BLUE,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
  statusIconStyles: {
    width: 25,
    height: 25,
  },
  statusCardStyle: {
    margin: 0.06 * windowWidth,
    padding: 15,
    flex: 1,
    borderRadius: 10,
    paddingBottom: 15,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  statusCardSubContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentCardStyle: {
    marginVertical: 0.03 * windowWidth,
    paddingHorizontal: 15,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  appointmentHeaderStyle: {
    backgroundColor: '#eee',
    height: 0.04 * windowHeight,
    justifyContent: 'center',
    marginHorizontal: 0.06 * windowWidth,
    borderBottomWidth: 0.8,
    borderBottomColor: '#ddd',
  },
  buttonStyle: {
    height: 0.06 * windowHeight,
    backgroundColor: '#fcb716',
    marginTop: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  textButtonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  refStyles: {
    flexDirection: 'row',
  },
  iconStyle: {
    marginLeft: 6,
    marginTop: 5,
    width: 9,
    height: 10,
  },
  inputStyle: {
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansMedium(11),
    color: '#6D7278',
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  viewInvoice: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightIcon: {
    flex: 0.15,
    alignItems: 'flex-end',
  },
  sentMsg: {
    color: 'rgba(74, 165, 74, 0.6)',
    marginVertical: 4,
    ...theme.fonts.IBMPlexSansMedium(11),
  },
  priceCont: {
    alignItems: 'center',
    marginTop: 4,
  },
  paymentRef: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  circleSavingsContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    borderRadius: 5,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleLogo: {
    width: 50,
    height: 32,
    marginRight: 5,
  },
});
