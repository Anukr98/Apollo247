import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

interface CertifiedCardProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  bottomView?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleText: string;
  titleStyle?: StyleProp<TextStyle>;
}

export const CertifiedCard: React.FC<CertifiedCardProps> = (props) => {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {props.leftIcon ? props.leftIcon : null}
        <Text style={[styles.titleStyle, props.titleStyle]}>{props.titleText}</Text>
        {props.rightIcon ? props.rightIcon : null}
      </View>
      {props.bottomView ? props.bottomView : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...theme.viewStyles.cardViewStyle, padding: 16, margin: 16 },
  titleStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    paddingHorizontal: 16,
  },
});
