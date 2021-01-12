import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { RNCamera as Camera } from 'react-native-camera';
import {
  CameraClickButton,
  PreviousPrescriptionIcon,
  GalleryIconWhite,
  PendingIcon,
  DeleteIconWhite,
  WhiteArrowRight,
  WhiteTickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

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
});

export interface UploadPrescriptionViewProps extends NavigationScreenProps {}

export const UploadPrescriptionView: React.FC<UploadPrescriptionViewProps> = (props) => {
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const _camera = useRef(null);

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
            <TouchableOpacity style={styles.iconContainer} activeOpacity={0.3} onPress={() => {}}>
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
        <TouchableOpacity activeOpacity={0.5} onPress={() => {}}>
          <Text style={styles.samplePrescription}>VIEW SAMPLE PRESCRIPTION</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderInstructions = () => {
    return (
      <View
        style={{
          padding: 20,
        }}
      >
        <Text style={theme.viewStyles.text('R', 14, '#01475B', 1, 17)}>
          Make sure the prescription you upload contains the following elements:
        </Text>
      </View>
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
        {renderInstructions()}
        <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {renderCameraView()}
          {renderActionButtons()}
          {renderMessage()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
