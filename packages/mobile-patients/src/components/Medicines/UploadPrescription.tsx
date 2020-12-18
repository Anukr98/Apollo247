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
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
} from '@aph/mobile-patients/src/graphql/profiles';
import { ReUploadPrescriptionVariables } from '@aph/mobile-patients/src/graphql/types/ReUploadPrescription';
import {
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
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
import { AddressSource } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { pinCodeServiceabilityApi247 } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  makeAdressAsDefaultVariables,
  makeAdressAsDefault,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';

const styles = StyleSheet.create({
  prescriptionCardStyle: {
    paddingTop: 16,
    marginTop: 20,
    marginBottom: 16,
    ...theme.viewStyles.cardViewStyle,
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
    type?: string;
    showOptions?: boolean;
    isReUpload?: boolean;
    orderAutoId?: string;
  }> {}

export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const phyPrescriptionsProp = props.navigation.getParam('phyPrescriptionsProp') || [];
  const ePrescriptionsProp = props.navigation.getParam('ePrescriptionsProp') || [];
  const isComingFromReUpload = props.navigation.getParam('isReUpload') || false;
  const orderId = props.navigation.getParam('orderAutoId');
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const type = props.navigation.getParam('type') || '';
  const [PhysicalPrescriptions, setPhysicalPrescriptions] = useState<PhysicalPrescription[]>(
    phyPrescriptionsProp
  );
  const [EPrescriptions, setEPrescriptions] = useState<EPrescription[]>(ePrescriptionsProp);
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const { setLoading, loading, showAphAlert, hideAphAlert } = useUIElements();
  const {
    setPhysicalPrescriptions: setPhysicalPrescription,
    setEPrescriptions: setEPrescription,
    setOnHoldOptionOrder,
    onHoldOptionOrder,
    addresses,
    setAddresses,
    deliveryAddressId,
    setDeliveryAddressId,
  } = useShoppingCart();
  const [prescriptionOption, setPrescriptionOption] = useState<string>('specified');
  const [durationDays, setDurationDays] = useState<string>('30');
  const [vdcType, setvdcType] = useState<string>('');
  const medicineDetailOptions = [
    {
      id: 'Need all medicine and for duration as per prescription',
      title: 'All medicines from prescription',
    },
    {
      id: 'search',
      title: 'Search and add medicine(s)',
    },
    {
      id: 'Call me for details',
      title: 'Call me for details',
    },
  ];
  const [selectedMedicineOption, setSelectedMedicineOption] = useState<string>(
    'Need all medicine and for duration as per prescription'
  );
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

  useEffect(() => {
    fetchAddress();
  }, []);

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
    }
  }

  async function checkServicability(address: savePatientAddress_savePatientAddress_patientAddress) {
    if (deliveryAddressId && deliveryAddressId == address.id) {
      return;
    }
    try {
      setLoading?.(true);
      const response = await pinCodeServiceabilityApi247(address.zipcode!);
      const { data } = response;
      console.log('data >>>>>', data);
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
      console.log(error);
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

  async function availabilityTat(pincode: number) {}

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
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

  const renderErrorAlert = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: desc,
      unDismissable: true,
    });

  const renderLabel = (label: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.leftText}>{label}</Text>
      </View>
    );
  };

  const submitReuploadPrescription = (variables: ReUploadPrescriptionVariables) => {
    console.log({ variables });
    setLoading!(true);
    client
      .mutate({
        mutation: RE_UPLOAD_PRESCRIPTION,
        variables,
      })
      .then(({ data }) => {
        console.log({ data });
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
        console.log({ e });
        renderErrorAlert(`Something went wrong, please try later.`);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const onSubmitOrder = async () => {
    const eventAttribute: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_SUBMIT_CLICKED] = {
      OptionSelected:
        selectedMedicineOption === 'search' ? 'Search and add' : selectedMedicineOption,
      NumberOfPrescriptionClicked: numberOfPrescriptionClicked,
      NumberOfPrescriptionUploaded: numberOfPrescriptionUploaded,
      NumberOfEPrescriptions: EPrescriptions.length,
    };
    postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_SUBMIT_CLICKED, eventAttribute);
    CommonLogEvent(
      AppRoutes.UploadPrescription,
      'Graph ql call for save prescription medicine order'
    );
    setLoading!(true);
    try {
      if (selectedMedicineOption === 'search') {
        if (EPrescriptions.length > 0) setEPrescription && setEPrescription([...EPrescriptions]);
        if (PhysicalPrescriptions.length > 0)
          setPhysicalPrescription && setPhysicalPrescription([...PhysicalPrescriptions]);
        props.navigation.navigate(AppRoutes.MedicineSearch, {
          showButton: true,
          isReUpload: isComingFromReUpload,
          orderAutoId: orderId,
        });
        setLoading!(false);
      } else {
        const days = durationDays ? parseInt(durationDays) : null;
        if (isComingFromReUpload) {
          try {
            // Physical Prescription Upload
            const uploadedPhyPrescriptionsData = await uploadMultipleFiles(PhysicalPrescriptions);
            console.log('upload of prescriptions done');

            const uploadedPhyPrescriptions = uploadedPhyPrescriptionsData.length
              ? uploadedPhyPrescriptionsData.map((item) => g(item, 'data', 'uploadDocument'))
              : [];

            const phyPresUrls = uploadedPhyPrescriptions
              .map((item) => item!.filePath)
              .filter((i) => i);
            const phyPresPrismIds = PhysicalPrescriptions.map(
              (item) => item.prismPrescriptionFileId
            ).filter((i) => i);

            const ePresUrls = EPrescriptions.map((item) => item.uploadedUrl).filter((i) => i);
            const ePresPrismIds = EPrescriptions.map((item) => item.prismPrescriptionFileId).filter(
              (i) => i
            );
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
        } else {
          props.navigation.push(AppRoutes.YourCartUploadPrescriptions, {
            prescriptionOptionSelected:
              prescriptionOption === 'duration'
                ? `All medicines as per prescription for ${days} days`
                : selectedMedicineOption,
            // durationDays: prescriptionOption === 'duration' ? `Need all medicine as per prescription for ${durationDays} days` : null,
            durationDays: prescriptionOption === 'duration' ? days : null,
            physicalPrescription: PhysicalPrescriptions,
            ePrescription: EPrescriptions,
          });
          setLoading!(false);
        }
      }
    } catch (error) {
      setLoading!(false);
      CommonBugFender('UploadPrescription_onPressSubmit_try', error);
      renderErrorAlert('Error occurred while uploading physical prescription(s).');
    }
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
      isSelectPrescriptionVisible && (
        <SelectEPrescriptionModal
          displayPrismRecords={true}
          navigation={props.navigation}
          // showConsultPrescriptionsOnly={true} // not showing e-prescriptions for non-cart flow
          onSubmit={(selectedEPres) => {
            setSelectPrescriptionVisible(false);
            if (selectedEPres.length == 0) {
              return;
            }
            setEPrescriptions([...selectedEPres]);
          }}
          isVisible={true}
          selectedEprescriptionIds={EPrescriptions.map((item) => item.id)}
        />
      )
    );
  };

  const renderMedicineDetailOptions = () => {
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
                  const optionSelected =
                    item.id === 'search'
                      ? 'Search and add'
                      : item.id === 'Need all medicine and for duration as per prescription'
                      ? 'All Medicine'
                      : 'Call me for details';
                  const eventAttribute: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_OPTION_SELECTED] = {
                    OptionSelected: optionSelected,
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
                    selectedMedicineOption ==
                      'Need all medicine and for duration as per prescription')
                }
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
  };

  const getRadioButtonAction = () => {
    if (selectedMedicineOption === 'Call me for details') {
      // return (
      //   <View
      //     style={{
      //       backgroundColor: theme.colors.CARD_BG,
      //       padding: 16,
      //       margin: 0,
      //       borderBottomRightRadius: 10,
      //       borderBottomLeftRadius: 10,
      //     }}
      //   >
      //     <Text
      //       style={{
      //         color: theme.colors.LIGHT_BLUE,
      //         ...theme.fonts.IBMPlexSansMedium(13),
      //         textAlign: 'center',
      //       }}
      //     >
      //       Our pharmacist will call you within 2 hours to confirm medicines (8 AM to 8 PM).
      //     </Text>
      //   </View>
      // );
    } else if (
      selectedMedicineOption === 'Need all medicine and for duration as per prescription'
    ) {
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
              setPrescriptionOption('specified');
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
    const isPrescriptions = !(PhysicalPrescriptions.length || EPrescriptions.length);
    if (!showMedicineDescription) {
      return isPrescriptions;
    } else {
      const durationDaysInput =
        selectedMedicineOption &&
        selectedMedicineOption === 'Need all medicine and for duration as per prescription' &&
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
            props.navigation.navigate(AppRoutes.AddAddress, {
              source: 'Upload Prescription' as AddressSource,
            });
            hideAphAlert!();
          }}
          onPressEditAddress={(address) => {
            props.navigation.push(AppRoutes.AddAddress, {
              KeyName: 'Update',
              DataAddress: address,
              ComingFrom: AppRoutes.MedicineCart,
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

  const renderExpectCall = () => {
    return selectedMedicineOption === 'Call me for details' ? <ExpectCall /> : null;
  };

  const renderProceedBar = () => {
    return (
      <ProceedBar
        onPressSelectDeliveryAddress={() => {
          showAddressPopup();
        }}
        onPressAddDeliveryAddress={() => {
          props.navigation.navigate(AppRoutes.AddAddress, {
            source: 'Cart' as AddressSource,
          });
        }}
        vdcType={vdcType}
        onPressPlaceOrder={() => {}}
        onPressChangeAddress={showAddressPopup}
      />
    );
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
        <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 150 }}>
          {renderPhysicalPrescriptions()}
          {renderEPrescriptions()}
          <Text
            style={{
              ...fonts.IBMPlexSansBold(13),
              color: theme.colors.APP_YELLOW,
              lineHeight:
                PhysicalPrescriptions.length === 0 && EPrescriptions.length === 0 ? 44 : 24,
              paddingRight: 24,
              textAlign: 'right',
            }}
            onPress={() => setShowPopop(true)}
          >
            ADD MORE PRESCRIPTIONS
          </Text>
          {showMedicineDescription && renderMedicineDetailOptions()}
          {showMedicineDescription && renderExpectCall()}
        </ScrollView>
      </SafeAreaView>

      {/* <StickyBottomComponent style={{ position: 'relative' }} defaultBG>
        <Button
          disabled={disableSubmitButton()}
          title={'SUBMIT'}
          onPress={onSubmitOrder}
          style={{ marginHorizontal: 60, flex: 1 }}
        />
      </StickyBottomComponent> */}
      {renderProceedBar()}
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
        type={isComingFromReUpload ? undefined : 'nonCartFlow'}
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
            setPhysicalPrescriptions([...PhysicalPrescriptions, ...response]);
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    </View>
  );
};
