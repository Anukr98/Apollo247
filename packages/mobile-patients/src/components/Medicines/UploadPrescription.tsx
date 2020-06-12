import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
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
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS,
  UPLOAD_DOCUMENT,
  UPDATE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  MEDICINE_DELIVERY_TYPE,
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
  NonCartOrderOMSCity,
  BOOKING_SOURCE,
  DEVICE_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePrescriptionMedicineOrderOMSVariables } from '@aph/mobile-patients/src/graphql/types/savePrescriptionMedicineOrderOMS';
import {
  g,
  postWebEngageEvent,
  formatAddress,
  postFirebaseEvent,
  findAddrComponents,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
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
import { uploadDocument, uploadDocumentVariables } from '../../graphql/types/uploadDocument';
import { StorePickupOrAddressSelectionView } from './StorePickupOrAddressSelectionView';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { FirebaseEvents, FirebaseEventName } from '../../helpers/firebaseEvents';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { getPlaceInfoByPincode } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { RadioSelectionItem } from './RadioSelectionItem';

const styles = StyleSheet.create({
  prescriptionCardStyle: {
    paddingTop: 16,
    marginTop: 20,
    marginBottom: 16,
    ...theme.viewStyles.cardContainer,
    borderRadius: 0,
    backgroundColor: theme.colors.CARD_BG,
  },
  labelView: {
    marginHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
});

export interface UploadPrescriptionProps
  extends NavigationScreenProps<{
    phyPrescriptionsProp: PhysicalPrescription[];
    ePrescriptionsProp: EPrescription[];
  }> {}

export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const phyPrescriptionsProp = props.navigation.getParam('phyPrescriptionsProp') || [];
  const ePrescriptionsProp = props.navigation.getParam('ePrescriptionsProp') || [];
  const [PhysicalPrescriptions, setPhysicalPrescriptions] = useState<PhysicalPrescription[]>(
    phyPrescriptionsProp
  );
  const [EPrescriptions, setEPrescriptions] = useState<EPrescription[]>(ePrescriptionsProp);
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const { setLoading, loading, showAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const {
    deliveryAddressId,
    storeId,
    pinCode,
    addresses,
    stores,
    setAddresses,
    setPhysicalPrescriptions: setPhysicalPrescription,
  } = useShoppingCart();
  const { setAddresses: setTestAddresses } = useDiagnosticsCart();
  const [durationDays, setDurationDays] = useState<string>('');
  const medicineDetailOptions = [
    {
      id: 'search',
      title: 'Search and add medicine'
    },
    {
      id: 'all',
      title: 'All medicine from prescription'
    },
    {
      id: 'call',
      title: 'Call me for details'
    },
  ];
  const [selectedMedicineOption, setSelectedMedicineOption] = useState<string>('');

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

    try {
      // const eventFirebaseAttributes: FirebaseEvents[FirebaseEventName.IN_APP_PURCHASE] = {
      //   type: 'Pharmacy_Submit_Prescription',
      // };
      // postFirebaseEvent(FirebaseEventName.IN_APP_PURCHASE, eventFirebaseAttributes);
    } catch (error) {}
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
        props.navigation.navigate(AppRoutes.ChennaiNonCartOrderForm, { onSubmitOrder });
      } else {
        if (selectedMedicineOption === 'search') {
          setLoading!(false);
          props.navigation.navigate(AppRoutes.SearchMedicineScene, { showButton: true });
        } else {
          onSubmitOrder(false);
        }
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

  const onSubmitOrder = async (isChennaiOrder: boolean, email?: string) => {
    CommonLogEvent(
      AppRoutes.UploadPrescription,
      'Graph ql call for save prescription medicine order'
    );
    setLoading!(true);

    try {
      // Physical Prescription Upload
      const uploadedPhyPrescriptionsData = await uploadMultipleFiles(PhysicalPrescriptions);
      console.log('upload of prescriptions done');

      const uploadedPhyPrescriptions = uploadedPhyPrescriptionsData.length
        ? uploadedPhyPrescriptionsData.map((item) => g(item, 'data', 'uploadDocument'))
        : [];

      const phyPresUrls = uploadedPhyPrescriptions.map((item) => item!.filePath).filter((i) => i);
      const phyPresPrismIds = PhysicalPrescriptions.map(
        (item) => item.prismPrescriptionFileId
      ).filter((i) => i);

      const ePresUrls = EPrescriptions.map((item) => item.uploadedUrl).filter((i) => i);
      const ePresPrismIds = EPrescriptions.map((item) => item.prismPrescriptionFileId).filter(
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
          isEprescription: EPrescriptions.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
          // Values for chennai order
          email: isChennaiOrder && email ? email.trim() : null,
          NonCartOrderCity: isChennaiOrder ? NonCartOrderOMSCity.CHENNAI : null,
          bookingSource: BOOKING_SOURCE.MOBILE,
          deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
        },
      };

      const newuploadedPrescriptions = PhysicalPrescriptions.map(
        (item, index) =>
          ({
            ...item,
            uploadedUrl: phyPresUrls![index],
            prismPrescriptionFileId: phyPresPrismIds![index],
          } as PhysicalPrescription)
      );
      setPhysicalPrescription && setPhysicalPrescription([...newuploadedPrescriptions]);
      setLoading!(false);
      props.navigation.push(AppRoutes.YourCart, { movedFrom: 'uploadPrescription'});
      // submitPrescriptionMedicineOrder(prescriptionMedicineInput);
    } catch (error) {
      setLoading!(false);
      CommonBugFender('UploadPrescription_onPressSubmit_try', error);
      renderErrorAlert('Error occurred while uploading physical prescription(s).');
    }
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

  const renderLabel = (label: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.leftText}>{label}</Text>
      </View>
    );
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
                CommonLogEvent(AppRoutes.UploadPrescription, 'Physical prescription filter');
                const filteredPres = PhysicalPrescriptions.filter(
                  (_item) => _item.title != item.title
                );
                setPhysicalPrescriptions([...filteredPres]);
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
    if (PhysicalPrescriptions.length > 0) {
      return (
        <View style={styles.prescriptionCardStyle}>
          <View>{renderLabel('Physical Prescriptions')}</View>
          {PhysicalPrescriptions.map((item, index, array) => {
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
        onRemove={() => {
          setEPrescriptions(EPrescriptions.filter((_item) => _item.id != item.id));
        }}
      />
    );
  };

  const renderEPrescriptions = () => {
    if (EPrescriptions.length > 0) {
      return (
        <View style={[styles.prescriptionCardStyle]}>
          <View>{renderLabel('Prescriptions From Health Records')}</View>
          {EPrescriptions.map((item, index, array) => {
            return renderEPrescriptionRow(item, index, array.length);
          })}
        </View>
      );
    }
  };

  const renderPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        navigation={props.navigation}
        // showConsultPrescriptionsOnly={true} // not showing e-prescriptions for non-cart flow
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          setEPrescriptions([...selectedEPres]);
        }}
        isVisible={isSelectPrescriptionVisible}
        selectedEprescriptionIds={EPrescriptions.map((item) => item.id)}
      />
    );
  };

  const renderMedicineDetailOptions = () => {
    if (PhysicalPrescriptions.length > 0) {
      return (
        <View style={styles.prescriptionCardStyle}>
          <View>{renderLabel('Specify Your Medicine Details')}</View>
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
            {medicineDetailOptions.map((item, index, array) => {
              return (
                <RadioSelectionItem
                  key={item.id}
                  title={item.title}
                  isSelected={selectedMedicineOption == item.id}
                  onPress={() => {
                    setSelectedMedicineOption(item.id);
                  }}
                  containerStyle={{ 
                    ...theme.fonts.IBMPlexSansMedium(16),
                    paddingTop: index + 1 === 1 ? 16 : 10,
                    paddingBottom: index + 1 === array.length ? 16 : 10,
                    padding: 10,
                  }}
                  hideSeparator={index + 1 === array.length || (selectedMedicineOption == item.id && selectedMedicineOption == 'all')}
                  textStyle={{
                    ...theme.fonts.IBMPlexSansMedium(16),
                  }}
                  radioSubBody={selectedMedicineOption == item.id ? getRadioButtonAction() : <></>}
                />
              );
            })}
          </View>
        </View>
      );
    }
  };

  const getRadioButtonAction = () => {
    if (selectedMedicineOption === 'call') {
      return (
        <View style={{
          backgroundColor: theme.colors.CARD_BG,
          padding: 16,
          margin: 0,
          borderBottomRightRadius: 10,
          borderBottomLeftRadius: 10,
        }}>
          <Text style={{
            color: theme.colors.LIGHT_BLUE,
            ...theme.fonts.IBMPlexSansMedium(13),
            textAlign: 'center',
          }}>
            Our pharmacist will call you within 2 hours to confirm medicines (8 AM to 8 PM).
          </Text>
        </View>
      );
    } else if (selectedMedicineOption === 'all') {
      return (
        <View style={{
          backgroundColor: theme.colors.WHITE,
          margin: 0,
          width: '100%',
        }}>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: theme.colors.CARD_BG,
            padding: 10,
            shadowColor: theme.colors.SHADOW_GRAY,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{
              color: theme.colors.APP_GREEN,
              ...theme.fonts.IBMPlexSansMedium(13),
              marginLeft: 35,
              marginRight: 25,
            }}>
              As specified in prescription
            </Text>
            <GreenTickIcon style={{
              resizeMode: 'contain',
            }} />
          </View>
          <View style={{
            margin: 10,
            marginBottom: 0,
            marginLeft: 45,
            display: 'flex',
            flexDirection: 'row',
          }}>
            <Text style={{
              color: theme.colors.LIGHT_BLUE,
              ...theme.fonts.IBMPlexSansMedium(13),
            }}>
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
                color: theme.colors.LIGHT_BLUE,
                opacity: 0.5,
                ...theme.fonts.IBMPlexSansMedium(13),
                textAlign: 'center',
                borderBottomWidth: 1,
                paddingBottom: 0,
              }}
              keyboardType={'numeric'}
              value={durationDays}
              onChangeText={(value) => setDurationDays(value)}
            />
            <Text style={{
              color: theme.colors.LIGHT_BLUE,
              ...theme.fonts.IBMPlexSansMedium(13),
            }}>
              Days
            </Text>
          </View>
          <View 
            style={{
              height: 1,
              opacity: 0.1,
              backgroundColor: theme.colors.LIGHT_BLUE,
            }} />
        </View>
      );
    }
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={'SUBMIT PRESCRIPTION'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} style={{ flex: 1 }}>
          {renderPhysicalPrescriptions()}
          {renderEPrescriptions()}
          {/* {!![...PhysicalPrescriptions, ...EPrescriptions].length && ( */}
          {/* <View style={{ marginTop: 20 }}>{renderLabel('Where should we deliver?')}</View>
          <StorePickupOrAddressSelectionView navigation={props.navigation} /> */}
          {/* )} */}
          <Text
            style={{
              ...fonts.IBMPlexSansBold(13),
              color: theme.colors.APP_YELLOW,
              lineHeight: 24,
              // paddingBottom: 4,
              // marginBottom: 16,
              paddingRight: 24,
              // paddingTop: 16,
              textAlign: 'right',
            }}
            onPress={() => setShowPopop(true)}
          >
            ADD MORE PRESCRIPTIONS
          </Text>
          {renderMedicineDetailOptions()}
        </ScrollView>
      </SafeAreaView>
      
      <StickyBottomComponent style={{ position: 'relative' }} defaultBG>
        <Button
          disabled={
            !(PhysicalPrescriptions.length || EPrescriptions.length) ||
            !selectedMedicineOption ||
            // !(storeId || deliveryAddressId) ||
            loading
          }
          title={'SUBMIT'}
          onPress={onPressSubmit}
          style={{ marginHorizontal: 60, flex: 1 }}
        />
      </StickyBottomComponent>
      {renderPrescriptionModal()}
      <UploadPrescriprionPopup
        isVisible={ShowPopop}
        // disabledOption={
        //   EPrescriptions.length == 0 && PhysicalPrescriptions.length == 0
        //     ? 'NONE'
        //     : EPrescriptions.length > 0
        //     ? 'CAMERA_AND_GALLERY'
        //     : 'E-PRESCRIPTION'
        // }
        type="nonCartFlow"
        heading={'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
          prescription: 'SELECT FROM\nE-PRESCRIPTION',
        }}
        onClickClose={() => setShowPopop(false)}
        onResponse={(selectedType, response) => {
          setShowPopop(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            setPhysicalPrescriptions([...PhysicalPrescriptions, ...response]);
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    </View>
  );
};
