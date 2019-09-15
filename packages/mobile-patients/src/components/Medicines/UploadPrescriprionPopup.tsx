import {
  EPrescriptionDisableOption,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CameraIcon,
  CrossPopup,
  GalleryIcon,
  Path,
  PrescriptionIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import ImagePicker, { ImagePickerResponse } from 'react-native-image-picker';
import { ScrollView } from 'react-navigation';

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

export interface UploadPrescriprionPopupProps {
  type?: 'cartOrMedicineFlow' | 'nonCartFlow';
  isVisible: boolean;
  disabledOption: EPrescriptionDisableOption;
  optionTexts: {
    camera: string;
    gallery: string;
    prescription: string;
  };
  onClickClose: () => void;
  onResponse: (
    selectedType: EPrescriptionDisableOption,
    response: (PhysicalPrescription)[]
  ) => void;
}

export const UploadPrescriprionPopup: React.FC<UploadPrescriprionPopupProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  const formatResponse = (response: ImagePickerResponse) => {
    const imageUri = response!.uri || response!.path || 'folder/img.jpg';
    const random8DigitNumber = Math.floor(Math.random() * 90000) + 20000000;
    return response.data
      ? [
          {
            base64: response.data,
            fileType: imageUri.substring(imageUri.lastIndexOf('.') + 1),
            title: `IMG_${random8DigitNumber}`,
          } as PhysicalPrescription,
        ]
      : [];
  };

  const onClickTakePhoto = () => {
    setshowSpinner(true);
    ImagePicker.launchCamera(
      {
        quality: 0.2,
      },
      (response) => {
        setshowSpinner(false);
        props.onResponse('CAMERA_AND_GALLERY', formatResponse(response));
      }
    );
  };

  const onClickGallery = () => {
    setshowSpinner(true);
    ImagePicker.launchImageLibrary(
      {
        quality: 0.2,
      },
      (response) => {
        setshowSpinner(false);
        props.onResponse('CAMERA_AND_GALLERY', formatResponse(response));
      }
    );
  };

  const isOptionDisabled = (type: EPrescriptionDisableOption) => props.disabledOption == type;
  const getOptionStyle = (type: EPrescriptionDisableOption): StyleProp<ViewStyle> => {
    return props.disabledOption == type
      ? {
          backgroundColor: '#f0f1ec',
        }
      : {};
  };

  const renderSimpleStepsOrder = () => {
    return (
      <View
        style={{
          height: 101,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: theme.colors.SKY_BLUE,
        }}
      >
        <Text
          style={{
            paddingTop: 13,
            paddingBottom: 12,
            color: theme.colors.WHITE,
            ...theme.fonts.IBMPlexSansMedium(14),
          }}
        >
          Order medicines in 2 simple steps —
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View style={styles.cardViewStyle}>
            <Text style={styles.cardTextStyle}>{`UPLOAD\nYOUR PRESCRIPTION`}</Text>
          </View>
          <View
            style={{
              // alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Path />
          </View>
          <View style={styles.cardViewStyle}>
            <Text style={styles.cardTextStyle}>ORDER THROUGH OUR CUSTOMER CARE</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Overlay
      isVisible={props.isVisible}
      windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
      containerStyle={{ alignSelf: 'flex-start' }}
      overlayStyle={{
        padding: 0,
        margin: 0,
        width: '88.88%',
        height: 'auto',
        // maxHeight: '75%',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            alignSelf: 'flex-end',
            backgroundColor: 'transparent',
            // marginTop: -42,
          }}
        >
          <TouchableOpacity onPress={() => props.onClickClose()}>
            <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: 'transparent',
            height: 16,
          }}
        />

        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        >
          <View
            style={{
              ...theme.viewStyles.cardContainer,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              backgroundColor: theme.colors.WHITE,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 23,
              width: '100%',
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
            {props.type == 'nonCartFlow' && renderSimpleStepsOrder()}
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
                disabled={isOptionDisabled('CAMERA_AND_GALLERY')}
                activeOpacity={1}
                style={[styles.cardContainer, getOptionStyle('CAMERA_AND_GALLERY')]}
                onPress={onClickTakePhoto}
              >
                <CameraIcon />
                <Text style={styles.yelloTextStyle}>{props.optionTexts.camera}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isOptionDisabled('CAMERA_AND_GALLERY')}
                activeOpacity={1}
                style={[styles.cardContainer, getOptionStyle('CAMERA_AND_GALLERY')]}
                onPress={onClickGallery}
              >
                <GalleryIcon />
                <Text style={styles.yelloTextStyle}>{props.optionTexts.gallery}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isOptionDisabled('E-PRESCRIPTION')}
                activeOpacity={1}
                style={[styles.cardContainer, getOptionStyle('E-PRESCRIPTION')]}
                onPress={() => {
                  props.onResponse('E-PRESCRIPTION', []);
                }}
              >
                <PrescriptionIcon />
                <Text style={styles.yelloTextStyle}>{props.optionTexts.prescription}</Text>
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
        {showSpinner && <Spinner />}
      </View>
    </Overlay>
  );
};
