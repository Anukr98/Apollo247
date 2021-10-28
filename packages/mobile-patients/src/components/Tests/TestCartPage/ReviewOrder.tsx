import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  CheckedIcon,
  CircleLogo,
  Down,
  SavingsIcon,
  Up,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  createPatientAddressObject,
  createPatientObjLineItems,
  sourceHeaders,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import {
  aphConsole,
  formatAddressWithLandmark,
  g,
  getCircleNoSubscriptionText,
  getUserType,
  isDiagnosticSelectedCartEmpty,
  isEmptyObject,
  isSmallDevice,
  nameFormater,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DiagnosticPatientCartItem,
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useApolloClient } from 'react-apollo-hooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  CALL_TO_ORDER_CTA_PAGE_ID,
  DEVICETYPE,
  DiagnosticLineItem,
  DiagnosticsBookingSource,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  one_apollo_store_code,
  OrderCreate,
  OrderVerticals,
  patientObjWithLineItems,
  SaveBookHomeCollectionOrderInputv2,
  saveModifyDiagnosticOrderInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  convertNumberToDecimal,
  diagnosticsDisplayPrice,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { TestProceedBar } from '@aph/mobile-patients/src/components/Tests/components/TestProceedBar';
import {
  createHyperServiceObject,
  initiateSDK,
  terminateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { findDiagnosticSettings } from '@aph/mobile-patients/src/graphql/types/findDiagnosticSettings';
import {
  CREATE_INTERNAL_ORDER,
  CREATE_USER_SUBSCRIPTION,
  FIND_DIAGNOSTIC_SETTINGS,
  GET_PLAN_DETAILS_BY_PLAN_ID,
  MODIFY_DIAGNOSTIC_ORDERS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  diagnosticGetPhleboCharges,
  diagnosticSaveBookHcCollectionV2,
  getReportTAT,
  processDiagnosticsCODOrderV2,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  DiagnosticModifyOrder,
  DiagnosticProceedToPay,
  DiagnosticRemoveFromCartClicked,
  PaymentInitiated,
} from '@aph/mobile-patients/src/components/Tests/Events';

import moment from 'moment';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticCartItemReportGenDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  DIAGNOSTIC_SLOT_TYPE,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  saveModifyDiagnosticOrder,
  saveModifyDiagnosticOrderVariables,
  saveModifyDiagnosticOrder_saveModifyDiagnosticOrder_attributes_conflictedItems,
} from '@aph/mobile-patients/src/graphql/types/saveModifyDiagnosticOrder';
import {
  createOrderInternalVariables,
  createOrderInternal,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import { TestPremiumSlotOverlay } from '@aph/mobile-patients/src/components/Tests/components/TestPremiumSlotOverlay';
import {
  SCREEN_NAMES,
  TimelineWizard,
} from '@aph/mobile-patients/src/components/Tests/components/TimelineWizard';
import { saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs } from '@aph/mobile-patients/src/graphql/types/saveDiagnosticBookHCOrderv2';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import {
  CreateUserSubscription,
  CreateUserSubscriptionVariables,
} from '@aph/mobile-patients/src/graphql/types/CreateUserSubscription';
import CircleCard from '@aph/mobile-patients/src/components/Tests/components/CircleCard';
import { CirclePlansListOverlay } from '@aph/mobile-patients/src/components/Tests/components/CirclePlansListOverlay';
import { debounce } from 'lodash';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { CallToOrderView } from '@aph/mobile-patients/src/components/Tests/components/CallToOrderView';

const screenWidth = Dimensions.get('window').width;
type orderListLineItems = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems;

enum BOOKING_TYPE {
  SAVE = 'saveOrder',
  MODIFY = 'modifyOrder',
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

export type conflictWithPatientsObjInterface = {
  itemsToRemovalName: string;
  toKeepItemIds: string;
  patientId: string;
};

export interface ReviewOrderProps extends NavigationScreenProps {
  slotsInput: any;
  selectedTimeSlot: any;
}

export const ReviewOrder: React.FC<ReviewOrderProps> = (props) => {
  const {
    cartItems,
    setCartItems,
    addresses,
    deliveryAddressId,
    cartTotal,
    totalPriceExcludingAnyDiscounts,
    couponDiscount,
    grandTotal,
    uploadPrescriptionRequired,
    physicalPrescriptions,
    pinCode,
    ePrescriptions,
    diagnosticSlot,
    setDiagnosticSlot,
    setHcCharges,
    hcCharges,
    cartSaving,
    discountSaving,
    normalSaving,
    circleSaving,
    isDiagnosticCircleSubscription,
    modifyHcCharges,
    setModifyHcCharges,
    modifiedOrder,
    distanceCharges,
    setDistanceCharges,
    duplicateItemsArray,
    patientCartItems,
    setDuplicateItemsArray,
    modifiedPatientCart,
    setModifiedPatientCart,
    setPatientCartItems,
    phleboETA,
    removeDuplicatePatientCartItems,
    deliveryAddressCityId,
    cartItemsMapping,
    setCartItemsMapping,
    isCircleAddedToCart,
    setIsCircleAddedToCart,
    selectedCirclePlan,
    setSelectedCirclePlan,
    setIsDiagnosticCircleSubscription,
    isCirclePlanRemoved,
    setIsCirclePlanRemoved,
    modifiedOrderItemIds,
    circleGrandTotal,
  } = useDiagnosticsCart();

  const {
    circlePlanSelected,
    circleSubscriptionId,
    setCircleMembershipCharges,
    setCircleSubPlanId,
    setCircleSubscriptionId,
    setCirclePlanSelected,
    setIsCircleSubscription,
  } = useShoppingCart();

  const {
    diagnosticServiceabilityData,
  } = useAppCommonData();

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { setauthToken } = useAppCommonData();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();

  type PatientsObjWithOrderIDs = saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs;
  type PatientObjWithModifyOrderIDs = saveModifyDiagnosticOrder_saveModifyDiagnosticOrder_attributes_conflictedItems;
  var modifyPricesForItemArray, pricesForItemArray, pricesForItemArrayForHC;
  var getPatientLineItems: (patientObjWithLineItems | null)[] | any, billAmount;

  const slotsInput = props.navigation.getParam('slotsInput');
  const selectedTimeSlot = props.navigation.getParam('selectedTimeSlot');
  const showPaidPopUp = props.navigation.getParam('showPaidPopUp');
  const selectedAddr = props.navigation.getParam('selectedAddress');
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const reportGenDetails = props.navigation.getParam('reportGenDetails');
  const cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
  var slotBookedArray = ['slot', 'already', 'booked', 'select a slot'];

  const { cusId, isfetchingId } = useGetJuspayId();
  const [phleboMin, setPhleboMin] = useState(0);
  const [showAllPreviousItems, setShowAllPreviousItems] = useState<boolean>(false);
  const [isHcApiCalled, setHcApiCalled] = useState<boolean>(false);
  const [duplicateNameArray, setDuplicateNameArray] = useState(duplicateItemsArray as any);
  const [showInclusions, setShowInclusions] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<orderDetails>();
  const [isVisible, setIsVisible] = useState<boolean>(showPaidPopUp);
  const [date, setDate] = useState<Date>(new Date());
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);
  const [defaultCirclePlan, setDefaultCirclePlan] = useState<any>(null);
  const [allMembershipPlans, setAllMembershipPlans] = useState<any>([]);
  const [showCirclePopup, setShowCirclePopup] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [reportTat, setReportTat] = useState<string>('');

  let itemNamesToRemove_global: string[] = [];
  let itemIdsToRemove_global: Number[] = [];
  let itemIdsToKeep_global: Number[] = [];
  let itemNamesToKeep_global: string[] = [];
  let setLowItemName: string[] = [],
    setHighPriceName: string[] = [];
  let localCircleSubId = '';
  const circlePlanPurchasePrice = !!selectedCirclePlan
    ? selectedCirclePlan?.currentSellingPrice
    : !!defaultCirclePlan && defaultCirclePlan?.currentSellingPrice;

  const toPayPrice = isCircleAddedToCart
    ? Number(grandTotal) + Number(circlePlanPurchasePrice)
    : grandTotal;

  const nonCircle_CircleEffectivePrice = Number(circleGrandTotal) + Number(circlePlanPurchasePrice);

  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const addressText = isModifyFlow
    ? formatAddressWithLandmark(modifiedOrder?.patientAddressObj) || ''
    : selectedAddr
    ? formatAddressWithLandmark(selectedAddr) || ''
    : '';
  const isCartEmpty = isDiagnosticSelectedCartEmpty(
    isModifyFlow ? modifiedPatientCart : patientCartItems
  );
  var patientCartItemsCopy = JSON.parse(JSON.stringify(isCartEmpty));
  const hideCirclePurchaseInModify =
    isModifyFlow && modifiedOrder?.paymentType !== DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;
  const getConfigValues = AppConfig.Configuration.CIRCLE_PLAN_PRESELECTED;

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const willBlur = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      willBlur && willBlur.remove();
    };
  }, []);

  useEffect(() => {
    const itemIds = isModifyFlow ? cartItemsWithId.concat(modifiedOrderItemIds) : cartItemsWithId;
    populateCartMapping();
    fetchOverallReportTat(itemIds);
    //if not a circle member
    if (!isDiagnosticCircleSubscription) {
      fetchCirclePlans();
    }
    !!selectedCirclePlan && !isEmptyObject(selectedCirclePlan) && _addCircleValues();
  }, []);

  useEffect(() => {
    isDiagnosticCircleSubscription
      ? setIsCircleAddedToCart?.(false)
      : getConfigValues
      ? setIsCircleAddedToCart?.(
          hideCirclePurchaseInModify ? false : isCirclePlanRemoved ? false : getConfigValues
        )
      : setIsCircleAddedToCart?.(
          hideCirclePurchaseInModify
            ? false
            : isCircleAddedToCart
            ? isCircleAddedToCart
            : getConfigValues
        );
  }, []);

  async function populateCartMapping() {
    const listOfIds = cartItems?.map((item) => Number(item?.id));
    try {
      const res: any = await getDiagnosticCartItemReportGenDetails(
        listOfIds?.toString(),
        Number(deliveryAddressCityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
      );
      if (res?.data?.success) {
        const getItems = res?.data?.data;
        setCartItemsMapping?.(getItems);
      }
    } catch (error) {
      CommonBugFender('populateCartMapping_ReviewOrder', error);
    }
  }

  //clear all the values added value
  function clearCircleAddedToCart() {
    //clear the value of circleAddedToCart on going back (header, h/w back, timeline wizard)
    // !isDiagnosticCircleSubscription && isCircleAddedToCart && setIsCircleAddedToCart?.(false);
    if (isCircleAddedToCart) {
      setCircleMembershipCharges?.(0);
      setCircleSubPlanId?.('');
      setCircleSubscriptionId?.('');
      setIsCircleSubscription?.(false);
      setIsDiagnosticCircleSubscription?.(false);
      setCirclePlanSelected?.(null); //overall
    }
  }

  function handleBack() {
    clearCircleAddedToCart();
    props.navigation.goBack();
    return true;
  }

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const merchantId = AppConfig.Configuration.merchantId;
      terminateSDK();
      createHyperServiceObject();
      initiateSDK(cusId, cusId, merchantId);
      setHyperSdkInitialized(true);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const fetchCirclePlans = async () => {
    try {
      const res = await client.query<GetPlanDetailsByPlanId>({
        query: GET_PLAN_DETAILS_BY_PLAN_ID,
        fetchPolicy: 'no-cache',
        variables: {
          plan_id: AppConfig.Configuration.CIRCLE_PLAN_ID,
        },
      });
      const membershipPlans = res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary;
      setAllMembershipPlans(membershipPlans);
      if (membershipPlans) {
        const defaultPlan = membershipPlans?.filter((item: any) => item?.defaultPack === true);
        if (defaultPlan?.length > 0) {
          setDefaultCirclePlan(defaultPlan?.[0]);
        }
      }
    } catch (error) {
      CommonBugFender('fetchCirclePlans_GetPlanDetailsByPlanId', error);
    }
  };

  const createOrderInternal = (orders: OrderCreate) =>
    client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      context: {
        sourceHeaders,
      },
      variables: { order: orders },
    });

  function clearCollectionCharges() {
    setHcApiCalled(true);
    setHcCharges?.(0);
    setDistanceCharges?.(0);
    setModifyHcCharges?.(0);
  }

  useEffect(() => {
    isModifyFlow && fetchFindDiagnosticSettings();
  }, []);

  useEffect(() => {
    //modify case
    if (isModifyFlow && cartItems?.length > 0 && modifiedPatientCart?.length > 0) {
      //if multi-uhid modify -> don't call phleboCharges api
      // !!modifiedOrder?.attributesObj?.isMultiUhid && modifiedOrder?.attributesObj?.isMultiUhid
      //   ? clearCollectionCharges()
      //   : fetchHC_ChargesForTest();
      clearCollectionCharges();
    } else {
      fetchHC_ChargesForTest();
    }
  }, [isCircleAddedToCart]);

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  async function fetchOverallReportTat(_cartItemId: string | number[]) {
    const removeSpaces =
      typeof _cartItemId == 'string' ? _cartItemId?.replace(/\s/g, '')?.split(',') : null;
    const listOfIds =
      typeof _cartItemId == 'string' ? removeSpaces?.map((item) => Number(item!)) : _cartItemId;
    const pincode = isModifyFlow
      ? modifiedOrder?.patientAddressObj?.zipcode
      : selectedAddr?.zipcode;

    const formattedDate = moment(diagnosticSlot?.selectedDate)?.format('YYYY-MM-DD') as string;
    const formatTime = diagnosticSlot?.slotStartTime as string;
    const formattedString = moment(formattedDate).format('YYYY/MM/DD') + ' ' + formatTime;
    const dateTimeInUTC = isModifyFlow
      ? modifiedOrder && modifiedOrder?.slotDateTimeInUTC
      : new Date(formattedString)?.toISOString();

    const cityIdToPass = isModifyFlow ? modifiedOrder?.cityId : deliveryAddressCityId;

    try {
      const result = await getReportTAT(
        client,
        dateTimeInUTC,
        Number(cityIdToPass),
        !!pincode ? Number(pincode) : 0,
        listOfIds!
      );
      if (result?.data?.getConfigurableReportTAT) {
        const getMaxReportTat = result?.data?.getConfigurableReportTAT?.reportTATMessage;
        setReportTat(getMaxReportTat!);
      } else {
        setReportTat('');
      }
    } catch (error) {
      CommonBugFender('fetchReportTat_ReviewOrderPage', error);
      setReportTat('');
    }
  }

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
      CommonBugFender('ReviewOrder_fetchFindDiagnosticSettings', error);
    }
  };

  function createLineItemPrices(selectedItem: any) {
    pricesForItemArrayForHC = selectedItem?.cartItems?.map(
      (item: any, index: number) =>
        ({
          itemId: Number(item?.id),
          price:
            isDiagnosticCircleSubscription && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
              ? Number(item?.circleSpecialPrice)
              : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
              ? Number(item?.discountSpecialPrice)
              : Number(item?.specialPrice) || Number(item?.price),
          mrp:
            isDiagnosticCircleSubscription && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
              ? Number(item?.circlePrice)
              : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
              ? Number(item?.discountPrice)
              : Number(item?.price),
          groupPlan: isDiagnosticCircleSubscription
            ? item?.groupPlan!
            : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
            ? item?.groupPlan
            : DIAGNOSTIC_GROUP_PLAN.ALL,
          preTestingRequirement:
            !!reportGenDetails && reportGenDetails?.[index]?.itemPrepration
              ? reportGenDetails?.[index]?.itemPrepration
              : null,
        } as DiagnosticLineItem)
    );

    return {
      pricesForItemArrayForHC,
    };
  }

  function createFinalItems(previousItems: any, newCart: DiagnosticPatientCartItem[]) {
    const cartItems = newCart?.map((item) => {
      const obj = {
        patientId: item?.patientId,
        cartItems: item?.cartItems?.concat(previousItems),
      };
      return obj;
    });
    return cartItems;
  }

  function createPatientObjLineItems_1(modifiedLineItems?: any) {
    const filterPatientItems = isDiagnosticSelectedCartEmpty(
      isModifyFlow ? modifiedPatientCart : patientCartItems
    );
    const finalLineItems =
      !!modifiedLineItems && createFinalItems(modifiedLineItems, filterPatientItems);
    //will be for 1 patient
    const finalCartItems =
      isModifyFlow && !!modifiedLineItems ? finalLineItems : filterPatientItems;
    var array = [] as any; //define type
    finalCartItems?.map((item: any) => {
      const getPricesForItem = createLineItemPrices(item)?.pricesForItemArrayForHC;
      const totalPrice = getPricesForItem
        ?.map((item: any) => Number(item?.price))
        ?.reduce((prev: number, curr: number) => prev + curr, 0);
      array.push({
        patientID: item?.patientId,
        lineItems: getPricesForItem,
        totalPrice: totalPrice,
      });
    });
    return array;
  }

  const fetchHC_ChargesForTest = async () => {
    setLoading?.(true);
    setHcApiCalled(false);
    var apiInput;
    var modifiedOrderLineItems;
    if (isModifyFlow) {
      modifiedOrderLineItems = modifiedOrder?.diagnosticOrderLineItems?.map(
        (item: orderListLineItems) =>
          ({
            id: item?.itemId,
            price: item?.price,
            groupPlan: item?.groupPlan,
            mrp: !!item?.packageCalculatedMrp
              ? item?.packageCalculatedMrp > 0 && item?.packageCalculatedMrp
              : item?.pricingObj?.find((obj) => obj?.groupPlan == item?.groupPlan)?.mrp,
            preTestingRequirement: item?.itemObj?.testPreparationData,
            reportGenerationTime: item?.itemObj?.reportGenerationTime,
          } as DiagnosticLineItem)
      );
      const addressObject = Object.assign(modifiedOrder?.patientAddressObj, {
        id: modifiedOrder?.patientAddressId,
      });
      const getAddressObject = createPatientAddressObject(addressObject, {});
      const getPatientObjWithLineItems = createPatientObjLineItems_1(
        modifiedOrderLineItems
      ) as (patientObjWithLineItems | null)[];
      const billAmount = getPatientObjWithLineItems
        ?.map((item) => Number(item?.totalPrice))
        ?.reduce((prev: number, curr: number) => prev + curr, 0);
      apiInput = {
        patientAddressObj: getAddressObject,
        patientsObjWithLineItems: getPatientObjWithLineItems,
        billAmount: billAmount,
        diagnosticOrdersId: modifiedOrder?.id,
      };
    } else {
      /**
       * this has been added since, we need to new lineLineItems
       */
      getPatientLineItems = createPatientObjLineItems(
        patientCartItems,
        isDiagnosticCircleSubscription ? true : isCircleAddedToCart,
        reportGenDetails
      ) as (patientObjWithLineItems | null)[];
      billAmount = getPatientLineItems
        ?.map((item: any) => Number(item?.totalPrice))
        ?.reduce((prev: number, curr: number) => prev + curr, 0);

      const slotData = {
        slotDetails: {
          slotDisplayTime: diagnosticSlot?.slotStartTime,
        },
        paidSlot: diagnosticSlot?.isPaidSlot!,
      };
      apiInput = {
        patientAddressObj: slotsInput?.addressObject,
        // patientsObjWithLineItems:  slotsInput?.lineItems,
        // billAmount: slotsInput?.total,
        patientsObjWithLineItems: getPatientLineItems,
        billAmount: billAmount,
        serviceability: slotsInput?.serviceabilityObj,
        slotInfo: slotData,
      };
    }

    try {
      const HomeCollectionChargesApi = await diagnosticGetPhleboCharges(client, apiInput);
      let getCharges = g(HomeCollectionChargesApi?.data, 'getPhleboCharges', 'charges') || 0;
      //will distance charges play any role in modify?

      let distanceCharges =
        g(HomeCollectionChargesApi?.data, 'getPhleboCharges', 'distanceCharges') || 0;
      if (getCharges != null) {
        let recalculatedHC = isModifyFlow
          ? calculateModifiedOrderHomeCollectionCharges(getCharges)
          : getCharges;

        //when flat 100 is not there
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
        setDistanceCharges?.(isModifyFlow ? 0 : distanceCharges); //should not get applied
        setModifyHcCharges?.(updatedHcCharges); //used for calculating subtotal & topay
      }
      setLoading?.(false);
      setHcApiCalled(true);
    } catch (error) {
      setHcApiCalled(true);
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

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={isModifyFlow ? string.diagnostics.modifyHeader : 'REVIEW ORDER'}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };
  const renderAddressHeading = () => {
    return (
      <View>
        {renderLabel(nameFormater(string.diagnostics.homeVisitText, 'title'))}
        <View style={styles.addressOuterView}>
          <View style={styles.addressTextView}>
            <Text style={styles.addressTextStyle}>{addressText}</Text>
          </View>
        </View>
      </View>
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

  const renderCartHeading = () => {
    return renderLabel(nameFormater('Items in your cart', 'title'));
  };

  const renderCartItemCard = () => {
    var itemsWithQuantity: any = [];
    const arrayToChoose = isModifyFlow ? modifiedPatientCart : patientCartItems;
    const filterPatientItems = arrayToChoose?.map((item) => {
      let obj = {
        patientId: item?.patientId,
        cartItems: item?.cartItems?.filter((items) => items?.isSelected == true),
      };
      return obj;
    });
    const allCartItems = filterPatientItems?.map((item) => item?.cartItems)?.flat();
    const copyAllCartItems = JSON.parse(JSON.stringify(allCartItems));

    copyAllCartItems?.map((item: DiagnosticsCartItem) => {
      const isPresentIndex = itemsWithQuantity?.findIndex(
        (val: DiagnosticsCartItem) => Number(val?.id) === Number(item?.id)
      );
      if (isPresentIndex !== -1) {
        const value = itemsWithQuantity[isPresentIndex];
        value.id = value?.id;
        value.name = value?.name;
        value.mou = value?.mou + 1;
        value.thumbnail = value?.thumbnail;
        value.price = value?.price;
        value.specialPrice = value?.specialPrice;
        value.circlePrice = value?.circlePrice;
        (value.circleSpecialPrice = value?.circleSpecialPrice),
          (value.discountPrice = value?.discountPrice);
        value.collectionMethod = value?.collectionMethod;
        value.groupPlan = value?.groupPlan;
        value.packageMrp = value?.packageMrp;
        value.inclusions = value?.inclusions;
        value.isSelected = value?.isSelected;
      } else {
        itemsWithQuantity.push(item);
      }
      return itemsWithQuantity;
    });
    return (
      <View style={{ backgroundColor: theme.colors.WHITE }}>
        {itemsWithQuantity?.map((item: DiagnosticsCartItem, index: number) => {
          return renderItemView(item);
        })}
        {isCircleAddedToCart ? renderCircleMembershipItem() : null}
      </View>
    );
  };

  {
    /**
    check for the plan selected
   */
  }
  const renderCircleMembershipItem = () => {
    const defaultPlanPurchasePrice = !!selectedCirclePlan
      ? selectedCirclePlan?.currentSellingPrice
      : !!defaultCirclePlan && defaultCirclePlan?.currentSellingPrice;
    const defaultPlanDurationInMonths = !!selectedCirclePlan
      ? selectedCirclePlan?.durationInMonth
      : !!defaultCirclePlan && defaultCirclePlan?.durationInMonth;
    return (
      <View style={{ margin: 16 }}>
        <View style={styles.flexRow}>
          <View
            style={{
              flexDirection: 'row',
              width: screenWidth > 350 ? '77%' : '72%',
              alignItems: 'center',
            }}
          >
            <CircleLogo style={styles.smallCircleLogo} />
            <Text style={styles.circleMembershipText}>
              {defaultPlanDurationInMonths} {defaultPlanDurationInMonths == 1 ? 'month' : 'months'}{' '}
              membership
            </Text>
          </View>
          <Text style={[styles.priceTextStyle, { marginRight: 20 }]}>
            {string.common.Rs}
            {defaultPlanPurchasePrice}
          </Text>
        </View>
        <TouchableOpacity onPress={() => _onPressRemovePlan()} style={styles.removeTouch}>
          <Text style={styles.removeText}>REMOVE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  function _onPressRemovePlan() {
    setIsCircleAddedToCart?.(false);
    setIsCirclePlanRemoved?.(true);
  }

  const renderItemView = (item: DiagnosticsCartItem) => {
    const showCirclePrice = isDiagnosticCircleSubscription ? true : isCircleAddedToCart;
    const priceToShow = diagnosticsDisplayPrice(item, showCirclePrice)?.priceToShow;
    const mrpToDisplay = diagnosticsDisplayPrice(item, showCirclePrice)?.mrpToDisplay;

    const calTotal = priceToShow * item?.mou;
    const savingAmount =
      Number((!!item?.packageMrp && item?.packageMrp!) || mrpToDisplay) -
      Number(item?.circleSpecialPrice!);

    const totalIndiviualSavingAmount = !!savingAmount && savingAmount * item?.mou;

    const isGroupPlanCircle = item?.groupPlan === DIAGNOSTIC_GROUP_PLAN.CIRCLE;

    return (
      <View>
        <View style={styles.itemView}>
          <View
            style={{
              width: screenWidth > 350 ? '77%' : '72%',
            }}
          >
            <Text style={styles.addressTextStyle}>{nameFormater(item?.name, 'default')}</Text>
            {isCircleAddedToCart && totalIndiviualSavingAmount > 0 && isGroupPlanCircle && (
              <View style={{ flexDirection: 'row', marginTop: 3 }}>
                <CircleLogo style={styles.savingCircleIcon} />
                <Text style={styles.savingTextStyle}>
                  Savings {string.common.Rs}
                  {totalIndiviualSavingAmount}
                </Text>
              </View>
            )}
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.priceTextStyle}>
              {string.common.Rs}
              {calTotal}
            </Text>
            <View style={styles.quantityViewStyle}>
              <Text style={[styles.addressTextStyle, styles.quantityTextStyle]}>
                {item?.mou} X {string.common.Rs}
                {priceToShow}
              </Text>
            </View>
          </View>
        </View>

        <Spearator />
      </View>
    );
  };

  const renderCartItems = () => {
    return (
      <View>
        {renderCartHeading()}
        {renderCartItemCard()}
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
      <View style={{ marginTop: 16 }}>
        {renderLabel(nameFormater('PREVIOUSLY ADDED TO CART', 'title'))}
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
              {!!previousCollectionCharges &&
                renderPrices(
                  string.diagnosticsCartPage.homeCollectionText,
                  previousCollectionCharges
                )}
              {renderPrices('Total', previousTotalCharges, true)}
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const renderPrices = (
    title: string,
    price: string | number,
    customStyle?: boolean,
    savingView?: boolean
  ) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ width: '65%' }}>
          <Text
            style={[
              styles.commonText,
              customStyle ? styles.pricesBoldText : styles.pricesNormalText,
              savingView && { color: theme.colors.APP_GREEN },
            ]}
          >
            {title} {!!savingView && '(-)'}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text
            style={[
              customStyle ? styles.pricesBoldText : styles.pricesNormalText,
              savingView && { color: theme.colors.APP_GREEN },
            ]}
          >
            {savingView && '- '}
            {string.common.Rs}
            {convertNumberToDecimal(price)}
          </Text>
        </View>
      </View>
    );
  };

  function _setChoosenPlan(plan: any) {
    setIsCircleAddedToCart?.(true);
    setSelectedCirclePlan?.(plan);
    setIsCircleSubscription?.(true);
    setCircleMembershipCharges && setCircleMembershipCharges(plan?.currentSellingPrice);
    setCircleSubPlanId && setCircleSubPlanId(plan?.subPlanId);
  }

  function _navigateToBenefitsPage() {
    setShowCirclePopup(false);
    openCircleWebView();
  }

  const openCircleWebView = () => {
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRLCE_PHARMA_URL,
      source: 'Diagnostic Cart',
      circleEventSource:'Cart(Diagnostic)'
    });
  };

  const renderCirclePlansPopup = () => {
    const facts = AppConfig.Configuration.CIRCLE_FACTS;
    return (
      <CirclePlansListOverlay
        title={'Circle Membership'}
        upperLeftText={isCircleAddedToCart ? 'You' : 'You can'}
        upperMiddleText={isCircleAddedToCart ? 'saved' : 'save'}
        circleSaving={circleSaving}
        upperRightText={isCircleAddedToCart ? 'on this order with Circle!' : 'on this order.'}
        effectivePriceText={
          isCircleAddedToCart ? 'Your effective price is' : 'Effective price would be'
        }
        effectivePrice={isCircleAddedToCart ? grandTotal : circleGrandTotal} //need to change on each plan selection
        membershipPlans={allMembershipPlans}
        facts={facts}
        onPressClose={() => setShowCirclePopup(false)}
        choosenPlan={(item) => _setChoosenPlan(item)}
        onPressViewAll={() => _navigateToBenefitsPage()}
        planToHighLight={selectedCirclePlan}
      />
    );
  };

  /** check for renew flow => need to check the renew_price & status of circle in ConsultRoom -> isexpired
   * setIsCircleExpired -> shoppingCartProvider
   * circle wali api se jo data aa raha hai, usme circle ka status "disabled" karke static data daal do membership me
   *
   */
  const renderCirclePurchase = () => {
    const defaultPlanPurchasePrice = !!selectedCirclePlan
      ? selectedCirclePlan?.currentSellingPrice
      : !!defaultCirclePlan && defaultCirclePlan?.currentSellingPrice;
    const defaultPlanDurationInMonths = !!selectedCirclePlan
      ? selectedCirclePlan?.durationInMonth
      : !!defaultCirclePlan && defaultCirclePlan?.durationInMonth;
    return (
      <View style={styles.circleCardView}>
        <CircleCard
          heading1={isCircleAddedToCart ? 'Yay! You are a Circle Member' : 'Buy Circle Membership'}
          upperLeftText={isCircleAddedToCart ? 'You' : 'You can'}
          upperMiddleText={isCircleAddedToCart ? 'saved' : 'save'}
          upperRightText={'on this order with Circle!'}
          circleSaving={circleSaving}
          defaultPlanPrice={defaultPlanPurchasePrice}
          defaultPlanMonths={defaultPlanDurationInMonths}
          rightText={'VIEW PLANS'}
          effectivePriceText={
            isCircleAddedToCart ? 'Your effective price is' : 'Effective price would be'
          }
          toPayPrice={isCircleAddedToCart ? toPayPrice : nonCircle_CircleEffectivePrice}
          isPlanPreselected={isCircleAddedToCart}
          onPressViewPlan={() => _navigateToViewCirclePlans()}
          onTogglePlans={() => _onTogglePlans()}
        />
      </View>
    );
  };

  function _onTogglePlans() {
    setIsCircleAddedToCart?.(!isCircleAddedToCart);
    setIsCirclePlanRemoved?.(!isCirclePlanRemoved);
    const circleData = circlePlanSelected;
    const cleverTapEventAttributes = {
      navigation_source: 'Cart(Diagnostic)',
      circle_end_date: getCircleNoSubscriptionText(),
      circle_start_date: getCircleNoSubscriptionText(),
      circle_planid: circleData?.subPlanId,
      customer_id: currentPatient?.id,
      duration_in_month: circleData?.durationInMonth,
      user_type: getUserType(allCurrentPatients),
      price: circleData?.currentSellingPrice,
    };
    if (!isCircleAddedToCart) {
      postCleverTapEvent(CleverTapEventName.CIRCLE_PLAN_TO_CART, cleverTapEventAttributes);
    }
    if (!isCirclePlanRemoved) {
      postCleverTapEvent(CleverTapEventName.CIRCLE_PLAN_REMOVE_FROM_CART, cleverTapEventAttributes);
    }
  };

  function _navigateToViewCirclePlans() {
    setShowCirclePopup(true);
  }

  function _addCircleValues() {
    // setIsDiagnosticCircleSubscription?.(true);
    setIsCircleAddedToCart?.(true);
    setCirclePlanSelected?.(selectedCirclePlan); //overall
    setSelectedCirclePlan?.(selectedCirclePlan); //diag
    setIsCircleSubscription?.(true);
  }

  //change circle purchase price to selected plan
  const renderTotalCharges = () => {
    const anyCartSaving = isDiagnosticCircleSubscription ? cartSaving + circleSaving : cartSaving;
    const hcChargesToShow = getHcCharges()?.toFixed(2);
    const showEffectiveView = isModifyFlow
      ? !isDiagnosticCircleSubscription &&
        !hideCirclePurchaseInModify &&
        isCircleAddedToCart &&
        circleSaving > 0
      : isCircleAddedToCart && circleSaving > 0;

    return (
      <>
        {/* {renderCouponView()} */}
        <View
          style={[
            styles.totalChargesContainer,
            {
              marginTop: 0,
            },
          ]}
        >
          {/**handing already purchased member */}
          {isDiagnosticCircleSubscription ||
          (!isDiagnosticCircleSubscription && hideCirclePurchaseInModify)
            ? null
            : renderCirclePurchase()}
          {renderPrices('Total MRP', totalPriceExcludingAnyDiscounts.toFixed(2))}

          {couponDiscount > 0 && renderPrices('Coupon Discount', couponDiscount?.toFixed(2))}
          {isModifyFlow && Number(hcChargesToShow) == 0 ? null : (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={[styles.pricesNormalText, { width: '60%' }]}>
                {string.diagnosticsCartPage.homeCollectionText}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={[
                    styles.blueTextStyle,
                    {
                      //commented for future refrence
                      // textDecorationLine:
                      //   isModifyFlow &&
                      //   modifiedOrder?.collectionCharges > 0 &&
                      //   hcCharges === 0 &&
                      //   cartItems?.length > 0
                      //     ? 'line-through'
                      //     : 'none',
                    },
                  ]}
                >
                  {string.common.Rs}
                  {isModifyFlow ? Number(0)?.toFixed(2) : Number(hcChargesToShow)?.toFixed(2)}{' '}
                  {/** added check since we don't want any striked through price */}
                </Text>
              </View>
            </View>
          )}
          {distanceCharges > 0 &&
            renderPrices(
              string.diagnosticsCartPage.paidSlotText,
              distanceCharges?.toFixed(2),
              false,
              false
            )}
          {isCircleAddedToCart &&
            !!circlePlanPurchasePrice &&
            renderPrices('Circle Membership', circlePlanPurchasePrice?.toFixed(2), false, false)}
          {normalSaving > 0 && renderPrices('Cart Savings', normalSaving?.toFixed(2), false, true)}
          {(isDiagnosticCircleSubscription || isCircleAddedToCart) && circleSaving > 0 && (
            <View style={[styles.rowSpaceBetweenStyle]}>
              <View style={{ flexDirection: 'row', flex: 0.8 }}>
                <CircleLogo style={styles.circleLogoIcon} />
                <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                  Membership discount (-)
                </Text>
              </View>
              <Text style={[styles.blueTextStyle, { color: theme.colors.APP_GREEN }]}>
                - {string.common.Rs} {circleSaving.toFixed(2)}
              </Text>
            </View>
          )}
          {discountSaving > 0 &&
            renderPrices(
              string.diagnostics.specialDiscountText,
              discountSaving?.toFixed(2),
              false,
              true
            )}
          <Spearator style={{ marginBottom: 6, marginTop: 6 }} />
          {renderPrices('To Pay', toPayPrice?.toFixed(2), true)}
          {isCircleAddedToCart && renderCODDisableText()}
        </View>
        {anyCartSaving > 0 && renderCartSavingBanner()}
        {showEffectiveView && renderAddtionalCircleSavingBanner(toPayPrice)}
      </>
    );
  };

  const renderCODDisableText = () => {
    return (
      <View>
        <Text style={styles.codDisableText}>{string.diagnostics.codDisableTextForCircle}</Text>
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

  const renderCartSavingBanner = () => {
    return dashedBanner(
      'You ',
      `saved ${string.common.Rs}${convertNumberToDecimal(
        isDiagnosticCircleSubscription || isCircleAddedToCart
          ? cartSaving + circleSaving
          : cartSaving
      )}`,
      'on this order',
      'left',
      'saving'
    );
  };

  const renderAddtionalCircleSavingBanner = (effectivePrice: number) => {
    return (
      <View style={[styles.dashedBannerViewStyle, styles.circleSavingOuterView]}>
        <SavingsIcon style={styles.savingIconStyle} />
        <View style={styles.circleSavingView}>
          <Text style={styles.circleSavingNormalText}>
            You
            <Text style={styles.circleSavingGreenText}>
              {' '}
              saved {string.common.Rs}
              {circleSaving}
            </Text>{' '}
            <Text style={styles.circleSavingBoldText}>on this order </Text>
            with Circle! Your effective price is{' '}
            <Text style={styles.circleSavingBoldText}>
              {string.common.Rs}
              {effectivePrice}
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  const renderCircleMemberBanner = () => {
    return dashedBanner('benefits APPLIED!', '', '', 'left', 'circle');
  };

  const dashedBanner = (
    leftText: string,
    greenText: string,
    rightText: string,
    imagePosition: string,
    imageType: string
  ) => {
    return (
      <View
        style={[
          styles.dashedBannerViewStyle,
          {
            justifyContent: imagePosition == 'left' ? 'flex-start' : 'center',
            borderStyle: imageType == 'saving' ? 'solid' : 'dashed',
            borderWidth: imageType == 'saving' ? 1 : 2,
            marginTop: imageType == 'circle' ? 16 : 10,
          },
          imageType === 'saving' && { backgroundColor: '#F3FFFF' },
        ]}
      >
        {imagePosition == 'left' && (
          <>
            {imageType === 'circle' ? (
              <View style={{ flexDirection: 'row' }}>
                <CheckedIcon style={styles.checkedIconStyle} />
                <CircleLogo style={styles.circleLogoStyle} />
              </View>
            ) : (
              <SavingsIcon style={styles.savingIconStyle} />
            )}
          </>
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

  const renderMainView = () => {
    return (
      <View style={{ flex: 1, marginBottom: 250 }}>
        {renderAddressHeading()}
        {renderCartItems()}
        {isModifyFlow ? renderPreviouslyAddedItems() : null}
        {(isDiagnosticCircleSubscription || isCircleAddedToCart) && circleSaving > 0
          ? renderCircleMemberBanner()
          : null}

        {renderLabel(
          nameFormater(
            isModifyFlow ? 'Additional amount that needs to be paid' : 'Total charges',
            'title'
          )
        )}
        {renderTotalCharges()}
      </View>
    );
  };

  const renderPremiumOverlay = () => {
    return (
      <TestPremiumSlotOverlay
        heading="Confirm Your Appointment"
        source={AppRoutes.AddressSlotSelection}
        isVisible={isVisible}
        onGoBack={() => props.navigation.goBack()}
        onClose={() => setIsVisible(false)}
        slotDetails={diagnosticSlot}
      />
    );
  };

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
      toPayPrice,
      isHCUpdated,
      paymentMode
    );
  }

  function postwebEngageProceedToPayEvent() {
    //check in case of modify
    const getFinalItems = isDiagnosticSelectedCartEmpty(patientCartItems);
    const noOfPatient = getFinalItems?.length;
    const slotDate = isModifyFlow
      ? moment(modifiedOrder?.slotDateTimeInUTC).format('DD-MM-YYYY')
      : moment(diagnosticSlot?.selectedDate)?.format('DD-MM-YYYY');
    const slotTime = isModifyFlow
      ? moment(modifiedOrder?.slotDateTimeInUTC).format('hh:mm')
      : selectedTimeSlot?.slotInfo?.startTime!;
    const numberOfSlots = selectedTimeSlot?.slotInfo?.internalSlots?.length; //this won't be there
    const slotType = selectedTimeSlot?.slotInfo?.isPaidSlot
      ? DIAGNOSTIC_SLOT_TYPE.PAID
      : DIAGNOSTIC_SLOT_TYPE.FREE;
    const itemsInCart = isModifyFlow
      ? cartItems?.length
      : getFinalItems?.map((item) => item?.cartItems)?.flat()?.length;

    DiagnosticProceedToPay(
      noOfPatient,
      numberOfSlots,
      slotType,
      itemsInCart,
      cartTotal,
      toPayPrice,
      pinCode,
      addressText,
      hcCharges,
      slotTime,
      slotDate,
      isDiagnosticCircleSubscription ? 'Yes' : 'No',
      currentPatient
    );
  }

  const proceedForBooking = () => {
    const prescriptions = physicalPrescriptions;
    if (prescriptions.length == 0 && ePrescriptions.length == 0) {
      bookDiagnosticOrder();
    } else {
      bookDiagnosticOrder();
    }
  };

  const bookDiagnosticOrder = async () => {
    saveHomeCollectionOrder();
  };

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

  const saveHomeCollectionOrder = () => {
    if (toPayPrice == null || toPayPrice == undefined) {
      //do not call the api, if by any chance grandTotal is not a number
      renderAlert(string.common.tryAgainLater);
      setLoading?.(false);
    } else {
      const { slotStartTime, slotEndTime, date } = diagnosticSlot || {};
      const slotTimings = (slotStartTime && slotEndTime
        ? `${slotStartTime}-${slotEndTime}`
        : ''
      ).replace(' ', '');

      const allItems = cartItems?.find(
        (item) =>
          item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL ||
          item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
      );

      getPatientLineItems = createPatientObjLineItems(
        patientCartItems,
        isDiagnosticCircleSubscription ? true : isCircleAddedToCart,
        reportGenDetails
      ) as (patientObjWithLineItems | null)[];

      const bookingOrderInfo: SaveBookHomeCollectionOrderInputv2 = {
        patientAddressID: slotsInput?.addressObject?.patientAddressID,
        patientObjWithLineItems: getPatientLineItems?.map((item: any) => item),
        selectedDate: moment(diagnosticSlot?.selectedDate)?.format('YYYY-MM-DD'),
        slotInfo: {
          slotDetails: {
            slotDisplayTime: diagnosticSlot?.slotStartTime,
            internalSlots: diagnosticSlot?.internalSlots!, //change type
          },
          paidSlot: diagnosticSlot?.isPaidSlot!,
        },
        serviceability: slotsInput?.serviceabilityObj,
        collectionCharges: {
          charges: hcCharges,
          distanceCharges:
            !!diagnosticSlot?.isPaidSlot && diagnosticSlot?.isPaidSlot ? distanceCharges : 0,
        },
        bookingSource: DiagnosticsBookingSource.MOBILE,
        deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
        subscriptionInclusionId: null,
        userSubscriptionId: circleSubscriptionId != '' ? circleSubscriptionId : localCircleSubId,
      };
      diagnosticSaveBookHcCollectionV2(client, bookingOrderInfo)
        .then(async ({ data }) => {
          const getSaveHomeCollectionResponse =
            data?.saveDiagnosticBookHCOrderv2?.patientsObjWithOrderIDs;
          const checkIsFalse = getSaveHomeCollectionResponse?.find(
            (item) => item?.status === false
          );
          // in case duplicate test, price mismatch, address mismatch, slot issue
          if (!!checkIsFalse) {
            apiHandleErrorFunction(
              bookingOrderInfo,
              getSaveHomeCollectionResponse,
              BOOKING_TYPE.SAVE
            );
          } else {
            //handle for multiple uhid
            callCreateInternalOrder(
              getSaveHomeCollectionResponse!,
              getSaveHomeCollectionResponse,
              slotTimings,
              allItems,
              slotStartTime!,
              BOOKING_TYPE.SAVE
            );
          }
        })
        .catch((error) => {
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

  function createItemPrice(itemsInCart: DiagnosticsCartItem[]) {
    //check in case of modify
    modifyPricesForItemArray =
      isModifyFlow &&
      modifiedOrder?.diagnosticOrderLineItems?.map(
        (item: orderListLineItems) =>
          ({
            itemId: Number(item?.itemId),
            price: item?.price,
            quantity: 1,
            groupPlan: item?.groupPlan,
            preTestingRequirement: item?.itemObj?.testPreparationData,
            reportGenerationTime: item?.itemObj?.reportGenerationTime,
          } as DiagnosticLineItem)
      );

    pricesForItemArray = itemsInCart?.map(
      (item, index) =>
        ({
          itemId: Number(item?.id),
          price:
            (isDiagnosticCircleSubscription || isCircleAddedToCart) &&
            item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
              ? Number(item?.circleSpecialPrice)
              : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
              ? Number(item?.discountSpecialPrice)
              : Number(item?.specialPrice) || Number(item?.price),
          quantity: 1,
          groupPlan:
            isDiagnosticCircleSubscription || isCircleAddedToCart
              ? item?.groupPlan!
              : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
              ? item?.groupPlan
              : DIAGNOSTIC_GROUP_PLAN.ALL,
          preTestingRequirement:
            !!reportGenDetails && reportGenDetails?.[index]?.itemPrepration
              ? reportGenDetails?.[index]?.itemPrepration
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

  function removeDuplicateCartItems(data: any, pricesOfEach: any, patientId: string) {
    checkDuplicatesItems(data);
    hideAphAlert?.();
    setLoading?.(false);
    setShowInclusions(true);
    renderDuplicateMessage([...new Set(setLowItemName)], [...new Set(setHighPriceName)]);
  }

  const getItemName = (itemIds: any): string => {
    const itemNames: string[] = [];
    !!itemIds &&
      itemIds?.length &&
      itemIds?.map((id: number) => {
        const isFromApi = !!cartItemsMapping && cartItemsMapping?.length > 0;
        const arrayToSelect = isFromApi ? cartItemsMapping : cartItems;
        const findItem = arrayToSelect?.find(
          (cItems: any) => Number(isFromApi ? cItems?.itemId : cItems?.id) === Number(id)
        );
        if (!!findItem) {
          itemNames?.push(isFromApi ? findItem?.itemName : findItem?.name);
        }
        //in case of modify. => only for single uhid
        else if (isModifyFlow) {
          const getModifiedOrderLineItems = modifiedOrder?.diagnosticOrderLineItems;
          itemIds?.map((id: number) => {
            const findItem =
              !!getModifiedOrderLineItems &&
              getModifiedOrderLineItems?.find(
                (cItems: any) => Number(cItems?.itemId) === Number(id)
              );
            if (!!findItem) {
              itemNames?.push(findItem?.itemName);
            }
          });
        }
      });
    return itemNames?.join(', ');
  };

  const checkDuplicatesItems = (data: any) => {
    if (data) {
      let itemToRemove: number[] = [];
      let removedTestsNames: string[] = [];
      let itemToKeepNames: string[] = [];
      let itemToKeep: number[] = [];

      let conflictWithPatients: conflictWithPatientsObjInterface[] = [];
      if (isModifyFlow) {
        const cartConflictedItems = data?.[0]?.attributes?.conflictedItems;
        const modifiedPatientId = modifiedPatientCart?.[0]?.patientId;

        const itemIdsToRemove: any = cartConflictedItems?.map(
          (conflictedItems: any) => conflictedItems?.itemsWithConflicts
        );
        const itemIdsToKeep: any = cartConflictedItems?.map(
          (conflictedItems: any) => conflictedItems?.itemToKeep
        );
        const allIdsToRemove = itemIdsToRemove?.flat(1);
        const allIdsToKeep = itemIdsToKeep?.flat(1);

        const updatedCartItems = cartItems?.filter((item: DiagnosticsCartItem) => {
          return !allIdsToRemove?.some((itemId: number) => Number(itemId) === Number(item?.id));
        });

        itemToRemove = [...new Set([...itemToRemove, allIdsToRemove?.flat(Infinity)])];
        itemToKeep = [...new Set([...itemToKeep, ...allIdsToKeep?.flat(Infinity)])];

        cartConflictedItems?.forEach((cItem: PatientObjWithModifyOrderIDs) => {
          conflictWithPatients?.push({
            itemsToRemovalName: getItemName(cItem?.itemsWithConflicts),
            toKeepItemIds: cItem?.itemToKeep?.join('')!,
            patientId: modifiedPatientId,
          });
        });

        removedTestsNames.push(getItemName(itemIdsToRemove));
        itemToKeepNames.push(getItemName(itemIdsToKeep));
        itemNamesToRemove_global = removedTestsNames;
        itemNamesToKeep_global = itemToKeepNames;
        itemIdsToKeep_global = allIdsToKeep;
        itemIdsToRemove_global = allIdsToRemove;

        setCartItems?.(updatedCartItems);
        const newModifiedPatientCartItems = {
          patientId: modifiedPatientId,
          cartItems: updatedCartItems,
        };
        setModifiedPatientCart?.([newModifiedPatientCartItems]);
        setLowItemName.push(getItemName([...new Set(itemIdsToRemove_global)]));
        setHighPriceName.push(getItemName([...new Set(itemIdsToKeep_global)]));
      } else {
        data?.forEach((patientObj: PatientsObjWithOrderIDs) => {
          if (!patientObj?.status) {
            const itemIdsToRemove: any = patientObj?.attributes?.conflictedItems?.map(
              (conflictedItems: any) => conflictedItems?.itemsWithConflicts
            );
            const itemIdsToKeep: any = patientObj?.attributes?.conflictedItems?.map(
              (conflictedItems: any) => conflictedItems?.itemToKeep
            );

            const conflictedItemsArray = patientObj?.attributes?.conflictedItems;
            conflictedItemsArray?.map((cItems) => {
              conflictWithPatients?.push({
                itemsToRemovalName: getItemName(cItems?.itemsWithConflicts!),
                toKeepItemIds: !!cItems?.itemToKeep ? cItems?.itemToKeep?.join('') : '',
                patientId: patientObj?.patientID,
              });
            });

            itemToRemove = [...new Set([...itemToRemove, ...itemIdsToRemove?.flat(1)])];
            itemToKeep = [...new Set([...itemToKeep, ...itemIdsToKeep?.flat(1)])];

            removedTestsNames.push(getItemName(itemIdsToRemove));
            itemToKeepNames.push(getItemName(itemIdsToKeep));
            itemNamesToRemove_global = removedTestsNames;
            itemNamesToKeep_global = itemToKeepNames;
            itemIdsToKeep_global = itemToKeep;
            itemIdsToRemove_global = itemToRemove;

            if (patientCartItems?.length) {
              removeDuplicatePatientCartItems?.(patientObj?.patientID, itemIdsToRemove?.flat(1));
            }
          }
        });

        setLowItemName.push(getItemName([...new Set(itemIdsToRemove_global)]));
        setHighPriceName.push(getItemName([...new Set(itemIdsToKeep_global)]));
      }
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      DiagnosticRemoveFromCartClicked(
        itemIdsToRemove_global?.join(', '),
        itemNamesToRemove_global?.join(', '),
        addresses?.[selectedAddressIndex]?.zipcode!,
        'Automated'
      );
      setDuplicateNameArray(conflictWithPatients);
      setDuplicateItemsArray?.(conflictWithPatients);
    }
  };

  function apiHandleErrorFunction(input: any, data: any, source: string) {
    let errorMsgToRead =
      source === BOOKING_TYPE.SAVE ? data?.[0]?.errorMessageToDisplay : data?.errorMessageToDisplay;
    let message = errorMsgToRead || string.diagnostics.bookingOrderFailedMessage;
    const overallStatus =
      source === BOOKING_TYPE.SAVE
        ? data?.filter((patientsObj: any) => patientsObj?.status === false)
        : source === BOOKING_TYPE.MODIFY
        ? [data]
        : data; //since not coming in form of array

    let patientId =
      source === BOOKING_TYPE.SAVE ? data?.[0]?.patientID : modifiedPatientCart?.[0]?.patientId;
    let itemIds = overallStatus?.[0]?.attributes?.conflictedItems;
    if (overallStatus?.length > 0 && itemIds?.length! > 0) {
      showAphAlert?.({
        unDismissable: true,
        title: string.common.uhOh,
        description: message,
        onPressOk: () => {
          removeDuplicateCartItems(
            source === BOOKING_TYPE.MODIFY ? [data] : data,
            input?.items,
            patientId
          );
        },
      });
    } else {
      const hasRefreshAttribute =
        source === BOOKING_TYPE.SAVE
          ? !!data?.[0]?.attributes?.refreshCart && data?.[0]?.attributes?.refreshCart
          : data?.errorMessageToDisplay;

      if (
        slotBookedArray.some((item) => message?.includes(item)) ||
        message.includes('slot has been booked')
      ) {
        showAphAlert?.({
          title: string.common.uhOh,
          description: message,
          onPressOutside: () => {
            props.navigation.goBack(); //to fetch new slots
            hideAphAlert?.();
          },
          onPressOk: () => {
            props.navigation.goBack(); // to fetch new slots
            hideAphAlert?.();
          },
        });
      }
      //for the errors related to invalid_order_line_items/ invalid_order_rate / invalid_groupPlan
      else if (hasRefreshAttribute) {
        setLoading?.(false);
        showAphAlert?.({
          title: string.common.uhOh,
          description: message,
          unDismissable: true,
          onPressOk: () => {
            hideAphAlert?.();
            props.navigation.navigate(AppRoutes.CartPage, {});
          },
        });
      } else {
        renderAlert(message);
      }
    }
  }

  const renderDuplicateMessage = (duplicateTests: string[], higherPricesName: string[]) => {
    const dupTestText = [...new Set(duplicateTests)]?.join(', ');
    const highTestText = [...new Set(higherPricesName)]?.join(', ');
    showAphAlert?.({
      title: 'Your cart has been revised!',
      description: isModifyFlow
        ? `"${dupTestText}" and "${highTestText}" have common parameters, and cannot be booked together. Your cart would be updated.`
        : `The "${dupTestText}" has been removed from your cart as it is already included in another test "${highTestText}" in your cart. Kindly proceed to pay the revised amount`,
      onPressOk: () => {
        //disable the cta
        hideAphAlert?.();
        setDuplicateNameArray?.(duplicateNameArray);
        props.navigation.navigate(AppRoutes.CartPage, {
          duplicateNameArray: duplicateNameArray,
          showInclusion: showInclusions,
        });
      },
    });
  };

  function onChangeCartItems(
    updatedCartItems: any,
    removedTest: string,
    removedTestItemId: any,
    patientId: string,
    itemsInCart: DiagnosticsCartItem[]
  ) {
    const arrayToSelect = isModifyFlow ? modifiedPatientCart : patientCartItemsCopy;
    const findIndex = arrayToSelect?.findIndex(
      (item: DiagnosticPatientCartItem) => item?.patientId == patientId
    );
    arrayToSelect[findIndex].cartItems = updatedCartItems;

    setDiagnosticSlot?.(null);
    setPatientCartItems?.(patientCartItemsCopy);
    setCartItems?.(updatedCartItems);
    isModifyFlow &&
      setModifiedPatientCart?.([
        {
          patientId: arrayToSelect[findIndex].patientId,
          cartItems: updatedCartItems,
        },
      ]);
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      props.navigation.navigate(AppRoutes.CartPage);
      let removedItems = removedTestItemId?.join(', ');
      DiagnosticRemoveFromCartClicked(
        removedItems,
        removedTest,
        addresses?.[selectedAddressIndex]?.zipcode!,
        'Automated'
      );
    }
  }

  //this is changed for saveBooking, for modify (need to add)
  async function callCreateInternalOrder(
    getOrderDetails: any, //getOrderId (in case of modify)
    getDisplayId: any,
    slotTimings: string,
    items: any,
    slotStartTime: string,
    source: string
  ) {
    try {
      setLoading?.(true);
      const getPatientId =
        source === BOOKING_TYPE.MODIFY && isModifyFlow
          ? modifiedOrder?.patientId
          : currentPatient?.id;
      var array = [] as any; //define type
      if (source === BOOKING_TYPE.MODIFY) {
        //will for single order
        array = [{ order_id: getOrderDetails, amount: grandTotal, patient_id: getPatientId }];
      } else {
        getOrderDetails?.map(
          (
            item: saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs
          ) => {
            array.push({
              order_id: item?.orderID,
              amount: item?.amount,
              patient_id: item?.patientID,
            });
          }
        );
      }

      const circlePlanPurchasePrice = !!selectedCirclePlan
        ? selectedCirclePlan?.currentSellingPrice
        : !!defaultCirclePlan && defaultCirclePlan?.currentSellingPrice;

      let orders: OrderVerticals;
      //trying to purchase circle
      if (!isDiagnosticCircleSubscription && isCircleAddedToCart) {
        orders = {
          diagnostics: array,
          subscription: [
            {
              order_id: localCircleSubId,
              amount: circlePlanPurchasePrice,
              patient_id: currentPatient?.id,
            },
          ],
        };
      } else {
        orders = {
          diagnostics: array,
        };
      }

      const orderInput: OrderCreate = {
        orders: orders,
        total_amount: toPayPrice,
        customer_id: currentPatient?.primaryPatientId || getPatientId,
      };
      const response = await createOrderInternal(orderInput);
      if (response?.data?.createOrderInternal?.success) {
        //check for webenage
        const orderInfo = {
          orderId: source === BOOKING_TYPE.MODIFY ? getOrderDetails : getOrderDetails?.[0]?.orderID,
          displayId:
            source === BOOKING_TYPE.MODIFY ? getDisplayId : getOrderDetails?.[0]?.displayID,
          diagnosticDate: date!,
          slotTime: slotTimings!,
          cartSaving: cartSaving,
          circleSaving: circleSaving,
          cartHasAll: items != undefined ? true : false,
          amount: toPayPrice, //actual amount to be payed by customer (topay)
        };
        const createMultiOrderIds =
          !isModifyFlow &&
          getOrderDetails?.map(
            (id: saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs) =>
              id?.orderID
          );
        const eventAttributes = createCheckOutEventAttributes(
          isModifyFlow ? getOrderDetails : createMultiOrderIds,
          slotStartTime
        );
        setauthToken?.('');
        const payId = response?.data?.createOrderInternal?.payment_order_id;
        if (
          source === BOOKING_TYPE.MODIFY &&
          modifiedOrder?.paymentType !== DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT
        ) {
          //call the process wali api & success page (check for modify Order)
          processModifiyCODOrder(getOrderDetails, grandTotal, eventAttributes, orderInfo, payId!);
        } else {
          setLoading?.(false);
          props.navigation.navigate(AppRoutes.PaymentMethods, {
            paymentId: payId!,
            amount: toPayPrice,
            orderId: getOrderDetails?.[0]?.orderID, //passed only one
            orderDetails: orderInfo,
            orderResponse: array,
            eventAttributes,
            businessLine: 'diagnostics',
            customerId: cusId,
            isCircleAddedToCart: isCircleAddedToCart,
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
      'Order id': orderId,
      Pincode: parseInt(selectedAddr?.zipcode!),
      'Patient UHID': g(currentPatient, 'id'),
      'Total items in order': cartItems?.length,
      'Order amount': toPayPrice,
      'Appointment Date': isModifyFlow
        ? moment(modifiedOrder?.slotDateTimeInUTC).format('DD/MM/YYYY')
        : moment(orderDetails?.diagnosticDate!).format('DD/MM/YYYY'),
      'Appointment time': isModifyFlow
        ? moment(modifiedOrder?.slotDateTimeInUTC).format('hh:mm')
        : slotStartTime!,
      'Item ids': cartItemsWithId,
      'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
    };
    return attributes;
  }

  async function processModifiyCODOrder(
    orderId: string,
    amount: number,
    eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED],
    orderInfo: any,
    paymentId: string | number
  ) {
    PaymentInitiated(amount, 'Diagnostic', 'Cash');
    try {
      const array = [
        {
          orderID: orderId,
          amount: amount,
        },
      ];
      const response = await processDiagnosticsCODOrderV2(client, array);
      const { data } = response;
      const getResponse = data?.wrapperProcessDiagnosticHCOrderCOD?.result;
      if (!!getResponse && getResponse?.length > 0) {
        const isAnyFalse = getResponse?.filter((items) => !items?.status);
        if (!!isAnyFalse && isAnyFalse?.length > 0) {
          renderAlert(string.common.tryAgainLater);
        } else {
          _navigatetoOrderStatus(true, 'success', eventAttributes, orderInfo, paymentId);
        }
      } else {
        renderAlert(string.common.tryAgainLater);
      }
    } catch (e) {
      setLoading?.(false);
      renderAlert(string.common.tryAgainLater);
    }
  }

  function _navigatetoOrderStatus(
    isCOD: boolean,
    paymentStatus: string,
    eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED],
    orderInfo: any,
    paymentId: string | number
  ) {
    setLoading?.(false);
    props.navigation.navigate(AppRoutes.OrderStatus, {
      isModify: isModifyFlow ? modifiedOrder : null,
      orderDetails: orderInfo,
      isCOD: isCOD,
      eventAttributes,
      paymentStatus: paymentStatus,
      paymentId: paymentId,
    });
  }

  const saveModifyOrder = (orderInfo: saveModifyDiagnosticOrderInput) =>
    client.mutate<saveModifyDiagnosticOrder, saveModifyDiagnosticOrderVariables>({
      mutation: MODIFY_DIAGNOSTIC_ORDERS,
      context: {
        sourceHeaders,
      },
      variables: { saveModifyDiagnosticOrder: orderInfo },
    });

  function saveModifiedOrder() {
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
      collectionCharges: !!modifiedOrder?.collectionCharges ? modifiedOrder?.collectionCharges : 0, //no need to pass newCharges as of now
      bookingSource: DiagnosticsBookingSource.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
      items: createItemPrice(cartItems)?.itemPricingObject, //total (prev+ curr)
      userSubscriptionId: circleSubscriptionId != '' ? circleSubscriptionId : localCircleSubId,
      subscriptionInclusionId: null,
      amountToPay: grandTotal, //total amount to pay
    };
    saveModifyOrder?.(modifyBookingInput)
      .then((data) => {
        const getModifyResponse = data?.data?.saveModifyDiagnosticOrder;
        if (!getModifyResponse?.status) {
          apiHandleErrorFunction(modifyBookingInput, getModifyResponse, BOOKING_TYPE.MODIFY);
        } else {
          callCreateInternalOrder(
            getModifyResponse?.orderId!,
            getModifyResponse?.displayId!,
            slotTimings,
            allItems,
            slotStartTime!,
            BOOKING_TYPE.MODIFY
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

  const debouncedChangeHandler = debounce(onPressProceedToPay, 300);

  //handle the in the modify flow not to show circle if cod.
  // don't show cod with circle purchase on payments page

  function onPressProceedToPay() {
    setIsClicked(true);
    setLoading?.(true);

    if (isCircleAddedToCart && localCircleSubId == '') {
      callCreateCircleSubscription();
    } else {
      callDiagnosticBookingServices();
    }

    setTimeout(() => {
      setIsClicked(false);
    }, 500);
  }

  function callDiagnosticBookingServices() {
    if (isModifyFlow) {
      postwebEngageProceedToPayEventForModify();
      saveModifiedOrder();
    } else {
      postwebEngageProceedToPayEvent();
      proceedForBooking();
    }
  }

  function createUserCircleSubscription() {
    const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
    const storeCode =
      Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;

    const purchaseInput = {
      userSubscription: {
        mobile_number: currentPatient?.mobileNumber,
        plan_id: planId,
        sub_plan_id: !!selectedCirclePlan
          ? selectedCirclePlan?.subPlanId
          : defaultCirclePlan?.subPlanId,
        storeCode,
        transaction_date_time: new Date().toISOString(),
      },
    };

    return client.mutate<CreateUserSubscription, CreateUserSubscriptionVariables>({
      mutation: CREATE_USER_SUBSCRIPTION,
      variables: purchaseInput,
      fetchPolicy: 'no-cache',
    });
  }

  async function callCreateCircleSubscription() {
    try {
      const response = await createUserCircleSubscription();
      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
      localCircleSubId = subscriptionId!;
      if (!!subscriptionId) {
        setCircleSubscriptionId?.(subscriptionId);
        callDiagnosticBookingServices();
      } else {
        setLoading?.(false);
        showUnableToPurchaseCircleMsg();
      }
    } catch (error) {
      //if error then remove the circle price and let user know, something happened
      //ok got it, remove the circle
      setLoading?.(false);
      showUnableToPurchaseCircleMsg();
      CommonBugFender('callCreateCircleSubscription_ReviewPage', error);
    }
  }

  function showUnableToPurchaseCircleMsg() {
    showAphAlert?.({
      title: string.common.uhOh,
      description: 'There was an error while confirming your order. Please try again!',
    });
  }

  const disableProceedToPay = !(isModifyFlow
    ? modifiedPatientCart?.length > 0 && isHcApiCalled
    : patientCartItems?.length > 0 &&
      isHcApiCalled &&
      !!(selectedAddr && diagnosticSlot && diagnosticSlot?.slotStartTime) &&
      (uploadPrescriptionRequired
        ? physicalPrescriptions.length > 0 || ePrescriptions.length > 0
        : true));

  const renderTestProceedBar = () => {
    const showTime = isModifyFlow
      ? modifiedOrder && modifiedOrder?.slotDateTimeInUTC
      : selectedAddr;
    const cartItemToCheck = isModifyFlow ? modifiedPatientCart : patientCartItems;

    return cartItemToCheck?.length > 0 ? (
      <TestProceedBar
        // selectedTimeSlot={selectedTimeSlot} //change the format
        selectedTimeSlot={diagnosticSlot}
        disableProceedToPay={disableProceedToPay || isClicked}
        onPressProceedtoPay={() => onPressProceedToPay()}
        showTime={showTime}
        phleboMin={isModifyFlow ? phleboMin : phleboETA}
        isModifyCOD={
          isModifyFlow
            ? modifiedOrder?.paymentType !== DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT
            : false
        }
        modifyOrderDetails={isModifyFlow ? modifiedOrder : null}
        showReportTat={reportTat}
        priceToShow={toPayPrice}
      />
    ) : null;
  };

  const renderWizard = () => {
    return (
      <TimelineWizard
        currentPage={SCREEN_NAMES.REVIEW}
        upcomingPages={[]}
        donePages={[SCREEN_NAMES.PATIENT, SCREEN_NAMES.CART, SCREEN_NAMES.SCHEDULE]}
        navigation={props.navigation}
        isModify={isModifyFlow}
      />
    );
  };

  const renderCallToOrder = () => {
    return (
      <CallToOrderView
      cityId = {Number(diagnosticServiceabilityData?.cityId)}
      pageId = {CALL_TO_ORDER_CTA_PAGE_ID.TESTCART}
      customMargin={220}
        slideCallToOrder = {slideCallToOrder}
        onPressSmallView = {() => {
          setSlideCallToOrder(false);
        }}
        onPressCross = {() => {
          setSlideCallToOrder(true);
        }}
      />
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderWizard()}
        <ScrollView bounces={false} style={{ flexGrow: 1 }} showsVerticalScrollIndicator={true}>
          {renderMainView()}
        </ScrollView>
        {renderTestProceedBar()}
      </SafeAreaView>
      {isVisible && renderPremiumOverlay()}
      {showCirclePopup && renderCirclePlansPopup()}
      {!hyperSdkInitialized && <Spinner />}
    </View>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  addressOuterView: {
    backgroundColor: theme.colors.WHITE,
    paddingVertical: 10,
    marginBottom: 8,
  },
  addressTextStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 18),
  },
  priceTextStyle: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 16),
  },
  addressTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
    marginRight: 16,
  },
  labelTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 20),
    marginBottom: 6,
    marginLeft: 16,
  },
  quantityTextStyle: {
    textAlign: 'center',
    fontSize: 12,
    alignSelf: 'center',
    color: theme.colors.SKY_BLUE,
  },
  quantityViewStyle: {
    backgroundColor: '#F3FFFF',
    width: 80,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 2,
    borderColor: '#F3FFFF',
  },
  totalChargesContainer: {
    backgroundColor: theme.colors.WHITE,
    marginBottom: 12,
    padding: 16,
    marginTop: 6,
  },
  previousItemContainer: {
    marginBottom: 20,
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
  previousItemHeading: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13 : 14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 22,
    width: '87%',
  },
  arrowTouch: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowSpaceBetweenStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commonTax: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
  commonText: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 11 : 12),
    color: theme.colors.SHERPA_BLUE,
    marginBottom: 5,
    lineHeight: 18,
  },
  inclusionsText: {
    ...theme.viewStyles.text('R', 11, theme.colors.SHERPA_BLUE, 1, 15),
  },
  itemHeading: {
    ...theme.viewStyles.text('M', 11, theme.colors.SHERPA_BLUE, 1, 15),
    letterSpacing: 0.28,
  },
  dashedBannerViewStyle: {
    ...cardViewStyle,
    marginHorizontal: 20,
    marginBottom: 0,
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    borderColor: theme.colors.APP_GREEN,
    borderRadius: 10,
  },
  blueTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(screenWidth < 380 ? 14 : 16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    alignSelf: 'center',
  },
  pricesNormalText: {
    ...theme.viewStyles.text('M', screenWidth < 380 ? 14 : 16, theme.colors.SHERPA_BLUE, 1, 24),
  },
  pricesBoldText: {
    ...theme.viewStyles.text('B', screenWidth < 380 ? 14 : 16, theme.colors.SHERPA_BLUE, 1, 24),
  },
  savingIconStyle: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
  },
  circleLogoStyle: {
    justifyContent: 'flex-end',
    height: 32,
    width: 60,
    resizeMode: 'contain',
    marginRight: -12,
  },
  checkedIconStyle: {
    justifyContent: 'flex-end',
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  itemView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
  },
  flexRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallCircleLogo: { height: 25, width: 35, resizeMode: 'contain' },
  circleMembershipText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 22),
    marginHorizontal: 8,
  },
  removeTouch: { alignSelf: 'flex-end', alignItems: 'center' },
  removeText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.APP_YELLOW, 1, 24),
    marginRight: 20,
    textAlign: 'center',
  },
  savingTextStyle: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10.5 : 11, theme.colors.APP_GREEN, 1, 18),
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'center',
    marginLeft: 3,
  },
  savingCircleIcon: { height: 20, width: isSmallDevice ? 23 : 25, resizeMode: 'contain' },
  circleSavingBoldText: { ...theme.viewStyles.text('SB', 12, theme.colors.SHERPA_BLUE, 1, 18) },
  circleSavingGreenText: { ...theme.viewStyles.text('R', 12, theme.colors.APP_GREEN, 1, 18) },
  circleSavingNormalText: { ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 18) },
  circleSavingView: { width: '89%', marginHorizontal: 6 },
  circleSavingOuterView: { borderStyle: 'solid', backgroundColor: '#F3FFFF', borderWidth: 1 },
  circleCardView: {
    margin: 6,
    marginBottom: 16,
  },
  codDisableText: { ...theme.viewStyles.text('M', 12, '#D23D3D', 1, 18) },
  circleLogoIcon: {
    resizeMode: 'contain',
    height: 25,
    width: 37,
    alignSelf: 'center',
    marginRight: 5,
  },
});
