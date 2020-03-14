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
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { aphConsole, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
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
import { WebEngageEventName, WebEngageEvents } from '../../helpers/webEngageEvents';

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
  disabledOption?: EPrescriptionDisableOption;
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
  onResponse: (selectedType: EPrescriptionDisableOption, response: PhysicalPrescription[]) => void;
  isProfileImage?: boolean;
}

export const UploadPrescriprionPopup: React.FC<UploadPrescriprionPopupProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

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
        } as PhysicalPrescription,
      ];
      return returnValue as PhysicalPrescription[];
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
      } as PhysicalPrescription;
    });
  };

  const onClickTakePhoto = () => {
    postUPrescriptionWEGEvent('Take a Photo');
    CommonLogEvent('UPLAOD_PRESCRIPTION_POPUP', 'Take photo on click');
    setshowSpinner(true);
    ImagePicker.openCamera({
      // width: 400,
      // height: 400,
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
          formatResponse([response] as ImageCropPickerResponse[])
        );
      })
      .catch((e: Error) => {
        CommonBugFender('UploadPrescriprionPopup_onClickTakePhoto', e);
        // aphConsole.log({ e });
        setshowSpinner(false);
      });
  };

  const onClickGallery = async () => {
    postUPrescriptionWEGEvent('Choose Gallery');
    setshowSpinner(true);
    CommonLogEvent('UPLAOD_PRESCRIPTION_POPUP', 'Gallery opened');
    //   try {
    //     const docs = await DocumentPicker.pickMultiple({
    //       type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
    //     });
    //     console.log({ docs });
    //     const base64Array = await Promise.all(
    //       docs.map((item) =>
    //         RNFetchBlob.fs.readFile(
    //           Platform.OS === 'ios' ? item.uri.replace('file:', '') : item.uri,
    //           'base64'
    //         )
    //       )
    //     );
    //     console.log({ base64Array });
    //     props.onResponse(
    //       'CAMERA_AND_GALLERY',
    //       formatResponse(
    //         docs.map(
    //           (item, i) =>
    //             ({
    //               mime: item.type,
    //               data: base64Array[i],
    //             } as ImageCropPickerResponse)
    //         )
    //       )
    //     );
    //     setshowSpinner(false);
    //   } catch (error) {
    //     setshowSpinner(false);
    //   }

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
      .then((response) => {
        //console.log('res', response);

        setshowSpinner(false);
        props.onResponse(
          'CAMERA_AND_GALLERY',
          formatResponse(response as ImageCropPickerResponse[])
        );
      })
      .catch((e: Error) => {
        CommonBugFender('UploadPrescriprionPopup_onClickGallery', e);
        //aphConsole.log({ e });
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
            // justifyContent: 'space-between',
            justifyContent: 'center',
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
          marginBottom: 16,
        }}
      >
        <TouchableOpacity onPress={() => props.onClickClose()}>
          <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
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
              postUPrescriptionWEGEvent('E-Rx');
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
