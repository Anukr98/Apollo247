import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import stripHtml from 'string-strip-html';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  Badge,
  SectionHeader,
  Spearator,
} from '@aph/mobile-patients/src/components/ui/BasicComponents';

import {
  CartIcon,
  LocationOff,
  SearchSendIcon,
  HomeIcon,
  NotificationIcon,
  WorkflowIcon,
  ArrowRightYellow,
  ShieldIcon,
  Remove,
  DropdownGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  SAVE_SEARCH,
  GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  SET_DEFAULT_ADDRESS,
  GET_PATIENT_ADDRESS_LIST,
  GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
} from '@aph/mobile-patients/src/graphql/profiles';
import { searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';
import {
  getPlaceInfoByPincode,
  getLandingPageBanners,
  getDiagnosticsSearchResults,
  getDiagnosticHomePageWidgets,
  DIAGNOSTIC_GROUP_PLAN,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  doRequestAndAccessLocationModified,
  g,
  isValidSearch,
  getFormattedLocation,
  nameFormater,
  isSmallDevice,
  navigateToHome,
  isAddressLatLngInValid,
  addTestsToCart,
  handleGraphQlError,
  setAsyncPharmaLocation,
  downloadDiagnosticReport,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Image as ImageNative,
  ImageBackground,
  BackHandler,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { Image } from 'react-native-elements';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import {
  SEARCH_TYPE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { postMyOrdersClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import _ from 'lodash';
import {
  getPincodeServiceability,
  getPincodeServiceabilityVariables,
} from '@aph/mobile-patients/src/graphql/types/getPincodeServiceability';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import {
  getDiagnosticClosedOrders,
  getDiagnosticOpenOrders,
  getDiagnosticPatientPrescription,
  getDiagnosticPhelboDetails,
  getUserBannersList,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import Carousel from 'react-native-snap-carousel';
import { DiagnosticsSearchSuggestionItem } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticsSearchSuggestionItem';
import { AccessLocation } from '@aph/mobile-patients/src/components/Medicines/Components/AccessLocation';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { PincodeInput } from '@aph/mobile-patients/src/components/Medicines/Components/PicodeInput';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { CertifiedCard } from '@aph/mobile-patients/src/components/Tests/components/CertifiedCard';
import {
  DiagnosticAddresssSelected,
  DiagnosticAddToCartEvent,
  DiagnosticBannerClick,
  DiagnosticHomePageSearchItem,
  DiagnosticHomePageWidgetClicked,
  DiagnosticLandingPageViewedEvent,
  DiagnosticPinCodeClicked,
  DiagnosticTrackOrderViewed,
  DiagnosticTrackPhleboClicked,
  DiagnosticViewReportClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { ItemCard } from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import { PackageCard } from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  AppConfig,
  DIAGNOSITC_PHELBO_TRACKING_STATUS,
  DIAGNOSTIC_FULLY_DONE_STATUS_ARRAY,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
  stepsToBookArray,
} from '@aph/mobile-patients/src/strings/AppConfig';
import {
  findDiagnosticsWidgetsPricing,
  findDiagnosticsWidgetsPricingVariables,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsWidgetsPricing';
import { LowNetworkCard } from '@aph/mobile-patients/src/components/Tests/components/LowNetworkCard';
import { WidgetCard } from '@aph/mobile-patients/src/components/Tests/components/WidgetCard';
import { PrescriptionCard } from '@aph/mobile-patients/src/components/Tests/components/PrescriptionCard';
import {
  renderBannerShimmer,
  renderTestDiagonosticsShimmer,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import moment from 'moment';
import { HomePageOrderStatusCard } from '@aph/mobile-patients/src/components/Tests/components/HomePageOrderStatusCard';
import AsyncStorage from '@react-native-community/async-storage';
import { getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOpenOrdersList';

const imagesArray = [
  require('@aph/mobile-patients/src/components/ui/icons/diagnosticCertificate_1.webp'),
  require('@aph/mobile-patients/src/components/ui/icons/diagnosticCertificate_2.webp'),
  require('@aph/mobile-patients/src/components/ui/icons/diagnosticCertificate_3.webp'),
  require('@aph/mobile-patients/src/components/ui/icons/diagnosticCertificate_4.webp'),
];

const whyBookUsArray = [
  { image: require('@aph/mobile-patients/src/components/ui/icons/whyBookUs_0.webp') },
  { image: require('@aph/mobile-patients/src/components/ui/icons/whyBookUs_1.webp') },
  { image: require('@aph/mobile-patients/src/components/ui/icons/whyBookUs_2.webp') },
  { image: require('@aph/mobile-patients/src/components/ui/icons/whyBookUs_3.webp') },
];

const { width: winWidth, height: winHeight } = Dimensions.get('window');

export interface DiagnosticData {
  cityId: string;
  stateId: string;
  city: string;
  state: string;
}

export interface TestsProps
  extends NavigationScreenProps<{
    comingFrom?: string;
    movedFrom?: string;
  }> {}

export const Tests: React.FC<TestsProps> = (props) => {
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    isDiagnosticCircleSubscription,
    setIsDiagnosticCircleSubscription,
    newAddressAddedHomePage,
    setNewAddressAddedHomePage,
    deliveryAddressId,
    setDeliveryAddressId,
    setDiagnosticAreas,
    setAreaSelected,
    setDiagnosticSlot,
    setAddresses: setTestAddress,
    addMultipleCartItems: addMultipleTestCartItems,
  } = useDiagnosticsCart();
  const {
    cartItems: shopCartItems,
    setCircleSubscriptionId,
    setHdfcSubscriptionId,
    setIsCircleSubscription,
    setHdfcPlanName,
    setIsFreeDelivery,
    setCirclePlanValidity,
    addresses,
    setAddresses,
  } = useShoppingCart();

  const {
    locationDetails,
    setLocationDetails,
    diagnosticLocation,
    setDiagnosticLocation,
    diagnosticServiceabilityData,
    setDiagnosticServiceabilityData,
    isDiagnosticLocationServiceable,
    setDiagnosticLocationServiceable,
    setBannerData,
    bannerData,
    pharmacyLocation,
    notificationCount,
  } = useAppCommonData();

  type addressListType = savePatientAddress_savePatientAddress_patientAddress[];
  type Address = savePatientAddress_savePatientAddress_patientAddress;

  const movedFrom = props.navigation.getParam('movedFrom');
  const { currentPatient } = useAllCurrentPatients();

  const hdfc_values = string.Hdfc_values;
  const cartItemsCount = cartItems?.length + shopCartItems?.length;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [bannerLoading, setBannerLoading] = useState(true);
  const [imgHeight, setImgHeight] = useState(200);
  const [slideIndex, setSlideIndex] = useState(0);
  const [banners, setBanners] = useState([]);

  const [sectionLoading, setSectionLoading] = useState<boolean>(false);
  const [bookUsSlideIndex, setBookUsSlideIndex] = useState(0);
  const [showbookingStepsModal, setShowBookingStepsModal] = useState(false);
  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const [widgetsData, setWidgetsData] = useState([] as any);
  const [reloadWidget, setReloadWidget] = useState<boolean>(false);

  const [latestPrescription, setLatestPrescription] = useState([] as any);
  const [prescriptionSlideIndex, setPrescriptionSlideIndex] = useState(0);

  const [patientOpenOrders, setPatientOpenOrders] = useState([] as any);
  const [patientClosedOrders, setPatientClosedOrders] = useState([] as any);
  const [orderCardSlideIndex, setOrderCardSlideIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState({});
  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchResult, setSearchResults] = useState<boolean>(false);
  const [isCurrentScreen, setCurrentScreen] = useState<string>('');

  const [serviceabilityMsg, setServiceabilityMsg] = useState('');
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();
  const defaultAddress = addresses?.find((item) => item?.defaultAddress);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [asyncPincode, setAsyncPincode] = useState({});
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const orderPrescription_scrollX = new Animated.Value(0);
  let orderPrescription_position = Animated.divide(orderPrescription_scrollX, winWidth);

  const orderStatus_scrollX = new Animated.Value(0);
  let orderStatus_position = Animated.divide(orderStatus_scrollX, winWidth);

  const hasLocation = locationDetails || diagnosticLocation || pharmacyLocation || defaultAddress;

  const [serviceableObject, setServiceableObject] = useState({} as any);
  Object.keys(serviceableObject)?.length === 0 && serviceableObject?.constructor === Object;

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

  const setWebEngageEventOnSearchItem = (keyword: string, results: any[]) => {
    DiagnosticHomePageSearchItem(currentPatient, keyword, results);
  };

  const setWebEnageEventForPinCodeClicked = (
    mode: string,
    pincode: string,
    serviceable: boolean
  ) => {
    DiagnosticPinCodeClicked(currentPatient, mode, pincode, serviceable);
  };

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number,
    source: 'Home page' | 'Full search' | 'Details page' | 'Partial search' | 'Prescription',
    section?: 'Featured tests' | 'Browse packages'
  ) => {
    DiagnosticAddToCartEvent(name, id, price, discountedPrice, source, section);
  };

  useEffect(() => {
    if (movedFrom === 'deeplink') {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBack);
      };
    }
  }, []);

  const handleBack = () => {
    navigateToHome(props.navigation, {}, movedFrom === 'deeplink');
    return true;
  };

  /**
   * if any change in the location and pincode is changed
   */

  useEffect(() => {
    if (newAddressAddedHomePage != '') {
      checkIsPinCodeServiceable(newAddressAddedHomePage, '', 'newAddress');
      setNewAddressAddedHomePage?.('');
    }
  }, [newAddressAddedHomePage]);

  /**
   * fetch widgets
   */
  useEffect(() => {
    getDiagnosticBanner();
    setBannerData && setBannerData([]);
    DiagnosticLandingPageViewedEvent(
      currentPatient,
      isDiagnosticLocationServiceable,
      movedFrom == 'deeplink' ? 'Deeplink' : undefined
    );
  }, []);

  useEffect(() => {
    if (currentPatient) {
      getUserBanners();
      fetchAddress();
      fetchPatientOpenOrders();
      fetchPatientClosedOrders();
    }
  }, [currentPatient]);

  useEffect(() => {
    //fetch the doctor prescriptions for the current patient
    fetchPatientPrescriptions();
  }, [currentPatient, serviceableObject]);

  useEffect(() => {
    if (isFocused) {
      const getAsyncLocationPincode = async () => {
        const asyncLocationPincode: any = await AsyncStorage.getItem('PharmacyLocationPincode');
        if (asyncLocationPincode) {
          let getAsyncPincode = JSON.parse(asyncLocationPincode);
          setAsyncPincode(JSON.parse(asyncLocationPincode));
          //call only when they are different.
          if (asyncPincode?.pincode === getAsyncPincode?.pincode) {
            return;
          } else {
            checkIsPinCodeServiceable(
              getAsyncPincode?.pincode!
                ? getAsyncPincode?.pincode
                : !!pharmacyLocation
                ? pharmacyLocation?.pincode!
                : locationDetails?.pincode!,
              'manual',
              'initalPicode'
            );
          }
          setDiagnosticLocation!(!!pharmacyLocation ? pharmacyLocation! : locationDetails!);
        }
      };
      getAsyncLocationPincode();
    }
  }, [isFocused]);

  /**
   * if there is any change in the location yellow pop-up ,if location is present.
   */

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setBannerData && setBannerData([]); // default banners to be empty
      getUserBanners();
      setIsFocused(true);
      setCurrentScreen(AppRoutes.Tests); //to avoid showing non-serviceable prompt on medicine page
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setCurrentScreen('');
      setIsFocused(false);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  useEffect(() => {
    if (!loading && banners?.length > 0) {
      banners?.map((item: any) => {
        ImageNative.getSize(
          item?.bannerImage,
          (width, height) => {
            setImgHeight(height * (winWidth / width) + 20);
            setBannerLoading(false);
          },
          () => {
            setBannerLoading(false);
          }
        );
      });
    }
  }, [loading, banners]);

  const fetchPatientOpenOrders = async () => {
    try {
      let openOrdersResponse: any = await getDiagnosticOpenOrders(
        client,
        currentPatient?.mobileNumber,
        0,
        3
      );
      if (openOrdersResponse?.data?.data) {
        const getOpenOrders =
          openOrdersResponse?.data?.data?.getDiagnosticOpenOrdersList?.openOrders;
        setPatientOpenOrders(getOpenOrders);
      } else {
        setPatientOpenOrders([]);
      }
    } catch (error) {
      setPatientOpenOrders([]);
      CommonBugFender('fetchPatientOpenOrders_Tests', error);
    }
  };

  const fetchPatientClosedOrders = async () => {
    try {
      let closedOrdersResponse: any = await getDiagnosticClosedOrders(
        client,
        currentPatient?.mobileNumber,
        0,
        3
      );
      if (closedOrdersResponse?.data?.data) {
        const getClosedOrders =
          closedOrdersResponse?.data?.data?.getDiagnosticClosedOrdersList?.closedOrders;
        setPatientClosedOrders(getClosedOrders);
      } else {
        setPatientClosedOrders([]);
      }
    } catch (error) {
      setPatientClosedOrders([]);
      CommonBugFender('fetchPatientOpenOrders_Tests', error);
    }
  };

  const fetchPatientPrescriptions = async () => {
    try {
      const res: any = await getDiagnosticPatientPrescription(
        client,
        currentPatient?.mobileNumber,
        3,
        Object.keys(serviceableObject)?.length === 0 && serviceableObject?.constructor === Object
          ? 9
          : serviceableObject?.cityId
      );
      if (res?.data?.data) {
        const response = res?.data?.data?.getPatientLatestPrescriptions;
        if (!!response && response?.length > 0) {
          setLatestPrescription(response);
        } else {
          setLatestPrescription([]);
        }
      } else {
        setLatestPrescription([]);
      }
    } catch (error) {
      setLatestPrescription([]);
      CommonBugFender('fetchPatientPrescriptions_Tests', error);
    }
  };

  const getDiagnosticBanner = async () => {
    try {
      const res: any = await getLandingPageBanners('diagnostic');
      if (res?.data?.success) {
        const bannerData = g(res, 'data', 'data');
        setBanners(bannerData);
      } else {
        setBanners([]);
        setBannerLoading(false);
      }
    } catch (error) {
      CommonBugFender('getDiagnosticBanner_Tests', error);
      setBanners([]);
      setBannerLoading(false);
      setReloadWidget(true);
    }
  };

  const getHomePageWidgets = async (cityId: string) => {
    setSectionLoading(true);
    try {
      const result: any = await getDiagnosticHomePageWidgets('diagnostic');
      if (result?.data?.success && result?.data?.data?.length > 0) {
        const sortWidgets = result?.data?.data?.sort(
          (a: any, b: any) =>
            Number(a.diagnosticwidgetsRankOrder) - Number(b.diagnosticwidgetsRankOrder)
        );
        //call here the prices.
        fetchWidgetsPrices(sortWidgets, cityId);
      } else {
        setWidgetsData([]);
        setLoading!(false);
        setPageLoading?.(false);
        setReloadWidget(true);
      }
    } catch (error) {
      CommonBugFender('getHomePageWidgets_Tests', error);
      setWidgetsData([]);
      setLoading?.(false);
      setReloadWidget(true);
      setPageLoading?.(false);
    }
  };

  const getUserBanners = async () => {
    try {
      const res: any = await getUserBannersList(
        client,
        currentPatient,
        string.banner_context.DIAGNOSTIC_HOME
      );
      if (res) {
        setBannerData && setBannerData(res);
      }
    } catch (error) {
      setBannerData && setBannerData([]);
    }
  };

  const fetchWidgetsPrices = async (widgetsData: any, cityId: string) => {
    //filter the items.
    const filterWidgets = widgetsData?.filter(
      (item: any) => !!item?.diagnosticWidgetData && item?.diagnosticWidgetData?.length > 0
    );
    const itemIds = filterWidgets?.map((item: any) =>
      item?.diagnosticWidgetData?.map((data: any, index: number) => Number(data?.itemId))
    );
    //restriction less than 12.
    try {
      const res = Promise.all(
        !!itemIds &&
          itemIds?.map((item: any) =>
            fetchPricesForCityId(
              Number(cityId!) || 9,
              item?.length > 12 ? item?.slice(0, 12) : item
            )
          )
      );

      const response = (await res)?.map((item: any) =>
        g(item, 'data', 'findDiagnosticsWidgetsPricing', 'diagnostics')
      );
      let newWidgetsData = [...filterWidgets];

      for (let i = 0; i < filterWidgets?.length; i++) {
        for (let j = 0; j < filterWidgets?.[i]?.diagnosticWidgetData?.length; j++) {
          const findIndex = filterWidgets?.[i]?.diagnosticWidgetData?.findIndex(
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
      newWidgetsData?.length > 0 && reloadWidget ? setReloadWidget(false) : setReloadWidget(true);
      setWidgetsData(newWidgetsData);
      setSectionLoading(false);
      setLoading?.(false);
      setPageLoading?.(false);
    } catch (error) {
      CommonBugFender('errorInFetchPricing api__Tests', error);
      setSectionLoading(false);
      setLoading?.(false);
      setPageLoading?.(false);
      setReloadWidget(true);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.common.tryAgainLater,
      });
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

  async function fetchAddress() {
    try {
      if (addresses?.length) {
        const deliveryAddress = addresses?.find((item) => item?.defaultAddress);
        if (deliveryAddress) {
          setDeliveryAddressId!(deliveryAddress?.id);
          //if location is not undefined in either of the three, then don't change address
          if (
            !asyncPincode?.pincode! &&
            !locationDetails &&
            !pharmacyLocation &&
            !diagnosticLocation
          ) {
            checkIsPinCodeServiceable(deliveryAddress?.zipcode!, undefined, 'initialFetchAddress');
            setDiagnosticLocation!(formatAddressToLocation(deliveryAddress));
            return;
          }
        }
      }
      setPageLoading!(true);
      const response = await client.query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: currentPatient?.id },
        fetchPolicy: 'no-cache',
      });
      const addressList = (response.data.getPatientAddressList.addressList as Address[]) || [];
      setAddresses?.(addressList);
      setTestAddress?.(addressList);
      const deliveryAddress = addressList?.find((item) => item?.defaultAddress);
      if (deliveryAddress) {
        setDeliveryAddressId?.(deliveryAddress?.id);
        if (
          !asyncPincode?.pincode! &&
          !locationDetails &&
          !pharmacyLocation &&
          !diagnosticLocation
        ) {
          checkIsPinCodeServiceable(deliveryAddress?.zipcode!, undefined, 'fetchAddressResponse');
          setDiagnosticLocation?.(formatAddressToLocation(deliveryAddress));
        }
      } else {
        checkLocation(addressList);
      }
      setPageLoading!(false);
    } catch (error) {
      checkLocation(addresses);
      setPageLoading!(false);
      CommonBugFender('fetching_Addresses_on_Test_Page', error);
    }
  }

  const updatePlaceInfoByPincode = (pincode: string, serviceableResponse: DiagnosticData) => {
    let isPinCodeServiceable = serviceableResponse?.city != '';

    getPlaceInfoByPincode(pincode)
      .then(({ data }) => {
        try {
          if (data?.results?.length > 0) {
            const addrComponents = data?.results?.[0]?.address_components || [];
            const latLang = data?.results?.[0]?.geometry?.location || {};
            const response = getFormattedLocation(addrComponents, latLang, pincode);
            let setCity, setState;

            if (isDiagnosticLocationServiceable && diagnosticServiceabilityData == null) {
              setCity = diagnosticLocation?.city! || '';
              setState = diagnosticLocation?.state! || '';
            } else if (isPinCodeServiceable && serviceableResponse?.city != '') {
              setCity = serviceableResponse?.city! || '';
              setState = serviceableResponse?.state! || '';
            } else {
              setCity = response?.city || '';
              setState = response?.state || '';
            }
            (response.city = setCity), (response.state = setState);
            setDiagnosticLocation!(response);
            !locationDetails && setLocationDetails!(response);
            //for storing in the async storage.
            const saveAddress = {
              pincode: pincode,
              id: '',
              city: setCity,
              state: setState,
            };
            setAsyncPharmaLocation(saveAddress);
            setAsyncPincode(saveAddress);
            setLoadingContext!(false);
          } else {
            let response = {
              displayName: '',
              area:
                isDiagnosticLocationServiceable && diagnosticServiceabilityData == null
                  ? diagnosticLocation?.city!
                  : isPinCodeServiceable && serviceableResponse?.city != ''
                  ? serviceableResponse?.city!
                  : '',
              city:
                isDiagnosticLocationServiceable && diagnosticServiceabilityData == null
                  ? diagnosticLocation?.city!
                  : isPinCodeServiceable && serviceableResponse?.city != ''
                  ? serviceableResponse?.city!
                  : '',
              state:
                isDiagnosticLocationServiceable && diagnosticServiceabilityData == null
                  ? diagnosticLocation?.state!
                  : isPinCodeServiceable && serviceableResponse?.city != ''
                  ? serviceableResponse?.state!
                  : '',
              country: 'India',
              pincode: String(pincode),
            };

            setDiagnosticLocation!(response);
            !locationDetails && setLocationDetails!(response);
            const saveAddress = {
              pincode: pincode,
              id: '',
              city: response?.city,
              state: response?.state,
            };
            setAsyncPharmaLocation(saveAddress);
            setAsyncPincode(saveAddress);
            setLoadingContext!(false);
          }
        } catch (e) {
          setLoadingContext!(false);
          handleUpdatePlaceInfoByPincodeError(e);
        }
      })
      .catch(handleUpdatePlaceInfoByPincodeError)
      .finally(() => setLoadingContext!(false));
  };

  /**check current location */
  const autoDetectLocation = (addresses: addressListType) => {
    setPageLoading!(true);
    doRequestAndAccessLocationModified()
      .then((response) => {
        setPageLoading!(false);
        response && setDiagnosticLocation!(response);
        response && !locationDetails && setLocationDetails!(response);
        setDeliveryAddressId!('');
        checkIsPinCodeServiceable(response.pincode, 'Auto-select', 'autoDetect');
      })
      .catch((e) => {
        setPageLoading!(false);
        checkLocation(addresses);
        CommonBugFender('Diagnostic__ALLOW_AUTO_DETECT', e);
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
  const checkIsPinCodeServiceable = async (pincode: string, mode?: string, comingFrom?: string) => {
    let obj = {} as DiagnosticData;
    if (!!pincode) {
      setPageLoading?.(true);
      client
        .query<getPincodeServiceability, getPincodeServiceabilityVariables>({
          query: GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
          context: {
            sourceHeaders,
          },
          variables: {
            pincode: Number(pincode),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const serviceableData = g(data, 'getPincodeServiceability');
          if (serviceableData && serviceableData?.cityName != '') {
            obj = {
              cityId: serviceableData?.cityID?.toString() || '0',
              stateId: serviceableData?.stateID?.toString() || '0',
              state: serviceableData?.stateName || '',
              city: serviceableData?.cityName || '',
            };
            setServiceableObject(obj);
            setDiagnosticServiceabilityData!(obj);
            setDiagnosticLocationServiceable!(true);
            setServiceabilityMsg('');
            mode && setWebEnageEventForPinCodeClicked(mode, pincode, true);
            comingFrom == 'defaultAddress' &&
              DiagnosticAddresssSelected('Existing', 'Yes', pincode, 'Home page');
            comingFrom == 'newAddress' &&
              DiagnosticAddresssSelected('New', 'Yes', pincode, 'Home page');
          } else {
            obj = {
              cityId: '9',
              stateId: '0',
              state: '',
              city: '',
            };
            setServiceableObject(obj);
            setPageLoading!(false);
            setDiagnosticLocationServiceable!(false);

            isCurrentScreen == AppRoutes.Tests
              ? renderLocationNotServingPopUpForPincode(pincode)
              : null;

            setServiceabilityMsg(string.diagnostics.nonServiceablePinCodeMsg);

            mode && setWebEnageEventForPinCodeClicked(mode, pincode, false);
            comingFrom == 'defaultAddress' &&
              DiagnosticAddresssSelected('Existing', 'No', pincode, 'Home page');
            comingFrom == 'newAddress' &&
              DiagnosticAddresssSelected('New', 'No', pincode, 'Home page');
          }
          getHomePageWidgets(obj?.cityId);
          setshowLocationpopup(false);
          updatePlaceInfoByPincode(pincode, obj);
        })
        .catch((e) => {
          setPageLoading!(false);
          CommonBugFender('getDiagnosticsPincodeServiceabilityError_Tests', e);
          setLoadingContext!(false);
          setReloadWidget(true);
        });
    }
  };

  const renderYourOrders = () => {
    return (
      <ListCard
        onPress={() => {
          postMyOrdersClicked('Diagnostics', currentPatient);
          props.navigation.navigate(AppRoutes.YourOrdersTest, {
            isTest: true,
          });
        }}
        container={{
          marginBottom: 24,
          marginTop: 20,
        }}
        titleStyle={{
          color: theme.colors.SHERPA_BLUE,
          ...theme.fonts.IBMPlexSansSemiBold(16),
          paddingHorizontal: 0,
        }}
        title={'MY ORDERS'}
        leftIcon={null}
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
          Number(serviceableObject?.cityId! || 9)
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
        setsearchSate('fail');
      }
    }
  };

  const getUserSubscriptionsByStatus = async () => {
    setPageLoading!(true);
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
      setPageLoading!(false);
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
      setPageLoading!(false);
      CommonBugFender('Diagnositic_Landing_Page_Tests_GetSubscriptionsOfUserByStatus', error);
    }
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
      searchInput: { minHeight: undefined, paddingVertical: 8 },
      searchInputContainer: { marginBottom: 15, marginTop: 5 },
      searchNewInput: {
        borderColor: '#e7e7e7',
        borderRadius: 5,
        borderWidth: 1,
        width: '95%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        padding: 10,
        marginVertical: 15,
        backgroundColor: '#f7f8f5',
      },
      searchTextStyle: {
        ...theme.viewStyles.text('SB', 18, 'rgba(1,48,91, 0.3)'),
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

    const itemsNotFound = searchSate == 'success' && searchText?.length > 2 && searchResult;
    return (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate(AppRoutes.SearchTestScene, {
            searchText: searchText,
          });
        }}
        style={styles.searchNewInput}
      >
        <Text style={styles.searchTextStyle}>Search tests &amp; packages</Text>
        {rigthIconView}
      </TouchableOpacity>
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
            source: 'Tests' as AddressSource,
          });
        },
      });
    }
  };

  async function setDefaultAddress(address: Address) {
    try {
      const isSelectedAddressWithNoLatLng = isAddressLatLngInValid(address);
      if (isSelectedAddressWithNoLatLng) {
        //show the error
        renderAlert(string.diagnostics.updateAddressLatLngMessage, 'updateLocation', address);
      } else {
        setPageLoading(true);
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
        setTestAddress?.(updatedAddresses);
        patientAddress?.defaultAddress && setDeliveryAddressId!(patientAddress?.id);
        setDiagnosticAreas?.([]);
        setAreaSelected?.({});
        setDiagnosticSlot?.(null);
        const deliveryAddress = updatedAddresses.find(({ id }) => patientAddress?.id == id);
        setDiagnosticLocation!(formatAddressToLocation(deliveryAddress! || null));
        checkIsPinCodeServiceable(address?.zipcode!, undefined, 'defaultAddress');
        setPageLoading(false);
      }
    } catch (error) {
      setPageLoading(false);
      checkLocation(addresses);
      CommonBugFender('set_default_Address_on_Medicine_Page', error);
      showAphAlert!({
        title: string.common.uhOh,
        description:
          "We're sorry! Unable to set delivery address. Please try again after some time",
      });
    }
  }

  const checkLocation = (addresses: addressListType) => {
    !defaultAddress &&
      !locationDetails &&
      !diagnosticLocation &&
      !pharmacyLocation &&
      showAccessLocationPopup(addresses, false);
  };
  const showAccessLocationPopup = (addressList: addressListType, pincodeInput?: boolean) => {
    return showAphAlert!({
      // unDismissable: isunDismissable(),
      removeTopIcon: true,
      onPressOutside: () => {
        hideAphAlert!();
        //if this needs to be done, if location permission is denied or anywhere.
        if (
          !defaultAddress &&
          !locationDetails &&
          !diagnosticLocation &&
          !pharmacyLocation &&
          !asyncPincode?.pincode!
        ) {
          setDeliveryAddressId!('');
          checkIsPinCodeServiceable('500034', undefined, 'noLocation');
        }
      },
      children: !pincodeInput ? (
        <AccessLocation
          source={AppRoutes.Tests}
          addresses={addressList}
          onPressSelectAddress={(address) => {
            setAsyncPharmaLocation(address);
            const saveAddress = {
              pincode: address?.zipcode,
              id: address?.id,
              city: address?.city,
              state: address?.state,
            };
            setAsyncPincode(saveAddress);
            setDefaultAddress(address);
          }}
          onPressEditAddress={(address) => {
            props.navigation.push(AppRoutes.AddAddressNew, {
              KeyName: 'Update',
              addressDetails: address,
              source: 'Tests' as AddressSource,
              ComingFrom: AppRoutes.Tests,
            });
            hideAphAlert!();
          }}
          onPressAddAddress={() => {
            props.navigation.navigate(AppRoutes.AddAddressNew, {
              source: 'Tests' as AddressSource,
              addOnly: true,
            });
            hideAphAlert!();
          }}
          onPressCurrentLocaiton={() => {
            hideAphAlert!();
            autoDetectLocation(addressList);
          }}
          onPressPincode={() => {
            hideAphAlert!();
            showAccessLocationPopup(addressList, true);
          }}
        />
      ) : (
        <PincodeInput
          onPressApply={(pincode) => {
            if (pincode?.length == 6) {
              hideAphAlert?.();
              setDeliveryAddressId?.('');
              checkIsPinCodeServiceable(pincode, 'Manually', 'pincodeManualApply');
            }
          }}
          onPressBack={() => showAccessLocationPopup(addressList, false)}
        />
      ),
    });
  };

  const formatText = (text: string, count: number) =>
    text.length > count ? `${text.slice(0, count)}...` : text;

  const renderDeliverToLocationCTA = () => {
    let deliveryAddress = addresses?.find((item) => item?.id == deliveryAddressId);
    const location = asyncPincode?.pincode
      ? `${formatText(asyncPincode?.city || asyncPincode?.state || '', 18)} ${
          asyncPincode?.pincode
        }`
      : !deliveryAddress
      ? diagnosticLocation?.pincode
        ? `${formatText(
            g(diagnosticLocation, 'city') || g(diagnosticLocation, 'state') || '',
            18
          )} ${g(diagnosticLocation, 'pincode')}`
        : `${formatText(g(locationDetails, 'city') || g(locationDetails, 'state') || '', 18)} ${g(
            locationDetails,
            'pincode'
          )}`
      : `${formatText(deliveryAddress?.city || deliveryAddress?.state || '', 18)} ${
          deliveryAddress?.zipcode
        }`;

    return (
      <View style={{ paddingLeft: 15, marginTop: 3.5 }}>
        {hasLocation ? (
          <TouchableOpacity
            style={{ marginTop: -7.5 }}
            onPress={() => {
              showAccessLocationPopup(addresses, false);
            }}
          >
            <Text numberOfLines={1} style={styles.deliverToText}>
              {string.diagnostics.collectionFromText}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View>
                <Text style={styles.locationText}>{nameFormater(location, 'title')}</Text>
                {!serviceabilityMsg ? (
                  <Spearator style={styles.locationTextUnderline} />
                ) : (
                  <View style={{ height: 2 }} />
                )}
              </View>
              <View style={styles.dropdownGreenContainer}>
                <DropdownGreen />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <LocationOff />
        )}
        {!!serviceabilityMsg && <Text style={styles.serviceabilityMsg}>{serviceabilityMsg}</Text>}
      </View>
    );
  };

  const renderDot = (active: boolean, source?: string) => (
    <View
      style={[
        styles.sliderDotStyle,
        {
          backgroundColor: active
            ? source == 'orderStatus'
              ? colors.APP_YELLOW
              : colors.APP_GREEN
            : '#d8d8d8',
          width: source == 'orderStatus' && active ? 14 : 8,
        },
      ]}
    />
  );

  const renderBanner = () => {
    if (loading || bannerLoading) {
      //To do add another section shimmer
      return renderBannerShimmer();

      return (
        <View
          style={[styles.sliderPlaceHolderStyle, { height: imgHeight, backgroundColor: '#e3e1e1' }]}
        ></View>
      );
    } else if (banners?.length > 0) {
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
            {banners?.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
          </View>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderSliderItem = ({ item, index }: { item: any; index: number }) => {
    const handleOnPress = () => {
      if (item?.redirectUrl && item?.redirectUrl != '') {
        const data = item?.redirectUrl?.split('=')?.[1];
        const extractData = data?.replace('apollopatients://', '');
        const getNavigationDetails = extractData?.split('?');
        const route = getNavigationDetails?.[0];
        let itemId = '';
        try {
          if (getNavigationDetails?.length >= 2) {
            itemId = getNavigationDetails?.[1]?.split('&');
            if (itemId.length > 0) {
              itemId = itemId[0];
            }
          }
        } catch (error) {}
        if (route == 'TestDetails') {
          DiagnosticBannerClick(slideIndex + 1, Number(itemId));
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: itemId,
            comingFrom: AppRoutes.Tests,
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
            itemName: item?.diagnostic_item_name,
            source: 'Partial Search',
            comingFrom: AppRoutes.Tests,
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

  const renderBottomViews = () => {
    const isWidget = widgetsData?.length > 0;
    const isWidget1 =
      isWidget && widgetsData?.find((item: any) => item?.diagnosticwidgetsRankOrder == '1');
    const isWidget2 =
      isWidget && widgetsData?.find((item: any) => item?.diagnosticwidgetsRankOrder == '2');
    const isWidget3 =
      isWidget && widgetsData?.find((item: any) => item?.diagnosticwidgetsRankOrder == '3');
    const restWidgets =
      isWidget && widgetsData?.length > 3 && widgetsData?.slice(3, widgetsData?.length);
    return (
      <>
        {!!isWidget1 ? renderWidgets(isWidget1) : null}
        {renderStepsToBook()}

        {renderCarouselBanners()}
        {!!isWidget2 ? renderWidgets(isWidget2) : null}
        {renderWhyBookUs()}
        {!!isWidget3 ? renderWidgets(isWidget3) : null}
        {renderCertificateView()}
        {!!restWidgets && restWidgets.map((item: any) => renderWidgets(item))}
      </>
    );
  };

  const renderWidgets = (data: any) => {
    let widgetType = data?.diagnosticWidgetType;
    switch (widgetType) {
      case 'Package':
        return renderPackageWidget(data);
        break;
      case string.diagnosticCategoryTitle.categoryGrid:
        return scrollWidgetSection(data);
        break;
      case string.diagnosticCategoryTitle.category:
        return gridWidgetSection(data);
        break;
      default:
        return renderTestWidgets(data);
        break;
    }
  };

  const renderPackageWidget = (data: any) => {
    const isPricesAvailable =
      !!data &&
      data?.diagnosticWidgetData?.length > 0 &&
      data?.diagnosticWidgetData?.find((item: any) => item?.diagnosticPricing);
    const showViewAll = isPricesAvailable && data?.diagnosticWidgetData?.length > 2;
    const lengthOfTitle = data?.diagnosticWidgetTitle?.length;
    return (
      <View>
        {isPricesAvailable ? (
          <>
            <SectionHeader
              leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
              leftTextStyle={[
                styles.widgetHeading,
                {
                  ...theme.viewStyles.text(
                    'B',
                    !!lengthOfTitle && lengthOfTitle > 20 ? 14 : 16,
                    theme.colors.SHERPA_BLUE,
                    1,
                    20
                  ),
                },
              ]}
              rightText={showViewAll ? 'VIEW ALL' : ''}
              rightTextStyle={showViewAll ? styles.widgetViewAllText : {}}
              onPressRightText={
                showViewAll
                  ? () => {
                      props.navigation.navigate(AppRoutes.TestListing, {
                        movedFrom: AppRoutes.Tests,
                        data: data,
                        cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
                        widgetType: data?.diagnosticWidgetType,
                      });
                    }
                  : undefined
              }
              style={showViewAll ? { paddingBottom: 1 } : {}}
            />
            {sectionLoading ? (
              renderSectionLoader(188)
            ) : (
              <PackageCard
                data={data}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={false}
                navigation={props.navigation}
                source={'Home Page'}
                sourceScreen={AppRoutes.Tests}
              />
            )}
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
    const showViewAll = isPricesAvailable && data?.diagnosticWidgetData?.length > 2;
    const lengthOfTitle = data?.diagnosticWidgetTitle?.length;

    return (
      <View>
        {!!isPricesAvailable ? (
          <>
            <SectionHeader
              leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
              leftTextStyle={[
                styles.widgetHeading,
                {
                  ...theme.viewStyles.text(
                    'B',
                    !!lengthOfTitle && lengthOfTitle > 20 ? 14 : 16,
                    theme.colors.SHERPA_BLUE,
                    1,
                    20
                  ),
                },
              ]}
              rightText={showViewAll ? 'VIEW ALL' : ''}
              rightTextStyle={showViewAll ? styles.widgetViewAllText : {}}
              onPressRightText={
                showViewAll
                  ? () => {
                      props.navigation.navigate(AppRoutes.TestListing, {
                        movedFrom: AppRoutes.Tests,
                        data: data,
                        cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
                        widgetType: data?.diagnosticWidgetType,
                      });
                    }
                  : undefined
              }
              style={showViewAll ? { paddingBottom: 1 } : {}}
            />
            {sectionLoading ? (
              renderSectionLoader(188)
            ) : (
              <ItemCard
                data={data}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={false}
                navigation={props.navigation}
                source={'Home Page'}
                sourceScreen={AppRoutes.Tests}
              />
            )}
          </>
        ) : null}
      </View>
    );
  };

  const renderWhyBookUs = () => {
    return (
      <View style={{ marginBottom: 15, marginTop: '2%' }}>
        <View style={{ marginLeft: 32 }}>
          <Text style={styles.whyBookUsHeading}>{nameFormater('why book with us', 'upper')} ?</Text>
        </View>
        <Carousel
          onSnapToItem={setBookUsSlideIndex}
          data={whyBookUsArray}
          renderItem={renderWhyBookUsSlider}
          sliderWidth={winWidth}
          itemWidth={winWidth}
          loop={true}
          autoplay={true}
          autoplayDelay={3000}
          autoplayInterval={3000}
        />
        <View style={[styles.landingBannerInnerView, { bottom: 0 }]}>
          {whyBookUsArray?.map((_, index) =>
            index == bookUsSlideIndex ? renderDot(true) : renderDot(false)
          )}
        </View>
      </View>
    );
  };

  const renderWhyBookUsSlider = ({ item, index }: { item: any; index: number }) => {
    const handleOnPress = () => {};
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleOnPress}
        key={index.toString()}
        style={{
          height: 200,
        }}
      >
        <ImageNative
          key={index.toString()}
          resizeMode={'contain'}
          style={styles.whyBookUsImage}
          source={item?.image}
        />
      </TouchableOpacity>
    );
  };

  const renderStepsToBook = () => {
    return (
      <ListCard
        onPress={() => {
          renderBookingStepsModal();
        }}
        container={styles.stepsToBookContainer}
        title={string.diagnostics.stepsToBook}
        leftIcon={<WorkflowIcon />}
        rightIcon={<ArrowRightYellow style={{ resizeMode: 'contain' }} />}
        titleStyle={{
          color: colors.SHERPA_BLUE,
          ...theme.fonts.IBMPlexSansMedium(13),
          lineHeight: 18,
        }}
      />
    );
  };

  const renderBookingStepsModal = () => {
    const divisionFactor = winHeight > 750 ? 2.2 : winHeight > 650 ? 1.7 : 1.5;
    return showAphAlert!({
      unDismissable: false,
      removeTopIcon: true,
      children: (
        <View
          style={[
            styles.stepsToBookModalView,
            {
              height: winHeight / divisionFactor,
            },
          ]}
        >
          <View style={styles.stepsToBookModalHeadingView}>
            <View>
              <Text style={styles.stepsToBookModalHeadingText}>
                {nameFormater(string.diagnostics.stepsToBookHeading, 'upper')}
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => hideAphAlert!()}
                activeOpacity={1}
                style={{ backgroundColor: 'transparent' }}
              >
                <Remove style={styles.removeIconStyle} />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            {stepsToBookArray.map((item: any, index: number) => {
              return (
                <>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={styles.stepsToBookModalMainTextView}>
                      <Image source={item.image} style={styles.stepsToBookModalIconStyle} />
                    </View>
                    <View style={{ width: '82%' }}>
                      {index == stepsToBookArray?.length - 1 ? (
                        <View>{renderStepsToBookText(item.heading, item.subtext)}</View>
                      ) : (
                        <ImageBackground
                          source={require('@aph/mobile-patients/src/components/ui/icons/bottomShadow.webp')}
                          style={{ height: index == 1 ? 118 : 108, width: 300 }}
                          resizeMode={'contain'}
                        >
                          {renderStepsToBookText(item.heading, item.subtext)}
                        </ImageBackground>
                      )}
                    </View>
                  </View>
                </>
              );
            })}
          </View>
        </View>
      ),
    });
  };

  const renderStepsToBookText = (heading: string, subText: string) => {
    return (
      <>
        <Text style={styles.stepsToBookModalMainTextHeading}>{heading}</Text>
        <Text style={styles.stepsToBookModalMainTextSubText}>{subText}</Text>
      </>
    );
  };

  const renderCertificateView = () => {
    return (
      <CertifiedCard
        titleText={string.diagnostics.certificateText}
        titleStyle={{
          color: colors.SHERPA_BLUE,
          ...theme.fonts.IBMPlexSansMedium(13),
          lineHeight: 18,
        }}
        leftIcon={<ShieldIcon />}
        bottomView={renderCertificateImages()}
      />
    );
  };

  const renderCertificateImages = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: '4%' }}>
        {imagesArray.map((img) => (
          <Image source={img} style={{ height: 36, width: 70 }} resizeMode={'contain'} />
        ))}
      </View>
    );
  };

  function refetchWidgets() {
    setWidgetsData([]);
    setLoading?.(true);
    //if banners are not loaded, then refetch them.
    banners?.length == 0 ? getDiagnosticBanner() : null;
    getHomePageWidgets(serviceableObject?.cityId);
  }

  const renderLowNetwork = () => {
    return (
      <LowNetworkCard
        heading1={string.common.couldNotLoadText}
        heading2={string.common.lowNetworkText}
        buttonTitle={'RETRY'}
        onPress={refetchWidgets}
      />
    );
  };

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  const renderPrescriptionCard = () => {
    return (
      <View>
        <FlatList
          bounces={false}
          pagingEnabled={true}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          horizontal={true}
          data={latestPrescription}
          renderItem={renderPrescriptionCardItems}
          maxToRenderPerBatch={3}
          snapToAlignment="center"
          scrollEventThrottle={16}
          decelerationRate={'fast'}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { x: orderPrescription_scrollX } } },
          ])}
        />
        <View style={styles.prescriptionStatusCardDots}>
          {latestPrescription?.length > 1
            ? latestPrescription?.map((_, i) => {
                let opacity = orderPrescription_position.interpolate({
                  inputRange: [i - 1, i, i + 1],
                  outputRange: [0.2, 1, 0.2],
                  extrapolate: 'clamp',
                });
                let width = orderPrescription_position.interpolate({
                  inputRange: [i - 1, i, i + 1],
                  outputRange: [8, 14, 8],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.sliderDotStyle,
                      {
                        width,
                        backgroundColor: colors.APP_YELLOW,
                        opacity,
                      },
                    ]}
                  />
                );
              })
            : null}
        </View>
      </View>
    );
  };

  const renderPrescriptionCardItems = ({ item, index }: { item: any; index: number }) => {
    const prescribedText = item?.caseSheet?.diagnosticPrescription;
    const doctorName = item?.doctorName;
    const doctorQualification = item?.doctorCredentials;
    const prescribedDateTime = moment(item?.prescriptionDateTime)?.format('DD MMM, YYYY , hh:mm a');
    const patientName = item?.patientName;
    return (
      <PrescriptionCard
        key={index?.toString()}
        heading1={`${prescribedText?.length} Tests Prescribed by`}
        docName={doctorName}
        docQualification={doctorQualification}
        dateTime={`on ${prescribedDateTime}`}
        patientName={`for ${patientName}`}
        buttonTitle={item?.orderCount == 0 ? 'Book Now' : 'Book Again'}
        onPressBookNow={() => onPressBookNow(item)}
        onPressViewPrescription={() => onPressViewPrescription(item)}
      />
    );
  };

  function onPressBookNow(item: any) {
    const testPrescription = item?.caseSheet?.diagnosticPrescription;
    addTestsToCart(testPrescription, client, '500030', setLoading)
      .then((tests: DiagnosticsCartItem[]) => {
        // Adding ePrescriptions to DiagnosticsCart
        const unAvailableItemsArray = testPrescription?.filter(
          (item: any) =>
            !tests?.find((val) => val?.name?.toLowerCase() == item?.itemname?.toLowerCase())
        );
        const unAvailableItems = unAvailableItemsArray
          ?.map((item: any) => item?.itemname)
          ?.join(', ');

        if (tests?.length) {
          addMultipleTestCartItems?.(tests);
          //removed code for e-prescriptions
        }
        if (testPrescription?.length == unAvailableItemsArray?.length) {
          Alert.alert(string.common.uhOh, string.common.noDiagnosticsAvailable);
        } else if (unAvailableItems) {
          Alert.alert(
            string.common.uhOh,
            `Out of ${testPrescription?.length} diagnostic(s), you are trying to order, following diagnostic(s) are not available.\n\n${unAvailableItems}\n`
          );
        }
        const getItemNames = tests?.map((item) => item?.name)?.join(', ');
        const getItemIds = tests?.map((item) => Number(item?.id))?.join(', ');
        setLoading?.(false);
        DiagnosticAddToCartEvent(getItemNames, getItemIds, 0, 0, 'Prescription');
        props.navigation.navigate(AppRoutes.TestsCart);
      })
      .catch((e) => {
        setLoading?.(false);
        handleGraphQlError(e);
      });
  }

  const getFileName = (item: any) => {
    return (
      'Prescription_' +
      moment(item?.prescriptionDateTime).format('DD MM YYYY') +
      '_' +
      item?.doctorName +
      '_Apollo 247' +
      new Date().getTime() +
      '.pdf'
    );
  };

  async function onPressViewPrescription(item: any) {
    const pdfName = item?.caseSheet?.blobName;
    const prescriptionDate = moment(item?.prescriptionDateTime).format('DD MM YYYY');
    const fileName: string = getFileName(item);
    //need to remove the event once added
    DiagnosticViewReportClicked(
      'Home',
      !!pdfName?.labReportURL ? 'Yes' : 'No',
      'Download Report PDF'
    );
    if (pdfName == null) {
      Alert.alert('No Image');
      CommonLogEvent('Tests', 'No image');
    } else {
      try {
        await downloadDiagnosticReport(
          setLoadingContext,
          AppConfig.Configuration.DOCUMENT_BASE_URL.concat(pdfName),
          prescriptionDate,
          item?.patientName,
          true,
          fileName
        );
      } catch (error) {
        setLoading?.(false);
        CommonBugFender('Tests_onPressViewPrescription_downloadLabTest', error);
      } finally {
        setLoading?.(false);
      }
    }
  }

  const orderStatusCardKeyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  const renderOrderStatusCard = () => {
    var allOrders = [];
    if (patientOpenOrders?.length == 3) {
      allOrders.push(patientOpenOrders);
    } else if (patientOpenOrders?.length && patientOpenOrders?.length < 3) {
      allOrders.push(patientOpenOrders);
      allOrders.push(patientClosedOrders);
    } else {
      allOrders.push(patientClosedOrders);
    }
    allOrders = allOrders?.flat(1);
    return (
      <>
        {allOrders?.length > 0 ? (
          <View style={{ marginBottom: 10 }}>
            <FlatList
              bounces={false}
              pagingEnabled={true}
              keyExtractor={orderStatusCardKeyExtractor}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              horizontal={true}
              data={allOrders}
              renderItem={renderOrderStatusCardItems}
              maxToRenderPerBatch={3}
              snapToAlignment="center"
              scrollEventThrottle={16}
              decelerationRate={'fast'}
              onScroll={Animated.event([
                { nativeEvent: { contentOffset: { x: orderStatus_scrollX } } },
              ])}
            />
            <View style={styles.orderStatusCardDots}>
              {allOrders?.length > 1
                ? allOrders?.map((_, i) => {
                    let opacity = orderStatus_position.interpolate({
                      inputRange: [i - 1, i, i + 1],
                      outputRange: [0.2, 1, 0.2],
                      extrapolate: 'clamp',
                    });
                    let width = orderStatus_position.interpolate({
                      inputRange: [i - 1, i, i + 1],
                      outputRange: [8, 14, 8],
                      extrapolate: 'clamp',
                    });
                    return (
                      <Animated.View
                        key={i}
                        style={[
                          styles.sliderDotStyle,
                          {
                            width,
                            backgroundColor: colors.APP_YELLOW,
                            opacity,
                          },
                        ]}
                      />
                    );
                  })
                : null}
            </View>
          </View>
        ) : null}
      </>
    );
  };

  const renderOrderStatusCardItems = ({
    item,
    index,
  }: {
    item: getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders;
    index: number;
  }) => {
    const appointmentTime = moment(item?.slotDateTimeInUTC)?.format('DD MMM, hh:mm a');
    return (
      <HomePageOrderStatusCard
        status={item?.orderStatus}
        patientName={`${item?.patientObj?.firstName} ${item?.patientObj?.lastName}`}
        appointmentTime={appointmentTime}
        key={item?.id}
        onPressBookNow={() => onPressOrderStatusOption(item)}
        testPreparationData={item?.diagnosticOrderLineItems?.[0]?.itemObj?.testPreparationData}
      />
    );
  };

  async function onPressOrderStatusOption(item: any) {
    const appointmentDate = moment(item?.slotDateTimeInUTC)?.format('DD MMM YYYY');
    const patientName = `${item?.patientObj?.firstName} ${item?.patientObj?.lastName}`;
    if (DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY.includes(item?.orderStatus)) {
      //track order
      navigateToTrackingScreen(item);
    } else if (DIAGNOSTIC_FULLY_DONE_STATUS_ARRAY.includes(item?.orderStatus)) {
      //view report download
      try {
        if (!!item?.labReportURL && item?.labReportURL != '') {
          await downloadDiagnosticReport(
            setLoadingContext,
            item?.labReportURL,
            appointmentDate,
            !!patientName ? patientName : '_',
            true,
            undefined
          );
        } else {
          showAphAlert?.({
            title: string.common.uhOh,
            description: string.diagnostics.responseUnavailableForReport,
          });
        }
      } catch (error) {
        setLoading?.(false);
        CommonBugFender('Tests_onPressOrderStatusOption_downloadLabTest', error);
      } finally {
        setLoading?.(false);
      }
    } else {
      if (DIAGNOSITC_PHELBO_TRACKING_STATUS.includes(item?.orderStatus)) {
        //track phlebo
        getPhelboDetails(item?.id, item);
      } else {
        navigateToTrackingScreen(item);
      }
    }
  }

  function navigateToTrackingScreen(item: any) {
    DiagnosticTrackOrderViewed(currentPatient, item?.orderStatus, item?.id, 'Home');
    props.navigation.navigate(AppRoutes.TestOrderDetails, {
      orderId: item?.id,
      selectedOrder: item,
      refundStatusArr: [], //since we don't get cancelled or failed orders
      comingFrom: AppRoutes.YourOrdersTest,
      showOrderSummaryTab: false,
    });
  }

  async function getPhelboDetails(orderId: string, order: any) {
    setLoading?.(true);
    try {
      let response: any = await getDiagnosticPhelboDetails(client, [orderId]);
      if (response?.data?.data) {
        const getUrl =
          response?.data?.data?.getOrderPhleboDetailsBulk?.orderPhleboDetailsBulk?.[0]
            ?.orderPhleboDetails;
        if (!!getUrl) {
          Linking.canOpenURL(getUrl).then((supported: any) => {
            if (supported) {
              DiagnosticTrackPhleboClicked(orderId, 'Home', currentPatient, 'Yes');
              Linking.openURL(getUrl);
            } else {
              DiagnosticTrackPhleboClicked(orderId, 'Home', currentPatient, 'No');
              CommonBugFender('Tests_getPhelboDetails_Unable_to_open_url', getUrl);
            }
          });
        } else {
          DiagnosticTrackPhleboClicked(orderId, 'Home', currentPatient, 'No');
          navigateToTrackingScreen(order);
        }
      }
      setLoading?.(false);
    } catch (error) {
      DiagnosticTrackPhleboClicked(orderId, 'Home', currentPatient, 'No');
      setLoading?.(false);
      CommonBugFender('Tests_onPressOrderStatusOption', error);
    }
  }

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
        {widgetsData?.length == 0 && reloadWidget && renderLowNetwork()}
        {renderBanner()}
        {renderYourOrders()}
        {latestPrescription?.length > 0 ? renderPrescriptionCard() : null}
        {renderOrderStatusCard()}
        {renderBottomViews()}
      </TouchableOpacity>
    );
  };

  const renderCartDetails = () => {
    return (
      <View style={styles.cartDetailView}>
        <Text style={styles.itemAddedText}>
          {cartItems?.length} {cartItems?.length == 1 ? 'Item' : 'Items'} Added to Cart
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.navigation.navigate(AppRoutes.TestsCart)}
        >
          <Text style={styles.goToCartText}>GO TO CART</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLocationNotServingPopUpForPincode = (pincode: string) => {
    showAphAlert?.({
      unDismissable: true,
      title: string.medicine_cart.tatUnServiceableAlertTitle,
      description: string.diagnostics.nonServiceableConfigPinCodeMsg.replace(
        '{{pincode}}',
        pincode
      ),
    });
  };

  const renderOverlay = () => {
    const isNoResultsFound =
      searchSate != 'load' && searchText.length > 2 && diagnosticResults?.length == 0;

    return (
      (!!diagnosticResults?.length || searchSate == 'load' || isNoResultsFound) && (
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

  const renderDiagnosticHeader = () => {
    const renderIcon = () => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigateToHome(props.navigation);
        }}
      >
        <HomeIcon style={{ height: 33, width: 33, resizeMode: 'contain' }} />
      </TouchableOpacity>
    );

    const renderCartIcon = () => (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ alignItems: 'flex-end' }}
          activeOpacity={1}
          onPress={() => props.navigation.navigate(AppRoutes.TestsCart)}
        >
          <CartIcon />
          {cartItemsCount > 0 && <Badge label={cartItemsCount} />}
        </TouchableOpacity>
      </View>
    );

    const renderNotificationIcon = () => {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.navigation.navigate(AppRoutes.NotificationScreen);
          }}
        >
          <NotificationIcon style={{ marginLeft: 10, marginRight: 5 }} />
          {notificationCount > 0 && renderBadge(notificationCount, {})}
        </TouchableOpacity>
      );
    };

    return (
      <View style={[styles.headerContainer, { paddingBottom: serviceabilityMsg ? 0 : 10 }]}>
        {renderIcon()}
        {renderDeliverToLocationCTA()}
        {renderCartIcon()}
        {renderNotificationIcon()}
      </View>
    );
  };
  const scrollWidgetSection = (data: any) => {
    return (
      <View style={styles.container}>
        <SectionHeader
          leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
          leftTextStyle={[
            styles.widgetHeading,
            {
              ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE, 1, 20),
            },
          ]}
          rightText={'VIEW ALL'}
          rightTextStyle={styles.widgetViewAllText} //showViewAll ? styles.widgetViewAllText : {}
          onPressRightText={() => {
            props.navigation.navigate(AppRoutes.TestWidgetListing, {
              movedFrom: AppRoutes.Tests,
              data: data,
              cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
            });
          }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionView}>
          {data?.diagnosticWidgetData?.map((item: any) => (
            <WidgetCard
              data={item}
              onPressWidget={() => {
                DiagnosticHomePageWidgetClicked(
                  data?.diagnosticWidgetTitle,
                  undefined,
                  undefined,
                  item?.itemTitle
                );
                {
                  props.navigation.navigate(AppRoutes.TestListing, {
                    widgetName: item?.itemTitle,
                    movedFrom: AppRoutes.Tests,
                    data: data,
                    cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
                    widgetType: data?.diagnosticWidgetType,
                  });
                }
              }}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderGridComponent = (data: any, item: any, index: number) => {
    return (
      <TouchableOpacity
        style={styles.gridPart}
        onPress={() => {
          DiagnosticHomePageWidgetClicked(
            data?.diagnosticWidgetTitle,
            undefined,
            undefined,
            item?.itemTitle
          );
          {
            props.navigation.navigate(AppRoutes.TestListing, {
              widgetName: item?.itemTitle,
              movedFrom: AppRoutes.Tests,
              data: data,
              cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
              widgetType: data?.diagnosticWidgetType,
            });
          }
        }}
      >
        <View style={styles.circleView}>
          <ImageNative resizeMode="contain" style={styles.image} source={{ uri: item.itemIcon }} />
        </View>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textStyle}>
          {nameFormater(item?.itemTitle, 'default')}
        </Text>
      </TouchableOpacity>
    );
  };
  const gridWidgetSection = (data: any) => {
    const numColumns = 3;
    let newGridData: any[] = [];
    if (
      data?.diagnosticWidgetData?.length >= numColumns &&
      data?.diagnosticWidgetData?.length % numColumns != 0
    ) {
      let sortedItemsIndex =
        data?.diagnosticWidgetData?.length - (data?.diagnosticWidgetData?.length % numColumns);
      newGridData = data?.diagnosticWidgetData.slice(0, sortedItemsIndex);
    } else {
      newGridData = data?.diagnosticWidgetData;
    }
    return (
      <View style={{ marginTop: 10 }}>
        <SectionHeader
          leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')} //nameFormater(data?.diagnosticWidgetTitle, 'upper')
          leftTextStyle={[
            styles.widgetHeading,
            {
              ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE, 1, 20),
            },
          ]}
          rightText={'VIEW ALL'}
          rightTextStyle={styles.widgetViewAllText} //showViewAll ? styles.widgetViewAllText : {}
          onPressRightText={() => {
            props.navigation.navigate(AppRoutes.TestWidgetListing, {
              movedFrom: AppRoutes.Tests,
              data: data,
              cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
            });
          }}
        />
        <View style={styles.gridConatiner}>
          <FlatList
            data={newGridData}
            numColumns={numColumns}
            keyExtractor={(_, index) => `${index}`}
            renderItem={({ item, index }) => renderGridComponent(data, item, index)}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {pageLoading ? (
          <View style={{ backgroundColor: 'white' }}>
            {renderDiagnosticHeader()}
            {renderSearchBar()}
            {renderTestDiagonosticsShimmer()}
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: 'white' }}>
              {renderDiagnosticHeader()}
              {renderSearchBar()}
              {renderSearchSuggestions()}
            </View>
            <View style={{ flex: 1 }}>
              <ScrollView
                removeClippedSubviews={true}
                bounces={false}
                style={{ flex: 1, marginBottom: !!cartItems && cartItems?.length > 0 ? 30 : 0 }}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {renderSections()}
                {renderOverlay()}
              </ScrollView>
              {!!cartItems && cartItems?.length > 0 ? renderCartDetails() : null}
            </View>
          </>
        )}
      </SafeAreaView>
      {showbookingStepsModal ? renderBookingStepsModal() : null}
    </View>
  );
};

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
  sectionView: {
    margin: 10,
    flexDirection: 'row',
  },
  container: {
    marginTop: 20,
  },
  gridConatiner: {
    width: '100%',
    backgroundColor: 'white',
    marginVertical: 20,
  },
  imagePlaceholderStyle: {
    backgroundColor: '#f7f8f5',
    opacity: 0.5,
    borderRadius: 5,
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
  widgetViewAllText: {
    ...theme.viewStyles.text('B', 14, theme.colors.APP_YELLOW, 1, 20),
    textAlign: 'right',
  },
  widgetHeading: {
    textAlign: 'left',
  },
  widgetView: {
    marginLeft: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 32,
    marginBottom: '2%',
  },
  whyBookUsHeading: {
    ...theme.viewStyles.text('SB', 15, theme.colors.SHERPA_BLUE, 0.5, 20),
    textAlign: 'left',
  },
  itemAddedText: {
    marginLeft: 20,
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, theme.colors.WHITE),
    lineHeight: 16,
    textAlign: 'left',
    alignSelf: 'center',
  },
  goToCartText: {
    marginRight: 20,
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.WHITE),
    lineHeight: 20,
    textAlign: 'right',
    alignSelf: 'center',
  },
  cartDetailView: {
    position: 'absolute',
    backgroundColor: colors.APP_YELLOW_COLOR,
    bottom: 0,
    height: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceabilityMsg: { ...theme.viewStyles.text('R', 10, '#890000') },
  headerContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  stepsToBookModalView: {
    paddingLeft: 30,
    paddingRight: 20,
    paddingTop: 20,
  },
  stepsToBookModalHeadingView: { flexDirection: 'row', justifyContent: 'space-between' },
  stepsToBookModalHeadingText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 14 : 15, colors.SHERPA_BLUE, 1, 20),
  },
  removeIconStyle: {
    tintColor: colors.APP_YELLOW_COLOR,
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  stepsToBookModalMainTextView: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: -10,
  },
  stepsToBookModalIconStyle: {
    height: 30,
    width: 30,
  },
  stepsToBookModalMainTextHeading: {
    marginTop: '2%',
    marginHorizontal: 20,
    ...theme.viewStyles.text('SB', isSmallDevice ? 14 : 15, '#5C586F', 1, 20),
  },
  stepsToBookModalMainTextSubText: {
    marginBottom: '4%',
    marginHorizontal: 20,
    ...theme.viewStyles.text('R', isSmallDevice ? 13 : 14, colors.SHERPA_BLUE, 1, 20),
  },
  stepsToBookContainer: {
    marginBottom: 24,
    marginTop: 10,
  },
  whyBookUsImage: { width: '100%', height: 200 },
  headingSections: { ...theme.viewStyles.text('B', 14, colors.SHERPA_BLUE, 1, 22) },
  viewDefaultContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f7f8f5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  defaultContainer: {
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingVertical: 0,
    backgroundColor: 'white',
  },
  circleView: {
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: 50,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  gridPart: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '33%',
    borderColor: '#E8E8E8',
    borderWidth: 0.5,
    padding: 15,
  },
  textStyle: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1, 20, 0),
    padding: 5,
  },
  orderStatusCardDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 35,
    alignSelf: 'flex-start',
    left: 32,
  },
  prescriptionStatusCardDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 35,
    alignSelf: 'flex-start',
    left: 32,
  },
});
