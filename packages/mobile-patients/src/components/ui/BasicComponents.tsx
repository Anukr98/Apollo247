import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  ImagePropsBase,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Image } from 'react-native-elements';

export interface SectionHeaderProps {
  leftText: string;
  rightText?: string;
  style?: StyleProp<ViewStyle>;
  leftTextStyle?: StyleProp<TextStyle>;
  rightTextStyle?: StyleProp<TextStyle>;
  onPressRightText?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = (props) => {
  const styles = StyleSheet.create({
    labelView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 4,
      borderBottomWidth: 0.5,
      borderColor: 'rgba(2,71,91, 0.3)',
      marginHorizontal: 20,
    },
    labelTextStyle: {
      color: theme.colors.FILTER_CARD_LABEL,
      ...theme.fonts.IBMPlexSansBold(13),
    },
  });

  const { leftText, rightText, style, leftTextStyle, rightTextStyle, onPressRightText } = props;

  return (
    <View style={[styles.labelView, style]}>
      <Text style={[styles.labelTextStyle, leftTextStyle]}>{leftText}</Text>
      {!!rightText && (
        <Text
          onPress={() => onPressRightText && onPressRightText()}
          style={[styles.labelTextStyle, rightTextStyle]}
        >
          {rightText}
        </Text>
      )}
    </View>
  );
};

export interface SpearatorProps {
  style?: StyleProp<ViewStyle>;
}

export const Spearator: React.FC<SpearatorProps> = (props) => {
  const styles = StyleSheet.create({
    separator: {
      ...theme.viewStyles.separator,
    },
  });

  return <View style={[styles.separator, props.style]} />;
};

export const ImagePlaceholderView = () => {
  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
      }}
    >
      {/* <ApolloLogo resizeMode="contain" style={{ flex: 1, height: 'auto', width: 'auto' }} /> */}
    </View>
  );
};

interface AphImageProps extends ImagePropsBase {
  errorPlaceholderView: Element;
}
export const AphImage: React.FC<AphImageProps> = (props) => {
  const [source, setSource] = useState(props.source);
  const { errorPlaceholderView, ...attributes } = props;

  return (
    <Image
      source={source}
      onError={(error) => {
        setSource({ uri: '' });
      }}
      {...attributes}
    />
  );
};
