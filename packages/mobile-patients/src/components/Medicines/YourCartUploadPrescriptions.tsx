import {
  formatAddress,
  g,
  postWebEngageEvent,
  findAddrComponents,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  ShoppingCartItem,
  useShoppingCart,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  UPLOAD_DOCUMENT,
  SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS,
  UPDATE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  uploadDocument,
  uploadDocumentVariables,
} from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { savePrescriptionMedicineOrderOMSVariables } from '@aph/mobile-patients/src/graphql/types/savePrescriptionMedicineOrderOMS';
import { Store, getPlaceInfoByPincode } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, View, Platform, Image } from 'react-native';
import {
  NavigationScreenProps,
  ScrollView,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import {
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
  MEDICINE_DELIVERY_TYPE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  NonCartOrderOMSCity,
} from '../../graphql/types/globalTypes';
import { WhatsAppStatus } from '../ui/WhatsAppStatus';
import { StoreDriveWayPickupPopup } from './StoreDriveWayPickupPopup';
import { StorePickupOrAddressSelectionView } from './StorePickupOrAddressSelectionView';
import { savePatientAddress_savePatientAddress_patientAddress } from '../../graphql/types/savePatientAddress';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '../../graphql/types/updatePatientAddress';
import { useDiagnosticsCart } from '../DiagnosticsCartProvider';
import { FileBig, GreenTickIcon } from '../ui/Icons';
import { TextInputComponent } from '../ui/TextInputComponent';
import { EPrescriptionCard } from '../ui/EPrescriptionCard';
import { Spinner } from '../ui/Spinner';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
  prescriptionCardStyle: {
    marginTop: 16,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    marginHorizontal: 20,
  },
  greenTickStyle: {
    width: 20,
    marginRight: 10,
    marginLeft: 10,
    paddingHorizontal: 8,
  },
});

export interface YourCartUploadPrescriptionProps extends NavigationScreenProps {}

export const YourCartUploadPrescriptions: React.FC<YourCartUploadPrescriptionProps> = (props) => {
  const {
    cartItems,
    addresses,
    deliveryAddressId,
    storeId,
    setStoreId,
    showPrescriptionAtStore,
    deliveryCharges,
    cartTotal,
    couponDiscount,
    productDiscount,
    grandTotal,
    coupon,
    setCoupon,
    uploadPrescriptionRequired,
    pinCode,
    stores,
    setAddresses,
  } = useShoppingCart();
  const { setAddresses: setTestAddresses } = useDiagnosticsCart();
  const [activeStores, setActiveStores] = useState<Store[]>([]);

  const tabs = [{ title: 'Home Delivery' }, { title: 'Store Pick Up' }];
  const [selectedTab, setselectedTab] = useState<string>(storeId ? tabs[1].title : tabs[0].title);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert, setLoading, loading } = useUIElements();
  const [showDriveWayPopup, setShowDriveWayPopup] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView | null>();
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(true);

  const prescriptionOption = props.navigation.getParam('prescriptionOptionSelected');
  const durationDay = props.navigation.getParam('durationDays');
  const physicalPrescription: PhysicalPrescription[] = props.navigation.getParam(
    'physicalPrescription'
  );
  const ePrescription: EPrescription[] = props.navigation.getParam('ePrescription');

  // To remove applied coupon and selected storeId from cart when user goes back.
  useEffect(() => {
    return () => {
      setCoupon!(null);
      setStoreId!('');
    };
  }, []);

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'PLACE ORDER'}
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

  const disablePlaceOrder = !(
    !!(deliveryAddressId || storeId) &&
    ((storeId && showPrescriptionAtStore) ||
      physicalPrescription.length > 0 ||
      ePrescription.length > 0)
  );

  const renderPaymentMethod = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          marginHorizontal: 20,
          marginTop: 16,
          marginBottom: 24,
          padding: 20,
        }}
      >
        <RadioSelectionItem
          key={'cod'}
          title={'Cash On Delivery'}
          isSelected={true}
          onPress={() => {}}
          hideSeparator={true}
          textStyle={{ ...theme.fonts.IBMPlexSansMedium(16), marginTop: 2 }}
        />
      </View>
    );
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
    };
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
      setTestAddresses!(newAddrList);
      onComplete();
    } catch (error) {
      // Let the user order journey continue, even if no lat-lang.
      onComplete();
    }
  };

  const onPressSubmit = () => {
    setLoading!(true);
    const selectedAddress = addresses.find((addr) => addr.id == deliveryAddressId);
    const zipcode = g(selectedAddress, 'zipcode');
    const isChennaiAddress = AppConfig.Configuration.CHENNAI_PHARMA_DELIVERY_PINCODES.find(
      (addr) => addr == Number(zipcode)
    );
    const proceed = () => {
      if (isChennaiAddress) {
        setLoading!(false);
        props.navigation.navigate(AppRoutes.ChennaiNonCartOrderForm, { onSubmitOrder: placeOrder });
      } else {
        placeOrder(false);
      }
    };

    if (
      g(selectedAddress, 'latitude') &&
      g(selectedAddress, 'longitude') &&
      g(selectedAddress, 'stateCode')
    ) {
      proceed();
    } else {
      updateAddressLatLong(selectedAddress!, proceed);
    }
  };

  const placeOrder = async (isChennaiOrder: boolean, email?: string) => {
    setLoading!(true);
    const selectedAddress = addresses.find((addr) => addr.id == deliveryAddressId);
    const zipcode = g(selectedAddress, 'zipcode');
    const isChennaiAddress = AppConfig.Configuration.CHENNAI_PHARMA_DELIVERY_PINCODES.find(
      (addr) => addr == Number(zipcode)
    );

    CommonLogEvent(
      AppRoutes.UploadPrescription,
      'Graph ql call for save prescription medicine order'
    );
    try {
      // Physical Prescription Upload
      const uploadedPhyPrescriptionsData = await uploadMultipleFiles(physicalPrescription);
      console.log('upload of prescriptions done');

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

      const prescriptionMedicineInput: savePrescriptionMedicineOrderOMSVariables = {
        prescriptionMedicineOMSInput: {
          patientId: (currentPatient && currentPatient.id) || '',
          medicineDeliveryType: deliveryAddressId
            ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
            : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
          ...(storeId ? { shopId: storeId } : {}),
          appointmentId: '',
          patinetAddressId: deliveryAddressId || '',
          prescriptionImageUrl: [...phyPresUrls, ...ePresUrls].join(','),
          prismPrescriptionFileId: [...phyPresPrismIds, ...ePresPrismIds].join(','),
          isEprescription: ePrescription.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
          // Values for chennai order
          email: isChennaiAddress && email ? email.trim() : null,
          NonCartOrderCity: isChennaiAddress ? NonCartOrderOMSCity.CHENNAI : null,
          bookingSource: BOOKING_SOURCE.MOBILE,
          deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
          prescriptionOptionSelected: prescriptionOption,
          durationDays: durationDay,
        },
      };

      setLoading!(false);
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
        console.log({ data });
        const { errorCode, orderAutoId } = g(data, 'savePrescriptionMedicineOrderOMS') || {};
        postwebEngageSubmitPrescriptionEvent(orderAutoId);
        if (errorCode) {
          renderErrorAlert(`Something went wrong, unable to place order.`);
          return;
        }
        renderSuccessPopup();
      })
      .catch((e) => {
        CommonBugFender('UploadPrescription_submitPrescriptionMedicineOrder', e);
        console.log({ e });
        renderErrorAlert(`Something went wrong, please try later.`);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const renderErrorAlert = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: desc,
      unDismissable: true,
    });

  const renderSuccessPopup = () => {
    showAphAlert!({
      title: 'Hi :)',
      ctaContainerStyle: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginVertical: 18,
      },
      description: string.Prescription_Success,
      unDismissable: true,
      CTAs: [
        {
          text: 'OK, GOT IT',
          type: 'orange-link',
          onPress: () => {
            hideAphAlert!();
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
              })
            );
          },
        },
      ],
    });
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
        console.log(JSON.stringify(variables));
        return client.mutate<uploadDocument, uploadDocumentVariables>({
          mutation: UPLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables,
        });
      })
    );
  };

  const renderPhysicalPrescriptionRow = (
    item: PhysicalPrescription,
    i: number,
    arrayLength: number
  ) => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          shadowRadius: 4,
          height: 56,
          marginHorizontal: 20,
          backgroundColor: theme.colors.WHITE,
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: i === 0 ? 16 : 4,
          marginBottom: arrayLength === i + 1 ? 16 : 4,
        }}
        key={i}
      >
        <View
          style={{
            paddingLeft: 8,
            paddingRight: 16,
            width: 54,
          }}
        >
          {item.fileType == 'pdf' ? (
            <FileBig
              style={{
                height: 45,
                width: 30,
                borderRadius: 5,
              }}
            />
          ) : (
            <Image
              style={{
                height: 40,
                width: 30,
                borderRadius: 5,
              }}
              source={{ uri: `data:image/jpeg;base64,${item.base64}` }}
            />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <TextInputComponent
            textInputprops={{ editable: false }}
            inputStyle={{
              marginTop: 3,
            }}
            value={item.title}
          />
        </View>
        <GreenTickIcon style={styles.greenTickStyle} />
      </View>
    );
  };

  const renderPhysicalPrescriptions = () => {
    if (physicalPrescription.length > 0) {
      return (
        <View style={styles.prescriptionCardStyle}>
          {physicalPrescription.map((item, index, array) => {
            return renderPhysicalPrescriptionRow(item, index, array.length);
          })}
        </View>
      );
    }
  };

  const renderEPrescriptionRow = (item: EPrescription, i: number, arrayLength: number) => {
    return (
      <EPrescriptionCard
        style={{
          marginTop: i === 0 ? 20 : 4,
          marginBottom: arrayLength === i + 1 ? 16 : 4,
        }}
        medicines={item.medicines}
        actionType="removal"
        date={item.date}
        doctorName={item.doctorName}
        forPatient={item.forPatient}
        showTick={true}
      />
    );
  };

  const renderEPrescriptions = () => {
    if (ePrescription.length > 0) {
      return (
        <View style={[styles.prescriptionCardStyle]}>
          {ePrescription.map((item, index, array) => {
            return renderEPrescriptionRow(item, index, array.length);
          })}
        </View>
      );
    }
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
            {renderLabel('UPLOAD PRESCRIPTION')}
            {renderPhysicalPrescriptions()}
            {renderEPrescriptions()}
            <View style={{ marginTop: 20 }}>{renderLabel('WHERE SHOULD WE DELIVER?')}</View>
            <StorePickupOrAddressSelectionView navigation={props.navigation} />
            {renderPaymentMethod()}
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
            disabled={disablePlaceOrder}
            title={'PLACE ORDER'}
            onPress={() => {
              onPressSubmit();
            }}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent>
        {loading && <Spinner />}
      </SafeAreaView>
      {showDriveWayPopup && (
        <StoreDriveWayPickupPopup
          store={activeStores.find((item) => item.storeid == storeId)!}
          onPressOkGotIt={() => setShowDriveWayPopup(false)}
        />
      )}
    </View>
  );
};
