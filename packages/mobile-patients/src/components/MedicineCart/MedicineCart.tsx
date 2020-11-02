import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  AppState,
  AppStateStatus,
  BackHandler,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CartItemsList } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemsList';
import {
  useShoppingCart,
  ShoppingCartItem,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { FreeDelivery } from '@aph/mobile-patients/src/components/MedicineCart/Components/FreeDelivery';
import { AmountCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/AmountCard';
import { Coupon } from '@aph/mobile-patients/src/components/MedicineCart/Components/Coupon';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Savings } from '@aph/mobile-patients/src/components/MedicineCart/Components/Savings';
import { KerbSidePickup } from '@aph/mobile-patients/src/components/MedicineCart/Components/KerbSidePickup';
import { ProceedBar } from '@aph/mobile-patients/src/components/MedicineCart/Components/ProceedBar';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '../../graphql/types/getPatientAddressList';
import {
  GET_PATIENT_ADDRESS_LIST,
  UPLOAD_DOCUMENT,
  SET_DEFAULT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  g,
  formatAddress,
  formatAddressToLocation,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  pinCodeServiceabilityApi247,
  availabilityApi247,
  GetTatResponse247,
  getMedicineDetailsApi,
  TatApiInput247,
  getDeliveryTAT247,
  validateConsultCoupon,
  userSpecificCoupon,
  searchPickupStoresApi,
  getProductsByCategoryApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { UploadPrescription } from '@aph/mobile-patients/src/components/MedicineCart/Components/UploadPrescription';
import { UnServiceable } from '@aph/mobile-patients/src/components/MedicineCart/Components/UnServiceable';
import { SuggestProducts } from '@aph/mobile-patients/src/components/MedicineCart/Components/SuggestProducts';
import { EmptyCart } from '@aph/mobile-patients/src/components/MedicineCart/Components/EmptyCart';
import { AddressSource } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  postwebEngageProceedToPayEvent,
  PharmacyCartViewedEvent,
  PricemismatchEvent,
  postTatResponseFailureEvent,
  applyCouponClickedEvent,
  selectDeliveryAddressClickedEvent,
  uploadPrescriptionClickedEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  postPhamracyCartAddressSelectedFailure,
  postPhamracyCartAddressSelectedSuccess,
  postPharmacyAddNewAddressClick,
  postPharmacyAddNewAddressCompleted,
} from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import moment from 'moment';
import {
  makeAdressAsDefaultVariables,
  makeAdressAsDefault,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';

export interface MedicineCartProps extends NavigationScreenProps {}

export const MedicineCart: React.FC<MedicineCartProps> = (props) => {
  const {
    setCoupon,
    cartTotal,
    couponProducts,
    cartItems,
    coupon,
    setAddresses,
    setCartItems,
    setCouponProducts,
    addresses,
    deliveryAddressId,
    setDeliveryAddressId,
    addMultipleCartItems,
    physicalPrescriptions,
    ePrescriptions,
    setPhysicalPrescriptions,
    pinCode,
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { locationDetails, pharmacyLocation, setPharmacyLocation } = useAppCommonData();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [lastCartItems, setlastCartItems] = useState('');
  const [storeType, setStoreType] = useState<string | undefined>('');
  const [storeDistance, setStoreDistance] = useState(0);
  const [shopId, setShopId] = useState<string | undefined>('');
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [isfocused, setisfocused] = useState<boolean>(false);
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>(false);
  const [showStorePickupCard, setshowStorePickupCard] = useState<boolean>(false);
  const [suggestedProducts, setsuggestedProducts] = useState<MedicineProduct[]>([]);
  const [appState, setappState] = useState<string>('');
  const shoppingCart = useShoppingCart();
  const navigatedFrom = props.navigation.getParam('movedFrom') || '';
  const pharmacyPincode =
    selectedAddress?.zipcode || pharmacyLocation?.pincode || locationDetails?.pincode || pinCode;

  useEffect(() => {
    fetchAddress();
    availabilityTat(false);
    fetchUserSpecificCoupon();
    fetchPickupStores(pharmacyPincode);
    fetchProductSuggestions();
    cartItems.length && PharmacyCartViewedEvent(shoppingCart, g(currentPatient, 'id'));
  }, []);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setisfocused(true);
      BackHandler.addEventListener('hardwareBackPress', handleBack);
      AppState.addEventListener('change', handleAppStateChange);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setisfocused(false);
      AppState.removeEventListener('change', handleAppStateChange);
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  useEffect(() => {
    if (!deliveryAddressId && cartItems.length > 0) {
      setCartItems!(cartItems.map((item) => ({ ...item, unserviceable: false })));
    } else if (deliveryAddressId && cartItems.length > 0) {
      isfocused ? availabilityTat(false, true) : availabilityTat(false);
    }
  }, [deliveryAddressId]);

  useEffect(() => {
    if (isfocused) {
      availabilityTat(false);
    }
  }, [cartItems]);

  useEffect(() => {
    if (couponProducts && couponProducts.length) {
      getMedicineDetailsOfCouponProducts();
    }
  }, [couponProducts]);

  useEffect(() => {
    onFinishUpload();
  }, [isPhysicalUploadComplete]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setappState(nextAppState);
  };

  useEffect(() => {
    if (appState == 'active') {
      couponProducts?.length == 0 && availabilityTat(true);
      setCoupon!(null);
    }
  }, [appState]);

  const handleBack = () => {
    setCoupon!(null);
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
  };

  async function fetchAddress() {
    try {
      if (addresses.length) {
        return;
      }
      const userId = g(currentPatient, 'id');
      const response = await client.query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: userId },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      const addressList =
        (data.getPatientAddressList
          .addressList as savePatientAddress_savePatientAddress_patientAddress[]) || [];
      setAddresses!(addressList);
    } catch (error) {
      console.log(error);
      renderAlert(`Something went wrong, unable to fetch addresses.`);
    }
  }

  const fetchUserSpecificCoupon = () => {
    userSpecificCoupon(g(currentPatient, 'mobileNumber'))
      .then(async (resp: any) => {
        console.log(resp.data);
        if (resp.data.errorCode == 0) {
          let couponList = resp.data.response;
          if (typeof couponList != null && couponList.length) {
            const coupon = couponList[0].coupon;
            const msg = couponList[0].message;
            try {
              setCoupon!(null);
              await validateCoupon(coupon, msg, true);
            } catch (error) {
              return;
            }
          }
        }
      })
      .catch((error) => {
        CommonBugFender('fetchingUserSpecificCoupon', error);
      });
  };

  async function checkServicability(address: savePatientAddress_savePatientAddress_patientAddress) {
    if (deliveryAddressId && deliveryAddressId == address.id) {
      return;
    }
    try {
      setloading(true);
      const response = await pinCodeServiceabilityApi247(address.zipcode!);
      const { data } = response;
      console.log(data);
      if (data.response) {
        setDeliveryAddressId && setDeliveryAddressId(address.id);
        setDefaultAddress(address);
        fetchPickupStores(address?.zipcode || '');
      } else {
        setDeliveryAddressId && setDeliveryAddressId('');
        setloading(false);
        postPhamracyCartAddressSelectedFailure(address.zipcode!, formatAddress(address), 'No');
        renderAlert(string.medicine_cart.pharmaAddressUnServiceableAlert);
      }
    } catch (error) {
      console.log(error);
      setloading(false);
    }
  }

  async function availabilityTat(forceCheck: boolean, addressChange?: boolean) {
    const newCartItems =
      cartItems.map(({ id, quantity }) => id + quantity).toString() + deliveryAddressId;
    if (newCartItems == lastCartItems && !forceCheck) {
      return;
    }
    if (deliveryAddressId && cartItems.length > 0) {
      console.log('inside tat');
      setloading(true);
      setlastCartItems(newCartItems);
      const skus = cartItems.map((item) => item.id);
      const selectedAddress: any = addresses.find((item) => item.id == deliveryAddressId);
      try {
        const response = await availabilityApi247(selectedAddress.zipcode || '', skus.join(','));
        console.log('in cart >>', response.data);
        const items = g(response, 'data', 'response') || [];
        const unserviceableSkus = items.filter(({ exist }) => exist == false).map(({ sku }) => sku);
        const updatedCartItems = cartItems.map((item) => ({
          ...item,
          unserviceable: unserviceableSkus.indexOf(item.id) != -1,
        }));
        setCartItems!(updatedCartItems);
        if (unserviceableSkus.length) {
          showUnServiceableItemsAlert(updatedCartItems);
        }
        const serviceableItems = updatedCartItems
          .filter((item) => !item.unserviceable)
          .map((item) => {
            return { sku: item.id, qty: item.quantity };
          });

        const tatInput: TatApiInput247 = {
          pincode: selectedAddress.zipcode || '',
          lat: selectedAddress?.latitude!,
          lng: selectedAddress?.longitude!,
          items: serviceableItems,
        };
        try {
          const res = await getDeliveryTAT247(tatInput);
          const response = res?.data?.response;
          const tatTimeStamp = response?.tatU;
          if (tatTimeStamp && tatTimeStamp !== -1) {
            const deliveryDate = response?.tat;
            const { distance, storeCode, storeType } = response;
            if (deliveryDate) {
              const inventoryData = response?.items || [];
              setloading!(false);
              if (inventoryData?.length) {
                setStoreType(storeType);
                setShopId(storeCode);
                setStoreDistance(distance);
                setdeliveryTime(deliveryDate);
                addressSelectedEvent(selectedAddress, deliveryDate);
                addressChange &&
                  NavigateToCartSummary(deliveryDate, distance, storeType, storeCode);
                updatePricesAfterTat(inventoryData, updatedCartItems);
              }
              addressChange && NavigateToCartSummary(deliveryDate, distance, storeType, storeCode);
            } else {
              addressChange && NavigateToCartSummary(genericServiceableDate);
              handleTatApiFailure(selectedAddress, {});
            }
          } else {
            handleTatApiFailure(selectedAddress, {});
            addressChange && NavigateToCartSummary(genericServiceableDate);
          }
        } catch (error) {
          handleTatApiFailure(selectedAddress, error);
          addressChange && NavigateToCartSummary(genericServiceableDate);
        }
      } catch (error) {
        handleTatApiFailure(selectedAddress, error);
      }
    } else if (!deliveryAddressId) {
      setlastCartItems(newCartItems);
      validatePharmaCoupon();
    }
  }

  const genericServiceableDate = moment()
    .add(2, 'days')
    .set('hours', 20)
    .set('minutes', 0)
    .format(AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT);

  function handleTatApiFailure(
    selectedAddress: savePatientAddress_savePatientAddress_patientAddress,
    error: any
  ) {
    addressSelectedEvent(selectedAddress, '');
    setdeliveryTime(genericServiceableDate);
    postTatResponseFailureEvent(cartItems, selectedAddress.zipcode || '', error);
    setloading(false);
    validatePharmaCoupon();
  }

  function addressSelectedEvent(
    address: savePatientAddress_savePatientAddress_patientAddress,
    tatDate: string
  ) {
    const currentDate = moment();
    postPhamracyCartAddressSelectedSuccess(
      address?.zipcode!,
      formatAddress(address),
      'Yes',
      moment(tatDate, AppConfig.Configuration.MED_DELIVERY_DATE_DISPLAY_FORMAT).toDate(),
      moment(tatDate).diff(currentDate, 'd')
    );
  }

  async function setDefaultAddress(address: savePatientAddress_savePatientAddress_patientAddress) {
    try {
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
      setAddresses!(updatedAddresses);
      patientAddress?.defaultAddress && setDeliveryAddressId!(patientAddress?.id);
      const deliveryAddress = updatedAddresses.find(({ id }) => patientAddress?.id == id);
      setPharmacyLocation!(formatAddressToLocation(deliveryAddress! || null));
    } catch (error) {
      CommonBugFender('set_default_Address_on_Cart_Page', error);
    }
  }

  async function updatePricesAfterTat(
    inventoryData: GetTatResponse247['response']['items'],
    updatedCartItems: ShoppingCartItem[]
  ) {
    let Items: ShoppingCartItem[] = [];
    updatedCartItems.forEach((item) => {
      let object = item;
      let cartItem = inventoryData.filter((cartItem) => cartItem.sku == item.id);
      if (cartItem.length) {
        const storePrice = Number(object.mou) * cartItem[0].mrp;
        if (object.price != storePrice && cartItem[0].mrp != 0) {
          PricemismatchEvent(object, g(currentPatient, 'mobileNumber'), storePrice);
          object.specialPrice &&
            (object.specialPrice =
              Number(object.mou) * cartItem[0].mrp * (object.specialPrice / object.price));
          object.price = Number(object.mou) * cartItem[0].mrp;
        }
      }
      Items.push(object);
    });
    setCartItems!(Items);
    await validatePharmaCoupon();
  }
  function hasUnserviceableproduct() {
    const unserviceableItems = cartItems.filter((item) => item.unserviceable) || [];
    return unserviceableItems?.length ? true : false;
  }
  function NavigateToCartSummary(
    deliveryTime: string,
    storeDistance?: number,
    storeType?: string,
    shopId?: string
  ) {
    !hasUnserviceableproduct() &&
      isfocused &&
      props.navigation.navigate(AppRoutes.CartSummary, {
        deliveryTime: deliveryTime,
        storeDistance: storeDistance,
        tatType: storeType,
        shopId: shopId,
      });
  }

  async function validatePharmaCoupon() {
    if (coupon && cartTotal > 0) {
      try {
        await validateCoupon(coupon.coupon, coupon.message);
      } catch (error) {
        return;
      }
    }
  }

  const showUnServiceableItemsAlert = (cartItems: ShoppingCartItem[]) => {
    showAphAlert!({
      title: string.medicine_cart.tatUnServiceableAlertTitle,
      description: string.medicine_cart.tatUnServiceableAlertDesc,
      titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
      CTAs: [
        {
          text: string.medicine_cart.tatUnServiceableAlertChangeCTA,
          type: 'orange-link',
          onPress: showAddressPopup,
        },
        {
          text: string.medicine_cart.tatUnServiceableAlertRemoveCTA,
          type: 'orange-link',
          onPress: () => removeUnServiceableItems(cartItems),
        },
      ],
    });
  };
  const removeUnServiceableItems = (cartItems: ShoppingCartItem[]) => {
    hideAphAlert!();
    setCartItems!(cartItems.filter((item) => !item.unserviceable));
  };

  const removeCouponWithAlert = (message: string) => {
    setCoupon!(null);
    renderAlert(message);
  };

  const validateCoupon = (coupon: string, message: string | undefined, autoApply?: boolean) => {
    CommonLogEvent(AppRoutes.ApplyCouponScene, 'Apply coupon');
    console.log('inside validate');
    setloading!(true);
    const data = {
      mobile: g(currentPatient, 'mobileNumber'),
      billAmount: cartTotal.toFixed(2),
      coupon: coupon,
      pinCode: pharmacyPincode,
      products: cartItems.map((item) => ({
        sku: item.id,
        categoryId: item.productType,
        mrp: item.price,
        quantity: item.quantity,
        specialPrice: item.specialPrice !== undefined ? item.specialPrice : item.price,
      })),
    };
    return new Promise(async (res, rej) => {
      try {
        const response = await validateConsultCoupon(data);
        console.log('coupon response >>', response.data.response);
        setloading!(false);
        if (response.data.errorCode == 0) {
          if (response.data.response.valid) {
            setCoupon!({ ...g(response.data, 'response')!, message: message ? message : '' });
            res();
          } else {
            !autoApply && removeCouponWithAlert(g(response.data, 'response', 'reason'));
            rej(response.data.response.reason);
          }
        } else {
          CommonBugFender('validatingPharmaCoupon', response.data.errorMsg);
          !autoApply && removeCouponWithAlert(g(response.data, 'errorMsg'));
          rej(response.data.errorMsg);
        }
      } catch (error) {
        CommonBugFender('validatingPharmaCoupon', error);
        !autoApply && removeCouponWithAlert('Sorry, unable to validate coupon right now.');
        setloading!(false);
        rej('Sorry, unable to validate coupon right now.');
      }
    });
  };

  async function fetchPickupStores(pincode: string) {
    if (pincode.length == 6) {
      try {
        const response = await searchPickupStoresApi(pincode);
        const { data } = response;
        const { Stores } = data;
        console.log(Stores?.length && Stores[0]?.message != 'Data Not Available');
        if (Stores?.length && Stores[0]?.message != 'Data Not Available') {
          setshowStorePickupCard(true);
        } else {
          setshowStorePickupCard(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  const getMedicineDetailsOfCouponProducts = () => {
    setloading!(true);
    Promise.all(couponProducts.map((item) => getMedicineDetailsApi(item!.sku!)))
      .then((result) => {
        setloading!(false);
        const medicinesAll = result.map(({ data: { productdp } }, index) => {
          const medicineDetails = (productdp && productdp[0]) || {};
          if (medicineDetails.id == 0) {
            return null;
          }
          return {
            id: medicineDetails!.sku!,
            mou: medicineDetails.mou,
            name: medicineDetails!.name,
            price: medicineDetails.price,
            specialPrice: Number(couponProducts[index]!.mrp), // special price as coupon product price
            quantity: couponProducts[index]!.quantity,
            prescriptionRequired: medicineDetails.is_prescription_required == '1',
            isMedicine: (medicineDetails.type_id || '').toLowerCase() == 'pharma',
            thumbnail: medicineDetails.thumbnail || medicineDetails.image,
            isInStock: !!medicineDetails.is_in_stock,
            maxOrderQty: medicineDetails.MaxOrderQty,
            productType: medicineDetails.type_id,
            isFreeCouponProduct: !!couponProducts[index]!.couponFree,
            couponPrice: 0,
            unserviceable: false,
          } as ShoppingCartItem;
        });
        addMultipleCartItems!(medicinesAll as ShoppingCartItem[]);
      })
      .catch((e) => {
        setloading!(false);
        console.log({ e });
      });
  };

  const onFinishUpload = () => {
    if (isPhysicalUploadComplete) {
      setloading!(false);
      setisPhysicalUploadComplete(false);
      onPressProceedtoPay();
    }
  };

  async function fetchProductSuggestions() {
    const categoryId = AppConfig.Configuration.PRODUCT_SUGGESTIONS_CATEGORYID;
    const pageCount = AppConfig.Configuration.PRODUCT_SUGGESTIONS_COUNT;
    try {
      const response = await getProductsByCategoryApi(categoryId, pageCount);
      const products = response?.data?.products.slice(0, 15) || [];
      setsuggestedProducts(products);
    } catch (error) {
      CommonBugFender('YourCart_error_whilefetchingSuggestedProducts', error);
    }
  }

  const multiplePhysicalPrescriptionUpload = (prescriptions = physicalPrescriptions) => {
    return Promise.all(
      prescriptions.map((item) =>
        client.mutate<uploadDocument>({
          mutation: UPLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            UploadDocumentInput: {
              base64FileInput: item.base64,
              category: 'HealthChecks',
              fileType: item.fileType == 'jpg' ? 'JPEG' : item.fileType.toUpperCase(),
              patientId: currentPatient && currentPatient!.id,
            },
          },
        })
      )
    );
  };

  async function uploadPhysicalPrescriptons() {
    const prescriptions = physicalPrescriptions;
    const unUploadedPres = prescriptions.filter((item) => !item.uploadedUrl);
    if (unUploadedPres.length > 0) {
      try {
        setloading!(true);
        const data = await multiplePhysicalPrescriptionUpload(unUploadedPres);
        const uploadUrls = data.map((item) =>
          item.data!.uploadDocument.status
            ? {
                fileId: item.data!.uploadDocument.fileId!,
                url: item.data!.uploadDocument.filePath!,
              }
            : null
        );
        const newuploadedPrescriptions = unUploadedPres.map(
          (item, index) =>
            ({
              ...item,
              uploadedUrl: uploadUrls![index]!.url,
              prismPrescriptionFileId: uploadUrls![index]!.fileId,
            } as PhysicalPrescription)
        );
        setPhysicalPrescriptions && setPhysicalPrescriptions([...newuploadedPrescriptions]);
        setisPhysicalUploadComplete(true);
      } catch (error) {
        CommonBugFender('YourCart_physicalPrescriptionUpload', error);
        setloading!(false);
        renderAlert('Error occurred while uploading prescriptions.');
      }
    } else {
      onPressProceedtoPay();
    }
  }

  function showAddressPopup() {
    showAphAlert!({
      title: string.common.selectAddress,
      removeTopIcon: true,
      children: (
        <ChooseAddress
          addresses={addresses}
          deliveryAddressId={deliveryAddressId}
          onPressAddAddress={() => {
            props.navigation.navigate(AppRoutes.AddAddress, {
              source: 'Cart' as AddressSource,
            });
            postPharmacyAddNewAddressClick('Cart');
            hideAphAlert!();
          }}
          onPressEditAddress={(address) => {
            props.navigation.push(AppRoutes.AddAddress, {
              KeyName: 'Update',
              DataAddress: address,
              ComingFrom: AppRoutes.MedicineCart,
            });
            hideAphAlert!();
          }}
          onPressSelectAddress={(address) => {
            checkServicability(address);
            hideAphAlert!();
          }}
        />
      ),
    });
  }

  async function onPressProceedtoPay() {
    if (coupon) {
      try {
        await validateCoupon(coupon.coupon, coupon.message);
      } catch (error) {
        return;
      }
    }
    const zipcode = g(selectedAddress, 'zipcode');
    const isChennaiAddress = AppConfig.Configuration.CHENNAI_PHARMA_DELIVERY_PINCODES.find(
      (addr) => addr == Number(zipcode)
    );
    props.navigation.navigate(AppRoutes.CheckoutSceneNew, {
      deliveryTime,
      isChennaiOrder: isChennaiAddress ? true : false,
      storeDistance: storeDistance,
      tatType: storeType,
      shopId: shopId,
    });
    postwebEngageProceedToPayEvent(shoppingCart, false, deliveryTime);
  }

  const headerRightComponent = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          props.navigation.navigate('MEDICINES', { focusSearch: true });
          setCoupon!(null);
          navigatedFrom === 'registration'
            ? props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [
                    NavigationActions.navigate({
                      routeName: AppRoutes.ConsultRoom,
                    }),
                  ],
                })
              )
            : props.navigation.navigate('MEDICINES', { focusSearch: true });
        }}
      >
        <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(13), color: theme.colors.APP_YELLOW }}>
          ADD ITEMS
        </Text>
      </TouchableOpacity>
    );
  };
  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'YOUR CART'}
        rightComponent={headerRightComponent()}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.MedicineCart, 'Go back to add items');
          setCoupon!(null);
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  function applyCoupon() {
    if (cartTotal == 0) {
      renderAlert('Please add items in the cart to apply coupon.');
    } else {
      props.navigation.navigate(AppRoutes.ApplyCouponScene);
      setCoupon!(null);
      applyCouponClickedEvent(g(currentPatient, 'id'));
    }
  }

  const renderCartItems = () => {
    return (
      <CartItemsList
        screen={'cart'}
        onPressProduct={(item) => {
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: item.id,
            movedFrom: ProductPageViewedSource.CART,
          });
        }}
      />
    );
  };
  const renderAvailFreeDelivery = () => {
    return <FreeDelivery />;
  };

  const renderCouponSection = () => {
    return (
      <Coupon onPressApplyCoupon={() => applyCoupon()} onPressRemove={() => setCoupon!(null)} />
    );
  };

  const renderAmountSection = () => {
    return (
      <View>
        <View style={styles.amountHeader}>
          <Text style={styles.amountHeaderText}>TOTAL CHARGES</Text>
        </View>
        {renderCouponSection()}
        <AmountCard />
      </View>
    );
  };

  const renderSavings = () => {
    return <Savings />;
  };

  const renderSuggestProducts = () => {
    return <SuggestProducts products={suggestedProducts} navigation={props.navigation} />;
  };

  const renderuploadPrescriptionPopup = () => {
    return (
      <UploadPrescription
        showPopUp={showPopUp}
        onClickClose={() => setshowPopUp(false)}
        navigation={props.navigation}
        type={'cartOrMedicineFlow'}
        onUpload={() =>
          !hasUnserviceableproduct() &&
          props.navigation.navigate(AppRoutes.CartSummary, {
            deliveryTime: deliveryTime,
            storeDistance: storeDistance,
            tatType: storeType,
            shopId: shopId,
          })
        }
      />
    );
  };

  const renderPrescriptions = () => {
    return (
      <Prescriptions
        onPressUploadMore={() => setshowPopUp(true)}
        style={{ marginTop: suggestedProducts?.length ? 0 : 20 }}
      />
    );
  };

  const renderKerbSidePickup = () => {
    return showStorePickupCard ? (
      <KerbSidePickup
        style={{ marginTop: suggestedProducts?.length ? 10 : 20 }}
        onPressProceed={() => {
          props.navigation.navigate(AppRoutes.StorePickup);
        }}
      />
    ) : null;
  };

  const renderProceedBar = () => {
    return (
      <ProceedBar
        onPressAddDeliveryAddress={() => {
          props.navigation.navigate(AppRoutes.AddAddress, {
            source: 'Cart' as AddressSource,
          });
          postPharmacyAddNewAddressClick('Cart');
        }}
        onPressSelectDeliveryAddress={() => {
          selectDeliveryAddressClickedEvent(currentPatient?.id);
          showAddressPopup();
        }}
        onPressUploadPrescription={() => {
          uploadPrescriptionClickedEvent(currentPatient?.id);
          setshowPopUp(true);
        }}
        onPressProceedtoPay={() => {
          physicalPrescriptions?.length > 0 ? uploadPhysicalPrescriptons() : onPressProceedtoPay();
        }}
        deliveryTime={deliveryTime}
        onPressChangeAddress={showAddressPopup}
        onPressTatCard={() =>
          !hasUnserviceableproduct() &&
          props.navigation.navigate(AppRoutes.CartSummary, {
            deliveryTime: deliveryTime,
            storeDistance: storeDistance,
            tatType: storeType,
            shopId: shopId,
          })
        }
      />
    );
  };

  const renderUnServiceable = () => {
    return <UnServiceable style={{ marginTop: 24 }} />;
  };

  const renderScreen = () => {
    return (
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
          {renderHeader()}
          {renderUnServiceable()}
          {renderCartItems()}
          {renderAvailFreeDelivery()}
          {renderAmountSection()}
          {renderSavings()}
          {renderSuggestProducts()}
          {renderPrescriptions()}
          {renderKerbSidePickup()}
        </ScrollView>
        {renderuploadPrescriptionPopup()}
        {renderProceedBar()}
        {loading && <Spinner />}
      </SafeAreaView>
    );
  };

  const renderEmptyCart = () => {
    return (
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <EmptyCart
          onPressAddMedicines={() => {
            props.navigation.navigate('MEDICINES');
          }}
        />
      </SafeAreaView>
    );
  };
  return <View style={{ flex: 1 }}>{cartItems?.length ? renderScreen() : renderEmptyCart()}</View>;
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginHorizontal: 20,
  },
  amountHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
});
