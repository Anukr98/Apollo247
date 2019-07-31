import { Cancel } from '@aph/mobile-doctors/src/components/ui/Icons';
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
import { Overlay } from 'react-native-elements';
const styles = StyleSheet.create({
  headingText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
    marginLeft: 16,
    marginBottom: 8,
  },
  descriptionText: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(16),
    marginLeft: 16,
    marginRight: 16,
  },

  iconPlace: {
    height: 24,
    width: 24,
    //position: 'absolute',
  },
  cancelview: {
    height: 12,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 8,
    marginTop: 16,
    ...Platform.select({
      ios: {
        marginRight: 10,
      },
      android: {
        marginRight: 16,
      },
    }),
  },
  containerstyle: { top: -70, justifyContent: 'flex-start', alignItems: 'flex-start' },
});

export interface NeedHelpCardProps {
  heading?: string;
  descriptionTextStyle?: StyleProp<ViewStyle>;
  description?: string;
  onPress?: TouchableOpacityProps['onPress'];
}

export const NeedHelpCard: React.FC<NeedHelpCardProps> = (props) => {
  return (
    <Overlay
      isVisible={true}
      height="auto"
      borderRadius={10}
      overlayStyle={[styles.containerstyle]}
    >
      <View>
        <TouchableOpacity onPress={props.onPress} style={styles.cancelview}>
          <Cancel style={styles.iconPlace} />
        </TouchableOpacity>

        <Text style={styles.headingText}>{props.heading}</Text>
        <Text style={[styles.descriptionText, props.descriptionTextStyle]}>
          {props.description}
        </Text>
        {props.children}
      </View>
    </Overlay>
  );
};
