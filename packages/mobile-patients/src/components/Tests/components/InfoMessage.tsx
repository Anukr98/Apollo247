import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { ImageStyle, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { InfoIconRed } from '@aph/mobile-patients/src/components/ui/Icons';

export interface InfoMessageProps {
  content: string;
  icon?: any;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  isCard?: boolean;
}

export const InfoMessage: React.FC<InfoMessageProps> = (props) => {
  const { content, textStyle, iconStyle, icon, containerStyle, isCard } = props;
  return (
    <>
      {content ? (
        <View
          style={[
            styles.infoContainer,
            containerStyle,
            isCard && {
              ...theme.viewStyles.cardViewStyle,
            },
          ]}
        >
          {icon ? icon : <InfoIconRed style={iconStyle} />}
          <Text style={textStyle}>{content}</Text>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
  },
  infoText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 18,
    letterSpacing: 0.1,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.7,
    marginHorizontal: '2%',
    width: '94%',
  },
  infoIconStyle: { resizeMode: 'contain', height: 18, width: 18 },
});

InfoMessage.defaultProps = {
  textStyle: styles.infoText,
  iconStyle: styles.infoIconStyle,
  isCard: true,
};
