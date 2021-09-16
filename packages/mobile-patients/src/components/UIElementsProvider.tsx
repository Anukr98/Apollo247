import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BackHandler,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleSheet,
  Keyboard,
  TextStyle,
  Platform,
} from 'react-native';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  MedAndTestFeedbackPopup,
  MedAndTestFeedbackPopupProps,
} from '@aph/mobile-patients/src/components/Medicines/MedAndTestFeedbackPopup';
import SystemSetting from 'react-native-system-setting';
import RNSound from 'react-native-sound';
import AsyncStorage from '@react-native-community/async-storage';

const styles = StyleSheet.create({
  okButtonStyle: {
    paddingHorizontal: 25,
    backgroundColor: 'transparent',
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  okButtonTextStyle: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 18,
  },
  ctaWhiteButtonViewStyle: {
    flex: 1,
    minHeight: 40,
    height: 'auto',
    backgroundColor: theme.colors.WHITE,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
});

RNSound.setCategory('Playback');
let audioTrack: RNSound | null = null;
let joinAudioTrack: RNSound | null = null;
let disconnectAudioTrack: RNSound | null = null;
export interface UIElementsContextProps {
  loading: boolean;
  setLoading: ((isLoading: boolean) => void) | null;
  showAphAlert: ((params: AphAlertParams) => void) | null;
  hideAphAlert: (() => void) | null;
  setMedFeedback: ((feedback: MedAndTestFeedbackPopupProps['feedback']) => void) | null;
  setPrevVolume: () => void;
  maxVolume: () => void;
  audioTrack: RNSound | null;
  joinAudioTrack: RNSound | null;
  disconnectAudioTrack: RNSound | null;
}

export const UIElementsContext = createContext<UIElementsContextProps>({
  loading: false,
  setLoading: null,
  showAphAlert: null,
  hideAphAlert: null,
  setMedFeedback: null,
  setPrevVolume: () => {},
  maxVolume: () => {},
  audioTrack: null,
  joinAudioTrack: null,
  disconnectAudioTrack: null,
});

type AphAlertCTAs = {
  text: string;
  onPress: () => void;
  type?: 'orange-button' | 'white-button' | 'orange-link';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type AphAlertParams = {
  title?: string | JSX.Element; // (only Text tag allowed)
  description?: string | JSX.Element; // (only Text tag allowed)
  CTAs?: AphAlertCTAs[];
  ctaContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  // Note: CTAs will be rendered at end of the popup.
  // If CTAs are passed, `OK, GOT IT` will not be rendered.
  children?: React.ReactNode;
  unDismissable?: boolean;
  style?: StyleProp<ViewStyle>;
  onPressOk?: () => void;
  onPressOutside?: () => void;
  removeTopIcon?: boolean;
  physical?: boolean;
  physicalText?: React.ReactNode;
  showCloseIcon?: boolean;
  onCloseIconPress?: () => void;
};

export const UIElementsProvider: React.FC = (props) => {
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertParams, setAlertParams] = useState<AphAlertParams>({});
  const [medFeedback, setMedFeedback] = useState<MedAndTestFeedbackPopupProps['feedback']>({
    visible: false,
    title: '',
    subtitle: '',
    transactionId: '',
  });

  useEffect(() => {
    if (isAlertVisible || loading) {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    } else {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    }
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [isAlertVisible, loading]);

  useEffect(() => {
    audioTrack = new RNSound(
      'incallmanager_ringtone.mp3',
      Platform.OS === 'ios' ? encodeURIComponent(RNSound.MAIN_BUNDLE) : RNSound.MAIN_BUNDLE,
      (error) => {}
    );

    joinAudioTrack = new RNSound(
      'join_sound.mp3',
      Platform.OS === 'ios' ? encodeURIComponent(RNSound.MAIN_BUNDLE) : RNSound.MAIN_BUNDLE,
      (error) => {}
    );

    disconnectAudioTrack = new RNSound(
      'left_sound.mp3',
      Platform.OS === 'ios' ? encodeURIComponent(RNSound.MAIN_BUNDLE) : RNSound.MAIN_BUNDLE,
      (error) => {}
    );
  }, []);

  const setPrevVolume = async () => {
    const mediaVolume = Number((await AsyncStorage.getItem('mediaVolume')) || '-1');
    if (mediaVolume !== -1) {
      SystemSetting.setVolume(mediaVolume);
      AsyncStorage.setItem('mediaVolume', '-1');
    }
  };
  const maxVolume = async () => {
    const mediaVolume = Number((await AsyncStorage.getItem('mediaVolume')) || '-1');

    if (mediaVolume === -1) {
      SystemSetting.getVolume().then((volume: number) => {
        AsyncStorage.setItem('mediaVolume', volume.toString());
      });
    }
    SystemSetting.setVolume(1);
  };

  const handleBack = async () => {
    if (!alertParams.unDismissable) {
      hideAphAlert();
    }
    if (alertParams.onPressOutside) {
      alertParams.onPressOutside();
    }
    return true;
  };

  const renderLoading = () => {
    return loading && <Spinner />;
  };

  const renderAphAlert = () => {
    const renderOkButton = (
      <TouchableOpacity
        style={styles.okButtonStyle}
        onPress={() => {
          if (alertParams.onPressOk) {
            alertParams.onPressOk();
          } else {
            hideAphAlert();
          }
        }}
      >
        <Text style={styles.okButtonTextStyle}>OK, GOT IT</Text>
      </TouchableOpacity>
    );

    const renderCTAs = () =>
      !!g(alertParams, 'CTAs', 'length') && (
        <View style={[styles.aphAlertCtaViewStyle, alertParams.ctaContainerStyle]}>
          {alertParams.CTAs!.map((item, index, array) =>
            item.type == 'orange-link' ? (
              <Text
                onPress={item.onPress}
                style={[
                  styles.ctaOrangeTextStyle,
                  { marginRight: index == array.length - 1 ? 0 : 16 },
                ]}
              >
                {item.text}
              </Text>
            ) : (
              <Button
                style={[
                  item.type == 'white-button'
                    ? styles.ctaWhiteButtonViewStyle
                    : styles.ctaOrangeButtonViewStyle,
                  { marginRight: index == array.length - 1 ? 0 : 16 },
                  item.style,
                ]}
                titleTextStyle={[
                  item.type == 'white-button' && styles.ctaOrangeTextStyle,
                  item.textStyle,
                ]}
                title={item.text}
                onPress={item.onPress}
              />
            )
          )}
        </View>
      );

    return (
      isAlertVisible && (
        <BottomPopUp
          title={alertParams.title}
          description={alertParams.description}
          titleStyle={alertParams.titleStyle}
          style={alertParams.style}
          onPressBack={() => {
            if (!alertParams.unDismissable) {
              hideAphAlert();
            }
            if (alertParams.onPressOutside) {
              alertParams.onPressOutside();
            }
          }}
          physical={alertParams.physical}
          physicalText={alertParams.physicalText}
          removeTopIcon={alertParams.removeTopIcon}
          showCloseIcon={alertParams.showCloseIcon}
          onCloseIconPress={alertParams.onCloseIconPress}
        >
          {alertParams.children || (g(alertParams, 'CTAs', 'length') ? null : renderOkButton)}
          {renderCTAs()}
        </BottomPopUp>
      )
    );
  };

  const showAphAlert = (params: AphAlertParams) => {
    Keyboard.dismiss();
    setAlertParams(params);
    setAlertVisible(true);
  };

  const hideAphAlert = () => {
    setAlertVisible(false);
    setAlertParams({});
  };

  const renderMedAndTestFeedbackPopup = () =>
    !!medFeedback.visible && (
      <MedAndTestFeedbackPopup
        onComplete={() => {
          setMedFeedback({ visible: false, title: '', subtitle: '', transactionId: '' });
        }}
        feedback={medFeedback}
      />
    );

  return (
    <UIElementsContext.Provider
      value={{
        loading,
        setLoading,
        showAphAlert,
        hideAphAlert,
        setMedFeedback,
        setPrevVolume,
        maxVolume,
        audioTrack,
        joinAudioTrack,
        disconnectAudioTrack,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }} pointerEvents={loading ? 'none' : 'auto'}>
          {props.children}
          {renderMedAndTestFeedbackPopup()}
          {renderLoading()}
        </View>
        {renderAphAlert()}
      </View>
    </UIElementsContext.Provider>
  );
};

export const useUIElements = () => useContext<UIElementsContextProps>(UIElementsContext);
