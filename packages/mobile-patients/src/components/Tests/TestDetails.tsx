import {
  TestBreadcrumbLink,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CartIcon,
  ClockIcon,
  Cross,
  InfoIconRed,
  PendingIcon,
  WhyBookUs,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
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
  postWebEngageEvent,
  g,
  postAppsFlyerEvent,
  postFirebaseEvent,
  nameFormater,
  isEmptyObject,
  isSmallDevice,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
} from '@aph/mobile-patients/src/graphql/profiles';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID,
} from '../../graphql/types/findDiagnosticsByItemIDsAndCityID';
import { AppConfig, COVID_NOTIFICATION_ITEMID } from '../../strings/AppConfig';
import { FirebaseEventName, FirebaseEvents } from '../../helpers/firebaseEvents';
import { AppsFlyerEventName } from '../../helpers/AppsFlyerEvents';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { CircleHeading } from '@aph/mobile-patients/src/components/ui/CircleHeading';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import {
  calculateMrpToDisplay,
  calculatePackageDiscounts,
  getPricesForItem,
  sourceHeaders,
  convertNumberToDecimal,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { getPackageInclusions } from '@aph/mobile-patients/src/helpers/clientCalls';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import { DiagnosticAddToCartEvent, DiagnosticDetailsViewed } from './Events';
import { TestListingHeader } from './components/TestListingHeader';
import { Breadcrumb } from '../MedicineListing/Breadcrumb';
import { Spearator } from '../ui/BasicComponents';
import { FAQComponent } from '../SubscriptionMembership/Components/FAQComponent';
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

export interface TestDetailsProps
  extends NavigationScreenProps<{
    testDetails?: TestPackageForDetails;
    itemId?: string;
    source?: string;
    comingFrom?: string;
  }> {}

export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const {
    cartItems,
    addCartItem,
    isDiagnosticCircleSubscription,
    setIsDiagnosticCircleSubscription,
    testDetailsBreadCrumbs,
    setTestDetailsBreadCrumbs,
  } = useDiagnosticsCart();
  const {
    cartItems: shopCartItems,
    setIsCircleSubscription,
    setHdfcSubscriptionId,
    setCircleSubscriptionId,
    setHdfcPlanName,
    setIsFreeDelivery,
    setCirclePlanValidity,
    pharmacyCircleAttributes,
  } = useShoppingCart();
  const { diagnosticServiceabilityData } = useAppCommonData();

  const testDetails = props.navigation.getParam('testDetails', {} as TestPackageForDetails);
  const itemId = props.navigation.getParam('itemId');
  const source = props.navigation.getParam('source');
  const movedFrom = props.navigation.getParam('comingFrom');
  console.log({ props });

  //create interface...
  const [cmsTestDetails, setCmsTestDetails] = useState([] as any);
  const [testInfo, setTestInfo] = useState({} as any);
  const [moreInclusions, setMoreInclusions] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const itemName = testInfo?.ItemName || '';

  const hdfc_values = string.Hdfc_values;
  const cartItemsCount = cartItems.length + shopCartItems.length;
  const [isItemAdded, setItemAdded] = useState<boolean>(false);
  const currentItemId = testInfo?.ItemID;
  aphConsole.log('currentItemId : ' + currentItemId);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

  const findItemFromCart = cartItems?.find((item) => item?.id == testInfo?.ItemID);
  const isAddedToCart = !!cartItems?.find((item) => item.id == testInfo?.ItemID);

  const discount =
    testDetails.source == 'Cart Page'
      ? calculatePackageDiscounts(
          findItemFromCart?.packageMrp!,
          findItemFromCart?.price!,
          findItemFromCart?.specialPrice!
        )
      : calculatePackageDiscounts(
          testDetails?.packageMrp! || testInfo?.packageMrp!,
          testDetails?.Rate! || testInfo?.Rate!,
          Number(testDetails?.specialPrice! || testInfo?.specialPrice!)
        );
  const circleDiscount =
    testDetails.source == 'Cart Page'
      ? calculatePackageDiscounts(
          findItemFromCart?.packageMrp!,
          findItemFromCart?.circlePrice!,
          findItemFromCart?.circleSpecialPrice!
        )
      : calculatePackageDiscounts(
          testDetails?.packageMrp! || testInfo?.packageMrp!,
          Number(testDetails?.circleRate! || testInfo?.circleRate),
          Number(testDetails?.circleSpecialPrice! || testInfo?.circleSpecialPrice!)
        );
  const specialDiscount =
    testDetails.source == 'Cart Page'
      ? calculatePackageDiscounts(
          findItemFromCart?.packageMrp!,
          findItemFromCart?.discountPrice!,
          findItemFromCart?.discountSpecialPrice!
        )
      : calculatePackageDiscounts(
          testDetails?.packageMrp! || testInfo?.packageMrp!,
          Number(testDetails?.discountPrice! || testInfo?.discountPrice!),
          Number(testDetails?.discountSpecialPrice! || testInfo?.discountSpecialPrice!)
        );

  const promoteCircle = discount < circleDiscount && specialDiscount < circleDiscount;
  const promoteDiscount = promoteCircle ? false : discount < specialDiscount;

  /**
   * fetching the details wrt itemId
   */
  useEffect(() => {
    if (itemId) {
      fetchTestDetails_CMS(991);
      loadTestDetails(itemId);
    } else {
      // !TestDetailsDiscription && fetchPackageInclusions(currentItemId);
    }
  }, []);

  const fetchTestDetails_CMS = async (itemId: string | number) => {
    //start loading
    const res: any = await getDiagnosticTestDetails('diagnostic-details', Number(itemId));
    if (res?.data?.success) {
      const result = g(res, 'data', 'data');
      console.log({ result });
      setCmsTestDetails(result);
    } else {
      setCmsTestDetails([]);
    }
  };

  const loadTestDetails = async (itemId: string | number) => {
    let listOfIds = [];
    listOfIds = [Number(itemId)];

    try {
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
      console.log({ findDiagnosticsByItemIDsAndCityID });
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
      const getItems = g(findDiagnosticsByItemIDsAndCityID, 'diagnostics');
      const packageMrpForItem = packageCalculatedMrp!;
      const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);

      if (!pricesForItem?.itemActive) {
        //disable add to cart
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
      };

      setTestInfo({ ...(partialTestDetails || []) });
    } catch (error) {
      // setsearchSate('fail');
      console.log({ error });
    }
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

  useEffect(() => {
    let breadcrumb: TestBreadcrumbLink[] = [homeBreadCrumb];
    if (!!movedFrom) {
      if (movedFrom == AppRoutes.Tests) {
        breadcrumb.push({
          title: 'Order Tests',
          onPress: () => {
            props.navigation.navigate('TESTS');
          },
        });
      }
      if (movedFrom == AppRoutes.SearchTestScene || movedFrom == AppRoutes.TestListing) {
        breadcrumb.push({
          title: 'Order Tests',
          onPress: () => {
            props.navigation.navigate('TESTS');
          },
        });
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
        // check this ....
        title: nameFormater(itemName, 'title'),
        onPress: () => {},
      });
      setTestDetailsBreadCrumbs && setTestDetailsBreadCrumbs(breadcrumb);
    }
  }, [movedFrom]);

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

  const renderDescriptionCard = () => {
    return (
      <View
        style={{
          width: Dimensions.get('window').width * 0.9,
          ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
          padding: 16,
          elevation: 10,
          margin: 16,
        }}
      >
        {/**
         * if package then package otherwise, test.
         * age if not coming from cms -> db
         * gender if not coming from cms -> db
         * sample type cms -> db
         */}
        <Text>Package Description</Text>
        {renderDetails('Sample type', 'something')}
        {renderDetails('Gender', cmsTestDetails?.diagnosticAge)}
        {renderDetails('Age group', cmsTestDetails?.diagnosticAge)}
        {renderDescription()}
      </View>
    );
  };

  const renderDetails = (key: string, value: string) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text>{key} : </Text>
        <Text>{value}</Text>
      </View>
    );
  };

  function onPressReadMore() {
    setReadMore(!readMore);
  }

  const renderDescription = () => {
    //handle strio html
    return (
      <>
        <View style={{ backgroundColor: 'orange', width: '85%' }}>
          {/* <Text>{stripHtml(cmsTestDetails?.diagnosticOverview?.[0]?.value!)}</Text> */}
          {readMore ? (
            <Text numberOfLines={1}>Some Random text Some Random text Some Random text</Text>
          ) : (
            <Text>
              Some Random text Some Random text Some Random text gffhhf ghtuytuy jyfyfy new test
              deshg{' '}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => onPressReadMore()}
          activeOpacity={1}
          style={{ backgroundColor: 'yellow', alignSelf: 'flex-end', marginVertical: '2%' }}
        >
          <Text> {!readMore ? 'READ LESS' : 'READ MORE'}</Text>
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
      <View
        style={{
          width: Dimensions.get('window').width * 0.9,
          ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
          padding: 16,
          elevation: 10,
          margin: 16,
        }}
      >
        {renderCardTopView()}
        {renderCardMidView()}
        {renderCardBottomView()}
        {renderPriceView()}
      </View>
    );
  };

  const renderPriceView = () => {
    return (
      <View style={{ backgroundColor: 'teal' }}>
        {/**
         * slashedd will only be shown if packageMrp > price in any case.
         */}
        {renderSlashedView()}
        {renderMainPriceView()}
      </View>
    );
  };

  const renderSlashedView = () => {
    return (
      <View>
        <Text> {string.common.Rs} 70000</Text>
      </View>
    );
  };

  const renderMainPriceView = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text> {string.common.Rs} 70000</Text>
        {renderSavingView()}
      </View>
    );
  };

  const renderSavingView = () => {
    return (
      <View>
        <Text> kjhfhf</Text>
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
            <View style={{ flexDirection: 'row' }}>
              <ClockIcon />
              <Text>Report generation Time</Text>
              <Text>{cmsTestDetails?.diagnosticReportGenerationTime}</Text>
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
            <View style={{ flexDirection: 'row' }}>
              <InfoIconRed />
              <Text>Fasting..</Text>
              <Text>{cmsTestDetails?.diagnosticPretestingRequirement}</Text>
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
        <View style={{ width: '75%', backgroundColor: 'red' }}>
          <Text
            style={{
              ...theme.viewStyles.text(
                'SB',
                isSmallDevice ? 16.5 : 18,
                theme.colors.SHERPA_BLUE,
                1,
                25
              ),
              textAlign: 'left',
              textTransform: 'capitalize',
            }}
          >
            {cmsTestDetails?.diagnosticItemName}
          </Text>
        </View>
        <View style={{ backgroundColor: 'pink', width: '100%', marginVertical: '6%' }}>
          {isInclusionPrsent ? (
            <Text
              style={{
                ...theme.viewStyles.text(
                  'M',
                  isSmallDevice ? 13 : 14,
                  theme.colors.SHERPA_BLUE,
                  0.5,
                  13
                ),
                textAlign: 'left',
                marginTop: '1%',
                letterSpacing: 0.25,
                marginBottom: '3%',
              }}
            >
              Tests included : {cmsTestDetails?.diagnosticInclusionName?.length}
            </Text>
          ) : null}
          {isInclusionPrsent &&
            !moreInclusions &&
            inclusions?.map((item: any, index: number) =>
              index < 4 ? (
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{
                      color: '#007C9D',
                      fontSize: 6,
                      textAlign: 'center',
                      paddingTop: 3,
                    }}
                  >
                    {'\u2B24'}
                  </Text>
                  <Text
                    style={{
                      ...theme.viewStyles.text('R', isSmallDevice ? 11.5 : 12, '#007C9D', 1, 16),
                      letterSpacing: 0.25,
                      marginBottom: '2%',
                      marginHorizontal: '3%',
                    }}
                  >
                    {nameFormater(item, 'title')}{' '}
                    {index == 3 && inclusions?.length - 4 > 0 && (
                      <Text
                        onPress={() => setMoreInclusions(!moreInclusions)}
                        style={{
                          ...theme.viewStyles.text(
                            'M',
                            isSmallDevice ? 12 : 13,
                            theme.colors.APP_YELLOW,
                            1,
                            13
                          ),
                          letterSpacing: 0.25,
                          marginBottom: '1.5%',
                        }}
                      >
                        {'   '}
                        {!moreInclusions && `+${inclusions?.length - 4} more`}
                      </Text>
                    )}
                  </Text>
                </View>
              ) : null
            )}
          {isInclusionPrsent &&
            moreInclusions &&
            inclusions?.map((item: any, index: number) => (
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    color: '#007C9D',
                    fontSize: 6,
                    textAlign: 'center',
                    paddingTop: 3,
                  }}
                >
                  {'\u2B24'}
                </Text>
                <Text
                  style={{
                    ...theme.viewStyles.text('R', isSmallDevice ? 11.5 : 12, '#007C9D', 1, 16),
                    letterSpacing: 0.25,
                    marginBottom: '2%',
                    marginHorizontal: '3%',
                  }}
                >
                  {nameFormater(item, 'title')}{' '}
                </Text>
              </View>
            ))}
          {/**
           * check for less items..
           */}
          {isInclusionPrsent && moreInclusions && (
            <Text
              onPress={() => setMoreInclusions(!moreInclusions)}
              style={{
                ...theme.viewStyles.text(
                  'M',
                  isSmallDevice ? 12 : 13,
                  theme.colors.APP_YELLOW,
                  1,
                  13
                ),
                letterSpacing: 0.25,
                marginBottom: '1.5%',
                marginTop: '2%',
                marginLeft: '5%',
              }}
            >
              SHOW LESS
            </Text>
          )}
        </View>
      </>
    );
  };

  const renderBreadCrumb = () => {
    console.log({ testDetailsBreadCrumbs });
    return (
      <View style={{ marginLeft: 20 }}>
        <Breadcrumb
          links={testDetailsBreadCrumbs!}
          containerStyle={{
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E5',
          }}
        />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <TestListingHeader
        navigation={props.navigation}
        headerText={nameFormater('TEST PACKAGE DETAIL', 'upper')}
      />
    );
  };

  const renderFAQView = () => {
    return (
      <FAQComponent
        headingText={'Frequently Asked Questions'}
        headingStyle={{
          ...theme.viewStyles.text('SB', 16, '#02475B', 1, 20, 0.35),
          marginTop: 10,
        }}
        headerSeparatorStyle={{ marginVertical: 10 }}
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        ...theme.viewStyles.container,
      }}
    >
      {renderHeader()}
      {renderBreadCrumb()}
      <ScrollView bounces={false} keyboardDismissMode="on-drag">
        {renderItemCard()}
        {renderWhyBookUs()}
        {renderDescriptionCard()}
        {renderFAQView()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  testNameStyles: {
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(20),
    lineHeight: 24,
    color: theme.colors.SEARCH_DOCTOR_NAME,
    marginTop: 4,
    marginBottom: 4,
  },
  personDetailLabelStyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
    letterSpacing: 0.25,
  },
  personDetailStyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.25,
    marginTop: 4,
  },
  personDetailsView: {
    marginTop: 6,
  },
  descriptionStyles: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 20,
  },
  descriptionTextStyles: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
    textAlign: 'left',
    lineHeight: 22,
  },
  priceText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#02475b',
    letterSpacing: 0.35,
    textAlign: 'center',
  },
  circlePriceText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0.35,
    textAlign: 'center',
  },
  SeparatorStyle: {
    ...theme.viewStyles.lightSeparatorStyle,
    borderBottomColor: 'rgba(2, 71, 91, 0.5)',
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 20,
  },
  pendingIconStyle: { height: 15, width: 15, resizeMode: 'contain' },
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
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
  proceedToCartText: {
    color: theme.colors.APP_YELLOW,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    textAlign: 'center',
    marginBottom: 10,
  },
  successfulText: {
    margin: 10,
    textAlign: 'center',
    color: '#658F9B',
    ...theme.fonts.IBMPlexSansMedium(11),
    alignSelf: 'flex-end',
  },
  notificationCard: {
    ...theme.viewStyles.cardViewStyle,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
  },
  crossIconStyle: {
    tintColor: colors.APP_YELLOW_COLOR,
    height: 10,
    width: 10,
    marginHorizontal: 5,
    resizeMode: 'contain',
    justifyContent: 'center',
  },
  topPriceView: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
  },
  circlePriceView: { alignSelf: 'flex-start', marginTop: 5 },
  priceTextSlashed: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    textDecorationLine: 'line-through',
    opacity: 0.5,
    marginTop: -10,
  },
});
