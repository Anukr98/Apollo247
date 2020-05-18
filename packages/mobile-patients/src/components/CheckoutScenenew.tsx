import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Check,
  CheckUnselectedIcon,
  MedicineIcon,
  OneApollo,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
  CheckedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_MEDICINE_ORDER_OMS,
  SAVE_MEDICINE_ORDER_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  MedicineCartOMSItem,
  MEDICINE_ORDER_PAYMENT_TYPE,
  CODCity,
  BOOKINGSOURCE,
  DEVICETYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';
import {
  aphConsole,
  g,
  handleGraphQlError,
  postWebEngageEvent,
  formatAddress,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleProp,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  View,
  ViewStyle,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { Slider } from 'react-native-elements';
import firebase from 'react-native-firebase';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import {
  SaveMedicineOrderPaymentMq,
  SaveMedicineOrderPaymentMqVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrderPaymentMq';
import moment from 'moment';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { fetchPaymentOptions } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';

export interface CheckoutSceneNewProps extends NavigationScreenProps {}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export const CheckoutSceneNew: React.FC<CheckoutSceneNewProps> = (props) => {
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const isChennaiOrder = props.navigation.getParam('isChennaiOrder');
  const whatsAppUpdate = props.navigation.getParam('whatsAppUpdate');

  const { currentPatient } = useAllCurrentPatients();
  const [isCashOnDelivery, setCashOnDelivery] = useState(isChennaiOrder ? true : false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>(g(currentPatient, 'emailAddress') || '');
  const [emailIdCheckbox, setEmailIdCheckbox] = useState<boolean>(
    g(currentPatient, 'emailAddress') ? false : true
  );
  const [agreementCheckbox, setAgreementCheckbox] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const {
    deliveryAddressId,
    storeId,
    grandTotal,
    deliveryCharges,
    cartItems,
    deliveryType,
    clearCartInfo,
    physicalPrescriptions,
    ePrescriptions,
    uploadPrescriptionRequired,
    couponDiscount,
    productDiscount,
    cartTotal,
    addresses,
    stores,
    coupon,
  } = useShoppingCart();

  type bankOptions = {
    name: string;
    paymentMode: string;
    bankCode: string;
    seq: number;
    enabled: boolean;
    imageUrl: string;
  };
  const [bankOptions, setbankOptions] = useState<bankOptions[]>([]);

  type paymentOptions = {
    name: string;
    paymentMode: string;
    enabled: boolean;
    seq: number;
    imageUrl: string;
  };
  const [paymentOptions, setpaymentOptions] = useState<paymentOptions[]>([]);

  const MAX_SLIDER_VALUE = grandTotal;
  const client = useApolloClient();

  const getFormattedAmount = (num: number) => Number(num.toFixed(2));

  const saveOrder = (orderInfo: saveMedicineOrderOMSVariables) =>
    client.mutate<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>({
      mutation: SAVE_MEDICINE_ORDER_OMS,
      variables: orderInfo,
    });

  const savePayment = (paymentInfo: SaveMedicineOrderPaymentMqVariables) =>
    client.mutate<SaveMedicineOrderPaymentMq, SaveMedicineOrderPaymentMqVariables>({
      mutation: SAVE_MEDICINE_ORDER_PAYMENT,
      variables: paymentInfo,
    });

  useEffect(() => {
    fetchPaymentOptions()
      .then((res: any) => {
        console.log(JSON.stringify(res), 'objobj');
        let options: paymentOptions[] = [];
        res.data.forEach((item: any) => {
          if (item && item.enabled && item.paymentMode != 'NB') {
            options.push(item);
          } else if (item && item.enabled && item.paymentMode == 'NB') {
            let bankList: bankOptions[] = [];
            let bankOptions: bankOptions[] = item.banksList;
            bankOptions.forEach((item) => {
              if (item.enabled) {
                item.paymentMode = 'NB';
                bankList.push(item);
              }
            });
            if (bankList.length > 0) {
              bankList.sort((a, b) => {
                return a.seq - b.seq;
              });
              setbankOptions(bankList);
            } else {
              delete item.banksList;
              options.push(item);
            }
          }
        });
        options.sort((a, b) => {
          return a.seq - b.seq;
        });
        setpaymentOptions(options);
        setLoading && setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingPaymentOptions', error);
        console.log(error);
        props.navigation.navigate(AppRoutes.DoctorSearch);
        renderErrorPopup(`Something went wrong, plaease try again after sometime`);
      });
    return () => {
      // setLoading && setLoading(false);
    };
  }, []);

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const getPrepaidCheckoutCompletedEventAttributes = (orderAutoId: string) => {
    try {
      const addr = deliveryAddressId && addresses.find((item) => item.id == deliveryAddressId);
      const store = storeId && stores.find((item) => item.storeid == storeId);
      const shippingInformation = addr ? formatAddress(addr) : store ? store.address : '';
      const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED] = {
        'Order ID': orderAutoId,
        'Order Type': 'Cart',
        'Prescription Required': uploadPrescriptionRequired,
        'Prescription Added': !!(physicalPrescriptions.length || ePrescriptions.length),
        'Shipping information': shippingInformation, // (Home/Store address)
        'Total items in cart': cartItems.length,
        'Grand Total': cartTotal + deliveryCharges,
        'Total Discount %': coupon
          ? getFormattedAmount(((couponDiscount + productDiscount) / cartTotal) * 100)
          : 0,
        'Discount Amount': getFormattedAmount(couponDiscount + productDiscount),
        'Delivery charge': deliveryCharges,
        'Net after discount': getFormattedAmount(grandTotal),
        'Payment status': 1,
        'Payment Type': 'Prepaid',
        'Service Area': 'Pharmacy',
        AllowWhatsAppMessage: whatsAppUpdate,
      };
      return eventAttributes;
    } catch (error) {
      return {};
    }
  };

  const postwebEngageCheckoutCompletedEvent = (orderAutoId: string) => {
    const eventAttributes = {
      ...getPrepaidCheckoutCompletedEventAttributes(`${orderAutoId}`),
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);
  };

  const placeOrder = (orderId: string, orderAutoId: number) => {
    console.log('placeOrder\t', { orderId, orderAutoId });
    const paymentInfo: SaveMedicineOrderPaymentMqVariables = {
      medicinePaymentMqInput: {
        // orderId: orderId,
        orderAutoId: orderAutoId,
        amountPaid: getFormattedAmount(grandTotal),
        paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
        // Values for chennai COD order
        email: isChennaiOrder && email ? email.trim() : null,
        CODCity: isChennaiOrder ? CODCity.CHENNAI : null,
      },
    };
    console.log(JSON.stringify(paymentInfo));

    savePayment(paymentInfo)
      .then(({ data }) => {
        const { errorCode, errorMessage } = g(data, 'SaveMedicineOrderPaymentMq') || {};
        console.log({ data });
        console.log({ errorCode, errorMessage });
        setLoading && setLoading(false);
        if (errorCode || errorMessage) {
          // Order-failed
          showAphAlert!({
            title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
            description: `Your order failed due to some temporary issue :( Please submit the order again.`,
          });
        } else {
          // Order-Success, Show popup here & clear cart info
          try {
            postwebEngageCheckoutCompletedEvent(`${orderAutoId}`);
          } catch (error) {
            console.log(error);
          }
          clearCartInfo && clearCartInfo();
          handleOrderSuccess(`${orderAutoId}`);
        }
      })
      .catch((e) => {
        CommonBugFender('CheckoutScene_savePayment', e);
        setLoading && setLoading(false);
        aphConsole.log({ e });
        showAphAlert!({
          title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
          description: `Your order failed due to some temporary issue :( Please submit the order again.`,
        });
      });
  };

  const redirectToPaymentGateway = async (
    orderId: string,
    orderAutoId: number,
    paymentMode: any,
    bankCode: any
  ) => {
    try {
      const paymentEventAttributes = {
        Payment_Mode: paymentMode,
        Type: 'Pharmacy',
        order_Id: orderId,
        order_AutoId: orderAutoId,
      };
      postWebEngageEvent(WebEngageEventName.PAYMENT_INSTRUMENT, paymentEventAttributes);
    } catch (error) {}
    const token = await firebase.auth().currentUser!.getIdToken();
    console.log({ token });
    const checkoutEventAttributes = {
      ...getPrepaidCheckoutCompletedEventAttributes(`${orderAutoId}`),
    };
    props.navigation.navigate(AppRoutes.PaymentScene, {
      orderId,
      orderAutoId,
      token,
      amount: getFormattedAmount(grandTotal),
      deliveryTime,
      checkoutEventAttributes,
      paymentTypeID: paymentMode,
      bankCode: bankCode,
    });
  };

  const initiateOrder = async (paymentMode: any, bankCode: any, isCOD: boolean) => {
    setLoading && setLoading(true);
    const orderInfo: saveMedicineOrderOMSVariables = {
      medicineCartOMSInput: {
        coupon: coupon ? coupon.code : '',
        couponDiscount: coupon ? getFormattedAmount(couponDiscount) : 0,
        productDiscount: getFormattedAmount(productDiscount) || 0,
        quoteId: null,
        patientId: (currentPatient && currentPatient.id) || '',
        shopId: storeId || null,
        patientAddressId: deliveryAddressId,
        medicineDeliveryType: deliveryType!,
        devliveryCharges: deliveryCharges,
        estimatedAmount: getFormattedAmount(grandTotal),
        prescriptionImageUrl: [
          ...physicalPrescriptions.map((item) => item.uploadedUrl),
          ...ePrescriptions.map((item) => item.uploadedUrl),
        ].join(','),
        prismPrescriptionFileId: [
          ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
          ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
        ].join(','),
        orderTat: deliveryAddressId && moment(deliveryTime).isValid ? deliveryTime : '',
        items: cartItems.map((item) => {
          const discountedPrice = getFormattedAmount(
            (coupon && item.couponPrice) || item.specialPrice || item.price
          ); // since couponPrice & specialPrice can be undefined
          return {
            medicineSKU: item.id,
            medicineName: item.name,
            quantity: item.quantity,
            mrp: getFormattedAmount(item.price),
            price: discountedPrice,
            specialPrice: Number(item.price || item.specialPrice),
            itemValue: getFormattedAmount(item.price * item.quantity), // (multiply MRP with quantity)
            itemDiscount: getFormattedAmount(
              item.price * item.quantity - discountedPrice * item.quantity
            ), // (diff of (MRP - discountedPrice) * quantity)
            isPrescriptionNeeded: item.prescriptionRequired ? 1 : 0,
            mou: Number(item.mou),
            isMedicine: item.isMedicine ? '1' : '0',
          } as MedicineCartOMSItem;
        }),
        bookingSource: BOOKINGSOURCE.MOBILE,
        deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
      },
    };

    console.log(JSON.stringify(orderInfo));

    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PAYMENT_INITIATED] = {
      'Payment mode': isCashOnDelivery ? 'COD' : 'Online',
      Amount: grandTotal,
      'Service Area': 'Pharmacy',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PAYMENT_INITIATED, eventAttributes);

    saveOrder(orderInfo)
      .then(({ data }) => {
        const { orderId, orderAutoId, errorCode, errorMessage } =
          g(data, 'saveMedicineOrderOMS')! || {};
        console.log({ orderAutoId, orderId, errorCode, errorMessage });

        if (errorCode || errorMessage) {
          // Order-failed
          showAphAlert!({
            title: `Uh oh.. :(`,
            description: `Order failed, ${errorMessage}.`,
          });
          setLoading && setLoading(false);
          return;
        } else {
          if (isCOD) {
            console.log('isCashOnDelivery\t', { orderId, orderAutoId });
            placeOrder(orderId, orderAutoId);
          } else {
            console.log('Redirect To Payment Gateway');
            redirectToPaymentGateway(orderId, orderAutoId, paymentMode, bankCode)
              .catch((e) => {
                CommonBugFender('CheckoutScene_redirectToPaymentGateway', e);
              })
              .finally(() => {
                setLoading && setLoading(false);
              });
          }
        }
      })
      .catch((error) => {
        CommonBugFender('CheckoutScene_saveOrder', error);
        setLoading && setLoading(false);
        handleGraphQlError(error);
      });
  };

  const handleOrderSuccess = (orderAutoId: string) => {
    console.log('handleOrderSuccess\n', { orderAutoId });
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
      description:
        'Your order has been placed successfully. We will confirm the order in a few minutes.',
      children: (
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
            <MedicineIcon />
            <Text
              style={{
                flex: 1,
                ...theme.fonts.IBMPlexSansMedium(17),
                lineHeight: 24,
                color: '#01475b',
              }}
            >
              Medicines
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
              {`#${orderAutoId}`}
            </Text>
          </View>
          {moment(deliveryTime).isValid() && (
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
                  {deliveryTime &&
                    `Delivery By: ${moment(deliveryTime).format('D MMM YYYY  | hh:mm A')}`}
                </Text>
              </View>
            </>
          )}
          <View
            style={{
              height: 1,
              backgroundColor: '#02475b',
              opacity: 0.1,
              marginBottom: 15.5,
              marginTop: 7.5,
            }}
          />
          <View style={styles.popupButtonStyle}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigateToOrderDetails(true, orderAutoId)}
            >
              <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'flex-end' }}
              onPress={() => navigateToOrderDetails(false, orderAutoId)}
            >
              <Text style={styles.popupButtonTextStyle}>TRACK ORDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    });
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderAutoId: string) => {
    hideAphAlert!();
    props.navigation.navigate(AppRoutes.OrderDetailsScene, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderAutoId: orderAutoId,
    });
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'PAYMENT'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.CheckoutScene, 'Go back clicked');
          props.navigation.goBack();
        }}
      />
    );
  };

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const onPressChennaiOrderPayButton = () => {
    if (!(email === '' || (email && isSatisfyingEmailRegex(email.trim())))) {
      showAphAlert!({ title: 'Uh oh.. :(', description: 'Enter valid email' });
    } else {
      try {
        CommonLogEvent(AppRoutes.CheckoutScene, `SUBMIT TO CONFIRM ORDER`);
      } catch (error) {
        CommonBugFender('CheckoutScene_renderPayButton_try', error);
      }
      initiateOrder(null, null, true);
    }
  };

  const renderChennaiOrderPayButton = () => {
    const isPayDisabled = !agreementCheckbox;
    return (
      <StickyBottomComponent
        style={[styles.stickyBottomComponentStyle, { paddingHorizontal: 0, paddingTop: 25 }]}
      >
        <Button
          style={{ width: '100%' }}
          title={`SUBMIT TO CONFIRM ORDER`}
          onPress={onPressChennaiOrderPayButton}
          disabled={isPayDisabled}
        />
      </StickyBottomComponent>
    );
  };

  const renderChennaiOrderFormAndPayButton = () => {
    const keyboardVerticalOffset =
      Platform.OS === 'android' ? { keyboardVerticalOffset: 110 } : { keyboardVerticalOffset: 30 };

    return (
      <View style={{ ...theme.viewStyles.card(16, 20, 10, '#fff'), flex: 1 }}>
        {/* <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} {...keyboardVerticalOffset}> */}
        <ScrollView contentContainerStyle={{ flex: 1 }} bounces={false}>
          {renderChennaiOrderForm()}
          {renderChennaiOrderPayButton()}
        </ScrollView>
        {/* </KeyboardAvoidingView> */}
      </View>
    );
  };

  const renderChennaiOrderForm = () => {
    return (
      <>
        <Text style={styles.textStyle1}>
          {`Dear ${g(currentPatient, 'firstName') ||
            ''},\n\nSUPERB!\n\nYour order request is in process\n`}
        </Text>
        <Text style={styles.textStyle2}>
          {'Just one more step. New Regulation in your region requires your email id.\n'}
        </Text>
        <Text style={styles.textStyle3}>{'Your email id please'}</Text>
        <TextInputComponent
          value={`${email}`}
          onChangeText={(email) => setEmail(email)}
          placeholder={'name@email.com'}
          inputStyle={styles.inputStyle}
        />
        <TouchableOpacity
          onPress={() => setEmailIdCheckbox(!emailIdCheckbox)}
          activeOpacity={1}
          style={styles.checkboxViewStyle}
        >
          {emailIdCheckbox ? <CheckedIcon /> : <CheckUnselectedIcon />}
          <Text style={styles.checkboxTextStyle}>
            {
              'Check this box if you don’t have an Email Id & want us to share your order details over SMS.'
            }
          </Text>
        </TouchableOpacity>
        <Spearator style={styles.separatorStyle} />
        <TouchableOpacity
          onPress={() => setAgreementCheckbox(!agreementCheckbox)}
          activeOpacity={1}
          style={[styles.checkboxViewStyle, { marginTop: 0 }]}
        >
          {agreementCheckbox ? <CheckedIcon /> : <CheckUnselectedIcon />}
          <Text style={styles.checkboxTextStyle}>
            {'I agree to share my medicine requirements with Apollo Pharmacy for home delivery.'}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const rendertotalAmount = () => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          width: 0.9 * windowWidth,
          height: 0.07 * windowHeight,
          borderRadius: 9,
          backgroundColor: 'rgba(0, 135, 186, 0.15)',
          margin: 0.05 * windowWidth,
        }}
      >
        <View
          style={{
            flex: 0.5,
            justifyContent: 'center',
            marginLeft: 0.02 * windowWidth,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            {' '}
            Amount To Pay
          </Text>
        </View>
        <View
          style={{
            flex: 0.5,
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginRight: 0.06 * windowWidth,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 15, theme.colors.SHERPA_BLUE, 1, 20) }}>
            Rs. {getFormattedAmount(grandTotal)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPaymentOptions = () => {
    return (
      <View>
        <View
          style={{
            width: 0.9 * windowWidth,
            margin: 0.05 * windowWidth,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            PAY VIA
          </Text>
        </View>
        <View
          style={{
            width: 0.9 * windowWidth,
            height: 1,
            backgroundColor: 'rgba(2, 71, 91, 0.2)',
            margin: 0.05 * windowWidth,
            marginTop: 0.01 * windowWidth,
            marginBottom: 0.03 * windowWidth,
          }}
        ></View>
        <FlatList
          data={paymentOptions}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setCashOnDelivery(false);
                initiateOrder(item.paymentMode, null, false);
              }}
              style={styles.paymentModeCard}
            >
              <View
                style={{
                  flex: 0.16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image source={{ uri: item.imageUrl }} style={{ width: 30, height: 30 }} />
              </View>
              <View
                style={{
                  flex: 0.84,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <Text
                  style={{ ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 20) }}
                >
                  {' '}
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
        />
      </View>
    );
  };

  const renderNetBanking = () => {
    return (
      <View>
        <View
          style={{
            width: 0.9 * windowWidth,
            margin: 0.05 * windowWidth,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            NET BANKING
          </Text>
        </View>
        <View
          style={{
            width: 0.9 * windowWidth,
            height: 1,
            backgroundColor: 'rgba(2, 71, 91, 0.2)',
            margin: 0.05 * windowWidth,
            marginTop: 0.01 * windowWidth,
            marginBottom: 0.03 * windowWidth,
          }}
        ></View>
        <View style={styles.netBankingCard}>
          <View style={{ flex: 0.65, flexDirection: 'row' }}>
            <FlatList
              data={bankOptions.slice(0, 4)}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCashOnDelivery(false);
                    initiateOrder(item.paymentMode, item.bankCode, false);
                  }}
                  style={{ width: 0.225 * windowWidth, flex: 1 }}
                >
                  <View
                    style={{
                      flex: 0.65,
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <Image source={{ uri: item.imageUrl }} style={{ width: 40, height: 40 }} />
                  </View>
                  <View
                    style={{
                      flex: 0.35,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20),
                      }}
                    >
                      {' '}
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.name}
            />
          </View>
          <View style={{ flex: 0.35, flexDirection: 'row' }}>
            <TouchableOpacity
              style={{
                flex: 0.3,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setCashOnDelivery(false);
                initiateOrder('NB', null, false);
              }}
            >
              <Text
                style={{
                  ...theme.viewStyles.text('SB', 14, theme.colors.SEARCH_UNDERLINE_COLOR, 1, 20),
                }}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  const renderCOD = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          isCashOnDelivery ? setCashOnDelivery(false) : setCashOnDelivery(true);
        }}
        style={styles.paymentModeCard}
      >
        <View
          style={{
            flex: 0.16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isCashOnDelivery ? (
            <Image
              source={require('@aph/mobile-patients/src/components/ui/icons/checkboxfilled.png')}
              style={{ width: 20, height: 20 }}
            />
          ) : (
            <Image
              source={require('@aph/mobile-patients/src/components/ui/icons/checkbox.png')}
              style={{ width: 20, height: 20 }}
            />
          )}
        </View>
        <View
          style={{
            flex: 0.84,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.COD_TEXT, 1, 20) }}>
            CASH ON DELIVERY
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPlaceorder = () => {
    return (
      <View
        style={{
          marginTop: 0.05 * windowHeight,
          height: 0.12 * windowHeight,
          backgroundColor: theme.colors.HEX_WHITE,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          style={{
            height: 0.06 * windowHeight,
            width: 0.75 * windowWidth,
            backgroundColor: theme.colors.BUTTON_BG,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          title={'PLACE ORDER'}
          onPress={() => {
            initiateOrder(null, null, true);
          }}
        />
      </View>
    );
  };

  let ScrollViewRef: any;
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {/* {renderOneApolloAndHealthCreditsCard()} */}
        {isChennaiOrder ? (
          !loading ? (
            renderChennaiOrderFormAndPayButton()
          ) : (
            <Spinner />
          )
        ) : !loading ? (
          <ScrollView
            style={{ flex: 0.9 }}
            ref={(ref) => (ScrollViewRef = ref)}
            onContentSizeChange={() => ScrollViewRef.scrollToEnd({ animated: true })}
          >
            {rendertotalAmount()}
            {renderPaymentOptions()}
            {bankOptions.length > 0 && renderNetBanking()}
            {renderCOD()}
            {isCashOnDelivery && renderPlaceorder()}
          </ScrollView>
        ) : (
          <Spinner />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  paymentModeCard: {
    flex: 1,
    flexDirection: 'row',
    width: 0.9 * windowWidth,
    height: 0.08 * windowHeight,
    borderRadius: 9,
    backgroundColor: theme.colors.WHITE,
    margin: 0.05 * windowWidth,
    marginTop: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  netBankingCard: {
    flex: 1,
    width: 0.9 * windowWidth,
    height: 0.22 * windowHeight,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    margin: 0.05 * windowWidth,
    marginTop: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  separator: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    height: 1,
    opacity: 0.1,
    marginBottom: 15,
    marginTop: 8,
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  popupButtonStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupButtonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.APP_YELLOW,
    lineHeight: 24,
  },
  textStyle1: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    textAlign: 'justify',
    paddingTop: 27,
  },
  textStyle2: {
    ...theme.viewStyles.text('M', 13, '#02475b'),
    textAlign: 'justify',
  },
  textStyle3: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    marginBottom: 5,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  checkboxViewStyle: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    flex: 1,
    marginLeft: 6,
    marginRight: 16,
  },
  separatorStyle: {
    marginTop: 19,
    marginBottom: 20,
    backgroundColor: '#02475b',
    opacity: 0.1,
  },
});
