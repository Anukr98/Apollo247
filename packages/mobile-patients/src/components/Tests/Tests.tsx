import {
  LocationData,
  useAppCommonData,
  bannerType,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import stripHtml from 'string-strip-html';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { PincodePopup } from '@aph/mobile-patients/src/components/Medicines/PincodePopup';
import { CircleHeading } from '@aph/mobile-patients/src/components/ui/CircleHeading';
import {
  CartIcon,
  DropdownGreen,
  LocationOff,
  LocationOn,
  NotificationIcon,
  SearchSendIcon,
  TestsIcon,
  ShieldIcon,
  LinkedUhidIcon,
  PendingIcon,
  OfferIcon,
  SearchIcon,
  AddIcon,
  RemoveIcon,
  CircleBannerNonMember,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  SAVE_SEARCH,
  GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
  SEARCH_DIAGNOSTICS_BY_CITY_ID,
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  GET_DIAGNOSTIC_HOME_PAGE_ITEMS,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  GET_ALL_GROUP_BANNERS_OF_USER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import {
  searchDiagnosticsByCityID,
  searchDiagnosticsByCityIDVariables,
  searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';

import {
  getTestsPackages,
  TestPackage,
  PackageInclusion,
  getPackageData,
  getPlaceInfoByPincode,
  DIAGNOSTIC_GROUP_PLAN,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  doRequestAndAccessLocation,
  doRequestAndAccessLocationModified,
  g,
  isValidSearch,
  postWebEngageEvent,
  postWEGNeedHelpEvent,
  setWebEngageScreenNames,
  getFormattedLocation,
  getDiscountPercentage,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  Dimensions,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { WebEngageEventName, WebEngageEvents } from '../../helpers/webEngageEvents';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { postMyOrdersClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import _ from 'lodash';
import {
  getPincodeServiceability,
  getPincodeServiceabilityVariables,
} from '@aph/mobile-patients/src/graphql/types/getPincodeServiceability';
import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import {
  getDiagnosticsHomePageItems,
  getDiagnosticsHomePageItemsVariables,
  getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers,
  getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers_diagnostics,
  getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsHomePageItems';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import { getUserBannersList } from '@aph/mobile-patients/src/helpers/clientCalls';

const { width: winWidth } = Dimensions.get('window');
const styles = StyleSheet.create({
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
  imagePlaceholderStyle: {
    backgroundColor: '#f7f8f5',
    opacity: 0.5,
    borderRadius: 5,
  },
  hiTextStyle: {
    marginLeft: 20,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  nameTextContainerStyle: {
    maxWidth: '75%',
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    //marginTop: 5,
    marginHorizontal: 5,
    marginBottom: 6,
    marginRight: -5,
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  menuItemContainer: {
    marginHorizontal: 0,
    padding: 0,
    margin: 0,
  },
  menuMenuContainerStyle: {
    marginLeft: winWidth * 0.25,
    marginTop: 50,
  },
  menuScrollViewContainerStyle: { paddingVertical: 0 },
  menuItemTextStyle: {
    ...theme.viewStyles.text('M', 14, '#01475b'),
    padding: 0,
    margin: 0,
  },
  menuBottomPadding: { paddingBottom: 0 },
  deliverToText: { ...theme.viewStyles.text('R', 11, '#01475b', 1, 16) },
  locationText: { ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) },
  locationTextUnderline: {
    height: 2,
    backgroundColor: '#00b38e',
    opacity: 1,
  },
  dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },
  serviceabilityMsg: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('R', 12, '#890000'),
    justifyContent: 'center',
    textAlign: 'left',
  },
  serviceabiltyMessageBackground: {
    backgroundColor: 'white',
  },
  serviceabiltyMessageView: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    padding: 5,
    borderColor: '#890000',
    borderWidth: 1,
    borderRadius: 5,
  },
  serviceabiltyMessageInnerView: {
    flexDirection: 'row',
    marginHorizontal: 10,
    justifyContent: 'space-between',
  },
  pendingIconStyle: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
    marginTop: '1%',
    tintColor: '#890000',
  },
  discountTagView: {
    elevation: 20,
    position: 'absolute',
    right: 12,
    top: 0,
    zIndex: 1,
  },
  discountTagText: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  nonSubPrice: {
    ...theme.viewStyles.text('SB', 12, '#02475b', 0.6, 24),
    textAlign: 'center',
    marginRight: 5,
    marginTop: -2,
  },
  nonSubStrikedPrice: {
    ...theme.viewStyles.text('SB', 12, '#02475b', 0.6, 24),
    textAlign: 'left',
    marginRight: 5,
    textDecorationLine: 'line-through',
  },
  addToCartView: {
    flexGrow: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  strikedPrice: {
    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
    textDecorationLine: 'line-through',
  },
  normalPrice: {
    ...theme.viewStyles.text('M', 14, '#02475b', 1, 20, 0.04),
  },
  featuredPackageImageView: { height: 80, width: 70 },
  featuredPackageImageStyle: { height: 70, width: 70, resizeMode: 'contain' },
  featuredPackageTextView: {
    marginHorizontal: 10,
    width: '63%',
    justifyContent: 'center',
  },
});

export interface TestsProps
  extends NavigationScreenProps<{
    focusSearch?: boolean;
  }> {}

export const Tests: React.FC<TestsProps> = (props) => {
  const focusSearch = props.navigation.getParam('focusSearch');
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    clearDiagnoticCartInfo,
    isDiagnosticCircleSubscription,
    setIsDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const {
    cartItems: shopCartItems,
    setCircleSubscriptionId,
    setCirclePlanSelected,
    setIsCircleSubscription,
    setCircleCashback,
    circleSubscriptionId,
  } = useShoppingCart();
  const cartItemsCount = cartItems.length + shopCartItems.length;
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [optionSelected, setOptionSelected] = useState<string>('');

  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>(
    currentPatient!
  );

  const {
    locationDetails,
    setLocationDetails,
    diagnosticLocation,
    setDiagnosticLocation,
    diagnosticsCities,
    setDiagnosticsCities,
    locationForDiagnostics,
    diagnosticServiceabilityData,
    setDiagnosticServiceabilityData,
    isDiagnosticLocationServiceable,
    setDiagnosticLocationServiceable,
    circleSubscription,
    setCircleSubscription,
    setBannerData,
    bannerData,
  } = useAppCommonData();

  const [ordersFetched, setOrdersFetched] = useState<
    (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList | null)[]
  >([]);

  const { data: diagnosticsData, error: hError, loading: hLoading, refetch: hRefetch } = useQuery<
    getDiagnosticsHomePageItems,
    getDiagnosticsHomePageItemsVariables
  >(GET_DIAGNOSTIC_HOME_PAGE_ITEMS, {
    variables: { cityID: parseInt(diagnosticServiceabilityData?.cityId!) || 9 },
    fetchPolicy: 'cache-first',
  });

  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();

  const [testPackages, setTestPackages] = useState<TestPackage[]>([]);
  const [locationError, setLocationError] = useState(false);
  const [showLocations, setshowLocations] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState({});
  const [serviceabilityMsg, setServiceabilityMsg] = useState('');
  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const hasLocation = locationDetails;

  const diagnosticPincode = g(diagnosticLocation, 'pincode') || g(locationDetails, 'pincode');

  const patientAttributes = {
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Gender': g(currentPatient, 'gender'),
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
  };
  useEffect(() => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED] = {
      ...patientAttributes,
      Serviceability: isDiagnosticLocationServiceable == 'true' ? 'Yes' : 'No',
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED, eventAttributes);
  }, []);

  /**
   * for serviceable - non-serviceable tracking
   */

  const serviceableAttributes = {
    'Patient UHID': g(currentPatient, 'uhid'),
    State: g(diagnosticLocation, 'state') || g(locationDetails, 'state') || '',
    City: g(diagnosticLocation, 'city') || g(locationDetails, 'city') || '',
    'PinCode Entered': parseInt(diagnosticPincode!),
  };

  useEffect(() => {
    if (!!locationDetails || !!diagnosticLocation) {
      if (isDiagnosticLocationServiceable == 'true') {
        const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_SERVICEABLE] = serviceableAttributes;
        postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_SERVICEABLE, eventAttributes);
      } else {
        const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_NON_SERVICEABLE] = serviceableAttributes;
        postWebEngageEvent(
          WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_NON_SERVICEABLE,
          eventAttributes
        );
      }
    }
  }, [diagnosticPincode]);

  const setWebEngageEventOnSearchItem = (keyword: string, results: any[]) => {
    if (keyword.length > 2) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED] = {
        ...patientAttributes,
        'Keyword Entered': keyword,
        '# Results appeared': results.length,
        'Item in Results': results,
      };
      postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED, eventAttributes);
    }
  };

  const setWebEngageEventOnSearchItemClicked = (item: object) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_CLICKED_AFTER_SEARCH] = {
      ...patientAttributes,
      'Item Clicked': item,
    };
    postWebEngageEvent(
      WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_CLICKED_AFTER_SEARCH,
      eventAttributes
    );
  };

  const setWebEnageEventForPinCodeClicked = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ENTER_DELIVERY_PINCODE_CLICKED] = {
      ...patientAttributes,
      Method: !optionSelected ? 'Enter Manually' : optionSelected,
      Pincode: parseInt(diagnosticPincode!),
    };
    postWebEngageEvent(
      WebEngageEventName.DIAGNOSTIC_ENTER_DELIVERY_PINCODE_CLICKED,
      eventAttributes
    );
  };

  /**
   * if any change in the location and pincode is changed
   */
  useEffect(() => {
    if (diagnosticPincode) {
      checkIsPinCodeServiceable(diagnosticPincode);
      setWebEnageEventForPinCodeClicked();
    }
  }, [diagnosticPincode]);

  /**
   * fetching the orders
   */
  useEffect(() => {
    if (currentPatient && profile && profile.id !== currentPatient.id) {
      setLoadingContext!(true);
      setProfile(currentPatient);
      ordersRefetch()
        .then((data: any) => {
          const orderData = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
          setOrdersFetched(orderData);
          setLoadingContext!(false);
        })
        .catch((e) => {
          CommonBugFender('Tests_ordersRefetch_PATIENT_CHANGE', e);
        });
    }
    if (currentPatient) {
      getUserBanners();
    }
  }, [currentPatient]);

  /**
   * if there is any change in the location yellow pop-up ,if location is present.
   */
  useEffect(() => {
    checkLocation();
  }, [locationDetails]);

  useEffect(() => {
    setBannerData && setBannerData([]); // default banners to be empty
  }, []);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setBannerData && setBannerData([]); // default banners to be empty
      getUserBanners();
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const _willBlur = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      _willBlur && _willBlur.remove();
    };
  });

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    setBannerData && setBannerData([]);

    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
    return false;
  };

  const checkLocation = () => {
    !locationDetails &&
      showAphAlert!({
        unDismissable: true,
        title: 'Hi! :)',
        description:
          'We need to know your location to function better. Please allow us to auto detect your location or enter location manually.',
        children: (
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 20,
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginVertical: 18,
            }}
          >
            <Button
              style={{
                flex: 1,
                marginRight: 16,
              }}
              title={'ENTER MANUALLY'}
              onPress={() => {
                hideAphAlert!();
                setshowLocationpopup(true);
              }}
            />
            <Button
              style={{ flex: 1 }}
              title={'ALLOW AUTO DETECT'}
              onPress={() => {
                hideAphAlert!();
                setLoadingContext!(true);
                doRequestAndAccessLocation()
                  .then((response) => {
                    setLoadingContext!(false);
                    checkIsPinCodeServiceable(response.pincode);
                    response && setDiagnosticLocation!(response);
                    response && !locationDetails && setLocationDetails!(response);
                  })
                  .catch((e) => {
                    CommonBugFender('Tests_ALLOW_AUTO_DETECT', e);
                    setLoadingContext!(false);
                    showAphAlert!({
                      title: 'Uh oh! :(',
                      description: 'Unable to access location.',
                      onPressOk: () => {
                        hideAphAlert!();
                        setLocationError(true);
                        // setshowLocationpopup(true); //same as medicine
                      },
                    });
                  });
              }}
            />
          </View>
        ),
      });
  };

  useEffect(() => {
    if (locationForDiagnostics && locationForDiagnostics.cityId) {
      getTestsPackages(locationForDiagnostics.cityId, locationForDiagnostics.stateId)
        .then(({ data }) => {
          setLoading(false);
          aphConsole.log('getTestsPackages\n', { data });
          setTestPackages(g(data, 'data') || []);
        })
        .catch((e) => {
          CommonBugFender('Tests_getTestsPackages', e);
          setLoading(false);
          aphConsole.log('getTestsPackages Error\n', { e });
        });
      // .finally(() => {
      //   setLoading(false);
      // });
    } else {
      setTestPackages([]);
      setLoading(false);
    }
  }, [locationForDiagnostics && locationForDiagnostics.cityId]);

  const {
    data: orders,
    error: ordersError,
    loading: ordersLoading,
    refetch: ordersRefetch,
  } = useQuery<getDiagnosticOrdersList, getDiagnosticOrdersListVariables>(
    GET_DIAGNOSTIC_ORDER_LIST,
    {
      variables: {
        patientId: currentPatient && currentPatient.id,
      },
      fetchPolicy: 'cache-first',
    }
  );

  useEffect(() => {
    if (!ordersLoading) {
      const orderData = g(orders, 'getDiagnosticOrdersList', 'ordersList') || [];
      orderData.length > 0 && setOrdersFetched(orderData);
    }
  }, [ordersLoading]);

  /**
   * web engage events.
   */
  useEffect(() => {
    setWebEngageScreenNames('Diagnostic Home Page');
    hRefetch();
    if (ordersFetched.length == 0) {
      ordersRefetch()
        .then((data: any) => {
          const orderData = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
          orderData.length > 0 && setOrdersFetched(orderData);
        })
        .catch((e) => {
          CommonBugFender('Tests_ordersRefetch_initial', e);
        });
    }
  }, []);

  const getUserBanners = async () => {
    const res: any = await getUserBannersList(
      client,
      currentPatient,
      string.banner_context.DIAGNOSTIC_HOME
    );
    if (res) {
      setBannerData && setBannerData(res);
    } else {
      setBannerData && setBannerData([]);
    }
  };

  const renderCarouselBanners = () => {
    const showBanner = bannerData && bannerData.length > 0;
    if (showBanner) {
      return (
        <CarouselBanners
          navigation={props.navigation}
          planActivationCallback={() => {
            getUserBanners();
            getUserSubscriptionsByStatus();
          }}
          from={string.banner_context.DIAGNOSTIC_HOME}
          source={'Diagnostic'}
        />
      );
    }
  };

  const setWebEnageEventForItemViewedOnLanding = (name: string, id: string, type: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ITEM_CLICKED_ON_LANDING] = {
      ...patientAttributes,
      'Item Name': name,
      'Item ID': id,
      Type: type,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ITEM_CLICKED_ON_LANDING, eventAttributes);
  };

  const postFeaturedTestEvent = (name: string, id: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.FEATURED_TEST_CLICKED] = {
      'Product name': name,
      'Product id (SKUID)': id,
      Source: 'Home',
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.FEATURED_TEST_CLICKED, eventAttributes);
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

  const postBrowsePackageEvent = (packageName: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.BROWSE_PACKAGE] = {
      'Package Name': packageName,
      // Category: '',
      Source: 'Home',
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.BROWSE_PACKAGE, eventAttributes);
  };

  // Common Views

  const renderSectionLoader = (height: number = 100) => {
    return (
      <Spinner
        style={{
          height,
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      />
    );
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const handleUpdatePlaceInfoByPincodeError = (e: Error) => {
    CommonBugFender('AddAddress_updateCityStateByPincode', e);
    setError(true);
  };

  //change the city name which comes from serviceability
  const updatePlaceInfoByPincode = (pincode: string) => {
    getPlaceInfoByPincode(pincode)
      .then(({ data }) => {
        try {
          if (data?.results?.length > 0) {
            const addrComponents = data.results[0].address_components || [];
            const latLang = data.results[0].geometry.location || {};
            const response = getFormattedLocation(addrComponents, latLang, pincode);
            let setCity, setState;
            if (isDiagnosticLocationServiceable == 'true' && diagnosticServiceabilityData == null) {
              setCity = diagnosticLocation?.city! || '';
              setState = diagnosticLocation?.state! || '';
            } else if (
              isDiagnosticLocationServiceable == 'true' &&
              diagnosticServiceabilityData?.city != ''
            ) {
              setCity = diagnosticServiceabilityData?.city! || '';
              setState = diagnosticServiceabilityData?.state! || '';
            } else {
              setCity = response.city || '';
              setState = response.state || '';
            }
            (response.city = setCity), (response.state = setState);
            setDiagnosticLocation!(response);
            !locationDetails && setLocationDetails!(response);
          } else {
            //serviceable but no response
            let response = {
              displayName: '',
              area:
                isDiagnosticLocationServiceable == 'true'
                  ? diagnosticServiceabilityData == null
                    ? diagnosticLocation?.city!
                    : diagnosticServiceabilityData?.city!
                  : '',
              city:
                isDiagnosticLocationServiceable == 'true'
                  ? diagnosticServiceabilityData == null
                    ? diagnosticLocation?.city!
                    : diagnosticServiceabilityData?.city!
                  : '',
              state:
                isDiagnosticLocationServiceable == 'true'
                  ? diagnosticServiceabilityData == null
                    ? diagnosticLocation?.state!
                    : diagnosticServiceabilityData?.state!
                  : '',
              country: 'India',
              pincode: String(pincode),
            };
            setDiagnosticLocation!(response);
            !locationDetails && setLocationDetails!(response);
          }
        } catch (e) {
          console.log(e);
          handleUpdatePlaceInfoByPincodeError(e);
        }
      })
      .catch(handleUpdatePlaceInfoByPincodeError)
      .finally(() => setLoadingContext!(false));
  };

  const renderPopup = () => {
    const onClose = (serviceable?: boolean, response?: LocationData) => {
      setshowLocationpopup(false);
    };

    return (
      showLocationpopup && (
        <PincodePopup
          onClickClose={() => {
            onClose();
            checkLocation();
          }}
          toBeShownOn={'Diagnostics'}
          onComplete={onClose}
          onPressSubmit={(pincode) => checkIsPinCodeServiceable(pincode)}
          subText={'Allow us to serve you better by entering your area pincode below.'}
        />
      )
    );
  };

  /**check current location */
  const autoDetectLocation = async () => {
    setLoadingContext!(true);
    doRequestAndAccessLocationModified()
      .then((response) => {
        setLoadingContext!(false);
        checkIsPinCodeServiceable(response.pincode);
      })
      .catch((e) => {
        CommonBugFender('Diagnostic__ALLOW_AUTO_DETECT', e);
        setLoadingContext!(false);
        e &&
          typeof e == 'string' &&
          !e.includes('denied') &&
          showAphAlert!({
            title: string.common.uhOh,
            description: e,
          });
      });
  };

  /**
   * check for the pincode serviceability
   */
  const checkIsPinCodeServiceable = async (pincode: string) => {
    if (!!pincode) {
      setLoadingContext!(true);
      client
        .query<getPincodeServiceability, getPincodeServiceabilityVariables>({
          query: GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
          variables: {
            pincode: parseInt(pincode, 10),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          console.log('data...' + data.getPincodeServiceability.cityName);
          const serviceableData = g(data, 'getPincodeServiceability');
          if (serviceableData && serviceableData?.cityName != '') {
            let obj = {
              cityId: serviceableData.cityID?.toString() || 0,
              stateId: serviceableData.stateID?.toString() || 0,
              state: serviceableData.stateName || '',
              city: serviceableData.cityName || '',
            };
            setDiagnosticServiceabilityData!(obj);
            setDiagnosticLocationServiceable!('true');
            setServiceabilityMsg('');
          } else {
            setDiagnosticLocationServiceable!('false');
            setLoadingContext!(false);
            renderLocationNotServingPopUpForPincode(pincode);
          }
          setshowLocationpopup(false);
          updatePlaceInfoByPincode(pincode);
        })
        .catch((e) => {
          CommonBugFender('Tests_', e);
          setLoadingContext!(false);
          console.log('getDiagnosticsPincode serviceability Error\n', { e });
          showAphAlert!({
            unDismissable: true,
            title: 'Uh oh! :(',
            description:
              "Something went wrong. We're unable to check diagnostics serviceability for your location.",
          });
        });
    }
  };

  const renderTopView = () => {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingTop: 16,
          paddingBottom: 12,
          paddingHorizontal: 20,
          backgroundColor: theme.colors.WHITE,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          // onPress={() => props.navigation.popToTop()}
          onPress={() => {
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [
                  NavigationActions.navigate({
                    routeName: AppRoutes.ConsultRoom,
                  }),
                ],
              })
            );
          }}
        >
          <ApolloLogo style={{ width: 57, height: 37 }} resizeMode="contain" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          {renderDeliverToLocationMenuAndCTA()}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.navigation.navigate(AppRoutes.MedAndTestCart)}
          >
            <CartIcon />
            {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
          </TouchableOpacity>
          {/* <NotificationIcon /> */}
        </View>
      </View>
    );
  };

  /*
  const uploadPrescriptionCTA = () => {
    return (
      <ListCard
        onPress={() => {
          postMyOrdersClicked('Diagnostics', currentPatient);
          props.navigation.navigate(AppRoutes.YourOrdersTest);
        }}
        container={{
          marginBottom: 24,
          marginTop: 20,
        }}
        title={'My Orders'}
        leftIcon={<TestsIcon />}
      />
    );
  };
*/
  const renderYourOrders = () => {
    // if (ordersLoading) return renderSectionLoader(70);
    return (
      // (!ordersLoading && ordersFetched.length > 0 && (
      <ListCard
        onPress={() => {
          postMyOrdersClicked('Diagnostics', currentPatient);
          setLoadingContext!(true);
          props.navigation.navigate(AppRoutes.YourOrdersTest, {
            orders: ordersFetched,
            isTest: true,
            refetch: ordersRefetch,
            error: ordersError,
            loading: ordersLoading,
          });
        }}
        container={{
          marginBottom: 24,
          marginTop: 20,
        }}
        title={'My Orders'}
        leftIcon={<TestsIcon />}
      />
    );
  };

  const renderCatalogCard = (
    text: string,
    imgUrl: string,
    onPress: () => void,
    style?: ViewStyle
  ) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        <View
          style={[
            {
              ...theme.viewStyles.card(12, 0),
              elevation: 10,
              flexDirection: 'row',
              width: 152,
              height: 68,
            },
            style,
          ]}
        >
          <Image
            source={{ uri: imgUrl }}
            style={{
              height: 40,
              width: 40,
            }}
          />
          <View style={{ width: 16 }} />
          <Text
            numberOfLines={2}
            style={{
              flex: 1,
              ...theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0),
            }}
          >
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const hotSellerCard = (data: {
    name: string;
    imgUrl: string;
    price: number;
    specialPrice?: number;
    circlePrice?: number;
    circleSpecialPrice?: number;
    isAddedToCart: boolean;
    onAddOrRemoveCartItem: () => void;
    onPress: () => void;
    style?: ViewStyle;
    discount: number | string;
    circleDiscount: number | string;
  }) => {
    const {
      name,
      imgUrl,
      price,
      specialPrice,
      circlePrice,
      circleSpecialPrice,
      style,
      discount,
      circleDiscount,
    } = data;

    const promoteCircle = discount < circleDiscount;

    const renderDiscountedPrice = () => {
      const styles = StyleSheet.create({
        discountedPriceText: {
          ...theme.viewStyles.text('M', 14, '#02475b', 0.4, 24),
          textAlign: 'left',
        },
        priceText: {
          ...theme.viewStyles.text('SB', 14, '#01475B', 1, 24),
          textAlign: 'left',
        },
      });
      return (
        <View
          style={[
            {
              flexDirection: 'row',
              marginBottom: 4, //8
            },
          ]}
        >
          {/**
           * if promote circle - sub/non-sub don't show top view price
           */}
          {promoteCircle ? null : (
            <View style={{ flexDirection: 'row' }}>
              {/**
               * if special price exists
               */}
              {specialPrice != price && (
                <Text
                  style={{
                    marginRight: 4,
                    ...theme.viewStyles.text('SB', 12, '#01475B', 0.5, 24),
                    textDecorationLine: 'line-through',
                    marginTop: 15, //added
                  }}
                >
                  {string.common.Rs} {price}
                </Text>
              )}

              <Text
                style={{
                  marginRight: 4,
                  ...theme.viewStyles.text('SB', 14, '#01475B', 1, 24),
                  textDecorationLine: 'none',
                  marginTop: 15, //added
                }}
              >
                {string.common.Rs} {specialPrice || price}
              </Text>
            </View>
          )}
          {/**
           * useless view..
           */}
          {promoteCircle && !!specialPrice && specialPrice != price && (
            <Text style={styles.discountedPriceText}>
              (
              <Text
                style={[
                  {
                    textDecorationLine: 'line-through',
                  },
                ]}
              >
                {string.common.Rs} {price}
              </Text>
              )
            </Text>
          )}
        </View>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        <View
          style={{
            ...theme.viewStyles.card(12, 0),
            elevation: 10,
            height: 210, //220
            width: 180, //152
            marginHorizontal: 4,
            alignItems: 'flex-start', //center
            ...style,
          }}
        >
          {renderDiscountTag(
            promoteCircle && isDiagnosticCircleSubscription ? circleDiscount : discount,
            'tests'
          )}
          <Image
            placeholderStyle={styles.imagePlaceholderStyle}
            source={{ uri: imgUrl }}
            style={{
              height: 40,
              width: 40,
              marginBottom: 8,
            }}
          />
          <View style={{ height: 47.5 }}>
            <Text
              style={{
                ...theme.viewStyles.text('M', 14, '#01475b', 1, 20),
                textAlign: 'left', //center
                textTransform: 'capitalize',
              }}
              numberOfLines={2}
            >
              {name}
            </Text>
          </View>
          <Spearator style={{ marginBottom: 7.5 }} />
          {renderDiscountedPrice()}
          {promoteCircle
            ? renderCircleView(circleSpecialPrice!, specialPrice! || price!, promoteCircle)
            : null}

          <Text
            style={{
              ...theme.viewStyles.text(
                'B',
                13,
                isDiagnosticLocationServiceable ? '#fc9916' : '#FED984',
                1,
                24
              ),
              textAlign: 'left',
              position: 'absolute',
              left: 16,
              bottom: 10,
            }}
            onPress={data.onAddOrRemoveCartItem}
          >
            {data.isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCircleView = (circleSpecialPrice: number, price: number, promoteCircle: boolean) => {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <CircleHeading isSubscribed={isDiagnosticCircleSubscription} />
          {!isDiagnosticCircleSubscription && (
            <Text
              style={{
                ...theme.viewStyles.text(
                  isDiagnosticCircleSubscription ? 'SB' : 'M',
                  isDiagnosticCircleSubscription ? 14 : 12,
                  colors.SHERPA_BLUE,
                  1,
                  15.6
                ),
                marginLeft: 15,
                alignSelf: 'center',
              }}
            >
              {' '}
              {string.common.Rs} {circleSpecialPrice}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row' }}>
          {isDiagnosticCircleSubscription && promoteCircle && (
            <Text
              style={{
                marginVertical: 5,
                marginHorizontal: 5,
                textAlign: 'left',
                ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.5, 15.6),
                textDecorationLine: 'line-through',
              }}
            >
              {string.common.Rs} {price}
            </Text>
          )}
          <Text
            style={{
              marginVertical: 5,
              marginHorizontal: 2,
              textAlign: 'left',
              ...theme.viewStyles.text(
                // isDiagnosticCircleSubscription ? 'SB' : 'M',
                // isDiagnosticCircleSubscription ? 14 : 12,
                'B',
                14,
                colors.SHERPA_BLUE,
                1,
                15.6
              ),
            }}
          >
            {string.common.Rs} {isDiagnosticCircleSubscription ? circleSpecialPrice : price}
          </Text>
        </View>
      </View>
    );
  };

  const renderDiscountTag = (discount: string | number, comingFrom: string) => {
    return (
      <>
        {!!discount ? (
          <View style={styles.discountTagView}>
            <OfferIcon
              style={{
                height: comingFrom == 'tests' ? 36 : 45,
                width: comingFrom == 'tests' ? 40 : 45,
              }}
            />
            <Text
              style={[
                styles.discountTagText,
                {
                  ...theme.viewStyles.text('B', comingFrom == 'tests' ? 10 : 12, '#ffffff', 1, 24),
                  top: comingFrom == 'tests' ? 0 : 5,
                },
              ]}
            >
              -{Number(discount).toFixed(0)}%
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const getActiveItems = (getDiagnosticPricingForItem: any) => {
    const itemWithAll = getDiagnosticPricingForItem!.find(
      (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
    );
    const itemWithSub = getDiagnosticPricingForItem!.find(
      (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
    );

    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    const isItemActive =
      isDiagnosticCircleSubscription && itemWithSub
        ? itemWithSub!.status == 'active' &&
          isItemPriceActive(itemWithSub?.startDate!, itemWithSub?.endDate!, currentDate)
        : itemWithAll &&
          itemWithAll!.status == 'active' &&
          isItemPriceActive(itemWithAll?.startDate!, itemWithAll?.endDate!, currentDate);

    const activeItemsObject = {
      itemWithAll: itemWithAll,
      itemWithSub: itemWithSub,
      isItemActive: isItemActive,
    };

    return activeItemsObject;
  };

  const renderHotSellerItem = (
    data: ListRenderItemInfo<
      getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers
    >
  ) => {
    const getDiagnosticPricingForItem = g(data, 'item', 'diagnostics', 'diagnosticPricing');
    const getActiveItemsObject = getActiveItems(getDiagnosticPricingForItem);
    const itemWithAll = getActiveItemsObject?.itemWithAll;
    const itemWithSub = getActiveItemsObject?.itemWithSub;

    if (!getActiveItemsObject?.isItemActive) {
      return null;
    }
    const { packageImage, packageName, diagnostics } = data.item;
    const foundTestInCart = !!cartItems.find((item) => item.id == `${diagnostics?.itemId}`);

    //check wrt to plan
    const specialPrice = itemWithAll?.price!;
    const price = itemWithAll?.mrp!; //more than price (black)
    const circlePrice = itemWithSub?.mrp!;
    const circleSpecialPrice = itemWithSub?.price!;

    const discount = getDiscountPercentage(price, specialPrice);
    const circleDiscount = getDiscountPercentage(circlePrice, circleSpecialPrice);
    const promoteCircle = discount < circleDiscount;

    const addToCart = () => {
      if (!isDiagnosticLocationServiceable) {
        return;
      }
      postDiagnosticAddToCartEvent(
        diagnostics?.itemName!,
        `${diagnostics!.itemId}`,
        price,
        diagnostics?.diagnosticPricing?.[0]?.price!
      );
      addCartItem!({
        id: `${diagnostics!.itemId}`,
        mou: diagnostics?.inclusions == null ? 1 : diagnostics?.inclusions.length,
        name: diagnostics?.itemName!,
        price: price,
        specialPrice: specialPrice! | price,
        circlePrice: circlePrice,
        circleSpecialPrice: circleSpecialPrice,
        thumbnail: packageImage,
        collectionMethod: diagnostics?.collectionType!,
        groupPlan: promoteCircle ? itemWithSub?.groupPlan : itemWithAll?.groupPlan,
      });
    };
    const removeFromCart = () => {
      if (!isDiagnosticLocationServiceable) {
        return;
      }
      removeCartItem!(`${diagnostics?.itemId}`);
    };

    return hotSellerCard({
      name: diagnostics?.itemName!,
      imgUrl: packageImage!,
      price: price,
      specialPrice: specialPrice,
      circlePrice: circlePrice,
      circleSpecialPrice: circleSpecialPrice,
      isAddedToCart: foundTestInCart,
      discount: discount,
      circleDiscount: circleDiscount,
      onAddOrRemoveCartItem: foundTestInCart ? removeFromCart : addToCart,
      onPress: () => {
        if (!isDiagnosticLocationServiceable) {
          return;
        }
        setWebEnageEventForItemViewedOnLanding(
          packageName!,
          `${diagnostics?.itemId}`,
          `${diagnostics?.itemType}`
        );
        postFeaturedTestEvent(packageName!, `${diagnostics!.itemId}`);
        props.navigation.navigate(AppRoutes.TestDetails, {
          testDetails: {
            Rate: price, //PASS the value
            specialPrice: specialPrice! || price,
            circleRate: circlePrice,
            circleSpecialPrice: circleSpecialPrice,
            Gender: diagnostics!.gender,
            ItemID: `${diagnostics!.itemId}`,
            ItemName: diagnostics?.itemName!,
            collectionType: diagnostics?.collectionType,
            FromAgeInDays: diagnostics?.fromAgeInDays,
            ToAgeInDays: diagnostics?.toAgeInDays,
            preparation: diagnostics?.testPreparationData,
            testDescription: diagnostics?.testDescription,
            source: 'Landing Page',
            type: diagnostics!.itemType,
          } as TestPackageForDetails,
        });
      },
      style: {
        marginHorizontal: 4,
        marginTop: 16,
        marginBottom: 20,
        ...(data.index == 0 ? { marginLeft: 20 } : {}),
      },
    });
  };

  const renderHotSellers = () => {
    const hotSellers = (g(diagnosticsData, 'getDiagnosticsHomePageItems', 'diagnosticHotSellers') ||
      []) as getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers[];

    const hotSellersWithDiagnosticPricing = hotSellers!.filter(
      (item) => item?.diagnostics!.diagnosticPricing!.length > 0
    );

    if (!hLoading && (hotSellers.length == 0 || hotSellersWithDiagnosticPricing.length == 0))
      return null;
    return (
      <View>
        <SectionHeader leftText={'TOP TESTS'} />
        {hLoading ? (
          renderSectionLoader(188)
        ) : (
          <FlatList
            bounces={false}
            keyExtractor={(_, index) => `${index}`}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={hotSellersWithDiagnosticPricing}
            renderItem={renderHotSellerItem}
          />
        )}
      </View>
    );
  };

  // const renderBrowseByCondition = () => {
  //   return (
  //     <View>
  //       <SectionHeader leftText={'BROWSE BY CONDITION'} />
  //       <FlatList
  //         bounces={false}
  //         keyExtractor={(_, index) => `${index}`}
  //         showsHorizontalScrollIndicator={false}
  //         horizontal
  //         data={shopByOrgans}
  //         renderItem={({ item, index }) => {
  //           return renderCatalogCard(
  //             item.title,
  //             `${config.IMAGES_BASE_URL[0]}${item.image_url}`,
  //             () =>
  //               props.navigation.navigate(AppRoutes.MedicineListing, {
  //                 category_id: item.category_id,
  //                 title: `${item.title || 'Products'}`.toUpperCase(),
  //                 isTest: true,
  //               }),
  //             {
  //               marginHorizontal: 4,
  //               marginTop: 16,
  //               marginBottom: 20,
  //               ...(index == 0 ? { marginLeft: 20 } : {}),
  //             }
  //           );
  //         }}
  //       />
  //     </View>
  //   );
  // };

  const renderPackageCard = (
    title: string,
    subtitle: string,
    desc: string,
    price: number,
    specialPrice: number | undefined,
    discount: string | number,
    circleDiscount: string | number,
    circlePrice: number | undefined,
    circleSpecialPrice: number | undefined,
    promoteCircle: boolean,
    numberOfInclusions: number,
    imageUri: string,
    style: ViewStyle,
    isAddedToCart: boolean,
    onPress: () => void,
    onPressBookNow: () => void
  ) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[
          {
            width: Dimensions.get('window').width * 0.86,
            ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
            paddingVertical: 12,
          },
          style,
        ]}
        onPress={onPress}
      >
        {renderDiscountTag(
          promoteCircle && isDiagnosticCircleSubscription ? circleDiscount : discount,
          'packages'
        )}

        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <View style={styles.featuredPackageImageView}>
            <Image
              style={styles.featuredPackageImageStyle}
              source={{
                uri: imageUri,
              }}
            />
          </View>
          <View style={styles.featuredPackageTextView}>
            <Text
              style={{ ...theme.viewStyles.text('SB', 16, '#02475b', 1, 24) }}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
          }}
        >
          <View
            style={{
              flexGrow: 1,
            }}
          >
            <View>
              <Spearator style={{ marginTop: 4, marginBottom: 4 }} />
              <View
                style={{
                  flexDirection: 'row',
                  width: Dimensions.get('window').width * 0.4,
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    width:
                      numberOfInclusions > 1
                        ? Dimensions.get('window').width * 0.53
                        : Dimensions.get('window').width * 0.54,
                  }}
                >
                  <Text style={theme.viewStyles.text('M', 11, colors.SHERPA_BLUE, 1, 22)}>
                    {desc}
                  </Text>
                </View>
                <View style={{ alignSelf: 'flex-end' }}>
                  <Text
                    style={{
                      ...theme.viewStyles.text('M', 11, colors.SHERPA_BLUE, 1, 22),
                    }}
                  >
                    {numberOfInclusions} {numberOfInclusions > 1 ? 'TESTS' : 'TEST'} INCLUDED
                  </Text>
                </View>
              </View>
              <Spearator style={{ marginTop: 4, marginBottom: 4 }} />
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flex: 1,
          }}
        >
          <View
            style={{
              flexGrow: 1,
            }}
          >
            {promoteCircle && (
              <View style={{ flexDirection: 'row' }}>
                <View style={{ alignSelf: 'flex-start', marginRight: 5 }}>
                  <CircleHeading isSubscribed={isDiagnosticCircleSubscription} />
                </View>
                {!isDiagnosticCircleSubscription && (
                  <Text style={styles.nonSubPrice}>
                    {string.common.Rs}
                    {promoteCircle ? circleSpecialPrice : specialPrice || price}
                  </Text>
                )}
              </View>
            )}
            {/**
             * original price (main price to be shown)
             */}
            <View style={{ flexDirection: 'row' }}>
              {/**
               *  not to promote + non sub + slashed
               */}
              {!promoteCircle &&
                !!specialPrice &&
                specialPrice != price &&
                !isDiagnosticCircleSubscription && (
                  <Text style={styles.nonSubStrikedPrice}>
                    ({string.common.Rs} {price})
                  </Text>
                )}

              {/**
               * slashed price in case prmote circle + sub or slashed price
               */}
              {((!!specialPrice && specialPrice != price) || promoteCircle) &&
                isDiagnosticCircleSubscription && (
                  <Text
                    style={{
                      ...theme.viewStyles.text('SB', 12, '#02475b', 0.6, 24),
                      textAlign: 'left',
                      marginRight: 5,
                    }}
                  >
                    (
                    <Text
                      style={[
                        {
                          textDecorationLine:
                            !isDiagnosticCircleSubscription && promoteCircle
                              ? 'none'
                              : 'line-through',
                        },
                      ]}
                    >
                      {string.common.Rs} {price}
                    </Text>
                    )
                  </Text>
                )}
              <Text
                style={{
                  marginRight: 8,
                  ...theme.viewStyles.text('SB', 14, '#02475b', 1, 24),
                }}
              >
                {string.common.Rs}
                {promoteCircle && circleSpecialPrice! && isDiagnosticCircleSubscription
                  ? circleSpecialPrice
                  : specialPrice || price}
              </Text>
              {/**
               * add to cart
               */}
              <View style={styles.addToCartView}>
                <Text
                  style={theme.viewStyles.text('B', 13, '#fc9916', 1, 24)}
                  onPress={onPressBookNow}
                >
                  {isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const errorAlert = () => {
    showAphAlert!({
      title: 'Uh oh! :(',
      description: 'Unable to fetch package details.',
    });
  };

  const fetchPackageDetails = (
    itemIds: string,
    func: (
      product: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics
    ) => void
  ) => {
    const removeSpaces = itemIds.replace(/\s/g, '');
    const arrayOfId = removeSpaces.split(',');
    const listOfIds = arrayOfId.map((item) => parseInt(item!));
    {
      setLoadingContext!(true);
      client
        .query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
          query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
          variables: {
            cityID: parseInt(diagnosticServiceabilityData?.cityId!) || 9,
            itemIDs: listOfIds,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          setLoadingContext!(false);
          aphConsole.log('findDiagnosticsItemsForCityId\n', { data });
          const product = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics', '0' as any);
          if (product) {
            func && func(product);
          } else {
            errorAlert();
          }
        })
        .catch((e) => {
          CommonBugFender('Tests_fetchPackageDetails', e);
          setLoadingContext!(false);
          aphConsole.log({ e });
          errorAlert();
        });
      // .finally(() => {
      //   setLoadingContext!(false);
      // });
    }
  };

  const fetchPackageInclusion = (id: string, func: (tests: PackageInclusion[]) => void) => {
    setLoadingContext!(true);
    getPackageData(id)
      .then(({ data }) => {
        setLoadingContext!(false);
        console.log('getPackageData\n', { data });
        const product = g(data, 'data');
        if (product && product.length) {
          func && func(product);
        } else {
          errorAlert();
        }
      })
      .catch((e) => {
        CommonBugFender('Tests_fetchPackageInclusion', e);
        setLoadingContext!(false);
        console.log('getPackageData Error\n', { e });
        errorAlert();
      });
    // .finally(() => {
    //   setLoadingContext!(false);
    // });
  };

  const renderTestPackages = () => {
    const shopByOrgans = (g(diagnosticsData, 'getDiagnosticsHomePageItems', 'diagnosticOrgans') ||
      []) as getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans[];

    const PackagesWithDiagnosticPricing = shopByOrgans!.filter(
      (item) => item?.diagnostics!.diagnosticPricing!.length > 0
    );
    if (!loading && PackagesWithDiagnosticPricing.length == 0) return null;

    return (
      <View>
        <SectionHeader leftText={'FEATURED PACKAGES'} />
        {loading ? (
          renderSectionLoader(205)
        ) : (
          <FlatList
            bounces={false}
            keyExtractor={(_, index) => `${index}`}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={PackagesWithDiagnosticPricing}
            renderItem={({ item, index }) => {
              const getDiagnosticPricingForItem = g(item, 'diagnostics', 'diagnosticPricing');
              const getActiveItemsObject = getActiveItems(getDiagnosticPricingForItem);
              const itemWithAll = getActiveItemsObject?.itemWithAll;
              const itemWithSub = getActiveItemsObject?.itemWithSub;

              if (!getActiveItemsObject?.isItemActive) {
                return null;
              }

              const specialPrice = itemWithAll?.price!;
              const price = itemWithAll?.mrp!;
              const circlePrice = itemWithSub?.mrp!;
              const circleSpecialPrice = itemWithSub?.price;

              const discount = getDiscountPercentage(price!, specialPrice!);
              const circleDiscount = getDiscountPercentage(circlePrice!, circleSpecialPrice!);
              const promoteCircle = discount < circleDiscount;

              const diagnosticItem = item?.diagnostics;
              const fromAge = (diagnosticItem?.fromAgeInDays! / 365).toFixed(0);
              const toAge = (diagnosticItem?.toAgeInDays! / 365).toFixed(0);

              const desc = '';
              const applicableAge = `For all Age Group`;
              const numberOfInclusions = diagnosticItem?.inclusions?.length || 1;

              return renderPackageCard(
                diagnosticItem?.itemName!,
                desc,
                applicableAge,
                price,
                specialPrice,
                discount,
                circleDiscount,
                circlePrice,
                circleSpecialPrice,
                promoteCircle,
                numberOfInclusions,
                item.organImage!,
                {
                  marginHorizontal: 4,
                  marginTop: 16,
                  marginBottom: 20,
                  ...(index == 0 ? { marginLeft: 20 } : {}),
                },
                !!cartItems.find((_item) => _item.id == String(diagnosticItem?.itemId!)),
                () => {
                  fetchPackageDetails(String(diagnosticItem?.itemId!), (product) => {
                    if (!isDiagnosticLocationServiceable) {
                      return;
                    }
                    props.navigation.navigate(AppRoutes.TestDetails, {
                      testDetails: {
                        // ...item.diagnostics,
                        Gender: product?.gender,
                        ItemID: `${product?.itemId}`,
                        ItemName: product?.itemName!,
                        Rate: price,
                        specialPrice: specialPrice! || price,
                        circleRate: circlePrice,
                        circleSpecialPrice: circleSpecialPrice,
                        collectionType: product?.collectionType,
                        preparation: product?.testPreparationData,
                        testDescription: product?.testDescription,
                        source: 'Landing Page',
                        type: product?.itemType,
                      } as TestPackageForDetails,
                      type: 'Package',
                    });
                  });
                },
                () => {
                  const isAddedToCart = !!cartItems.find(
                    (item) => item.id == String(diagnosticItem?.itemId!)
                  );

                  fetchPackageDetails(String(diagnosticItem?.itemId!), (product) => {
                    if (!isDiagnosticLocationServiceable) {
                      return;
                    }
                    isAddedToCart
                      ? removeCartItem!(`${diagnosticItem?.itemId}`)
                      : addCartItem!({
                          id: String(diagnosticItem?.itemId),
                          name: diagnosticItem?.itemName!,
                          mou:
                            diagnosticItem?.inclusions == null
                              ? 1
                              : diagnosticItem?.inclusions.length,
                          price: price,
                          thumbnail: '',
                          specialPrice: specialPrice! || price,
                          circlePrice: circlePrice,
                          circleSpecialPrice: circleSpecialPrice,
                          collectionMethod: product?.collectionType!,
                          groupPlan: promoteCircle
                            ? itemWithSub?.groupPlan
                            : itemWithAll?.groupPlan,
                        });
                  });
                }
              );
            }}
          />
        )}
      </View>
    );
  };

  const preventiveTestCard = (name: string, price: number, style: ViewStyle) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[
          {
            ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
            paddingBottom: 12,
          },
          style,
        ]}
      >
        <Text style={theme.viewStyles.text('M', 14, '#01475b', 1, 22)}>{name}</Text>
        <Spearator style={{ marginVertical: 7.5 }} />
        <Text style={theme.viewStyles.text('B', 14, '#01475b', 1, 20)}>
          {string.common.Rs} {price}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPreventiveTests = () => {
    const preventiveTests = Array.from({
      length: 10,
    }).map((_) => ({
      name: 'Blood Glucose Test',
      price: 120,
    }));

    return (
      <View>
        <SectionHeader leftText={'SOME PREVENTIVE TESTS FOR YOU'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={preventiveTests}
          renderItem={({ item, index }) => {
            return preventiveTestCard(item.name, item.price, {
              marginHorizontal: 4,
              marginTop: 16,
              marginBottom: 20,
              ...(index == 0 ? { marginLeft: 20 } : {}),
            });
          }}
        />
      </View>
    );
  };

  const renderTestsByOrgan = () => {
    const shopByOrgans = (g(diagnosticsData, 'getDiagnosticsHomePageItems', 'diagnosticOrgans') ||
      []) as getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans[];

    if (!hLoading && shopByOrgans.length == 0) return null;
    return (
      <View style={{ marginTop: 10 }}>
        <SectionHeader leftText={'FEATURED PACKAGES'} />
        {hLoading ? (
          renderSectionLoader()
        ) : (
          <FlatList
            bounces={false}
            keyExtractor={(_, index) => `${index}`}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={shopByOrgans}
            renderItem={({ item, index }) => {
              return renderCatalogCard(
                item.organName!,
                item.organImage!,
                () => {
                  if (!isDiagnosticLocationServiceable) {
                    return;
                  }
                  setWebEnageEventForItemViewedOnLanding(item.organName!, item.id!, 'Package');
                  postBrowsePackageEvent(item.organName!);
                  props.navigation.navigate(AppRoutes.TestsByCategory, {
                    title: `${item.organName || 'Products'}`.toUpperCase(),
                    products: [item.diagnostics],
                  });
                },
                {
                  marginHorizontal: 4,
                  marginTop: 16,
                  marginBottom: 20,
                  ...(index == 0 ? { marginLeft: 20 } : {}),
                }
              );
            }}
          />
        )}
      </View>
    );
  };

  const renderNeedHelp = () => {
    return (
      <NeedHelpAssistant
        navigation={props.navigation}
        containerStyle={{
          paddingBottom: 20,
          paddingTop: 20,
        }}
        onNeedHelpPress={() => {
          postWEGNeedHelpEvent(currentPatient, 'Tests');
        }}
      />
    );
  };

  const onAddCartItem = (
    {
      itemId,
      itemName,
      rate,
      collectionType,
      diagnosticPricing,
    }: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics,
    testsIncluded: number,
    pricesObject: any,
    promoteCircle: boolean
  ) => {
    console.log({ diagnosticPricing });
    savePastSearch(`${itemId}`, itemName).catch((e) => {
      aphConsole.log({ e });
    });
    postDiagnosticAddToCartEvent(stripHtml(itemName), `${itemId}`, rate, rate);
    const itemWithAll = diagnosticPricing?.find(
      (item) => item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
    );
    const itemWithSub = diagnosticPricing?.find(
      (item) => item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
    );
    addCartItem!({
      id: `${itemId}`,
      name: stripHtml(itemName),
      price: pricesObject?.rate,
      specialPrice: pricesObject?.specialPrice! || pricesObject?.rate,
      circlePrice: pricesObject?.circlePrice,
      circleSpecialPrice: pricesObject?.circleSpecialPrice,
      mou: testsIncluded,
      thumbnail: '',
      collectionMethod: collectionType!,
      groupPlan: promoteCircle ? itemWithSub?.groupPlan : itemWithAll?.groupPlan,
    });
  };

  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<
    searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  >([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [isSearchFocused, setSearchFocused] = useState(false);
  const client = useApolloClient();

  const onSearchTest = (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      if (!g(locationForDiagnostics, 'cityId')) {
        renderLocationNotServingPopup();
        return;
      }
      if (!(_searchText && _searchText.length > 2)) {
        setMedicineList([]);
        console.log('onSearchMedicine');
        return;
      }
      setShowMatchingMedicines(true);
      setsearchSate('load');

      client
        .query<searchDiagnosticsByCityID, searchDiagnosticsByCityIDVariables>({
          query: SEARCH_DIAGNOSTICS_BY_CITY_ID,
          variables: {
            searchText: _searchText,
            cityID: parseInt(locationForDiagnostics?.cityId!, 10),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const products = g(data, 'searchDiagnosticsByCityID', 'diagnostics') || [];
          setMedicineList(
            products as searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
          );
          setsearchSate('success');
          setWebEngageEventOnSearchItem(_searchText, products);
        })
        .catch((e) => {
          CommonBugFender('Tests_onSearchMedicine', e);
          setsearchSate('fail');
        });
    }
  };

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      if (data) {
        if (data?.APOLLO?.[0]._id) {
          setCircleSubscriptionId && setCircleSubscriptionId(data?.APOLLO?.[0]._id);
          setIsCircleSubscription && setIsCircleSubscription(true);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(true);
        } else {
          setCircleSubscriptionId && setCircleSubscriptionId('');
          setIsCircleSubscription && setIsCircleSubscription(false);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
        }
      }
    } catch (error) {
      CommonBugFender('Diagnositic_Landing_Page_Tests_GetSubscriptionsOfUserByStatus', error);
    }
  };

  interface SuggestionType {
    itemId: string | number;
    itemName: string;
    rate: number;
    collectionType: string | null;
    type: 'TEST' | 'PACKAGE';
    imgUri?: string;
    onPress: () => void;
    showSeparator?: boolean;
    specialPrice?: number;
    circlePrice?: number;
    circleSpecialPrice?: number;
    diagnosticPricing?: any;
    style?: ViewStyle;
  }
  const renderSearchSuggestionItem = (data: SuggestionType) => {
    const localStyles = StyleSheet.create({
      containerStyle: {
        ...data.style,
      },
      iconAndDetailsContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 9.5,
        marginHorizontal: 12,
      },
      iconOrImageContainerStyle: {
        width: 40,
      },
      nameAndPriceViewStyle: {
        flex: 1,
      },
    });

    const renderNamePriceAndInStockStatus = () => {
      const discount = getDiscountPercentage(data.rate!, data.specialPrice!);
      const circleDiscount = getDiscountPercentage(data.circlePrice!, data.circleSpecialPrice);

      const promoteCircle = discount < circleDiscount;
      const pricesObject = {
        rate: data.rate,
        specialPrice: data.specialPrice! | data.rate,
        circlePrice: data.circlePrice,
        circleSpecialPrice: data.circleSpecialPrice,
      };
      const isAddedToCart = !!cartItems.find((item) => item.id == data.itemId);

      return (
        <View style={[localStyles.nameAndPriceViewStyle]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {<View style={{ marginLeft: -16 }}>{renderIconOrImage()}</View>}

            <View style={{ flex: 0.9 }}>
              <Text
                numberOfLines={1}
                style={{
                  ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0),
                }}
              >
                {data.itemName}
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() =>
                  isAddedToCart
                    ? removeCartItem!(`${data.itemId}`)
                    : fetchPackageInclusion(`${data.itemId}`, (tests) => {
                        onAddCartItem(data, tests.length, pricesObject, promoteCircle);
                      })
                }
              >
                {isAddedToCart ? <RemoveIcon /> : <AddIcon />}
              </TouchableOpacity>
            </View>
          </View>
          {/* <Spearator style={{ marginTop: 6, marginBottom: 2 }} /> */}

          {/**
           * show special price only when do not promote circle ~~~ merge below two checks
           */}
          {!promoteCircle && data.specialPrice != data.rate && (
            <View style={{ alignSelf: 'flex-end', marginBottom: 1 }}>
              <Text style={styles.strikedPrice}>
                {string.common.Rs} {data.rate}
              </Text>
            </View>
          )}
          {isDiagnosticCircleSubscription && promoteCircle && (
            <View style={{ alignSelf: 'flex-end', marginBottom: 1 }}>
              <Text style={styles.strikedPrice}>
                {string.common.Rs} {data.specialPrice! || data.rate}
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              marginTop: 4,
            }}
          >
            {/**
             * non member with promote circle
             */}

            {!isDiagnosticCircleSubscription && promoteCircle && data.circleSpecialPrice! && (
              <>
                <View style={{ flexDirection: 'row' }}>
                  <CircleHeading />
                  <Text
                    style={{
                      marginLeft: 5,
                      ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
                    }}
                  >
                    {string.common.Rs} {data.circleSpecialPrice!}
                  </Text>
                </View>
                <View
                  style={{
                    borderLeftWidth: 1,
                    borderLeftColor: '#02475b',
                    opacity: 0.3,
                    marginLeft: 4,
                    marginRight: 4,
                    marginTop: 4,
                  }}
                />
              </>
            )}
            {!isDiagnosticCircleSubscription && promoteCircle && (
              <Text style={styles.normalPrice}>
                {string.common.Rs} {data.specialPrice! || data.rate}
              </Text>
            )}
            {!isDiagnosticCircleSubscription && !promoteCircle && (
              <Text style={styles.normalPrice}>
                {string.common.Rs} {data.specialPrice! || data.rate}
              </Text>
            )}
            {isDiagnosticCircleSubscription && !promoteCircle && (
              <Text style={styles.normalPrice}>
                {string.common.Rs} {data.specialPrice! || data.rate}
              </Text>
            )}
            {/**
             * sub + promote
             */}
            {isDiagnosticCircleSubscription && promoteCircle && (
              <View style={{ flexDirection: 'row' }}>
                <CircleHeading isSubscribed={isDiagnosticCircleSubscription} />
                <Text
                  style={[
                    styles.normalPrice,
                    {
                      marginLeft: 5,
                    },
                  ]}
                >
                  {string.common.Rs} {data.circleSpecialPrice!}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    };

    const renderIconOrImage = () => {
      return (
        <View style={localStyles.iconOrImageContainerStyle}>
          {data.imgUri ? (
            <Image
              placeholderStyle={styles.imagePlaceholderStyle}
              source={{ uri: data.imgUri }}
              style={{
                height: 40,
                width: 40,
              }}
              resizeMode="contain"
            />
          ) : data.type == 'PACKAGE' ? (
            <TestsIcon />
          ) : (
            <TestsIcon />
          )}
        </View>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        <View style={localStyles.containerStyle} key={data.itemName}>
          <View style={localStyles.iconAndDetailsContainerStyle}>
            <View style={{ width: 16 }} />
            {renderNamePriceAndInStockStatus()}
          </View>
          {data.showSeparator ? <Spearator /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const renderSearchBar = () => {
    const isFocusedStyle = scrollOffset > 10 || isSearchFocused;

    const styles = StyleSheet.create({
      inputStyle: {
        minHeight: 29,
        ...theme.fonts.IBMPlexSansMedium(18),
      },
      inputContainerStyle: isFocusedStyle
        ? {
            borderRadius: 5,
            backgroundColor: colors.WHITE,
            marginHorizontal: 10,
            borderWidth: 1,
            borderColor: colors.APP_GREEN,
          }
        : {
            borderRadius: 5,
            backgroundColor: colors.WHITE, //'#f7f8f5'
            marginHorizontal: 10,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.APP_GREEN,
          },
      leftIconContainerStyle: scrollOffset > 10 ? { paddingLeft: isSearchFocused ? 0 : 16 } : {},
      rightIconContainerStyle: isFocusedStyle
        ? {
            height: 24,
          }
        : {},
      style: isFocusedStyle
        ? {
            paddingBottom: 18.5,
          }
        : { borderRadius: 5 },
      containerStyle: isFocusedStyle
        ? {
            marginBottom: 20,
            marginTop: 8,
          }
        : {
            marginBottom: 20,
            marginTop: 12,
            alignSelf: 'center',
          },
    });

    const shouldEnableSearchSend = searchText.length > 2;
    const rigthIconView = (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: shouldEnableSearchSend ? 1 : 0.4,
          marginRight: 5,
        }}
        disabled={!shouldEnableSearchSend}
        onPress={() => {
          props.navigation.navigate(AppRoutes.SearchTestScene, {
            searchText: searchText,
          });
          setSearchText('');
          setMedicineList([]);
        }}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

    const leftIconView = (
      <SearchIcon
        style={{
          marginLeft: -16,
          height: 21,
          width: 21,
          tintColor: colors.APP_GREEN,
          marginRight: 5,
        }}
      />
    );

    const itemsNotFound =
      searchSate == 'success' && searchText.length > 2 && medicineList.length == 0;
    return (
      <View pointerEvents={isDiagnosticLocationServiceable ? 'auto' : 'none'}>
        <Input
          autoFocus={!locationDetails ? false : focusSearch}
          onSubmitEditing={() => {
            if (searchText.length > 2) {
              props.navigation.navigate(AppRoutes.SearchTestScene, {
                searchText: searchText,
              });
            }
          }}
          value={searchText}
          autoCapitalize="none"
          spellCheck={false}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            setSearchFocused(false);
            setMedicineList([]);
            setSearchText('');
            setsearchSate('success');
          }}
          onChangeText={(value) => {
            if (isValidSearch(value)) {
              if (!g(locationForDiagnostics, 'cityId')) {
                renderLocationNotServingPopup();
                return;
              }
              setSearchText(value);
              if (!(value && value.length > 2)) {
                setMedicineList([]);
                return;
              }
              const search = _.debounce(onSearchTest, 300);
              setSearchQuery((prevSearch: any) => {
                if (prevSearch.cancel) {
                  prevSearch.cancel();
                }
                return search;
              });
              search(value);
            }
          }}
          leftIcon={isSearchFocused ? <View /> : leftIconView}
          autoCorrect={false}
          rightIcon={isSearchFocused ? rigthIconView : <View />}
          placeholder="Search tests &amp; packages"
          selectionColor={itemsNotFound ? '#890000' : '#00b38e'}
          underlineColorAndroid="transparent"
          placeholderTextColor="rgba(1,48,91, 0.4)"
          inputStyle={styles.inputStyle}
          inputContainerStyle={[
            styles.inputContainerStyle,
            itemsNotFound
              ? {
                  borderBottomColor: '#890000',
                }
              : {},
          ]}
          leftIconContainerStyle={styles.leftIconContainerStyle}
          rightIconContainerStyle={styles.rightIconContainerStyle}
          style={styles.style}
          containerStyle={styles.containerStyle}
          errorStyle={{
            ...theme.viewStyles.text('M', 12, '#890000'),
            marginHorizontal: 10,
          }}
          errorMessage={
            itemsNotFound ? 'Sorry, we couldn’t find what you are looking for :(' : undefined
          }
        />
      </View>
    );
  };

  const renderDeliverToLocationMenuAndCTA = () => {
    const options = ['Auto Select Pincode', 'Enter Pincode Manually'].map((item) => ({
      key: item,
      value: item,
    }));

    return (
      <MaterialMenu
        options={options}
        itemContainer={styles.menuItemContainer}
        menuContainerStyle={[
          styles.menuMenuContainerStyle,
          {
            marginTop: hasLocation ? winWidth * 0.08 : 35,
            marginLeft: 10,
          },
        ]}
        scrollViewContainerStyle={styles.menuScrollViewContainerStyle}
        itemTextStyle={styles.menuItemTextStyle}
        bottomPadding={styles.menuBottomPadding}
        onPress={(item) => {
          if (item.value == options[0].value) {
            autoDetectLocation();
            setOptionSelected('Auto Detect');
          } else {
            setshowLocationpopup(true);
            setOptionSelected('Enter Manually');
          }
        }}
      >
        {renderDeliverToLocationCTA()}
      </MaterialMenu>
    );
  };

  const formatText = (text: string, count: number) =>
    text.length > count ? `${text.slice(0, count)}...` : text;

  const renderDeliverToLocationCTA = () => {
    const location = diagnosticLocation
      ? `${formatText(
          g(diagnosticLocation, 'city') || g(diagnosticLocation, 'state') || '',
          18
        )} ${g(diagnosticLocation, 'pincode')}`
      : `${formatText(g(locationDetails, 'city') || g(locationDetails, 'state') || '', 18)} ${g(
          locationDetails,
          'pincode'
        )}`;
    return (
      <View style={{ paddingLeft: 15, marginTop: 3.5 }}>
        {hasLocation ? (
          <View style={{ marginTop: -7.5, marginRight: 40 }}>
            <View style={{ flexDirection: 'row' }}>
              <View>
                <Text style={[styles.locationText, { textTransform: 'capitalize' }]}>
                  {location}
                </Text>
                {!serviceabilityMsg ? null : ( // <Spearator style={styles.locationTextUnderline} />
                  <View style={{ height: 2 }} />
                )}
              </View>

              <View style={styles.dropdownGreenContainer}>
                <LocationOn />
              </View>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: -3, marginRight: 3 }}>
            <LocationOff />
          </View>
        )}
      </View>
    );
  };

  const renderBanner = () => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.APP_GREEN,
          width: '100%',
          paddingVertical: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
        }}
      >
        <ShieldIcon />
        <View
          style={{
            borderRightWidth: 1,
            borderRightColor: 'rgba(2, 71, 91, 0.5)',
            marginHorizontal: 19.5,
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <Text style={theme.viewStyles.text('M', 14, theme.colors.WHITE, 1, 22)}>
            Most trusted diagnostics from the comfort of your home!
          </Text>
        </View>
      </View>
    );
  };

  const savePastSearch = (sku: string, name: string) =>
    client.mutate({
      mutation: SAVE_SEARCH,
      variables: {
        saveSearchInput: {
          type: SEARCH_TYPE.TEST,
          typeId: sku,
          typeName: name,
          patient: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
      },
    });

  const isItemPriceActive = (from: string, to: string, check: string) => {
    if (from == null || to == null) {
      return true;
    }
    var fDate, lDate, cDate;
    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = Date.parse(check);

    if (cDate <= lDate && cDate >= fDate) {
      return true;
    }
    return false;
  };

  /**
   *
   * search suggestions list
   */
  const renderSearchSuggestionItemView = (
    data: ListRenderItemInfo<searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics>
  ) => {
    const { index, item } = data;
    const imgUri = undefined; //`${config.IMAGES_BASE_URL[0]}${1}`;
    const {
      rate,
      gender,
      itemId,
      itemName,
      collectionType,
      fromAgeInDays,
      toAgeInDays,
      testPreparationData,
      testDescription,
      itemType,
      diagnosticPricing,
    } = item;

    const getActiveItemsObject = getActiveItems(diagnosticPricing);
    const itemWithAll = getActiveItemsObject?.itemWithAll;
    const itemWithSub = getActiveItemsObject?.itemWithSub;

    if (!getActiveItemsObject.isItemActive) {
      return null;
    }

    const specialPrice = itemWithAll?.price!;
    const price = itemWithAll?.mrp!; //more than price (black)
    const circlePrice = itemWithSub?.mrp!;
    const circleSpecialPrice = itemWithSub?.price;

    return renderSearchSuggestionItem({
      onPress: () => {
        savePastSearch(`${itemId}`, itemName).catch((e) => {});
        setWebEngageEventOnSearchItemClicked(item);
        props.navigation.navigate(AppRoutes.TestDetails, {
          testDetails: {
            Rate: price,
            specialPrice: specialPrice! || price,
            circleRate: circlePrice,
            circleSpecialPrice: circleSpecialPrice,
            Gender: gender,
            ItemID: `${itemId}`,
            ItemName: itemName,
            collectionType: collectionType,
            FromAgeInDays: fromAgeInDays,
            ToAgeInDays: toAgeInDays,
            preparation: testPreparationData,
            testDescription: testDescription,
            source: 'Landing Page',
            type: itemType,
          } as TestPackageForDetails,
        });
      },
      itemId: item.itemId,
      itemName: item.itemName,
      rate: price,
      collectionType: item.collectionType,
      type: 'TEST',
      style: {
        marginHorizontal: 20,
        paddingBottom: index == medicineList.length - 1 ? 10 : 0,
      },
      showSeparator: !(index == medicineList.length - 1),
      imgUri,
      specialPrice: specialPrice! || price,
      circlePrice: circlePrice,
      circleSpecialPrice: circleSpecialPrice,
      diagnosticPricing: diagnosticPricing!,
    });
  };

  const renderSearchSuggestions = () => {
    // if (medicineList.length == 0) return null;
    const testResults = medicineList!.filter((item) => item?.diagnosticPricing!.length > 0);
    return (
      <View
        style={{
          width: '100%',
          position: 'absolute',
        }}
      >
        {searchSate == 'load' ? (
          <View
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            }}
          >
            {renderSectionLoader(266)}
          </View>
        ) : (
          !!searchText &&
          searchText.length > 2 && (
            <FlatList
              keyboardShouldPersistTaps="always"
              // contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
              bounces={false}
              keyExtractor={(_, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              style={{
                paddingTop: testResults.length > 0 ? 10.5 : 0,
                maxHeight: 266,
                backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              }}
              data={testResults}
              renderItem={renderSearchSuggestionItemView}
            />
          )
        )}
      </View>
    );
  };

  const renderSearchBarAndSuggestions = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
        }}
        style={[
          (searchSate == 'success' || searchSate == 'fail') && medicineList.length == 0
            ? {
                height: '100%',
                width: '100%',
              }
            : searchText.length > 2
            ? {
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.8)',
              }
            : {},
        ]}
      >
        {renderSearchSuggestions()}
      </TouchableOpacity>
    );
  };

  const renderSections = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (medicineList.length == 0 && !searchText) return;
          setSearchText('');
          setMedicineList([]);
        }}
        style={{ flex: 1 }}
      >
        {renderBanner()}
        {/* {uploadPrescriptionCTA()} */}
        {renderYourOrders()}
        <>
          {renderHotSellers()}
          {renderCarouselBanners()}
          <View style={{ marginTop: 20 }}></View>
          {/* {renderBrowseByCondition()} */}
          {renderTestPackages()}
          {/* {renderTestsByOrgan()} */}
          {/* {renderPreventiveTests()} */}
        </>
        {/* {renderNeedHelp()} */}
      </TouchableOpacity>
    );
  };

  const renderLocationNotServingPopup = () => {
    showAphAlert!({
      title: `Hi ${currentPatient && currentPatient.firstName},`,
      description: string.diagnostics.nonServiceableMsg.replace(
        '{{city_name}}',
        g(locationDetails, 'displayName')!
      ),
      onPressOk: () => {
        hideAphAlert!();
        setshowLocationpopup(true);
      },
    });
  };

  const renderLocationNotServingPopUpForPincode = (pincode: string) => {
    showAphAlert!({
      title: `Hi ${currentPatient && currentPatient.firstName},`,
      description: string.diagnostics.nonServiceableConfigPinCodeMsg.replace(
        '{{pincode}}',
        pincode
      ),
      CTAs: [
        {
          text: 'GO TO HOMEPAGE',
          onPress: () => {
            hideAphAlert!();
            setBannerData && setBannerData([]);
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
              })
            );
          },
          type: 'orange-link',
        },
        {
          text: 'TRY ANOTHER PINCODE',
          onPress: () => {
            hideAphAlert!();
            setshowLocationpopup(true);
          },
          type: 'orange-link',
        },
      ],
    });
    setServiceabilityMsg(
      'Services currently unavailable in your area. Kindly try changing the location.'
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderTopView()}
        {!!serviceabilityMsg && (
          <View style={styles.serviceabiltyMessageBackground}>
            <View style={styles.serviceabiltyMessageView}>
              <View style={styles.serviceabiltyMessageInnerView}>
                <PendingIcon style={styles.pendingIconStyle} />
                <Text style={styles.serviceabilityMsg}>{serviceabilityMsg}</Text>
              </View>
            </View>
          </View>
        )}
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          bounces={false}
          stickyHeaderIndices={[1]}
          contentContainerStyle={[
            isSearchFocused && searchText.length > 2 && medicineList.length > 0 ? { flex: 1 } : {},
          ]}
        >
          <View style={{ height: 0, backgroundColor: theme.colors.WHITE }} />
          <View style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: 'white',
              }}
            >
              {renderSearchBar()}
            </View>
            {renderSearchBarAndSuggestions()}
          </View>
          <View style={[isSearchFocused && searchText.length > 2 ? { height: 0 } : {}]}>
            {renderSections()}
          </View>
        </ScrollView>
      </SafeAreaView>
      {renderPopup()}
    </View>
  );
};
