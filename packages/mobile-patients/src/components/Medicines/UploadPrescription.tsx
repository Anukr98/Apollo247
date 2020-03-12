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
import { CrossYellow, FileBig } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_PRESCRIPTION_MEDICINE_ORDER,
  UPLOAD_DOCUMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  MEDICINE_DELIVERY_TYPE,
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { SavePrescriptionMedicineOrderVariables } from '@aph/mobile-patients/src/graphql/types/SavePrescriptionMedicineOrder';
import {
  g,
  postWebEngageEvent,
  formatAddress,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { uploadDocument, uploadDocumentVariables } from '../../graphql/types/uploadDocument';
import { StorePickupOrAddressSelectionView } from './StorePickupOrAddressSelectionView';
import { WebEngageEvents } from '@aph/mobile-patients/src/helpers/webEngageEvents';

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
  deliveryPinCodeContaner: {
    ...theme.viewStyles.cardContainer,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS == 'ios' ? 12 : 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f8f5',
  },
  pinCodeStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    flex: 0.9,
  },
  pinCodeTextInput: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    paddingBottom: 3,
    paddingLeft: Platform.OS === 'ios' ? 0 : -3,
    paddingTop: 0,
    width: Platform.OS === 'ios' ? 51 : 54,
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
  const { setLoading, showAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { deliveryAddressId, storeId, pinCode, addresses } = useShoppingCart();

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
    const deliveryAddress = addresses.find((item) => item.zipcode == pinCode);
    const deliveryAddressLine = (deliveryAddress && formatAddress(deliveryAddress)) || '';
    const eventAttributes: WebEngageEvents['Submit Prescription'] = {
      'Order ID': `${orderId}`,
      'Delivery type': deliveryAddressId ? 'home' : 'store pickup',
      StoreId: storeId, // incase of store delivery
      'Delivery address': deliveryAddressLine,
      Pincode: pinCode,
    };
    postWebEngageEvent('Submit Prescription', eventAttributes);
  };

  const submitPrescriptionMedicineOrder = (variables: SavePrescriptionMedicineOrderVariables) => {
    client
      .mutate({
        mutation: SAVE_PRESCRIPTION_MEDICINE_ORDER,
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

  const onPressSubmit = async () => {
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

      const prescriptionMedicineInput: SavePrescriptionMedicineOrderVariables = {
        prescriptionMedicineInput: {
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
        },
      };
      console.log({ prescriptionMedicineInput });
      console.log(JSON.stringify(prescriptionMedicineInput));
      submitPrescriptionMedicineOrder(prescriptionMedicineInput);
    } catch (error) {
      console.log({ error });
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
        'Your prescriptions have been submitted successfully. We will notify you when the items are in your cart.\n\n\nIf we need any clarificaitons, we will call you within 1 hour.',
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

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={'UPLOAD PRESCRIPTION'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} style={{ flex: 1 }}>
          {renderPhysicalPrescriptions()}
          {renderEPrescriptions()}
          {/* {!![...PhysicalPrescriptions, ...EPrescriptions].length && ( */}
          <View style={{ marginTop: 20 }}>{renderLabel('Where should we deliver?')}</View>
          <StorePickupOrAddressSelectionView navigation={props.navigation} />
          {/* )} */}
        </ScrollView>
      </SafeAreaView>
      <Text
        style={{
          ...fonts.IBMPlexSansBold(13),
          color: theme.colors.APP_YELLOW,
          lineHeight: 24,
          paddingBottom: 4,
          marginBottom: 16,
          paddingRight: 24,
          paddingTop: 16,
          textAlign: 'right',
        }}
        onPress={() => setShowPopop(true)}
      >
        ADD MORE PRESCRIPTIONS
      </Text>
      <StickyBottomComponent style={{ position: 'relative' }} defaultBG>
        <Button
          disabled={
            !(PhysicalPrescriptions.length || EPrescriptions.length) ||
            !(storeId || deliveryAddressId)
          }
          title={'SUBMIT PRESCRIPTION'}
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
