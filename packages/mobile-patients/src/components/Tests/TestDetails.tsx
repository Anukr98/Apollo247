import {
  TestBreadcrumbLink,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  OrangeCartIcon,
  OrangeFAQIcon,
  RelatedPackageIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  CALL_TO_ORDER_CTA_PAGE_ID,
  REPORT_TAT_SOURCE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';

import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticCartItemReportGenDetails,
  getDiagnosticTestDetails,
  TestPackage,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  nameFormater,
  isEmptyObject,
  showDiagnosticCTA,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useApolloClient } from 'react-apollo-hooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  getPricesForItem,
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  createDiagnosticAddToCartObject,
} from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import {
  DiagnosticAddToCartEvent,
  DiagnosticDetailsViewed,
} from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { TestListingHeader } from '@aph/mobile-patients/src/components/Tests/components/TestListingHeader';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { SectionHeader } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { FAQComponent } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/FAQComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import PackageCard from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
import ItemCard from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import _ from 'lodash';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  getDiagnosticCartRecommendations,
  getDiagnosticsByItemIdCityId,
  getDiagnosticsPackageRecommendations,
  getDiagnosticWidgetPricing,
  getReportTAT,
  getUserSubscriptionStatus,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import moment from 'moment';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { CallToOrderView } from '@aph/mobile-patients/src/components/Tests/components/CallToOrderView';
import {
  renderDiagnosticTestDetailShimmer,
  renderDiagnosticWidgetTestShimmer,
  renderTestDetailFaqShimmer,
  renderTestDetailHorizontalOptionShimmer,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { DIAGNOSTICS_ITEM_TYPE } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import FullWidthItemCard from '@aph/mobile-patients/src/components/Tests/components/FullWidthItemCard';
import { ExpressSlotMessageRibbon } from '@aph/mobile-patients/src/components/Tests/components/ExpressSlotMessageRibbon';
import { GetSubscriptionsOfUserByStatusVariables } from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import AsyncStorage from '@react-native-community/async-storage';
import { TestDetailsItemCard } from '@aph/mobile-patients/src/components/Tests/components/TestDetailsItemCard';
import { TestDetailsPriceView } from '@aph/mobile-patients/src/components/Tests/components/TestDetailsPriceView';
import { TestDetailsAboutCard } from '@aph/mobile-patients/src/components/Tests/components/TestDetailsAboutCard';
import { TestDetailsInclusionsCard } from './components/TestDetailsInclusionsCard';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const divisionFactor =
  screenHeight > 800 ? 10.5 : screenHeight > 700 ? 12.5 : screenHeight > 600 ? 14.5 : 16.5;
export interface TestPackageForDetails extends TestPackage {
  collectionType: TEST_COLLECTION_TYPE;
  preparation: string;
  source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE;
  type: string;
  specialPrice?: string | number;
  circleRate?: string | number;
  circleSpecialPrice?: string | number;
  discountPrice?: string | number;
  discountSpecialPrice?: string | number;
  packageMrp?: string | number;
  mrpToDisplay?: string | number;
  inclusions?: any;
}

const gender: any = {
  B: 'MALE AND FEMALE',
  M: 'MALE',
  F: 'FEMALE',
};

export interface TestOverview {
  value: string;
  summary: string;
  format?: string;
}

export interface CMSTestInclusions {
  sampleTypeName: string;
  inclusionName: string;
}
export interface CMSTestDetails {
  TestObservation: any;
  diagnosticItemName: string;
  diagnosticFAQs: any;
  diagnosticItemImageUrl: string;
  diagnosticUrlAlias: string;
  diagnosticGender: string;
  diagnosticAge: string;
  diagnosticReportCustomerText: string;
  diagnosticReportGenerationTime: string;
  diagnosticPretestingRequirement: string;
  diagnosticOverview: any;
  diagnosticInclusionName: any;
  diagnosticWidgetsData: any;
  diagnosticItemAliases?: any;
}

export interface TestDetailsProps
  extends NavigationScreenProps<{
    testDetails?: TestPackageForDetails;
    itemId?: string;
    source?: string;
    comingFrom?: string;
    itemName?: string;
    movedFrom?: string;
    cityId?: string;
    changeCTA?: boolean;
    stateId?: string;
    widgetTitle?: string;
    section?: string;
  }> {}

export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const {
    cartItems,
    addCartItem,
    isDiagnosticCircleSubscription,
    testDetailsBreadCrumbs,
    setTestDetailsBreadCrumbs,
    modifiedOrderItemIds,
    modifiedOrder,
    setModifyHcCharges,
    setModifiedOrderItemIds,
    setHcCharges,
    setModifiedOrder,
    setModifiedPatientCart,
    setDistanceCharges,
    setDeliveryAddressId,
    addresses,
    deliveryAddressId,
    diagnosticSlot,
    setIsDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const {
    pharmacyCircleAttributes,
    setCircleSubscriptionId,
    setHdfcSubscriptionId,
    setIsCircleSubscription,
    setHdfcPlanName,
    setIsFreeDelivery,
    setCirclePlanValidity,
  } = useShoppingCart();

  const {
    setIsRenew,
    diagnosticServiceabilityData,
    isDiagnosticLocationServiceable,
    diagnosticLocation,
  } = useAppCommonData();
  const hdfc_values = string.Hdfc_values;
  const testDetails = props.navigation.getParam('testDetails', {} as TestPackageForDetails);
  const testName = props.navigation.getParam('itemName');
  const changeCTA = props.navigation.getParam('changeCTA');

  const { loading, setLoading: setLoadingContext, showAphAlert, hideAphAlert } = useUIElements();

  const addressCityId = props.navigation.getParam('cityId');
  const movedFrom = props.navigation.getParam('comingFrom');
  const isDeep = props.navigation.getParam('movedFrom');
  const widgetTitle = props.navigation.getParam('widgetTitle');
  const itemId =
    movedFrom == AppRoutes.CartPage ? testDetails?.ItemID : props.navigation.getParam('itemId');
  const source = props.navigation.getParam('source');
  const section = props.navigation.getParam('section');
  const isAlreadyPartOfOrder =
    !!modifiedOrderItemIds &&
    modifiedOrderItemIds?.length &&
    modifiedOrderItemIds?.find((id: number) => Number(id) == Number(itemId));
  //if passed from cartPage
  const cityIdToUse = !!addressCityId
    ? Number(addressCityId)
    : Number(
        diagnosticServiceabilityData?.cityId! || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
      );
  const getWidgetTitle = AppConfig.Configuration.DIAGNOSITCS_WIDGET_TITLES;
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [cmsTestDetails, setCmsTestDetails] = useState((([] as unknown) as CMSTestDetails) || []);
  const [testInfo, setTestInfo] = useState(movedFrom == 'TestsCart' ? testDetails : ({} as any));
  const [readMore, setReadMore] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [widgetsData, setWidgetsData] = useState([] as any);
  const [reportTat, setReportTat] = useState<string>('');
  const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
  const [priceHeight, setPriceHeight] = useState<number>(0);
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const [frequentlyBroughtRecommendations, setFrequentlyBroughtRecommendations] = useState(
    [] as any
  );
  const [frequentlyBroughtShimmer, setFrequentlyBroughtShimmer] = useState<boolean>(false);
  const [topBookedTests, setTopBookedTests] = useState([] as any);
  const [packageRecommendations, setPackageRecommendations] = useState([] as any);
  const [packageRecommendationsShimmer, setPackageRecommendationsShimmer] = useState<boolean>(
    false
  );
  const [parameterExpandedArray, setParameterExpandedArray] = useState([] as any);
  const [frequentlyBroughtVerticalPosition, setFrequentlyBroughtVerticalPosition] = useState<
    number
  >(0);
  const [faqVerticalPosition, setFaqVerticalPosition] = useState<number>(0);
  const [relatedPackagesVerticalPosition, setRelatedPackagesVerticalPosition] = useState<number>(0);
  const [horizontalComponentElements, setHorizontalComponentElements] = useState({
    releatedPackage: false,
    frequentlyBooked: false,
    faq: false,
  });
  const [horizontalComponentOptions, setHorizontalComponentOptions] = useState([] as any);
  const [priceViewRef, setPriceViewRef] = useState() as any;

  const originalItemIds =
    !!packageRecommendations?.length || !!frequentlyBroughtRecommendations?.length
      ? [itemId!]
      : null;
  const callToOrderDetails = AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER;
  const isCtaDetailDefault = callToOrderDetails?.ctaDetailsDefault?.ctaProductPageArray?.includes(
    CALL_TO_ORDER_CTA_PAGE_ID.TESTDETAIL
  );

  const getCTADetails = showDiagnosticCTA(CALL_TO_ORDER_CTA_PAGE_ID.TESTDETAIL, cityIdToUse);

  const checkItemIdForCta = () => {
    const data = getCTADetails?.[0];
    if (
      !!data &&
      !!data?.ctaItemIds &&
      data?.ctaItemIds?.length > 0 &&
      data?.ctaItemIds?.includes(Number(itemId))
    ) {
      return [data];
    } else {
      return null;
    }
  };

  const ctaDetailMatched = !!getCTADetails?.length
    ? checkItemIdForCta()
    : isCtaDetailDefault && !isDiagnosticLocationServiceable
    ? [callToOrderDetails?.ctaDetailsDefault]
    : [];
  const isModify = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
  const itemName =
    (!!testDetails && testDetails?.ItemName) ||
    testName ||
    cmsTestDetails?.diagnosticItemName ||
    testInfo?.ItemName ||
    '';

  const isAddedToCart = !!cartItems?.find((item) => item.id == testInfo?.ItemID);
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  var horizontalCompArr: { icon: JSX.Element; title: string }[] = [];

  useEffect(() => {
    if (!!cmsTestDetails) {
      const isRelatedPackage = !!packageRecommendations && packageRecommendations?.length > 0;
      const isFreqBooked =
        (!!frequentlyBroughtRecommendations && frequentlyBroughtRecommendations?.length > 0) ||
        (!!topBookedTests && topBookedTests?.length > 0);
      const isFAQ = !!cmsTestDetails && cmsTestDetails?.diagnosticFAQs?.length > 0;
      if (isRelatedPackage) {
        setHorizontalComponentElements({ ...horizontalComponentElements, releatedPackage: true });
      }
      if (isFreqBooked) {
        setHorizontalComponentElements({ ...horizontalComponentElements, frequentlyBooked: true });
      }
      if (isFAQ) {
        setHorizontalComponentElements({ ...horizontalComponentElements, faq: true });
      }

      if (isRelatedPackage && isFreqBooked) {
        setHorizontalComponentElements({
          ...horizontalComponentElements,
          frequentlyBooked: true,
          releatedPackage: true,
        });
      }
      if (isRelatedPackage && isFreqBooked && isFAQ) {
        setHorizontalComponentElements({
          ...horizontalComponentElements,
          frequentlyBooked: true,
          releatedPackage: true,
          faq: true,
        });
      }
    }
  }, [packageRecommendations, frequentlyBroughtRecommendations, cmsTestDetails]);

  useEffect(() => {
    if (horizontalComponentElements?.releatedPackage == true) {
      horizontalCompArr.push({
        icon: <RelatedPackageIcon style={styles.horizontalComponentIcon} />,
        title:
          packageRecommendations?.length == 0
            ? string.diagnostics.topBookedTests
            : string.diagnosticsDetails.relatedPackages,
      });
    }
    if (horizontalComponentElements?.frequentlyBooked == true) {
      horizontalCompArr.push({
        icon: <OrangeCartIcon style={styles.horizontalComponentIcon} />,
        title: string.diagnosticsDetails.frequentlyBooked,
      });
    }
    if (horizontalComponentElements?.faq == true) {
      horizontalCompArr.push({
        icon: <OrangeFAQIcon style={styles.horizontalComponentIcon} />,
        title: string.diagnosticsDetails.frequentlyAskedQuestions,
      });
    }

    setHorizontalComponentOptions([...new Set(horizontalCompArr)]);
  }, [horizontalComponentElements]);

  useEffect(() => {
    if (!!currentPatient && isDeep == 'deeplink') {
      getUserSubscriptionsByStatus();
    }
  }, []);

  /**
   * fetching the details wrt itemId
   */
  useEffect(() => {
    if (itemId) {
      fetchTestDetails_CMS(itemId, null);
      loadTestDetails(itemId);
      fetchReportTat(itemId);
      // loadWidgets(itemId);
    } else if (testName) {
      fetchTestDetails_CMS(99999, testName);
    } else {
      setErrorState(true);
    }
  }, [itemId]);

  useEffect(() => {
    if (!!testInfo) {
      if (testInfo?.inclusions == null || testInfo?.inclusions?.length == 1) {
        if (frequentlyBroughtRecommendations?.length == 0 || topBookedTests?.length == 0) {
          getFrequentlyBroughtRecommendations(testInfo?.ItemID! || itemId);
        }
        if (
          packageRecommendations?.length == 0 &&
          (testInfo?.inclusions == null || testInfo?.inclusions?.length == 1)
        ) {
          getPackageRecommendationsForTest(testInfo?.ItemID! || itemId);
        }
      }
    }
  }, [testInfo]);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  function handleBack() {
    if (movedFrom === 'registration') {
      props.navigation.replace(AppRoutes.HomeScreen);
    } else if (movedFrom == 'deeplink') {
      props.navigation.replace(AppRoutes.HomeScreen);
    } else {
      props.navigation.goBack();
    }
  }

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: currentPatient?.mobileNumber,
        status: ['active', 'deferred_active', 'deferred_inactive', 'disabled'],
      };
      const res = await getUserSubscriptionStatus(client, query);
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      const filterActiveResults = data?.APOLLO?.filter((val: any) => val?.status == 'active');
      if (data) {
        const circleData = !!filterActiveResults ? filterActiveResults?.[0] : data?.APOLLO?.[0];
        if (circleData._id && circleData?.status !== 'disabled') {
          AsyncStorage.setItem('circleSubscriptionId', circleData._id);
          setCircleSubscriptionId && setCircleSubscriptionId(circleData._id);
          setIsCircleSubscription && setIsCircleSubscription(true);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(true);
          const planValidity = {
            startDate: circleData?.start_date,
            endDate: circleData?.end_date,
            plan_id: circleData?.plan_id,
            source_identifier: circleData?.source_meta_data?.source_identifier,
          };
          setCirclePlanValidity && setCirclePlanValidity(planValidity);
          setIsRenew && setIsRenew(!!circleData?.renewNow);
        } else {
          setCircleSubscriptionId && setCircleSubscriptionId('');
          setIsCircleSubscription && setIsCircleSubscription(false);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
          setCirclePlanValidity && setCirclePlanValidity(null);
        }

        if (data?.HDFC?.[0]._id) {
          setHdfcSubscriptionId && setHdfcSubscriptionId(data?.HDFC?.[0]._id);
          const planName = data?.HDFC?.[0].name;
          setHdfcPlanName && setHdfcPlanName(planName);
          if (planName === hdfc_values.PLATINUM_PLAN && data?.HDFC?.[0].status === 'active') {
            setIsFreeDelivery && setIsFreeDelivery(true);
          }
        } else {
          setHdfcSubscriptionId && setHdfcSubscriptionId('');
          setHdfcPlanName && setHdfcPlanName('');
        }
      }
    } catch (error) {
      CommonBugFender('TestDetails_GetSubscriptionsOfUserByStatus', error);
    }
  };

  function loadWidgets(itemId: number | string) {
    /**to be shown only for single tests */
    if (!!testDetails) {
      if (testDetails?.inclusions == null || testDetails?.inclusions?.length == 1) {
        getFrequentlyBroughtRecommendations(itemId);
        getPackageRecommendationsForTest(itemId);
      }
    }
  }

  function skuParameterInclusionLogic() {
    const isInclusionPrsent =
      !!cmsTestDetails?.diagnosticInclusionName &&
      cmsTestDetails?.diagnosticInclusionName?.length > 0;
    const inclusions = isInclusionPrsent && cmsTestDetails?.diagnosticInclusionName;

    const filterParamters = cmsTestDetails?.diagnosticInclusionName?.filter(
      (item: any) => !!item?.TestObservation && item?.TestObservation != ''
    );

    const filterParamters_topFour = cmsTestDetails?.diagnosticInclusionName?.filter(
      (item: any, index: number) =>
        index < 4 && !!item?.TestObservation && item?.TestObservation != ''
    );

    const getDispalyedParameterCount =
      !!filterParamters_topFour &&
      filterParamters_topFour?.length > 0 &&
      filterParamters_topFour?.map((inclusion: any, index: number) =>
        !!inclusion?.TestObservation
          ? inclusion?.TestObservation?.filter((item: any) => item?.mandatoryValue === '1')
          : []
      );

    const getMandatoryParameterCount_topFour =
      !!getDispalyedParameterCount &&
      getDispalyedParameterCount?.reduce((prevVal: any, curr: any) => prevVal + curr?.length, 0);

    const getMandatoryParamter =
      !!filterParamters &&
      filterParamters?.length > 0 &&
      filterParamters?.map((inclusion: any) =>
        !!inclusion?.TestObservation
          ? inclusion?.TestObservation?.filter((item: any) => item?.mandatoryValue === '1')
          : []
      );

    const nonInclusionParamters = cmsTestDetails?.diagnosticInclusionName?.filter(
      (item: any) => !!item && (!item?.TestObservation || item?.TestObservation?.length == 0)
    );

    const getMandatoryParameterCount =
      !!getMandatoryParamter && getMandatoryParamter?.length > 0
        ? getMandatoryParamter?.reduce((prevVal: any, curr: any) => prevVal + curr?.length, 0)
        : undefined;

    return {
      isInclusionPrsent,
      getMandatoryParameterCount,
      nonInclusionParamters,
      inclusions,
      getMandatoryParameterCount_topFour,
      filterParamters,
    };
  }

  const fetchTestDetails_CMS = async (itemId: string | number, itemName: string | null) => {
    setLoadingContext?.(true);
    const res: any = await getDiagnosticTestDetails(
      'diagnostic-details',
      Number(itemId),
      !!itemName ? itemName : cmsTestDetails?.diagnosticUrlAlias,
      cityIdToUse
    );
    if (res?.data?.success && !!res?.data?.data) {
      const result = res?.data?.data;
      !!itemName && loadTestDetails(result?.diagnosticItemID);
      setCmsTestDetails(result);
      setLoadingContext?.(false);
      result?.diagnosticFAQs?.length > 0 &&
        setHorizontalComponentElements({ ...horizontalComponentElements, faq: true });
      !!result?.diagnosticWidgetsData &&
        result?.diagnosticWidgetsData?.length > 0 &&
        fetchWidgetPrices(result?.diagnosticWidgetsData, cityIdToUse);
    } else {
      setLoadingContext?.(false);
      setErrorState(true);
      setCmsTestDetails([]);
    }
  };

  const loadTestDetails = async (itemId: string | number) => {
    let listOfIds = [];
    listOfIds = [Number(itemId)];

    try {
      setLoadingContext?.(true);
      const {
        data: { findDiagnosticsByItemIDsAndCityID },
      } = await getDiagnosticsByItemIdCityId(client, cityIdToUse, listOfIds);
      const {
        rate,
        gender,
        itemName,
        collectionType,
        fromAgeInDays,
        toAgeInDays,
        testPreparationData,
        packageCalculatedMrp,
        diagnosticPricing,
        inclusions,
        testDescription,
        itemType,
      } = findDiagnosticsByItemIDsAndCityID?.diagnostics?.[0]!;

      const getDiagnosticPricingForItem = diagnosticPricing;
      const packageMrpForItem = packageCalculatedMrp!;
      const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);

      if (!pricesForItem?.itemActive) {
        return !isAddedToCart;
      }
      const specialPrice = pricesForItem?.specialPrice!;
      const price = pricesForItem?.price!;
      const circlePrice = pricesForItem?.circlePrice!;
      const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
      const discountPrice = pricesForItem?.discountPrice!;
      const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
      const mrpToDisplay = pricesForItem?.mrpToDisplay;
      const circleDiscount = pricesForItem?.circleDiscount;
      const specialDiscount = pricesForItem?.specialDiscount;
      const discount = pricesForItem?.discount;

      const partialTestDetails = {
        Rate: price,
        Gender: gender,
        ItemID: `${itemId}`,
        ItemName: itemName,
        collectionType: collectionType!,
        mou: inclusions == null ? 1 : inclusions.length,
        testDescription: testDescription,
        type: itemType,
        FromAgeInDays: fromAgeInDays,
        ToAgeInDays: toAgeInDays,
        preparation: testPreparationData,
        packageMrp: packageCalculatedMrp,
        specialPrice: specialPrice,
        circleRate: circlePrice,
        circleSpecialPrice: circleSpecialPrice,
        discountPrice: discountPrice,
        discountSpecialPrice: discountSpecialPrice,
        mrpToDisplay: mrpToDisplay,
        inclusions: inclusions == null ? Number([itemId]) : inclusions,
        specialDiscountDiffPrice: pricesForItem?.specialDiscountDiffPrice,
        circleDiscountDiffPrice: pricesForItem?.circleDiscountDiffPrice,
        promoteCircle: pricesForItem?.promoteCircle,
        promoteDiscount: pricesForItem?.promoteDiscount,
        groupPlan: pricesForItem?.planToConsider,
        circleDiscount: circleDiscount,
        specialDiscount: specialDiscount,
        discount: discount,
      };

      setTestInfo({ ...(partialTestDetails || []) });
    } catch (error) {
      setErrorState(true);
    } finally {
      setLoadingContext?.(false);
    }
  };

  const fetchWidgetPrices = async (
    widgetsData: any,
    cityId: string | number,
    source?: string,
    widgets?: any
  ) => {
    let itemIds;
    if (source == getWidgetTitle?.frequentlyBrought || source == getWidgetTitle?.topBookedTests) {
      itemIds = widgetsData; //this will have the item id to be shown
    } else {
      itemIds = widgetsData?.map((item: any) =>
        item?.diagnosticWidgetData?.map((data: any, index: number) => Number(data?.itemId))
      );
    }
    try {
      const res = Promise.all(
        itemIds?.map((item: any) =>
          getDiagnosticWidgetPricing(
            client,
            Number(cityId!),
            item?.length > 12 ? item?.slice(0, 12) : item
          )
        )
      );
      const response = (await res)
        ?.map((item: any) => item?.data?.findDiagnosticsWidgetsPricing?.diagnostics || [])
        ?.flat();
      if (source == getWidgetTitle?.frequentlyBrought || source == getWidgetTitle?.topBookedTests) {
        let _frequentlyBrought: any = [];
        widgets?.forEach((_widget: any) => {
          response?.forEach((_diagItems: any) => {
            if (_widget?.itemId == _diagItems?.itemId) {
              if (source == getWidgetTitle?.frequentlyBrought) {
                _frequentlyBrought?.push({
                  ..._widget,
                  itemTitle: _widget?.itemName,
                  diagnosticPricing: _diagItems?.diagnosticPricing,
                  packageCalculatedMrp: _diagItems?.packageCalculatedMrp,
                });
              } else {
                _frequentlyBrought?.push({
                  ..._widget,
                  diagnosticPricing: _diagItems?.diagnosticPricing,
                  packageCalculatedMrp: _diagItems?.packageCalculatedMrp,
                });
              }
            }
          });
        });
        if (source === getWidgetTitle?.frequentlyBrought) {
          setFrequentlyBroughtRecommendations?.(_frequentlyBrought);
        } else {
          setTopBookedTests?.(_frequentlyBrought);
        }
        setFrequentlyBroughtShimmer(false);
      } else {
        let newWidgetsData = [...widgetsData];
        for (let i = 0; i < widgetsData?.length; i++) {
          for (let j = 0; j < widgetsData?.[i]?.diagnosticWidgetData?.length; j++) {
            const findIndex = widgetsData?.[i]?.diagnosticWidgetData?.findIndex(
              (item: any) => item?.itemId == Number(response?.[i]?.[j]?.itemId)
            );
            if (findIndex !== -1) {
              (newWidgetsData[i].diagnosticWidgetData[findIndex].packageCalculatedMrp =
                response?.[i]?.[j]?.packageCalculatedMrp),
                (newWidgetsData[i].diagnosticWidgetData[findIndex].diagnosticPricing =
                  response?.[i]?.[j]?.diagnosticPricing);
            }
          }
        }
        setWidgetsData(newWidgetsData);
      }
      setLoadingContext?.(false);
    } catch (error) {
      setFrequentlyBroughtShimmer(false);
      CommonBugFender('errorInFetchPricing api__TestDetails', error);
      setLoadingContext?.(false);
    }
  };

  async function getPackageRecommendationsForTest(itemId: string | number) {
    if (!!itemId) {
      setPackageRecommendationsShimmer(true);
      try {
        const getPackageRecommendationsResponse = await getDiagnosticsPackageRecommendations(
          client,
          Number(itemId!),
          Number(cityIdToUse)
        );
        if (getPackageRecommendationsResponse?.data?.getDiagnosticPackageRecommendations) {
          const getResult =
            getPackageRecommendationsResponse?.data?.getDiagnosticPackageRecommendations
              ?.packageRecommendations;
          let packageArray: any = [];
          getResult?.map((item) => {
            packageArray.push({
              ...item,
              itemTitle: item?.itemName,
              inclusionData: item?.diagnosticInclusions,
            });
          });
          setPackageRecommendations(packageArray);
        } else {
          setPackageRecommendations([]);
        }
        setPackageRecommendationsShimmer(false);
      } catch (error) {
        setPackageRecommendations([]);
        setPackageRecommendationsShimmer(false);
        CommonBugFender('TestDetails_getPackageRecommendationsForTest', error);
      }
    } else {
      setPackageRecommendations([]);
      CommonBugFender('TestDetails_getPackageRecommendationsForTest', 'unable to fetch itemId');
    }
  }

  async function fetchReportTat(itemId: string | number) {
    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
    );
    const itemIds = [Number(itemId)];
    const id = cityIdToUse;
    const pincode =
      movedFrom === AppRoutes.CartPage
        ? addresses?.[selectedAddressIndex]?.zipcode!
        : diagnosticLocation?.pincode! || '500030';
    const formattedDate = moment(diagnosticSlot?.date).format('YYYY/MM/DD');
    const dateTimeInUTC = moment(formattedDate + ' ' + diagnosticSlot?.slotStartTime).toISOString();
    try {
      const result = await getReportTAT(
        client,
        !!diagnosticSlot && !isEmptyObject(diagnosticSlot) ? dateTimeInUTC : null,
        id,
        !!pincode ? Number(pincode) : 0,
        itemIds,
        REPORT_TAT_SOURCE.TEST_DETAILS_PAGE
      );
      if (result?.data?.getConfigurableReportTAT) {
        const getMaxReportTat = result?.data?.getConfigurableReportTAT?.preOrderReportTATMessage!;
        setReportTat(getMaxReportTat);
      } else {
        setReportTat('');
      }
    } catch (error) {
      CommonBugFender('fetchReportTat_TestDetails', error);
      setReportTat('');
    }
  }

  async function getFrequentlyBroughtRecommendations(itemId: number | string) {
    if (!!itemId) {
      setFrequentlyBroughtShimmer(true);
      try {
        const recommedationResponse: any = await getDiagnosticCartRecommendations(
          client,
          [Number(itemId)],
          10
        );
        if (recommedationResponse?.data?.getDiagnosticItemRecommendations) {
          const getItems = recommedationResponse?.data?.getDiagnosticItemRecommendations?.itemsData;
          if (getItems?.length > 0) {
            const _itemIds = getItems?.map((item: any) => Number(item?.itemId));
            const alreadyAddedItems = isModify
              ? cartItemsWithId.concat(modifiedOrderItemIds)
              : cartItemsWithId;
            //already added items needs to be hidden
            const _filterItemIds = _itemIds?.filter((val: any) =>
              !!alreadyAddedItems && alreadyAddedItems?.length
                ? !alreadyAddedItems?.includes(val)
                : val
            );
            fetchWidgetPrices(
              _filterItemIds,
              cityIdToUse,
              getWidgetTitle?.frequentlyBrought,
              getItems
            );
          } else {
            fetchTopBookedTests(itemId);
            setFrequentlyBroughtShimmer(false);
            setFrequentlyBroughtRecommendations([]);
          }
        } else {
          fetchTopBookedTests(itemId);
          setFrequentlyBroughtShimmer(false);
          setFrequentlyBroughtRecommendations([]);
        }
      } catch (error) {
        fetchTopBookedTests(itemId);
        setFrequentlyBroughtShimmer(false);
        setFrequentlyBroughtRecommendations([]);
        CommonBugFender('TestDetails_fetchRecommendations', error);
      }
    } else {
      fetchTopBookedTests(itemId);
      setFrequentlyBroughtRecommendations([]);
      CommonBugFender('TestDetails_fetchRecommendations', 'unable to set itemId');
    }
  }

  async function fetchTopBookedTests(itemId: number | string) {
    try {
      const res: any = await getDiagnosticCartItemReportGenDetails(
        String(itemId),
        Number(cityIdToUse)
      );
      if (res?.data?.success) {
        const widgetsData = res?.data?.widget_data?.[0]?.diagnosticWidgetData;
        const _itemIds = widgetsData?.map((item: any) => Number(item?.itemId));
        const alreadyAddedItems = isModify
          ? cartItemsWithId.concat(modifiedOrderItemIds)
          : cartItemsWithId;
        //already added items needs to be hidden
        const _filterItemIds = _itemIds?.filter((val: any) =>
          !!alreadyAddedItems && alreadyAddedItems?.length ? !alreadyAddedItems?.includes(val) : val
        );
        fetchWidgetPrices(_filterItemIds, cityIdToUse, getWidgetTitle?.topBookedTests, widgetsData);
      } else {
        setTopBookedTests([]);
      }
    } catch (error) {
      setTopBookedTests([]);
      CommonBugFender('TestDetails_fetchTopBookedTests', error);
    }
  }

  const homeBreadCrumb: TestBreadcrumbLink = {
    title: 'Home',
    onPress: () => {
      isModify ? showDiscardPopUp() : props.navigation.navigate('TESTS');
    },
  };

  function showDiscardPopUp() {
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
    props.navigation.navigate('TESTS');
  }

  useEffect(() => {
    let breadcrumb: TestBreadcrumbLink[] = [homeBreadCrumb];
    if (!!movedFrom) {
      if (movedFrom == AppRoutes.Tests || movedFrom == AppRoutes.TestDetails) {
      }
      if (movedFrom == AppRoutes.SearchTestScene || movedFrom == AppRoutes.TestListing) {
        breadcrumb.push({
          title: movedFrom == AppRoutes.SearchTestScene ? 'Test Search' : 'Test Listing',
          onPress: () => {
            movedFrom == AppRoutes.SearchTestScene
              ? props.navigation.navigate(AppRoutes.SearchTestScene)
              : props.navigation.navigate(AppRoutes.TestListing);
          },
        });
      }
      if (movedFrom === AppRoutes.CartPage) {
        breadcrumb.push({
          title: 'Cart',
          onPress: () => {
            navigateToScreenWithEmptyStack(props.navigation, AppRoutes.AddPatients);
          },
        });
      }
      breadcrumb.push({
        title: !!itemName ? nameFormater(itemName!, 'title') : itemName,
        onPress: () => {},
      });
      setTestDetailsBreadCrumbs && setTestDetailsBreadCrumbs(breadcrumb);
    }
  }, [movedFrom, itemName]);

  useEffect(() => {
    if (testInfo?.Rate) {
      const itemType = (testInfo?.type! || testDetails?.type)?.toLowerCase();
      const getSource  = isDeep == 'deeplink'
      ? 'Deeplink'
      : movedFrom == AppRoutes.SearchTestScene
      ? source
      : testInfo?.source! || testDetails?.source
      DiagnosticDetailsViewed(
        getSource == undefined ? source : getSource,
        itemName,
        !!itemType && itemType == DIAGNOSTICS_ITEM_TYPE.PACKAGE?.toLowerCase()
          ? DIAGNOSTICS_ITEM_TYPE.PACKAGE
          : DIAGNOSTICS_ITEM_TYPE.TEST,
        testInfo?.ItemID || itemId,
        currentPatient,
        calculatePriceToShow() || testInfo?.Rate || testDetails?.Rate,
        pharmacyCircleAttributes,
        isDiagnosticCircleSubscription,
        originalItemIds,
        movedFrom == AppRoutes.TestDetails
          ? widgetTitle
          : originalItemIds
          ? packageRecommendations > 2
            ? 'Recommendations'
            : 'You can also order'
          : !!widgetTitle
          ? widgetTitle
          : '',
          section,
      );
    }
  }, [testInfo]);

  const renderDescriptionCard = () => {
    const showDescription =
      (!!cmsTestDetails &&
        cmsTestDetails?.diagnosticOverview?.length > 0 &&
        cmsTestDetails?.diagnosticOverview?.[0]?.value) ||
      (!_.isEmpty(testInfo) && testInfo?.testDescription);

    return showDescription ? (
      <TestDetailsAboutCard
        containerStyle={styles.descriptionCardOuterView}
        showDescription={showDescription}
        readMore={readMore}
        onPressReadMore={() => onPressReadMore()}
        inclusionName={cmsTestDetails?.diagnosticInclusionName}
        diagnosticAge={cmsTestDetails?.diagnosticAge}
        diagnosticGender={cmsTestDetails?.diagnosticGender}
        testInfo={testInfo}
      />
    ) : null;
  };

  function onPressReadMore() {
    setReadMore(!readMore);
  }

  const renderItemCard = () => {
    return (
      <TestDetailsItemCard
        containerStyle={styles.descriptionCardOuterView}
        itemName={testDetails?.ItemName || cmsTestDetails?.diagnosticItemName || testInfo?.itemName}
        aliasName={cmsTestDetails?.diagnosticItemAliases}
        reportTat={reportTat}
        diagnosticReportCustomerText={cmsTestDetails?.diagnosticReportCustomerText}
        diagnosticReportGenerationTime={cmsTestDetails?.diagnosticReportGenerationTime}
        pretestingRequirement={cmsTestDetails?.diagnosticPretestingRequirement}
        slashedPrice={
          !!testInfo?.packageMrp && testInfo?.packageMrp > testInfo?.Rate
            ? testInfo?.packageMrp
            : testInfo?.Rate
        }
        priceToShow={calculatePriceToShow()}
        setPriceLayoutPosition={(layout, event, ref) => _setPriceLayoutPosition(layout, event, ref)}
        testInfo={testInfo}
        isCircleSubscribed={isDiagnosticCircleSubscription}
      />
    );
  };

  function _setPriceLayoutPosition(layout: any, event: any, ref: any) {
    setPriceHeight(layout?.height);
    setPriceViewRef(ref);
  }

  function calculatePriceToShow() {
    //1. circle sub + promote circle -> circleSpecialPrice
    //2. circle sub + discount -> dicount Price
    //3. circle sub + none -> special price | price
    //4. non-circle + promote circle -> special price | price
    //5. non-circle + promte disocunt -> discount price
    //6. non-circle + none -> special price | price

    let priceToShow;
    if (isDiagnosticCircleSubscription) {
      if (testInfo?.promoteCircle) {
        priceToShow = testInfo?.circleSpecialPrice;
      } else if (testInfo?.promoteDiscount) {
        priceToShow = testInfo?.discountSpecialPrice;
      } else {
        priceToShow = testInfo?.specialPrice || testInfo?.Rate;
      }
    } else {
      if (testInfo?.promoteDiscount) {
        priceToShow = testInfo?.discountSpecialPrice;
      } else {
        priceToShow = testInfo?.specialPrice || testInfo?.Rate;
      }
    }
    return priceToShow;
  }

  const renderPriceView = () => {
    const slashedPrice =
      !!testInfo?.packageMrp && testInfo?.packageMrp > testInfo?.Rate
        ? testInfo?.packageMrp
        : testInfo?.Rate;
    const priceToShow = calculatePriceToShow();
    return (
      <View>
        <TestDetailsPriceView
          testInfo={testInfo}
          isCircleSubscribed={isDiagnosticCircleSubscription}
          slashedPrice={slashedPrice}
          priceToShow={priceToShow}
          isTop={false}
        />
      </View>
    );
  };

  function expandParameter(index: number) {
    const expandedArray = parameterExpandedArray?.concat(index);
    setParameterExpandedArray(expandedArray);
  }

  function collapseParameter(index: number) {
    const removeItem = parameterExpandedArray?.filter((id: number) => id !== index);
    setParameterExpandedArray(removeItem);
  }

  function onPressInclusion(item: any, index: number) {
    const isAlreadyPresent = parameterExpandedArray?.filter((val: number) => val == index);
    isAlreadyPresent?.length > 0 ? collapseParameter(index) : expandParameter(index);
  }

  const renderInclusionsView = () => {
    const {
      isInclusionPrsent,
      nonInclusionParamters,
      getMandatoryParameterCount,
      inclusions,
    } = skuParameterInclusionLogic();
    return isInclusionPrsent ? (
      <TestDetailsInclusionsCard
        containerStyle={styles.descriptionCardOuterView}
        getMandatoryParameterCount={getMandatoryParameterCount}
        nonInclusionParamters={nonInclusionParamters}
        diagnosticInclusionName={cmsTestDetails?.diagnosticInclusionName}
        inclusions={inclusions}
        onPressInclusion={(item, index) => onPressInclusion(item, index)}
        parameterExpandedArray={parameterExpandedArray}
      />
    ) : null;
  };

  const renderBreadCrumb = () => {
    return (
      <View style={{ marginLeft: 20 }}>
        <Breadcrumb links={testDetailsBreadCrumbs!} containerStyle={styles.breadCrumbContainer} />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <TestListingHeader
        navigation={props.navigation}
        headerText={nameFormater(
          !!modifiedOrder && !isEmptyObject(modifiedOrder) ? 'MODIFY ORDER' : 'TEST PACKAGE DETAIL',
          'upper'
        )}
        movedFrom={'testDetails'}
      />
    );
  };

  const renderFAQView = () => {
    return (
      <View
        onLayout={(event) => {
          const layout = event?.nativeEvent?.layout;
          setFaqVerticalPosition(layout?.y);
        }}
      >
        <FAQComponent
          faqIcon={<OrangeFAQIcon style={styles.faqIcon} />}
          headingText={string.diagnosticsDetails.frequentlyAsked}
          headingStyle={styles.faqHeadingText}
          headerSeparatorStyle={{ marginVertical: 10 }}
          containerStyle={{ marginLeft: 20, marginRight: 25 }}
          data={cmsTestDetails?.diagnosticFAQs}
          horizontalLine={styles.faqLine}
          questionStyle={styles.questionsStyle}
          answerStyle={styles.faqAnswer}
          source={'diagnostics'}
        />
      </View>
    );
  };

  const renderWidgetsView = () => {
    const sortWidgets =
      !!widgetsData &&
      widgetsData?.length > 0 &&
      widgetsData?.sort(
        (a: any, b: any) =>
          Number(a.diagnosticwidgetsRankOrder) - Number(b.diagnosticwidgetsRankOrder)
      );

    return !!sortWidgets && sortWidgets.map((item: any) => renderWidgets(item));
  };

  const renderWidgets = (data: any) => {
    if (data?.diagnosticWidgetType == 'Package') {
      return renderPackageWidget(data);
    } else {
      return renderTestWidgets(data);
    }
  };

  const renderPackageWidget = (data: any) => {
    const isPricesAvailable =
      !!data &&
      data?.diagnosticWidgetData?.length > 0 &&
      data?.diagnosticWidgetData?.find((item: any) => item?.diagnosticPricing);
    return (
      <View>
        {isPricesAvailable ? (
          <>
            <SectionHeader
              leftText={nameFormater(data?.diagnosticWidgetTitle, 'title')}
              leftTextStyle={styles.widgetHeading}
            />

            <PackageCard
              data={data}
              diagnosticWidgetData={data?.diagnosticWidgetData}
              isCircleSubscribed={isDiagnosticCircleSubscription}
              isServiceable={isDiagnosticLocationServiceable}
              isVertical={false}
              navigation={props.navigation}
              source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.DETAILS}
              sourceScreen={AppRoutes.TestDetails}
              widgetHeading={data?.diagnosticWidgetTitle}
            />
          </>
        ) : null}
      </View>
    );
  };

  const renderTestWidgets = (data: any) => {
    const isPricesAvailable =
      !!data &&
      data?.diagnosticWidgetData?.length > 0 &&
      data?.diagnosticWidgetData?.find((item: any) => item?.diagnosticPricing);

    return (
      <View>
        {!!isPricesAvailable ? (
          <>
            <SectionHeader
              leftText={nameFormater(data?.diagnosticWidgetTitle, 'title')}
              leftTextStyle={styles.widgetHeading}
            />

            <ItemCard
              data={data}
              diagnosticWidgetData={data?.diagnosticWidgetData}
              isCircleSubscribed={isDiagnosticCircleSubscription}
              isServiceable={isDiagnosticLocationServiceable}
              isVertical={false}
              isPriceAvailable={isPricesAvailable}
              navigation={props.navigation}
              source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.DETAILS}
              sourceScreen={AppRoutes.TestDetails}
              widgetHeading={data?.diagnosticWidgetTitle}
            />
          </>
        ) : null}
      </View>
    );
  };

  function onPressAddToCart() {
    const { getMandatoryParameterCount, nonInclusionParamters } = skuParameterInclusionLogic();
    const specialPrice = testInfo?.specialPrice!;
    const price = testInfo?.Rate!;
    const circlePrice = testInfo?.circlePrice! || testInfo?.circleRate!;
    const circleSpecialPrice = testInfo?.circleSpecialPrice!;
    const discountPrice = testInfo?.discountPrice!;
    const discountSpecialPrice = testInfo?.discountSpecialPrice!;
    const mrpToDisplay = testInfo?.mrpToDisplay;

    const testInclusions =
      testInfo?.inclusions == null
        ? [Number(itemId)]
        : testInfo?.inclusions?.length > 0
        ? testInfo?.inclusions
        : [Number(testInfo?.inclusions)];
    const priceToShow = calculatePriceToShow();
    DiagnosticAddToCartEvent(
      cmsTestDetails?.diagnosticItemName || testInfo?.itemName,
      itemId!,
      mrpToDisplay, //mrp
      priceToShow, //actual price
      section == string.common.homePageItem
        ? DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME
        : DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.DETAILS,
      testInclusions?.length < 2 ? DIAGNOSTICS_ITEM_TYPE.TEST : DIAGNOSTICS_ITEM_TYPE.PACKAGE,
      section == string.common.homePageItem ? section : '',
      currentPatient,
      isDiagnosticCircleSubscription,
      originalItemIds
    );

    const addedItems = createDiagnosticAddToCartObject(
      Number(itemId),
      cmsTestDetails?.diagnosticItemName || testInfo?.ItemName,
      testInfo?.Gender,
      price,
      specialPrice! | price,
      circlePrice,
      circleSpecialPrice,
      discountPrice,
      discountSpecialPrice,
      TEST_COLLECTION_TYPE.HC,
      testInfo?.promoteCircle
        ? DIAGNOSTIC_GROUP_PLAN.CIRCLE
        : testInfo?.promoteDiscount
        ? DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
        : DIAGNOSTIC_GROUP_PLAN.ALL,
      Number(testInfo?.packageMrp!),
      testInclusions,
      AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
      cmsTestDetails?.diagnosticItemImageUrl,
      getMandatoryParameterCount + nonInclusionParamters?.length
    );

    isModify &&
      setModifiedPatientCart?.([
        {
          patientId: modifiedOrder?.patientId,
          cartItems: cartItems?.concat(addedItems),
        },
      ]);
    addCartItem?.(addedItems);

    if (movedFrom === AppRoutes.CartPage && changeCTA) {
      isModify
        ? props.navigation.navigate(AppRoutes.CartPage, {
            orderDetails: modifiedOrder,
          })
        : props.navigation.navigate(AppRoutes.AddPatients);
    }
  }

  const renderExpressSlots = () => {
    return diagnosticServiceabilityData && diagnosticLocation ? (
      <ExpressSlotMessageRibbon
        serviceabilityObject={diagnosticServiceabilityData}
        selectedAddress={diagnosticLocation}
      />
    ) : null;
  };

  const renderCallToOrder = () => {
    return ctaDetailMatched?.length ? (
      <CallToOrderView
        cityId={cityIdToUse}
        customMargin={90}
        slideCallToOrder={slideCallToOrder}
        onPressSmallView={() => {
          setSlideCallToOrder(false);
        }}
        onPressCross={() => {
          setSlideCallToOrder(true);
        }}
        pageId={CALL_TO_ORDER_CTA_PAGE_ID.TESTDETAIL}
        itemId={itemId}
        itemName={itemName}
      />
    ) : null;
  };

  const renderFrequentlyBrought = () => {
    const widgetTitle =
      frequentlyBroughtRecommendations?.length > 0
        ? getWidgetTitle?.frequentlyBrought
        : getWidgetTitle?.topBookedTests;
    const dataToShow =
      frequentlyBroughtRecommendations?.length > 0
        ? frequentlyBroughtRecommendations
        : topBookedTests;

    const inclusionIdArray: any[] = [];
    const dataToRender = dataToShow?.filter((item: any) => {
      if (item?.itemId != itemId || !inclusionIdArray?.includes(item?.itemId)) {
        return item;
      }
    });
    return (
      <>
        {frequentlyBroughtShimmer ? (
          renderDiagnosticWidgetTestShimmer(true)
        ) : (
          <View
            onLayout={(event) => {
              const layout = event?.nativeEvent?.layout;
              setFrequentlyBroughtVerticalPosition(layout?.y);
            }}
            style={{ marginTop: 10 }}
          >
            <SectionHeader
              leftImage={<OrangeCartIcon style={styles.widgetHeadingIcon} />}
              leftText={widgetTitle}
              leftTextStyle={[styles.itemNameText, { marginHorizontal: 8 }]}
              style={styles.widgetHeadingStyle}
            />
            {renderFullWidthItemCard(dataToRender)}
          </View>
        )}
      </>
    );
  };

  const renderFullWidthItemCard = (dataToRender: any) => {
    const filterToFourItems = dataToRender?.length > 4 ? dataToRender?.slice(0, 4) : dataToRender;
    return (
      <FullWidthItemCard
        diagnosticWidgetData={filterToFourItems}
        onPressRemoveItemFromCart={(item) => {}}
        data={filterToFourItems}
        isCircleSubscribed={isDiagnosticCircleSubscription}
        isServiceable={true}
        isVertical={true}
        columns={1}
        navigation={props.navigation}
        source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.DETAILS}
        sourceScreen={AppRoutes.TestDetails}
        changeCTA={true}
        widgetHeading={widgetTitle}
      />
    );
  };

  const renderPackageRecommendations = () => {
    const heading = `${getWidgetTitle?.relatedPackages}`;
    return (
      <>
        {packageRecommendationsShimmer ? (
          renderDiagnosticWidgetTestShimmer(true)
        ) : (
          <View
            style={{ marginTop: 10 }}
            onLayout={(event) => {
              const layout = event?.nativeEvent?.layout;
              setRelatedPackagesVerticalPosition(layout?.y);
            }}
          >
            <SectionHeader
              leftImage={<RelatedPackageIcon style={styles.widgetHeadingIcon} />}
              leftText={heading}
              leftTextStyle={[styles.itemNameText, { marginHorizontal: 8 }]}
              style={styles.widgetHeadingStyle}
            />
            {renderRecommendedPackages(heading)}
          </View>
        )}
      </>
    );
  };

  const renderRecommendedPackages = (heading: string) => {
    const filterTopFourRecommendation =
      !!packageRecommendations &&
      (packageRecommendations?.length > 4
        ? packageRecommendations?.slice(0, 4)
        : packageRecommendations);
    return (
      <ItemCard
        diagnosticWidgetData={filterTopFourRecommendation}
        data={filterTopFourRecommendation}
        isCircleSubscribed={isDiagnosticCircleSubscription}
        isServiceable={true}
        isVertical={true}
        columns={2}
        navigation={props.navigation}
        source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.DETAILS}
        sourceScreen={AppRoutes.TestDetails}
        widgetHeading={heading}
        isPackage={true}
      />
    );
  };

  function onPressHorizontalIcon(item: any) {
    const title = item?.title;
    switch (title) {
      case string.diagnosticsDetails.relatedPackages:
        scrollToYPosition(relatedPackagesVerticalPosition);
        break;
      case string.diagnosticsDetails.frequentlyBooked:
        scrollToYPosition(frequentlyBroughtVerticalPosition);
        break;
      case string.diagnosticsDetails.frequentlyAskedQuestions:
        scrollToYPosition(faqVerticalPosition);
        break;
    }
  }

  function scrollToYPosition(val: number) {
    scrollViewRef?.current?.scrollTo({
      x: 0,
      y: val - 10,
      animated: true,
    });
  }

  const renderHorizontalItem = (item: any) => {
    return (
      <TouchableOpacity
        style={styles.horizontalItemTouch}
        onPress={() => onPressHorizontalIcon(item)}
      >
        {item?.icon}
        <Text style={styles.horizontalItemTitle}>{item?.title}</Text>
      </TouchableOpacity>
    );
  };

  const renderHorizontalOptions = () => {
    return (
      <View style={styles.horizontalOptionsView}>
        {horizontalComponentOptions?.map((item: any) => {
          return renderHorizontalItem(item);
        })}
      </View>
    );
  };

  const renderSkuContent = () => {
    return (
      <>
        {loading
          ? renderDiagnosticTestDetailShimmer()
          : !_.isEmpty(testInfo) && !!cmsTestDetails && renderItemCard()}
        {loading ? renderDiagnosticTestDetailShimmer() : renderDescriptionCard()}
        {loading
          ? renderTestDetailHorizontalOptionShimmer(horizontalComponentOptions)
          : horizontalComponentOptions?.length > 1
          ? renderHorizontalOptions()
          : null}
        {loading ? renderDiagnosticTestDetailShimmer() : renderInclusionsView()}
        {loading
          ? renderDiagnosticTestDetailShimmer()
          : !!cmsTestDetails?.diagnosticWidgetsData &&
            cmsTestDetails?.diagnosticWidgetsData?.length > 0
          ? renderWidgetsView()
          : null}
        {/**packages for single test */}
        {loading
          ? renderTestDetailHorizontalOptionShimmer(Array(2))
          : !!packageRecommendations &&
            packageRecommendations?.length > 0 &&
            renderPackageRecommendations()}
        {/** frequently brought together */}
        {(frequentlyBroughtRecommendations?.length > 0 || topBookedTests?.length > 0) &&
          renderFrequentlyBrought()}
        {loading
          ? renderTestDetailFaqShimmer()
          : !!cmsTestDetails?.diagnosticFAQs && cmsTestDetails?.diagnosticFAQs?.length > 0
          ? renderFAQView()
          : null}
      </>
    );
  };

  const renderButton = () => {
    return (
      <Button
        title={
          isAlreadyPartOfOrder
            ? string.diagnostics.alreadyAdded
            : movedFrom === AppRoutes.CartPage && changeCTA
            ? string.diagnostics.addAndProceed
            : isAddedToCart
            ? string.diagnostics.proceedToCartCTA
            : string.circleDoctors.addToCart
        }
        onPress={() =>
          isAlreadyPartOfOrder
            ? props.navigation.navigate(AppRoutes.CartPage, {
                orderDetails: modifiedOrder,
              })
            : movedFrom === AppRoutes.CartPage && changeCTA
            ? onPressAddToCart()
            : isAddedToCart
            ? isModify
              ? props.navigation.navigate(AppRoutes.CartPage, {
                  orderDetails: modifiedOrder,
                })
              : props.navigation.navigate(AppRoutes.AddPatients)
            : onPressAddToCart()
        }
        style={showBottomBar ? { width: '70%' } : {}}
      />
    );
  };

  return (
    <SafeAreaView style={styles.containerStyle}>
      {!errorState ? (
        <>
          {renderHeader()}
          {renderExpressSlots()}
          {renderBreadCrumb()}
          <ScrollView
            bounces={false}
            keyboardDismissMode="on-drag"
            style={{ marginBottom: Platform.OS == 'android' ? 70 : 60 }}
            ref={scrollViewRef}
            scrollEventThrottle={16}
            onScroll={(event) => {
              setSlideCallToOrder(true);
              // show price if price is scrolled off the screen
              priceViewRef?.current &&
                priceViewRef?.current?.measure(
                  (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                    setShowBottomBar(pagey - screenHeight / divisionFactor < priceHeight);
                  }
                );
            }}
          >
            {renderSkuContent()}
          </ScrollView>
          {renderCallToOrder()}
          <StickyBottomComponent>
            {showBottomBar && renderPriceView()}
            {renderButton()}
          </StickyBottomComponent>
        </>
      ) : (
        <>
          {renderHeader()}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Card
              cardContainer={{ marginTop: 0 }}
              heading={string.common.uhOh}
              description={'Test Details are not Available!'}
              descriptionTextStyle={{ fontSize: 14 }}
              headingTextStyle={{ fontSize: 14 }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.container,
    backgroundColor: colors.WHITE,
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: theme.colors.WHITE,
    height: 'auto',
    paddingHorizontal: 20,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  descriptionCardOuterView: {
    flex: 1,
    ...theme.viewStyles.card(16, 4, 10, colors.WHITE, 10),
    padding: 16,
    elevation: 10,
    margin: 16,
  },
  itemNameText: {
    ...theme.viewStyles.text('SB', 16, theme.colors.SHERPA_BLUE, 1, 21),
    textAlign: 'left',
  },
  inclusionsView: { width: '100%' },
  breadCrumbContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  faqHeadingText: {
    ...theme.viewStyles.text('SB', 16, '#02475B', 1, 20, 0.35),
    marginHorizontal: 16,
  },
  widgetHeading: {
    ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
  },
  faqLine: {
    marginVertical: 8,
    borderTopColor: colors.SHERPA_BLUE,
    opacity: 0.1,
    borderTopWidth: 1,
    marginLeft: -16,
    width: screenWidth - 42,
  },
  detailsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  faqIcon: { height: 13, width: 12, resizeMode: 'contain', tintColor: colors.SHERPA_BLUE },
  questionsStyle: {
    ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 18),
    width: '80%',
  },
  horizontalComponentIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  horizontalOptionsView: {
    flexDirection: 'row',
    marginLeft: 16,
    width: screenWidth - 16,
    justifyContent: 'space-around',
    marginTop: 10,
  },
  horizontalItemTouch: {
    width: screenWidth / 4,
    alignItems: 'center',
    marginRight: 10,
    padding: 4,
  },
  horizontalItemTitle: {
    ...theme.viewStyles.text('SB', 12, colors.APP_YELLOW, 1, 16, 0.25),
    textAlign: 'center',
  },
  widgetHeadingIcon: {
    tintColor: colors.SHERPA_BLUE,
    height: 18,
    width: 18,
    resizeMode: 'contain',
  },
  widgetHeadingStyle: {
    borderBottomWidth: 0,
    borderColor: 'transparent',
    justifyContent: 'flex-start',
  },
  faqAnswer: {
    ...theme.viewStyles.text('L', 12, '#01475B', 1, 16, 0.35),
    marginVertical: 8,
  },
});
