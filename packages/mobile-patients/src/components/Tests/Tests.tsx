import {
  LocationData,
  useAppCommonData,
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
  LocationOff,
  LocationOn,
  SearchSendIcon,
  TestsIcon,
  PendingIcon,
  OfferIcon,
  SearchIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  SAVE_SEARCH,
  GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  GET_DIAGNOSTIC_HOME_PAGE_ITEMS,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import { searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';

import {
  getTestsPackages,
  TestPackage,
  PackageInclusion,
  getPlaceInfoByPincode,
  getLandingPageBanners,
  getDiagnosticsSearchResults,
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
  Image as ImageNative,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  SEARCH_TYPE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
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
  getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsHomePageItems';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import {
  getPackageInclusions,
  getUserBannersList,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { getPricesForItem, sourceHeaders, convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import Carousel from 'react-native-snap-carousel';
import { DiagnosticsSearchSuggestionItem } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticsSearchSuggestionItem';

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
  hotSellerIcon: {
    height: 40,
    width: 40,
    marginBottom: 8,
  },
  hotSellerText: {
    ...theme.viewStyles.text('M', 14, '#01475b', 1, 20),
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  circleMainPriceText: {
    marginVertical: 5,
    marginHorizontal: 5,
    textAlign: 'left',
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.5, 15.6),
    textDecorationLine: 'line-through',
  },
  circleSellingPriceText: {
    marginVertical: 5,
    marginHorizontal: 2,
    textAlign: 'left',
    ...theme.viewStyles.text('B', 14, colors.SHERPA_BLUE, 1, 15.6),
  },
  sliderPlaceHolderStyle: {
    ...theme.viewStyles.imagePlaceholderStyle,
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  sliderDotStyle: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 9,
  },
  landingBannerInnerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  viewAllContainer: {
    paddingVertical: 10,
    paddingHorizontal: 60,
    backgroundColor: '#f7f8f5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  viewAllTouchView: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FCB716',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  viewAllText: { ...theme.viewStyles.text('B', 15, '#FCB716', 1, 20) },
});

export interface TestsProps
  extends NavigationScreenProps<{
    focusSearch?: boolean;
    comingFrom?: string;
  }> {}

export const Tests: React.FC<TestsProps> = (props) => {
  const focusSearch = props.navigation.getParam('focusSearch');
  const comingFrom = props.navigation.getParam('comingFrom');
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    isDiagnosticCircleSubscription,
    setIsDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const {
    cartItems: shopCartItems,
    setCircleSubscriptionId,
    setHdfcSubscriptionId,
    setIsCircleSubscription,
    setHdfcPlanName,
    setIsFreeDelivery,
    setCirclePlanValidity,
  } = useShoppingCart();
  const hdfc_values = string.Hdfc_values;
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
    locationForDiagnostics,
    diagnosticServiceabilityData,
    setDiagnosticServiceabilityData,
    isDiagnosticLocationServiceable,
    setDiagnosticLocationServiceable,
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
    context: {
      sourceHeaders,
    },
    variables: { cityID: parseInt(diagnosticServiceabilityData?.cityId!) || 9 },
    fetchPolicy: 'cache-first',
  });

  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();
  const [testPackages, setTestPackages] = useState<TestPackage[]>([]);
  const [locationError, setLocationError] = useState(false);
  const [searchQuery, setSearchQuery] = useState({});
  const [serviceabilityMsg, setServiceabilityMsg] = useState('');

  const [bannerLoading, setBannerLoading] = useState(true);
  const [imgHeight, setImgHeight] = useState(150);
  const [slideIndex, setSlideIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [itemsLoading, setItemsLoading] = useState<{ [key: string]: boolean }>({});

  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchResult, setSearchResults] = useState<boolean>(false);
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

  const setWebEngageEventOnSearchItem = (keyword: string, results: any[]) => {
    if (keyword.length > 2) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED] = {
        ...patientAttributes,
        'Keyword Entered': keyword,
        '# Results appeared': results.length,
      };
      postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED, eventAttributes);
    }
  };

  const setWebEnageEventForPinCodeClicked = (
    mode: string,
    pincode: string,
    serviceable: boolean
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR] = {
      ...patientAttributes,
      Mode: mode,
      Pincode: parseInt(pincode!),
      Serviceability: serviceable ? 'Yes' : 'No',
    };
    postWebEngageEvent(
      WebEngageEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR,
      eventAttributes
    );
  };

  /**
   * if any change in the location and pincode is changed
   */
  useEffect(() => {
    if (diagnosticPincode) {
      checkIsPinCodeServiceable(diagnosticPincode);
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
    getDiagnosticBanner();
    setBannerData && setBannerData([]); // default banners to be empty
  }, []);

  useEffect(() => {
    if (!loading && banners?.length > 0) {
      banners?.map((item: any) => {
        ImageNative.getSize(
          item?.bannerImage,
          (width, height) => {
            setImgHeight(height * (winWidth / width));
            setBannerLoading(false);
          },
          () => {
            setBannerLoading(false);
          }
        );
      });
    }
  }, [loading, banners]);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setBannerData && setBannerData([]); // default banners to be empty
      getUserBanners();
    });
    return () => {
      didFocus && didFocus.remove();
    };
  });

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
                    checkIsPinCodeServiceable(response.pincode, 'Auto-select');
                    response && setDiagnosticLocation!(response);
                    response && !locationDetails && setLocationDetails!(response);
                  })
                  .catch((e) => {
                    CommonBugFender('Tests_ALLOW_AUTO_DETECT', e);
                    setLoadingContext!(false);
                    showAphAlert!({
                      title: string.common.uhOh,
                      description: 'Unable to access location.',
                      onPressOk: () => {
                        hideAphAlert!();
                        setLocationError(true);
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
      context: {
        sourceHeaders,
      },
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

  const getDiagnosticBanner = async () => {
    const res: any = await getLandingPageBanners('diagnostic');
    if (res?.data?.success) {
      const bannerData = g(res, 'data', 'data');
      setBanners(bannerData);
    } else {
      setBanners([]);
      setBannerLoading(false);
    }
  };

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
          circleActivated={false}
        />
      );
    }
  };

  const postHomePageWidgetClicked = (name: string, id: string, section: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED] = {
      'Item Name': name,
      'Item ID': id,
      Source: 'Home Page',
      'Section Name': section,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED, eventAttributes);
  };

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number,
    source: 'Home page' | 'Full search' | 'Details page' | 'Partial search',
    section?: 'Featured tests' | 'Browse packages'
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADD_TO_CART] = {
      'Item Name': name,
      'Item ID': id,
      Source: source,
    };
    if (section) {
      eventAttributes['Section'] = section;
    }
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
          onPressSubmit={(pincode) => checkIsPinCodeServiceable(pincode, 'Manually')}
          subText={string.diagnostics.locationPermissionText}
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
        checkIsPinCodeServiceable(response.pincode, 'Auto-select');
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
  const checkIsPinCodeServiceable = async (pincode: string, mode?: string) => {
    if (!!pincode) {
      setLoadingContext!(true);
      client
        .query<getPincodeServiceability, getPincodeServiceabilityVariables>({
          query: GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
          context: {
            sourceHeaders,
          },
          variables: {
            pincode: parseInt(pincode, 10),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const serviceableData = g(data, 'getPincodeServiceability');
          if (serviceableData && serviceableData?.cityName != '') {
            let obj = {
              cityId: serviceableData.cityID?.toString() || '0',
              stateId: serviceableData.stateID?.toString() || '0',
              state: serviceableData.stateName || '',
              city: serviceableData.cityName || '',
            };
            setDiagnosticServiceabilityData!(obj);
            setDiagnosticLocationServiceable!('true');
            setServiceabilityMsg('');
            mode && setWebEnageEventForPinCodeClicked(mode, pincode, true);
          } else {
            setDiagnosticLocationServiceable!('false');
            setLoadingContext!(false);
            renderLocationNotServingPopUpForPincode(pincode);
            mode && setWebEnageEventForPinCodeClicked(mode, pincode, false);
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
            title: string.common.uhOh,
            description: string.diagnostics.serviceabilityFailureText,
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
    discountPrice?: number;
    discountSpecialPrice?: number;
    isAddedToCart: boolean;
    onAddOrRemoveCartItem: () => void;
    onPress: () => void;
    style?: ViewStyle;
    discount: number | string;
    circleDiscount: number | string;
    specialDiscount: number | string;
    promoteCircle?: boolean;
    promoteDiscount?: boolean;
    mrpToDisplay: number;
  }) => {
    const {
      name,
      imgUrl,
      price,
      specialPrice,
      circlePrice,
      circleSpecialPrice,
      discountPrice,
      discountSpecialPrice,
      style,
      discount,
      circleDiscount,
      specialDiscount,
      promoteCircle,
      promoteDiscount,
      mrpToDisplay,
    } = data;

    // if special discount is more than others.

    const renderDiscountedPrice = () => {
      const styles = StyleSheet.create({
        priceView: {
          flexDirection: 'row',
          marginBottom: 4,
        },
        discountPriceText: {
          marginRight: 4,
          ...theme.viewStyles.text('SB', 12, '#01475B', 0.5, 24),
          textDecorationLine: 'line-through',
          marginTop: 15,
        },
        sellingPriceText: {
          marginRight: 4,
          ...theme.viewStyles.text('SB', 14, '#01475B', 1, 24),
          textDecorationLine: 'none',
          marginTop: 15,
        },
      });
      return (
        <>
          {/**
           * if special discount exists
           */}
          {promoteDiscount
            ? renderSpecialDiscountText({ marginTop: '2%', marginBottom: -10 })
            : null}
          <View style={[styles.priceView]}>
            {/**
             * if promote circle - sub/non-sub don't show top view price
             */}
            {promoteCircle ? null : (
              <View style={{ flexDirection: 'row' }}>
                {/**
                 * if special price exists or any special discount exist
                 */}
                {(specialPrice != price || discountSpecialPrice != discountPrice) && (
                  <Text style={styles.discountPriceText}>
                    {string.common.Rs} {convertNumberToDecimal(price)}
                  </Text>
                )}
                <Text style={styles.sellingPriceText}>
                  {string.common.Rs}
                  {convertNumberToDecimal(promoteDiscount ? discountSpecialPrice : specialPrice || price)}
                </Text>
              </View>
            )}
          </View>
        </>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        <View
          style={{
            ...theme.viewStyles.card(12, 0),
            elevation: 10,
            height: 210,
            width: 180,
            marginHorizontal: 4,
            marginRight: 10,
            alignItems: 'flex-start',
            ...style,
          }}
        >
          {renderDiscountTag(
            promoteCircle && isDiagnosticCircleSubscription
              ? circleDiscount
              : promoteDiscount
              ? specialDiscount
              : discount,
            'tests'
          )}
          <Image
            placeholderStyle={styles.imagePlaceholderStyle}
            source={{ uri: imgUrl }}
            style={styles.hotSellerIcon}
          />
          <View style={{ height: 47.5 }}>
            <Text style={styles.hotSellerText} numberOfLines={2}>
              {name}
            </Text>
          </View>
          <Spearator style={{ marginBottom: 7.5 }} />
          {renderDiscountedPrice()}
          {promoteCircle
            ? renderCircleView(
                circleSpecialPrice!,
                mrpToDisplay!,
                circlePrice! || price!,
                promoteCircle
              )
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

  const renderCircleView = (
    circleSpecialPrice: number,
    price: number | string, //(mrpToDisplay)
    circlePrice: number | string,
    promoteCircle: boolean
  ) => {
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
              {string.common.Rs} {convertNumberToDecimal(circleSpecialPrice)}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row' }}>
          {isDiagnosticCircleSubscription && promoteCircle && (
            <Text style={styles.circleMainPriceText}>
              {string.common.Rs} {convertNumberToDecimal(price)}
            </Text>
          )}
          {!isDiagnosticCircleSubscription && promoteCircle && price > circlePrice && (
            <Text
              style={[
                styles.circleMainPriceText,
                {
                  ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.5, 15.6),
                  textDecorationLine: 'line-through',
                },
              ]}
            >
              {string.common.Rs} {convertNumberToDecimal(price)}
            </Text>
          )}
          <Text style={styles.circleSellingPriceText}>
            {string.common.Rs} {convertNumberToDecimal(isDiagnosticCircleSubscription ? circleSpecialPrice : circlePrice)}
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

  const renderHotSellerItem = (
    data: ListRenderItemInfo<
      getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers
    >
  ) => {
    const getDiagnosticPricingForItem = g(data, 'item', 'diagnostics', 'diagnosticPricing');
    const getItems = g(data, 'item', 'diagnostics');
    const packageMrpForItem = getItems?.packageCalculatedMrp!;
    const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);

    // if all the groupPlans are inactive, then only don't show
    if (!pricesForItem?.itemActive) {
      return null;
    }
    const { packageImage, packageName, diagnostics } = data.item;
    const foundTestInCart = !!cartItems.find((item) => item.id == `${diagnostics?.itemId}`);

    //check wrt to plan
    const specialPrice = pricesForItem?.specialPrice!;
    const price = pricesForItem?.price!; //more than price (black)
    const circlePrice = pricesForItem?.circlePrice!;
    const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
    const discountPrice = pricesForItem?.discountPrice!;
    const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
    const planToConsider = pricesForItem?.planToConsider;

    const discount = pricesForItem?.discount;
    const circleDiscount = pricesForItem?.circleDiscount;
    const specialDiscount = pricesForItem?.specialDiscount;

    const promoteCircle = pricesForItem?.promoteCircle; //if circle discount is more
    const promoteDiscount = pricesForItem?.promoteDiscount; // if special discount is more than others.

    const mrpToDisplay = pricesForItem?.mrpToDisplay;
    const discountToDisplay = pricesForItem?.discountToDisplay;

    const addToCart = () => {
      if (!isDiagnosticLocationServiceable) {
        return;
      }
      postDiagnosticAddToCartEvent(
        diagnostics?.itemName!,
        `${diagnostics!.itemId}`,
        Number(mrpToDisplay!),
        discountToDisplay,
        'Home page',
        'Featured tests'
      );
      addCartItem!({
        id: `${diagnostics!.itemId}`,
        mou: diagnostics?.inclusions == null ? 1 : diagnostics?.inclusions.length,
        name: diagnostics?.itemName!,
        price: price,
        specialPrice: specialPrice! | price,
        circlePrice: circlePrice,
        circleSpecialPrice: circleSpecialPrice,
        discountPrice: discountPrice,
        discountSpecialPrice: discountSpecialPrice,
        thumbnail: packageImage,
        collectionMethod: diagnostics?.collectionType!,
        groupPlan: planToConsider?.groupPlan,
        packageMrp: packageMrpForItem,
        inclusions:
          diagnostics?.inclusions == null ? [Number(diagnostics?.itemId)] : diagnostics?.inclusions,
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
      discountPrice: discountPrice,
      discountSpecialPrice: discountSpecialPrice,
      isAddedToCart: foundTestInCart,
      discount: discount,
      circleDiscount: circleDiscount,
      specialDiscount: specialDiscount,
      promoteCircle: promoteCircle,
      promoteDiscount: promoteDiscount,
      mrpToDisplay: Number(mrpToDisplay!),
      onAddOrRemoveCartItem: foundTestInCart ? removeFromCart : addToCart,
      onPress: () => {
        if (!isDiagnosticLocationServiceable) {
          return;
        }
        postHomePageWidgetClicked(packageName!, `${diagnostics!.itemId}`, 'Featured Tests');
        props.navigation.navigate(AppRoutes.TestDetails, {
          testDetails: {
            Rate: price, //PASS the value
            specialPrice: specialPrice! || price,
            circleRate: circlePrice,
            circleSpecialPrice: circleSpecialPrice,
            discountPrice: discountPrice,
            discountSpecialPrice: discountSpecialPrice,
            Gender: diagnostics!.gender,
            ItemID: `${diagnostics!.itemId}`,
            ItemName: diagnostics?.itemName!,
            collectionType: diagnostics?.collectionType,
            FromAgeInDays: diagnostics?.fromAgeInDays,
            ToAgeInDays: diagnostics?.toAgeInDays,
            preparation: diagnostics?.testPreparationData,
            testDescription: diagnostics?.testDescription,
            packageMrp: packageMrpForItem,
            mrpToDisplay: mrpToDisplay,
            source: 'Home Page',
            type: diagnostics!.itemType,
            inclusions:
              diagnostics?.inclusions == null
                ? [Number(diagnostics?.itemId)]
                : diagnostics?.inclusions,
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

  const renderSpecialDiscountText = (styleObj?: any) => {
    return (
      <SpecialDiscountText text={string.diagnostics.specialDiscountText} styleObj={styleObj} />
    );
  };

  const renderPackageCard = (
    title: string,
    subtitle: string,
    desc: string,
    price: number,
    specialPrice: number | undefined,
    discount: string | number,
    circleDiscount: string | number,
    circlePrice: number,
    circleSpecialPrice: number | undefined,
    discountPrice: number,
    discountSpecialPrice: number | undefined,
    specialDiscount: string | number,
    promoteCircle: boolean,
    promoteDiscount: boolean,
    numberOfInclusions: number,
    mrpToDisplay: number,
    packageCalculatedMrp: number,
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
            marginRight: 10,
          },
          style,
        ]}
        onPress={onPress}
      >
        {renderDiscountTag(
          promoteCircle && isDiagnosticCircleSubscription
            ? circleDiscount
            : promoteDiscount
            ? specialDiscount
            : discount,
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
                    {convertNumberToDecimal(promoteCircle ? circleSpecialPrice : specialPrice || price)}
                  </Text>
                )}
              </View>
            )}
            {/**
             * show a text if special discount exists
             */}
            {promoteDiscount ? renderSpecialDiscountText({}) : null}

            {/**
             * original price (main price to be shown)
             */}
            <View style={{ flexDirection: 'row' }}>
              {/**
               * price to be shown if mrp is not same as packageCal
               */}
              {!!packageCalculatedMrp &&
                packageCalculatedMrp != price &&
                packageCalculatedMrp > price && (
                  <Text style={styles.nonSubStrikedPrice}>
                    ({string.common.Rs} {convertNumberToDecimal(packageCalculatedMrp)})
                  </Text>
                )}
              {/**
               * original price (discount price is present and no circle + !promoteCircle)
               */}
              {!promoteCircle &&
                ((!!specialPrice && specialPrice != price) ||
                  (!!discountSpecialPrice && discountSpecialPrice != discountPrice)) &&
                !isDiagnosticCircleSubscription && (
                  <Text style={styles.nonSubStrikedPrice}>
                    ({string.common.Rs} {convertNumberToDecimal(price)})
                  </Text>
                )}

              {/**
               * slashed price in case prmote circle + sub or slashed price or discount price
               */}
              {((!!specialPrice && specialPrice != price) ||
                promoteCircle ||
                (!!discountSpecialPrice && discountSpecialPrice != discountPrice)) &&
                isDiagnosticCircleSubscription &&
                price > packageCalculatedMrp! &&
                discountPrice > packageCalculatedMrp && (
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
                      {string.common.Rs} {convertNumberToDecimal(price)}
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
                {promoteCircle && !!circleSpecialPrice && isDiagnosticCircleSubscription
                  ? convertNumberToDecimal(circleSpecialPrice)
                  : promoteDiscount
                  ? convertNumberToDecimal(discountSpecialPrice)
                  : convertNumberToDecimal(specialPrice || price)}
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
      title: string.common.uhOh,
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
          context: {
            sourceHeaders,
          },
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

  const fetchPackageInclusion = async (id: string, func: (tests: PackageInclusion[]) => void) => {
    try {
      const arrayOfId = [Number(id)];
      setLoadingContext!(true);
      const res: any = await getPackageInclusions(client, arrayOfId);
      if (res) {
        const data = g(res, 'data', 'getInclusionsOfMultipleItems', 'inclusions');
        setLoadingContext!(false);
        const product = data;
        if (product && product.length) {
          func && func(product);
        } else {
          errorAlert();
        }
      }
    } catch (e) {
      CommonBugFender('Tests_fetchPackageInclusion', e);
      setLoadingContext!(false);
      console.log('getPackageData Error\n', { e });
      errorAlert();
    }
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
              const getItems = g(item, 'diagnostics');
              const packageMrpForItem = getItems?.packageCalculatedMrp!;

              const pricesForItem = getPricesForItem(
                getDiagnosticPricingForItem,
                packageMrpForItem
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

              const discount = pricesForItem?.discount;
              const circleDiscount = pricesForItem?.circleDiscount;
              const specialDiscount = pricesForItem?.specialDiscount;

              const promoteCircle = pricesForItem?.promoteCircle; //if circle discount is more
              const promoteDiscount = pricesForItem?.promoteDiscount; // if special discount is more than others.

              const mrpToDisplay = pricesForItem?.mrpToDisplay;
              const discountToDisplay = pricesForItem?.discountToDisplay;

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
                discountPrice,
                discountSpecialPrice,
                specialDiscount,
                promoteCircle,
                promoteDiscount,
                numberOfInclusions,
                Number(mrpToDisplay!),
                packageMrpForItem,
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
                    postHomePageWidgetClicked(item?.organName!, item?.id!, 'Browse packages');
                    props.navigation.navigate(AppRoutes.TestDetails, {
                      testDetails: {
                        Gender: product?.gender,
                        ItemID: `${product?.itemId}`,
                        ItemName: product?.itemName!,
                        Rate: price,
                        specialPrice: specialPrice! || price,
                        circleRate: circlePrice,
                        circleSpecialPrice: circleSpecialPrice,
                        discountPrice: discountPrice,
                        discountSpecialPrice: discountSpecialPrice,
                        collectionType: product?.collectionType,
                        preparation: product?.testPreparationData,
                        testDescription: product?.testDescription,
                        source: 'Home Page',
                        type: product?.itemType,
                        packageMrp: packageMrpForItem,
                        mrpToDisplay: mrpToDisplay,
                        inclusions:
                          product?.inclusions == null
                            ? [Number(product?.itemId)]
                            : product?.inclusions,
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
                      : postDiagnosticAddToCartEvent(
                          item?.organName!,
                          item?.id!,
                          Number(mrpToDisplay!),
                          discountToDisplay,
                          'Home page',
                          'Browse packages'
                        );
                    addCartItem!({
                      id: String(diagnosticItem?.itemId),
                      name: diagnosticItem?.itemName!,
                      mou:
                        diagnosticItem?.inclusions == null ? 1 : diagnosticItem?.inclusions.length,
                      price: price,
                      thumbnail: '',
                      specialPrice: specialPrice! || price,
                      circlePrice: circlePrice,
                      circleSpecialPrice: circleSpecialPrice,
                      discountPrice: discountPrice,
                      discountSpecialPrice: discountSpecialPrice,
                      collectionMethod: product?.collectionType!,
                      groupPlan: planToConsider?.groupPlan,
                      packageMrp: packageMrpForItem,
                      inclusions:
                        diagnosticItem?.inclusions == null
                          ? [Number(diagnosticItem?.itemId)]
                          : diagnosticItem?.inclusions,
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
          {string.common.Rs} {convertNumberToDecimal(price)}
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
                item?.organName!,
                item?.organImage!,
                () => {
                  if (!isDiagnosticLocationServiceable) {
                    return;
                  }
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
    itemId: string | number,
    itemName: string,
    rate?: number,
    collectionType?: TEST_COLLECTION_TYPE,
    pricesObject?: any,
    promoteCircle?: boolean,
    promoteDiscount?: boolean,
    selectedPlan?: any,
    inclusions?: any[]
  ) => {
    savePastSearch(`${itemId}`, itemName).catch((e) => {
      aphConsole.log({ e });
    });
    // postDiagnosticAddToCartEvent(stripHtml(itemName), `${itemId}`, rate, rate, 'Partial search');
    //passed zero till the time prices aren't updated.
    postDiagnosticAddToCartEvent(stripHtml(itemName), `${itemId}`, 0, 0, 'Partial search');
    addCartItem!({
      id: `${itemId}`,
      name: stripHtml(itemName),
      price: pricesObject?.rate || 0,
      specialPrice: pricesObject?.specialPrice! || pricesObject?.rate || 0,
      circlePrice: pricesObject?.circlePrice,
      circleSpecialPrice: pricesObject?.circleSpecialPrice,
      discountPrice: pricesObject?.discountPrice,
      discountSpecialPrice: pricesObject?.discountSpecialPrice,
      mou: inclusions == null ? 1 : inclusions?.length,
      thumbnail: '',
      collectionMethod: collectionType! || TEST_COLLECTION_TYPE?.HC,
      groupPlan: selectedPlan?.groupPlan || DIAGNOSTIC_GROUP_PLAN.ALL,
      packageMrp: pricesObject?.mrpToDisplay || 0,
      inclusions: inclusions == null ? [Number(itemId)] : inclusions,
    });
  };

  const [searchText, setSearchText] = useState<string>('');
  const [diagnosticResults, setDiagnosticResults] = useState<
    searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  >([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [isSearchFocused, setSearchFocused] = useState(false);
  const client = useApolloClient();

  const onSearchTest = async (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      if (!g(locationForDiagnostics, 'cityId')) {
        renderLocationNotServingPopup();
        return;
      }
      if (!(_searchText && _searchText.length > 2)) {
        setDiagnosticResults([]);
        return;
      }
      setShowMatchingMedicines(true);
      setsearchSate('load');
      try {
        const res: any = await getDiagnosticsSearchResults(
          'diagnostic',
          _searchText,
          parseInt(locationForDiagnostics?.cityId!, 10)
        );
        if (res?.data?.success) {
          const products = g(res, 'data', 'data') || [];
          setDiagnosticResults(
            products as searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
          );
          setSearchResults(products?.length == 0);
          setsearchSate('success');
          setWebEngageEventOnSearchItem(_searchText, products);
        } else {
          setDiagnosticResults([]);
          setSearchResults(true);
          setsearchSate('success');
        }
      } catch (error) {
        CommonBugFender('Tests_onSearchTests', error);
        setsearchSate('fail'); //handle this case
      }
    }
  };

  const getUserSubscriptionsByStatus = async () => {
    setLoadingContext!(true);
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
      setLoadingContext!(false);
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
      setLoadingContext!(false);
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
    discountPrice?: number;
    discountSpecialPrice?: number;
    discount: string | number;
    circleDiscount: string | number;
    specialDiscount: string | number;
    promoteCircle: boolean;
    promoteDiscount: boolean;
    planToConsider: any;
    mrpToDisplay: string | number;
    packageCalculatedMrp: string | number;
    inclusions: any;
    style?: ViewStyle;
  }

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
      searchViewShadow: {
        shadowColor: colors.SHADOW_GRAY,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
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
          setDiagnosticResults([]);
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

    const itemsNotFound = searchSate == 'success' && searchText.length > 2 && searchResult;
    return (
      <View
        pointerEvents={isDiagnosticLocationServiceable ? 'auto' : 'none'}
        style={styles.searchViewShadow}
      >
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
            setDiagnosticResults([]);
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
                setDiagnosticResults([]);
                return;
              }
              const search = _.debounce(onSearchTest, 300);
              if (value?.length >= 3) {
                setsearchSate('load');
              }
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
                  borderColor: '#890000',
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

  const renderDot = (active: boolean) => (
    <View
      style={[styles.sliderDotStyle, { backgroundColor: active ? colors.APP_GREEN : '#d8d8d8' }]}
    />
  );

  const renderBanner = () => {
    if (loading || bannerLoading) {
      return (
        <View style={[styles.sliderPlaceHolderStyle, { height: imgHeight }]}>
          <Spinner style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }} />
        </View>
      );
    } else if (banners.length) {
      return (
        <View style={{ marginBottom: 10 }}>
          <Carousel
            onSnapToItem={setSlideIndex}
            data={banners}
            renderItem={renderSliderItem}
            sliderWidth={winWidth}
            itemWidth={winWidth}
            loop={true}
            autoplay={true}
            autoplayDelay={3000}
            autoplayInterval={3000}
          />
          <View style={styles.landingBannerInnerView}>
            {banners.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
          </View>
        </View>
      );
    }
  };

  const renderSliderItem = ({ item, index }: { item: any; index: number }) => {
    const handleOnPress = () => {
      if (item?.redirectUrl) {
        const data = item?.redirectUrl.split('=')[1];
        const extractData = data?.replace('apollopatients://', '');
        const getNavigationDetails = extractData.split('?');
        const route = getNavigationDetails[0];
        let itemId = '';
        try {
          if (getNavigationDetails.length >= 2) {
            itemId = getNavigationDetails[1].split('&');
            if (itemId.length > 0) {
              itemId = itemId[0];
            }
          }
        } catch (error) {}
        if (route == 'TestDetails') {
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: itemId,
          });
        }
      }
    };
    return (
      <TouchableOpacity activeOpacity={1} onPress={handleOnPress}>
        <ImageNative
          resizeMode="stretch"
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: item.bannerImage }}
        />
      </TouchableOpacity>
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

  const renderSearchSuggestionItemView = (data: ListRenderItemInfo<any>) => {
    const { index, item } = data;

    return (
      <DiagnosticsSearchSuggestionItem
        onPress={() => {
          CommonLogEvent(AppRoutes.Tests, 'Search suggestion Item');
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: item?.diagnostic_item_id,
            source: 'Partial Search',
          });
        }}
        onPressAddToCart={() => {
          onAddCartItem(item?.diagnostic_item_id, item?.diagnostic_item_name);
        }}
        data={item}
        loading={true}
        showSeparator={index !== diagnosticResults?.length - 1}
        style={{
          marginHorizontal: 20,
          paddingBottom: index == diagnosticResults?.length - 1 ? 20 : 0,
        }}
        onPressRemoveFromCart={() => removeCartItem!(`${item?.diagnostic_item_id}`)}
      />
    );
  };

  const renderSearchSuggestions = () => {
    const showResults = !!searchText && searchText?.length > 2 && diagnosticResults?.length > 0;
    const isLoading = searchSate == 'load';
    return (
      <>
        {isLoading ? (
          <View style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}>
            {renderSectionLoader(330)}
          </View>
        ) : (
          !!showResults && (
            <View>
              <FlatList
                keyboardShouldPersistTaps="always"
                // contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
                bounces={false}
                keyExtractor={(_, index) => `${index}`}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                style={{
                  paddingTop: 10.5,
                  maxHeight: 266,
                  backgroundColor: '#f7f8f5',
                }}
                data={diagnosticResults}
                // extraData={itemsLoading}
                renderItem={renderSearchSuggestionItemView}
              />
              {diagnosticResults?.length > 6 && (
                <View style={styles.viewAllContainer}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      props.navigation.navigate(AppRoutes.SearchTestScene, {
                        searchText: searchText,
                      });
                      setSearchText('');
                      setDiagnosticResults([]);
                    }}
                    style={styles.viewAllTouchView}
                  >
                    <Text style={styles.viewAllText}>VIEW ALL RESULTS</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        )}
      </>
    );
  };

  const renderSections = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (diagnosticResults.length == 0 && !searchText) return;
          setSearchText('');
          setDiagnosticResults([]);
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

  const renderOverlay = () => {
    const isNoResultsFound =
      searchSate != 'load' && searchText.length > 2 && diagnosticResults?.length == 0;

    return (
      (!!diagnosticResults.length || searchSate == 'load' || isNoResultsFound) && (
        <View style={theme.viewStyles.overlayStyle}>
          <TouchableOpacity
            activeOpacity={1}
            style={theme.viewStyles.overlayStyle}
            onPress={() => {
              if (diagnosticResults?.length == 0 && !searchText) return;
              setSearchText('');
              setDiagnosticResults([]);
              setSearchFocused(false);
            }}
          />
        </View>
      )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        <View style={{ backgroundColor: 'white' }}>
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
          {renderSearchBar()}
          {renderSearchSuggestions()}
        </View>
        <View style={{ flex: 1 }}>
          <ScrollView
            removeClippedSubviews={true}
            bounces={false}
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            {renderSections()}
            {renderOverlay()}
          </ScrollView>
        </View>
      </SafeAreaView>
      {renderPopup()}
    </View>
  );
};
