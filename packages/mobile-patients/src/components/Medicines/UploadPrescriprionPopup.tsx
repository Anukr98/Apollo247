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
  PhrCloseIcon,
  PhrFileIcon,
  PhrGalleryIcon,
  PhrCameraIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  postCleverTapEvent,
  postWebEngageEvent,
  storagePermissions,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, {
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import { Overlay, ListItem } from 'react-native-elements';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import { ScrollView } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import {
  useAppCommonData,
  UploadPrescSource,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { postCleverTapUploadPrescriptionEvents } from '@aph/mobile-patients/src/components/UploadPrescription/Events';

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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 71, 91, 0.2)',
    borderRadius: 5,
  },
  cardTextStyle: {
    padding: 8,
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansSemiBold(9),
    textAlign: 'center',
  },
  listItemContainerStyle: {
    paddingLeft: 3,
    paddingRight: 10,
    paddingTop: 25,
    backgroundColor: '#F7F8F5',
  },
  contentContainerStyle: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  overlayContainerStyle: {
    marginBottom: 20,
  },
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '88.88%',
    height: '88.88%',
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
  },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  phrUploadOptionsViewStyle: {
    backgroundColor: '#F7F8F5',
    paddingHorizontal: 29,
    borderRadius: 10,
    paddingVertical: 34,
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: 'transparent',
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export interface UploadPrescriprionPopupProps {
  type: UploadPrescSource;
  isVisible: boolean;
  disabledOption?: EPrescriptionDisableOption;
  heading: string;
  optionTexts: {
    camera?: string;
    gallery?: string;
    prescription?: string;
  };
  blockCamera?: boolean;
  blockCameraMessage?: string;
  instructionHeading?: string;
  instructions?: string[];
  hideTAndCs?: boolean;
  onClickClose: () => void;
  onResponse: (
    selectedType: EPrescriptionDisableOption,
    response: PhysicalPrescription[],
    type?: 'Camera' | 'Gallery'
  ) => void;
  isProfileImage?: boolean;
  uploadImage?: boolean;
  phrUpload?: boolean;
  openCamera?: boolean;
  isActionSheetOutOfOverlay?: boolean;
}
export interface UploadPrescriprionPopupRefProps {
  onPressCamera: () => void;
  onPressGallery: () => void;
}

const MAX_FILE_SIZE = 25000000; // ~25MB

export const UploadPrescriprionPopup: ForwardRefExoticComponent<PropsWithoutRef<
  UploadPrescriprionPopupProps
> &
  RefAttributes<UploadPrescriprionPopupRefProps>> = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    // To expose these functions to parent components through ref
    onPressCamera() {
      onClickTakePhoto();
    },
    onPressGallery() {
      onClickGallery();
    },
  }));

  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const { pharmacyUserType } = useAppCommonData();
  const actionSheetRef = useRef<ActionSheet>();

  const postUPrescriptionWEGEvent = (
    source:
      | WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]['Source']
      | CleverTapEvents[CleverTapEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]['Source']
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED] = {
      Source: source,
      User_Type: pharmacyUserType,
      'Upload Source': props.type,
    };
    postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED, eventAttributes);
  };

  const postCleverTapUPrescriptionEvents = (
    source: CleverTapEvents[CleverTapEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]['Source']
  ) => {
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED] = {
      Source: source,
      'User Type': pharmacyUserType || undefined,
      Location: props.type == 'Non-cart' ? 'Noncart' : props.type,
    };
    postCleverTapEvent(
      CleverTapEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED,
      cleverTapEventAttributes
    );
    if (props.type == 'cartOrMedicineFlow') {
      postCleverTapUploadPrescriptionEvents('Gallery', 'Cart');
    }
  };

  useEffect(() => {
    if (props.openCamera) {
      onClickTakePhoto();
    }
  }, [props.openCamera]);

  const formatResponse = (response: ImageCropPickerResponse[]) => {
    if (props.isProfileImage) {
      const res = response[0] || response;
      const isPdf = res.mime == 'application/pdf';
      const fileUri = res!.path || `folder/file.jpg`;
      const random8DigitNumber = Math.floor(Math.random() * 90000) + 20000000;
      const fileType = isPdf ? 'pdf' : fileUri.substring(fileUri.lastIndexOf('.') + 1);
      const returnValue = [
        {
          base64: res.data,
          fileType: fileType,
          title: `${isPdf ? 'PDF' : 'IMG'}_${random8DigitNumber}`,
        } as PhysicalPrescription,
      ];
      return returnValue as PhysicalPrescription[];
    }
    if (response.length == 0) return [];

    return response.map((item) => {
      const isPdf = item.mime == 'application/pdf';
      const fileUri = item!.path || `folder/file.jpg`;
      const random8DigitNumber = Math.floor(Math.random() * 90000) + 20000000;
      const fileType = isPdf ? 'pdf' : fileUri.substring(fileUri.lastIndexOf('.') + 1);

      return {
        base64: item.data,
        fileType: fileType,
        title: `${isPdf ? 'PDF' : 'IMG'}_${random8DigitNumber}`,
      } as PhysicalPrescription;
    });
  };

  const onClickTakePhoto = () => {
    if (!props.blockCamera) {
      postUPrescriptionWEGEvent('Take a Photo');
      postCleverTapUPrescriptionEvents('Camera');
      CommonLogEvent('UPLAOD_PRESCRIPTION_POPUP', 'Take photo on click');

      const eventAttributes: WebEngageEvents['Upload Photo'] = {
        Source: 'Take Photo',
      };
      postWebEngageEvent('Upload Photo', eventAttributes);

      setshowSpinner(true);
      ImagePicker.openCamera({
        cropping: props.isProfileImage ? true : false,
        hideBottomControls: true,
        width: props.isProfileImage ? 2096 : undefined,
        height: props.isProfileImage ? 2096 : undefined,
        includeBase64: true,
        multiple: props.isProfileImage ? false : true,
        compressImageQuality: 0.5,
        compressImageMaxHeight: 2096,
        compressImageMaxWidth: 2096,
        writeTempFile: false,
      })
        .then((response) => {
          setshowSpinner(false);
          props.onResponse(
            'CAMERA_AND_GALLERY',
            formatResponse([response] as ImageCropPickerResponse[]),
            'Camera'
          );
        })
        .catch((e: Error) => {
          CommonBugFender('UploadPrescriprionPopup_onClickTakePhoto', e);
          setshowSpinner(false);
        });
    } else {
      Alert.alert('Alert', props.blockCameraMessage || strings.alerts.Open_camera_in_video_call, [
        { text: '' },
        { text: 'OK, GOT IT', onPress: () => props.onClickClose() },
      ]);
    }
  };

  const getBase64 = (response: DocumentPickerResponse[]): Promise<string>[] => {
    return response.map(async ({ fileCopyUri: uri, name: fileName, type }) => {
      const isPdf = fileName.toLowerCase().endsWith('.pdf'); // TODO: check here if valid image by mime
      uri = Platform.OS === 'ios' ? decodeURI(uri.replace('file://', '')) : uri;
      let compressedImageUri = '';
      if (!isPdf) {
        compressedImageUri = (await ImageResizer.createResizedImage(uri, 2096, 2096, 'JPEG', 50))
          .uri;
        compressedImageUri =
          Platform.OS === 'ios' ? compressedImageUri.replace('file://', '') : compressedImageUri;
      }
      return RNFetchBlob.fs.readFile(!isPdf ? compressedImageUri : uri, 'base64');
    });
  };

  const onClickGallery = async () => {
    if (!props.isProfileImage) {
      actionSheetRef.current?.show();
    } else {
      openGallery();
    }
  };

  const onClickGalleryImage = async () => {
    openGallery();
  };

  const onBrowseClicked = async () => {
    postUPrescriptionWEGEvent('Choose Gallery');
    postCleverTapUPrescriptionEvents('Gallery');
    CommonLogEvent('UPLAOD_PRESCRIPTION_POPUP', 'Gallery opened');

    const eventAttributes: WebEngageEvents['Upload Photo'] = {
      Source: 'Gallery',
    };
    postWebEngageEvent('Upload Photo', eventAttributes);

    try {
      setshowSpinner(true);

      const documents = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.pdf],
        copyTo: 'documentDirectory',
      });

      const isValidPdf = documents.find(({ name }) => name.toLowerCase().endsWith('.pdf'));
      const isValidSize = documents.find(({ size }) => size < MAX_FILE_SIZE);

      if (!isValidPdf || !isValidSize) {
        setshowSpinner(false);
        Alert.alert(
          strings.common.uhOh,
          !isValidPdf
            ? `Invalid File Type. File type must be PDF.`
            : `Invalid File Size. File size must be less than 25MB.`
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

      props.onResponse('CAMERA_AND_GALLERY', formatResponse(base64FormattedArray));

      setshowSpinner(false);
    } catch (e) {
      setshowSpinner(false);
      if (DocumentPicker.isCancel(e)) {
        CommonBugFender('UploadPrescriprionPopup_onClickGallery', e);
      }
    }
  };

  const openGallery = () => {
    postUPrescriptionWEGEvent('Choose Gallery');
    postCleverTapUPrescriptionEvents('Gallery');
    CommonLogEvent('UPLAOD_PRESCRIPTION_POPUP', 'Gallery opened');

    const eventAttributes: WebEngageEvents['Upload Photo'] = {
      Source: 'Gallery',
    };
    postWebEngageEvent('Upload Photo', eventAttributes);

    setshowSpinner(true);
    ImagePicker.openPicker({
      cropping: true,
      hideBottomControls: true,
      width: props.isProfileImage ? 2096 : undefined,
      height: props.isProfileImage ? 2096 : undefined,
      includeBase64: true,
      multiple: props.isProfileImage ? false : true,
      compressImageQuality: 0.5,
      compressImageMaxHeight: 2096,
      compressImageMaxWidth: 2096,
      writeTempFile: false,
      freeStyleCropEnabled: props.isProfileImage ? true : false,
    })
      .then((response) => {
        const images = response as ImageCropPickerResponse[];
        const isGreaterThanSpecifiedSize = !props.isProfileImage
          ? images.find(({ size }) => size > MAX_FILE_SIZE)
          : Number(images['size']) > MAX_FILE_SIZE;
        setshowSpinner(false);
        if (isGreaterThanSpecifiedSize) {
          Alert.alert(strings.common.uhOh, `Invalid File Size. File size must be less than 25MB.`);
          return;
        }
        props.onResponse('CAMERA_AND_GALLERY', formatResponse(images), 'Gallery');
      })
      .catch((e: Error) => {
        CommonBugFender('UploadPrescriprionPopup_onClickGallery', e);
        setshowSpinner(false);
      });
  };

  const isOptionDisabled = (type: EPrescriptionDisableOption) => props.disabledOption == type;
  const getOptionStyle = (type: EPrescriptionDisableOption): StyleProp<ViewStyle> => {
    return props.disabledOption == type
      ? {
          backgroundColor: '#f0f1ec',
        }
      : {};
  };

  const renderOrderSteps = () => {
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
            justifyContent: 'center',
          }}
        >
          <View style={styles.cardViewStyle}>
            <Text style={styles.cardTextStyle}>{`UPLOAD\nYOUR PRESCRIPTION`}</Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
            }}
          >
            <Path />
          </View>
          <View style={styles.cardViewStyle}>
            <Text style={styles.cardTextStyle}>{'ORDER THROUGH OUR\nCUSTOMER CARE'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCloseIcon = () => {
    return (
      <View
        style={{
          alignSelf: 'flex-end',
          backgroundColor: 'transparent',
          marginBottom: props.phrUpload ? 5 : 16,
        }}
      >
        <TouchableOpacity onPress={() => props.onClickClose()}>
          {props.phrUpload ? (
            <PhrCloseIcon style={{ marginRight: 4, width: 28, height: 28 }} />
          ) : (
            <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
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
          {props.heading}
        </Text>
      </View>
    );
  };

  const renderOptions = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: 20,
          marginHorizontal: 13,
        }}
      >
        {!!props.optionTexts.camera && (
          <TouchableOpacity
            disabled={isOptionDisabled('CAMERA_AND_GALLERY')}
            activeOpacity={1}
            style={[styles.cardContainer, getOptionStyle('CAMERA_AND_GALLERY')]}
            onPress={onClickTakePhoto}
          >
            <CameraIcon />
            <Text style={styles.yelloTextStyle}>{props.optionTexts.camera}</Text>
          </TouchableOpacity>
        )}
        {!!props.optionTexts.gallery && (
          <TouchableOpacity
            disabled={isOptionDisabled('CAMERA_AND_GALLERY')}
            activeOpacity={1}
            style={[styles.cardContainer, getOptionStyle('CAMERA_AND_GALLERY')]}
            onPress={props.uploadImage ? onClickGalleryImage : onClickGallery}
          >
            <GalleryIcon />
            <Text style={styles.yelloTextStyle}>{props.optionTexts.gallery}</Text>
          </TouchableOpacity>
        )}
        {!!props.optionTexts.prescription && (
          <TouchableOpacity
            disabled={isOptionDisabled('E-PRESCRIPTION')}
            activeOpacity={1}
            style={[styles.cardContainer, getOptionStyle('E-PRESCRIPTION')]}
            onPress={() => {
              postUPrescriptionWEGEvent('E-Rx');
              postCleverTapUPrescriptionEvents('My Prescription');
              if (props.type == 'cartOrMedicineFlow') {
                postCleverTapUploadPrescriptionEvents('My Prescription', 'Cart');
              }
              props.onResponse('E-PRESCRIPTION', []);
            }}
          >
            <PrescriptionIcon />
            <Text style={styles.yelloTextStyle}>{props.optionTexts.prescription}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderInstructionPoint = (index: string, text: string, style: StyleProp<ViewStyle>) => {
    return (
      <View key={index} style={[{ flexDirection: 'row', flex: 1 }, style]}>
        <Text style={[styles.instructionsStyle, { flex: 0.1 }]}>{index}</Text>
        <Text style={[[styles.instructionsStyle, { flex: 0.9 }]]}>{text}</Text>
      </View>
    );
  };

  const renderInstructions = () => {
    const instructions = props.instructions || [];
    if (instructions.length == 0) return null;
    return (
      <View
        style={{
          marginHorizontal: 16,
          justifyContent: 'center',
        }}
      >
        <View style={styles.separatorStyle} />
        <Text style={styles.lableStyle}>{props.instructionHeading}</Text>
        {instructions.map((item, index) =>
          renderInstructionPoint(
            `${index + 1}.`,
            item,
            instructions.length - 1 == index ? { paddingBottom: 15 } : {}
          )
        )}
      </View>
    );
  };

  const renderTermsAndCondns = () => {
    return (
      <View
        style={{
          marginHorizontal: 16,
          justifyContent: 'center',
        }}
      >
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
          * Our pharmacist will dispense medicines only if the prescription is valid & it meets all
          government regulations.
        </Text>
      </View>
    );
  };

  const renderUploadListItems = (id: number) => {
    let title = id === 1 ? 'Take A Photo' : id === 2 ? 'Upload From Gallery' : 'Upload Files';
    const renderLeftElement = () => {
      switch (id) {
        case 1:
          return <PhrCameraIcon style={{ width: 16, height: 16, marginRight: 33 }} />;
        case 2:
          return <PhrGalleryIcon style={{ width: 16, height: 16, marginRight: 33 }} />;
        case 3:
          return <PhrFileIcon style={{ width: 13.24, height: 16, marginRight: 35.76 }} />;
      }
    };

    const onPressListItem = () => {
      switch (id) {
        case 1:
          onClickTakePhoto();
          break;
        case 2:
          setTimeout(() => {
            openGallery();
          }, 100);
          break;
        case 3:
          setTimeout(() => {
            if (Platform.OS === 'android') {
              storagePermissions(() => {
                onBrowseClicked();
              });
            } else {
              onBrowseClicked();
            }
          }, 100);
          break;
      }
    };

    return (
      <ListItem
        title={title}
        titleStyle={{ ...theme.viewStyles.text('M', 12, '#02475B', 1, 15.6) }}
        pad={0}
        containerStyle={styles.listItemContainerStyle}
        underlayColor={'#F7F8F5'}
        activeOpacity={1}
        leftElement={renderLeftElement()}
        onPress={onPressListItem}
      />
    );
  };

  const renderPhrUploadOptions = () => {
    return (
      <View style={styles.phrUploadOptionsViewStyle}>
        <Text style={{ ...theme.viewStyles.text('M', 16, '#AFC3C9', 1, 20.8) }}>
          {'Add a record'}
        </Text>
        <View style={{ marginTop: 10 }}>
          {renderUploadListItems(1)}
          {renderUploadListItems(2)}
          {renderUploadListItems(3)}
        </View>
      </View>
    );
  };

  const options = [
    <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) }}>Photo Library</Text>,
    <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) }}>Upload Pdf</Text>,
    <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) }}>Cancel</Text>,
  ];

  const renderActionSheet = () => {
    return (
      <ActionSheet
        ref={(o: ActionSheet) => (actionSheetRef.current = o)}
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
    );
  };

  return props.phrUpload ? (
    <Overlay
      onRequestClose={() => props.onClickClose()}
      isVisible={props.isVisible}
      windowBackgroundColor={'rgba(0, 0, 0, 0.2)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <>
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            {renderCloseIcon()}
            {renderPhrUploadOptions()}
          </SafeAreaView>
        </View>
        {showSpinner && <Spinner />}
      </>
    </Overlay>
  ) : (
    <>
      <Overlay
        onRequestClose={() => props.onClickClose()}
        isVisible={props.isVisible}
        windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
        containerStyle={styles.overlayContainerStyle}
        fullScreen
        transparent
        overlayStyle={styles.overlayStyle}
      >
        <View style={styles.overlayViewStyle1}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            {renderCloseIcon()}
            {renderHeader()}
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainerStyle}
            >
              {props.type == 'Upload Flow' && renderOrderSteps()}
              {renderOptions()}
              {renderInstructions()}
              {!props.hideTAndCs && renderTermsAndCondns()}
            </ScrollView>
          </SafeAreaView>
          {showSpinner && <Spinner />}
          {!props.isActionSheetOutOfOverlay && renderActionSheet()}
        </View>
      </Overlay>
      {!!props.isActionSheetOutOfOverlay && renderActionSheet()}
    </>
  );
});
