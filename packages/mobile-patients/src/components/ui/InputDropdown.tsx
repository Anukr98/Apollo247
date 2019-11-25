import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
  container: {},
  placeholderTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    // paddingTop: 7,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
});

export interface InputDropdownProps {
  label?: string;
  setShowPopup: (arg0: boolean) => void;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
}

export const InputDropdown: React.FC<InputDropdownProps> = (props) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.container, props.containerStyle]}
      onPress={() => {
        props.setShowPopup(true);
        // setRelationIndex(i);
      }}
    >
      <View style={styles.placeholderViewStyle}>
        <Text style={[styles.placeholderTextStyle, !!props.label ? null : styles.placeholderStyle]}>
          {props.label ? props.label : props.placeholder}
        </Text>
        <DropdownGreen size="sm" />
      </View>
    </TouchableOpacity>
  );
};

export interface InputDropdownMenuProps {
  Options: {
    name: string;
    value: any;
  }[];
  setShowPopup: (arg0: boolean) => void;
  setSelectedOption: (arg0: any) => void;
  width?: number;
}

export const InputDropdownMenu: React.FC<InputDropdownMenuProps> = (props) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        paddingVertical: 9,
        position: 'absolute',
        width: '100%',
        height: '100%',
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 3,
        backgroundColor: 'transparent',
      }}
      onPress={() => props.setShowPopup(false)}
    >
      <View
        style={{
          width: props.width ? props.width : 160,
          borderRadius: 10,
          backgroundColor: 'white',
          marginRight: 20,
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        {props.Options.map(({ name, value }) => (
          <View style={styles.textViewStyle}>
            <Text
              style={styles.textStyle}
              onPress={() => {
                props.setSelectedOption(value);
                props.setShowPopup(false);
              }}
            >
              {name}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};
