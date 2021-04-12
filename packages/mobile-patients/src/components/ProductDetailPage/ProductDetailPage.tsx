import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';

import {
  ProductPageViewedSource,
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  useShoppingCart,
  BreadcrumbLink,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CartIcon, WhiteTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  isEmptyObject,
  postWebEngageEvent,
  postAppsFlyerEvent,
  postFirebaseEvent,
  savePastSearch,
  aphConsole,
  g,
  getFormattedLocation,
  postwebEngageAddToCartEvent,
  postFirebaseAddToCartEvent,
  postAppsFlyerAddToCartEvent,
  getCareCashback,
  doRequestAndAccessLocationModified,
  navigateToHome,
  navigateToScreenWithEmptyStack,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  MedicineProductDetails,
  getMedicineDetailsApi,
  trackTagalysEvent,
  getSubstitutes,
  getPlaceInfoByPincode,
  pinCodeServiceabilityApi247,
  availabilityApi247,
  getDeliveryTAT247,
  TatApiInput247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';
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

export type ProductPageViewedEventProps = Pick<
  WebEngageEvents[WebEngageEventName.PRODUCT_PAGE_VIEWED],
  'CategoryID' | 'CategoryName' | 'SectionName'
>;

export interface ProductDetailPageProps
  extends NavigationScreenProps<{
    sku: string;
    movedFrom: ProductPageViewedSource;
    productPageViewedEventProps?: ProductPageViewedEventProps;
    deliveryError: string;
    sectionName?: string;
  }> {}

type PharmacyTatApiCalled = WebEngageEvents[WebEngageEventName.PHARMACY_TAT_API_CALLED];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = (props) => {
  const movedFrom = props.navigation.getParam('movedFrom');
  const sku = props.navigation.getParam('sku');
  const sectionName = props.navigation.getParam('sectionName');
  const productPageViewedEventProps = props.navigation.getParam('productPageViewedEventProps');
  const _deliveryError = props.navigation.getParam('deliveryError');

  const {
    cartItems,
    cartTotal,
    pharmacyCircleAttributes,
    setDeliveryAddressId,
    addCartItem,
    pdpBreadCrumbs,
    setPdpBreadCrumbs,
    addresses,
    productDiscount,
  } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const {
    setPharmacyLocation,
    locationDetails,
    setLocationDetails,
    pharmacyLocation,
    setAxdcCode,
    isPharmacyLocationServiceable,
    axdcCode,
    pharmacyUserTypeAttribute,
  } = useAppCommonData();

  const cartItemsCount = cartItems.length + diagnosticCartItems.length;
  const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);

  //use states
  const [loading, setLoading] = useState<boolean>(true);
  const [medicineDetails, setMedicineDetails] = useState<MedicineProductDetails>(
    {} as MedicineProductDetails
  );
  const [medicineError, setMedicineError] = useState<string>('Product Details Not Available!');
  const [isInStock, setIsInStock] = useState<boolean>(true);
  const [deliveryError, setdeliveryError] = useState<string>(_deliveryError || '');
  const [apiError, setApiError] = useState<boolean>(false);
  const [substitutes, setSubstitutes] = useState<MedicineProductDetails[]>([]);
  const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [showAddedToCart, setShowAddedToCart] = useState<boolean>(false);
  const [showSubstituteInfo, setShowSubstituteInfo] = useState<boolean>(false);
  const [showDeliverySpinner, setshowDeliverySpinner] = useState<boolean>(false);
  const [availabilityCalled, setAvailabilityCalled] = useState<string>('no');

  const pharmacyPincode = g(pharmacyLocation, 'pincode') || g(locationDetails, 'pincode');
  const [pincode, setpincode] = useState<string>(pharmacyPincode || '');
  const [notServiceable, setNotServiceable] = useState<boolean>(false);
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [tatEventData, setTatEventData] = useState<PharmacyTatApiCalled>();
  const [isPharma, setIsPharma] = useState<boolean>(false);
  const [skuInCart, setSkuInCart] = useState<ShoppingCartItem[]>([]);

  const { special_price, price, type_id } = medicineDetails;
  const finalPrice = price - special_price ? special_price : price;
  const cashback = getCareCashback(Number(finalPrice), type_id);
  type addressListType = savePatientAddress_savePatientAddress_patientAddress[];

  const getItemQuantity = (id: string) => {
    const foundItem = cartItems.find((item) => item.id == id);
    return foundItem ? foundItem.quantity : 0;
  };

  useEffect(() => {
    getMedicineDetails();
    if (!_deliveryError) {
      fetchDeliveryTime(pincode, false);
    }
  }, []);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setLoading(true);
      getMedicineDetails();
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
    if (cartItems?.length) {
      const filteredCartItems = cartItems?.filter((item) => item?.id == medicineDetails?.sku);
      setSkuInCart(filteredCartItems);
    }
  }, [medicineDetails]);

  useEffect(() => {
    if (medicineDetails?.sku && availabilityCalled === 'yes') {
      postProductPageViewedEvent(pincode, isInStock);
    }
  }, [medicineDetails, availabilityCalled]);

  useEffect(() => {
    if (cartItems?.length) {
      const filteredCartItems = cartItems?.filter((item) => item?.id == medicineDetails?.sku);
      setSkuInCart(filteredCartItems);
    }
  }, [cartItems]);

  useEffect(() => {
    if (axdcCode && medicineDetails?.sku) {
      getMedicineDetails(pincode, axdcCode);
    }
  }, [axdcCode, pincode]);

  useEffect(() => {
    try {
      if (medicineDetails?.price && tatEventData) {
        const eventAttributes: PharmacyTatApiCalled = {
          ...tatEventData,
          Input_MRP: medicineDetails?.price,
          Response_MRP: tatEventData?.Response_MRP * Number(medicineDetails?.mou || 1),
        };
        postWebEngageEvent(WebEngageEventName.PHARMACY_TAT_API_CALLED, eventAttributes);
      }
    } catch (error) {}
  }, [tatEventData]);

  const getMedicineDetails = (zipcode?: string, pinAcdxCode?: string) => {
    setLoading(true);
    getMedicineDetailsApi(sku, pinAcdxCode || axdcCode, zipcode || pincode)
      .then(({ data }) => {
        const productDetails = g(data, 'productdp', '0' as any);
        if (productDetails) {
          setMedicineDetails(productDetails || {});
          setIsPharma(productDetails?.type_id.toLowerCase() === 'pharma');
          trackTagalysViewEvent(productDetails);
          savePastSearch(client, {
            typeId: productDetails?.sku,
            typeName: productDetails?.name,
            type: SEARCH_TYPE.MEDICINE,
            patient: currentPatient?.id,
            image: productDetails?.thumbnail,
          });
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
            navigateToScreenWithEmptyStack(props.navigation, AppRoutes.MedicineCart);
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

  const postProductPageViewedEvent = (pincode?: string, isProductInStock?: boolean) => {
    if (movedFrom) {
      const { sku, name, is_in_stock, sell_online } = medicineDetails;
      const stock_availability =
        sell_online == 0 ? 'Not for Sale' : !!isProductInStock ? 'Yes' : 'No';
      const eventAttributes: WebEngageEvents[WebEngageEventName.PRODUCT_PAGE_VIEWED] = {
        source: movedFrom,
        ProductId: sku,
        ProductName: name,
        Stockavailability: stock_availability,
        ...productPageViewedEventProps,
        ...pharmacyCircleAttributes,
        ...pharmacyUserTypeAttribute,
        Pincode: pincode,
        serviceable: notServiceable ? 'No' : 'Yes',
      };
      postWebEngageEvent(WebEngageEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
      postAppsFlyerEvent(AppsFlyerEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
      postFirebaseEvent(FirebaseEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
    }
  };

  const fetchDeliveryTime = async (currentPincode: string, checkButtonClicked?: boolean) => {
    if (!currentPincode) return;
    const unServiceableMsg =
      'Sorry! Your Pincode is not serviceable yet. Please try with an alternative pincode.';
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
      const response = await pinCodeServiceabilityApi247(currentPincode);
      const { data } = response;
      setAxdcCode && setAxdcCode(data?.response?.axdcCode);
      let pinCodeNotServiceable =
        isPharmacyLocationServiceable == undefined || pharmacyPincode != currentPincode
          ? !data?.response?.servicable
          : pharmacyPincode == currentPincode && !isPharmacyLocationServiceable;
      setNotServiceable(!data?.response?.servicable);
      if (!data?.response?.servicable) {
        setIsInStock(false);
        setdeliveryTime('');
        setdeliveryError(unServiceableMsg);
        setshowDeliverySpinner(false);
        return;
      }

      const checkAvailabilityRes = await availabilityApi247(currentPincode, sku);
      const outOfStock = !!!checkAvailabilityRes?.data?.response[0]?.exist;
      setIsInStock(!outOfStock);
      try {
        const { mrp, exist, qty } = checkAvailabilityRes.data.response[0];
        !checkButtonClicked && setAvailabilityCalled('yes');
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_AVAILABILITY_API_CALLED] = {
          Source: 'PDP',
          Input_SKU: sku,
          Input_Pincode: currentPincode,
          Input_MRP: medicineDetails?.price,
          No_of_items_in_the_cart: 1,
          Response_Exist: exist ? 'Yes' : 'No',
          Response_MRP: mrp,
          Response_Qty: qty,
          'Cart Items': JSON.stringify(cartItems),
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
      if (pharmacyPincode == currentPincode) {
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
        const data = await getPlaceInfoByPincode(currentPincode);
        const locationData = data.data.results[0].geometry.location;
        lattitude = locationData.lat;
        longitude = locationData.lng;
      }

      getDeliveryTAT247({
        items: [{ sku: sku, qty: getItemQuantity(sku) || 1 }],
        pincode: currentPincode,
        lat: lattitude,
        lng: longitude,
      } as TatApiInput247)
        .then((res) => {
          const deliveryDate = res?.data?.response?.[0]?.tat;
          const currentDate = moment();
          if (deliveryDate) {
            if (checkButtonClicked) {
              const eventAttributes: WebEngageEvents[WebEngageEventName.PRODUCT_DETAIL_PINCODE_CHECK] = {
                'product id': sku,
                'product name': medicineDetails.name,
                pincode: Number(currentPincode),
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
              Input_pincode: currentPincode,
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
        .finally(() => {
          setshowDeliverySpinner(false);
        });
    } catch (error) {
      // in case user entered wrong pincode, not able to get lat lng. showing out of stock to user
      setdeliveryError(pincodeServiceableItemOutOfStockMsg);
      setdeliveryTime('');
      setshowDeliverySpinner(false);
    }
  };

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

  const updatePlaceInfoByPincode = (pinCode: string) => {
    setLoading!(true);
    getPlaceInfoByPincode(pinCode)
      .then(({ data }) => {
        try {
          if (data.results.length) {
            const addrComponents = data.results[0].address_components || [];
            const latLang = data.results[0].geometry.location || {};
            const response = getFormattedLocation(addrComponents, latLang, pinCode);
            setPharmacyLocation!(response);
            setDeliveryAddressId!('');
            !locationDetails && setLocationDetails!(response);
            setpincode(pinCode);
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

  const onAddCartItem = () => {
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
    } = medicineDetails;
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
      quantity: productQuantity,
      thumbnail: thumbnail,
      isInStock: true,
      maxOrderQty: MaxOrderQty,
      productType: type_id,
    });
    postwebEngageAddToCartEvent(
      medicineDetails,
      'Pharmacy PDP',
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
    postAppsFlyerAddToCartEvent(medicineDetails, id, pharmacyCircleAttributes!);
  };

  const renderBottomButton = () => {
    const total = cartItems
      .reduce((currTotal, currItem) => currTotal + currItem.quantity * currItem.price, 0)
      .toFixed(2);
    return (
      <StickyBottomComponent style={styles.stickyBottomComponent}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate(AppRoutes.MedicineCart);
          }}
          activeOpacity={0.7}
          style={styles.bottomCta}
        >
          <Text style={styles.bottomCtaText}>
            {`Proceed to Checkout (${cartItems?.length} items) ${
              string.common.Rs
            }${convertNumberToDecimal(cartTotal - productDiscount)}`}
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
            updatePlaceInfoByPincode(address?.zipcode);
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
        response && setPharmacyLocation!(response);
        response && !locationDetails && setLocationDetails!(response);
        setDeliveryAddressId!('');
        updatePlaceInfoByPincode(response?.pincode);
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
    !defaultAddress &&
      !locationDetails &&
      !pharmacyLocation &&
      showAccessAccessLocationPopup(false);
  };

  const onNotifyMeClick = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.NOTIFY_ME] = {
      'product name': medicineDetails?.name,
      'product id': medicineDetails?.sku,
      'category ID': medicineDetails?.category_id,
      price: medicineDetails?.price,
      pincode: pincode,
      serviceable: notServiceable ? 'No' : 'Yes',
    };
    postWebEngageEvent(WebEngageEventName.NOTIFY_ME, eventAttributes);
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${medicineDetails?.name} is back in stock.`,
    });
  };

  let buttonRef = React.useRef<View>(null);
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.mainContainer}>
        <MedicineListingHeader navigation={props.navigation} movedFrom={'productdetail'} />
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
            style={{
              paddingHorizontal: 15,
            }}
            onScroll={(event) => {
              // show bottom bar if ADD TO CART button scrolls off the screen
              buttonRef.current &&
                buttonRef.current.measure(
                  (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                    setShowBottomBar(pagey < 0);
                  }
                );
            }}
          >
            <Breadcrumb
              links={pdpBreadCrumbs}
              containerStyle={{ borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}
            />
            <ProductNameImage
              name={medicineDetails?.name}
              images={medicineDetails?.image}
              isPrescriptionRequired={medicineDetails?.is_prescription_required == 1}
              navigation={props.navigation}
              sku={medicineDetails?.sku}
            />
            <ProductPriceDelivery
              price={medicineDetails?.price}
              specialPrice={medicineDetails?.special_price}
              isExpress={medicineDetails?.is_express === 'Yes'}
              isInStock={isInStock}
              isSellOnline={medicineDetails?.sell_online === 1}
              manufacturer={medicineDetails?.manufacturer}
              showPincodePopup={showAccessAccessLocationPopup}
              deliveryTime={deliveryTime}
              deliveryError={deliveryError}
              isPharma={isPharma}
              cashback={cashback}
              finalPrice={finalPrice}
              showDeliverySpinner={showDeliverySpinner}
              isBanned={medicineDetails?.banned === 'Yes'}
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
              />
            </View>
            {isPharma && (
              <PharmaManufacturer
                manufacturer={medicineDetails?.manufacturer}
                composition={medicineDetails?.PharmaOverview?.[0]?.Composition}
                consumeType={medicineDetails?.consume_type}
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
            />
            {!!substitutes.length && (
              <SimilarProducts
                heading={string.productDetailPage.PRODUCT_SUBSTITUTES}
                similarProducts={substitutes}
                navigation={props.navigation}
                composition={medicineDetails?.PharmaOverview?.[0]?.Composition}
                setShowSubstituteInfo={setShowSubstituteInfo}
              />
            )}
            {!!medicineDetails?.similar_products?.length && (
              <SimilarProducts
                heading={string.productDetailPage.SIMILAR_PRODUCTS}
                similarProducts={medicineDetails?.similar_products}
                navigation={props.navigation}
              />
            )}
            {!!medicineDetails?.crosssell_products?.length && (
              <SimilarProducts
                heading={string.productDetailPage.ALSO_BOUGHT}
                similarProducts={medicineDetails?.crosssell_products}
                navigation={props.navigation}
              />
            )}
            {!!medicineDetails?.marketer_address && (
              <ProductManufacturer address={medicineDetails?.marketer_address} />
            )}
            <View style={{ height: 130 }} />
          </KeyboardAwareScrollView>
        ) : (
          renderEmptyData()
        )}
        {!loading &&
          !isEmptyObject(medicineDetails) &&
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
        {!loading &&
          !isEmptyObject(medicineDetails) &&
          !!medicineDetails.id &&
          !!skuInCart.length &&
          renderBottomButton()}
      </SafeAreaView>
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
});
