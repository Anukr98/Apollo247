import { ArrowUpGreen, Down } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ListItem } from 'react-native-elements';

export interface Props {
  title: string;
  isOpen: boolean;
  onPress: () => void;
  containerStyle?: TouchableOpacityProps['style'];
}

export const Accordion: React.FC<Props> = ({
  title,
  isOpen,
  onPress,
  containerStyle,
  children,
}) => {
  const renderToggleView = () => {
    const rightIcon = isOpen ? <ArrowUpGreen /> : <Down />;
    return (
      <ListItem
        key={title}
        title={title}
        rightIcon={rightIcon}
        onPress={onPress}
        bottomDivider
        containerStyle={[styles.headerContainer, isOpen && styles.selectedBorder]}
        titleStyle={isOpen ? styles.selectedHeaderText : styles.headerText}
        Component={TouchableOpacity}
      />
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderToggleView()}
      {isOpen && children}
    </View>
  );
};

const { text } = theme.viewStyles;
const { LIGHT_BLUE, APP_GREEN, CLEAR } = theme.colors;

const styles = StyleSheet.create({
  container: { marginHorizontal: 5 },
  headerContainer: {
    backgroundColor: CLEAR,
    paddingLeft: 15,
    paddingRight: 15,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(1,48,91,0.2)',
  },
  selectedBorder: {
    borderBottomColor: APP_GREEN,
  },
  headerText: {
    ...text('M', 14, LIGHT_BLUE),
    paddingVertical: 15,
  },
  selectedHeaderText: {
    ...text('SB', 14, APP_GREEN),
    paddingVertical: 15,
  },
});
