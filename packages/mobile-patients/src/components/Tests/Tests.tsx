import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
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
  ShieldIcon,
  Remove,
  DropdownGreen,
  WidgetLiverIcon,
  PolygonIcon,
  ExpressSlotClock,
  PrescriptionColored,
  GreenCheck,
  PrescriptionIcon,
  GalleryIcon,
  CameraIcon,
  CrossPopup,
  CircleLogo,
  ArrowUpGreen,
  ArrowRight,
  BagBlue,
  VirusGreen,
  HomeBlue,
  ClockBlue,
} from '@aph/mobile-patients/src/components/ui/Icons';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
  SET_DEFAULT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';
import {
  getLandingPageBanners,
  getDiagnosticHomePageWidgets,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  nameFormater,
  isSmallDevice,
  navigateToHome,
  addTestsToCart,
  handleGraphQlError,
  downloadDiagnosticReport,
  isAddressLatLngInValid,
  doRequestAndAccessLocationModified,
  storagePermissions,
  getUserType,
  getCleverTapCircleMemberValues,
  getAge,
  postCleverTapEvent,
  showDiagnosticCTA,
  calculateDiagnosticCartItems,
  isEmptyObject,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { Image } from 'react-native-elements';
import { NavigationScreenProps, NavigationEvents } from 'react-navigation';
import {
  CALL_TO_ORDER_CTA_PAGE_ID,
  DiagnosticCTJourneyType,
  DIAGNOSTIC_ORDER_STATUS,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  useShoppingCart,
  PhysicalPrescription,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
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
  fetchPatientAddressList,
  getDiagnosticClosedOrders,
  getDiagnosticExpressSlots,
  getDiagnosticOpenOrders,
  getDiagnosticPatientPrescription,
  getDiagnosticPhelboDetails,
  getDiagnosticsByItemIdCityId,
  getDiagnosticsOrder,
  getDiagnosticsPastOrderRecommendations,
  getUserBannersList,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  DIAGNOSTIC_PINCODE_SOURCE_TYPE,
  getPricesForItem,
  sourceHeaders,
} from '@aph/mobile-patients/src/utils/commonUtils';
import Carousel from 'react-native-snap-carousel';
import CertifiedCard from '@aph/mobile-patients/src/components/Tests/components/CertifiedCard';
import {
  DiagnosticAddresssSelected,
  DiagnosticAddToCartEvent,
  DiagnosticBannerClick,
  DiagnosticHomePageClicked,
  DiagnosticHomePageWidgetClicked,
  DiagnosticLandingPageViewedEvent,
  DiagnosticPrescriptionSubmitted,
  DiagnosticTrackOrderViewed,
  DiagnosticTrackPhleboClicked,
  DiagnosticViewReportClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import ItemCard from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import PackageCard from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  AppConfig,
  DIAGNOSTIC_PHELBO_TRACKING_STATUS,
  DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
  DIANOSTIC_BANNER_VISIBLE_ARRAY,
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
  renderDiagnosticCardShimmer,
  renderDiagnosticWidgetHeadingShimmer,
  renderDiagnosticWidgetShimmer,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import moment from 'moment';

import AsyncStorage from '@react-native-community/async-storage';
import { OrderCardCarousel } from '@aph/mobile-patients/src/components/Tests/components/OrderCardCarousel';
import { PrescriptionCardCarousel } from '@aph/mobile-patients/src/components/Tests/components/PrescriptionCardCarousel';
import { getUniqueId } from 'react-native-device-info';
import {
  DiagnosticHomePageSource,
  DIAGNOSTICS_ITEM_TYPE,
  CleverTapEvents,
  CleverTapEventName,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'rn-fetch-blob';
const MAX_FILE_SIZE = 25000000; // ~25MB
import { DiagnosticLocation } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticLocation';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Cache } from 'react-native-cache';
import { CallToOrderView } from '@aph/mobile-patients/src/components/Tests/components/CallToOrderView';
import { TestPdfRender } from '@aph/mobile-patients/src/components/Tests/components/TestPdfRender';
import { CartPageSummary } from '@aph/mobile-patients/src/components/Tests/components/CartSummaryView';

const rankArr = ['1', '2', '3', '4', '5', '6'];
const { width: winWidth, height: winHeight } = Dimensions.get('window');
const AUTO_SCROLL_INTERVAL = 3000;
const divisionFactor = winHeight > 750 ? 2.2 : winHeight > 650 ? 1.7 : 1.5;
const GO_TO_CART_HEIGHT = 70;
const NON_CIRCLE_NUDGE_HEIGHT = 35;
export interface DiagnosticData {
  cityId: string;
  stateId: string;
  city: string;
  state: string;
}
interface DiagnosticWidgetInclusionObservationData {
  mandatoryValue: string;
  observationName: string;
}
interface DiagnosticWidgetInclusion {
  incItemId: string;
  incTitle: string;
  incObservationData: DiagnosticWidgetInclusionObservationData[];
}
export interface DiagnosticWidgetItem {
  itemTitle: string;
  itemImageUrl: string;
  itemId: string;
  itemCanonicalTag: string;
  inclusionData: DiagnosticWidgetInclusion[];
  itemIcon: string;
  diagnosticPricing: any;
  packageCalculatedMrp: any;
}

export interface DiagnosticWidget {
  diagnosticWidgetData: DiagnosticWidgetItem[];
  diagnosticWidgetTitle: string;
  diagnosticWidgetType: string;
  diagnosticwidgetsRankOrder: string;
  id: string;
  diagnosticWidgetBannerImage: string;
  diagnosticWidgetBannerUrl: string;
  diagnosticWidgetBannerText: string;
}

export interface TestsProps
  extends NavigationScreenProps<{
    comingFrom?: string;
    movedFrom?: string;
    setEPrescriptions: ((items: EPrescription[]) => void) | null;
    homeScreenAttributes?: any;
    phyPrescriptionUploaded: PhysicalPrescription[];
    ePresscriptionUploaded: EPrescription[];
  }> {}

export const Tests: React.FC<TestsProps> = (props) => {
  const {
    setAddresses: setMedAddresses,
    pharmacyCircleAttributes,
    circleSubscriptionId,
  } = useShoppingCart();
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
    modifiedOrder,
  } = useDiagnosticsCart();
  const {
    serverCartItems: shopCartItems,
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
    setIsRenew,
  } = useAppCommonData();

  type Address = savePatientAddress_savePatientAddress_patientAddress;
  const { buildApolloClient, authToken } = useAuth();
  const client = useApolloClient();
  const movedFrom = props.navigation.getParam('movedFrom');
  const homeScreenAttributes = props.navigation.getParam('homeScreenAttributes');
  const phyPrescriptionUploaded = props.navigation.getParam('phyPrescriptionUploaded') || [];
  const ePresscriptionUploaded = props.navigation.getParam('ePresscriptionUploaded') || [];
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const apolloClientWithAuth = buildApolloClient(authToken);

  const hdfc_values = string.Hdfc_values;
  const [loading, setLoading] = useState<boolean>(false);

  const [bannerLoading, setBannerLoading] = useState(true);
  const [imgHeight, setImgHeight] = useState(120);
  const [slideIndex, setSlideIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [cityId, setCityId] = useState('');
  const [currentOffset, setCurrentOffset] = useState<number>(1);
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const [sectionLoading, setSectionLoading] = useState<boolean>(false);
  const [showViewReportModal, setShowViewReportModal] = useState<boolean>(false);
  const [showItemCard, setShowItemCard] = useState<boolean>(false);
  const [bookUsSlideIndex, setBookUsSlideIndex] = useState(0);
  const [showbookingStepsModal, setShowBookingStepsModal] = useState(false);
  const [isPrescriptionUpload, setIsPrescriptionUpload] = useState<boolean>(false);
  const [isPrescriptionGallery, setIsPrescriptionGallery] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [diagnosticStateUserType, setDiagnosticStateUserType] = useState<string>('');
  const [widgetsData, setWidgetsData] = useState([] as any);
  const [drupalWidgetData, setDrupalWidgetData] = useState([] as any);
  const [reloadWidget, setReloadWidget] = useState<boolean>(false);
  const [latestPrescription, setLatestPrescription] = useState([] as any);
  const [patientOpenOrders, setPatientOpenOrders] = useState([] as any);
  const [patientClosedOrders, setPatientClosedOrders] = useState([] as any);
  const [serviceabilityMsg, setServiceabilityMsg] = useState('');
  const [showCartSummary, setShowCartSummary] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();
  const defaultAddress = addresses?.find((item) => item?.defaultAddress);
  const [summaryRecommendationCount, setSummaryRecommendationCount] = useState<number>(0);
  const [showLocationPopup, setLocationPopup] = useState<boolean>(false);
  const [source, setSource] = useState<DIAGNOSTIC_PINCODE_SOURCE_TYPE>();
  const [showUnserviceablePopup, setUnserviceablePopup] = useState<boolean>(false);
  const [serviceableObject, setServiceableObject] = useState({} as any);
  const [showNoLocationPopUp, setShowNoLocationPopUp] = useState<boolean>(false);
  const [clickedItem, setClickedItem] = useState<any>([]);
  const [expressSlotMsg, setExpressSlotMsg] = useState<string>('');
  const [isPriceAvailable, setIsPriceAvailable] = useState<boolean>(false);
  const [priceAvailable, setPriceAvailable] = useState<boolean>(false);
  const [fetchAddressLoading, setFetchAddressLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [diagnosticResults, setDiagnosticResults] = useState<
    searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  >([]);
  const [latestPrescriptionShimmer, setLatestPrescriptionShimmer] = useState<boolean>(false);
  const [patientOrdersShimmer, setPatientOrdersShimmer] = useState<boolean>(false);
  const [pastOrderRecommendationShimmer, setPastOrderRecommendationShimmer] = useState<boolean>(
    false
  );
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);
  const scrollCount = useRef<number>(0);
  const [pastOrderRecommendations, setPastOrderRecommendations] = useState([] as any);
  const [showPastRecommendations, setShowPastRecommendations] = useState<boolean>(false);
  const getCTADetails = showDiagnosticCTA(CALL_TO_ORDER_CTA_PAGE_ID.HOME, cityId);
  const hasLocation = locationDetails || diagnosticLocation || pharmacyLocation || defaultAddress;
  const showNudgeMessage = AppConfig.Configuration.DIAGNOSTICS_NUDGE_MESSAGE_CONDITION?.find(
    (item) => (isDiagnosticCircleSubscription ? item?.Circle : item?.NonCircle)
  );
  const uploadViaWhatsapp =
    AppConfig.Configuration.DIAGNOSTICS_ENABLE_UPLOAD_PRESCRIPTION_VIA_WHATSAPP;
  const getUploadPrescriptionConfigs = AppConfig.Configuration.DIAGNOSTICS_UPLOAD_PRESCRIPTION?.find(
    (item) => item?.isWhatsappEnabled == uploadViaWhatsapp
  );
  const isCartAvailable = !!cartItems && cartItems?.length > 0;
  const cartItemsCount =
    calculateDiagnosticCartItems(cartItems, patientCartItems)?.length + shopCartItems?.length;

  const cache = new Cache({
    namespace: 'tests',
    policy: {
      maxEntries: 100,
    },
    backend: AsyncStorage,
  });

  useEffect(() => {
    fetchNumberSpecificOrderDetails();
    if (movedFrom === 'deeplink') {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBack);
      };
    }
  }, []);

  /**fetch widgets */
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
            !!pharmacyLocation ? pharmacyLocation : !!locationDetails ? locationDetails : null
          ),
          DIAGNOSTIC_PINCODE_SOURCE_TYPE.AUTO
        );
      }
    }
  }, []);

  //serviceability api
  useEffect(() => {
    if (!!diagnosticLocation) {
      fetchAddressServiceability(diagnosticLocation);
    }
  }, [diagnosticLocation]);

  //loading address, recent order, circle banners for the user.
  useEffect(() => {
    if (currentPatient) {
      fetchAddress();
    }
  }, [currentPatient]);

  useEffect(() => {
    triggerLandingPageViewedEvent();
  }, [showPastRecommendations]);

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

  useEffect(() => {
    if (!(bannerData && bannerData?.length)) {
      setBannerDataToCache();
    }
  }, [bannerData]);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setBannerData && setBannerData([]); // default banners to be empty
      getUserBanners();
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {});
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  useEffect(() => {
    if (movedFrom == AppRoutes.SubmittedPrescription) {
      // user comes back to add more prescription
      setIsPrescriptionGallery(false);
      setIsPrescriptionUpload(true);
    } else if (movedFrom == AppRoutes.PrescriptionCamera) {
      // when user comes back  deletes the camera captured image
      setIsPrescriptionGallery(false);
      setIsPrescriptionUpload(true);
    }
  }, [props.navigation]);

  useEffect(() => {
    if (!loading && banners?.length > 0) {
      banners?.map((item: any) => {
        ImageNative.getSize(
          item?.bannerImage,
          (width, height) => {
            // setImgHeight(Math.max(height * (winWidth / width) + 20, 180));
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
    if (drupalWidgetData?.length > 0) {
      fetchPastOrderRecommendations();
    }
  }, [drupalWidgetData]);

  function fetchNumberSpecificOrderDetails() {
    if (currentPatient) {
      fetchUserType();
      fetchPatientOpenOrders();
      fetchPatientClosedOrders();
      fetchPatientPrescriptions();
      getUserBanners();
      getDataFromCache();
    }
  }

  const getDataFromCache = async () => {
    const banner_data = await cache.get('banner_data');
    setBannerData?.(banner_data!);
  };

  const setBannerDataToCache = async () => {
    const banner_data = bannerData && bannerData?.length ? bannerData : [];
    await cache.set('banner_data', banner_data);
  };

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

  const handleBack = () => {
    navigateToHome(props.navigation, {}, movedFrom === 'deeplink');
    return true;
  };

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

  function triggerLandingPageViewedEvent() {
    DiagnosticLandingPageViewedEvent(
      currentPatient,
      isDiagnosticCircleSubscription,
      movedFrom === string.diagnostics.deeplink
        ? DiagnosticHomePageSource.DEEPLINK
        : homeScreenAttributes?.Source,
      !!pastOrderRecommendations && pastOrderRecommendations?.length >= 6 ? 'Yes' : 'No'
    );
  }

  const fetchPatientOpenOrders = async () => {
    setPatientOrdersShimmer(true);
    try {
      let openOrdersResponse: any = await getDiagnosticOpenOrders(
        apolloClientWithAuth,
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
    } finally {
      setPatientOrdersShimmer(false);
    }
  };

  const fetchPatientClosedOrders = async () => {
    setPatientOrdersShimmer(true);
    try {
      let closedOrdersResponse: any = await getDiagnosticClosedOrders(
        apolloClientWithAuth,
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
    } finally {
      setPatientOrdersShimmer(false);
    }
  };

  const fetchUserType = async () => {
    try {
      const diagnosticUserType = await AsyncStorage.getItem('diagnosticUserType');
      setDiagnosticStateUserType(diagnosticUserType || '');
      if (diagnosticUserType == null) {
        fetchOrders();
      }
    } catch (error) {
      fetchOrders();
    }
  };

  const fetchOrders = async () => {
    //for checking whether user is new or repeat.
    try {
      setLoading?.(true);
      const getOrdersResponse = await getDiagnosticsOrder(
        apolloClientWithAuth,
        currentPatient.mobileNumber,
        1,
        currentOffset
      );
      if (!!getOrdersResponse) {
        const ordersList =
          getOrdersResponse?.data?.getDiagnosticOrdersListByMobile?.ordersList || [];
        const diagnosticUserType =
          ordersList?.length > 0 ? string.user_type.REPEAT : string.user_type.NEW;
        setDiagnosticStateUserType(diagnosticUserType || '');
        AsyncStorage.setItem('diagnosticUserType', JSON.stringify(diagnosticUserType));
      }
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      CommonBugFender(`${AppRoutes.Tests}_fetchOrders`, error);
    }
  };

  const fetchPatientPrescriptions = async () => {
    setLatestPrescriptionShimmer(true);
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
    } finally {
      setLatestPrescriptionShimmer(false);
    }
  };

  const fetchPastOrderRecommendations = async () => {
    setPastOrderRecommendationShimmer(true); //make this false after drupal results are fetched.
    try {
      const getPastOrderRecommendation = await getDiagnosticsPastOrderRecommendations(
        client,
        currentPatient?.mobileNumber
      );

      const pastOrders =
        getPastOrderRecommendation?.data?.getDiagnosticItemRecommendationsByPastOrders?.itemsData;
      if (!!pastOrders) {
        const findRank =
          !!drupalWidgetData &&
          drupalWidgetData?.length > 0 &&
          drupalWidgetData?.filter((item: any) => item?.diagnosticwidgetsRankOrder === '0');
        const getRecommendationsFromDrupal = findRank?.[0]?.diagnosticWidgetData;
        const appenedRecommendations = [
          ...new Set(pastOrders?.concat(getRecommendationsFromDrupal)),
        ];
        getWidgetPricesWithInclusions(
          appenedRecommendations,
          cityId,
          string.diagnostics.homepagePastOrderRecommendations
        );
      } else {
        setDrupalRecommendationsAsPastRecommendations();
      }
    } catch (error) {
      setDrupalRecommendationsAsPastRecommendations();
      CommonBugFender('fetchPastOrderRecommendations_Tests', error);
    }
  };

  function setDrupalRecommendationsAsPastRecommendations() {
    const getRecommendationsFromDrupal = getRanking('0')?.[0]?.diagnosticWidgetData;
    //here inclusions will be there from drupal
    fetchWidgetsPrices(
      getRecommendationsFromDrupal,
      cityId,
      string.diagnostics.homepagePastOrderRecommendations
    );
  }

  const getDiagnosticBanner = async (cityId: number) => {
    try {
      const res: any = await getLandingPageBanners('diagnostic', Number(cityId));
      //if true then only show it.
      if (res?.data?.success) {
        const bannerData = res?.data?.data;
        //filter banners to be shown on app/both
        const getBannerToShow = bannerData?.filter((banner: any) =>
          DIANOSTIC_BANNER_VISIBLE_ARRAY.includes(banner?.VisibleOn)
        );
        setBanners(getBannerToShow);
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
    try {
      const result: any = await getDiagnosticHomePageWidgets('diagnostic', Number(cityId));
      if (result?.data?.success && result?.data?.data?.length > 0) {
        const sortWidgets = result?.data?.data?.sort(
          (a: any, b: any) =>
            Number(a.diagnosticwidgetsRankOrder) - Number(b.diagnosticwidgetsRankOrder)
        );
        //filter wigets to be shown on homepage
        const getWidgetsForHomePage = sortWidgets?.filter(
          (widget: any) => widget?.shownOnHomePage || widget?.shownOnHomePage == 'true'
        );
        setCityId(cityId);
        //call here the prices.
        setDrupalWidgetData(getWidgetsForHomePage);
        setWidgetsData(getWidgetsForHomePage);
        setIsPriceAvailable(false);
        setShowItemCard(true);
        fetchWidgetsPrices(getWidgetsForHomePage, cityId);
      } else {
        setDrupalWidgetData([]);
        setWidgetsData([]);
        setLoading?.(false);
        setBannerLoading(false);
        setReloadWidget(true);
      }
    } catch (error) {
      CommonBugFender('getHomePageWidgets_Tests', error);
      setDrupalWidgetData([]);
      setWidgetsData([]);
      setLoading?.(false);
      setReloadWidget(true);
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

  async function getExpressSlots(
    serviceabilityObject: DiagnosticData,
    selectedAddress: LocationData
  ) {
    const getLat = selectedAddress?.latitude!;
    const getLng = selectedAddress?.longitude!;
    const getZipcode = selectedAddress?.pincode;
    const getServiceablityObject = {
      cityID: Number(serviceabilityObject?.cityId),
      stateID: Number(serviceabilityObject?.stateId),
    };
    //response when unserviceable
    if (Number(serviceabilityObject?.stateId) == 0 && serviceabilityObject?.city == '') {
      setExpressSlotMsg('');
      return;
    }
    try {
      const res: any = await getDiagnosticExpressSlots(
        client,
        getLat,
        getLng,
        String(getZipcode),
        getServiceablityObject
      );
      if (res?.data?.getUpcomingSlotInfo) {
        const getResponse = res?.data?.getUpcomingSlotInfo;
        if (getResponse?.status) {
          setExpressSlotMsg(getResponse?.slotInfo);
        } else {
          setExpressSlotMsg('');
        }
      } else {
        setExpressSlotMsg('');
      }
    } catch (error) {
      CommonBugFender('getExpressSlots_Tests', error);
      setExpressSlotMsg('');
    }
  }

  function getFilteredWidgets(widgetsData: any, source?: string) {
    var filterWidgets, itemIds;
    if (source == string.diagnostics.homepagePastOrderRecommendations) {
      filterWidgets = widgetsData;
      itemIds = filterWidgets?.map((item: any) => Number(item?.itemId));
    } else {
      filterWidgets = widgetsData?.filter(
        (item: any) => !!item?.diagnosticWidgetData && item?.diagnosticWidgetData?.length > 0
      );
      itemIds = filterWidgets?.map((item: any) =>
        item?.diagnosticWidgetData?.map((data: any, index: number) => Number(data?.itemId))
      );
    }
    const allItemIds = itemIds?.flat();
    return {
      filterWidgets,
      allItemIds,
    };
  }

  const fetchWidgetsPrices = async (widgetsData: any, cityId: string, source?: string) => {
    const { filterWidgets, allItemIds } = getFilteredWidgets(widgetsData, source);
    try {
      const res = await fetchPricesForCityId(
        Number(cityId!) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
        allItemIds
      );
      let newWidgetsData = [...filterWidgets];

      const priceResult = res?.data?.findDiagnosticsWidgetsPricing;
      if (!!priceResult && !!priceResult?.diagnostics && priceResult?.diagnostics?.length > 0) {
        const widgetPricingArr = priceResult?.diagnostics;
        if (source === string.diagnostics.homepagePastOrderRecommendations) {
          setPastOrderRecommendationPrices(filterWidgets, widgetPricingArr);
        } else {
          setWidgetPrices(filterWidgets, widgetPricingArr, newWidgetsData);
        }
      }
      setLoading?.(false);
    } catch (error) {
      CommonBugFender('errorInFetchPricing api__Tests', error);
      setSectionLoading(false);
      setLoading?.(false);
      setReloadWidget(true);
      setBannerLoading(false);
      setPastOrderRecommendationShimmer(false);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.common.tryAgainLater,
      });
    }
  };

  async function getWidgetPricesWithInclusions(widgetsData: any, cityId: string, source?: string) {
    const { filterWidgets, allItemIds } = getFilteredWidgets(widgetsData, source);
    try {
      const res = await getDiagnosticsByItemIdCityId(
        client,
        Number(cityId!) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
        allItemIds
      );
      let newWidgetsData = [...filterWidgets];
      const priceResult = res?.data?.findDiagnosticsByItemIDsAndCityID;
      if (!!priceResult && !!priceResult?.diagnostics && priceResult?.diagnostics?.length > 0) {
        const widgetPricingArr = priceResult?.diagnostics;
        if (source === string.diagnostics.homepagePastOrderRecommendations) {
          setPastOrderRecommendationPrices(filterWidgets, widgetPricingArr);
        } else {
          setWidgetPrices(filterWidgets, widgetPricingArr, newWidgetsData);
        }
      }
      setLoading?.(false);
    } catch (error) {
      CommonBugFender('getWidgetPricesWithInclusions api__Tests', error);
      setSectionLoading(false);
      setLoading?.(false);
      setReloadWidget(true);
      setBannerLoading(false);
      setPastOrderRecommendationShimmer(false);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.common.tryAgainLater,
      });
    }
  }

  function setWidgetPrices(filterWidgets: any, widgetPricingArr: any, newWidgetsData: any) {
    for (let i = 0; i < filterWidgets?.length; i++) {
      for (let j = 0; j < filterWidgets?.[i]?.diagnosticWidgetData?.length; j++) {
        let wItem = filterWidgets?.[i]?.diagnosticWidgetData?.[j]; // j ka element
        const findIndex = widgetPricingArr?.findIndex(
          (pricingData: any) => Number(pricingData?.itemId) === Number(wItem?.itemId)
        );
        if (findIndex !== -1) {
          (newWidgetsData[i].diagnosticWidgetData[j].packageCalculatedMrp =
            widgetPricingArr?.[findIndex]?.packageCalculatedMrp),
            (newWidgetsData[i].diagnosticWidgetData[j].diagnosticPricing =
              widgetPricingArr?.[findIndex]?.diagnosticPricing);
        }
      }
    }
    newWidgetsData?.length > 0 && reloadWidget ? setReloadWidget(false) : setReloadWidget(true);
    setWidgetsData(newWidgetsData);
    setIsPriceAvailable(true);
    setPastOrderRecommendationShimmer(false);
    setSectionLoading(false);
  }

  function triggerAddressSelected(servicable: 'Yes' | 'No') {
    const addressToUse = isModifyFlow ? modifiedOrder?.patientAddressObj : selectedAddr;
    const pinCodeFromAddress = addressToUse?.zipcode!;
    DiagnosticAddresssSelected(
      newAddressAddedHomePage != '' ? 'New' : 'Existing',
      servicable,
      pinCodeFromAddress,
      'Home page',
      currentPatient,
      isDiagnosticCircleSubscription,
      addressToUse?.latitude,
      addressToUse?.longitude,
      addressToUse?.state,
      addressToUse?.city
    );
    newAddressAddedHomePage != '' && setNewAddressAddedHomePage?.('');
  }

  function setPastOrderRecommendationPrices(widgets: any, widgetPricingArr: any) {
    let _recommendedBookings: any = [];
    widgets?.forEach((_widget: any) => {
      widgetPricingArr?.forEach((_diagItems: any) => {
        if (_widget?.itemId == _diagItems?.itemId) {
          _recommendedBookings?.push({
            ..._widget,
            itemTitle: !!_widget?.itemName ? _widget?.itemName : _widget?.itemTitle,
            diagnosticPricing: _diagItems?.diagnosticPricing,
            packageCalculatedMrp: _diagItems?.packageCalculatedMrp,
            inclusions: _diagItems?.inclusions,
            inclusionData: _diagItems?.inclusions,
          });
        }
      });
    });
    const showPastRecommendations =
      _recommendedBookings > 10 ? _recommendedBookings.slice(0, 10) : _recommendedBookings;
    showPastRecommendations?.length >= 6
      ? setPastOrderRecommendations(showPastRecommendations)
      : setPastOrderRecommendations([]);
    setShowPastRecommendations(showPastRecommendations?.length >= 6);
    setPriceAvailable(true);
    setPastOrderRecommendationShimmer(false);
  }

  const renderCarouselBanners = () => {
    const showBanner = bannerData && bannerData.length > 0;
    if (showBanner) {
      return (
        <CarouselBanners
          successCallback={() => {}}
          navigation={props.navigation}
          planActivationCallback={() => {
            getUserBanners();
            getUserSubscriptionsByStatus();
          }}
          from={string.banner_context.DIAGNOSTIC_HOME}
          source={'Diagnostic'}
          circleActivated={false}
          circleEventSource={'Diagnostic Home page Banner'}
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
      setFetchAddressLoading?.(true);
      const response = await fetchPatientAddressList(client, currentPatient?.id);
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
      setFetchAddressLoading?.(false);
    } catch (error) {
      // -> load default hyderabad.
      setSectionLoading(false);
      CommonBugFender('fetching_Addresses_on_Test_Page', error);
    }
  }

  async function fetchAddressServiceability(selectedAddress: LocationData) {
    let obj = {} as DiagnosticData;
    const pincode = String(selectedAddress?.pincode);
    if (!!selectedAddress && !!selectedAddress?.latitude && !!selectedAddress?.longitude) {
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
            setShowNoLocationPopUp(false);
            triggerAddressSelected('Yes');
          } else {
            //null in case of non-serviceable
            obj = getNonServiceableObject();
            setNonServiceableValues(obj, pincode);
            triggerAddressSelected('No');
          }
        } else {
          obj = getNonServiceableObject();
          setNonServiceableValues(obj, pincode);
          triggerAddressSelected('No');
        }
        getExpressSlots(obj, selectedAddress);
        getDiagnosticBanner(Number(obj?.cityId));
        getHomePageWidgets(obj?.cityId);
      } catch (error) {
        setShowNoLocationPopUp(false);
        setSectionLoading(false);
        CommonBugFender('fetchAddressServiceability_Tests', error);
        setLoadingContext?.(false);
        setReloadWidget(true);
        setSectionLoading(false);
        setBannerLoading(false);
      }
    } else {
      getDiagnosticBanner(AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID);
      getHomePageWidgets(String(AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID));
      setShowNoLocationPopUp(true);
    }
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
    setSectionLoading(false);
    setServiceableObject(obj);
    setDiagnosticServiceabilityData?.(obj);
    setDiagnosticLocationServiceable?.(false);
    setShowNoLocationPopUp(false);
    setUnserviceablePopup(true);
    setServiceabilityMsg(string.diagnostics.nonServiceableMsg1);
  }

  const renderYourOrders = () => {
    return (
      <ListCard
        onPress={() => {
          postMyOrdersClicked('Diagnostics', currentPatient);
          props.navigation.push(AppRoutes.YourOrdersTest, {
            isTest: true,
            cityId: cityId,
          });
        }}
        container={styles.yourOrderContainer}
        titleStyle={styles.ordersTitleStyle}
        title={'MY ORDERS'}
        leftIcon={null}
      />
    );
  };

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: currentPatient?.mobileNumber,
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      if (data) {
        const circleData = data?.APOLLO?.[0];
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
      CommonBugFender('Diagnositic_Landing_Page_Tests_GetSubscriptionsOfUserByStatus', error);
    }
  };

  const renderSearchBar = () => {
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

  const renderSeperator = () => {
    return <View style={styles.seperatorContainer}></View>;
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

  function _onPressLocateMe() {
    setShowNoLocationPopUp(false);
    autoDetectLocation();
  }

  const autoDetectLocation = () => {
    setSectionLoading?.(true);
    doRequestAndAccessLocationModified(false, true, false)
      .then((response) => {
        if (response) {
          response && setDiagnosticLocation?.(response);
          response && !locationDetails && setLocationDetails?.(response);
        } else {
          _enablePermissionFromSettings();
        }
      })
      .catch((e) => {
        if (Platform.OS == string.common.android) {
          e === string.diagnosticsLocation.denied
            ? autoDetectLocation() //ask again
            : e === string.diagnosticsLocation.restricted
            ? _enablePermissionFromSettings()
            : null; // unable to fetch the location
        } else {
          e === string.diagnosticsLocation.denied ? _enablePermissionFromSettings() : null; // unable to fetch the location
        }

        //if goes in error then show the prompt that we are unable to fetch your location. -> thrid view
        CommonBugFender('AutoDetectLocation_Tests', e);
      })
      .finally(() => {
        setSectionLoading?.(false);
      });
  };

  function _enablePermissionFromSettings() {
    Alert.alert('Location', 'Enable location access from settings', [
      {
        text: 'Cancel',
        onPress: () => {
          AsyncStorage.setItem('settingsCalled', 'false');
        },
      },
      {
        text: 'Ok',
        onPress: () => {
          AsyncStorage.setItem('settingsCalled', 'true');
          Linking.openSettings();
        },
      },
    ]);
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
            ComingFrom: AppRoutes.CartPage,
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
    const hasDiagnosticLocationUndefinedValues =
      !!diagnosticLocation?.state || !!diagnosticLocation?.city || !!diagnosticLocation?.pincode;

    return (
      <View style={{ paddingLeft: 15, marginTop: 3.5 }}>
        {hasLocation ? (
          <TouchableOpacity
            style={{
              marginTop: -7.5,
            }}
            onPress={() => {
              setLocationPopup(true);
              setUnserviceablePopup(false);
            }}
          >
            {hasDiagnosticLocationUndefinedValues ? (
              <>
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
              </>
            ) : (
              renderLocateMe()
            )}
          </TouchableOpacity>
        ) : (
          <LocationOff />
        )}
        {!!serviceabilityMsg && <Text style={styles.serviceabilityMsg}>{serviceabilityMsg}</Text>}
      </View>
    );
  };

  const renderLocateMe = () => {
    return (
      <>
        <Text numberOfLines={1} style={styles.deliverToText}>
          {string.diagnostics.collectionFromText}
        </Text>
        <View style={styles.rowCenter}>
          <TouchableOpacity
            onPress={() => _onPressLocateMe()}
            style={styles.locateMeTouch}
            activeOpacity={1}
          >
            <Text style={styles.locateMeText}>{nameFormater('Locate Me', 'upper')}</Text>
          </TouchableOpacity>
          <View style={styles.dropdownGreenContainer}>
            <DropdownGreen />
          </View>
        </View>
      </>
    );
  };

  const renderViewReportModal = () => {
    return (
      <View>
        <TestPdfRender
          uri={clickedItem?.labReportURL}
          order={clickedItem}
          isReport={true}
          onPressClose={() => {
            setShowViewReportModal(false);
          }}
        />
      </View>
    );
  };

  const renderNonServiceableToolTip = (isNoLocation: boolean) => {
    return (
      <TouchableOpacity
        onPress={() =>
          isNoLocation ? setShowNoLocationPopUp(false) : setUnserviceablePopup(false)
        }
        style={styles.toolTipTouch}
      >
        <View
          style={[
            styles.nonServiceableToolTip,
            isNoLocation && {
              backgroundColor: theme.colors.TURQUOISE_LIGHT_BLUE,
              top: Platform.OS == 'ios' ? winHeight / 8 : winHeight / (winHeight > 700 ? 11 : 9),
              left: winWidth / 7,
              width: winWidth / 2,
            },
          ]}
        >
          <PolygonIcon
            style={[
              styles.toolTipIcon,
              isNoLocation && { tintColor: theme.colors.TURQUOISE_LIGHT_BLUE },
            ]}
          />
          <View style={{ padding: 12 }}>
            <Text style={styles.unserviceableHeading}>
              {isNoLocation ? 'No location selected' : string.addressSelection.unserviceableHeading}
            </Text>
            <Text style={styles.unserviceableMsg}>
              {isNoLocation ? 'Select your location' : string.addressSelection.unserviceableText}
            </Text>

            <View style={{ marginTop: isNoLocation ? 9 : 12 }}>
              <Button
                style={[
                  styles.unserviceableButton,
                  isNoLocation && {
                    backgroundColor: 'rgb(51,150,177)',
                  },
                ]}
                titleTextStyle={styles.unserviceableCTAStyle}
                title={isNoLocation ? 'SELECT LOCATION' : 'CHANGE LOCATION'}
                onPress={() => (isNoLocation ? _onPressLocateMe() : _onPressChangeLocation())}
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
        <View style={{ marginBottom: 28 }}>
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
          <View style={[styles.landingBannerInnerView, { bottom: -15 }]}>
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

  function _handleNavigationFromBanner(item: any, url: string) {
    //for rtpcr - drive through - open webview
    //for radiology
    if (item?.redirectUrlText === 'WebView') {
      DiagnosticBannerClick(slideIndex + 1, Number(item?.itemId || item?.id), item?.bannerTitle);
      try {
        const getBannerTitle = item?.bannerTitle;
        const openUrl = url || AppConfig.Configuration.RTPCR_Google_Form;
        if (
          !!getBannerTitle &&
          getBannerTitle?.toLowerCase().includes(string.diagnostics.radiology)
        ) {
          const getRemoteUrl = `${AppConfig.Configuration.WEB_URL_PREFIX}${AppConfig.Configuration.RADIOLOGY_URL}`;
          props.navigation.navigate(AppRoutes.ProHealthWebView, {
            covidUrl: getRemoteUrl,
            source: string.diagnostics.radiology,
            currentPatient: currentPatient,
          });
        } else {
          props.navigation.navigate(AppRoutes.CovidScan, {
            covidUrl: openUrl,
          });
        }
      } catch (e) {
        aphConsole.log(e);
        CommonBugFender(`renderSliderItem__handleNavigationFromBanner_${AppRoutes.Tests}`, e);
      }
    }
    //redirect to details page
    else {
      const data = item?.redirectUrl?.split('=')?.[1];
      const extractData = data?.replace('apollopatients://', '');
      const getNavigationDetails = extractData?.split('?');
      const route = getNavigationDetails?.[0]?.toLowerCase();
      let itemId = '';
      try {
        if (getNavigationDetails?.length >= 2) {
          itemId = getNavigationDetails?.[1]?.split('&');
          if (itemId?.length > 0) {
            itemId = itemId?.[0];
          }
        }
      } catch (error) {}
      if (route == 'testdetails') {
        DiagnosticBannerClick(
          slideIndex + 1,
          Number(itemId),
          item?.bannerTitle,
          currentPatient,
          isDiagnosticCircleSubscription
        );
        props.navigation.navigate(AppRoutes.TestDetails, {
          itemId: itemId,
          comingFrom: AppRoutes.Tests,
        });
      } else if (route == 'testlisting') {
        DiagnosticBannerClick(
          slideIndex + 1,
          Number(0),
          item?.bannerTitle,
          currentPatient,
          isDiagnosticCircleSubscription
        );
        props.navigation.navigate(AppRoutes.TestListing, {
          movedFrom: 'deeplink',
          widgetName: itemId, //name,
          cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
        });
      }
    }
  }

  const renderSliderItem = ({ item, index }: { item: any; index: number }) => {
    const handleOnPress = () => {
      if (item?.newredirectUrl && item?.newredirectUrl != '') {
        _handleNavigationFromBanner(item, item?.newredirectUrl);
      } else if (item?.redirectUrl && item?.redirectUrl != '') {
        //added for older versions + fallback
        _handleNavigationFromBanner(item, item?.redirectUrl);
      }
    };
    return (
      <TouchableOpacity activeOpacity={1} onPress={handleOnPress}>
        <ImageNative
          resizeMode="cover"
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: item?.bannerImage }}
        />
      </TouchableOpacity>
    );
  };

  const renderPackageWidget = (data: any) => {
    let listShowLength = 10;
    const isPricesAvailable =
      !!data &&
      data?.diagnosticWidgetData?.length > 0 &&
      data?.diagnosticWidgetData?.find((item: any) => item?.diagnosticPricing);
    const showViewAll = !!isPricesAvailable && data?.diagnosticWidgetData?.length > 2;
    const lengthOfTitle = data?.diagnosticWidgetTitle?.length;
    return (
      <View style={styles.widgetSpacing}>
        {
          <>
            {sectionLoading ? (
              renderDiagnosticWidgetHeadingShimmer() //load heading
            ) : !!isPricesAvailable ? (
              <SectionHeader
                leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
                leftTextStyle={[
                  styles.widgetHeading,
                  {
                    ...theme.viewStyles.text(
                      'B',
                      !!lengthOfTitle && lengthOfTitle > 20 ? 13.5 : 16,
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
                style={
                  showViewAll
                    ? { paddingBottom: 1, borderBottomWidth: 0 }
                    : { borderBottomWidth: 0 }
                }
              />
            ) : null}
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
                isPriceAvailable={isPriceAvailable}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={false}
                navigation={props.navigation}
                source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME}
                sourceScreen={AppRoutes.Tests}
                widgetHeading={data?.diagnosticWidgetTitle}
              />
            )}
          </>
        }
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
      <View style={styles.widgetSpacing}>
        {
          <>
            {sectionLoading ? (
              renderDiagnosticWidgetHeadingShimmer() //load heading
            ) : !!isPricesAvailable ? (
              <SectionHeader
                leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
                leftTextStyle={[
                  styles.widgetHeading,
                  {
                    ...theme.viewStyles.text(
                      'B',
                      !!lengthOfTitle && lengthOfTitle > 20 ? 13.5 : 16,
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
                style={
                  showViewAll
                    ? { paddingBottom: 1, borderBottomWidth: 0 }
                    : { borderBottomWidth: 0 }
                }
              />
            ) : null}
            {sectionLoading ? (
              renderDiagnosticWidgetShimmer(false) //load package card
            ) : (
              <ItemCard
                data={data}
                diagnosticWidgetData={data?.diagnosticWidgetData}
                isPriceAvailable={isPriceAvailable}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={false}
                navigation={props.navigation}
                source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME}
                sourceScreen={AppRoutes.Tests}
                widgetHeading={data?.diagnosticWidgetTitle}
              />
            )}
          </>
        }
      </View>
    );
  };

  const renderWhyBookUs = () => {
    return (
      <View style={{ marginBottom: -20, marginTop: 10 }}>
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.whyBookUsHeading}>
            {nameFormater(string.diagnostics.whyBookUs, 'upper')} ?
          </Text>
        </View>
        <Carousel
          onSnapToItem={setBookUsSlideIndex}
          data={AppConfig.Configuration.DIAGNOSTICS_WHY_BOOK_US_IMAGE_ARRAY}
          renderItem={renderWhyBookUsSlider}
          sliderWidth={winWidth}
          itemWidth={winWidth}
          loop={true}
          autoplay={true}
          autoplayDelay={AUTO_SCROLL_INTERVAL}
          autoplayInterval={AUTO_SCROLL_INTERVAL}
        />
        <View style={[styles.landingBannerInnerView, { bottom: 35 }]}>
          {AppConfig.Configuration.DIAGNOSTICS_WHY_BOOK_US_IMAGE_ARRAY?.map((_, index) =>
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
        titleStyle={styles.certificateViewTitle}
        leftIcon={<ShieldIcon />}
        bottomView={renderCertificateImages()}
      />
    );
  };

  const renderCertificateImages = () => {
    return (
      <View style={styles.certificateViewImage}>
        {AppConfig.Configuration.DIAGNOSTICS_CERTIFICATE_IMAGE_ARRAY?.map((img) => (
          <Image source={img} style={styles.certificateImageStyle} resizeMode={'contain'} />
        ))}
      </View>
    );
  };

  function refetchWidgets() {
    setReloadWidget(false);
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
  const formatResponse = (response: ImageCropPickerResponse[]) => {
    if (response.length == 0) return [];

    return response.map((item) => {
      const isPdf = item.mime == 'application/pdf';
      const fileUri = item!.path || `folder/file.jpg`;
      const random8DigitNumber = Math.floor(Math.random() * 90000) + 20000000;
      const fileType = isPdf ? 'pdf' : fileUri.substring(fileUri.lastIndexOf('.') + 1);

      return {
        base64: item.data,
        fileType: fileType,
        title: `${isPdf ? 'PDF' : 'IMG'}_${random8DigitNumber}`,
      } as PhysicalPrescription;
    });
  };
  const onClickTakePhoto = () => {
    ImagePicker.openCamera({
      cropping: false,
      hideBottomControls: true,
      width: 2096,
      height: 2096,
      includeBase64: true,
      multiple: true,
      compressImageQuality: 0.5,
      compressImageMaxHeight: 2096,
      compressImageMaxWidth: 2096,
      writeTempFile: false,
    })
      .then((response) => {
        setLoading(true);
        Platform.OS == 'ios' && setIsPrescriptionUpload(false);
        props.navigation.navigate(AppRoutes.PrescriptionCamera, {
          type: 'CAMERA_AND_GALLERY',
          responseData: formatResponse([response] as ImageCropPickerResponse[]),
          ePresscriptionUploaded: ePresscriptionUploaded,
          phyPrescriptionUploaded: phyPrescriptionUploaded,
          title: 'Camera',
        });
      })
      .catch((e: Error) => {
        Platform.OS == 'ios' && setIsPrescriptionUpload(false);
      });
  };

  const openGallery = () => {
    Platform.OS == 'android' && setIsPrescriptionUpload(false);

    ImagePicker.openPicker({
      cropping: true,
      hideBottomControls: true,
      includeBase64: true,
      multiple: true,
      compressImageQuality: 0.5,
      compressImageMaxHeight: 2096,
      compressImageMaxWidth: 2096,
      writeTempFile: false,
      freeStyleCropEnabled: false,
    })
      .then((response) => {
        const images = response as ImageCropPickerResponse[];
        const isGreaterThanSpecifiedSize = images.find(({ size }) => size > MAX_FILE_SIZE);
        if (isGreaterThanSpecifiedSize) {
          Alert.alert(string.common.uhOh, string.diagnostics.invalidFileSize);
          return;
        }
        const uploadedImages = formatResponse(images);
        Platform.OS == 'ios' && setIsPrescriptionUpload(false);
        props.navigation.navigate(AppRoutes.SubmittedPrescription, {
          type: 'Gallery',
          phyPrescriptionsProp: [...phyPrescriptionUploaded, ...uploadedImages],
          ePrescriptionsProp: ePresscriptionUploaded,
          source: 'Tests',
        });
      })
      .catch((e: Error) => {
        Platform.OS == 'ios' && setIsPrescriptionUpload(false);
        CommonBugFender('Tests_onClickGallery', e);
      });
  };

  const getBase64 = (response: DocumentPickerResponse[]): Promise<string>[] => {
    return response.map(async ({ fileCopyUri: uri, name: fileName, type }) => {
      const isPdf = fileName.toLowerCase().endsWith('.pdf'); // TODO: check here if valid image by mime
      uri = Platform.OS === 'ios' ? decodeURI(uri.replace('file://', '')) : uri;
      let compressedImageUri = '';
      if (!isPdf) {
        compressedImageUri = (await ImageResizer.createResizedImage(uri, 2096, 2096, 'JPEG', 50))
          .uri;
        compressedImageUri =
          Platform.OS === 'ios' ? compressedImageUri.replace('file://', '') : compressedImageUri;
      }
      return RNFetchBlob.fs.readFile(!isPdf ? compressedImageUri : uri, 'base64');
    });
  };

  const onBrowseClicked = async () => {
    setIsPrescriptionUpload(false);
    try {
      const documents = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.pdf],
        copyTo: 'documentDirectory',
      });
      const isValidPdf = documents.find(({ name }) => name.toLowerCase().endsWith('.pdf'));
      const isValidSize = documents.find(({ size }) => size < MAX_FILE_SIZE);
      if (!isValidPdf || !isValidSize) {
        Alert.alert(
          string.common.uhOh,
          !isValidPdf ? string.diagnostics.invalidFileType : string.diagnostics.invalidFileSize
        );
        return;
      }
      const base64Array = await Promise.all(getBase64(documents));
      const base64FormattedArray = base64Array.map(
        (base64, index) =>
          ({
            mime: documents[index].type,
            data: base64,
          } as ImageCropPickerResponse)
      );
      const documentData = base64Array.map(
        (base64, index) =>
          ({
            title: documents[index].name,
            fileType: documents[index].type,
            base64: base64,
          } as PhysicalPrescription)
      );
      props.navigation.navigate(AppRoutes.SubmittedPrescription, {
        type: 'Gallery',
        phyPrescriptionsProp: [...phyPrescriptionUploaded, ...documentData],
        ePrescriptionsProp: ePresscriptionUploaded,
        source: 'SubmittedPrescription',
      });
    } catch (e) {
      if (DocumentPicker.isCancel(e)) {
        CommonBugFender('SubmittedPrescription_onClickGallery', e);
      }
    }
  };

  async function _navigateToUploadViaWhatsapp() {
    try {
      const getMessage =
        getUploadPrescriptionConfigs?.textMessage ||
        string.diagnostics.uploadPrescriptionWhatsapp.message;
      const getPhoneNumber =
        getUploadPrescriptionConfigs?.phoneNumber ||
        string.diagnostics.uploadPrescriptionWhatsapp.whatsappPhoneNumber;
      const diagnosticUserType = await AsyncStorage.getItem('diagnosticUserType');
      Linking.openURL(
        `https://api.whatsapp.com/send/?text=${getMessage}&phone=91${getPhoneNumber}`
      );
      DiagnosticPrescriptionSubmitted(
        currentPatient,
        '',
        '',
        diagnosticUserType,
        isDiagnosticCircleSubscription,
        DiagnosticCTJourneyType?.WHATSAPP
      );
    } catch (error) {
      CommonBugFender('Tests_navigateToUploadViaWhatsapp', error);
      _openGalleryOptions();
    }
  }

  function _onPressUpload() {
    if (uploadViaWhatsapp) {
      _navigateToUploadViaWhatsapp();
    } else {
      _openGalleryOptions();
    }
  }

  function _openGalleryOptions() {
    setIsPrescriptionGallery(false);
    setIsPrescriptionUpload(true);
  }

  const renderUploadPrescriptionCard = () => {
    return (
      <View style={styles.precriptionContainer}>
        <View style={styles.precriptionContainerUpload}>
          <PrescriptionColored style={{ height: 35 }} />
          <Text style={styles.prescriptionText}>
            {getUploadPrescriptionConfigs?.uploadPrescriptionText ||
              string.diagnostics.prescriptionHeading}
          </Text>
          <Button
            title={getUploadPrescriptionConfigs?.CTA || string.common.upload}
            style={styles.buttonStyle}
            onPress={() => _onPressUpload()}
          />
        </View>
        {isUploaded ? (
          <View style={styles.bottomArea}>
            <View style={styles.prescriptionUploadedView}>
              <GreenCheck style={styles.greenCheckIcon} />
              <Text style={styles.prescriptionTextUpload}>
                {string.diagnostics.prescriptionUploaded}
              </Text>
            </View>
            <Text style={styles.prescriptionTextUploadTime}>
              {moment().format('DD MMM, HH:mm')}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };
  const renderMiniPrescriptionCard = () => {
    return (
      <View style={styles.precriptionMiniContainer}>
        <TouchableOpacity
          style={styles.precriptionContainerMiniUpload}
          onPress={() => _onPressUpload()}
        >
          <PrescriptionColored style={{ height: 35 }} />
          <Text style={styles.prescriptionText}>Upload Prescription</Text>
          <ArrowRight style={{ alignSelf: 'center' }} />
        </TouchableOpacity>
      </View>
    );
  };
  const renderMiniMyOrder = () => {
    return (
      <View style={styles.precriptionMiniContainer}>
        <TouchableOpacity
          style={styles.precriptionContainerMiniUpload}
          onPress={() => {
            postMyOrdersClicked('Diagnostics', currentPatient);
            props.navigation.push(AppRoutes.YourOrdersTest, {
              isTest: true,
              cityId: cityId,
            });
          }}
        >
          <BagBlue style={{ height: 35 }} />
          <Text style={styles.prescriptionText}>View My Orders</Text>
          <ArrowRight style={{ alignSelf: 'center' }} />
        </TouchableOpacity>
      </View>
    );
  };
  const renderEPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        navigation={props.navigation}
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          props.navigation.navigate(AppRoutes.SubmittedPrescription, {
            ePrescriptionsProp: [...ePresscriptionUploaded, ...selectedEPres],
            phyPrescriptionsProp: phyPrescriptionUploaded,
            type: 'E-Prescription',
          });
        }}
        selectedEprescriptionIds={ePresscriptionUploaded?.map((item) => item?.id)}
        isVisible={isSelectPrescriptionVisible}
        movedFrom={AppRoutes.Tests}
      />
    );
  };

  function onPressBookNow(item: any) {
    const testPrescription = item?.caseSheet?.diagnosticPrescription;
    addTestsToCart(
      testPrescription,
      client,
      AppConfig.Configuration.DIAGNOSTIC_DEFAULT_LOCATION.pincode,
      setLoadingContext
    )
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
        const getInclusion = tests?.map((item) => Number(item?.inclusions));
        const itemType =
          !!getInclusion &&
          getInclusion?.map((item: any) =>
            item?.count > 1 ? DIAGNOSTICS_ITEM_TYPE.PACKAGE : DIAGNOSTICS_ITEM_TYPE.TEST
          );
        setLoadingContext?.(false);
        DiagnosticAddToCartEvent(
          getItemNames,
          getItemIds,
          0,
          0,
          DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PRESCRIPTION,
          itemType?.join(','),
          undefined,
          currentPatient,
          isDiagnosticCircleSubscription
        );
      })
      .catch((e) => {
        setLoadingContext?.(false);
        handleGraphQlError(e);
      });
  }

  function _navigateToPatientsPage() {
    showCartSummary && setShowCartSummary(false);
    props.navigation.navigate(AppRoutes.AddPatients);
  }

  function _navigateToTestCart() {
    hideAphAlert?.();
    _navigateToPatientsPage();
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
      'Download Report PDF',
      currentPatient
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
        item?.displayId,
        currentPatient
      );
      //view report download
      //need to remove the event once added
      DiagnosticViewReportClicked(
        'Home',
        !!item?.labReportURL ? 'Yes' : 'No',
        'Download Report PDF',
        item?.displayId,
        currentPatient
      );
      if (!!item?.labReportURL && item?.labReportURL != '') {
        setClickedItem(item);
        setShowViewReportModal(true);
      } else {
        showAphAlert?.({
          title: string.common.uhOh,
          description: string.diagnostics.responseUnavailableForReport,
        });
      }
    } else {
      if (DIAGNOSTIC_PHELBO_TRACKING_STATUS.includes(item?.orderStatus)) {
        //track phlebo
        item?.orderStatus === DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED
          ? navigateToTrackingScreen(item)
          : getPhelboDetails(item?.id, item);
      } else {
        navigateToTrackingScreen(item);
      }
    }
  }

  function navigateToTrackingScreen(item: any) {
    DiagnosticTrackOrderViewed(
      currentPatient,
      item?.orderStatus,
      item?.displayId,
      'Home',
      isDiagnosticCircleSubscription
    );
    props.navigation.push(AppRoutes.YourOrdersTest, {
      isTest: true,
      cityId: cityId,
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
              DiagnosticTrackPhleboClicked(
                orderId,
                'Home',
                currentPatient,
                'Yes',
                isDiagnosticCircleSubscription
              );
              Linking.openURL(getUrl);
            } else {
              DiagnosticTrackPhleboClicked(
                orderId,
                'Home',
                currentPatient,
                'No',
                isDiagnosticCircleSubscription
              );
              CommonBugFender('Tests_getPhelboDetails_Unable_to_open_url', getUrl);
            }
          });
        } else {
          DiagnosticTrackPhleboClicked(
            orderId,
            'Home',
            currentPatient,
            'No',
            isDiagnosticCircleSubscription
          );
          navigateToTrackingScreen(order);
        }
      }
      setLoadingContext?.(false);
    } catch (error) {
      DiagnosticTrackPhleboClicked(
        orderId,
        'Home',
        currentPatient,
        'No',
        isDiagnosticCircleSubscription
      );
      setLoadingContext?.(false);
      CommonBugFender('Tests_onPressOrderStatusOption', error);
    }
  }

  const renderExpressSlots = () => {
    return (
      <View style={styles.outerExpressView}>
        <View style={styles.innerExpressView}>
          <ExpressSlotClock style={styles.expressSlotIcon} />
          <Text style={styles.expressSlotText}>{expressSlotMsg}</Text>
        </View>
      </View>
    );
  };

  function getRanking(rank: string) {
    const findRank =
      !!widgetsData &&
      widgetsData?.length > 0 &&
      widgetsData?.filter((item: any) => item?.diagnosticwidgetsRankOrder === rank);
    return findRank;
  }

  function renderWidgetItems(widgetType: any) {
    return widgetType?.length > 0 && widgetType?.map((wid: any) => renderWidgetType(wid));
  }
  function onPressSingleBookNow(item: any) {
    addCartItem?.(item);
    _navigateToPatientsPage();
  }

  const singleItem = AppConfig.Configuration.DIAGNOSTICS_HOME_SINGLE_ITEM;
  const renderSingleItem = () => {
    let singleItemFilterData: any[] = [];
    for (let index = 0; index < widgetsData?.length; index++) {
      const element = widgetsData?.[index];
      element?.diagnosticWidgetData?.filter((item: any) => {
        if (item?.itemId == singleItem?.id) {
          singleItemFilterData?.push(item);
        }
      });
    }
    const singleItemData = singleItemFilterData?.[0];
    const packageMrpForItem = singleItemData?.packageCalculatedMrp!;
    const getDiagnosticPricingForItem = singleItemData?.diagnosticPricing;
    const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);
    return (
      <>
        {!!singleItemData?.itemTitle && !!pricesForItem?.price ? (
          <View style={styles.singleItemContainer}>
            <View style={styles.itemFirst}>
              <View style={{ flexDirection: 'row' }}>
                <VirusGreen style={{ height: 24 }} />
                <Text style={styles.singleItemName}>{singleItemData?.itemTitle}</Text>
              </View>
              <Text style={styles.singleItemPrice}>
                {string.common.Rs}
                {pricesForItem?.price}
              </Text>
            </View>
            <View style={styles.viewSecond}>
              <View style={{ marginLeft: 45 }}>
                <View style={styles.blueFirst}>
                  <ClockBlue style={styles.blueIcon} />
                  <Text style={styles.blueText}>{string.diagnostics.sameDayReports}</Text>
                </View>
                <View style={styles.blueSecond}>
                  <HomeBlue style={styles.blueIcon} />
                  <Text style={styles.blueText}>{string.diagnostics.freeHomeCollection}</Text>
                </View>
              </View>
              <Button
                title={string.diagnostics.bookNow}
                style={styles.buttonTop}
                onPress={() => {
                  const singleItemObj = {
                    circlePrice: pricesForItem?.circlePrice!,
                    circleSpecialPrice: pricesForItem?.circleSpecialPrice!,
                    collectionMethod: TEST_COLLECTION_TYPE.HC,
                    discountPrice: pricesForItem?.discountPrice!,
                    discountSpecialPrice: pricesForItem?.discountSpecialPrice!,
                    groupPlan: pricesForItem?.planToConsider?.groupPlan!,
                    id: singleItemData?.itemId,
                    inclusions: singleItemData?.inclusionData?.map((item: any) => {
                      return item?.incItemId;
                    }),
                    isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
                    mou: 1,
                    name: singleItemData?.itemTitle,
                    packageMrp: packageMrpForItem,
                    price: pricesForItem?.price!,
                    specialPrice: pricesForItem?.specialPrice!,
                    thumbnail: singleItemData?.itemImageUrl,
                  };
                  onPressSingleBookNow(singleItemObj);
                }}
              />
            </View>
            <View style={styles.bottomGreenView}>
              <Text style={styles.bottomText}>{string.diagnostics.forFamily}</Text>
            </View>
          </View>
        ) : null}
      </>
    );
  };

  const renderOrderAndPrescriptionPanel = () => {
    const isPrescriptionAvailable =
      AppConfig.Configuration.DIAGNOSTICS_SHOW_UPLOAD_PRESCRIPTION_SECTION;
    const isOrderAvailable = diagnosticStateUserType == `"${string.user_type.REPEAT}"`;
    if (isOrderAvailable && isPrescriptionAvailable) {
      return (
        <View style={styles.orderPrescriptionPanel}>
          {renderMiniPrescriptionCard()}
          {renderMiniMyOrder()}
        </View>
      );
    } else if (isOrderAvailable) {
      return renderYourOrders();
    } else if (isPrescriptionAvailable) {
      return renderUploadPrescriptionCard();
    }
  };
  const renderSections = () => {
    const widget1 = getRanking('1');
    const recommendationWidget = getRanking('0'); //this position will always be 0th.
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (diagnosticResults?.length == 0 && !searchText) return;
          setSearchText('');
          setDiagnosticResults([]);
        }}
        style={{ flex: 1, backgroundColor: colors.WHITE }}
      >
        {widgetsData?.length == 0 && reloadWidget && renderLowNetwork()}
        {renderWidgetItems(widget1)} {/**1 */}
        {!!singleItem?.id && renderSingleItem()}
        {currentPatient && renderOrderAndPrescriptionPanel()}
        {latestPrescriptionShimmer
          ? renderDiagnosticCardShimmer()
          : latestPrescription?.length > 0
          ? renderPrescriptionCard()
          : null}
        {patientOrdersShimmer ? renderDiagnosticCardShimmer() : renderOrderStatusCard()}
        {/** keep 0th position for recommendations, should come before first widget */}
        {recommendationWidget &&
          (pastOrderRecommendationShimmer
            ? renderDiagnosticCardShimmer()
            : pastOrderRecommendations?.length > 0
            ? renderPastOrderRecommendations(recommendationWidget)
            : null)}
        {renderBottomViews()}
      </TouchableOpacity>
    );
  };

  const renderBottomViews = () => {
    const isWidget = widgetsData?.length > 0;

    const isWidget2 = getRanking('2');
    const isWidget3 = getRanking('3');
    const isWidget4 = getRanking('4');
    const isWidget5 = getRanking('5');
    const isWidget6 = getRanking('6');

    const getAllRankedItems =
      !!widgetsData &&
      widgetsData?.length > 0 &&
      widgetsData?.filter((item: any) => rankArr.includes(item?.diagnosticwidgetsRankOrder));

    const restWidgets =
      isWidget && widgetsData?.slice(getAllRankedItems?.length, widgetsData?.length);
    return (
      <>
        {renderWidgetItems(isWidget2)} {/**2 */}
        {renderWidgetItems(isWidget3)} {/** 3 */}
        {renderStepsToBook()}
        {renderWidgetItems(isWidget4)} {/** 4 */}
        {renderWidgetItems(isWidget5)} {/** 5 */}
        {renderWhyBookUs()}
        {renderWidgetItems(isWidget6)} {/** 6 */}
        {renderCertificateView()}
        {!!restWidgets && restWidgets?.map((item: any) => renderWidgetType(item))}
      </>
    );
  };

  const renderWidgetType = (widget: any) => {
    if (!!widget) {
      const widgetName = widget?.diagnosticWidgetType?.toLowerCase();
      switch (widgetName) {
        case string.diagnosticCategoryTitle.banner:
          return renderBanner();
          break;
        case string.diagnosticCategoryTitle.package:
          return renderPackageWidget(widget);
          break;
        case string.diagnosticCategoryTitle.categoryGrid:
          return scrollWidgetSection(widget);
          break;
        case string.diagnosticCategoryTitle.category:
          return gridWidgetSection(widget);
          break;
        default:
          return renderTestWidgets(widget);
          break;
      }
    } else {
      return null;
    }
  };

  const renderPastOrderRecommendations = (drupalRecommendations: any) => {
    const topTenPastRecommendations =
      pastOrderRecommendations?.length > 10
        ? pastOrderRecommendations?.slice(0, 10)
        : pastOrderRecommendations;

    const isPricesAvailable =
      topTenPastRecommendations?.length > 0 &&
      topTenPastRecommendations.find((item: any) => item?.diagnosticPricing);
    const showViewAll = true;
    const widgetName =
      drupalRecommendations?.[0]?.diagnosticWidgetTitle! ||
      string.diagnostics.homepagePastOrderRecommendations;
    const lengthOfTitle = widgetName?.length;

    return (
      <View style={styles.widgetSpacing}>
        {
          <>
            {sectionLoading ? (
              renderDiagnosticWidgetHeadingShimmer() //load heading
            ) : !!isPricesAvailable ? (
              <SectionHeader
                leftText={nameFormater(widgetName, 'upper')}
                leftTextStyle={[
                  styles.widgetHeading,
                  {
                    ...theme.viewStyles.text(
                      'B',
                      !!lengthOfTitle && lengthOfTitle > 20 ? 13.5 : 16,
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
                          data: drupalRecommendations?.[0], //for passing title
                          cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
                          widgetType: string.diagnosticCategoryTitle.item,
                          widgetName: widgetName,
                        });
                      }
                    : undefined
                }
                style={
                  showViewAll
                    ? { paddingBottom: 1, borderBottomWidth: 0 }
                    : { borderBottomWidth: 0 }
                }
              />
            ) : null}
            {sectionLoading ? (
              renderDiagnosticWidgetShimmer(false) //load package card
            ) : (
              <ItemCard
                data={topTenPastRecommendations}
                diagnosticWidgetData={topTenPastRecommendations}
                isPriceAvailable={priceAvailable}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={false}
                navigation={props.navigation}
                source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME}
                sourceScreen={'Recommendations'}
                widgetHeading={widgetName}
              />
            )}
          </>
        }
      </View>
    );
  };

  function _openCartSummary() {
    setShowCartSummary(true);
  }

  function onPressShowLess() {
    setShowCartSummary(false);
  }

  function _setRecommendationsCount(val: number) {
    setSummaryRecommendationCount(val);
  }

  const renderCartSummary = () => {
    return (
      <View style={styles.cartSummaryOverlay}>
        <CartPageSummary
          containerStyle={styles.cartSummaryContainer}
          _onPressShowLess={() => onPressShowLess()}
          cartItems={calculateDiagnosticCartItems(cartItems, patientCartItems)}
          isCircleSubscribed={isDiagnosticCircleSubscription}
          locationDetails={
            diagnosticLocation || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_LOCATION
          }
          client={client}
          cityId={serviceableObject?.cityId || diagnosticServiceabilityData?.cityId}
          recommendationCount={(count) => _setRecommendationsCount(count)}
        />
      </View>
    );
  };

  const renderCartDetails = () => {
    const cartCount = calculateDiagnosticCartItems(cartItems, patientCartItems)?.length;

    const itemCount = !!cartItems && cartCount > 9 ? `${cartCount}` : `0${cartCount}`;
    return (
      <View
        style={[
          styles.cartDetailView,
          {
            height: GO_TO_CART_HEIGHT,
          },
          showCartSummary && styles.cartDetailViewShadow,
        ]}
      >
        <View style={{ marginLeft: 20 }}>
          <Text
            style={[
              styles.itemAddedText,
              {
                alignSelf: showCartSummary ? 'flex-start' : 'center',
              },
            ]}
          >
            {itemCount}{' '}
            {cartCount == 1 ? string.diagnostics.itemAdded : string.diagnostics.itemsAdded}
          </Text>

          {showCartSummary && !!summaryRecommendationCount && summaryRecommendationCount > 0 ? (
            <Text style={styles.recommendationsText}>
              + {summaryRecommendationCount} more{' '}
              {summaryRecommendationCount > 1 ? 'Recommendations' : 'Recommendation'}
            </Text>
          ) : (
            <TouchableOpacity onPress={() => _openCartSummary()} style={styles.viewDetailsTouch}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <ArrowUpGreen style={styles.viewDetailsUpIcon} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.goToCartView}>
          <Button
            title={nameFormater(string.diagnostics.goToCart, 'upper')}
            onPress={() => _navigateToPatientsPage()}
            style={{ width: '90%' }}
          />
        </View>
      </View>
    );
  };
  const renderDiagnosticHeader = () => {
    const renderIcon = () => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigateToHome(props.navigation);
          cleverTapEventForHomeIconClick();
        }}
      >
        <HomeIcon style={styles.homeIconStyle} />
      </TouchableOpacity>
    );

    const cleverTapEventForHomeIconClick = () => {
      const circleMemberAtt =
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        undefined;
      const deviceId = getUniqueId();
      DiagnosticHomePageClicked(
        currentPatient,
        getUserType(allCurrentPatients),
        'Dignostic Page',
        !!circleSubscriptionId ? 'True' : 'False'
      );
    };

    const renderCartIcon = () => (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.cartIconTouch}
          activeOpacity={1}
          onPress={() => _navigateToPatientsPage()}
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
          rightTextStyle={styles.widgetViewAllText}
          onPressRightText={() => {
            props.navigation.navigate(AppRoutes.TestWidgetListing, {
              movedFrom: AppRoutes.Tests,
              data: data,
              cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
            });
          }}
          style={
            showViewAll ? { paddingBottom: 1, borderBottomWidth: 0 } : { borderBottomWidth: 0 }
          }
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionView}>
          {data?.diagnosticWidgetData?.map((item: any) => (
            <WidgetCard
              data={item}
              onPressWidget={() => {
                DiagnosticHomePageWidgetClicked(
                  currentPatient,
                  data?.diagnosticWidgetTitle,
                  undefined,
                  undefined,
                  item?.itemTitle,
                  isDiagnosticCircleSubscription
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
            currentPatient,
            data?.diagnosticWidgetTitle,
            undefined,
            undefined,
            item?.itemTitle,
            isDiagnosticCircleSubscription
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
          {nameFormater(item?.itemTitle, 'default')}
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
      <View style={{ marginBottom: 24 }}>
        <SectionHeader
          leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
          leftTextStyle={[
            styles.widgetHeading,
            {
              ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE, 1, 20),
            },
          ]}
          rightText={showViewAll ? 'VIEW ALL' : ''}
          rightTextStyle={styles.widgetViewAllText}
          onPressRightText={() => {
            props.navigation.navigate(AppRoutes.TestWidgetListing, {
              movedFrom: AppRoutes.Tests,
              data: data,
              cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
            });
          }}
          style={{ borderBottomWidth: 0, paddingBottom: 0 }}
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

  const prescriptionOptionArray = [
    {
      icon: <GalleryIcon style={styles.uploadPresIcon} />,
      title: 'Choose from Gallery',
    },
    {
      icon: <CameraIcon style={styles.uploadPresIcon} />,
      title: 'Take a Picture',
    },
    {
      icon: <PrescriptionIcon style={styles.uploadPresIcon} />,
      title: 'Select from my Prescriptions',
    },
  ];

  const prescriptionGalleryOptionArray = [
    {
      title: 'Photo Library',
    },
    {
      title: 'Upload PDF',
    },
  ];

  const renderOptionsUploadPrescription = () => {
    return (
      <>
        <Text style={styles.textHeadingModal}>Upload Prescription</Text>
        {prescriptionOptionArray.map((item, index: number) => {
          return (
            <>
              <TouchableOpacity
                onPress={() => {
                  if (item.title == 'Choose from Gallery') {
                    setIsPrescriptionGallery(true);
                  } else if (item.title == 'Take a Picture') {
                    Platform.OS == 'android' && setIsPrescriptionUpload(false);
                    onClickTakePhoto();
                  } else {
                    setIsPrescriptionUpload(false);
                    setSelectPrescriptionVisible(true);
                  }
                }}
                style={[
                  styles.areaStyles,
                  {
                    marginTop: index === 0 ? 0 : 10,
                    marginBottom: index === prescriptionOptionArray?.length - 1 ? 20 : 10,
                  },
                ]}
              >
                {item?.icon}
                <Text style={styles.textPrescription}>{item?.title}</Text>
              </TouchableOpacity>
              {index === prescriptionOptionArray?.length - 1 ? null : <Spearator />}
            </>
          );
        })}
      </>
    );
  };

  const renderGalleryOption = () => {
    return (
      <>
        <Text style={styles.textHeadingModal}>Choose from Gallery</Text>
        {prescriptionGalleryOptionArray?.map((item, index: number) => {
          return (
            <>
              <TouchableOpacity
                style={[
                  styles.areaStyles,
                  {
                    marginTop: index === 0 ? 0 : 10,
                    marginBottom: index === prescriptionGalleryOptionArray?.length - 1 ? 20 : 10,
                  },
                ]}
                onPress={() => {
                  if (item?.title == 'Photo Library') {
                    openGallery();
                  } else {
                    if (Platform.OS === 'android') {
                      storagePermissions(() => {
                        onBrowseClicked();
                      });
                    } else {
                      onBrowseClicked();
                    }
                  }
                }}
              >
                <Text style={styles.textPrescription}>{item.title}</Text>
              </TouchableOpacity>
              {index === prescriptionOptionArray?.length - 1 ? null : <Spearator />}
            </>
          );
        })}
      </>
    );
  };

  const renderBottomAbsoluteView = () => {
    return (
      <>
        {showNudgeMessage && renderCircleNudgeMessage()}
        {isCartAvailable ? renderCartDetails() : null}
      </>
    );
  };

  const renderCircleNudgeMessage = () => {
    return (
      <View style={[styles.nudgeMsgHeight, { bottom: isCartAvailable ? GO_TO_CART_HEIGHT : 0 }]}>
        <CircleLogo style={styles.circleIcon} />
        <View style={styles.nudgeMsgView}>
          <Text style={styles.nudgeMsgText}>
            {AppConfig.Configuration.DIAGNOSTICS_NUDGE_MESSAGE_TEXT}
          </Text>
        </View>
      </View>
    );
  };

  const renderCallToOrder = () => {
    const CART_AVAILABLE_HEIGHT = isCartAvailable ? GO_TO_CART_HEIGHT : 0;
    return getCTADetails?.length ? (
      <CallToOrderView
        cartItems={cartItems}
        slideCallToOrder={slideCallToOrder}
        customMargin={
          showNudgeMessage
            ? CART_AVAILABLE_HEIGHT + NON_CIRCLE_NUDGE_HEIGHT + 10
            : CART_AVAILABLE_HEIGHT + 10
        }
        onPressSmallView={() => {
          setSlideCallToOrder(false);
        }}
        cityId={cityId}
        onPressCross={() => {
          setSlideCallToOrder(true);
        }}
        pageId={CALL_TO_ORDER_CTA_PAGE_ID.HOME}
      />
    ) : null;
  };

  const postScrollScreenEvent = () => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.SCREEN_SCROLLED] = {
      User_Type: getUserType(allCurrentPatients),
      'Patient Name': currentPatient?.firstName,
      'Patient UHID': currentPatient?.uhid,
      'Patient age': getAge(currentPatient?.dateOfBirth),
      'Circle Member': 'circleSubscriptionId' ? 'True' : 'False',
      'Customer ID': currentPatient?.id,
      'Patient gender': currentPatient?.gender,
      'Mobile number': currentPatient?.mobileNumber,
      'Page name': 'Diagnostic page',
      'Nav src': homeScreenAttributes?.Source,
      Scrolls: scrollCount.current,
    };
    postCleverTapEvent(CleverTapEventName.SCREEN_SCROLLED, eventAttributes);
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigationEvents
        onDidFocus={() => {
          scrollCount.current = 0;
        }}
        onDidBlur={postScrollScreenEvent}
      />
      <SafeAreaView style={{ ...viewStyles.container }}>
        <>
          <View style={{ backgroundColor: colors.WHITE }}>
            {renderDiagnosticHeader()}
            {renderSeperator()}
            {renderSearchBar()}
            {expressSlotMsg != '' ? renderExpressSlots() : null}
            <Modal
              animationType="fade"
              transparent={true}
              visible={isPrescriptionUpload}
              onRequestClose={() => {
                setIsPrescriptionUpload(false);
              }}
              onDismiss={() => {
                setIsPrescriptionUpload(false);
              }}
            >
              <View style={styles.modalMainView}>
                <TouchableOpacity
                  style={styles.closeContainer}
                  onPress={() => {
                    if (isPrescriptionGallery) {
                      setIsPrescriptionGallery(false);
                      setIsPrescriptionUpload(true);
                    } else {
                      setIsPrescriptionGallery(false);
                      setIsPrescriptionUpload(false);
                    }
                  }}
                >
                  <CrossPopup />
                </TouchableOpacity>
                <View style={styles.paitentModalView}>
                  {isPrescriptionGallery
                    ? renderGalleryOption()
                    : renderOptionsUploadPrescription()}
                </View>
              </View>
            </Modal>
          </View>
          <View style={{ flex: 1 }}>
            <ScrollView
              scrollEventThrottle={0}
              removeClippedSubviews={true}
              bounces={false}
              style={{
                flex: 1,
                marginBottom: isCartAvailable
                  ? showNudgeMessage
                    ? 60
                    : 30
                  : showNudgeMessage
                  ? 30
                  : 0,
              }}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              onScroll={(event) => {
                setSlideCallToOrder(true);
                //increments only for down scroll
                try {
                  const currentOffset = event.nativeEvent.contentOffset?.y;
                  currentOffset > (this.offset || 0) && (scrollCount.current += 1);
                  this.offset = currentOffset;
                } catch (e) {}
              }}
            >
              {renderSections()}
              {isCartAvailable ? <View style={{ height: 20 }} /> : null}
            </ScrollView>
            {renderCallToOrder()}
            {renderBottomAbsoluteView()}
          </View>
        </>
        {showLocationPopup && renderLocationSearch()}
        {showUnserviceablePopup && renderNonServiceableToolTip(false)}
        {showNoLocationPopUp && renderNonServiceableToolTip(true)}
        {showCartSummary && cartItems?.length > 0 && renderCartSummary()}
      </SafeAreaView>
      {showViewReportModal ? renderViewReportModal() : null}
      {showbookingStepsModal ? renderBookingStepsModal() : null}
      {isSelectPrescriptionVisible && renderEPrescriptionModal()}
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
  modalMainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  callToOrderText: {
    ...theme.viewStyles.text('SB', 14, 'white', 1),
    paddingHorizontal: 10,
  },
  paitentModalView: {
    backgroundColor: 'white',
    width: '100%',
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  precriptionContainer: {
    ...theme.viewStyles.cardViewStyle,
    ...theme.viewStyles.shadowStyle,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 24,
    marginTop: 20,
  },
  precriptionMiniContainer: {
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 16,
    marginHorizontal: 16,
    width: '50%',
    justifyContent: 'center',
    padding: 5,
  },
  precriptionContainerMiniUpload: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderRadius: 10,
  },
  blueText: {
    ...theme.viewStyles.text('M', 12, '#2A71DB', 1),
    paddingLeft: 5,
    alignSelf: 'center',
  },
  blueFirst: { flexDirection: 'row', alignItems: 'center' },
  blueSecond: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
  buttonTop: { width: '35%', marginRight: 10 },
  singleItemContainer: {
    flex: 1,
    width: '92%',
    height: 120,
    backgroundColor: '#EDFAFD',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 20,
  },
  itemFirst: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  singleItemName: {
    ...theme.viewStyles.text('SB', 16, colors.SHERPA_BLUE, 1),
    marginLeft: 5,
    width: '75%',
  },
  singleItemPrice: {
    ...theme.viewStyles.text('SB', 16, colors.SHERPA_BLUE, 1),
    alignSelf: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  viewSecond: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  blueIcon: { width: 18, height: 18 },
  bottomGreenView: {
    backgroundColor: '#D7FAF3',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 15,
    paddingVertical: 5,
  },
  yourOrderContainer: {
    marginBottom: 24,
    marginTop: 20,
    width: '92%',
  },
  seperatorContainer: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 0.5,
    width: '92%',
    alignSelf: 'center',
  },
  orderPrescriptionPanel: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 15,
    marginTop: 20,
  },
  precriptionContainerUpload: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
  },
  bottomText: { ...theme.viewStyles.text('SB', 16, '#46B29D', 1), alignSelf: 'center' },
  closeContainer: {
    alignSelf: 'flex-end',
    margin: 10,
  },
  textHeadingModal: {
    ...theme.viewStyles.text('B', 17, colors.SHERPA_BLUE),
    marginBottom: 20,
  },
  textPrescription: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1, 20),
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  areaStyles: { flexDirection: 'row', alignItems: 'center' },
  uploadPresIcon: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
    tintColor: colors.TEAL_BLUE,
  },
  buttonStyle: { width: '30%', alignSelf: 'center' },
  prescriptionText: {
    ...theme.viewStyles.text('SB', 15, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
    width: '50%',
  },
  bottomArea: {
    backgroundColor: colors.APP_GREEN,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prescriptionTextUpload: {
    ...theme.viewStyles.text('SB', 14, theme.colors.WHITE, 1),
    paddingHorizontal: 5,
  },
  prescriptionTextUploadTime: {
    ...theme.viewStyles.text('R', 14, theme.colors.WHITE, 1),
    paddingHorizontal: 5,
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
    // marginTop: 20,
    marginBottom: 24,
  },
  gridConatiner: {
    width: winWidth,
    backgroundColor: 'white',
    marginVertical: 16,
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
    ...theme.viewStyles.text('B', 15, theme.colors.APP_YELLOW, 1, 20),
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

  cartDetailView: {
    position: 'absolute',
    backgroundColor: colors.WHITE,
    bottom: 0,
    height: GO_TO_CART_HEIGHT, //50
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceabilityMsg: { ...theme.viewStyles.text('R', 10, '#890000') },
  headerContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    backgroundColor: '#fff',
    marginLeft: 16,
    marginRight: 16,
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
    backgroundColor: theme.colors.BGK_GRAY,
  },
  image: {
    width: 30,
    height: 30,
    backgroundColor: theme.colors.BGK_GRAY,
    resizeMode: 'contain',
  },
  gridPart: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: winWidth / 4,
    borderColor: '#E8E8E8',
    borderWidth: 0.5,
    padding: 16,
    paddingLeft: 12,
    paddingRight: 12,
  },
  textStyle: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, colors.SHERPA_BLUE, 1, 20, 0),
    paddingVertical: 5,
    textAlign: 'center',
    width: '100%',
  },
  widgetSpacing: {
    marginVertical: 12, //20
  },
  whyBookUsOuterView: { marginBottom: 15, marginTop: '2%' },
  stepsToBookTitleStyle: {
    color: colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 12 : 13),
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
    width: winWidth / 3.5,
    borderRadius: 10,
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
  outerExpressView: { backgroundColor: colors.APP_GREEN, marginBottom: 2 },
  innerExpressView: {
    flexDirection: 'row',
    padding: 4,
    paddingLeft: 8,
    paddingRight: 8,
    alignItems: 'center',
    width: '97%',
  },
  expressSlotIcon: { width: 35, height: 35, resizeMode: 'contain' },
  expressSlotText: { ...theme.viewStyles.text('SB', 14, colors.WHITE, 1, 18), marginLeft: 10 },
  locateMeTouch: {
    zIndex: 1,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center', marginTop: -5.5 },
  locateMeText: {
    ...theme.viewStyles.text('SB', 14, colors.APP_YELLOW, 1, 18),
  },
  toolTipTouch: {
    position: 'absolute',
    height: winHeight,
    width: winWidth,
  },
  nudgeMsgHeight: {
    // height: NON_CIRCLE_NUDGE_HEIGHT,
    flex: 1,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: colors.ORANGE_BG,
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
  },
  circleIcon: {
    height: isSmallDevice ? 16 : 19,
    width: isSmallDevice ? 27 : 35,
    resizeMode: 'contain',
    marginRight: 8,
    marginLeft: 20,
  },
  nudgeMsgView: { width: '80%', justifyContent: 'center' },
  nudgeMsgText: { ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1, 18) },
  certificateViewTitle: {
    color: colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 12 : 13),
    lineHeight: 18,
  },
  certificateViewImage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '4%',
  },
  certificateImageStyle: { height: isSmallDevice ? 30 : 36, width: isSmallDevice ? 65 : 70 },
  searchNewInput: {
    borderColor: '#e7e7e7',
    borderRadius: 5,
    borderWidth: 1,
    width: '92%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    padding: 10,
    marginVertical: 15,
    backgroundColor: colors.CARD_BG,
  },
  searchTextStyle: {
    ...theme.viewStyles.text('SB', 18, 'rgba(1,48,91, 0.3)'),
  },
  ordersTitleStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(16),
    paddingHorizontal: 0,
  },
  prescriptionUploadedView: { flexDirection: 'row', paddingHorizontal: 5 },
  greenCheckIcon: { width: 18, height: 18, resizeMode: 'contain' },
  itemAddedText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, colors.SHERPA_BLUE, 1, 19),
    textAlign: 'left',
  },
  viewDetailsTouch: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  viewDetailsText: {
    ...theme.viewStyles.text('M', 12, colors.APP_YELLOW, 1, 16),
  },
  viewDetailsUpIcon: {
    tintColor: colors.APP_YELLOW,
    height: 12,
    width: 12,
    resizeMode: 'contain',
    marginHorizontal: 5,
  },
  cartDetailViewShadow: {
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: theme.colors.SHADE_GREY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    borderColor: '#ddd',
  },
  goToCartView: { marginRight: 12, alignItems: 'flex-end' },
  cartSummaryOverlay: {
    position: 'absolute',
    left: 0,
    bottom: GO_TO_CART_HEIGHT,
    height: winHeight,
    backgroundColor: 'rgba(0,0,0, 0.8)',
    width: '100%',
  },
  cartSummaryContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: winHeight / 2.5,
    backgroundColor: colors.BGK_GRAY,
    width: '100%',
  },
  recommendationsText: {
    ...theme.viewStyles.text('R', 12, colors.LIGHT_BLUE, 1, 16),
    alignItems: 'center',
  },
});
