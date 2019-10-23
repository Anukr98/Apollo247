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
  selectedQuantity: string | number;
  onPressQuantity?: (arg0: string | number) => void;
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
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  return (
    <Menu
      ref={setMenuRef}
      button={<TouchableOpacity onPress={showMenu}>{props.children}</TouchableOpacity>}
      style={styles.menuContainer}
    >
      <ScrollView bounces={false} style={{ paddingVertical: 8 }}>
        {numbers.map((number) => (
          <MenuItem
            onPress={() => {
              hideMenu();
              props.onPressQuantity && props.onPressQuantity(number);
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
