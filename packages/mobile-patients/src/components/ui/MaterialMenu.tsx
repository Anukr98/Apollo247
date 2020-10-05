import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextStyle,
  StyleProp,
  ViewStyle,
  Platform,
  Text,
} from 'react-native';
import Menu, { MenuItem } from 'react-native-material-menu';
import { PrimaryIcon, LinkedUhidIcon } from './Icons';

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

type OptionsObject = {
  key: string;
  value: string | number;
  isPrimary?: boolean;
  data?: any;
  uhid?: string;
};

export interface MaterialMenuProps {
  onPress: (arg0: OptionsObject) => void;
  options: OptionsObject[];
  defaultOptions?: OptionsObject[];
  itemContainer?: StyleProp<ViewStyle> | undefined;
  itemTextStyle?: StyleProp<TextStyle> | undefined;
  menuContainerStyle?: StyleProp<ViewStyle> | undefined;
  scrollViewContainerStyle?: StyleProp<ViewStyle> | undefined;
  selectedText?: string | number;
  firstOptionText?: boolean | undefined;
  selectedTextStyle?: StyleProp<TextStyle> | undefined;
  lastTextStyle?: StyleProp<TextStyle> | undefined;
  lastContainerStyle?: StyleProp<ViewStyle> | undefined;
  bottomPadding?: StyleProp<ViewStyle> | undefined;
  showMenu?: boolean;
  menuHidden?: () => void;
}

export const MaterialMenu: React.FC<MaterialMenuProps> = (props) => {
  const menuRef = React.useRef<any>(null);
  useEffect(() => {
    if (props.showMenu) {
      showMenu();
    }
  }, [props.showMenu]);

  const hideMenu = () => {
    menuRef.current.hide();
  };

  const showMenu = () => {
    menuRef.current.show();
  };
  const defOption: OptionsObject[] = (props.defaultOptions && props.defaultOptions) || [];
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
      onHidden={() => {
        props.menuHidden && props.menuHidden();
      }}
    >
      <ScrollView bounces={false} style={[{ paddingVertical: 8 }, props.scrollViewContainerStyle]}>
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
              props.firstOptionText &&
                index === 0 && { ...theme.viewStyles.text('SB', 16, '#01475b') },
              !!props.selectedText && props.selectedText === item.key
                ? props.selectedTextStyle
                : {},
              optionsObject.length - 1 === index ? props.lastTextStyle : {},
            ]}
          >
            {item.value}
            <Text> </Text>
            {item.isPrimary ? (
              !!props.selectedText && props.selectedText === item.key ? (
                <PrimaryIcon
                  style={{
                    width: Platform.OS === 'ios' ? 12 : 14,
                    height: Platform.OS === 'ios' ? 10 : 12,
                    marginLeft: Platform.OS === 'ios' ? 12 : 15,
                    marginTop: Platform.OS === 'ios' ? 4 : 6,
                  }}
                  resizeMode={'contain'}
                />
              ) : (
                <LinkedUhidIcon
                  style={{
                    width: Platform.OS === 'ios' ? 12 : 14,
                    height: Platform.OS === 'ios' ? 10 : 12,
                    marginLeft: Platform.OS === 'ios' ? 12 : 15,
                    marginTop: Platform.OS === 'ios' ? 4 : 6,
                  }}
                  resizeMode={'contain'}
                />
              )
            ) : null}
          </MenuItem>
        ))}
        <View style={[{ paddingBottom: 25 }, props.bottomPadding]} />
      </ScrollView>
    </Menu>
  );
};
