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
  RE_UPLOAD_PRESCRIPTION,
  UPLOAD_DOCUMENT,
  GET_PATIENT_ADDRESS_LIST,
  SET_DEFAULT_ADDRESS,
  SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS,
  UPDATE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { ReUploadPrescriptionVariables } from '@aph/mobile-patients/src/graphql/types/ReUploadPrescription';
import {
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
  MEDICINE_DELIVERY_TYPE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  PrescriptionType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  uploadDocument,
  uploadDocumentVariables,
} from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { ExpectCall } from '@aph/mobile-patients/src/components/Medicines/Components/ExpectCall';
import { ProceedBar } from '@aph/mobile-patients/src/components/Medicines/Components/ProceedBar';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  pinCodeServiceabilityApi247,
  getPlaceInfoByPincode,
  nonCartTatApi247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  makeAdressAsDefaultVariables,
  makeAdressAsDefault,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { savePrescriptionMedicineOrderOMSVariables } from '@aph/mobile-patients/src/graphql/types/savePrescriptionMedicineOrderOMS';
import DeviceInfo from 'react-native-device-info';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import moment from 'moment';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
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
    phyPrescriptionsProp: PhysicalPrescription[];
    ePrescriptionsProp: EPrescription[];
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
  const isPhysicalPresciptionProps = !!phyPrescriptionsProp.length;
  const isEPresciptionProps = !!ePrescriptionsProp.length;
  const [PhysicalPrescriptionsProps, setPhysicalPrescriptionsProps] = useState<
    PhysicalPrescription[]
  >(phyPrescriptionsProp);
  const [EPrescriptionsProps, setEPrescriptionsProps] = useState<EPrescription[]>(
    ePrescriptionsProp
  );
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const { setLoading, loading, showAphAlert, hideAphAlert } = useUIElements();
  const {
    setOnHoldOptionOrder,
    onHoldOptionOrder,
    addresses,
    setAddresses,
    deliveryAddressId,
    setDeliveryAddressId,
    storeId,
    stores,
    pinCode,
    deliveryTime,
    setdeliveryTime,
    ePrescriptions,
    setEPrescriptions,
    physicalPrescriptions,
    setPrescriptionType,
    setPhysicalPrescriptions,
    newAddressAdded,
    setNewAddressAdded,
  } = useShoppingCart();
  const SPECIFIED_DURATION = 'Duration as specified in prescription';
  const CALL_ME = 'Call me for details';
  const NEED_ALL_MEDICINES = 'Need all medicine and for duration as per prescription';
  const [prescriptionOption, setPrescriptionOption] = useState<string>(SPECIFIED_DURATION);
  const [durationDays, setDurationDays] = useState<string>('30');
  const [vdcType, setvdcType] = useState<string>('');
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
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
    fetchAddress();
    checkServicability(selectedAddress!, true);
    nonCartAvailabilityTat(selectedAddress?.zipcode);
  }, []);

  useEffect(() => {
    checkServicability(selectedAddress!, false);
    nonCartAvailabilityTat(selectedAddress?.zipcode);
  }, [selectedAddress]);

  useEffect(() => {
    // call availability api if new address is added
    const addressLength = addresses.length;
    if (!!addressLength && !!newAddressAdded) {
      const newAddress = addresses?.filter((value) => value?.id === newAddressAdded);
      checkServicability(newAddress?.[0]?.zipcode, false);
      nonCartAvailabilityTat(newAddress?.[0]?.zipcode);
      setNewAddressAdded && setNewAddressAdded('');
    }
  }, [newAddressAdded]);

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
      const deliveryAddress = addressList.find(({ defaultAddress }) => defaultAddress === true);
      if (deliveryAddress && !deliveryAddressId) {
        setDeliveryAddressId && setDeliveryAddressId(deliveryAddress?.id);
      }
    } catch (error) {}
  }

  async function checkServicability(
    address: savePatientAddress_savePatientAddress_patientAddress,
    forceCheck?: boolean
  ) {
    if (deliveryAddressId && deliveryAddressId == address.id && !forceCheck) {
      return;
    }
    try {
      setLoading?.(true);
      const response = await pinCodeServiceabilityApi247(address.zipcode!);
      const { data } = response;
      if (data?.response?.servicable) {
        setDeliveryAddressId && setDeliveryAddressId(address.id);
        setDefaultAddress(address);
        setvdcType(data?.response?.vdcType);
        setLoading?.(false);
      } else {
        setDeliveryAddressId && setDeliveryAddressId('');
        setLoading?.(false);
        renderAlert(string.medicine_cart.pharmaAddressUnServiceableAlert);
      }
    } catch (error) {
      setLoading?.(false);
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
    } catch (error) {
      CommonBugFender('set_default_Address_on_Cart_Page', error);
    }
  }

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
      const phyPrescription = isPhysicalPresciptionProps
        ? PhysicalPrescriptionsProps
        : physicalPrescriptions;
      const e_Prescription = isEPresciptionProps ? EPrescriptionsProps : ePrescriptions;
      // Physical Prescription Upload
      const uploadedPhyPrescriptionsData = await uploadMultipleFiles(phyPrescription);

      const uploadedPhyPrescriptions = uploadedPhyPrescriptionsData.length
        ? uploadedPhyPrescriptionsData.map((item) => g(item, 'data', 'uploadDocument'))
        : [];

      const phyPresUrls = uploadedPhyPrescriptions.map((item) => item!.filePath).filter((i) => i);
      const phyPresPrismIds = phyPrescription
        .map((item) => item.prismPrescriptionFileId)
        .filter((i) => i);

      const ePresUrls = e_Prescription?.map((item) => item?.uploadedUrl)?.filter((i) => i);
      const ePresPrismIds = e_Prescription
        .map((item) => item?.prismPrescriptionFileId)
        .filter((i) => i);
      const days = durationDays ? parseInt(durationDays) : null;
      const optionSelected =
        selectedMedicineOption === CALL_ME && !!userComment
          ? `${prescriptionOption}, ${userComment}`?.trim()
          : prescriptionOption;

      const prescriptionMedicineInput: savePrescriptionMedicineOrderOMSVariables = {
        prescriptionMedicineOMSInput: {
          patientId: (currentPatient && currentPatient.id) || '',
          medicineDeliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
          ...(storeId ? { shopId: storeId } : {}),
          appointmentId: '',
          patinetAddressId: deliveryAddressId || '',
          prescriptionImageUrl: [...phyPresUrls, ...ePresUrls].join(','),
          prismPrescriptionFileId: [...phyPresPrismIds, ...ePresPrismIds].join(','),
          isEprescription: e_Prescription.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
          // Values for chennai order
          bookingSource: BOOKING_SOURCE.MOBILE,
          deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
          prescriptionOptionSelected: optionSelected,
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
    postWebEngageEvent(WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION, eventAttributes);
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

  const renderPhysicalPrescriptionRow = (
    item: PhysicalPrescription,
    i: number,
    arrayLength: number
  ) => {
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
            <TouchableOpacity
              activeOpacity={1}
              style={{
                width: 40,
                paddingHorizontal: 8,
              }}
              onPress={() => {
                const phyPrescription = isPhysicalPresciptionProps
                  ? PhysicalPrescriptionsProps
                  : physicalPrescriptions;
                CommonLogEvent(AppRoutes.UploadPrescription, 'Physical prescription filter');
                const filteredPres = phyPrescription?.filter(
                  (_item) => _item?.title != item?.title
                );
                isPhysicalPresciptionProps
                  ? setPhysicalPrescriptionsProps([...filteredPres])
                  : setPhysicalPrescriptions && setPhysicalPrescriptions([...filteredPres]);
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
    const phyPrescription = isPhysicalPresciptionProps
      ? PhysicalPrescriptionsProps
      : physicalPrescriptions;
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
        onRemove={() => {
          isEPresciptionProps
            ? setEPrescriptionsProps(EPrescriptionsProps?.filter((_item) => _item?.id != item?.id))
            : setEPrescriptions &&
              setEPrescriptions(ePrescriptions?.filter((_item) => _item?.id != item?.id));
        }}
      />
    );
  };

  const renderEPrescriptions = () => {
    const e_Prescription = isEPresciptionProps ? EPrescriptionsProps : ePrescriptions;
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
            isEPresciptionProps
              ? setEPrescriptionsProps([...selectedEPres])
              : setEPrescriptions && setEPrescriptions([...selectedEPres]);
          }}
          isVisible={true}
          selectedEprescriptionIds={ePrescriptions?.map((item) => item?.id)}
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
    const phyPrescription = isPhysicalPresciptionProps
      ? PhysicalPrescriptionsProps
      : physicalPrescriptions;
    const e_Prescription = isEPresciptionProps ? EPrescriptionsProps : ePrescriptions;
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
          deliveryAddressId={deliveryAddressId}
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
              ComingFrom: AppRoutes.MedicineCart,
            });
            hideAphAlert!();
          }}
          onPressSelectAddress={(address) => {
            checkServicability(address, false);
            nonCartAvailabilityTat(address?.zipcode);
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
    if (isPhysicalPresciptionProps) {
      setPhysicalPrescriptionsProps([...phyPrescriptionsProp]);
      setPhysicalPrescriptions?.([...phyPrescriptionsProp]);
    }
    if (isEPresciptionProps) {
      setEPrescriptionsProps([...EPrescriptionsProps]);
      setEPrescriptions?.([...EPrescriptionsProps]);
    }
    setPrescriptionType?.(PrescriptionType.UPLOADED);
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
            ePrescription: isEPresciptionProps ? EPrescriptionsProps : ePrescriptions,
            physicalPrescription: isPhysicalPresciptionProps
              ? PhysicalPrescriptionsProps
              : physicalPrescriptions,
            selectedMedicineOption: selectedMedicineOption,
            vdcType: vdcType,
            durationDays: prescriptionOption === 'duration' ? days : null,
            prescriptionOption: prescriptionOption,
          })
        }
        disableButton={disableSubmitButton()}
        deliveryTime={deliveryTime}
      />
    );
  };

  const renderReUploadSubmitPrescription = () => {
    return (
      <Button
        disabled={disableSubmitButton()}
        title={'SUBMIT PRESCRIPTION'}
        onPress={() => reUploadPrescription()}
        titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
        style={{ marginBottom: 10, width: '90%', alignSelf: 'center' }}
      />
    );
  };

  const reUploadPrescription = async () => {
    try {
      const phyPrescription = isPhysicalPresciptionProps
        ? PhysicalPrescriptionsProps
        : physicalPrescriptions;
      const e_Prescription = isEPresciptionProps ? EPrescriptionsProps : ePrescriptions;
      // Physical Prescription Upload
      const uploadedPhyPrescriptionsData = await uploadMultipleFiles(phyPrescription);

      const uploadedPhyPrescriptions = uploadedPhyPrescriptionsData.length
        ? uploadedPhyPrescriptionsData.map((item) => g(item, 'data', 'uploadDocument'))
        : [];

      const phyPresUrls = uploadedPhyPrescriptions.map((item) => item!.filePath).filter((i) => i);
      const phyPresPrismIds = phyPrescription
        .map((item) => item.prismPrescriptionFileId)
        .filter((i) => i);

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
              props.navigation.navigate(AppRoutes.UploadPrescriptionView, {
                phyPrescriptionUploaded: PhysicalPrescriptionsProps,
                ePresscriptionUploaded: EPrescriptionsProps,
              });
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
                physicalPrescriptions.length === 0 && ePrescriptions.length === 0 ? 44 : 24,
              paddingRight: 24,
              textAlign: 'right',
            }}
            onPress={() => {
              if (isComingFromReUpload) {
                setShowPopop(true);
              } else {
                props.navigation.navigate(AppRoutes.UploadPrescriptionView, {
                  phyPrescriptionUploaded: PhysicalPrescriptionsProps,
                  ePresscriptionUploaded: EPrescriptionsProps,
                });
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
