import { getAge } from '@aph/mobile-patients/src//helpers/helperFunctions';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import {
  AddPatientCircleIcon,
  CrossPopup,
  GreenCircleTick,
  MinusPatientCircleIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import LottieView from 'lottie-react-native';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
const screenHeight = Dimensions.get('window').height;

const { SHERPA_BLUE, APP_YELLOW, CARD_BG, WHITE, APP_GREEN, CLEAR } = theme.colors;

interface PhleboCallPopupProps {
  onPressProceed: () => void;
  onPressBack: () => void;
  source?: string;
}

export const PhleboCallPopup: React.FC<PhleboCallPopupProps> = (props) => {
  const { onPressProceed, onPressBack, source } = props;
  const { allCurrentPatients } = useAllCurrentPatients();

  const NumericView = (num: string) => {
    return (
      <View
        style={{
          backgroundColor: colors.CONSULT_SUCCESS_TEXT,
          borderRadius: 4,
          width: 30,
          alignItems: 'center',
        }}
      >
        <Text style={{ ...theme.viewStyles.text('B', 20, theme.colors.WHITE, 1) }}>{num}</Text>
      </View>
    );
  };
  return (
    <Overlay
      isVisible
      onRequestClose={() => onPressBack()}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => onPressBack()} />
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            <View style={styles.mainContainer}>
              <View style={{ paddingBottom: 20 }}>
                <Text style={styles.upText}>Connect on a phone call with the Apollo Agent</Text>
                <Text style={styles.midText}>Please follow the steps below to connect</Text>
              </View>
              <View style={styles.boxStyle}>
                <View style={styles.borderView}>
                  {NumericView('1')}
                  <Text style={styles.textGreen}>
                    Answer the call from{' '}
                    <Text style={styles.textGreenBold}>
                      {AppConfig.Configuration.DIAGNOSTICS_PHLEBO_CALL_NUMBER}
                    </Text>{' '}
                    to connect
                  </Text>
                </View>
                <View style={styles.borderView}>
                  {NumericView('2')}
                  <Text style={styles.textGreen}>Wait for Apollo Agent to Connect</Text>
                </View>
              </View>
              <Text style={styles.bottomText}>
                Please Note: Your personal number would not be shared with the agent
              </Text>
              <View style={styles.buttomAreaStyle}>
                <TouchableOpacity
                  style={styles.proceedToCancelTouch}
                  onPress={() => {
                    onPressBack();
                  }}
                >
                  <Text style={styles.yellowText}>{string.common.goBack}</Text>
                </TouchableOpacity>
                <Button
                  title={string.common.proceedCta}
                  style={{ width: '50%' }}
                  onPress={() => {
                    onPressProceed();
                  }}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Overlay>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: CLEAR,
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: CLEAR,
  },
  borderView: {
    borderColor: '#D4D4D4',
    borderRadius: 4,
    borderWidth: 1,
    width: '48%',
    padding: 10,
  },
  textGreen: {
    ...theme.viewStyles.text('M', 14, theme.colors.CONSULT_SUCCESS_TEXT, 1),
  },
  yellowText: { ...theme.viewStyles.yellowTextStyle, fontSize: 14, textAlign: 'left' },
  proceedToCancelTouch: {
    height: 40,
    width: '37%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upText: { ...theme.viewStyles.text('SB', 16, colors.SHERPA_BLUE, 1) },
  midText: { ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1) },
  boxStyle: { flexDirection: 'row', justifyContent: 'space-between' },
  textGreenBold: { ...theme.viewStyles.text('SB', 14, colors.CONSULT_SUCCESS_TEXT) },
  bottomText: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1),
    paddingVertical: 20,
  },
  buttomAreaStyle: { flexDirection: 'row', justifyContent: 'space-between' },
  mainContainer: {
    backgroundColor: 'white',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    padding: 15,
  },
});
