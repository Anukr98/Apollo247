import React from 'react';
import { StyleProp, TextStyle, View, ViewStyle, Text } from 'react-native';
import TagCardStyles from '@aph/mobile-doctors/src/components/ui/TagCard.styles';

const styles = TagCardStyles;

export interface TagCardProps {
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TagCard: React.FC<TagCardProps> = (props) => {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <Text style={[styles.labelstyle, props.labelStyle]}>{props.label}</Text>
    </View>
  );
};
