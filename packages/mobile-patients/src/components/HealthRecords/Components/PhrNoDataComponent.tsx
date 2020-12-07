import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PhrNoDataIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const { width, height } = Dimensions.get('window');

const style = StyleSheet.create({
  mainViewStyle: {
    justifyContent: 'center',
    marginTop: width / 2.5,
    backgroundColor: 'white',
    alignSelf: 'center',
    height: 140,
    width: 140,
    borderRadius: 70,
    alignItems: 'center',
  },
  noDataTextStyle: {
    ...theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE, 1, 15.6),
    textAlign: 'center',
    marginTop: 14,
  },
  noDataIconStyle: { width: 140, height: 140, borderRadius: 70, resizeMode: 'contain' },
});

interface PhrNoDataComponentProps {}

export const PhrNoDataComponent: React.FC<PhrNoDataComponentProps> = (props) => {
  return (
    <View style={{ justifyContent: 'center' }}>
      <View style={style.mainViewStyle}>
        <PhrNoDataIcon style={style.noDataIconStyle} />
      </View>
      <Text style={style.noDataTextStyle}>{'No data available !!!'}</Text>
    </View>
  );
};
