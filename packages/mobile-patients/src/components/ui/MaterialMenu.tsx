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
  Image,
} from 'react-native';
import Menu, { MenuItem } from 'react-native-material-menu';
import { PrimaryIcon, LinkedUhidIcon, AccountCircleDarkIcon } from './Icons';

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
    backgroundColor: '#fff',
  },
  itemContainer1: {
    height: 38,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 16,
    justifyContent: 'center',
    marginTop: 0,
  },
  itemTextStyle1: {
    padding: 0,
    ...theme.viewStyles.text('M', 16, '#01475b', 1, 21),
  },
  relationText: {
    ...theme.viewStyles.text('M', 12, '#67909C', 1, 16),
  },
  uhidIconStyle: {
    width: Platform.OS === 'ios' ? 12 : 14,
    height: Platform.OS === 'ios' ? 10 : 12,
    marginLeft: Platform.OS === 'ios' ? 12 : 15,
    marginTop: Platform.OS === 'ios' ? 4 : 6,
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
  photoUrl?: string;
  relation?: string;
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
  showProfilePic?: boolean;
  showItemDifferentColor?: boolean;
  profileClickCleverTapEvent?: () => void;
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
    props.profileClickCleverTapEvent && props.profileClickCleverTapEvent();
  };
  const defOption: OptionsObject[] = (props.defaultOptions && props.defaultOptions) || [];
  let optionsObject: OptionsObject[] = props.options ? props.options : [];
  optionsObject = optionsObject.length === 0 ? defOption : optionsObject;

  const renderProfileImage = (photoUrl: string) => {
    return photoUrl?.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/) ? (
      <Image source={{ uri: photoUrl }} style={{ height: 20, width: 20, borderRadius: 10 }} />
    ) : (
      <AccountCircleDarkIcon style={{ height: 24, width: 24, borderRadius: 12 }} />
    );
  };

  const renderUhidIcon = (item: any) => {
    return item?.isPrimary ? (
      !!props.selectedText && props.selectedText === item.key ? (
        <PrimaryIcon style={styles.uhidIconStyle} resizeMode={'contain'} />
      ) : (
        <LinkedUhidIcon style={styles.uhidIconStyle} resizeMode={'contain'} />
      )
    ) : null;
  };

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
      <ScrollView
        bounces={false}
        style={[{ paddingVertical: props.showProfilePic ? 0 : 8 }, props.scrollViewContainerStyle]}
      >
        {optionsObject.map((item, index) =>
          props.showProfilePic ? (
            item?.value === '+add Member' ? null : (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  hideMenu();
                  props.onPress && props.onPress(item);
                }}
                style={[
                  styles.itemContainer1,
                  props.itemContainer,
                  optionsObject.length - 2 === index ? props.lastContainerStyle : {},
                ]}
              >
                <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10 }}>
                  {renderProfileImage(item?.photoUrl!)}
                  <View style={{ marginLeft: 14 }}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.itemTextStyle1,
                        props.itemTextStyle,
                        props.firstOptionText &&
                          index === 0 && { ...theme.viewStyles.text('SB', 16, '#01475b') },
                        !!props.selectedText && props.selectedText === item.key
                          ? props.selectedTextStyle
                          : {},
                      ]}
                    >
                      {item.value}
                      {renderUhidIcon(item)}
                    </Text>
                    <Text
                      style={[
                        styles.relationText,
                        props.firstOptionText &&
                          index === 0 && { ...theme.viewStyles.text('SB', 16, '#01475b') },
                        !!props.selectedText && props.selectedText === item.key
                          ? { ...theme.viewStyles.text('M', 12, '#00b38e', 1, 16) }
                          : {},
                      ]}
                    >
                      {item?.relation}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          ) : (
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
                props.showItemDifferentColor && {
                  ...theme.viewStyles.text('M', 16, '#00B38E', 1, 24),
                },
                props.showItemDifferentColor && optionsObject.length - 1 === index
                  ? {
                      ...theme.viewStyles.text('M', 16, '#E50000', 1, 24),
                    }
                  : {},
              ]}
            >
              {item.value}
              <Text> </Text>
              {renderUhidIcon(item)}
            </MenuItem>
          )
        )}
        <View style={[{ paddingBottom: 25 }, props.bottomPadding]} />
      </ScrollView>
    </Menu>
  );
};
