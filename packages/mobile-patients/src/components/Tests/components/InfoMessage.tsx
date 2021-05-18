import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { ImageStyle, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { InfoIconRed } from '@aph/mobile-patients/src/components/ui/Icons';

export interface InfoMessageProps {
  content: string;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
}

export const InfoMessage: React.FC<InfoMessageProps> = (props) => {
  const { content, textStyle, iconStyle } = props;
  return (
    <>
      {content ? (
        <View style={styles.infoContainer}>
          <InfoIconRed style={iconStyle} />
          <Text style={textStyle}>{content}</Text>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    backgroundColor: '#FCFDDA',
  },
  infoText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 18,
    letterSpacing: 0.1,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.7,
    marginHorizontal: '2%',
  },
  infoIconStyle: { resizeMode: 'contain', height: 18, width: 18 },
});

InfoMessage.defaultProps = {
  textStyle: styles.infoText,
  iconStyle: styles.infoIconStyle,
};
