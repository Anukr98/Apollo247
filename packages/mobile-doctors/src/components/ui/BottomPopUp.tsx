import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Mascot } from '@aph/mobile-doctors/src/components/ui/Icons';
import BottomPopUpStyles from '@aph/mobile-doctors/src/components/ui/BottomPopUp.styles';

const styles = BottomPopUpStyles;

export interface ButtonProps {
  title?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onPressBack?: () => void;
}

export const BottomPopUp: React.FC<ButtonProps> = (props) => {
  return (
    <View style={[styles.showPopUp, props.style]}>
      <TouchableOpacity activeOpacity={1} style={styles.container} onPress={props.onPressBack}>
        <TouchableOpacity activeOpacity={1} style={styles.subViewPopup} onPress={() => {}}>
          {!!props.title && <Text style={styles.congratulationsTextStyle}>{props.title}</Text>}
          {!!props.description && (
            <Text style={styles.congratulationsDescriptionStyle}>{props.description}</Text>
          )}
          {props.children}
          <Mascot style={{ position: 'absolute', top: -32, right: 20 }} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};
