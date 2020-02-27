import { Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.headingText}>{props.heading}</Text>
        </View>
        <View>
          <TouchableOpacity style={styles.arrowview} onPress={() => props.onPress(!props.collapse)}>
            {props.collapse ? <Up /> : <Down />}
          </TouchableOpacity>
        </View>
      </View>
      {props.collapse ? (
        <>
          <View style={{ width: '100%', flex: 1, marginRight: 16 }}>{props.children}</View>
        </>
      ) : null}
    </View>
  );
};
