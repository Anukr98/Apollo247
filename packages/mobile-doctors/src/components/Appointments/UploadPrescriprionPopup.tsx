import UploadPrescriprionPopupStyles from '@aph/mobile-doctors/src/components/Appointments/UploadPrescriprionPopup.styles';
import {
  CameraIcon,
  CrossPopup,
  GalleryIcon,
  Path,
  PrescriptionIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect } from 'react';
import {
  BackHandler,
  Platform,
  SafeAreaView,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { ScrollView } from 'react-navigation';

const styles = UploadPrescriprionPopupStyles;

export interface UploadPrescriprionPopupProps {
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

export const UploadPrescriprionPopup: React.FC<UploadPrescriprionPopupProps> = (props) => {
  const { showAphAlert, setLoading } = useUIElements();
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
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);
  const handleBack = async () => {
    props.onClickClose();
    return false;
  };
  const onClickTakePhoto = () => {
    if (!props.blockCamera) {
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
        });
    }
  };

  const onClickGallery = async () => {
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
          marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 50,
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
