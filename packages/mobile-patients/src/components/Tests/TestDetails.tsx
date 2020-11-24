import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CartIcon,
  CircleBannerNonMember,
  PendingIcon,
  WhiteTickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getPackageData,
  TestPackage,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  aphConsole,
  postWebEngageEvent,
  g,
  getDiscountPercentage,
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
  SEARCH_DIAGNOSTICS_BY_ID,
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
    ...theme.fonts.IBMPlexSansMedium(12),
    alignSelf: 'flex-end',
  },
  notificationCard: {
    ...theme.viewStyles.cardViewStyle,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
  },
});

const tabs = [
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
  source: 'Landing Page' | 'Search Page' | 'Cart Page';
  type: string;
  specialPrice?: string | number;
  circleRate?: string | number;
  circleSpecialPrice?: string | number;
}

export interface TestDetailsProps
  extends NavigationScreenProps<{
    testDetails?: TestPackageForDetails;
    itemId?: string;
  }> {}

export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].title);
  const testDetails = props.navigation.getParam('testDetails', {} as TestPackageForDetails);
  const itemId = props.navigation.getParam('itemId');

  const [testInfo, setTestInfo] = useState<TestPackageForDetails>(testDetails);
  const TestDetailsDiscription = testInfo.PackageInClussion;
  const { locationDetails, diagnosticLocation, diagnosticServiceabilityData } = useAppCommonData();
  const { cartItems, addCartItem, isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const {
    cartItems: shopCartItems,
    isCircleSubscription,
    setIsCircleSubscription,
  } = useShoppingCart();
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
      ? getDiscountPercentage(findItemFromCart?.price!, findItemFromCart?.specialPrice!)
      : getDiscountPercentage(testDetails?.Rate!, testDetails?.specialPrice!);
  const circleDiscount =
    testDetails.source == 'Cart Page'
      ? getDiscountPercentage(findItemFromCart?.circlePrice!, findItemFromCart?.circleSpecialPrice!)
      : getDiscountPercentage(testDetails?.circleRate!, testDetails?.circleSpecialPrice!);

  const promoteCircle = discount! < circleDiscount!;

  useEffect(() => {
    if (itemId) {
      loadTestDetails(itemId);
    } else {
      !TestDetailsDiscription &&
        getPackageData(currentItemId)
          .then(({ data }) => {
            setsearchSate('success');
            aphConsole.log('getPackageData \n', { data });
            setTestInfo({ ...testInfo, PackageInClussion: data.data || [] });
          })
          .catch((e) => {
            CommonBugFender('TestDetails', e);
            aphConsole.log('getPackageData Error \n', { e });
            setsearchSate('fail');
          });
    }
  }, []);

  useEffect(() => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION] = {
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      Source: testInfo.source,
      'Item Name': testInfo.ItemName,
      'Item Type': testInfo.type,
      'Item Code': testInfo.ItemID,
      'Item Price': testInfo.Rate,
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

      const {
        data: { data },
      } = await getPackageData(itemId);

      setTestInfo({
        ...partialTestDetails,
        PackageInClussion: data || [],
      } as TestPackageForDetails);
      setsearchSate('success');
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
                {testInfo.PackageInClussion.map((item) => item.SampleTypeName)
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
              {i + 1}. {item.TestInclusion || item.TestName}
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

  const onProceedToCartCTA = () => {
    props.navigation.navigate(AppRoutes.MedAndTestCart);
  };

  const renderCareBanner = () => {
    return (
      <TouchableOpacity
        style={{
          marginLeft: 16,
          margin: 20,
          marginBottom: 10,
          marginTop: 10,
          padding: -16,
        }}
        onPress={() => _navigateToCareLanding()}
      >
        <CircleBannerNonMember
          style={{ height: 200, marginTop: -15, marginBottom: -25, width: screenWidth - 32 }}
        />
      </TouchableOpacity>
    );
  };

  const _navigateToCareLanding = () => {
    //open the pop-up
  };

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADD_TO_CART] = {
      'product name': name,
      'product id': id,
      Source: 'Diagnostic',
      Price: price,
      'Discounted Price': discountedPrice,
      Quantity: 1,
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

  const isAddedToCart = !!cartItems.find((item) => item.id == testInfo.ItemID);
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
    console.log('iscircle ? ' + isDiagnosticCircleSubscription);
    console.log('promote circle ? ' + promoteCircle);

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
          {selectedTab === tabs[0].title ? renderTestsIncludedData() : renderPreparation()}
          {!isDiagnosticCircleSubscription && renderCareBanner()}
          <View style={{ height: screenHeight * 0.2 }} />
        </ScrollView>

        <StickyBottomComponent defaultBG style={styles.container}>
          {/**
           * non-subscribed + promote circle
           */}

          {!isDiagnosticCircleSubscription && promoteCircle && (
            <View style={{ height: 75, alignItems: 'flex-start' }}>
              <CircleHeading />
              <View style={{ alignSelf: 'flex-start', marginTop: 5 }}>
                <Text style={styles.priceText}>
                  {string.common.Rs}{' '}
                  {findItemFromCart?.circleSpecialPrice! || testInfo?.circleSpecialPrice}
                </Text>
              </View>
            </View>
          )}
          {/**
           * non-subscribed + special price + non-promote
           */}
          {!isDiagnosticCircleSubscription &&
            !promoteCircle &&
            (testDetails.source == 'Cart Page' && findItemFromCart!
              ? findItemFromCart?.price != findItemFromCart?.specialPrice
              : testDetails?.Rate != testDetails?.specialPrice) && (
              <View style={{ height: 50, alignItems: 'flex-start' }}>
                <View style={{ alignSelf: 'flex-start', marginTop: 5 }}>
                  <Text
                    style={[styles.priceText, { textDecorationLine: 'line-through', opacity: 0.5 }]}
                  >
                    {string.common.Rs} {findItemFromCart?.price! || testInfo?.Rate}
                  </Text>
                </View>
              </View>
            )}
          {/**
           * subscribed + promote circle
           */}
          {isDiagnosticCircleSubscription && promoteCircle && (
            <View style={{ height: 50, alignItems: 'flex-start' }}>
              <View style={{ alignSelf: 'flex-start', marginTop: 5 }}>
                <Text
                  style={[styles.priceText, { textDecorationLine: 'line-through', opacity: 0.5 }]}
                >
                  {string.common.Rs} {testInfo?.specialPrice! || testInfo?.Rate}
                </Text>
              </View>
            </View>
          )}

          {/**
           * subscribed + special
           */}

          {isDiagnosticCircleSubscription &&
            !promoteCircle &&
            (testDetails.source == 'Cart Page' && findItemFromCart!
              ? findItemFromCart?.price != findItemFromCart?.specialPrice
              : testDetails.Rate != testDetails.specialPrice) && (
              <View style={{ height: 50, alignItems: 'flex-start' }}>
                <View style={{ alignSelf: 'flex-start', marginTop: 5 }}>
                  <Text
                    style={[styles.priceText, { textDecorationLine: 'line-through', opacity: 0.5 }]}
                  >
                    {string.common.Rs} {findItemFromCart?.price || testInfo?.Rate}
                  </Text>
                </View>
              </View>
            )}

          <View style={{ backgroundColor: 'white', margin: -16 }}>
            <View style={{ margin: 16 }}>
              {isItemAdded && (
                <Text style={[styles.successfulText, { flexDirection: 'row' }]}>
                  {string.diagnostics.itemsAddedSuccessfullyCTA}
                  <WhiteTickIcon
                    style={{
                      height: 15,
                      width: 15,
                      tintColor: '#658F9B',
                      resizeMode: 'contain',
                      alignSelf: 'center',
                    }}
                  />
                </Text>
              )}
              {isAddedToCart && !isItemAdded && (
                <View style={{ height: 30, alignSelf: 'flex-end' }}>
                  <Text onPress={onProceedToCartCTA} style={styles.proceedToCartText}>
                    {string.diagnostics.proceedToCartCTA}
                  </Text>
                </View>
              )}
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
                   * circle + promote
                   */}
                  {isDiagnosticCircleSubscription && promoteCircle ? (
                    <View style={{ alignSelf: 'flex-start' }}>
                      <CircleHeading isSubscribed={isDiagnosticCircleSubscription} />
                    </View>
                  ) : null}
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
                      {string.common.Rs}{' '}
                      {isDiagnosticCircleSubscription && promoteCircle
                        ? testInfo?.circleSpecialPrice
                        : testInfo?.specialPrice || testInfo?.Rate}
                    </Text>
                    {isDiagnosticCircleSubscription && promoteCircle && (
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(11),
                          color: colors.APP_GREEN,
                          lineHeight: 16,
                          marginHorizontal: 10,
                        }}
                      >
                        {Number(circleDiscount!).toFixed(0)}%off
                      </Text>
                    )}
                    {/**
                     * circle + not to promote
                     */}
                    {isDiagnosticCircleSubscription &&
                      !promoteCircle &&
                      (testInfo.source == 'Cart Page'
                        ? findItemFromCart?.price! != findItemFromCart?.specialPrice!
                        : testInfo?.specialPrice! != testInfo?.Rate) && (
                        <Text
                          style={{
                            ...theme.fonts.IBMPlexSansMedium(11),
                            color: colors.APP_GREEN,
                            lineHeight: 16,
                            marginHorizontal: 10,
                          }}
                        >
                          {Number(discount!).toFixed(0)}%off
                        </Text>
                      )}
                  </View>
                </View>

                <View style={{ width: '50%', alignSelf: 'flex-end' }}>
                  <Button
                    title={
                      !isAddedToCart
                        ? 'ADD TO CART'
                        : isItemAdded
                        ? string.diagnostics.proceedToCartCTA
                        : 'ITEM ADDED'
                    }
                    disabled={!isAddedToCart || isItemAdded ? false : true}
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
                          thumbnail: '',
                          collectionMethod: testInfo?.collectionType,
                          groupPlan: promoteCircle
                            ? DIAGNOSTIC_GROUP_PLAN.CIRCLE
                            : DIAGNOSTIC_GROUP_PLAN.ALL,
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
