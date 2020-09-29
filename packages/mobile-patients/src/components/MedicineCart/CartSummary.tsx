import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { View, SafeAreaView, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
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
import { g, formatAddress } from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  pinCodeServiceabilityApi247,
  availabilityApi247,
  GetTatResponse247,
  TatApiInput247,
  getDeliveryTAT247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { postwebEngageProceedToPayEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { UPLOAD_DOCUMENT } from '@aph/mobile-patients/src/graphql/profiles';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { postPhamracyCartAddressSelectedFailure } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';

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
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [storeType, setStoreType] = useState<string | undefined>('');
  const [shopId, setShopId] = useState<string | undefined>('');
  const [deliveryTime, setdeliveryTime] = useState<string>(
    props.navigation.getParam('deliveryTime')
  );
  const orderType = props.navigation.getParam('orderType');
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>(false);
  const shoppingCart = useShoppingCart();

  useEffect(() => {
    onFinishUpload();
  }, [isPhysicalUploadComplete]);

  async function checkServicability(address: savePatientAddress_savePatientAddress_patientAddress) {
    if (deliveryAddressId && deliveryAddressId == address.id) {
      return;
    }
    setloading(true);
    const response = await pinCodeServiceabilityApi247(address.zipcode!);
    const { data } = response;
    if (data.response) {
      setloading(false);
      setDeliveryAddressId && setDeliveryAddressId(address.id);
      availabilityTat(address.id);
    } else {
      setDeliveryAddressId && setDeliveryAddressId('');
      setloading!(false);
      postPhamracyCartAddressSelectedFailure(address.zipcode!, formatAddress(address), 'No');
      renderAlert(string.medicine_cart.pharmaAddressUnServiceableAlert);
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
        const res = await getDeliveryTAT247(tatInput);
        console.log('res >>', res.data);
        setloading!(false);
        const tatTimeStamp = g(res, 'data', 'response', 'tatU');
        if (tatTimeStamp && tatTimeStamp !== -1) {
          const deliveryDate = g(res, 'data', 'response', 'tat');
          if (deliveryDate) {
            const inventoryData = g(res, 'data', 'response', 'items') || [];
            if (inventoryData && inventoryData.length) {
              setStoreType(g(res, 'data', 'response', 'storeCode'));
              setShopId(g(res, 'data', 'response', 'storeType'));
              setdeliveryTime(deliveryDate);
              updatePricesAfterTat(inventoryData, updatedCartItems);
              if (unserviceableSkus.length) {
                // showUnServiceableItemsAlert(updatedCartItems);
                props.navigation.goBack();
              }
            }
          } else {
            setloading(false);
          }
        } else {
          setloading(false);
        }
      } catch (error) {
        console.log(error);
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
    const zipcode = selectedAddress?.zipcode;
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

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  function showAddressPopup() {
    showAphAlert!({
      title: string.common.selectAddress,
      children: (
        <ChooseAddress
          addresses={addresses}
          deliveryAddressId={deliveryAddressId}
          onPressAddAddress={() => {}}
          onPressEditAddress={(address) => {
            console.log(address);
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
          CommonLogEvent(AppRoutes.YourCart, 'Go back to add items');
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
          onPress={() => setshowPopUp(true)}
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
