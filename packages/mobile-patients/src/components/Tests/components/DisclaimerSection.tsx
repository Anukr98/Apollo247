import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';

const styles = StyleSheet.create({
  outerView: { marginLeft: 16, marginBottom: 10, marginTop: 10 },
  innerView: { marginTop: 3, flexDirection: 'row' },
  bulletStyle: {
    color: theme.colors.SHERPA_BLUE,
    fontSize: 5,
    textAlign: 'center',
    paddingTop: 3,
  },
  textStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...fonts.IBMPlexSansRegular(11),
    textAlign: 'left',
    marginHorizontal: 5,
  },
});

export interface DisclaimerSectionProps {
  content: any;
}

export const DisclaimerSection: React.FC<DisclaimerSectionProps> = (props) => {
  return (
    <View style={styles.outerView}>
      {!!props.content &&
        props.content.map((item: any) => {
          return (
            <View style={styles.innerView}>
              <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
              <Text style={styles.textStyle}>{item?.text}</Text>
            </View>
          );
        })}
    </View>
  );
};
