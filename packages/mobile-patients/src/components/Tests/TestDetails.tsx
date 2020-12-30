import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, Cross, PendingIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { DIAGNOSTIC_GROUP_PLAN, TestPackage } from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import stripHtml from 'string-strip-html';
import {
  aphConsole,
  postWebEngageEvent,
  g,
  postAppsFlyerEvent,
  postFirebaseEvent,
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
import { NavigationScreenProps } from 'react-navigation';
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
} from '@aph/mobile-patients/src/utils/commonUtils';
import { getPackageInclusions } from '@aph/mobile-patients/src/helpers/clientCalls';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

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

var tabs = [
  {
    id: '1',
    title: 'Tests Included',
  },
  {
    id: '2',
    title: 'Preparation',
  },
];

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
  }> {}

export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const testDetails = props.navigation.getParam('testDetails', {} as TestPackageForDetails);
  const itemId = props.navigation.getParam('itemId');

  const [testInfo, setTestInfo] = useState<TestPackageForDetails>(testDetails);
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].title);

  const TestDetailsDiscription = testInfo.PackageInClussion;
  const { diagnosticServiceabilityData } = useAppCommonData();
  const {
    cartItems,
    addCartItem,
    isDiagnosticCircleSubscription,
    setIsDiagnosticCircleSubscription,
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
  const hdfc_values = string.Hdfc_values;
  const cartItemsCount = cartItems.length + shopCartItems.length;
  const [isItemAdded, setItemAdded] = useState<boolean>(false);
  const currentItemId = testInfo.ItemID;
  aphConsole.log('currentItemId : ' + currentItemId);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

  const findItemFromCart = cartItems.find((item) => item.id == testInfo.ItemID);
  console.log(findItemFromCart);

  const discount =
    testDetails.source == 'Cart Page'
      ? calculatePackageDiscounts(
          findItemFromCart?.packageMrp!,
          findItemFromCart?.price!,
          findItemFromCart?.specialPrice!
        )
      : calculatePackageDiscounts(
          testDetails?.packageMrp!,
          testDetails?.Rate!,
          Number(testDetails?.specialPrice!)
        );
  const circleDiscount =
    testDetails.source == 'Cart Page'
      ? calculatePackageDiscounts(
          findItemFromCart?.packageMrp!,
          findItemFromCart?.circlePrice!,
          findItemFromCart?.circleSpecialPrice!
        )
      : calculatePackageDiscounts(
          testDetails?.packageMrp!,
          Number(testDetails?.circleRate!),
          Number(testDetails?.circleSpecialPrice!)
        );
  const specialDiscount =
    testDetails.source == 'Cart Page'
      ? calculatePackageDiscounts(
          findItemFromCart?.packageMrp!,
          findItemFromCart?.discountPrice!,
          findItemFromCart?.discountSpecialPrice!
        )
      : calculatePackageDiscounts(
          testDetails?.packageMrp!,
          Number(testDetails?.discountPrice!),
          Number(testDetails?.discountSpecialPrice!)
        );

  const promoteCircle = discount < circleDiscount && specialDiscount < circleDiscount;
  const promoteDiscount = promoteCircle ? false : discount < specialDiscount;

  useEffect(() => {
    if (itemId) {
      loadTestDetails(itemId);
    } else {
      !TestDetailsDiscription && fetchPackageInclusions(currentItemId);
    }
  }, []);

  const fetchPackageInclusions = async (currentItemId: string) => {
    try {
      const arrayOfId = [Number(currentItemId)];
      const res: any = await getPackageInclusions(client, arrayOfId);
      if (res) {
        const data = g(res, 'data', 'getInclusionsOfMultipleItems', 'inclusions');
        aphConsole.log('getPackageData \n', { data });
        setTestInfo({ ...testInfo, PackageInClussion: data || [] });
      }
    } catch (e) {
      CommonBugFender('TestDetails', e);
      aphConsole.log('getPackageData Error \n', { e });
      setsearchSate('fail');
    }
  };

  useEffect(() => {
    if (testInfo?.testDescription != null) {
      tabs = [
        {
          id: '1',
          title: 'Tests Included',
        },
        {
          id: '2',
          title: 'Preparation',
        },
        {
          id: '3',
          title: 'Overview',
        },
      ];
    } else {
      tabs = [
        {
          id: '1',
          title: 'Tests Included',
        },
        {
          id: '2',
          title: 'Preparation',
        },
      ];
    }
  }, []);

  useEffect(() => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION] = {
      Source: testInfo.source,
      'Item Name': testInfo.ItemName,
      'Item Type': testInfo.type,
      'Item Code': testInfo.ItemID,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION, eventAttributes);

    const firebaseEventAttributes: FirebaseEvents[FirebaseEventName.PRODUCT_PAGE_VIEWED] = {
      PatientUHID: g(currentPatient, 'uhid'),
      PatientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      source: testInfo.source,
      ItemName: testInfo.ItemName,
      ItemType: testInfo.type,
      ItemCode: testInfo.ItemID,
      ItemPrice: testInfo.Rate,
      LOB: 'Diagnostics',
      ...pharmacyCircleAttributes,
    };
    postFirebaseEvent(FirebaseEventName.PRODUCT_PAGE_VIEWED, firebaseEventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.PRODUCT_PAGE_VIEWED, firebaseEventAttributes);
  }, []);

  const loadTestDetails = async (itemId: string) => {
    const removeSpaces = itemId.replace(/\s/g, '');
    const arrayOfId = removeSpaces.split(',');
    const listOfIds = arrayOfId.map((item) => parseInt(item!));
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
      const {
        rate,
        gender,
        itemName,
        collectionType,
        fromAgeInDays,
        toAgeInDays,
        testPreparationData,
        packageCalculatedMrp,
      } = g(findDiagnosticsByItemIDsAndCityID, 'diagnostics', '0' as any)!;
      const partialTestDetails = {
        Rate: rate,
        Gender: gender,
        ItemID: `${itemId}`,
        ItemName: itemName,
        collectionType: collectionType!,
        FromAgeInDays: fromAgeInDays,
        ToAgeInDays: toAgeInDays,
        preparation: testPreparationData,
      };

      try {
        const arrayOfId = [Number(itemId)];
        const res: any = await getPackageInclusions(client, arrayOfId);
        if (res) {
          const data = g(res, 'data', 'getInclusionsOfMultipleItems', 'inclusions');
          aphConsole.log('getPackageData \n', { data });
          setTestInfo({ ...partialTestDetails, ...testInfo, PackageInClussion: data || [] });
          setsearchSate('success');
        }
      } catch (e) {
        CommonBugFender('TestDetails', e);
        aphConsole.log('getPackageData Error \n', { e });
        setsearchSate('fail');
      }
    } catch (error) {
      setsearchSate('fail');
    }
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          title={'TEST DETAIL'}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
          rightComponent={
            <TouchableOpacity
              onPress={() => {
                setItemAdded(false);
                props.navigation.navigate(AppRoutes.MedAndTestCart);
              }}
            >
              <CartIcon style={{}} />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
          }
        />
      </View>
    );
  };

  const renderTestDetails = () => {
    const gender: any = {
      B: 'MALE AND FEMALE',
      M: 'MALE',
      F: 'FEMALE',
    };
    const fromAge = (testInfo.FromAgeInDays / 365).toFixed(0);
    const toAge = (testInfo.ToAgeInDays / 365).toFixed(0);

    return (
      <View style={{ overflow: 'hidden', padding: 20 }}>
        <View>
          <Text style={styles.testNameStyles}>{testInfo.ItemName}</Text>
          {!!testInfo.ToAgeInDays && (
            <View style={styles.personDetailsView}>
              <Text style={styles.personDetailLabelStyles}>Age Group</Text>
              <Text style={styles.personDetailStyles}>For all age group</Text>
            </View>
          )}
          {!!testInfo.Gender && !!gender[testInfo.Gender] && (
            <View style={styles.personDetailsView}>
              <Text style={styles.personDetailLabelStyles}>Gender</Text>
              <Text style={styles.personDetailStyles}>{`FOR ${gender[testInfo.Gender]}`}</Text>
            </View>
          )}
          {!!testInfo.PackageInClussion && (
            <View style={styles.personDetailsView}>
              <Text style={styles.personDetailLabelStyles}>Sample Type</Text>
              <Text style={styles.personDetailStyles}>
                {testInfo?.PackageInClussion.map((item) => item?.sampleTypeName)
                  .filter((i) => i)
                  .filter((i, idx, array) => array.indexOf(i) >= idx)
                  .join(', ')}
              </Text>
            </View>
          )}
          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Collection Method</Text>
            <Text style={styles.personDetailStyles}>
              {testInfo.collectionType
                ? testInfo.collectionType === TEST_COLLECTION_TYPE.HC
                  ? 'HOME VISIT OR CLINIC VISIT'
                  : 'CLINIC VISIT'
                : null}
            </Text>
          </View>
        </View>
      </View>
    );
    return null;
  };

  const renderTabsData = () => {
    console.log(tabs);
    return (
      <View>
        <TabsComponent
          style={{
            backgroundColor: '#f7f8f5',
          }}
          height={44}
          data={tabs}
          onChange={(selectedTab: string) => setSelectedTab(selectedTab)}
          selectedTab={selectedTab}
          selectedTitleStyle={theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE)}
          titleStyle={theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE)}
        />
      </View>
    );
  };

  const renderTestsIncludedData = () => {
    return (
      <View style={styles.descriptionStyles}>
        {testInfo.PackageInClussion.map((item, i) => (
          <View key={i}>
            <Text style={styles.descriptionTextStyles}>
              {i + 1}. {item?.TestInclusion || item?.name}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPreparation = () => {
    return (
      <View style={styles.descriptionStyles}>
        <Text style={styles.descriptionTextStyles}>
          {(testInfo && testInfo.preparation) || string.diagnostics.noPreparationRequiredText}
        </Text>
      </View>
    );
  };

  const renderTestDescription = () => {
    return (
      <View style={styles.descriptionStyles}>
        <Text style={styles.descriptionTextStyles}>
          {(testInfo && stripHtml(testInfo?.testDescription)) ||
            string.diagnostics.noTestDescription}
        </Text>
      </View>
    );
  };

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

  const renderSpecialDiscountText = (styleObj?: any) => {
    return (
      <SpecialDiscountText text={string.diagnostics.specialDiscountText} styleObj={styleObj} />
    );
  };

  setTimeout(() => isItemAdded && setItemAdded(false), 2000);

  const renderItemAdded = () => {
    return (
      <View>
        {isItemAdded && isAddedToCart && (
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              flexDirection: 'row',
              marginTop: -10,
              right: 0,
              position: 'absolute',
            }}
          >
            <Text style={[styles.successfulText, { flexDirection: 'row' }]}>
              {string.diagnostics.itemsAddedSuccessfullyCTA}
            </Text>
            <TouchableOpacity
              style={{ marginTop: 13, marginRight: 10 }}
              onPress={() => setItemAdded(false)}
            >
              <Cross style={styles.crossIconStyle} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADD_TO_CART] = {
      'Item Name': name,
      'Item ID': id,
      Source: 'Details page',
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADD_TO_CART, eventAttributes);
    const firebaseAttributes: FirebaseEvents[FirebaseEventName.DIAGNOSTIC_ADD_TO_CART] = {
      productname: name,
      productid: id,
      Source: 'Diagnostic',
      Price: price,
      DiscountedPrice: discountedPrice,
      Quantity: 1,
    };
    postFirebaseEvent(FirebaseEventName.DIAGNOSTIC_ADD_TO_CART, firebaseAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.DIAGNOSTIC_ADD_TO_CART, firebaseAttributes);
  };

  const isAddedToCart = !!cartItems?.find((item) => item.id == testInfo.ItemID);
  console.log('isAddedToCart' + isAddedToCart);

  if (!TestDetailsDiscription && searchSate != 'fail') {
    return <Spinner />;
  } else if (searchSate == 'fail') {
    return (
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        {renderHeader()}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Card
            cardContainer={{ marginTop: 0 }}
            heading={'Uh oh! :('}
            description={'Test Details Not Available!'}
            descriptionTextStyle={{ fontSize: 14 }}
            headingTextStyle={{ fontSize: 14 }}
          />
        </View>
      </SafeAreaView>
    );
  } else {
    //if don't promote circle & specialprice or special discount
    let priceToConsider,
      specialPriceToConsider,
      circlePriceToConsider,
      circleSpecialPriceToConsider,
      discountPriceToConsider,
      discountSpecialPriceToConsider,
      itemPackageMrpToConsider;
    if (testDetails?.source == 'Cart Page' && findItemFromCart!) {
      priceToConsider = findItemFromCart?.price!;
      specialPriceToConsider = findItemFromCart?.specialPrice;
      circlePriceToConsider = findItemFromCart?.circlePrice!;
      circleSpecialPriceToConsider = findItemFromCart?.circleSpecialPrice!;
      discountPriceToConsider = findItemFromCart?.discountPrice!;
      discountSpecialPriceToConsider = findItemFromCart?.discountSpecialPrice!;
      itemPackageMrpToConsider = findItemFromCart?.packageMrp!;
    } else {
      priceToConsider = testDetails?.Rate;
      specialPriceToConsider = testDetails?.specialPrice;
      circlePriceToConsider = testDetails?.circleRate!;
      circleSpecialPriceToConsider = testDetails?.circleSpecialPrice!;
      discountPriceToConsider = testDetails?.discountPrice!;
      discountSpecialPriceToConsider = testDetails?.discountSpecialPrice!;
      itemPackageMrpToConsider = testDetails?.packageMrp!;
    }

    const mrpToDisplay = calculateMrpToDisplay(
      promoteCircle,
      promoteDiscount,
      itemPackageMrpToConsider,
      priceToConsider,
      Number(circlePriceToConsider),
      Number(discountPriceToConsider)
    );
    const anySpecialDiscount =
      (!promoteCircle && circlePriceToConsider && mrpToDisplay != circlePriceToConsider) ||
      (promoteDiscount &&
        discountSpecialPriceToConsider &&
        mrpToDisplay != discountSpecialPriceToConsider);

    let bottomPrice, strikedPrice;
    if (isDiagnosticCircleSubscription) {
      if (promoteCircle) {
        bottomPrice = circleSpecialPriceToConsider;
      } else if (promoteDiscount) {
        bottomPrice = discountSpecialPriceToConsider;
      } else {
        bottomPrice = specialPriceToConsider || mrpToDisplay;
      }
    } else {
      if (promoteCircle) {
        strikedPrice = mrpToDisplay;
        bottomPrice = circlePriceToConsider!;
      } else if (promoteDiscount) {
        bottomPrice = discountSpecialPriceToConsider;
      } else {
        bottomPrice = specialPriceToConsider || mrpToDisplay;
      }
    }
    return (
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        {renderHeader()}
        <ScrollView bounces={false} keyboardDismissMode="on-drag">
          <View>{renderTestDetails()}</View>
          {renderNotification()}
          {renderTabsData()}
          {selectedTab === tabs[0].title
            ? renderTestsIncludedData()
            : selectedTab === tabs[1].title
            ? renderPreparation()
            : renderTestDescription()}
          {promoteCircle && <View style={{ marginBottom: 30 }}></View>}
          <View style={{ height: screenHeight * 0.2 }} />
        </ScrollView>

        <StickyBottomComponent defaultBG style={styles.container}>
          {/**
           * non-subscribed + promote circle
           */}

          {!isDiagnosticCircleSubscription && promoteCircle && (
            <View style={[styles.topPriceView, { height: 75 }]}>
              <View>
                <CircleHeading />
                <View style={styles.circlePriceView}>
                  <Text style={styles.priceText}>
                    {string.common.Rs}
                    {circleSpecialPriceToConsider}
                  </Text>
                </View>
              </View>
              {renderItemAdded()}
            </View>
          )}
          {/**
           * non-subscribed + special price + non-promote
           */}

          {!isDiagnosticCircleSubscription && anySpecialDiscount && (
            <View style={[styles.topPriceView, { height: 60 }]}>
              <View
                style={[
                  styles.circlePriceView,
                  // { alignSelf: promoteDiscount ? 'flex-start' : 'flex-end' },
                  { alignSelf: 'flex-start' },
                ]}
              >
                <Text
                  style={[styles.priceText, { textDecorationLine: 'line-through', opacity: 0.5 }]}
                >
                  {string.common.Rs} {mrpToDisplay}
                </Text>
              </View>
              {renderItemAdded()}
            </View>
          )}
          {/**
           * subscribed + promote circle
           */}
          {isDiagnosticCircleSubscription && promoteCircle && (
            <View style={[styles.topPriceView]}>
              <View style={styles.circlePriceView}>
                <Text
                  style={[styles.priceText, { textDecorationLine: 'line-through', opacity: 0.5 }]}
                >
                  {string.common.Rs} {mrpToDisplay}
                </Text>
              </View>
              {renderItemAdded()}
            </View>
          )}

          {/**
           * subscribed + special
           */}

          {isDiagnosticCircleSubscription && anySpecialDiscount && (
            <View style={[styles.topPriceView, { height: 60 }]}>
              <View
                style={[
                  styles.circlePriceView,
                  // { alignSelf: promoteDiscount ? 'flex-start' : 'flex-end' },
                  { alignSelf: 'flex-start' },
                ]}
              >
                <Text
                  style={[styles.priceText, { textDecorationLine: 'line-through', opacity: 0.5 }]}
                >
                  {string.common.Rs} {mrpToDisplay}
                </Text>
              </View>
              {renderItemAdded()}
            </View>
          )}

          {/**
           * for normal cases where no special price + no circle price
           */}
          {!promoteCircle && mrpToDisplay == specialPriceToConsider && (
            <View
              style={{
                bottom: 50,
                alignItems: 'flex-end',
              }}
            >
              {renderItemAdded()}
            </View>
          )}

          <View style={{ backgroundColor: 'white', margin: -16 }}>
            <View style={{ margin: 16 }}>
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}
              >
                {/**
                 * default price. - on sticky bottom
                 */}

                <View
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: isDiagnosticCircleSubscription && promoteCircle ? 0 : 10,
                  }}
                >
                  {/**
                   * special price text
                   */}
                  {promoteDiscount
                    ? renderSpecialDiscountText({ marginTop: -10, marginBottom: 2 })
                    : null}

                  {/**
                   * circle + promote
                   */}
                  {isDiagnosticCircleSubscription && promoteCircle ? (
                    <View style={{ alignSelf: 'flex-start' }}>
                      <CircleHeading isSubscribed={isDiagnosticCircleSubscription} />
                    </View>
                  ) : null}

                  {/**added */}
                  {promoteCircle && !!strikedPrice && strikedPrice! > bottomPrice && (
                    <Text style={[styles.priceText, styles.priceTextSlashed]}>
                      ({string.common.Rs}
                      {strikedPrice})
                    </Text>
                  )}
                  <View style={{ flexDirection: 'row' }}>
                    <Text
                      style={[
                        styles.priceText,
                        {
                          marginTop: isDiagnosticCircleSubscription && promoteCircle ? -2 : 0,
                          textAlign: 'left',
                        },
                      ]}
                    >
                      {string.common.Rs}
                      {bottomPrice}
                    </Text>
                    {promoteCircle &&
                      (isDiagnosticCircleSubscription ? circleDiscount > 0 : discount > 0) && (
                        <Text
                          style={{
                            ...theme.fonts.IBMPlexSansMedium(11),
                            color: colors.APP_GREEN,
                            lineHeight: 16,
                            marginHorizontal: 10,
                          }}
                        >
                          {Number(
                            isDiagnosticCircleSubscription ? circleDiscount! : discount
                          ).toFixed(0)}
                          %off
                        </Text>
                      )}
                    {/**
                     * circle + not to promote  -- removed isDiagnosticCircleSubscription (to show discounts)
                     */}
                    {anySpecialDiscount && (
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(11),
                          color: colors.APP_GREEN,
                          lineHeight: 16,
                          marginHorizontal: 10,
                        }}
                      >
                        {Number(promoteDiscount ? specialDiscount! : discount!).toFixed(0)}%off
                      </Text>
                    )}
                  </View>
                </View>

                <View style={{ width: '50%', alignSelf: 'flex-end' }}>
                  <Button
                    title={!isAddedToCart ? 'ADD TO CART' : string.diagnostics.proceedToCartCTA}
                    // disabled={!isAddedToCart}
                    style={{ marginBottom: 20 }}
                    onPress={() => {
                      if (!isAddedToCart) {
                        setItemAdded(true);
                        postDiagnosticAddToCartEvent(
                          testInfo.ItemName,
                          testInfo.ItemID,
                          testInfo.Rate,
                          testInfo.Rate
                        );
                        addCartItem!({
                          id: testInfo?.ItemID,
                          name: testInfo?.ItemName,
                          mou: testInfo?.PackageInClussion.length,
                          price: testInfo?.Rate,
                          specialPrice: Number(testInfo?.specialPrice!) || Number(testInfo?.Rate!),
                          circlePrice: Number(testInfo?.circleRate!) || undefined,
                          circleSpecialPrice: Number(testInfo?.circleSpecialPrice!) || undefined,
                          discountPrice: Number(testInfo?.discountPrice),
                          discountSpecialPrice: Number(testInfo?.discountSpecialPrice),
                          thumbnail: '',
                          collectionMethod: testInfo?.collectionType,
                          groupPlan: promoteCircle
                            ? DIAGNOSTIC_GROUP_PLAN.CIRCLE
                            : promoteDiscount
                            ? DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
                            : DIAGNOSTIC_GROUP_PLAN.ALL,
                          packageMrp: Number(testInfo?.packageMrp!),
                          inclusions: testInfo?.inclusions,
                        });
                      } else {
                        setItemAdded(false);
                        props.navigation.navigate(AppRoutes.MedAndTestCart);
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </StickyBottomComponent>
      </SafeAreaView>
    );
  }
};
