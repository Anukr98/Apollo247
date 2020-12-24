import React from 'react';
import { View, Text, Dimensions, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import {
  PhrNoDataIcon,
  PhrSearchNoDataIcon,
  PhrErrorIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
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
  errorIconStyle: { width: 140, height: 140, borderRadius: 70, resizeMode: 'contain' },
  noDataSearchIconStyle: { width: 132, height: 126, resizeMode: 'contain' },
});

interface PhrNoDataComponentProps {
  mainViewStyle?: StyleProp<ViewStyle>;
  noDataText?: string;
  phrSearchList?: boolean;
  phrErrorIcon?: boolean;
}

export const PhrNoDataComponent: React.FC<PhrNoDataComponentProps> = (props) => {
  return (
    <View style={{ justifyContent: 'center' }}>
      <View style={[style.mainViewStyle, props.mainViewStyle]}>
        {props.phrSearchList ? (
          <PhrSearchNoDataIcon style={style.noDataSearchIconStyle} />
        ) : props.phrErrorIcon ? (
          <PhrErrorIcon style={style.errorIconStyle} />
        ) : (
          <PhrNoDataIcon style={style.noDataIconStyle} />
        )}
      </View>
      {props.phrSearchList ? null : (
        <Text style={style.noDataTextStyle}>
          {props.noDataText ? props.noDataText : 'No data available !!!'}
        </Text>
      )}
    </View>
  );
};
