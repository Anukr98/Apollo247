import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ScrollView,
  Dimensions,
} from 'react-native';
import Menu, { MenuItem } from 'react-native-material-menu';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  cardContainer: {
    ...theme.viewStyles.cardViewStyle,
    margin: 16,
    padding: 16,
  },
  descriptiontext: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(14),
    textAlign: 'left',
  },
  separator: {
    borderBottomColor: '#02475b',
    borderBottomWidth: 1,
    marginVertical: 7.5,
    opacity: 0.1,
  },
  itemContainer: {
    height: 38,
    // width: 100,
    // paddingVertical: 7.5,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 16,
  },
  itemTextStyle: {
    padding: 0,
    ...theme.viewStyles.text('M', 18, '#01475b'),
  },
  menuContainer: {
    borderRadius: 10,
    maxHeight: 500,
    // width: 100,
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
  const [selectedData, setselectedData] = useState<string | number>(
    props.selectedQuantity ? props.selectedQuantity : 0
  );

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
      // button={<Text onPress={this.showMenu}>Show menu</Text>}
      button={
        <TouchableOpacity
          onPress={showMenu}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingRight: 8,
            borderRightWidth: 0.5,
            borderRightColor: 'rgba(2, 71, 91, 0.2)',
          }}
        >
          <Text style={theme.viewStyles.text('SB', 14, '#02475b', 1, 24, 0.35)}>
            QTY : {selectedData}
          </Text>
          <DropdownGreen />
        </TouchableOpacity>
      }
      style={styles.menuContainer}
    >
      <ScrollView bounces={false} style={{ paddingVertical: 8 }}>
        {numbers.map((number) => (
          <MenuItem
            onPress={() => {
              hideMenu();
              setselectedData(number);
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
