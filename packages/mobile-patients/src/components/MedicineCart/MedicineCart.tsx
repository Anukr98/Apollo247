import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
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
} from '@aph/mobile-patients/src/graphql/profiles';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { g, formatAddress } from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  pinCodeServiceabilityApi247,
  availabilityApi247,
  GetTatResponse247,
  getMedicineDetailsApi,
  TatApiInput247,
  getDeliveryTAT247,
  validateConsultCoupon,
  userSpecificCoupon,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { UploadPrescription } from '@aph/mobile-patients/src/components/MedicineCart/Components/UploadPrescription';
import { UnServiceable } from '@aph/mobile-patients/src/components/MedicineCart/Components/UnServiceable';
import { AddressSource } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  postwebEngageProceedToPayEvent,
  PharmacyCartViewedEvent,
  PricemismatchEvent,
  postTatResponseFailureEvent,
  applyCouponClickedEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  postPhamracyCartAddressSelectedFailure,
  postPhamracyCartAddressSelectedSuccess,
  postPharmacyAddNewAddressClick,
  postPharmacyAddNewAddressCompleted,
} from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';

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
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { locationDetails, pharmacyLocation } = useAppCommonData();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [lastCartItems, setlastCartItems] = useState('');
  const [storeType, setStoreType] = useState<string | undefined>('');
  const [shopId, setShopId] = useState<string | undefined>('');
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [isfocused, setisfocused] = useState<boolean>(false);
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>(false);
  const shoppingCart = useShoppingCart();
  const navigatedFrom = props.navigation.getParam('movedFrom') || '';

  useEffect(() => {
    fetchAddress();
    availabilityTat();
    fetchUserSpecificCoupon();
    cartItems.length && PharmacyCartViewedEvent(shoppingCart, g(currentPatient, 'id'));
  }, []);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setisfocused(true);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setisfocused(false);
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
      availabilityTat();
    }
  }, [deliveryAddressId]);

  useEffect(() => {
    if (isfocused) {
      availabilityTat();
      console.log('inside CArt useEffect');
    }
  }, [cartItems]);

  useEffect(() => {
    if (coupon && cartTotal > 0) {
      validateCoupon(coupon.coupon);
    }
  }, [cartTotal]);

  useEffect(() => {
    if (couponProducts && couponProducts.length) {
      getMedicineDetailsOfCouponProducts();
    }
  }, [couponProducts]);

  useEffect(() => {
    onFinishUpload();
  }, [isPhysicalUploadComplete]);

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
      .then((resp: any) => {
        console.log(resp.data);
        if (resp.data.errorCode == 0) {
          let couponList = resp.data.response;
          if (typeof couponList != null && couponList.length) {
            const coupon = couponList[0].coupon;
            validateCoupon(coupon, true);
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

  async function availabilityTat() {
    const newCartItems =
      cartItems.map(({ id, quantity }) => id + quantity).toString() + deliveryAddressId;
    if (newCartItems == lastCartItems) {
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
          console.log('res >>', res.data);
          const tatTimeStamp = g(res, 'data', 'response', 'tatU');
          if (tatTimeStamp && tatTimeStamp !== -1) {
            const deliveryDate = g(res, 'data', 'response', 'tat');
            if (deliveryDate) {
              const inventoryData = g(res, 'data', 'response', 'items') || [];
              if (inventoryData && inventoryData.length) {
                setloading!(false);
                setStoreType(g(res, 'data', 'response', 'storeCode'));
                setShopId(g(res, 'data', 'response', 'storeType'));
                setdeliveryTime(deliveryDate);
                updatePricesAfterTat(inventoryData, updatedCartItems);
              }
            } else {
              setdeliveryTime('...');
              setloading(false);
            }
          } else {
            setdeliveryTime('...');
            postTatResponseFailureEvent(cartItems, selectedAddress.zipcode || '', {});
            setloading(false);
          }
        } catch (error) {
          postTatResponseFailureEvent(cartItems, selectedAddress.zipcode || '', error);
          setloading(false);
        }
      } catch (error) {
        postTatResponseFailureEvent(cartItems, selectedAddress.zipcode || '', error);
        setloading(false);
      }
    }
  }

  function updatePricesAfterTat(
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
    console.log(loading);
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
    if (couponProducts.length) {
      removeFreeProductsFromCart();
    }
    renderAlert(message);
  };

  const validateCoupon = async (coupon: string, autoApply?: boolean) => {
    CommonLogEvent(AppRoutes.ApplyCouponScene, 'Apply coupon');
    console.log('inside validate');
    setloading!(true);
    const data = {
      mobile: g(currentPatient, 'mobileNumber'),
      billAmount: cartTotal.toFixed(2),
      coupon: coupon,
      pinCode: locationDetails && locationDetails.pincode,
      products: cartItems.map((item) => ({
        sku: item.id,
        categoryId: item.productType,
        mrp: item.price,
        quantity: item.quantity,
        specialPrice: item.specialPrice ? item.specialPrice : item.price,
      })),
    };
    try {
      const response = await validateConsultCoupon(data);
      setloading!(false);
      if (response.data.errorCode == 0) {
        if (response.data.response.valid) {
          setCoupon!(g(response.data, 'response')!);
        } else {
          !autoApply && removeCouponWithAlert(g(response.data, 'response', 'reason'));
        }
      } else {
        CommonBugFender('validatingPharmaCoupon', response.data.errorMsg);
        !autoApply && removeCouponWithAlert(g(response.data, 'errorMsg'));
      }
    } catch (error) {
      CommonBugFender('validatingPharmaCoupon', error);
      !autoApply && removeCouponWithAlert('Sorry, unable to validate coupon right now.');
      setloading!(false);
    }
  };

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

  function onPressProceedtoPay() {
    const zipcode = g(selectedAddress, 'zipcode');
    const isChennaiAddress = AppConfig.Configuration.CHENNAI_PHARMA_DELIVERY_PINCODES.find(
      (addr) => addr == Number(zipcode)
    );
    props.navigation.navigate(AppRoutes.CheckoutSceneNew, {
      deliveryTime,
      isChennaiOrder: isChennaiAddress ? true : false,
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
          if (couponProducts.length) {
            removeFreeProductsFromCart();
          }
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
          CommonLogEvent(AppRoutes.YourCart, 'Go back to add items');
          setCoupon!(null);
          if (couponProducts.length) {
            removeFreeProductsFromCart();
          }
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

  const removeFreeProductsFromCart = () => {
    const updatedCartItems = cartItems.filter((item) => item.price != 0);
    setCartItems!(updatedCartItems);
    setCouponProducts!([]);
  };

  function applyCoupon() {
    if (cartTotal == 0) {
      renderAlert('Please add items in the cart to apply coupon.');
    } else {
      props.navigation.navigate(AppRoutes.ApplyCouponScene);
      setCoupon!(null);
      applyCouponClickedEvent(g(currentPatient, 'id'));
      if (couponProducts.length) {
        removeFreeProductsFromCart();
      }
    }
  }

  const renderCartItems = () => {
    return (
      <CartItemsList
        screen={'cart'}
        onPressProduct={(item) => {
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: item.id,
            title: item.name,
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

  const renderuploadPrescriptionPopup = () => {
    return (
      <UploadPrescription
        showPopUp={showPopUp}
        onClickClose={() => setshowPopUp(false)}
        navigation={props.navigation}
      />
    );
  };

  const renderPrescriptions = () => {
    return <Prescriptions onPressUploadMore={() => setshowPopUp(true)} />;
  };

  const renderKerbSidePickup = () => {
    return (
      <KerbSidePickup
        style={{ marginTop: 20 }}
        onPressProceed={() => {
          props.navigation.navigate(AppRoutes.StorePickup);
        }}
      />
    );
  };

  const renderProceedBar = () => {
    return (
      <ProceedBar
        onPressAddDeliveryAddress={() => showAddressPopup()}
        onPressUploadPrescription={() =>
          props.navigation.navigate(AppRoutes.CartSummary, {
            deliveryTime: deliveryTime,
          })
        }
        onPressProceedtoPay={() => {
          physicalPrescriptions?.length > 0 ? uploadPhysicalPrescriptons() : onPressProceedtoPay();
        }}
        deliveryTime={deliveryTime}
        onPressChangeAddress={showAddressPopup}
      />
    );
  };

  const renderUnServiceable = () => {
    return <UnServiceable style={{ marginTop: 24 }} />;
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
          {renderHeader()}
          {renderUnServiceable()}
          {renderCartItems()}
          {renderAvailFreeDelivery()}
          {renderAmountSection()}
          {renderSavings()}
          {renderPrescriptions()}
          {renderKerbSidePickup()}
        </ScrollView>
        {renderuploadPrescriptionPopup()}
        {renderProceedBar()}
        {loading && <Spinner />}
      </SafeAreaView>
    </View>
  );
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
