import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';

const styles = StyleSheet.create({
  headingText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(17),
    marginLeft: 16,
    textAlign: 'left',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  receiveText: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    marginLeft: 16,
    textAlign: 'left',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    marginBottom: 20,
  },
});

export interface ChatMessageCardProps {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  variant?: 'sent' | 'received';
  placeholderImage?: ImageSourcePropType;
}

export const ChatMessageCard: React.FC<ChatMessageCardProps> = (props) => {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          {props.variant === 'sent' ? (
            <Text style={styles.headingText}>{props.text}</Text>
          ) : (
            <Text style={styles.receiveText}>{props.text}</Text>
          )}
        </View>
      </View>
    </View>
  );
};
