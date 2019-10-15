import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-navigation';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { theme } from '../../theme/theme';
import { EPrescription, PhysicalPrescription, useShoppingCart } from '../ShoppingCartProvider';
import { EPrescriptionCard } from '../ui/EPrescriptionCard';
import { CrossYellow, FileBig } from '../ui/Icons';
import { TextInputComponent } from '../ui/TextInputComponent';
import { SelectEPrescriptionModal } from './SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from './UploadPrescriprionPopup';

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

export interface MedicineUploadPrescriptionViewProps {}

export const MedicineUploadPrescriptionView: React.FC<MedicineUploadPrescriptionViewProps> = (
  props
) => {
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
  } = useShoppingCart();

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
        disabledOption={'NONE'}
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
          onPress={() => setShowPopup(true)}
        >
          ADD MORE PRESCRIPTIONS
        </Text>
      </View>
    );
  };

  const renderUploadPrescription = () => {
    if (uploadPrescriptionRequired) {
      return (
        <View>
          {renderLabel('UPLOAD PRESCRIPTION')}
          {physicalPrescriptions.length == 0 && ePrescriptions.length == 0 ? (
            <TouchableOpacity
              activeOpacity={1}
              style={{
                ...theme.viewStyles.cardViewStyle,
                marginHorizontal: 20,
                marginTop: 15,
                marginBottom: 24,
              }}
              onPress={() => setShowPopup(true)}
            >
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(16),
                  lineHeight: 24,
                  color: theme.colors.SKY_BLUE,
                  padding: 16,
                }}
              >
                {`Some of your medicines require prescription to make a purchase.\nPlease upload the necessary prescriptions.`}
              </Text>
              <Text
                style={{
                  ...styles.yellowTextStyle,
                  paddingTop: 0,
                  textAlign: 'right',
                }}
              >
                UPLOAD
              </Text>
            </TouchableOpacity>
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
