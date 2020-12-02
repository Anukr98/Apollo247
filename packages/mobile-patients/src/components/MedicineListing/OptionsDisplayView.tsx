import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';
import { Divider } from 'react-native-elements';

export type OptionsDisplayViewItem = {
  icon?: JSX.Element;
  title?: string;
  subtitle?: string;
  titleProps?: TextProps;
  subtitleProps?: TextProps;
  containerStyle?: TouchableOpacityProps['style'];
  itemContainerProps?: TouchableOpacityProps;
  onPress: () => void;
};

export interface Props {
  options: OptionsDisplayViewItem[];
  containerProps?: ViewProps;
  containerStyle?: TouchableOpacityProps['style'];
}

export const OptionsDisplayView: React.FC<Props> = ({
  options,
  containerProps,
  containerStyle,
}) => {
  const renderItem = (item: OptionsDisplayViewItem) => {
    const { icon, onPress, itemContainerProps, containerStyle } = item;
    const width = 100 / options.length;

    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.itemContainer, { width: `${width}%` }, containerStyle]}
        {...itemContainerProps}
      >
        {icon}
        {renderTitleSubtitle(item)}
      </TouchableOpacity>
    );
  };

  const renderTitleSubtitle = (item: OptionsDisplayViewItem) => {
    const { title, subtitle, titleProps, subtitleProps } = item;
    const showView = !!(title || subtitle);

    return (
      showView && (
        <View style={styles.titleSubtitleContainer}>
          {!!title && (
            <Text style={styles.title} {...titleProps}>
              {title}
            </Text>
          )}
          {!!subtitle && (
            <Text style={styles.subtitle} {...subtitleProps}>
              {subtitle}
            </Text>
          )}
        </View>
      )
    );
  };

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  return (
    <View style={[styles.container, containerStyle]} {...containerProps}>
      {options.map((option, index, array) => [
        renderItem(option),
        index + 1 !== array.length && renderDivider(),
      ])}
    </View>
  );
};

const { text } = theme.viewStyles;
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSubtitleContainer: {
    paddingHorizontal: 5,
  },
  title: {
    ...text('R', 12, '#02475B'),
  },
  subtitle: {
    ...text('L', 9, '#02475B'),
  },
  divider: {
    backgroundColor: '#02475B',
    opacity: 0.2,
    height: '100%',
    width: 1,
  },
});
