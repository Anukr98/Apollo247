import { Down, Up } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
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

const styles = StyleSheet.create({
  headingText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'left',
    justifyContent: 'center',
    textTransform: 'uppercase',
  },

  container: {},

  arrowview: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 16,
  },
  labelView: {
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...theme.viewStyles.lightSeparatorStyle,
  },
});

export interface CollapseCardProps {
  collapse: boolean;
  heading?: string;
  showUnderline?: boolean;
  headingStyle?: StyleProp<TextStyle>;
  labelViewStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onPress: (collapse: boolean) => void;
}

export const CollapseCard: React.FC<CollapseCardProps> = (props) => {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={[styles.labelView, props.labelViewStyle]}>
        <View>
          <Text style={[styles.headingText, props.headingStyle]}>{props.heading}</Text>
        </View>
        <View>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.arrowview}
            onPress={() => props.onPress(!props.collapse)}
          >
            {props.collapse ? <Up /> : <Down />}
          </TouchableOpacity>
        </View>
      </View>
      {props.collapse ? props.children : <View style={{ height: 20 }} />}
    </View>
  );
};
