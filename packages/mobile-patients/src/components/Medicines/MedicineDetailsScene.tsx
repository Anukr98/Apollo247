import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  CartIcon,
  DropdownGreen,
  MedicineIcon,
  MedicineRxIcon,
  CheckBoxFilled,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { helpers } from '@aph/mobile-patients/src/components/MedicineDetails';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getMedicineDetailsApi,
  getSubstitutes,
  MedicineProduct,
  MedicineProductDetails,
  trackTagalysEvent,
  getDeliveryTAT247,
  TatApiInput247,
  getPlaceInfoByPincode,
  pinCodeServiceabilityApi247,
  availabilityApi247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  isEmptyObject,
  postWebEngageEvent,
  postwebEngageAddToCartEvent,
  postFirebaseAddToCartEvent,
  postAppsFlyerAddToCartEvent,
  g,
  getDiscountPercentage,
  getCareCashback,
  savePastSearch,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
} from 'react-native';
import { Image } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import HTML from 'react-native-render-html';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  ProductPageViewedSource,
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import { ProductList } from '@aph/mobile-patients/src/components/Medicines/ProductList';
import { ProductUpSellingCard } from '@aph/mobile-patients/src/components/Medicines/ProductUpSellingCard';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  GetSubscriptionsOfUserByStatusVariables,
  GetSubscriptionsOfUserByStatus,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { GET_SUBSCRIPTIONS_OF_USER_BY_STATUS } from '@aph/mobile-patients/src/graphql/profiles';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
  mainView: {
    paddingTop: 20,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 3.5,
  },
  labelViewStyle: {
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...theme.viewStyles.lightSeparatorStyle,
  },
  noteContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 0.6, 20, 0.04),
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.light_label,
    letterSpacing: 0.35,
    marginBottom: 2,
  },
  description: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.25,
    marginBottom: 8,
  },
  bottomView: {
    flex: 1,
  },
  bottonButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginHorizontal: 5,
    paddingBottom: 10,
    ...theme.viewStyles.shadowStyle,
    shadowOpacity: 0.8,
  },
  bottomButtonStyle: {
    width: '45%',
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginTop: 15,
    marginBottom: 24,
  },
  imageView: {
    width: 80,
    height: 80,
    marginLeft: 20,
    borderRadius: 40,
    ...theme.viewStyles.shadowStyle,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorImage: {
    width: 56,
    height: 56,
  },
  iconOrImageContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(16),
    textTransform: 'capitalize',
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgelabelView: {
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
  badgelabelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
  visitPharmacyText: {
    ...theme.viewStyles.text('M', 17, '#0087BA'),
    paddingBottom: 10,
  },
  notForSaleContainer: { alignSelf: 'center' },
  notForSaleText: {
    ...theme.viewStyles.text('B', 14, '#fff', 1),
    marginVertical: 6,
    marginHorizontal: 12,
  },
  stickyBottomComponent: { height: 'auto', flexDirection: 'column' },
  careCardContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    padding: 15,
    marginBottom: 20,
    borderColor: '#00B38E',
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  checkBoxIconStyle: {
    borderRadius: 50,
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginRight: 10,
    marginTop: 5,
  },
  careTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  careRedBox: {
    width: 30,
    height: 30,
    backgroundColor: '#F0533B',
    borderRadius: 5,
    marginRight: 15,
  },
  getCareText: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 20),
    flexWrap: 'wrap',
  },
  careSubscribeButton: {
    ...theme.viewStyles.text('SB', 16, '#FC9916', 1, 18),
    textAlign: 'right',
    marginTop: 15,
  },
  circleText: {
    ...theme.viewStyles.text('M', 10, '#02475B', 1, 15),
    paddingVertical: 2,
    marginLeft: -4,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 38,
    height: 20,
  },
  careBanner: {
    resizeMode: 'contain',
    width: '100%',
    height: 200,
  },
  priceView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  discountPriceView: {
    display: 'flex',
    flexDirection: 'row',
  },
  mrp: {
    ...theme.viewStyles.text('SB', 13, '#02475b', 1, 20, 0.35),
  },
  price: {
    ...theme.viewStyles.text('SB', 17, '#02475b', 1, 20, 0.35),
  },
  priceStrikeOff: {
    ...theme.viewStyles.text('M', 13, '#01475b', 1, 20, 0.35),
    textDecorationLine: 'line-through',
    color: '#01475b',
    opacity: 0.6,
    paddingRight: 5,
  },
  discountPercentage: {
    ...theme.viewStyles.text('M', 13, '#00B38E', 1, 20, 0.35),
  },
});

type PharmacyTatApiCalled = WebEngageEvents[WebEngageEventName.PHARMACY_TAT_API_CALLED];

export type ProductPageViewedEventProps = Pick<
  WebEngageEvents[WebEngageEventName.PRODUCT_PAGE_VIEWED],
  'CategoryID' | 'CategoryName' | 'SectionName'
>;

export interface MedicineDetailsSceneProps
  extends NavigationScreenProps<{
    sku: string;
    /** movedFrom prop is mandatory. It is used as source in Product page viewed event */
    movedFrom: ProductPageViewedSource;
    productPageViewedEventProps?: ProductPageViewedEventProps;
    deliveryError: string;
    sectionName?: string;
  }> {}

export const MedicineDetailsScene: React.FC<MedicineDetailsSceneProps> = (props) => {
  const _deliveryError = props.navigation.getParam('deliveryError');
  const sectionName = props.navigation.getParam('sectionName');
  const [medicineDetails, setmedicineDetails] = useState<MedicineProductDetails>(
    {} as MedicineProductDetails
  );
  const client = useApolloClient();
  const [tatEventData, setTatEventData] = useState<PharmacyTatApiCalled>();
  const {
    locationDetails,
    pharmacyLocation,
    isPharmacyLocationServiceable,
    setAxdcCode,
  } = useAppCommonData();
  const { currentPatient } = useAllCurrentPatients();
  const pharmacyPincode = g(pharmacyLocation, 'pincode') || g(locationDetails, 'pincode');

  const [apiError, setApiError] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setselectedTab] = useState<string>('');
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [deliveryError, setdeliveryError] = useState<string>(_deliveryError || '');
  const [pincode, setpincode] = useState<string>(pharmacyPincode || '');
  const [showDeliverySpinner, setshowDeliverySpinner] = useState<boolean>(false);
  const [Substitutes, setSubstitutes] = useState<MedicineProductDetails[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [medicineError, setMedicineError] = useState<string>('Product Details Not Available!');
  const [popupHeight, setpopupHeight] = useState<number>(60);
  const [notServiceable, setNotServiceable] = useState<boolean>(false);
  const [isCircleSubscribed, setIsCircleSubscribed] = useState<boolean>(false);

  const { showAphAlert, setLoading: setGlobalLoading } = useUIElements();

  const overview = medicineDetails?.PharmaOverview?.[0]?.Overview;
  const medicineOverview =
    !overview || typeof overview == 'string' ? [] : helpers.getMedicineOverview(overview || []);

  const sku = props.navigation.getParam('sku'); // 'MED0017';

  const {
    addCartItem,
    cartItems,
    updateCartItem,
    removeCartItem,
    setCircleSubscriptionId,
    setIsCircleSubscription,
    setHdfcSubscriptionId,
    setHdfcPlanName,
    setIsFreeDelivery,
    circleSubscriptionId,
    setCirclePlanValidity,
    pharmacyCircleAttributes,
  } = useShoppingCart();
  const {
    cartItems: diagnosticCartItems,
    setIsDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const hdfc_values = string.Hdfc_values;
  const getItemQuantity = (id: string) => {
    const foundItem = cartItems.find((item) => item.id == id);
    return foundItem ? foundItem.quantity : 0;
  };
  const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == sku) != -1;
  const isOutOfStock = !medicineDetails!.is_in_stock;
  const medicineName = medicineDetails.name;
  const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);
  const cartItemsCount = cartItems.length + diagnosticCartItems.length;
  const movedFrom = props.navigation.getParam('movedFrom');
  const productPageViewedEventProps = props.navigation.getParam('productPageViewedEventProps');

  const { special_price, price, type_id } = medicineDetails;
  const finalPrice = price - special_price ? special_price : price;
  const cashback = getCareCashback(Number(finalPrice), type_id);

  useEffect(() => {
    if (!_deliveryError) {
      fetchDeliveryTime(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    getMedicineDetailsApi(sku)
      .then(({ data }) => {
        const productDetails = g(data, 'productdp', '0' as any);
        if (productDetails) {
          setmedicineDetails(productDetails || {});
          postProductPageViewedEvent(productDetails);
          trackTagalysViewEvent(productDetails);
          savePastSearch(client, {
            typeId: productDetails.sku,
            typeName: productDetails.name,
            type: SEARCH_TYPE.MEDICINE,
            patient: currentPatient?.id,
            image: productDetails.thumbnail,
          });

          if (_deliveryError) {
            setTimeout(() => {
              scrollViewRef.current && scrollViewRef.current.scrollToEnd();
            }, 20);
          }
        } else if (data && data.message) {
          setMedicineError(data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        CommonBugFender('MedicineDetailsScene_getMedicineDetailsApi', err);
        aphConsole.log('MedicineDetailsScene err\n', err);
        setApiError(!!err);
        setLoading(false);
      });
    fetchSubstitutes();
  }, []);

  useEffect(() => {
    if (medicineOverview.length > 0) {
      selectedTab === '' && setselectedTab(medicineOverview[0].Caption);
    }
  }, [medicineOverview]);

  useEffect(() => {
    if (!!deliveryTime || !!deliveryError) {
      setTimeout(() => {
        scrollViewRef.current && scrollViewRef.current.scrollToEnd();
      }, 10);
    }
  }, [deliveryTime, deliveryError]);

  useEffect(() => {
    try {
      if (medicineDetails?.price && tatEventData) {
        const eventAttributes: PharmacyTatApiCalled = {
          ...tatEventData,
          Input_MRP: medicineDetails.price,
          Response_MRP: tatEventData.Response_MRP * Number(medicineDetails.mou || 1),
        };
        postWebEngageEvent(WebEngageEventName.PHARMACY_TAT_API_CALLED, eventAttributes);
      }
    } catch (error) {}
  }, [medicineDetails, tatEventData]);

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
      CommonBugFender(`${AppRoutes.MedicineDetailsScene}_trackTagalysEvent`, error);
    }
  };

  const postProductPageViewedEvent = ({ sku, name, is_in_stock }: MedicineProductDetails) => {
    if (movedFrom) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.PRODUCT_PAGE_VIEWED] = {
        source: movedFrom,
        ProductId: sku,
        ProductName: name,
        Stockavailability: !!is_in_stock ? 'Yes' : 'No',
        ...productPageViewedEventProps,
        ...pharmacyCircleAttributes,
      };
      postWebEngageEvent(WebEngageEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
      postAppsFlyerEvent(AppsFlyerEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
      postFirebaseEvent(FirebaseEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
    }
  };

  const onAddCartItem = (item: MedicineProductDetails | MedicineProduct) => {
    const {
      sku,
      mou,
      name,
      price,
      special_price,
      is_prescription_required,
      type_id,
      thumbnail,
      MaxOrderQty,
    } = item;
    addCartItem!({
      id: sku,
      mou,
      name,
      price: price,
      specialPrice: special_price
        ? typeof special_price == 'string'
          ? Number(special_price)
          : special_price
        : undefined,
      prescriptionRequired: is_prescription_required == '1',
      isMedicine: (type_id || '').toLowerCase() == 'pharma',
      quantity: 1,
      thumbnail: thumbnail,
      isInStock: true,
      maxOrderQty: MaxOrderQty,
      productType: type_id,
    });
    postwebEngageAddToCartEvent(item, 'Pharmacy PDP', sectionName, '', pharmacyCircleAttributes!);
    postFirebaseAddToCartEvent(item, 'Pharmacy PDP', sectionName, '', pharmacyCircleAttributes!);
    let id = currentPatient && currentPatient.id ? currentPatient.id : '';
    postAppsFlyerAddToCartEvent(item, id, pharmacyCircleAttributes!);
  };

  const updateQuantityCartItem = (
    { sku }: Pick<MedicineProductDetails, 'sku'>,
    quantity: number
  ) => {
    updateCartItem!({
      id: sku,
      quantity,
    });
  };

  const fetchDeliveryTime = async (checkButtonClicked?: boolean) => {
    if (!pincode) return;
    const unServiceableMsg = 'Sorry, not serviceable in your area.';
    const pincodeServiceableItemOutOfStockMsg = 'Sorry, this item is out of stock in your area.';
    const genericServiceableDate = moment()
      .add(2, 'days')
      .set('hours', 20)
      .set('minutes', 0)
      .format('DD-MMM-YYYY hh:mm');
    Keyboard.dismiss();
    setshowDeliverySpinner(true);

    // To handle deeplink scenario and
    // If we performed pincode serviceability check already in Medicine Home Screen and the current pincode is same as Pharma pincode
    try {
      const response = await pinCodeServiceabilityApi247(pincode);
      const { data } = response;
      setAxdcCode && setAxdcCode(data?.response?.axdcCode);
      let pinCodeNotServiceable =
        isPharmacyLocationServiceable == undefined || pharmacyPincode != pincode
          ? !data?.response?.servicable
          : pharmacyPincode == pincode && !isPharmacyLocationServiceable;
      setNotServiceable(pinCodeNotServiceable);
      if (pinCodeNotServiceable) {
        setdeliveryTime('');
        setdeliveryError(unServiceableMsg);
        setshowDeliverySpinner(false);
        return;
      }

      const checkAvailabilityRes = await availabilityApi247(pincode, sku);
      const outOfStock = !!!checkAvailabilityRes?.data?.response[0]?.exist;
      try {
        const { mrp, exist, qty } = checkAvailabilityRes.data.response[0];
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_AVAILABILITY_API_CALLED] = {
          Source: 'PDP',
          Input_SKU: sku,
          Input_Pincode: pincode,
          Input_MRP: medicineDetails?.price,
          No_of_items_in_the_cart: 1,
          Response_Exist: exist ? 'Yes' : 'No',
          Response_MRP: mrp,
          Response_Qty: qty,
        };
        postWebEngageEvent(WebEngageEventName.PHARMACY_AVAILABILITY_API_CALLED, eventAttributes);
      } catch (error) {}

      if (outOfStock) {
        setdeliveryTime('');
        setdeliveryError(pincodeServiceableItemOutOfStockMsg);
        setshowDeliverySpinner(false);
        return;
      }

      let longitude, lattitude;
      if (pharmacyPincode == pincode) {
        lattitude = pharmacyLocation
          ? pharmacyLocation.latitude
          : locationDetails
          ? locationDetails.latitude
          : null;
        longitude = pharmacyLocation
          ? pharmacyLocation.longitude
          : locationDetails
          ? locationDetails.longitude
          : null;
      }
      if (!lattitude || !longitude) {
        const data = await getPlaceInfoByPincode(pincode);
        const locationData = data.data.results[0].geometry.location;
        lattitude = locationData.lat;
        longitude = locationData.lng;
      }

      getDeliveryTAT247({
        items: [{ sku: sku, qty: getItemQuantity(sku) || 1 }],
        pincode: pincode,
        lat: lattitude,
        lng: longitude,
      } as TatApiInput247)
        .then((res) => {
          const deliveryDate = g(res, 'data', 'response', 'tat');
          const currentDate = moment();
          if (deliveryDate) {
            if (checkButtonClicked) {
              const eventAttributes: WebEngageEvents[WebEngageEventName.PRODUCT_DETAIL_PINCODE_CHECK] = {
                'product id': sku,
                'product name': medicineDetails.name,
                pincode: Number(pincode),
                'customer id': currentPatient && currentPatient.id ? currentPatient.id : '',
                'Delivery TAT': moment(
                  deliveryDate,
                  AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT
                ).diff(currentDate, 'd'),
                Serviceable: pinCodeNotServiceable ? 'No' : 'Yes',
              };
              postWebEngageEvent(WebEngageEventName.PRODUCT_DETAIL_PINCODE_CHECK, eventAttributes);
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
          try {
            const response = res.data.response;
            const item = response.items[0];
            const eventAttributes: PharmacyTatApiCalled = {
              Source: 'PDP',
              Input_sku: sku,
              Input_qty: getItemQuantity(sku) || 1,
              Input_lat: lattitude,
              Input_long: longitude,
              Input_pincode: pincode,
              Input_MRP: medicineDetails?.price, // overriding this value after PDP API call
              No_of_items_in_the_cart: 1,
              Response_Exist: item.exist ? 'Yes' : 'No',
              Response_MRP: item.mrp, // overriding this value after PDP API call
              Response_Qty: item.qty,
              Response_lat: response.lat,
              Response_lng: response.lng,
              Response_ordertime: response.ordertime,
              Response_pincode: `${response.pincode}`,
              Response_storeCode: response.storeCode,
              Response_storeType: response.storeType,
              Response_tat: response.tat,
              Response_tatU: response.tatU,
            };
            setTatEventData(eventAttributes);
          } catch (error) {}
        })
        .catch(() => {
          // Intentionally show T+2 days as Delivery Date
          setdeliveryTime(genericServiceableDate);
          setdeliveryError('');
        })
        .finally(() => setshowDeliverySpinner(false));
    } catch (error) {
      // in case user entered wrong pincode, not able to get lat lng. showing out of stock to user
      setdeliveryError(pincodeServiceableItemOutOfStockMsg);
      setdeliveryTime('');
      setshowDeliverySpinner(false);
    }
  };

  const fetchSubstitutes = () => {
    getSubstitutes(sku)
      .then(({ data }) => {
        try {
          if (data) {
            if (
              data.products &&
              typeof data.products === 'object' &&
              Array.isArray(data.products)
            ) {
              setSubstitutes(data.products);
              setTimeout(() => {
                scrollViewRef.current && scrollViewRef.current.scrollToEnd();
              }, 20);
            }
          }
        } catch (error) {
          CommonBugFender('MedicineDetailsScene_fetchSubstitutes_try', error);
        }
      })
      .catch((err) => {
        CommonBugFender('MedicineDetailsScene_fetchSubstitutes', err);
      });
  };

  const postwebEngageNotifyMeEvent = ({
    name,
    sku,
    category_id,
  }: Pick<MedicineProduct, 'name' | 'sku' | 'category_id'>) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.NOTIFY_ME] = {
      'product name': name,
      'product id': sku,
      Brand: '',
      'Brand ID': '',
      'category name': '',
      'category ID': category_id!,
      pincode: pincode,
    };
    postWebEngageEvent(WebEngageEventName.NOTIFY_ME, eventAttributes);
  };

  const renderVisitPharmacyText = () => (
    <Text style={styles.visitPharmacyText}>{'Please visit nearest Apollo pharmacy store'}</Text>
  );

  const renderNotForSaleTag = () => (
    <NotForSaleBadge
      textStyle={styles.notForSaleText}
      containerStyle={styles.notForSaleContainer}
    />
  );

  const renderCareCashback = () => {
    if (!!cashback) {
      return (
        <>
          <CareCashbackBanner
            bannerText={`extra cashback ${string.common.Rs}${cashback.toFixed(2)}`}
            textStyle={styles.circleText}
            logoStyle={styles.circleLogo}
          />
          <Text style={theme.viewStyles.text('R', 11, '#02475B', 1, 17)}>
            Effective price for you
            <Text style={{ fontWeight: 'bold' }}>
              {' '}
              {string.common.Rs}
              {(finalPrice - cashback).toFixed(2)}
            </Text>
          </Text>
        </>
      );
    } else {
      return <></>;
    }
  };

  const renderBottomButtons = () => {
    const itemQty = getItemQuantity(sku);
    const addToCart = () => updateQuantityCartItem(medicineDetails, itemQty + 1);
    const removeItemFromCart = () => updateQuantityCartItem(medicineDetails, itemQty - 1);
    const removeFromCart = () => removeCartItem!(sku);
    const { special_price, price } = medicineDetails;
    const discountPercent = getDiscountPercentage(price, special_price);
    const showOutOfStockView = medicineDetails?.sell_online
      ? (!showDeliverySpinner && !deliveryTime) || deliveryError || isOutOfStock
      : false;

    return notServiceable ? null : (
      <StickyBottomComponent style={styles.stickyBottomComponent}>
        {!medicineDetails.sell_online && renderVisitPharmacyText()}
        {showOutOfStockView ? (
          <View
            style={{
              paddingTop: 8,
              paddingBottom: 16,
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Text
              style={[
                theme.viewStyles.text('SB', 14, '#890000', 1, undefined, 0.35),
                { alignItems: 'center', paddingBottom: 16 },
              ]}
            >
              Out Of Stock
            </Text>
            <Button
              title={'NOTIFY WHEN IN STOCK'}
              style={{ backgroundColor: theme.colors.WHITE, width: '75%' }}
              titleTextStyle={{ color: '#fc9916' }}
              onPress={() => {
                postwebEngageNotifyMeEvent(medicineDetails);
                moveBack();
                showAphAlert!({
                  title: 'Okay! :)',
                  description: `You will be notified when ${medicineName} is back in stock.`,
                });
              }}
            />
          </View>
        ) : (
          <View style={styles.bottomView}>
            <View style={styles.bottonButtonContainer}>
              <View style={styles.priceView}>
                <Text style={styles.price}>
                  {discountPercent
                    ? `MRP ${string.common.Rs}${convertNumberToDecimal(
                        medicineDetails?.special_price
                      )}`
                    : `MRP ${string.common.Rs}${convertNumberToDecimal(medicineDetails?.price)}`}
                </Text>
                {!!medicineDetails.special_price && (
                  <View style={styles.discountPriceView}>
                    {/* <Text style={styles.mrp}>{'MRP '}</Text> */}
                    <Text style={styles.priceStrikeOff}>
                      ({string.common.Rs}
                      {convertNumberToDecimal(medicineDetails?.price)})
                    </Text>
                    <Text style={styles.discountPercentage}>{discountPercent}% off</Text>
                  </View>
                )}
                {!!circleSubscriptionId && renderCareCashback()}
              </View>
              {!medicineDetails.sell_online ? (
                renderNotForSaleTag()
              ) : isMedicineAddedToCart ? (
                <AddToCartButtons
                  numberOfItemsInCart={itemQty}
                  maxOrderQty={medicineDetails.MaxOrderQty}
                  addToCart={addToCart}
                  removeItemFromCart={removeItemFromCart}
                  removeFromCart={removeFromCart}
                  isSolidContainer={true}
                  containerStyle={{
                    height: 40,
                    width: '45%',
                    borderColor: '#fcb716',
                    borderRadius: 10,
                    backgroundColor: '#fcb716',
                    justifyContent: 'space-between',
                  }}
                  deleteIconStyle={{
                    resizeMode: 'contain',
                    width: 8,
                    height: 23,
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}
                  plusIconStyle={{
                    resizeMode: 'contain',
                    width: 8,
                    height: 23,
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}
                  minusIconStyle={{
                    resizeMode: 'contain',
                    width: 8,
                    height: 23,
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}
                />
              ) : (
                <Button
                  onPress={() => {
                    onAddCartItem(medicineDetails);
                  }}
                  title={'ADD TO CART'}
                  disabled={isMedicineAddedToCart || isOutOfStock}
                  disabledStyle={styles.bottomButtonStyle}
                  style={styles.bottomButtonStyle}
                />
              )}
            </View>
          </View>
        )}
      </StickyBottomComponent>
    );
  };

  const renderNote = () => {
    if (medicineDetails!.is_prescription_required == '1') {
      return (
        <>
          <View style={styles.noteContainerStyle}>
            <Text style={styles.noteText}>This medicine requires doctor’s prescription</Text>
            <MedicineRxIcon />
          </View>
        </>
      );
    } else {
      return <View style={[styles.separatorStyle, { marginTop: 4 }]} />;
    }
  };

  const renderTopView = () => {
    const imagesListLength = g(medicineDetails, 'image', 'length');
    return (
      <View style={styles.mainView}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorNameStyle}>{medicineDetails.name}</Text>
            {renderBasicDetails()}
          </View>
          <View>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.imageView}
              onPress={() => {
                if (imagesListLength) {
                  props.navigation.navigate(AppRoutes.ImageSliderScreen, {
                    images: (g(medicineDetails, 'image') || []).map(
                      (imgPath) => `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${imgPath}`
                    ),
                    heading: medicineDetails.name,
                  });
                }

                const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_DETAIL_IMAGE_CLICK] = {
                  'Product ID': sku,
                  'Product Name': medicineName,
                };
                postWebEngageEvent(WebEngageEventName.PHARMACY_DETAIL_IMAGE_CLICK, eventAttributes);
              }}
            >
              {!!imagesListLength ? (
                <Image
                  placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
                  source={{
                    uri: `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${medicineDetails.image[0]}`,
                  }}
                  style={styles.doctorImage}
                />
              ) : (
                renderIconOrImage(medicineDetails)
              )}
            </TouchableOpacity>
            {!!imagesListLength && (
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={[
                    theme.viewStyles.text('SB', 8, '#0087ba', 1, undefined, 0.2),
                    { paddingTop: 8, marginLeft: 20 },
                  ]}
                >
                  {`${imagesListLength} PHOTO${imagesListLength > 1 ? 'S' : ''}`}
                </Text>
              </View>
            )}
          </View>
        </View>
        {renderNote()}
        {medicineOverview.length === 0 ? renderInfo() : null}
        {isCircleSubscribed && renderCircleSubscribeSuccess()}
      </View>
    );
  };

  const renderCircleSubscribeSuccess = () => {
    return (
      <View style={styles.careCardContainer}>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <CheckBoxFilled style={styles.checkBoxIconStyle} />
          <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 30)}>Yay!</Text>
          <CareCashbackBanner
            bannerText={`membership added to your cart!`}
            textStyle={{
              ...theme.viewStyles.text('SB', 14, '#02475B', 1, 20),
            }}
            logoStyle={{
              width: 60,
              height: 35,
            }}
          />
        </View>
      </View>
    );
  };

  const filterHtmlContent = (content: string = '') => {
    return content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;rn/g, '>')
      .replace(/&gt;r/g, '>')
      .replace(/&gt;/g, '>')
      .replace(/\.t/g, '.');
  };

  const renderTabComponent = () => {
    const selectedTabdata = medicineOverview.filter((item) => item.Caption === selectedTab);
    let description =
      selectedTabdata.length && !!selectedTabdata[0].CaptionDesc
        ? selectedTabdata[0].CaptionDesc
        : '';
    description = filterHtmlContent(description);

    return (
      <View
        style={[
          {
            backgroundColor: theme.colors.WHITE,
            flex: 1,
            padding: 20,
            ...theme.viewStyles.shadowStyle,
            marginBottom: 30,
          },
        ]}
      >
        <View>
          {!!description && (
            <HTML
              html={description}
              baseFontStyle={{
                ...theme.viewStyles.text('M', 14, '#0087ba', 1, 22),
              }}
              imagesMaxWidth={Dimensions.get('window').width}
            />
          )}
        </View>
      </View>
    );
  };

  const renderTabs = () => {
    const data = medicineOverview.map((item) => {
      return {
        title: item.Caption,
      };
    });

    return (
      <>
        <TabsComponent
          data={data}
          selectedTab={selectedTab}
          onChange={(selectedTab) => {
            const eventAttributes: WebEngageEvents[WebEngageEventName.PRODUCT_DETAIL_TAB_CLICKED] = {
              tabName: selectedTab,
            };
            postWebEngageEvent(WebEngageEventName.PRODUCT_DETAIL_TAB_CLICKED, eventAttributes);
            setselectedTab(selectedTab);
          }}
          scrollable={true}
          tabViewStyle={{ width: 'auto' }}
          selectedTitleStyle={theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE)}
          titleStyle={theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE)}
        />
        {renderTabComponent()}
      </>
    );
  };

  const renderInfo = () => {
    const description = filterHtmlContent(medicineDetails.description);

    if (!!description)
      return (
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              ...theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE, 1),
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 17,
            }}
          >
            Product Information
          </Text>
          <View
            style={[
              {
                backgroundColor: theme.colors.WHITE,
                flex: 1,
                padding: 20,
                ...theme.viewStyles.shadowStyle,
              },
            ]}
          >
            <View>
              <HTML
                html={description}
                baseFontStyle={{
                  ...theme.viewStyles.text('M', 14, '#0087ba', 1),
                }}
                imagesMaxWidth={Dimensions.get('window').width}
              />
            </View>
          </View>
        </View>
      );
  };

  const renderIconOrImage = (data: MedicineProductDetails) => {
    return (
      <View style={styles.iconOrImageContainerStyle}>
        {data.image ? (
          <Image
            placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
            source={{ uri: AppConfig.Configuration.IMAGES_BASE_URL[0] + data.image }}
            style={{ height: 40, width: 40 }}
            resizeMode="contain"
          />
        ) : data.is_prescription_required ? (
          <MedicineRxIcon />
        ) : (
          <MedicineIcon />
        )}
      </View>
    );
  };

  const renderSubstitutes = () => {
    const localStyles = StyleSheet.create({
      containerStyle: {},
      iconAndDetailsContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    });

    return (
      <View style={{ marginBottom: 10 }}>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>SUBSTITUTE DRUGS</Text>
        </View>
        <View style={styles.cardStyle}>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowPopup(true)}>
            <View style={localStyles.containerStyle}>
              <View style={localStyles.iconAndDetailsContainerStyle}>
                <Text style={{ ...theme.viewStyles.text('M', 17, '#01475b', 1, 24, 0) }}>
                  {`Pick from ${Substitutes.length} available substitute${
                    Substitutes.length > 1 ? 's' : ''
                  }`}
                </Text>
                <DropdownGreen />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDeliveryView = () => {
    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>CHECK DELIVERY TIME</Text>
        </View>
        <View style={[styles.cardStyle, { padding: 0 }]}>
          <View
            style={{
              padding: 16,
              paddingBottom: 3,
              paddingTop: 10,
            }}
          >
            <TextInputComponent
              placeholder={'Enter Pin Code'}
              value={pincode}
              onChangeText={(pincode) => {
                if (/^\d+$/.test(pincode) || pincode == '') {
                  setpincode(pincode);
                  setdeliveryError('');
                  setdeliveryTime('');
                }
              }}
              maxLength={6}
              keyboardType="numeric"
            />
            <View
              style={{
                position: 'absolute',
                right: 16,
                top: 10,
              }}
            >
              <Text
                style={[
                  theme.viewStyles.yellowTextStyle,
                  { opacity: pincode.length === 6 ? 1 : 0.21, padding: 5 },
                ]}
                onPress={() => (pincode.length === 6 ? fetchDeliveryTime(true) : {})}
                suppressHighlighting={pincode.length !== 6}
              >
                CHECK
              </Text>
            </View>

            {!!deliveryTime ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                }}
              >
                <Text style={theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0)}>
                  Delivery Time
                </Text>
                <Text
                  style={[
                    theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0),
                    { fontWeight: 'bold', flex: 1, marginLeft: 10, textAlign: 'right' },
                  ]}
                >
                  By{' '}
                  {moment(
                    deliveryTime,
                    AppConfig.Configuration.MED_DELIVERY_DATE_TAT_API_FORMAT
                  ).format(AppConfig.Configuration.MED_DELIVERY_DATE_DISPLAY_FORMAT)}
                </Text>
              </View>
            ) : !!deliveryError ? (
              <Text style={[theme.viewStyles.text('R', 10, '#890000'), { marginBottom: 6 }]}>
                {deliveryError}
              </Text>
            ) : null}
          </View>
          {showDeliverySpinner && <Spinner style={{ backgroundColor: 'transparent' }} />}
        </View>
      </View>
    );
  };

  const formatComposition = (value: string) => {
    return value
      ? value.indexOf('+') > -1
        ? value.split('+').map((item) => item.trim())
        : [value]
      : [];
  };

  const renderBasicDetails = () => {
    if (!loading && !apiError) {
      let composition = '';
      const description = medicineDetails.name;
      const pack = medicineDetails.mou;
      const price = medicineDetails.price;
      const pharmaOverview =
        (medicineDetails!.PharmaOverview && medicineDetails!.PharmaOverview[0]) || {};
      const doseForm = pharmaOverview.Doseform || '';
      const manufacturer = medicineDetails.manufacturer || '';
      const _composition = {
        generic: formatComposition(pharmaOverview.generic),
        unit: formatComposition(pharmaOverview.Unit),
        strength: formatComposition(pharmaOverview.Strength || pharmaOverview.Strengh),
      };

      composition = [...Array.from({ length: _composition.generic.length })]
        .map(
          (_, index) =>
            `${_composition.generic[index]}-${_composition.strength[index]}${_composition.unit[index]}`
        )
        .join('+');

      const basicDetails: [string, string | number][] = [
        ['Manufacturer', manufacturer],
        ['Composition', composition],
        ['Pack Of', `${pack} ${doseForm}${Number(pack) !== 1 ? 'S' : ''}`],
      ];

      return (
        <>
          {basicDetails.map(
            (item, i, array) =>
              !!item[1] && (
                <View key={i}>
                  <Text style={styles.heading}>{item[0]}</Text>
                  <Text style={[styles.description]}>{item[1]}</Text>
                </View>
              )
          )}
          {!loading && medicineOverview.length != 0 ? <View style={styles.separator} /> : null}
        </>
      );
    }
  };

  const Popup = () => (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        paddingVertical: 9,
        position: 'absolute',
        width: width,
        height: height,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        backgroundColor: 'transparent',
      }}
      onPress={() => setShowPopup(false)}
    >
      <View
        style={{
          borderRadius: 10,
          backgroundColor: 'white',
          marginRight: 20,
          marginLeft: 72,
          maxHeight: height - 200,
          height: popupHeight + 24,
          ...theme.viewStyles.shadowStyle,
        }}
      >
        <View>
          <ScrollView
            bounces={false}
            contentContainerStyle={{
              paddingBottom: 16,
              paddingTop: 8,
            }}
          >
            <FlatList
              bounces={false}
              data={Substitutes}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) => (
                <View
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setpopupHeight(height * Substitutes.length);
                  }}
                >
                  <TouchableOpacity
                    style={styles.textViewStyle}
                    onPress={() => {
                      props.navigation.push(AppRoutes.MedicineDetailsScene, {
                        sku: item.sku,
                        movedFrom: ProductPageViewedSource.SUBSTITUTES,
                      });
                      setShowPopup(false);
                    }}
                  >
                    <View style={{ marginVertical: 7.5 }}>
                      <Text style={styles.textStyle}>{item.name}</Text>
                      {!!item.price && (
                        <Text style={theme.viewStyles.text('M', 12, '#02475b', 1, 20, 0.004)}>
                          RS. {item.price}
                        </Text>
                      )}
                    </View>
                    <ArrowRight />
                  </TouchableOpacity>
                </View>
              )}
            />
          </ScrollView>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyData = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
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

  const moveBack = () => {
    try {
      if (movedFrom === ProductPageViewedSource.REGISTRATION) {
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
      } else {
        props.navigation.goBack();
      }
    } catch (error) {}
  };

  const renderUpSellingProductsHeader = (sectionName: string) => {
    const marginTop =
      !medicineOverview.length && !Substitutes.length && !medicineDetails.description ? 20 : 0;
    return (
      <View style={[styles.labelViewStyle, { marginTop }]}>
        <Text style={[styles.labelStyle]}>{sectionName}</Text>
      </View>
    );
  };

  const renderSimilarProducts = () => {
    if (medicineDetails?.similar_products?.length) {
      const sectionName = medicineDetails.name
        ? `SIMILAR TO ${medicineDetails.name}`.toUpperCase()
        : 'SIMILAR PRODUCTS';

      return [
        renderUpSellingProductsHeader(sectionName),
        <ProductList
          data={medicineDetails.similar_products}
          Component={ProductUpSellingCard}
          navigation={props.navigation}
          addToCartSource={'Similar Widget'}
          movedFrom={ProductPageViewedSource.SIMILAR_PRODUCTS}
        />,
      ];
    }
  };

  const renderComplimentaryProducts = () => {
    if (medicineDetails?.crosssell_products?.length) {
      const sectionName = 'CUSTOMERS ALSO BOUGHT';
      return [
        renderUpSellingProductsHeader(sectionName),
        <ProductList
          data={medicineDetails.crosssell_products}
          Component={ProductUpSellingCard}
          navigation={props.navigation}
          addToCartSource={'Pharmacy PDP'}
          movedFrom={ProductPageViewedSource.CROSS_SELLING_PRODUCTS}
        />,
      ];
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          onPressLeftIcon={() => moveBack()}
          title={'PRODUCT DETAIL'}
          titleStyle={{ marginHorizontal: 10 }}
          container={{ borderBottomWidth: 0, ...theme.viewStyles.shadowStyle }}
          rightComponent={
            <TouchableOpacity
              activeOpacity={1}
              onPress={() =>
                props.navigation.navigate(
                  diagnosticCartItems.length ? AppRoutes.MedAndTestCart : AppRoutes.MedicineCart
                )
              }
              style={{ right: 20 }}
            >
              <CartIcon style={{}} />
              {cartItemsCount > 0 && (
                <View style={[styles.badgelabelView]}>
                  <Text style={styles.badgelabelText}>{cartItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          }
        />

        {loading ? (
          <ActivityIndicator
            style={{ flex: 1, alignItems: 'center' }}
            animating={loading}
            size="large"
            color="green"
          />
        ) : !isEmptyObject(medicineDetails) && !!medicineDetails.id ? (
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            bounces={false}
            keyboardShouldPersistTaps="always"
          >
            {renderTopView()}
            {medicineOverview.length > 0 && renderTabs()}
            {Substitutes.length ? renderSubstitutes() : null}
            {renderSimilarProducts()}
            {renderComplimentaryProducts()}
            {!isOutOfStock && !!medicineDetails.sell_online && renderDeliveryView()}
            <View style={{ height: 130 }} />
          </KeyboardAwareScrollView>
        ) : (
          renderEmptyData()
        )}
        {!loading &&
          !isEmptyObject(medicineDetails) &&
          !!medicineDetails.id &&
          renderBottomButtons()}
      </SafeAreaView>
      {showPopup && Popup()}
    </View>
  );
};
