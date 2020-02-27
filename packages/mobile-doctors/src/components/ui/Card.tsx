import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import CardStyles from '@aph/mobile-doctors/src/components/ui/Card.styles';

const styles = CardStyles;

export interface CardProps {
  cardContainer?: StyleProp<ViewStyle>;
  heading?: string;
  descriptionTextStyle?: StyleProp<TextStyle>;
  headingTextStyle?: StyleProp<TextStyle>;
  description?: string;
  disableButton?: boolean;
  buttonIcon?: React.ReactNode;
  onClickButton?: TouchableOpacityProps['onPress'];
}

export const Card: React.FC<CardProps> = (props) => {
  return (
    <View style={[styles.cardContainer, props.cardContainer]}>
      <Text style={[styles.headingText, props.headingTextStyle]}>{props.heading}</Text>
      <Text style={[styles.descriptionText, props.descriptionTextStyle]}>{props.description}</Text>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.buttonStyle}
        onPress={props.disableButton ? () => {} : props.onClickButton}
      >
        {props.buttonIcon}
      </TouchableOpacity>
      {props.children}
    </View>
  );
};
