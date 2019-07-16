import { DropdownGreen } from '@aph/mobile-doctors//src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors//src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

const styles = StyleSheet.create({
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingBottom: 10,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 10,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 7,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
});

type options = {
  name: string;
};

const Options: options[] = [
  {
    name: 'Me',
  },
  {
    name: 'Mother',
  },
  {
    name: 'Father',
  },
  {
    name: 'Sister',
  },
  {
    name: 'Wife',
  },
  {
    name: 'Father',
  },
  {
    name: 'Husband',
  },
  {
    name: 'Son',
  },
  {
    name: 'Daughter',
  },
  {
    name: 'Other',
  },
];

export interface DropDownComponentProps {}

export const DropDownComponent: React.FC<DropDownComponentProps> = (props) => {
  const [relation, setRelation] = useState<string>('Relations');

  return (
    <View style={{ paddingTop: 5, paddingBottom: 10 }}>
      <Menu
        onSelect={(selectedValue) => {
          setRelation(selectedValue);
        }}
      >
        <MenuTrigger>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                styles.placeholderTextStyle,
                relation === 'Relations' ? styles.placeholderStyle : null,
              ]}
            >
              {relation}
            </Text>
            <DropdownGreen size="sm" />
          </View>
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsWr@aph/mobile-doctors/er: {
              width: 160,
              paddingVertical: 9,
            },
            optionsContainer: {},
          }}
        >
          {Options.map((menu) => (
            <MenuOption value={menu.name}>
              <View style={styles.textViewStyle}>
                <Text style={styles.textStyle}>{menu.name}</Text>
              </View>
            </MenuOption>
          ))}
        </MenuOptions>
      </Menu>
    </View>
  );
};
