import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
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

type Object = {
  key: string;
  value: string;
};

export interface MaterialMenuProps {
  onPress?: (arg0: string | number) => void;
  data?: (string | number)[];
  onPressObject?: (arg0: Object) => void;
  dataObject?: Object[];
  defaultObject?: Object[];
  itemContainer?: StyleProp<ViewStyle> | undefined;
  itemTextStyle?: StyleProp<TextStyle> | undefined;
  menuContainer?: StyleProp<ViewStyle> | undefined;
  selectedText?: string | number;
  selectedTextStyle?: StyleProp<TextStyle> | undefined;
  lastTextStyle?: StyleProp<TextStyle> | undefined;
  lastContainerStyle?: StyleProp<ViewStyle> | undefined;
  bottomPadding?: StyleProp<ViewStyle> | undefined;
}

export const MaterialMenu: React.FC<MaterialMenuProps> = (props) => {
  const menuRef = React.useRef<any>(null);

  const hideMenu = () => {
    menuRef.current.hide();
  };

  const showMenu = () => {
    menuRef.current.show();
  };
  const numbers: (string | number)[] = props.data
    ? props.data
    : Array.from({ length: 20 }).map((_, i) => i + 1);
  const addProfile: Object[] = (props.defaultObject && props.defaultObject) || [];
  let dataObject: Object[] = props.dataObject ? props.dataObject : [];
  dataObject = dataObject.length === 0 ? addProfile : dataObject;
  return (
    <Menu
      ref={menuRef}
      button={<TouchableOpacity onPress={showMenu}>{props.children}</TouchableOpacity>}
      style={[styles.menuContainer, props.menuContainer]}
    >
      <ScrollView bounces={false} style={{ paddingVertical: 8 }}>
        {!!props.dataObject
          ? dataObject.map((item, index) => (
              <MenuItem
                key={item.key}
                onPress={() => {
                  hideMenu();
                  props.onPressObject && props.onPressObject(item);
                }}
                style={[
                  styles.itemContainer,
                  props.itemContainer,
                  dataObject.length - 1 === index ? props.lastContainerStyle : {},
                ]}
                textStyle={[
                  styles.itemTextStyle,
                  props.itemTextStyle,
                  !!props.selectedText && props.selectedText === item.key
                    ? props.selectedTextStyle
                    : {},
                  dataObject.length - 1 === index ? props.lastTextStyle : {},
                ]}
              >
                {item.value}
              </MenuItem>
            ))
          : numbers.map((number, index) => (
              <MenuItem
                key={number}
                onPress={() => {
                  hideMenu();
                  props.onPress && props.onPress(number);
                }}
                style={[
                  styles.itemContainer,
                  props.itemContainer,
                  numbers.length - 1 === index ? props.lastContainerStyle : {},
                ]}
                textStyle={[
                  styles.itemTextStyle,
                  props.itemTextStyle,
                  !!props.selectedText && props.selectedText === number
                    ? props.selectedTextStyle
                    : {},
                  numbers.length - 1 === index ? props.lastTextStyle : {},
                ]}
              >
                {number.toString()}
              </MenuItem>
            ))}
        <View style={[{ paddingBottom: 25 }, props.bottomPadding]} />
      </ScrollView>
    </Menu>
  );
};
