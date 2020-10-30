import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PhrNoDataIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const { width, height } = Dimensions.get('window');

interface PhrNoDataComponentProps {}

export const PhrNoDataComponent: React.FC<PhrNoDataComponentProps> = (props) => {
  return (
    <View style={{ justifyContent: 'center' }}>
      <View
        style={{
          justifyContent: 'center',
          marginTop: width / 2.5,
          backgroundColor: 'white',
          alignSelf: 'center',
          height: 140,
          width: 140,
          borderRadius: 70,
          alignItems: 'center',
        }}
      >
        <PhrNoDataIcon
          style={{ width: 140, height: 140, borderRadius: 70, resizeMode: 'contain' }}
        />
      </View>
      <Text
        style={{
          ...theme.viewStyles.text('SB', 12, '#02475B', 1, 15.6),
          textAlign: 'center',
          marginTop: 14,
        }}
      >
        {'No data available !!!'}
      </Text>
    </View>
  );
};
