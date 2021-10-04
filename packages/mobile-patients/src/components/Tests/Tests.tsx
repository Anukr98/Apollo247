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
} from '@aph/mobile-patients/src/components/ui/Icons';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  GET_PATIENT_ADDRESS_LIST,
  GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
  SET_DEFAULT_ADDRESS,
  GET_DIAGNOSTIC_ORDERS_LIST_BY_MOBILE,
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
  removeWhiteSpaces,
  storagePermissions,
  getUserType,
  getCleverTapCircleMemberValues,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
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
  getDiagnosticClosedOrders,
  getDiagnosticExpressSlots,
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
import { getUniqueId } from 'react-native-device-info';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'rn-fetch-blob';
export const MAX_FILE_SIZE = 25000000; // ~25MB
import { DiagnosticLocation } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticLocation';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Cache } from 'react-native-cache';

import {
  getDiagnosticOrdersListByMobile,
  getDiagnosticOrdersListByMobileVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
// import { Cache } from "react-native-cache";
const rankArr = ['1', '2', '3', '4', '5', '6'];
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

  const movedFrom = props.navigation.getParam('movedFrom');
  const homeScreenAttributes = props.navigation.getParam('homeScreenAttributes');
  const phyPrescriptionUploaded = props.navigation.getParam('phyPrescriptionUploaded') || [];
  const ePresscriptionUploaded = props.navigation.getParam('ePresscriptionUploaded') || [];
  const { ePrescriptions, physicalPrescriptions } = useShoppingCart();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  const hdfc_values = string.Hdfc_values;
  const cartItemsCount = cartItems?.length + shopCartItems?.length;
  const [loading, setLoading] = useState<boolean>(false);

  const [bannerLoading, setBannerLoading] = useState(true);
  const [imgHeight, setImgHeight] = useState(200);
  const [slideIndex, setSlideIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [cityId, setCityId] = useState('');
  const [currentOffset, setCurrentOffset] = useState<number>(1);

  const [sectionLoading, setSectionLoading] = useState<boolean>(false);
  const [showItemCard, setShowItemCard] = useState<boolean>(false);
  const [bookUsSlideIndex, setBookUsSlideIndex] = useState(0);
  const [showbookingStepsModal, setShowBookingStepsModal] = useState(false);
  const [isPrescriptionUpload, setIsPrescriptionUpload] = useState<boolean>(false);
  const [isPrescriptionGallery, setIsPrescriptionGallery] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
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

  const [showLocationPopup, setLocationPopup] = useState<boolean>(false);
  const [source, setSource] = useState<DIAGNOSTIC_PINCODE_SOURCE_TYPE>();
  const [showUnserviceablePopup, setUnserviceablePopup] = useState<boolean>(false);
  const [serviceableObject, setServiceableObject] = useState({} as any);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [clickedItem, setClickedItem] = useState<any>([]);
  const [expressSlotMsg, setExpressSlotMsg] = useState<string>('');
  const [isPriceAvailable, setIsPriceAvailable] = useState<boolean>(false);
  const [fetchAddressLoading, setFetchAddressLoading] = useState<boolean>(false);

  const hasLocation = locationDetails || diagnosticLocation || pharmacyLocation || defaultAddress;

  const cache = new Cache({
    namespace: 'tests',
    policy: {
      maxEntries: 100,
    },
    backend: AsyncStorage,
  });

  useEffect(() => {
    if (!(bannerData && bannerData?.length)) {
      setBannerDataToCache();
    }
  }, [bannerData]);

  const getDataFromCache = async () => {
    const banner_data = await cache.get('banner_data');
    setBannerData && setBannerData(banner_data);
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

  const setWebEnageEventForPinCodeClicked = (
    mode: string,
    pincode: string,
    serviceable: boolean
  ) => {
    DiagnosticPinCodeClicked(
      currentPatient,
      mode,
      pincode,
      serviceable,
      isDiagnosticCircleSubscription
    );
  };

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number,
    source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
    section?: 'Featured tests' | 'Browse packages'
  ) => {
    DiagnosticAddToCartEvent(
      name,
      id,
      price,
      discountedPrice,
      source,
      section,
      currentPatient,
      isDiagnosticCircleSubscription
    );
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
      getDataFromCache();
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
    // getting diagnosticUserType from asyncStorage
    const fetchUserType = async () => {
      try {
        const diagnosticUserType = await AsyncStorage.getItem('diagnosticUserType');
        if (diagnosticUserType == null) {
          fetchOrders();
        }
      } catch (error) {
        fetchOrders();
      }
    };
    fetchUserType();
  }, []);

  useEffect(() => {
    // getting diagnosticUserType from asyncStorage
    const fetchUserType = async () => {
      try {
        const diagnosticUserType = await AsyncStorage.getItem('diagnosticUserType');
        if (diagnosticUserType == null) {
          fetchOrders();
        }
      } catch (error) {
        fetchOrders();
      }
    };
    fetchUserType();
  }, []);

  const fetchOrders = async () => {
    //for checking whether user is new or repeat.
    try {
      setLoading?.(true);
      client
        .query<getDiagnosticOrdersListByMobile, getDiagnosticOrdersListByMobileVariables>({
          query: GET_DIAGNOSTIC_ORDERS_LIST_BY_MOBILE,
          context: {
            sourceHeaders,
          },
          variables: {
            mobileNumber: currentPatient && currentPatient.mobileNumber,
            paginated: true,
            limit: 1, //decreased limit to 1 because we only need to check whether user had any single order or not
            offset: currentOffset,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const ordersList = data?.data?.getDiagnosticOrdersListByMobile?.ordersList || [];
          const diagnosticUserType =
            ordersList?.length > 0 ? string.user_type.REPEAT : string.user_type.NEW;
          AsyncStorage.setItem('diagnosticUserType', JSON.stringify(diagnosticUserType));
        })
        .catch((error) => {
          setLoading?.(false);
          CommonBugFender(`${AppRoutes.Tests}_fetchOrders`, error);
        });
    } catch (error) {
      setLoading?.(false);
      CommonBugFender(`${AppRoutes.Tests}_fetchOrders`, error);
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
    try {
      const result: any = await getDiagnosticHomePageWidgets('diagnostic', Number(cityId));
      if (result?.data?.success && result?.data?.data?.length > 0) {
        const sortWidgets = result?.data?.data?.sort(
          (a: any, b: any) =>
            Number(a.diagnosticwidgetsRankOrder) - Number(b.diagnosticwidgetsRankOrder)
        );
        setCityId(cityId);
        //call here the prices.
        setWidgetsData(sortWidgets);
        setIsPriceAvailable(false);
        setSectionLoading(false);
        setShowItemCard(true);
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

  const fetchWidgetsPrices = async (widgetsData: any, cityId: string) => {
    const filterWidgets = widgetsData?.filter(
      (item: any) => !!item?.diagnosticWidgetData && item?.diagnosticWidgetData?.length > 0
    );
    const itemIds = filterWidgets?.map((item: any) =>
      item?.diagnosticWidgetData?.map((data: any, index: number) => Number(data?.itemId))
    );
    const allItemIds = itemIds?.flat();
    //restriction less than 12.
    try {
      const res = await fetchPricesForCityId(
        Number(cityId!) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
        allItemIds
      );
      let newWidgetsData = [...filterWidgets];

      const priceResult = res?.data?.findDiagnosticsWidgetsPricing;
      if (!!priceResult && !!priceResult?.diagnostics && priceResult?.diagnostics?.length > 0) {
        const widgetPricingArr = priceResult?.diagnostics;

        for (let i = 0; i < filterWidgets?.length; i++) {
          for (let j = 0; j < filterWidgets?.[i]?.diagnosticWidgetData?.length; j++) {
            let wItem = filterWidgets?.[i]?.diagnosticWidgetData?.[j]; // j ka element
            const findIndex = widgetPricingArr?.findIndex(
              (pricingData) => Number(pricingData?.itemId) === Number(wItem?.itemId)
            );
            if (findIndex !== -1) {
              (newWidgetsData[i].diagnosticWidgetData[j].packageCalculatedMrp =
                widgetPricingArr?.[findIndex]?.packageCalculatedMrp),
                (newWidgetsData[i].diagnosticWidgetData[j].diagnosticPricing =
                  widgetPricingArr?.[findIndex]?.diagnosticPricing);
            }
          }
        }
      }
      newWidgetsData?.length > 0 && reloadWidget ? setReloadWidget(false) : setReloadWidget(true);

      setWidgetsData(newWidgetsData);
      setIsPriceAvailable(true);
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
      setFetchAddressLoading?.(false);
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
            !!source &&
              DiagnosticPinCodeClicked(
                currentPatient,
                pincode,
                true,
                source,
                isDiagnosticCircleSubscription
              );
          } else {
            //null in case of non-serviceable
            obj = getNonServiceableObject();
            setNonServiceableValues(obj, pincode);
          }
        } else {
          obj = getNonServiceableObject();
          setNonServiceableValues(obj, pincode);
        }
        getExpressSlots(obj, selectedAddress);
        getDiagnosticBanner(Number(obj?.cityId));
        getHomePageWidgets(obj?.cityId);
      } catch (error) {
        setPageLoading?.(false);
        CommonBugFender('fetchAddressServiceability_Tests', error);
        setLoadingContext?.(false);
        setReloadWidget(true);
        setSectionLoading(false);
        setBannerLoading(false);
      }
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
    setServiceableObject(obj);
    setDiagnosticServiceabilityData?.(obj);
    setPageLoading?.(false);
    setDiagnosticLocationServiceable?.(false);
    setUnserviceablePopup(true);
    setServiceabilityMsg(string.diagnostics.nonServiceableMsg1);
    !!source &&
      DiagnosticPinCodeClicked(
        currentPatient,
        pincode,
        false,
        source,
        isDiagnosticCircleSubscription
      );
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
            plan_id: data?.APOLLO?.[0]?.plan_id,
            source_identifier: data?.APOLLO?.[0]?.source_meta_data?.source_identifier,
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

  function _handleNavigationFromBanner(item: any, url: string) {
    //for rtpcr - drive through - open webview
    if (item?.redirectUrlText === 'WebView') {
      DiagnosticBannerClick(slideIndex + 1, Number(item?.itemId || item?.id), item?.bannerTitle);
      try {
        const openUrl = url || AppConfig.Configuration.RTPCR_Google_Form;
        props.navigation.navigate(AppRoutes.CovidScan, {
          covidUrl: openUrl,
        });
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
          resizeMode="stretch"
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
                style={showViewAll ? { paddingBottom: 1 } : {}}
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
          data={whyBookUsArray}
          renderItem={renderWhyBookUsSlider}
          sliderWidth={winWidth}
          itemWidth={winWidth}
          loop={true}
          autoplay={true}
          autoplayDelay={AUTO_SCROLL_INTERVAL}
          autoplayInterval={AUTO_SCROLL_INTERVAL}
        />
        <View style={[styles.landingBannerInnerView, { bottom: 35 }]}>
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
          ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 12 : 13),
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
          <Image
            source={img}
            style={{ height: isSmallDevice ? 30 : 36, width: isSmallDevice ? 65 : 70 }}
            resizeMode={'contain'}
          />
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
        props.navigation.navigate(AppRoutes.PrescriptionCamera, {
          type: 'CAMERA_AND_GALLERY',
          responseData: formatResponse([response] as ImageCropPickerResponse[]),
          ePresscriptionUploaded: ePresscriptionUploaded,
          phyPrescriptionUploaded: phyPrescriptionUploaded,
          title: 'Camera',
        });
      })
      .catch((e: Error) => {});
  };

  const openGallery = () => {
    setIsPrescriptionUpload(false);
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
          Alert.alert(strings.common.uhOh, `Invalid File Size. File size must be less than 25MB.`);
          return;
        }
        const uploadedImages = formatResponse(images);
        props.navigation.navigate(AppRoutes.SubmittedPrescription, {
          type: 'Gallery',
          phyPrescriptionsProp: [...phyPrescriptionUploaded, ...uploadedImages],
          ePrescriptionsProp: ePresscriptionUploaded,
          source: 'Tests',
        });
      })
      .catch((e: Error) => {
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
          strings.common.uhOh,
          !isValidPdf
            ? `Invalid File Type. File type must be PDF.`
            : `Invalid File Size. File size must be less than 25MB.`
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

  const renderUploadPrescriptionCard = () => {
    return (
      <View style={styles.precriptionContainer}>
        <View style={styles.precriptionContainerUpload}>
          <PrescriptionColored style={{ height: 35 }} />
          <Text style={styles.prescriptionText}>Place your order via prescription</Text>
          <Button
            title={'UPLOAD'}
            style={styles.buttonStyle}
            onPress={() => {
              setIsPrescriptionGallery(false);
              setIsPrescriptionUpload(true);
            }}
          />
        </View>
        {isUploaded ? (
          <View style={styles.bottomArea}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 5 }}>
              <GreenCheck style={{ width: 18, height: 18 }} />
              <Text style={styles.prescriptionTextUpload}>Prescription Uploaded</Text>
            </View>
            <Text style={styles.prescriptionTextUploadTime}>
              {moment().format('DD MMM, HH:mm')}
            </Text>
          </View>
        ) : null}
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
        selectedEprescriptionIds={ePresscriptionUploaded.map((item) => item.id)}
        isVisible={isSelectPrescriptionVisible}
        movedFrom={AppRoutes.Tests}
      />
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
          DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PRESCRIPTION,
          currentPatient,
          isDiagnosticCircleSubscription
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
      await downloadDiagnosticReport(
        setLoadingContext,
        removeWhiteSpaces(clickedItem?.labReportURL),
        appointmentDate,
        !!patientName ? patientName : '_',
        true,
        undefined,
        clickedItem?.orderStatus,
        (clickedItem?.displayId).toString(),
        true
      );
    } catch (error) {
      setLoadingContext?.(false);
      CommonBugFender('Tests_onPressOrderStatusOption_downloadLabTest', error);
    } finally {
      setLoadingContext?.(false);
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

  const renderSections = () => {
    const widget1 = getRanking('1');
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (diagnosticResults?.length == 0 && !searchText) return;
          setSearchText('');
          setDiagnosticResults([]);
        }}
        style={{ flex: 1 }}
      >
        {widgetsData?.length == 0 && reloadWidget && renderLowNetwork()}
        {renderWidgetItems(widget1)} {/**1 */}
        {renderYourOrders()}
        {latestPrescription?.length > 0 ? renderPrescriptionCard() : null}
        {renderUploadPrescriptionCard()}
        {renderOrderStatusCard()}
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
        {renderCarouselBanners()}
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
          cleverTapEventForHomeIconClick();
        }}
      >
        <HomeIcon style={styles.homeIconStyle} />
      </TouchableOpacity>
    );

    const cleverTapEventForHomeIconClick = () => {
      const eventAttributes = {
        'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}`,
        'Patient UHID': currentPatient?.uhid,
        Relation: currentPatient?.relation,
        'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
        'Patient gender': currentPatient?.gender,
        'Mobile Number': currentPatient?.mobileNumber,
        'Customer ID': currentPatient?.id,
        User_Type: getUserType(allCurrentPatients),
        'Nav src': 'Dignostic Page',
        'Circle Member':
          getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
          undefined,
        'Device Id': getUniqueId(),
      };
      postCleverTapEvent(CleverTapEventName.HOME_ICON_CLICKED, eventAttributes);
    };

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
      icon: <GalleryIcon />,
      title: 'Choose from Gallery',
    },
    {
      icon: <CameraIcon />,
      title: 'Take a Picture',
    },
    {
      icon: <PrescriptionIcon />,
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
        {prescriptionOptionArray.map((item) => {
          return (
            <TouchableOpacity
              onPress={() => {
                if (item.title == 'Choose from Gallery') {
                  setIsPrescriptionGallery(true);
                } else if (item.title == 'Take a Picture') {
                  setIsPrescriptionUpload(false);
                  onClickTakePhoto();
                } else {
                  setIsPrescriptionUpload(false);
                  setSelectPrescriptionVisible(true);
                }
              }}
              style={styles.areaStyles}
            >
              {item.icon}
              <Text style={styles.textPrescription}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}
      </>
    );
  };

  const renderGalleryOption = () => {
    return (
      <>
        <Text style={styles.textHeadingModal}>Choose from Gallery</Text>
        {prescriptionGalleryOptionArray.map((item) => {
          return (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignContent: 'center' }}
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
          );
        })}
      </>
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
              {expressSlotMsg != '' ? renderExpressSlots() : null}
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
                {!!cartItems && cartItems?.length > 0 ? <View style={{ height: 20 }} /> : null}
              </ScrollView>
              {!!cartItems && cartItems?.length > 0 ? renderCartDetails() : null}
            </View>
          </>
        )}
        {showLocationPopup && renderLocationSearch()}
        {showUnserviceablePopup && renderNonServiceableToolTip()}
      </SafeAreaView>
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
    // alignItems: 'center',
    flexDirection: 'column',
  },
  paitentModalView: {
    backgroundColor: 'white',
    width: '100%',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  precriptionContainer: {
    ...theme.viewStyles.cardViewStyle,
    ...theme.viewStyles.shadowStyle,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 24,
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
  textHeadingModal: {
    ...theme.viewStyles.text('B', 17, colors.SHERPA_BLUE),
    marginBottom: 20,
  },
  textPrescription: {
    ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE),
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  areaStyles: { flexDirection: 'row', alignContent: 'center' },
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
    width: '92%',
    backgroundColor: 'white',
    marginVertical: 16,
    marginLeft: 16,
    marginRight: 16,
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
  outerExpressView: { backgroundColor: colors.APP_GREEN, marginBottom: 2 },
  innerExpressView: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    width: '97%',
  },
  expressSlotIcon: { width: 37, height: 37, resizeMode: 'contain' },
  expressSlotText: { ...theme.viewStyles.text('SB', 14, colors.WHITE, 1, 18), marginLeft: 16 },
});
