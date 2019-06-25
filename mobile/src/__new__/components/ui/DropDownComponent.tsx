import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { theme } from 'app/src/__new__/theme/theme';
import { AppImages } from 'app/src/__new__/images/AppImages';

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
    // backgroundColor: 'red'
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
options: ['Me', 'Mother', 'Father', 'Sister', 'Wife', 'Husband', 'Son', 'Daughter', 'Other'];

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
            <Image {...AppImages.ic_dropdown_green} />
          </View>
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsWrapper: {
              // position: 'absolute',
              // left: width- 232,
              // backgroundColor: 'white',
              // borderRadius: 5,
              width: 160,
              // shadowColor: '#000000',
              // shadowOffset: { width: 0, height: 5 },
              // shadowOpacity: 0.5,
              // shadowRadius: 10,
              // elevation: 1,
              // overflow: 'visible',
              // paddingVertical: 9
            },
            optionsContainer: {
              // zIndex:10,
              // top: -100,
              // bottom: -10,
            },
          }}
        >
          {Options.map((menu) => (
            <MenuOption
              value={menu.name}
              customStyles={{ optionsWrapper: { backgroundColor: 'red' } }}
            >
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
