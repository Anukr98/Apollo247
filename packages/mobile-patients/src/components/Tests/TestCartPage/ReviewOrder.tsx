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
  isDiagnosticSelectedCartEmpty,
  isEmptyObject,
  isSmallDevice,
  nameFormater,
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
  DEVICETYPE,
  DiagnosticLineItem,
  DiagnosticsBookingSource,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
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
  initiateSDK,
  isSDKInitialised,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { findDiagnosticSettings } from '@aph/mobile-patients/src/graphql/types/findDiagnosticSettings';
import {
  CREATE_INTERNAL_ORDER,
  FIND_DIAGNOSTIC_SETTINGS,
  MODIFY_DIAGNOSTIC_ORDERS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  diagnosticGetPhleboCharges,
  diagnosticSaveBookHcCollectionV2,
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
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  saveModifyDiagnosticOrder,
  saveModifyDiagnosticOrderVariables,
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
  } = useDiagnosticsCart();

  const { setAddresses: setMedAddresses, circleSubscriptionId } = useShoppingCart();

  const { setauthToken } = useAppCommonData();

  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();

  var modifyPricesForItemArray, pricesForItemArray, pricesForItemArrayForHC;

  const slotsInput = props.navigation.getParam('slotsInput');
  const selectedTimeSlot = props.navigation.getParam('selectedTimeSlot');
  const showPaidPopUp = props.navigation.getParam('showPaidPopUp');
  const selectedAddr = props.navigation.getParam('selectedAddress');
  const reportGenDetails = props.navigation.getParam('reportGenDetails');
  const cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
  var slotBookedArray = ['slot', 'already', 'booked', 'select a slot'];

  const { currentPatient } = useAllCurrentPatients();
  const [phleboMin, setPhleboMin] = useState(0);
  const [showAllPreviousItems, setShowAllPreviousItems] = useState<boolean>(false);
  const [isHcApiCalled, setHcApiCalled] = useState<boolean>(false);
  const [duplicateNameArray, setDuplicateNameArray] = useState(duplicateItemsArray as any);
  const [showInclusions, setShowInclusions] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<orderDetails>();
  const [isVisible, setIsVisible] = useState<boolean>(showPaidPopUp);

  const [date, setDate] = useState<Date>(new Date());
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

  function handleBack() {
    props.navigation.goBack();
    return true;
  }

  const initiateHyperSDK = async () => {
    try {
      const isInitiated: boolean = await isSDKInitialised();
      !isInitiated && initiateSDK(currentPatient?.id, currentPatient?.id);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
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

  function addPrices(prevPrice: number) {
    return prevPrice + prevPrice;
  }

  function clearCollectionCharges() {
    setHcApiCalled(true);
    setHcCharges?.(0);
    setDistanceCharges?.(0);
    setModifyHcCharges?.(0);
  }

  useEffect(() => {
    fetchFindDiagnosticSettings();
    //modify case
    if (isModifyFlow && cartItems?.length > 0 && modifiedPatientCart?.length > 0) {
      //if multi-uhid modify -> don't call phleboCharges api
      !!modifiedOrder?.attributesObj?.isMultiUhid && modifiedOrder?.attributesObj?.isMultiUhid
        ? clearCollectionCharges()
        : fetchHC_ChargesForTest();
    } else {
      fetchHC_ChargesForTest();
    }
  }, []);

  useEffect(() => {
    initiateHyperSDK();
  }, [currentPatient]);

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
          reportGenerationTime:
            !!reportGenDetails && reportGenDetails?.[index]?.itemReportTat
              ? reportGenDetails?.[index]?.itemReportTat
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

  function createPatientObjLineItems(modifiedLineItems?: any) {
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
      const getPatientObjWithLineItems = createPatientObjLineItems(
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
      const slotData = {
        slotDetails: {
          slotDisplayTime: diagnosticSlot?.slotStartTime,
        },
        paidSlot: diagnosticSlot?.isPaidSlot!,
      };
      apiInput = {
        patientAddressObj: slotsInput?.addressObject,
        patientsObjWithLineItems: slotsInput?.lineItems,
        billAmount: slotsInput?.total,
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
      console.log({ error });
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
        value.price = addPrices(value?.price);
        value.thumbnail = value?.thumbnail;
        value.specialPrice = !!value?.specialPrice
          ? addPrices(value?.specialPrice)
          : value?.specialPrice;
        value.circlePrice = !!value?.circlePrice
          ? addPrices(value?.circlePrice)
          : value?.circlePrice;
        (value.circleSpecialPrice = !!value?.circleSpecialPrice
          ? addPrices(value?.circleSpecialPrice)
          : value?.circleSpecialPrice),
          (value.discountPrice = !!value?.discountPrice
            ? addPrices(value?.discountPrice)
            : value?.discountPrice);
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
      </View>
    );
  };

  const renderItemView = (item: DiagnosticsCartItem) => {
    const priceToShow = diagnosticsDisplayPrice(item, isDiagnosticCircleSubscription)?.priceToShow;

    return (
      <View>
        <View style={styles.itemView}>
          <View
            style={{
              flexDirection: 'row',
              width: screenWidth > 350 ? '80%' : '75%',
            }}
          >
            <Text style={[styles.addressTextStyle, styles.quantityTextStyle]}>X{item?.mou}</Text>
            <Text style={styles.addressTextStyle}>{nameFormater(item?.name, 'title')}</Text>
          </View>
          <Text style={styles.addressTextStyle}>
            {string.common.Rs}
            {priceToShow}
          </Text>
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

  //check the design of the view.

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

  const renderTotalCharges = () => {
    const anyCartSaving = isDiagnosticCircleSubscription ? cartSaving + circleSaving : cartSaving;

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
          {renderPrices('Total MRP', totalPriceExcludingAnyDiscounts.toFixed(2))}

          {couponDiscount > 0 && renderPrices('Coupon Discount', couponDiscount?.toFixed(2))}
          {
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={[styles.pricesNormalText, { width: '60%' }]}>
                {string.diagnosticsCartPage.homeCollectionText}
              </Text>
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
              </View>
            </View>
          }
          {distanceCharges > 0 &&
            renderPrices(
              string.diagnosticsCartPage.paidSlotText,
              distanceCharges?.toFixed(2),
              false,
              false
            )}
          {normalSaving > 0 && renderPrices('Cart Savings', normalSaving?.toFixed(2), false, true)}
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
          {renderPrices('To Pay', grandTotal.toFixed(2), true)}
        </View>
        {anyCartSaving > 0 && renderCartSavingBanner()}
        {/* {isDiagnosticCircleSubscription ? null : circleSaving > 0 && renderSavedBanner()} */}
      </>
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
        isDiagnosticCircleSubscription ? cartSaving + circleSaving : cartSaving
      )}`,
      'on this order',
      'left',
      'saving'
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
      <View style={{ flex: 1, marginBottom: 200 }}>
        {renderAddressHeading()}
        {renderCartItems()}
        {isModifyFlow ? renderPreviouslyAddedItems() : null}
        {isDiagnosticCircleSubscription && circleSaving > 0 ? renderCircleMemberBanner() : null}

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

  function _navigateToPaymentScreen() {
    props.navigation.navigate(AppRoutes.PaymentMethods);
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
    const slotType = selectedTimeSlot?.slotInfo?.isPaidSlot ? 'Paid' : 'Free'; //this
    const itemsInCart = isModifyFlow
      ? cartItems?.length
      : getFinalItems?.map((item) => item?.cartItems)?.flat()?.length;

    DiagnosticProceedToPay(
      noOfPatient,
      numberOfSlots,
      slotType,
      itemsInCart,
      cartTotal,
      grandTotal,
      pinCode,
      addressText,
      hcCharges,
      slotTime,
      slotDate,
      isDiagnosticCircleSubscription ? 'Yes' : 'No'
    );
  }

  const proceedForBooking = () => {
    const prescriptions = physicalPrescriptions;
    if (prescriptions.length == 0 && ePrescriptions.length == 0) {
      bookDiagnosticOrder();
    } else {
      //prescription function
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
    if (grandTotal == null || grandTotal == undefined) {
      //do not call the api, if by any chance grandTotal is not a number
      renderAlert(string.common.tryAgainLater);
      setLoading?.(false);
    } else {
      const { slotStartTime, slotEndTime, date } = diagnosticSlot || {};
      const slotTimings = (slotStartTime && slotEndTime
        ? `${slotStartTime}-${slotEndTime}`
        : ''
      ).replace(' ', '');
      const formattedDate = moment(date).format('YYYY-MM-DD');

      const allItems = cartItems?.find(
        (item) =>
          item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL ||
          item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
      );

      //add a type
      //check what is slotsInput
      const bookingOrderInfo: SaveBookHomeCollectionOrderInputv2 = {
        patientAddressID: slotsInput?.addressObject?.patientAddressID,
        patientObjWithLineItems: slotsInput?.lineItems?.map((item: any) => item),
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
            !!diagnosticSlot?.isPaidSlot && diagnosticSlot?.isPaidSlot
              ? diagnosticSlot?.distanceCharges
              : 0,
        },
        bookingSource: DiagnosticsBookingSource.MOBILE,
        deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
        subscriptionInclusionId: null,
        userSubscriptionId: circleSubscriptionId,
      };
      console.log({ bookingOrderInfo });
      diagnosticSaveBookHcCollectionV2(client, bookingOrderInfo)
        .then(async ({ data }) => {
          aphConsole.log({ data });
          const getSaveHomeCollectionResponse =
            data?.saveDiagnosticBookHCOrderv2?.patientsObjWithOrderIDs;
          //check if at any level we have false (duplicate data.)
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
            console.log({ getSaveHomeCollectionResponse });
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

  function removeDuplicateCartItems(itemIds: string, pricesOfEach: any, patientId: string) {
    //can be used only when itdose starts returning all id
    const getItemIds = itemIds?.split(',');
    const selectedArray = isModifyFlow
      ? modifiedPatientCart
      : isDiagnosticSelectedCartEmpty(patientCartItems);
    const findPatient = selectedArray?.find((item) => item?.patientId === patientId);
    const itemsInCart = !!findPatient ? findPatient?.cartItems : [];

    const getPricesForItem = createItemPrice(itemsInCart)?.itemPricingObject;
    const getCartItemPrices = createItemPrice(itemsInCart)?.pricesForItemArray;

    hideAphAlert?.();
    setLoading?.(false);
    checkDuplicateItems_Level2(
      getPricesForItem,
      getItemIds,
      getCartItemPrices,
      patientId,
      itemsInCart
    );
  }

  function apiHandleErrorFunction(input: any, data: any, source: string) {
    console.log({ data });
    //take overall object
    let errorMsgToRead =
      source === BOOKING_TYPE.SAVE ? data?.[0]?.errorMessageToDisplay : data?.errorMessageToDisplay;
    let message = errorMsgToRead || string.diagnostics.bookingOrderFailedMessage;
    //itemIds will only come in case of duplicate
    let itemIds =
      source === BOOKING_TYPE.SAVE ? data?.[0]?.attributes?.itemids : data?.attributes?.itemids;
    let patientId =
      source === BOOKING_TYPE.SAVE ? data?.[0]?.patientID : modifiedPatientCart?.[0]?.patientId;
    if (itemIds?.length! > 0) {
      showAphAlert?.({
        unDismissable: true,
        title: string.common.uhOh,
        description: message,
        onPressOk: () => {
          removeDuplicateCartItems(itemIds!, input?.items, patientId);
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
            props.navigation.goBack(); //to fetch new slots
            hideAphAlert?.();
          },
          onPressOk: () => {
            props.navigation.goBack(); // to fetch new slots
            hideAphAlert?.();
          },
        });
      } else {
        renderAlert(message);
      }
    }
  }

  const checkDuplicateItems_Level2 = (
    pricesForItem: any,
    getItemIds: any,
    cartItemPrices: any,
    patientId: string,
    itemsInCart: DiagnosticsCartItem[]
  ) => {
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
      const updatedCartItems = itemsInCart?.filter(function(items: any) {
        return itemIdToRemove?.indexOf(Number(items?.id)) < 0;
      });

      //assuming get two values.
      let array = [] as any;
      itemsInCart?.forEach((cItem) => {
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

      const highPricesItem = itemsInCart?.map((cItem) =>
        Number(cItem?.id) == Number(getDuplicateItems?.[0]?.itemId)
          ? !!cItem?.name && nameFormater(cItem?.name, 'default')
          : isModifyFlow
          ? duplicateItemNameForModify?.name
          : ''
      );
      const higherPricesName = highPricesItem?.filter((item: any) => item != '')?.join(', ');
      const duplicateTests = array?.[0]?.removalName;

      let arrayToSet = [...duplicateNameArray, array]?.flat(1);
      onChangeCartItems(updatedCartItems, duplicateTests, itemIdToRemove, patientId, itemsInCart);
      setShowInclusions(true);
      setDuplicateNameArray(arrayToSet);
      setDuplicateItemsArray?.(arrayToSet);

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
        //disable the cta
        setLoading?.(false);
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

      console.log({ array });

      const orders: OrderVerticals = {
        diagnostics: array,
      };
      const orderInput: OrderCreate = {
        orders: orders,
        total_amount: grandTotal,
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
          amount: grandTotal, //actual amount to be payed by customer (topay)
        };
        const eventAttributes = createCheckOutEventAttributes(
          isModifyFlow ? getOrderDetails : getOrderDetails?.[0]?.orderID,
          slotStartTime
        );
        setauthToken?.('');
        const payId = response?.data?.createOrderInternal?.payment_order_id;
        if (
          source === BOOKING_TYPE.MODIFY &&
          modifiedOrder?.paymentType !== DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT
        ) {
          //call the process wali api & success page (check for modify Order)
          processModifiyCODOrder(getOrderDetails, grandTotal, eventAttributes, orderInfo, payId);
        } else {
          setLoading?.(false);
          props.navigation.navigate(AppRoutes.PaymentMethods, {
            paymentId: payId!,
            amount: grandTotal,
            orderId: getOrderDetails?.[0]?.orderID, //passed only one
            orderDetails: orderInfo,
            orderResponse: array,
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
      items: createItemPrice(cartItems)?.itemPricingObject, //total (prev+ curr)
      userSubscriptionId: circleSubscriptionId,
      subscriptionInclusionId: null,
      amountToPay: grandTotal, //total amount to pay
    };
    console.log({ modifyBookingInput });
    saveModifyOrder?.(modifyBookingInput)
      .then((data) => {
        const getModifyResponse = data?.data?.saveModifyDiagnosticOrder;
        console.log({ getModifyResponse });
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

  function onPressProceedToPay() {
    setLoading?.(true);
    if (isModifyFlow) {
      postwebEngageProceedToPayEventForModify();
      saveModifiedOrder();
    } else {
      postwebEngageProceedToPayEvent();
      proceedForBooking();
    }
  }

  //check here
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
        disableProceedToPay={disableProceedToPay}
        onPressProceedtoPay={() => onPressProceedToPay()}
        showTime={showTime}
        phleboMin={phleboMin}
        isModifyCOD={
          isModifyFlow
            ? modifiedOrder?.paymentType !== DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT
            : false
        }
        modifyOrderDetails={isModifyFlow ? modifiedOrder : null}
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderWizard()}
        <ScrollView bounces={false} style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {renderMainView()}
        </ScrollView>
        {renderTestProceedBar()}
      </SafeAreaView>
      {isVisible && renderPremiumOverlay()}
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
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    width: 40,
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 6,
    borderColor: theme.colors.TEST_CARD_BUTTOM_BG,
    textAlign: 'center',
    fontSize: 12,
    alignSelf: 'center',
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
});
function createOrderInternal(orderInput: OrderCreate) {
  throw new Error('Function not implemented.');
}
