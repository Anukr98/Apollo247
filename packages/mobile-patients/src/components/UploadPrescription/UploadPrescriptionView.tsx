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
  Image,
  BackHandler,
  ScrollView,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
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
  PhrCameraIcon,
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
import {
  PhysicalPrescription,
  useShoppingCart,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import Permissions from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  cameraView: {
    height: height / 2.5,
  },
  cameraActionsContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : height / 4.3,
  },
  cameraClickIcon: {
    resizeMode: 'contain',
    height: 65,
    width: 65,
  },
  flexRow: {
    width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    top: -40,
    marginLeft: 10,
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
    marginTop: -70,
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
  permissionContainer: {
    height: height / 1.7,
    backgroundColor: '#000000',
  },
  permissionBox: {
    width: width / 1.4,
    backgroundColor: '#01475B',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cameraIcon: {
    resizeMode: 'contain',
    width: 22,
    height: 22,
    marginTop: 5,
    marginRight: 5,
  },
  cameraText: {
    ...theme.viewStyles.text('M', 17, '#FFFFFF', 1, 29),
    paddingBottom: 5,
  },
  cameraSubText: {
    ...theme.viewStyles.text('R', 14, '#FFFFFF', 1, 16),
    textAlign: 'center',
  },
  previewImageContainer: {
    borderWidth: 3,
    borderColor: theme.colors.WHITE,
    width: width - 50,
    height: height / 1.7,
    alignSelf: 'center',
    backgroundColor: 'black',
    marginTop: 5,
  },
  previewImage: {
    marginTop: 10,
    resizeMode: 'contain',
    height: height / 1.8,
  },
});

export interface UploadPrescriptionViewProps extends NavigationScreenProps {
  phyPrescriptionUploaded: PhysicalPrescription[];
  ePresscriptionUploaded: EPrescription[];
}

const MAX_FILE_SIZE = 2000000; // 2MB

export const UploadPrescriptionView: React.FC<UploadPrescriptionViewProps> = (props) => {
  const phyPrescriptionUploaded = props.navigation.getParam('phyPrescriptionUploaded') || [];
  const ePresscriptionUploaded = props.navigation.getParam('ePresscriptionUploaded') || [];
  const { ePrescriptions } = useShoppingCart();
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState<boolean>(false);
  const [imageClickData, setImageClickData] = useState<any>({});
  const [isCameraAccessGranted, setIsCameraAccessGranted] = useState<boolean>(true);
  let _camera = useRef(null);
  let actionSheetRef: ActionSheet;

  const handleBack = () => {
    props.navigation.goBack();
    return true;
  };

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setIsFocused(true);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setIsFocused(false);
    });
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const clickPhoto = async () => {
    try {
      CommonLogEvent('Inside UploadPrescriprionView clickPhoto function.');
      const options = { quality: 0.5, base64: true, pauseAfterCapture: true };
      const data = await _camera?.current?.takePictureAsync(options);
      const clickedPhotoResponse = formatResponse([data], true);
      setImageClickData(clickedPhotoResponse);
      setPhotoBase64(data?.base64);
    } catch (error) {
      CommonBugFender('UploadPrescriprionView_clickPhoto', error);
    }
  };

  const removeClickedPhoto = () => {
    setPhotoBase64('');
    _camera?.current?.resumePreview();
  };

  const renderPermissionContainer = () => (
    <View style={styles.permissionContainer}>
      <TouchableOpacity
        style={{ marginTop: height / 4 }}
        onPress={() => {
          Permissions.request('camera')
            .then((message) => {
              _camera?.current?.refreshAuthorizationStatus();
              if (message === 'authorized') {
                setIsCameraAccessGranted(true);
              } else if (message === 'denied' || message === 'restricted') {
                setIsCameraAccessGranted(false);
              }
            })
            .catch((e) => {});
        }}
      >
        <View style={styles.permissionBox}>
          <View style={styles.rowCenter}>
            <PhrCameraIcon style={styles.cameraIcon} />
            <Text style={styles.cameraText}>Allow Camera Access</Text>
          </View>
          <Text style={styles.cameraSubText}>
            Allow Apollo 247 access to your camera to take photos of your prescription
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderCameraActions = () => {
    return (
      !!photoBase64 && (
        <View style={styles.cameraActionContainer}>
          <TouchableOpacity style={styles.cameraActionButton} onPress={() => removeClickedPhoto()}>
            <DeleteIconWhite style={styles.deleteIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraActionButton}
            onPress={() => {
              removeClickedPhoto();
              props.navigation.navigate(AppRoutes.UploadPrescription, {
                type: 'Camera',
                phyPrescriptionsProp: [...phyPrescriptionUploaded, ...imageClickData],
                ePrescriptionsProp: ePresscriptionUploaded,
                source: 'UploadPrescription',
              });
            }}
          >
            <WhiteTickIcon style={styles.correctIcon} />
          </TouchableOpacity>
        </View>
      )
    );
  };

  const renderPreviewImage = () => {
    const imgBase64 = `data:image/jpeg;base64,${photoBase64}`;
    return (
      !!photoBase64 && (
        <View style={styles.previewImageContainer}>
          <Image source={{ uri: imgBase64 }} style={styles.previewImage} />
          {renderCameraActions()}
        </View>
      )
    );
  };

  const renderCameraView = () => {
    return isFocused && !photoBase64 ? (
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
        {({ camera, status, recordAudioPermissionStatus }) => {
          setIsCameraAccessGranted(status === 'READY');
          if (status !== 'READY') {
            return renderPermissionContainer();
          }
        }}
      </Camera>
    ) : (
      renderPreviewImage()
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.cameraActionsContainer}>
        {!!photoBase64 ? (
          <View style={styles.cameraDisableButton} />
        ) : (
          <TouchableOpacity
            disabled={!isCameraAccessGranted}
            activeOpacity={0.3}
            onPress={clickPhoto}
          >
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
            <TouchableOpacity
              style={styles.iconContainer}
              activeOpacity={0.3}
              onPress={() => {
                setSelectPrescriptionVisible(true);
              }}
            >
              <PreviousPrescriptionIcon style={styles.galleryIcon} />
            </TouchableOpacity>
            <Text style={theme.viewStyles.text('SB', 15, '#979797', 1, 19)}>SELECT FROM</Text>
            <Text style={theme.viewStyles.text('SB', 15, '#979797', 1, 19)}>MY PRESCRIPTIONS</Text>
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
          <Text
            style={{
              ...theme.viewStyles.text('R', 14, '#01475B', 1, 19),
              marginRight: 20,
            }}
          >
            * Our pharmacist will dispense medicines only if the prescription is valid and it meets
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
      uri = Platform.OS === 'ios' ? decodeURI(uri.replace('file://', '')) : uri;
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
    postUPrescriptionWEGEvent('Choose Gallery');
    CommonLogEvent('UPLOAD_PRESCRIPTION_POPUP', 'Gallery opened');
    const eventAttributes: WebEngageEvents['Upload Photo'] = {
      Source: 'Gallery',
    };
    postWebEngageEvent('Upload Photo', eventAttributes);
    try {
      setShowSpinner(true);
      const documents = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.pdf],
        copyTo: 'documentDirectory',
      });
      const isValidPdf = documents.find(({ name }) => name.toLowerCase().endsWith('.pdf'));
      const isValidSize = documents.find(({ size }) => size < MAX_FILE_SIZE);
      if (!isValidPdf || !isValidSize) {
        setShowSpinner(false);
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
      const documentData = base64Array.map(
        (base64, index) =>
          ({
            title: documents[index].name,
            fileType: documents[index].type,
            base64: base64,
          } as PhysicalPrescription)
      );
      setShowSpinner(false);
      props.navigation.navigate(AppRoutes.UploadPrescription, {
        type: 'Gallery',
        phyPrescriptionsProp: [...phyPrescriptionUploaded, ...documentData],
        ePrescriptionsProp: ePresscriptionUploaded,
        source: 'UploadPrescription',
      });
    } catch (e) {
      setShowSpinner(false);
      if (DocumentPicker.isCancel(e)) {
        CommonBugFender('UploadPrescriprionView_onClickGallery', e);
      }
    }
  };

  const openGallery = () => {
    postUPrescriptionWEGEvent('Choose Gallery');
    CommonLogEvent('UPLAOD_PRESCRIPTION_POPUP', 'Gallery opened');

    const eventAttributes: WebEngageEvents['Upload Photo'] = {
      Source: 'Gallery',
    };
    postWebEngageEvent('Upload Photo', eventAttributes);

    setShowSpinner(true);
    ImagePicker.openPicker({
      cropping: true,
      hideBottomControls: true,
      includeBase64: true,
      multiple: true,
      compressImageQuality: 0.5,
      compressImageMaxHeight: 2096,
      compressImageMaxWidth: 2096,
      writeTempFile: false,
      freeStyleCropEnabled: false,
    })
      .then((response) => {
        const images = response as ImageCropPickerResponse[];
        const isGreaterThanSpecifiedSize = images.find(({ size }) => size > MAX_FILE_SIZE);
        setShowSpinner(false);
        if (isGreaterThanSpecifiedSize) {
          Alert.alert(strings.common.uhOh, `Invalid File Size. File size must be less than 2MB.`);
          return;
        }
        const uploadedImages = formatResponse(images);
        props.navigation.navigate(AppRoutes.UploadPrescription, {
          type: 'Gallery',
          phyPrescriptionsProp: [...phyPrescriptionUploaded, ...uploadedImages],
          ePrescriptionsProp: ePresscriptionUploaded,
          source: 'UploadPrescription',
        });
      })
      .catch((e: Error) => {
        CommonBugFender('UploadPrescriprionPopup_onClickGallery', e);
        setShowSpinner(false);
      });
  };

  const formatResponse = (response: ImageCropPickerResponse[], isCameraImage?: boolean) => {
    if (response.length == 0) return [];

    return response.map((item) => {
      const isPdf = item?.mime == 'application/pdf';
      const fileUri = item?.path || `folder/file.jpg`;
      const random8DigitNumber = Math.floor(Math.random() * 90000) + 20000000;
      const fileType = isPdf ? 'pdf' : fileUri.substring(fileUri.lastIndexOf('.') + 1);

      return {
        base64: !!isCameraImage ? item?.base64 : item?.data,
        fileType: fileType,
        title: `${isPdf ? 'PDF' : 'IMG'}_${random8DigitNumber}`,
      } as PhysicalPrescription;
    });
  };

  const renderPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        navigation={props.navigation}
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          props.navigation.navigate(AppRoutes.UploadPrescription, {
            type: 'E-Prescription',
            ePrescriptionsProp: [...ePresscriptionUploaded, ...selectedEPres],
            phyPrescriptionsProp: phyPrescriptionUploaded,
            source: 'UploadPrescription',
          });
        }}
        selectedEprescriptionIds={ePrescriptions.map((item) => item.id)}
        isVisible={isSelectPrescriptionVisible}
      />
    );
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
          {!isSelectPrescriptionVisible && isFocused && renderCameraView()}
          {renderActionButtons()}
          {renderMessage()}
          {isSelectPrescriptionVisible && renderPrescriptionModal()}
          <ActionSheet
            ref={(o: ActionSheet) => (actionSheetRef = o)}
            title={''}
            options={options}
            cancelButtonIndex={2}
            onPress={(index: number) => {
              if (index === 0) {
                setTimeout(() => {
                  openGallery();
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
        {showSpinner && <Spinner />}
      </SafeAreaView>
    </View>
  );
};
