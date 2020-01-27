import {
  CameraIcon,
  CrossPopup,
  GalleryIcon,
  PrescriptionIcon,
  Path,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import ImagePicker from 'react-native-image-crop-picker';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Image as PickerImage } from 'react-native-image-crop-picker';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  cardContainer: {
    ...theme.viewStyles.cardViewStyle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    height: 73,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 8,
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
});

export interface AddFilePopupProps {
  onClickClose: () => void;
  getData: (arg0: (PickerImage | PickerImage[])[]) => void;
}
export const AddFilePopup: React.FC<AddFilePopupProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  const onClickTakePhoto = () => {
    CommonLogEvent('ADD_FILE_POP', 'On Click Take Photo');
    ImagePicker.openCamera({
      cropping: false,
      // useFrontCamera: true,
      includeBase64: true,
      compressImageQuality: 0.5,
      compressImageMaxHeight: 4096,
      compressImageMaxWidth: 4096,
      writeTempFile: false,
    })
      .then((image) => {
        props.getData([image]);
      })
      .catch((e: Error) => {
        CommonBugFender('AddFilePopup_onClickTakePhoto', e);
      });
  };

  const onClickGallery = () => {
    CommonLogEvent('ADD_FILE_POP', 'On Click Gallery');
    ImagePicker.openPicker({
      cropping: false,
      multiple: true,
      includeBase64: true,
      compressImageQuality: 0.5,
      compressImageMaxHeight: 4096,
      compressImageMaxWidth: 4096,
      writeTempFile: false,
    })
      .then((image) => {
        props.getData(image as PickerImage[]);
      })
      .catch((e: Error) => {
        CommonBugFender('AddFilePopup_onClickTakePhoto', e);
      });
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
          onPress={() => (CommonLogEvent('ADD_FILE_POP', 'Close the popup'), props.onClickClose())}
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
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.WHITE,
              ...theme.viewStyles.shadowStyle,
            }}
          >
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(16),
                color: theme.colors.LIGHT_BLUE,
              }}
            >
              Add File
            </Text>
          </View>
          <ScrollView bounces={false}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: 16,
                marginHorizontal: 8,
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
                <Text style={styles.yelloTextStyle}>{`CHOOSE FROM GALLERY`}</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginHorizontal: 16,
              }}
            >
              <View style={styles.separatorStyle} />

              <Text style={styles.lableStyle}>Instructions For Uploading Files</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.instructionsStyle}>1.</Text>
                <Text style={[styles.instructionsStyle, { paddingLeft: 16, paddingRight: 16 }]}>
                  Take clear Picture of your entire file.
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.instructionsStyle}>2.</Text>
                <Text style={[styles.instructionsStyle, { paddingLeft: 16, paddingRight: 16 }]}>
                  Doctor details & date of the prescription should be clearly visible.
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.instructionsStyle}>3.</Text>
                <Text style={[styles.instructionsStyle, { paddingLeft: 16, paddingRight: 16 }]}>
                  Use JPG and PNG file format only.
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.instructionsStyle}>4.</Text>
                <Text
                  style={[
                    styles.instructionsStyle,
                    { paddingLeft: 16, paddingBottom: 15, paddingRight: 16 },
                  ]}
                >
                  File should not be of more than 5mb.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      {showSpinner && <Spinner />}
    </View>
  );
};
