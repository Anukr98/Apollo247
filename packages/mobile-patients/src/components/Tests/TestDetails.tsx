import {
  TestBreadcrumbLink,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CircleLogo,
  ClockIcon,
  InfoIconRed,
  PendingIcon,
  WhyBookUs,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';

import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticTestDetails,
  TestPackage,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import stripHtml from 'string-strip-html';
import {
  aphConsole,
  g,
  nameFormater,
  isSmallDevice,
  filterHtmlContent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
} from '@aph/mobile-patients/src/graphql/profiles';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import { AppConfig, COVID_NOTIFICATION_ITEMID } from '@aph/mobile-patients/src/strings/AppConfig';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { CircleHeading } from '@aph/mobile-patients/src/components/ui/CircleHeading';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import {
  calculatePackageDiscounts,
  getPricesForItem,
  sourceHeaders,
  convertNumberToDecimal,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import {
  DiagnosticAddToCartEvent,
  DiagnosticDetailsViewed,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { TestListingHeader } from '@aph/mobile-patients/src/components/Tests/components/TestListingHeader';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { FAQComponent } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/FAQComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { PackageCard } from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
import { ItemCard } from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import {
  findDiagnosticsWidgetsPricing,
  findDiagnosticsWidgetsPricingVariables,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsWidgetsPricing';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import HTML from 'react-native-render-html';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export interface TestPackageForDetails extends TestPackage {
  collectionType: TEST_COLLECTION_TYPE;
  preparation: string;
  source: 'Home Page' | 'Full Search' | 'Cart Page' | 'Partial Search';
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
  diagnosticItemName: string;
  diagnosticFAQs: any;
  diagnosticItemImageUrl: string;
  diagnosticUrlAlias: string;
  diagnosticGender: string;
  diagnosticAge: string;
  diagnosticReportGenerationTime: string;
  diagnosticPretestingRequirement: string;
  diagnosticOverview: any;
  diagnosticInclusionName: any;
  diagnosticWidgetsData: any;
}

export interface TestDetailsProps
  extends NavigationScreenProps<{
    testDetails?: TestPackageForDetails;
    itemId?: string;
    source?: string;
    comingFrom?: string;
    itemName?: string;
  }> {}

export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    isDiagnosticCircleSubscription,
    setIsDiagnosticCircleSubscription,
    testDetailsBreadCrumbs,
    setTestDetailsBreadCrumbs,
    deliveryAddressId: diagnosticDeliveryAddressId,
  } = useDiagnosticsCart();
  const {
    setIsCircleSubscription,
    setHdfcSubscriptionId,
    setCircleSubscriptionId,
    setHdfcPlanName,
    setIsFreeDelivery,
    setCirclePlanValidity,
    pharmacyCircleAttributes,
    deliveryAddressId,
  } = useShoppingCart();

  const { diagnosticServiceabilityData, isDiagnosticLocationServiceable } = useAppCommonData();

  const testDetails = props.navigation.getParam('testDetails', {} as TestPackageForDetails);
  const testName = props.navigation.getParam('itemName');
  const { setLoading: setLoadingContext } = useUIElements();

  const movedFrom = props.navigation.getParam('comingFrom');
  const itemId =
    movedFrom == AppRoutes.TestsCart ? testDetails?.ItemID : props.navigation.getParam('itemId');
  const source = props.navigation.getParam('source');

  const [cmsTestDetails, setCmsTestDetails] = useState((([] as unknown) as CMSTestDetails) || []);
  const [testInfo, setTestInfo] = useState(movedFrom == 'TestsCart' ? testDetails : ({} as any));
  const [moreInclusions, setMoreInclusions] = useState(false);
  const [readMore, setReadMore] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [widgetsData, setWidgetsData] = useState([] as any);

  const itemName =
    testDetails?.ItemName ||
    testName ||
    cmsTestDetails?.diagnosticItemName ||
    testInfo?.ItemName ||
    '';

  const hdfc_values = string.Hdfc_values;
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

  const isAddedToCart = !!cartItems?.find((item) => item.id == testInfo?.ItemID);
  const scrollViewRef = React.useRef<ScrollView | null>(null);

  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsWidgetsPricing, findDiagnosticsWidgetsPricingVariables>({
      query: GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
      context: {
        sourceHeaders,
      },
      variables: {
        cityID: Number(cityId) || 9,
        itemIDs: listOfId,
      },
      fetchPolicy: 'no-cache',
    });

  /**
   * fetching the details wrt itemId
   */
  useEffect(() => {
    if (itemId) {
      fetchTestDetails_CMS(itemId);
      loadTestDetails(itemId);
    } else {
      setErrorState(true);
    }
  }, [itemId]);

  const fetchTestDetails_CMS = async (itemId: string | number) => {
    setLoadingContext?.(true);
    const res: any = await getDiagnosticTestDetails('diagnostic-details', Number(itemId));
    if (res?.data?.success) {
      const result = g(res, 'data', 'data');
      setCmsTestDetails(result);
      setLoadingContext?.(false);

      !!result?.diagnosticWidgetsData &&
        result?.diagnosticWidgetsData?.length > 0 &&
        fetchWidgetPrices(result?.diagnosticWidgetsData, diagnosticServiceabilityData?.cityId!);
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
      } = await client.query<
        findDiagnosticsByItemIDsAndCityID,
        findDiagnosticsByItemIDsAndCityIDVariables
      >({
        query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
        context: {
          sourceHeaders,
        },
        variables: {
          cityID: parseInt(diagnosticServiceabilityData?.cityId!) || 9,
          itemIDs: listOfIds,
        },
        fetchPolicy: 'no-cache',
      });
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
      } = g(findDiagnosticsByItemIDsAndCityID, 'diagnostics', '0' as any)!;

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
      };

      setTestInfo({ ...(partialTestDetails || []) });
    } catch (error) {
      console.log({ error });
      setErrorState(true);
    } finally {
      setLoadingContext?.(false);
    }
  };

  const fetchWidgetPrices = async (widgetsData: any, cityId: string) => {
    const itemIds = widgetsData?.map((item: any) =>
      item?.diagnosticWidgetData?.map((data: any, index: number) => Number(data?.itemId))
    );
    //restriction less than 12.
    const res = Promise.all(
      itemIds?.map((item: any) =>
        fetchPricesForCityId(Number(cityId!) || 9, item?.length > 12 ? item?.slice(0, 12) : item)
      )
    );

    const response = (await res)?.map((item: any) =>
      g(item, 'data', 'findDiagnosticsWidgetsPricing', 'diagnostics')
    );
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
    setLoadingContext?.(false);
  };

  const homeBreadCrumb: TestBreadcrumbLink = {
    title: 'Home',
    onPress: () => {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      });
      props.navigation.dispatch(resetAction);
    },
  };

  const scrollToTop = () => {
    setTimeout(() => {
      scrollViewRef?.current && scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }, 0);
  };

  useEffect(() => {
    let breadcrumb: TestBreadcrumbLink[] = [homeBreadCrumb];
    if (!!movedFrom) {
      scrollToTop();

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
      if (movedFrom === AppRoutes.TestsCart) {
        breadcrumb.push({
          title: 'Cart',
          onPress: () => {
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.TestsCart })],
            });
            props.navigation.dispatch(resetAction);
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
    DiagnosticDetailsViewed(
      testInfo?.source,
      testInfo?.ItemName,
      testInfo?.type,
      testInfo?.ItemID,
      currentPatient,
      testInfo?.Rate,
      pharmacyCircleAttributes
    );
  }, []);

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        context: {
          sourceHeaders,
        },
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      if (data) {
        if (data?.APOLLO?.[0]._id) {
          setCircleSubscriptionId && setCircleSubscriptionId(data?.APOLLO?.[0]._id);
          setIsCircleSubscription && setIsCircleSubscription(true);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(true);
          const planValidity = {
            startDate: data?.APOLLO?.[0]?.start_date,
            endDate: data?.APOLLO?.[0]?.end_date,
          };
          setCirclePlanValidity && setCirclePlanValidity(planValidity);
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
      CommonBugFender('Diagnositic_DetailsPage_GetSubscriptionsOfUserByStatus', error);
    }
  };

  function createSampleType(data: any) {
    const array = data?.map(
      (item: CMSTestInclusions) => nameFormater(item?.sampleTypeName),
      'title'
    );
    const sampleTypeArray = [...new Set(array)];
    return sampleTypeArray;
  }

  const renderNotification = () => {
    if (!COVID_NOTIFICATION_ITEMID.includes(testInfo.ItemID)) {
      return null;
    }
    return (
      <View style={styles.notificationCard}>
        <PendingIcon style={styles.pendingIconStyle} />
        <Text style={[styles.personDetailStyles, { marginTop: 0, marginLeft: 4, marginRight: 6 }]}>
          {string.diagnostics.priceNotificationForCovidText}
        </Text>
      </View>
    );
  };

  const renderDescriptionCard = () => {
    const sampleType =
      !!cmsTestDetails && cmsTestDetails?.diagnosticInclusionName?.length > 0
        ? createSampleType(cmsTestDetails?.diagnosticInclusionName)
        : [];
    const sampleString = sampleType?.length > 0 ? sampleType?.join(', ') : false;
    const showAge = (!!cmsTestDetails && cmsTestDetails?.diagnosticAge) || 'For all age group';
    const showGender =
      (!!cmsTestDetails && cmsTestDetails?.diagnosticGender) ||
      (!!testInfo && `FOR ${gender?.[testInfo?.Gender]}`) ||
      'Both';
    const showDescription =
      (!!cmsTestDetails &&
        cmsTestDetails?.diagnosticOverview?.length > 0 &&
        cmsTestDetails?.diagnosticOverview?.[0]?.value) ||
      (!!testInfo && testInfo?.testDescription);
    return (
      <>
        {sampleType || showAge || showGender || showDescription ? (
          <View style={styles.descriptionCardOuterView}>
            {/**
             * if package then package otherwise, test.
             * age if not coming from cms -> db
             * gender if not coming from cms -> db
             * sample type cms -> db
             */}
            <Text style={styles.packageDescriptionHeading}>Package Description</Text>
            {!!sampleString ? renderDetails('Sample type', sampleString) : null}
            {!!showGender ? renderDetails('Gender', nameFormater(showGender, 'title')) : null}
            {!!showAge ? renderDetails('Age group', showAge) : null}
            {!!showDescription ? renderDescription(showDescription) : null}
          </View>
        ) : null}
      </>
    );
  };

  const renderDetails = (key: string, value: string) => {
    return (
      <View style={{ flexDirection: 'row', marginTop: 5, width: '90%' }}>
        <Text style={styles.packageDescriptionText}>{key} : </Text>
        <Text
          style={[
            styles.packageDescriptionText,
            {
              width: '83%',
            },
          ]}
        >
          {value}
        </Text>
      </View>
    );
  };

  function onPressReadMore() {
    setReadMore(!readMore);
  }

  function filterDiagnosticHTMLContent(content: string = '') {
    return content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;rn/g, '>')
      .replace(/&gt;r/g, '>')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, '\n')
      .replace(/\.t/g, '.');
  }

  const renderDescription = (showDescription: string) => {
    const formattedText = filterDiagnosticHTMLContent(showDescription);
    return (
      <>
        <View style={[styles.overViewContainer, { width: readMore ? '85%' : '100%' }]}>
          {readMore ? (
            <Text style={styles.packageDescriptionText} numberOfLines={2}>
              {stripHtml(showDescription)}
            </Text>
          ) : (
            <HTML html={formattedText} baseFontStyle={styles.packageDescriptionText} />
          )}
        </View>
        <TouchableOpacity
          onPress={() => onPressReadMore()}
          activeOpacity={1}
          style={styles.readMoreTouch}
        >
          <Text style={styles.readMoreText}> {!readMore ? 'READ LESS' : 'READ MORE'}</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderWhyBookUs = () => {
    return (
      <View>
        <WhyBookUs style={{ height: screenWidth / 5, width: screenWidth, resizeMode: 'cover' }} />
      </View>
    );
  };
  const renderItemCard = () => {
    return (
      <View style={styles.descriptionCardOuterView}>
        {renderCardTopView()}
        {renderCardMidView()}
        {renderCardBottomView()}
        {renderPriceView()}
      </View>
    );
  };

  const renderPriceView = () => {
    //if coming from anywhere other than cart page
    //check other conidtions
    const slashedPrice =
      !!testInfo?.packageMrp && testInfo?.packageMrp > testInfo?.Rate
        ? testInfo?.packageMrp
        : testInfo?.Rate;

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
    return (
      <View style={{}}>
        {renderSeparator()}
        <View style={{ marginTop: '2%' }}>
          {renderSlashedView(slashedPrice, priceToShow)}
          {!!testInfo && renderMainPriceView(priceToShow)}
        </View>
      </View>
    );
  };

  const renderSlashedView = (slashedPrice: number, priceToShow: number) => {
    return (
      <View>
        {(!isDiagnosticCircleSubscription &&
          testInfo?.promoteCircle &&
          priceToShow == slashedPrice) ||
        priceToShow == slashedPrice ? null : (
          <Text style={styles.slashedPriceText}>
            {string.common.Rs} {convertNumberToDecimal(slashedPrice)}
          </Text>
        )}
      </View>
    );
  };

  const renderMainPriceView = (priceToShow: number) => {
    return (
      <View style={styles.flexRowView}>
        {!!priceToShow && (
          <Text style={styles.mainPriceText}>
            {string.common.Rs} {convertNumberToDecimal(priceToShow)}
          </Text>
        )}
        {renderDiscountView()}
      </View>
    );
  };

  const renderDiscountView = () => {
    const circleSpecialPrice = testInfo?.circleSpecialPrice!;
    const circleDiscountSaving = testInfo?.circleDiscountDiffPrice;
    const specialDiscountSaving = testInfo?.specialDiscountDiffPrice;
    const groupPlan = testInfo?.groupPlan?.groupPlan;

    return (
      <View>
        {isDiagnosticCircleSubscription &&
        circleDiscountSaving > 0 &&
        !testInfo?.promoteDiscount &&
        groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={styles.rowStyle}>
            <CircleLogo style={styles.circleLogoIcon} />
            {renderSavingView(
              'Savings',
              circleDiscountSaving,
              { marginHorizontal: '1%' },
              styles.savingsText
            )}
          </View>
        ) : testInfo?.promoteDiscount &&
          specialDiscountSaving > 0 &&
          !testInfo?.promoteCircle &&
          groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={styles.rowStyle}>
            <SpecialDiscountText isImage={true} text={'TEST 247'} />
            {renderSavingView(
              'Savings',
              specialDiscountSaving,
              { marginHorizontal: '1%' },
              styles.savingsText
            )}
          </View>
        ) : circleDiscountSaving > 0 && groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={[styles.rowStyle, { alignSelf: 'flex-end' }]}>
            <CircleHeading isSubscribed={false} />
            {renderSavingView(
              '',
              circleSpecialPrice,
              {
                marginHorizontal: '1%',
              },
              styles.savingsText
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const renderSavingView = (
    text: string,
    price: number | string,
    mainViewStyle: any,
    textStyle: any
  ) => {
    return (
      <View style={mainViewStyle}>
        <Text style={textStyle}>
          {text} {string.common.Rs} {convertNumberToDecimal(price)}
        </Text>
      </View>
    );
  };

  /**
   * if not by drupal then show from local db.
   */
  const renderCardMidView = () => {
    return (
      <>
        {!!cmsTestDetails?.diagnosticReportGenerationTime ? (
          <>
            {renderSeparator()}
            <View style={styles.midCardView}>
              <ClockIcon style={styles.clockIconStyle} />

              <View style={styles.midCardTextView}>
                <Text style={styles.reportTimeText}>Report generation Time</Text>
                <Text style={styles.reportTime}>
                  {cmsTestDetails?.diagnosticReportGenerationTime}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </>
    );
  };

  /**
   * if not by drupal then show from local db.
   */
  const renderCardBottomView = () => {
    return (
      <>
        {!!cmsTestDetails?.diagnosticPretestingRequirement ? (
          <>
            {renderSeparator()}
            <View style={styles.bottomCardView}>
              <InfoIconRed style={styles.infoIconStyle} />
              <Text style={styles.preTestingText}>
                {cmsTestDetails?.diagnosticPretestingRequirement}
              </Text>
            </View>
          </>
        ) : null}
      </>
    );
  };

  const renderSeparator = () => {
    return <Spearator />;
  };

  const renderCardTopView = () => {
    const isInclusionPrsent =
      !!cmsTestDetails?.diagnosticInclusionName &&
      cmsTestDetails?.diagnosticInclusionName?.length > 0;
    const inclusions = isInclusionPrsent && cmsTestDetails?.diagnosticInclusionName;

    return (
      <>
        <View style={{ width: '75%' }}>
          <Text style={styles.itemNameText}>
            {testName ||
              testDetails?.ItemName ||
              cmsTestDetails?.diagnosticItemName ||
              testInfo?.itemName}
          </Text>
        </View>
        <View style={styles.inclusionsView}>
          {isInclusionPrsent ? (
            <Text style={styles.testIncludedText}>
              Tests included : {cmsTestDetails?.diagnosticInclusionName?.length}
            </Text>
          ) : null}
          {isInclusionPrsent &&
            !moreInclusions &&
            inclusions?.map((item: any, index: number) =>
              index < 4 ? (
                <View style={styles.rowStyle}>
                  <Text style={styles.inclusionsBullet}>{'\u2B24'}</Text>
                  <Text style={styles.inclusionsItemText}>
                    {!!item?.inclusionName ? nameFormater(item?.inclusionName!, 'title') : ''}{' '}
                    {index == 3 && inclusions?.length - 4 > 0 && (
                      <Text
                        onPress={() => setMoreInclusions(!moreInclusions)}
                        style={styles.moreText}
                      >
                        {'   '}
                        {!moreInclusions && `+${inclusions?.length - 4} MORE`}
                      </Text>
                    )}
                  </Text>
                </View>
              ) : null
            )}
          {isInclusionPrsent &&
            moreInclusions &&
            inclusions?.map((item: any, index: number) => (
              <View style={styles.rowStyle}>
                <Text style={styles.inclusionsBullet}>{'\u2B24'}</Text>
                <Text style={styles.inclusionsItemText}>
                  {!!item?.inclusionName ? nameFormater(item?.inclusionName!, 'title') : ''}{' '}
                </Text>
              </View>
            ))}
          {isInclusionPrsent && moreInclusions && (
            <Text onPress={() => setMoreInclusions(!moreInclusions)} style={styles.showLessText}>
              SHOW LESS
            </Text>
          )}
        </View>
      </>
    );
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
        headerText={nameFormater('TEST PACKAGE DETAIL', 'upper')}
        movedFrom={'testDetails'}
      />
    );
  };

  const renderFAQView = () => {
    return (
      <FAQComponent
        headingText={'Frequently Asked Questions'}
        headingStyle={styles.faqHeadingText}
        headerSeparatorStyle={{ marginVertical: 10 }}
        containerStyle={{ marginLeft: 20, marginRight: 25 }}
        data={cmsTestDetails?.diagnosticFAQs}
        arrowStyle={{ tintColor: theme.colors.APP_YELLOW }}
        horizontalLine={styles.faqLine}
      />
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
              isCircleSubscribed={isDiagnosticCircleSubscription}
              isServiceable={isDiagnosticLocationServiceable}
              isVertical={false}
              navigation={props.navigation}
              source={'Details Page'}
              sourceScreen={AppRoutes.TestDetails}
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
              isCircleSubscribed={isDiagnosticCircleSubscription}
              isServiceable={isDiagnosticLocationServiceable}
              isVertical={false}
              navigation={props.navigation}
              source={'Details Page'}
              sourceScreen={AppRoutes.TestDetails}
            />
          </>
        ) : null}
      </View>
    );
  };

  function onPressAddToCart() {
    const specialPrice = testInfo?.specialPrice!;
    const price = testInfo?.Rate!;
    const circlePrice = testInfo?.circlePrice!;
    const circleSpecialPrice = testInfo?.circleSpecialPrice!;
    const discountPrice = testInfo?.discountPrice!;
    const discountSpecialPrice = testInfo?.discountSpecialPrice!;
    const planToConsider = testInfo?.planToConsider;
    const discountToDisplay = testInfo?.discountToDisplay;
    const mrpToDisplay = testInfo?.mrpToDisplay;

    DiagnosticAddToCartEvent(
      cmsTestDetails?.diagnosticItemName || testInfo?.itemName,
      itemId!,
      mrpToDisplay,
      discountToDisplay,
      'Details page'
    );
    addCartItem!({
      id: `${itemId!}`,
      mou: cmsTestDetails?.diagnosticInclusionName?.length + 1 || testInfo?.mou,
      name: cmsTestDetails?.diagnosticItemName || testInfo?.itemName,
      price: price,
      specialPrice: specialPrice! | price,
      circlePrice: circlePrice,
      circleSpecialPrice: circleSpecialPrice,
      discountPrice: discountPrice,
      discountSpecialPrice: discountSpecialPrice,
      thumbnail: cmsTestDetails?.diagnosticItemImageUrl,
      collectionMethod: TEST_COLLECTION_TYPE.HC,
      packageMrp: Number(testInfo?.packageMrp!),
      groupPlan: testInfo?.promoteCircle
        ? DIAGNOSTIC_GROUP_PLAN.CIRCLE
        : testInfo?.promoteDiscount
        ? DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
        : DIAGNOSTIC_GROUP_PLAN.ALL,
      inclusions: testInfo?.inclusions == null ? [Number(itemId)] : testInfo?.inclusions,
    });
  }

  function onPressRemoveFromCart() {
    if (diagnosticServiceabilityData?.city != '') {
      return;
    }
    removeCartItem!(`${itemId}`);
  }

  return (
    <SafeAreaView
      style={{
        ...theme.viewStyles.container,
      }}
    >
      {!errorState ? (
        <>
          {renderHeader()}
          {renderBreadCrumb()}
          <ScrollView
            bounces={false}
            keyboardDismissMode="on-drag"
            style={{ marginBottom: 60 }}
            ref={scrollViewRef}
          >
            {!!testInfo && !!cmsTestDetails && renderItemCard()}
            {renderWhyBookUs()}
            {renderDescriptionCard()}
            {!!cmsTestDetails?.diagnosticFAQs && cmsTestDetails?.diagnosticFAQs?.length > 0
              ? renderFAQView()
              : null}
            {!!cmsTestDetails?.diagnosticWidgetsData &&
            cmsTestDetails?.diagnosticWidgetsData?.length > 0
              ? renderWidgetsView()
              : null}
          </ScrollView>
          <StickyBottomComponent>
            <Button
              title={isAddedToCart ? 'PROCEED TO CART ' : 'ADD TO CART'}
              onPress={() =>
                isAddedToCart ? props.navigation.navigate(AppRoutes.TestsCart) : onPressAddToCart()
              }
            />
          </StickyBottomComponent>
          {/* {loading && <Spinner />} */}
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
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: theme.colors.WHITE,
    // height: height === 812 || height === 896 ? 120 : 110,
    height: 'auto',
    paddingHorizontal: 20,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  personDetailStyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.25,
    marginTop: 4,
  },
  pendingIconStyle: { height: 15, width: 15, resizeMode: 'contain' },
  notificationCard: {
    ...theme.viewStyles.cardViewStyle,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
  },
  descriptionCardOuterView: {
    width: Dimensions.get('window').width * 0.9,
    ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
    padding: 16,
    elevation: 10,
    margin: 16,
    flex: 1,
  },
  packageDescriptionHeading: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 16.5 : 18, theme.colors.SHERPA_BLUE, 1, 25),
    textAlign: 'left',
    marginBottom: '2%',
  },
  packageDescriptionText: {
    ...theme.viewStyles.text('L', 13, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  overViewContainer: {
    marginTop: 10,
  },
  readMoreTouch: { alignSelf: 'flex-end', marginTop: 10 },
  readMoreText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 14 : 15, theme.colors.APP_YELLOW, 1, 20),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  flexRowView: { flexDirection: 'row', justifyContent: 'space-between' },
  rowStyle: { flexDirection: 'row' },
  slashedPriceText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE),
    lineHeight: 21,
    textAlign: 'left',
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.SHERPA_BLUE),
    lineHeight: 21,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  circleLogoIcon: {
    height: 20,
    width: isSmallDevice ? 32 : 36,
    resizeMode: 'contain',
  },
  savingsText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10.5 : 11, theme.colors.APP_GREEN),
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'center',
  },
  midCardView: { flexDirection: 'row', height: 60 },
  clockIconStyle: { height: 32, width: 32, resizeMode: 'contain', alignSelf: 'center' },
  midCardTextView: {
    flexDirection: 'column',
    marginHorizontal: '2%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  reportTimeText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 0.5, 15),
    textAlign: 'left',
    letterSpacing: 0.25,
  },
  reportTime: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 1, 16),
    textAlign: 'left',
    letterSpacing: 0.25,
    marginVertical: 4,
  },
  bottomCardView: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  infoIconStyle: { height: 24, width: 24, resizeMode: 'contain' },
  preTestingText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 12 : 13, '#FF637B', 1, 15),
    textAlign: 'left',
    letterSpacing: 0.25,
    marginHorizontal: '4%',
  },
  itemNameText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 16.5 : 18, theme.colors.SHERPA_BLUE, 1, 25),
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  inclusionsView: { width: '100%', marginVertical: '4%' },
  testIncludedText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 0.5, 18),
    textAlign: 'left',
    marginTop: '1%',
    letterSpacing: 0.25,
    marginBottom: '3%',
  },
  inclusionsBullet: {
    color: '#007C9D',
    fontSize: 6,
    textAlign: 'center',
    paddingTop: 3,
  },
  inclusionsItemText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 11.5 : 12, '#007C9D', 1, 17),
    letterSpacing: 0,
    marginBottom: '1.5%',
    marginHorizontal: '3%',
  },
  moreText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12 : 13, theme.colors.APP_YELLOW, 1, 15),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  showLessText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 12 : 13, theme.colors.APP_YELLOW, 1, 15),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
    marginTop: '2%',
    marginLeft: '5%',
  },
  breadCrumbContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  faqHeadingText: {
    ...theme.viewStyles.text('SB', 16, '#02475B', 1, 20, 0.35),
    marginTop: 10,
  },
  widgetHeading: {
    ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
  },
  faqLine: {
    marginVertical: 8,
    borderTopColor: '#02475B',
    opacity: 0.3,
    borderTopWidth: 1,
  },
});
