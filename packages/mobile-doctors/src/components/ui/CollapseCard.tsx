import { Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import CollapseCardStyles from '@aph/mobile-doctors/src/components/ui/CollapseCard.styles';

const styles = CollapseCardStyles;

export interface CollapseCardProps {
  collapse: boolean;
  heading?: string;
  showUnderline?: boolean;
  headingStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onPress: (collapse: boolean) => void;
}

export const CollapseCard: React.FC<CollapseCardProps> = (props) => {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <TouchableOpacity activeOpacity={1} onPress={() => props.onPress(!props.collapse)}>
        <View style={styles.subContainer}>
          <Text style={styles.headingText}>{props.heading}</Text>
          <View style={styles.arrowview}>{props.collapse ? <Up /> : <Down />}</View>
        </View>
      </TouchableOpacity>
      {props.collapse ? (
        <>
          <View style={{ width: '100%', flex: 1, marginRight: 16 }}>{props.children}</View>
        </>
      ) : null}
    </View>
  );
};
