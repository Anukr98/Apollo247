import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { SympTrackerIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface SymptomTrackerProps {
  onPressTrack: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SymptomTrackerCard: React.FC<SymptomTrackerProps> = (props) => {
  const { onPressTrack, style } = props;

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPressTrack}>
      <SympTrackerIcon style={styles.symptomIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.whichSpecialityTxt}>Not sure about which speciality to choose?</Text>
        <Text style={styles.TrackTxt}>BOOK DOCTOR BY SYMPTOMS</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 8,
    flexDirection: 'row',
  },
  symptomIcon: {
    width: 40,
    height: 40,
    marginVertical: 16,
    marginHorizontal: 15,
  },
  whichSpecialityTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginTop: 12,
    color: theme.colors.SHERPA_BLUE,
    flexWrap: 'wrap',
  },
  TrackTxt: {
    ...theme.fonts.IBMPlexSansBold(13),
    marginTop: 5,
    color: theme.colors.APP_YELLOW,
  },
});
