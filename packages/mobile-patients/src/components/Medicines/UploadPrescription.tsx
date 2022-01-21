import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  EPrescription,
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';

import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { EPrescriptionCard } from '@aph/mobile-patients/src/components/ui/EPrescriptionCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossYellow, FileBig, GreenTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  g,
  postWebEngageEvent,
  findAddrComponents,
  formatAddress,
  setAsyncPharmaLocation,
  postCleverTapEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { RadioSelectionItem } from './RadioSelectionItem';
import {
  UPDATE_PATIENT_ADDRESS,
  SAVE_MEDICINE_ORDER_V3,
  RE_UPLOAD_PRESCRIPTION,
  UPLOAD_DOCUMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  MEDICINE_DELIVERY_TYPE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  SaveMedicineOrderV3Input,
  MEDICINE_ORDER_TYPE,
  UPLOAD_FILE_TYPES,
  PRISM_DOCUMENT_CATEGORY,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { ExpectCall } from '@aph/mobile-patients/src/components/Medicines/Components/ExpectCall';
import { ProceedBar } from '@aph/mobile-patients/src/components/Medicines/Components/ProceedBar';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getPlaceInfoByPincode } from '@aph/mobile-patients/src/helpers/apiCalls';
import DeviceInfo from 'react-native-device-info';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import AsyncStorage from '@react-native-community/async-storage';
import { USER_AGENT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import { saveCart_saveCart_data_prescriptionDetails } from '@aph/mobile-patients/src/graphql/types/saveCart';
import { ReUploadPrescriptionVariables } from '@aph/mobile-patients/src/graphql/types/ReUploadPrescription';
import {
  uploadDocument,
  uploadDocumentVariables,
} from '@aph/mobile-patients/src/graphql/types/uploadDocument';
const styles = StyleSheet.create({
  prescriptionCardStyle: {
    paddingTop: 7,
    marginTop: 5,
    marginBottom: 7,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: theme.colors.CARD_BG,
  },
  labelView: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  starText: {
    color: theme.colors.RED,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 17,
    color: '#979797',
  },
  subtitleStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  textContainerStyle: {
    padding: 20,
    borderRadius: 10,
    borderBottomColor: 'black',
    marginTop: -20,
    marginBottom: 20,
  },
  userCommentTextBoxStyle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    borderWidth: 1,
    padding: 10,
    borderBottomWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(2,71,91, 0.3)',
    backgroundColor: theme.colors.WHITE,
    flexWrap: 'wrap',
  },
});

export interface UploadPrescriptionProps
  extends NavigationScreenProps<{
    phyPrescriptionsProp?: any[];
    ePrescriptionsProp?: any[];
    type?: string;
    showOptions?: boolean;
    isReUpload?: boolean;
    orderAutoId?: string;
    source?: string;
  }> {}

export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const phyPrescriptionsProp = props.navigation.getParam('phyPrescriptionsProp') || [];
  const ePrescriptionsProp = props.navigation.getParam('ePrescriptionsProp') || [];
  const isComingFromReUpload = props.navigation.getParam('isReUpload') || false;
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const orderId = props.navigation.getParam('orderAutoId');
  const source = props.navigation.getParam('source') || '';
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { pharmacyUserType, uploadPrescriptionOptions } = useAppCommonData();
  const type = props.navigation.getParam('type') || '';
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const [userAgent, setUserAgent] = useState<string>('');
  const { setLoading, loading, showAphAlert, hideAphAlert } = useUIElements();
  const {
    setOnHoldOptionOrder,
    onHoldOptionOrder,
    addresses,
    setAddresses,
    storeId,
    stores,
    pinCode,
    cartTat,
    newAddressAdded,
    setNewAddressAdded,
    cartPrescriptions,
    cartAddressId,
    serverCartLoading,
  } = useShoppingCart();
  const {
    removePrescriptionFromCart,
    fetchAddress,
    fetchServerCart,
    setUserActionPayload,
  } = useServerCart();

  const physicalPrescriptionsUploaded = cartPrescriptions?.filter((pres) => !pres?.appointmentId);
  const [PhysicalPrescriptionsProps, setPhysicalPrescriptionsProps] = useState<any[]>(
    isComingFromReUpload ? phyPrescriptionsProp : physicalPrescriptionsUploaded
  );
  const ePrescriptionsUploaded = cartPrescriptions?.filter((pres) => pres?.appointmentId);
  const [EPrescriptionsProps, setEPrescriptionsProps] = useState<any[]>(
    isComingFromReUpload ? ePrescriptionsProp : ePrescriptionsUploaded
  );
  const SPECIFIED_DURATION = 'Duration as specified in prescription';
  const CALL_ME = 'Call me for details';
  const NEED_ALL_MEDICINES = 'Need all medicine and for duration as per prescription';
  const [prescriptionOption, setPrescriptionOption] = useState<string>(SPECIFIED_DURATION);
  const [durationDays, setDurationDays] = useState<string>('30');
  const [vdcType, setvdcType] = useState<string>('');
  const selectedAddress = addresses.find((item) => item.id == cartAddressId);
  const medicineDetailOptions = [
    {
      id: 'search',
      title: 'Search and select medicines by myself',
      subTitle: 'Browse and select medicines which you wish to purchase',
    },
    {
      id: NEED_ALL_MEDICINES,
      title: 'Order all medicines from prescription',
      subTitle: 'Order will be prepared with all the medicines as prescribed by the doctor',
    },
    {
      id: CALL_ME,
      title: 'Call me to confirm my order',
      subTitle: 'Our pharmacist will call you to confirm the required items',
    },
  ];
  const [selectedMedicineOption, setSelectedMedicineOption] = useState<string>('search');
  const [numberOfPrescriptionClicked, setNumberOfPrescriptionClicked] = useState<number>(
    type === 'Camera' ? 1 : 0
  );
  const [numberOfPrescriptionUploaded, setNumberOfPrescriptionUploaded] = useState<number>(
    type === 'Gallery' ? 1 : 0
  );
  const showMedicineDescription =
    props.navigation.getParam('showOptions') != undefined
      ? props.navigation.getParam('showOptions')
      : true;

  const scrollviewRef = useRef<any>(null);
  const [userComment, setUserComment] = useState<string>('');

  useEffect(() => {
    if (isComingFromReUpload === false) {
      setPhysicalPrescriptionsProps(cartPrescriptions?.filter((pres) => !pres?.appointmentId));
      setEPrescriptionsProps(cartPrescriptions?.filter((pres) => pres?.appointmentId));
    }
  }, [cartPrescriptions]);

  useEffect(() => {
    setLoading?.(serverCartLoading);
  }, [serverCartLoading]);

  useEffect(() => {
    fetchAddress();
    isComingFromReUpload === false && fetchServerCart();
    AsyncStorage.getItem(USER_AGENT).then((userAgent) => {
      setUserAgent(userAgent || '');
    });
  }, []);

  useEffect(() => {
    const addressLength = addresses.length;
    if (!!addressLength && !!newAddressAdded) {
      const newAddress = addresses?.filter((value) => value?.id === newAddressAdded);
      setUserActionPayload?.({
        patientAddressId: newAddressAdded,
        zipcode: newAddress?.[0]?.zipcode,
        latitude: newAddress?.[0]?.latitude,
        longitude: newAddress?.[0]?.longitude,
      });
      setNewAddressAdded && setNewAddressAdded('');
    }
  }, [newAddressAdded]);

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

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
      const customerComments: string[] = [];
      if (prescriptionOption) customerComments.push(prescriptionOption);
      if (userComment) customerComments.push(userComment);
      if (prescriptionOption === 'duration' && durationDays) customerComments.push(durationDays);
      const customerComment = customerComments.join(' ');
      initiateOrder(customerComment);
    } catch (error) {
      setLoading!(false);
      CommonBugFender('UploadPrescription_onPressSubmit_try', error);
      renderErrorAlert('Error occurred while uploading physical prescription(s).');
    }
  };

  const initiateOrder = async (customerComment: string) => {
    try {
      const saveMedicineOrderV3Variables: SaveMedicineOrderV3Input = {
        patientId: currentPatient?.id,
        cartType: MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION,
        medicineDeliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
        bookingSource: BOOKING_SOURCE.MOBILE,
        deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
        appVersion: DeviceInfo.getVersion(),
        customerComment,
        showPrescriptionAtStore: false,
      };
      client
        .mutate({
          mutation: SAVE_MEDICINE_ORDER_V3,
          variables: { medicineOrderInput: saveMedicineOrderV3Variables },
          fetchPolicy: 'no-cache',
          context: {
            headers: {
              'User-Agent': userAgent,
            },
          },
        })
        .then((result) => {
          const orderResponse = result?.data?.saveMedicineOrderV3;
          if (orderResponse?.errorMessage) {
            throw orderResponse?.errorMessage;
          }
          if (orderResponse?.data) {
            const orderData = orderResponse?.data;
            const { orders } = orderData;
            postwebEngageSubmitPrescriptionEvent(orders?.[0]?.orderAutoId);
            renderSuccessPopup(orders?.[0]?.orderAutoId);
          }
        })
        .catch((error) => {
          renderAlert(error);
        })
        .finally(() => {
          setLoading?.(false);
        });
    } catch (error) {
      setLoading?.(false);
      renderAlert('Something went wrong. Please try again after some time');
    }
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

  const postwebEngageSubmitPrescriptionEvent = (orderAutoId: string) => {
    const deliveryAddress = addresses.find((item) => item.id == cartAddressId);
    const deliveryAddressLine = (deliveryAddress && formatAddress(deliveryAddress)) || '';
    const storeAddress = storeId && stores.find((item) => item.storeid == storeId);
    const storeAddressLine = storeAddress && `${storeAddress.storename}, ${storeAddress.address}`;
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION] = {
      'Order ID': `${orderAutoId}`,
      'Delivery type': cartAddressId ? 'home' : 'store pickup',
      StoreId: storeId, // incase of store delivery
      'Delivery address': cartAddressId ? deliveryAddressLine : storeAddressLine,
      Pincode: pinCode,
      User_Type: pharmacyUserType,
    };
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      'Order ID(s)': `${orderAutoId}`,
      'Order type': 'Non Cart',
      'Mode of delivery': cartAddressId ? 'Home' : 'Pickup',
      'Store ID': storeId || undefined, // incase of store delivery
      'Shipping information': cartAddressId ? deliveryAddressLine : storeAddressLine,
      Pincode: pinCode || undefined,
      'User type': pharmacyUserType || undefined,
      'Service area': 'Pharmacy',
    };
    postCleverTapEvent(CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED, cleverTapEventAttributes);
    postWebEngageEvent(WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION, eventAttributes);

    const firebaseCheckoutEventAttributes: FirebaseEvents[FirebaseEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      order_id: orderAutoId,
      user_type: pharmacyUserType,
    };
    postFirebaseEvent(
      FirebaseEventName.PHARMACY_CHECKOUT_COMPLETED,
      firebaseCheckoutEventAttributes
    );
  };

  const renderSuccessPopup = (orderAutoId: string) => {
    props.navigation.pop(2, { immediate: true });
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
            props.navigation.push(AppRoutes.OrderDetailsScene, {
              showOrderSummaryTab: false,
              orderAutoId: orderAutoId,
            });
          },
        },
      ],
    });
  };

  const renderErrorAlert = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: desc,
      unDismissable: true,
    });

  const renderLabel = (label: string, renderStar?: boolean) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.leftText}>{label}</Text>
        {!!renderStar && <Text style={styles.starText}>{` *`}</Text>}
      </View>
    );
  };

  const renderPhysicalPrescriptionRow = (
    item: saveCart_saveCart_data_prescriptionDetails | PhysicalPrescription,
    i: number,
    arrayLength: number
  ) => {
    const isPdf =
      item?.uploadedUrl?.toLowerCase()?.endsWith('.pdf') ||
      item?.prescriptionImageUrl?.toLowerCase()?.endsWith('.pdf');
    return (
      <View key={i} style={{}}>
        <TouchableOpacity activeOpacity={1} key={i}>
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
              {!!isPdf ? (
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
                  source={{
                    uri: `${item?.prescriptionImageUrl}` || `data:image/jpeg;base64,${item.base64}`,
                  }}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <TextInputComponent
                textInputprops={{ editable: false }}
                inputStyle={{
                  marginTop: 3,
                }}
                value={item?.prismPrescriptionFileId || item?.title || 'File'}
              />
            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                width: 40,
                paddingHorizontal: 8,
              }}
              onPress={() => {
                if (isComingFromReUpload) {
                  const phyPrescription = PhysicalPrescriptionsProps;
                  CommonLogEvent(AppRoutes.UploadPrescription, 'Physical prescription filter');
                  const filteredPres = phyPrescription?.filter(
                    (_item) => _item?.title != item?.title
                  );
                  setPhysicalPrescriptionsProps([...filteredPres]);
                } else {
                  removePrescriptionFromCart(item?.prismPrescriptionFileId);
                }
              }}
            >
              <CrossYellow />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPhysicalPrescriptions = () => {
    const phyPrescription = PhysicalPrescriptionsProps;
    if (phyPrescription?.length > 0) {
      return (
        <View style={styles.prescriptionCardStyle}>
          <View>{renderLabel('Physical Prescriptions')}</View>
          {phyPrescription?.map((item, index, array) => {
            return renderPhysicalPrescriptionRow(item, index, array?.length);
          })}
        </View>
      );
    }
  };

  const renderEPrescriptionRow = (
    item: saveCart_saveCart_data_prescriptionDetails | EPrescription,
    i: number,
    arrayLength: number
  ) => {
    return (
      <EPrescriptionCard
        style={{
          marginTop: i === 0 ? 20 : 4,
          marginBottom: arrayLength === i + 1 ? 16 : 4,
        }}
        medicines={item?.meta?.medicines || item?.medicines}
        actionType="removal"
        date={item?.meta?.date || item?.date}
        doctorName={item?.meta?.doctorName || item?.doctorName}
        forPatient={item?.meta?.forPatient || item?.forPatient}
        onRemove={() => {
          if (isComingFromReUpload) {
            setEPrescriptionsProps(EPrescriptionsProps?.filter((_item) => _item?.id != item?.id));
          } else {
            removePrescriptionFromCart(item?.prismPrescriptionFileId);
          }
        }}
      />
    );
  };

  const renderEPrescriptions = () => {
    const e_Prescription = EPrescriptionsProps;
    if (e_Prescription?.length > 0) {
      return (
        <View style={[styles.prescriptionCardStyle]}>
          <View>{renderLabel('Prescriptions From Health Records')}</View>
          {e_Prescription?.map((item, index, array) => {
            return renderEPrescriptionRow(item, index, array?.length);
          })}
        </View>
      );
    }
  };

  const renderPrescriptionModal = () => {
    return (
      isSelectPrescriptionVisible && (
        <SelectEPrescriptionModal
          displayPrismRecords={true}
          navigation={props.navigation}
          onSubmit={(selectedEPres) => {
            setSelectPrescriptionVisible(false);
            if (selectedEPres.length == 0) {
              return;
            }
            setEPrescriptionsProps([...selectedEPres]);
          }}
          isVisible={true}
          selectedEprescriptionIds={EPrescriptionsProps?.map((item) => item?.id)}
        />
      )
    );
  };

  const renderMedicineDetailOptions = () => {
    const prescriptionOptions = uploadPrescriptionOptions?.length
      ? uploadPrescriptionOptions
      : medicineDetailOptions;
    return (
      <View style={styles.prescriptionCardStyle}>
        <View>{renderLabel('Choose a suitable option below', true)}</View>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            shadowRadius: 4,
            marginHorizontal: 20,
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            margin: 16,
          }}
        >
          {prescriptionOptions?.map((item, index, array) => {
            return (
              <RadioSelectionItem
                key={item.id}
                subtitle={item.title}
                title={item.subTitle}
                showMultiLine={true}
                textStyle={styles.textStyle}
                subtitleStyle={styles.subtitleStyle}
                isSelected={selectedMedicineOption == item.id}
                onPress={() => {
                  setSelectedMedicineOption(item.id);
                  const optionSelected =
                    item.id === 'search'
                      ? 'Search and add'
                      : item.id === NEED_ALL_MEDICINES
                      ? 'All Medicine'
                      : CALL_ME;
                  if (optionSelected === CALL_ME || optionSelected === 'All Medicine') {
                    setTimeout(() => {
                      scrollviewRef.current.scrollToEnd({ animated: true });
                    }, 300);
                    setPrescriptionOption(optionSelected);
                  }
                  const eventAttribute: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_OPTION_SELECTED] = {
                    OptionSelected: optionSelected,
                    User_Type: pharmacyUserType,
                  };
                  postWebEngageEvent(
                    WebEngageEventName.UPLOAD_PRESCRIPTION_OPTION_SELECTED,
                    eventAttribute
                  );
                  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_PRESCRIPTION_OPTION_CLICKED] = {
                    Option: optionSelected,
                  };
                  postCleverTapEvent(
                    CleverTapEventName.PHARMACY_PRESCRIPTION_OPTION_CLICKED,
                    cleverTapEventAttributes
                  );
                }}
                containerStyle={{
                  ...theme.fonts.IBMPlexSansMedium(16),
                  paddingTop: index + 1 === 1 ? 16 : 10,
                  paddingBottom: index + 1 === array.length ? 16 : 10,
                  padding: 10,
                }}
                hideSeparator={
                  index + 1 === array.length ||
                  (selectedMedicineOption == item.id &&
                    selectedMedicineOption == NEED_ALL_MEDICINES)
                }
                radioSubBody={selectedMedicineOption == item.id ? getRadioButtonAction() : <></>}
              />
            );
          })}
        </View>
      </View>
    );
  };

  const getRadioButtonAction = () => {
    if (selectedMedicineOption === NEED_ALL_MEDICINES) {
      const isDurationDaysSelected = prescriptionOption === 'duration';
      return (
        <View
          style={{
            backgroundColor: theme.colors.WHITE,
            margin: 0,
            width: '100%',
          }}
        >
          <TouchableOpacity
            style={[
              {
                display: 'flex',
                flexDirection: 'row',
                padding: 10,
              },
              !isDurationDaysSelected
                ? {
                    backgroundColor: theme.colors.CARD_BG,
                    shadowColor: theme.colors.SHADOW_GRAY,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                : {},
            ]}
            onPress={() => {
              setPrescriptionOption(SPECIFIED_DURATION);
            }}
          >
            <Text
              style={{
                color: isDurationDaysSelected ? theme.colors.LIGHT_BLUE : theme.colors.APP_GREEN,
                ...theme.fonts.IBMPlexSansMedium(13),
                marginLeft: 35,
                marginRight: 25,
              }}
            >
              Duration as specified in prescription
            </Text>
            {!isDurationDaysSelected && (
              <GreenTickIcon
                style={{
                  resizeMode: 'contain',
                }}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                padding: 10,
                paddingLeft: 45,
              },
              isDurationDaysSelected
                ? {
                    backgroundColor: theme.colors.CARD_BG,
                    shadowColor: theme.colors.SHADOW_GRAY,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                : {},
            ]}
            onPress={() => setPrescriptionOption('duration')}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <Text
                style={{
                  color: isDurationDaysSelected ? theme.colors.APP_GREEN : theme.colors.LIGHT_BLUE,
                  ...theme.fonts.IBMPlexSansMedium(13),
                }}
              >
                Duration -
              </Text>
              <TextInputComponent
                conatinerstyles={{
                  width: 30,
                  marginLeft: 10,
                  marginRight: 10,
                  marginTop: -5,
                  paddingTop: 0,
                }}
                inputStyle={{
                  color: isDurationDaysSelected ? theme.colors.APP_GREEN : theme.colors.LIGHT_BLUE,
                  opacity: 0.5,
                  ...theme.fonts.IBMPlexSansMedium(13),
                  textAlign: 'center',
                  borderBottomWidth: 1,
                  paddingBottom: 0,
                }}
                keyboardType={'numeric'}
                value={durationDays}
                onChangeText={(value) => setDurationDays(value)}
                onFocus={() => setPrescriptionOption('duration')}
              />
              <Text
                style={{
                  color: isDurationDaysSelected ? theme.colors.APP_GREEN : theme.colors.LIGHT_BLUE,
                  ...theme.fonts.IBMPlexSansMedium(13),
                }}
              >
                Days
              </Text>
              {isDurationDaysSelected && (
                <GreenTickIcon
                  style={{
                    resizeMode: 'contain',
                    marginLeft: 50,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
          <View
            style={{
              height: 1,
              opacity: 0.1,
              backgroundColor: theme.colors.LIGHT_BLUE,
            }}
          />
        </View>
      );
    }
  };

  const disableSubmitButton = () => {
    const phyPrescription = PhysicalPrescriptionsProps;
    const e_Prescription = EPrescriptionsProps;
    const isPrescriptions = !(phyPrescription?.length || e_Prescription?.length);
    if (!showMedicineDescription) {
      return isPrescriptions;
    } else {
      const durationDaysInput =
        selectedMedicineOption &&
        selectedMedicineOption === NEED_ALL_MEDICINES &&
        prescriptionOption === 'duration' &&
        durationDays === ''
          ? true
          : false;
      return isPrescriptions || !selectedMedicineOption || durationDaysInput || loading;
    }
  };

  function showAddressPopup() {
    showAphAlert!({
      title: string.common.selectAddress,
      removeTopIcon: true,
      children: (
        <ChooseAddress
          addresses={addresses}
          deliveryAddressId={cartAddressId}
          onPressAddAddress={() => {
            props.navigation.navigate(AppRoutes.AddAddressNew, {
              source: 'Upload Prescription' as AddressSource,
              addOnly: true,
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
            setUserActionPayload?.({
              patientAddressId: address?.id,
              zipcode: address?.zipcode,
              latitude: address?.latitude,
              longitude: address?.longitude,
            });
            setAsyncPharmaLocation(address);
            hideAphAlert!();
          }}
        />
      ),
    });
  }

  const renderExpectCall = () => {
    return selectedMedicineOption === CALL_ME || selectedMedicineOption === NEED_ALL_MEDICINES ? (
      <ExpectCall />
    ) : null;
  };

  const renderUserCommentBox = () =>
    selectedMedicineOption === CALL_ME ? (
      <TextInputComponent
        conatinerstyles={styles.textContainerStyle}
        inputStyle={styles.userCommentTextBoxStyle}
        value={`${userComment}`}
        onChangeText={(userComment) => setUserComment(userComment)}
        placeholder={'Start typing ...'}
        label={'Please type your medicine needs below (optional)'}
        numberOfLines={3}
        multiline={true}
        maxLength={150}
      />
    ) : null;

  const onPressProceed = () => {
    props.navigation.navigate(AppRoutes.MedicineSearch, {
      showButton: true,
      isReUpload: isComingFromReUpload,
      orderAutoId: orderId,
    });
    setLoading!(false);
  };

  const days = durationDays ? parseInt(durationDays) : null;

  const renderProceedBar = () => {
    return (
      <ProceedBar
        onPressSelectDeliveryAddress={() => {
          showAddressPopup();
        }}
        selectedMedicineOption={selectedMedicineOption}
        onPressAddDeliveryAddress={() => {
          props.navigation.navigate(AppRoutes.AddAddressNew, {
            source: 'Cart' as AddressSource,
            addOnly: true,
          });
        }}
        vdcType={vdcType}
        onPressPlaceOrder={onPressPlaceOrder}
        onPressChangeAddress={showAddressPopup}
        onPressProceed={onPressProceed}
        onPressTatCard={() =>
          !disableSubmitButton() &&
          props.navigation.navigate(AppRoutes.PrescriptionOrderSummary, {
            ePrescription: EPrescriptionsProps,
            physicalPrescription: PhysicalPrescriptionsProps,
            selectedMedicineOption: selectedMedicineOption,
            vdcType: vdcType,
            durationDays: prescriptionOption === 'duration' ? days : null,
            prescriptionOption: prescriptionOption,
          })
        }
        disableButton={disableSubmitButton()}
        deliveryTime={cartTat}
        screen={'prescription'}
      />
    );
  };

  const renderReUploadSubmitPrescription = () => {
    return (
      <Button
        disabled={disableSubmitButton()}
        title={'SUBMIT PRESCRIPTION'}
        onPress={() => (isComingFromReUpload ? reUploadPrescription() : initiateOrder(''))}
        titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
        style={{ marginBottom: 10, width: '90%', alignSelf: 'center' }}
      />
    );
  };

  const reUploadPrescription = async () => {
    try {
      const phyPrescription = PhysicalPrescriptionsProps;
      const e_Prescription = EPrescriptionsProps;
      // Physical Prescription Upload
      const uploadedPhyPrescriptionsData = await uploadMultipleFiles(phyPrescription);

      const uploadedPhyPrescriptions = uploadedPhyPrescriptionsData.length
        ? uploadedPhyPrescriptionsData.map((item) => g(item, 'data', 'uploadDocument'))
        : [];

      const phyPresUrls = uploadedPhyPrescriptions.map((item) => item!.filePath).filter((i) => i);
      const phyPresPrismIds = uploadedPhyPrescriptions.map((item) => item?.fileId).filter((i) => i);
      const ePresUrls = e_Prescription.map((item) => item.uploadedUrl).filter((i) => i);
      const ePresPrismIds = e_Prescription
        .map((item) => item.prismPrescriptionFileId)
        .filter((i) => i);
      const reUploadPrescriptionInput: ReUploadPrescriptionVariables = {
        prescriptionInput: {
          orderId: parseInt(orderId!),
          fileUrl: [...phyPresUrls, ...ePresUrls].join(','),
          prismPrescriptionFileId: [...phyPresPrismIds, ...ePresPrismIds].join(','),
        },
      };
      submitReuploadPrescription(reUploadPrescriptionInput);
    } catch (error) {
      setLoading!(false);
      CommonBugFender('UploadPrescription_onPressSubmit_try', error);
      renderErrorAlert('Error occurred while uploading physical prescription(s).');
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
                : item.fileType == 'pdf' || item.fileType == 'application/pdf'
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

  const submitReuploadPrescription = (variables: ReUploadPrescriptionVariables) => {
    setLoading!(true);
    client
      .mutate({
        mutation: RE_UPLOAD_PRESCRIPTION,
        variables,
      })
      .then(({ data }) => {
        if (!data.reUploadPrescription.success) {
          renderErrorAlert(`Something went wrong, please try later.`);
          return;
        }
        renderSuccessPopup(orderId!);
        const newVal = [{ id: orderId }];
        if (onHoldOptionOrder!.find((item) => item.id == orderId)) {
          setLoading!(false);
          return;
        }
        const val = [...onHoldOptionOrder, ...newVal];
        setOnHoldOptionOrder!(val);
      })
      .catch((e) => {
        setLoading!(false);
        CommonBugFender('UploadPrescription_submitPrescriptionMedicineOrder', e);
        renderErrorAlert(`Something went wrong, please try later.`);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={isComingFromReUpload ? 'RE-UPLOAD PRESCRIPTION' : 'SUBMIT PRESCRIPTION'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1 }}
          onPressLeftIcon={() => {
            if (source === 'UploadPrescription') {
              props.navigation.navigate(AppRoutes.UploadPrescriptionView);
            } else {
              props.navigation.goBack();
            }
          }}
        />
        <ScrollView
          ref={scrollviewRef}
          bounces={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          {renderPhysicalPrescriptions()}
          {renderEPrescriptions()}
          <Text
            style={{
              ...fonts.IBMPlexSansBold(13),
              color: theme.colors.APP_YELLOW,
              lineHeight:
                PhysicalPrescriptionsProps.length === 0 && EPrescriptionsProps.length === 0
                  ? 44
                  : 24,
              paddingRight: 24,
              textAlign: 'right',
            }}
            onPress={() => {
              if (isComingFromReUpload) {
                setShowPopop(true);
              } else {
                props.navigation.navigate(AppRoutes.UploadPrescriptionView);
              }
            }}
          >
            ADD MORE PRESCRIPTIONS
          </Text>
          {showMedicineDescription && renderMedicineDetailOptions()}
          {showMedicineDescription && renderExpectCall()}
          {showMedicineDescription && renderUserCommentBox()}
        </ScrollView>
      </SafeAreaView>
      {isComingFromReUpload ? renderReUploadSubmitPrescription() : renderProceedBar()}
      {renderPrescriptionModal()}
      <UploadPrescriprionPopup
        isVisible={ShowPopop}
        type={isComingFromReUpload ? 'Re-Upload' : 'Upload Flow'}
        heading={isComingFromReUpload ? 'Re-Upload Prescription(s)' : 'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          isComingFromReUpload
            ? 'Take clear picture of your complete prescription. (edge to edge)'
            : 'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          isComingFromReUpload
            ? 'Ensure a valid prescription, for acute illnesses such as Virals, infections etc a recent prescription is required. For Chronic illnesses such as Blood pressure & diabetes, upto 1 year old prescriptions are acceptable'
            : 'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
          prescription: 'SELECT FROM\nE-PRESCRIPTION',
        }}
        onClickClose={() => setShowPopop(false)}
        onResponse={(selectedType, response, type) => {
          setShowPopop(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            if (type !== undefined) {
              if (type === 'Camera')
                setNumberOfPrescriptionClicked(numberOfPrescriptionClicked + 1);
              if (type === 'Gallery')
                setNumberOfPrescriptionUploaded(numberOfPrescriptionUploaded + 1);
            }
            setPhysicalPrescriptionsProps([...PhysicalPrescriptionsProps, ...response]);
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    </View>
  );
};
