import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView, NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  EPrescription,
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { EPrescriptionCard } from '@aph/mobile-patients/src/components/ui/EPrescriptionCard';
import { CrossYellow, FileBig } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';

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
    padding: 16,
  },
});

export interface MedicineUploadPrescriptionViewProps extends NavigationScreenProps {
  isTest?: boolean;
}
{
}

export const MedicineUploadPrescriptionView: React.FC<MedicineUploadPrescriptionViewProps> = (
  props
) => {
  const { isTest } = props;
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { currentPatient } = useAllCurrentPatients();
  // const currentPatientId = currentPatient && currentPatient!.id;

  const {
    uploadPrescriptionRequired,
    setPhysicalPrescriptions,
    physicalPrescriptions,
    removePhysicalPrescription,
    ePrescriptions,
    setEPrescriptions,
    removeEPrescription,
  } = isTest ? useDiagnosticsCart() : useShoppingCart();

  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };

  const updatePhysicalPrescriptions = (uplPhyPrescriptions: PhysicalPrescription[]) => {
    const itemsToAdd = uplPhyPrescriptions.filter(
      (p) => !physicalPrescriptions.find((pToFind) => pToFind.base64 == p.base64)
    );
    setPhysicalPrescriptions && setPhysicalPrescriptions([...itemsToAdd, ...physicalPrescriptions]);
  };

  const uploadPrescriptionPopup = () => {
    return (
      <UploadPrescriprionPopup
        isVisible={showPopup}
        hideTAndCs={isTest}
        disabledOption={'NONE'}
        heading={'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'UPLOAD FROM\nGALLERY',
          prescription: 'UPLOAD FROM\nRECORDS',
        }}
        onClickClose={() => setShowPopup(false)}
        onResponse={(selectedType, response) => {
          setShowPopup(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            updatePhysicalPrescriptions(response);
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    );
  };

  const renderPhysicalPrescriptionRow = (
    item: PhysicalPrescription,
    i: number,
    arrayLength: number
  ) => {
    return (
      <View key={i} style={{}}>
        <TouchableOpacity activeOpacity={1} key={i} onPress={() => {}}>
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
                CommonLogEvent('MEDICINE_UPLOAD_PRESCRIPTION', `removePhysicalPrescription`);
                removePhysicalPrescription && removePhysicalPrescription(item.title);
              }}
            >
              <CrossYellow />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        navigation={props.navigation}
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          setEPrescriptions && setEPrescriptions([...selectedEPres]);
        }}
        selectedEprescriptionIds={ePrescriptions.map((item) => item.id)}
        isVisible={isSelectPrescriptionVisible}
      />
    );
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
          removeEPrescription && removeEPrescription(item.id);
        }}
      />
    );
  };

  const rendePrescriptions = (
    _prescriptions = physicalPrescriptions,
    _ePrescriptions = ePrescriptions
  ) => {
    const cardContainerStyle = {
      ...theme.viewStyles.cardViewStyle,
      marginHorizontal: 20,
      marginVertical: 16,
      marginBottom: 24,
      paddingTop: 16,
    };
    return (
      <View>
        <View style={cardContainerStyle}>
          {_prescriptions.length > 0 && (
            <View>
              {renderLabel(`Physical Prescription${_prescriptions.length == 1 ? '' : 's'}`)}
              <ScrollView>
                {_prescriptions.map((item, index, array) => {
                  return renderPhysicalPrescriptionRow(item, index, array.length);
                })}
              </ScrollView>
            </View>
          )}
          {_ePrescriptions.length > 0 && (
            <View>
              {renderLabel(
                `Prescription${_ePrescriptions.length == 1 ? '' : 's'} From Health Records`
              )}
              <ScrollView>
                {_ePrescriptions.map((item, index, array) => {
                  return renderEPrescriptionRow(item, index, array.length);
                })}
              </ScrollView>
            </View>
          )}
        </View>
        <Text
          style={{
            ...theme.fonts.IBMPlexSansBold(13),
            color: theme.colors.APP_YELLOW,
            lineHeight: 24,
            paddingRight: 24,
            paddingBottom: 16,
            textAlign: 'right',
          }}
          onPress={() => {
            if (!isTest) {
              // since this component being used in two places hence condition isTest
              const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED] = {
                Source: 'Cart',
              };
              postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED, eventAttributes);
            }
            setShowPopup(true);
          }}
        >
          ADD MORE PRESCRIPTIONS
        </Text>
      </View>
    );
  };

  const consultDoctorCTA = () => {
    return (
      <View style={{ marginHorizontal: 16, paddingBottom: 16 }}>
        <Spearator style={{ marginBottom: 11.5 }} />
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, '#02475b', 1, 20, 0.04),
            paddingBottom: 8,
          }}
        >
          Don’t have a prescription? Don’t worry!
        </Text>
        <Text
          onPress={() => {
            CommonLogEvent('MEDICINE_UPLOAD_PRESCRIPTION', 'Navigate to doctor search');
            props.navigation.navigate(AppRoutes.DoctorSearch);
          }}
          style={{
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24, 0),
          }}
        >
          CONSULT A DOCTOR
        </Text>
      </View>
    );
  };

  const renderUploadPrescription = () => {
    if (uploadPrescriptionRequired || isTest) {
      return (
        <View>
          {renderLabel(isTest ? 'UPLOAD PRESCRIPTION (OPTIONAL)' : 'UPLOAD PRESCRIPTION')}
          {physicalPrescriptions.length == 0 && ePrescriptions.length == 0 ? (
            <View
              style={{
                ...theme.viewStyles.cardViewStyle,
                marginHorizontal: 20,
                marginTop: 15,
                marginBottom: 24,
              }}
            >
              <TouchableOpacity activeOpacity={1} style={{}} onPress={() => setShowPopup(true)}>
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(16),
                    lineHeight: 24,
                    color: theme.colors.SKY_BLUE,
                    padding: 16,
                  }}
                >
                  {isTest
                    ? `Prescriptions help the pathologists to understand the requirements better. If you have a prescription, you can upload them.`
                    : `Items in your cart marked with ‘Rx’ need prescriptions to complete your purchase. Please upload the necessary prescriptions`}
                </Text>
                <Text
                  style={{
                    ...styles.yellowTextStyle,
                    paddingTop: 0,
                    // textAlign: 'right',
                  }}
                >
                  UPLOAD PRESCRIPTION
                </Text>
              </TouchableOpacity>
              {!isTest && consultDoctorCTA()}
            </View>
          ) : (
            rendePrescriptions()
          )}
        </View>
      );
    }
  };

  return (
    <>
      {renderUploadPrescription()}
      {renderPrescriptionModal()}
      {uploadPrescriptionPopup()}
    </>
  );
};
