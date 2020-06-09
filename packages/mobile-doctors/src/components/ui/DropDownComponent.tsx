import { Dropdown } from '@aph/mobile-doctors/src/components/ui/Icons';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import DropDownComponentStyles from '@aph/mobile-doctors/src/components/ui/DropDownComponent.styles';

const styles = DropDownComponentStyles;

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
            <Dropdown size="sm" />
          </View>
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsWrapper: {
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
