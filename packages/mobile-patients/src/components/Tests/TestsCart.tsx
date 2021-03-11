import {
  aphConsole,
  formatAddress,
  formatAddressWithLandmark,
  formatNameNumber,
  g,
  TestSlot,
  formatTestSlot,
  isEmptyObject,
  getDiscountPercentage,
  postAppsFlyerEvent,
  postFirebaseEvent,
  isSmallDevice,
  nameFormater,
  getAge,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  DiagnosticArea,
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  CalendarShow,
  CheckedIcon,
  CircleLogo,
  CouponIcon,
  DropdownGreen,
  InfoIconRed,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_PATIENT_ADDRESS_LIST,
  UPLOAD_DOCUMENT,
  GET_DIAGNOSTIC_AREAS,
  GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
  GET_DIAGNOSTICS_HC_CHARGES,
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  VALIDATE_DIAGNOSTIC_COUPON,
  GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
  SAVE_DIAGNOSTIC_ORDER,
  SAVE_DIAGNOSTIC_ORDER_NEW,
  CREATE_INTERNAL_ORDER,
  EDIT_PROFILE,
  GET_DIAGNOSTIC_NEAREST_AREA,
  GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getDiagnosticsHCChargesVariables,
  getDiagnosticsHCCharges,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsHCCharges';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import {
  BOOKINGSOURCE,
  DEVICETYPE,
  DiagnosticLineItem,
  DiagnosticOrderInput,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  TEST_COLLECTION_TYPE,
  SaveBookHomeCollectionOrderInput,
  OrderCreate,
  OrderVerticals,
  DiagnosticsBookingSource,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import {
  Clinic,
  DIAGNOSTIC_GROUP_PLAN,
  getPlaceInfoByLatLng,
  getPlaceInfoByPincode,
  searchClinicApi,
  getDiagnosticCartItemReportGenDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig, COVID_NOTIFICATION_ITEMID } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import {
  FlatList,
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import Geolocation from 'react-native-geolocation-service';
import { TestSlotSelectionOverlay } from '@aph/mobile-patients/src/components/Tests/TestSlotSelectionOverlay';
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
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import {
  SaveDiagnosticOrder,
  SaveDiagnosticOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveDiagnosticOrder';
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
} from '@aph/mobile-patients/src/utils/commonUtils';
import { initiateSDK } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { isSDKInitialised } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import {
  DiagnosticAddresssSelected,
  DiagnosticAddToCartClicked,
  DiagnosticAppointmentTimeSlot,
  DiagnosticAreaSelected,
  DiagnosticCartViewed,
  DiagnosticNonServiceableAddressSelected,
  DiagnosticProceedToPay,
  DiagnosticRemoveFromCartClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
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
import AsyncStorage from '@react-native-community/async-storage';
import {
  getNearestArea,
  getNearestAreaVariables,
} from '@aph/mobile-patients/src/graphql/types/getNearestArea';
import {
  getDiagnosticSlotsCustomized,
  getDiagnosticSlotsCustomizedVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsCustomized';
const { width: screenWidth } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;

type clinicHoursData = {
  week: string;
  time: string;
};

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
    clinicId,
    setClinicId,
    clinics,
    setClinics,
    ePrescriptions,
    forPatientId,
    setPatientId,
    diagnosticSlot,
    setUniqueId,
    getUniqueId,

    setDiagnosticClinic,
    diagnosticClinic,
    setDiagnosticSlot,
    setEPrescriptions,
    deliveryCharges,
    setHcCharges,
    hcCharges,
    coupon,
    areaSelected,
    setAreaSelected,
    diagnosticAreas,
    setDiagnosticAreas,
    cartSaving,
    discountSaving,
    normalSaving,
    circleSaving,
    isDiagnosticCircleSubscription,
    newAddressAddedCartPage,
    setNewAddressAddedCartPage,
  } = useDiagnosticsCart();
  const {
    setAddresses: setMedAddresses,
    circleSubscriptionId,
    circlePlanValidity,
  } = useShoppingCart();

  const clinicHours: clinicHoursData[] = [
    {
      week: 'Mon - Fri',
      time: '9:00 AM - 5:00 PM',
    },
    {
      week: 'Sat - Sun',
      time: '10:00 AM - 3:30 PM',
    },
  ];
  const tabs = [
    { title: 'Home Visit', subtitle: 'Appointment Slot' },
    // { title: 'Clinic Visit', subtitle: 'Clinic Hours' },
  ];

  const sourceScreen = props.navigation.getParam('comingFrom');
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();
  const [isMinor, setIsMinor] = useState<boolean>(false);
  const [selectedTab, setselectedTab] = useState<string>(clinicId ? tabs[1].title : tabs[0].title);
  const { currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [todaySlotNotAvailable, setTodaySlotNotAvailable] = useState<boolean>(false);
  const currentPatientId = currentPatient && currentPatient?.id;
  const client = useApolloClient();
  const {
    locationForDiagnostics,
    locationDetails,
    diagnosticServiceabilityData,
    diagnosticLocation,
    setDoctorJoinedChat,
  } = useAppCommonData();

  const shopCart = useShoppingCart();
  const diagCart = useDiagnosticsCart();
  const { getPatientApiCall } = useAuth();

  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [clinicDetails, setClinicDetails] = useState<Clinic[] | undefined>([]);

  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>({
    ...((currentPatient || {}) as any),
  });
  const [displaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>();
  const [isEPrescriptionUploadComplete, setisEPrescriptionUploadComplete] = useState<boolean>();
  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean>(false);
  const [testCentresLoaded, setTestCentresLoaded] = useState<boolean>(false);
  const [addressCityId, setAddressCityId] = useState<string>(deliveryAddressCityId);
  const [validateCouponUniqueId, setValidateCouponUniqueId] = useState<string>(getUniqueId);
  const [orderDetails, setOrderDetails] = useState<orderDetails>();
  const [showInclusions, setShowInclusions] = useState<boolean>(false);
  const [duplicateNameArray, setDuplicateNameArray] = useState([] as any);
  const [showPatientListOverlay, setShowPatientListOverlay] = useState<boolean>(false);
  const [showPatientDetailsOverlay, setShowPatientDetailsOverlay] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAreaSelection, setShowAreaSelection] = useState<boolean>(false);
  const [showSelectAreaOverlay, setShowSelectAreaOverlay] = useState<boolean>(false);
  const [reportGenDetails, setReportGenDetails] = useState<any>([]);

  const itemsWithHC = cartItems?.filter((item) => item!.collectionMethod == 'HC');
  const itemWithId = itemsWithHC?.map((item) => parseInt(item.id!));

  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  const cartItemsWithId = cartItems?.map((item) => parseInt(item?.id!));
  var pricesForItemArray;
  var slotBookedArray = ['slot', 'already', 'booked', 'select a slot'];

  const saveOrder = (orderInfo: DiagnosticOrderInput) =>
    client.mutate<SaveDiagnosticOrder, SaveDiagnosticOrderVariables>({
      mutation: SAVE_DIAGNOSTIC_ORDER,
      context: {
        sourceHeaders,
      },
      variables: { diagnosticOrderInput: orderInfo },
    });

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

  useEffect(() => {
    fetchAddresses();
    checkPatientAge();
  }, [currentPatient]);

  const fetchTestReportGenDetails = async (_cartItemId: string | number[]) => {
    const removeSpaces =
      typeof _cartItemId == 'string' ? _cartItemId.replace(/\s/g, '').split(',') : null;
    const listOfIds =
      typeof _cartItemId == 'string' ? removeSpaces?.map((item) => parseInt(item!)) : _cartItemId;
    const res: any = await getDiagnosticCartItemReportGenDetails(
      listOfIds?.toString() || _cartItemId?.toString()
    );
    if (res?.data?.success) {
      const result = g(res, 'data', 'data');
      setReportGenDetails(result || []);
    } else {
      setReportGenDetails([]);
    }
  };

  const checkPatientAge = () => {
    let age = !!currentPatient?.dateOfBirth ? getAge(currentPatient?.dateOfBirth) : null;

    if (age! <= 10 || age == null) {
      renderAlert(
        age == null ? string.common.contactCustomerCare : string.diagnostics.minorAgeText
      );
      setIsMinor(true);
      setDeliveryAddressId!('');
      setDiagnosticAreas!([]);
      setAreaSelected!({});
      setselectedTimeSlot(undefined);
    } else {
      isMinor && setIsMinor(false);
    }
  };

  const handleBack = () => {
    props.navigation.goBack();
  };

  useEffect(() => {
    if (cartItemsWithId?.length > 0) {
      fetchPackageDetails(cartItemsWithId, null, 'diagnosticServiceablityChange');
      fetchTestReportGenDetails(cartItemsWithId);
    }
  }, [diagnosticServiceabilityData]);

  useEffect(() => {
    if (
      selectedTimeSlot?.slotInfo?.slot! &&
      areaSelected &&
      deliveryAddressId != '' &&
      cartItems?.length > 0
    ) {
      validateDiagnosticCoupon();
      fetchHC_ChargesForTest(selectedTimeSlot?.slotInfo?.slot!);
    }
  }, [diagnosticSlot, deliveryAddressId, cartItems]);

  useEffect(() => {
    if (deliveryAddressId != '') {
      getPinCodeServiceability();
    }
  }, [deliveryAddressId]);

  useEffect(() => {
    if (cartItems?.length) {
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
        isDiagnosticCircleSubscription
      );
    }
  }, [hcCharges]);

  const postwebEngageProceedToPayEvent = () => {
    const mode = selectedTab === tabs[0].title ? 'Home Visit' : 'Clinic Visit';
    const area = String((areaSelected as areaObject)?.value);

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
      area,
      hcCharges,
      selectedTimeSlot?.slotInfo?.startTime!
    );
  };

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

  const setWebEnageEventForAppointmentTimeSlot = () => {
    const diffInDays = date.getDate() - new Date().getDate();
    const area = (areaSelected as any)?.value;
    const timeSlot = selectedTimeSlot?.slotInfo?.startTime!;
    const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);

    DiagnosticAppointmentTimeSlot(selectedAddr, area, timeSlot, diffInDays);
  };

  useEffect(() => {
    onFinishUpload();
  }, [isEPrescriptionUploadComplete, isPhysicalUploadComplete]);

  useEffect(() => {
    setPatientId!(currentPatientId!);
  }, [currentPatientId]);

  useEffect(() => {
    if (cartItems?.length == 0) {
      setselectedTimeSlot?.(undefined);
      setDiagnosticAreas?.([]);
      setAreaSelected?.({});
      setDeliveryAddressId?.('');
    }
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
        setDiagnosticAreas!([]);
        setAreaSelected!({});
      }
    }
  }, [deliveryAddressId, diagnosticSlot, cartItems]);

  useEffect(() => {
    if (testCentresLoaded) {
      if (!(locationDetails && locationDetails.pincode)) {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getPlaceInfoByLatLng(latitude, longitude)
              .then((obj) => {
                try {
                  if (
                    obj?.data?.results?.length > 0 &&
                    obj?.data?.results?.[0]?.address_components?.length > 0
                  ) {
                    const addrComponents = obj?.data?.results?.[0]?.address_components || [];
                    const _pincode = (
                      addrComponents?.find(
                        (item: any) => item?.types.indexOf('postal_code') > -1
                      ) || {}
                    ).long_name;
                    filterClinics(_pincode || '');
                  }
                } catch (e) {
                  CommonBugFender('TestsCart_getPlaceInfoByLatLng_try', e);
                }
              })
              .catch((error) => {
                CommonBugFender('TestsCart_getPlaceInfoByLatLng', error);
                console.log(error, 'geocode error');
              });
          },
          (error) => {},
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
        console.log('pincode');
      } else {
        filterClinics(locationDetails.pincode || '');
      }
    }
  }, [testCentresLoaded]);

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
      showAphAlert?.({
        title: string.common.uhOh,
        description: message,
      });
    }
  };
  const fetchAddresses = async () => {
    try {
      if (addresses?.length) {
        return;
      }
      setLoading!(true);
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
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      showAreaSelection
        ? fetchAreasForAddress(
            addresses?.[selectedAddressIndex]?.id,
            addresses?.[selectedAddressIndex]?.zipcode!,
            showAreaSelection
          )
        : getAreas();
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
    const pinCodeFromAddress = addresses?.[selectedAddressIndex]?.zipcode!;
    if (!!pinCodeFromAddress) {
      setPinCode?.(pinCodeFromAddress);
      setLoading?.(true);
      client
        .query<getPincodeServiceability, getPincodeServiceabilityVariables>({
          query: GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
          context: {
            sourceHeaders,
          },
          variables: {
            pincode: parseInt(pinCodeFromAddress, 10),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const serviceableData = g(data, 'getPincodeServiceability');
          if (serviceableData && serviceableData?.cityName != '') {
            setAddressCityId!(String(serviceableData?.cityID!) || '');
            setDeliveryAddressCityId!(String(serviceableData?.cityID));
            getDiagnosticsAvailability(serviceableData?.cityID!, cartItems)
              .then(({ data }) => {
                const diagnosticItems =
                  g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
                if (serviceableData?.areaSelectionEnabled) {
                  setShowAreaSelection(true);
                }
                //don't show the area and hit the nearestPCC api.
                else {
                  setShowAreaSelection(false);
                }
                updatePricesInCart(
                  diagnosticItems,
                  selectedAddressIndex,
                  serviceableData?.areaSelectionEnabled!
                );
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
            showAphAlert!({
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
          console.log('getDiagnosticsPincode serviceability Error\n', { e });
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

  const getAreas = async () => {
    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
    );
    try {
      const response = await getNearestPCCLocation();
      const { data } = response;
      const getAreaObject = g(data, 'getNearestArea', 'area');
      let obj = { key: getAreaObject?.id!, value: getAreaObject?.area! };
      setAreaSelected?.(obj);
      checkSlotSelection(obj);
      setWebEngageEventForAreaSelection(obj);
    } catch (e) {
      console.log({ e });
      CommonBugFender('TestsCart_', e);

      setselectedTimeSlot(undefined);
      setLoading?.(false);
      setWebEngageEventForAddressNonServiceable(addresses?.[selectedAddressIndex]?.zipcode!);

      //if goes in the catch then show the area selection.
      setShowAreaSelection(true);
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

          const priceToCompare = promoteCircle
            ? circlePrice
            : promoteDiscount
            ? discountPrice
            : price;
          const cartPriceToCompare = promoteCircle
            ? cartItem.circlePrice
            : promoteDiscount
            ? cartItem.discountPrice
            : cartItem.price;
          if (priceToCompare !== cartPriceToCompare) {
            //mrp
            //show the prices changed pop-over
            isPriceChange = true;
            showAphAlert!({
              unDismissable: true,
              title: string.common.uhOh,
              description: string.diagnostics.pricesChangedMessage,
              onPressOk: () => {
                hideAphAlert?.();
                shouldShowArea
                  ? fetchAreasForAddress(
                      addresses?.[selectedAddressIndex]?.id,
                      addresses?.[selectedAddressIndex]?.zipcode!,
                      shouldShowArea
                    )
                  : getAreas();
              },
            });
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

          showAphAlert?.({
            title: string.common.uhOh,
            description: string.diagnostics.pricesChangedMessage,
            onPressOk: () => {
              hideAphAlert?.();
              shouldShowArea
                ? fetchAreasForAddress(
                    addresses?.[selectedAddressIndex]?.id,
                    addresses?.[selectedAddressIndex]?.zipcode!,
                    shouldShowArea
                  )
                : getAreas();
            },
          });
        }
      });
      if (!isItemDisable && !isPriceChange) {
        isPriceChange = false;
        isItemDisable = false;
        shouldShowArea
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
        title={'TESTS CART'}
        titleStyle={{ marginLeft: 20 }}
        rightComponent={
          <View>
            <TouchableOpacity activeOpacity={1} onPress={() => _navigateToHomePage()}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(13),
                  color: theme.colors.APP_YELLOW,
                }}
              >
                ADD ITEMS
              </Text>
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

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
        ? 9
        : Number(diagnosticServiceabilityData?.cityId! || '9');
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
          console.log('findDiagnosticsItemsForCityId\n', { data });
          const product = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics');
          console.log({ product });

          if (product) {
            func && func(product[0]!);

            if (comingFrom == 'diagnosticServiceablityChange') {
              product.map((item) => {
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

                updateCartItem!({
                  id: item?.itemId!.toString() || product?.[0]?.id!,
                  name: item?.itemName,
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
        })
        .catch((e) => {
          CommonBugFender('TestsCart_fetchPackageDetails', e);
          console.log({ e });
          errorAlert();
        })
        .finally(() => {
          setLoading!(false);
        });
    }
  };

  /**
   * fetching the areas
   */

  const fetchAreasForAddress = (id: string, pincode: string, shouldCallApi?: boolean) => {
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
          itemIDs: cartItemsWithId,
        },
      })
      .then(({ data }) => {
        setLoading?.(false);
        const getDiagnosticAreas = g(data, 'getAreas', 'areas') || [];
        if (data?.getAreas?.status) {
          setDiagnosticAreas?.(getDiagnosticAreas);
        } else {
          setDeliveryAddressId && setDeliveryAddressId('');
          setDiagnosticAreas?.([]);
          setAreaSelected?.({});
          setselectedTimeSlot(undefined);
          setLoading?.(false);
          setWebEngageEventForAddressNonServiceable(pincode);
          showAphAlert!({
            title: string.common.uhOh,
            description: string.diagnostics.areaNotAvailableMessage,
          });
        }
      })
      .catch((e) => {
        setLoading?.(false);
        setDiagnosticAreas?.([]);
        setAreaSelected?.({});
        setselectedTimeSlot(undefined);
        setWebEngageEventForAddressNonServiceable(pincode);
        CommonBugFender('TestsCart_getArea selection', e);
        console.log('error' + e);
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
          const imageUrl =
            test.thumbnail && !test.thumbnail.includes('/default/placeholder')
              ? test.thumbnail.startsWith('http')
                ? test.thumbnail
                : `${AppConfig.Configuration.IMAGES_BASE_URL}${test.thumbnail}`
              : '';
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
                        source: 'Cart Page',
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
                cartItems?.length == 0 ? setDeliveryAddressId!('') : null;
                onRemoveCartItem(test);
              }}
              isCardExpanded={true}
              packOfCount={test.mou}
              duplicateArray={duplicateNameArray}
            />
          );
        })}
      </View>
    );
  };

  const checkSlotSelection = (
    item: areaObject | DiagnosticArea | any,
    changedDate?: Date,
    comingFrom?: string
  ) => {
    let dateToCheck = !!changedDate && comingFrom != '' ? changedDate : date;
    setLoading?.(true);
    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
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
          areaID: Number((item as any).key!),
          itemIds: cartItemsWithId,
        },
      })
      .then(({ data }) => {
        const diagnosticSlots = g(data, 'getDiagnosticSlotsCustomized', 'slots') || [];
        console.log('ORIGINAL DIAGNOSTIC SLOTS', { diagnosticSlots });

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

        console.log('ARRAY OF SLOTS', { slotsArray });

        // if slot is empty then refetch it for next date
        const isSameDate = moment().isSame(moment(dateToCheck), 'date');
        if (isSameDate && slotsArray?.length == 0) {
          setTodaySlotNotAvailable(true);
          let changedDate = moment(dateToCheck) //date
            .add(1, 'day')
            .toDate();
          setDate(changedDate);
          checkSlotSelection(item, changedDate);
        } else {
          setSlots(slotsArray);
          todaySlotNotAvailable && setTodaySlotNotAvailable(false);
          const slotDetails = slotsArray?.[0];
          console.log({ slotDetails });
          slotsArray?.length && setselectedTimeSlot(slotDetails);

          setDiagnosticSlot!({
            slotStartTime: slotDetails?.slotInfo?.startTime!,
            slotEndTime: slotDetails?.slotInfo?.endTime!,
            date: dateToCheck?.getTime(), //date
            employeeSlotId: slotDetails?.slotInfo?.slot!,
            diagnosticBranchCode: slotDetails?.diagnosticBranchCode,
            diagnosticEmployeeCode: slotDetails?.employeeCode,
            city: selectedAddr ? selectedAddr?.city! : '', // not using city from this in order place API
          });
          setLoading?.(false);
        }

        comingFrom == 'errorState' ? setDisplaySchedule(true) : null; //show slot popup

        setDeliveryAddressId?.(addresses?.[selectedAddressIndex]?.id);
        setPinCode?.(addresses?.[selectedAddressIndex]?.zipcode!);
      })
      .catch((e) => {
        CommonBugFender('TestsCart_checkServicability', e);
        console.log('Error occured', { e });
        setDiagnosticSlot && setDiagnosticSlot(null);
        setselectedTimeSlot(undefined);
        const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';
        setLoading?.(false);
        if (noHubSlots) {
          setDeliveryAddressId?.(addresses?.[selectedAddressIndex]?.id);
          setPinCode?.(addresses?.[selectedAddressIndex]?.zipcode!);
          showAphAlert!({
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
          setDeliveryAddressId && setDeliveryAddressId('');
          setDiagnosticAreas?.([]);
          setAreaSelected?.({});
          setselectedTimeSlot(undefined);
          showAphAlert!({
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

  const renderHomeDelivery = () => {
    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
    );
    const addressListLength = addresses?.length;
    const spliceStartIndex =
      selectedAddressIndex == addressListLength - 1
        ? selectedAddressIndex - 1
        : selectedAddressIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;

    return (
      <View
        style={{ marginTop: 8, marginHorizontal: 16 }}
        pointerEvents={cartItems?.length > 0 && !isMinor ? 'auto' : 'none'}
      >
        {addresses?.slice(startIndex, startIndex + 2).map((item, index, array) => {
          return (
            <RadioSelectionItem
              key={item?.id}
              title={formatAddressWithLandmark(item)}
              showMultiLine={true}
              subtitle={formatNameNumber(item)}
              subtitleStyle={styles.subtitleStyle}
              isSelected={deliveryAddressId == item?.id}
              onPress={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Check service availability');
                const tests = cartItems?.filter(
                  (item) => item.collectionMethod == TEST_COLLECTION_TYPE.CENTER
                );
                const isSelectedAddressWithNoLatLng = isAddressLatLngInValid(item);

                if (tests?.length) {
                  showAphAlert!({
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
                      item
                    );
                  } else {
                    AddressSelectedEvent(item);
                    setDeliveryAddressId?.(item.id);
                    // add a check if same delivery id is there then do nothing.
                    if (deliveryAddressId !== item?.id) {
                      setDiagnosticAreas?.([]);
                      setAreaSelected?.({});
                      setDiagnosticSlot?.(null);
                    }
                  }
                }
              }}
              containerStyle={{ marginTop: 16 }}
              showEditIcon={true}
              onPressEdit={() => _navigateToEditAddress('Update', item, AppRoutes.TestsCart)}
              hideSeparator={index + 1 === array?.length}
            />
          );
        })}
        <View style={[styles.rowSpaceBetweenStyle, { paddingBottom: 16 }]}>
          <Text
            style={styles.yellowTextStyle}
            onPress={() => {
              postPharmacyAddNewAddressClick('Diagnostics Cart');
              props.navigation.navigate(AppRoutes.AddAddressNew, {
                addOnly: true,
                source: 'Diagnostics Cart' as AddressSource,
              });
              setDiagnosticSlot && setDiagnosticSlot(null);
              setselectedTimeSlot(undefined);
            }}
          >
            ADD NEW ADDRESS
          </Text>
          <View>
            {addresses?.length > 2 && (
              <Text
                style={styles.yellowTextStyle}
                onPress={() => {
                  props.navigation.navigate(AppRoutes.SelectDeliveryAddress, {
                    isTest: true,
                    selectedAddressId: deliveryAddressId,
                    isChanged: (val: boolean, id?: string, pincode?: string) => {
                      if (val && id) {
                        const selectedAddressIndex = addresses?.findIndex(
                          (address) => address?.id == id
                        );
                        const selectedAddress = addresses?.[selectedAddressIndex];
                        const isSelectedAddressWithNoLatLng = isAddressLatLngInValid(
                          selectedAddress
                        );
                        if (isSelectedAddressWithNoLatLng) {
                          renderAlert(
                            string.diagnostics.updateAddressLatLngMessage,
                            'updateLocation',
                            selectedAddress
                          );
                        } else {
                          setDeliveryAddressId && setDeliveryAddressId(id);
                          if (deliveryAddressId !== id) {
                            setDiagnosticAreas?.([]);
                            setAreaSelected?.({});
                            setDiagnosticSlot?.(null);
                            setselectedTimeSlot(undefined);
                          }
                        }
                      }
                    },
                  });
                }}
              >
                VIEW ALL
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  function isAddressLatLngInValid(address: any) {
    let isInvalid =
      address?.latitude == null ||
      address?.longitude == null ||
      address?.latitude == 0 ||
      address?.longitude == 0;

    return isInvalid;
  }

  useEffect(() => {
    if (pinCode?.length !== 6) {
      setSlicedStoreList([]);
      setClinicId!('');
    }
  }, [pinCode]);

  const fetchStorePickup = () => {
    setStorePickUpLoading(true);
    searchClinicApi()
      .then((data) => {
        setStorePickUpLoading(false);
        aphConsole.log('clinic response', data.data.data, data);
        setClinics && setClinics(data.data.data || []);
        setTimeout(() => {
          setTestCentresLoaded(true);
        }, 100);
        updateClinicSelection();
      })
      .catch((e) => {
        CommonBugFender('TestsCart_searchClinicApi', e);
        setStorePickUpLoading(false);
      });
  };

  const filterClinics = (key: string, isId?: boolean, hideLoader?: boolean) => {
    if (isId) {
      const data = clinics.filter((item) => item.CentreCode === key);
      aphConsole.log('iid filer=', data);
      filterClinics(pinCode, false, true);
      setClinicDetails(data);
    } else {
      if (isValidPinCode(key)) {
        setPinCode && setPinCode(key);
        if (key.length == 6) {
          Keyboard.dismiss();
          !hideLoader && setStorePickUpLoading(true);
          getPlaceInfoByPincode(key)
            .then((data) => {
              const city = (
                (data.data.results[0].address_components || []).find(
                  (item: any) => item.types.indexOf('locality') > -1
                ) || {}
              ).long_name;
              aphConsole.log('cityName', city);
              let filterArray;
              city &&
                (filterArray = clinics.filter((item) =>
                  item.City.toLowerCase().includes(city.toLowerCase())
                ));

              setClinicDetails(filterArray || []);
              setSlicedStoreList((filterArray || []).slice(0, 2));
            })
            .catch((e) => {
              CommonBugFender('TestsCart_filterClinics', e);
              setClinicDetails([]);
            })
            .finally(() => {
              setStorePickUpLoading(false);
            });
        }
      }
    }
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', () => {
      updateClinicSelection();
    });
    const _willBlurSubscription = props.navigation.addListener('willBlur', () => {
      updateClinicSelection();
    });
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, [clinics, clinicId, clinicDetails]);

  const [slicedStoreList, setSlicedStoreList] = useState<Clinic[]>([]);

  const updateClinicSelection = () => {
    const selectedStoreIndex =
      clinicDetails && clinicDetails.findIndex(({ CentreCode }) => CentreCode == clinicId);
    const storesLength = clinicDetails && clinicDetails.length;
    const spliceStartIndex =
      selectedStoreIndex == storesLength! - 1 ? selectedStoreIndex - 1 : selectedStoreIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const _slicedStoreList = [...clinicDetails!].slice(startIndex, startIndex! + 2);
    setSlicedStoreList(_slicedStoreList);
  };

  const renderStorePickup = () => {
    return (
      <View style={{ margin: 16, marginTop: 20 }}>
        <TextInputComponent
          value={`${pinCode}`}
          maxLength={6}
          onChangeText={(pincode) => {
            filterClinics(pincode);
          }}
          placeholder={'Enter Pincode'}
        />
        {storePickUpLoading && <ActivityIndicator color="green" size="large" />}
        {!storePickUpLoading && pinCode.length == 6 && slicedStoreList!.length == 0 && (
          <Text
            style={{
              paddingTop: 10,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: '#0087ba',
            }}
          >
            {string.diagnostics.nonServiceablePinCodeMsg}
          </Text>
        )}

        {slicedStoreList.map((item, index, array) => (
          <RadioSelectionItem
            key={item.CentreCode}
            title={`${item.CentreName}\n${item.Locality},${item.City},${item.State}`}
            isSelected={clinicId === item.CentreCode}
            onPress={() => {
              CommonLogEvent(AppRoutes.TestsCart, 'Set store id');
              setDiagnosticClinic!({ ...item, date: date.getTime() });
              setClinicId && setClinicId(item.CentreCode);
            }}
            containerStyle={{ marginTop: 16 }}
            hideSeparator={index == array.length - 1}
          />
        ))}
        <View>
          {clinicDetails!.length > 2 && (
            <Text
              style={{ ...styles.yellowTextStyle, textAlign: 'right', paddingBottom: 0 }}
              onPress={() =>
                props.navigation.navigate(AppRoutes.ClinicSelection, {
                  pincode: pinCode,
                  clinics: clinicDetails,
                })
              }
            >
              VIEW ALL
            </Text>
          )}
        </View>
      </View>
    );
  };

  /**
   * if address selected + if area serviceable
   */
  const renderPickupHours = () => {
    const showTime = deliveryAddressId && areaSelected && !isEmptyObject(areaSelected);
    return (
      <View>
        {showTime ? (
          <>
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.dateTextStyle}>Date</Text>
              <Text style={styles.dateTextStyle}>
                {moment(selectedTimeSlot?.date).format('DD MMM, YYYY')}
              </Text>
            </View>
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.dateTextStyle}>Time</Text>
              <Text style={styles.dateTextStyle}>
                {selectedTimeSlot
                  ? `${formatTestSlot(selectedTimeSlot.slotInfo.startTime!)}`
                  : 'No slot selected'}
              </Text>
            </View>
            {renderPhelboTimeView()}
          </>
        ) : null}

        <Text
          style={[
            styles.yellowTextStyle,
            { padding: 0, paddingTop: 20, alignSelf: 'flex-end', opacity: showTime ? 1 : 0.5 },
          ]}
          onPress={() => {
            showTime && setDisplaySchedule(true);
          }}
        >
          {showTime ? 'PICK ANOTHER SLOT' : 'SELECT SLOT'}
        </Text>
      </View>
    );
  };

  const renderPhelboTimeView = () => {
    return (
      <View style={styles.phelboTextView}>
        <InfoIconRed style={styles.infoIconStyle} />
        <Text style={styles.phleboText}>{string.diagnostics.cartPhelboTxt}</Text>
      </View>
    );
  };

  const renderClinicHours = () => {
    return (
      <View>
        {clinicHours.map(({ week, time }) => {
          return (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.dateTextStyle}>{week}</Text>
              <Text style={styles.dateTextStyle}>{time}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  /**
   * active only when added from the 0th tab + deliveryAddress selected
   */
  const renderAreaSelectionCard = () => {
    const isSelectable = selectedTab === tabs[0].title && deliveryAddressId;
    const options = diagnosticAreas.map((item: any) => ({ key: item.id, value: item.area }));
    return (
      <>
        {selectedTab === tabs[0].title ? (
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              marginHorizontal: 20,
              margin: 16,
              padding: 16,
            }}
          >
            <MaterialMenu
              options={options}
              itemContainer={styles.menuItemContainer}
              menuContainerStyle={[styles.menuMenuContainerStyle]}
              scrollViewContainerStyle={styles.menuScrollViewContainerStyle}
              itemTextStyle={styles.menuItemTextStyle}
              bottomPadding={styles.menuBottomPadding}
              onPress={(item) => {
                setAreaSelected!(item);
                checkSlotSelection(item);
                setWebEngageEventForAreaSelection(item);
                // checkServicability(selectedAddress);
              }}
            >
              {renderAreaSelectionField()}
            </MaterialMenu>
          </View>
        ) : null}
      </>
    );
  };

  const renderAreaSelectionField = () => {
    const isAreaSelectable =
      Object.keys(areaSelected).length === 0 && areaSelected.constructor === Object;
    return (
      <View style={{ paddingLeft: 15, marginTop: 3.5 }}>
        <View style={{ marginTop: -7.5 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '90%' }}>
              <Text
                style={{
                  ...theme.viewStyles.text(
                    'M',
                    15,
                    isAreaSelectable
                      ? diagnosticAreas.length > 0
                        ? '#01475b'
                        : 'rgba(1,48,91, 0.3)'
                      : '#01475b',
                    1,
                    18
                  ),
                  marginBottom: 5,
                }}
              >
                {isAreaSelectable ? ' Select area' : (areaSelected as areaObject).value}
              </Text>
              <Spearator style={[styles.locationTextUnderline]} />
            </View>
            <View style={styles.dropdownGreenContainer}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTimingCard = () => {
    return selectedTab === tabs[0].title || (selectedTab === tabs[1].title && clinicId) ? (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          marginHorizontal: 20,
          marginTop: 4,
          marginBottom: 24,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <CalendarShow />
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.SHERPA_BLUE,
              lineHeight: 24,
              paddingLeft: 16,
            }}
          >
            {selectedTab === tabs[0].title ? tabs[0].subtitle : tabs[1].subtitle}
          </Text>
        </View>
        <View style={[styles.separatorStyle, { marginTop: 10, marginBottom: 12.5 }]} />
        {selectedTab === tabs[0].title ? renderPickupHours() : renderClinicHours()}
      </View>
    ) : (
      <View style={{ padding: 12 }}></View>
    );
  };

  const renderDelivery = () => {
    return (
      <View>
        {renderLabel('WHERE TO COLLECT SAMPLE FROM?')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          <TabsComponent
            style={{
              borderRadius: 0,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: 'rgba(2, 71, 91, 0.2)',
            }}
            data={tabs}
            onChange={(selectedTab: string) => {
              setselectedTab(selectedTab);
              setClinicId!('');
              setDeliveryAddressId!('');
              // setPinCode!('');
            }}
            selectedTab={selectedTab}
          />
          {selectedTab === tabs[0].title ? renderHomeDelivery() : renderStorePickup()}
        </View>
        {showAreaSelection ? renderAreaSelectionCard() : null}
        {renderTimingCard()}
      </View>
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

  const renderTotalCharges = () => {
    const isPPEKitChargesApplicable = cartItems.map((item) =>
      COVID_NOTIFICATION_ITEMID.includes(item.id)
    );
    const ppeKitCharges = isPPEKitChargesApplicable.find((item) => item == true);
    const anyCartSaving = isDiagnosticCircleSubscription ? cartSaving + circleSaving : cartSaving;

    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        {/* {renderCouponView()} */}
        {isDiagnosticCircleSubscription && circleSaving > 0 ? renderCircleMemberBanner() : null}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            // marginTop: 4,
            marginBottom: 12,
            padding: 16,
            marginTop: 16,
          }}
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
          {selectedTab == tabs[0].title && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.blueTextStyle}>Home Collection Charges</Text>
              <Text style={styles.blueTextStyle}>
                {string.common.Rs} {hcCharges.toFixed(2)}
              </Text>
            </View>
          )}
          {/* {selectedTab == tabs[0].title && ppeKitCharges && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.blueTextStyle}>PPE kit charges</Text>
              <Text style={styles.blueTextStyle}>{string.common.Rs} 500.00</Text>
            </View>
          )} */}

          {selectedTab == tabs[0].title && normalSaving > 0 && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                Cart Saving
              </Text>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                - {string.common.Rs} {normalSaving.toFixed(2)}
              </Text>
            </View>
          )}
          {selectedTab == tabs[0].title && isDiagnosticCircleSubscription && circleSaving > 0 && (
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
          {selectedTab == tabs[0].title && discountSaving > 0 && (
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
        style={{
          ...theme.viewStyles.cardViewStyle,
          marginHorizontal: 20,
          // marginTop: 4,
          marginBottom: 50,
          padding: 16,
          marginTop: 10,
          flexDirection: 'row',
          borderColor: theme.colors.APP_GREEN,
          borderWidth: 2,
          borderRadius: 5,
          borderStyle: 'dashed',
          justifyContent: imagePosition == 'left' ? 'flex-start' : 'center',
        }}
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

  const medicineSuggestions = [
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
  ];

  const renderMedicineItem = (
    item: { name: string; cost: string },
    index: number,
    length: number
  ) => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          shadowRadius: 4,
          marginBottom: 20,
          marginTop: 11,
          marginHorizontal: 6,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <TestsIcon />
        <Text style={[styles.blueTextStyle, { paddingTop: 4 }]}>{item.name}</Text>
        <View style={[styles.separatorStyle, { marginTop: 3, marginBottom: 5 }]} />
        <Text style={styles.medicineCostStyle}>{item.cost}</Text>
      </View>
    );
  };

  const renderTestSuggestions = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          paddingTop: 16,
          marginTop: 12,
        }}
      >
        {renderLabel('PEOPLE ALSO BOUGHT')}

        <FlatList
          contentContainerStyle={{
            marginHorizontal: 14,
            paddingRight: 28,
          }}
          horizontal={true}
          bounces={false}
          data={medicineSuggestions}
          renderItem={({ item, index }) =>
            renderMedicineItem(item, index, medicineSuggestions.length)
          }
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const disableProceedToPay = !(
    cartItems?.length > 0 &&
    forPatientId &&
    !!(
      (deliveryAddressId &&
        selectedTimeSlot &&
        selectedTimeSlot?.date &&
        selectedTimeSlot?.slotInfo?.startTime) ||
      clinicId
    ) &&
    (uploadPrescriptionRequired
      ? physicalPrescriptions.length > 0 || ePrescriptions.length > 0
      : true)
  );

  // const multiplePhysicalPrescriptionUpload = (prescriptions = physicalPrescriptions) => {
  //   return Promise.all(
  //     prescriptions.map((item) =>
  //       client.mutate<uploadFile, uploadFileVariables>({
  //         mutation: UPLOAD_FILE,
  //         fetchPolicy: 'no-cache',
  //         variables: {
  //           fileType: item.fileType,
  //           base64FileInput: item.base64,
  //         },
  //       })
  //     )
  //   );
  // };

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
    console.log('unUploadedPres', unUploadedPres);
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
          console.log('precp:di', newuploadedPrescriptions);

          setPhysicalPrescriptions && setPhysicalPrescriptions([...newuploadedPrescriptions]);
          setisPhysicalUploadComplete(true);
        })
        .catch((e) => {
          CommonBugFender('TestsCart_physicalPrescriptionUpload', e);
          aphConsole.log({ e });
          setLoading!(false);
          showAphAlert!({
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
    setshowSpinner(true);
    if (selectedTab == tabs[0].title) {
      saveHomeCollectionOrder();
    } else {
      saveClinicOrder();
    }
  };

  const saveClinicOrder = () => {
    const { CentreCode, CentreName, City, State, Locality } = diagnosticClinic || {};
    const {
      slotStartTime,
      slotEndTime,
      employeeSlotId,
      date,
      diagnosticEmployeeCode,
      // city, // ignore city for now from this and take from "locationForDiagnostics" context
      diagnosticBranchCode,
    } = diagnosticSlot || {};
    const slotTimings = (slotStartTime && slotEndTime
      ? `${slotStartTime}-${slotEndTime}`
      : ''
    ).replace(' ', '');
    console.log(physicalPrescriptions, 'physical prescriptions');

    const orderInfo: DiagnosticOrderInput = {
      // <- for home collection order
      diagnosticBranchCode: CentreCode ? '' : diagnosticBranchCode!,
      diagnosticEmployeeCode: diagnosticEmployeeCode || '',
      employeeSlotId: employeeSlotId! || 0,
      slotTimings: slotTimings,
      patientAddressId: deliveryAddressId!,
      // for home collection order ->
      // <- for clinic order
      centerName: CentreName || '',
      centerCode: CentreCode || '',
      centerCity: City || '',
      centerState: State || '',
      centerLocality: Locality || '',
      // for clinic order ->
      city: (locationForDiagnostics || {}).city!,
      state: (locationForDiagnostics || {}).state!,
      stateId: `${(locationForDiagnostics || {}).stateId!}`,
      cityId: `${(locationForDiagnostics || {}).cityId!}`,
      areaId: (areaSelected || ({} as any)).key!,
      diagnosticDate: moment(date).format('YYYY-MM-DD'),
      prescriptionUrl: [
        ...physicalPrescriptions.map((item) => item.uploadedUrl),
        ...ePrescriptions.map((item) => item.uploadedUrl),
      ].join(','),
      paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD,

      // prismPrescriptionFileId: [
      //   ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
      //   ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
      // ].join(','),
      totalPrice: grandTotal,
      patientId: (currentPatient && currentPatient.id) || '',
      items: cartItems.map(
        (item) =>
          ({
            itemId: typeof item.id == 'string' ? parseInt(item.id) : item.id,
            price: (item.specialPrice as number) || item.price,
            quantity: 1,
            groupPlan: DIAGNOSTIC_GROUP_PLAN.ALL,
          } as DiagnosticLineItem)
      ),
      bookingSource: BOOKINGSOURCE.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
    };

    console.log(JSON.stringify({ diagnosticOrderInput: orderInfo }));
    saveOrder(orderInfo)
      .then(({ data }) => {
        console.log('data >>>>', data);
      })
      .catch((error) => {
        CommonBugFender('TestsCheckoutScene_saveOrder', error);
        console.log('SaveDiagnosticOrder API Error\n', { error });
        setshowSpinner(false);
        setLoading!(false);
        showAphAlert!({
          unDismissable: true,
          title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
          description: string.diagnostics.bookingOrderFailedMessage,
        });
      })
      .finally(() => {
        setshowSpinner(false);
        setLoading!(false);
      });
  };

  const saveHomeCollectionOrder = () => {
    console.log('unique id' + validateCouponUniqueId);
    //for circle members if unique id is blank, show error
    if (
      isDiagnosticCircleSubscription &&
      (validateCouponUniqueId == '' || validateCouponUniqueId == null)
    ) {
      renderAlert(string.common.tryAgainLater);
      setshowSpinner(false);
    } else {
      console.log({ diagnosticSlot });
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
        // slotTimings: slotTimings,
        slotDateTimeInUTC: dateTimeInUTC,
        totalPrice: grandTotal,
        prescriptionUrl: [
          ...physicalPrescriptions.map((item) => item.uploadedUrl),
          ...ePrescriptions.map((item) => item.uploadedUrl),
        ].join(','),
        diagnosticDate: formattedDate,
        bookingSource: DiagnosticsBookingSource.MOBILE,
        deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
        // paymentType: isCashOnDelivery
        //   ? DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD
        //   : DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT,
        items: createItemPrice(),
        slotId: employeeSlotId?.toString() || '0',
        areaId: (areaSelected || ({} as any)).key!,
        collectionCharges: hcCharges,
        totalPriceExcludingDiscounts: totalPriceExcludingAnyDiscounts + hcCharges,
        subscriptionInclusionId: null,
        userSubscriptionId: circleSubscriptionId,
        // prismPrescriptionFileId: [
        //   ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
        //   ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
        // ].join(','),
      };

      console.log('home collection \n', { diagnosticOrderInput: bookingOrderInfo });
      saveHomeCollectionBookingOrder(bookingOrderInfo)
        .then(async ({ data }) => {
          // in case duplicate test, price mismatch, address mismatch, slot issue
          if (!data?.saveDiagnosticBookHCOrder?.status) {
            let message =
              data?.saveDiagnosticBookHCOrder?.errorMessageToDisplay ||
              string.diagnostics.bookingOrderFailedMessage;
            //itemIds will only come in case of duplicate
            let itemIds = data?.saveDiagnosticBookHCOrder?.attributes?.itemids;
            if (itemIds?.length! > 0) {
              showAphAlert?.({
                unDismissable: true,
                title: string.common.uhOh,
                description: message,
                onPressOk: () => {
                  removeDuplicateCartItems(itemIds!, bookingOrderInfo?.items);
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
          } else {
            const orderId = data?.saveDiagnosticBookHCOrder?.orderId || '';
            const displayId = data?.saveDiagnosticBookHCOrder?.displayId || '';
            const orders: OrderVerticals = {
              diagnostics: [{ order_id: orderId, amount: grandTotal }],
            };
            const orderInput: OrderCreate = {
              orders: orders,
              total_amount: grandTotal,
              patient_id: currentPatient?.id,
            };
            const response = await createOrderInternal(orderInput);
            if (response?.data?.createOrderInternal?.success) {
              const isInitiated: boolean = await isSDKInitialised();
              !isInitiated && initiateSDK(currentPatient?.mobileNumber, currentPatient?.id);
              const orderInfo = {
                orderId: orderId,
                displayId: displayId,
                diagnosticDate: date!,
                slotTime: slotTimings!,
                cartSaving: cartSaving,
                circleSaving: circleSaving,
                cartHasAll: allItems != undefined ? true : false,
                amount: grandTotal,
              };
              const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED] = {
                'Order id': orderId,
                Pincode: parseInt(selectedAddr?.zipcode!),
                'Patient UHID': g(currentPatient, 'id'),
                'Total items in cart': cartItems.length,
                'Order amount': grandTotal,
                'Appointment Date': moment(orderDetails?.diagnosticDate!).format('DD/MM/YYYY'),
                'Appointment time': slotStartTime!,
                'Item ids': cartItemsWithId,
              };

              props.navigation.navigate(AppRoutes.PaymentMethods, {
                paymentId: response?.data?.createOrderInternal?.payment_order_id!,
                amount: grandTotal,
                orderId: orderId,
                orderDetails: orderInfo,
                eventAttributes,
              });
            }
          }
        })
        .catch((error) => {
          CommonBugFender('TestsCheckoutScene_saveOrder', error);
          console.log('DiagnosticBookHomeCollectionInput API Error\n', { error });
          setshowSpinner(false);
          setLoading!(false);
          showAphAlert!({
            unDismissable: true,
            title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
            description: string.diagnostics.bookingOrderFailedMessage,
          });
        })
        .finally(() => {
          setshowSpinner(false);
          setLoading!(false);
        });
    }
  };

  const removeDisabledCartItems = (disabledCartItemIds: string[]) => {
    hideAphAlert!();
    setCartItems!(
      cartItems?.filter((cItem) => !disabledCartItemIds?.find((dItem) => dItem == cItem?.id))
    );
  };

  function createItemPrice() {
    pricesForItemArray = cartItems?.map(
      (item) =>
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
        } as DiagnosticLineItem)
    );
    return pricesForItemArray;
  }

  const onPressProceedToPay = () => {
    postwebEngageProceedToPayEvent();
    proceedForBooking();
  };

  function removeDuplicateCartItems(itemIds: string, pricesOfEach: any) {
    //can be used only when itdose starts returning all id
    const getItemIds = itemIds?.split(',');
    const allInclusions = cartItems?.map((item) => item?.inclusions);
    const getPricesForItem = createItemPrice();

    const mergedInclusions = allInclusions?.flat(1); //from array level to single array
    const duplicateItems_1 = mergedInclusions?.filter(
      (e: any, i: any, a: any) => a.indexOf(e) !== i
    );

    const duplicateItems = [...new Set(duplicateItems_1)];
    hideAphAlert?.();

    if (duplicateItems?.length) {
      checkDuplicateItems_Level1(getPricesForItem, duplicateItems, getItemIds);
    } else {
      checkDuplicateItems_Level2(getPricesForItem, getItemIds);
    }
  }

  function checkDuplicateItems_Level1(
    getPricesForItem: any,
    duplicateItems: any,
    itemIdFromBackend: any
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
          checkDuplicateItems_Level2(getPricesForItem, itemIdFromBackend);
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
        console.log({ e });
        //if api fails then also show the name... & remove..
        CommonBugFender('TestsCart_getDiagnosticsAvailability', e);
        setLoading!(false);
        errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
      });
  }

  const checkDuplicateItems_Level2 = (pricesForItem: any, getItemIds: any) => {
    //no inclusion level duplicates are found...
    if (getItemIds?.length > 0) {
      const newItems = getItemIds?.map((item: string) => Number(item));

      //get the prices for both the items,
      const getDuplicateItems = pricesForItem
        ?.filter((item: any) => newItems?.includes(item?.itemId))
        .sort((a: any, b: any) => b?.price - a?.price);

      const itemsToRemove = getDuplicateItems?.splice(1, getDuplicateItems?.length - 1);
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

      const highPricesItem = cartItems?.map((cItem) =>
        Number(cItem?.id) == Number(getDuplicateItems?.[0]?.itemId)
          ? !!cItem?.name && nameFormater(cItem?.name, 'default')
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
      description: `The "${duplicateTests}" has been removed from your cart as it is already included in another test "${higherPricesName}" in your cart. Kindly proceed to pay the revised amount`,
      onPressOk: () => {
        setLoading?.(false);
        hideAphAlert?.();
      },
    });
  };

  function onChangeCartItems(updatedCartItems: any, removedTest: string, removedTestItemId: any) {
    setDiagnosticSlot?.(null);
    setAreaSelected?.({});
    setDiagnosticAreas?.([]);
    setCartItems?.(updatedCartItems);
    //refetch the areas
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      showAreaSelection
        ? fetchAreasForAddress(
            addresses?.[selectedAddressIndex]?.id,
            addresses?.[selectedAddressIndex]?.zipcode!,
            showAreaSelection
          )
        : getAreas();
      DiagnosticRemoveFromCartClicked(
        removedTestItemId,
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
      console.log({ CouponInput });
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

        console.log({ validateDiagnosticCouponApi });
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

  const fetchHC_ChargesForTest = async (slotVal: string) => {
    const selectedAddressIndex = addresses.findIndex((address) => address?.id == deliveryAddressId);
    const pinCodeFromAddress = addresses[selectedAddressIndex]!.zipcode!;
    setPinCode!(pinCode);
    setLoading!(true);
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
          itemIDs: itemWithId,
          totalCharges: grandTotal, //removed cartTotal due APP-7386
          slotID: slotVal!,
          pincode: parseInt(pinCodeFromAddress, 10),
        },
        fetchPolicy: 'no-cache',
      });

      let getCharges = g(HomeCollectionChargesApi.data, 'getDiagnosticsHCCharges', 'charges') || 0;
      if (getCharges != null) {
        setHcCharges!(getCharges);
      }
      setLoading!(false);
    } catch (error) {
      setLoading!(false);
      // renderAlert(`Something went wrong, unable to fetch Home collection charges.`);
    }
  };

  const renderProfiles = () => {
    return (
      <View>
        {renderLabel('WHO ARE THESE TESTS FOR?')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 20,
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          {/* {renderProfilePicker()} */}
          <ProfileList
            defaultText={'Select who are these tests for'}
            saveUserChange={true}
            selectedProfile={profile}
            navigation={props.navigation}
          ></ProfileList>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 14.5 : 16),
              lineHeight: 24,
              marginTop: 8,
              color: theme.colors.SKY_BLUE,
            }}
          >
            {`All the tests must be for one person. Tests for multiple profiles will require separate purchases.`}
          </Text>
        </View>
      </View>
    );
  };

  const renderPatientDetails = () => {
    const patientDetailsText = `${currentPatient?.firstName || ''} ${currentPatient?.lastName ||
      ''}, ${currentPatient?.gender || ''}, ${
      currentPatient.dateOfBirth ? getAge(currentPatient.dateOfBirth) || '' : ''
    }`;
    return (
      <View style={styles.patientDetailsViewStyle}>
        <View style={styles.patientNameViewStyle}>
          <Text style={styles.patientNameTextStyle}>{string.diagnostics.patientNameText}</Text>
          <Text
            style={[styles.patientNameTextStyle, styles.changeTextStyle]}
            onPress={() => setShowPatientListOverlay(true)}
          >
            {string.diagnostics.changeText}
          </Text>
        </View>
        <Text style={styles.patientDetailsTextStyle}>{patientDetailsText}</Text>
        <Text style={styles.testReportMsgStyle}>{string.diagnostics.testReportMsgText}</Text>
        {addressText ? (
          <>
            <View style={styles.patientNameViewStyle}>
              <Text style={styles.patientNameTextStyle}>{string.diagnostics.homeVisitText}</Text>
              <Text
                style={[styles.patientNameTextStyle, styles.changeTextStyle]}
                onPress={() => showAddressPopup()}
              >
                {string.diagnostics.changeText}
              </Text>
            </View>
            <Text style={[styles.patientDetailsTextStyle, { marginBottom: 24 }]}>
              {addressText}
            </Text>
          </>
        ) : null}
        {showAreaSelection && !isEmptyObject(areaSelected) ? (
          <>
            <View style={styles.patientNameViewStyle}>
              <Text style={styles.patientNameTextStyle}>{string.diagnostics.areaText}</Text>
              <Text
                style={[styles.patientNameTextStyle, styles.changeTextStyle]}
                onPress={() => setShowSelectAreaOverlay(true)}
              >
                {string.diagnostics.changeText}
              </Text>
            </View>
            <Text style={[styles.patientDetailsTextStyle, { marginBottom: 24 }]}>
              {(areaSelected as any)?.value || ''}
            </Text>
          </>
        ) : null}
      </View>
    );
  };

  const setAddressList = (key: string) => {
    shopCart?.setDeliveryAddressId?.('');
    diagCart?.setDeliveryAddressId?.('');
    shopCart?.setAddresses?.([]);
    diagCart?.setAddresses?.([]);
    setDoctorJoinedChat?.(false);
  };

  const renderPatientListOverlay = () => {
    return showPatientListOverlay ? (
      <PatientListOverlay
        onPressClose={() => setShowPatientListOverlay(false)}
        onPressDone={(_selectedPatient: any) => {
          setShowPatientListOverlay(false);
          if (currentPatient?.id === _selectedPatient?.id) {
            return;
          } else if (!_selectedPatient?.dateOfBirth || !_selectedPatient?.gender) {
            setSelectedPatient(_selectedPatient);
            setShowPatientDetailsOverlay(true);
            return;
          }
          setCurrentPatientId?.(_selectedPatient?.id);
          AsyncStorage.setItem('selectUserId', _selectedPatient?.id);
          AsyncStorage.setItem('selectUserUHId', _selectedPatient?.uhid);
          setAddressList(_selectedPatient?.id);
        }}
        onPressAddNewProfile={() => {
          setShowPatientListOverlay(false);
          props.navigation.navigate(AppRoutes.EditProfile, {
            isEdit: false,
            isPoptype: true,
            mobileNumber: currentPatient?.mobileNumber,
          });
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
            .then((data) => {
              setLoading?.(false);
              getPatientApiCall();
            })
            .catch((e) => {
              setLoading?.(false);
              showAphAlert!({
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
    const showTime = deliveryAddressId && areaSelected && !isEmptyObject(areaSelected);
    return cartItems?.length > 0 ? (
      <TestProceedBar
        selectedTimeSlot={selectedTimeSlot}
        disableProceedToPay={disableProceedToPay}
        onPressAddDeliveryAddress={() => _onPressAddAddress()}
        onPressProceedtoPay={() => onPressProceedToPay()}
        onPressSelectDeliveryAddress={() => showAddressPopup()}
        showTime={showTime}
        onPressTimeSlot={() => showTime && setDisplaySchedule(true)}
        onPressSelectArea={() => setShowSelectAreaOverlay(true)}
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
                if (deliveryAddressId !== _address?.id) {
                  setDiagnosticAreas?.([]);
                  setAreaSelected?.({});
                  setDiagnosticSlot?.(null);
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

  const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);
  const addressText = selectedAddr ? formatAddressWithLandmark(selectedAddr) || '' : '';
  const zipCode = (deliveryAddressId && selectedAddr && selectedAddr.zipcode) || '0';
  return (
    <View style={{ flex: 1 }}>
      {displaySchedule && (
        <TestSlotSelectionOverlay
          heading="Schedule Appointment"
          date={date}
          areaId={(areaSelected as any)?.key!}
          maxDate={moment()
            .add(AppConfig.Configuration.DIAGNOSTIC_SLOTS_MAX_FORWARD_DAYS, 'day')
            .toDate()}
          isVisible={displaySchedule}
          isTodaySlotUnavailable={todaySlotNotAvailable}
          onClose={() => setDisplaySchedule(false)}
          slots={slots}
          zipCode={parseInt(zipCode, 10)}
          slotInfo={selectedTimeSlot}
          onSchedule={(date: Date, slotInfo: TestSlot) => {
            setDate(date);
            setselectedTimeSlot(slotInfo);
            setDiagnosticSlot!({
              slotStartTime: slotInfo?.slotInfo?.startTime!,
              slotEndTime: slotInfo?.slotInfo?.endTime!,
              date: date.getTime(),
              // employeeSlotId: parseInt(slotInfo.slotInfo.slot!),
              employeeSlotId: slotInfo?.slotInfo?.slot!,
              diagnosticBranchCode: slotInfo?.diagnosticBranchCode,
              diagnosticEmployeeCode: slotInfo?.employeeCode,
              city: selectedAddr ? selectedAddr.city! : '', // not using city from this in order place API
            });
            setWebEnageEventForAppointmentTimeSlot();
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
          <View style={{ marginVertical: 24 }}>
            {renderPatientDetails()}
            {renderItemsInCart()}
            {/* {renderProfiles()} */}
            {/* <MedicineUploadPrescriptionView
              isTest={true}
              navigation={props.navigation}
              isMandatory={false}
              listOfTest={[]}
            /> */}
            {/* {renderDelivery()} */}
            {renderTotalCharges()}
            {/* {renderTestSuggestions()} */}
          </View>
          <View style={{ height: 70 }} />
        </ScrollView>
        {/* <StickyBottomComponent defaultBG>
          <Button
            disabled={disableProceedToPay}
            title={'MAKE PAYMENT'}
            onPress={() => onPressProceedToPay()}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent> */}
        {renderTestProceedBar()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
const { text } = theme.viewStyles;
const { SHERPA_BLUE, APP_YELLOW } = theme.colors;
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
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    paddingTop: 16,
  },
  blueTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(screenWidth < 380 ? 14 : 16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
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
    marginHorizontal: 20,
  },
  patientNameViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  patientNameTextStyle: {
    ...text('B', 13, SHERPA_BLUE, 1, 20),
  },
  changeTextStyle: {
    color: APP_YELLOW,
  },
  patientDetailsTextStyle: {
    ...text('R', 12, SHERPA_BLUE, 1, 18),
  },
  testReportMsgStyle: {
    ...text('R', 10, SHERPA_BLUE, 0.7, 14),
    marginBottom: 24,
  },
  phelboTextView: {
    backgroundColor: '#FCFDDA',
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    marginVertical: '2%',
  },
  phleboText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 18,
    letterSpacing: 0.1,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.7,
    marginHorizontal: '2%',
  },
  infoIconStyle: { resizeMode: 'contain', height: 18, width: 18 },
});
