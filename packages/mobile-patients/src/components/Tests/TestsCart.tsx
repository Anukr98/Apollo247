import {
  aphConsole,
  formatAddress,
  formatAddressWithLandmark,
  g,
  TestSlot,
  isEmptyObject,
  getDiscountPercentage,
  postAppsFlyerEvent,
  postFirebaseEvent,
  nameFormater,
  getAge,
  isAddressLatLngInValid,
  setAsyncPharmaLocation,
  isSmallDevice,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  DiagnosticArea,
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  CheckedIcon,
  CircleLogo,
  CouponIcon,
  CrossOcta,
  BlackArrowUp,
  BlackArrowDown,
  Down,
  Up,
  InfoIconBlue,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_PATIENT_ADDRESS_LIST,
  UPLOAD_DOCUMENT,
  GET_DIAGNOSTIC_AREAS,
  GET_DIAGNOSTICS_HC_CHARGES,
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  VALIDATE_DIAGNOSTIC_COUPON,
  GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
  SAVE_DIAGNOSTIC_ORDER_NEW,
  CREATE_INTERNAL_ORDER,
  EDIT_PROFILE,
  GET_DIAGNOSTIC_NEAREST_AREA,
  GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
  MODIFY_DIAGNOSTIC_ORDERS,
  FIND_DIAGNOSTIC_SETTINGS,
  SET_DEFAULT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticsHCChargesVariables,
  getDiagnosticsHCCharges,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsHCCharges';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import {
  DEVICETYPE,
  DiagnosticLineItem,
  TEST_COLLECTION_TYPE,
  SaveBookHomeCollectionOrderInput,
  OrderCreate,
  OrderVerticals,
  DiagnosticsBookingSource,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  saveModifyDiagnosticOrderInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticCartItemReportGenDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { TestSlotSelectionOverlayNew } from '@aph/mobile-patients/src/components/Tests/components/TestSlotSelectionOverlayNew';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { postPharmacyAddNewAddressClick } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { getAreas, getAreasVariables } from '@aph/mobile-patients/src/graphql/types/getAreas';
import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import {
  vaidateDiagnosticCoupon,
  vaidateDiagnosticCouponVariables,
} from '@aph/mobile-patients/src/graphql/types/vaidateDiagnosticCoupon';
import {
  getPincodeServiceability,
  getPincodeServiceabilityVariables,
} from '@aph/mobile-patients/src/graphql/types/getPincodeServiceability';
import {
  saveDiagnosticBookHCOrder,
  saveDiagnosticBookHCOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/saveDiagnosticBookHCOrder';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import {
  calculateMrpToDisplay,
  getPricesForItem,
  sourceHeaders,
  convertNumberToDecimal,
  createAddressObject,
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { initiateSDK } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { isSDKInitialised } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import {
  DiagnosticAddresssSelected,
  DiagnosticAddToCartClicked,
  DiagnosticAppointmentTimeSlot,
  DiagnosticAreaSelected,
  DiagnosticCartViewed,
  DiagnosticModifyOrder,
  DiagnosticNonServiceableAddressSelected,
  PaymentInitiated,
  DiagnosticProceedToPay,
  DiagnosticRemoveFromCartClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import {
  getNearestArea,
  getNearestAreaVariables,
} from '@aph/mobile-patients/src/graphql/types/getNearestArea';
import {
  getDiagnosticSlotsCustomized,
  getDiagnosticSlotsCustomizedVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsCustomized';
import { PatientListOverlay } from '@aph/mobile-patients/src/components/Tests/components/PatientListOverlay';
import { PatientDetailsOverlay } from '@aph/mobile-patients/src/components/Tests/components/PatientDetailsOverlay';
import { TestProceedBar } from '@aph/mobile-patients/src/components/Tests/components/TestProceedBar';
import { AccessLocation } from '@aph/mobile-patients/src/components/Medicines/Components/AccessLocation';
import { SelectAreaOverlay } from '@aph/mobile-patients/src/components/Tests/components/SelectAreaOverlay';
import { TestItemCard } from '@aph/mobile-patients/src/components/Tests/components/TestItemCard';
import {
  editProfile,
  editProfileVariables,
} from '@aph/mobile-patients/src/graphql/types/editProfile';
import { ItemCard } from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import AsyncStorage from '@react-native-community/async-storage';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  saveModifyDiagnosticOrder,
  saveModifyDiagnosticOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/saveModifyDiagnosticOrder';
import { processDiagnosticsCODOrder } from '@aph/mobile-patients/src/helpers/clientCalls';
import { findDiagnosticSettings } from '@aph/mobile-patients/src/graphql/types/findDiagnosticSettings';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { colors } from '@aph/mobile-patients/src/theme/colors';
const { width: screenWidth } = Dimensions.get('window');
type Address = savePatientAddress_savePatientAddress_patientAddress;
export interface areaObject {
  key: string | number;
  value: string | number;
}
export interface orderDetails {
  orderId: string | null;
  displayId: string | null;
  diagnosticDate: string | number;
  slotTime: string | null;
  cartSaving: string | number;
  circleSaving: string | number;
  cartHasAll?: boolean;
}

export interface TestsCartProps extends NavigationScreenProps {
  comingFrom?: string;
}

type orderListLineItems = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems;

export const TestsCart: React.FC<TestsCartProps> = (props) => {
  const {
    removeCartItem,
    updateCartItem,
    cartItems,
    setCartItems,
    setAddresses,
    addresses,
    setDeliveryAddressId,
    deliveryAddressId,
    setDeliveryAddressCityId,
    deliveryAddressCityId,
    cartTotal,
    totalPriceExcludingAnyDiscounts,
    couponDiscount,
    grandTotal,
    uploadPrescriptionRequired,
    setPhysicalPrescriptions,
    physicalPrescriptions,
    pinCode,
    setPinCode,
    ePrescriptions,
    forPatientId,
    setPatientId,
    diagnosticSlot,
    setUniqueId,
    getUniqueId,
    setDiagnosticSlot,
    setHcCharges,
    hcCharges,
    coupon,
    areaSelected,
    setAreaSelected,
    setDiagnosticAreas,
    cartSaving,
    discountSaving,
    normalSaving,
    circleSaving,
    isDiagnosticCircleSubscription,
    newAddressAddedCartPage,
    setNewAddressAddedCartPage,
    showSelectPatient,
    setShowSelectPatient,
    showSelectedArea,
    setShowSelectedArea,
    isCartPagePopulated,
    setCartPagePopulated,
    modifyHcCharges,
    setModifyHcCharges,
    modifiedOrder,
    setModifiedOrder,
    setAsyncDiagnosticPincode,
    setModifiedOrderItemIds,
  } = useDiagnosticsCart();
  const {
    setAddresses: setMedAddresses,
    circleSubscriptionId,
    circlePlanValidity,
  } = useShoppingCart();

  const sourceScreen = props.navigation.getParam('comingFrom');
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);

  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();
  const { currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [todaySlotNotAvailable, setTodaySlotNotAvailable] = useState<boolean>(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState<boolean>(false);
  const [showPriceMismatch, setShowPriceMismatch] = useState<boolean>(false);
  const currentPatientId =
    !!modifiedOrder && !isEmptyObject(modifiedOrder)
      ? modifiedOrder?.patientId
      : currentPatient && currentPatient?.id;
  const client = useApolloClient();
  const {
    locationDetails,
    diagnosticServiceabilityData,
    diagnosticLocation,
    setauthToken,
    setDoctorJoinedChat,
    isDiagnosticLocationServiceable,
    setDiagnosticLocation,
  } = useAppCommonData();

  const { getPatientApiCall } = useAuth();

  const { setLoading, showAphAlert, hideAphAlert, loading } = useUIElements();

  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [displaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>();
  const [isEPrescriptionUploadComplete, setisEPrescriptionUploadComplete] = useState<boolean>();
  const [addressCityId, setAddressCityId] = useState<string>(deliveryAddressCityId);
  const [validateCouponUniqueId, setValidateCouponUniqueId] = useState<string>(getUniqueId);
  const [orderDetails, setOrderDetails] = useState<orderDetails>();
  const [showInclusions, setShowInclusions] = useState<boolean>(false);
  const [duplicateNameArray, setDuplicateNameArray] = useState([] as any);
  const [showPatientListOverlay, setShowPatientListOverlay] = useState<boolean>(
    isModifyFlow ? false : showSelectPatient ? false : true
  );
  const [showPatientDetailsOverlay, setShowPatientDetailsOverlay] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(
    isModifyFlow ? modifiedOrder?.patientObj : null
  );
  const [showSelectAreaOverlay, setShowSelectAreaOverlay] = useState<boolean>(false);
  const [reportGenDetails, setReportGenDetails] = useState<any>([]);
  const [alsoAddListData, setAlsoAddListData] = useState<any>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showAllPreviousItems, setShowAllPreviousItems] = useState<boolean>(true);
  const [isHcApiCalled, setHcApiCalled] = useState<boolean>(false);

  const [phleboMin, setPhleboMin] = useState(0);
  const itemsWithHC = cartItems?.filter((item) => item!.collectionMethod == 'HC');
  const itemWithId = itemsWithHC?.map((item) => Number(item.id!));

  const cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
  var pricesForItemArray;
  var modifyPricesForItemArray;
  var slotBookedArray = ['slot', 'already', 'booked', 'select a slot'];

  const isCovidItem = cartItemsWithId?.map((item) =>
    AppConfig.Configuration.Covid_Items.includes(item)
  );
  const isCartHasCovidItem = isCovidItem?.find((item) => item === true);
  const maxDaysToShow = !!isCartHasCovidItem
    ? AppConfig.Configuration.Covid_Max_Slot_Days
    : AppConfig.Configuration.Non_Covid_Max_Slot_Days;
  const enable_cancelellation_policy =
    AppConfig.Configuration.Enable_Diagnostics_Cancellation_Policy;
  const cancelellation_policy_text = AppConfig.Configuration.Diagnostics_Cancel_Policy_Text_Msg;

  const saveHomeCollectionBookingOrder = (orderInfo: SaveBookHomeCollectionOrderInput) =>
    client.mutate<saveDiagnosticBookHCOrder, saveDiagnosticBookHCOrderVariables>({
      mutation: SAVE_DIAGNOSTIC_ORDER_NEW,
      context: {
        sourceHeaders,
      },
      variables: { diagnosticOrderInput: orderInfo },
    });

  const createOrderInternal = (orders: OrderCreate) =>
    client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      context: {
        sourceHeaders,
      },
      variables: { order: orders },
    });

  const saveModifyOrder = (orderInfo: saveModifyDiagnosticOrderInput) =>
    client.mutate<saveModifyDiagnosticOrder, saveModifyDiagnosticOrderVariables>({
      mutation: MODIFY_DIAGNOSTIC_ORDERS,
      context: {
        sourceHeaders,
      },
      variables: { saveModifyDiagnosticOrder: orderInfo },
    });

  useEffect(() => {
    initiateHyperSDK();
  }, [currentPatient]);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setIsFocused(true);
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const willBlur = props.navigation.addListener('willBlur', (payload) => {
      setIsFocused(false);
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      willBlur && willBlur.remove();
    };
  }, []);

  useEffect(() => {
    if (showSelectPatient && currentPatient) {
      setSelectedPatient(isModifyFlow ? modifiedOrder?.patientObj : currentPatient);
      setShowPatientListOverlay(false);
    }
    //set the area & patient selected for modifiedOrder flow
    if (isModifyFlow) {
      setAreaSelected?.({ key: modifiedOrder?.areaId, value: '' });
      setPatientId?.(modifiedOrder?.patientId);
    } else {
      fetchAddresses();
    }
    fetchFindDiagnosticSettings();
  }, []);

  const fetchTestReportGenDetails = async (_cartItemId: string | number[]) => {
    try {
      const removeSpaces =
        typeof _cartItemId == 'string' ? _cartItemId.replace(/\s/g, '').split(',') : null;
      const listOfIds =
        typeof _cartItemId == 'string' ? removeSpaces?.map((item) => parseInt(item!)) : _cartItemId;
      const res: any = await getDiagnosticCartItemReportGenDetails(
        listOfIds?.toString() || _cartItemId?.toString(),
        Number(addressCityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
      );
      if (res?.data?.success) {
        const result = g(res, 'data', 'data');
        const widgetsData = g(res, 'data', 'widget_data', '0', 'diagnosticWidgetData');
        setReportGenDetails(result || []);
        const _itemIds = widgetsData?.map((item: any) => Number(item?.itemId));
        const _filterItemIds = _itemIds?.filter((val: any) => !cartItemsWithId?.includes(val));

        client
          .query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
            query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
            context: {
              sourceHeaders,
            },
            variables: {
              cityID: Number(addressCityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
              itemIDs: _filterItemIds,
            },
            fetchPolicy: 'no-cache',
          })
          .then(({ data }) => {
            const diagnosticItems =
              g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
            let _diagnosticWidgetData: any = [];
            widgetsData?.forEach((_widget: any) => {
              diagnosticItems?.forEach((_diagItems) => {
                if (_widget?.itemId == _diagItems?.itemId) {
                  _diagnosticWidgetData?.push({
                    ..._widget,
                    diagnosticPricing: _diagItems?.diagnosticPricing,
                    packageCalculatedMrp: _diagItems?.packageCalculatedMrp,
                  });
                }
              });
            });
            setAlsoAddListData(_diagnosticWidgetData);
          })
          .catch((error) => {
            setAlsoAddListData([]);
            CommonBugFender(
              'TestsCart_fetchTestReportGenDetails_getDiagnosticsAvailability',
              error
            );
          });
      } else {
        setAlsoAddListData([]);
        setReportGenDetails([]);
      }
    } catch (e) {
      CommonBugFender('TestsCart_fetchTestReportGenDetails', e);
      setAlsoAddListData([]);
      setReportGenDetails([]);
    }
  };

  const fetchFindDiagnosticSettings = async () => {
    try {
      const response = await client.query<findDiagnosticSettings>({
        query: FIND_DIAGNOSTIC_SETTINGS,
        variables: {
          phleboETAInMinutes: 0,
        },
        fetchPolicy: 'no-cache',
      });
      const phleboMin = g(response, 'data', 'findDiagnosticSettings', 'phleboETAInMinutes') || 45;
      setPhleboMin(phleboMin);
    } catch (error) {
      CommonBugFender('TestsCart_fetchFindDiagnosticSettings', error);
    }
  };

  const initiateHyperSDK = async () => {
    try {
      const isInitiated: boolean = await isSDKInitialised();
      !isInitiated && initiateSDK(currentPatient?.id, currentPatient?.id);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const checkPatientAge = (_selectedPatient: any, fromNewProfile: boolean = false) => {
    let age = !!_selectedPatient?.dateOfBirth ? getAge(_selectedPatient?.dateOfBirth) : null;
    if (age && age <= 10) {
      setSelectedPatient(null);
      setShowSelectPatient?.(false);
      Alert.alert(string.common.uhOh, string.diagnostics.minorAgeText, [
        {
          text: 'OK',
          onPress: () => {
            fromNewProfile && setShowPatientListOverlay(true);
          },
        },
      ]);
      return true;
    }
    return false;
  };

  const handleBack = () => {
    //modify order
    if (isModifyFlow) {
      showAphAlert?.({
        title: string.common.hiWithSmiley,
        description: string.diagnostics.modifyDiscardText,
        unDismissable: true,
        CTAs: [
          {
            text: 'DISCARD',
            onPress: () => {
              hideAphAlert?.();
              clearModifyDetails();
            },
            type: 'orange-button',
          },
          {
            text: 'CANCEL',
            onPress: () => {
              hideAphAlert?.();
            },
            type: 'orange-button',
          },
        ],
      });
    } else {
      props.navigation.goBack();
    }
    return true;
  };

  function clearModifyDetails() {
    setModifiedOrder?.(null);
    setPatientId?.(currentPatientId!);
    setModifyHcCharges?.(0);
    setModifiedOrderItemIds?.([]);
    setHcCharges?.(0);
    setAreaSelected?.({});
    //go back to homepage
    props.navigation.navigate('TESTS', { focusSearch: true });
  }

  useEffect(() => {
    if (cartItemsWithId?.length > 0 && !isModifyFlow) {
      fetchPackageDetails(cartItemsWithId, null, 'diagnosticServiceablityChange');
    }
  }, [diagnosticServiceabilityData]);

  useEffect(() => {
    if (isModifyFlow) {
      return;
    } else if (
      selectedTimeSlot?.slotInfo?.slot! &&
      areaSelected &&
      deliveryAddressId != '' &&
      cartItems?.length > 0
    ) {
      setCartPagePopulated?.(true);
      validateDiagnosticCoupon();
      fetchHC_ChargesForTest(selectedTimeSlot?.slotInfo?.slot!);
    }
  }, [diagnosticSlot, deliveryAddressId, cartItems, addresses]);

  //called only for the modify flow.
  useEffect(() => {
    if (isModifyFlow && modifiedOrder?.slotId && modifiedOrder?.areaId && cartItems?.length > 0) {
      const modifyOrderItems = modifiedOrder?.diagnosticOrderLineItems?.map(
        (item: orderListLineItems) => item
      );
      //if any of cart item has 0 price -> don't call hcApi
      const isCartUpdated = cartItems?.find((item) => Number(item?.price) === 0);
      isCartUpdated == undefined && fetchHC_ChargesForTest(modifiedOrder?.slotId, modifyOrderItems);
    }
  }, [cartItems]);

  useEffect(() => {
    if ((isModifyFlow || deliveryAddressId != '') && isFocused) {
      getPinCodeServiceability();
    }
  }, [addresses, isFocused]);

  //check all webengage events
  useEffect(() => {
    if (cartItems?.length && deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      const pinCodeFromAddress = addresses?.[selectedAddressIndex]?.zipcode!;
      DiagnosticCartViewed(
        currentPatient,
        cartItems,
        couponDiscount,
        grandTotal,
        uploadPrescriptionRequired,
        diagnosticSlot,
        coupon,
        hcCharges,
        circlePlanValidity,
        circleSubscriptionId,
        isDiagnosticCircleSubscription,
        pinCodeFromAddress
      );
    }
  }, [hcCharges, addresses]);

  function postwebEngageProceedToPayEvent() {
    const mode = 'Home Visit';
    const areaId = isModifyFlow
      ? Number(modifiedOrder?.areaId)
      : Number((areaSelected as areaObject)?.key);
    const slotTime = isModifyFlow
      ? moment(modifiedOrder?.slotDateTimeInUTC).format('hh:mm')
      : selectedTimeSlot?.slotInfo?.startTime!;
    const areaName = String((areaSelected as areaObject)?.value);

    DiagnosticProceedToPay(
      date,
      currentPatient,
      cartItems,
      cartTotal,
      grandTotal,
      uploadPrescriptionRequired,
      mode,
      pinCode,
      'Diagnostic',
      areaName,
      areaId,
      hcCharges,
      slotTime
    );
  }

  function postwebEngageProceedToPayEventForModify() {
    const previousTotalCharges = modifiedOrder?.totalPrice;
    const isHCUpdated = modifiedOrder?.collectionCharges === hcCharges ? 'No' : 'Yes';
    const paymentMode =
      modifiedOrder?.paymentType !== DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT
        ? 'Cash'
        : 'Prepaid';
    DiagnosticModifyOrder(
      cartItemsWithId?.length,
      cartItemsWithId?.join(', '),
      previousTotalCharges,
      grandTotal,
      isHCUpdated,
      paymentMode
    );
  }

  const setWebEngageEventForAddressNonServiceable = (pincode: string) => {
    const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);

    DiagnosticNonServiceableAddressSelected(
      selectedAddr,
      currentPatient,
      pincode,
      cartItems,
      cartItemsWithId
    );
  };

  const setWebEngageEventForAreaSelection = (item: areaObject) => {
    const area = String(item?.value);
    const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);

    DiagnosticAreaSelected(selectedAddr, area);
  };

  const setWebEnageEventForAppointmentTimeSlot = (
    mode: 'Automatic' | 'Manual',
    slotDetails: TestSlot,
    areaObject: areaObject | DiagnosticArea | any
  ) => {
    const area = String((areaObject as areaObject)?.value);
    const timeSlot = !!slotDetails ? slotDetails?.slotInfo?.startTime! : 'No slot';
    const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);
    const selectionMode = mode;
    const isSlotAvailable = slotDetails?.slotInfo?.startTime! ? 'Yes' : 'No';

    DiagnosticAppointmentTimeSlot(
      selectedAddr,
      area,
      timeSlot,
      selectionMode,
      isSlotAvailable,
      currentPatient
    );
  };

  useEffect(() => {
    onFinishUpload();
  }, [isEPrescriptionUploadComplete, isPhysicalUploadComplete]);

  useEffect(() => {
    if (cartItems?.length > 0) {
      if (cartItemsWithId?.length > 0) {
        fetchTestReportGenDetails(cartItemsWithId);
      }
    }
  }, [cartItems?.length, addressCityId]);
  useEffect(() => {
    if (isModifyFlow) {
      return;
    }
    setPatientId!(currentPatientId!);
  }, [currentPatientId]);

  useEffect(() => {
    if (cartItems?.length == 0) {
      setselectedTimeSlot?.(undefined);
      setDiagnosticAreas?.([]);
      setAreaSelected?.({});
      setDeliveryAddressId?.('');
      setModifyHcCharges?.(0);
      setHcCharges?.(0);
      setCartPagePopulated?.(false);
      setLoading?.(false);
    }

    if (isModifyFlow) {
      return;
    } else {
      if (deliveryAddressId) {
        if (diagnosticSlot) {
          setDate(new Date(diagnosticSlot?.date));
          setselectedTimeSlot({
            date: new Date(diagnosticSlot?.date),
            diagnosticBranchCode: '',
            employeeCode: diagnosticSlot?.diagnosticEmployeeCode,
            employeeName: '', // not sending name to API hence keeping empty
            slotInfo: {
              __typename: 'SlotInfo',
              endTime: diagnosticSlot?.slotEndTime,
              slot: String(diagnosticSlot?.employeeSlotId),
              startTime: diagnosticSlot?.slotStartTime,
              status: 'empty',
            },
          });
        } else {
          setDate(new Date());
          setselectedTimeSlot(undefined);
        }
      }
    }
  }, [deliveryAddressId, diagnosticSlot, cartItems, addresses]);

  const renderAlert = (message: string, source?: string, address?: any) => {
    if (!!source && !!address) {
      showAphAlert?.({
        unDismissable: true,
        title: string.common.uhOh,
        description: message,
        onPressOk: () => {
          hideAphAlert?.();
          props.navigation.push(AppRoutes.AddAddressNew, {
            KeyName: 'Update',
            addressDetails: address,
            ComingFrom: AppRoutes.TestsCart,
            updateLatLng: true,
            source: 'Diagnostics Cart' as AddressSource,
          });
        },
      });
    } else {
      setLoading?.(false);
      showAphAlert?.({
        title: string.common.uhOh,
        description: message,
      });
    }
  };
  useEffect(() => {
    if (isEmptyObject(areaSelected)) {
      setHcApiCalled(false);
    } else {
      setHcApiCalled(true);
    }
  }, [areaSelected]);
  const fetchAddresses = async () => {
    try {
      if (addresses?.length) {
        return;
      }
      setLoading?.(true);
      //clearing on changing user
      setDiagnosticAreas?.([]);
      setAreaSelected?.({});
      const userId = g(currentPatient, 'id');
      const addressApiCall = await client.query<
        getPatientAddressList,
        getPatientAddressListVariables
      >({
        query: GET_PATIENT_ADDRESS_LIST,
        context: {
          sourceHeaders,
        },
        variables: { patientId: userId },
        fetchPolicy: 'no-cache',
      });
      const addressList =
        (addressApiCall.data.getPatientAddressList
          .addressList as savePatientAddress_savePatientAddress_patientAddress[]) || [];
      setAddresses?.(addressList);
      setMedAddresses?.(addressList);
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      renderAlert(`Something went wrong, unable to fetch addresses.`);
    }
  };
  const onRemoveCartItem = ({ id, name }: DiagnosticsCartItem) => {
    removeCartItem && removeCartItem(id);
    const newCartItems = cartItems?.filter((item) => Number(item?.id) !== Number(id));
    const removedItems = newCartItems?.map((item) => Number(item?.id));
    setCartItems?.(newCartItems);
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      isModifyFlow
        ? null
        : isEmptyObject(areaSelected) == false
        ? checkSlotSelection(areaSelected, undefined, undefined, removedItems)
        : showSelectedArea
        ? fetchAreasForAddress(
            addresses?.[selectedAddressIndex]?.id,
            addresses?.[selectedAddressIndex]?.zipcode!,
            showSelectedArea
          )
        : getAreas(removedItems);
      DiagnosticRemoveFromCartClicked(
        id,
        name,
        addresses?.[selectedAddressIndex]?.zipcode!,
        'Customer'
      );
    } else {
      DiagnosticRemoveFromCartClicked(
        id,
        name,
        diagnosticLocation?.pincode! || locationDetails?.pincode!,
        'Customer'
      );
    }
  };
  const getPinCodeServiceability = async () => {
    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
    );
    const pinCodeFromAddress = isModifyFlow
      ? modifiedOrder?.patientAddressObj?.zipcode!
      : addresses?.[selectedAddressIndex]?.zipcode!;

    if (!!pinCodeFromAddress) {
      setLoading?.(true);
      setPinCode?.(pinCodeFromAddress);
      client
        .query<getPincodeServiceability, getPincodeServiceabilityVariables>({
          query: GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
          context: {
            sourceHeaders,
          },
          variables: {
            pincode: Number(pinCodeFromAddress),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const serviceableData = g(data, 'getPincodeServiceability');
          if (serviceableData && serviceableData?.cityName != '') {
            setAddressCityId?.(String(serviceableData?.cityID!) || '');
            setDeliveryAddressCityId?.(String(serviceableData?.cityID));
            getDiagnosticsAvailability(serviceableData?.cityID!, cartItems)
              .then(({ data }) => {
                const diagnosticItems =
                  g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
                if (!isCartPagePopulated) {
                  if (serviceableData?.areaSelectionEnabled) {
                    setShowSelectedArea?.(true);
                  }
                  //don't show the area and hit the nearestPCC api.
                  else {
                    setShowSelectedArea?.(false);
                  }
                }

                updatePricesInCart(
                  diagnosticItems,
                  selectedAddressIndex,
                  serviceableData?.areaSelectionEnabled!
                );
                cartItems?.length == 0 && setLoading?.(false);
              })
              .catch((e) => {
                CommonBugFender('TestsCart_getDiagnosticsAvailability', e);
                setLoading?.(false);
                errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
              });

            DiagnosticAddresssSelected(
              newAddressAddedCartPage != '' ? 'New' : 'Existing',
              'Yes',
              pinCodeFromAddress,
              'Cart page'
            );
            newAddressAddedCartPage != '' && setNewAddressAddedCartPage?.('');
          } else {
            setLoading?.(false);
            showAphAlert?.({
              unDismissable: true,
              title: string.common.uhOh,
              description: string.diagnostics.nonServiceableConfigPinCodeMsg.replace(
                '{{pincode}}',
                pinCodeFromAddress
              ),
              onPressOk: () => {
                hideAphAlert!();
                setDeliveryAddressCityId?.('');
                setDeliveryAddressId?.('');
              },
            });
            DiagnosticAddresssSelected(
              newAddressAddedCartPage != '' ? 'New' : 'Existing',
              'No',
              pinCodeFromAddress,
              'Cart page'
            );
            newAddressAddedCartPage != '' && setNewAddressAddedCartPage?.('');
          }
        })
        .catch((e) => {
          CommonBugFender('Tests_', e);
          setLoading?.(false);
          setDeliveryAddressCityId?.('');
          setDeliveryAddressId?.('');
        });
    }
  };

  const getNearestPCCLocation = async () => {
    const input: getNearestAreaVariables = {
      patientAddressId: selectedAddr?.id!,
    };
    const res = await client.query<getNearestArea, getNearestAreaVariables>({
      query: GET_DIAGNOSTIC_NEAREST_AREA,
      variables: input,
      fetchPolicy: 'no-cache',
    });
    return res;
  };

  const getAreas = async (_itemIds?: number[]) => {
    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
    );
    try {
      const response = await getNearestPCCLocation();
      const { data } = response;
      const getAreaObject = g(data, 'getNearestArea', 'area');
      let obj = { key: getAreaObject?.id!, value: getAreaObject?.area! };
      setAreaSelected?.(obj);
      checkSlotSelection(obj, undefined, undefined, _itemIds);
      setWebEngageEventForAreaSelection(obj);
    } catch (e) {
      CommonBugFender('TestsCart_', e);

      setselectedTimeSlot(undefined);
      setLoading?.(false);
      setWebEngageEventForAddressNonServiceable(addresses?.[selectedAddressIndex]?.zipcode!);

      //if goes in the catch then show the area selection.
      setShowSelectedArea?.(true);
      fetchAreasForAddress(
        addresses?.[selectedAddressIndex]?.id,
        addresses?.[selectedAddressIndex]?.zipcode!,
        true
      );
    }
  };

  const updatePricesInCart = (results: any, selectedAddressIndex: any, shouldShowArea: boolean) => {
    const disabledCartItems = cartItems?.filter(
      (cartItem) =>
        !results?.find(
          (d: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics) =>
            `${d?.itemId}` == cartItem?.id
        )
    );
    let isItemDisable = false,
      isPriceChange = false;
    if (cartItems?.length > 0) {
      cartItems?.map((cartItem) => {
        const isItemInCart = results?.findIndex(
          (item: any) => String(item?.itemId) === String(cartItem?.id)
        );

        if (isItemInCart !== -1) {
          const pricesForItem = getPricesForItem(
            results?.[isItemInCart]?.diagnosticPricing,
            results?.[isItemInCart]?.packageCalculatedMrp!
          );

          // if all the groupPlans are inactive, then only don't show
          if (!pricesForItem?.itemActive) {
            return null;
          }

          const specialPrice = pricesForItem?.specialPrice!;
          const price = pricesForItem?.price!; //more than price (black)
          const circlePrice = pricesForItem?.circlePrice!;
          const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
          const discountPrice = pricesForItem?.discountPrice!;
          const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
          const planToConsider = pricesForItem?.planToConsider;

          const promoteCircle = pricesForItem?.promoteCircle; //if circle discount is more
          const promoteDiscount = pricesForItem?.promoteDiscount; // if special discount is more than others.

          //removed comparison of circle/discount/prices
          const priceToCompare =
            isDiagnosticCircleSubscription && promoteCircle
              ? circleSpecialPrice
              : promoteDiscount
              ? discountSpecialPrice
              : specialPrice || price;

          let cartPriceToCompare = 0;
          if (
            isDiagnosticCircleSubscription &&
            cartItem?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
          ) {
            cartPriceToCompare = Number(cartItem?.circleSpecialPrice);
          } else if (cartItem?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT) {
            cartPriceToCompare = Number(cartItem?.discountSpecialPrice);
          } else {
            cartPriceToCompare = Number(cartItem?.specialPrice || cartItem?.price);
          }
          if (priceToCompare !== cartPriceToCompare) {
            //mrp
            //show the prices changed pop-over
            isPriceChange = true;
            setShowPriceMismatch(true);
            const _itemIds = cartItems?.map((item) => Number(item?.id));
            isModifyFlow
              ? null
              : !isEmptyObject(areaSelected)
              ? checkSlotSelection(areaSelected, undefined, undefined, _itemIds)
              : shouldShowArea
              ? fetchAreasForAddress(
                  addresses?.[selectedAddressIndex]?.id,
                  addresses?.[selectedAddressIndex]?.zipcode!,
                  shouldShowArea
                )
              : getAreas();
            updateCartItem?.({
              id: results?.[isItemInCart]
                ? String(results?.[isItemInCart]?.itemId)
                : String(cartItem?.id),
              name: results?.[isItemInCart]?.itemName || '',
              price: price,
              specialPrice: specialPrice || price,
              circlePrice: circlePrice,
              circleSpecialPrice: circleSpecialPrice,
              discountPrice: discountPrice,
              discountSpecialPrice: discountSpecialPrice,
              mou:
                results?.[isItemInCart]?.inclusions !== null
                  ? results?.[isItemInCart]?.inclusions.length
                  : 1,
              thumbnail: cartItem?.thumbnail,
              groupPlan: planToConsider?.groupPlan,
              packageMrp: results?.[isItemInCart]?.packageCalculatedMrp,
              inclusions:
                results?.[isItemInCart]?.inclusions == null
                  ? [Number(results?.[isItemInCart]?.itemId)]
                  : results?.[isItemInCart]?.inclusions,
            });
          }
        }
        //if items not available
        if (disabledCartItems?.length) {
          isItemDisable = true;
          const disabledCartItemIds = disabledCartItems?.map((item) => item.id);
          setLoading?.(false);
          removeDisabledCartItems(disabledCartItemIds);
          setShowPriceMismatch(true);
          const _itemIds = cartItems?.map((item) => Number(item?.id));

          isModifyFlow
            ? null
            : !isEmptyObject(areaSelected)
            ? checkSlotSelection(areaSelected, undefined, undefined, _itemIds)
            : shouldShowArea
            ? fetchAreasForAddress(
                addresses?.[selectedAddressIndex]?.id,
                addresses?.[selectedAddressIndex]?.zipcode!,
                shouldShowArea
              )
            : getAreas();
        }
      });
      if (!isItemDisable && !isPriceChange) {
        isPriceChange = false;
        isItemDisable = false;
        const _itemIds = cartItems?.map((item) => Number(item?.id));
        isModifyFlow
          ? setLoading?.(false)
          : !isEmptyObject(areaSelected)
          ? checkSlotSelection(areaSelected, undefined, undefined, _itemIds)
          : shouldShowArea
          ? fetchAreasForAddress(
              addresses?.[selectedAddressIndex]?.id,
              addresses?.[selectedAddressIndex]?.zipcode!,
              shouldShowArea
            )
          : getAreas();
      }
    }
  };

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={isModifyFlow ? 'MODIFY ORDERS' : 'TESTS CART'}
        titleStyle={{ marginLeft: 20 }}
        rightComponent={
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => (isModifyFlow ? _navigateToSearch() : _navigateToHomePage())}
            >
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(13),
                  color: theme.colors.APP_YELLOW,
                }}
              >
                ADD TESTS
              </Text>
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  function _navigateToSearch() {
    DiagnosticAddToCartClicked();
    props.navigation.navigate(AppRoutes.SearchTestScene, {
      searchText: '',
    });
  }

  function _navigateToHomePage() {
    DiagnosticAddToCartClicked();
    props.navigation.navigate('TESTS', { focusSearch: true });
  }

  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };

  const errorAlert = (description?: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: description || 'Unable to fetch test details.',
    });
  };

  const fetchPackageDetails = (
    itemIds: string | number[],
    func: (
      product: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics
    ) => void | null,
    comingFrom: string
  ) => {
    const removeSpaces = typeof itemIds == 'string' ? itemIds.replace(/\s/g, '').split(',') : null;

    const listOfIds =
      typeof itemIds == 'string' ? removeSpaces?.map((item) => parseInt(item!)) : itemIds;

    const cityIdToPass =
      deliveryAddressId != ''
        ? Number(deliveryAddressCityId)
        : !!sourceScreen
        ? AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
        : Number(
            diagnosticServiceabilityData?.cityId! ||
              AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
          );

    {
      setLoading?.(true);
      client
        .query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
          query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
          context: {
            sourceHeaders,
          },
          variables: {
            //if address is not selected then from pincode bar otherwise from address
            cityID: cityIdToPass,
            itemIDs: listOfIds!,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const product = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics');

          if (product) {
            func && func(product[0]!);

            if (comingFrom == 'diagnosticServiceablityChange') {
              product?.map((item,index) => {
                const diagnosticPricing = g(item, 'diagnosticPricing');
                const packageMrp = item?.packageCalculatedMrp!;
                const pricesForItem = getPricesForItem(diagnosticPricing, packageMrp);
                if (!pricesForItem?.itemActive) {
                  return null;
                }

                const specialPrice = pricesForItem?.specialPrice!;
                const price = pricesForItem?.price!;
                const circlePrice = pricesForItem?.circlePrice!;
                const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
                const discountPrice = pricesForItem?.discountPrice!;
                const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
                const planToConsider = pricesForItem?.planToConsider;
                const styleFreeItem = cartItems.map((i)=>{
                  if (i?.id == item?.itemId.toString()) {
                    return i?.name
                  }
                })
                updateCartItem?.({
                  id: item?.itemId?.toString() || product?.[0]?.id!,
                  name: styleFreeItem?.[index] ? styleFreeItem?.[index] : item?.itemName,
                  price: price,
                  thumbnail: '',
                  specialPrice: specialPrice! || price,
                  circlePrice: circlePrice!,
                  circleSpecialPrice: circleSpecialPrice!,
                  discountPrice: discountPrice!,
                  discountSpecialPrice: discountSpecialPrice,
                  collectionMethod: item?.collectionType!,
                  groupPlan: planToConsider?.groupPlan,
                  packageMrp: packageMrp,
                  mou: item?.inclusions == null ? 1 : item?.inclusions?.length,
                  inclusions:
                    item?.inclusions == null
                      ? [Number(item?.itemId || product?.[0]?.id)]
                      : item?.inclusions,
                });
              });
            }
          } else {
            errorAlert();
          }
          setLoading?.(false);
        })
        .catch((e) => {
          CommonBugFender('TestsCart_fetchPackageDetails', e);
          setLoading?.(false);
          errorAlert();
        });
    }
  };

  /**
   * fetching the areas
   */

  const fetchAreasForAddress = (
    id: string,
    pincode: string,
    shouldCallApi?: boolean,
    _itemIds?: number[]
  ) => {
    setLoading?.(true);
    //wrt to address
    if (cartItems?.length == 0 || !shouldCallApi) {
      setLoading?.(false);
      return;
    }
    client
      .query<getAreas, getAreasVariables>({
        context: {
          sourceHeaders,
        },
        query: GET_DIAGNOSTIC_AREAS,
        fetchPolicy: 'no-cache',
        variables: {
          pincode: parseInt(pincode!),
          itemIDs: _itemIds || cartItemsWithId,
        },
      })
      .then(({ data }) => {
        setLoading?.(false);
        const getDiagnosticAreas = g(data, 'getAreas', 'areas') || [];
        if (data?.getAreas?.status) {
          setDiagnosticAreas?.(getDiagnosticAreas);
        } else {
          setDeliveryAddressId?.('');
          setDiagnosticAreas?.([]);
          setCartPagePopulated?.(false);
          setAreaSelected?.({});
          setselectedTimeSlot(undefined);
          setLoading?.(false);
          setWebEngageEventForAddressNonServiceable(pincode);
          showAphAlert?.({
            title: string.common.uhOh,
            description: string.diagnostics.areaNotAvailableMessage,
          });
        }
      })
      .catch((e) => {
        setLoading?.(false);
        setDiagnosticAreas?.([]);
        setAreaSelected?.({});
        setCartPagePopulated?.(false);
        setselectedTimeSlot(undefined);
        setWebEngageEventForAddressNonServiceable(pincode);
        CommonBugFender('TestsCart_getArea selection', e);
        showAphAlert!({
          title: string.common.uhOh,
          description: string.diagnostics.areaNotAvailableMessage,
        });
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const renderItemsInCart = () => {
    const cartItemsCount =
      cartItems?.length > 10 || cartItems?.length == 0
        ? `${cartItems.length}`
        : `0${cartItems.length}`;

    return (
      <View>
        {renderLabel('ITEMS IN YOUR CART', cartItemsCount)}
        {cartItems?.length == 0 && <Text style={styles.cartEmpty}>Your Cart is empty</Text>}
        {cartItems?.map((test, index, array) => {
          const itemPackageMrp = test?.packageMrp!;
          const specialPrice = test?.specialPrice!;
          const price = test?.price!; //more than price (black)
          const circlePrice = test?.circlePrice!;
          const circleSpecialPrice = test?.circleSpecialPrice!;
          const discountPrice = test?.discountPrice!;
          const discountSpecialPrice = test?.discountSpecialPrice!;

          const discount = getDiscountPercentage(
            !!itemPackageMrp && itemPackageMrp > price ? itemPackageMrp : price,
            specialPrice
          );
          const circleDiscount = getDiscountPercentage(
            !!itemPackageMrp && itemPackageMrp > circlePrice ? itemPackageMrp : circlePrice,
            circleSpecialPrice
          );
          const specialDiscount = getDiscountPercentage(
            !!itemPackageMrp && itemPackageMrp > discountPrice ? itemPackageMrp : discountPrice,
            discountSpecialPrice
          );

          const promoteCircle = discount < circleDiscount && specialDiscount < circleDiscount;
          const promoteDiscount = promoteCircle ? false : discount < specialDiscount;

          const mrpToDisplay = calculateMrpToDisplay(
            promoteCircle,
            promoteDiscount,
            itemPackageMrp,
            price,
            circlePrice,
            discountPrice
          );

          const medicineCardContainerStyle = [
            { marginBottom: 8, marginHorizontal: 20 },
            index == 0 ? { marginTop: 20 } : {},
            index == array.length - 1 ? { marginBottom: 20 } : {},
          ];

          const sellingPrice = !promoteCircle
            ? promoteDiscount && discountSpecialPrice != discountPrice
              ? discountSpecialPrice!
              : specialPrice != price
              ? specialPrice!
              : undefined
            : undefined;
          const reportGenItem = reportGenDetails?.find((_item: any) => _item?.itemId === test?.id);

          return (
            <TestItemCard
              isComingFrom={AppRoutes.TestsCart}
              isCareSubscribed={isDiagnosticCircleSubscription}
              containerStyle={medicineCardContainerStyle}
              showCartInclusions={showInclusions}
              key={test?.id}
              testId={test?.id}
              reportGenItem={reportGenItem}
              onPress={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Navigate to medicine details scene');
                fetchPackageDetails(
                  test.id,
                  (product) => {
                    props.navigation.navigate(AppRoutes.TestDetails, {
                      comingFrom: AppRoutes.TestsCart,
                      testDetails: {
                        ItemID: test?.id,
                        ItemName: test?.name,
                        Rate: price,
                        specialPrice: specialPrice! || price,
                        circleRate: circlePrice,
                        circleSpecialPrice: circleSpecialPrice,
                        discountPrice: discountPrice,
                        discountSpecialPrice: discountSpecialPrice,
                        FromAgeInDays: product?.fromAgeInDays!,
                        ToAgeInDays: product?.toAgeInDays!,
                        Gender: product?.gender,
                        collectionType: test?.collectionMethod,
                        preparation: product?.testPreparationData,
                        testDescription: product?.testDescription,
                        source: 'Cart page',
                        type: product?.itemType,
                        packageMrp: itemPackageMrp,
                        mrpToDisplay: mrpToDisplay,
                      } as TestPackageForDetails,
                    });
                  },
                  'onPress'
                );
              }}
              testName={test?.name}
              price={price}
              mrpToDisplay={Number(mrpToDisplay!)}
              specialPrice={sellingPrice}
              packageMrp={itemPackageMrp}
              circlePrice={promoteCircle ? circleSpecialPrice! : undefined}
              isSpecialDiscount={promoteDiscount}
              discount={
                promoteCircle && isDiagnosticCircleSubscription
                  ? circleDiscount!
                  : promoteDiscount
                  ? specialDiscount!
                  : discount!
              }
              onPressRemove={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Remove item from cart');
                if (cartItems?.length == 0) {
                  setDeliveryAddressId?.('');
                }
                onRemoveCartItem(test);
              }}
              isCardExpanded={true}
              packOfCount={reportGenItem?.itemParameterCount}
              duplicateArray={duplicateNameArray}
            />
          );
        })}
      </View>
    );
  };

  const checkSlotSelection = (
    areaObject: areaObject | DiagnosticArea | any,
    changedDate?: Date,
    comingFrom?: string,
    _itemIds?: number[]
  ) => {
    const isCovidItem = cartItemsWithId?.map((item) =>
      AppConfig.Configuration.Covid_Items.includes(item)
    );
    const isCartHasCovidItem = isCovidItem?.find((item) => item === true);
    const maxDaysToShow = !!isCartHasCovidItem
      ? AppConfig.Configuration.Covid_Max_Slot_Days
      : AppConfig.Configuration.Non_Covid_Max_Slot_Days;

    let dateToCheck = !!changedDate && comingFrom != '' ? changedDate : new Date();
    const selectedArea = isModifyFlow ? modifiedOrder?.areaId : Number((areaObject as any).key!);
    setLoading?.(true);

    const getAddressObject = createAddressObject(
      isModifyFlow ? modifiedOrder?.patientAddressObj : selectedAddr
    );

    client
      .query<getDiagnosticSlotsCustomized, getDiagnosticSlotsCustomizedVariables>({
        query: GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
        context: {
          sourceHeaders,
        },
        fetchPolicy: 'no-cache',
        variables: {
          selectedDate: moment(dateToCheck).format('YYYY-MM-DD'),
          areaID: selectedArea,
          itemIds: _itemIds || cartItemsWithId,
          patientAddressObj: getAddressObject,
        },
      })
      .then(({ data }) => {
        const diagnosticSlots = g(data, 'getDiagnosticSlotsCustomized', 'slots') || [];

        const diagnosticSlotsToShow = diagnosticSlots;

        const slotsArray: TestSlot[] = [];
        diagnosticSlotsToShow?.forEach((item) => {
          slotsArray.push({
            employeeCode: 'apollo_employee_code',
            employeeName: 'apollo_employee_name',
            slotInfo: {
              endTime: item?.Timeslot!,
              status: 'empty',
              startTime: item?.Timeslot!,
              slot: item?.TimeslotID,
            },
            date: dateToCheck,
            diagnosticBranchCode: 'apollo_route',
          } as TestSlot);
        });

        // if slot is empty then refetch it for next date
        let lastDate = moment()
          .add(maxDaysToShow, 'day')
          .toDate();
        const hasReachedEnd = moment(dateToCheck).isSameOrAfter(moment(lastDate), 'date');
        if (!hasReachedEnd && slotsArray?.length == 0) {
          setTodaySlotNotAvailable(true);
          let changedDate = moment(dateToCheck) //date
            .add(1, 'day')
            .toDate();
          setDate(changedDate);
          checkSlotSelection(areaObject, changedDate, undefined, _itemIds || cartItemsWithId);
        } else {
          setSlots(slotsArray);
          todaySlotNotAvailable && setTodaySlotNotAvailable(false);
          const slotDetails = slotsArray?.[0];
          slotsArray?.length && setselectedTimeSlot(slotDetails);

          setDiagnosticSlot?.({
            slotStartTime: slotDetails?.slotInfo?.startTime!,
            slotEndTime: slotDetails?.slotInfo?.endTime!,
            date: dateToCheck?.getTime(), //date
            employeeSlotId: slotDetails?.slotInfo?.slot!,
            diagnosticBranchCode: slotDetails?.diagnosticBranchCode,
            diagnosticEmployeeCode: slotDetails?.employeeCode,
            city: selectedAddr ? selectedAddr?.city! : '', // not using city from this in order place API
          });
          setWebEnageEventForAppointmentTimeSlot('Automatic', slotDetails, areaObject);
          setCartPagePopulated?.(true);
          setLoading?.(false);
        }

        comingFrom == 'errorState' ? setDisplaySchedule(true) : null; //show slot popup
        setDeliveryAddressId?.(selectedAddr?.id!); //if not setting, then new address added is not selected
        setPinCode?.(selectedAddr?.zipcode!);
      })
      .catch((e) => {
        aphConsole.log({ e });
        CommonBugFender('TestsCart_checkSlotSelection', e);
        setDiagnosticSlot && setDiagnosticSlot(null);
        setselectedTimeSlot(undefined);
        const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';
        setLoading?.(false);
        if (noHubSlots) {
          setDeliveryAddressId?.(selectedAddr?.id!);
          setPinCode?.(selectedAddr?.zipcode!);
          showAphAlert?.({
            title: string.common.uhOh,
            description: string.diagnostics.noSlotAvailable.replace(
              '{{date}}',
              moment(dateToCheck).format('DD MMM, YYYY')
            ),
            onPressOk: () => {
              setDisplaySchedule(true);
              hideAphAlert && hideAphAlert();
            },
          });
        } else {
          CommonBugFender('TestCart_checkSlotSelection_NotHubSlotError', e);
          setDeliveryAddressId?.('');
          setDiagnosticAreas?.([]);
          setAreaSelected?.({});
          setCartPagePopulated?.(false);
          setselectedTimeSlot(undefined);
          showAphAlert?.({
            title: string.common.uhOh,
            description: string.diagnostics.bookingOrderFailedMessage,
          });
        }
      });
  };

  const _navigateToEditAddress = (dataname: string, address: any, comingFrom: string) => {
    props.navigation.push(AppRoutes.AddAddressNew, {
      KeyName: dataname,
      addressDetails: address,
      ComingFrom: comingFrom,
      source: 'Diagnostics Cart' as AddressSource,
    });
  };

  const AddressSelectedEvent = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    const firebaseAttributes: FirebaseEvents[FirebaseEventName.DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS] = {
      DeliveryAddress: formatAddress(address),
      Pincode: address?.zipcode || '',
      LOB: 'Diagnostics',
    };
    postAppsFlyerEvent(
      AppsFlyerEventName.DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS,
      firebaseAttributes
    );
    postFirebaseEvent(
      FirebaseEventName.DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS,
      firebaseAttributes
    );
  };

  const renderCouponView = () => {
    const isCouponEnable =
      selectedTimeSlot?.slotInfo?.slot! && areaSelected && deliveryAddressId != '';
    return (
      <View pointerEvents={isCouponEnable ? 'auto' : 'none'}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 4,
            flexDirection: 'row',
            height: 56,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => props.navigation.navigate(AppRoutes.ApplyCouponScene, { isDiag: true })}
        >
          <CouponIcon style={{ opacity: isCouponEnable ? 1 : 0.5 }} />
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.SHERPA_BLUE,
              lineHeight: 24,
              paddingLeft: 16,
              opacity: isCouponEnable ? 1 : 0.5,
            }}
          >
            {!coupon ? 'Apply Coupon' : `${coupon.code} Applied`}
          </Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <ArrowRight style={{ opacity: isCouponEnable ? 1 : 0.5 }} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPreviouslyAddedItems = () => {
    const previousAddedItemsCount =
      isModifyFlow && modifiedOrder?.diagnosticOrderLineItems?.length > 10
        ? `${modifiedOrder?.diagnosticOrderLineItems?.length}`
        : `0${modifiedOrder?.diagnosticOrderLineItems?.length}`;
    const remainingItems = modifiedOrder?.diagnosticOrderLineItems?.length - 1;
    const firstItem = modifiedOrder?.diagnosticOrderLineItems?.[0]?.itemName;
    const orderLineItems = modifiedOrder?.diagnosticOrderLineItems! || [];
    const subTotalArray = modifiedOrder?.diagnosticOrderLineItems?.map((item: orderListLineItems) =>
      Number(item?.price)
    );
    const previousSubTotal = subTotalArray?.reduce(
      (preVal: number, curVal: number) => preVal + curVal,
      0
    );
    const previousCollectionCharges = modifiedOrder?.collectionCharges;
    const previousTotalCharges = modifiedOrder?.totalPrice;
    return (
      <View>
        {renderLabel('PREVIOUSLY ADDED TO CART', previousAddedItemsCount)}
        <View
          style={[
            styles.totalChargesContainer,
            styles.previousItemContainer,
            { paddingBottom: showAllPreviousItems ? 16 : 0 },
          ]}
        >
          <TouchableOpacity
            onPress={() => setShowAllPreviousItems(!showAllPreviousItems)}
            style={styles.previousContainerTouch}
          >
            <View style={styles.previousItemInnerContainer}>
              <Text style={styles.previousItemHeading}>
                {nameFormater(firstItem?.slice(0, isSmallDevice ? 29 : 32), 'title')}{' '}
                {remainingItems > 0 && `+ ${remainingItems} more`}
              </Text>
              <View style={styles.arrowTouch}>
                {showAllPreviousItems ? (
                  <Up style={styles.arrowIconStyle} />
                ) : (
                  <Down style={styles.arrowIconStyle} />
                )}
              </View>
            </View>
          </TouchableOpacity>
          {showAllPreviousItems ? (
            <>
              <View style={[styles.rowSpaceBetweenStyle, { marginBottom: 0 }]}>
                <Text style={styles.itemHeading}> ITEM NAME</Text>
                <Text style={styles.itemHeading}> PRICE</Text>
              </View>
              {orderLineItems?.map((item: orderListLineItems) => {
                return (
                  <View style={styles.commonTax}>
                    <View style={{ width: '65%' }}>
                      <Text style={styles.commonText}>
                        {nameFormater(
                          !!item?.itemName ? item?.itemName! : item?.diagnostics?.itemName!,
                          'title'
                        )}
                      </Text>
                      {!!item?.itemObj?.inclusions && (
                        <Text style={styles.inclusionsText}>
                          Inclusions : {item?.itemObj?.inclusions?.length}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={[styles.commonText, { lineHeight: 20 }]}>
                        {string.common.Rs}
                        {convertNumberToDecimal(g(item, 'price') || null)}
                      </Text>
                    </View>
                  </View>
                );
              })}
              <Spearator style={{ marginTop: 12, marginBottom: 12 }} />
              {renderPrices('Subtotal', previousSubTotal)}
              {renderPrices('Collection and hygiene charges', previousCollectionCharges)}
              {renderPrices('Total', previousTotalCharges, true)}
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const renderPrices = (title: string, price: string | number, customStyle?: boolean) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ width: '65%' }}>
          <Text
            style={[
              styles.commonText,
              customStyle ? styles.pricesBoldText : styles.pricesNormalText,
            ]}
          >
            {title}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text
            style={[
              styles.commonText,
              {
                ...theme.viewStyles.text(
                  customStyle ? 'B' : 'M',
                  customStyle ? 14 : 12,
                  SHERPA_BLUE,
                  1,
                  customStyle ? 20 : 18
                ),
              },
            ]}
          >
            {string.common.Rs}
            {convertNumberToDecimal(price)}
          </Text>
        </View>
      </View>
    );
  };

  const getHcCharges = (): number => {
    if (cartItems?.length == 0) {
      return 0.0;
    } else if (hcCharges === 0 && isModifyFlow && modifiedOrder?.collectionCharges > 0) {
      return modifiedOrder?.collectionCharges;
    } else if (hcCharges > 0 && isModifyFlow && modifiedOrder?.collectionCharges > 0) {
      return 0.0;
    } else {
      return hcCharges;
    }
  };

  const renderTotalCharges = () => {
    const anyCartSaving = isDiagnosticCircleSubscription ? cartSaving + circleSaving : cartSaving;

    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        {/* {renderCouponView()} */}
        {isDiagnosticCircleSubscription && circleSaving > 0 ? renderCircleMemberBanner() : null}
        <View
          style={[
            styles.totalChargesContainer,
            { marginTop: isDiagnosticCircleSubscription && circleSaving > 0 ? 25 : 0 },
          ]}
        >
          <View style={styles.rowSpaceBetweenStyle}>
            <Text style={styles.blueTextStyle}>Subtotal</Text>
            <Text style={styles.blueTextStyle}>
              {string.common.Rs} {totalPriceExcludingAnyDiscounts.toFixed(2)}
            </Text>
          </View>
          {couponDiscount > 0 && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.blueTextStyle}>Coupon Discount</Text>
              <Text style={styles.blueTextStyle}>
                - {string.common.Rs} {couponDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          {
            isHcApiCalled ?  <View style={styles.rowSpaceBetweenStyle}>
              <Text style={[styles.blueTextStyle, { width: '60%' }]}>Collection and hygiene charges</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={[
                    styles.blueTextStyle,
                    {
                      textDecorationLine:
                        isModifyFlow &&
                        modifiedOrder?.collectionCharges > 0 &&
                        hcCharges === 0 &&
                        cartItems?.length > 0
                          ? 'line-through'
                          : 'none',
                    },
                  ]}
                >
                  {string.common.Rs} {getHcCharges()?.toFixed(2)}
                </Text>
                {/* {!!existingOrderDetails &&
                existingOrderDetails?.collectionCharges > 0 &&
                modifyOrderHcCharges === 0 ? (
                  <Text style={styles.strikedThroughHC}>
                    ({string.common.Rs} {modifyHcCharges?.toFixed(2)})
                  </Text>
                ) : null} */}
              </View>
            </View>
            : null}
          {normalSaving > 0 && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                Cart Saving
              </Text>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                - {string.common.Rs} {normalSaving.toFixed(2)}
              </Text>
            </View>
          )}
          {isDiagnosticCircleSubscription && circleSaving > 0 && (
            <View style={[styles.rowSpaceBetweenStyle]}>
              <View style={{ flexDirection: 'row', flex: 0.8 }}>
                <CircleLogo
                  style={{
                    resizeMode: 'contain',
                    height: 25,
                    width: 37,
                    alignSelf: 'center',
                    marginRight: 5,
                  }}
                />
                <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                  Membership discount
                </Text>
              </View>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                - {string.common.Rs} {circleSaving.toFixed(2)}
              </Text>
            </View>
          )}
          {discountSaving > 0 && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                {string.diagnostics.specialDiscountText}
              </Text>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                - {string.common.Rs} {discountSaving.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.separatorStyle, { marginTop: 16, marginBottom: 7 }]} />
          <View style={styles.rowSpaceBetweenStyle}>
            <Text style={styles.blueTextStyle}>To Pay </Text>
            <Text style={[styles.blueTextStyle, { ...theme.fonts.IBMPlexSansBold }]}>
              {string.common.Rs} {grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>
        {anyCartSaving > 0 && renderCartSavingBanner()}
        {/* {isDiagnosticCircleSubscription ? null : circleSaving > 0 && renderSavedBanner()} */}
      </View>
    );
  };

  const renderCartSavingBanner = () => {
    return dashedBanner(
      'You ',
      `saved ${string.common.Rs}${convertNumberToDecimal(
        isDiagnosticCircleSubscription ? cartSaving + circleSaving : cartSaving
      )}`,
      'on this order',
      'none'
    );
  };

  const renderCircleMemberBanner = () => {
    return dashedBanner('benefits APPLIED!', '', '', 'left');
  };

  const renderSavedBanner = () => {
    return dashedBanner(
      'You could have',
      `saved extra ${string.common.Rs}${convertNumberToDecimal(circleSaving)}`,
      'with',
      'right'
    );
  };

  const dashedBanner = (
    leftText: string,
    greenText: string,
    rightText: string,
    imagePosition: string
  ) => {
    return (
      <View
        style={[
          styles.dashedBannerViewStyle,
          { justifyContent: imagePosition == 'left' ? 'flex-start' : 'center' },
        ]}
      >
        {imagePosition == 'left' && (
          <View style={{ flexDirection: 'row' }}>
            <CheckedIcon
              style={{
                justifyContent: 'flex-end',
                alignSelf: 'center',
                resizeMode: 'contain',
              }}
            />
            <CircleLogo
              style={{
                justifyContent: 'flex-end',
                height: 32,
                width: 60,
                resizeMode: 'contain',
                marginRight: -12,
              }}
            />
          </View>
        )}
        <Text
          style={{
            color: theme.colors.LIGHT_BLUE,
            ...theme.fonts.IBMPlexSansMedium(imagePosition == 'left' ? 14 : 12),
            lineHeight: 16,
            alignSelf: 'center',
            marginLeft: imagePosition == 'left' ? 10 : 0,
            fontWeight: imagePosition == 'left' ? 'bold' : 'normal',
          }}
        >
          {leftText}
          <Text style={{ color: theme.colors.APP_GREEN, fontWeight: 'bold' }}>
            {' '}
            {greenText}
          </Text>{' '}
          {rightText}
        </Text>
        {imagePosition == 'right' && (
          <CircleLogo
            style={{ justifyContent: 'flex-end', height: 20, width: 36, resizeMode: 'contain' }}
          />
        )}
      </View>
    );
  };

  function isCartPricesUpdated() {
    if (cartItems?.length) {
      let filterNotUpdatedItems = cartItems?.filter((item) => Number(item?.price) === 0);
      if (filterNotUpdatedItems?.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  }

  const disableProceedToPay = !(isModifyFlow
    ? cartItems?.length > 0 &&
      isCartPricesUpdated() &&
      modifiedOrder?.slotId &&
      modifiedOrder?.areaId &&
      isHcApiCalled
    : cartItems?.length > 0 &&
      forPatientId &&
      isHcApiCalled &&
      !!(
        selectedPatient &&
        deliveryAddressId &&
        selectedTimeSlot &&
        selectedTimeSlot?.date &&
        selectedTimeSlot?.slotInfo?.startTime
      ) &&
      (uploadPrescriptionRequired
        ? physicalPrescriptions.length > 0 || ePrescriptions.length > 0
        : true));

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

  const physicalPrescriptionUpload = () => {
    const prescriptions = physicalPrescriptions;
    setLoading!(true);
    const unUploadedPres = prescriptions.filter((item) => !item.uploadedUrl);
    if (unUploadedPres.length > 0) {
      multiplePhysicalPrescriptionUpload(unUploadedPres)
        .then((data) => {
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
        })
        .catch((e) => {
          CommonBugFender('TestsCart_physicalPrescriptionUpload', e);
          aphConsole.log({ e });
          setLoading?.(false);
          showAphAlert?.({
            title: string.common.uhOh,
            description: 'Error occurred while uploading prescriptions.',
          });
        });
    } else {
      setisPhysicalUploadComplete(true);
    }
  };

  const ePrescriptionUpload = () => {
    setLoading!(true);
    setisEPrescriptionUploadComplete(true);
  };

  const onFinishUpload = () => {
    if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length == 0 &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      bookDiagnosticOrder();
    } else if (
      physicalPrescriptions.length == 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete
    ) {
      setLoading!(false);
      setisEPrescriptionUploadComplete(false);
      bookDiagnosticOrder();
    } else if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      setisEPrescriptionUploadComplete(false);
      bookDiagnosticOrder();
    }
  };

  const getDiagnosticsAvailability = (
    cityIdForAddress: number,
    cartItems?: DiagnosticsCartItem[],
    duplicateItem?: any,
    comingFrom?: string
  ) => {
    const itemIds = comingFrom ? duplicateItem : cartItems?.map((item) => parseInt(item?.id));
    return client.query<
      findDiagnosticsByItemIDsAndCityID,
      findDiagnosticsByItemIDsAndCityIDVariables
    >({
      query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
      context: {
        sourceHeaders,
      },
      variables: { cityID: cityIdForAddress, itemIDs: itemIds! },
      fetchPolicy: 'no-cache',
    });
  };

  const bookDiagnosticOrder = async () => {
    saveHomeCollectionOrder();
  };

  function saveModifiedOrder() {
    // const calHcChargers = modifiedOrder?.collectionCharges === 0 ? hcCharges :  0.0;
    //since we need to pass the overall collection charges applied.
    const calHcChargers =
      modifiedOrder?.collectionCharges === 0
        ? hcCharges
        : modifiedOrder?.collectionCharges + modifyHcCharges;

    const slotTimings = modifiedOrder?.slotDateTimeInUTC;
    const slotStartTime = modifiedOrder?.slotDateTimeInUTC;
    const allItems = cartItems?.find(
      (item) =>
        item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL ||
        item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
    );
    setLoading?.(true);
    const modifyBookingInput: saveModifyDiagnosticOrderInput = {
      orderId: modifiedOrder?.id,
      collectionCharges: calHcChargers,
      bookingSource: DiagnosticsBookingSource.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
      items: createItemPrice()?.itemPricingObject,
      userSubscriptionId: circleSubscriptionId,
      subscriptionInclusionId: null,
      amountToPay: grandTotal, //total amount payed
    };
    saveModifyOrder?.(modifyBookingInput)
      .then((data) => {
        const getModifyResponse = data?.data?.saveModifyDiagnosticOrder;
        if (!getModifyResponse?.status) {
          apiHandleErrorFunction(modifyBookingInput, getModifyResponse, 'modifyOrder');
        } else {
          callCreateInternalOrder(
            getModifyResponse?.orderId!,
            getModifyResponse?.displayId!,
            slotTimings,
            allItems,
            slotStartTime!,
            'modifyOrder'
          );
        }
      })
      .catch((error) => {
        aphConsole.log({ error });
        CommonBugFender('TestsCart__saveModifiedOrder', error);
        setLoading?.(false);
        showAphAlert?.({
          unDismissable: true,
          title: `Hi ${g(currentPatient, 'firstName') || ''}!`, //existing order patient
          description: string.diagnostics.bookingOrderFailedMessage,
        });
      });
  }

  async function processModifiyCODOrder(
    orderId: string,
    amount: number,
    eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED],
    orderInfo: any
  ) {
    PaymentInitiated(amount, 'Diagnostic', 'Cash');
    try {
      const response = await processDiagnosticsCODOrder(client, orderId, amount);
      const { data } = response;
      data?.processDiagnosticHCOrder?.status
        ? _navigatetoOrderStatus(true, 'success', eventAttributes, orderInfo)
        : renderAlert(string.common.tryAgainLater);
    } catch (e) {
      setLoading?.(false);
      renderAlert(string.common.tryAgainLater);
    }
  }

  function _navigatetoOrderStatus(
    isCOD: boolean,
    paymentStatus: string,
    eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED],
    orderInfo: any
  ) {
    setLoading?.(false);
    props.navigation.navigate(AppRoutes.OrderStatus, {
      isModify: isModifyFlow ? modifiedOrder : null,
      orderDetails: orderInfo,
      isCOD: isCOD,
      eventAttributes,
      paymentStatus: paymentStatus,
    });
  }

  const saveHomeCollectionOrder = () => {
    //for circle members if unique id is blank, show error
    if (
      isDiagnosticCircleSubscription &&
      (validateCouponUniqueId == '' || validateCouponUniqueId == null)
    ) {
      renderAlert(string.common.tryAgainLater);
      setLoading?.(false);
    } else if (grandTotal == null || grandTotal == undefined) {
      //do not call the api, if by any chance grandTotal is not a number
      renderAlert(string.common.tryAgainLater);
      setLoading?.(false);
    } else {
      const { slotStartTime, slotEndTime, employeeSlotId, date } = diagnosticSlot || {};
      const slotTimings = (slotStartTime && slotEndTime
        ? `${slotStartTime}-${slotEndTime}`
        : ''
      ).replace(' ', '');
      const formattedDate = moment(date).format('YYYY-MM-DD');

      const dateTimeInUTC = moment(formattedDate + ' ' + slotStartTime).toISOString();
      const allItems = cartItems?.find(
        (item) =>
          item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL ||
          item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
      );
      const bookingOrderInfo: SaveBookHomeCollectionOrderInput = {
        uniqueID: validateCouponUniqueId,
        patientId: (currentPatient && currentPatient.id) || '',
        patientAddressId: deliveryAddressId!,
        slotDateTimeInUTC: dateTimeInUTC,
        totalPrice: grandTotal,
        prescriptionUrl: [
          ...physicalPrescriptions.map((item) => item.uploadedUrl),
          ...ePrescriptions.map((item) => item.uploadedUrl),
        ].join(','),
        diagnosticDate: formattedDate,
        bookingSource: DiagnosticsBookingSource.MOBILE,
        deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
        items: createItemPrice()?.itemPricingObject,
        slotId: employeeSlotId?.toString() || '0',
        areaId: (areaSelected || ({} as any)).key!,
        collectionCharges: hcCharges,
        totalPriceExcludingDiscounts: totalPriceExcludingAnyDiscounts + hcCharges,
        subscriptionInclusionId: null,
        userSubscriptionId: circleSubscriptionId,
      };
      saveHomeCollectionBookingOrder(bookingOrderInfo)
        .then(async ({ data }) => {
          aphConsole.log({ data });
          const getSaveHomeCollectionResponse = data?.saveDiagnosticBookHCOrder;
          // in case duplicate test, price mismatch, address mismatch, slot issue
          if (!getSaveHomeCollectionResponse?.status) {
            apiHandleErrorFunction(bookingOrderInfo, getSaveHomeCollectionResponse, 'saveOrder');
          } else {
            callCreateInternalOrder(
              getSaveHomeCollectionResponse?.orderId!,
              getSaveHomeCollectionResponse?.displayId!,
              slotTimings,
              allItems,
              slotStartTime!,
              'saveOrder'
            );
          }
        })
        .catch((error) => {
          aphConsole.log({ error });
          CommonBugFender('TestsCart_saveHomeCollectionOrder', error);
          setLoading?.(false);
          showAphAlert?.({
            unDismissable: true,
            title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
            description: string.diagnostics.bookingOrderFailedMessage,
          });
        });
    }
  };

  function apiHandleErrorFunction(input: any, data: any, source: string) {
    let message = data?.errorMessageToDisplay || string.diagnostics.bookingOrderFailedMessage;
    //itemIds will only come in case of duplicate
    let itemIds = data?.attributes?.itemids;
    if (itemIds?.length! > 0) {
      showAphAlert?.({
        unDismissable: true,
        title: string.common.uhOh,
        description: message,
        onPressOk: () => {
          removeDuplicateCartItems(itemIds!, input?.items);
        },
      });
    } else {
      if (
        slotBookedArray.some((item) => message?.includes(item)) ||
        message.includes('slot has been booked')
      ) {
        showAphAlert?.({
          title: string.common.uhOh,
          description: message,
          onPressOutside: () => {
            checkSlotSelection(areaSelected, '', 'errorState');
            hideAphAlert?.();
          },
          onPressOk: () => {
            checkSlotSelection(areaSelected, '', 'errorState');
            hideAphAlert?.();
          },
        });
      } else {
        renderAlert(message);
      }
    }
  }

  async function callCreateInternalOrder(
    getOrderId: string,
    getDisplayId: string,
    slotTimings: string,
    items: any,
    slotStartTime: string,
    source: string
  ) {
    try {
      setLoading?.(true);
      const orderId = getOrderId! || '';
      const displayId = getDisplayId! || '';
      const getPatientId =
        source === 'modifyOrder' && isModifyFlow ? modifiedOrder?.patientId : currentPatient?.id;
      const orders: OrderVerticals = {
        diagnostics: [{ order_id: orderId, amount: grandTotal, patient_id: getPatientId }],
      };
      const orderInput: OrderCreate = {
        orders: orders,
        total_amount: grandTotal,
        customer_id: currentPatient?.primaryPatientId || getPatientId,
      };
      const response = await createOrderInternal(orderInput);
      if (response?.data?.createOrderInternal?.success) {
        const orderInfo = {
          orderId: orderId,
          displayId: displayId,
          diagnosticDate: date!,
          slotTime: slotTimings!,
          cartSaving: cartSaving,
          circleSaving: circleSaving,
          cartHasAll: items != undefined ? true : false,
          amount: grandTotal, //actual amount to be payed by customer (topay)
        };
        const eventAttributes = createCheckOutEventAttributes(orderId, slotStartTime);
        setauthToken?.('');
        if (
          source === 'modifyOrder' &&
          modifiedOrder?.paymentType !== DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT
        ) {
          //call the process wali api & success page
          processModifiyCODOrder(orderId, grandTotal, eventAttributes, orderInfo);
        } else {
          setLoading?.(false);
          props.navigation.navigate(AppRoutes.PaymentMethods, {
            paymentId: response?.data?.createOrderInternal?.payment_order_id!,
            amount: grandTotal,
            orderId: orderId,
            orderDetails: orderInfo,
            eventAttributes,
            businessLine: 'diagnostics',
          });
        }
      }
    } catch (error) {
      CommonBugFender('TestCart_callInternalOrder', error);
      setLoading?.(false);
      aphConsole.log({ error });
      showAphAlert?.({
        unDismissable: true,
        title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
        description: string.diagnostics.bookingOrderFailedMessage,
      });
    }
  }

  function createCheckOutEventAttributes(orderId: string, slotStartTime?: string) {
    const attributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED] = {
      "Circle user": isDiagnosticCircleSubscription ? 'Yes' : 'No',
      'Order id': orderId,
      Pincode: parseInt(selectedAddr?.zipcode!),
      'Patient UHID': g(currentPatient, 'id'),
      'Total items in order': cartItems?.length,
      'Order amount': grandTotal,
      'Appointment Date': isModifyFlow
        ? moment(modifiedOrder?.slotDateTimeInUTC).format('DD/MM/YYYY')
        : moment(orderDetails?.diagnosticDate!).format('DD/MM/YYYY'),
      'Appointment time': isModifyFlow
        ? moment(modifiedOrder?.slotDateTimeInUTC).format('hh:mm')
        : slotStartTime!,
      'Item ids': cartItemsWithId,
    };
    return attributes;
  }

  const removeDisabledCartItems = (disabledCartItemIds: string[]) => {
    hideAphAlert!();
    setCartItems!(
      cartItems?.filter((cItem) => !disabledCartItemIds?.find((dItem) => dItem == cItem?.id))
    );
  };

  //change this for modified orders
  function createItemPrice() {
    modifyPricesForItemArray =
      isModifyFlow &&
      modifiedOrder?.diagnosticOrderLineItems?.map(
        (item: orderListLineItems) =>
          ({
            itemId: Number(item?.itemId),
            price: item?.price,
            quantity: 1,
            groupPlan: item?.groupPlan,
          } as DiagnosticLineItem)
      );

    pricesForItemArray = cartItems?.map(
      (item, index) =>
        ({
          itemId: Number(item?.id),
          price:
            isDiagnosticCircleSubscription && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
              ? Number(item?.circleSpecialPrice)
              : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
              ? Number(item?.discountSpecialPrice)
              : Number(item?.specialPrice) || Number(item?.price),
          quantity: 1,
          groupPlan: isDiagnosticCircleSubscription
            ? item?.groupPlan!
            : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
            ? item?.groupPlan
            : DIAGNOSTIC_GROUP_PLAN.ALL,
          preTestingRequirement:
            !!reportGenDetails && reportGenDetails?.[index]?.itemPrepration
              ? reportGenDetails?.[index]?.itemPrepration
              : null,
          reportGenerationTime:
            !!reportGenDetails && reportGenDetails?.[index]?.itemReportTat
              ? reportGenDetails?.[index]?.itemReportTat
              : null,
        } as DiagnosticLineItem)
    );
    const itemPricingObject = isModifyFlow
      ? [modifyPricesForItemArray, pricesForItemArray].flat(1)
      : pricesForItemArray;
    return {
      itemPricingObject,
      pricesForItemArray,
    };
  }

  const onPressProceedToPay = () => {
    setLoading?.(true);
    if (isModifyFlow) {
      postwebEngageProceedToPayEventForModify();
      saveModifiedOrder();
    } else {
      postwebEngageProceedToPayEvent();
      proceedForBooking();
    }
  };

  function removeDuplicateCartItems(itemIds: string, pricesOfEach: any) {
    //can be used only when itdose starts returning all id
    const getItemIds = itemIds?.split(',');
    const allInclusions = cartItems?.map((item) => item?.inclusions);
    const getPricesForItem = createItemPrice()?.itemPricingObject;
    const getCartItemPrices = createItemPrice()?.pricesForItemArray;

    const mergedInclusions = allInclusions?.flat(1); //from array level to single array
    const duplicateItems_1 = mergedInclusions?.filter(
      (e: any, i: any, a: any) => a.indexOf(e) !== i
    );

    const duplicateItems = [...new Set(duplicateItems_1)];
    hideAphAlert?.();
    setLoading?.(false);
    if (duplicateItems?.length) {
      checkDuplicateItems_Level1(getPricesForItem, duplicateItems, getItemIds, getCartItemPrices);
    } else {
      checkDuplicateItems_Level2(getPricesForItem, getItemIds, getCartItemPrices);
    }
  }

  function checkDuplicateItems_Level1(
    getPricesForItem: any,
    duplicateItems: any,
    itemIdFromBackend: any,
    getCartItemPrices: any
  ) {
    //search for duplicate items in cart. (single tests added)
    let duplicateItemIds = cartItems?.filter((item) => duplicateItems?.includes(Number(item?.id)));

    let itemIdRemove = duplicateItemIds?.map((item) => Number(item?.id));

    //rest of the duplicate items which are not directly present in the cart
    const remainingDuplicateItems = duplicateItems?.filter(function(item: any) {
      return itemIdRemove?.indexOf(item) < 0;
    });

    //search for remaining duplicate items in cart's package inclusions
    let itemIdWithPackageInclusions = cartItems?.filter(({ inclusions }) =>
      inclusions?.some((num) => remainingDuplicateItems?.includes(num))
    );
    //get only itemId
    let packageInclusionItemId = itemIdWithPackageInclusions?.map((item) => Number(item?.id));

    //for the remaining packageItems, extract the prices
    let pricesForPackages = [] as any;

    getPricesForItem?.forEach((pricesItem: any) => {
      packageInclusionItemId?.forEach((packageId: number) => {
        if (Number(pricesItem?.itemId) == Number(packageId)) {
          pricesForPackages.push(pricesItem);
        }
      });
    });

    //sort with accordance with price
    let sortedPricesForPackage = pricesForPackages?.sort((a: any, b: any) => b?.price - a?.price);
    let remainingPackageDuplicateItems = sortedPricesForPackage?.slice(
      1,
      sortedPricesForPackage?.length
    );
    let remainingPackageDuplicateItemId = remainingPackageDuplicateItems?.map((item: any) =>
      Number(item?.itemId)
    );
    let finalRemovalId = [...itemIdRemove, remainingPackageDuplicateItemId]?.flat(1);

    setLoading?.(true);
    getDiagnosticsAvailability(Number(addressCityId), cartItems, finalRemovalId, 'proceedToPay')
      .then(({ data }) => {
        const diagnosticItems = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
        const formattedDuplicateTest = diagnosticItems?.map((item) =>
          !!item?.itemName ? nameFormater(item?.itemName, 'default') : item?.itemName
        );
        const duplicateTests = formattedDuplicateTest?.join(', ');
        //remaining itemId's
        const updatedCartItems = cartItems?.filter(function(items: any) {
          return finalRemovalId?.indexOf(Number(items?.id)) < 0;
        });

        //now on the updated cart item, find the duplicate items => higher price items
        const higherPricesItems = updatedCartItems?.filter(({ inclusions }) =>
          inclusions?.some((num) => finalRemovalId?.includes(num))
        );

        //if not found at inclusion level, then show whatever is coming from api.
        if (higherPricesItems?.length == 0) {
          setLoading?.(false);
          checkDuplicateItems_Level2(getPricesForItem, itemIdFromBackend, getCartItemPrices);
        } else {
          //there can be case, that they are found in the inclusion level.
          const formattedHigherPriceItemName = higherPricesItems?.map(
            (item) => !!item?.name && nameFormater(item?.name, 'default')
          );
          const higherPricesName = formattedHigherPriceItemName?.join(', ');

          //clear cart
          onChangeCartItems(updatedCartItems, duplicateTests, finalRemovalId);

          //show inclusions
          let array = [] as any;
          updatedCartItems?.forEach((item) =>
            diagnosticItems?.forEach((dItem) => {
              if (item?.inclusions?.includes(Number(dItem?.itemId))) {
                array.push({
                  id: item?.id,
                  removalId: dItem?.itemId,
                  removalName: dItem?.itemName,
                });
              }
            })
          );

          setShowInclusions(true);
          let arrayToSet = [...duplicateNameArray, array].flat(1);
          setDuplicateNameArray(arrayToSet);

          renderDuplicateMessage(duplicateTests, higherPricesName);
        }
      })
      .catch((e) => {
        //if api fails then also show the name... & remove..
        CommonBugFender('TestsCart_getDiagnosticsAvailability', e);
        setLoading?.(false);
        errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
      });
  }

  const checkDuplicateItems_Level2 = (pricesForItem: any, getItemIds: any, cartItemPrices: any) => {
    //no inclusion level duplicates are found...
    if (getItemIds?.length > 0) {
      const getCartItemsId = cartItemPrices?.map((item: any) => item?.itemId);
      const getItemInCart = pricesForItem?.filter((item: any) =>
        getCartItemsId?.includes(item?.itemId)
      );
      const newItems = getItemIds?.map((item: string) => Number(item));
      //get the prices for both the items,
      const arrayToUse = isModifyFlow ? getItemInCart : pricesForItem;
      const getDuplicateItems = arrayToUse
        ?.filter((item: any) => newItems?.includes(item?.itemId))
        .sort((a: any, b: any) => b?.price - a?.price);

      const itemsToRemove = isModifyFlow
        ? getDuplicateItems
        : getDuplicateItems?.splice(1, getDuplicateItems?.length - 1);

      const itemIdToRemove = itemsToRemove?.map((item: any) => item?.itemId);
      const updatedCartItems = cartItems?.filter(function(items: any) {
        return itemIdToRemove?.indexOf(Number(items?.id)) < 0;
      });

      //assuming get two values.
      let array = [] as any;
      cartItems?.forEach((cItem) => {
        itemIdToRemove?.forEach((idToRemove: any) => {
          if (Number(cItem?.id) == idToRemove) {
            array.push({
              id: getDuplicateItems?.[0]?.itemId,
              removalId: idToRemove,
              removalName: cItem?.name,
            });
          }
        });
      });

      const duplicateItemNameForModify =
        isModifyFlow &&
        modifiedOrder?.diagnosticOrderLineItems?.find(
          (item: any) => Number(item?.itemId) !== Number(array?.[0]?.removalId)
        );

      const highPricesItem = cartItems?.map((cItem) =>
        Number(cItem?.id) == Number(getDuplicateItems?.[0]?.itemId)
          ? !!cItem?.name && nameFormater(cItem?.name, 'default')
          : isModifyFlow
          ? duplicateItemNameForModify?.name
          : ''
      );
      const higherPricesName = highPricesItem?.filter((item: any) => item != '')?.join(', ');
      const duplicateTests = array?.[0]?.removalName;

      let arrayToSet = [...duplicateNameArray, array]?.flat(1);
      onChangeCartItems(updatedCartItems, duplicateTests, itemIdToRemove);
      setShowInclusions(true);
      setDuplicateNameArray(arrayToSet);

      renderDuplicateMessage(duplicateTests, higherPricesName);
    } else {
      setLoading?.(false);
      hideAphAlert?.();
      proceedForBooking();
    }
  };

  const renderDuplicateMessage = (duplicateTests: string, higherPricesName: string) => {
    showAphAlert?.({
      title: 'Your cart has been revised!',
      description: isModifyFlow
        ? `The "${duplicateTests}" has been removed from your cart as it is already included in your order. Kindly proceed to pay the revised amount`
        : `The "${duplicateTests}" has been removed from your cart as it is already included in another test "${higherPricesName}" in your cart. Kindly proceed to pay the revised amount`,
      onPressOk: () => {
        setLoading?.(false);
        hideAphAlert?.();
      },
    });
  };

  function onChangeCartItems(updatedCartItems: any, removedTest: string, removedTestItemId: any) {
    setDiagnosticSlot?.(null);
    setCartItems?.(updatedCartItems);
    //refetch the areas
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      const _itemIds = updatedCartItems?.map((item: any) => Number(item?.id));
      isModifyFlow
        ? null
        : !isEmptyObject(areaSelected)
        ? checkSlotSelection(areaSelected, undefined, undefined, _itemIds)
        : showSelectedArea
        ? fetchAreasForAddress(
            addresses?.[selectedAddressIndex]?.id,
            addresses?.[selectedAddressIndex]?.zipcode!,
            showSelectedArea
          )
        : getAreas(removedTestItemId);
      let removedItems = removedTestItemId?.join(', ');
      DiagnosticRemoveFromCartClicked(
        removedItems,
        removedTest,
        addresses?.[selectedAddressIndex]?.zipcode!,
        'Automated'
      );
    }
  }

  const proceedForBooking = () => {
    const prescriptions = physicalPrescriptions;
    if (prescriptions.length == 0 && ePrescriptions.length == 0) {
      bookDiagnosticOrder();
    } else {
      if (prescriptions.length > 0) {
        physicalPrescriptionUpload();
      }
      if (ePrescriptions.length > 0) {
        ePrescriptionUpload();
      }
    }
  };

  const validateDiagnosticCoupon = async () => {
    if (addressCityId != '') {
      setLoading!(true);
      var orderedTestArray: {
        itemId: number;
        itemName: string;
        rateExcludingDiscount: number;
        groupPlan: string;
      }[] = [];
      cartItems.map((items) => {
        orderedTestArray.push({
          itemId: Number(items.id!),
          itemName: items.name,
          rateExcludingDiscount: items.price,
          groupPlan: items.groupPlan!,
        });
      });
      const CouponInput = {
        grossOrderAmountExcludingDiscount: cartTotal, //without packageMrp
        testsOrdered: orderedTestArray,
        cityId: parseInt(addressCityId),
      };
      try {
        const validateDiagnosticCouponApi = await client.query<
          vaidateDiagnosticCoupon,
          vaidateDiagnosticCouponVariables
        >({
          query: VALIDATE_DIAGNOSTIC_COUPON,
          context: {
            sourceHeaders,
          },
          variables: {
            couponInput: CouponInput,
          },
          fetchPolicy: 'no-cache',
        });
        const validateApiResponse = g(
          validateDiagnosticCouponApi,
          'data',
          'vaidateDiagnosticCoupon'
        );
        //success only if items in the cart has circle applied
        if (validateApiResponse?.message == 'success') {
          setUniqueId!(validateApiResponse?.uniqueid!);
          setValidateCouponUniqueId(validateApiResponse?.uniqueid!);
        }
        //if not reqd => then set to "not required" and bypass
        else {
          setUniqueId!('not required');
          setValidateCouponUniqueId('not required');
        }
        setLoading!(false);
      } catch (error) {
        setLoading!(false);
        // renderAlert(`Something went wrong, unable to fetch Home collection charges.`);
      }
    }
  };

  const fetchHC_ChargesForTest = async (slotVal: string, modifiedItems?: any[]) => {
    !loading && setShowSpinner?.(true);
    const getModifiedId = !!modifiedItems && modifiedItems?.map((item) => Number(item?.itemId));
    const allItemId =
      !!getModifiedId && getModifiedId?.length ? cartItemsWithId.concat(getModifiedId) : itemWithId;
    const getModifiedItemPrices = !!modifiedItems && modifiedItems?.map((item) => item?.price);

    const totalModifiedItemPrices =
      !!getModifiedItemPrices &&
      getModifiedItemPrices?.length &&
      getModifiedItemPrices?.reduce((prevVal, currVal) => currVal + prevVal, 0);

    //only for modified order (grandTotal - hc)
    const totalCartPricesIncludingDiscount =
      totalPriceExcludingAnyDiscounts +
      couponDiscount -
      cartSaving -
      (isDiagnosticCircleSubscription ? circleSaving : 0);

    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
    );
    const pinCodeFromAddress = isModifyFlow
      ? modifiedOrder?.patientAddressObj?.zipcode!
      : addresses?.[selectedAddressIndex]?.zipcode!;

    setPinCode?.(pinCode);

    let newGrandTotal = isModifyFlow
      ? totalCartPricesIncludingDiscount + totalModifiedItemPrices
      : grandTotal - hcCharges;

    try {
      const HomeCollectionChargesApi = await client.query<
        getDiagnosticsHCCharges,
        getDiagnosticsHCChargesVariables
      >({
        query: GET_DIAGNOSTICS_HC_CHARGES,
        context: {
          sourceHeaders,
        },
        variables: {
          itemIDs: allItemId,
          totalCharges: newGrandTotal, //removed cartTotal due APP-7386
          slotID: slotVal!,
          pincode: Number(pinCodeFromAddress),
        },
        fetchPolicy: 'no-cache',
      });

      let getCharges = g(HomeCollectionChargesApi.data, 'getDiagnosticsHCCharges', 'charges') || 0;
      if (getCharges != null) {
        //add a check for calulating home collection charges.
        let recalculatedHC = isModifyFlow
          ? calculateModifiedOrderHomeCollectionCharges(getCharges)
          : getCharges;

        // const updatedHcCharges =
        //   isModifyFlow &&
        //   modifiedOrder?.collectionCharges > 0 &&
        //   (getCharges === 0 || getCharges > 0)
        //     ? -modifiedOrder?.collectionCharges
        //     : getCharges;

        const updatedHcCharges =
          isModifyFlow &&
          modifiedOrder?.collectionCharges > 0 &&
          (getCharges === 0 || getCharges > 0)
            ? 0
            : getCharges;
        setHcCharges?.(getCharges);
        setModifyHcCharges?.(updatedHcCharges); //used for calculating subtotal & topay
      }
      setShowSpinner(false);
      setLoading?.(false);
    } catch (error) {
      setShowSpinner(false);
      setLoading?.(false);
    }
  };

  function calculateModifiedOrderHomeCollectionCharges(charges: number) {
    const previousCharges = modifiedOrder?.collectionCharges;
    const currentCharges = charges;
    //100 - 50 => 50 (p > c)
    //100 - 100 => 0 (p = c)
    //50 - 100 => |-50| (p < c)
    return Math.abs(previousCharges - currentCharges);
  }

  const renderPatientDetails = () => {
    const patientDetailsText = selectedPatient
      ? `${selectedPatient?.firstName || ''} ${selectedPatient?.lastName ||
          ''}, ${selectedPatient?.gender || ''}, ${
          selectedPatient?.dateOfBirth ? getAge(selectedPatient.dateOfBirth) || '' : ''
        }`
      : '';
    return (
      <View style={styles.patientDetailsViewStyle}>
        {selectedPatient ? (
          <View style={styles.patientNameMainViewStyle}>
            <View style={styles.patientNameViewStyle}>
              <Text style={styles.patientNameTextStyle}>{string.diagnostics.patientNameText}</Text>
              {isModifyFlow ? null : (
                <Text
                  style={styles.changeTextStyle}
                  onPress={() => setShowPatientListOverlay(true)}
                >
                  {string.diagnostics.changeText}
                </Text>
              )}
            </View>
            <Text style={styles.patientDetailsTextStyle}>{patientDetailsText}</Text>
            <Text style={styles.testReportMsgStyle}>{string.diagnostics.testReportMsgText}</Text>
          </View>
        ) : null}
        {addressText ? (
          <>
            <View style={styles.patientNameMainViewStyle}>
              <View style={styles.patientNameViewStyle}>
                <Text style={styles.patientNameTextStyle}>{string.diagnostics.homeVisitText}</Text>
                {isModifyFlow ? null : (
                  <Text style={styles.changeTextStyle} onPress={() => showAddressPopup()}>
                    {string.diagnostics.changeText}
                  </Text>
                )}
              </View>
              <Text style={styles.patientDetailsTextStyle}>{addressText}</Text>
            </View>
            {showPriceMismatch ? (
              <View style={styles.blueView}>
                <InfoIconBlue style={{ width: 18, height: 18 }} />
                <Text style={styles.lbTextStyle}>{string.diagnostics.pricesChangedMessage}</Text>
              </View>
            ) : null}
          </>
        ) : null}
        {isModifyFlow ? null : showSelectedArea && !isEmptyObject(areaSelected) ? (
          <View style={styles.patientNameMainViewStyle}>
            <View style={styles.patientNameViewStyle}>
              <Text style={styles.patientNameTextStyle}>{string.diagnostics.areaText}</Text>
              <Text style={styles.changeTextStyle} onPress={() => setShowSelectAreaOverlay(true)}>
                {string.diagnostics.changeText}
              </Text>
            </View>
            <Text style={styles.patientDetailsTextStyle}>{(areaSelected as any)?.value || ''}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const setAddressList = (key: string) => {
    setDoctorJoinedChat?.(false);
  };

  const changeCurrentProfile = (_selectedPatient: any, _showPatientDetailsOverlay: boolean) => {
    if (currentPatient?.id === _selectedPatient?.id) {
      return;
    } else if (!_selectedPatient?.dateOfBirth || !_selectedPatient?.gender) {
      setSelectedPatient(_selectedPatient);
      setShowSelectPatient?.(true);
      setShowPatientDetailsOverlay(_showPatientDetailsOverlay);
      return;
    }
    setCurrentPatientId?.(_selectedPatient?.id);
    AsyncStorage.setItem('selectUserId', _selectedPatient?.id);
    AsyncStorage.setItem('selectUserUHId', _selectedPatient?.uhid || '');
    setAddressList(_selectedPatient?.id);
  };

  const onNewProfileAdded = (newPatient: any) => {
    if (newPatient?.profileData) {
      if (!checkPatientAge(newPatient?.profileData, true)) {
        setSelectedPatient(newPatient?.profileData);
        setShowSelectPatient?.(true);
        setShowPatientListOverlay(false);
        changeCurrentProfile(newPatient?.profileData, false);
      }
    }
  };

  const _onPressBackButton = () => {
    if (!selectedPatient) {
      setShowPatientListOverlay(true);
    }
  };

  const renderPatientListOverlay = () => {
    return showPatientListOverlay ? (
      <PatientListOverlay
        onPressClose={() => setShowPatientListOverlay(false)}
        onPressDone={(_selectedPatient: any) => {
          if (!checkPatientAge(_selectedPatient)) {
            setSelectedPatient(_selectedPatient);
            setShowPatientListOverlay(false);
            setShowSelectPatient?.(true);
            changeCurrentProfile(_selectedPatient, true);
          }
        }}
        onPressAddNewProfile={() => {
          setShowPatientListOverlay(false);
          props.navigation.navigate(AppRoutes.EditProfile, {
            isEdit: false,
            isPoptype: true,
            mobileNumber: currentPatient?.mobileNumber,
            onNewProfileAdded: onNewProfileAdded,
            onPressBackButton: _onPressBackButton,
          });
        }}
        patientSelected={selectedPatient}
        onPressAndroidBack={() => {
          setShowPatientListOverlay(false);
          handleBack();
        }}
      />
    ) : null;
  };

  const renderPatientDetailsOverlay = () => {
    return showPatientDetailsOverlay ? (
      <PatientDetailsOverlay
        selectedPatient={selectedPatient}
        onPressClose={() => setShowPatientDetailsOverlay(false)}
        onPressDone={(_date, _gender, _selectedPatient) => {
          setShowPatientDetailsOverlay(false);
          setLoading?.(true);
          client
            .mutate<editProfile, editProfileVariables>({
              mutation: EDIT_PROFILE,
              variables: {
                editProfileInput: {
                  id: _selectedPatient?.id,
                  photoUrl: _selectedPatient?.photoUrl,
                  firstName: _selectedPatient?.firstName?.trim(),
                  lastName: _selectedPatient?.lastName?.trim(),
                  relation: _selectedPatient?.relation,
                  gender: _gender,
                  dateOfBirth: moment(_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                  emailAddress: _selectedPatient?.emailAddress?.trim(),
                },
              },
            })
            .then(({ data }) => {
              const profileData = g(data, 'editProfile', 'patient');
              setLoading?.(false);
              getPatientApiCall();
              if (!checkPatientAge(profileData, true)) {
                setSelectedPatient(profileData);
                changeCurrentProfile(profileData, false);
              }
            })
            .catch((e) => {
              setLoading?.(false);
              showAphAlert?.({
                title: 'Network Error!',
                description: 'Please try again later.',
              });
              CommonBugFender('EditProfile_updateUserProfile', e);
            });
        }}
      />
    ) : null;
  };

  const renderTestProceedBar = () => {
    const showTime = isModifyFlow
      ? modifiedOrder?.areaId && modifiedOrder?.slotDateTimeInUTC
      : deliveryAddressId && areaSelected && !isEmptyObject(areaSelected);
    return cartItems?.length > 0 ? (
      <TestProceedBar
        selectedTimeSlot={selectedTimeSlot}
        disableProceedToPay={disableProceedToPay}
        onPressAddDeliveryAddress={() => _onPressAddAddress()}
        onPressProceedtoPay={() => onPressProceedToPay()}
        onPressSelectDeliveryAddress={() => showAddressPopup()}
        showTime={showTime}
        phleboMin={phleboMin}
        onPressTimeSlot={() => showTime && setDisplaySchedule(true)}
        onPressSelectArea={() => setShowSelectAreaOverlay(true)}
        isModifyCOD={
          isModifyFlow
            ? modifiedOrder?.paymentType !== DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT
            : false
        }
        modifyOrderDetails={isModifyFlow ? modifiedOrder : null}
      />
    ) : null;
  };

  function _onPressAddAddress() {
    postPharmacyAddNewAddressClick('Diagnostics Cart');
    props.navigation.navigate(AppRoutes.AddAddressNew, {
      addOnly: true,
      source: 'Diagnostics Cart' as AddressSource,
    });
    setDiagnosticSlot && setDiagnosticSlot(null);
    setselectedTimeSlot(undefined);
  }

  async function setDefaultAddress(address: Address) {
    try {
      const isSelectedAddressWithNoLatLng = isAddressLatLngInValid(address);
      if (isSelectedAddressWithNoLatLng) {
        //show the error
        renderAlert(string.diagnostics.updateAddressLatLngMessage, 'updateLocation', address);
      } else {
        setLoading?.(true);
        hideAphAlert?.();
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
        setAddresses?.(updatedAddresses);
        setMedAddresses?.(updatedAddresses);
        patientAddress?.defaultAddress && setDeliveryAddressId?.(patientAddress?.id);
        setDiagnosticAreas?.([]);
        setAreaSelected?.({});
        setDiagnosticSlot?.(null);
        const deliveryAddress = updatedAddresses.find(({ id }) => patientAddress?.id == id);
        setDiagnosticLocation?.(formatAddressToLocation(deliveryAddress! || null));
        setLoading?.(false);
      }
    } catch (error) {
      aphConsole.log({ error });
      setLoading?.(false);
      CommonBugFender('setDefaultAddress_TestsCart', error);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.common.unableToSetDeliveryAddress,
      });
    }
  }

  const formatAddressToLocation = (address: Address): LocationData => ({
    displayName: address?.city!,
    latitude: address?.latitude!,
    longitude: address?.longitude!,
    area: '',
    city: address?.city!,
    state: address?.state!,
    stateCode: address?.stateCode!,
    country: '',
    pincode: address?.zipcode!,
    lastUpdated: new Date().getTime(),
  });

  function showAddressPopup() {
    return showAphAlert?.({
      removeTopIcon: true,
      onPressOutside: () => {
        hideAphAlert?.();
      },
      children: (
        <AccessLocation
          source={AppRoutes.Tests}
          hidePincodeCurrentLocation
          addresses={addresses}
          onPressSelectAddress={(_address) => {
            CommonLogEvent(AppRoutes.TestsCart, 'Check service availability');
            setDefaultAddress(_address);
            const tests = cartItems?.filter(
              (item) => item.collectionMethod == TEST_COLLECTION_TYPE.CENTER
            );
            const isSelectedAddressWithNoLatLng = isAddressLatLngInValid(_address);
            hideAphAlert?.();

            if (tests?.length) {
              showAphAlert?.({
                title: string.common.uhOh,
                description: `${(currentPatient && currentPatient.firstName) ||
                  'Hi'}, since your cart includes tests (${tests
                  .map((item) => item.name)
                  .join(
                    ', '
                  )}), that can only be done at the centre, we request you to get all tests in your cart done at the centre of your convenience. Please proceed to select.`,
              });
            } else {
              if (isSelectedAddressWithNoLatLng) {
                //show the error
                renderAlert(
                  string.diagnostics.updateAddressLatLngMessage,
                  'updateLocation',
                  _address
                );
              } else {
                AddressSelectedEvent(_address);
                setDeliveryAddressId?.(_address?.id);
                setCartPagePopulated?.(false);
                setAsyncPharmaLocation(_address);
                setAsyncDiagnosticPincode?.(_address);
                if (deliveryAddressId !== _address?.id) {
                  setDiagnosticAreas?.([]);
                  setAreaSelected?.({});
                  setDiagnosticSlot?.(null);
                  setCartPagePopulated?.(false);
                }
              }
            }
          }}
          onPressEditAddress={(_address) => {
            _navigateToEditAddress('Update', _address, AppRoutes.TestsCart);
            hideAphAlert?.();
          }}
          onPressAddAddress={() => {
            _onPressAddAddress();
            hideAphAlert?.();
          }}
          onPressCurrentLocaiton={() => {}}
          onPressPincode={() => {}}
        />
      ),
    });
  }

  const renderSelectAreaOverlay = () => {
    return showSelectAreaOverlay ? (
      <SelectAreaOverlay
        addressText={addressText}
        onPressChangeAddress={() => {
          setShowSelectAreaOverlay(false);
          showAddressPopup();
        }}
        onPressClose={() => setShowSelectAreaOverlay(false)}
        onPressDone={(_selectedArea) => {
          setShowSelectAreaOverlay(false);
          setAreaSelected?.(_selectedArea);
          checkSlotSelection(_selectedArea);
          setWebEngageEventForAreaSelection(_selectedArea);
        }}
      />
    ) : null;
  };

  const _fetchAreasAndReportGenDetails = (_item: any, callReportGen?: boolean) => {
    const _cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
    _cartItemsWithId?.push(Number(_item?.itemId));
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      isModifyFlow
        ? null
        : !isEmptyObject(areaSelected)
        ? checkSlotSelection(areaSelected, undefined, undefined, _cartItemsWithId)
        : showSelectedArea
        ? fetchAreasForAddress(
            addresses?.[selectedAddressIndex]?.id,
            addresses?.[selectedAddressIndex]?.zipcode!,
            showSelectedArea,
            callReportGen ? _cartItemsWithId : undefined
          )
        : getAreas(callReportGen ? _cartItemsWithId : undefined);
    }
  };

  const renderAlsoAddItems = () => {
    return (
      <View style={{ flex: 1 }}>
        {alsoAddListData?.length > 0 ? renderAlsoAddListHeader() : null}
        <ItemCard
          onPressAddToCartFromCart={(item) => _fetchAreasAndReportGenDetails(item, true)}
          onPressRemoveItemFromCart={(item) => _fetchAreasAndReportGenDetails(item)}
          data={alsoAddListData}
          isCircleSubscribed={isDiagnosticCircleSubscription}
          isServiceable={isDiagnosticLocationServiceable}
          isVertical={false}
          navigation={props.navigation}
          source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.CART_PAGE}
          sourceScreen={AppRoutes.TestsCart}
        />
      </View>
    );
  };

  const renderAlsoAddListHeader = () => {
    return <Text style={styles.alsoAddListHeaderTextStyle}>{'YOU SHOULD ALSO ADD'}</Text>;
  };

  const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);
  const addressText = isModifyFlow
    ? formatAddressWithLandmark(modifiedOrder?.patientAddressObj) || ''
    : selectedAddr
    ? formatAddressWithLandmark(selectedAddr) || ''
    : '';

  const renderCancellationPolicy = () => {
    return (
      <View style={styles.cancelPolicyContainer}>
        <TouchableOpacity
          onPress={() => {
            setShowCancellationPolicy(!showCancellationPolicy);
          }}
          style={{ flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <CrossOcta />
            <Text style={styles.cancel_heading}>Cancellation Policy</Text>
          </View>
          {showCancellationPolicy ? <BlackArrowUp /> : <BlackArrowDown />}
        </TouchableOpacity>
        {showCancellationPolicy ? (
          <Text style={styles.cancel_text}>{cancelellation_policy_text}</Text>
        ) : null}
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      {displaySchedule && (
        <TestSlotSelectionOverlayNew
          source={'Tests'}
          heading="Schedule Appointment"
          date={date}
          areaId={(areaSelected as any)?.key!}
          maxDate={moment()
            .add(maxDaysToShow, 'day')
            .toDate()}
          isVisible={displaySchedule}
          isTodaySlotUnavailable={todaySlotNotAvailable}
          onClose={() => setDisplaySchedule(false)}
          slots={slots}
          slotInfo={selectedTimeSlot}
          addressDetails={isModifyFlow ? modifiedOrder?.patientAddressObj : selectedAddr}
          onSchedule={(date: Date, slotInfo: TestSlot) => {
            setDate(date);
            setselectedTimeSlot(slotInfo);
            setDiagnosticSlot!({
              slotStartTime: slotInfo?.slotInfo?.startTime!,
              slotEndTime: slotInfo?.slotInfo?.endTime!,
              date: date.getTime(),
              employeeSlotId: slotInfo?.slotInfo?.slot!,
              diagnosticBranchCode: slotInfo?.diagnosticBranchCode,
              diagnosticEmployeeCode: slotInfo?.employeeCode,
              city: selectedAddr ? selectedAddr.city! : '', // not using city from this in order place API
            });
            setWebEnageEventForAppointmentTimeSlot('Manual', slotInfo, areaSelected);
            setDisplaySchedule(false);
          }}
        />
      )}
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        {renderPatientListOverlay()}
        {renderSelectAreaOverlay()}
        {renderPatientDetailsOverlay()}
        <ScrollView bounces={false}>
          <View style={{ marginVertical: 16 }}>
            {renderPatientDetails()}
            {renderItemsInCart()}
            {isModifyFlow ? renderPreviouslyAddedItems() : null}
            {renderTotalCharges()}
            {enable_cancelellation_policy ? renderCancellationPolicy() : null}
            {cartItems?.length > 0 ? renderAlsoAddItems() : null}
          </View>
          <View style={{ height: cartItems?.length > 0 ? 140 : 90 }} />
        </ScrollView>
        {renderTestProceedBar()}
        {showSpinner && <Spinner />}
      </SafeAreaView>
    </View>
  );
};
const { text, cardViewStyle } = theme.viewStyles;
const { SHERPA_BLUE, APP_YELLOW, WHITE } = theme.colors;
const styles = StyleSheet.create({
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  labelTextStyle: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  cancel_heading: {
    ...theme.viewStyles.text('SB', 16, '#01475b'),
    marginHorizontal: 10,
  },
  cancel_text: {
    ...theme.viewStyles.text('M', 12, '#01475b', 1, 18),
    width: '90%',
    textAlign: 'left',
    alignSelf: 'flex-end',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  cancelPolicyContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    // marginTop: 4,
    marginBottom: 12,
    padding: 16,
    marginTop: 10,
  },
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    paddingTop: 16,
  },
  blueTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(screenWidth < 380 ? 14 : 16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    alignSelf: 'center',
  },
  lbTextStyle: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 0.5),
    marginHorizontal: 5,
  },
  dateTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  medicineCostStyle: {
    ...theme.fonts.IBMPlexSansBold(11),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  rowSpaceBetweenStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  subtitleStyle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: theme.colors.SHERPA_BLUE,
    marginBottom: 5,
  },
  menuItemContainer: {
    marginHorizontal: 0,
    padding: 0,
    margin: 0,
  },
  menuMenuContainerStyle: {
    marginLeft: screenWidth * 0.25,
    marginTop: 30,
  },
  menuScrollViewContainerStyle: { paddingVertical: 0 },
  menuItemTextStyle: {
    ...theme.viewStyles.text('M', 14, '#01475b'),
    padding: 0,
    margin: 0,
  },
  menuBottomPadding: { paddingBottom: 0 },
  dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },
  locationText: { ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) },
  locationTextUnderline: {
    height: 2,
    backgroundColor: '#00b38e',
    opacity: 1,
  },
  cartEmpty: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(13),
    margin: 20,
    textAlign: 'center',
    opacity: 0.3,
  },
  patientDetailsViewStyle: {
    flex: 1,
    marginBottom: 6,
  },
  patientNameMainViewStyle: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: WHITE,
    paddingVertical: 8,
    marginBottom: 8,
  },
  patientNameViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  patientNameTextStyle: {
    ...text('R', 12, SHERPA_BLUE, 1, 20),
  },
  changeTextStyle: {
    ...text('B', 13, APP_YELLOW, 1, 20),
  },
  patientDetailsTextStyle: {
    ...text('SB', 14, SHERPA_BLUE, 1, 18),
  },
  testReportMsgStyle: {
    ...text('R', 10, SHERPA_BLUE, 0.7, 14),
    marginTop: 4,
  },
  phelboTextView: {
    backgroundColor: '#FCFDDA',
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    marginVertical: '2%',
    paddingRight: 15,
  },
  blueView: {
    flexDirection: 'row',
    backgroundColor: '#E0F0FF',
    marginTop: -5,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  dashedBannerViewStyle: {
    ...cardViewStyle,
    marginHorizontal: 20,
    marginBottom: 0,
    padding: 16,
    marginTop: 10,
    flexDirection: 'row',
    borderColor: theme.colors.APP_GREEN,
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: 'dashed',
  },
  totalChargesContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    // marginTop: 4,
    marginBottom: 12,
    padding: 16,
    marginTop: 6,
  },
  alsoAddListHeaderTextStyle: {
    ...text('B', 13, SHERPA_BLUE, 1, 16.9),
    marginHorizontal: 20,
    marginTop: 24,
  },
  previousItemContainer: {
    marginBottom: 20,
    marginTop: 12,
  },
  previousContainerTouch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousItemInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    height: 30,
    alignItems: 'center',
  },
  arrowIconStyle: { height: 30, width: 30, resizeMode: 'contain' },
  itemHeading: {
    ...theme.viewStyles.text('M', 11, SHERPA_BLUE, 1, 15),
    letterSpacing: 0.28,
  },
  commonTax: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
  commonText: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 11 : 12),
    color: SHERPA_BLUE,
    marginBottom: 5,
    lineHeight: 18,
  },
  inclusionsText: {
    ...theme.viewStyles.text('R', 11, SHERPA_BLUE, 1, 15),
  },
  previousItemHeading: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13 : 14),
    color: SHERPA_BLUE,
    lineHeight: 22,
    width: '87%',
  },
  arrowTouch: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strikedThroughHC: {
    ...theme.fonts.IBMPlexSansMedium(screenWidth < 380 ? 10 : 11),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 16,
    opacity: 0.5,
    alignSelf: 'center',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  pricesNormalText: {
    ...theme.viewStyles.text('M', 12, SHERPA_BLUE, 1, 18),
  },
  pricesBoldText: {
    ...theme.viewStyles.text('B', 14, SHERPA_BLUE, 1, 20),
  },
});
