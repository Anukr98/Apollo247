import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  BackHandler,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import {
  ProductPageViewedSource,
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  useShoppingCart,
  BreadcrumbLink,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { WhiteTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  isEmptyObject,
  postWebEngageEvent,
  savePastSearch,
  aphConsole,
  g,
  getFormattedLocation,
  postwebEngageAddToCartEvent,
  postFirebaseAddToCartEvent,
  postAppsFlyerAddToCartEvent,
  doRequestAndAccessLocationModified,
  navigateToHome,
  navigateToScreenWithEmptyStack,
  postCleverTapEvent,
  calculateCashbackForItem,
  formatAddress,
  getPackageIds,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  MedicineProductDetails,
  getMedicineDetailsApi,
  trackTagalysEvent,
  getSubstitutes,
  getPlaceInfoByPincode,
  getDeliveryTAT247v3,
  TatApiInput247,
  getMedicineDetailsApiV2,
  MedicineProduct,
  getBoughtTogether,
  fetchCouponsPDP,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import { ProductNameImage } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductNameImage';
import { ProductPriceDelivery } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductPriceDelivery';
import { PincodeInput } from '@aph/mobile-patients/src/components/Medicines/Components/PicodeInput';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { ProductQuantity } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductQuantity';
import { ProductManufacturer } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductManufacturer';
import { ProductInfo } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductInfo';
import { PharmaManufacturer } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/PharmaManufacturer';
import { SimilarProducts } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/SimilarProducts';
import { BottomStickyComponent } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/BottomStickyComponent';
import { Overlay } from 'react-native-elements';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { AccessLocation } from '@aph/mobile-patients/src/components/Medicines/Components/AccessLocation';
import { AddressSource } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { MedicineListingHeader } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingHeader';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import AsyncStorage from '@react-native-community/async-storage';
import { NudgeMessage } from '@aph/mobile-patients/src/components/Medicines/Components/NudgeMessage';
import {
  GET_PATIENT_ADDRESS_LIST,
  GET_PRODUCT_SUBSTITUTES,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  pharmaSubstitution,
  pharmaSubstitutionVariables,
  pharmaSubstitution_pharmaSubstitution_substitutes,
} from '@aph/mobile-patients/src/graphql/types/pharmaSubstitution';
import { SuggestedQuantityNudge } from '@aph/mobile-patients/src/components/SuggestedQuantityNudge/SuggestedQuantityNudge';
import { FrequentlyBoughtTogether } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/FrequentlyBoughtTogether';
import { postPharmacyAddNewAddressCompleted } from '../../helpers/webEngageEventHelpers';
import { CouponSectionPDP } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/CouponSectionPDP';
import { CircleBannerPDP } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/CircleBannerPDP';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { renderPDPComponentsShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import {
  fireProductDetailPincodeCheckEvent,
  fireTatApiCalledEvent,
  onNotifyMeClickPDP,
  postProductPageViewedEvent,
} from '@aph/mobile-patients/src/components/ProductDetailPage/helperFunctionsPDP';

export type ProductPageViewedEventProps = Pick<
  WebEngageEvents[WebEngageEventName.PRODUCT_PAGE_VIEWED],
  'CategoryID' | 'CategoryName' | 'SectionName'
>;

export interface ProductDetailPageProps
  extends NavigationScreenProps<{
    sku: string | null;
    movedFrom: ProductPageViewedSource;
    productPageViewedEventProps?: ProductPageViewedEventProps;
    deliveryError: string;
    sectionName?: string;
    urlKey?: string;
    navSrcForSearchSuccess?: string;
  }> {}

type PharmacyTatApiCalled =
  | WebEngageEvents[WebEngageEventName.PHARMACY_TAT_API_CALLED]
  | CleverTapEvents[CleverTapEventName.PHARMACY_TAT_API_CALLED];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = (props) => {
  const [movedFrom, setMovedFrom] = useState(props.navigation.getParam('movedFrom'));
  const [sku, setSku] = useState(props.navigation.getParam('sku'));
  const urlKey = props.navigation.getParam('urlKey');
  const sectionName = props.navigation.getParam('sectionName');
  const productPageViewedEventProps = props.navigation.getParam('productPageViewedEventProps');
  const _deliveryError = props.navigation.getParam('deliveryError');
  const [composition, setComposition] = useState<string>('');

  const {
    pharmacyCircleAttributes,
    setPdpBreadCrumbs,
    addresses,
    circleMembershipCharges,
    pdpDisclaimerMessage,
    pharmaPDPNudgeMessage,
    productSubstitutes,
    setProductSubstitutes,
    newAddressAdded,
    setNewAddressAdded,
    axdcCode,
    isPharmacyPincodeServiceable,
    setAddresses,

    cartCircleSubscriptionId,
    serverCartItems,
    serverCartAmount,
    cartLocationDetails,
    cartAddressId,
    serverCartLoading,
  } = useShoppingCart();
  const { setUserActionPayload, fetchAddress } = useServerCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { locationDetails, activeUserSubscriptions } = useAppCommonData();

  const cartItemsCount = serverCartItems?.length + diagnosticCartItems.length;
  const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);

  const defaultAddress = addresses.find((item) => item.id == cartAddressId);
  const pharmacyPincode = cartLocationDetails?.pincode || defaultAddress?.zipcode || '';
  const pharmacyLocation = cartLocationDetails || defaultAddress;
  //use states
  const [loading, setLoading] = useState<boolean>(true);
  const [medicineDetails, setMedicineDetails] = useState<MedicineProductDetails>(
    {} as MedicineProductDetails
  );
  const [isMedicineError, setIsMedicineError] = useState<boolean>(false);
  const [isInStock, setIsInStock] = useState<boolean>(true);
  const [deliveryError, setdeliveryError] = useState<string>(_deliveryError || '');
  const [apiError, setApiError] = useState<boolean>(false);
  const [substitutes, setSubstitutes] = useState<MedicineProductDetails[]>([]);
  const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [showAddedToCart, setShowAddedToCart] = useState<boolean>(false);
  const [showSubstituteInfo, setShowSubstituteInfo] = useState<boolean>(false);
  const [showDeliverySpinner, setshowDeliverySpinner] = useState<boolean>(false);

  const [multiVariantAttributes, setMultiVariantAttributes] = useState([]);
  const [multiVariantProducts, setMultiVariantProducts] = useState([]);
  const [multiVariantSkuInformation, setMultiVariantSkuInformation] = useState<any[]>([]);

  const [pincode, setpincode] = useState<string>(pharmacyPincode || '');
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [tatEventData, setTatEventData] = useState<PharmacyTatApiCalled>();
  const [isPharma, setIsPharma] = useState<boolean>(false);
  const [userType, setUserType] = useState<string>('');
  const [circleID, setCircleID] = useState<string>('');
  const [showSuggestedQuantityNudge, setShowSuggestedQuantityNudge] = useState<boolean>(false);
  const [shownNudgeOnce, setShownNudgeOnce] = useState<boolean>(false);
  const [currentProductIdInCart, setCurrentProductIdInCart] = useState<string>(null);
  const [currentProductQuantityInCart, setCurrentProductQuantityInCart] = useState<number>(0);
  const [boughtTogether, setBoughtTogether] = useState<MedicineProduct[]>([]);
  const [couponData, setCouponData] = useState([]);
  const [couponDataLoading, setCouponDataLoading] = useState<boolean>(false);

  const { special_price, price, type_id, subcategory } = medicineDetails;
  const finalPrice = price - special_price ? special_price : price;
  const cashback = calculateCashbackForItem(Number(finalPrice), type_id, subcategory, sku);
  const selectedAddress = addresses.find((item) => item.id == cartAddressId);
  type addressListType = savePatientAddress_savePatientAddress_patientAddress[];

  let buttonRef = React.useRef<View>(null);
  let similarProductsRef = React.useRef<View>(null);
  let substituteProductsRef = React.useRef<View>(null);
  let alsoBoughtProductsRef = React.useRef<View>(null);
  const windowHeight = Dimensions.get('window').height;
  const [showSimilarProducts, setShowSimilarProducts] = useState<boolean>(false);
  const [showSubstituteProducts, setShowSubstituteProducts] = useState<boolean>(false);
  const [showAlsoBoughtProducts, setShowAlsoBoughtProducts] = useState<boolean>(false);

  const getItemQuantity = (id: string) => {
    const foundItem = serverCartItems?.find((item) => item.sku == id);
    return foundItem ? foundItem.quantity : 0;
  };

  useEffect(() => {
    if (medicineDetails?.id) {
      const pharmaOverview = medicineDetails?.PharmaOverview?.[0];
      if (pharmaOverview?.generic && pharmaOverview?.Unit && pharmaOverview?.Strength) {
        let compositions = '';
        const generics = pharmaOverview?.generic?.split('+');
        const strengths = pharmaOverview?.Strength?.split('+');
        const units = pharmaOverview?.Unit?.split('+');
        generics.forEach((value: string, index: number) => {
          compositions =
            compositions +
            `${value.trim()}-${strengths[index].trim()}${units[index].trim()}${
              index + 1 != generics?.length ? ` + ` : ``
            }`;
        });
        setComposition(compositions);
      }
    }
  }, [medicineDetails]);

  useEffect(() => {
    setProductSubstitutes?.([]);
    BackHandler.addEventListener('hardwareBackPress', onPressHardwareBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onPressHardwareBack);
    };
    setShowSuggestedQuantityNudge(false);
  }, []);

  useEffect(() => {
    if (
      sku &&
      (movedFrom === ProductPageViewedSource.DEEP_LINK ||
        movedFrom == ProductPageViewedSource.MULTI_VARIANT)
    ) {
      fetchDeliveryTime(pharmacyPincode, false);
    }
  }, [sku]);

  useEffect(() => {
    if (movedFrom === ProductPageViewedSource.DEEP_LINK) {
      getMedicineDetails();
      fetchAddress();
    }
  }, [movedFrom]);

  useEffect(() => {
    if (medicineDetails?.price && sku) {
      fetchDeliveryTime(pharmacyPincode, false);
    }
  }, [medicineDetails?.price]);

  const onPressHardwareBack = () => props.navigation.goBack();

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setLoading(true);
      getMedicineDetails();
      if (sku && pharmacyPincode) {
        getProductSubstitutes(sku);
      }
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setLoading(true);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, [props.navigation]);

  useEffect(() => {
    if (medicineDetails?.sku && (!!deliveryTime || !!deliveryError)) {
      postProductPageViewedEvent(
        pharmacyPincode,
        isInStock,
        movedFrom,
        medicineDetails,
        productPageViewedEventProps,
        pharmacyCircleAttributes,
        userType,
        isPharmacyPincodeServiceable,
        deliveryTime,
        cashback,
        multiVariantAttributes,
        productSubstitutes,
        circleID,
        circleMembershipCharges
      );
    }
  }, [medicineDetails, deliveryTime]);

  useEffect(() => {
    if (productSubstitutes?.length > 0) {
      postProductPageViewedEvent(
        pharmacyPincode,
        isInStock,
        movedFrom,
        medicineDetails,
        productPageViewedEventProps,
        pharmacyCircleAttributes,
        userType,
        isPharmacyPincodeServiceable,
        deliveryTime,
        cashback,
        multiVariantAttributes,
        productSubstitutes,
        circleID,
        circleMembershipCharges
      );
    }
  }, [productSubstitutes]);

  useEffect(() => {
    if (axdcCode && medicineDetails?.sku) {
      getMedicineDetails(cartLocationDetails?.pincode, axdcCode, medicineDetails?.sku);
    }
  }, [cartLocationDetails?.pincode]);

  useEffect(() => {
    const addressLength = addresses.length;
    if (!!addressLength && !!newAddressAdded) {
      postPharmacyAddNewAddressCompleted(
        'PDP',
        g(selectedAddress, 'zipcode')!,
        formatAddress(selectedAddress),
        moment(deliveryTime).toDate(),
        moment(deliveryTime).diff(new Date(), 'd'),
        'Yes'
      );
      fetchAddress();
      setNewAddressAdded && setNewAddressAdded('');
    }
  }, [newAddressAdded, selectedAddress, deliveryTime]);

  useEffect(() => {
    if (!isPharmacyPincodeServiceable) {
      const unServiceableMsg =
        'Sorry! Your Pincode is not serviceable yet. Please try with an alternative pincode.';
      setIsInStock(false);
      setdeliveryTime('');
      setdeliveryError(unServiceableMsg);
      setshowDeliverySpinner(false);
    } else {
      setdeliveryError('');
      setshowDeliverySpinner(false);
    }
  }, [isPharmacyPincodeServiceable]);

  useEffect(() => {
    if (!addresses?.length) {
      fetchAddress();
    }
  }, [addresses]);

  useEffect(() => {
    try {
      if (medicineDetails?.price && tatEventData) {
        const eventAttributes: PharmacyTatApiCalled = {
          ...tatEventData,
          'Input MRP': medicineDetails?.price,
          Response_MRP: tatEventData?.Response_MRP * Number(medicineDetails?.mou || 1),
        };
        postWebEngageEvent(WebEngageEventName.PHARMACY_TAT_API_CALLED, eventAttributes);
        postCleverTapEvent(CleverTapEventName.PHARMACY_TAT_API_CALLED, eventAttributes);
      }
    } catch (error) {}
  }, [tatEventData]);

  useEffect(() => {
    const getUserType = async () => {
      const pharmacyUserType: any = await AsyncStorage.getItem('PharmacyUserType');
      const circleId: any = await AsyncStorage.getItem('circleSubscriptionId');
      setUserType(pharmacyUserType);
      setCircleID(circleId);
    };
    getUserType();
  }, []);

  useEffect(() => {
    if (sku && pharmacyPincode) {
      getProductSubstitutes(sku);
    }
  }, [sku, isPharma, pharmacyPincode, props.navigation, medicineDetails]);

  useEffect(() => {
    if (serverCartItems?.find(({ sku }) => sku?.toUpperCase() === currentProductIdInCart)) {
      if (shownNudgeOnce === false) {
        setShowSuggestedQuantityNudge(true);
      }
    }
  }, [serverCartItems, currentProductQuantityInCart, currentProductIdInCart]);

  useEffect(() => {}, [setShowSuggestedQuantityNudge]);

  const getMedicineDetails = (zipcode?: string, pinAcdxCode?: string, selectedSku?: string) => {
    setLoading(true);
    if (urlKey || selectedSku) {
      getMedicineDetailsApiV2(selectedSku || urlKey, pinAcdxCode || axdcCode, pharmacyPincode)
        .then(({ data }) => {
          const productDetails = g(data, 'productdp', '0' as any);
          if (productDetails) {
            setSku(productDetails?.sku);
            setMedicineData(productDetails);
            getBoughtTogetherData(productDetails?.sku, productDetails);
            getCouponsData(productDetails?.sku);
          } else if (data && data.message) {
            setIsMedicineError(true);
          }
          setLoading(false);
        })
        .catch((err) => {
          CommonBugFender('ProductDetailsScene_getMedicineDetailsV2Api', err);
          aphConsole.log('ProductDetailsScene err\n', err);
          setApiError(!!err);
          setLoading(false);
        });
    } else {
      getMedicineDetailsApi(sku, pinAcdxCode || axdcCode, pharmacyPincode)
        .then(({ data }) => {
          const productDetails = g(data, 'productdp', '0' as any);
          if (productDetails) {
            setMedicineData(productDetails);
          } else if (data && data.message) {
            setIsMedicineError(true);
          }
          setLoading(false);
        })
        .catch((err) => {
          CommonBugFender('ProductDetailsScene_getMedicineDetailsApi', err);
          aphConsole.log('ProductDetailsScene err\n', err);
          setApiError(!!err);
          setLoading(false);
        });
    }
  };

  const setMedicineData = (productDetails: MedicineProductDetails) => {
    setMedicineDetails(productDetails || {});
    setIsPharma(productDetails?.type_id?.toLowerCase() === 'pharma');
    trackTagalysViewEvent(productDetails);
    savePastSearch(client, {
      typeId: productDetails?.sku,
      typeName: productDetails?.name,
      type: SEARCH_TYPE.MEDICINE,
      patient: currentPatient?.id,
      image: productDetails?.thumbnail,
    });

    if (productDetails?.multi_variants_products) {
      const attributes = productDetails?.multi_variants_products?.attributes;
      const products = productDetails?.multi_variants_products?.products;
      setMultiVariantAttributes(attributes);
      setMultiVariantProducts(products);
      const skusInformation = Object.keys(products).map((data) => {
        return {
          code: data,
          sku: products[data].sku,
          available: products[data].is_in_stock,
          unitOfMeasurement: products[data].unit_of_measurement || '',
        };
      });
      setMultiVariantSkuInformation(skusInformation);
    }
  };

  const getBoughtTogetherData = (productSku: string, productDetails) => {
    const mainProduct = {
      id: productDetails.id,
      sku: productDetails.sku,
      price: productDetails.price,
      special_price: productDetails?.special_price,
      name: productDetails.name,
      status: productDetails?.status,
      type_id: productDetails?.type_id,
      url_key: productDetails?.url_key,
      is_in_stock: productDetails?.is_in_stock,
      MaxOrderQty: productDetails.MaxOrderQty,
      sell_online: productDetails?.sell_online,
      image: productDetails?.image?.[0],
      thumbnail: productDetails?.thumbnail,
      small_image: productDetails?.small_image,
      mou: productDetails?.mou,
      is_prescription_required: productDetails?.is_prescription_required,
      is_express: productDetails?.is_express,
      dc_availability: productDetails?.dc_availability,
      is_in_contract: productDetails?.is_in_contract,
      banned: productDetails?.banned,
      subcategory_discount: productDetails?.subcategory_discount,
    };
    if (!!productSku) {
      getBoughtTogether(productSku)
        .then(({ data }) => {
          const boughtTogetherProducts = data?.bought_together;
          boughtTogetherProducts.unshift(mainProduct);
          setBoughtTogether(boughtTogetherProducts);
        })
        .catch(({ error }) => {
          CommonBugFender('ProductDetails_fetchBoughtTogether', error);
        });
    }
  };

  const getCouponsData = (productSku: string) => {
    if (!!productSku) {
      setCouponDataLoading(true);
      const params = {
        packageId: getPackageIds(activeUserSubscriptions)?.join(),
        mobile: g(currentPatient, 'mobileNumber'),
        sku: productSku,
        type: 'Pharmacy',
      };
      fetchCouponsPDP(params)
        .then(({ data }) => {
          const couponResponse = data;
          setCouponData(couponResponse?.response);
          setCouponDataLoading(false);
        })
        .catch(({ error }) => {
          CommonBugFender('ProductDetails_fetchCouponData', error);
          setCouponDataLoading(false);
        });
    }
  };

  const getProductSubstitutes = async (sku: string) => {
    let latitude,
      longitude = 0;
    let input = {
      sku,
      pincode: pharmacyPincode,
      isPharma,
    };
    const data = await getPlaceInfoByPincode(pharmacyPincode);
    const locationData = data?.data?.results?.[0]?.geometry?.location;
    latitude = locationData?.lat;
    longitude = locationData?.lng;
    if (latitude && longitude) {
      input['lat'] = parseFloat(latitude.toFixed(2));
      input['lng'] = parseFloat(longitude.toFixed(2));
    }
    client
      .query<pharmaSubstitution, pharmaSubstitutionVariables>({
        query: GET_PRODUCT_SUBSTITUTES,
        variables: { substitutionInput: input },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const substitutes = res?.data?.pharmaSubstitution?.substitutes;
        if (substitutes?.length) {
          setProductSubstitutes?.(substitutes);
        } else {
          setProductSubstitutes?.([]);
          fetchSubstitutes();
        }
      })
      .catch((error) => {
        setProductSubstitutes?.([]);
        fetchSubstitutes();
      });
  };

  const onSelectVariant = (sku: string) => {
    setMovedFrom(ProductPageViewedSource.MULTI_VARIANT);
    getMedicineDetails(pharmacyPincode, axdcCode, sku);
  };

  const homeBreadCrumb: BreadcrumbLink = {
    title: 'Home',
    onPress: () => {
      navigateToHome(props.navigation);
    },
  };

  useEffect(() => {
    let breadcrumb: BreadcrumbLink[] = [homeBreadCrumb];
    if (!!movedFrom) {
      if (
        movedFrom === ProductPageViewedSource.PARTIAL_SEARCH ||
        movedFrom === ProductPageViewedSource.SUBSTITUTES ||
        movedFrom === ProductPageViewedSource.PDP_ALL_SUSBTITUTES ||
        movedFrom === ProductPageViewedSource.CROSS_SELLING_PRODUCTS ||
        movedFrom === ProductPageViewedSource.SIMILAR_PRODUCTS ||
        movedFrom === ProductPageViewedSource.NOTIFICATION ||
        movedFrom === ProductPageViewedSource.BANNER ||
        movedFrom === ProductPageViewedSource.BUY_AGAIN ||
        movedFrom === ProductPageViewedSource.HOME_PAGE
      ) {
        breadcrumb.push({
          title: 'Medicines',
          onPress: () => {
            props.navigation.navigate('MEDICINES');
          },
        });
      }
      if (
        movedFrom === ProductPageViewedSource.FULL_SEARCH ||
        movedFrom === ProductPageViewedSource.CATEGORY_OR_LISTING
      ) {
        breadcrumb.push({
          title: 'Medicines',
          onPress: () => {
            navigateToScreenWithEmptyStack(props.navigation, 'MEDICINES');
          },
        });
        breadcrumb.push({
          title: 'Medicine Search',
          onPress: () => {},
        });
      }
      if (movedFrom === ProductPageViewedSource.CART) {
        breadcrumb.push({
          title: 'Cart',
          onPress: () => {
            navigateToScreenWithEmptyStack(props.navigation, AppRoutes.ServerCart);
          },
        });
      }
      breadcrumb.push({
        title: medicineDetails?.name,
        onPress: () => {},
      });
      setPdpBreadCrumbs && setPdpBreadCrumbs(breadcrumb);
    }
  }, [movedFrom, medicineDetails?.name]);

  const fetchSubstitutes = () => {
    getSubstitutes(sku?.toUpperCase())
      .then(({ data }) => {
        try {
          if (data) {
            if (
              data.products &&
              typeof data.products === 'object' &&
              Array.isArray(data.products)
            ) {
              setSubstitutes(data.products);
            }
          }
        } catch (error) {
          CommonBugFender('ProductDetailsScene_fetchSubstitutes_try', error);
        }
      })
      .catch((err) => {
        CommonBugFender('ProductDetailsScene_fetchSubstitutes', err);
      });
  };

  const trackTagalysViewEvent = (details: MedicineProductDetails) => {
    try {
      trackTagalysEvent(
        {
          event_type: 'product_action',
          details: {
            sku: details.sku,
            action: 'view',
          } as Tagalys.ProductAction,
        },
        g(currentPatient, 'id')!
      );
    } catch (error) {
      CommonBugFender(`${AppRoutes.ProductDetailPage}_trackTagalysEvent`, error);
    }
  };

  const fetchDeliveryTime = async (currentPincode: string, checkButtonClicked?: boolean) => {
    if (!currentPincode || !isPharmacyPincodeServiceable) return;
    const pincodeServiceableItemOutOfStockMsg = 'Sorry, this item is out of stock in your area.';
    Keyboard.dismiss();
    setshowDeliverySpinner(true);

    // To handle deeplink scenario and
    // If we performed pincode serviceability check already in Medicine Home Screen and the current pincode is same as Pharma pincode
    try {
      let longitude, latitude;
      if (pharmacyPincode == currentPincode) {
        latitude = pharmacyLocation ? pharmacyLocation.latitude : null;
        longitude = pharmacyLocation ? pharmacyLocation.longitude : null;
      }
      if (!latitude || !longitude) {
        const data = await getPlaceInfoByPincode(currentPincode);
        const locationData = data.data.results[0].geometry.location;
        latitude = locationData.lat;
        longitude = locationData.lng;
      }
      callDeliveryTatApi(
        currentPincode,
        latitude,
        longitude,
        checkButtonClicked,
        isPharmacyPincodeServiceable,
        pincodeServiceableItemOutOfStockMsg
      );
    } catch (error) {
      // in case user entered wrong pincode, not able to get lat lng. showing out of stock to user
      setdeliveryError(pincodeServiceableItemOutOfStockMsg);
      setdeliveryTime('');
      setshowDeliverySpinner(false);
      setIsInStock(false);
    }
  };

  const callDeliveryTatApi = (
    currentPincode: string,
    latitude: any,
    longitude: any,
    checkButtonClicked: boolean | undefined,
    pinCodeNotServiceable: boolean,
    pincodeServiceableItemOutOfStockMsg: string
  ) => {
    getDeliveryTAT247v3({
      items: [{ sku: sku?.toUpperCase(), qty: getItemQuantity(sku?.toUpperCase()) || 1 }],
      pincode: currentPincode,
      lat: latitude,
      lng: longitude,
    } as TatApiInput247)
      .then((res) => {
        const deliveryDate = res?.data?.response?.[0]?.tat;
        const skuExist = res?.data?.response?.[0]?.items?.[0]?.exist;
        if (skuExist) {
          setIsInStock(true);
        } else {
          setIsInStock(false);
        }
        if (deliveryDate) {
          if (checkButtonClicked) {
            fireProductDetailPincodeCheckEvent(
              currentPincode,
              deliveryDate,
              pinCodeNotServiceable,
              medicineDetails,
              currentPatient
            );
          }
          setdeliveryTime(
            moment(deliveryDate, AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT).format(
              AppConfig.Configuration.MED_DELIVERY_DATE_TAT_API_FORMAT
            )
          );
          setdeliveryError('');
        } else {
          setdeliveryError(pincodeServiceableItemOutOfStockMsg);
          setdeliveryTime('');
        }
        fireTatApiCalledEvent(
          res.data.response,
          latitude,
          longitude,
          currentPincode,
          serverCartItems,
          medicineDetails,
          setTatEventData
        );
      })
      .catch((error) => {
        setIsInStock(false);
        // Intentionally show T+2 days as Delivery Date
        const genericServiceableDate = moment()
          .add(2, 'days')
          .set('hours', 20)
          .set('minutes', 0)
          .format('DD-MMM-YYYY hh:mm');
        setdeliveryTime(genericServiceableDate);
        setdeliveryError('');
      })
      .finally(() => {
        setshowDeliverySpinner(false);
      });
  };

  const renderEmptyData = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', marginTop: 50 }}>
        <Card
          cardContainer={{ marginTop: 0 }}
          heading={'Uh oh! :('}
          description={medicineError || 'Product Details Not Available!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      </View>
    );
  };

  const updatePlaceInfoByPincode = (pinCode: string) => {
    setLoading!(true);
    getPlaceInfoByPincode(pinCode)
      .then(({ data }) => {
        try {
          if (data.results.length) {
            const addrComponents = data.results[0].address_components || [];
            const latLang = data.results[0].geometry.location || {};
            const response = getFormattedLocation(addrComponents, latLang, pinCode);
            setUserActionPayload?.({
              zipcode: pinCode,
              latitude: response?.latitude,
              longitude: response?.longitude,
            });
            fetchDeliveryTime(pinCode, true);
            setLoading!(false);
          } else {
            setLoading!(false);
            showAphAlert!({
              unDismissable: true,
              title: string.common.uhOh,
              description: 'Services unavailable. Change delivery location.',
              CTAs: [
                {
                  text: 'CHANGE PINCODE',
                  type: 'orange-link',
                  onPress: () => showAccessAccessLocationPopup(true),
                },
              ],
            });
          }
        } catch (e) {
          setLoading!(false);
          CommonBugFender('ProductDetailPage_updateCityStateByPincode', e);
        }
      })
      .catch((e) => {
        CommonBugFender('ProductDetailPage_updateCityStateByPincode', e);
      })
      .finally(() => setLoading!(false));
  };

  const onAddCartItem = (
    item?: pharmaSubstitution_pharmaSubstitution_substitutes,
    isFromFastSubstitutes?: boolean
  ) => {
    const medicine_details = item ? item : medicineDetails;
    const { sku } = medicine_details;
    if (serverCartItems?.find(({ sku }) => sku?.toUpperCase() === sku?.toUpperCase())) {
      setCurrentProductQuantityInCart(productQuantity);
      setUserActionPayload?.({
        medicineOrderCartLineItems: [
          {
            medicineSKU: sku,
            quantity: productQuantity,
          },
        ],
      });
    } else {
      setUserActionPayload?.({
        medicineOrderCartLineItems: [
          {
            medicineSKU: sku,
            quantity: productQuantity,
          },
        ],
      });
      setCurrentProductIdInCart(sku);
      setCurrentProductQuantityInCart(productQuantity);
    }
    postwebEngageAddToCartEvent(
      medicine_details,
      isFromFastSubstitutes ? 'PDP Fast Substitutes' : 'Pharmacy PDP',
      sectionName,
      '',
      pharmacyCircleAttributes!
    );
    postFirebaseAddToCartEvent(
      medicineDetails,
      'Pharmacy PDP',
      sectionName,
      '',
      pharmacyCircleAttributes!
    );
    let id = currentPatient && currentPatient.id ? currentPatient.id : '';
    postAppsFlyerAddToCartEvent(medicineDetails, id, pharmacyCircleAttributes!, medicineDetails.id);
  };

  const renderBottomButton = () => {
    const circleMember = !!cartCircleSubscriptionId;
    const showNudgeMessage =
      pharmaPDPNudgeMessage?.show === 'yes' &&
      ((circleMember && !!pharmaPDPNudgeMessage?.nudgeMessage) ||
        (!circleMember && !!pharmaPDPNudgeMessage?.nudgeMessageNonCircle));
    return (
      <StickyBottomComponent
        style={
          showNudgeMessage ? styles.bottomComponent : { justifyContent: 'center', shadowOpacity: 0 }
        }
      >
        {showNudgeMessage && <NudgeMessage nudgeMessage={pharmaPDPNudgeMessage} />}
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate(AppRoutes.ServerCart);
          }}
          activeOpacity={0.7}
          style={[styles.bottomCta, showNudgeMessage ? { alignSelf: 'center' } : {}]}
        >
          <Text style={styles.bottomCtaText}>
            {`Proceed to Checkout (${serverCartItems?.length} items) ${
              string.common.Rs
            }${convertNumberToDecimal(serverCartAmount?.cartTotal || 0)}`}
          </Text>
        </TouchableOpacity>
      </StickyBottomComponent>
    );
  };

  const showAccessAccessLocationPopup = (pincodeInput?: boolean) => {
    return showAphAlert!({
      unDismissable: false,
      removeTopIcon: true,
      children: !pincodeInput ? (
        <AccessLocation
          addresses={addresses}
          onPressSelectAddress={(address) => {
            updatePlaceInfoByPincode(address?.zipcode || '');
            setUserActionPayload?.({
              patientAddressId: address?.id,
              zipcode: address?.zipcode,
              latitude: address?.latitude,
              longitude: address?.longitude,
            });
            hideAphAlert!();
          }}
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
            autoDetectLocation(addresses);
          }}
          onPressPincode={() => {
            hideAphAlert!();
            showAccessAccessLocationPopup(true);
          }}
        />
      ) : (
        <PincodeInput
          onPressApply={(pincode) => {
            if (pincode?.length == 6) {
              hideAphAlert!();
              updatePlaceInfoByPincode(pincode);
            }
          }}
          onPressBack={() => showAccessAccessLocationPopup(false)}
        />
      ),
    });
  };

  const autoDetectLocation = (addresses: addressListType) => {
    setLoading!(true);
    doRequestAndAccessLocationModified()
      .then((response) => {
        setLoading!(false);
        updatePlaceInfoByPincode(response?.pincode);
        setUserActionPayload?.({
          zipcode: response?.pincode,
          latitude: response?.latitude,
          longitude: response?.longitude,
        });
      })
      .catch((e) => {
        setLoading!(false);
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

  const checkLocation = (addresses: addressListType) => {
    const defaultAddress = addresses.find((item) => item?.defaultAddress);
    !defaultAddress && !pharmacyLocation && showAccessAccessLocationPopup(false);
  };

  const onNotifyMeClick = () => {
    onNotifyMeClickPDP(isPharmacyPincodeServiceable, medicineDetails, pincode);
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${medicineDetails?.name} is back in stock.`,
    });
  };

  const onCompositionClick = () =>
    props.navigation.push(AppRoutes.MedicineListing, {
      searchText: medicineDetails?.PharmaOverview?.[0]?.Composition || composition,
      movedFrom: 'PDP Composition Hyperlink',
    });

  const showProceedButton = medicineDetails?.sku
    ? !!serverCartItems?.find(({ sku }) => sku === medicineDetails?.sku)
    : false;

  const renderDisclaimerMessage = () => {
    if (pdpDisclaimerMessage && isPharma) {
      return (
        <View style={{ marginHorizontal: 15 }}>
          <Text style={styles.disclaimerHeading}>Disclaimer</Text>
          <Text style={styles.disclaimerMessage}>{pdpDisclaimerMessage}</Text>
        </View>
      );
    } else return null;
  };

  const showManufacturerDetails = () =>
    !!(
      medicineDetails?.marketer_address ||
      medicineDetails?.country_of_origin ||
      medicineDetails?.packer_name ||
      medicineDetails?.packer_address ||
      medicineDetails?.importer_name ||
      medicineDetails?.importer_address ||
      medicineDetails?.import_date ||
      medicineDetails?.generic_name
    );

  const renderSimilarProductsList = () => {
    const showList = !!medicineDetails?.similar_products?.length && showSimilarProducts;
    return (
      showList && (
        <SimilarProducts
          heading={string.productDetailPage.SIMILAR_PRODUCTS}
          similarProducts={medicineDetails?.similar_products}
          navigation={props.navigation}
        />
      )
    );
  };

  const renderSubstitutesProductsList = () => {
    const showList = !!substitutes.length && isInStock && showSubstituteProducts;
    return (
      showList && (
        <SimilarProducts
          heading={string.productDetailPage.PRODUCT_SUBSTITUTES}
          similarProducts={substitutes}
          navigation={props.navigation}
          composition={medicineDetails?.PharmaOverview?.[0]?.Composition || composition}
          setShowSubstituteInfo={setShowSubstituteInfo}
        />
      )
    );
  };

  const renderAlsoBoughtProductsList = () => {
    const showList = !!medicineDetails?.crosssell_products?.length && showAlsoBoughtProducts;
    return (
      showList && (
        <SimilarProducts
          heading={string.productDetailPage.ALSO_BOUGHT}
          similarProducts={medicineDetails?.crosssell_products}
          navigation={props.navigation}
        />
      )
    );
  };

  const renderCouponSection = () => {
    if (couponDataLoading) {
      return renderPDPComponentsShimmer(styles.couponSectionShimmer);
    } else {
      return <CouponSectionPDP offersData={couponData} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.mainContainer}>
        <MedicineListingHeader
          navigation={props.navigation}
          movedFrom={'productdetail'}
          navSrcForSearchSuccess={'PDP'}
        />
        <View>
          {isMedicineError ? (
            renderEmptyData()
          ) : (
            <KeyboardAwareScrollView
              ref={scrollViewRef}
              bounces={false}
              keyboardShouldPersistTaps="always"
              onScroll={(event) => {
                // show bottom bar if ADD TO CART button scrolls off the screen
                buttonRef.current &&
                  buttonRef.current.measure(
                    (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                      setShowBottomBar(pagey < 0);
                    }
                  );

                // show product lists if it appears on the screen
                similarProductsRef.current &&
                  similarProductsRef.current.measure(
                    (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                      setShowSimilarProducts(windowHeight - pagey - 100 > 0);
                    }
                  );

                substituteProductsRef.current &&
                  substituteProductsRef.current.measure(
                    (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                      setShowSubstituteProducts(windowHeight - pagey - 100 > 0);
                    }
                  );

                alsoBoughtProductsRef.current &&
                  alsoBoughtProductsRef.current.measure(
                    (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                      setShowAlsoBoughtProducts(windowHeight - pagey - 100 > 0);
                    }
                  );
              }}
            >
              <ProductNameImage
                name={medicineDetails?.name}
                images={medicineDetails?.image}
                isPrescriptionRequired={medicineDetails?.is_prescription_required == 1}
                navigation={props.navigation}
                sku={medicineDetails?.sku}
                merchandising={medicineDetails?.merchandising}
              />
              <ProductPriceDelivery
                price={medicineDetails?.price}
                specialPrice={medicineDetails?.special_price}
                isExpress={medicineDetails?.is_express === 'Yes'}
                isInStock={isInStock}
                isSellOnline={medicineDetails?.sell_online === 1}
                showPincodePopup={showAccessAccessLocationPopup}
                deliveryTime={deliveryTime}
                deliveryError={deliveryError}
                isPharma={isPharma}
                cashback={cashback}
                finalPrice={finalPrice}
                showDeliverySpinner={showDeliverySpinner}
                isBanned={medicineDetails?.banned === 'Yes'}
                multiVariantAttributes={multiVariantAttributes}
                multiVariantProducts={multiVariantProducts}
                skusInformation={multiVariantSkuInformation}
                sku={medicineDetails?.sku}
                onSelectVariant={onSelectVariant}
              />
              <View
                ref={buttonRef}
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  setShowBottomBar(layout.y < 0);
                }}
              >
                <ProductQuantity
                  maxOrderQuantity={medicineDetails?.MaxOrderQty}
                  isInStock={isInStock}
                  packForm={medicineDetails?.pack_form || 'Quantity'}
                  packSize={medicineDetails?.pack_size}
                  productForm={medicineDetails?.product_form || ''}
                  unit={medicineDetails.unit_of_measurement || ''}
                  sku={medicineDetails?.sku}
                  onAddCartItem={onAddCartItem}
                  name={medicineDetails?.name}
                  productQuantity={productQuantity}
                  setProductQuantity={setProductQuantity}
                  setShowAddedToCart={setShowAddedToCart}
                  isSellOnline={medicineDetails?.sell_online === 1}
                  isBanned={medicineDetails?.banned === 'Yes'}
                  onNotifyMeClick={onNotifyMeClick}
                  isPharma={isPharma}
                  navigation={props.navigation}
                  setShowSubstituteInfo={setShowSubstituteInfo}
                />
              </View>
              <CircleBannerPDP navigation={props.navigation} />
              {isInStock && !!boughtTogether && boughtTogether.length > 0 && (
                <FrequentlyBoughtTogether
                  boughtTogetherArray={boughtTogether}
                  setShowAddedToCart={setShowAddedToCart}
                />
              )}
              {renderCouponSection()}
              <PharmaManufacturer
                manufacturer={medicineDetails?.manufacturer}
                composition={medicineDetails?.PharmaOverview?.[0]?.Composition || composition}
                consumeType={medicineDetails?.consume_type}
                onCompositionClick={onCompositionClick}
                isPharma={isPharma}
              />
              {!!substitutes.length && !isInStock && (
                <SimilarProducts
                  heading={string.productDetailPage.PRODUCT_SUBSTITUTES}
                  similarProducts={substitutes}
                  navigation={props.navigation}
                  composition={medicineDetails?.PharmaOverview?.[0]?.Composition || composition}
                  setShowSubstituteInfo={setShowSubstituteInfo}
                />
              )}
              <ProductInfo
                name={medicineDetails?.name}
                description={medicineDetails?.product_information}
                isReturnable={medicineDetails?.is_returnable === 'Yes'}
                vegetarian={medicineDetails?.vegetarian}
                storage={medicineDetails?.storage}
                key_ingredient={medicineDetails?.key_ingredient}
                key_benefits={medicineDetails?.key_benefits}
                safety_information={medicineDetails?.safety_information}
                size={medicineDetails?.size}
                flavour_fragrance={medicineDetails?.flavour_fragrance}
                colour={medicineDetails?.colour}
                variant={medicineDetails?.variant}
                expiryDate={medicineDetails?.expiry_date}
                isPharma={isPharma}
                pharmaOverview={
                  isPharma ? medicineDetails?.PharmaOverview?.[0]?.NewPharmaOverview : null
                }
                directionsOfUse={medicineDetails?.direction_for_use_dosage}
                allergen_info={medicineDetails?.allergen_info}
              />
              <View ref={substituteProductsRef}>{renderSubstitutesProductsList()}</View>
              <View ref={similarProductsRef}>{renderSimilarProductsList()}</View>
              <View ref={alsoBoughtProductsRef}>{renderAlsoBoughtProductsList()}</View>
              {showManufacturerDetails() && (
                <ProductManufacturer
                  address={medicineDetails?.marketer_address}
                  origin={medicineDetails?.country_of_origin}
                  packerName={medicineDetails?.packer_name}
                  packerAddress={medicineDetails?.packer_address}
                  importerName={medicineDetails?.importer_name}
                  importerAddress={medicineDetails?.importer_address}
                  importDate={medicineDetails?.import_date}
                  genericName={medicineDetails?.generic_name}
                />
              )}
              {renderDisclaimerMessage()}
              <View style={{ height: 170 }} />
            </KeyboardAwareScrollView>
          )}
          {!isEmptyObject(medicineDetails) &&
            !!medicineDetails.id &&
            showBottomBar &&
            medicineDetails?.sell_online === 1 && (
              <BottomStickyComponent
                isInStock={isInStock}
                sku={medicineDetails?.sku}
                onAddCartItem={onAddCartItem}
                price={medicineDetails?.price}
                specialPrice={medicineDetails?.special_price}
                productQuantity={productQuantity}
                setShowAddedToCart={setShowAddedToCart}
                isBanned={medicineDetails?.banned === 'Yes'}
                cashback={cashback}
                onNotifyMeClick={onNotifyMeClick}
              />
            )}
        </View>
        {!loading && showProceedButton && renderBottomButton()}
      </SafeAreaView>
      {showSuggestedQuantityNudge &&
        shownNudgeOnce === false &&
        !!medicineDetails?.suggested_qty &&
        +medicineDetails?.suggested_qty > 1 &&
        currentProductQuantityInCart < +medicineDetails?.suggested_qty && (
          <SuggestedQuantityNudge
            suggested_qty={medicineDetails?.suggested_qty}
            sku={medicineDetails?.sku}
            packForm={medicineDetails?.pack_form}
            maxOrderQty={medicineDetails?.MaxOrderQty}
            setShownNudgeOnce={setShownNudgeOnce}
            showSuggestedQuantityNudge={showSuggestedQuantityNudge}
            setShowSuggestedQuantityNudge={setShowSuggestedQuantityNudge}
            setCurrentProductQuantityInCart={setCurrentProductQuantityInCart}
          />
        )}

      {showAddedToCart && (
        <Overlay
          onRequestClose={() => {}}
          isVisible={true}
          windowBackgroundColor={'rgba(255, 255, 255, 0.6)'}
          overlayStyle={styles.overlayStyle}
        >
          <View style={styles.flexRow}>
            <WhiteTickIcon style={styles.whiteIcon} />
            <Text style={styles.overlayText}>Added to cart</Text>
          </View>
        </Overlay>
      )}
      {showSubstituteInfo && (
        <Overlay
          onRequestClose={() => {
            setShowSubstituteInfo(false);
          }}
          onBackdropPress={() => setShowSubstituteInfo(false)}
          isVisible={true}
          windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
          overlayStyle={[styles.overlayStyle, styles.susbtituteOverlay]}
        >
          <View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowSubstituteInfo(false);
              }}
            >
              <Text style={{ color: '#02475B' }}>X</Text>
            </TouchableOpacity>
            <Text style={styles.susbtituteHeading}>
              {`Substitutes are product with same molecular composition`}
            </Text>
            <Text style={styles.susbtitutesubHeading}>
              {`Substitute brands can only be ordered`}
            </Text>
            <Text style={styles.susbtituteText}>{`- If it’s mentioned on the prescription`}</Text>
            <Text style={styles.susbtituteText}>
              {`- Or if the doctor has prescribed the salt`}
            </Text>
            <Text style={styles.susbtituteText}>
              {`- Or if the doctor has written on prescription that substitute is ok`}
            </Text>
          </View>
        </Overlay>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overlayStyle: {
    padding: 0,
    width: 'auto',
    height: 'auto',
    backgroundColor: '#02475B',
    elevation: 0,
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  overlayText: {
    ...theme.viewStyles.text('R', 14, '#FFFFFF', 1, 25, 0.35),
  },
  susbtituteHeading: {
    ...theme.viewStyles.text('B', 15, '#02475B', 1, 17, 0.35),
  },
  susbtitutesubHeading: {
    marginTop: 15,
    marginBottom: 10,
    ...theme.viewStyles.text('M', 15, '#02475B', 1, 17, 0.35),
  },
  susbtituteText: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 25, 0.35),
  },
  flexRow: {
    flexDirection: 'row',
  },
  whiteIcon: {
    resizeMode: 'contain',
    width: 18,
    height: 20,
    marginTop: 3,
    marginRight: 3,
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: theme.colors.WHITE,
    padding: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 30,
    zIndex: 9,
    top: -50,
    right: -20,
  },
  susbtituteOverlay: {
    backgroundColor: '#FFFFFF',
    width: '75%',
    paddingVertical: 20,
    borderRadius: 10,
  },
  stickyBottomComponent: {
    ...theme.viewStyles.shadowStyle,
    borderTopWidth: 0.6,
    borderStyle: 'dashed',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
  },
  bottomCta: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FCB716',
    paddingVertical: 5,
    marginTop: 0,
    marginVertical: 10,
    marginBottom: 15,
    width: '90%',
    justifyContent: 'center',
  },
  bottomCtaText: {
    ...theme.viewStyles.text('B', 14, '#FFFFFF', 1, 25, 0.35),
    textAlign: 'center',
  },
  disclaimerHeading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 35, 0.35),
    marginTop: 7,
  },
  disclaimerMessage: theme.viewStyles.text('R', 14, '#02475B', 1, 17, 0.35),
  bottomComponent: {
    shadowOpacity: 0,
    height: 100,
    flexDirection: 'column',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  couponSectionShimmer: {
    height: 200,
    borderRadius: 10,
    width: '95%',
    marginVertical: 10,
    marginHorizontal: 10,
  },
});
