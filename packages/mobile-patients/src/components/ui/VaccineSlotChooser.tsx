import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Text,
  ScrollView,
  Dimensions,
  View,
} from 'react-native';
import moment from 'moment';
import Menu from 'react-native-material-menu';
const { width } = Dimensions.get('window');
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

import string from '@aph/mobile-patients/src/strings/strings.json';
import { SyringSmall } from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  menuContainer: {
    width: width - 80,
    flex: 1,
    borderRadius: 10,
    flexDirection: 'column',
    ...theme.viewStyles.shadowStyle,
    alignItems: 'center',
    maxHeight: 150,
  },
  selectorTitle: {
    ...theme.viewStyles.text('M', 13, '#AFA4C6'),
    marginHorizontal: 16,
    marginVertical: 8,
  },
  slotTitle: {
    ...theme.viewStyles.text('M', 13, '#02475B'),
    marginHorizontal: 16,
    flex: 1,
  },

  slotTitleSlotFull: {
    ...theme.viewStyles.text('M', 13, '#AFA4C6'),
    marginHorizontal: 16,
    flex: 1,
  },

  noSlotsLabel: {
    ...theme.viewStyles.text('M', 10, theme.colors.APP_RED),
    marginHorizontal: 20,
    marginBottom: 20,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#D6CEE3',
  },
  vaccineTypeTitle: {
    alignSelf: 'flex-end',
    ...theme.viewStyles.text('R', 9, theme.colors.SHERPA_BLUE),
  },
  amountTitle: {
    alignSelf: 'flex-end',
    ...theme.viewStyles.text('M', 12, theme.colors.GREEN),
  },
  slotFull: {
    alignSelf: 'flex-end',
    ...theme.viewStyles.text('M', 10, '#AFA4C6'),
  },
});

export interface VaccineSlotChooserProps {
  menuContainerStyle?: StyleProp<ViewStyle> | undefined;
  showMenu?: boolean;
  menuHidden?: () => void;
  onVaccineSlotChoosed?: (slot: string) => void;
  vaccineSlotList: string[];
}
export const VaccineSlotChooser: React.FC<VaccineSlotChooserProps> = (props) => {
  const menuRef = React.useRef<any>(null);
  const { showAphAlert, hideAphAlert } = useUIElements();

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
          props.onVaccineSlotChoosed?.('');
          hideMenu();
        }}
      >
        <Text style={styles.selectorTitle}>{string.vaccineBooking.choose_slot}</Text>
      </TouchableOpacity>
      {props.vaccineSlotList == null || props.vaccineSlotList.length == 0 ? (
        <Text style={styles.noSlotsLabel}>{string.vaccineBooking.no_slots}</Text>
      ) : null}
      <ScrollView style={{ marginBottom: 5 }} showsVerticalScrollIndicator={true}>
        {props.vaccineSlotList.map((vaccineSlot, index) => (
          <View style={{}}>
            <TouchableOpacity
              onPress={() => {
                var endDateTime = moment(vaccineSlot.end_date_time);
                var nowTime = moment(new Date());
                var duration = moment.duration(endDateTime.diff(nowTime)).asMinutes();

                if (duration >= 1) {
                  props.onVaccineSlotChoosed?.(vaccineSlot);
                } else {
                  showAphAlert!({
                    title: `Oops, its too late :(`,
                    description:
                      'You can not book this slot now, its too late. Please select any other slot.',
                  });
                }

                hideMenu();
              }}
              style={{
                minHeight: 48,
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={
                  vaccineSlot.available_for_booking ? styles.slotTitle : styles.slotTitleSlotFull
                }
              >
                {vaccineSlot.session_name || 'Invalid slot session name'}
              </Text>

              {vaccineSlot.available_for_booking ? (
                <SyringSmall style={{ width: 13.5, height: 13.5, marginHorizontal: 5 }} />
              ) : null}

              <View style={{ marginRight: 16 }}>
                {vaccineSlot.available_for_booking ? (
                  <>
                    {vaccineSlot.vaccine_type ? (
                      <Text style={styles.vaccineTypeTitle}>{vaccineSlot.vaccine_type || ''}</Text>
                    ) : null}

                    {vaccineSlot.selling_price ? (
                      <Text style={styles.amountTitle}> ₹ {vaccineSlot.selling_price || '0'}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.slotFull}>Slot Full</Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
          </View>
        ))}
      </ScrollView>
    </Menu>
  );
};
