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
  Platform,
} from 'react-native';
import { BackIcon, Cancel } from '@aph/mobile-doctors/src/components/ui/Icons';
import OtpCardStyles from '@aph/mobile-doctors/src/components/ui/OtpCard.styles';

const styles = OtpCardStyles;

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
  headingTextStyle?: StyleProp<ViewStyle>;
}

export const OtpCard: React.FC<OtpCardProps> = (props) => {
  return (
    <View style={[styles.cardContainer, props.cardContainer]}>
      {props.isModelCard ? (
        <TouchableOpacity
          onPress={props.onPress}
          style={{ alignSelf: 'flex-end', marginRight: 16 }}
        >
          <View style={{ height: 10 }}>
            <Cancel style={styles.iconPlace} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={props.onPress} style={{ height: 10 }}>
          <BackIcon style={styles.iconPlace} />
        </TouchableOpacity>
      )}

      <Text style={[styles.headingText, props.headingTextStyle]}>{props.heading}</Text>
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
