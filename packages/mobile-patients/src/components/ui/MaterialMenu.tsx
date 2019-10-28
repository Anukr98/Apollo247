import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Menu, { MenuItem } from 'react-native-material-menu';

const styles = StyleSheet.create({
  itemContainer: {
    height: 38,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 16,
  },
  itemTextStyle: {
    padding: 0,
    ...theme.viewStyles.text('M', 18, '#01475b'),
  },
  menuContainer: {
    borderRadius: 10,
    maxHeight: 200,
    alignItems: 'center',
    ...theme.viewStyles.shadowStyle,
  },
});

export type Option = {
  icon?: Element;
  optionText: string;
  onPress?: () => void;
};

export interface MaterialMenuProps {
  onPress?: (arg0: string | number) => void;
  data?: (string | number)[];
}

export const MaterialMenu: React.FC<MaterialMenuProps> = (props) => {
  let _menu = null;

  const setMenuRef = (ref) => {
    _menu = ref;
  };

  const hideMenu = () => {
    _menu.hide();
  };

  const showMenu = () => {
    _menu.show();
  };
  const numbers: (string | number)[] = props.data
    ? props.data
    : Array.from({ length: 20 }).map((_, i) => i + 1);
  return (
    <Menu
      ref={setMenuRef}
      button={<TouchableOpacity onPress={showMenu}>{props.children}</TouchableOpacity>}
      style={styles.menuContainer}
    >
      <ScrollView bounces={false} style={{ paddingVertical: 8 }}>
        {numbers.map((number) => (
          <MenuItem
            key={number}
            onPress={() => {
              hideMenu();
              props.onPress && props.onPress(number);
            }}
            style={styles.itemContainer}
            textStyle={styles.itemTextStyle}
          >
            {number}
          </MenuItem>
        ))}
        <View style={{ paddingBottom: 25 }} />
      </ScrollView>
    </Menu>
  );
};
