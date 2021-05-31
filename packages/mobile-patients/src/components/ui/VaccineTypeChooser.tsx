import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Text } from 'react-native';
import Menu from 'react-native-material-menu';

import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  menuContainer: {
    width: '80%',
    marginHorizontal: -10,
    borderRadius: 10,
    maxHeight: 300,
    marginTop: 50,
    flexDirection: 'column',
    ...theme.viewStyles.shadowStyle,
    alignItems: 'center',
    paddingVertical: 10,
  },
  selectorTitle: {
    ...theme.viewStyles.text('M', 13, '#AFA4C6'),
    marginHorizontal: 16,
    marginVertical: 8,
  },
  vaccineTypeTitle: {
    ...theme.viewStyles.text('M', 13, '#02475B'),
    marginHorizontal: 16,
    marginVertical: 8,
  },
});

export interface VaccineTypeChooserProps {
  menuContainerStyle?: StyleProp<ViewStyle> | undefined;
  showMenu?: boolean;
  menuHidden?: () => void;
  onVaccineTypeChoosed?: (dose: string) => void;
  vaccineTypeList: string[];
}

export const VaccineTypeChooser: React.FC<VaccineTypeChooserProps> = (props) => {
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
      <TouchableOpacity
        onPress={() => {
          props.onVaccineTypeChoosed?.('');
          hideMenu();
        }}
      >
        <Text style={styles.selectorTitle}>{string.vaccineBooking.select_vaccine_type}</Text>
      </TouchableOpacity>

      {props.vaccineTypeList.map((vaccineType, index) => (
        <TouchableOpacity
          onPress={() => {
            props.onVaccineTypeChoosed?.(vaccineType);
            hideMenu();
          }}
        >
          <Text style={styles.vaccineTypeTitle}>{vaccineType}</Text>
        </TouchableOpacity>
      ))}
    </Menu>
  );
};
