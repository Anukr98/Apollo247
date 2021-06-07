import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Text, ScrollView } from 'react-native';
import Menu from 'react-native-material-menu';

import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  menuContainer: {
    width: '80%',
    marginHorizontal: -10,
    borderRadius: 10,
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
  slotTitle: {
    ...theme.viewStyles.text('M', 13, '#02475B'),
    marginHorizontal: 16,
    marginVertical: 8,
  },
  noSlotsLabel: {
    ...theme.viewStyles.text('M', 10, theme.colors.APP_RED),
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export interface VaccineSlotChooserProps {
  menuContainerStyle?: StyleProp<ViewStyle> | undefined;
  showMenu?: boolean;
  menuHidden?: () => void;
  onVaccineTypeChoosed?: (dose: string) => void;
  vaccineSlotList: string[];
}
export const VaccineSlotChooser: React.FC<VaccineSlotChooserProps> = (props) => {
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
        <Text style={styles.selectorTitle}>{string.vaccineBooking.choose_slot}</Text>
      </TouchableOpacity>
      {props.vaccineSlotList == null || props.vaccineSlotList.length == 0 ? (
        <Text style={styles.noSlotsLabel}>{string.vaccineBooking.no_slots}</Text>
      ) : null}
      <ScrollView style={{ flex: 1 }} bounces={false}>
        {props.vaccineSlotList.map((vaccineSlot, index) => (
          <TouchableOpacity
            onPress={() => {
              props.onVaccineTypeChoosed?.(vaccineSlot);
              hideMenu();
            }}
          >
            <Text style={styles.slotTitle}>
              {vaccineSlot.session_name || 'Invalid slot session name'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Menu>
  );
};
