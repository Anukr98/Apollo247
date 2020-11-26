import {
  aphConsole,
  formatAddress,
  formatAddressWithLandmark,
  formatNameNumber,
  g,
  isValidTestSlot,
  TestSlot,
  TestSlotWithArea,
  formatTestSlot,
  formatTestSlotWithBuffer,
  getUniqueTestSlots,
  getTestSlotDetailsByTime,
  postWebEngageEvent,
  isValidTestSlotWithArea,
  isEmptyObject,
  getDiscountPercentage,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  DiagnosticData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { MedicineUploadPrescriptionView } from '@aph/mobile-patients/src/components/Medicines/MedicineUploadPrescriptionView';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  CalendarShow,
  CheckedIcon,
  CircleLogo,
  CouponIcon,
  CrossYellow,
  DropdownGreen,
  OrderPlacedCheckedIcon,
  RadioButtonIcon,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
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
  GET_DIAGNOSTIC_SLOTS,
  GET_PATIENT_ADDRESS_LIST,
  UPLOAD_DOCUMENT,
  SEARCH_DIAGNOSTICS_BY_ID,
  GET_DIAGNOSTIC_AREAS,
  GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
  GET_DIAGNOSTICS_HC_CHARGES,
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  VALIDATE_DIAGNOSTIC_COUPON,
  GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
  SAVE_DIAGNOSTIC_ORDER,
  SAVE_DIAGNOSTIC_HOME_COLLECTION_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getDiagnosticSlots,
  getDiagnosticSlotsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlots';
import {
  getDiagnosticsHCCharges_getDiagnosticsHCCharges,
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
  DiagnosticBookHomeCollectionInput,
  DiagnosticLineItem,
  DiagnosticOrderInput,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import {
  Clinic,
  DIAGNOSTIC_GROUP_PLAN,
  getPlaceInfoByLatLng,
  getPlaceInfoByPincode,
  searchClinicApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
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
  Modal,
  Platform,
} from 'react-native';
import {
  FlatList,
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import Geolocation from '@react-native-community/geolocation';
import { TestSlotSelectionOverlay } from '@aph/mobile-patients/src/components/Tests/TestSlotSelectionOverlay';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { postPharmacyAddNewAddressClick } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { AddressSource } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import { getAreas, getAreasVariables } from '@aph/mobile-patients/src/graphql/types/getAreas';
import {
  getDiagnosticSlotsWithAreaID,
  getDiagnosticSlotsWithAreaIDVariables,
} from '../../graphql/types/getDiagnosticSlotsWithAreaID';
import { colors } from 'react-native-elements';
import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import {
  vaidateDiagnosticCoupon,
  vaidateDiagnosticCouponVariables,
} from '../../graphql/types/vaidateDiagnosticCoupon';
import {
  getPincodeServiceability,
  getPincodeServiceabilityVariables,
} from '../../graphql/types/getPincodeServiceability';
import { fonts } from '../../theme/fonts';
import {
  SaveDiagnosticOrder,
  SaveDiagnosticOrderVariables,
} from '../../graphql/types/SaveDiagnosticOrder';
import {
  DiagnosticBookHomeCollection,
  DiagnosticBookHomeCollectionVariables,
} from '../../graphql/types/DiagnosticBookHomeCollection';
const { width: screenWidth } = Dimensions.get('window');
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';

const { width: winWidth } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;
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
    ...theme.fonts.IBMPlexSansMedium(16),
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
  scrollViewOuterView: {
    flexDirection: 'row',
    marginTop: '10%',
    width: '70%',
    height: 90,
  },
  orderPlacedText: {
    flexWrap: 'wrap',
    textAlign: 'left',
    alignSelf: 'center',
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 22,
    color: theme.colors.SKY_BLUE,
  },
  bookingIdText: {
    color: theme.colors.SHERPA_BLUE,
    ...fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
  },
  bookingNumberText: {
    color: theme.colors.APP_GREEN,
    ...fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    marginHorizontal: 4,
  },
  horizontalSeparator: { width: screenWidth - 40, marginLeft: -16, height: 1, opacity: 0.4 },
  placeholderText: {
    color: theme.colors.SHERPA_BLUE,
    ...fonts.IBMPlexSansRegular(11),
    lineHeight: 16,
    letterSpacing: 1,
  },
  contentText: {
    color: theme.colors.SHERPA_BLUE,
    ...fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
  },
  totalSavingOuterView: {
    marginVertical: 20,
    borderColor: theme.colors.APP_GREEN,
    borderWidth: 2,
    borderRadius: 5,
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderStyle: 'dashed',
  },
});

type clinicHoursData = {
  week: string;
  time: string;
};

export interface areaObject {
  key: string;
  value: string;
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

export interface TestsCartProps extends NavigationScreenProps {}

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
    cartTotal,
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
    clearDiagnoticCartInfo,
    cartSaving,
    circleSaving,
    isDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const {
    setAddresses: setMedAddresses,
    isCircleSubscription,
    setIsCircleSubscription,
    circleSubscriptionId,
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
    { title: 'Clinic Visit', subtitle: 'Clinic Hours' },
  ];

  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();

  const [selectedTab, setselectedTab] = useState<string>(clinicId ? tabs[1].title : tabs[0].title);
  const { currentPatient } = useAllCurrentPatients();
  const currentPatientId = currentPatient && currentPatient!.id;
  const client = useApolloClient();
  const {
    locationForDiagnostics,
    locationDetails,
    diagnosticServiceabilityData,
  } = useAppCommonData();

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
  const [addressCityId, setAddressCityId] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [isCashOnDelivery, setCashOnDelivery] = useState(true);
  const [validateCouponUniqueId, setValidateCouponUniqueId] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<orderDetails>();

  const itemsWithHC = cartItems!.filter((item) => item!.collectionMethod == 'HC');
  const itemWithId = itemsWithHC!.map((item) => parseInt(item.id!));

  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  const cartItemsWithId = cartItems!.map((item) => parseInt(item.id!));

  const saveOrder = (orderInfo: DiagnosticOrderInput) =>
    client.mutate<SaveDiagnosticOrder, SaveDiagnosticOrderVariables>({
      mutation: SAVE_DIAGNOSTIC_ORDER,
      variables: { diagnosticOrderInput: orderInfo },
    });

  const saveHomeCollectionBookingOrder = (orderInfo: DiagnosticBookHomeCollectionInput) =>
    client.mutate<DiagnosticBookHomeCollection, DiagnosticBookHomeCollectionVariables>({
      mutation: SAVE_DIAGNOSTIC_HOME_COLLECTION_ORDER,
      variables: { diagnosticOrderInput: orderInfo },
    });

  useEffect(() => {
    fetchAddresses();
  }, [currentPatient]);

  useEffect(() => {
    if (cartItemsWithId.length > 0) {
      fetchPackageDetails(cartItemsWithId, null, 'diagnosticServiceablityChange');
    }
  }, [diagnosticServiceabilityData]);

  useEffect(() => {
    if (selectedTab == tabs[0].title) {
      if (
        selectedTimeSlot?.slotInfo?.slot! &&
        areaSelected &&
        deliveryAddressId != '' &&
        cartItems.length > 0
      ) {
        validateDiagnosticCoupon();
        fetchHC_ChargesForTest(selectedTimeSlot!.slotInfo!.slot!);
      }
    } else {
      setHcCharges!(0);
    }
  }, [selectedTab, selectedTimeSlot, deliveryAddressId, cartItems]);

  useEffect(() => {
    if (deliveryAddressId != '') {
      getPinCodeServiceability();
    }
  }, [deliveryAddressId]);

  useEffect(() => {
    if (cartItems.length) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CART_VIEWED] = {
        'Patient UHID': g(currentPatient, 'uhid'),
        'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Total items in cart': cartItems.length,
        'Sub Total': cartTotal,
        'Delivery charge': deliveryCharges,
        'Total Discount': couponDiscount,
        'Net after discount': grandTotal,
        'Prescription Needed?': uploadPrescriptionRequired ? 'Mandatory' : 'Optional',
        'Cart Items': cartItems.map(
          (item) =>
            (({
              id: item.id,
              name: item.name,
              price: item.price,
              specialPrice: item.specialPrice || item.price,
            } as unknown) as DiagnosticsCartItem)
        ),
        'Service Area': 'Diagnostic',
      };
      if (diagnosticSlot) {
        eventAttributes['Home Collection'] = hcCharges;
      }
      if (coupon) {
        eventAttributes['Coupon code used'] = coupon.code;
      }
      postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CART_VIEWED, eventAttributes);
    }
  }, [hcCharges]);

  const postwebEngageProceedToPayEvent = () => {
    const diffInDays = date.getDate() - new Date().getDate();
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED] = {
      'Patient Name selected': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Total items in cart': cartItems.length,
      'Sub Total': cartTotal,
      // 'Delivery charge': deliveryCharges,
      'Net after discount': grandTotal,
      'Prescription Uploaded?': false, //from backend
      'Prescription Mandatory?': uploadPrescriptionRequired,
      'Mode of Sample Collection': selectedTab === tabs[0].title ? 'Home Visit' : 'Clinic Visit',
      'Pin Code': pinCode,
      'Service Area': 'Diagnostic',
      'Area Name': areaSelected.value,
      'No of Days ahead of Order Date selected': diffInDays,
      'Home collection charges': hcCharges,
      'Collection Time Slot': selectedTimeSlot?.slotInfo?.startTime!,
    };
    if (selectedTab === tabs[0].title) {
      eventAttributes['Delivery Date Time'] = date;
    }
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED, eventAttributes);
  };

  const setWebEngageEventForAddressNonServiceable = (pincode: string) => {
    const selectedAddr = addresses.find((item) => item.id == deliveryAddressId);
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE] = {
      'Patient UHID': g(currentPatient, 'uhid'),
      State: selectedAddr?.state || '',
      City: selectedAddr?.city || '',
      PinCode: parseInt(pincode!),
      'Number of items in cart': cartItemsWithId.length,
      'Items in cart': cartItems,
    };
    postWebEngageEvent(
      WebEngageEventName.DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE,
      eventAttributes
    );
  };

  const postwebEngageCheckoutCompletedEvent = (orderAutoId: string) => {
    const addr = deliveryAddressId && addresses.find((item) => item.id == deliveryAddressId);
    const store = clinicId && clinics.find((item) => item.CentreCode == clinicId);
    const shippingInformation = addr
      ? formatAddress(addr)
      : store
      ? `${store.CentreName}\n${store.Locality},${store.City},${store.State}`
      : '';
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED] = {
      'Order ID': orderAutoId,
      'Order Type': 'Cart',
      'Prescription Required': uploadPrescriptionRequired,
      'Prescription Added': !!(physicalPrescriptions.length || ePrescriptions.length),
      'Shipping information': shippingInformation, // (Home/Store address)
      'Total items in cart': cartItems.length,
      'Grand Total': cartTotal + deliveryCharges,
      'Total Discount %': coupon ? Number(((couponDiscount / cartTotal) * 100).toFixed(2)) : 0,
      'Discount Amount': couponDiscount,
      'Delivery charge': deliveryCharges,
      'Net after discount': grandTotal,
      'Payment status': 1,
      'Payment Type': isCashOnDelivery ? 'COD' : 'Prepaid',
      'Service Area': 'Diagnostic',
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED, eventAttributes);
  };

  const setWebEngageEventForAreaSelection = (item: areaObject) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_AREA_SELECTED] = {
      'Address Pincode': parseInt(selectedAddr?.zipcode!),
      'Area Selected': item.value,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_AREA_SELECTED, eventAttributes);
  };

  const setWebEnageEventForAppointmentTimeSlot = () => {
    const diffInDays = date.getDate() - new Date().getDate();
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED] = {
      'Address Pincode': parseInt(selectedAddr?.zipcode!),
      'Area Selected': areaSelected.value,
      'Time Selected': selectedTimeSlot?.slotInfo?.startTime!,
      'No of Days ahead of Order Date selected': diffInDays,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED, eventAttributes);
  };
  const fireOrderFailedEvent = (orderId: any) => {
    const eventAttributes: FirebaseEvents[FirebaseEventName.ORDER_FAILED] = {
      OrderID: orderId,
      Price: Number(grandTotal),
      CouponCode: coupon ? coupon.code : '',
      PaymentType: isCashOnDelivery ? 'COD' : 'Prepaid',
      LOB: 'Diagnostics',
    };
    postAppsFlyerEvent(AppsFlyerEventName.ORDER_FAILED, eventAttributes);
    postFirebaseEvent(FirebaseEventName.ORDER_FAILED, eventAttributes);
  };

  const postPaymentInitiatedWebengage = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PAYMENT_INITIATED] = {
      Paymentmode: isCashOnDelivery ? 'COD' : 'Online',
      Amount: grandTotal,
      ServiceArea: 'Diagnostic',
      LOB: 'Diagnostic',
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PAYMENT_INITIATED, eventAttributes);
  };

  const firePurchaseEvent = (orderId: string) => {
    let items: any = [];
    cartItems.forEach((item, index) => {
      let itemObj: any = {};
      itemObj.item_name = item.name; // Product Name or Doctor Name
      itemObj.item_id = item.id; // Product SKU or Doctor ID
      itemObj.price = item.specialPrice ? item.specialPrice : item.price; // Product Price After discount or Doctor VC price (create another item in array for PC price)
      itemObj.item_brand = ''; // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
      itemObj.item_category = 'Diagnostics'; // 'Pharmacy' or 'Consultations'
      itemObj.item_category2 = ''; // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
      itemObj.item_variant = item.collectionMethod; // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
      itemObj.index = index + 1; // Item sequence number in the list
      itemObj.quantity = 1; // "1" or actual quantity
      items.push(itemObj);
    });
    let code: any = coupon ? coupon.code : null;
    const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      coupon: code,
      currency: 'INR',
      items: items,
      transaction_id: orderId,
      value: Number(grandTotal),
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.PURCHASE, eventAttributes);
  };

  useEffect(() => {
    onFinishUpload();
  }, [isEPrescriptionUploadComplete, isPhysicalUploadComplete]);

  useEffect(() => {
    setPatientId!(currentPatientId!);
  }, [currentPatientId]);

  useEffect(() => {
    if (deliveryAddressId) {
      if (diagnosticSlot) {
        setDate(new Date(diagnosticSlot.date));
        setselectedTimeSlot({
          date: new Date(diagnosticSlot.date),
          diagnosticBranchCode: '',
          employeeCode: diagnosticSlot.diagnosticEmployeeCode,
          employeeName: '', // not sending name to API hence keeping empty
          slotInfo: {
            __typename: 'SlotInfo',
            endTime: diagnosticSlot.slotEndTime,
            slot: diagnosticSlot.employeeSlotId,
            startTime: diagnosticSlot.slotStartTime,
            status: 'empty',
          },
        });
        // setselectedTimeSlot(`${diagnosticSlot.slotStartTime} - ${diagnosticSlot.slotEndTime}`);
      } else {
        setDate(new Date());
        setselectedTimeSlot(undefined);
        setDiagnosticAreas!([]);
        setAreaSelected!({});
        const selectedAddressIndex = addresses.findIndex(
          (address) => address.id == deliveryAddressId
        );
        fetchAreasForAddress(
          addresses[selectedAddressIndex].id,
          addresses[selectedAddressIndex].zipcode!
        );
      }
    }
  }, [deliveryAddressId, diagnosticSlot, cartItems]);

  useEffect(() => {
    clinics.length == 0 && fetchStorePickup();
    slicedStoreList.length == 0 && filterClinics(clinicId, true, true);
  }, [clinicId]);

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
                    obj.data.results.length > 0 &&
                    obj.data.results[0].address_components.length > 0
                  ) {
                    const address = obj.data.results[0].address_components[0].short_name;
                    console.log(address, 'address obj');
                    const addrComponents = obj.data.results[0].address_components || [];
                    const _pincode = (
                      addrComponents.find((item: any) => item.types.indexOf('postal_code') > -1) ||
                      {}
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

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const fetchAddresses = async () => {
    try {
      if (addresses.length) {
        return;
      }
      setLoading!(true);
      const userId = g(currentPatient, 'id');
      const addressApiCall = await client.query<
        getPatientAddressList,
        getPatientAddressListVariables
      >({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: userId },
        fetchPolicy: 'no-cache',
      });
      const addressList =
        (addressApiCall.data.getPatientAddressList
          .addressList as savePatientAddress_savePatientAddress_patientAddress[]) || [];
      setAddresses!(addressList);
      setMedAddresses!(addressList);
      setLoading!(false);
    } catch (error) {
      setLoading!(false);
      renderAlert(`Something went wrong, unable to fetch addresses.`);
    }
  };

  const onRemoveCartItem = ({ id }: DiagnosticsCartItem) => {
    removeCartItem && removeCartItem(id);
  };

  const getHomeVisitTime = () => {
    return '';
    if (g(diagnosticSlot, 'date') && g(diagnosticSlot, 'slotStartTime')) {
      const _date = moment(g(diagnosticSlot, 'date')).format('D MMM YYYY');
      const _time = moment(g(diagnosticSlot, 'slotStartTime')!.trim(), 'hh:mm').format('hh:mm A');
      return `${_date}, ${_time}`;
    } else {
      return '';
    }
  };
  const homeVisitTime = getHomeVisitTime();

  const getPinCodeServiceability = async () => {
    const selectedAddressIndex = addresses.findIndex((address) => address.id == deliveryAddressId);
    const pinCodeFromAddress = addresses[selectedAddressIndex]!.zipcode!;
    if (!!pinCodeFromAddress) {
      setLoading!(true);
      client
        .query<getPincodeServiceability, getPincodeServiceabilityVariables>({
          query: GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
          variables: {
            pincode: parseInt(pinCodeFromAddress, 10),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const serviceableData = g(data, 'getPincodeServiceability');
          if (serviceableData && serviceableData.cityName != '') {
            setAddressCityId!(serviceableData?.cityID?.toString() || '');
          } else {
            showAphAlert!({
              unDismissable: true,
              title: 'Uh oh! :(',
              description: 'We are not servicing in this area.',
            });
          }
        })
        .catch((e) => {
          CommonBugFender('Tests_', e);
          setLoading!(false);
          console.log('getDiagnosticsPincode serviceability Error\n', { e });
        });
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
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => props.navigation.navigate('TESTS', { focusSearch: true })}
            >
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
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

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

  const getActiveItems = (getDiagnosticPricingForItem: any) => {
    const itemWithAll = getDiagnosticPricingForItem!.find(
      (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
    );
    const itemWithSub = getDiagnosticPricingForItem!.find(
      (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
    );

    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    const isItemActive =
      isDiagnosticCircleSubscription && itemWithSub
        ? itemWithSub!.status == 'active' &&
          isItemPriceActive(itemWithSub?.startDate!, itemWithSub?.endDate!, currentDate)
        : itemWithAll &&
          itemWithAll!.status == 'active' &&
          isItemPriceActive(itemWithAll?.startDate!, itemWithAll?.endDate!, currentDate);

    const activeItemsObject = {
      itemWithAll: itemWithAll,
      itemWithSub: itemWithSub,
      isItemActive: isItemActive,
    };

    return activeItemsObject;
  };

  const fetchPackageDetails = (
    itemIds: string | number[],
    func: (
      product: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics
    ) => void,
    comingFrom: string
  ) => {
    const removeSpaces = typeof itemIds == 'string' ? itemIds.replace(/\s/g, '').split(',') : null;

    const listOfIds =
      typeof itemIds == 'string' ? removeSpaces?.map((item) => parseInt(item!)) : itemIds;
    console.log({ listOfIds });
    {
      setLoading!(true);
      client
        .query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
          query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
          variables: {
            cityID: parseInt(diagnosticServiceabilityData?.cityId!) || 9,
            itemIDs: listOfIds,
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

                const getActiveItemsObject = getActiveItems(diagnosticPricing);
                const itemWithAll = getActiveItemsObject?.itemWithAll;
                const itemWithSub = getActiveItemsObject?.itemWithSub;

                const discount = getDiscountPercentage(itemWithAll?.mrp!, itemWithAll?.price!);
                const circleDiscount = getDiscountPercentage(
                  itemWithSub?.mrp!,
                  itemWithSub?.price!
                );

                const promoteCircle = discount < circleDiscount;

                updateCartItem!({
                  id: item?.itemId!.toString() || product[0]?.id!,
                  name: item?.itemName,
                  price: itemWithAll?.mrp!,
                  thumbnail: '',
                  specialPrice: itemWithAll?.price! || itemWithAll?.mrp!,
                  circlePrice: itemWithSub?.mrp!,
                  circleSpecialPrice: itemWithSub?.price,
                  collectionMethod: item?.collectionType!,
                  groupPlan: promoteCircle ? itemWithSub?.groupPlan : itemWithAll?.groupPlan,
                });
              });
            }

            //update the ui
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

  const isItemPriceActive = (from: string, to: string, check: string) => {
    if (from == null || to == null) {
      return true;
    }
    var fDate, lDate, cDate;
    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = Date.parse(check);

    if (cDate <= lDate && cDate >= fDate) {
      return true;
    }
    return false;
  };

  const fetchAreasForAddress = (id: string, pincode: string) => {
    if (cartItems.length == 0) {
      return;
    }
    setLoading!(true);
    client
      .query<getAreas, getAreasVariables>({
        query: GET_DIAGNOSTIC_AREAS,
        fetchPolicy: 'no-cache',
        variables: {
          pincode: parseInt(pincode!),
          itemIDs: cartItemsWithId,
        },
      })
      .then(({ data }) => {
        setLoading!(false);
        const getDiagnosticAreas = g(data, 'getAreas', 'areas') || [];
        if (data.getAreas.status) {
          setDiagnosticAreas!(getDiagnosticAreas);
        } else {
          setDeliveryAddressId && setDeliveryAddressId('');
          setDiagnosticAreas!([]);
          setAreaSelected!({});
          setselectedTimeSlot(undefined);
          setLoading!(false);
          setWebEngageEventForAddressNonServiceable(pincode);
          showAphAlert!({
            title: 'Uh oh.. :(',
            description:
              'Sorry! We’re working hard to get to this area! In the meantime, you can either visit clinic near your location or change the address.',
          });
        }
      })
      .catch((e) => {
        setLoading!(false);
        setDiagnosticAreas!([]);
        setAreaSelected!({});
        setselectedTimeSlot(undefined);
        setWebEngageEventForAddressNonServiceable(pincode);
        CommonBugFender('TestsCart_getArea selection', e);
        console.log('error' + e);
        showAphAlert!({
          title: 'Uh oh.. :(',
          description:
            'Sorry! We’re working hard to get to this area! In the meantime, you can either visit clinic near your location or change the address.',
        });
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const renderItemsInCart = () => {
    const cartItemsCount =
      cartItems.length > 10 || cartItems.length == 0
        ? `${cartItems.length}`
        : `0${cartItems.length}`;

    return (
      <View>
        {renderLabel('ITEMS IN YOUR CART', cartItemsCount)}
        {cartItems.length == 0 && (
          <Text
            style={{
              color: theme.colors.FILTER_CARD_LABEL,
              ...theme.fonts.IBMPlexSansMedium(13),
              margin: 20,
              textAlign: 'center',
              opacity: 0.3,
            }}
          >
            Your Cart is empty
          </Text>
        )}
        {cartItems.map((test, index, array) => {
          console.log({ test });
          const specialPrice = test?.specialPrice!;
          const price = test?.price!; //more than price (black)
          const circlePrice = test?.circlePrice!;
          const circleSpecialPrice = test?.circleSpecialPrice;

          const discount = getDiscountPercentage(price, specialPrice);
          const circleDiscount = getDiscountPercentage(circlePrice!, circleSpecialPrice!);

          const promoteCircle = discount < circleDiscount;

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

          return (
            <MedicineCard
              isComingFrom={'testCart'}
              isCareSubscribed={isDiagnosticCircleSubscription}
              containerStyle={medicineCardContainerStyle}
              key={test.id}
              onPress={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Navigate to medicine details scene');
                fetchPackageDetails(
                  test.id,
                  (product) => {
                    props.navigation.navigate(AppRoutes.TestDetails, {
                      testDetails: {
                        ItemID: test?.id,
                        ItemName: test?.name,
                        Rate: price,
                        specialPrice: specialPrice! || price,
                        circleRate: circlePrice,
                        circleSpecialPrice: circleSpecialPrice,
                        FromAgeInDays: product?.fromAgeInDays!,
                        ToAgeInDays: product?.toAgeInDays!,
                        Gender: product?.gender,
                        collectionType: test?.collectionMethod,
                        preparation: product?.testPreparationData,
                        testDescription: product?.testDescription,
                        source: 'Cart Page',
                        type: product?.itemType,
                      } as TestPackageForDetails,
                    });
                  },
                  'onPress'
                );
              }}
              medicineName={test.name!}
              price={price}
              specialPrice={!promoteCircle && price != specialPrice ? specialPrice : undefined}
              circlePrice={promoteCircle ? circleSpecialPrice! : undefined}
              discount={promoteCircle ? circleDiscount! : discount!}
              imageUrl={imageUrl}
              onPressAdd={() => {}}
              onPressRemove={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Remove item from cart');
                cartItems.length == 0 ? setDeliveryAddressId!('') : null;
                onRemoveCartItem(test);
              }}
              onChangeUnit={() => {}}
              isCardExpanded={true}
              isInStock={true}
              isTest={true}
              isPrescriptionRequired={false}
              subscriptionStatus={'unsubscribed'}
              packOfCount={test.mou}
              onChangeSubscription={() => {}}
              onEditPress={() => {}}
              onAddSubscriptionPress={() => {}}
            />
          );
        })}
      </View>
    );
  };

  const [checkingServicability, setCheckingServicability] = useState(false);

  const checkSlotSelection = (item: areaObject) => {
    const selectedAddressIndex = addresses.findIndex((address) => address.id == deliveryAddressId);

    client
      .query<getDiagnosticSlotsWithAreaID, getDiagnosticSlotsWithAreaIDVariables>({
        query: GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
        fetchPolicy: 'no-cache',
        variables: {
          selectedDate: moment(date).format('YYYY-MM-DD'),
          areaID: parseInt(item.key!),
        },
      })
      .then(({ data }) => {
        const diagnosticSlots = g(data, 'getDiagnosticSlotsWithAreaID', 'slots') || [];
        console.log('ORIGINAL DIAGNOSTIC SLOTS', { diagnosticSlots });
        const slotsArray: TestSlot[] = [];
        diagnosticSlots!.forEach((item) => {
          if (isValidTestSlotWithArea(item!, date)) {
            slotsArray.push({
              employeeCode: 'apollo_employee_code',
              employeeName: 'apollo_employee_name',
              slotInfo: {
                endTime: item?.Timeslot!,
                status: 'empty',
                startTime: item?.Timeslot!,
                slot: item?.TimeslotID,
              },
              date: date,
              diagnosticBranchCode: 'apollo_route',
            } as TestSlot);
          }
        });

        const uniqueSlots = getUniqueTestSlots(slotsArray);

        console.log('ARRAY OF SLOTS', { slotsArray });

        setSlots(slotsArray);
        uniqueSlots.length &&
          setselectedTimeSlot(
            getTestSlotDetailsByTime(slotsArray, uniqueSlots[0].startTime!, uniqueSlots[0].endTime!)
          );
        setDisplaySchedule(true); //show slot popup

        setDeliveryAddressId!(addresses[selectedAddressIndex].id);
        setPinCode!(addresses[selectedAddressIndex]!.zipcode!);
      })
      .catch((e) => {
        CommonBugFender('TestsCart_checkServicability', e);
        console.log('Error occured', { e });
        setDiagnosticSlot && setDiagnosticSlot(null);
        setselectedTimeSlot(undefined);
        const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';

        if (noHubSlots) {
          setDeliveryAddressId!(addresses[selectedAddressIndex].id);
          setPinCode!(addresses[selectedAddressIndex]!.zipcode!);
          showAphAlert!({
            title: 'Uh oh.. :(',
            description: `Sorry! There are no slots available on ${moment(date).format(
              'DD MMM, YYYY'
            )}. Please choose another date.`,
            onPressOk: () => {
              setDisplaySchedule(true);
              hideAphAlert && hideAphAlert();
            },
          });
        } else {
          setDeliveryAddressId && setDeliveryAddressId('');
          // setPinCode && setPinCode('');
          showAphAlert!({
            title: 'Uh oh.. :(',
            description:
              'Sorry! We’re working hard to get to this area! In the meantime, you can either visit clinic near your location or change the address.',
          });
        }
      });
  };

  const _navigateToEditAddress = (dataname: string, address: any, comingFrom: string) => {
    props.navigation.push(AppRoutes.AddAddress, {
      KeyName: dataname,
      DataAddress: address,
      ComingFrom: comingFrom,
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
    const selectedAddressIndex = addresses.findIndex((address) => address.id == deliveryAddressId);
    const addressListLength = addresses.length;
    const spliceStartIndex =
      selectedAddressIndex == addressListLength - 1
        ? selectedAddressIndex - 1
        : selectedAddressIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;

    return (
      <View
        style={{ marginTop: 8, marginHorizontal: 16 }}
        pointerEvents={cartItems.length > 0 ? 'auto' : 'none'}
      >
        {addresses.slice(startIndex, startIndex + 2).map((item, index, array) => {
          return (
            <RadioSelectionItem
              key={item.id}
              title={formatAddressWithLandmark(item)}
              showMultiLine={true}
              subtitle={formatNameNumber(item)}
              subtitleStyle={styles.subtitleStyle}
              isSelected={deliveryAddressId == item.id}
              onPress={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Check service availability');
                const tests = cartItems.filter(
                  (item) => item.collectionMethod == TEST_COLLECTION_TYPE.CENTER
                );

                if (tests.length) {
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
                  AddressSelectedEvent(item);
                  setDeliveryAddressId!(item.id);
                  setDiagnosticAreas!([]);
                  setAreaSelected!({});
                  setDiagnosticSlot!(null);
                  // fetchAreasForAddress(item.id, item.zipcode!);
                }
              }}
              containerStyle={{ marginTop: 16 }}
              showEditIcon={true}
              onPressEdit={() => _navigateToEditAddress('Update', item, AppRoutes.TestsCart)}
              hideSeparator={index + 1 === array.length}
            />
          );
        })}
        <View style={[styles.rowSpaceBetweenStyle, { paddingBottom: 16 }]}>
          <Text
            style={styles.yellowTextStyle}
            onPress={() => {
              postPharmacyAddNewAddressClick('Diagnostics Cart');
              props.navigation.navigate(AppRoutes.AddAddress, {
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
            {addresses.length > 2 && (
              <Text
                style={styles.yellowTextStyle}
                onPress={() => {
                  props.navigation.navigate(AppRoutes.SelectDeliveryAddress, {
                    isTest: true,
                    selectedAddressId: deliveryAddressId,
                    isChanged: (val: boolean, id?: string, pincode?: string) => {
                      if (val && id) {
                        setDeliveryAddressId && setDeliveryAddressId(id);
                        setDiagnosticSlot && setDiagnosticSlot(null);
                        setselectedTimeSlot(undefined);

                        setDiagnosticAreas!([]);
                        setAreaSelected!({});

                        // fetchAreasForAddress(id, pincode!);
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

  useEffect(() => {
    if (pinCode.length !== 6) {
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
              <Text style={styles.dateTextStyle}>{moment(date).format('DD MMM, YYYY')}</Text>
            </View>
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.dateTextStyle}>Time</Text>
              <Text style={styles.dateTextStyle}>
                {selectedTimeSlot
                  ? `${formatTestSlotWithBuffer(selectedTimeSlot.slotInfo.startTime!)}`
                  : 'No slot selected'}
              </Text>
            </View>
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
                {isAreaSelectable ? ' Select area' : areaSelected.value}
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
        {renderAreaSelectionCard()}
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
          onPress={() => props.navigation.navigate(AppRoutes.ApplyCouponScene, { isTest: true })}
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
              {string.common.Rs} {cartTotal.toFixed(2)}
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
          {selectedTab == tabs[0].title && ppeKitCharges && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.blueTextStyle}>PPE kit charges</Text>
              <Text style={styles.blueTextStyle}>{string.common.Rs} 500.00</Text>
            </View>
          )}
          {selectedTab == tabs[0].title && cartSaving > 0 && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                Cart Saving
              </Text>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                - {string.common.Rs} {cartSaving.toFixed(2)}
              </Text>
            </View>
          )}
          {selectedTab == tabs[0].title && isDiagnosticCircleSubscription && circleSaving > 0 && (
            <View style={[styles.rowSpaceBetweenStyle]}>
              <View style={{ flexDirection: 'row', flex: 0.8 }}>
                <CircleLogo
                  style={{ resizeMode: 'contain', height: 20, width: 35, alignSelf: 'center' }}
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
          <View style={[styles.separatorStyle, { marginTop: 16, marginBottom: 7 }]} />
          <View style={styles.rowSpaceBetweenStyle}>
            <Text style={styles.blueTextStyle}>To Pay </Text>
            <Text style={[styles.blueTextStyle, { ...theme.fonts.IBMPlexSansBold }]}>
              {string.common.Rs} {grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>
        {anyCartSaving > 0 && renderCartSavingBanner()}
        {isDiagnosticCircleSubscription ? null : circleSaving > 0 && renderSavedBanner()}
        {renderPaymentCard()}
      </View>
    );
  };

  const renderCartSavingBanner = () => {
    return dashedBanner(
      'You ',
      `Saved ${string.common.Rs}${
        isDiagnosticCircleSubscription ? cartSaving + circleSaving : cartSaving
      }`,
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
      `saved extra ${string.common.Rs}${circleSaving}`,
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
          marginBottom: 12,
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
                width: 70,
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

  const renderPaymentCard = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          marginHorizontal: 20,
          // marginTop: 4,
          marginBottom: 12,
          padding: 16,
          marginTop: 10,
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <RadioButtonIcon style={{ tintColor: theme.colors.SHERPA_BLUE, opacity: 0.3 }} />
          <Text
            style={{
              marginHorizontal: 10,
              color: theme.colors.LIGHT_BLUE,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              alignSelf: 'center',
            }}
          >
            Cash on delivery
          </Text>
        </View>
        <Text
          style={{
            marginHorizontal: 15,
            color: theme.colors.APP_GREEN,
            ...theme.fonts.IBMPlexSansMedium(11),
            marginVertical: 2,
            lineHeight: 24,
            alignSelf: 'center',
            marginLeft: -20,
          }}
        >
          {string.diagnostics.cashOnDeliverySubText}
        </Text>
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
        {renderLabel('YOU SHOULD ALSO ADD')}

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
    cartItems.length > 0 &&
    forPatientId &&
    !!((deliveryAddressId && selectedTimeSlot) || clinicId) &&
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
            title: 'Uh oh.. :(',
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
      props.navigation.navigate(AppRoutes.TestsCheckoutScene);
    } else if (
      physicalPrescriptions.length == 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete
    ) {
      setLoading!(false);
      setisEPrescriptionUploadComplete(false);
      props.navigation.navigate(AppRoutes.TestsCheckoutScene);
    } else if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      setisEPrescriptionUploadComplete(false);
      props.navigation.navigate(AppRoutes.TestsCheckoutScene);
    }
  };

  const getDiagnosticsAvailability = (cartItems: DiagnosticsCartItem[]) => {
    const itemIds = cartItems.map((item) => parseInt(item.id));
    return client.query<
      findDiagnosticsByItemIDsAndCityID,
      findDiagnosticsByItemIDsAndCityIDVariables
    >({
      query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
      variables: { cityID: parseInt(diagnosticServiceabilityData?.cityId!) || 9, itemIDs: itemIds },
      fetchPolicy: 'no-cache',
    });
  };

  const redirectToPaymentGateway = (orderId: string, displayId: string) => {
    props.navigation.navigate(AppRoutes.TestPayment, {
      orderId,
      displayId,
      price: grandTotal,
    });
  };

  const moveForward = () => {
    console.log('inside move forward');
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

  const bookDiagnosticOrder = async () => {
    setshowSpinner(true);
    const { CentreCode, CentreName } = diagnosticClinic || {};
    /**
     * check is home collection or clinic visit ~~ change the logic
     */

    if (selectedTab == tabs[0].title) {
      saveHomeCollectionOrder();
    } else {
      saveClinicOrder();
    }
  };

  const saveClinicOrder = () => {
    const hasCircle = cartItems.find((item) => item.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE);
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
      areaId: (areaSelected || {}).key!,
      diagnosticDate: moment(date).format('YYYY-MM-DD'),
      prescriptionUrl: [
        ...physicalPrescriptions.map((item) => item.uploadedUrl),
        ...ePrescriptions.map((item) => item.uploadedUrl),
      ].join(','),
      paymentType: isCashOnDelivery
        ? DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD
        : DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT,
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

    postPaymentInitiatedWebengage();

    console.log(JSON.stringify({ diagnosticOrderInput: orderInfo }));
    console.log('orderInfo\n', { diagnosticOrderInput: orderInfo });
    saveOrder(orderInfo)
      .then(({ data }) => {
        const { orderId, displayId, errorCode, errorMessage } =
          g(data, 'SaveDiagnosticOrder')! || {};
        if (errorCode || errorMessage) {
          // Order-failed
          setshowSpinner(false);
          setLoading!(false);
          showAphAlert!({
            unDismissable: true,
            title: `Uh oh.. :(`,
            description: `We're sorry :(  There's been a problem with your booking. Please book again.`,
          });
          fireOrderFailedEvent(orderId);
        } else {
          // Order-Success
          if (!isCashOnDelivery) {
            // PG order, redirect to web page
            redirectToPaymentGateway(orderId!, displayId!);
            return;
          }
          // COD order, show popup here & clear cart info
          postwebEngageCheckoutCompletedEvent(`${displayId}`); // Make sure to add this event in test payment as well when enabled

          setModalVisible(true);
          firePurchaseEvent(orderId!);
          setOrderDetails({
            orderId: orderId,
            displayId: displayId,
            diagnosticDate: date!,
            slotTime: slotTimings!,
            cartSaving: cartSaving,
            circleSaving: circleSaving,
          });
          clearDiagnoticCartInfo && clearDiagnoticCartInfo();
        }
      })
      .catch((error) => {
        CommonBugFender('TestsCheckoutScene_saveOrder', error);
        console.log('SaveDiagnosticOrder API Error\n', { error });
        setshowSpinner(false);
        setLoading!(false);
        showAphAlert!({
          unDismissable: true,
          title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
          description: `We're sorry :(  There's been a problem with your booking. Please book again.`,
        });
      })
      .finally(() => {
        setshowSpinner(false);
        setLoading!(false);
      });
  };

  const saveHomeCollectionOrder = () => {
    const { slotStartTime, slotEndTime, employeeSlotId, date } = diagnosticSlot || {};
    const slotTimings = (slotStartTime && slotEndTime
      ? `${slotStartTime}-${slotEndTime}`
      : ''
    ).replace(' ', '');
    const formattedDate = moment(date).format('YYYY-MM-DD');

    const dateTimeInUTC = moment(formattedDate + ' ' + slotStartTime).toISOString();

    console.log(physicalPrescriptions, 'physical prescriptions');
    console.log('idddd...' + validateCouponUniqueId);
    const allItems = cartItems.find((item) => item.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL);
    const totalPriceWithoutAnyDiscount = cartItems.reduce(
      (prevVal, currVal) => prevVal + currVal.price,
      0
    );

    const bookingOrderInfo: DiagnosticBookHomeCollectionInput = {
      uniqueID: validateCouponUniqueId,
      patientId: (currentPatient && currentPatient.id) || '',
      patientAddressId: deliveryAddressId!,
      slotTimings: slotTimings,
      slotDateTimeInUTC: dateTimeInUTC,
      totalPrice: grandTotal,
      prescriptionUrl: [
        ...physicalPrescriptions.map((item) => item.uploadedUrl),
        ...ePrescriptions.map((item) => item.uploadedUrl),
      ].join(','),
      diagnosticDate: formattedDate,
      bookingSource: BOOKINGSOURCE.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
      paymentType: isCashOnDelivery
        ? DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD
        : DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT,
      items: cartItems.map(
        (item) =>
          ({
            itemId: typeof item.id == 'string' ? parseInt(item.id) : item.id,
            price:
              isDiagnosticCircleSubscription && item.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
                ? (item.circleSpecialPrice as number)
                : (item.specialPrice as number) || item.price,
            quantity: 1,
            groupPlan: isDiagnosticCircleSubscription ? item.groupPlan! : DIAGNOSTIC_GROUP_PLAN.ALL,
          } as DiagnosticLineItem)
      ),
      slotId: employeeSlotId?.toString() || '0',
      areaId: (areaSelected || {}).key!,
      homeCollectionCharges: hcCharges,
      totalPriceExcludingDiscounts: totalPriceWithoutAnyDiscount,
      subscriptionInclusionId: null,
      userSubscriptionId: circleSubscriptionId,
      // prismPrescriptionFileId: [
      //   ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
      //   ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
      // ].join(','),
    };

    console.log(JSON.stringify({ diagnosticOrderInput: bookingOrderInfo }));
    console.log('home collection \n', { diagnosticOrderInput: bookingOrderInfo });
    postPaymentInitiatedWebengage();
    saveHomeCollectionBookingOrder(bookingOrderInfo)
      .then(({ data }) => {
        const { orderId, displayId, errorCode, errorMessage } =
          g(data, 'DiagnosticBookHomeCollection')! || {};
        if (errorCode || errorMessage) {
          console.log('error' + errorCode);
          console.log('bookkk..' + errorMessage);
          setLoading!(false);
          setshowSpinner!(false);
          let descriptionText = string.diagnostics.bookingOrderFailedMessage;
          if (errorCode == -1 && errorMessage?.indexOf('duplicate') != -1) {
            descriptionText = string.diagnostics.bookingOrderDuplicateFailedMessage;
          }
          // Order-failed
          showAphAlert!({
            unDismissable: true,
            title: `Uh oh.. :(`,
            description: descriptionText,
          });
          fireOrderFailedEvent(orderId);
        } else {
          // Order-Success
          if (!isCashOnDelivery) {
            // PG order, redirect to web page
            redirectToPaymentGateway(orderId!, displayId!);
            return;
          }
          // COD order, show popup here & clear cart info
          postwebEngageCheckoutCompletedEvent(`${displayId}`); // Make sure to add this event in test payment as well when enabled
          setModalVisible(true);
          firePurchaseEvent(orderId!);
          setOrderDetails({
            orderId: orderId,
            displayId: displayId,
            diagnosticDate: date!,
            slotTime: slotTimings!,
            cartSaving: cartSaving,
            circleSaving: circleSaving,
            cartHasAll: allItems != undefined ? true : false,
          });
          clearDiagnoticCartInfo && clearDiagnoticCartInfo!();
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
          description: `We're sorry :(  There's been a problem with your booking. Please book again.`,
        });
      })
      .finally(() => {
        setshowSpinner(false);
        setLoading!(false);
      });
  };

  const onPressCross = () => {
    setModalVisible(false);
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
  };

  const renderNewView = () => {
    console.log({ orderDetails });
    const pickupDate = moment(orderDetails?.diagnosticDate!).format('DD MMM');
    const pickupYear = moment(orderDetails?.diagnosticDate!).format('YYYY');
    const pickupTime = orderDetails && formatTestSlotWithBuffer(orderDetails?.slotTime!);
    const orderCartSaving = orderDetails?.cartSaving!;
    const orderCircleSaving = orderDetails?.circleSaving!;
    const showCartSaving = orderCartSaving > 0 && orderDetails?.cartHasAll;
    //add a check to see if we have price and special price same (circle + normal)
    console.log(showCartSaving);
    console.log('orderCartSavinf//' + orderCartSaving);
    console.log('orderCircleSaving' + orderCircleSaving);

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 40,
        }}
      >
        <Modal
          animationType="slide"
          transparent={false}
          visible={isModalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
          onDismiss={() => {
            setModalVisible(false);
          }}
        >
          <View
            style={{
              flex: 1,
              padding: 20,
              marginTop: screenHeight > 600 ? '5%' : 0,
            }}
          >
            <View style={{ alignSelf: 'flex-end' }}>
              <TouchableOpacity onPress={() => onPressCross()}>
                <CrossYellow style={{ height: 32, width: 32, resizeMode: 'contain' }} />
              </TouchableOpacity>
            </View>
            <View style={{}}>
              <Text style={{ ...theme.fonts.IBMPlexSansMedium(24) }}>
                {`Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`}
              </Text>
            </View>
            {/**
             * order success view
             */}
            <ScrollView bounces={false} style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
              <>
                <View style={styles.scrollViewOuterView}>
                  <OrderPlacedCheckedIcon style={{ marginRight: 20 }} />
                  <Text style={styles.orderPlacedText}>
                    Your order has been placed successfully.
                  </Text>
                </View>
                {/** order view */}
                <View style={{ backgroundColor: '#F7F8F5', padding: 16 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: '5%',
                    }}
                  >
                    <Text style={styles.bookingIdText}>Your Booking ID is </Text>
                    <Text style={styles.bookingNumberText}>#{orderDetails?.displayId!}</Text>
                  </View>
                  <Spearator style={styles.horizontalSeparator} />
                  {/**
                   * mid - first view
                   */}
                  <View style={{ marginVertical: 28, marginHorizontal: 4 }}>
                    <Text style={styles.placeholderText}>BOOKING DATE/TIME</Text>
                    <Text style={styles.contentText}>
                      {moment().format('DD MMM')}, {moment().format('YYYY')} |{' '}
                      {moment().format('hh:mm A')}
                    </Text>
                  </View>
                  {/**
                   * mid - second view add a check for clinic selection as well
                   */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {pickupDate && pickupYear && (
                      <View style={{ marginHorizontal: 4 }}>
                        <Text style={styles.placeholderText}>PICKUP DATE</Text>
                        <Text
                          style={[
                            styles.contentText,
                            {
                              marginVertical: 2,
                            },
                          ]}
                        >
                          {pickupDate}, {pickupYear}
                        </Text>
                      </View>
                    )}
                    {pickupTime && (
                      <View style={{ marginHorizontal: 4 }}>
                        <Text
                          style={[
                            styles.placeholderText,
                            {
                              marginHorizontal: 4,
                            },
                          ]}
                        >
                          PICKUP TIME
                        </Text>
                        <Text
                          style={[
                            styles.contentText,
                            {
                              marginVertical: 2,
                            },
                          ]}
                        >
                          {pickupTime}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {/**
                 * top green view
                 */}
                {(orderCartSaving > 0 ||
                  (isDiagnosticCircleSubscription && orderCircleSaving > 0)) && (
                  <View style={styles.totalSavingOuterView}>
                    {(orderCartSaving > 0 ||
                      (isDiagnosticCircleSubscription && orderCircleSaving > 0)) && (
                      <Text
                        style={{
                          color: '#02475b',
                          ...theme.fonts.IBMPlexSansRegular(14),
                          lineHeight: 16,
                        }}
                      >
                        You
                        <Text style={{ color: theme.colors.APP_GREEN }}>
                          {' '}
                          saved {string.common.Rs}
                          {isDiagnosticCircleSubscription
                            ? Number(orderCartSaving) + Number(orderCircleSaving)
                            : orderCartSaving}
                        </Text>{' '}
                        on your purchase.
                      </Text>
                    )}
                    {isDiagnosticCircleSubscription && orderCircleSaving > 0 && (
                      <>
                        <Spearator style={{ margin: 5 }} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row' }}>
                            <CircleLogo
                              style={{
                                height: 20,
                                width: 34,
                                resizeMode: 'contain',
                              }}
                            />
                            <Text
                              style={{
                                color: theme.colors.APP_GREEN,
                                ...theme.fonts.IBMPlexSansRegular(14),
                                lineHeight: 16,
                                alignSelf: 'flex-end',
                              }}
                            >
                              Membership Discount
                            </Text>
                          </View>
                          <Text
                            style={{
                              color: theme.colors.APP_GREEN,
                              ...theme.fonts.IBMPlexSansRegular(14),
                              lineHeight: 16,
                              alignSelf: 'flex-end',
                            }}
                          >
                            {string.common.Rs} {orderCircleSaving}
                          </Text>
                        </View>
                      </>
                    )}
                    {/**
                     * add a check a here that if it contains all or has all circle
                     */}

                    {showCartSaving! && (
                      <>
                        <Spearator style={{ margin: 5 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text
                            style={{
                              color: theme.colors.APP_GREEN,
                              ...theme.fonts.IBMPlexSansRegular(14),
                              lineHeight: 16,
                              alignSelf: 'flex-end',
                            }}
                          >
                            {' '}
                            Cart Saving
                          </Text>

                          <Text
                            style={{
                              color: theme.colors.APP_GREEN,
                              ...theme.fonts.IBMPlexSansRegular(14),
                              lineHeight: 16,
                              alignSelf: 'flex-end',
                            }}
                          >
                            {string.common.Rs} {orderCartSaving}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                )}

                {!isDiagnosticCircleSubscription && orderCircleSaving > 0 && (
                  <View
                    style={{
                      borderColor: theme.colors.APP_GREEN,
                      borderWidth: 2,
                      borderRadius: 5,
                      padding: 16,
                      paddingTop: 8,
                      paddingBottom: 8,
                      borderStyle: 'dashed',
                      flexDirection: 'row',
                      marginVertical: orderCartSaving > 0 ? 0 : 30,
                    }}
                  >
                    <Text
                      style={{
                        color: '#02475b',
                        ...theme.fonts.IBMPlexSansRegular(14),
                        lineHeight: 16,
                      }}
                    >
                      You could have
                      <Text style={{ color: theme.colors.APP_GREEN, fontWeight: 'bold' }}>
                        {' '}
                        saved extra {string.common.Rs}
                        {orderCircleSaving}
                      </Text>{' '}
                      with
                    </Text>
                    <CircleLogo
                      style={{
                        resizeMode: 'contain',
                        height: 20,
                        width: 37,
                        marginTop: -2,
                      }}
                    />
                  </View>
                )}
              </>
              <View style={{ marginBottom: 20 }}></View>
            </ScrollView>

            <View style={{ height: 90 }}>{renderDiagnosticHelpText()}</View>
            <Spearator style={{ opacity: 0.3, marginBottom: 20 }} />
            <TouchableOpacity
              style={{ alignItems: 'center', justifyContent: 'flex-end' }}
              onPress={() => navigateToOrderDetails(true, orderDetails?.orderId!)}
            >
              <Text style={{ ...theme.viewStyles.text('B', 16, '#FC9916'), marginVertical: '4%' }}>
                VIEW ORDER SUMMARY
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderId: string) => {
    setModalVisible(false);
    setLoading!(false);
    props.navigation.navigate(AppRoutes.TestOrderDetailsSummary, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderId: orderId,
      comingFrom: AppRoutes.TestsCart,
    });
  };

  const renderDiagnosticHelpText = () => {
    const textMediumStyle = theme.viewStyles.text('R', 14, '#02475b', 1, 22);
    const textBoldStyle = theme.viewStyles.text('B', 14, '#02475b', 1, 22);
    const PhoneNumberTextStyle = theme.viewStyles.text('R', 14, '#fc9916', 1, 22);
    const ontapNumber = (number: string) => {
      Linking.openURL(`tel:${number}`)
        .then(() => {})
        .catch((e) => {
          CommonBugFender('TestsCheckoutScene_Linking_mobile', e);
        });
    };

    return (
      <Text style={{ margin: 20, marginTop: 0 }}>
        <Text style={textMediumStyle}>{'For '}</Text>
        <Text style={textBoldStyle}>{'Test Orders,'}</Text>
        <Text style={textMediumStyle}>
          {' to know the Order Status / Reschedule / Cancel, please call — \n'}
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

  const removeDisabledCartItems = (disabledCartItemIds: string[]) => {
    hideAphAlert!();
    setCartItems!(
      cartItems.filter((cItem) => !disabledCartItemIds.find((dItem) => dItem == cItem.id))
    );
  };

  const onPressProceedToPay = () => {
    try {
      postwebEngageProceedToPayEvent();
      setLoading!(true);
      getDiagnosticsAvailability(cartItems)
        .then(({ data }) => {
          const diagnosticItems = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
          const disabledCartItems = cartItems.filter(
            (cartItem) => !diagnosticItems.find((d) => `${d!.itemId}` == cartItem.id)
          );
          if (disabledCartItems.length) {
            const disabledCartItemNames = disabledCartItems.map((item) => item.name).join(', ');
            const disabledCartItemIds = disabledCartItems.map((item) => item.id);
            setLoading!(false);
            showAphAlert!({
              title: string.common.uhOh,
              description: string.diagnostics.disabledDiagnosticsMsg.replace(
                '{{testNames}}',
                disabledCartItemNames
              ),
              CTAs: [
                {
                  text: (disabledCartItems.length == 1
                    ? string.diagnostics.removeThisTestCTA
                    : string.diagnostics.removeTheseTestsCTA
                  ).toUpperCase(),
                  onPress: () => removeDisabledCartItems(disabledCartItemIds),
                  type: 'orange-button',
                },
              ],
            });
          } else {
            moveForward();
          }
        })
        .catch((e) => {
          CommonBugFender('TestsCart_getDiagnosticsAvailability', e);
          setLoading!(false);
          errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
        });
    } catch (error) {
      CommonBugFender('TestsCart_getDiagnosticsAvailability_try_catch', error);
      errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
    }
  };

  // const onPressProceedToPay = () => {
  //   const prescriptions = physicalPrescriptions;
  //   console.log(ePrescriptions, 'ePrescriptions');

  //   if (prescriptions.length == 0 && ePrescriptions.length == 0) {
  //     console.log('withoutdocumnets');

  //     props.navigation.navigate(AppRoutes.TestsCheckoutScene);
  //   } else {
  //     if (prescriptions.length > 0) {
  //       setLoading!(true);
  //       const unUploadedPres = prescriptions.filter((item) => !item.uploadedUrl);
  //       console.log('unUploadedPres', unUploadedPres);
  //       multiplePhysicalPrescriptionUpload(unUploadedPres)
  //         .then((data) => {
  //           setLoading!(false);

  //           const uploadUrlscheck = data.map((item) =>
  //             item.data!.uploadDocument.status ? item.data!.uploadDocument.fileId : null
  //           );
  //           console.log('uploaddocumentsucces', uploadUrlscheck, uploadUrlscheck.length);
  //           var filtered = uploadUrlscheck.filter(function(el) {
  //             return el != null;
  //           });
  //           console.log('filtered', filtered);

  //           if (filtered.length > 0) {
  //             client
  //               .query<downloadDocuments>({
  //                 query: DOWNLOAD_DOCUMENT,
  //                 fetchPolicy: 'no-cache',
  //                 variables: {
  //                   downloadDocumentsInput: {
  //                     patientId: currentPatient && currentPatient.id,
  //                     fileIds: uploadUrlscheck,
  //                   },
  //                 },
  //               })
  //               .then(({ data }) => {
  //                 console.log(data, 'DOWNLOAD_DOCUMENT');
  //                 const uploadUrlscheck = data.downloadDocuments.downloadPaths;
  //                 console.log(uploadUrlscheck, 'DOWNLOAD_DOCUMENTcmple');
  //                 const uploadUrls = uploadUrlscheck!.map((item) => item);
  //                 console.log(uploadUrls, 'uploadUrls');
  //                 const newuploadedPrescriptions = unUploadedPres.map(
  //                   (item, index) =>
  //                     ({
  //                       ...item,
  //                       uploadedUrl: uploadUrls[index],
  //                     } as PhysicalPrescription)
  //                 );
  //                 console.log(newuploadedPrescriptions, 'newuploadedPrescriptions');
  //                 setPhysicalPrescriptions &&
  //                   setPhysicalPrescriptions([
  //                     ...newuploadedPrescriptions,
  //                     ...prescriptions.filter((item) => item.uploadedUrl),
  //                   ]);
  //                 setLoading!(false);
  //                 ePrescriptions.length == 0 &&
  //                   props.navigation.navigate(AppRoutes.TestsCheckoutScene);
  //               })
  //               .catch((e: string) => {
  //                 console.log('Error occured', e);
  //               })
  //               .finally(() => {
  //                 setshowSpinner(false);
  //               });
  //           } else {
  //             Alert.alert('your uploaded images are failed');
  //           }
  //           // const uploadUrls = data.map((item) => item.data!.uploadFile.filePath);
  //           // const newuploadedPrescriptions = unUploadedPres.map(
  //           //   (item, index) =>
  //           //     ({
  //           //       ...item,
  //           //       uploadedUrl: uploadUrls[index],
  //           //     } as PhysicalPrescription)
  //           // );
  //           // setPhysicalPrescriptions &&
  //           //   setPhysicalPrescriptions([
  //           //     ...newuploadedPrescriptions,
  //           //     ...prescriptions.filter((item) => item.uploadedUrl),
  //           //   ]);
  //           // setLoading!(false);
  //           // props.navigation.navigate(AppRoutes.TestsCheckoutScene);
  //         })
  //         .catch((e) => {
  //           aphConsole.log({ e });
  //           setLoading!(false);
  //           showAphAlert!({
  //             title: 'Uh oh.. :(',
  //             description: 'Error occurred while uploading prescriptions.',
  //           });
  //         });
  //     }
  //     if (ePrescriptions.length > 0) {
  //       const ePresUrls = ePrescriptions.map((item) => {
  //         console.log('item', item.prismPrescriptionFileId);

  //         return item!.prismPrescriptionFileId;
  //       });

  //       console.log('ePresUrls', ePresUrls);
  //       let ePresAndPhysicalPresUrls = [...ePresUrls];
  //       console.log(
  //         'ePresAndPhysicalPresUrls',
  //         ePresAndPhysicalPresUrls
  //           .join(',')
  //           .split(',')
  //           .map((item) => item.trim())
  //           .filter((i) => i)
  //       );
  //       if (ePresAndPhysicalPresUrls.length > 0) {
  //         client
  //           .query<downloadDocuments>({
  //             query: DOWNLOAD_DOCUMENT,
  //             fetchPolicy: 'no-cache',
  //             variables: {
  //               downloadDocumentsInput: {
  //                 patientId: currentPatient && currentPatient.id,
  //                 fileIds: ePresAndPhysicalPresUrls
  //                   .join(',')
  //                   .split(',')
  //                   .map((item) => item.trim())
  //                   .filter((i) => i),
  //               },
  //             },
  //           })
  //           .then(({ data }) => {
  //             console.log(data, 'DOWNLOAD_DOCUMENT');
  //             const uploadUrlscheck = data.downloadDocuments.downloadPaths;
  //             console.log(uploadUrlscheck, 'DOWNLOAD_DOCUMENTcmple');
  //             if (uploadUrlscheck!.length > 0) {
  //               const uploadUrlscheck = data.downloadDocuments.downloadPaths;
  //               console.log(uploadUrlscheck, 'DOWNLOAD_DOCUMENTcmple');
  //               const uploadUrls = uploadUrlscheck!.map((item) => item);
  //               console.log(uploadUrls, 'uploadUrls');
  //               const newuploadedPrescriptions = uploadUrls.map(
  //                 (item, index) =>
  //                   ({
  //                     uploadedUrl: uploadUrls[index],
  //                   } as EPrescription)
  //               );
  //               console.log(newuploadedPrescriptions, 'newuploadedPrescriptions');
  //               setEPrescriptions && setEPrescriptions([...ePrescriptions.filter((item) => item)]);
  //               setLoading!(false);
  //               console.log(ePrescriptions, 'setEPrescriptions');

  //               props.navigation.navigate(AppRoutes.TestsCheckoutScene);
  //             } else {
  //               Alert.alert('Images are not uploaded');
  //             }
  //           })
  //           .catch((e: string) => {
  //             console.log('Error occured', e);
  //           })
  //           .finally(() => {
  //             setLoading!(false);
  //           });
  //       }
  //     }
  //   }
  // };

  const validateDiagnosticCoupon = async () => {
    if (addressCityId != '') {
      setLoading!(true);
      console.log({ cartItems });
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
      console.log({ orderedTestArray });
      const CouponInput = {
        grossOrderAmountExcludingDiscount: cartTotal,
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
        if (validateApiResponse?.message == 'success') {
          setValidateCouponUniqueId(validateApiResponse?.uniqueid!);
        }
        setLoading!(false);
      } catch (error) {
        setLoading!(false);
        // renderAlert(`Something went wrong, unable to fetch Home collection charges.`);
      }
    }
  };

  const fetchHC_ChargesForTest = async (slotVal: string) => {
    setLoading!(true);
    try {
      const HomeCollectionChargesApi = await client.query<
        getDiagnosticsHCCharges,
        getDiagnosticsHCChargesVariables
      >({
        query: GET_DIAGNOSTICS_HC_CHARGES,
        variables: {
          itemIDs: itemWithId,
          totalCharges: cartTotal,
          slotID: slotVal!,
          pincode: parseInt(pinCode, 10),
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
      renderAlert(`Something went wrong, unable to fetch Home collection charges.`);
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
              ...theme.fonts.IBMPlexSansMedium(16),
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
  const selectedAddr = addresses.find((item) => item.id == deliveryAddressId);
  const zipCode = (deliveryAddressId && selectedAddr && selectedAddr.zipcode) || '0';
  return (
    <View style={{ flex: 1 }}>
      {displaySchedule && (
        <TestSlotSelectionOverlay
          heading="Schedule Appointment"
          date={date}
          areaId={areaSelected?.key!}
          maxDate={moment()
            .add(AppConfig.Configuration.DIAGNOSTIC_SLOTS_MAX_FORWARD_DAYS, 'day')
            .toDate()}
          isVisible={displaySchedule}
          onClose={() => setDisplaySchedule(false)}
          slots={slots}
          zipCode={parseInt(zipCode, 10)}
          slotInfo={selectedTimeSlot}
          onSchedule={(date: Date, slotInfo: TestSlot) => {
            console.log({ date });
            console.log({ slotInfo });
            setDate(date);
            setselectedTimeSlot(slotInfo);
            setDiagnosticSlot!({
              slotStartTime: slotInfo.slotInfo.startTime!,
              slotEndTime: slotInfo.slotInfo.endTime!,
              date: date.getTime(),
              employeeSlotId: slotInfo.slotInfo.slot!,
              diagnosticBranchCode: slotInfo.diagnosticBranchCode,
              diagnosticEmployeeCode: slotInfo.employeeCode,
              city: selectedAddr ? selectedAddr.city! : '', // not using city from this in order place API
            });
            setWebEnageEventForAppointmentTimeSlot();
            setDisplaySchedule(false);
          }}
        />
      )}
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        <ScrollView bounces={false}>
          <View style={{ marginVertical: 24 }}>
            {renderItemsInCart()}
            {renderProfiles()}
            <MedicineUploadPrescriptionView
              isTest={true}
              navigation={props.navigation}
              isMandatory={false}
              listOfTest={[]}
            />
            {renderDelivery()}
            {renderTotalCharges()}
            {/* {renderTestSuggestions()} */}
          </View>
          <View style={{ height: 70 }} />
        </ScrollView>
        <StickyBottomComponent defaultBG>
          <Button
            disabled={disableProceedToPay}
            title={'PLACE ORDER'}
            onPress={() => onPressProceedToPay()}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent>
      </SafeAreaView>
      {isModalVisible && renderNewView()}
      {showSpinner && <Spinner />}
    </View>
  );
};
