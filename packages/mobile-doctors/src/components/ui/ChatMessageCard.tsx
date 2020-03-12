import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle, ImageSourcePropType } from 'react-native';
import ChatMessageCardStyles from '@aph/mobile-doctors/src/components/ui/ChatMessageCard.styles';

const styles = ChatMessageCardStyles;

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
