import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Divider } from 'react-native-elements';

export interface Props {
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  childrenContainerStyle?: StyleProp<ViewStyle>;
}

export const MedSearchSection: React.FC<Props> = ({
  title,
  children,
  containerStyle,
  childrenContainerStyle,
}) => {
  const renderSeparator = () => {
    return <Divider style={styles.divider} />;
  };

  const renderTitle = () => {
    return <Text style={styles.title}>{title}</Text>;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderTitle()}
      {renderSeparator()}
      <View style={[styles.children, childrenContainerStyle]}>{children}</View>
    </View>
  );
};

const { text, card } = theme.viewStyles;
const styles = StyleSheet.create({
  container: {
    ...card(0, 0, 0, '#fff', 5),
    shadowOpacity: 0.3,
    paddingVertical: 15,
    marginBottom: 10,
  },
  title: {
    ...text('SB', 13, '#02475B'),
    paddingHorizontal: 20,
  },
  divider: {
    backgroundColor: '#02475B',
    opacity: 0.5,
    marginVertical: 10,
  },
  children: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
