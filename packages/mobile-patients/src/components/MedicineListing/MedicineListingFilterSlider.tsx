import { theme } from '@aph/mobile-patients/src/theme/theme';
import MultiSlider, { MultiSliderProps } from '@ptomasroos/react-native-multi-slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface Props extends MultiSliderProps {}

export const MedicineListingFilterSlider: React.FC<Props> = (props) => {
  const CustomLabel: MultiSliderProps['customLabel'] = ({ oneMarkerValue, twoMarkerValue }) => {
    return (
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Rs. {oneMarkerValue}</Text>
        <Text style={styles.label}>Rs. {twoMarkerValue}</Text>
      </View>
    );
  };

  return (
    <MultiSlider
      containerStyle={styles.container}
      trackStyle={styles.trackStyle}
      selectedStyle={styles.selectedStyle}
      enableLabel={true}
      customLabel={CustomLabel}
      allowOverlap={false}
      customMarker={() => <View style={styles.customMarker} />}
      sliderLength={150}
      step={1}
      {...props}
    />
  );
};

const { text } = theme.viewStyles;
const { LIGHT_BLUE, APP_GREEN, DEFAULT_BACKGROUND_COLOR } = theme.colors;
const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  trackStyle: { backgroundColor: 'rgba(1,48,91,0.2)' },
  selectedStyle: { backgroundColor: APP_GREEN },
  customMarker: {
    height: 30,
    width: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: APP_GREEN,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 30,
  },
  label: {
    ...text('M', 14, LIGHT_BLUE),
  },
});
