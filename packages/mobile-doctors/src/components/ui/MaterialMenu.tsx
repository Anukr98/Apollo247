import React from 'react';
import { ScrollView, StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Menu, { MenuItem } from 'react-native-material-menu';
import MaterialMenuStyles from '@aph/mobile-doctors/src/components/ui/MaterialMenu.styles';

const styles = MaterialMenuStyles;

export type Option = {
  icon?: Element;
  optionText: string;
  onPress?: () => void;
};

export type OptionsObject = {
  key: string | number;
  value: string | number;
};

interface MenuRefType {
  hide: () => void;
  show: () => void;
}

export interface MaterialMenuProps {
  onPress: (arg0: OptionsObject) => void;
  options: OptionsObject[];
  defaultOptions?: OptionsObject[];
  itemContainer?: StyleProp<ViewStyle> | undefined;
  itemTextStyle?: StyleProp<TextStyle> | undefined;
  menuContainerStyle?: StyleProp<ViewStyle> | undefined;
  selectedText?: string | number;
  selectedTextStyle?: StyleProp<TextStyle> | undefined;
  lastTextStyle?: StyleProp<TextStyle> | undefined;
  lastContainerStyle?: StyleProp<ViewStyle> | undefined;
  bottomPadding?: StyleProp<ViewStyle> | undefined;
}

export const MaterialMenu: React.FC<MaterialMenuProps> = (props) => {
  const menuRef = React.useRef<MenuRefType | null>(null);

  const hideMenu = () => {
    menuRef && menuRef.current && menuRef.current.hide();
  };

  const showMenu = () => {
    menuRef && menuRef.current && menuRef.current.show();
  };
  const defOption: OptionsObject[] = props.defaultOptions ? props.defaultOptions : [];
  let optionsObject: OptionsObject[] = props.options ? props.options : [];
  optionsObject = optionsObject.length === 0 ? defOption : optionsObject;
  return (
    <Menu
      ref={menuRef}
      button={
        <TouchableOpacity activeOpacity={1} onPress={showMenu}>
          {props.children}
        </TouchableOpacity>
      }
      style={[styles.menuContainer, props.menuContainerStyle]}
    >
      <ScrollView bounces={false} style={{ paddingVertical: 8 }}>
        {optionsObject.map((item, index) => (
          <MenuItem
            key={item.key}
            onPress={() => {
              hideMenu();
              props.onPress && props.onPress(item);
            }}
            style={[
              styles.itemContainer,
              props.itemContainer,
              optionsObject.length - 1 === index ? props.lastContainerStyle : {},
            ]}
            textStyle={[
              styles.itemTextStyle,
              props.itemTextStyle,
              !!props.selectedText && props.selectedText === item.key
                ? props.selectedTextStyle
                : {},
              optionsObject.length - 1 === index ? props.lastTextStyle : {},
            ]}
            ellipsizeMode={'tail'}
          >
            {item.value}
          </MenuItem>
        ))}
        <View style={[{ paddingBottom: 25 }, props.bottomPadding]} />
      </ScrollView>
    </Menu>
  );
};
