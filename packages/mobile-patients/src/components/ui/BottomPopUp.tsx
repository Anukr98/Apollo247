import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Mascot, CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  subViewPopup: {
    marginTop: 150,
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  congratulationsTextStyle: {
    marginHorizontal: 24,
    marginTop: 28,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
});

export interface ButtonProps {
  title?: string;
  description?: string;
  physicalText?: string;
  titleStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onPressBack?: () => void;
  removeTopIcon?: boolean;
  physical?: boolean;
  showCloseIcon?: boolean;
  onCloseIconPress?: () => void;
}

export const BottomPopUp: React.FC<ButtonProps> = (props) => {
  return (
    <View style={[styles.showPopUp, props.style]}>
      <TouchableOpacity activeOpacity={1} style={styles.container} onPress={props.onPressBack}>
        {props.showCloseIcon && (
          <View style={{ top: 150, left: 10 }}>
            <TouchableOpacity style={{ width: 40, height: 40 }} onPress={props.onCloseIconPress}>
              <CrossPopup style={{ width: 28, height: 28 }} />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity activeOpacity={1} style={styles.subViewPopup} onPress={() => {}}>
          {!!props.title && (
            <Text style={[styles.congratulationsTextStyle, props.titleStyle]}>{props.title}</Text>
          )}
          {props.physical
            ? props.physicalText
            : !!props.description && (
                <Text style={styles.congratulationsDescriptionStyle}>{props.description}</Text>
              )}
          {props.children}
          {!props.removeTopIcon && <Mascot style={{ position: 'absolute', top: -32, right: 20 }} />}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};
