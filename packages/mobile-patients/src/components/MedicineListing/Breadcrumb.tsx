import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

interface BreadcrumbLink {
  title: string;
  onPress?: () => void;
}

export interface Props {
  links: BreadcrumbLink[];
  containerStyle?: ViewProps['style'];
}

export const Breadcrumb: React.FC<Props> = ({ containerStyle, links }) => {
  return (
    <View style={[styles.containerStyle, containerStyle]}>
      {links?.map(({ title, onPress }, index, array) => [
        <Text
          onPress={onPress}
          style={index == array?.length - 1 ? styles.textStyleLast : styles.textStyle}
        >
          {title}
        </Text>,
        index + 1 !== array?.length && <ArrowRight style={styles.arrowRight} />,
      ])}
    </View>
  );
};

const { text } = theme.viewStyles;
const { LIGHT_BLUE } = theme.colors;

const styles = StyleSheet.create({
  containerStyle: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  textStyle: {
    ...text('R', 11, LIGHT_BLUE, 1, 20),
  },
  textStyleLast: {
    ...text('SB', 11, LIGHT_BLUE, 1, 20),
  },
  arrowRight: {
    height: 18,
    width: 18,
    paddingHorizontal: 8,
  },
});
