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
  WidgetLiverIcon,
  PolygonIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  GET_PATIENT_ADDRESS_LIST,
  GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
  SET_DEFAULT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';
import {
  getLandingPageBanners,
  getDiagnosticHomePageWidgets,
  DIAGNOSTIC_GROUP_PLAN,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  g,
  nameFormater,
  isSmallDevice,
  navigateToHome,
  addTestsToCart,
  handleGraphQlError,
  downloadDiagnosticReport,
  isAddressLatLngInValid,
  setAsyncPharmaLocation,
  downloadDocument,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
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
  Image as ImageNative,
  ImageBackground,
  BackHandler,
  Alert,
  Linking,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { Image } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import {
  DIAGNOSTIC_ORDER_STATUS,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CommonBugFender,
  CommonLogEvent,
  isIphone5s,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { postMyOrdersClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import _ from 'lodash';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import {
  diagnosticServiceability,
  getDiagnosticClosedOrders,
  getDiagnosticOpenOrders,
  getDiagnosticPatientPrescription,
  getDiagnosticPhelboDetails,
  getUserBannersList,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  DIAGNOSTIC_PINCODE_SOURCE_TYPE,
  sourceHeaders,
} from '@aph/mobile-patients/src/utils/commonUtils';
import Carousel from 'react-native-snap-carousel';
import CertifiedCard from '@aph/mobile-patients/src/components/Tests/components/CertifiedCard';
import {
  DiagnosticAddToCartEvent,
  DiagnosticBannerClick,
  DiagnosticHomePageWidgetClicked,
  DiagnosticPinCodeClicked,
  DiagnosticTrackOrderViewed,
  DiagnosticTrackPhleboClicked,
  DiagnosticViewReportClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import ItemCard from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import PackageCard from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  AppConfig,
  DIAGNOSITC_PHELBO_TRACKING_STATUS,
  DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
  stepsToBookArray,
} from '@aph/mobile-patients/src/strings/AppConfig';
import {
  findDiagnosticsWidgetsPricing,
  findDiagnosticsWidgetsPricingVariables,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsWidgetsPricing';
import LowNetworkCard from '@aph/mobile-patients/src/components/Tests/components/LowNetworkCard';
import { WidgetCard } from '@aph/mobile-patients/src/components/Tests/components/WidgetCard';

import {
  renderBannerShimmer,
  renderDiagnosticWidgetHeadingShimmer,
  renderDiagnosticWidgetShimmer,
  renderTestDiagonosticsShimmer,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import moment from 'moment';

import AsyncStorage from '@react-native-community/async-storage';
import { OrderCardCarousel } from '@aph/mobile-patients/src/components/Tests/components/OrderCardCarousel';
import { PrescriptionCardCarousel } from '@aph/mobile-patients/src/components/Tests/components/PrescriptionCardCarousel';
import { TestViewReportOverlay } from '@aph/mobile-patients/src/components/Tests/components/TestViewReportOverlay';
import { DiagnosticLocation } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticLocation';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

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
const AUTO_SCROLL_INTERVAL = 3000;
const divisionFactor = winHeight > 750 ? 2.2 : winHeight > 650 ? 1.7 : 1.5;

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
  const { setAddresses: setMedAddresses } = useShoppingCart();
  const {
    cartItems,
    addCartItem,
    isDiagnosticCircleSubscription,
    setIsDiagnosticCircleSubscription,
    setDeliveryAddressId,
    deliveryAddressId,
    setAddresses: setTestAddress,
    addMultipleCartItems: addMultipleTestCartItems,
    setDiagnosticSlot,
    newAddressAddedHomePage,
    setNewAddressAddedHomePage,
    patientCartItems,
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

  type Address = savePatientAddress_savePatientAddress_patientAddress;

  const client = useApolloClient();
  const movedFrom = props.navigation.getParam('movedFrom');
  const { currentPatient } = useAllCurrentPatients();

  const hdfc_values = string.Hdfc_values;
  const cartItemsCount = cartItems?.length + shopCartItems?.length;
  const [loading, setLoading] = useState<boolean>(false);

  const [bannerLoading, setBannerLoading] = useState(true);
  const [imgHeight, setImgHeight] = useState(200);
  const [slideIndex, setSlideIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [viewReportOrderId, setViewReportOrderId] = useState<number>(0);

  const [sectionLoading, setSectionLoading] = useState<boolean>(false);
  const [bookUsSlideIndex, setBookUsSlideIndex] = useState(0);
  const [showbookingStepsModal, setShowBookingStepsModal] = useState(false);

  const [widgetsData, setWidgetsData] = useState([] as any);
  const [reloadWidget, setReloadWidget] = useState<boolean>(false);

  const [latestPrescription, setLatestPrescription] = useState([] as any);

  const [patientOpenOrders, setPatientOpenOrders] = useState([] as any);
  const [patientClosedOrders, setPatientClosedOrders] = useState([] as any);

  const [isCurrentScreen, setCurrentScreen] = useState<string>('');

  const [serviceabilityMsg, setServiceabilityMsg] = useState('');
  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();
  const defaultAddress = addresses?.find((item) => item?.defaultAddress);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
 
  const [clickedItem, setClickedItem] = useState<any>([]);
  const [showLocationPopup, setLocationPopup] = useState<boolean>(false);
  const [source, setSource] = useState<DIAGNOSTIC_PINCODE_SOURCE_TYPE>();
  const [showUnserviceablePopup, setUnserviceablePopup] = useState<boolean>(false);

  const hasLocation = locationDetails || diagnosticLocation || pharmacyLocation || defaultAddress;
  const [serviceableObject, setServiceableObject] = useState({} as any);
  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsWidgetsPricing, findDiagnosticsWidgetsPricingVariables>({
      query: GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
      context: {
        sourceHeaders,
      },
      variables: {
        cityID: Number(cityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
        itemIDs: listOfId,
      },
      fetchPolicy: 'no-cache',
    });

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number,
    source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
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

  //sync pharma with diag?

  function saveDiagnosticLocation(
    locationDetails: LocationData,
    source: DIAGNOSTIC_PINCODE_SOURCE_TYPE
  ) {
    setSource(source);
    setDiagnosticLocation?.(locationDetails);
    setLocationDetails?.(locationDetails);
  }

  function createDefaultAddress() {
    return AppConfig.Configuration.DIAGNOSTIC_DEFAULT_LOCATION as LocationData;
  }

  //if new address is added on cart page
  useEffect(() => {
    if (newAddressAddedHomePage != '') {
      const selectedAddress = addresses?.find((item) => item?.id === deliveryAddressId);
      saveDiagnosticLocation(
        formatAddressToLocation(selectedAddress),
        DIAGNOSTIC_PINCODE_SOURCE_TYPE.ADDRESS
      );
      setNewAddressAddedHomePage?.('');
    }
  }, [newAddressAddedHomePage]);

  //last operation done by the user.
  // useEffect(() => {
  //   let getLocationDetails = !!asyncPincode
  //     ? asyncPincode
  //     : !!locationDetails
  //     ? locationDetails
  //     : pharmacyLocation!;
  //   setDiagnosticLocation?.(getLocationDetails);
  //   setAsyncDiagnosticPincode?.(getLocationDetails);
  //   checkIsPinCodeServiceable(getLocationDetails?.pincode, 'manual', 'pharmaPincode');
  // }, [asyncPincode]); //removed location details

  /**
   * fetch widgets
   */
  useEffect(() => {
    if (!!!diagnosticLocation) {
      //if addresses has not yet been fetched + fresh state...
      if (!!addresses && addresses?.length > 0) {
        const defaultAddress = addresses?.find((item) => item?.defaultAddress);
        const getFirstAddress = addresses?.[0];
        saveDiagnosticLocation(
          formatAddressToLocation(defaultAddress! || getFirstAddress!),
          DIAGNOSTIC_PINCODE_SOURCE_TYPE.ADDRESS
        );
      } else {
        const getDefaultLocation = createDefaultAddress();
        //if everything is null, then load it from hyderabad.
        saveDiagnosticLocation(
          formatAddressToLocation(
            !!pharmacyLocation
              ? pharmacyLocation
              : !!locationDetails
              ? locationDetails
              : getDefaultLocation
          ),
          DIAGNOSTIC_PINCODE_SOURCE_TYPE.AUTO
        );
      }
    }
  }, []);

  //loading address, open-closed order, circle banners for the user.
  useEffect(() => {
    if (currentPatient) {
      fetchAddress();
      fetchPatientOpenOrders();
      fetchPatientClosedOrders();
      fetchPatientPrescriptions();
      getUserBanners();
    }
  }, [currentPatient]);

  //call the serviceability api.
  useEffect(() => {
    if (!!diagnosticLocation) {
      fetchAddressServiceability(diagnosticLocation);
    }
  }, [diagnosticLocation]);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setBannerData && setBannerData([]); // default banners to be empty
      getUserBanners();
      setCurrentScreen(AppRoutes.Tests); //to avoid showing non-serviceable prompt on medicine page
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setCurrentScreen('');
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
            setImgHeight(Math.max(height * (winWidth / width) + 20, 180));
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
        AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
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

  const getDiagnosticBanner = async (cityId: number) => {
    try {
      const res: any = await getLandingPageBanners('diagnostic', Number(cityId));
      //if true then only show it.
      if (res?.data?.success) {
        const bannerData = g(res, 'data', 'data');
        setBanners(bannerData);
      } else {
        setBanners([]);
        setBannerLoading(false);
        setLoading(false);
      }
    } catch (error) {
      CommonBugFender('getDiagnosticBanner_Tests', error);
      setBanners([]);
      setBannerLoading(false);
      setLoading(false);
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
        setSectionLoading(false);
        setWidgetsData([]);
        setLoading?.(false);
        setPageLoading?.(false);
        setBannerLoading(false);
        setReloadWidget(true);
      }
    } catch (error) {
      CommonBugFender('getHomePageWidgets_Tests', error);
      setWidgetsData([]);
      setLoading?.(false);
      setReloadWidget(true);
      setPageLoading?.(false);
      setSectionLoading(false);
      setBannerLoading(false);
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
              Number(cityId!) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
              item?.length > 12 ? item?.slice(0, 12) : item
            )
          )
      );

      const response = (await res)?.map(
        (item: any) => g(item, 'data', 'findDiagnosticsWidgetsPricing', 'diagnostics') || []
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
      setBannerLoading(false);
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

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const formatAddressToLocation = (address: Address | any): LocationData => ({
    displayName: address?.city!,
    latitude: address?.latitude!,
    longitude: address?.longitude!,
    area: '',
    city: address?.city!,
    state: address?.state!,
    stateCode: address?.stateCode!,
    country: '',
    pincode: !!address?.zipcode ? address?.zipcode! : address?.pincode,
    lastUpdated: new Date().getTime(),
  });

  async function fetchAddress() {
    try {
      if (addresses?.length) {
        const deliveryAddress = addresses?.find((item) => item?.defaultAddress);
        if (deliveryAddress) {
          if (!diagnosticLocation) {
            saveDiagnosticLocation?.(
              formatAddressToLocation(deliveryAddress),
              DIAGNOSTIC_PINCODE_SOURCE_TYPE.ADDRESS
            );
            return;
          }
        }
      }
      setPageLoading?.(true);
      const response = await client.query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: currentPatient?.id },
        fetchPolicy: 'no-cache',
      });
      const addressList = (response?.data?.getPatientAddressList?.addressList as Address[]) || [];
      setAddresses?.(addressList);
      setTestAddress?.(addressList);
      const deliveryAddress = addressList?.find((item) => item?.defaultAddress);
      if (deliveryAddress) {
        if (!diagnosticLocation) {
          saveDiagnosticLocation?.(
            formatAddressToLocation(deliveryAddress),
            DIAGNOSTIC_PINCODE_SOURCE_TYPE.ADDRESS
          );
        }
      } else {
        //  -> load default hyderabad.
      }
      setPageLoading?.(false);
    } catch (error) {
      // -> load default hyderabad.
      setPageLoading?.(false);
      CommonBugFender('fetching_Addresses_on_Test_Page', error);
    }
  }

  async function fetchAddressServiceability(selectedAddress: LocationData) {
    let obj = {} as DiagnosticData;
    const pincode = String(selectedAddress?.pincode);
    if (!!selectedAddress && !!selectedAddress?.latitude && !!selectedAddress?.longitude) {
      setPageLoading?.(true);
      setSectionLoading(true);
      try {
        const response = await diagnosticServiceability(
          client,
          Number(selectedAddress?.latitude),
          Number(selectedAddress?.longitude)
        );
        if (
          !response?.errors &&
          response?.data?.getDiagnosticServiceability &&
          response?.data?.getDiagnosticServiceability?.status
        ) {
          const getServiceableResponse =
            response?.data?.getDiagnosticServiceability?.serviceability;
          if (!!getServiceableResponse) {
            obj = {
              cityId: getServiceableResponse?.cityID?.toString() || '0',
              stateId: getServiceableResponse?.stateID?.toString() || '0',
              state: getServiceableResponse?.state || '',
              city: getServiceableResponse?.city || '',
            };
            setServiceableObject(obj);
            setDiagnosticServiceabilityData?.(obj); //sets the city,state, and there id's
            setDiagnosticLocationServiceable?.(true);
            setServiceabilityMsg('');
            setUnserviceablePopup(false);
            !!source && DiagnosticPinCodeClicked(currentPatient, pincode, true, source);
          } else {
            //null in case of non-serviceable
            obj = getNonServiceableObject();
            setNonServiceableValues(obj, pincode);
          }
          getDiagnosticBanner(Number(getServiceableResponse?.cityID));
          getHomePageWidgets(obj?.cityId);
        } //end of if
        else {
          obj = getNonServiceableObject();
          setNonServiceableValues(obj, pincode);
        }
        getDiagnosticBanner(AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID);
        getHomePageWidgets(obj?.cityId);
      } catch (error) {
        //end of try
        setPageLoading?.(false);
        CommonBugFender('fetchAddressServiceability_Tests', error);
        setLoadingContext?.(false);
        setReloadWidget(true);
        setSectionLoading(false);
        setBannerLoading(false);
      }
    } //end of address exist
  }

  function getNonServiceableObject() {
    var obj;
    return (obj = {
      cityId: String(AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID),
      stateId: '0',
      state: '',
      city: 'Hyderabad',
    });
  }

  function setNonServiceableValues(obj: any, pincode: string) {
    setServiceableObject(obj);
    setDiagnosticServiceabilityData?.(obj);
    setPageLoading?.(false);
    setDiagnosticLocationServiceable?.(false);
    setUnserviceablePopup(true);
    //not serving pop-up needs to be seen.
    // isCurrentScreen == AppRoutes.Tests
    //   ? renderNonServiceablePopUp(selectedAddress?.displayName) //returned by api displayName
    //   : null;

    setServiceabilityMsg(string.diagnostics.nonServiceableMsg1);
    !!source && DiagnosticPinCodeClicked(currentPatient, pincode, false, source);
  }

  const renderYourOrders = () => {
    return (
      <ListCard
        onPress={() => {
          postMyOrdersClicked('Diagnostics', currentPatient);
          props.navigation.push(AppRoutes.YourOrdersTest, {
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
    //passed zero till the time prices aren't updated.
    postDiagnosticAddToCartEvent(
      stripHtml(itemName),
      `${itemId}`,
      0,
      0,
      DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PARTIAL_SEARCH
    );
    addCartItem?.({
      id: `${itemId}`,
      name: stripHtml(itemName),
      price: pricesObject?.rate || 0,
      specialPrice: pricesObject?.specialPrice! || pricesObject?.rate || 0,
      circlePrice: pricesObject?.circlePrice,
      circleSpecialPrice: pricesObject?.circleSpecialPrice,
      discountPrice: pricesObject?.discountPrice,
      discountSpecialPrice: pricesObject?.discountSpecialPrice,
      mou: 1,
      thumbnail: '',
      collectionMethod: collectionType! || TEST_COLLECTION_TYPE?.HC,
      groupPlan: selectedPlan?.groupPlan || DIAGNOSTIC_GROUP_PLAN.ALL,
      packageMrp: pricesObject?.mrpToDisplay || 0,
      inclusions: inclusions == null ? [Number(itemId)] : inclusions,
      isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
    });
  };

  const [searchText, setSearchText] = useState<string>('');
  const [diagnosticResults, setDiagnosticResults] = useState<
    searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  >([]);

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
        if (data?.APOLLO?.[0]._id && data?.APOLLO?.[0]?.status !== 'disabled') {
          AsyncStorage.setItem('circleSubscriptionId', data?.APOLLO?.[0]._id);
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
    const styles = StyleSheet.create({
      containerStyle: {
        marginBottom: 20,
        marginTop: 12,
        alignSelf: 'center',
      },
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
        }}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

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

  const renderLocationSearch = () => {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showLocationPopup}
        onRequestClose={() => {
          setLocationPopup(false);
        }}
        onDismiss={() => {
          setLocationPopup(false);
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <DiagnosticLocation
            goBack={handleLocationBack}
            addressList={addresses}
            onPressSelectAddress={handleSelectedAddress}
            onPressSearchLocation={(item) => handleSelectedSuggestion(item)}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  function handleLocationBack(locationResponse: LocationData | null) {
    setLocationPopup(false);
    if (!!locationResponse) {
      //empty the deliveryAddressId -> default -> needs to show the one closest
      setDeliveryAddressId?.('');
      saveDiagnosticLocation(locationResponse, DIAGNOSTIC_PINCODE_SOURCE_TYPE.AUTO);
    }
  }

  function handleSelectedAddress(selectedAddress: Address) {
    setLocationPopup(false);
    if (!!selectedAddress) {
      //set the selected address to be the default address & set the deliveryAddressId
      setDefaultAddress(selectedAddress);
    }
  }

  function handleSelectedSuggestion(selectedLocation: any) {
    setLocationPopup(false);
    //empty the deliveryAddressId -> default -> needs to show the one closest
    setDeliveryAddressId?.('');
    saveDiagnosticLocation(
      formatAddressToLocation(selectedLocation),
      DIAGNOSTIC_PINCODE_SOURCE_TYPE.SEARCH
    );
  }

  function _onPressChangeLocation() {
    setLocationPopup(true);
    setUnserviceablePopup(false);
  }

  async function setDefaultAddress(address: Address) {
    try {
      const isSelectedAddressWithNoLatLng = isAddressLatLngInValid(address);
      if (isSelectedAddressWithNoLatLng) {
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
        saveDiagnosticLocation(
          formatAddressToLocation(deliveryAddress),
          DIAGNOSTIC_PINCODE_SOURCE_TYPE.ADDRESS
        );
        setLoading?.(false);
      }
    } catch (error) {
      setLoading?.(false);
      CommonBugFender('Tests_setDefaultAddress', error);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.common.unableToSetDeliveryAddress,
      });
    }
  }

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

  const formatText = (text: string, count: number) =>
    text.length > count ? `${text.slice(0, count)}...` : text;

  const renderDeliverToLocationCTA = () => {
    //need to show start of address if default, otherwise ??
    const location = `${formatText(
      diagnosticLocation?.city || diagnosticLocation?.state || '',
      18
    )} ${!!diagnosticLocation?.pincode ? diagnosticLocation?.pincode : ''}`;
    return (
      <View style={{ paddingLeft: 15, marginTop: 3.5 }}>
        {hasLocation ? (
          <TouchableOpacity
            style={{ marginTop: -7.5 }}
            onPress={() => {
              setLocationPopup(true);
              setUnserviceablePopup(false);
            }}
          >
            <Text numberOfLines={1} style={styles.deliverToText}>
              {string.diagnostics.collectionFromText}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View>
                <Text style={styles.locationText}>{nameFormater(location, 'title')}</Text>
                <Spearator style={styles.locationTextUnderline} />
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

  const renderNonServiceableToolTip = () => {
    return (
      <TouchableOpacity
        onPress={() => setUnserviceablePopup(false)}
        style={{
          position: 'absolute',
          height: winHeight,
          width: winWidth,
        }}
      >
        <View style={styles.nonServiceableToolTip}>
          <PolygonIcon style={styles.toolTipIcon} />
          <View style={{ padding: 12 }}>
            <Text style={styles.unserviceableHeading}>
              {string.addressSelection.unserviceableHeading}
            </Text>
            <Text style={styles.unserviceableMsg}>{string.addressSelection.unserviceableText}</Text>

            <View style={{ marginTop: 12 }}>
              <Button
                style={styles.unserviceableButton}
                titleTextStyle={styles.unserviceableCTAStyle}
                title={'CHANGE LOCATION'}
                onPress={() => _onPressChangeLocation()}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
            autoplayDelay={AUTO_SCROLL_INTERVAL}
            autoplayInterval={AUTO_SCROLL_INTERVAL}
          />
          <View style={styles.landingBannerInnerView}>
            {banners?.length > 1 &&
              banners?.map((_, index) =>
                index == slideIndex ? renderDot(true) : renderDot(false)
              )}
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
        //for rtpcr - drive through - open webview
        if (item?.redirectUrlText === 'WebView') {
          DiagnosticBannerClick(slideIndex + 1, Number(item?.itemId), item?.bannerTitle);
          try {
            const openUrl = item?.redirectUrl || AppConfig.Configuration.RTPCR_Google_Form;
            props.navigation.navigate(AppRoutes.CovidScan, {
              covidUrl: openUrl,
            });
          } catch (e) {
            aphConsole.log(e);
            CommonBugFender('renderSliderItem_handleOnPress_Tests', e);
          }
        }
        //redirect to details page
        else {
          const data = item?.redirectUrl?.split('=')?.[1];
          const extractData = data?.replace('apollopatients://', '');
          const getNavigationDetails = extractData?.split('?');
          const route = getNavigationDetails?.[0];
          let itemId = '';
          try {
            if (getNavigationDetails?.length >= 2) {
              itemId = getNavigationDetails?.[1]?.split('&');
              if (itemId?.length > 0) {
                itemId = itemId[0];
              }
            }
          } catch (error) {}
          if (route == 'TestDetails') {
            DiagnosticBannerClick(slideIndex + 1, Number(itemId), item?.bannerTitle);
            props.navigation.navigate(AppRoutes.TestDetails, {
              itemId: itemId,
              comingFrom: AppRoutes.Tests,
            });
          }
        }
      }
    };
    return (
      <TouchableOpacity activeOpacity={1} onPress={handleOnPress}>
        <ImageNative
          resizeMode="stretch"
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: item?.bannerImage }}
        />
      </TouchableOpacity>
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
  let listShowLength = 10
    const isPricesAvailable =
      !!data &&
      data?.diagnosticWidgetData?.length > 0 &&
      data?.diagnosticWidgetData?.find((item: any) => item?.diagnosticPricing);
    const showViewAll = !!isPricesAvailable && data?.diagnosticWidgetData?.length > 2;
    const lengthOfTitle = data?.diagnosticWidgetTitle?.length;
    return (
      <View style={!!isPricesAvailable ? styles.widgetSpacing : {}}>
        {!!isPricesAvailable ? (
          <>
            {sectionLoading ? (
              renderDiagnosticWidgetHeadingShimmer() //load heading
            ) : (
              <SectionHeader
                leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
                leftTextStyle={[
                  styles.widgetHeading,
                  {
                    ...theme.viewStyles.text(
                      'B',
                      !!lengthOfTitle && lengthOfTitle > 20 ? 13 : 16,
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
            )}
            {sectionLoading ? (
              renderDiagnosticWidgetShimmer(false) //to load package card
            ) : (
              <PackageCard
                data={data}
                diagnosticWidgetData={data?.diagnosticWidgetData?.slice(
                  0,
                  data?.diagnosticWidgetData?.length >= listShowLength
                    ? listShowLength
                    : data?.diagnosticWidgetData?.length
                )}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={false}
                navigation={props.navigation}
                source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME}
                sourceScreen={AppRoutes.Tests}
              />
            )}
          </>
        ) : sectionLoading ? (
          renderDiagnosticWidgetShimmer(true) //to show overall widget
        ) : null}
      </View>
    );
  };

  const renderTestWidgets = (data: any) => {
    const isPricesAvailable =
      !!data &&
      data?.diagnosticWidgetData?.length > 0 &&
      data?.diagnosticWidgetData?.find((item: any) => item?.diagnosticPricing);
    const showViewAll = !!isPricesAvailable && data?.diagnosticWidgetData?.length > 2;
    const lengthOfTitle = data?.diagnosticWidgetTitle?.length;

    return (
      <View style={!!isPricesAvailable ? styles.widgetSpacing : {}}>
        {!!isPricesAvailable ? (
          <>
            {sectionLoading ? (
              renderDiagnosticWidgetHeadingShimmer() //load heading
            ) : (
              <SectionHeader
                leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
                leftTextStyle={[
                  styles.widgetHeading,
                  {
                    ...theme.viewStyles.text(
                      'B',
                      !!lengthOfTitle && lengthOfTitle > 20 ? 13 : 16,
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
            )}
            {sectionLoading ? (
              renderDiagnosticWidgetShimmer(false) //load package card
            ) : (
              <ItemCard
                data={data}
                diagnosticWidgetData={data?.diagnosticWidgetData}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={false}
                navigation={props.navigation}
                source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME}
                sourceScreen={AppRoutes.Tests}
              />
            )}
          </>
        ) : sectionLoading ? (
          renderDiagnosticWidgetShimmer(true) //load overall widget
        ) : null}
      </View>
    );
  };

  const renderWhyBookUs = () => {
    return (
      <View style={{ marginBottom: -20 }}>
        <View style={{ marginLeft: 32 }}>
          <Text style={styles.whyBookUsHeading}>
            {nameFormater(string.diagnostics.whyBookUs, 'upper')} ?
          </Text>
        </View>
        <Carousel
          onSnapToItem={setBookUsSlideIndex}
          data={whyBookUsArray}
          renderItem={renderWhyBookUsSlider}
          sliderWidth={winWidth}
          itemWidth={winWidth}
          loop={true}
          autoplay={true}
          autoplayDelay={AUTO_SCROLL_INTERVAL}
          autoplayInterval={AUTO_SCROLL_INTERVAL}
        />
        <View style={[styles.landingBannerInnerView, { bottom: 30 }]}>
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
          height: 230,
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
        titleStyle={styles.stepsToBookTitleStyle}
      />
    );
  };

  const renderBookingStepsModal = () => {
    return showAphAlert?.({
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
    banners?.length == 0
      ? getDiagnosticBanner(
          Number(serviceableObject?.cityId || diagnosticServiceabilityData?.cityId)
        )
      : null;
    getHomePageWidgets(serviceableObject?.cityId || diagnosticServiceabilityData?.cityId!);
    //call patients orders + prescriptions as well.
    fetchPatientOpenOrders();
    fetchPatientClosedOrders();
    fetchPatientPrescriptions();
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

  const renderPrescriptionCard = () => {
    return (
      <View>
        {latestPrescription?.length > 0 ? (
          <PrescriptionCardCarousel
            data={latestPrescription}
            onPressBookNow={onPressBookNow}
            onPressViewPrescription={onPressViewPrescription}
          />
        ) : null}
      </View>
    );
  };

  function onPressBookNow(item: any) {
    const testPrescription = item?.caseSheet?.diagnosticPrescription;
    addTestsToCart(testPrescription, client, '500030', setLoadingContext)
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
          showAphAlert?.({
            title: string.common.uhOh,
            description: string.common.noDiagnosticsAvailable,
            onPressOk: () => {
              _navigateToTestCart();
            },
            onPressOutside: () => {
              _navigateToTestCart();
            },
          });
        } else {
          //in case of if any unavailable items or all are present
          const lengthOfAvailableItems = tests?.length;
          const testAdded = tests?.map((item) => nameFormater(item?.name), 'title').join('\n');
          showAphAlert?.({
            title:
              !!lengthOfAvailableItems && lengthOfAvailableItems > 0
                ? `${lengthOfAvailableItems} ${
                    lengthOfAvailableItems > 1 ? 'items' : 'item'
                  } added to your cart`
                : string.common.uhOh,
            description: unAvailableItems
              ? `Below items are added to your cart: \n${testAdded} \nSearch for the remaining diagnositc tests and add to the cart.`
              : `Below items are added to your cart: \n${testAdded}`,
            onPressOk: () => {
              _navigateToTestCart();
            },
            onPressOutside: () => {
              _navigateToTestCart();
            },
          });
        }
        const getItemNames = tests?.map((item) => item?.name)?.join(', ');
        const getItemIds = tests?.map((item) => Number(item?.id))?.join(', ');
        setLoadingContext?.(false);
        DiagnosticAddToCartEvent(
          getItemNames,
          getItemIds,
          0,
          0,
          DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PRESCRIPTION
        );
      })
      .catch((e) => {
        setLoadingContext?.(false);
        handleGraphQlError(e);
      });
  }

  function _navigateToTestCart() {
    hideAphAlert?.();
    // props.navigation.navigate(AppRoutes.TestsCart);
    props.navigation.navigate(AppRoutes.AddPatients);
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
    if (pdfName == null || pdfName == '') {
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
        setLoadingContext?.(false);
        CommonBugFender('Tests_onPressViewPrescription_downloadLabTest', error);
      } finally {
        setLoadingContext?.(false);
      }
    }
  }

  const renderOrderStatusCard = () => {
    var allOrders = [];
    if (patientOpenOrders?.length == 3) {
      allOrders.push(patientOpenOrders);
    } else if (patientOpenOrders?.length && patientOpenOrders?.length < 3) {
      let closedOrders = patientClosedOrders.slice(0, 3 - patientOpenOrders?.length);
      allOrders.push(patientOpenOrders);
      allOrders.push(closedOrders);
    } else {
      allOrders.push(patientClosedOrders);
    }
    allOrders = allOrders?.flat(1);
    return (
      <View>
        {allOrders?.length > 0 ? (
          <OrderCardCarousel data={allOrders} onPressBookNow={onPressOrderStatusOption} />
        ) : null}
      </View>
    );
  };

  async function onPressOrderStatusOption(item: any) {
    if (DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY.includes(item?.orderStatus)) {
      //track order
      navigateToTrackingScreen(item);
    } else if (DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY.includes(item?.orderStatus)) {
      DiagnosticViewReportClicked(
        'Home',
        !!item?.labReportURL ? 'Yes' : 'No',
        'Download Report PDF',
        item?.id
      );
      //view report download
      //need to remove the event once added
      DiagnosticViewReportClicked(
        'Home',
        !!item?.labReportURL ? 'Yes' : 'No',
        'Download Report PDF',
        item?.id
      );
      if (!!item?.labReportURL && item?.labReportURL != '') {
        onPressViewReport();
        setClickedItem(item);
      } else {
        showAphAlert?.({
          title: string.common.uhOh,
          description: string.diagnostics.responseUnavailableForReport,
        });
      }
    } else {
      if (DIAGNOSITC_PHELBO_TRACKING_STATUS.includes(item?.orderStatus)) {
        //track phlebo
        item?.orderStatus === DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED
          ? navigateToTrackingScreen(item)
          : getPhelboDetails(item?.id, item);
      } else {
        navigateToTrackingScreen(item);
      }
    }
  }

  async function onPressViewReport() {
    const appointmentDate = moment(clickedItem?.slotDateTimeInUTC)?.format('DD MMM YYYY');
    const patientName = `${clickedItem?.patientObj?.firstName} ${clickedItem?.patientObj?.lastName}`;
    try {
      setViewReportOrderId(clickedItem?.orderId);
      await downloadDiagnosticReport(
        setLoadingContext,
        clickedItem?.labReportURL,
        appointmentDate,
        !!patientName ? patientName : '_',
        true,
        undefined
      );
    } catch (error) {
      setLoadingContext?.(false);
      CommonBugFender('Tests_onPressOrderStatusOption_downloadLabTest', error);
    } finally {
      setLoadingContext?.(false);
    }
  }

  function navigateToTrackingScreen(item: any) {
    DiagnosticTrackOrderViewed(currentPatient, item?.orderStatus, item?.id, 'Home');
    props.navigation.navigate(AppRoutes.YourOrdersTest, {
      isTest: true,
    });
  }

  async function getPhelboDetails(orderId: string, order: any) {
    setLoadingContext?.(true);
    try {
      let response: any = await getDiagnosticPhelboDetails(client, [orderId]);
      if (response?.data?.data) {
        const getUrl =
          response?.data?.data?.getOrderPhleboDetailsBulk?.orderPhleboDetailsBulk?.[0]
            ?.orderPhleboDetails?.phleboTrackLink;

        if (!!getUrl && getUrl != '') {
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
      setLoadingContext?.(false);
    } catch (error) {
      DiagnosticTrackPhleboClicked(orderId, 'Home', currentPatient, 'No');
      setLoadingContext?.(false);
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
          // onPress={() => props.navigation.navigate(AppRoutes.TestsCart)}
          onPress={() => props.navigation.navigate(AppRoutes.AddPatients)}
        >
          <Text style={styles.goToCartText}>GO TO CART</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderNonServiceablePopUp = (city: string) => {
    showAphAlert?.({
      unDismissable: true,
      title: string.medicine_cart.tatUnServiceableAlertTitle,
      description: string.diagnostics.nonServiceableMsg.replace('{{city_name}}', city),
    });
  };

  const renderDiagnosticHeader = () => {
    const renderIcon = () => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigateToHome(props.navigation);
        }}
      >
        <HomeIcon style={styles.homeIconStyle} />
      </TouchableOpacity>
    );

    const renderCartIcon = () => (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.cartIconTouch}
          activeOpacity={1}
          onPress={() => props.navigation.navigate(AppRoutes.AddPatients)}
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
          <NotificationIcon style={styles.notificationIconStyle} />
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
    const showViewAll = data?.diagnosticWidgetData && data?.diagnosticWidgetData?.length > 2;
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
          rightText={showViewAll ? 'VIEW ALL' : ''}
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
    const imageIcon = !!item?.itemIcon
      ? item?.itemIcon
      : AppConfig.Configuration.DIAGNOSTIC_DEFAULT_ICON;
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
          {imageIcon != '' ? (
            <ImageNative resizeMode="contain" style={styles.image} source={{ uri: imageIcon }} />
          ) : (
            <WidgetLiverIcon style={styles.image} resizeMode={'contain'} />
          )}
        </View>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.textStyle}>
          {nameFormater(item?.itemTitle,'default')}
        </Text>
      </TouchableOpacity>
    );
  };

  const gridWidgetSection = (data: any) => {
    const numColumns = 4;
    let newGridData: any[] = [];
    if (
      data?.diagnosticWidgetData?.length >= numColumns &&
      data?.diagnosticWidgetData?.length % numColumns != 0
    ) {
      let sortedItemsIndex =
        data?.diagnosticWidgetData?.length - (data?.diagnosticWidgetData?.length % numColumns);
      if (sortedItemsIndex > numColumns * 2) {
        newGridData = data?.diagnosticWidgetData.slice(0, numColumns * 2);
      } else {
        newGridData = data?.diagnosticWidgetData.slice(0, sortedItemsIndex);
      }
    } else {
      newGridData = data?.diagnosticWidgetData;
    }
    const showViewAll = newGridData && newGridData?.length > 2;
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
          rightText={showViewAll ? 'VIEW ALL' : ''}
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
          <View style={{ backgroundColor: colors.WHITE }}>
            {renderDiagnosticHeader()}
            {renderSearchBar()}
            {renderTestDiagonosticsShimmer()}
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: colors.WHITE }}>
              {renderDiagnosticHeader()}
              {renderSearchBar()}
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
              </ScrollView>
              {!!cartItems && cartItems?.length > 0 ? renderCartDetails() : null}
            </View>
          </>
        )}
        {showLocationPopup && renderLocationSearch()}
        {showUnserviceablePopup && renderNonServiceableToolTip()}
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
  deliverToText: { ...theme.viewStyles.text('R', 11, '#01475b', 1, 16) },
  locationText: { ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) },
  locationTextUnderline: {
    height: 2,
    backgroundColor: '#00b38e',
    opacity: 1,
  },
  dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },
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
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: 30,
    height: 30,
    backgroundColor: '#f9f9f9',
  },
  gridPart: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
    borderColor: '#E8E8E8',
    borderWidth: 0.5,
    padding: 15,
  },
  textStyle: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1, 20, 0),
    paddingVertical: 5,
    textAlign:'center',
    width:'100%'
  },
  widgetSpacing: {
    marginVertical: 20,
  },
  whyBookUsOuterView: { marginBottom: 15, marginTop: '2%' },
  stepsToBookTitleStyle: {
    color: colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 18,
  },
  homeIconStyle: { height: 33, width: 33, resizeMode: 'contain' },
  notificationIconStyle: { marginLeft: 10, marginRight: 5 },
  nonServiceableToolTip: {
    backgroundColor: '#CE3737',
    flex: 1,
    position: 'absolute',
    top: Platform.OS == 'ios' ? winHeight / 7 : winHeight / (winHeight > 700 ? 10 : 8),
    left: winWidth / 4.5, //3.8
    width: winWidth / 1.7,
  },
  toolTipIcon: {
    height: 20,
    width: 20,
    marginTop: -10,
    resizeMode: 'contain',
    marginBottom: -10,
    marginLeft: winWidth / 5,
    tintColor: '#CE3737',
  },
  unserviceableHeading: { ...theme.viewStyles.text('B', 12, colors.WHITE, 1, 20) },
  unserviceableMsg: { ...theme.viewStyles.text('M', 11, colors.WHITE, 1, 16), marginTop: 8 },
  unserviceableButton: {
    height: 30,
    alignSelf: 'flex-end',
    backgroundColor: '#EF6D6D',
    borderRadius: 0,
    width: winWidth / 3.5,
  },
  unserviceableCTAStyle: {
    ...theme.viewStyles.text('SB', isIphone5s() ? 9 : 10, theme.colors.BUTTON_TEXT),
    textAlign: 'center',
  },
  cartIconTouch: {
    alignSelf: 'flex-end',
    width: 35,
    alignItems: 'flex-end',
  },
});
