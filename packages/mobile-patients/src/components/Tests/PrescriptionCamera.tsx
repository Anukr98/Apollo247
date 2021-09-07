import { Header } from '@aph/mobile-patients/src/components/ui/Header';

import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useRef, useState } from 'react';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {
  useShoppingCart,
  PhysicalPrescription,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationScreenProps } from 'react-navigation';
import { useApolloClient } from 'react-apollo-hooks';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import _ from 'lodash';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';
import { RNCamera as Camera } from 'react-native-camera';
import Permissions from 'react-native-permissions';
import {
  PhrCameraIcon,
  DeleteIconWhite,
  WhiteTickIcon
} from '@aph/mobile-patients/src/components/ui/Icons';

const { width, height } = Dimensions.get('window');

export interface PrescriptionCameraProps extends NavigationScreenProps {
  showHeader?: boolean;
  phyPrescriptionUploaded: PhysicalPrescription[];
  ePresscriptionUploaded: EPrescription[];
}

export const PrescriptionCamera: React.FC<PrescriptionCameraProps> = (props) => {
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [isCameraAccessGranted, setIsCameraAccessGranted] = useState<boolean>(true);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const type = props.navigation.getParam('type');
  const responseData = props.navigation.getParam('responseData');
  const title = props.navigation.getParam('title');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [imageClickData, setImageClickData] = useState<any>({});
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
  let _camera = useRef(null);
  useEffect(() => {
    setLoading?.(false);
    setPhotoBase64(responseData?.[0]?.base64);
    clickPhoto()
  }, []);

  const client = useApolloClient();
  const removeClickedPhoto = () => {
    setPhotoBase64('');
    _camera?.current?.resumePreview();
  };

  const renderCameraActions = () => {
    return (
      !!photoBase64 && (
        <View style={styles.cameraActionContainer}>
          <TouchableOpacity style={styles.cameraActionButton} onPress={() => removeClickedPhoto()}>
            <DeleteIconWhite style={styles.deleteIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraActionButton}
            onPress={ () => {
              console.log(imageClickData,`object`, )
              props.navigation.navigate(AppRoutes.SubmittedPrescription, {
                type: 'Camera',
                ePrescriptionsProp: imageClickData,
                source: 'PrescriptionCamera',
              });
            }}
          >
            <WhiteTickIcon style={styles.correctIcon} />
          </TouchableOpacity>
        </View>
      )
    );
  };
  
  const clickPhoto = async () => {
    try {
      const options = { quality: 0.5, base64: true, pauseAfterCapture: true };
      const data = await _camera?.current?.takePictureAsync(options);
      const clickedPhotoResponse = formatResponse([data], true);
      setImageClickData(clickedPhotoResponse);
    } catch (error) {
      CommonBugFender('PrescriptionCamera_clickPhoto', error);
    }
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {props?.showHeader == false ? null : (
          <Header
            leftIcon="backArrow"
            title={'UPLOAD PRESCRIPTION'}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
        )}

        <ScrollView bounces={false} scrollEventThrottle={1}>
          {renderPreviewImage()}
        </ScrollView>
        {loading ? <Spinner /> : null}
      </SafeAreaView>
    </View>
  );
};


const styles = StyleSheet.create({
  cameraView: {
    height: height / 2.5,
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
    height: height / 1.3,
    alignSelf: 'center',
    backgroundColor: 'black',
    marginTop: 5,
  },
  previewImage: {
    marginTop: 10,
    resizeMode: 'contain',
    height: height / 1.4,
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
});
