import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { BackIcon, Cancel } from '@aph/mobile-doctors/src/components/ui/Icons';

const styles = StyleSheet.create({
  cardContainer: {
    margin: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    padding: 20,
    marginBottom: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  headingText: {
    paddingBottom: 8,
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansSemiBold(36),
    marginTop: 28,
  },
  descriptionText: {
    lineHeight: 24,
    color: theme.colors.CARD_DESCRIPTION,
    ...theme.fonts.IBMPlexSansMedium(17),
  },
  buttonStyle: {
    position: 'absolute',
    bottom: 15,
    right: -25,
    height: 64,
    width: 64,
  },
});

export interface OtpCardProps {
  cardContainer?: StyleProp<ViewStyle>;
  heading?: string;
  descriptionTextStyle?: StyleProp<ViewStyle>;
  description?: string;
  disableButton?: boolean;
  buttonIcon?: React.ReactNode;
  onClickButton?: TouchableOpacityProps['onPress'];
  onPress?: TouchableOpacityProps['onPress'];
  isModelCard?: boolean;
}

export const OtpCard: React.FC<OtpCardProps> = (props) => {
  return (
    <View style={[styles.cardContainer, props.cardContainer]}>
      {props.isModelCard ? (
        <TouchableOpacity
          onPress={props.onPress}
          style={{ alignSelf: 'flex-end', marginRight: 16 }}
        >
          <Cancel style={{ height: 24, width: 24, position: 'absolute' }} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={props.onPress} style={{}}>
          <BackIcon style={{ height: 24, width: 24, position: 'absolute' }} />
        </TouchableOpacity>
      )}

      <Text style={styles.headingText}>{props.heading}</Text>
      <Text style={[styles.descriptionText, props.descriptionTextStyle]}>{props.description}</Text>
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={props.disableButton ? () => {} : props.onClickButton}
        activeOpacity={props.disableButton ? 1 : 0.5}
      >
        {props.buttonIcon}
      </TouchableOpacity>
      {props.children}
    </View>
  );
};
