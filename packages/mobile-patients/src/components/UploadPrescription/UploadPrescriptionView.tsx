import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { RNCamera as Camera } from 'react-native-camera';
import {
  CameraClickButton,
  PreviousPrescriptionIcon,
  GalleryIconWhite,
  PendingIcon,
  DeleteIconWhite,
  WhiteTickIcon,
  DoctorIcon,
  PrescriptionPad,
  HealthLogo,
  MomAndBaby,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet';
import {
  storagePermissions,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  cameraView: {
    // flex: 1,
    height: height / 2.5,
    marginBottom: 140,
  },
  cameraActionsContainer: {
    alignItems: 'center',
  },
  cameraClickIcon: {
    resizeMode: 'contain',
    height: 80,
    width: 80,
  },
  flexRow: {
    width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    top: -40,
  },
  galleryIcon: {
    resizeMode: 'contain',
    height: 40,
    width: 40,
  },
  iconContainer: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FCB716',
    borderRadius: 30,
    padding: 10,
    width: 60,
    marginBottom: 10,
  },
  messageContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    top: -40,
  },
  samplePrescription: {
    ...theme.viewStyles.text('B', 14, '#FC9916', 1, 29),
    textAlign: 'right',
  },
  messageIcon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
    marginRight: 7,
  },
  cameraActionContainer: {
    flex: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    top: height / 2.1,
  },
  cameraActionButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(52, 52, 52, 0.6)',
  },
  deleteIcon: {
    resizeMode: 'contain',
    width: 35,
    height: 35,
  },
  correctIcon: {
    resizeMode: 'contain',
    width: 40,
    height: 40,
  },
  cameraDisableButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 13,
    borderColor: '#C4C4C4',
    marginTop: 10,
  },
  rowSpaceAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0, 179, 142, 0.25)',
    padding: 10,
    borderRadius: 30,
    marginVertical: 7,
  },
  instructionIcons: {
    resizeMode: 'contain',
    width: 40,
    height: 40,
  },
});

export interface UploadPrescriptionViewProps extends NavigationScreenProps {}

export const UploadPrescriptionView: React.FC<UploadPrescriptionViewProps> = (props) => {
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const _camera = useRef(null);
  let actionSheetRef: ActionSheet;

  const clickPhoto = async () => {
    const options = { quality: 0.5, base64: true, pauseAfterCapture: true };
    const data = await _camera?.current?.takePictureAsync(options);
    setPhotoBase64(data?.base64);
    // console.log(data);
  };

  const removeClickedPhoto = () => {
    setPhotoBase64('');
    _camera?.current?.resumePreview();
  };

  const renderCameraView = () => {
    return (
      <Camera
        style={styles.cameraView}
        ref={_camera}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        captureAudio={false}
      >
        {!!photoBase64 && (
          <View style={styles.cameraActionContainer}>
            <TouchableOpacity
              style={styles.cameraActionButton}
              onPress={() => removeClickedPhoto()}
            >
              <DeleteIconWhite style={styles.deleteIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraActionButton}
              onPress={() => removeClickedPhoto()}
            >
              <WhiteTickIcon style={styles.correctIcon} />
            </TouchableOpacity>
          </View>
        )}
      </Camera>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.cameraActionsContainer}>
        {!!photoBase64 ? (
          <View style={styles.cameraDisableButton} />
        ) : (
          <TouchableOpacity activeOpacity={0.3} onPress={clickPhoto}>
            <CameraClickButton style={styles.cameraClickIcon} />
          </TouchableOpacity>
        )}

        <View style={styles.flexRow}>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.iconContainer}
              activeOpacity={0.3}
              onPress={() => {
                actionSheetRef.show();
              }}
            >
              <GalleryIconWhite style={styles.galleryIcon} />
            </TouchableOpacity>
            <Text style={theme.viewStyles.text('SB', 15, '#979797', 1, 19)}>CHOOSE FROM</Text>
            <Text style={theme.viewStyles.text('SB', 15, '#979797', 1, 19)}>GALLERY</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity style={styles.iconContainer} activeOpacity={0.3} onPress={() => {}}>
              <PreviousPrescriptionIcon style={styles.galleryIcon} />
            </TouchableOpacity>
            <Text style={theme.viewStyles.text('SB', 15, '#979797', 1, 19)}>SELECT FROM</Text>
            <Text style={theme.viewStyles.text('SB', 15, '#979797', 1, 19)}>E-PRESCRIPTIO</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMessage = () => {
    return (
      <View style={styles.messageContainer}>
        <View style={{ flexDirection: 'row' }}>
          <PendingIcon style={styles.messageIcon} />
          <Text style={theme.viewStyles.text('R', 14, '#01475B', 1, 19)}>
            * Our pharmacist will dispense medicines only if the prescription is valid & it meets
            all government regulations.
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            props.navigation.navigate(AppRoutes.SamplePrescription);
          }}
        >
          <Text style={styles.samplePrescription}>VIEW SAMPLE PRESCRIPTION</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderInstructions = () => {
    return (
      <View style={{ padding: 20 }}>
        <Text style={theme.viewStyles.text('R', 14, '#01475B', 1, 17)}>
          Make sure the prescription you upload contains the following elements:
        </Text>
        <View style={styles.rowSpaceAround}>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.instructionsContainer}>
              <DoctorIcon style={styles.instructionIcons} />
            </View>
            <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 17)}>Doctor</Text>
            <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 17)}>Details</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.instructionsContainer}>
              <PrescriptionPad style={styles.instructionIcons} />
            </View>
            <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 17)}>Date of</Text>
            <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 17)}>Prescription</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.instructionsContainer}>
              <MomAndBaby style={styles.instructionIcons} />
            </View>
            <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 17)}>Patient</Text>
            <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 17)}>Details</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.instructionsContainer}>
              <HealthLogo style={styles.instructionIcons} />
            </View>
            <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 17)}>Medicine</Text>
            <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 17)}>Details</Text>
          </View>
        </View>
      </View>
    );
  };

  const options = [
    <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) }}>Photo Library</Text>,
    <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) }}>Upload Pdf</Text>,
    <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) }}>Cancel</Text>,
  ];

  const postUPrescriptionWEGEvent = (
    source: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]['Source']
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED] = {
      Source: source,
      'Upload Source': 'Upload Flow',
    };
    postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED, eventAttributes);
  };

  const getBase64 = (response: DocumentPickerResponse[]): Promise<string>[] => {
    return response.map(async ({ fileCopyUri: uri, name: fileName, type }) => {
      const isPdf = fileName.toLowerCase().endsWith('.pdf'); // TODO: check here if valid image by mime
      uri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      let compressedImageUri = '';
      if (!isPdf) {
        // Image Quality 0-100
        compressedImageUri = (await ImageResizer.createResizedImage(uri, 2096, 2096, 'JPEG', 50))
          .uri;
        compressedImageUri =
          Platform.OS === 'ios' ? compressedImageUri.replace('file://', '') : compressedImageUri;
      }
      return RNFetchBlob.fs.readFile(!isPdf ? compressedImageUri : uri, 'base64');
    });
  };

  const onBrowseClicked = async () => {
    const MAX_FILE_SIZE = 2000000; // 2MB
    postUPrescriptionWEGEvent('Choose Gallery');
    CommonLogEvent('UPLOAD_PRESCRIPTION_POPUP', 'Gallery opened');
    const eventAttributes: WebEngageEvents['Upload Photo'] = {
      Source: 'Gallery',
    };
    postWebEngageEvent('Upload Photo', eventAttributes);
    try {
      // setshowSpinner(true);
      const documents = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.pdf],
        copyTo: 'documentDirectory',
      });
      const isValidPdf = documents.find(({ name }) => name.toLowerCase().endsWith('.pdf'));
      const isValidSize = documents.find(({ size }) => size < MAX_FILE_SIZE);
      if (!isValidPdf || !isValidSize) {
        // setshowSpinner(false);
        Alert.alert(
          strings.common.uhOh,
          !isValidPdf
            ? `Invalid File Type. File type must be PDF.`
            : `Invalid File Size. File size must be less than 2MB.`
        );
        return;
      }
      const base64Array = await Promise.all(getBase64(documents));
      const base64FormattedArray = base64Array.map(
        (base64, index) =>
          ({
            mime: documents[index].type,
            data: base64,
          } as ImageCropPickerResponse)
      );
      // props.onResponse('CAMERA_AND_GALLERY', formatResponse(base64FormattedArray));
      // setshowSpinner(false);
    } catch (e) {
      // setshowSpinner(false);
      if (DocumentPicker.isCancel(e)) {
        CommonBugFender('UploadPrescriprionView_onClickGallery', e);
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={'UPLOAD PRESCRIPTION'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        {!!photoBase64 && renderInstructions()}
        <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {renderCameraView()}
          {renderActionButtons()}
          {renderMessage()}
          <ActionSheet
            ref={(o: ActionSheet) => (actionSheetRef = o)}
            title={''}
            options={options}
            cancelButtonIndex={2}
            onPress={(index: number) => {
              /* do something */
              console.log('index', index);
              if (index === 0) {
                setTimeout(() => {
                  // openGallery();
                }, 100);
              } else if (index === 1) {
                setTimeout(() => {
                  if (Platform.OS === 'android') {
                    storagePermissions(() => {
                      onBrowseClicked();
                    });
                  } else {
                    onBrowseClicked();
                  }
                }, 100);
              }
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
