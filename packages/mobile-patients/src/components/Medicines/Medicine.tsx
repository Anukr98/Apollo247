import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  bannerType,
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { CategoryAndSpecialOffers } from '@aph/mobile-patients/src/components/Medicines/CategoryAndSpecialOffers';
import { AccessLocation } from '@aph/mobile-patients/src/components/Medicines/Components/AccessLocation';
import { PincodeInput } from '@aph/mobile-patients/src/components/Medicines/Components/PicodeInput';
import {
  MedicineCategoryTree,
  Props as MedicineCategoryTreeProps,
} from '@aph/mobile-patients/src/components/Medicines/MedicineCategoryTree';
import { ProductPageViewedEventProps } from '@aph/mobile-patients/src/components/ProductDetailPage/ProductDetailPage';
import { MedicineSearchSuggestionItem } from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';
import { ProductCard } from '@aph/mobile-patients/src/components/Medicines/ProductCard';
import { ProductList } from '@aph/mobile-patients/src/components/Medicines/ProductList';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  Badge,
  SectionHeader,
  Spearator,
} from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { BuyAgainSection } from '@aph/mobile-patients/src/components/ui/BuyAgainSection';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import {
  ArrowRight,
  CartIcon,
  DropdownGreen,
  HomeIcon,
  LocationOff,
  MedicineIcon,
  OrangeCallIcon,
  PrescriptionPad,
  SearchSendIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { getBuyAgainSkuList } from '@aph/mobile-patients/src/components/MyOrders/YourOrdersScene';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_PATIENT_ADDRESS_LIST,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  MEDICINE_HOMEPAGE_API_CALLS,
  SET_DEFAULT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  Brand,
  callToExotelApi,
  DealsOfTheDaySection,
  getBrandPagesData,
  getMedicinePageProducts,
  getMedicineSearchSuggestionsApi,
  getNearByStoreDetailsApi,
  getPlaceInfoByPincode,
  medCartItemsDetailsApi,
  MedicinePageAPiResponse,
  MedicinePageSection,
  MedicineProduct,
  OfferBannerSection,
  SearchSuggestion,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { getUserBannersList } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  doRequestAndAccessLocationModified,
  g,
  getFormattedLocation,
  getMaxQtyForMedicineItem,
  isProductInStock,
  isValidSearch,
  postWebEngageEvent,
  productsThumbnailUrl,
  setWebEngageScreenNames,
  postCleverTapEvent,
  getUserType,
  getAvailabilityForSearchSuccess,
  addPharmaItemToCart,
  getDiscountPercentage,
  getAge,
  formatToCartItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { postMyOrdersClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { USER_AGENT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import {
  ProductPageViewedSource,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import Axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  FlatList,
  Image as ImageNative,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import ContentLoader from 'react-native-easy-content-loader';
import { Divider, ListItem } from 'react-native-elements';
import Carousel from 'react-native-snap-carousel';
import { NavigationScreenProps, NavigationEvents } from 'react-navigation';
const { width: winWidth, height: winHeight } = Dimensions.get('window');
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';

import {
  renderMedicineBannerShimmer,
  renderMedicinesShimmer,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import AsyncStorage from '@react-native-community/async-storage';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { MedicineSearchEvents } from '@aph/mobile-patients/src/components/MedicineSearch/MedicineSearchEvents';
import { Cache } from 'react-native-cache';
import { SuggestedQuantityNudge } from '@aph/mobile-patients/src/components/SuggestedQuantityNudge/SuggestedQuantityNudge';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { CircleBottomContainer } from '@aph/mobile-patients/src/components/Medicines/Components/CircleBottomContainer';
import { WhatsappRedirectionStickyNote } from '@aph/mobile-patients/src/components/Medicines/Components/WhatsappRedirectionStickyNote';
import { WhatsappRedirectionBanner } from '@aph/mobile-patients/src/components/Medicines/Components/WhatsappRedirectionBanner';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { UpdateAppPopup } from '@aph/mobile-patients/src/components/ui/UpdateAppPopup';
import {
  bannerClickEvent,
  calltheNearestPharmacyEvent,
  CleverTapDeliveryPincodeEntered,
  CleverTapEventAutoDetectLocation,
  cleverTapEventForHomeIconClick,
  pharmacyScrollScreenEvent,
  postwebEngageCategoryClickedEvent,
  searchSuccessEvent,
  searchSuggestionEvent,
  uploadPrescriptionClickedEvent,
  webEngageDeliveryPincodeEntered,
  WebEngageEventAutoDetectLocation,
} from '@aph/mobile-patients/src/components/Medicines/Events';
import { BannerDisplayType, UserState } from '@aph/mobile-patients/src/graphql/types/globalTypes';

const styles = StyleSheet.create({
  scrollViewStyle: {
    marginBottom: 35,
  },
  buyAgain: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 0.75,
  },
  buyAgainLoader: {
    marginVertical: 10,
  },
  searchInput: { minHeight: undefined, paddingVertical: 8 },
  searchInputContainer: { marginTop: 5, marginBottom: 0 },
  sliderDotStyle: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 9,
  },
  sliderPlaceHolderStyle: {
    ...theme.viewStyles.imagePlaceholderStyle,
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  categoryAndSpecialOffers: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  categoryTreeWrapper: {
    ...StyleSheet.absoluteFill,
    marginTop: -20,
    flexDirection: 'row',
  },
  categoryTreeContainer: {
    height: '100%',
    width: '75%',
  },
  categoryTreeDismissView: {
    height: '100%',
    width: winWidth,
    backgroundColor: 'rgba(0,0,0,0.31)',
  },
  searchContainer: {
    paddingVertical: 10,
    paddingHorizontal: 60,
    backgroundColor: '#f7f8f5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  viewAllContainer: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FCB716',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  searchResults: {
    maxHeight: 266,
    backgroundColor: '#f7f8f5',
  },
});

const filterBanners = (banners: OfferBannerSection[]) => {
  return banners
    .filter((banner) => Number(banner.status))
    .filter(
      (banner) =>
        moment() >= moment(banner.start_time, 'YYYY-MM-DD hh:mm:ss') &&
        moment() <= moment(banner.end_time, 'YYYY-MM-DD hh:mm:ss')
    );
};

export interface MedicineProps
  extends NavigationScreenProps<{
    focusSearch?: boolean;
    showUploadPrescriptionPopup?: boolean; // using for deeplink
    showRecommendedSection?: boolean; // using for deeplink
    comingFrom?: string;
  }> {}

type Address = savePatientAddress_savePatientAddress_patientAddress;

export const Medicine: React.FC<MedicineProps> = (props) => {
  const { checkIsAppDepricated } = useAuth();
  const focusSearch = props.navigation.getParam('focusSearch');
  const showRecommendedSection = props.navigation.getParam('showRecommendedSection');
  const comingFrom = props.navigation.getParam('comingFrom');
  const {
    locationDetails,
    pharmacyLocation,
    setPharmacyLocationServiceable,
    medicinePageAPiResponse,
    setMedicinePageAPiResponse,
    axdcCode,
    setBannerData,
    bannerData,
    pharmacyUserType,
    setIsRenew,
  } = useAppCommonData();
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const {
    serverCartItems,
    addresses,
    setAddresses,
    setCircleMembershipCharges,
    setCircleSubPlanId,
    setCircleSubscriptionId,
    setIsCircleSubscription,
    setHdfcSubscriptionId,
    setHdfcPlanName,
    setIsFreeDelivery,
    setCirclePlanValidity,
    pharmacyCircleAttributes,
    setIsCircleExpired,
    setMedicineHomeBannerData,
    setMedicineHotSellersData,
    isPharmacyPincodeServiceable,
    cartAddressId,
    serverCartLoading,
    serverCartErrorMessage,
    setServerCartErrorMessage,
    serverCartMessage,
    setServerCartMessage,
    cartPrescriptions,
    cartLocationDetails,
    newAddressAdded,
    setNewAddressAdded,
    setAddToCartSource,
    cartCircleSubscriptionId,
    locationCode,
    setServerCartItems,
  } = useShoppingCart();
  const {
    setUserActionPayload,
    fetchServerCart,
    uploadEPrescriptionsToServerCart,
  } = useServerCart();
  const {
    cartItems: diagnosticCartItems,
    setIsDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const hdfc_values = string.Hdfc_values;
  const cartItemsCount = serverCartItems?.length + diagnosticCartItems?.length;
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [allBrandData, setAllBrandData] = useState<Brand[]>([]);
  const [serviceabilityMsg, setServiceabilityMsg] = useState('');
  const { showAphAlert, hideAphAlert, setLoading: globalLoading } = useUIElements();
  const [buyAgainSkuList, setBuyAgainSkuList] = useState<string[]>([]);
  const [buyAgainProducts, setBuyAgainProducts] = useState<MedicineProduct[]>([]);
  const [buyAgainLoading, setBuyAgainLoading] = useState<boolean>(true);
  const [showCirclePopup, setShowCirclePopup] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [searchItemLoading, setSearchItemLoading] = useState<{ [key: string]: boolean }>({});
  const [searchItemAdded, setSearchItemAdded] = useState<string>('');

  const [recommendedProducts, setRecommendedProducts] = useState<MedicineProduct[]>([]);
  const [data, setData] = useState<MedicinePageAPiResponse | null>(medicinePageAPiResponse);
  const [categoryTreeVisible, setCategoryTreeVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(!medicinePageAPiResponse);
  const [error, setError] = useState<boolean>(false);
  const banners = data ? filterBanners(g(data, 'mainbanners') || []) : [];
  const IMG_HEIGHT_DEFAULT = 175;
  const [imgHeight, setImgHeight] = useState(IMG_HEIGHT_DEFAULT);
  const defaultAddress = addresses.find((item) => item?.id == cartAddressId);
  const hasLocation = !!cartLocationDetails?.pincode || !!defaultAddress;
  const pharmacyPincode = cartLocationDetails?.pincode || defaultAddress?.zipcode;
  const [showWhatsappRedirectionIcon, setShowWhatsappRedirectionIcon] = useState<boolean>(true);
  const [depricatedAppData, setDepricatedAppData] = useState<any>(null);
  const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);
  const windowHeight = Dimensions.get('window').height;
  const scrollCount = useRef<number>(0);

  type addressListType = savePatientAddress_savePatientAddress_patientAddress[];
  const [fetchAddressLoading, setFetchAddressLoading] = useState<boolean>(false);
  const [testBannerImageList, setTestBannerImageList] = useState([]);
  const [showProxyBannerContainer, setShowProxyBannerContainer] = useState(true);
  const [userAgent, setUserAgent] = useState('');

  setTimeout(function() {
    setShowProxyBannerContainer(false);
  }, 3000);

  const cache = new Cache({
    namespace: 'medicine',
    policy: {
      maxEntries: 100,
    },
    backend: AsyncStorage,
  });

  const [showSuggestedQuantityNudge, setShowSuggestedQuantityNudge] = useState<boolean>(false);
  const [shownNudgeOnce, setShownNudgeOnce] = useState<boolean>(false);
  const [currentProductIdInCart, setCurrentProductIdInCart] = useState<string>('');
  const [currentProductQuantityInCart, setCurrentProductQuantityInCart] = useState<number>(0);
  const [itemPackForm, setItemPackForm] = useState<string>('');
  const [maxOrderQty, setMaxOrderQty] = useState<number>(0);
  const [suggestedQuantity, setSuggestedQuantity] = useState<string>('');

  useEffect(() => {
    populateCachedData();
    fetchServerCart();
    fetchMedicinePageProducts(false);
    setBannerData && setBannerData([]);
    getAllResponses();
    fetchBuyAgainProducts();
    setWebEngageScreenNames('Medicine Home Page');
    checkIsAppDepricated(currentPatient?.mobileNumber)
      .then(setDepricatedAppData)
      .catch((error) => {
        !!error && CommonBugFender('isAppVersionDeprecated_Medicine', error);
      });
    if (comingFrom === 'deeplink') {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBack);
      };
    }
  }, []);

  const getAllResponses = async () => {
    try {
      const query = {
        patientUhid: currentPatient?.uhid,
        mobile_number: currentPatient?.mobileNumber,
        banner_context: string.banner_context.PHARMACY_HOME,
        user_state: UserState.LOGGED_IN,
        banner_display_type: [BannerDisplayType.banner],
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<any>({
        query: MEDICINE_HOMEPAGE_API_CALLS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const recommendedProducts = res?.data?.getRecommendedProductsList?.recommendedProducts;
      if (recommendedProducts?.length) setRecommendedProductValues(recommendedProducts);
      const groupBanners = res?.data?.GetAllGroupBannersOfUser?.response;
      if (groupBanners?.length) setBannerDataValues(groupBanners);
      const subscriptionDetails = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      setUserSubscriptionsByStatus(subscriptionDetails);
    } catch (error) {}
  };

  useEffect(() => {
    if (serverCartErrorMessage || serverCartMessage) {
      hideAphAlert?.();
      showAphAlert!({
        unDismissable: true,
        title: 'Hey',
        description: serverCartErrorMessage || serverCartMessage,
        titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
        ctaContainerStyle: { justifyContent: 'flex-end' },
        CTAs: [
          {
            text: 'OKAY',
            type: 'orange-link',
            onPress: () => {
              setServerCartErrorMessage?.('');
              setServerCartMessage?.('');
              hideAphAlert?.();
            },
          },
        ],
      });
    }
  }, [serverCartErrorMessage, serverCartMessage]);

  useEffect(() => {
    const addressLength = addresses?.length;
    if (addressLength && !!newAddressAdded) {
      setUserActionPayload?.({
        patientAddressId: newAddressAdded,
      });
      fetchAddress();
      setNewAddressAdded && setNewAddressAdded('');
    }
  }, [newAddressAdded]);

  const populateCachedData = () => {
    if (!data) {
      setPageLoading(true);

      cache.get('fetch_medicine_page_products').then((obtainedData: any) => {
        if (obtainedData) {
          setData(obtainedData);
        }
        setPageLoading(false);
      });
    }

    setBuyAgainLoading(true);
    cache.get('fetch_medicine_buy_again_products').then((obtainedProducts: any) => {
      if (obtainedProducts) {
        setBuyAgainProducts(obtainedProducts);
      }
      setBuyAgainLoading(false);
    });

    cache.get('banner_height').then((banner_height: any) => {
      if (!banner_height) {
        // not available in local cache
        findMinimumBannerHeight(true);
      } else {
        setImgHeight(banner_height);
        findMinimumBannerHeight(false);
      }
    });

    cache.get('recomended_product').then((recomendedProducts: any) => {
      if (recomendedProducts) {
        setRecommendedProducts(recommendedProducts);
      }
    });

    AsyncStorage.getItem(USER_AGENT).then((userAgent) => {
      setUserAgent(userAgent || '');
    });
  };

  const handleBack = () => {
    navigateToHome(props.navigation, {}, comingFrom === 'deeplink');
    return true;
  };

  useEffect(() => {
    setServiceabilityMsg(
      isPharmacyPincodeServiceable ? '' : 'Services unavailable. Change delivery location.'
    );
    setPharmacyLocationServiceable!(!!isPharmacyPincodeServiceable);
    if (!isPharmacyPincodeServiceable && pharmacyPincode) callNearbyStoreApi();
  }, [isPharmacyPincodeServiceable]);

  const callNearbyStoreApi = () => {
    const styles = StyleSheet.create({
      callCta: {
        backgroundColor: '#fc9916',
        borderRadius: 5,
        height: 38,
        marginBottom: 5,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        paddingLeft: 12,
      },
      addressCta: {
        backgroundColor: '#fc9916',
        borderRadius: 5,
        height: 38,
        marginBottom: 5,
        justifyContent: 'flex-start',
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        paddingLeft: 12,
      },
    });
    getNearByStoreDetailsApi(pharmacyPincode)
      .then((response: any) => {
        showAphAlert!({
          title: 'We’ve got you covered !!',
          description: 'We are servicing your area through the nearest Pharmacy, Call to Order!',
          titleStyle: theme.viewStyles.text('SB', 18, '#01475b'),
          ctaContainerStyle: { flexDirection: 'column' },
          unDismissable: true,
          children: (
            <View style={{ marginBottom: 15, marginTop: 12, marginHorizontal: 20 }}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.callCta}
                onPress={() =>
                  onPressCallNearestPharmacy(
                    response.data && response.data.phoneNumber ? response.data.phoneNumber : ''
                  )
                }
              >
                <OrangeCallIcon style={{ width: 24, height: 24, marginRight: 8 }} />
                <Text style={{ ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24, 0) }}>
                  {'CALL THE NEAREST PHARMACY'}
                </Text>
              </TouchableOpacity>
              <Button
                title={'CHANGE THE ADDRESS'}
                style={styles.addressCta}
                titleTextStyle={{ ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24, 0) }}
                onPress={() => showAccessAccessLocationPopup(addresses, false)}
              />
            </View>
          ),
        });
      })
      .catch((error) => {
        showAphAlert!({
          unDismissable: isunDismissable(),
          title: 'We’re sorry!',
          description:
            'We are not serviceable in your area. Please change your location or call 1860 500 0101 for Pharmacy stores nearby.',
          titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
          ctaContainerStyle: { justifyContent: 'flex-end' },
          CTAs: [
            {
              text: 'CHANGE THE ADDRESS',
              type: 'orange-link',
              onPress: () => showAccessAccessLocationPopup(addresses),
            },
          ],
        });
      });
  };

  const onPressCallNearestPharmacy = (pharmacyPhoneNumber: string) => {
    let from = currentPatient.mobileNumber;
    let to = pharmacyPhoneNumber;
    let caller_id = AppConfig.Configuration.EXOTEL_CALLER_ID;
    const param = {
      fromPhone: from,
      toPhone: to,
      callerId: caller_id,
    };
    calltheNearestPharmacyEvent(pharmacyPincode || '', currentPatient);
    globalLoading!(true);
    setPageLoading!(true);

    callToExotelApi(param)
      .then((response) => {})
      .catch((error) => {
        showAphAlert!({
          title: string.common.uhOh,
          description: 'We could not connect to the pharmacy now. Please try later.',
        });
      })
      .finally(() => {
        hideAphAlert!();
        globalLoading!(false);
        setPageLoading!(false);
      });
  };

  const updateServiceability = (
    pincode: string,
    type?: 'autoDetect' | 'pincode' | 'addressSelect'
  ) => {
    type == 'autoDetect' &&
      WebEngageEventAutoDetectLocation(pincode, !!isPharmacyPincodeServiceable, currentPatient);
    type == 'autoDetect' &&
      CleverTapEventAutoDetectLocation(pincode, !!isPharmacyPincodeServiceable, currentPatient);
    type == 'pincode' &&
      webEngageDeliveryPincodeEntered(pincode, !!isPharmacyPincodeServiceable, currentPatient);
    type == 'pincode' &&
      CleverTapDeliveryPincodeEntered(pincode, !!isPharmacyPincodeServiceable, currentPatient);
  };

  const handleUpdatePlaceInfoByPincodeError = (e: Error) => {
    CommonBugFender('AddAddress_updateCityStateByPincode', e);
    setError(true);
  };

  useEffect(() => {
    if (pharmacyPincode) {
      updateServiceability(pharmacyPincode);
    }
  }, [pharmacyPincode]);

  useEffect(() => {
    if (axdcCode) {
      fetchMedicinePageProducts(true);
    }
  }, [axdcCode]);

  const getUserBanners = async () => {
    try {
      const res: any = await getUserBannersList(
        client,
        currentPatient,
        string.banner_context.PHARMACY_HOME
      );
      if (res) {
        setBannerData && setBannerData(res);
      }
    } catch (error) {
      setBannerData && setBannerData([]);
    }
  };

  const setBannerDataValues = (groupBanners: any[]) => {
    try {
      const banners: bannerType[] = [];
      groupBanners.forEach((value) => {
        const { _id, is_active, banner, cta_action, meta } = value;
        banners.push({
          _id,
          is_active: !!is_active,
          banner,
          cta_action,
          meta,
          ...value,
        });
      });
      setBannerData?.(banners);
    } catch (e) {}
  };

  const renderCarouselBanners = () => {
    const showBanner = bannerData && bannerData?.length > 0;
    if (showBanner) {
      return (
        <CarouselBanners
          navigation={props.navigation}
          planActivationCallback={() => {
            getUserBanners();
            getUserSubscriptionsByStatus();
          }}
          from={string.banner_context.PHARMACY_HOME}
          source={'Pharma'}
          circleEventSource={'Medicine Home page banners'}
        />
      );
    }
  };

  const formatAddressToLocation = (address: Address): LocationData => ({
    displayName: address.city!,
    latitude: address.latitude!,
    longitude: address.longitude!,
    area: '',
    city: address.city!,
    state: address.state!,
    stateCode: address.stateCode!,
    country: '',
    pincode: address.zipcode!,
    lastUpdated: new Date().getTime(),
  });

  async function fetchAddress() {
    try {
      if (addresses?.length) {
        const deliveryAddress = addresses.find((item) => item?.id == cartAddressId);
        if (deliveryAddress) {
          updateServiceability(deliveryAddress?.zipcode!);
          const formattedLocation = formatAddressToLocation(deliveryAddress);
          setUserActionPayload?.({
            patientAddressId: deliveryAddress?.id,
            zipcode: formattedLocation?.pincode,
            latitude: formattedLocation?.latitude,
            longitude: formattedLocation?.longitude,
          });
          return;
        }
      }
      setFetchAddressLoading!(true);
      const response = await client.query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: currentPatient?.id },
        fetchPolicy: 'no-cache',
      });

      const addressList = (response.data.getPatientAddressList.addressList as Address[]) || [];
      setAddresses!(addressList);
      const deliveryAddress = addressList.find((item) => item?.id == cartAddressId);
      if (deliveryAddress) {
        updateServiceability(deliveryAddress?.zipcode!);
        const formattedLocation = formatAddressToLocation(deliveryAddress);
        setUserActionPayload?.({
          patientAddressId: deliveryAddress?.id,
          zipcode: formattedLocation?.pincode,
          latitude: formattedLocation?.latitude,
          longitude: formattedLocation?.longitude,
        });
      } else {
        checkLocation(addressList);
      }
      setFetchAddressLoading!(false);
    } catch (error) {
      checkLocation(addresses);
      setFetchAddressLoading!(false);
      CommonBugFender('fetching_Addresses_on_Medicine_Page', error);
    }
  }

  async function setDefaultAddress(address: Address) {
    globalLoading!(true);

    try {
      hideAphAlert!();
      const response = await client.query<makeAdressAsDefault, makeAdressAsDefaultVariables>({
        query: SET_DEFAULT_ADDRESS,
        variables: { patientAddressId: address?.id },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      const patientAddress = data?.makeAdressAsDefault?.patientAddress;
      const updatedAddresses = addresses.map((item) => ({
        ...item,
        defaultAddress: patientAddress?.id == item?.id ? patientAddress?.defaultAddress : false,
      }));
      setAddresses!(updatedAddresses);
      const deliveryAddress = updatedAddresses.find(({ id }) => patientAddress?.id == id);
      setUserActionPayload?.({
        patientAddressId: deliveryAddress?.id,
        zipcode: deliveryAddress?.zipcode,
        latitude: deliveryAddress?.latitude,
        longitude: deliveryAddress?.longitude,
      });
      globalLoading!(false);
    } catch (error) {
      checkLocation(addresses);
      CommonBugFender('set_default_Address_on_Medicine_Page', error);
      globalLoading!(false);
    }
  }

  const checkLocation = (addresses: addressListType) => {
    !defaultAddress &&
      !locationDetails &&
      !pharmacyLocation &&
      showAccessAccessLocationPopup(addresses, false);
  };

  function isunDismissable() {
    return !defaultAddress && !locationDetails && !pharmacyLocation ? true : false;
  }
  const showAccessAccessLocationPopup = (addressList: addressListType, pincodeInput?: boolean) => {
    return showAphAlert!({
      unDismissable: false,
      removeTopIcon: true,
      children: !pincodeInput ? (
        <AccessLocation
          addresses={addressList}
          onPressSelectAddress={(address) => {
            setDefaultAddress(address);
            setUserActionPayload?.({
              patientAddressId: address?.id,
              zipcode: address?.zipcode,
              latitude: address?.latitude,
              longitude: address?.longitude,
            });
          }}
          isAddressLoading={fetchAddressLoading}
          onPressEditAddress={(address) => {
            props.navigation.push(AppRoutes.AddAddressNew, {
              KeyName: 'Update',
              addressDetails: address,
              source: 'Medicine' as AddressSource,
              ComingFrom: AppRoutes.Medicine,
            });
            hideAphAlert!();
          }}
          onPressAddAddress={() => {
            props.navigation.navigate(AppRoutes.AddAddressNew, {
              source: 'Medicine' as AddressSource,
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
            showAccessAccessLocationPopup(addressList, true);
          }}
          source={'pharmacy'}
          selectedCartAddress={cartAddressId}
        />
      ) : (
        <PincodeInput
          onPressApply={(pincode) => {
            if (pincode?.length == 6) {
              hideAphAlert!();
              updatePlaceInfoByPincode(pincode);
            }
          }}
          onPressBack={() => showAccessAccessLocationPopup(addressList, false)}
        />
      ),
    });
  };

  const findMinimumBannerHeight = (showLoader: boolean) => {
    if (banners?.length) {
      let imageUrl = productsThumbnailUrl(g(banners, '0' as any, 'image')!);

      ImageNative.getSize(
        imageUrl,
        (width, height) => {
          let bannerHeight = height * (winWidth / width);
          setImgHeight(Math.floor(bannerHeight));
          cache.set('banner_height', bannerHeight);
        },
        () => {}
      );
    }
  };

  const getImageUrl = (fileIds: string) => {
    return fileIds
      .split(',')
      .filter((v) => v)
      .map((v) => `/catalog/product${v}`)[0];
  };

  const fetchMedicinePageProducts = async (callApiAgain?: boolean) => {
    if (medicinePageAPiResponse && !callApiAgain) {
      return;
    }
    try {
      setLoading(true);

      const resonse = (await getMedicinePageProducts(axdcCode, pharmacyPincode)).data;
      setData(resonse);
      if (setMedicineHomeBannerData) {
        setMedicineHomeBannerData(resonse?.mainbanners);
      }
      if (setMedicineHotSellersData) {
        setMedicineHotSellersData(resonse?.hot_sellers);
      }
      setMedicinePageAPiResponse!(resonse);
      cacheCachableResponse(resonse);

      setLoading(false);
      setPageLoading(false);
    } catch (e) {
      setError(!!e);
      setLoading(false);
      setPageLoading(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: "We're sorry! Unable to fetch products right now, please try later.",
      });
      CommonBugFender(`${AppRoutes.Medicine}_fetchMedicinePageProducts`, e);
    }
  };

  const cacheCachableResponse = (resonse: any) => {
    //To cache categories, shop_by-brand, shop_by_category, shop_by_health_conditions, mainbanners
    //Removing rest all other items
    let responseCopy = { ...resonse };
    delete responseCopy['explore_popular_products'];
    delete responseCopy['hot_sellers'];
    delete responseCopy['mainbanners_desktop'];
    delete responseCopy['monsoon_must_haves'];
    delete responseCopy['post_covid_essentials'];
    delete responseCopy['seasonal_must_haves'];
    delete responseCopy['skin_care'];
    delete responseCopy['half_price_store'];

    cache.set('fetch_medicine_page_products', responseCopy);
  };

  const setRecommendedProductValues = (_recommendedProducts: any[]) => {
    try {
      const formattedRecommendedProducts = _recommendedProducts
        .filter((item) => (item?.status || '').toLowerCase() == 'enabled')
        .map(
          (item) =>
            ({
              image: item?.productImage ? getImageUrl(item?.productImage) : null,
              is_in_stock: 1,
              is_prescription_required: item?.isPrescriptionNeeded,
              name: item?.productName,
              price: Number(item?.productPrice),
              special_price:
                item?.productSpecialPrice == item?.productPrice ? '' : item?.productSpecialPrice,
              sku: item?.productSku,
              type_id:
                (item?.categoryName || '').toLowerCase().indexOf('pharma') > -1
                  ? 'PHARMA'
                  : (item?.categoryName || '').toLowerCase().indexOf('fmcg') > -1
                  ? 'FMCG'
                  : 'PL',
              mou: item?.mou,
              sell_online: 1,
              url_key: item?.urlKey,
            } as MedicineProduct)
        );
      if (formattedRecommendedProducts?.length >= 5) {
        setRecommendedProducts(formattedRecommendedProducts?.slice(0, 9));

        cache.set('recomended_product', formattedRecommendedProducts);

        showRecommendedSection &&
          props.navigation.navigate(AppRoutes.MedicineListing, {
            category_id: undefined,
            products: formattedRecommendedProducts,
            title: string.medicine.recommendedForYou,
            movedFrom: 'home',
          });
      }
    } catch (e) {
      CommonBugFender(`${AppRoutes.Medicine}_fetchRecommendedProducts`, e);
    }
  };

  const fetchBuyAgainProducts = async () => {
    try {
      const skuArray = await getBuyAgainSkuList(client, currentPatient?.id);
      setBuyAgainSkuList(skuArray);
      if (skuArray?.length) {
        const productsResponse = await medCartItemsDetailsApi(skuArray.slice(0, 2));
        const products =
          productsResponse?.data?.productdp?.filter(({ sku, id }) => sku && id) || [];
        setBuyAgainProducts(products);
        setBuyAgainLoading(false);
        cache.set('fetch_medicine_buy_again_products', products);
      }
    } catch (e) {
      setBuyAgainLoading(false);
      CommonBugFender(`${AppRoutes.Medicine}_fetchBuyAgainProducts`, e);
    }
  };

  // Common Views

  const autoDetectLocation = (addresses: addressListType) => {
    globalLoading!(true);
    doRequestAndAccessLocationModified()
      .then((response) => {
        globalLoading!(false);
        if (response) {
          setUserActionPayload?.({
            zipcode: response?.pincode,
            latitude: response?.latitude,
            longitude: response?.longitude,
          });
        }
        updateServiceability(response.pincode, 'autoDetect');
      })
      .catch((e) => {
        globalLoading!(false);
        checkLocation(addresses);
        CommonBugFender('Medicine__ALLOW_AUTO_DETECT', e);
        e &&
          typeof e == 'string' &&
          !e.includes('denied') &&
          showAphAlert!({
            title: string.common.uhOh,
            description: e,
          });
      });
  };

  const updatePlaceInfoByPincode = (pincode: string) => {
    globalLoading!(true);
    getPlaceInfoByPincode(pincode)
      .then(({ data }) => {
        try {
          if (data?.results?.length) {
            const addrComponents = data.results[0].address_components || [];
            const latLang = data.results[0].geometry.location || {};
            const response = getFormattedLocation(addrComponents, latLang, pincode);
            setUserActionPayload?.({
              zipcode: pincode,
              latitude: latLang?.lat,
              longitude: latLang?.lng,
            });
            updateServiceability(pincode, 'pincode');
            globalLoading!(false);
          } else {
            globalLoading!(false);
            showAphAlert!({
              unDismissable: isunDismissable(),
              title: string.common.uhOh,
              description: 'Services unavailable. Change delivery location.',
              CTAs: [
                {
                  text: 'CHANGE PINCODE',
                  type: 'orange-link',
                  onPress: () => showAccessAccessLocationPopup(addresses, true),
                },
              ],
            });
          }
        } catch (e) {
          globalLoading!(false);
          handleUpdatePlaceInfoByPincodeError(e);
        }
      })
      .catch(handleUpdatePlaceInfoByPincodeError)
      .finally(() => globalLoading!(false));
  };

  const renderTopView = () => {
    const localStyles = StyleSheet.create({
      headerContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: serviceabilityMsg ? 0 : 10,
        backgroundColor: '#fff',
      },
      deliverToText: { ...theme.viewStyles.text('R', 11, '#01475b', 1, 16) },
      locationText: { ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) },
      locationTextUnderline: {
        height: 2,
        backgroundColor: '#00b38e',
        opacity: 1,
      },
      dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },
      serviceabilityMsg: { ...theme.viewStyles.text('R', 10, '#890000') },
    });

    const renderIcon = () => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigateToHome(props.navigation);
          cleverTapEventForHomeIconClick(
            currentPatient,
            getUserType(allCurrentPatients),
            cartCircleSubscriptionId
          );
        }}
      >
        <HomeIcon style={{ height: 33, width: 33 }} />
      </TouchableOpacity>
    );

    const renderDeliverToLocationMenuAndCTA = () => {
      const options = ['Auto Select Location', 'Enter Delivery Pincode'].map((item) => ({
        key: item,
        value: item,
      }));

      return <View>{renderDeliverToLocationCTA()}</View>;
    };

    const formatText = (text: string, count: number) =>
      text.length > count ? `${text.slice(0, count)}...` : text;

    const renderDeliverToLocationCTA = () => {
      const deliveryAddress = addresses.find((item) => item?.id == cartAddressId);
      const location = deliveryAddress?.zipcode
        ? `${formatText(deliveryAddress?.city || deliveryAddress?.state || '', 18)} ${
            deliveryAddress?.zipcode
          }`
        : cartLocationDetails?.pincode
        ? `${formatText(cartLocationDetails?.city || cartLocationDetails?.state || '', 18)} ${
            cartLocationDetails?.pincode
          }`
        : '';
      return (
        <View style={{ paddingLeft: 15, marginTop: 3.5 }}>
          {hasLocation ? (
            <TouchableOpacity
              style={{ marginTop: -7.5 }}
              onPress={() => {
                showAccessAccessLocationPopup(addresses, false);
              }}
            >
              <Text numberOfLines={1} style={localStyles.deliverToText}>
                Deliver to {formatText(currentPatient?.firstName || '', 30)}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <View>
                  <Text style={localStyles.locationText}>{location}</Text>
                  {!serviceabilityMsg ? (
                    <Spearator style={localStyles.locationTextUnderline} />
                  ) : (
                    <View style={{ height: 2 }} />
                  )}
                </View>
                <View style={localStyles.dropdownGreenContainer}>
                  <DropdownGreen />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                showAccessAccessLocationPopup(addresses, false);
              }}
            >
              <LocationOff />
            </TouchableOpacity>
          )}
          {!!serviceabilityMsg && (
            <Text style={localStyles.serviceabilityMsg}>{serviceabilityMsg}</Text>
          )}
        </View>
      );
    };

    const renderCartIcon = () => (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ alignItems: 'flex-end' }}
          activeOpacity={1}
          onPress={() =>
            props.navigation.navigate(
              diagnosticCartItems?.length ? AppRoutes.MedAndTestCart : AppRoutes.ServerCart
            )
          }
        >
          <CartIcon />
          {cartItemsCount > 0 && <Badge label={cartItemsCount} />}
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={localStyles.headerContainer}>
        {renderIcon()}
        {renderDeliverToLocationMenuAndCTA()}
        {renderCartIcon()}
      </View>
    );
  };

  const renderEPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres?.length == 0) {
            return;
          }
          uploadEPrescriptionsToServerCart(selectedEPres);
          props.navigation.navigate(AppRoutes.UploadPrescription, {
            ePrescriptionsProp: selectedEPres,
            type: 'E-Prescription',
          });
        }}
        selectedEprescriptionIds={[]}
        isVisible={isSelectPrescriptionVisible}
      />
    );
  };

  const renderSliderItem = ({ item, index }: { item: OfferBannerSection; index: number }) => {
    const handleOnPress = () => {
      bannerClickEvent(slideIndex, item);
      if (item?.category_id) {
        props.navigation.navigate(AppRoutes.MedicineListing, {
          category_id: item?.category_id,
          title: item?.name || 'Products',
        });
      } else if (item?.sku) {
        props.navigation.navigate(AppRoutes.ProductDetailPage, {
          sku: item?.sku,
          movedFrom: ProductPageViewedSource.BANNER,
        });
      }
    };

    let imageUrl = productsThumbnailUrl(item?.image) + '?imwidth=' + Math.floor(winWidth);

    return (
      <TouchableOpacity activeOpacity={1} onPress={handleOnPress}>
        <ImageNative
          resizeMode="stretch"
          style={{ width: '100%', minHeight: imgHeight }}
          source={{
            uri: imageUrl,
            headers: {
              'User-Agent': userAgent,
            },
          }}
          progressiveRenderingEnabled={true}
        />
      </TouchableOpacity>
    );
  };

  const [slideIndex, setSlideIndex] = useState(0);

  const renderDot = (active: boolean) => (
    <View style={[styles.sliderDotStyle, { backgroundColor: active ? '#aaa' : '#d8d8d8' }]} />
  );

  const renderBanners = () => {
    if (banners?.length && !isSelectPrescriptionVisible) {
      return (
        <View style={{ marginBottom: 10 }}>
          {/* Proxy container */}
          {showProxyBannerContainer ? (
            <ImageNative
              resizeMode="stretch"
              style={{ width: '100%', minHeight: imgHeight, position: 'absolute' }}
              source={{
                uri: productsThumbnailUrl(banners[0]?.image) + '?imwidth=' + Math.floor(winWidth),
                headers: {
                  'User-Agent': userAgent,
                },
              }}
            />
          ) : null}

          <Carousel
            onSnapToItem={setSlideIndex}
            data={banners}
            renderItem={renderSliderItem}
            sliderWidth={winWidth}
            itemWidth={winWidth}
            loop={true}
            initialNumToRender={1}
            autoplay={isSelectPrescriptionVisible ? false : true}
            autoplayDelay={3000}
            autoplayInterval={3000}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              position: 'absolute',
              bottom: 10,
              alignSelf: 'center',
            }}
          >
            {banners.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
          </View>
        </View>
      );
    } else {
      return renderMedicineBannerShimmer();
    }
  };

  const uploadPrescriptionCTA = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, '#02475b', 1, 24, 0),
              paddingBottom: 12,
            }}
          >
            Place your order via prescription
          </Text>
          <Button
            onPress={() => {
              uploadPrescriptionClickedEvent(pharmacyUserType, currentPatient);
              if (cartPrescriptions?.length) {
                props.navigation.navigate(AppRoutes.UploadPrescription);
              } else {
                props.navigation.navigate(AppRoutes.UploadPrescriptionView);
              }
            }}
            style={{ width: Platform.OS == 'android' ? '85%' : '90%' }}
            titleTextStyle={{
              ...theme.viewStyles.text('B', 17, '#fff', 1, 24, 0),
            }}
            title={'UPLOAD'}
          />
        </View>
        <PrescriptionPad style={{ height: 57, width: 42 }} />
      </View>
    );
  };

  const renderUploadPrescriptionSection = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.card(),
            marginTop: 10,
            marginBottom: 16,
          },
          medicineList?.length > 0 && searchText
            ? {
                elevation: 0,
              }
            : {},
        ]}
      >
        {uploadPrescriptionCTA()}
      </View>
    );
  };

  const renderBuyAgainLoader = () => {
    return [
      <Divider />,
      <ContentLoader
        active
        avatar
        aShape="square"
        aSize="default"
        pRows={1}
        loading={true}
        containerStyles={styles.buyAgainLoader}
      />,
    ];
  };

  const renderBuyAgainSection = () => {
    const onPress = () => {
      props.navigation.navigate(AppRoutes.MedicineBuyAgain, {
        movedFrom: AppRoutes.Medicine,
        skuList: buyAgainSkuList,
      });
    };
    return (
      !!buyAgainSkuList?.length && (
        <BuyAgainSection
          products={buyAgainProducts}
          onPress={onPress}
          topDivider
          containerStyle={styles.buyAgain}
        />
      )
    );
  };

  const renderBuyAgain = () => {
    return buyAgainLoading ? renderBuyAgainLoader() : renderBuyAgainSection();
  };

  const renderYourOrders = () => {
    return (
      <View style={{ ...theme.viewStyles.card(), paddingVertical: 0, marginTop: 0 }}>
        {renderBuyAgain()}
        <ListItem
          title={'My Orders'}
          leftAvatar={<MedicineIcon />}
          rightAvatar={<ArrowRight />}
          pad={16}
          Component={TouchableOpacity}
          onPress={() => {
            postMyOrdersClicked('Pharmacy Home', currentPatient);
            props.navigation.navigate(AppRoutes.YourOrdersScene);
          }}
          containerStyle={{ paddingHorizontal: 0 }}
          titleStyle={theme.viewStyles.text('M', 16, '#01475b', 1, 24)}
        />
      </View>
    );
  };

  const renderBrandCard = (imgUrl: string, onPress: () => void, style?: ViewStyle) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        <View
          style={[
            {
              ...theme.viewStyles.card(12, 0),
              elevation: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: 152,
              height: 68,
            },
            style,
          ]}
        >
          <ImageNative
            source={{ uri: imgUrl }}
            style={{
              height: 45,
              width: 80,
            }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
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
              width: 156,
              height: 68,
            },
            style,
          ]}
        >
          <ImageNative
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

  const renderCategories = (title: string, categories: MedicinePageSection[]) => {
    return !!categories.length ? (
      <View>
        <SectionHeader leftText={title} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={categories}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item?.title,
              productsThumbnailUrl(item?.image_url),
              () => {
                postwebEngageCategoryClickedEvent(item?.category_id, item?.title, title, 'Home');

                getBrandPagesData(item?.url_key)
                  .then(({ data }) => {
                    const response = data;
                    if (response?.success === true && response?.data?.length) {
                      props.navigation.navigate(AppRoutes.BrandPages, {
                        movedFrom: 'home',
                        brandData: response?.data,
                        category_id: item?.category_id,
                        title: item?.title || 'Products',
                      });
                    } else {
                      props.navigation.navigate(AppRoutes.MedicineListing, {
                        category_id: item?.category_id,
                        title: item?.title || 'Products',
                      });
                    }
                  })
                  .catch(({ error }) => {
                    CommonBugFender('MedicinePage_fetchBrandPageData', error);
                    props.navigation.navigate(AppRoutes.MedicineListing, {
                      category_id: item?.category_id,
                      title: item?.title || 'Products',
                    });
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
      </View>
    ) : null;
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
      setUserSubscriptionsByStatus(data);
    } catch (e) {
      CommonBugFender('Medicine_GetSubscriptionsOfUserByStatus', error);
    }
  };

  const setUserSubscriptionsByStatus = (data: any) => {
    try {
      if (data) {
        const circleData = data?.APOLLO?.[0];
        if (circleData._id) {
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
          if (circleData?.status === 'disabled') {
            setIsCircleExpired && setIsCircleExpired(true);
            setNonCircleValues();
          } else {
            setIsCircleExpired && setIsCircleExpired(false);
          }
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
    } catch (error) {}
  };

  const setNonCircleValues = () => {
    AsyncStorage.setItem('isCircleMember', 'no');
    AsyncStorage.removeItem('circleSubscriptionId');
    setCircleSubscriptionId && setCircleSubscriptionId('');
    setIsCircleSubscription && setIsCircleSubscription(false);
    setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
  };

  const renderDealsOfTheDay = (title: string, dealsOfTheDay: DealsOfTheDaySection[]) => {
    return !!dealsOfTheDay?.length ? (
      <View>
        <View style={{ marginBottom: 10 }} />
        <SectionHeader leftText={title} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={dealsOfTheDay}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  postwebEngageCategoryClickedEvent(item?.category_id, 'Banner', title, 'Home');
                  props.navigation.navigate(AppRoutes.MedicineListing, {
                    category_id: item?.category_id,
                    title: title,
                  });
                }}
                style={{
                  ...theme.viewStyles.card(0, 0),
                  marginHorizontal: 4,
                  marginTop: 16,
                  marginBottom: 20,
                  ...(index == 0 ? { marginLeft: 20 } : {}),
                  height: 144,
                  width: Dimensions.get('screen').width * 0.86,
                  borderRadius: 10,
                }}
              >
                <ImageNative
                  source={{
                    uri: productsThumbnailUrl(item?.image_url),
                  }}
                  resizeMode="contain"
                  style={{
                    height: 144,
                    width: Dimensions.get('screen').width * 0.86,
                  }}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    ) : null;
  };

  const renderHotSellers = (title: string, products: MedicineProduct[], categoryId?: number) => {
    return !!products?.length ? (
      <View>
        <SectionHeader
          leftText={title}
          rightText={categoryId ? 'VIEW ALL' : ''}
          rightTextStyle={
            categoryId
              ? {
                  textAlign: 'right',
                  ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
                  width: '25%',
                }
              : {}
          }
          leftTextStyle={categoryId ? { width: '75%' } : {}}
          onPressRightText={
            categoryId
              ? () => {
                  const filteredProducts = products
                    ? products.filter((product: MedicineProduct) => isProductInStock(product))
                    : [];
                  props.navigation.navigate(AppRoutes.MedicineListing, {
                    category_id: categoryId == -1 ? undefined : categoryId,
                    products: categoryId == -1 ? filteredProducts : null,
                    title: title || 'Products',
                    movedFrom: 'home',
                  });
                }
              : undefined
          }
          style={categoryId ? { paddingBottom: 1 } : {}}
        />
        <ProductList
          data={products}
          Component={ProductCard}
          navigation={props.navigation}
          addToCartSource={'Pharmacy Home'}
          sectionName={title}
          movedFrom={ProductPageViewedSource.HOME_PAGE}
          productPageViewedEventProps={{ 'Section Name': title } as ProductPageViewedEventProps}
        />
      </View>
    ) : null;
  };

  const renderShopByBrand = (title: string, shopByBrand: MedicinePageSection[]) => {
    return !!shopByBrand?.length ? (
      <View>
        <SectionHeader
          leftText={title}
          rightText={'VIEW ALL'}
          rightTextStyle={{
            textAlign: 'right',
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
            width: '25%',
          }}
          leftTextStyle={{ width: '75%' }}
          onPressRightText={() =>
            props.navigation.navigate(AppRoutes.ShopByBrand, {
              allBrandData: allBrandData,
              setAllBrandData: (data: Brand[]) => setAllBrandData(data),
            })
          }
          style={{ paddingBottom: 1 }}
        />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={shopByBrand}
          renderItem={({ item, index }) => {
            const imgUrl = productsThumbnailUrl(item?.image_url);
            return renderBrandCard(
              imgUrl,
              () => {
                postwebEngageCategoryClickedEvent(item?.category_id, item?.title, title, 'Home');

                getBrandPagesData(item?.url_key)
                  .then(({ data }) => {
                    const response = data;
                    if (response?.success === true && response?.data?.length) {
                      props.navigation.navigate(AppRoutes.BrandPages, {
                        movedFrom: 'home',
                        brandData: response?.data,
                        category_id: item?.category_id,
                        title: item?.title || 'Products',
                      });
                    } else {
                      props.navigation.navigate(AppRoutes.MedicineListing, {
                        category_id: item?.category_id,
                        title: item?.title || 'Products',
                      });
                    }
                  })
                  .catch(({ error }) => {
                    CommonBugFender('MedicinePage_fetchBrandPageData', error);
                    props.navigation.navigate(AppRoutes.MedicineListing, {
                      category_id: item?.category_id,
                      title: item?.title || 'Products',
                    });
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
      </View>
    ) : null;
  };

  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<(MedicineProduct | SearchSuggestion)[]>([]);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [medicineSearchLoading, setMedicineSearchLoading] = useState<boolean>(false);

  const onSearchMedicine = (
    _searchText: string,
    pharmacyPincode: string,
    locationCode: string,
    axdcCode: string
  ) => {
    setMedicineSearchLoading(true);
    getMedicineSearchSuggestionsApi(_searchText, axdcCode, pharmacyPincode, locationCode)
      .then(({ data }) => {
        const products = data.products || [];
        const queries = data.queries || [];
        const inStockProducts = products.filter((product) => !!isProductInStock(product));
        const outOfStockProducts = products.filter((product) => !isProductInStock(product));

        const formattedQuery: SearchSuggestion[] = [];
        if (queries?.length) {
          queries.map((query, index) => {
            if (index < 2) {
              const category_id = query?.filter?.__categories?.[0];
              const queryData = query?.query;
              const queryName = queryData?.[queryData?.length - 1];
              formattedQuery.push({
                name: category_id,
                categoryId: category_id,
                queryName,
                superQuery: queryData?.length > 1 ? `in ${queryData?.[0]}` : '',
              });
            }
          });
        }
        setMedicineList([...formattedQuery, ...inStockProducts, ...outOfStockProducts]);
        setMedicineSearchLoading(false);
        searchSuggestionEvent(_searchText, products.length, pharmacyUserType);
        MedicineSearchEvents.pharmacySearch({
          keyword: _searchText,
          source: 'Pharmacy Home',
          results: products.length,
          'User Type': pharmacyUserType,
        });
      })
      .catch((e) => {
        CommonBugFender('Medicine_onSearchMedicine', e);
        setMedicineSearchLoading(false);
        if (!Axios.isCancel(e)) {
          setMedicineSearchLoading(false);
        }
      });
  };

  useEffect(() => {
    debounce.current(searchText, pharmacyPincode || '', locationCode, axdcCode);
  }, [searchText]);

  useEffect(() => {
    if (serverCartItems?.find(({ sku }) => sku?.toUpperCase() === currentProductIdInCart)) {
      if (shownNudgeOnce === false) {
        setShowSuggestedQuantityNudge(true);
      }
    }
  }, [serverCartItems, currentProductQuantityInCart, currentProductIdInCart]);

  useEffect(() => {
    if (showSuggestedQuantityNudge === false) {
      setShownNudgeOnce(false);
    }
  }, [currentProductIdInCart]);

  const onSearch = (
    searchText: string,
    pharmacyPincode: string,
    locationCode: string,
    axdcCode: string
  ) => {
    if (searchText.length >= 3) {
      onSearchMedicine(searchText, pharmacyPincode || '', locationCode, axdcCode);
    } else {
      setMedicineList([]);
      setMedicineSearchLoading(false);
    }
  };

  const debounce = useRef(_.debounce(onSearch, 300));

  const renderSearchInput = () => {
    const shouldEnableSearchSend = searchText.length > 2;
    const rigthIconView = medicineSearchLoading ? (
      <ActivityIndicator size={24} />
    ) : (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: shouldEnableSearchSend ? 1 : 0.4,
        }}
        disabled={!shouldEnableSearchSend}
        onPress={() => {
          const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
            keyword: searchText,
            Source: 'Pharmacy Home',
          };
          postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);
          props.navigation.navigate(AppRoutes.MedicineListing, {
            searchText,
            comingFromSearch: true,
            navSrcForSearchSuccess: 'Pharmacy Home',
          });
          setSearchText('');
          setMedicineList([]);
        }}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

    const itemsNotFound =
      !medicineSearchLoading && searchText.length > 2 && medicineList?.length == 0;

    return (
      <>
        <SearchInput
          _isSearchFocused={isSearchFocused}
          autoFocus={!pharmacyLocation && !locationDetails ? false : focusSearch!}
          onSubmitEditing={() => {
            if (searchText.length > 2) {
              const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
                keyword: searchText,
                Source: 'Pharmacy Home',
              };
              postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);
              props.navigation.navigate(AppRoutes.MedicineListing, {
                searchText,
                comingFromSearch: true,
                navSrcForSearchSuccess: 'Pharmacy Home',
              });
              setSearchText('');
              setMedicineList([]);
              setSearchFocused(false);
            }
          }}
          value={searchText}
          onFocus={() => {
            setSearchFocused(true);
            setCategoryTreeVisible(false);
          }}
          onChangeText={(value) => {
            if (isValidSearch(value) && value.length >= 3) {
              setMedicineSearchLoading(true);
            }
            setSearchText(value);
          }}
          _rigthIconView={rigthIconView}
          placeholder="Search meds, brands &amp; more"
          _itemsNotFound={itemsNotFound}
          inputStyle={styles.searchInput}
          containerStyle={styles.searchInputContainer}
        />
      </>
    );
  };

  const client = useApolloClient();

  useEffect(() => {
    if (!serverCartLoading && searchItemAdded) {
      setSearchItemLoading({ ...searchItemLoading, [searchItemAdded]: false });
      setSearchItemAdded('');
    }
  }, [serverCartLoading]);

  const onAddCartItem = (
    item: MedicineProduct,
    comingFromSearch: boolean,
    cleverTapSearchSuccessEventAttributes: object
  ) => {
    const { sku, category_id } = item;
    setSearchItemAdded(sku);
    setSearchItemLoading({ ...searchItemLoading, [sku]: true });
    addPharmaItemToCart(
      formatToCartItem(item),
      pharmacyPincode,
      () => {},
      null,
      props.navigation,
      currentPatient,
      !!isPharmacyPincodeServiceable,
      { source: 'Pharmacy Partial Search', categoryId: category_id },
      JSON.stringify(serverCartItems),
      () => {},
      pharmacyCircleAttributes!,
      () => {},
      comingFromSearch,
      cleverTapSearchSuccessEventAttributes
    );
  };

  const getItemQuantity = (id: string): number => {
    const foundItem = serverCartItems?.find((item) => item?.sku == id);
    return foundItem ? Number(foundItem.quantity) : 0;
  };

  const onNotifyMeClick = (name: string) => {
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${name} is back in stock.`,
    });
  };

  const addItemToServerCart = (item: ShoppingCartItem) => {
    setUserActionPayload?.({
      medicineOrderCartLineItems: [
        {
          medicineSKU: `${item?.sku}`,
          quantity: 1,
        },
      ],
    });
  };

  const renderSearchSuggestionItemView = (
    data: ListRenderItemInfo<MedicineProduct | SearchSuggestion>
  ) => {
    const { item, index } = data;
    const key = 'queryName';
    const keywordArr = [];
    medicineList.map((obj: any) => {
      if (Object.keys(obj).includes(key)) {
        keywordArr.push(obj?.queryName);
      }
    });
    return (
      <MedicineSearchSuggestionItem
        onPress={() => {
          CommonLogEvent(AppRoutes.Medicine, 'Search suggestion Item');
          if (item?.categoryId) {
            props.navigation.navigate(AppRoutes.MedicineListing, {
              category_id: item?.categoryId,
              title: item?.queryName || 'Products',
              comingFromSearch: true,
              navSrcForSearchSuccess: 'Pharmacy Home',
            });
            searchSuccessEvent(searchText, item?.queryName || '', index, 'Carry');
          }
          if (item?.url_key || item?.sku) {
            props.navigation.navigate(AppRoutes.ProductDetailPage, {
              urlKey: item?.url_key,
              sku: item?.sku,
              movedFrom: ProductPageViewedSource.PARTIAL_SEARCH,
            });
            const availability = getAvailabilityForSearchSuccess(pharmacyPincode || '', item?.sku);
            const discount = getDiscountPercentage(item?.price, item?.special_price);
            const discountPercentage = discount ? discount + '%' : '0%';
            searchSuccessEvent(
              searchText,
              item?.queryName || '',
              index,
              'Success',
              !!availability,
              keywordArr.length,
              medicineList.length,
              item?.sku || '',
              item?.name || '',
              discountPercentage
            );
          }
        }}
        onPressAddToCart={() => {
          updateServerCartLocally(1, item?.sku);
          const comingFromSearch = true;
          const discount = getDiscountPercentage(item?.price, item?.special_price);
          const discountPercentage = discount ? discount + '%' : '0%';
          const cleverTapSearchSuccessEventAttributes = {
            'Nav src': 'Pharmacy Home',
            Status: 'Success',
            Keyword: searchText,
            Position: index + 1,
            Source: 'Partial search',
            Action: 'Add to cart',
            'Product availability': 'Available',
            'Product position': index + 1 - keywordArr?.length,
            'Results shown': medicineList?.length,
            'SKU ID': item?.sku,
            'Product name': item?.name,
            Discount: discountPercentage,
          };
          onAddCartItem(item, comingFromSearch, cleverTapSearchSuccessEventAttributes);
          setCurrentProductIdInCart(item?.sku);
          item?.pack_form ? setItemPackForm(item?.pack_form) : setItemPackForm('');
          item?.suggested_qty
            ? setSuggestedQuantity(item?.suggested_qty)
            : setSuggestedQuantity(null);
          item?.MaxOrderQty
            ? setMaxOrderQty(item?.MaxOrderQty)
            : item?.suggested_qty
            ? setMaxOrderQty(+item?.suggested_qty)
            : setMaxOrderQty(0);
          setCurrentProductQuantityInCart(1);
          setAddToCartSource?.({
            source: 'Pharmacy Partial Search',
            categoryId: item?.category_id,
          });
          addItemToServerCart(item);
        }}
        onPressNotify={() => {
          onNotifyMeClick(item?.name);
        }}
        onPressAdd={() => {
          setSearchItemAdded(item?.sku);
          setSearchItemLoading({ ...searchItemLoading, [item?.sku]: true });
          let qty: number = getItemQuantity(item?.sku);
          if (qty < getMaxQtyForMedicineItem(item?.MaxOrderQty)) {
            qty = qty + 1;
            updateServerCartLocally(1, item?.sku);
            setCurrentProductQuantityInCart(qty);
            setUserActionPayload?.({
              medicineOrderCartLineItems: [
                {
                  medicineSKU: item?.sku,
                  quantity: qty,
                },
              ],
            });
          } else {
            setCurrentProductQuantityInCart(qty + 1);
            setUserActionPayload?.({
              medicineOrderCartLineItems: [
                {
                  medicineSKU: item?.sku,
                  quantity: qty + 1,
                },
              ],
            });
          }
        }}
        onPressSubstract={() => {
          setSearchItemAdded(item?.sku);
          setSearchItemLoading({ ...searchItemLoading, [item?.sku]: true });
          let qty: number = getItemQuantity(item?.sku);
          qty = qty - 1;
          updateServerCartLocally(-1, item?.sku);
          setCurrentProductQuantityInCart(qty);
          setUserActionPayload?.({
            medicineOrderCartLineItems: [
              {
                medicineSKU: item?.sku,
                quantity: qty,
              },
            ],
          });
        }}
        quantity={getItemQuantity(item?.sku) || 0}
        data={item}
        showSeparator={index !== medicineList?.length - 1}
        style={{
          marginHorizontal: 20,
          paddingBottom: index == medicineList?.length - 1 ? 20 : 0,
        }}
      />
    );
  };

  const updateServerCartLocally = (quantity: number = 0, id: string) => {
    try {
      const items = serverCartItems || [];
      let doesExists = false;
      items.forEach((i) => {
        const qty = i?.quantity || 0;
        if (i?.sku === id) {
          i.quantity = qty + quantity;
          doesExists = true;
          return;
        }
      });

      if (!doesExists) {
        items.push({ sku: id, quantity: 1 });
      }

      setServerCartItems && setServerCartItems(items);
    } catch (e) {}
  };

  const renderSearchResults = () => {
    const showResults = !!searchText && searchText.length > 2 && medicineList?.length > 0;
    if (!showResults) return null;
    return (
      <View>
        <FlatList
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsVerticalScrollIndicator={true}
          style={styles.searchResults}
          data={medicineList}
          extraData={searchItemLoading}
          renderItem={renderSearchSuggestionItemView}
        />
        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={() => {
              const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
                keyword: searchText,
                Source: 'Pharmacy Home',
              };
              postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);
              props.navigation.navigate(AppRoutes.MedicineListing, {
                searchText,
                comingFromSearch: true,
                navSrcForSearchSuccess: 'Pharmacy Home',
              });
              setSearchText('');
              setMedicineList([]);
            }}
            style={styles.viewAllContainer}
          >
            <Text style={theme.viewStyles.text('B', 15, '#FCB716', 1, 20)}>VIEW ALL RESULTS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const bannerScrollRef = React.useRef<View>(null);

  const renderWhatsappBanner = () => {
    return (
      AppConfig.Configuration.WHATSAPP_TO_ORDER.bannerVisibility && (
        <View
          ref={bannerScrollRef}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setShowWhatsappRedirectionIcon(layout.y > 0);
          }}
        >
          <WhatsappRedirectionBanner />
        </View>
      )
    );
  };

  const postScrollScreenEvent = () => {
    const navSrc = props.navigation.getParam('comingFrom');
    pharmacyScrollScreenEvent(
      getUserType(allCurrentPatients),
      currentPatient,
      cartCircleSubscriptionId,
      navSrc || '',
      scrollCount.current
    );
  };

  const renderSections = () => {
    if (!data) {
      return null;
    }

    const metaData = [
      ...(data?.metadata || []),
      { section_key: 'circleBanners', section_name: '', section_position: 4, visible: true },
      {
        section_key: 'whatsappRedirectionBanner',
        section_name: '',
        section_position: 9,
        visible: true,
      },
    ];

    const staticSectionKeys = [
      'banners',
      'orders',
      'upload_prescription',
      'circleBanners',
      'recommended_products',
      'shop_by_brand',
      'whatsappRedirectionBanner',
    ];
    const sectionsView = metaData
      .filter((item) => item?.visible)
      .sort((a, b) => Number(a.section_position) - Number(b.section_position))
      .map(({ section_key, section_name }) => {
        const isStaticSection = staticSectionKeys.includes(section_key);
        if (isStaticSection) {
          return section_key === 'banners'
            ? renderBanners()
            : section_key === 'orders'
            ? renderYourOrders()
            : section_key === 'upload_prescription'
            ? renderUploadPrescriptionSection()
            : section_key === 'circleBanners'
            ? renderCarouselBanners()
            : section_key === 'recommended_products'
            ? renderHotSellers(section_name, recommendedProducts, -1)
            : section_key === 'whatsappRedirectionBanner'
            ? renderWhatsappBanner()
            : section_key === 'shop_by_brand'
            ? renderShopByBrand(section_name, data[section_key] || [])
            : null;
        } else {
          const products = g(data, section_key, 'products');
          const isCategoriesType = g(data, section_key, '0', 'title');
          const filteredProducts = products
            ? products.filter((product: MedicineProduct) => isProductInStock(product))?.slice(0, 9)
            : null;

          return filteredProducts
            ? renderHotSellers(
                section_name,
                filteredProducts || [],
                g(data, section_key, 'category_id')
              )
            : isCategoriesType
            ? renderCategories(section_name, data[section_key] || [])
            : renderDealsOfTheDay(section_name, data[section_key] || []);
        }
      });

    return (
      <ScrollView removeClippedSubviews={true} bounces={false} style={styles.scrollViewStyle}>
        <CategoryAndSpecialOffers
          containerStyle={styles.categoryAndSpecialOffers}
          onPressShopByCategory={() => setCategoryTreeVisible(true)}
          onPressSpecialOffers={() => {
            const categoryId = AppConfig.Configuration.SPECIAL_OFFERS_CATEGORY_ID;
            props.navigation.navigate(AppRoutes.SpecialOffersScreen, {
              movedFrom: 'home',
            });
            const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_SPECIAL_OFFERS_CLICKED] = {
              'Nav src': 'Pharmacy Home',
            };
            postCleverTapEvent(
              CleverTapEventName.PHARMACY_SPECIAL_OFFERS_CLICKED,
              cleverTapEventAttributes
            );
          }}
        />
        {sectionsView}
        {!error && <View style={{ height: 20 }} />}
      </ScrollView>
    );
  };

  const renderOverlay = () => {
    const isNoResultsFound =
      !medicineSearchLoading && searchText.length > 2 && medicineList?.length == 0;

    return (
      (!!medicineList?.length || medicineSearchLoading || isNoResultsFound) && (
        <View style={theme.viewStyles.overlayStyle}>
          <TouchableOpacity
            activeOpacity={1}
            style={theme.viewStyles.overlayStyle}
            onPress={() => {
              if (medicineList?.length == 0 && !searchText) return;
              setSearchText('');
              setMedicineList([]);
              setSearchFocused(false);
            }}
          />
        </View>
      )
    );
  };

  const renderCircleCartDetails = () => (
    <CircleBottomContainer
      serverCartLoading={serverCartLoading}
      onPressGoToCart={() => props.navigation.navigate(AppRoutes.ServerCart)}
      onPressUpgradeTo={() => {
        setShowCirclePopup(true);
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMA_HOME_UPGRADE_TO_CIRCLE] = {
          'Patient UHID': currentPatient?.uhid,
          'Mobile Number': currentPatient?.mobileNumber,
          'Customer ID': currentPatient?.id,
        };
        postWebEngageEvent(WebEngageEventName.PHARMA_HOME_UPGRADE_TO_CIRCLE, eventAttributes);
      }}
    />
  );

  const renderCircleMembershipPopup = () => {
    return (
      <CircleMembershipPlans
        isModal={true}
        closeModal={() => setShowCirclePopup(false)}
        navigation={props.navigation}
        isConsultJourney={false}
        from={string.banner_context.PHARMACY_HOME}
        source={'Pharma'}
        onSelectMembershipPlan={(plan) => {
          if (plan) {
            // if plan is selected
            setCircleMembershipCharges && setCircleMembershipCharges(plan?.currentSellingPrice);
            setCircleSubPlanId && setCircleSubPlanId(plan?.subPlanId);
          } else {
            // if plan is removed
            setCircleMembershipCharges && setCircleMembershipCharges(0);
          }
        }}
        circleEventSource={'Medicine Homepage Sticky'}
      />
    );
  };

  const renderCategoryTree = () => {
    const onPressCategory: MedicineCategoryTreeProps['onPressCategory'] = (category, tree) => {
      setCategoryTreeVisible(false);
      postwebEngageCategoryClickedEvent(
        category.category_id,
        category.title,
        tree?.[0]?.title,
        'Category Tree'
      );

      getBrandPagesData(category?.url_key)
        .then(({ data }) => {
          const response = data;
          if (response?.success === true && response?.data?.length) {
            props.navigation.navigate(AppRoutes.BrandPages, {
              movedFrom: 'home',
              brandData: response?.data,
              category_id: category.category_id,
              title: category.title,
            });
          } else {
            props.navigation.navigate(AppRoutes.MedicineListing, {
              category_id: category.category_id,
              title: category.title || 'Products',
              breadCrumb: tree,
            });
          }
        })
        .catch(({ error }) => {
          CommonBugFender('MedicinePage_fetchBrandPageData', error);
          props.navigation.navigate(AppRoutes.MedicineListing, {
            category_id: category.category_id,
            title: category.title,
            breadCrumb: tree,
          });
        });
    };
    const onPressDismissView = () => {
      setCategoryTreeVisible(false);
    };
    return (
      categoryTreeVisible && (
        <View style={styles.categoryTreeWrapper}>
          <MedicineCategoryTree
            containerStyle={styles.categoryTreeContainer}
            onPressCategory={onPressCategory}
            categories={data?.categories || []}
          />
          <TouchableOpacity onPress={onPressDismissView}>
            <View style={styles.categoryTreeDismissView} />
          </TouchableOpacity>
        </View>
      )
    );
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
        <View style={{ backgroundColor: 'white' }}>
          {renderTopView()}
          {renderSearchInput()}
          {renderSearchResults()}
        </View>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          bounces={false}
          scrollEventThrottle={0}
          keyboardShouldPersistTaps="always"
          onScroll={(event) => {
            //increments only for down scroll
            try {
              const currentOffset = event.nativeEvent.contentOffset?.y;
              currentOffset > (this.offset || 0) && (scrollCount.current += 1);
              this.offset = currentOffset;
            } catch (e) {}

            bannerScrollRef.current &&
              bannerScrollRef.current.measure(
                (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                  if (Platform.OS === 'android') {
                    setShowWhatsappRedirectionIcon(pagey < 0 || pagey > windowHeight);
                  } else if (Platform.OS === 'ios') setShowWhatsappRedirectionIcon(pagey === 0);
                }
              );
          }}
        >
          {pageLoading ? renderMedicinesShimmer() : null}
          <View style={{ flex: 1, paddingBottom: !!serverCartItems?.length ? 80 : 0 }}>
            {renderSections()}
            {renderOverlay()}
            {renderCategoryTree()}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>

      {(!!serverCartItems?.length || serverCartLoading) && renderCircleCartDetails()}
      {isSelectPrescriptionVisible && renderEPrescriptionModal()}
      {showCirclePopup && renderCircleMembershipPopup()}
      {showSuggestedQuantityNudge &&
        shownNudgeOnce === false &&
        !!suggestedQuantity &&
        +suggestedQuantity > 1 &&
        currentProductQuantityInCart < +suggestedQuantity && (
          <SuggestedQuantityNudge
            suggested_qty={suggestedQuantity}
            sku={currentProductIdInCart}
            packForm={itemPackForm}
            maxOrderQty={maxOrderQty}
            setShownNudgeOnce={setShownNudgeOnce}
            showSuggestedQuantityNudge={showSuggestedQuantityNudge}
            setShowSuggestedQuantityNudge={setShowSuggestedQuantityNudge}
            setCurrentProductQuantityInCart={setCurrentProductQuantityInCart}
          />
        )}
      {AppConfig.Configuration.WHATSAPP_TO_ORDER.iconVisibility &&
        showWhatsappRedirectionIcon &&
        medicineList?.length === 0 && <WhatsappRedirectionStickyNote />}
      <UpdateAppPopup depricatedAppData={depricatedAppData} navigation={props.navigation} />
    </View>
  );
};
