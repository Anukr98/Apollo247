import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  AppState,
  AppStateStatus,
  Text,
  Platform,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { SelectedAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/SelectedAddress';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TatCardwithoutAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/TatCardwithoutAddress';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { ProceedBar } from '@aph/mobile-patients/src/components/MedicineCart/Components/ProceedBar';
import {
  g,
  formatAddress,
  getShipmentPrice,
  validateCoupon,
  getPackageIds,
  getCheckoutCompletedEventAttributes,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  availabilityApi247,
  GetTatResponse247,
  TatApiInput247,
  getDeliveryTAT247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  postwebEngageProceedToPayEvent,
  uploadPrescriptionClickedEvent,
  postTatResponseFailureEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  UPLOAD_DOCUMENT,
  SAVE_MEDICINE_ORDER_OMS_V2,
  CREATE_INTERNAL_ORDER,
  SAVE_ORDER_WITH_SUBSCRIPTION,
} from '@aph/mobile-patients/src/graphql/profiles';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { postPhamracyCartAddressSelectedSuccess } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import moment from 'moment';
import { AmountCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/AmountCard';
import { Shipments } from '@aph/mobile-patients/src/components/MedicineCart/Components/Shipments';
import {
  MedicineOrderShipmentInput,
  PrescriptionType,
  OrderVerticals,
  OrderCreate,
  one_apollo_store_code,
  PaymentStatus,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { initiateSDK } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { isSDKInitialised } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useGetOrderInfo } from '@aph/mobile-patients/src/components/MedicineCart/Hooks/useGetOrderInfo';
import {
  saveMedicineOrderV2,
  saveMedicineOrderV2Variables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderV2';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';

export interface CartSummaryProps extends NavigationScreenProps {}

export const CartSummary: React.FC<CartSummaryProps> = (props) => {
  const {
    cartItems,
    addresses,
    deliveryAddressId,
    uploadPrescriptionRequired,
    prescriptionType,
    physicalPrescriptions,
    setCartItems,
    setPhysicalPrescriptions,
    deliveryTime,
    setdeliveryTime,
    pharmacyCircleAttributes,
    orders,
    circleSubscriptionId,
    isCircleSubscription,
    setOrders,
    coupon,
    setCoupon,
    cartTotal,
    hdfcSubscriptionId,
    productDiscount,
    pinCode,
    setCouponProducts,
    grandTotal,
    circleMembershipCharges,
    circlePlanSelected,
  } = useShoppingCart();
  const {
    pharmacyUserTypeAttribute,
    pharmacyLocation,
    locationDetails,
    setauthToken,
    activeUserSubscriptions,
  } = useAppCommonData();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>(false);
  const [lastCartItems, setlastCartItems] = useState(
    cartItems.map(({ id, quantity }) => id + quantity).toString() + deliveryAddressId
  );
  const [appState, setappState] = useState<string>('');
  const shoppingCart = useShoppingCart();
  const pharmacyPincode =
    selectedAddress?.zipcode || pharmacyLocation?.pincode || locationDetails?.pincode || pinCode;
  const { OrderInfo, SubscriptionInfo } = useGetOrderInfo();

  useEffect(() => {
    hasUnserviceableproduct();
    initiateHyperSDK();
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    onFinishUpload();
  }, [isPhysicalUploadComplete]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setappState(nextAppState);
  };

  useEffect(() => {
    if (appState == 'active') {
      availabilityTat(deliveryAddressId);
    }
  }, [appState]);

  useEffect(() => {
    availabilityTat(deliveryAddressId);
  }, [cartItems, deliveryAddressId]);

  const initiateHyperSDK = async () => {
    try {
      const isInitiated: boolean = await isSDKInitialised();
      const merchantId = AppConfig.Configuration.pharmaMerchantId;
      !isInitiated && initiateSDK(currentPatient?.id, currentPatient?.id, merchantId);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const saveOrder = () =>
    client.mutate<saveMedicineOrderV2, saveMedicineOrderV2Variables>({
      mutation: SAVE_MEDICINE_ORDER_OMS_V2,
      variables: OrderInfo,
    });

  const saveOrderWithSubscription = () => {
    const orderSubscriptionInput = {
      ...OrderInfo,
      ...SubscriptionInfo,
    };
    return client.mutate({
      mutation: SAVE_ORDER_WITH_SUBSCRIPTION,
      variables: orderSubscriptionInput,
      fetchPolicy: 'no-cache',
    });
  };

  const createOrderInternal = (shipments: any, subscriptionId?: string) => {
    const pharmaOrders = shipments.map((item: any) => {
      return {
        order_id: JSON.stringify(item?.orderAutoId),
        amount: item?.estimatedAmount,
        patient_id: currentPatient?.id,
      };
    });
    const orders: OrderVerticals = { pharma: pharmaOrders };
    if (subscriptionId) {
      orders['subscription'] = [
        {
          order_id: subscriptionId,
          amount: Number(circlePlanSelected?.currentSellingPrice),
          patient_id: currentPatient?.id,
        },
      ];
    }
    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: grandTotal,
      customer_id: currentPatient?.primaryPatientId || currentPatient?.id,
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  function hasUnserviceableproduct() {
    const unserviceableItems = cartItems.filter((item) => item.unserviceable) || [];
    unserviceableItems?.length && props.navigation.goBack();
  }

  async function availabilityTat(id: string) {
    const newCartItems =
      cartItems.map(({ id, quantity }) => id + quantity).toString() + deliveryAddressId;
    if (newCartItems == lastCartItems) {
      return;
    }
    if (id && cartItems.length > 0) {
      setloading(true);
      setlastCartItems(newCartItems);
      const skus = cartItems.map((item) => item.id);
      const selectedAddress: any = addresses.find((item) => item.id == id);
      try {
        const response = await availabilityApi247(selectedAddress.zipcode || '', skus.join(','));
        const items = g(response, 'data', 'response') || [];
        const unserviceableSkus = items.filter(({ exist }) => exist == false).map(({ sku }) => sku);
        const updatedCartItems = cartItems.map((item) => ({
          ...item,
          unserviceable: unserviceableSkus.indexOf(item.id) != -1,
        }));
        setCartItems!(updatedCartItems);
        const serviceableItems = updatedCartItems
          .filter((item) => !item.unserviceable)
          .map((item) => {
            return { sku: item.id, qty: item.quantity };
          });

        const tatInput: TatApiInput247 = {
          pincode: selectedAddress.zipcode || '',
          lat: selectedAddress?.latitude!,
          lng: selectedAddress?.longitude!,
          items: serviceableItems,
          userType: isCircleSubscription || !!circleSubscriptionId ? 'circle' : 'regular',
        };
        try {
          const res = await getDeliveryTAT247(tatInput);
          const response = res?.data?.response;
          setOrders?.(response);
          let inventoryData: any = [];
          response?.forEach((order: any) => {
            inventoryData = inventoryData.concat(order?.items);
          });
          setloading!(false);
          addressSelectedEvent(selectedAddress, response[0]?.tat, response);
          updatePricesAfterTat(inventoryData, updatedCartItems);
          if (unserviceableSkus.length) {
            props.navigation.goBack();
          }
        } catch (error) {
          handleTatApiFailure(selectedAddress, error);
        }
      } catch (error) {}
    }
  }

  const genericServiceableDate = moment()
    .add(2, 'days')
    .set('hours', 20)
    .set('minutes', 0)
    .format(AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT);

  function handleTatApiFailure(
    selectedAddress: savePatientAddress_savePatientAddress_patientAddress,
    error: any
  ) {
    addressSelectedEvent(selectedAddress, genericServiceableDate);
    setdeliveryTime?.(genericServiceableDate);
    postTatResponseFailureEvent(cartItems, selectedAddress.zipcode || '', error);
    setloading(false);
  }

  function addressSelectedEvent(
    address: savePatientAddress_savePatientAddress_patientAddress,
    tatDate: string,
    orderInfo?: MedicineOrderShipmentInput[]
  ) {
    const orderSelected = !!orderInfo ? orderInfo : orders;
    let splitOrderDetails: any = {};
    if (orderSelected?.length > 1) {
      orderSelected?.forEach((order: any, index: number) => {
        const momentTatDate = moment(order?.tat);
        splitOrderDetails['Shipment_' + (index + 1) + '_TAT'] = Math.ceil(
          momentTatDate.diff(currentDate, 'h') / 24
        );
        splitOrderDetails['Shipment_' + (index + 1) + '_Value'] =
          getShipmentPrice(order?.items, cartItems) +
          (order?.deliveryCharge || 0) +
          (order?.packingCharges || 0);
        splitOrderDetails['Shipment_' + (index + 1) + '_Items'] = order?.items?.length;
        splitOrderDetails['Shipment_' + (index + 1) + '_Site_Type'] = order?.storeType;
      });
    }
    const currentDate = moment()
      .hour(0)
      .minute(0)
      .second(0);
    const momentTatDate = moment(tatDate)
      .hour(0)
      .minute(0)
      .second(0);
    postPhamracyCartAddressSelectedSuccess(
      address?.zipcode!,
      formatAddress(address),
      'Yes',
      new Date(tatDate),
      Math.ceil(momentTatDate.diff(currentDate, 'h') / 24),
      pharmacyCircleAttributes!,
      moment(tatDate).diff(moment(), 'h'),
      pharmacyUserTypeAttribute!,
      JSON.stringify(cartItems),
      orderSelected?.length > 1,
      splitOrderDetails
    );
  }

  function updatePricesAfterTat(
    inventoryData: GetTatResponse247['response']['items'],
    updatedCartItems: ShoppingCartItem[]
  ) {
    let Items: ShoppingCartItem[] = [];
    updatedCartItems.forEach((item) => {
      let object = item;
      let cartItem = inventoryData.filter((cartItem) => cartItem.sku == item.id);
      if (cartItem.length) {
        if (object.price != Number(object.mou) * cartItem[0].mrp && cartItem[0].mrp != 0) {
          object.specialPrice &&
            (object.specialPrice =
              Number(object.mou) * cartItem[0].mrp * (object.specialPrice / object.price));
          object.price = Number(object.mou) * cartItem[0].mrp;
        }
      }
      Items.push(object);
    });
    setCartItems!(Items);
  }
  const onFinishUpload = () => {
    if (isPhysicalUploadComplete) {
      setloading!(false);
      setisPhysicalUploadComplete(false);
      onPressProceedtoPay();
    }
  };

  const multiplePhysicalPrescriptionUpload = (prescriptions = physicalPrescriptions) => {
    return Promise.all(
      prescriptions.map((item) =>
        client.mutate<uploadDocument>({
          mutation: UPLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            UploadDocumentInput: {
              base64FileInput: item.base64,
              category: 'HealthChecks',
              fileType: item.fileType == 'jpg' ? 'JPEG' : item.fileType.toUpperCase(),
              patientId: currentPatient && currentPatient!.id,
            },
          },
        })
      )
    );
  };

  async function uploadPhysicalPrescriptons() {
    const prescriptions = physicalPrescriptions;
    const unUploadedPres = prescriptions.filter((item) => !item.uploadedUrl);
    if (unUploadedPres.length > 0) {
      try {
        setloading!(true);
        const data = await multiplePhysicalPrescriptionUpload(unUploadedPres);
        const uploadUrls = data.map((item) =>
          item.data!.uploadDocument.status
            ? {
                fileId: item.data!.uploadDocument.fileId!,
                url: item.data!.uploadDocument.filePath!,
              }
            : null
        );
        const newuploadedPrescriptions = unUploadedPres.map(
          (item, index) =>
            ({
              ...item,
              uploadedUrl: uploadUrls![index]!.url,
              prismPrescriptionFileId: uploadUrls![index]!.fileId,
            } as PhysicalPrescription)
        );
        setPhysicalPrescriptions && setPhysicalPrescriptions([...newuploadedPrescriptions]);
        setisPhysicalUploadComplete(true);
      } catch (error) {
        CommonBugFender('CartSummary_physicalPrescriptionUpload', error);
        setloading!(false);
        renderAlert('Error occurred while uploading prescriptions.');
      }
    } else {
      onPressProceedtoPay();
    }
  }

  const removeCouponWithAlert = (message: string) => {
    setCoupon!(null);
    renderAlert(message);
  };

  async function onPressProceedtoPay() {
    setloading(true);
    if (coupon && cartTotal > 0) {
      try {
        const response = await validateCoupon(
          coupon.coupon,
          coupon.message,
          pharmacyPincode,
          g(currentPatient, 'mobileNumber'),
          setCoupon,
          cartTotal,
          productDiscount,
          cartItems,
          setCouponProducts,
          activeUserSubscriptions ? getPackageIds(activeUserSubscriptions) : []
        );
        if (response !== 'success') {
          removeCouponWithAlert(response);
        }
      } catch (error) {
        return;
      }
    }
    await availabilityTat(deliveryAddressId);
    let splitOrderDetails: any = {};
    if (orders?.length > 1) {
      orders?.forEach((order: any, index: number) => {
        splitOrderDetails['Shipment_' + (index + 1) + '_Value'] =
          getShipmentPrice(order?.items, cartItems) +
          (order?.deliveryCharge || 0) +
          (order?.packingCharges || 0);
        splitOrderDetails['Shipment_' + (index + 1) + '_Items'] = order?.items?.length;
      });
    }
    postwebEngageProceedToPayEvent(
      shoppingCart,
      false,
      deliveryTime,
      pharmacyCircleAttributes!,
      pharmacyUserTypeAttribute!,
      JSON.stringify(cartItems),
      orders?.length > 1,
      splitOrderDetails
    );
    initiateOrder();
  }

  const initiateOrder = async () => {
    try {
      const response =
        !circleSubscriptionId && circlePlanSelected
          ? await saveOrderWithSubscription()
          : await saveOrder();
      const { orders, transactionId, errorCode } = response?.data?.saveMedicineOrderV2 || {};
      const subscriptionId = response?.data?.CreateUserSubscription?.response?._id;
      const data = await createOrderInternal(orders, subscriptionId);
      if (data?.data?.createOrderInternal?.success) {
        setauthToken?.('');
        const paymentId = data?.data?.createOrderInternal?.payment_order_id!;
        props.navigation.navigate(AppRoutes.PaymentMethods, {
          paymentId: paymentId,
          amount: grandTotal,
          orderDetails: getOrderDetails(orders),
          businessLine: 'pharma',
          checkoutEventAttributes: getCheckoutCompletedEventAttributes(
            shoppingCart,
            paymentId,
            pharmacyUserTypeAttribute
          ),
        });
      }
      setloading(false);
    } catch (error) {
      setloading(false);
      renderAlert('Something went wrong. Please try again after some time');
    }
  };

  const getOrderDetails = (orders: any) => {
    const orderDetails = {
      orders: orders,
      orderInfo: OrderInfo,
      deliveryTime: deliveryTime,
      isStorePickup: false,
    };
    return orderDetails;
  };
  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'REVIEW ORDER'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.MedicineCart, 'Go back to add items');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAddress = () => {
    return <SelectedAddress orderType={'Delivery'} showChangeAddress={false} />;
  };

  const renderAmountSection = () => {
    return (
      <View>
        <View style={styles.amountHeader}>
          <Text style={styles.amountHeaderText}>ORDER SUMMARY</Text>
        </View>
        <AmountCard />
      </View>
    );
  };
  const renderTatCard = () => {
    return orders?.length > 1 ? null : (
      <TatCardwithoutAddress style={{ marginTop: 10 }} deliveryDate={orders?.[0]?.tat} />
    );
  };

  const renderCartItems = () => {
    return <Shipments setloading={setloading} />;
  };

  const renderPrescriptions = () => {
    return (
      <Prescriptions
        onPressUploadMore={() => {
          shoppingCart.setPrescriptionType(null);
          props.navigation.navigate(AppRoutes.MedicineCartPrescription);
        }}
        showSelectedOption
        myPresProps={{ showTick: true }}
        ePresProps={{ showTick: true }}
      />
    );
  };

  const renderButton = () => {
    return uploadPrescriptionRequired && !prescriptionType ? (
      <View style={styles.buttonContainer}>
        <Button
          disabled={false}
          title={'UPLOAD PRESCRIPTION'}
          onPress={() => {
            uploadPrescriptionClickedEvent(currentPatient?.id);
            props.navigation.navigate(AppRoutes.MedicineCartPrescription);
          }}
          titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
          style={{ borderRadius: 10 }}
        />
      </View>
    ) : (
      <ProceedBar
        screen={'summary'}
        onPressProceedtoPay={() => {
          physicalPrescriptions?.length > 0 ? uploadPhysicalPrescriptons() : onPressProceedtoPay();
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {renderAddress()}
          {renderAmountSection()}
          {uploadPrescriptionRequired &&
            prescriptionType !== PrescriptionType.UPLOADED &&
            renderPrescriptions()}
          {renderTatCard()}
          {renderCartItems()}
          {uploadPrescriptionRequired &&
            prescriptionType === PrescriptionType.UPLOADED &&
            renderPrescriptions()}
        </ScrollView>
        {renderButton()}
        {loading && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  prescriptionMsgCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: '#F7F8F5',
  },
  prescriptionMsg: {
    marginLeft: 13,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#02475B',
    marginVertical: 6,
  },
  buttonContainer: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  subContainer: {
    flexDirection: 'row',
    paddingHorizontal: 13,
    marginVertical: 9,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  amountHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
});
