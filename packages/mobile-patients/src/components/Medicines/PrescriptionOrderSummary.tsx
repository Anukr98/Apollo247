import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { View, SafeAreaView, StyleSheet, ScrollView, AppState, Platform } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { SelectedAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/SelectedAddress';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import {
  PhysicalPrescription,
  useShoppingCart,
  ShoppingCartItem,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Prescriptions } from '@aph/mobile-patients/src/components/Medicines/Components/Prescriptions';
import { UploadPrescription } from '@aph/mobile-patients/src/components/MedicineCart/Components/UploadPrescription';
import { getPlaceInfoByPincode, nonCartTatApi247 } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  SET_DEFAULT_ADDRESS,
  UPLOAD_DOCUMENT,
  SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS,
  UPDATE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  makeAdressAsDefaultVariables,
  makeAdressAsDefault,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { useApolloClient } from 'react-apollo-hooks';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  formatAddressToLocation,
  findAddrComponents,
  formatAddress,
  postWebEngageEvent,
  g,
  setAsyncPharmaLocation,
  postCleverTapEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { ProceedBar } from '@aph/mobile-patients/src/components/Medicines/Components/ProceedBar';
import { PaymentMethod } from '@aph/mobile-patients/src/components/Medicines/Components/PaymentMethod';
import { ExpectCall } from '@aph/mobile-patients/src/components/Medicines/Components/ExpectCall';
import { TatCardwithoutAddress } from '@aph/mobile-patients/src/components/Medicines/Components/TatCardWithoutAddress';
import { savePrescriptionMedicineOrderOMSVariables } from '@aph/mobile-patients/src/graphql/types/savePrescriptionMedicineOrderOMS';
import DeviceInfo from 'react-native-device-info';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
  MEDICINE_DELIVERY_TYPE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  uploadDocument,
  uploadDocumentVariables,
} from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import moment from 'moment';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

export interface PrescriptionOrderSummaryProps extends NavigationScreenProps {}

export const PrescriptionOrderSummary: React.FC<PrescriptionOrderSummaryProps> = (props) => {
  const {
    addresses,
    deliveryAddressId,
    setDeliveryAddressId,
    uploadPrescriptionRequired,
    physicalPrescriptions,
    ePrescriptions,
    setPhysicalPrescriptions,
    setAddresses,
    deliveryTime,
    setdeliveryTime,
    storeId,
    stores,
    pinCode,
    isPharmacyPincodeServiceable,
    vdcType: cartVdcType,
  } = useShoppingCart();
  const { setLoading, loading, showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [vdcType, setvdcType] = useState<string>(props.navigation.getParam('vdcType'));
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const client = useApolloClient();
  const { setPharmacyLocation, pharmacyUserType } = useAppCommonData();
  const physicalPrescription: PhysicalPrescription[] = props.navigation.getParam(
    'physicalPrescription'
  );
  const ePrescription: EPrescription[] = props.navigation.getParam('ePrescription');
  const selectedMedicineOption = props.navigation.getParam('selectedMedicineOption');
  const durationDays = props.navigation.getParam('durationDays');
  const prescriptionOption = props.navigation.getParam('prescriptionOption');

  const [
    cartSelectedAddress,
    setCartSelectedAddress,
  ] = useState<savePatientAddress_savePatientAddress_patientAddress | null>(null);

  useEffect(() => {
    if (cartSelectedAddress?.zipcode) {
      if (isPharmacyPincodeServiceable) {
        setDeliveryAddressId && setDeliveryAddressId(cartSelectedAddress?.id);
        setDefaultAddress(cartSelectedAddress);
        if (cartVdcType) setvdcType(cartVdcType);
      } else {
        setDeliveryAddressId && setDeliveryAddressId('');
        props.navigation.goBack();
        renderAlert(string.medicine_cart.pharmaAddressUnServiceableAlert);
      }
    }
  }, [isPharmacyPincodeServiceable, cartSelectedAddress]);

  useEffect(() => {
    nonCartAvailabilityTat(selectedAddress?.zipcode);
  }, [selectedAddress]);

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

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

  const onPressPlaceOrder = () => {
    setLoading!(true);
    const proceed = () => {
      placeOrder();
    };
    if (selectedAddress?.latitude && selectedAddress?.longitude && selectedAddress?.stateCode) {
      proceed();
    } else {
      updateAddressLatLong(selectedAddress!, proceed);
    }
  };

  const placeOrder = async () => {
    setLoading!(true);
    CommonLogEvent(
      AppRoutes.UploadPrescription,
      'Graph ql call for save prescription medicine order'
    );
    try {
      // Physical Prescription Upload
      const uploadedPhyPrescriptionsData = await uploadMultipleFiles(physicalPrescription);

      const uploadedPhyPrescriptions = uploadedPhyPrescriptionsData.length
        ? uploadedPhyPrescriptionsData.map((item) => g(item, 'data', 'uploadDocument'))
        : [];

      const phyPresUrls = uploadedPhyPrescriptions.map((item) => item!.filePath).filter((i) => i);
      const phyPresPrismIds = physicalPrescription
        .map((item) => item.prismPrescriptionFileId)
        .filter((i) => i);

      const ePresUrls = ePrescription.map((item) => item.uploadedUrl).filter((i) => i);
      const ePresPrismIds = ePrescription
        .map((item) => item.prismPrescriptionFileId)
        .filter((i) => i);
      const days = durationDays ? parseInt(durationDays) : null;
      const appointmentIds = ePrescription?.length
        ? ePrescription?.filter((item) => item?.appointmentId)?.map((item) => item?.appointmentId)
        : [];

      const prescriptionMedicineInput: savePrescriptionMedicineOrderOMSVariables = {
        prescriptionMedicineOMSInput: {
          patientId: currentPatient?.id || '',
          medicineDeliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
          ...(storeId ? { shopId: storeId } : {}),
          appointmentId: appointmentIds?.length ? appointmentIds.join(',') : '',
          patinetAddressId: deliveryAddressId || '',
          prescriptionImageUrl: [...phyPresUrls, ...ePresUrls].join(','),
          prismPrescriptionFileId: [...phyPresPrismIds, ...ePresPrismIds].join(','),
          isEprescription: ePrescription.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
          // Values for chennai order
          bookingSource: BOOKING_SOURCE.MOBILE,
          deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
          prescriptionOptionSelected: prescriptionOption,
          durationDays: prescriptionOption === 'duration' ? days : null,
          appVersion: DeviceInfo.getVersion(),
        },
      };
      submitPrescriptionMedicineOrder(prescriptionMedicineInput);
    } catch (error) {
      setLoading!(false);
      CommonBugFender('UploadPrescription_onPressSubmit_try', error);
      renderErrorAlert('Error occurred while uploading physical prescription(s).');
    }
  };

  const submitPrescriptionMedicineOrder = (
    variables: savePrescriptionMedicineOrderOMSVariables
  ) => {
    client
      .mutate({
        mutation: SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS,
        variables,
      })
      .then(({ data }) => {
        const { errorCode, orderAutoId } = g(data, 'savePrescriptionMedicineOrderOMS') || {};
        postwebEngageSubmitPrescriptionEvent(orderAutoId);
        if (errorCode) {
          renderErrorAlert(`Something went wrong, unable to place order.`);
          return;
        }
        renderSuccessPopup(orderAutoId);
      })
      .catch((e) => {
        CommonBugFender('UploadPrescription_submitPrescriptionMedicineOrder', e);
        renderErrorAlert(`Something went wrong, please try later.`);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const postwebEngageSubmitPrescriptionEvent = (orderAutoId: string) => {
    const deliveryAddress = addresses.find((item) => item.id == deliveryAddressId);
    const deliveryAddressLine = (deliveryAddress && formatAddress(deliveryAddress)) || '';
    const storeAddress = storeId && stores.find((item) => item.storeid == storeId);
    const storeAddressLine = storeAddress && `${storeAddress.storename}, ${storeAddress.address}`;
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION] = {
      'Order ID': `${orderAutoId}`,
      'Delivery type': deliveryAddressId ? 'home' : 'store pickup',
      StoreId: storeId, // incase of store delivery
      'Delivery address': deliveryAddressId ? deliveryAddressLine : storeAddressLine,
      Pincode: pinCode,
      User_Type: pharmacyUserType,
    };
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_NONCART_ORDER_SUBMIT_CLICKED] = {
      'Order ID': `${orderAutoId}`,
      'Delivery type': deliveryAddressId ? 'home' : 'store pickup',
      'Store ID': storeId || undefined, // incase of store delivery
      'Delivery address': deliveryAddressId ? deliveryAddressLine : storeAddressLine,
      Pincode: pinCode,
      'User Type': pharmacyUserType || undefined,
    };
    postCleverTapEvent(
      CleverTapEventName.PHARMACY_NONCART_ORDER_SUBMIT_CLICKED,
      cleverTapEventAttributes
    );
    postWebEngageEvent(WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION, eventAttributes);
  };

  const updateAddressLatLong = async (
    address: savePatientAddress_savePatientAddress_patientAddress,
    onComplete: () => void
  ) => {
    try {
      const pincodeAndAddress = [address.zipcode, address.addressLine1]
        .filter((v) => (v || '').trim())
        .join(',');
      const data = await getPlaceInfoByPincode(pincodeAndAddress);
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
            name: address.name,
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
      onComplete();
    } catch (error) {
      // Let the user order journey continue, even if no lat-lang.
      onComplete();
    }
  };

  const uploadMultipleFiles = (physicalPrescription: PhysicalPrescription[]) => {
    return Promise.all(
      physicalPrescription.map((item) => {
        const variables = {
          UploadDocumentInput: {
            base64FileInput: item.base64,
            category: PRISM_DOCUMENT_CATEGORY.HealthChecks,
            fileType:
              item.fileType == 'jpg'
                ? UPLOAD_FILE_TYPES.JPEG
                : item.fileType == 'png'
                ? UPLOAD_FILE_TYPES.PNG
                : item.fileType == 'pdf'
                ? UPLOAD_FILE_TYPES.PDF
                : UPLOAD_FILE_TYPES.JPEG,
            patientId: g(currentPatient, 'id')!,
          },
        };
        return client.mutate<uploadDocument, uploadDocumentVariables>({
          mutation: UPLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables,
        });
      })
    );
  };

  const renderSuccessPopup = (orderAutoId: string) => {
    showAphAlert!({
      title: 'Hi :)',
      ctaContainerStyle: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginVertical: 18,
      },
      description:
        'Your prescriptions have been submitted successfully. Our Pharmacists will validate the prescriptions and place your order.\n\nIf we require any clarifications, we will call you within one hour (Calling hours: 8AM to 8PM).',
      unDismissable: true,
      CTAs: [
        {
          text: 'OK, GOT IT',
          type: 'orange-link',
          onPress: () => {
            hideAphAlert!();

            props.navigation.navigate(AppRoutes.OrderDetailsScene, {
              goToHomeOnBack: true,
              showOrderSummaryTab: false,
              orderAutoId: orderAutoId,
            });
          },
        },
      ],
    });
  };

  async function nonCartAvailabilityTat(pincode: string) {
    try {
      const response = await nonCartTatApi247(pincode);
      const tatResponse = g(response, 'data', 'response') || [];
      const deliveryDate = tatResponse?.tat;
      if (deliveryDate) {
        setdeliveryTime && setdeliveryTime(deliveryDate);
      }
    } catch (error) {
      const genericServiceableDate = moment()
        .add(2, 'days')
        .set('hours', 20)
        .set('minutes', 0)
        .format(AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT);
      setdeliveryTime?.(genericServiceableDate);
    }
  }

  const renderErrorAlert = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: desc,
      unDismissable: true,
    });

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
            });
            hideAphAlert!();
          }}
          onPressEditAddress={(address) => {
            props.navigation.push(AppRoutes.AddAddressNew, {
              KeyName: 'Update',
              addressDetails: address,
              ComingFrom: AppRoutes.ServerCart,
            });
            hideAphAlert!();
          }}
          onPressSelectAddress={(address) => {
            setCartSelectedAddress(address);
            hideAphAlert && hideAphAlert();
            setAsyncPharmaLocation(address);
            nonCartAvailabilityTat(address?.zipcode);
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
          CommonLogEvent(AppRoutes.UploadPrescription, 'Go back to prescription page');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAddress = () => {
    return (
      <SelectedAddress
        orderType={'Delivery'}
        onPressChange={() => showAddressPopup()}
        showChangeAddress={true}
      />
    );
  };

  const renderuploadPrescriptionPopup = () => {
    return (
      <UploadPrescription
        showPopUp={showPopUp}
        onClickClose={() => setshowPopUp(false)}
        navigation={props.navigation}
        type={'Cart'}
      />
    );
  };

  const renderTatCard = () => {
    return (
      <TatCardwithoutAddress style={{ marginTop: 22 }} vdcType={vdcType} isNonCartOrder={true} />
    );
  };

  const renderPrescriptions = () => {
    return (
      <Prescriptions
        onPressUploadMore={() => setshowPopUp(true)}
        screen={'summary'}
        physicalPrescriptions={physicalPrescription}
        ePrescriptions={ePrescription}
      />
    );
  };

  const renderPaymentMethod = () => {
    return <PaymentMethod />;
  };

  const renderExpectCall = () => {
    return selectedMedicineOption === 'Call me for details' ? <ExpectCall /> : null;
  };

  const renderProceedBar = () => {
    return <ProceedBar screen={'summary'} onPressPlaceOrder={onPressPlaceOrder} />;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {renderHeader()}
          {renderAddress()}
          {renderTatCard()}
          {renderPrescriptions()}
          {renderPaymentMethod()}
          {renderExpectCall()}
        </ScrollView>
        {renderuploadPrescriptionPopup()}
        {renderProceedBar()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
});
