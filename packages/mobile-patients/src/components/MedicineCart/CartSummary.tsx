import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { View, SafeAreaView, StyleSheet, ScrollView, AppState, AppStateStatus } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { SelectedAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/SelectedAddress';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CartItemsList } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemsList';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TatCardwithoutAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/TatCardwithoutAddress';
import { UploadPrescription } from '@aph/mobile-patients/src/components/MedicineCart/Components/UploadPrescription';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { ProceedBar } from '@aph/mobile-patients/src/components/MedicineCart/Components/ProceedBar';
import {
  g,
  formatAddress,
  formatAddressToLocation,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  pinCodeServiceabilityApi247,
  availabilityApi247,
  GetTatResponse247,
  TatApiInput247,
  getDeliveryTAT247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  postwebEngageProceedToPayEvent,
  uploadPrescriptionClickedEvent,
  postTatResponseFailureEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { UPLOAD_DOCUMENT, SET_DEFAULT_ADDRESS } from '@aph/mobile-patients/src/graphql/profiles';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  postPhamracyCartAddressSelectedFailure,
  postPharmacyAddNewAddressClick,
  postPhamracyCartAddressSelectedSuccess,
} from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  makeAdressAsDefaultVariables,
  makeAdressAsDefault,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import moment from 'moment';

export interface CartSummaryProps extends NavigationScreenProps {}

export const CartSummary: React.FC<CartSummaryProps> = (props) => {
  const {
    cartItems,
    addresses,
    deliveryAddressId,
    setDeliveryAddressId,
    uploadPrescriptionRequired,
    physicalPrescriptions,
    ePrescriptions,
    setCartItems,
    setPhysicalPrescriptions,
    setAddresses,
    deliveryTime,
    setdeliveryTime,
    pharmacyCircleAttributes,
  } = useShoppingCart();
  const { setPharmacyLocation, setAxdcCode } = useAppCommonData();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [storeType, setStoreType] = useState<string | undefined>(
    props.navigation.getParam('tatType') || ''
  );
  const [storeDistance, setStoreDistance] = useState(
    props.navigation.getParam('storeDistance') || 0
  );
  const [shopId, setShopId] = useState<string | undefined>(
    props.navigation.getParam('shopId') || ''
  );
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>(false);
  const [appState, setappState] = useState<string>('');
  const shoppingCart = useShoppingCart();

  useEffect(() => {
    hasUnserviceableproduct();
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    onFinishUpload();
  }, [isPhysicalUploadComplete]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setappState(nextAppState);
  };

  useEffect(() => {
    if (appState == 'active') {
      availabilityTat(deliveryAddressId);
    }
  }, [appState]);

  function hasUnserviceableproduct() {
    const unserviceableItems = cartItems.filter((item) => item.unserviceable) || [];
    unserviceableItems?.length && props.navigation.goBack();
  }

  async function checkServicability(address: savePatientAddress_savePatientAddress_patientAddress) {
    if (deliveryAddressId && deliveryAddressId == address.id) {
      return;
    }
    setloading(true);
    const response = await pinCodeServiceabilityApi247(address.zipcode!);
    const { data } = response;
    setAxdcCode && setAxdcCode(data?.response?.axdcCode);
    if (data?.response?.servicable) {
      setloading(false);
      setDeliveryAddressId && setDeliveryAddressId(address.id);
      setDefaultAddress(address);
      availabilityTat(address.id);
    } else {
      setDeliveryAddressId && setDeliveryAddressId('');
      setloading!(false);
      postPhamracyCartAddressSelectedFailure(address.zipcode!, formatAddress(address), 'No');
      renderAlert(string.medicine_cart.pharmaAddressUnServiceableAlert);
    }
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

  async function availabilityTat(id: string) {
    if (id && cartItems.length > 0) {
      setloading(true);
      const skus = cartItems.map((item) => item.id);
      const selectedAddress: any = addresses.find((item) => item.id == id);
      try {
        const response = await availabilityApi247(selectedAddress.zipcode || '', skus.join(','));
        console.log('in summary >>', response.data);
        const items = g(response, 'data', 'response') || [];
        const unserviceableSkus = items.filter(({ exist }) => exist == false).map(({ sku }) => sku);
        const updatedCartItems = cartItems.map((item) => ({
          ...item,
          unserviceable: unserviceableSkus.indexOf(item.id) != -1,
        }));
        setCartItems!(updatedCartItems);

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
          setloading!(false);
          const tatResponse = res?.data?.response;
          const tatTimeStamp = tatResponse?.tatU;
          if (tatTimeStamp && tatTimeStamp !== -1) {
            const deliveryDate = tatResponse?.tat;
            if (deliveryDate) {
              const inventoryData = tatResponse?.items || [];
              if (inventoryData && inventoryData.length) {
                setStoreType(tatResponse?.storeType);
                setShopId(tatResponse?.storeCode);
                setStoreDistance(tatResponse?.distance);
                setdeliveryTime?.(deliveryDate);
                addressSelectedEvent(selectedAddress, deliveryDate);
                updatePricesAfterTat(inventoryData, updatedCartItems);
                if (unserviceableSkus.length) {
                  props.navigation.goBack();
                }
              }
            } else {
              handleTatApiFailure(selectedAddress, {});
            }
          } else {
            handleTatApiFailure(selectedAddress, {});
          }
        } catch (error) {
          handleTatApiFailure(selectedAddress, error);
        }
      } catch (error) {
        handleTatApiFailure(selectedAddress, error);
      }
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
    addressSelectedEvent(selectedAddress, genericServiceableDate);
    setdeliveryTime?.(genericServiceableDate);
    postTatResponseFailureEvent(cartItems, selectedAddress.zipcode || '', error);
    setloading(false);
  }

  function addressSelectedEvent(
    address: savePatientAddress_savePatientAddress_patientAddress,
    tatDate: string
  ) {
    const currentDate = moment()
      .hour(0)
      .minute(0)
      .second(0);
    const momentTatDate = moment(tatDate)
      .hour(0)
      .minute(0)
      .second(0);
    postPhamracyCartAddressSelectedSuccess(
      address?.zipcode!,
      formatAddress(address),
      'Yes',
      new Date(tatDate),
      Math.ceil(momentTatDate.diff(currentDate, 'h') / 24),
      pharmacyCircleAttributes!,
      moment(tatDate).diff(moment(), 'h')
    );
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
        if (object.price != Number(object.mou) * cartItem[0].mrp && cartItem[0].mrp != 0) {
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

  function onPressProceedtoPay() {
    props.navigation.navigate(AppRoutes.CheckoutSceneNew, {
      deliveryTime,
      storeDistance: storeDistance,
      tatType: storeType,
      shopId: shopId,
    });
    postwebEngageProceedToPayEvent(shoppingCart, false, deliveryTime, pharmacyCircleAttributes!);
  }

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  function showAddressPopup() {
    showAphAlert!({
      title: string.common.selectAddress,
      removeTopIcon: true,
      children: (
        <ChooseAddress
          addresses={addresses}
          deliveryAddressId={deliveryAddressId}
          onPressAddAddress={() => {
            props.navigation.navigate(AppRoutes.AddAddressNew, {
              source: 'Cart' as AddressSource,
              addOnly: true,
            });
            postPharmacyAddNewAddressClick('Cart');
            hideAphAlert!();
          }}
          onPressEditAddress={(address) => {
            props.navigation.push(AppRoutes.AddAddressNew, {
              KeyName: 'Update',
              addressDetails: address,
              ComingFrom: AppRoutes.MedicineCart,
            });
            hideAphAlert!();
          }}
          onPressSelectAddress={(address) => {
            checkServicability(address);
            hideAphAlert && hideAphAlert();
          }}
        />
      ),
    });
  }

  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'ORDER SUMMARY'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.MedicineCart, 'Go back to add items');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAddress = () => {
    return <SelectedAddress orderType={'Delivery'} onPressChange={() => showAddressPopup()} />;
  };

  const renderTatCard = () => {
    return <TatCardwithoutAddress style={{ marginTop: 22 }} deliveryDate={deliveryTime} />;
  };

  const renderCartItems = () => {
    return <CartItemsList screen={'summary'} />;
  };

  const renderuploadPrescriptionPopup = () => {
    return (
      <UploadPrescription
        showPopUp={showPopUp}
        onClickClose={() => setshowPopUp(false)}
        navigation={props.navigation}
        type={'cartOrMedicineFlow'}
      />
    );
  };

  const renderPrescriptions = () => {
    return <Prescriptions onPressUploadMore={() => setshowPopUp(true)} screen={'summary'} />;
  };

  function isPrescriptionRequired() {
    if (uploadPrescriptionRequired) {
      return physicalPrescriptions.length > 0 || ePrescriptions.length > 0 ? false : true;
    } else {
      return false;
    }
  }

  const renderButton = () => {
    return isPrescriptionRequired() ? (
      <View style={styles.buttonContainer}>
        <Button
          disabled={false}
          title={'UPLOAD PRESCRIPTION'}
          onPress={() => {
            uploadPrescriptionClickedEvent(currentPatient?.id);
            setshowPopUp(true);
          }}
          titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
          style={{ borderRadius: 10 }}
        />
      </View>
    ) : (
      <ProceedBar
        screen={'summary'}
        onPressProceedtoPay={() => {
          physicalPrescriptions?.length > 0 ? uploadPhysicalPrescriptons() : onPressProceedtoPay();
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {renderHeader()}
          {renderAddress()}
          {renderTatCard()}
          {renderCartItems()}
          {uploadPrescriptionRequired && renderPrescriptions()}
        </ScrollView>
        {renderuploadPrescriptionPopup()}
        {renderButton()}
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
  prescriptionMsgCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: '#F7F8F5',
  },
  prescriptionMsg: {
    marginLeft: 13,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#02475B',
    marginVertical: 6,
  },
  buttonContainer: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  subContainer: {
    flexDirection: 'row',
    paddingHorizontal: 13,
    marginVertical: 9,
  },
});