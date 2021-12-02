import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  aphConsole,
  extractPatientDetails,
  formatAddress,
  formatAddressForApi,
  formatAddressWithLandmark,
  g,
  isAddressLatLngInValid,
  isDiagnosticSelectedCartEmpty,
  isEmptyObject,
  isSmallDevice,
  nameFormater,
  postAppsFlyerEvent,
  postFirebaseEvent,
  setAsyncPharmaLocation,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DiagnosticPatientCartItem,
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { AccessLocation } from '@aph/mobile-patients/src/components/Medicines/Components/AccessLocation';
import {
  diagnosticsDisplayPrice,
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  getPricesForItem,
  sourceHeaders,
} from '@aph/mobile-patients/src/utils/commonUtils';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import {
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  SET_DEFAULT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  DiagnosticData,
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  CALL_TO_ORDER_CTA_PAGE_ID,
  DiagnosticLineItem,
  REPORT_TAT_SOURCE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { postPharmacyAddNewAddressClick } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import {
  DiagnosticAddresssSelected,
  DiagnosticAddToCartClicked,
  DiagnosticCartViewed,
  DiagnosticRemoveFromCartClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { CartItemCard } from '@aph/mobile-patients/src/components/Tests/components/CartItemCard';
import {
  diagnosticServiceability,
  getDiagnosticCartRecommendations,
  getReportTAT,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticCartItemReportGenDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import {
  SCREEN_NAMES,
  TimelineWizard,
} from '@aph/mobile-patients/src/components/Tests/components/TimelineWizard';
import { InfoMessage } from '@aph/mobile-patients/src/components/Tests/components/InfoMessage';
import { MultiSelectPatientListOverlay } from '@aph/mobile-patients/src/components/Tests/components/MultiSelectPatientListOverlay';
import { LongRightArrow, TestTubes } from '@aph/mobile-patients/src/components/ui/Icons';
import ItemCard from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import { CallToOrderView } from '@aph/mobile-patients/src/components/Tests/components/CallToOrderView';

type Address = savePatientAddress_savePatientAddress_patientAddress;
type orderListLineItems = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems;

export enum SOURCE {
  ADD = 'add',
  REMOVE = 'remove',
}
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
export interface CartPageProps extends NavigationScreenProps {}

export const CartPage: React.FC<CartPageProps> = (props) => {
  const {
    cartItems,
    isDiagnosticCircleSubscription,
    modifiedOrder,
    addresses,
    deliveryAddressId,
    setAddresses,
    setDeliveryAddressId,
    setDiagnosticSlot,
    setCartPagePopulated,
    removeCartItem,
    updateCartItem,
    updatePatientCartItem,
    setCartItems,
    selectedPatient,
    deliveryAddressCityId,
    setDeliveryAddressCityId,
    duplicateItemsArray,
    setDuplicateItemsArray,
    patientCartItems,
    setPatientCartItems,
    removePatientCartItem,
    setModifiedOrder,
    setModifyHcCharges,
    setModifiedOrderItemIds,
    setHcCharges,
    setPinCode,
    modifiedPatientCart,
    setModifiedPatientCart,
    setDistanceCharges,
    modifiedOrderItemIds,
    addPatientCartItem,
    addCartItem,
    newAddressAddedCartPage,
    setNewAddressAddedCartPage,
  } = useDiagnosticsCart();

  const { setAddresses: setMedAddresses, circleSubscriptionId } = useShoppingCart();

  const {
    locationDetails,
    diagnosticLocation,
    setDiagnosticServiceabilityData,
    setDiagnosticLocation,
    diagnosticServiceabilityData,
  } = useAppCommonData();

  const { setLoading, showAphAlert, hideAphAlert, loading } = useUIElements();
  const client = useApolloClient();
  const sourceScreen = props.navigation.getParam('comingFrom');
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [addressCityId, setAddressCityId] = useState<string>(deliveryAddressCityId);
  const [reportGenDetails, setReportGenDetails] = useState<any>([]);
  const [alsoAddListData, setAlsoAddListData] = useState<any>([]);
  const [recommedationData, setRecommendationsData] = useState<any>([]);
  const [duplicateNameArray, setDuplicateNameArray] = useState(duplicateItemsArray as any);
  const [showInclusions, setShowInclusions] = useState<boolean>(false);
  const [isServiceable, setIsServiceable] = useState<boolean>(false);
  const [showNonServiceableText, setShowNonServiceableText] = useState<boolean>(false);
  const [showPriceMismatch, setShowPriceMismatch] = useState<boolean>(false);
  const cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);
  const [overallArray, setOverallArray] = useState([] as any);
  const [showPatientOverlay, setShowPatientOverlay] = useState<boolean>(false);
  //check for the modify flow...
  const [itemSelectedFromWidget, setItemSelectedFromWidget] = useState([] as any);
  const [widgetSelectedItem, setWidgetSelectedItem] = useState([] as any);
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const [reportTat, setReportTat] = useState([] as any);

  const isCartPresent = isDiagnosticSelectedCartEmpty(
    isModifyFlow ? modifiedPatientCart : patientCartItems
  );
  const callToOrderDetails = AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER;
  const ctaDetailArray = callToOrderDetails?.ctaDetailsOnCityId;
  const isCtaDetailDefault = callToOrderDetails?.ctaDetailsDefault?.ctaProductPageArray?.includes(
    CALL_TO_ORDER_CTA_PAGE_ID.TESTCART
  );
  const ctaDetailMatched = ctaDetailArray?.filter((item: any) => {
    if (item?.ctaCityId == deliveryAddressCityId) {
      if (item?.ctaProductPageArray?.includes(CALL_TO_ORDER_CTA_PAGE_ID.TESTCART)) {
        return item;
      } else {
        return null;
      }
    } else if (isCtaDetailDefault) {
      return callToOrderDetails?.ctaDetailsDefault;
    } else {
      return null;
    }
  });

  const patientsOnCartPage = !!isCartPresent && isCartPresent?.map((item) => item?.patientId);
  const patientListForOverlay =
    !!patientsOnCartPage &&
    allCurrentPatients?.filter((items: any) => patientsOnCartPage.includes(items?.id));

  const addressText = isModifyFlow
    ? formatAddressForApi(modifiedOrder?.patientAddressObj) || ''
    : selectedAddr
    ? formatAddressForApi(selectedAddr) || ''
    : '';

  var pricesForItemArray;
  var modifyPricesForItemArray;
  var patientCartItemsCopy = JSON.parse(JSON.stringify(isCartPresent));
  var fullHighPriceItems = '',
    fullDuplicateItems = '';
  var overallDuplicateArray = [] as any;

  useEffect(() => {
    triggerCartPageViewed();
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

  function triggerAddressSelected(servicable: 'Yes' | 'No') {
    const addressToUse = isModifyFlow ? modifiedOrder?.patientAddressObj : selectedAddr;
    const pinCodeFromAddress = addressToUse?.zipcode!;
    DiagnosticAddresssSelected(
      newAddressAddedCartPage != '' ? 'New' : 'Existing',
      servicable,
      pinCodeFromAddress,
      'Cart page',
      currentPatient,
      isDiagnosticCircleSubscription
    );
    newAddressAddedCartPage != '' && setNewAddressAddedCartPage?.('');
  }

  function triggerCartPageViewed() {
    const addressToUse = isModifyFlow ? modifiedOrder?.patientAddressObj : selectedAddr;
    const pinCodeFromAddress = addressToUse?.zipcode!;
    const cityFromAddress = addressToUse?.city;
    DiagnosticCartViewed(
      'cart page',
      currentPatient,
      cartItems,
      isDiagnosticCircleSubscription,
      pinCodeFromAddress,
      cityFromAddress,
      false
    );
  }

  function handleBack() {
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
    } else if (isCartPresent?.length == 0) {
      props.navigation.navigate('TESTS', { focusSearch: true });
    } else {
      props.navigation.goBack();
    }

    return true;
  }

  function clearModifyDetails() {
    setModifiedOrder?.(null);
    setModifyHcCharges?.(0);
    setModifiedOrderItemIds?.([]);
    setHcCharges?.(0);
    setDistanceCharges?.(0);
    setModifiedPatientCart?.([]);
    setDeliveryAddressId?.('');
    //go back to homepage
    props.navigation.navigate('TESTS', { focusSearch: true });
  }

  useEffect(() => {
    setDuplicateNameArray(duplicateItemsArray);
    setShowInclusions(true);
  }, [duplicateItemsArray]);

  useEffect(() => {
    isModifyFlow && setDeliveryAddressId?.(modifiedOrder?.patientAddressId);
    if (
      ((isModifyFlow && modifiedPatientCart?.length > 0) || deliveryAddressId != '') &&
      isFocused
    ) {
      setIsServiceable(false);
      setShowNonServiceableText(false);
      setShowPriceMismatch(false);
      getAddressServiceability();
    }
  }, [addresses, isFocused]);

  useEffect(() => {
    if (cartItems?.length > 0 && cartItemsWithId?.length > 0) {
      const itemIds = isModifyFlow ? cartItemsWithId.concat(modifiedOrderItemIds) : cartItemsWithId;
      fetchReportTat(itemIds);
      fetchTestReportGenDetails(itemIds);
      fetchCartPageRecommendations(itemIds);
    }
  }, [cartItems?.length, addressCityId]);

  const getDiagnosticsAvailability = (
    cityIdForAddress: number,
    cartItems?: DiagnosticsCartItem[],
    duplicateItem?: any,
    comingFrom?: string
  ) => {
    const itemIds = comingFrom ? duplicateItem : cartItems?.map((item) => parseInt(item?.id));
    const pinCodeFromAddress = isModifyFlow
      ? Number(modifiedOrder?.patientAddressObj?.zipcode!)
      : !!selectedAddr
      ? Number(selectedAddr?.zipcode)
      : null;
    return client.query<
      findDiagnosticsByItemIDsAndCityID,
      findDiagnosticsByItemIDsAndCityIDVariables
    >({
      query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
      context: {
        sourceHeaders,
      },
      variables: { cityID: cityIdForAddress, itemIDs: itemIds!, pincode: pinCodeFromAddress },
      fetchPolicy: 'no-cache',
    });
  };

  const fetchCartPageRecommendations = async (
    _cartItemId: string | number[],
    selectedItem?: any,
    source?: string,
    addedItem?: any
  ) => {
    if (source === SOURCE.ADD) {
      createWidgetItemParameterObject(selectedItem, addedItem);
      setShowPatientOverlay(true);
    }

    try {
      const removeSpaces =
        typeof _cartItemId == 'string' ? _cartItemId?.replace(/\s/g, '')?.split(',') : null;
      const listOfIds =
        typeof _cartItemId == 'string' ? removeSpaces?.map((item) => Number(item!)) : _cartItemId;

      const recommedationResponse: any = await getDiagnosticCartRecommendations(
        client,
        listOfIds || [Number(_cartItemId)],
        10
      );
      if (recommedationResponse?.data?.getDiagnosticItemRecommendations) {
        const getItems = recommedationResponse?.data?.getDiagnosticItemRecommendations?.itemsData;
        if (getItems?.length > 2) {
          const _itemIds = getItems?.map((item: any) => Number(item?.itemId));
          const _filterItemIds = _itemIds?.filter(
            (val: any) =>
              !!cartItemsWithId && cartItemsWithId?.length && !cartItemsWithId?.includes(val)
          );
          fetchPricesForItems(_filterItemIds, getItems, listOfIds, 'fetchCartPageRecommendations');
        } else {
          //in case no results are there, or less than 2 -> show top booked test as result
          setRecommendationsData([]);
        }
      } else {
        setRecommendationsData([]); //show top booked tests
      }
    } catch (error) {
      CommonBugFender('CartPage_fetchCartPageRecommendations', error);
      setRecommendationsData([]);
      //show top booked tests
    }
  };

  async function fetchReportTat(_cartItemId: string | number[]) {
    const removeSpaces =
      typeof _cartItemId == 'string' ? _cartItemId?.replace(/\s/g, '')?.split(',') : null;
    const listOfIds =
      typeof _cartItemId == 'string' ? removeSpaces?.map((item) => Number(item!)) : _cartItemId;
    const pincode = selectedAddr?.zipcode;
    try {
      const result = await getReportTAT(
        client,
        null,
        Number(addressCityId),
        !!pincode ? Number(pincode) : 0,
        listOfIds!,
        REPORT_TAT_SOURCE.CART_PAGE
      );
      if (result?.data?.getConfigurableReportTAT) {
        const getMaxReportTat = result?.data?.getConfigurableReportTAT?.itemLevelReportTATs;
        setReportTat(getMaxReportTat);
      } else {
        setReportTat([]);
      }
    } catch (error) {
      CommonBugFender('fetchReportTat_TestDetails', error);
      setReportTat([]);
    }
  }

  function createWidgetItemParameterObject(selectedItem: any, addedItem: any) {
    const inclusions = selectedItem?.inclusionData;
    const getMandatoryParamter = !!inclusions
      ? inclusions?.length > 0 &&
        inclusions?.map((inclusion: any) =>
          inclusion?.incObservationData?.filter((item: any) => item?.mandatoryValue === '1')
        )
      : 0;

    const getMandatoryParameterCount = !!getMandatoryParamter
      ? getMandatoryParamter?.reduce((prevVal: any, curr: any) => prevVal + curr?.length, 0)
      : 0;

    const priceToShow = diagnosticsDisplayPrice(addedItem, isDiagnosticCircleSubscription)
      ?.priceToShow;

    const obj = {
      itemName: !!selectedItem && selectedItem?.itemTitle,
      parameterCount: getMandatoryParameterCount,
      price: priceToShow,
    };
    setItemSelectedFromWidget(obj);
  }

  const fetchTestReportGenDetails = async (
    _cartItemId: string | number[],
    selectedItem?: any,
    source?: string,
    addedItem?: any
  ) => {
    if (source === SOURCE.ADD && recommedationData?.length < 2) {
      createWidgetItemParameterObject(selectedItem, addedItem);
      setShowPatientOverlay(true);
    }
    try {
      const removeSpaces =
        typeof _cartItemId == 'string' ? _cartItemId?.replace(/\s/g, '')?.split(',') : null;
      const listOfIds =
        typeof _cartItemId == 'string' ? removeSpaces?.map((item) => Number(item!)) : _cartItemId;

      const res: any = await getDiagnosticCartItemReportGenDetails(
        listOfIds?.toString() || _cartItemId?.toString(),
        Number(addressCityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
      );
      if (res?.data?.success) {
        const result = g(res, 'data', 'data');
        const widgetsData = g(res, 'data', 'widget_data', '0', 'diagnosticWidgetData');
        setReportGenDetails(result || []);
        const _itemIds = widgetsData?.map((item: any) => Number(item?.itemId));
        const _filterItemIds = _itemIds?.filter((val: any) => !cartItemsWithId?.includes(val));
        fetchPricesForItems(_filterItemIds, widgetsData, listOfIds, 'fetchTestReportGenDetails');
      } else {
        setAlsoAddListData([]);
        setReportGenDetails([]);
      }
    } catch (e) {
      CommonBugFender('CartPage_fetchTestReportGenDetails', e);
      setAlsoAddListData([]);
      setReportGenDetails([]);
    }
  };

  const fetchPricesForItems = (
    _filterItemIds: number[],
    widgetsData: any,
    cartItemIds: any,
    sourceFunction: string
  ) => {
    const pinCodeFromAddress = isModifyFlow
      ? Number(modifiedOrder?.patientAddressObj?.zipcode!)
      : !!selectedAddr
      ? Number(selectedAddr?.zipcode)
      : null;
    try {
      client
        .query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
          query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
          context: {
            sourceHeaders,
          },
          variables: {
            cityID: Number(addressCityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
            itemIDs: _filterItemIds,
            pincode: pinCodeFromAddress,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const diagnosticItems = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
          let _diagnosticWidgetData: any = [];
          widgetsData?.forEach((_widget: any) => {
            diagnosticItems?.forEach((_diagItems) => {
              if (_widget?.itemId == _diagItems?.itemId) {
                if (sourceFunction == 'fetchCartPageRecommendations') {
                  _diagnosticWidgetData?.push({
                    ..._widget,
                    itemTitle: _diagItems?.itemName,
                    diagnosticPricing: _diagItems?.diagnosticPricing,
                    packageCalculatedMrp: _diagItems?.packageCalculatedMrp,
                  });
                } else {
                  _diagnosticWidgetData?.push({
                    ..._widget,
                    diagnosticPricing: _diagItems?.diagnosticPricing,
                    packageCalculatedMrp: _diagItems?.packageCalculatedMrp,
                  });
                }
              }
            });
          });

          const filteredItems =
            !!_diagnosticWidgetData &&
            _diagnosticWidgetData?.filter(
              (diagItem: any) =>
                !!cartItemIds &&
                cartItemIds?.length &&
                !cartItemIds?.includes(Number(diagItem?.itemId))
            );
          if (sourceFunction == 'fetchCartPageRecommendations') {
            setRecommendationsData(filteredItems);
          } else {
            setAlsoAddListData(filteredItems);
          }
        });
    } catch (error) {
      aphConsole.log({ error });
      setAlsoAddListData([]);
      CommonBugFender(`CartPage_fetchPricesForItems_${sourceFunction}`, error);
    }
  };

  const errorAlert = (description?: string) => {
    showAphAlert?.({
      title: string.common.uhOh,
      description: description || 'Unable to fetch test details.',
    });
  };

  const removeDisabledCartItems = (disabledCartItemIds: string[]) => {
    hideAphAlert?.();
    setCartItems?.(
      cartItems?.filter((cItem) => !disabledCartItemIds?.find((dItem) => dItem == cItem?.id))
    );
  };
  const removeDisabledPatientCartItems = (disabledCartItemIds: string[]) => {
    hideAphAlert?.();

    const newObj = patientCartItems?.map((item) => {
      const patientCartItemsObj: DiagnosticPatientCartItem = {
        patientId: item?.patientId,
        cartItems: item?.cartItems?.filter(
          (cItem) => !disabledCartItemIds?.find((dItem) => dItem == cItem?.id)
        ),
      };
      //add a check, if disabledItem is not present & isSelected is false then remove it
      return patientCartItemsObj;
    });

    setPatientCartItems?.(newObj);
  };

  function updateModifiedPatientCartItem(updatedObject: any) {
    const foundIndex =
      !!modifiedPatientCart &&
      modifiedPatientCart?.[0]?.cartItems?.findIndex((item) => item?.id == updatedObject?.id);

    if (foundIndex !== -1) {
      modifiedPatientCart[0].cartItems[foundIndex] = updatedObject;
    }
    setModifiedPatientCart?.(modifiedPatientCart?.slice(0));
  }

  const updatePricesInCart = (results: any, isNavigate?: boolean) => {
    const getExisitngItems = patientCartItems
      ?.map((item) => item?.cartItems?.filter((idd) => idd?.id))
      ?.flat();
    const selectedUnqiueItems = getExisitngItems?.filter((i) => i?.isSelected);
    const arrayToChoose = isModifyFlow ? cartItems : selectedUnqiueItems;

    if (results?.length == 0) {
      setLoading?.(false);
    }
    const disabledCartItems = arrayToChoose?.filter(
      (cartItem) =>
        !results?.find(
          (d: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics) =>
            `${d?.itemId}` == cartItem?.id
        )
    );
    let isItemDisable = false,
      isPriceChange = false;
    if (arrayToChoose?.length > 0) {
      arrayToChoose?.map((cartItem, index: number) => {
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
            isModifyFlow ? setShowPriceMismatch(false) : setShowPriceMismatch(true);
            let updatedObject = {
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
              mou: 1,
              thumbnail: cartItem?.thumbnail,
              groupPlan: planToConsider?.groupPlan,
              packageMrp: results?.[isItemInCart]?.packageCalculatedMrp,
              inclusions:
                results?.[isItemInCart]?.inclusions == null
                  ? [Number(results?.[isItemInCart]?.itemId)]
                  : results?.[isItemInCart]?.inclusions,
              collectionMethod: TEST_COLLECTION_TYPE.HC,
              isSelected: isModifyFlow
                ? AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG
                : cartItem?.isSelected,
            };

            updateCartItemsLocally(updatedObject, index, arrayToChoose?.length);
            isModifyFlow && updateModifiedPatientCartItem?.(updatedObject);
          }
          setLoading?.(false);
        }
        //if items not available
        if (disabledCartItems?.length) {
          isItemDisable = true;
          const disabledCartItemIds = disabledCartItems?.map((item) => item?.id);
          setLoading?.(false);
          removeDisabledCartItems(disabledCartItemIds);
          removeDisabledPatientCartItems(disabledCartItemIds);
          setShowPriceMismatch(true);
        }
      });
      if (!isItemDisable && !isPriceChange) {
        isPriceChange = false;
        isItemDisable = false;
        setLoading?.(false);
      }
    }
    !!isNavigate && isNavigate && _navigateToNextScreen();
  };

  function updateCartItemsLocally(
    updatedItems: DiagnosticsCartItem,
    index: number,
    lengthOfArray: number
  ) {
    const newPatientCartItem = patientCartItems?.map((patientItems: DiagnosticPatientCartItem) => {
      const findLineItemsIndex = patientItems?.cartItems?.findIndex(
        (lineItems: DiagnosticsCartItem) =>
          lineItems?.id === updatedItems?.id && lineItems?.isSelected
      );
      if (findLineItemsIndex !== -1) {
        /**commented for future ref */
        // const getCurrentPatientCartItems = patientItems?.cartItems?.[findLineItemsIndex]
        //   ?.isSelected!;
        // updatedItems['isSelected'] = getCurrentPatientCartItems;
        patientItems.cartItems[findLineItemsIndex] = updatedItems;
        const patientLineItemObj: DiagnosticPatientCartItem = {
          patientId: patientItems?.patientId,
          cartItems: patientItems?.cartItems,
        };
        return patientLineItemObj;
      } else {
        return patientItems;
      }
    });
    if (isModifyFlow) {
      setPatientCartItems?.([...newPatientCartItem!]?.slice(0));
    } else if (index == lengthOfArray - 1) {
      setPatientCartItems?.([...newPatientCartItem!]?.slice(0));
    }

    const foundIndex = cartItems?.findIndex((item) => item?.id == updatedItems?.id);
    if (foundIndex !== -1) {
      if (index == lengthOfArray - 1 || isModifyFlow) {
        cartItems[foundIndex] = { ...cartItems[foundIndex], ...updatedItems };
        setCartItems?.([...cartItems]?.slice(0));
      }
    }
  }

  async function getAddressServiceability(navigate?: boolean) {
    //check in case of modify
    const selectedAddress = isModifyFlow ? modifiedOrder?.patientAddressObj : selectedAddr;
    setPinCode?.(selectedAddr?.zipcode!);
    //on changing the address
    let obj = {} as DiagnosticData;
    setLoading?.(true);
    //pick from delivery address id. //since it is reflecting late
    try {
      const serviceabilityResponse = await diagnosticServiceability(
        client,
        Number(selectedAddress?.latitude),
        Number(selectedAddress?.longitude)
      );
      if (serviceabilityResponse?.data?.getDiagnosticServiceability?.status) {
        const getServiceableResponse =
          serviceabilityResponse?.data?.getDiagnosticServiceability?.serviceability;
        if (!!getServiceableResponse) {
          obj = {
            cityId: getServiceableResponse?.cityID?.toString() || '0',
            stateId: getServiceableResponse?.stateID?.toString() || '0',
            state: getServiceableResponse?.state || '',
            city: getServiceableResponse?.city || '',
          };
          //serviceable
          setDeliveryAddressCityId?.(String(getServiceableResponse?.cityID));
          setDiagnosticServiceabilityData?.(obj);
          setIsServiceable(true);
          setShowNonServiceableText(false);
          setAddressCityId(String(getServiceableResponse?.cityID));
          //call prices api.
          getDiagnosticsAvailability(getServiceableResponse?.cityID!, cartItems)
            .then(({ data }) => {
              const diagnosticItems = data?.findDiagnosticsByItemIDsAndCityID?.diagnostics || [];
              updatePricesInCart(diagnosticItems, navigate);
              patientCartItems?.length == 0 && setLoading?.(false);
            })
            .catch((e) => {
              CommonBugFender('AddPatients_getAddressServiceability_getDiagnosticsAvailability', e);
              setLoading?.(false);
              errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
            });
          triggerAddressSelected('Yes');
        } else {
          //non-serviceable
          setLoading?.(false);
          setIsServiceable(false);
          setShowNonServiceableText(true);
          setAddressCityId(String(AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID));
          triggerAddressSelected('No');
        }
      } else {
        setLoading?.(false);
        setIsServiceable(false);
        setShowNonServiceableText(true);
        triggerAddressSelected('No');
      }
    } catch (error) {
      CommonBugFender('AddPatients_getAddressServiceability', error);
      setLoading?.(false);
      setIsServiceable(false);
      setShowNonServiceableText(true);
    }
  }

  function AddressSelectedEvent(address: savePatientAddress_savePatientAddress_patientAddress) {
    const firebaseAttributes: FirebaseEvents[FirebaseEventName.DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS] = {
      DeliveryAddress: formatAddress(address),
      Pincode: address?.zipcode || '',
      LOB: 'Diagnostics',
      'Circle Membership Added': 'No', //since we don't have provision to purchase circle with order
      'Circle Membership Value': null,
    };
    postAppsFlyerEvent(
      AppsFlyerEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS,
      firebaseAttributes
    );
    postFirebaseEvent(
      FirebaseEventName.DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS,
      firebaseAttributes
    );
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
        setDiagnosticSlot?.(null);
        const deliveryAddress = updatedAddresses.find(({ id }) => patientAddress?.id == id);
        setDiagnosticLocation?.(formatAddressToLocation(deliveryAddress! || null));
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

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={isModifyFlow ? string.diagnostics.modifyHeader : 'CART'}
        onPressLeftIcon={() => handleBack()}
      />
    );
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

  function showAddressPopup() {
    return showAphAlert?.({
      removeTopIcon: true,
      onPressOutside: () => {
        hideAphAlert?.();
      },
      children: (
        <AccessLocation
          isAddressLoading={false}
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
                if (deliveryAddressId !== _address?.id) {
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

  function _onPressAddAddress() {
    postPharmacyAddNewAddressClick('Diagnostics Cart');
    props.navigation.navigate(AppRoutes.AddAddressNew, {
      addOnly: true,
      source: 'Diagnostics Cart' as AddressSource,
    });
    setDiagnosticSlot && setDiagnosticSlot(null);
  }

  const _navigateToEditAddress = (dataname: string, address: any, comingFrom: string) => {
    props.navigation.push(AppRoutes.AddAddressNew, {
      KeyName: dataname,
      addressDetails: address,
      ComingFrom: comingFrom,
      source: 'Diagnostics Cart' as AddressSource,
    });
  };

  const renderAddressSection = () => {
    return (
      <>
        {showNonServiceableText ? renderInfoMessage() : null}
        {showPriceMismatch ? renderMismatchPrice() : null}
        <View
          style={[
            styles.addressOutermostView,
            {
              minHeight: screenHeight > 800 ? 150 : screenHeight < 600 ? 165 : 175,
            },
          ]}
        >
          <Text style={styles.addressHeadingText}>
            {nameFormater(string.diagnostics.homeVisitText, 'title')}
          </Text>
          <View>
            <View style={styles.addressTextView}>
              {!!addressText && (
                <Text numberOfLines={2} style={styles.addressTextStyle}>
                  {addressText}
                </Text>
              )}
              {isModifyFlow ? null : (
                <Text style={styles.changeTextStyle} onPress={() => showAddressPopup()}>
                  {string.diagnostics.changeText}
                </Text>
              )}
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderInfoMessage = () => {
    return (
      <InfoMessage
        content={string.diagnosticsCartPage.nonServiceableText}
        textStyle={[styles.textStyle, { color: theme.colors.FAILURE_STATUS_TEXT }]}
        iconStyle={[styles.iconStyle, { tintColor: theme.colors.FAILURE_STATUS_TEXT }]}
        containerStyle={styles.infoContainerStyle}
        isCard={false}
      />
    );
  };

  const renderMismatchPrice = () => {
    return (
      <InfoMessage
        content={string.diagnostics.pricesChangedMessage}
        textStyle={[styles.textStyle, { color: '#1C4870', width: '85%' }]}
        iconStyle={[styles.iconStyle, { tintColor: '#1C4870' }]}
        containerStyle={[styles.infoContainerStyle, { backgroundColor: '#E0F0FF' }]}
        isCard={false}
      />
    );
  };

  function _navigateToHomePage() {
    const pincode = selectedAddr?.zipcode;
    DiagnosticAddToCartClicked(pincode!, currentPatient);
    props.navigation.navigate('TESTS', { focusSearch: false });
  }

  function _navigateToSearch() {
    const pincode = selectedAddr?.zipcode;
    DiagnosticAddToCartClicked(pincode!, currentPatient);
    props.navigation.navigate(AppRoutes.SearchTestScene, {
      searchText: '',
    });
  }

  function getSelectedPatientCartMapping() {
    const filterPatients =
      isModifyFlow &&
      !!modifiedPatientCart &&
      isDiagnosticSelectedCartEmpty(modifiedPatientCart)?.length > 0
        ? modifiedPatientCart
        : !!patientCartItems && isDiagnosticSelectedCartEmpty(patientCartItems);
    return filterPatients?.reverse();
  }

  const renderAddTestOption = () => {
    const getFilteredPatients = getSelectedPatientCartMapping();
    const highlightButton = !!getFilteredPatients && getFilteredPatients?.length > 0;
    return (
      <View style={{ marginTop: 16 }}>
        <Button
          title={'+ ADD TESTS'}
          onPress={() => (isModifyFlow ? _navigateToSearch() : _navigateToHomePage())}
          style={
            !!highlightButton && highlightButton
              ? styles.addButtonStyle
              : styles.addButtonHighlightStyle
          }
          titleTextStyle={
            !!highlightButton && highlightButton
              ? styles.addButtonTitleStyle
              : styles.addButtonHighlightTitleStyle
          }
        />
      </View>
    );
  };

  const onRemoveCartItem = ({ id, name }: DiagnosticsCartItem, patientId: string) => {
    // check if patient cartItems has the removed item. If it does, then don't remove it from the overall.
    const getSelectedItemInCart = checkIsItemRemovedFromAll(patientCartItems, id);
    removePatientCartItem?.(patientId, id);
    if (getSelectedItemInCart?.length == 1) {
      removeCartItem?.(id);
      const newCartItems = cartItems?.filter((item) => Number(item?.id) !== Number(id));
      setCartItems?.(newCartItems);
    }
    setPatientCartItems?.(patientCartItems.slice(0));

    if (isModifyFlow) {
      const newCartItems = cartItems?.filter((item) => Number(item?.id) !== Number(id));
      setModifiedPatientCart?.([
        {
          patientId: modifiedOrder?.patientId,
          cartItems: newCartItems,
        },
      ]);
    }

    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
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

  const keyExtractor = useCallback((_, index: number) => `${index}`, []);

  const renderSeparator = () => {
    return <Spearator style={{ height: 2 }} />;
  };

  const renderPatientName = (
    name: string,
    genderAgeText: string,
    salutation: string,
    count: number
  ) => {
    return (
      <View style={styles.patientNameCartItemView}>
        <View style={styles.patientNameView}>
          <View style={{ width: '72%' }}>
            <Text style={styles.patientNameText}>
              {salutation} {name}
            </Text>
          </View>
          {!!genderAgeText && <Text style={styles.patientNameText}>{genderAgeText}</Text>}
        </View>

        {!!count && renderEachPatientCartCount(count)}
      </View>
    );
  };

  const renderCartItems = () => {
    const getFilteredPatients = getSelectedPatientCartMapping();
    //marginBottom : 50
    return (
      <View style={{ marginTop: 16 }}>
        {!!getFilteredPatients && getFilteredPatients?.length > 0
          ? getFilteredPatients?.map((pCartItem) => {
              const getPatient = allCurrentPatients?.find(
                (item: any) => item?.id === pCartItem?.patientId
              );
              const { patientName, genderAgeText, patientSalutation } = extractPatientDetails(
                getPatient
              );
              const patientItems = pCartItem?.cartItems?.filter((cItem) => cItem?.isSelected);
              return (
                <>
                  {!!patientName && !!patientItems && patientItems?.length > 0
                    ? renderPatientName(
                        patientName,
                        genderAgeText,
                        patientSalutation,
                        patientItems?.length
                      )
                    : null}
                  {!!patientItems && patientItems?.length > 0 && (
                    <FlatList
                      contentContainerStyle={{ marginTop: 50 }}
                      showsVerticalScrollIndicator={false}
                      bounces={false}
                      extraData={patientItems}
                      style={styles.cartItemsFlatList}
                      keyExtractor={keyExtractor}
                      data={patientItems}
                      ItemSeparatorComponent={() => renderSeparator()}
                      renderItem={({ item, index }) => _renderCartItem(item, getPatient, index)}
                    />
                  )}
                </>
              );
            })
          : renderEmptyCart()}
      </View>
    );
  };

  const renderEachPatientCartCount = (count: number) => {
    return (
      <View style={styles.cartCountView}>
        <Text style={styles.cartCountText}>{`${count < 10 ? `0${count}` : count} ${
          count == 1 ? 'item' : 'items'
        } in your cart`}</Text>
      </View>
    );
  };

  const renderEmptyCart = () => {
    return (
      <View style={{ marginTop: 20 }}>
        <Text style={styles.cartEmpty}>Your Cart is empty</Text>
      </View>
    );
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

    const pinCodeFromAddress = isModifyFlow
      ? Number(modifiedOrder?.patientAddressObj?.zipcode!)
      : !!selectedAddr
      ? Number(selectedAddr?.zipcode)
      : null;

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
            pincode: pinCodeFromAddress,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const product = data?.findDiagnosticsByItemIDsAndCityID?.diagnostics;

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

                updateCartItem?.({
                  id: item?.itemId?.toString() || product?.[0]?.id!,
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
                  mou: 1,
                  inclusions:
                    item?.inclusions == null
                      ? [Number(item?.itemId || product?.[0]?.id)]
                      : item?.inclusions,
                  isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
                });

                updatePatientCartItem?.({
                  id: item?.itemId?.toString() || product?.[0]?.id!,
                  name: item?.itemName!,
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
                  mou: 1,
                  inclusions:
                    item?.inclusions == null
                      ? [Number(item?.itemId || product?.[0]?.id)]
                      : item?.inclusions,
                  isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
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

  const _renderCartItem = (test: DiagnosticsCartItem, patientItems: any, index: number) => {
    const reportGenItem =
      !!reportGenDetails &&
      reportGenDetails?.length > 0 &&
      reportGenDetails?.find((_item: any) => _item?.itemId === test?.id);
    const reportTAT =
      !!reportTat &&
      reportTat?.length > 0 &&
      reportTat?.find((_item: any) => Number(_item?.itemId) === Number(test?.id));
    const filterDuplicateItemsForPatients =
      !!duplicateNameArray &&
      duplicateNameArray?.filter((item: any) => item?.patientId == patientItems?.id);
    return (
      <CartItemCard
        index={index}
        comingFrom={AppRoutes.CartPage}
        cartItem={test}
        selectedPatient={selectedPatient}
        isCircleSubscribed={isDiagnosticCircleSubscription}
        reportGenItem={reportGenItem}
        reportTat={reportTAT}
        showCartInclusions={false} //showInclusions
        duplicateArray={filterDuplicateItemsForPatients}
        onPressCard={(item) => {
          CommonLogEvent(AppRoutes.CartPage, 'Navigate to test details scene');
          fetchPackageDetails(
            item?.id,
            (product) => {
              props.navigation.navigate(AppRoutes.TestDetails, {
                comingFrom: AppRoutes.TestsCart,
                cityId: addressCityId,
                testDetails: {
                  ItemID: item?.id,
                  ItemName: item?.name,
                  Rate: item?.price,
                  specialPrice: item?.specialPrice! || item?.price,
                  circleRate: item?.circlePrice,
                  circleSpecialPrice: item?.circleSpecialPrice,
                  discountPrice: item?.discountPrice,
                  discountSpecialPrice: item?.discountSpecialPrice,
                  FromAgeInDays: product?.fromAgeInDays!,
                  ToAgeInDays: product?.toAgeInDays!,
                  Gender: product?.gender,
                  collectionType: test?.collectionMethod,
                  preparation: product?.testPreparationData,
                  testDescription: product?.testDescription,
                  source: 'Cart page',
                  type: product?.itemType,
                  packageMrp: item?.itemPackageMrp,
                } as TestPackageForDetails,
              });
            },
            'onPress'
          );
        }}
        onPressRemove={(item) => {
          CommonLogEvent(AppRoutes.TestsCart, 'Remove item from cart');
          if (isModifyFlow) {
            removeCartItem?.(item?.id);
          }
          onRemoveCartItem(item, patientItems?.id);
        }}
      />
    );
  };

  const renderCartWidgets = () => {
    return (
      <ScrollView
        style={styles.widgetContainer}
        bounces={false}
        horizontal={true}
        nestedScrollEnabled={true}
      >
        <View style={styles.widgetRow}>
          <View style={styles.widgetInnerContainer}>
            <TestTubes style={styles.testTubeIconStyle} />
            <Text style={styles.widgetHeading}>You can also add</Text>
            <LongRightArrow style={styles.rightArrowIconStyle} />
          </View>
          <ItemCard
            onPressAddToCartFromCart={(item, addedItem) => {
              setWidgetSelectedItem(addedItem);
              fetchCartPageRecommendations([item?.itemId], item, SOURCE.ADD, addedItem);
              fetchTestReportGenDetails(item?.itemId, item, SOURCE.ADD, addedItem);
            }}
            onPressRemoveItemFromCart={(item) => {}}
            data={recommedationData?.length > 2 ? recommedationData : alsoAddListData}
            isCircleSubscribed={isDiagnosticCircleSubscription}
            isServiceable={isServiceable}
            isVertical={false}
            navigation={props.navigation}
            source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.CART_PAGE}
            sourceScreen={AppRoutes.CartPage}
            changeCTA={true}
          />
        </View>
      </ScrollView>
    );
  };

  const renderMainView = () => {
    const shouldShowRecommendations = isModifyFlow
      ? modifiedPatientCart?.length == 0 || modifiedPatientCart?.[0]?.cartItems?.length == 0
      : patientCartItems?.length === 0 || isCartPresent?.length == 0;
    const isCartEmpty = isModifyFlow
      ? !(modifiedPatientCart?.length == 0 || modifiedPatientCart?.[0]?.cartItems?.length == 0)
      : !!isCartPresent && !isCartPresent;
    return (
      <View style={{ margin: 16 }}>
        {renderAddTestOption()}
        {!!isCartEmpty && !isCartEmpty ? renderEmptyCart() : renderCartItems()}
        {!shouldShowRecommendations
          ? !!recommedationData && recommedationData?.length > 0
            ? renderCartWidgets()
            : !!alsoAddListData && alsoAddListData?.length > 0
            ? renderCartWidgets()
            : null
          : null}
        {showPatientOverlay ? renderPatientOverlay() : null}
      </View>
    );
  };

  const renderPatientOverlay = () => {
    return (
      <MultiSelectPatientListOverlay
        source={AppRoutes.CartPage}
        onPressClose={() => setShowPatientOverlay(false)}
        onPressDone={(_selectedPatientList: any) => {
          setShowPatientOverlay(false);
          _onPressAddItemToPatients(_selectedPatientList);
        }}
        listToShow={patientListForOverlay}
        title={!!itemSelectedFromWidget ? itemSelectedFromWidget?.itemName : undefined}
        subTitle={
          !!itemSelectedFromWidget && itemSelectedFromWidget?.parameterCount > 0
            ? `${itemSelectedFromWidget?.parameterCount}  ${
                itemSelectedFromWidget?.parameterCount == 1 ? 'parameter' : 'parameters '
              } included`
            : undefined
        }
        rightTitle={!!itemSelectedFromWidget ? itemSelectedFromWidget?.price : undefined}
        onCloseIconPress={() => setShowPatientOverlay(false)}
        showCloseIcon={true}
        onPressAddNewProfile={() => {}}
        patientSelected={selectedPatient}
        onPressAndroidBack={() => {
          setShowPatientOverlay(false);
          handleBack();
        }}
      />
    );
  };

  function _onPressAddItemToPatients(selectedPatientList: any) {
    /**
     * add items to rest of the patients as non-selected.
     */
    if (!!widgetSelectedItem) {
      if (isModifyFlow) {
        addCartItem?.(widgetSelectedItem!);
        setModifiedPatientCart?.([
          {
            patientId: modifiedOrder?.patientId,
            cartItems: cartItems?.concat(widgetSelectedItem),
          },
        ]);
      } else {
        addCartItem?.(widgetSelectedItem!);
        selectedPatientList?.map((item: any) => {
          const getCurrentPatient = patientCartItems?.find(
            (pCartItem) => pCartItem?.patientId === item?.id
          );
          const getCurrentPatientItem = !!getCurrentPatient && getCurrentPatient?.cartItems;
          const allItems = !!getCurrentPatientItem
            ? getCurrentPatientItem.concat(widgetSelectedItem)
            : [widgetSelectedItem];
          addPatientCartItem?.(item?.id, allItems!);
        });
        updateUnselectedPatientsCart(selectedPatientList);
      }
    }
  }

  function updateUnselectedPatientsCart(itemList: any) {
    const getSelectedPatientIds = itemList?.map((val: any) => val?.id);
    const getAllUnselectedPatients = patientCartItems?.filter(
      (pCartItem) => !getSelectedPatientIds.includes(pCartItem?.patientId)
    );
    getAllUnselectedPatients?.length > 0 &&
      getAllUnselectedPatients?.map((patients) => {
        const setUnselectItems = JSON.parse(JSON.stringify(widgetSelectedItem));
        setUnselectItems['isSelected'] = false;
        const addedItems = !!patients.cartItems && patients.cartItems?.concat(setUnselectItems);
        addPatientCartItem?.(patients?.patientId, addedItems!);
      });
  }

  function _validatePricesWithAddress() {
    // getAddressServiceability(true);
    _navigateToNextScreen();
  }

  function _navigateToNextScreen() {
    isModifyFlow ? _navigateToReviewPage() : _navigateToAddressSelection();
  }

  function _navigateToAddressSelection() {
    props.navigation.navigate(AppRoutes.AddressSlotSelection, {
      reportGenDetails: reportGenDetails,
      selectedAddress: selectedAddr,
    });
  }

  //will be called in case of modify flow
  function _navigateToReviewPage() {
    props.navigation.navigate(AppRoutes.ReviewOrder, {
      reportGenDetails: reportGenDetails,
      selectedAddress: modifiedOrder?.patientAddressObj,
    });
  }

  function checkIsItemRemovedFromAll(
    pCartItems: DiagnosticPatientCartItem[],
    itemId: number | string
  ) {
    const getSelectedCartItems = isDiagnosticSelectedCartEmpty(pCartItems);
    const getExisitngItems = getSelectedCartItems
      ?.map((item: DiagnosticPatientCartItem) => item?.cartItems?.filter((idd) => idd?.id))
      ?.flat();
    const getAllItemIds = getExisitngItems?.map((items: DiagnosticsCartItem) => Number(items?.id));
    const selectedItemPresent =
      !!getAllItemIds && getAllItemIds?.filter((itemIds: number) => itemIds == Number(itemId));
    return selectedItemPresent;
  }

  const disableCTA = isModifyFlow
    ? (!(!!addressText && isServiceable) && modifiedPatientCart?.length == 0) ||
      modifiedPatientCart?.[0]?.cartItems?.length == 0
    : !(!!addressText && isServiceable) ||
      patientCartItems?.length === 0 ||
      isCartPresent?.length == 0;

  const renderStickyBottom = () => {
    return (
      <StickyBottomComponent
        style={{
          shadowColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
          borderTopColor: '#B8B8B8',
          borderTopWidth: 1,
        }}
      >
        <Button
          title={isModifyFlow ? 'PROCEED TO NEW CART' : 'SCHEDULE APPOINTMENT'}
          onPress={() => _validatePricesWithAddress()}
          disabled={disableCTA}
        />
      </StickyBottomComponent>
    );
  };

  const renderCallToOrder = () => {
    return ctaDetailMatched?.length ? (
      <CallToOrderView
        cityId={deliveryAddressCityId}
        customMargin={showNonServiceableText ? 240 : 180}
        slideCallToOrder={slideCallToOrder}
        onPressSmallView={() => {
          setSlideCallToOrder(false);
        }}
        onPressCross={() => {
          setSlideCallToOrder(true);
        }}
        pageId = {CALL_TO_ORDER_CTA_PAGE_ID.TESTCART}
      />
    ) : null;
  };

  const renderWizard = () => {
    return (
      <TimelineWizard
        currentPage={SCREEN_NAMES.CART}
        upcomingPages={[SCREEN_NAMES.SCHEDULE, SCREEN_NAMES.REVIEW]}
        donePages={[SCREEN_NAMES.PATIENT]}
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
        <ScrollView
          bounces={false}
          style={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onScroll={() => {
            setSlideCallToOrder(true);
          }}
        >
          {renderMainView()}
        </ScrollView>
        {renderAddressSection()}
      </SafeAreaView>
      {renderCallToOrder()}
      {renderStickyBottom()}
    </View>
  );
};

const styles = StyleSheet.create({
  addressHeadingText: {
    marginLeft: 16,
    marginTop: 16,
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 20),
  },
  changeTextStyle: {
    ...theme.viewStyles.text('B', 13, theme.colors.APP_YELLOW, 1, 20),
  },
  addressTextStyle: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 18),
    width: '83%',
  },
  addressTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
  addButtonStyle: {
    backgroundColor: theme.colors.WHITE,
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
    elevation: 0,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    height: 50,
  },
  addButtonTitleStyle: {
    color: theme.colors.APP_YELLOW,
  },
  addButtonHighlightStyle: {
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    borderColor: theme.colors.APP_YELLOW_COLOR,
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    height: 50,
  },
  addButtonHighlightTitleStyle: {
    color: theme.colors.WHITE,
  },
  cartItemsFlatList: {
    ...theme.viewStyles.cardViewStyle,
    borderColor: 'rgba(2,71,91,0.2)',
    borderWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginBottom: 10,
    marginTop: 10,
    elevation: 0,
  },
  patientNameText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.WHITE, 1, 16),
  },
  patientNameView: {
    backgroundColor: theme.colors.SHERPA_BLUE,
    padding: 16,
    borderRadius: 10,
    margin: 16,
    marginBottom: -20,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    letterSpacing: 0.1,
    width: '94%',
    marginHorizontal: '2%',
    padding: 4,
  },
  iconStyle: {
    resizeMode: 'contain',
    height: 16,
    width: 16,
    marginLeft: 16,
  },
  infoContainerStyle: {
    margin: -16,
    marginBottom: 8,
    backgroundColor: '#FFEBE6',
    alignItems: 'center',
  },
  cartEmpty: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansBold(15),
    margin: 20,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  addressOutermostView: {
    backgroundColor: '#F5FFFD',
    maxHeight: 230,
    shadowColor: theme.colors.SHADE_GREY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  widgetHeading: {
    ...theme.viewStyles.text('B', 16, theme.colors.WHITE, 1, 24),
  },
  widgetContainer: {
    flex: 1,
    backgroundColor: theme.colors.SKY_BLUE,
    marginLeft: -16,
    marginRight: -16,
    marginTop: 16,
    marginBottom: 20,
  },
  widgetRow: { flexDirection: 'row', marginLeft: 16 },
  widgetInnerContainer: {
    width: screenWidth / 5,
    justifyContent: 'center',
  },
  testTubeIconStyle: {
    height: isSmallDevice ? 32 : 35,
    width: isSmallDevice ? 32 : 35,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  rightArrowIconStyle: {
    height: 25,
    width: 40,
    resizeMode: 'contain',
    tintColor: theme.colors.WHITE,
  },
  cartCountView: {
    backgroundColor: '#E0E9EC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E9EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    padding: 16,
    marginBottom: -20,
    zIndex: 99,
    margin: 16,
    paddingBottom: 8,
  },
  cartCountText: { ...theme.viewStyles.text('SB', 12, theme.colors.SHERPA_BLUE, 1, 18) },
  patientNameCartItemView: { marginBottom: -50, zIndex: 3000 },
});
