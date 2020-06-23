import {
  dataSavedUserID,
  doRequestAndAccessLocationModified,
  findAddrComponents,
  formatAddress,
  g,
  postWebEngageEvent,
  postWEGWhatsAppEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AddressSource } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import { MedicineUploadPrescriptionView } from '@aph/mobile-patients/src/components/Medicines/MedicineUploadPrescriptionView';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  CouponIcon,
  MedicineIcon,
  FreeShippingIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_PATIENT_ADDRESS_LIST,
  UPDATE_PATIENT_ADDRESS,
  UPLOAD_DOCUMENT,
  VALIDATE_PHARMA_COUPON,
} from '@aph/mobile-patients/src/graphql/profiles';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import {
  getDeliveryTime,
  getPlaceInfoByPincode,
  getStoreInventoryApi,
  GetStoreInventoryResponse,
  pinCodeServiceabilityApi,
  searchPickupStoresApi,
  Store,
  MedicineProduct,
  GetDeliveryTimeResponse,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  postPhamracyCartAddressSelectedFailure,
  postPhamracyCartAddressSelectedSuccess,
  postPharmacyAddNewAddressClick,
  postPharmacyStorePickupViewed,
  postPharmacyStoreSelectedSuccess,
} from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '../../graphql/types/getPatientAddressList';
import { CouponCategoryApplicable, OrderLineItems } from '../../graphql/types/globalTypes';
import {
  validatePharmaCoupon,
  validatePharmaCouponVariables,
} from '../../graphql/types/validatePharmaCoupon';
import { whatsAppUpdateAPICall } from '../../helpers/clientCalls';
import { TextInputComponent } from '../ui/TextInputComponent';
import { WhatsAppStatus } from '../ui/WhatsAppStatus';
import { OneApollo } from '@aph/mobile-patients/src/components/ui/Icons';
import { StoreDriveWayPickupPopup } from './StoreDriveWayPickupPopup';
import { StoreDriveWayPickupView } from './StoreDriveWayPickupView';

const styles = StyleSheet.create({
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  labelTextStyle: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    paddingTop: 16,
    paddingBottom: 7,
  },
  blueTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  medicineCostStyle: {
    ...theme.fonts.IBMPlexSansBold(11),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  rowSpaceBetweenStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryContainerStyle: {
    backgroundColor: colors.CARD_BG,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 11.5,
    marginBottom: 16,
    borderRadius: 5,
  },
  deliveryStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  deliveryTimeStyle: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  oneApollotxt: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
});

export interface YourCartProps extends NavigationScreenProps {}

export const YourCart: React.FC<YourCartProps> = (props) => {
  const {
    updateCartItem,
    removeCartItem,
    cartItems,
    setCartItems,
    addresses,
    setDeliveryAddressId,
    deliveryAddressId,
    storeId,
    setStoreId,
    showPrescriptionAtStore,
    deliveryCharges,
    packagingCharges,
    cartTotal,
    couponDiscount,
    productDiscount,
    grandTotal,
    coupon,
    setCoupon,
    uploadPrescriptionRequired,
    setPhysicalPrescriptions,
    physicalPrescriptions,
    pinCode,
    setPinCode,
    stores: storesFromContext,
    setStores,
    storesInventory,
    setStoresInventory,
    ePrescriptions,
    setShowPrescriptionAtStore,
    setAddresses,
  } = useShoppingCart();
  const { setAddresses: setTestAddresses } = useDiagnosticsCart();
  const [activeStores, setActiveStores] = useState<Store[]>([]);
  const selectedStore =
    (storeId && storesFromContext.find((item) => item.storeid == storeId)) || undefined;
  const selectedAddress =
    (deliveryAddressId && addresses.find((item) => item.id == deliveryAddressId)) || undefined;

  const tabs = [{ title: 'Home Delivery' }, { title: 'Store Pick Up' }];
  const [selectedTab, setselectedTab] = useState<string>(storeId ? tabs[1].title : tabs[0].title);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert, setLoading, loading } = useUIElements();
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>();
  const [isEPrescriptionUploadComplete, setisEPrescriptionUploadComplete] = useState<boolean>();
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [deliveryError, setdeliveryError] = useState<string>('');
  const [showDeliverySpinner, setshowDeliverySpinner] = useState<boolean>(true);
  const [showDriveWayPopup, setShowDriveWayPopup] = useState<boolean>(false);
  const { locationDetails, pharmacyLocation } = useAppCommonData();
  const [lastCartItemsReplica, setLastCartItemsReplica] = useState('');
  const [lastCartItemsReplicaForStorePickup, setLastCartItemsReplicaForStorePickup] = useState('');
  const [lastPincodeReplica, setLastPincodeReplica] = useState('');
  const scrollViewRef = useRef<ScrollView | null>();
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(true);

  const navigatedFrom = props.navigation.getParam('movedFrom') || '';

  // To remove applied coupon and selected storeId from cart when user goes back.
  useEffect(() => {
    return () => {
      setCoupon!(null);
      setStoreId!('');
    };
  }, []);

  useEffect(() => {
    if (cartItems.length) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CART_VIEWED] = {
        'Total items in cart': cartItems.length,
        'Sub Total': cartTotal,
        'Delivery charge': deliveryCharges,
        'Total Discount': Number((couponDiscount + productDiscount).toFixed(2)),
        'Net after discount': grandTotal,
        'Prescription Needed?': uploadPrescriptionRequired,
        'Cart Items': cartItems.map(
          (item) =>
            ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              specialPrice: item.specialPrice,
            } as ShoppingCartItem)
        ),
        'Service Area': 'Pharmacy',
        // 'Cart ID': '', // since we don't have cartId before placing order
      };
      if (coupon) {
        eventAttributes['Coupon code used'] = coupon.code;
      }
      postWebEngageEvent(WebEngageEventName.PHARMACY_CART_VIEWED, eventAttributes);
    }
  }, []);

  useEffect(() => {
    const location = pharmacyLocation || locationDetails;
    if (!(location && location.pincode)) {
      doRequestAndAccessLocationModified()
        .then((response) => {
          if (response) {
            const _pincode = response.pincode;
            !pinCode && fetchStorePickup(_pincode || '');
          }
        })
        .catch((e) => {
          CommonBugFender('YourCart_getPlaceInfoByLatLng', e);
        });
    } else {
      !pinCode && fetchStorePickup(location.pincode);
    }
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      checkServicability(selectedAddress);
    }
  }, []);

  useEffect(() => {
    getUserAddress();
  }, []);

  const getUserAddress = async () => {
    setLoading!(true);
    const userId = await dataSavedUserID('selectedProfileId');
    ((navigatedFrom === 'splashscreen' || 'registration') &&
      addresses.length == 0 &&
      client
        .query<getPatientAddressList, getPatientAddressListVariables>({
          query: GET_PATIENT_ADDRESS_LIST,
          variables: {
            patientId:
              userId !== g(currentPatient, 'id') ? g(currentPatient, 'id') || userId : userId,
          },
          fetchPolicy: 'no-cache',
        })
        .then(
          ({
            data: {
              getPatientAddressList: { addressList },
            },
          }) => {
            setLoading!(false);
            setAddresses && setAddresses(addressList!);
          }
        )
        .catch((e) => {
          setLoading!(false);
          renderAlert(`Something went wrong, unable to fetch addresses.`);
        })) ||
      setLoading!(false);
  };

  useEffect(() => {
    onFinishUpload();
  }, [isEPrescriptionUploadComplete, isPhysicalUploadComplete]);

  useEffect(() => {
    if (!deliveryAddressId && cartItems.length > 0) {
      setCartItems!(cartItems.map((item) => ({ ...item, unserviceable: false })));
    }
  }, [deliveryAddressId]);

  useEffect(() => {
    const cartItemsReplica =
      cartItems.map(({ id, quantity }) => id + quantity).toString() + deliveryAddressId;
    if (lastCartItemsReplica == cartItemsReplica) {
      setLoading!(false);
      return;
    }

    if (deliveryAddressId && cartItems.length > 0) {
      setLastCartItemsReplica(cartItemsReplica);
      setdeliveryTime('...');
      setshowDeliverySpinner(true);
      setLoading!(true);
      const lookUp = cartItems.map((item) => {
        return { sku: item.id, qty: item.quantity };
      });
      if (selectedAddress) {
        getDeliveryTime({
          postalcode: selectedAddress.zipcode || '',
          ordertype: getTatOrderType(cartItems),
          lookup: lookUp,
        })
          .then((res) => {
            setdeliveryTime('');
            const tatItemsCount = g(res, 'data', 'tat', 'length');
            if (tatItemsCount) {
              const tatItems = g(res, 'data', 'tat') || [];
              // filter out the sku's which has deliverydate > X days from the current date
              const unserviceableSkus = tatItems
                .filter(
                  ({ deliverydate }) =>
                    moment(deliverydate, 'D-MMM-YYYY HH:mm a').diff(moment(), 'days') >
                    AppConfig.Configuration.TAT_UNSERVICEABLE_DAY_COUNT
                )
                .map(({ artCode }) => artCode);

              // update cart items to unserviceable/serviceable
              const updatedCartItems = cartItems.map((item) => ({
                ...item,
                unserviceable: !!unserviceableSkus.find((sku) => item.id == sku),
              }));
              setCartItems!(updatedCartItems);

              if (unserviceableSkus.length) {
                showUnServiceableItemsAlert(updatedCartItems);
              }

              const serviceableItems = tatItems.filter(
                ({ artCode }) => !unserviceableSkus.find((sku) => artCode == sku)
              );
              const serviceableTats = serviceableItems.map(({ deliverydate }) => deliverydate);

              if (serviceableTats.length) {
                const tatDate = serviceableTats.reduce(
                  (acc, curr) =>
                    moment(curr, 'D-MMM-YYYY HH:mm a') > moment(acc, 'D-MMM-YYYY HH:mm a')
                      ? curr
                      : acc,
                  serviceableTats[0]
                );
                setdeliveryTime(tatDate);
                postPhamracyCartAddressSelectedSuccess(
                  selectedAddress.zipcode!,
                  formatAddress(selectedAddress),
                  'Yes',
                  moment(tatDate, 'D-MMM-YYYY HH:mm a').toDate()
                );
                // If all the SKUs are serviceable, call getStoreInventoryApi to check cart item prices
                // if discrepancy, update cart items and show alert
                if (!unserviceableSkus.length) {
                  fetchInventoryAndUpdateCartPricesAfterTat(serviceableItems, updatedCartItems);
                }
              } else {
                setdeliveryTime('No items are serviceable.');
                setLoading!(false);
              }
              setshowDeliverySpinner(false);
            } else {
              showGenericTatDate(lookUp);
            }
          })
          .catch((err) => {
            CommonBugFender('YourCart_getDeliveryTime', err);
            if (!Axios.isCancel(err)) {
              showGenericTatDate(lookUp, err);
            }
          });
      }
    } else if (deliveryAddressId && cartItems.length == 0) {
      setLoading!(false);
    }
  }, [deliveryAddressId, cartItems]);

  useEffect(() => {
    // update cart item prices if any after store selected
    if (storeId && cartItems.length) {
      const onComplete = () => {
        selectedStore && postPharmacyStoreSelectedSuccess(pinCode, selectedStore);
        setShowDriveWayPopup(true);
      };
      updateCartItemsWithStorePrice(
        g(storesInventory.find((item) => item.shopId == storeId)!, 'itemDetails') || [],
        cartItems,
        onComplete
      );
    }
  }, [storeId]);

  useEffect(() => {
    const pincodeReplica = lastPincodeReplica;
    const cartItemsReplica =
      cartItems.map(({ id, quantity }) => id + quantity).toString() + deliveryAddressId;
    if (lastCartItemsReplicaForStorePickup == cartItemsReplica || selectedTab == tabs[0].title) {
      return;
    }

    if (cartItems.length == 0 && activeStores.length) {
      // clear storeId & stores
      setStoreId!('');
      // setStores!([]);
      setselectedTab(tabs[0].title);
      renderAlert(string.medicine_cart.addItemsForStoresAlert);
    } else if (cartItems.length > 0 && pinCode.length == 6) {
      const inventory =
        (g(storesInventory, 'length') &&
          (g(storesInventory, '0' as any, 'itemDetails') || []).map((v) => v.itemId)) ||
        [];
      const isInventoryFetched =
        inventory.length && !cartItems.find((item) => !inventory.includes(item.id));
      if (pincodeReplica == pinCode && isInventoryFetched) {
        checkStoreInventoryAndUpdateStores(storesFromContext, cartItems, storesInventory);
      } else {
        fetchStorePickup(pinCode, true);
      }
    }
    setLastCartItemsReplicaForStorePickup(cartItemsReplica);
    setLastPincodeReplica(pinCode);
  }, [cartItems, selectedTab]);

  useEffect(() => {
    if (coupon && cartTotal > 0) {
      applyCoupon(coupon.code, cartItems);
    }
  }, [cartTotal]);

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const fetchInventoryAndUpdateCartPricesAfterTat = async (
    tatResponse: GetDeliveryTimeResponse['tat'],
    cartItems: ShoppingCartItem[]
  ) => {
    try {
      const storeIdAndItemsMapping = tatResponse.reduce(
        (prevVal, currentVal) => ({
          ...prevVal,
          [currentVal.siteId]: [...(prevVal[currentVal.siteId] || []), currentVal.artCode],
        }),
        {} as { [key: string]: string[] }
      );
      const storesInventory = await Promise.all(
        Object.keys(storeIdAndItemsMapping).map((storeId) =>
          getStoreInventoryApi(storeId, storeIdAndItemsMapping[storeId])
        )
      );
      const storeItems = storesInventory.filter(
        (item) => item.data.itemDetails && item.data.shopId
      );
      if (!storeItems.length) {
        setLoading!(false);
        return;
      }

      const filteredStoreItems = storeItems
        .map((storeItem) => storeItem.data.itemDetails)
        .reduce((prevVal, currentVal) => [...prevVal, ...currentVal], [])
        .map((storeItem) => {
          const cartItem = cartItems.find((cartItem) => cartItem.id == storeItem.itemId)!;
          return getFromattedStoreInventory(storeItem, cartItem);
        });
      const validation = cartValidation(filteredStoreItems, cartItems);

      if (validation.alertText) {
        // Below line is to stop TAT useEffect from triggering due to change in cart items
        setLastCartItemsReplica(
          validation.newItems.map(({ id, quantity }) => id + quantity).toString() +
            deliveryAddressId
        );
        setCartItems!(validation.newItems);
        showAphAlert!({
          title: 'Hi! :)',
          description: string.medicine_cart.cartUpdatedAfterPriceCheckMsg,
          unDismissable: true,
        });
      }
      setLoading!(false);
    } catch (error) {
      // Go with cart item prices if API fails
      setLoading!(false);
    }
  };

  const showGenericTatDate = (lookUp: { sku: string; qty: number }[], err?: Error) => {
    const genericServiceableDate = moment()
      .add(2, 'days')
      .set('hours', 20)
      .set('minutes', 0)
      .toString();
    setdeliveryTime(genericServiceableDate);
    setshowDeliverySpinner(false);
    setLoading!(false);
    postTatResponseFailureEvent(err || {}, g(selectedAddress, 'zipcode')!, lookUp);
  };

  const getFromattedStoreInventory = (
    storeItem: GetStoreInventoryResponse['itemDetails'][0],
    cartItem: ShoppingCartItem
  ) => {
    const storeItemPrice = Number((storeItem.mrp * Number(cartItem.mou)).toFixed(2));
    const storeItemSP =
      cartItem.specialPrice && cartItem.price != storeItemPrice
        ? getSpecialPriceFromRelativePrices(
            cartItem.price,
            cartItem.specialPrice,
            storeItem.mrp * Number(cartItem.mou)
          )
        : cartItem.specialPrice;
    return {
      sku: cartItem.id,
      name: cartItem.name,
      is_in_stock: 1,
      price: storeItemPrice,
      special_price: storeItemSP,
    } as MedicineProduct;
  };

  const getSpecialPriceFromRelativePrices = (
    price: number,
    specialPrice: number,
    newPrice: number
  ) => Number(((specialPrice / price) * newPrice).toFixed(2));

  const updateCartItemsWithStorePrice = (
    storeItems: GetStoreInventoryResponse['itemDetails'],
    cartItems: ShoppingCartItem[],
    onComplete: () => void
  ) => {
    const validation = cartValidation(
      storeItems
        .filter((storeItem) => cartItems.find((cartItem) => cartItem.id == storeItem.itemId))
        .map((storeItem) => {
          const cartItem = cartItems.find((cartItem) => cartItem.id == storeItem.itemId)!;
          return getFromattedStoreInventory(storeItem, cartItem);
        }),
      cartItems
    );
    if (validation.alertText) {
      // setStoreInventoryCheck(false);
      setLoading!(false);
      showAphAlert!({
        title: 'Hi! :)',
        description: validation.alertText,
        unDismissable: true,
        onPressOk: () => {
          hideAphAlert!();
          setCartItems!(validation.newItems);
        },
      });
    } else {
      onComplete();
    }
  };

  const areItemsAvailableInStore = (
    storeItems: GetStoreInventoryResponse['itemDetails'],
    cartItems: ShoppingCartItem[]
  ) => {
    const isInventoryAvailable = (cartItem: ShoppingCartItem) =>
      !!storeItems.find((item) => item.itemId == cartItem.id && item.qty >= cartItem.quantity);

    return !cartItems.find((item) => !isInventoryAvailable(item));
  };

  const _validateCoupon = (variables: validatePharmaCouponVariables) =>
    client.mutate<validatePharmaCoupon, validatePharmaCouponVariables>({
      mutation: VALIDATE_PHARMA_COUPON,
      variables,
    });

  const validateCoupon = (coupon: string, cartItems: ShoppingCartItem[], patientId: string) => {
    return _validateCoupon({
      pharmaCouponInput: {
        code: coupon,
        patientId: patientId,
        orderLineItems: cartItems.map(
          (item) =>
            ({
              itemId: item.id,
              mrp: item.price,
              productName: item.name,
              productType: item.isMedicine
                ? CouponCategoryApplicable.PHARMA
                : CouponCategoryApplicable.FMCG,
              quantity: item.quantity,
              specialPrice: item.specialPrice || item.price,
            } as OrderLineItems)
        ),
      },
    });
  };

  const removeCouponWithAlert = (message: string) => {
    setCoupon!(null);
    renderAlert(message);
  };

  const applyCoupon = (coupon: string, cartItems: ShoppingCartItem[]) => {
    CommonLogEvent(AppRoutes.ApplyCouponScene, 'Apply coupon');
    setLoading!(true);
    validateCoupon(coupon, cartItems, g(currentPatient, 'id') || '')
      .then(({ data }) => {
        const validityStatus = g(data, 'validatePharmaCoupon', 'validityStatus');
        if (validityStatus) {
          setCoupon!({ code: coupon, ...g(data, 'validatePharmaCoupon')! });
        } else {
          removeCouponWithAlert(
            g(data, 'validatePharmaCoupon', 'reasonForInvalidStatus') || 'Invalid Coupon Code.'
          );
        }
      })
      .catch(() => {
        removeCouponWithAlert('Sorry, unable to validate coupon right now.');
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const getTatOrderType = (cartItems: ShoppingCartItem[]) => {
    const isPharma = cartItems.find((item) => item.isMedicine);
    const isFmcg = cartItems.find((item) => !item.isMedicine);
    return isPharma && isFmcg ? 'both' : isPharma ? 'pharma' : 'fmcg';
  };

  const showUnServiceableItemsAlert = (cartItems: ShoppingCartItem[]) => {
    showAphAlert!({
      title: string.medicine_cart.tatUnServiceableAlertTitle,
      description: string.medicine_cart.tatUnServiceableAlertDesc,
      titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
      CTAs: [
        {
          text: string.medicine_cart.tatUnServiceableAlertChangeCTA,
          type: 'orange-link',
          onPress: onPressChangeAddress,
        },
        {
          text: string.medicine_cart.tatUnServiceableAlertRemoveCTA,
          type: 'orange-link',
          onPress: () => removeUnServiceableItems(cartItems),
        },
      ],
    });
  };

  const onPressChangeAddress = () => {
    hideAphAlert!();
    scrollViewRef.current && scrollViewRef.current.scrollToEnd();
  };

  const removeUnServiceableItems = (cartItems: ShoppingCartItem[]) => {
    hideAphAlert!();
    setCartItems!(cartItems.filter((item) => !item.unserviceable));
    scrollViewRef.current && scrollViewRef.current.scrollTo(0, 0, true);
  };

  const postTatResponseFailureEvent = (
    error: object,
    pincode: string,
    lookUp: { sku: string; qty: number }[]
  ) => {
    try {
      const eventAttributes: WebEngageEvents[WebEngageEventName.TAT_API_FAILURE] = {
        pincode,
        lookUp,
        error,
      };
      postWebEngageEvent(WebEngageEventName.TAT_API_FAILURE, eventAttributes);
    } catch (error) {}
  };

  const onUpdateCartItem = ({ id }: ShoppingCartItem, unit: number) => {
    if (!(unit < 1)) {
      updateCartItem && updateCartItem({ id, quantity: unit });
    }
  };

  const onRemoveCartItem = ({ id }: ShoppingCartItem) => {
    removeCartItem && removeCartItem(id);
  };

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'MEDICINES CART'}
        rightComponent={
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (navigatedFrom === 'registration') {
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
                  props.navigation.navigate(AppRoutes.SearchMedicineScene);
                  setCoupon!(null);
                  // to stop triggering useEffect on every change in cart items
                  setStoreId!('');
                  setselectedTab(tabs[0].title);
                }
              }}
            >
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(13),
                  color: theme.colors.APP_YELLOW,
                }}
              >
                ADD ITEMS
              </Text>
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.YourCart, 'Go back to add items');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };

  const postwebEngageProductClickedEvent = ({ name, id }: ShoppingCartItem) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED] = {
      'product name': name,
      'product id': id,
      Brand: '',
      'Brand ID': '',
      'category name': '',
      'category ID': '',
      Source: 'List',
      'Section Name': 'CART',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PRODUCT_CLICKED, eventAttributes);
  };

  const renderItemsInCart = () => {
    const cartItemsCount =
      cartItems.length > 10 || cartItems.length == 0
        ? `${cartItems.length}`
        : `0${cartItems.length}`;
    const FreeShipping =
      AppConfig.Configuration.MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY > 0 &&
      cartTotal - couponDiscount - productDiscount >=
        AppConfig.Configuration.MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY &&
      cartTotal - couponDiscount - productDiscount <
        AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY &&
      AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY -
        (cartTotal - couponDiscount - productDiscount);
    return (
      <View>
        {renderLabel('ITEMS IN YOUR CART', cartItemsCount)}
        {cartItems.length == 0 && (
          <Text
            style={{
              color: theme.colors.FILTER_CARD_LABEL,
              ...theme.fonts.IBMPlexSansMedium(13),
              margin: 20,
              textAlign: 'center',
              opacity: 0.3,
            }}
          >
            Your Cart is empty
          </Text>
        )}
        {cartItems.map((medicine, index, array) => {
          const medicineCardContainerStyle = [
            { marginBottom: 8, marginHorizontal: 20 },
            index == 0 ? { marginTop: 20 } : {},
            index == array.length - 1 ? (FreeShipping ? {} : { marginBottom: 20 }) : {},
          ];
          const imageUrl = medicine.prescriptionRequired
            ? ''
            : medicine.thumbnail && !medicine.thumbnail.includes('/default/placeholder')
            ? medicine.thumbnail.startsWith('http')
              ? medicine.thumbnail
              : `${AppConfig.Configuration.IMAGES_BASE_URL}${medicine.thumbnail}`
            : '';

          return (
            <MedicineCard
              // personName={
              //   currentPatient && currentPatient.firstName ? currentPatient.firstName : ''
              // }
              containerStyle={medicineCardContainerStyle}
              key={medicine.id}
              onPress={() => {
                postwebEngageProductClickedEvent(medicine);
                CommonLogEvent(AppRoutes.YourCart, 'Navigate to medicine details scene');
                props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
                  sku: medicine.id,
                  title: medicine.name,
                });
              }}
              medicineName={medicine.name}
              price={medicine.price}
              specialPrice={(coupon && medicine.couponPrice) || medicine.specialPrice}
              unit={medicine.quantity}
              imageUrl={imageUrl}
              onPressAdd={() => {}}
              onPressRemove={() => {
                CommonLogEvent(AppRoutes.YourCart, 'Remove item from cart');
                onRemoveCartItem(medicine);
              }}
              onChangeUnit={(unit) => {
                CommonLogEvent(AppRoutes.YourCart, 'Change unit in cart');
                onUpdateCartItem(medicine, unit);
              }}
              isCardExpanded={true}
              isInStock={medicine.isInStock}
              unserviceable={medicine.unserviceable}
              showRemoveWhenOutOfStock={!medicine.isInStock || medicine.unserviceable}
              isPrescriptionRequired={medicine.prescriptionRequired}
              subscriptionStatus={'unsubscribed'}
              packOfCount={parseInt(medicine.mou || '0')}
              onChangeSubscription={() => {}}
              onEditPress={() => {}}
              onAddSubscriptionPress={() => {}}
            />
          );
        })}
        {cartItems.length > 0 && FreeShipping ? (
          <View
            style={{
              shadowColor: 'rgba(128, 128, 128, 0.3)',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 5,
              elevation: 5,
              flexDirection: 'row',
              marginHorizontal: 20,
              marginBottom: 20,
              backgroundColor: '#f7f8f5',
              borderRadius: 10,
              paddingHorizontal: 17,
              paddingVertical: 11,
              paddingBottom: 9,
            }}
          >
            <FreeShippingIcon style={{ width: 15, height: 15, marginTop: 3, marginRight: 3 }} />
            <Text
              style={{
                ...theme.viewStyles.text('M', 12, '#02475b', 1, 20, 0),
                alignSelf: 'center',
              }}
            >
              Add <Text style={{ color: '#fc9916' }}>Rs. {FreeShipping.toFixed(2)}</Text> worth more
              of product for FREE Delivery
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const [checkingServicability, setCheckingServicability] = useState(false);

  const checkServicability = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    if (deliveryAddressId && deliveryAddressId == address.id) {
      return;
    }
    setdeliveryTime('');
    setdeliveryError('');
    setshowDeliverySpinner(false);
    // setCheckingServicability(true);
    setLoading!(true);
    pinCodeServiceabilityApi(address.zipcode!)
      .then(({ data }) => {
        if (g(data, 'Availability')) {
          // Not stopping checkingServicability spinner here, it'll be stopped in useEffect that triggers when change in DeliveryAddressId
          setDeliveryAddressId && setDeliveryAddressId(address.id);
        } else {
          setDeliveryAddressId && setDeliveryAddressId('');
          // setCheckingServicability(false);
          setLoading!(false);
          postPhamracyCartAddressSelectedFailure(address.zipcode!, formatAddress(address), 'No');
          renderAlert(string.medicine_cart.pharmaAddressUnServiceableAlert);
        }
      })
      .catch((e) => {
        CommonBugFender('YourCart_checkServicability', e);
        setDeliveryAddressId && setDeliveryAddressId('');
        // setCheckingServicability(false);
        setLoading!(false);
        renderAlert(string.medicine_cart.pharmaAddressServiceabilityFailure);
      })
      .finally(() => {});
  };

  const renderHomeDelivery = () => {
    return (
      <View
        style={{ marginTop: 8, marginHorizontal: 16 }}
        pointerEvents={checkingServicability ? 'none' : 'auto'}
      >
        {checkingServicability ? (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              alignSelf: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" color="green" />
          </View>
        ) : null}
        {slicedAddressList.map((item, index, array) => {
          return (
            <RadioSelectionItem
              key={item.id}
              title={formatAddress(item)}
              isSelected={deliveryAddressId == item.id}
              onPress={() => {
                CommonLogEvent(AppRoutes.YourCart, 'Check service availability');
                checkServicability(item);
              }}
              containerStyle={{ marginTop: 16 }}
              hideSeparator={index + 1 === array.length}
            />
          );
        })}
        <View style={styles.rowSpaceBetweenStyle}>
          <Text
            style={styles.yellowTextStyle}
            onPress={() => {
              CommonLogEvent(AppRoutes.YourCart, 'Add new address');
              postPharmacyAddNewAddressClick('Cart');
              props.navigation.navigate(AppRoutes.AddAddress, {
                source: 'Cart' as AddressSource,
              });
            }}
          >
            ADD NEW ADDRESS
          </Text>
          <View>
            {addresses.length > 2 && (
              <Text
                style={styles.yellowTextStyle}
                onPress={() => props.navigation.navigate(AppRoutes.SelectDeliveryAddress)}
              >
                VIEW ALL
              </Text>
            )}
          </View>
        </View>
        {deliveryAddressId && (deliveryTime || deliveryError) ? (
          <View>
            <View style={styles.separatorStyle} />
            <View style={styles.deliveryContainerStyle}>
              {showDeliverySpinner ? (
                <ActivityIndicator animating={true} size={'small'} color="green" />
              ) : (
                <View style={styles.rowSpaceBetweenStyle}>
                  <Text style={styles.deliveryStyle}>{deliveryTime && 'Delivery Time'}</Text>
                  <Text style={styles.deliveryTimeStyle}>
                    {moment(deliveryTime).isValid()
                      ? moment(deliveryTime).format('D MMM YYYY  | hh:mm A')
                      : '...' || deliveryError}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={{ height: 9 }} />
        )}
      </View>
    );
  };

  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean | undefined>(false);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  const getStoresInventory = (storeIds: string[], cartItems: ShoppingCartItem[]) =>
    Promise.all(
      storeIds.map((storeId) =>
        getStoreInventoryApi(
          storeId,
          cartItems.map((item) => item.id)
        )
      )
    );

  const handleStoresError = (e?: Error) => {
    e && CommonBugFender('YourCart_fetchStorePickup', e);
    setStorePickUpLoading(false);
    setLoading!(false);
  };

  const updateStores = (
    activeStores: Store[],
    stores: Store[],
    storesInventory: GetStoreInventoryResponse[]
  ) => {
    postPharmacyStorePickupViewed({
      Pincode: pinCode,
      'Store display success': activeStores.length ? 'Yes' : 'No',
    });
    setStorePickUpLoading(false);
    setLoading!(false);
    setStores!(stores);
    setActiveStores(activeStores);
    setSlicedStoreList(activeStores.length ? activeStores.slice(0, 2) : []);
    setStoresInventory!(storesInventory);
    // !activeStores.length && setStoreId!('');
    setStoreId!('');
  };

  const checkStoreInventoryAndUpdateStores = (
    stores: Store[],
    cartItems: ShoppingCartItem[],
    storeItemsInventory?: GetStoreInventoryResponse[]
  ) => {
    const handle = (
      storeItemsInventory: GetStoreInventoryResponse[],
      stores: Store[],
      cartItems: ShoppingCartItem[]
    ) => {
      const storesWithInventory = storeItemsInventory.filter((item) => {
        const storeItems = g(item, 'itemDetails');
        return storeItems && areItemsAvailableInStore(storeItems, cartItems);
      });
      const storeIdsWithInventory = storesWithInventory.map((item) => item.shopId);
      const storesWithFullInventory = stores.filter((item) =>
        storeIdsWithInventory.includes(item.storeid)
      );
      updateStores(storesWithFullInventory, stores, storeItemsInventory);
    };

    storeItemsInventory
      ? handle(storeItemsInventory, stores, cartItems)
      : getStoresInventory(
          stores.map((s) => s.storeid),
          cartItems
        )
          .then((storeItemsInventory) => {
            handle(
              storeItemsInventory.map((v) => v.data),
              stores,
              cartItems
            );
          })
          .catch(handleStoresError);
  };

  const fetchStorePickup = (pincode: string, globalLoading?: boolean) => {
    if (isValidPinCode(pincode)) {
      setPinCode && setPinCode(pincode);
      if (pincode.length == 6) {
        globalLoading ? setLoading!(true) : setStorePickUpLoading(true);
        searchPickupStoresApi(pincode)
          .then(({ data: { Stores, stores_count } }) => {
            const stores = (stores_count && Stores) || [];
            if (stores.length) {
              checkStoreInventoryAndUpdateStores(stores, cartItems);
            } else {
              updateStores([], [], []);
            }
          })
          .catch(handleStoresError);
      } else {
        setStores!([]);
        setStoresInventory!([]);
        setActiveStores([]);
        setStoreId!('');
      }
    }
  };

  const [slicedStoreList, setSlicedStoreList] = useState<Store[]>([]);
  const [slicedAddressList, setSlicedAddressList] = useState<
    savePatientAddress_savePatientAddress_patientAddress[]
  >([]);

  const updateStoreSelection = () => {
    const selectedStoreIndex = activeStores.findIndex(({ storeid }) => storeid == storeId);
    const storesLength = activeStores.length;
    const spliceStartIndex =
      selectedStoreIndex == storesLength - 1 ? selectedStoreIndex - 1 : selectedStoreIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const _slicedStoreList = [...activeStores].slice(startIndex, startIndex + 2);
    setSlicedStoreList(_slicedStoreList);
  };

  const updateAddressSelection = () => {
    const selectedAddressIndex = addresses.findIndex((address) => address.id == deliveryAddressId);
    const addressListLength = addresses.length;
    const spliceStartIndex =
      selectedAddressIndex == addressListLength - 1
        ? selectedAddressIndex - 1
        : selectedAddressIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const _slicedAddressList = [...addresses].slice(startIndex, startIndex + 2);
    setSlicedAddressList(_slicedAddressList);
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', () => {
      updateStoreSelection();
      updateAddressSelection();
    });
    const _willBlurSubscription = props.navigation.addListener('willBlur', () => {
      updateStoreSelection();
      updateAddressSelection();
    });
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, [activeStores, storeId, addresses, deliveryAddressId]);

  useEffect(() => {
    pinCode.length !== 6 && setSlicedStoreList([]);
  }, [pinCode]);

  const renderStorePickup = () => {
    return (
      <View style={{}}>
        {!!slicedStoreList.length && (
          <StoreDriveWayPickupView onPress={() => setShowDriveWayPopup(true)} />
        )}
        <View style={{ margin: 16 }}>
          <TextInputComponent
            value={`${pinCode}`}
            maxLength={6}
            onChangeText={(pincode) => fetchStorePickup(pincode)}
            placeholder={'Enter Pincode'}
          />
          {storePickUpLoading && <ActivityIndicator color="green" size="large" />}
          {!storePickUpLoading && pinCode.length == 6 && activeStores.length == 0 && (
            <Text
              style={{
                paddingTop: 10,
                ...theme.fonts.IBMPlexSansMedium(16),
                lineHeight: 24,
                color: '#0087ba',
              }}
            >
              Sorry! We’re working hard to get to this area! In the meantime, you can either pick up
              from a nearby store, or change the pincode.
            </Text>
          )}
          {slicedStoreList.map((store, index, array) => (
            <RadioSelectionItem
              key={store.storeid}
              title={`${store.storename}\n${store.address}`}
              isSelected={storeId === store.storeid}
              onPress={() => {
                CommonLogEvent(AppRoutes.YourCart, 'Set store id');
                setStoreId && setStoreId(store.storeid);
                // setShowDriveWayPopup(true);
              }}
              containerStyle={{ marginTop: 16 }}
              hideSeparator={index == array.length - 1}
            />
          ))}
          <View>
            {activeStores.length > 2 && (
              <Text
                style={{ ...styles.yellowTextStyle, textAlign: 'right' }}
                onPress={() =>
                  props.navigation.navigate(AppRoutes.StorPickupScene, {
                    pincode: pinCode,
                    stores: activeStores,
                    fetchStores: fetchStorePickup,
                  })
                }
              >
                VIEW ALL
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderDelivery = () => {
    return (
      <View>
        {renderLabel('WHERE SHOULD WE DELIVER?')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 24,
          }}
        >
          <TabsComponent
            style={{
              borderRadius: 0,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: 'rgba(2, 71, 91, 0.2)',
            }}
            data={tabs}
            onChange={(selectedTab: string) => {
              if (selectedTab == tabs[1].title && cartItems.length == 0) {
                renderAlert(string.medicine_cart.addItemsForStoresAlert);
                return;
              }
              setselectedTab(selectedTab);
              setStoreId!('');
              setDeliveryAddressId!('');
              setShowPrescriptionAtStore!(false);
              // store pickup related
              // setLastCartItemsReplicaForStorePickup('');
              // delivery time related
              setdeliveryTime('');
              setdeliveryError('');
              setshowDeliverySpinner(false);
              setLastCartItemsReplica('');
            }}
            selectedTab={selectedTab}
          />
          {selectedTab === tabs[0].title ? renderHomeDelivery() : renderStorePickup()}
        </View>
      </View>
    );
  };

  const renderCouponSection = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (cartTotal == 0) {
            renderAlert('Please add items in the cart to apply coupon.');
          } else {
            props.navigation.navigate(AppRoutes.ApplyCouponScene);
            setCoupon!(null);
          }
        }}
      >
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            ...theme.viewStyles.shadowStyle,
            padding: 16,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <CouponIcon />
            <View style={{ flex: 1 }}>
              {!coupon ? (
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 17, theme.colors.SHERPA_BLUE),
                    paddingHorizontal: 16,
                  }}
                >
                  {'Apply Coupon'}
                </Text>
              ) : (
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 17, theme.colors.SHERPA_BLUE),
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{
                      ...theme.viewStyles.text('M', 17, '#00b38e'),
                      paddingHorizontal: 16,
                    }}
                  >
                    {coupon.code + ' '}
                  </Text>
                  Applied
                </Text>
              )}

              {!!coupon && (
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 12, '#01475b', 1, 24),
                    paddingHorizontal: 16,
                    marginTop: 1,
                  }}
                >
                  {coupon.successMessage}
                </Text>
              )}
            </View>
            <ArrowRight />
          </View>
          {!!coupon && (
            <View
              style={{
                marginTop: 8,
                borderRadius: 3,
                backgroundColor: 'rgba(0, 135, 186, 0.07)',
                borderColor: '#0087ba',
                borderWidth: 1,
              }}
            >
              <Text
                style={{
                  ...theme.viewStyles.text('R', 16, '#0087ba'),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                {coupon.discountedTotals!.couponDiscount > 0
                  ? `Savings of Rs. ${couponDiscount.toFixed(2)} on the bill`
                  : 'Coupon not applicable on your cart item(s) or item(s) with already higher discounts'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTotalCharges = () => {
    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        {renderCouponSection()}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 8,
            marginBottom: 12,
            padding: 16,
          }}
        >
          <View style={styles.rowSpaceBetweenStyle}>
            <Text style={styles.blueTextStyle}>MRP Total</Text>
            <Text style={styles.blueTextStyle}>Rs. {cartTotal.toFixed(2)}</Text>
          </View>
          {productDiscount > 0 && (
            <View style={[styles.rowSpaceBetweenStyle, { marginTop: 5 }]}>
              <Text style={styles.blueTextStyle}>Product Discount</Text>
              <Text style={styles.blueTextStyle}>- Rs. {productDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.rowSpaceBetweenStyle, { marginTop: 5 }]}>
            <Text style={styles.blueTextStyle}>Delivery Charges</Text>
            <Text style={styles.blueTextStyle}>+ Rs. {deliveryCharges.toFixed(2)}</Text>
          </View>
          <View style={[styles.rowSpaceBetweenStyle, { marginTop: 5 }]}>
            <Text style={styles.blueTextStyle}>Packaging Charges</Text>
            <Text style={styles.blueTextStyle}>+ Rs. {packagingCharges.toFixed(2)}</Text>
          </View>
          {/* <View style={[styles.rowSpaceBetweenStyle, { marginTop: 5 }]}>
              <Text style={styles.blueTextStyle}>Packaging Charges</Text>
              <Text style={styles.blueTextStyle}>+ Rs. {(0).toFixed(2)}</Text>
            </View> */}
          <View style={[styles.separatorStyle, { marginTop: 16, marginBottom: 7 }]} />
          {!!coupon && (
            <>
              <View style={[styles.rowSpaceBetweenStyle, { marginTop: 5 }]}>
                <Text style={styles.blueTextStyle}>Total</Text>
                <Text style={styles.blueTextStyle}>
                  Rs. {(cartTotal - productDiscount + deliveryCharges).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.rowSpaceBetweenStyle, { marginTop: 5 }]}>
                <Text style={styles.blueTextStyle}>Discount({coupon.code})</Text>
                <Text style={styles.blueTextStyle}>- Rs. {couponDiscount.toFixed(2)}</Text>
              </View>
              <View
                style={[
                  styles.separatorStyle,
                  { marginTop: 16, marginBottom: 7, borderBottomWidth: 0.75 },
                ]}
              />
            </>
          )}
          <View style={[styles.rowSpaceBetweenStyle, { marginTop: 5 }]}>
            <Text style={[styles.blueTextStyle, { ...theme.fonts.IBMPlexSansBold(16) }]}>
              TO PAY
            </Text>
            <Text style={[styles.blueTextStyle, { ...theme.fonts.IBMPlexSansBold(16) }]}>
              Rs. {grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /*
  const medicineSuggestions = [
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
  ];

  const renderMedicineItem = (
    item: { name: string; cost: string },
    index: number,
    length: number
  ) => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          shadowRadius: 4,
          marginBottom: 20,
          marginTop: 11,
          marginHorizontal: 6,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <MedicineIcon />
        <Text style={[styles.blueTextStyle, { paddingTop: 4 }]}>{item.name}</Text>
        <View style={[styles.separatorStyle, { marginTop: 3, marginBottom: 5 }]} />
        <Text style={styles.medicineCostStyle}>
          {item.cost} <Text style={{ ...theme.fonts.IBMPlexSansMedium(12) }}>/strip</Text>
        </Text>
      </View>
    );
  };

  const renderMedicineSuggestions = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          paddingTop: 16,
          marginTop: 12,
        }}
      >
        {renderLabel('YOU SHOULD ALSO ADD')}

        <FlatList
          contentContainerStyle={{
            marginHorizontal: 14,
          }}
          horizontal={true}
          bounces={false}
          data={medicineSuggestions}
          renderItem={({ item, index }) =>
            renderMedicineItem(item, index, medicineSuggestions.length)
          }
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };
  */

  const disableProceedToPay = !(
    cartItems.length > 0 &&
    !showDeliverySpinner &&
    !cartItems.find((item) => !item.isInStock) &&
    !cartItems.find((item) => item.unserviceable) &&
    !!(deliveryAddressId || storeId) &&
    (uploadPrescriptionRequired
      ? (storeId && showPrescriptionAtStore) ||
        physicalPrescriptions.length > 0 ||
        ePrescriptions.length > 0
      : true)
  );

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

  const physicalPrescriptionUpload = () => {
    const prescriptions = physicalPrescriptions;

    setLoading!(true);
    const unUploadedPres = prescriptions.filter((item) => !item.uploadedUrl);
    if (unUploadedPres.length > 0) {
      multiplePhysicalPrescriptionUpload(unUploadedPres)
        .then((data) => {
          //For previous code refer build previous to DEV_10.0.62
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
        })
        .catch((e) => {
          CommonBugFender('YourCart_physicalPrescriptionUpload', e);
          setLoading!(false);
          renderAlert('Error occurred while uploading prescriptions.');
        });
    } else {
      setisPhysicalUploadComplete(true);
    }
  };

  const ePrescriptionUpload = () => {
    setLoading!(true);
    setisEPrescriptionUploadComplete(true);
  };

  const forwardToCheckout = () => {
    const zipcode = g(selectedAddress, 'zipcode');
    const isChennaiAddress = AppConfig.Configuration.CHENNAI_PHARMA_DELIVERY_PINCODES.find(
      (addr) => addr == Number(zipcode)
    );
    if (isChennaiAddress) {
      props.navigation.navigate(AppRoutes.CheckoutSceneNew, {
        deliveryTime,
        isChennaiOrder: true,
      });
    } else {
      props.navigation.navigate(AppRoutes.CheckoutSceneNew, {
        deliveryTime,
      });
    }
  };

  const onFinishUpload = () => {
    if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length == 0 &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      forwardToCheckout();
    } else if (
      physicalPrescriptions.length == 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete
    ) {
      setLoading!(false);
      setisEPrescriptionUploadComplete(false);
      forwardToCheckout();
    } else if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      setisEPrescriptionUploadComplete(false);
      forwardToCheckout();
    }
  };

  const postwebEngageProceedToPayEvent = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PROCEED_TO_PAY_CLICKED] = {
      'Total items in cart': cartItems.length,
      'Sub Total': cartTotal,
      'Delivery charge': deliveryCharges,
      'Net after discount': grandTotal,
      'Prescription Needed?': uploadPrescriptionRequired,
      // 'Cart ID': '', // since we don't have cartId before placing order
      'Mode of Delivery': selectedTab === tabs[0].title ? 'Home' : 'Pickup',
      'Delivery Date Time':
        selectedTab === tabs[0].title && moment(deliveryTime).isValid ? deliveryTime : undefined, // Optional (only if Home)
      'Pin Code': pinCode,
      'Service Area': 'Pharmacy',
    };
    if (selectedStore) {
      eventAttributes['Store Id'] = selectedStore.storeid;
      eventAttributes['Store Name'] = selectedStore.storename;
    }
    postWebEngageEvent(WebEngageEventName.PHARMACY_PROCEED_TO_PAY_CLICKED, eventAttributes);
  };

  const updateAddressLatLong = async (
    address: savePatientAddress_savePatientAddress_patientAddress,
    onComplete: () => void
  ) => {
    try {
      const data = await getPlaceInfoByPincode(address.zipcode!);
      const { lat, lng } = data.data.results[0].geometry.location;
      const state = findAddrComponents(
        'administrative_area_level_1',
        data.data.results[0].address_components
      );
      const stateCode = findAddrComponents(
        'administrative_area_level_1',
        data.data.results[0].address_components,
        'short_name'
      );
      const finalStateCode =
        AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING[
          state as keyof typeof AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING
        ] || stateCode;

      await client.mutate<updatePatientAddress, updatePatientAddressVariables>({
        mutation: UPDATE_PATIENT_ADDRESS,
        variables: {
          UpdatePatientAddressInput: {
            id: address.id,
            addressLine1: address.addressLine1!,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode!,
            landmark: address.landmark,
            mobileNumber: address.mobileNumber,
            addressType: address.addressType,
            otherAddressType: address.otherAddressType,
            latitude: lat,
            longitude: lng,
            stateCode: finalStateCode,
          },
        },
      });
      const newAddrList = [
        { ...address, latitude: lat, longitude: lng, stateCode: finalStateCode },
        ...addresses.filter((item) => item.id != address.id),
      ];
      setAddresses!(newAddrList);
      setTestAddresses!(newAddrList);
      onComplete();
    } catch (error) {
      // Let the user order journey continue, even if no lat-lang.
      onComplete();
    }
  };

  const whatsappAPICalled = () => {
    if (!g(currentPatient, 'whatsAppMedicine')) {
      postWEGWhatsAppEvent(whatsAppUpdate);
      callWhatsOptAPICall(whatsAppUpdate);
    }
  };

  type CartItemChange = 'not-available' | 'out-of-stock' | 'MRP-change' | 'SP-change' | 'no-change';
  type CartItemChanges = {
    change: CartItemChange;
    updatedItemFromApi?: MedicineProduct;
    cartItem: ShoppingCartItem;
  };

  const isChangeInItem = (
    cartItem: ShoppingCartItem,
    updatedItemsFromApi: MedicineProduct[]
  ): { change: CartItemChange; updatedItem?: MedicineProduct } => {
    const item = updatedItemsFromApi.find((item) => item.sku == cartItem.id);
    const change = item
      ? !item.is_in_stock
        ? 'out-of-stock'
        : cartItem.price != item.price
        ? 'MRP-change'
        : cartItem.specialPrice && cartItem.specialPrice != item.special_price
        ? 'SP-change'
        : 'no-change'
      : 'not-available';

    return { change: change, updatedItem: item! };
  };

  const cartValidation = (
    updatedItemsFromApi: MedicineProduct[],
    cartItems: ShoppingCartItem[]
  ): { newItems: ShoppingCartItem[]; alertText: string } => {
    let newCartItems: ShoppingCartItem[] = [];
    let cartItemChanges: CartItemChanges[] = [];

    cartItems.forEach((cartItem) => {
      const response = isChangeInItem(cartItem, updatedItemsFromApi);
      if (response.change == 'no-change') {
        newCartItems = [...newCartItems, cartItem];
      } else if (response.change == 'not-available') {
        cartItemChanges = [
          ...cartItemChanges,
          {
            change: response.change,
            updatedItemFromApi: undefined,
            cartItem: cartItem,
          },
        ];
      } else {
        newCartItems = [
          ...newCartItems,
          {
            ...cartItem,

            isInStock: !!g(response, 'updatedItem', 'is_in_stock'),
            price: Number(g(response, 'updatedItem', 'price')!),
            specialPrice: Number(g(response, 'updatedItem', 'special_price')!),
          },
        ];
        cartItemChanges = [
          ...cartItemChanges,
          {
            change: response.change,
            updatedItemFromApi: response.updatedItem,
            cartItem: cartItem,
          },
        ];
      }
    });

    return {
      newItems: newCartItems,
      // alertText: getItemsChangeAlert(cartItemChanges),
      alertText: cartItemChanges.length
        ? `Important message for items in your Cart:\n\nItems in your cart will reflect the most recent price in your region.\n\nWe have updated your cart with the latest prices. Please check before you place the order.`
        : '',
    };
  };

  const onPressProceedToPay = () => {
    postwebEngageProceedToPayEvent();
    whatsappAPICalled();

    const proceed = () => {
      const prescriptions = physicalPrescriptions;
      if (prescriptions.length == 0 && ePrescriptions.length == 0) {
        setLoading!(false);
        forwardToCheckout();
      } else {
        if (prescriptions.length > 0) {
          physicalPrescriptionUpload();
        }
        if (ePrescriptions.length > 0) {
          ePrescriptionUpload();
        }
      }
    };

    const addressLatLongCheckAndProceed = () => {
      if (
        g(selectedAddress, 'latitude') &&
        g(selectedAddress, 'longitude') &&
        g(selectedAddress, 'stateCode')
      ) {
        proceed();
      } else {
        setLoading!(true);
        updateAddressLatLong(selectedAddress!, proceed);
      }
    };

    if (deliveryAddressId) {
      setLoading!(true);
      addressLatLongCheckAndProceed();
    } else {
      proceed();
    }
  };

  const renderOneapollotext = () => {
    return (
      <View style={styles.oneApollotxt}>
        <View style={{ flex: 0.13 }}>
          <OneApollo style={{ height: 25, width: 33 }} />
        </View>
        <View style={{ flex: 0.87 }}>
          <Text
            numberOfLines={2}
            style={{
              ...theme.fonts.IBMPlexSansMedium(13),
              color: theme.colors.SHADE_GREY,
            }}
          >
            {`You will earn OneApollo Health Credits for this transaction, if applicable. T&C apply.`}
          </Text>
        </View>
      </View>
    );
  };

  const callWhatsOptAPICall = async (optedFor: boolean) => {
    const userId = await dataSavedUserID('selectedProfileId');

    whatsAppUpdateAPICall(client, optedFor, optedFor, userId ? userId : g(currentPatient, 'id'))
      .then(({ data }: any) => {
        console.log(data, 'whatsAppUpdateAPICall');
      })
      .catch((e: any) => {
        CommonBugFender('YourCart_whatsAppUpdateAPICall_error', e);
        console.log('error', e);
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        <ScrollView
          ref={(ref) => {
            scrollViewRef.current = ref;
          }}
          bounces={false}
        >
          <View style={{ marginVertical: 24 }}>
            {renderItemsInCart()}
            <MedicineUploadPrescriptionView
              selectedTab={selectedTab}
              setSelectedTab={setselectedTab}
              navigation={props.navigation}
            />
            {renderDelivery()}
            {renderTotalCharges()}
            {renderOneapollotext()}
            {/* {renderMedicineSuggestions()} */}
          </View>
          {!g(currentPatient, 'whatsAppMedicine') ? (
            <WhatsAppStatus
              style={{ marginTop: 6 }}
              onPress={() => {
                whatsAppUpdate ? setWhatsAppUpdate(false) : setWhatsAppUpdate(true);
              }}
              isSelected={whatsAppUpdate}
            />
          ) : null}

          <View style={{ height: 70 }} />
        </ScrollView>
        <StickyBottomComponent defaultBG>
          <Button
            disabled={disableProceedToPay}
            title={`PROCEED TO PAY RS. ${grandTotal.toFixed(2)}`}
            onPress={() => {
              CommonLogEvent(AppRoutes.YourCart, 'PROCEED TO PAY');
              onPressProceedToPay();
            }}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent>
      </SafeAreaView>
      {showDriveWayPopup && (
        <StoreDriveWayPickupPopup
          store={selectedStore}
          onPressOkGotIt={() => setShowDriveWayPopup(false)}
        />
      )}
    </View>
  );
};
