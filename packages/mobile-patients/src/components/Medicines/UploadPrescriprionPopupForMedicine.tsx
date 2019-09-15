import {
  CameraIcon,
  CrossPopup,
  GalleryIcon,
  PrescriptionIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImagePicker, { ImagePickerResponse } from 'react-native-image-picker';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords } from '../../graphql/types/getPatientMedicalRecords';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  cardContainer: {
    ...theme.viewStyles.cardViewStyle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    height: 86,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 3,
  },
  yelloTextStyle: {
    ...theme.fonts.IBMPlexSansBold(10),
    color: theme.colors.APP_YELLOW,
    paddingTop: 12,
    textAlign: 'center',
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  lableStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
    letterSpacing: 0.35,
    paddingTop: 16,
    paddingBottom: 8,
  },
  instructionsStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
    lineHeight: 20,
    letterSpacing: 0.35,
  },
  cardViewStyle: {
    width: 136,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 71, 91, 0.2)',
    borderRadius: 5,
  },
  cardTextStyle: {
    padding: 8,
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansSemiBold(10),
    textAlign: 'center',
  },
});

export interface UploadPrescriprionPopupForMedicineProps extends NavigationScreenProps {
  onClickClose: () => void;
  onResponse: (
    selectedType: 'cameraOrGallery' | 'e-prescriptions',
    response: (
      | ImagePickerResponse
      | getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords)[]
  ) => void;
}
export const UploadPrescriprionPopupForMedicine: React.FC<
  UploadPrescriprionPopupForMedicineProps
> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  const onClickTakePhoto = () => {
    console.log('onClickTakePhoto');
    setshowSpinner(true);
    ImagePicker.launchCamera(
      {
        quality: 0.2,
      },
      (response) => {
        setshowSpinner(false);
        const responseToReturn = response.data ? [response] : [];
        props.onResponse('cameraOrGallery', responseToReturn);
      }
    );
  };

  const onClickGallery = () => {
    console.log('onClickGallery');
    setshowSpinner(true);
    ImagePicker.launchImageLibrary(
      {
        quality: 0.2,
      },
      (response) => {
        setshowSpinner(false);
        const responseToReturn = response.data ? [response] : [];
        props.onResponse('cameraOrGallery', responseToReturn);
      }
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        paddingHorizontal: showSpinner ? 0 : 20,
        zIndex: 15,
        elevation: 15,
      }}
    >
      <View
        style={{
          // backgroundColor: 'white',
          alignItems: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.onClickClose()}
          style={{
            marginTop: Platform.OS === 'ios' ? 38 : 14,
            backgroundColor: 'white',
            height: 28,
            width: 28,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            marginRight: showSpinner ? 20 : 0,
          }}
        >
          <CrossPopup />
        </TouchableOpacity>
      </View>
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            marginTop: 16,
            width: width - 40,
            height: 'auto',
            maxHeight: height - 98,
            padding: 0,
            // margin: 0,
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              ...theme.viewStyles.cardContainer,
              backgroundColor: theme.colors.WHITE,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 23,
            }}
          >
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(16),
                color: theme.colors.LIGHT_BLUE,
              }}
            >
              Upload Prescription(s)
            </Text>
          </View>
          <ScrollView bounces={false}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: 20,
                marginHorizontal: 13,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={styles.cardContainer}
                onPress={onClickTakePhoto}
              >
                <CameraIcon />
                <Text style={styles.yelloTextStyle}>TAKE A PHOTO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={1}
                style={styles.cardContainer}
                onPress={onClickGallery}
              >
                <GalleryIcon />
                <Text style={styles.yelloTextStyle}>{`UPLOAD FROM\nGALLERY`}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.cardContainer}
                onPress={() => {
                  props.onResponse('e-prescriptions', []);
                  // props.navigation.navigate(AppRoutes.UploadPrescription);
                }}
              >
                <PrescriptionIcon />
                <Text style={styles.yelloTextStyle}>{`UPLOAD FROM\nRECORDS`}</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginHorizontal: 16,
              }}
            >
              <View style={styles.separatorStyle} />

              <Text style={styles.lableStyle}>Instructions For Uploading Prescriptions</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.instructionsStyle}>1.</Text>
                <Text style={[styles.instructionsStyle, { paddingLeft: 16 }]}>
                  Take clear Picture of your entire prescription.
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.instructionsStyle}>2.</Text>
                <Text style={[styles.instructionsStyle, { paddingLeft: 16 }]}>
                  Doctor details & date of the prescription should be clearly visible.
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.instructionsStyle}>3.</Text>
                <Text style={[styles.instructionsStyle, { paddingLeft: 16, paddingBottom: 15 }]}>
                  Medicines will be dispensed as per prescription.
                </Text>
              </View>
              <View style={styles.separatorStyle} />

              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: theme.colors.TEXT_LIGHT_BLUE,
                  paddingTop: 8,
                  paddingBottom: 16,
                  // paddingHorizontal: 20,
                }}
              >
                * Our pharmacist will dispense medicines only if the prescription is valid & it
                meets all government regulations.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
      {showSpinner && <Spinner />}
    </View>
  );
};
