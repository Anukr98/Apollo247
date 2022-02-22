import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

const { SHERPA_BLUE, WHITE, CLEAR, CONSULT_SUCCESS_TEXT } = theme.colors;
interface PhleboCallPopupProps {
  onPressProceed: () => void;
  onPressBack: () => void;
  source?: string;
}

export const PhleboCallPopup: React.FC<PhleboCallPopupProps> = (props) => {
  const { onPressProceed, onPressBack } = props;

  const NumericView = (num: string) => {
    return (
      <View style={styles.numView}>
        <Text style={styles.numText}>{num}</Text>
      </View>
    );
  };

  const renderHeading = () => {
    return (
      <View style={{ paddingBottom: 20 }}>
        <Text style={styles.upText}>{string.diagnostics.phleboConnectCall}</Text>
        <Text style={styles.midText}>{string.diagnostics.phleboFollowSteps}</Text>
      </View>
    );
  };

  const renderLeftView = () => {
    return (
      <View style={styles.borderView}>
        {NumericView('1')}
        <Text style={styles.textGreen}>
          {string.diagnostics.phleboTextOne}{' '}
          <Text style={styles.textGreenBold}>
            {AppConfig.Configuration.DIAGNOSTICS_PHLEBO_CALL_NUMBER}
          </Text>{' '}
          {string.diagnostics.phleboTextTwo}
        </Text>
      </View>
    );
  };

  const renderRightView = () => {
    return (
      <View style={styles.borderView}>
        {NumericView('2')}
        <Text style={styles.textGreen}>{string.diagnostics.phleboWaitText}</Text>
      </View>
    );
  };

  const renderGoBack = () => {
    return (
      <TouchableOpacity
        style={styles.proceedToCancelTouch}
        onPress={() => {
          onPressBack();
        }}
      >
        <Text style={styles.yellowText}>{string.common.goBack}</Text>
      </TouchableOpacity>
    );
  };

  const renderProceedButton = () => {
    return (
      <Button
        title={string.common.proceedCta}
        style={{ width: '50%' }}
        onPress={() => {
          onPressProceed();
        }}
      />
    );
  };

  const renderBottomView = () => {
    return (
      <View style={styles.buttomAreaStyle}>
        {renderGoBack()}
        {renderProceedButton()}
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
              {renderHeading()}
              <View style={styles.boxStyle}>
                {renderLeftView()}
                {renderRightView()}
              </View>
              <Text style={styles.bottomText}>{string.diagnostics.phleboPleaseNote}</Text>
              {renderBottomView()}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Overlay>
  );
};

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
    ...theme.viewStyles.text('M', 14, CONSULT_SUCCESS_TEXT, 1),
  },
  yellowText: { ...theme.viewStyles.yellowTextStyle, fontSize: 14, textAlign: 'left' },
  proceedToCancelTouch: {
    height: 40,
    width: '37%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upText: { ...theme.viewStyles.text('SB', 16, SHERPA_BLUE, 1) },
  midText: { ...theme.viewStyles.text('SB', 14, SHERPA_BLUE, 1) },
  boxStyle: { flexDirection: 'row', justifyContent: 'space-between' },
  textGreenBold: { ...theme.viewStyles.text('SB', 14, colors.CONSULT_SUCCESS_TEXT) },
  bottomText: {
    ...theme.viewStyles.text('SB', 14, SHERPA_BLUE, 1),
    paddingVertical: 20,
  },
  buttomAreaStyle: { flexDirection: 'row', justifyContent: 'space-between' },
  mainContainer: {
    backgroundColor: 'white',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    padding: 15,
  },
  numView: {
    backgroundColor: CONSULT_SUCCESS_TEXT,
    borderRadius: 4,
    width: 30,
    alignItems: 'center',
  },
  numText: { ...theme.viewStyles.text('B', 20, WHITE, 1) },
});
