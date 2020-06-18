import {
  formatAddress,
  g,
  postWebEngageEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
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
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  UPLOAD_DOCUMENT,
  SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { uploadDocument, uploadDocumentVariables } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { savePrescriptionMedicineOrderOMSVariables } from '@aph/mobile-patients/src/graphql/types/savePrescriptionMedicineOrderOMS';
import { Store } from '@aph/mobile-patients/src/helpers/apiCalls';
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
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import {
  NavigationScreenProps,
  ScrollView,
} from 'react-navigation';
import { PRISM_DOCUMENT_CATEGORY, UPLOAD_FILE_TYPES, MEDICINE_DELIVERY_TYPE, BOOKING_SOURCE, DEVICE_TYPE, NonCartOrderOMSCity } from '../../graphql/types/globalTypes';
import { WhatsAppStatus } from '../ui/WhatsAppStatus';
import { StoreDriveWayPickupPopup } from './StoreDriveWayPickupPopup';
import { StorePickupOrAddressSelectionView } from './StorePickupOrAddressSelectionView';

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

export interface YourCartUploadPrescriptionProps extends NavigationScreenProps {}

export const YourCartUploadPrescription: React.FC<YourCartUploadPrescriptionProps> = (props) => {
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
    physicalPrescriptions,
    pinCode,
    ePrescriptions,
    stores,
  } = useShoppingCart();
  const [activeStores, setActiveStores] = useState<Store[]>([]);

  const tabs = [{ title: 'Home Delivery' }, { title: 'Store Pick Up' }];
  const [selectedTab, setselectedTab] = useState<string>(storeId ? tabs[1].title : tabs[0].title);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { showAphAlert, setLoading } = useUIElements();
  const [showDriveWayPopup, setShowDriveWayPopup] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView | null>();
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(true);

  const prescriptionOption = props.navigation.getParam('prescriptionOptionSelected');
  const durationDay = props.navigation.getParam('durationDays');

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
    physicalPrescriptions.length > 0 ||
    ePrescriptions.length > 0)
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

  const postwebEngageSubmitPrescriptionEvent = (orderId: number) => {
    const deliveryAddress = addresses.find((item) => item.id == deliveryAddressId);
    const deliveryAddressLine = (deliveryAddress && formatAddress(deliveryAddress)) || '';
    const storeAddress = storeId && stores.find((item) => item.storeid == storeId);
    const storeAddressLine = storeAddress && `${storeAddress.storename}, ${storeAddress.address}`;
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION] = {
      'Order ID': `${orderId}`,
      'Delivery type': deliveryAddressId ? 'home' : 'store pickup',
      StoreId: storeId, // incase of store delivery
      'Delivery address': deliveryAddressId ? deliveryAddressLine : storeAddressLine,
      Pincode: pinCode,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION, eventAttributes);
  };

  const placeOrder = async (email?: string) => {
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
      const uploadedPhyPrescriptionsData = await uploadMultipleFiles(physicalPrescriptions);
      console.log('upload of prescriptions done');

      const uploadedPhyPrescriptions = uploadedPhyPrescriptionsData.length
        ? uploadedPhyPrescriptionsData.map((item) => g(item, 'data', 'uploadDocument'))
        : [];

      const phyPresUrls = uploadedPhyPrescriptions.map((item) => item!.filePath).filter((i) => i);
      const phyPresPrismIds = physicalPrescriptions.map(
        (item) => item.prismPrescriptionFileId
      ).filter((i) => i);

      const ePresUrls = ePrescriptions.map((item) => item.uploadedUrl).filter((i) => i);
      const ePresPrismIds = ePrescriptions.map((item) => item.prismPrescriptionFileId).filter(
        (i) => i
      );

      const prescriptionMedicineInput: savePrescriptionMedicineOrderOMSVariables = {
        prescriptionMedicineOMSInput: {
          patientId: (currentPatient && currentPatient.id) || '',
          medicineDeliveryType: deliveryAddressId
            ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
            : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
          shopId: storeId || '0',
          appointmentId: '',
          patinetAddressId: deliveryAddressId || '',
          prescriptionImageUrl: [...phyPresUrls, ...ePresUrls].join(','),
          prismPrescriptionFileId: [...phyPresPrismIds, ...ePresPrismIds].join(','),
          isEprescription: ePrescriptions.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
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
        const { errorCode, orderAutoId } = g(data, 'SavePrescriptionMedicineOrder') || {};
        postwebEngageSubmitPrescriptionEvent(orderAutoId);
        if (errorCode) {
          renderErrorAlert(`Something went wrong, unable to place order.`);
          return;
        }
        props.navigation.goBack();
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

  const renderSuccessPopup = () =>
    showAphAlert!({
      title: 'Hi:)',
      description:
        'Your prescriptions have been submitted successfully. Our Pharmacists will validate the prescriptions and place your order.\n\nIf we require any clarifications, we will call you within one hour (Calling hours: 8AM to 8PM).',
      unDismissable: true,
  });

  const uploadMultipleFiles = (physicalPrescriptions: PhysicalPrescription[]) => {
    return Promise.all(
      physicalPrescriptions.map((item) => {
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
            <MedicineUploadPrescriptionView
              selectedTab={selectedTab}
              setSelectedTab={setselectedTab}
              navigation={props.navigation}
            />
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
              placeOrder();
            }}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent>
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
