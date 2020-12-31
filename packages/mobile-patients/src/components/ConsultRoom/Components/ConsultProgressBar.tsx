import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { OrderPlacedCheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import StepIndicator from '@aph/mobile-patients/src/components/ConsultRoom/Components/StepIndicator';

interface ConsultProgressProps {
  currentPosition: number;
  style?: StyleProp<ViewStyle>;
}
const labels = ['Medical Details', 'Consult in Progress', 'Completed', 'Prescription'];
const customStyles = {
  stepIndicatorSize: 16,
  currentStepIndicatorSize: 16,
  separatorStrokeWidth: 1,
  currentStepStrokeWidth: 1,
  stepStrokeCurrentColor: theme.colors.CARD_BG,
  stepStrokeWidth: 1,
  separatorStrokeFinishedWidth: 1,
  stepStrokeFinishedColor: theme.colors.CARD_BG,
  stepStrokeUnFinishedColor: theme.colors.CARD_BG,
  separatorFinishedColor: theme.colors.SEARCH_UNDERLINE_COLOR,
  separatorUnFinishedColor: 'rgba(0, 179, 142, 0.2)',
  stepIndicatorFinishedColor: theme.colors.CARD_BG,
  stepIndicatorUnFinishedColor: theme.colors.CARD_BG,
  stepIndicatorCurrentColor: theme.colors.CARD_BG,
};

export const ConsultProgressBar: React.FC<ConsultProgressProps> = (props) => {
  const { currentPosition, style } = props;

  const renderStepIndicator = (params: any) => {
    const { stepStatus } = params;
    const isActive = stepStatus === 'current' || stepStatus === 'finished';
    if (isActive) {
      return <OrderPlacedCheckedIcon style={styles.icon} />;
    }
    return <View style={styles.bulletView} />;
  };

  return (
    <View style={[styles.container, style]}>
      <StepIndicator
        customStyles={customStyles}
        currentPosition={currentPosition}
        labels={labels}
        stepCount={4}
        renderStepIndicator={renderStepIndicator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 11,
  },
  icon: {
    width: 16,
    height: 16,
  },
  bulletView: {
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderRadius: 6,
    zIndex: 1,
  },
});
