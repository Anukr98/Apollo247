import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  AppState,
  AppStateStatus,
  BackHandler,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CartItemsList } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemsList';
import {
  useShoppingCart,
  ShoppingCartItem,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { FreeDelivery } from '@aph/mobile-patients/src/components/MedicineCart/Components/FreeDelivery';
import { AmountCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/AmountCard';
import { Coupon } from '@aph/mobile-patients/src/components/MedicineCart/Components/Coupon';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Savings } from '@aph/mobile-patients/src/components/MedicineCart/Components/Savings';
import { KerbSidePickup } from '@aph/mobile-patients/src/components/MedicineCart/Components/KerbSidePickup';
import { ProceedBar } from '@aph/mobile-patients/src/components/MedicineCart/Components/ProceedBar';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import {
  GET_PATIENT_ADDRESS_LIST,
  UPLOAD_DOCUMENT,
  SET_DEFAULT_ADDRESS,
  GET_ONEAPOLLO_USER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  g,
  formatAddress,
  formatAddressToLocation,
  getShipmentPrice,
  validateCoupon,
  setAsyncPharmaLocation,
  getHealthCredits,
  persistHealthCredits,
  getPackageIds,
  getIsMedicine,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  pinCodeServiceabilityApi247,
  availabilityApi247,
  GetTatResponse247,
  getMedicineDetailsApi,
  TatApiInput247,
  getDeliveryTAT247,
  userSpecificCoupon,
  searchPickupStoresApi,
  getProductsByCategoryApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { UnServiceable } from '@aph/mobile-patients/src/components/MedicineCart/Components/UnServiceable';
import { SuggestProducts } from '@aph/mobile-patients/src/components/MedicineCart/Components/SuggestProducts';
import { EmptyCart } from '@aph/mobile-patients/src/components/MedicineCart/Components/EmptyCart';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  postwebEngageProceedToPayEvent,
  PharmacyCartViewedEvent,
  PricemismatchEvent,
  postTatResponseFailureEvent,
  applyCouponClickedEvent,
  selectDeliveryAddressClickedEvent,
  uploadPrescriptionClickedEvent,
  fireCircleBuyNowEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  postPhamracyCartAddressSelectedFailure,
  postPhamracyCartAddressSelectedSuccess,
  postPharmacyAddNewAddressClick,
  postPharmacyAddNewAddressCompleted,
} from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import moment from 'moment';
import {
  makeAdressAsDefaultVariables,
  makeAdressAsDefault,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { CheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { CircleCartItem } from '@aph/mobile-patients/src/components/MedicineCart/Components/CircleCartItem';
import { OneApolloCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/OneApolloCard';
import AsyncStorage from '@react-native-community/async-storage';
import { MedicineOrderShipmentInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface MedicineCartProps extends NavigationScreenProps {}

export const MedicineCart: React.FC<MedicineCartProps> = (props) => {
  const {
    setCoupon,
    cartTotal,
    couponProducts,
    cartItems,
    coupon,
    setAddresses,
    setCartItems,
    setCouponProducts,
    addresses,
    deliveryAddressId,
    setDeliveryAddressId,
    addMultipleCartItems,
    physicalPrescriptions,
    setPhysicalPrescriptions,
    pinCode,
    setCircleMembershipCharges,
    isCircleSubscription,
    circlePlanSelected,
    circleSubPlanId,
    setCircleSubPlanId,
    setIsCircleSubscription,
    deliveryTime,
    setdeliveryTime,
    cartTotalCashback,
    circleMembershipCharges,
    setIsFreeDelivery,
    setCirclePlanSelected,
    setDefaultCirclePlan,
    circleSubscriptionId,
    setCircleSubscriptionId,
    hdfcSubscriptionId,
    pharmacyCircleAttributes,
    newAddressAdded,
    setNewAddressAdded,
    orders,
    setOrders,
    productDiscount,
    cartPriceNotUpdateRange,
    uploadPrescriptionRequired,
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const {
    locationDetails,
    pharmacyLocation,
    setPharmacyLocation,
    axdcCode,
    setAxdcCode,
    pharmacyUserTypeAttribute,
    activeUserSubscriptions,
  } = useAppCommonData();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [lastCartItems, setlastCartItems] = useState('');
  const [storeType, setStoreType] = useState<string | undefined>('');
  const [storeDistance, setStoreDistance] = useState(0);
  const [shopId, setShopId] = useState<string | undefined>('');
  const [isfocused, setisfocused] = useState<boolean>(false);
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>(false);
  const [showStorePickupCard, setshowStorePickupCard] = useState<boolean>(false);
  const [suggestedProducts, setsuggestedProducts] = useState<MedicineProduct[]>([]);
  const [appState, setappState] = useState<string>('');
  const [availableHC, setAvailableHC] = useState<number>(0);
  const shoppingCart = useShoppingCart();
  const pharmacyPincode =
    selectedAddress?.zipcode || pharmacyLocation?.pincode || locationDetails?.pincode || pinCode;
  const [showCareSelectPlans, setShowCareSelectPlans] = useState<boolean>(true);
  const [tatResponse, setTatResponse] = useState<string>('');

  useEffect(() => {
    async function fetchCircleSubscriptionId() {
      const circleSubscriptionID: any = await AsyncStorage.getItem('circleSubscriptionId');
      setCircleSubscriptionId && setCircleSubscriptionId(circleSubscriptionID);
    }
    fetchCircleSubscriptionId();
  }, []);

  useEffect(() => {
    fetchAddress();
    availabilityTat(false);
    fetchUserSpecificCoupon();
    fetchPickupStores(pharmacyPincode);
    fetchProductSuggestions();
    fetchHealthCredits();
    cartItems.length &&
      PharmacyCartViewedEvent(
        shoppingCart,
        g(currentPatient, 'id'),
        pharmacyCircleAttributes!,
        pharmacyUserTypeAttribute!
      );
    setIsCircleSubscription?.(false);
    if (!circleSubPlanId) {
      setCircleMembershipCharges && setCircleMembershipCharges(0);
    }
    if (!circleSubscriptionId) {
      setShowCareSelectPlans(true);
    }
  }, []);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setisfocused(true);
      BackHandler.addEventListener('hardwareBackPress', handleBack);
      AppState.addEventListener('change', handleAppStateChange);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setisfocused(false);
      AppState.removeEventListener('change', handleAppStateChange);
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  useEffect(() => {
    if (!deliveryAddressId && cartItems.length > 0) {
      setCartItems!(cartItems.map((item) => ({ ...item, unserviceable: false })));
    } else if (deliveryAddressId && cartItems.length > 0) {
      availabilityTat(false, true);
    }
  }, [deliveryAddressId]);

  useEffect(() => {
    // call servicability api if new address is added from cart
    const addressLength = addresses.length;
    if (!!addressLength && !!newAddressAdded && !!tatResponse) {
      const newAddress = addresses.filter((value) => value.id === newAddressAdded);
      checkServicability(newAddress[0]);
      postPharmacyAddNewAddressCompleted(
        'Cart',
        g(selectedAddress, 'zipcode')!,
        formatAddress(selectedAddress),
        moment(tatResponse, AppConfig.Configuration.MED_DELIVERY_DATE_DISPLAY_FORMAT).toDate(),
        moment(tatResponse).diff(new Date(), 'd'),
        'Yes'
      );
      setNewAddressAdded && setNewAddressAdded('');
    }
  }, [newAddressAdded, selectedAddress, tatResponse]);

  useEffect(() => {
    availabilityTat(false);
    // remove circle subscription applied(for non member) if cart items are empty
    if (cartItems.length < 1 && !circleSubscriptionId) {
      setIsCircleSubscription && setIsCircleSubscription(false);
      setCircleMembershipCharges && setCircleMembershipCharges(0);
      setCirclePlanSelected && setCirclePlanSelected(null);
      AsyncStorage.removeItem('circlePlanSelected');
    }
  }, [cartItems]);

  useEffect(() => {
    // when app is repoened and if circle is added to cart, then set circle subscription data
    if (!!circleMembershipCharges) {
      setIsCircleSubscription && setIsCircleSubscription(true);
      if (circlePlanSelected?.subPlanId) {
        setCircleSubPlanId && setCircleSubPlanId(circlePlanSelected?.subPlanId);
      }
    }
  }, [circleMembershipCharges]);

  useEffect(() => {
    if (couponProducts && couponProducts.length) {
      getMedicineDetailsOfCouponProducts();
    }
  }, [couponProducts]);

  useEffect(() => {
    if (!!coupon) {
      setCircleMembershipCharges && setCircleMembershipCharges(0);
      setIsCircleSubscription?.(false);
    } else {
      if (!circleSubscriptionId) {
        setCircleMembershipCharges &&
          setCircleMembershipCharges(circlePlanSelected?.currentSellingPrice);
      } else {
        setIsCircleSubscription && setIsCircleSubscription(true);
      }
    }
  }, [coupon]);

  useEffect(() => {
    (!!circleMembershipCharges && isCircleSubscription) || coupon?.freeDelivery
      ? setIsFreeDelivery?.(true)
      : setIsFreeDelivery?.(false);
  }, [circleMembershipCharges, isCircleSubscription, coupon]);

  useEffect(() => {
    onFinishUpload();
  }, [isPhysicalUploadComplete]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setappState(nextAppState);
  };

  useEffect(() => {
    if (appState == 'active') {
      availabilityTat(true);
    }
  }, [appState]);

  const handleBack = () => {
    setCoupon!(null);
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
  };

  async function fetchAddress() {
    try {
      if (addresses.length) {
        return;
      }
      const userId = g(currentPatient, 'id');
      const response = await client.query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: userId },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      const addressList =
        (data.getPatientAddressList
          .addressList as savePatientAddress_savePatientAddress_patientAddress[]) || [];
      setAddresses!(addressList);
      const deliveryAddress = addressList.find(({ defaultAddress }) => defaultAddress === true);
      if (deliveryAddress && !deliveryAddressId) {
        setDeliveryAddressId && setDeliveryAddressId(deliveryAddress?.id);
      }
      setPharmacyLocation!(formatAddressToLocation(deliveryAddress! || null));
    } catch (error) {
      renderAlert(`Something went wrong, unable to fetch addresses.`);
    }
  }

  const fetchUserSpecificCoupon = () => {
    userSpecificCoupon(g(currentPatient, 'mobileNumber'), 'Pharmacy')
      .then(async (resp: any) => {
        if (resp.data.errorCode == 0) {
          let couponList = resp.data.response;
          if (typeof couponList != null && couponList.length) {
            const coupon = couponList[0].coupon;
            const msg = couponList[0].message;
            try {
              setCoupon!(null);
              await validateCoupon(
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
            } catch (error) {
              return;
            }
          }
        }
      })
      .catch((error) => {
        CommonBugFender('fetchingUserSpecificCoupon', error);
      });
  };

  const fetchHealthCredits = async () => {
    var cachedHealthCredit: any = await getHealthCredits();

    if (cachedHealthCredit != null) {
      setAvailableHC(cachedHealthCredit.healthCredit);
      return; // no need to call api
    }

    try {
      const response = await client.query({
        query: GET_ONEAPOLLO_USER,
        variables: { patientId: currentPatient?.id },
        fetchPolicy: 'no-cache',
      });

      if (response?.data?.getOneApolloUser) {
        setAvailableHC(response?.data?.getOneApolloUser.availableHC);
        persistHealthCredits(response?.data?.getOneApolloUser.availableHC);
      }
    } catch (error) {
      CommonBugFender('fetchingHealthCreditsonCart', error);
    }
  };

  async function checkServicability(address: savePatientAddress_savePatientAddress_patientAddress) {
    if (deliveryAddressId && deliveryAddressId == address.id && !newAddressAdded) {
      return;
    }
    try {
      setloading(true);
      const response = await pinCodeServiceabilityApi247(address.zipcode!);
      const { data } = response;
      setAxdcCode && setAxdcCode(data?.response?.axdcCode);
      if (data?.response?.servicable) {
        setDeliveryAddressId && setDeliveryAddressId(address.id);
        setDefaultAddress(address);
        fetchPickupStores(address?.zipcode || '');
        setloading(false);
      } else {
        setDeliveryAddressId && setDeliveryAddressId('');
        setloading(false);
        postPhamracyCartAddressSelectedFailure(address.zipcode!, formatAddress(address), 'No');
        renderAlert(string.medicine_cart.pharmaAddressUnServiceableAlert);
      }
    } catch (error) {
      setloading(false);
    }
  }

  async function availabilityTat(forceCheck: boolean, addressChange?: boolean) {
    const newCartItems =
      cartItems.map(({ id, quantity }) => id + quantity).toString() + deliveryAddressId;
    if (newCartItems == lastCartItems && !forceCheck) {
      return;
    }
    if (deliveryAddressId && cartItems.length > 0) {
      setloading(true);
      setlastCartItems(newCartItems);
      const skus = cartItems.map((item) => item.id);
      const selectedAddress: any = addresses.find((item) => item.id == deliveryAddressId);
      try {
        const response = await availabilityApi247(selectedAddress.zipcode || '', skus.join(','));
        const items = g(response, 'data', 'response') || [];
        const unserviceableSkus = items.filter(({ exist }) => exist == false).map(({ sku }) => sku);
        const updatedCartItems = cartItems.map((item) => ({
          ...item,
          unserviceable: unserviceableSkus.indexOf(item.id) != -1,
        }));
        setCartItems!(updatedCartItems);
        if (unserviceableSkus.length) {
          showUnServiceableItemsAlert(updatedCartItems);
        }
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
          setTatResponse(response[0]?.tat);
          addressSelectedEvent(selectedAddress, response[0]?.tat, response);
          updatePricesAfterTat(inventoryData, updatedCartItems);
        } catch (error) {
          setloading!(false);
          handleTatApiFailure(selectedAddress, error);
        }
      } catch (error) {
        setloading!(false);
      }
    } else if (!deliveryAddressId) {
      setlastCartItems(newCartItems);
      validatePharmaCoupon();
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
    // remove applied circle subscription if tat api returns error
    if (!circleSubscriptionId && !physicalPrescriptions.length && error?.message === 'undefined') {
      setIsCircleSubscription && setIsCircleSubscription(false);
      setCircleMembershipCharges && setCircleMembershipCharges(0);
      setCirclePlanSelected && setCirclePlanSelected(null);
      AsyncStorage.removeItem('circlePlanSelected');
    }
    if (newAddressAdded) {
      postPharmacyAddNewAddressCompleted(
        'Cart',
        g(selectedAddress, 'zipcode')!,
        formatAddress(selectedAddress),
        moment(
          genericServiceableDate,
          AppConfig.Configuration.MED_DELIVERY_DATE_DISPLAY_FORMAT
        ).toDate(),
        moment(genericServiceableDate).diff(new Date(), 'd'),
        'Yes'
      );
      setNewAddressAdded && setNewAddressAdded('');
    }
    addressSelectedEvent(selectedAddress, genericServiceableDate);
    setdeliveryTime?.(genericServiceableDate);
    postTatResponseFailureEvent(cartItems, selectedAddress.zipcode || '', error);
    setloading(false);
    validatePharmaCoupon();
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

  async function setDefaultAddress(address: savePatientAddress_savePatientAddress_patientAddress) {
    try {
      const response = await client.query<makeAdressAsDefault, makeAdressAsDefaultVariables>({
        query: SET_DEFAULT_ADDRESS,
        variables: { patientAddressId: address?.id },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      const patientAddress = data?.makeAdressAsDefault?.patientAddress;
      const updatedAddresses = addresses.map((item) => ({
        ...item,
        defaultAddress: patientAddress?.id == item.id ? patientAddress?.defaultAddress : false,
      }));
      setAddresses!(updatedAddresses);
      patientAddress?.defaultAddress && setDeliveryAddressId!(patientAddress?.id);
      const deliveryAddress = updatedAddresses.find(({ id }) => patientAddress?.id == id);
      setPharmacyLocation!(formatAddressToLocation(deliveryAddress! || null));
    } catch (error) {
      CommonBugFender('set_default_Address_on_Cart_Page', error);
    }
  }

  async function updatePricesAfterTat(
    inventoryData: GetTatResponse247['response']['items'],
    updatedCartItems: ShoppingCartItem[]
  ) {
    const updatePrices = AppConfig.Configuration.CART_UPDATE_PRICE_CONFIG.updatePrices;
    const updatePricePercent = AppConfig.Configuration.CART_UPDATE_PRICE_CONFIG.percentage;
    const updatePricesNotAllowed = updatePrices === 'No';
    if (updatePricesNotAllowed) {
      return;
    }

    const cartItemsAfterPriceUpdate: ShoppingCartItem[] = [];
    updatedCartItems.forEach((item) => {
      const cartItem = { ...item };
      const storeItem = inventoryData?.find((cartItem) => cartItem?.sku == item?.id);
      if (storeItem) {
        const storePrice = Number(cartItem?.mou) * storeItem?.mrp;
        const allowPriceUpdate =
          cartItem?.price !== storePrice
            ? updatePrices === 'ByPercentage'
              ? isPricesWithInSpecifiedRange(
                  cartItem?.price,
                  storePrice,
                  updatePricePercent,
                  cartPriceNotUpdateRange
                )
              : true
            : false;
        if (storeItem?.mrp != 0 && allowPriceUpdate) {
          showAphAlert!({
            title: `Hi ${currentPatient?.firstName || ''},`,
            description: `Important message for items in your Cart:\n\nSome items' prices have been updated based on the updated MRP from Manufacturer. Please check before you place the order.`,
          });
          if (cartItem?.specialPrice) {
            cartItem['specialPrice'] =
              Number(cartItem?.mou) * storeItem?.mrp * (cartItem?.specialPrice / cartItem?.price);
          }
          cartItem['price'] = Number(cartItem?.mou) * storeItem?.mrp;
          PricemismatchEvent(cartItem, currentPatient?.mobileNumber, storePrice);
        }
      }
      cartItemsAfterPriceUpdate.push(cartItem);
    });
    setCartItems!(cartItemsAfterPriceUpdate);
    await validatePharmaCoupon();
  }
  function hasUnserviceableproduct() {
    return !!cartItems.find(
      ({ unavailableOnline, unserviceable }) => unavailableOnline || unserviceable
    );
  }

  async function validatePharmaCoupon() {
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
  }

  const showUnServiceableItemsAlert = (cartItems: ShoppingCartItem[]) => {
    showAphAlert!({
      title: string.medicine_cart.tatUnServiceableAlertTitle,
      description: string.medicine_cart.tatUnServiceableAlertDesc,
      titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
      CTAs: [
        {
          text: string.medicine_cart.tatUnServiceableAlertChangeCTA,
          type: 'orange-link',
          onPress: showAddressPopup,
        },
        {
          text: string.medicine_cart.tatUnServiceableAlertRemoveCTA,
          type: 'orange-link',
          onPress: () => removeUnServiceableItems(cartItems),
        },
      ],
    });
  };
  const removeUnServiceableItems = (cartItems: ShoppingCartItem[]) => {
    hideAphAlert!();
    setCartItems!(cartItems.filter((item) => !item.unserviceable));
  };

  const removeCouponWithAlert = (message: string) => {
    setCoupon!(null);
    renderAlert(message);
  };

  async function fetchPickupStores(pincode: string) {
    if (pincode.length == 6) {
      try {
        const response = await searchPickupStoresApi(pincode);
        const { data } = response;
        const { stores_count } = data;
        if (stores_count) {
          setshowStorePickupCard(true);
        } else {
          setshowStorePickupCard(false);
        }
      } catch (error) {}
    }
  }

  const getMedicineDetailsOfCouponProducts = () => {
    setloading!(true);
    Promise.all(couponProducts.map((item) => getMedicineDetailsApi(item!.sku!)))
      .then((result) => {
        setloading!(false);
        const medicinesAll = result.map(({ data: { productdp } }, index) => {
          const medicineDetails = (productdp && productdp[0]) || {};
          if (medicineDetails.id == 0) {
            return null;
          }
          return {
            id: medicineDetails!.sku!,
            mou: medicineDetails.mou,
            name: medicineDetails!.name,
            price: medicineDetails.price,
            specialPrice: Number(couponProducts[index]!.mrp), // special price as coupon product price
            quantity: couponProducts[index]!.quantity,
            prescriptionRequired: medicineDetails.is_prescription_required == '1',
            isMedicine: getIsMedicine(medicineDetails.type_id?.toLowerCase()) || '0',
            thumbnail: medicineDetails.thumbnail || medicineDetails.image,
            isInStock: !!medicineDetails.is_in_stock,
            maxOrderQty: medicineDetails.MaxOrderQty,
            productType: medicineDetails.type_id,
            isFreeCouponProduct: !!couponProducts[index]!.couponFree,
            couponPrice: 0,
            unserviceable: false,
            unavailableOnline: medicineDetails.sell_online == 0,
          } as ShoppingCartItem;
        });
        addMultipleCartItems!(medicinesAll as ShoppingCartItem[]);
      })
      .catch((e) => {
        setloading!(false);
      });
  };

  const onFinishUpload = () => {
    if (isPhysicalUploadComplete) {
      setloading!(false);
      setisPhysicalUploadComplete(false);
      onPressProceedtoPay();
    }
  };

  async function fetchProductSuggestions() {
    const categoryId = AppConfig.Configuration.PRODUCT_SUGGESTIONS_CATEGORYID;
    const pageCount = AppConfig.Configuration.PRODUCT_SUGGESTIONS_COUNT;
    try {
      const response = await getProductsByCategoryApi(
        categoryId,
        pageCount,
        null,
        null,
        axdcCode,
        pinCode
      );
      const products = response?.data?.products.slice(0, 15) || [];
      setsuggestedProducts(products);
    } catch (error) {
      CommonBugFender('MedicineCart_error_whilefetchingSuggestedProducts', error);
    }
  }

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
        CommonBugFender('MedicineCart_physicalPrescriptionUpload', error);
        setloading!(false);
        renderAlert('Error occurred while uploading prescriptions.');
      }
    } else {
      onPressProceedtoPay();
    }
  }

  function showAddressPopup() {
    showAphAlert!({
      title: string.common.selectAddress,
      removeTopIcon: true,
      children: (
        <ChooseAddress
          addresses={addresses}
          deliveryAddressId={deliveryAddressId}
          onPressAddAddress={() => {
            props.navigation.navigate(AppRoutes.AddAddressNew, {
              source: 'Cart' as AddressSource,
              addOnly: true,
            });
            postPharmacyAddNewAddressClick('Cart');
            hideAphAlert!();
          }}
          onPressEditAddress={(address) => {
            props.navigation.push(AppRoutes.AddAddressNew, {
              KeyName: 'Update',
              addressDetails: address,
              ComingFrom: AppRoutes.MedicineCart,
            });
            hideAphAlert!();
          }}
          onPressSelectAddress={(address) => {
            checkServicability(address);
            setAsyncPharmaLocation(address);
            hideAphAlert!();
          }}
        />
      ),
    });
  }

  async function onPressProceedtoPay() {
    if (coupon) {
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
    const isPrescriptionUploaded = physicalPrescriptions?.length > 0;
    props.navigation.navigate(AppRoutes.CheckoutSceneNew, {
      deliveryTime,
      storeDistance: storeDistance,
      tatType: storeType,
      shopId: shopId,
    });
    postwebEngageProceedToPayEvent(
      shoppingCart,
      false,
      deliveryTime,
      pharmacyCircleAttributes!,
      pharmacyUserTypeAttribute!,
      JSON.stringify(cartItems),
      orders?.length > 1,
      splitOrderDetails,
      isPrescriptionUploaded
    );
  }

  const headerRightComponent = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          setCoupon!(null);
          navigateToScreenWithEmptyStack(props.navigation, AppRoutes.Medicine);
        }}
      >
        <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(13), color: theme.colors.APP_YELLOW }}>
          ADD ITEMS
        </Text>
      </TouchableOpacity>
    );
  };
  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'YOUR CART'}
        rightComponent={headerRightComponent()}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.MedicineCart, 'Go back to add items');
          setCoupon!(null);
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  function applyCoupon() {
    if (cartTotal == 0) {
      renderAlert('Please add items in the cart to apply coupon.');
    } else {
      props.navigation.navigate(AppRoutes.ViewCoupons);
      setCoupon!(null);
      applyCouponClickedEvent(g(currentPatient, 'id'), JSON.stringify(cartItems));
    }
  }

  const renderCartItems = () => {
    return (
      <CartItemsList
        screen={'cart'}
        setloading={setloading}
        onPressProduct={(item) => {
          props.navigation.navigate(AppRoutes.ProductDetailPage, {
            urlKey: item?.url_key,
            sku: item.id,
            movedFrom: ProductPageViewedSource.CART,
          });
        }}
      />
    );
  };
  const renderAvailFreeDelivery = () => {
    return <FreeDelivery />;
  };

  const renderCouponSection = () => {
    return (
      <Coupon onPressApplyCoupon={() => applyCoupon()} onPressRemove={() => setCoupon!(null)} />
    );
  };

  const renderAmountSection = () => {
    return (
      <View>
        <View style={styles.amountHeader}>
          <Text style={styles.amountHeaderText}>TOTAL CHARGES</Text>
        </View>
        {(isCircleSubscription || !!circleSubscriptionId) && renderApplyCircleBenefits()}
        {renderCouponSection()}
        <AmountCard />
      </View>
    );
  };

  const renderApplyCircleBenefits = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.applyBenefits}
        onPress={() => {
          if (!coupon && isCircleSubscription) {
            if (!circleSubscriptionId || cartTotalCashback) {
              setIsCircleSubscription?.(false);
              setDefaultCirclePlan?.(null);
              setCirclePlanSelected?.(null);
              setCircleMembershipCharges?.(0);
            }
          } else {
            setCoupon && setCoupon(null);
            setIsCircleSubscription && setIsCircleSubscription(true);
          }
        }}
      >
        {!coupon && isCircleSubscription ? (
          <View style={{ flexDirection: 'row' }}>
            <CheckedIcon style={{ marginTop: 8, marginRight: 4 }} />
            <CareCashbackBanner
              bannerText={`benefits APPLIED!`}
              textStyle={styles.circleText}
              logoStyle={styles.circleLogo}
            />
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.circleApplyContainer} />
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.applyText}>Apply </Text>
                <CareCashbackBanner
                  bannerText={`benefits instead`}
                  textStyle={styles.circleText}
                  logoStyle={styles.circleLogo}
                />
              </View>
            </View>
            <Text style={styles.useCircleText}>
              {`Use your Circle membership instead & get `}
              <Text
                style={{ ...theme.viewStyles.text('SB', 12, '#02475B', 1, 17) }}
              >{`₹${cartTotalCashback} Cashback and Free delivery `}</Text>
              <Text>on this order</Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCareSubscriptionOptions = () => {
    if (showCareSelectPlans) {
      return (
        <CircleMembershipPlans
          navigation={props.navigation}
          isConsultJourney={false}
          onSelectMembershipPlan={(plan) => {
            if (plan && !coupon) {
              // if plan is selected
              fireCircleBuyNowEvent(currentPatient);
              setCircleMembershipCharges && setCircleMembershipCharges(plan?.currentSellingPrice);
              setCircleSubPlanId && setCircleSubPlanId(plan?.subPlanId);
            } else {
              // if plan is removed
              setShowCareSelectPlans(false);
              setCircleMembershipCharges && setCircleMembershipCharges(0);
            }
          }}
          source={'Pharma Cart'}
        />
      );
    } else {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.viewPlanContainer}
          onPress={() => {
            setShowCareSelectPlans(true);
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.viewPlan} />
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.viewText}>View</Text>
                <CareCashbackBanner
                  bannerText={`plans`}
                  textStyle={styles.viewText}
                  logoStyle={styles.circleLogo}
                />
              </View>
              <Text style={styles.viewSubText}>
                Viewing and/or selecting plans will remove any applied coupon. You can apply the
                coupon again later.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderSavings = () => <Savings />;

  const renderSuggestProducts = () => {
    return <SuggestProducts products={suggestedProducts} navigation={props.navigation} />;
  };

  const renderOneApollo = () => <OneApolloCard availableHC={availableHC} />;

  const renderPrescriptions = () => {
    return (
      <Prescriptions
        onPressUploadMore={() => {
          props.navigation.navigate(AppRoutes.MedicineCartPrescription);
        }}
        style={{ marginTop: suggestedProducts?.length ? 0 : 20 }}
      />
    );
  };

  const renderKerbSidePickup = () => {
    return showStorePickupCard ? (
      <KerbSidePickup
        style={{ marginTop: suggestedProducts?.length ? 10 : 20 }}
        onPressProceed={() => {
          props.navigation.navigate(AppRoutes.StorePickup);
        }}
      />
    ) : null;
  };

  async function redirectToUploadPrescription() {
    const redirect = () => {
      uploadPrescriptionClickedEvent(currentPatient?.id);
      props.navigation.navigate(AppRoutes.MedicineCartPrescription);
    };
    if (coupon) {
      try {
        const response = await validateCoupon(
          coupon?.coupon,
          coupon?.message,
          pharmacyPincode,
          g(currentPatient, 'mobileNumber'),
          setCoupon,
          cartTotal,
          productDiscount,
          cartItems,
          setCouponProducts,
          activeUserSubscriptions ? getPackageIds(activeUserSubscriptions) : []
        );
        if (response === 'success') {
          redirect();
        } else {
          removeCouponWithAlert(response);
        }
      } catch (error) {
        removeCouponWithAlert('Sorry, invalid coupon applied. Remove the coupon and try again.');
      }
    } else {
      redirect();
    }
  }

  const renderProceedBar = () => {
    return (
      <ProceedBar
        onPressAddDeliveryAddress={() => {
          props.navigation.navigate(AppRoutes.AddAddressNew, {
            source: 'Cart' as AddressSource,
            addOnly: true,
          });
          postPharmacyAddNewAddressClick('Cart');
        }}
        onPressSelectDeliveryAddress={() => {
          selectDeliveryAddressClickedEvent(currentPatient?.id, JSON.stringify(cartItems));
          showAddressPopup();
        }}
        onPressUploadPrescription={redirectToUploadPrescription}
        onPressProceedtoPay={() => {
          physicalPrescriptions?.length > 0 ? uploadPhysicalPrescriptons() : onPressProceedtoPay();
        }}
        deliveryTime={deliveryTime}
        onPressChangeAddress={showAddressPopup}
        screen={'MedicineCart'}
        onPressReviewOrder={onPressReviewOrder}
        onPressAddMoreMedicines={() => {
          props.navigation.navigate('MEDICINES');
        }}
        onPressTatCard={() => {
          uploadPrescriptionRequired
            ? redirectToUploadPrescription()
            : physicalPrescriptions?.length > 0
            ? uploadPhysicalPrescriptons()
            : onPressReviewOrder();
        }}
      />
    );
  };

  async function onPressReviewOrder() {
    availabilityTat(true);
    if (coupon) {
      await validatePharmaCoupon();
    }
    !hasUnserviceableproduct() && props.navigation.navigate(AppRoutes.CartSummary);
  }

  const renderUnServiceable = () => {
    return <UnServiceable style={{ marginTop: 24 }} />;
  };

  const renderViewCirclePlans = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.applyBenefits, { marginBottom: 10 }]}
        onPress={() => {
          setCoupon && setCoupon(null);
        }}
      >
        <View>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.circleApplyContainer} />
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.applyText}>View </Text>
              <CareCashbackBanner
                bannerText={`Plans`}
                textStyle={styles.circleText}
                logoStyle={styles.circleLogo}
              />
            </View>
          </View>
          <Text style={styles.useCircleText}>
            Viewing plans will remove any applied coupon. You can opt for coupon again later.`
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderScreen = () => {
    return (
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
          {renderUnServiceable()}
          {renderCartItems()}
          {!!circleMembershipCharges && <CircleCartItem currentPatient={currentPatient} />}
          {(!isCircleSubscription || showCareSelectPlans) &&
            !coupon &&
            !circleSubscriptionId &&
            !circleMembershipCharges &&
            renderCareSubscriptionOptions()}
          {!!coupon && !isCircleSubscription && !circleSubscriptionId && renderViewCirclePlans()}
          {!circleMembershipCharges && renderAvailFreeDelivery()}
          {renderAmountSection()}
          {renderSavings()}
          {renderOneApollo()}
          {renderSuggestProducts()}
          {renderPrescriptions()}
          {renderKerbSidePickup()}
        </ScrollView>
        {renderProceedBar()}
        {loading && <Spinner />}
      </SafeAreaView>
    );
  };

  const renderEmptyCart = () => {
    return (
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <EmptyCart
          onPressAddMedicines={() => {
            props.navigation.navigate('MEDICINES');
          }}
        />
      </SafeAreaView>
    );
  };
  return <View style={{ flex: 1 }}>{cartItems?.length ? renderScreen() : renderEmptyCart()}</View>;
};

const isPricesWithInSpecifiedRange = (
  num1: number,
  num2: number,
  percentage: number,
  cartPriceNotUpdateRange: number
) => {
  const diff = num1 - num2;
  const diffP = (diff / num1) * 100;
  const result = diffP <= percentage && diffP >= -percentage;
  const finalResult = !!cartPriceNotUpdateRange
    ? result && diff > cartPriceNotUpdateRange && diff < -cartPriceNotUpdateRange
    : result;
  return finalResult;
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginHorizontal: 20,
  },
  amountHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  applyBenefits: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 15,
    marginTop: 10,
    padding: 10,
  },
  circleText: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 17),
    paddingTop: 12,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 40,
  },
  circleApplyContainer: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#00B38E',
    borderRadius: 5,
    marginTop: 9,
    marginRight: 10,
  },
  applyText: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 17),
    paddingTop: 12,
  },
  useCircleText: {
    ...theme.viewStyles.text('R', 12, '#02475B', 1, 17),
    marginLeft: 25,
  },
  viewPlanContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 0,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderColor: '#00B38E',
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  viewPlan: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderColor: '#00B38E',
    borderWidth: 3,
    marginRight: 10,
    marginTop: 10,
  },
  viewText: {
    ...theme.viewStyles.text('M', 14, '#02475B', 1, 17),
    paddingTop: 12,
    marginRight: 5,
  },
  viewSubText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 20),
    width: '50%',
  },
});
