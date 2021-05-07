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
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
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
  InfoIconRed,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
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
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { TestSlotSelectionOverlay } from '@aph/mobile-patients/src/components/Tests/components/TestSlotSelectionOverlay';
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
const { width: screenWidth } = Dimensions.get('window');

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
  } = useDiagnosticsCart();
  const {
    setAddresses: setMedAddresses,
    circleSubscriptionId,
    circlePlanValidity,
  } = useShoppingCart();

  const sourceScreen = props.navigation.getParam('comingFrom');
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();
  const { currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [todaySlotNotAvailable, setTodaySlotNotAvailable] = useState<boolean>(false);
  const currentPatientId = currentPatient && currentPatient?.id;
  const client = useApolloClient();
  const {
    locationDetails,
    diagnosticServiceabilityData,
    diagnosticLocation,
    setDoctorJoinedChat,
    isDiagnosticLocationServiceable,
  } = useAppCommonData();

  const { getPatientApiCall } = useAuth();

  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const [displaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>();
  const [isEPrescriptionUploadComplete, setisEPrescriptionUploadComplete] = useState<boolean>();
  const [addressCityId, setAddressCityId] = useState<string>(deliveryAddressCityId);
  const [validateCouponUniqueId, setValidateCouponUniqueId] = useState<string>(getUniqueId);
  const [orderDetails, setOrderDetails] = useState<orderDetails>();
  const [showInclusions, setShowInclusions] = useState<boolean>(false);
  const [duplicateNameArray, setDuplicateNameArray] = useState([] as any);
  const [showAreaSelection, setShowAreaSelection] = useState<boolean>(false);
  const [showPatientListOverlay, setShowPatientListOverlay] = useState<boolean>(
    showSelectPatient ? false : true
  );
  const [showPatientDetailsOverlay, setShowPatientDetailsOverlay] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showSelectAreaOverlay, setShowSelectAreaOverlay] = useState<boolean>(false);
  const [reportGenDetails, setReportGenDetails] = useState<any>([]);
  const [alsoAddListData, setAlsoAddListData] = useState<any>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const itemsWithHC = cartItems?.filter((item) => item!.collectionMethod == 'HC');
  const itemWithId = itemsWithHC?.map((item) => Number(item.id!));

  const cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
  var pricesForItemArray;
  var slotBookedArray = ['slot', 'already', 'booked', 'select a slot'];

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
    initiateHyperSDK();
  }, [currentPatient]);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setIsFocused(true);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setIsFocused(false);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  useEffect(() => {
    if (showSelectPatient && currentPatient) {
      setSelectedPatient(currentPatient);
      setShowPatientListOverlay(false);
    }
    fetchAddresses();
  }, []);

  const fetchTestReportGenDetails = async (_cartItemId: string | number[]) => {
    try {
      const removeSpaces =
        typeof _cartItemId == 'string' ? _cartItemId.replace(/\s/g, '').split(',') : null;
      const listOfIds =
        typeof _cartItemId == 'string' ? removeSpaces?.map((item) => parseInt(item!)) : _cartItemId;
      const res: any = await getDiagnosticCartItemReportGenDetails(
        listOfIds?.toString() || _cartItemId?.toString()
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
            variables: { cityID: Number(addressCityId) || 9, itemIDs: _filterItemIds },
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
    props.navigation.goBack();
  };

  useEffect(() => {
    if (cartItemsWithId?.length > 0) {
      fetchPackageDetails(cartItemsWithId, null, 'diagnosticServiceablityChange');
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
  }, [diagnosticSlot, deliveryAddressId, cartItems, addresses]);

  useEffect(() => {
    if (deliveryAddressId != '' && isFocused) {
      getPinCodeServiceability();
    }
  }, [deliveryAddressId, addresses, isFocused]);

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
    const mode = 'Home Visit';
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
    if (cartItems?.length > 0) {
      if (cartItemsWithId?.length > 0) {
        fetchTestReportGenDetails(cartItemsWithId);
      }
    }
  }, [cartItems?.length, addressCityId]);

  useEffect(() => {
    setPatientId!(currentPatientId!);
  }, [currentPatientId]);

  useEffect(() => {
    if (cartItems?.length == 0) {
      setselectedTimeSlot?.(undefined);
      setDiagnosticAreas?.([]);
      setAreaSelected?.({});
      setDeliveryAddressId?.('');
      setHcCharges?.(0);
      setLoading?.(false);
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
      isEmptyObject(areaSelected) == false
        ? checkSlotSelection(areaSelected, undefined, undefined, removedItems)
        : showAreaSelection
        ? fetchAreasForAddress(
            addresses?.[selectedAddressIndex]?.id,
            addresses?.[selectedAddressIndex]?.zipcode!,
            showAreaSelection
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
            pincode: Number(pinCodeFromAddress),
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
                const _itemIds = cartItems?.map((item) => Number(item?.id));
                !isEmptyObject(areaSelected)
                  ? checkSlotSelection(areaSelected, undefined, undefined, _itemIds)
                  : shouldShowArea
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
              const _itemIds = cartItems?.map((item) => Number(item?.id));

              !isEmptyObject(areaSelected)
                ? checkSlotSelection(areaSelected, undefined, undefined, _itemIds)
                : shouldShowArea
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
        const _itemIds = cartItems?.map((item) => Number(item?.id));
        !isEmptyObject(areaSelected)
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
          const product = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics');

          if (product) {
            func && func(product[0]!);

            if (comingFrom == 'diagnosticServiceablityChange') {
              product?.map((item) => {
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
          areaID: Number((areaObject as any).key!),
          itemIds: _itemIds || cartItemsWithId,
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
        setDeliveryAddressId?.(addresses?.[selectedAddressIndex]?.id); //if not setting, then new address added is not selected
        setPinCode?.(addresses?.[selectedAddressIndex]?.zipcode!);
      })
      .catch((e) => {
        CommonBugFender('TestsCart_checkServicability', e);
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

  const renderHomeCollectionDisclaimer = () => {
    return (
      <View style={styles.homeCollectionContainer}>
        <InfoIconRed style={styles.infoIconStyle} />
        <Text style={styles.phleboText}>{string.diagnostics.homeHomeCollectionDisclaimerTxt}</Text>
      </View>
    );
  };

  const renderTotalCharges = () => {
    const anyCartSaving = isDiagnosticCircleSubscription ? cartSaving + circleSaving : cartSaving;

    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        {/* {renderCouponView()} */}
        {renderHomeCollectionDisclaimer()}
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
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.blueTextStyle}>Home Collection Charges</Text>
              <Text style={styles.blueTextStyle}>
                {string.common.Rs} {hcCharges.toFixed(2)}
              </Text>
            </View>
          }
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

  const disableProceedToPay = !(
    cartItems?.length > 0 &&
    forPatientId &&
    !!(
      selectedPatient &&
      deliveryAddressId &&
      selectedTimeSlot &&
      selectedTimeSlot?.date &&
      selectedTimeSlot?.slotInfo?.startTime
    ) &&
    (uploadPrescriptionRequired
      ? physicalPrescriptions.length > 0 || ePrescriptions.length > 0
      : true)
  );

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
    saveHomeCollectionOrder();
  };

  const saveHomeCollectionOrder = () => {
    //for circle members if unique id is blank, show error
    if (
      isDiagnosticCircleSubscription &&
      (validateCouponUniqueId == '' || validateCouponUniqueId == null)
    ) {
      renderAlert(string.common.tryAgainLater);
      setshowSpinner(false);
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
              diagnostics: [
                { order_id: orderId, amount: grandTotal, patient_id: currentPatient?.id },
              ],
            };
            const orderInput: OrderCreate = {
              orders: orders,
              total_amount: grandTotal,
              customer_id: currentPatient?.primaryPatientId || currentPatient?.id,
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
                source: 'diagnostics'
              });
            }
          }
        })
        .catch((error) => {
          CommonBugFender('TestsCheckoutScene_saveOrder', error);
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
          preTestingRequirement: !!reportGenDetails && reportGenDetails?.[index]?.itemReportTat ? reportGenDetails?.[index]?.itemReportTat : null,
          reportGenerationTime: !!reportGenDetails && reportGenDetails?.[index]?.itemPrepration ? reportGenDetails?.[index]?.itemPrepration : null,
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
    setCartItems?.(updatedCartItems);
    //refetch the areas
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      const _itemIds = updatedCartItems?.map((item: any) => Number(item?.id));
      !isEmptyObject(areaSelected)
        ? checkSlotSelection(areaSelected, undefined, undefined, _itemIds)
        : showAreaSelection
        ? fetchAreasForAddress(
            addresses?.[selectedAddressIndex]?.id,
            addresses?.[selectedAddressIndex]?.zipcode!,
            showAreaSelection
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

  const fetchHC_ChargesForTest = async (slotVal: string) => {
    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
    );
    const pinCodeFromAddress = addresses?.[selectedAddressIndex]?.zipcode!;
    setPinCode?.(pinCode);
    setLoading?.(true);
    let newGrandTotal = grandTotal - hcCharges;
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
          totalCharges: newGrandTotal, //removed cartTotal due APP-7386
          slotID: slotVal!,
          pincode: Number(pinCodeFromAddress),
        },
        fetchPolicy: 'no-cache',
      });

      let getCharges = g(HomeCollectionChargesApi.data, 'getDiagnosticsHCCharges', 'charges') || 0;
      if (getCharges != null) {
        setHcCharges?.(getCharges);
      }
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      // renderAlert(`Something went wrong, unable to fetch Home collection charges.`);
    }
  };

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
              <Text style={styles.changeTextStyle} onPress={() => setShowPatientListOverlay(true)}>
                {string.diagnostics.changeText}
              </Text>
            </View>
            <Text style={styles.patientDetailsTextStyle}>{patientDetailsText}</Text>
            <Text style={styles.testReportMsgStyle}>{string.diagnostics.testReportMsgText}</Text>
          </View>
        ) : null}
        {addressText ? (
          <View style={styles.patientNameMainViewStyle}>
            <View style={styles.patientNameViewStyle}>
              <Text style={styles.patientNameTextStyle}>{string.diagnostics.homeVisitText}</Text>
              <Text style={styles.changeTextStyle} onPress={() => showAddressPopup()}>
                {string.diagnostics.changeText}
              </Text>
            </View>
            <Text style={styles.patientDetailsTextStyle}>{addressText}</Text>
          </View>
        ) : null}
        {showAreaSelection && !isEmptyObject(areaSelected) ? (
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
                setAsyncPharmaLocation(_address);
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

  const _fetchAreasAndReportGenDetails = (_item: any, callReportGen?: boolean) => {
    const _cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
    _cartItemsWithId?.push(Number(_item?.itemId));
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      !isEmptyObject(areaSelected)
        ? checkSlotSelection(areaSelected, undefined, undefined, _cartItemsWithId)
        : showAreaSelection
        ? fetchAreasForAddress(
            addresses?.[selectedAddressIndex]?.id,
            addresses?.[selectedAddressIndex]?.zipcode!,
            showAreaSelection,
            callReportGen ? _cartItemsWithId : undefined
          )
        : getAreas(callReportGen ? _cartItemsWithId : undefined);
    }
  };

  const renderAlsoAddItems = () => {
    return (
      <View>
        {alsoAddListData?.length > 0 ? renderAlsoAddListHeader() : null}
        <ItemCard
          onPressAddToCartFromCart={(item) => _fetchAreasAndReportGenDetails(item, true)}
          onPressRemoveItemFromCart={(item) => _fetchAreasAndReportGenDetails(item)}
          data={alsoAddListData}
          isCircleSubscribed={isDiagnosticCircleSubscription}
          isServiceable={isDiagnosticLocationServiceable}
          isVertical={false}
          navigation={props.navigation}
          source={'Cart Page'}
          sourceScreen={AppRoutes.TestsCart}
        />
      </View>
    );
  };

  const renderAlsoAddListHeader = () => {
    return <Text style={styles.alsoAddListHeaderTextStyle}>{'YOU SHOULD ALSO ADD'}</Text>;
  };

  const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);
  const addressText = selectedAddr ? formatAddressWithLandmark(selectedAddr) || '' : '';
  const zipCode = (deliveryAddressId && selectedAddr && selectedAddr?.zipcode) || '0';

  const isCovidItem = cartItemsWithId?.map((item) =>
    AppConfig.Configuration.Covid_Items.includes(item)
  );
  const isCartHasCovidItem = isCovidItem?.find((item) => item === true);
  const maxDaysToShow = !!isCartHasCovidItem
    ? AppConfig.Configuration.Covid_Max_Slot_Days
    : AppConfig.Configuration.Non_Covid_Max_Slot_Days;

  return (
    <View style={{ flex: 1 }}>
      {displaySchedule && (
        <TestSlotSelectionOverlay
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
          <View style={{ marginVertical: 16 }}>
            {renderPatientDetails()}
            {renderItemsInCart()}
            {renderTotalCharges()}
            {cartItems?.length > 0 ? renderAlsoAddItems() : null}
          </View>
          <View style={{ height: cartItems?.length > 0 ? 140 : 90 }} />
        </ScrollView>
        {renderTestProceedBar()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
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
  phleboText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 18,
    letterSpacing: 0.1,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.7,
    marginHorizontal: '2%',
  },
  infoIconStyle: { resizeMode: 'contain', height: 18, width: 18 },
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
  homeCollectionContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    backgroundColor: '#FCFDDA',
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
});
