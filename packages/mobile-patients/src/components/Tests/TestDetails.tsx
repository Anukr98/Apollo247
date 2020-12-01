import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, PendingIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getPackageData, TestPackage } from '@aph/mobile-patients/src/helpers/apiCalls';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
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
  },
  notificationCard: {
    ...theme.viewStyles.cardViewStyle,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
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
  source: 'Landing Page' | 'Search Page' | 'Cart Page';
  type: string;
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
  const { locationDetails, diagnosticLocation, diagnosticServiceabilityData } = useAppCommonData();
  const { cartItems, addCartItem } = useDiagnosticsCart();
  const { cartItems: shopCartItems } = useShoppingCart();
  const cartItemsCount = cartItems.length + shopCartItems.length;
  const [isItemAdded, setItemAdded] = useState<boolean>(false);
  const currentItemId = testInfo.ItemID;
  aphConsole.log('currentItemId : ' + currentItemId);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

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
              <Text style={styles.personDetailStyles}>For all Age Group</Text>
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

  const onProceedToCartCTA = () => {
    props.navigation.navigate(AppRoutes.MedAndTestCart);
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
          <View style={{ height: 100 }} />
        </ScrollView>
        <StickyBottomComponent defaultBG style={styles.container}>
          <View style={{ marginBottom: 11, alignItems: 'flex-end' }}>
            <Text style={styles.priceText}>
              {string.common.Rs} {testInfo.Rate}
            </Text>
          </View>

          <View style={styles.SeparatorStyle}></View>
          {isItemAdded && (
            <Text style={styles.successfulText}>
              {string.diagnostics.itemsAddedSuccessfullyCTA}
            </Text>
          )}

          <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 60 }}>
            <Button
              title={
                !isAddedToCart
                  ? 'ADD TO CART'
                  : isItemAdded
                  ? string.diagnostics.proceedToCartCTA
                  : 'ITEM ADDED'
              }
              disabled={!isAddedToCart || isItemAdded ? false : true}
              style={{ flex: 1, marginBottom: 16 }}
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
                    id: testInfo.ItemID,
                    name: testInfo.ItemName,
                    mou: testInfo.PackageInClussion.length,
                    price: testInfo.Rate,
                    thumbnail: '',
                    specialPrice: undefined,
                    collectionMethod: testInfo.collectionType,
                  });
                } else {
                  setItemAdded(false);
                  props.navigation.navigate(AppRoutes.MedAndTestCart);
                }
              }}
            />
            {isAddedToCart && !isItemAdded && (
              <View style={{ height: 40 }}>
                <Text onPress={onProceedToCartCTA} style={styles.proceedToCartText}>
                  {string.diagnostics.proceedToCartCTA}
                </Text>
              </View>
            )}
          </View>
        </StickyBottomComponent>
      </SafeAreaView>
    );
  }
};
