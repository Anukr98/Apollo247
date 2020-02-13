import {
  CameraIcon,
  CrossPopup,
  GalleryIcon,
  Path,
  PrescriptionIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';
import { ScrollView } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';

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
    color: theme.colors.SHARP_BLUE,
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
    // width: 136,
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
});

export interface UploadPrescriprionPopupProps {
  type?: 'cartOrMedicineFlow' | 'nonCartFlow';
  isVisible: boolean;
  disabledOption?: any;
  heading: string;
  optionTexts: {
    camera?: string;
    gallery?: string;
    prescription?: string;
  };
  instructionHeading?: string;
  instructions?: string[];
  hideTAndCs?: boolean;
  onClickClose: () => void;
  onResponse: (selectedType: any, response: any[]) => void;
  isProfileImage?: boolean;
}

export const UploadPrescriprionPopup: React.FC<UploadPrescriprionPopupProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
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
      //console.log('item', item);
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
    setshowSpinner(true);
    ImagePicker.openCamera({
      // width: 400,
      // height: 400,
      cropping: props.isProfileImage ? true : false,
      hideBottomControls: true,
      width: props.isProfileImage ? 800 : undefined,
      height: props.isProfileImage ? 800 : undefined,
      includeBase64: true,
      multiple: props.isProfileImage ? false : true,
      compressImageQuality: 0.1,
    })
      .then((response: any) => {
        setshowSpinner(false);
        props.onResponse(
          'CAMERA_AND_GALLERY',
          formatResponse([response] as ImageCropPickerResponse[])
        );
      })
      .catch((e: any) => {
        CommonBugFender('Image_Picker_UploadPrescription', e);
        // aphConsole.log({ e });
        setshowSpinner(false);
      });
  };

  const onClickGallery = async () => {
    setshowSpinner(true);
    ImagePicker.openPicker({
      cropping: true,
      hideBottomControls: true,
      width: props.isProfileImage ? 800 : undefined,
      height: props.isProfileImage ? 800 : undefined,
      includeBase64: true,
      multiple: props.isProfileImage ? false : true,
      compressImageQuality: 0.1,
    })
      .then((response: any) => {
        console.log('res', response);

        setshowSpinner(false);
        props.onResponse(
          'CAMERA_AND_GALLERY',
          formatResponse(response as ImageCropPickerResponse[])
        );
      })
      .catch((e: any) => {
        CommonBugFender('Image_Picker_Open_UploadPrescriptionPopup', e);
        console.log('fail', e);
        setshowSpinner(false);
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
          {strings.appointments.order_medicine_steps}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            // justifyContent: 'space-between',
            justifyContent: 'center',
          }}
        >
          <View style={styles.cardViewStyle}>
            <Text style={styles.cardTextStyle}>{strings.appointments.upload_prescr}</Text>
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
      <View
        style={{
          alignSelf: 'flex-end',
          backgroundColor: 'transparent',
          marginBottom: 16,
        }}
      >
        <TouchableOpacity onPress={() => props.onClickClose()}>
          <CrossPopup style={{ marginRight: 1 }} />
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
        <Text
          style={{
            ...theme.fonts.IBMPlexSansMedium(12),
            color: theme.colors.TEXT_LIGHT_BLUE,
            paddingTop: 8,
            paddingBottom: 16,
            // paddingHorizontal: 20,
          }}
        >
          {strings.appointments.upload_prescr_descr}
        </Text>
      </View>
    );
  };

  return (
    <Overlay
      onRequestClose={() => props.onClickClose()}
      isVisible={props.isVisible}
      windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
      containerStyle={{
        marginBottom: 20,
      }}
      fullScreen
      transparent
      overlayStyle={{
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
      }}
    >
      <View
        style={{
          flexGrow: 1,
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
        {showSpinner && <Spinner />}
      </View>
    </Overlay>
  );
};
