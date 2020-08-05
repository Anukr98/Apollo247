import {
  CameraIcon,
  CrossPopup,
  GalleryIcon,
  Path,
  PrescriptionIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
  DeviceHelper,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';

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
  orderstpes: {
    height: 101,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.SKY_BLUE,
  },
  steps: {
    paddingTop: 13,
    paddingBottom: 12,
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  rowview: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  close: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  header: {
    ...theme.viewStyles.cardContainer,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 23,
    width: '100%',
  },
  head: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.LIGHT_BLUE,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20,
    marginHorizontal: 13,
  },
  terms: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.TEXT_LIGHT_BLUE,
    paddingTop: 8,
    paddingBottom: 16,
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});

export interface UploadPrescriprionChatPopupProps {
  type?: 'cartOrMedicineFlow' | 'nonCartFlow';
  disabledOption?: any;
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
  onResponse: (selectedType: any, response: any[]) => void;
  isProfileImage?: boolean;
}

export const UploadPrescriprionChatPopup: React.FC<UploadPrescriprionChatPopupProps> = (props) => {
  const { showAphAlert, setLoading, hideAphAlert } = useUIElements();
  const { isIphoneX } = DeviceHelper();

  const postUPrescriptionWEGEvent = (
    source: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]['Source']
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED] = {
      Source: source,
    };
    postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED, eventAttributes);
  };

  const formatResponse = (response: ImageCropPickerResponse[]) => {
    console.log('response Img', response);
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
        } as any,
      ];
      return returnValue as any[];
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
      } as any;
    });
  };

  const onClickTakePhoto = () => {
    if (!props.blockCamera) {
      postUPrescriptionWEGEvent('Take a Photo');
      CommonLogEvent('UPLAOD_PRESCRIPTION_POPUP', 'Take photo on click');

      const eventAttributes: WebEngageEvents['Upload Photo'] = {
        Source: 'Take Photo',
      };
      postWebEngageEvent('Upload Photo', eventAttributes);

      setLoading && setLoading(true);
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
        .then((response: any) => {
          setLoading && setLoading(false);
          props.onResponse(
            'CAMERA_AND_GALLERY',
            formatResponse([response] as ImageCropPickerResponse[])
          );
        })
        .catch((e: any) => {
          CommonBugFender('Image_Picker_UploadPrescription', e);
          setLoading && setLoading(false);
        });
    } else {
      showAphAlert &&
        showAphAlert({
          title: 'Alert',
          description: props.blockCameraMessage || strings.alerts.Open_camera_in_video_call,
          children: (
            <View style={{ height: 60, alignItems: 'flex-end' }}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.gotItStyles}
                onPress={() => {
                  props.onClickClose();
                  hideAphAlert && hideAphAlert();
                }}
              >
                <Text style={styles.gotItTextStyles}>{strings.home.welcome_popup.cta_label}</Text>
              </TouchableOpacity>
            </View>
          ),
        });
    }
  };

  const onClickGallery = async () => {
    postUPrescriptionWEGEvent('Choose Gallery');
    CommonLogEvent('UPLAOD_PRESCRIPTION_POPUP', 'Gallery opened');

    const eventAttributes: WebEngageEvents['Upload Photo'] = {
      Source: 'Gallery',
    };
    postWebEngageEvent('Upload Photo', eventAttributes);

    setLoading && setLoading(true);
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
    })
      .then((response: any) => {
        console.log('res', response);
        setLoading && setLoading(false);
        props.onResponse(
          'CAMERA_AND_GALLERY',
          formatResponse(response as ImageCropPickerResponse[])
        );
      })
      .catch((e: any) => {
        CommonBugFender('Image_Picker_Open_UploadPrescriptionPopup', e);
        console.log('fail', e);
        setLoading && setLoading(false);
      });
  };

  const isOptionDisabled = (type: any) => props.disabledOption == type;
  const getOptionStyle = (type: any): StyleProp<ViewStyle> => {
    return props.disabledOption == type
      ? {
          backgroundColor: '#f0f1ec',
        }
      : {};
  };

  const renderOrderSteps = () => {
    return (
      <View style={styles.orderstpes}>
        <Text style={styles.steps}>{strings.appointments.order_medicine_steps}</Text>
        <View style={styles.rowview}>
          <View style={styles.cardViewStyle}>
            <Text style={styles.cardTextStyle}>{strings.appointments.upload_prescr}</Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
            }}
          >
            <Path />
          </View>
          <View style={styles.cardViewStyle}>
            <Text style={styles.cardTextStyle}>
              {strings.appointments.order_through_customercare}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCloseIcon = () => {
    return (
      <View style={styles.close}>
        <TouchableOpacity onPress={() => props.onClickClose()}>
          <CrossPopup style={{ marginRight: 1, width: 30, height: 30 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.head}>{props.heading}</Text>
      </View>
    );
  };

  const renderOptions = () => {
    return (
      <View style={styles.options}>
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
            onPress={onClickGallery}
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
        <Text style={styles.terms}>{strings.appointments.upload_prescr_descr}</Text>
      </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 15,
        elevation: 500,
      }}
    >
      <View
        style={{
          flexGrow: 1,
          marginHorizontal: 20,
          marginTop: Platform.OS === 'ios' ? (isIphoneX() ? 58 : 34) : 50,
          backgroundColor: 'transparent',
        }}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: 'transparent',
          }}
        >
          {renderCloseIcon()}
          {renderHeader()}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            {props.type == 'nonCartFlow' && renderOrderSteps()}
            {renderOptions()}
            {renderInstructions()}
            {!props.hideTAndCs && renderTermsAndCondns()}
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
};
