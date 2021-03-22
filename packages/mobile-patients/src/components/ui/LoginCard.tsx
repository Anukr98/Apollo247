import { theme } from '@aph/mobile-patients/src/theme/theme';
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
  Platform,
  Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  cardContainer: {
    margin: 20,
    borderRadius: 8,
    backgroundColor: theme.colors.WHITE,
    padding: 0,
    marginBottom: 0,
    shadowColor: 'rgba(128, 128, 128, 0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  headingText: {
    paddingBottom: 8,
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansSemiBold(24),
  },
  descriptionText: {
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  buttonStyle: {
    height: 64,
    width: 64,
    zIndex: 20,
    marginTop: 8,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#3246a7',
    transform: [{ rotate: '180deg' }],
    marginLeft: 15,
  },
  cardHeadingContainer: {
    backgroundColor: '#3246a7',
    borderTopRightRadius: 8,
    borderTopEndRadius: 8,
    borderTopLeftRadius: 8,
    borderTopStartRadius: 8,
    padding: 16,
    paddingTop: 20,
    paddingBottom: 28,
  },
  row: {
    flexDirection: 'row',
  },
  rowAbsoluteView: {
    position: 'absolute',
    right: 0,
  },
});

export interface CardProps {
  cardContainer?: StyleProp<ViewStyle>;
  heading?: string;
  descriptionTextStyle?: StyleProp<TextStyle>;
  headingTextStyle?: StyleProp<TextStyle>;
  description?: string;
  disableButton?: boolean;
  buttonIcon?: React.ReactNode;
  onClickButton?: TouchableOpacityProps['onPress'];
  buttonStyle?: StyleProp<ViewStyle>;
}

export const LoginCard: React.FC<CardProps> = (props) => {
  const { heading, description } = props;
  return (
    <View style={[styles.cardContainer, props.cardContainer]}>
      <View style={styles.cardHeadingContainer}>
        {heading && <Text style={[styles.headingText, props.headingTextStyle]}>{heading}</Text>}
        <Text style={[styles.descriptionText, props.descriptionTextStyle]}>{description}</Text>
      </View>
      <View style={[styles.triangle]} />
      <View style={styles.row}>
        <View>{props.children}</View>
        <View style={styles.rowAbsoluteView}>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.buttonStyle, props.buttonStyle]}
            onPress={props.disableButton ? () => {} : props.onClickButton}
          >
            {props.buttonIcon}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
