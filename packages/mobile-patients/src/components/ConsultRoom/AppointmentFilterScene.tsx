import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CalendarClose,
  CalendarShow,
  Reload,
  CloseCal,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { CalendarView } from '@aph/mobile-patients/src/components/ui/CalendarView';
import moment from 'moment';
import { AppointmentFilterObject } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import _ from 'lodash';
import strings from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    elevation: 5,
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '96%',
    paddingBottom: 20,
  },
  buttonStyle: {
    width: 'auto',
    height: 'auto',
    marginRight: 8,
    marginTop: 11,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  calendarStyle: {
    display: 'flex',
    backgroundColor: '#f7f8f5',
    shadowRadius: 0,
    elevation: 0,
  },
  calendarMainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  calendarMainViewStyle: {
    width: '97.4%',
    height: 42,
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeIconStyle: {
    width: 28,
    height: 28,
  },
  calendarViewStyle: {
    borderBottomWidth: 0.1,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  content: {
    flexDirection: 'row',
  },
  menuColumn: {
    width: '33%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.CARD_BG,
  },
  menuItem: {
    paddingVertical: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.2,
    borderBottomColor: theme.colors.LIGHT_GRAY_2,
    flexDirection: 'row',
  },
  selectedMenuItem: {
    backgroundColor: theme.colors.WHITE,
  },
  menuItemText: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
  },
  settingsColumn: {
    flex: 1,
    padding: 15,
  },
  selectedMenuItemText: {
    ...theme.viewStyles.text('M', 14, theme.colors.BONDI_BLUE),
  },
  availabilityTextStyle: {
    ...theme.viewStyles.text('M', 15, '#02475b'),
  },
});

interface AppointmentFilterSceneProps {
  setFilter: (filter: AppointmentFilterObject) => void;
  filter: AppointmentFilterObject;
  setIsFilterOpen: (filterOpen: boolean) => void;
  filterDoctorsList: string[];
  filterSpecialtyList: string[];
  selectedDate: Date | null;
  setSelectedDate: (selectedDate: Date | null) => void;
}

export const AppointmentFilterScene: React.FC<AppointmentFilterSceneProps> = (props) => {
  const {
    filter,
    setFilter,
    setIsFilterOpen,
    filterDoctorsList,
    filterSpecialtyList,
    selectedDate,
    setSelectedDate,
  } = props;
  const availabilityList = strings.appointments.availabilityList;
  const appointmentStatus = strings.appointments.appointmentStatus;
  const [showCalander, setshowCalander] = useState<boolean>(false);
  const [localFilter, setLocalFilter] = useState<AppointmentFilterObject>(_.cloneDeep(filter));
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDateText, setSelectedDateText] = useState('');

  const filterValues = (valueList: Array<string>, value: string) => {
    if (valueList.includes(value)) {
      valueList = valueList.filter((val) => val !== value);
    } else {
      valueList.push(value);
    }
    return valueList;
  };

  const setFilterValues = (type: string, value: string, remDate: boolean = false) => {
    if (type === 'appointmentStatus') {
      const appointmentStatus = filterValues(localFilter?.appointmentStatus || [], value);
      setLocalFilter({ ...localFilter, appointmentStatus });
    } else if (type === 'availability') {
      const availability = availabilityFilterValue(localFilter?.availability || [], value, remDate);
      setLocalFilter({ ...localFilter, availability });
    } else if (type === 'doctor') {
      const doctorsList = filterValues(localFilter?.doctorsList || [], value);
      setLocalFilter({ ...localFilter, doctorsList });
    } else if (type === 'specialty') {
      const specialtyList = filterValues(localFilter?.specialtyList || [], value);
      setLocalFilter({ ...localFilter, specialtyList });
    }
  };

  const availabilityFilterValue = (
    valueList: Array<string>,
    value: string,
    remDate: boolean = true
  ) => {
    if (remDate && valueList.includes(dateFormatText(selectedDate!))) {
      const ind = valueList.indexOf(dateFormatText(selectedDate!));
      valueList.splice(ind, 1, value);
    } else if (valueList.includes(value)) {
      valueList = valueList.filter((val) => val !== value);
    } else {
      valueList.push(value);
    }
    return valueList;
  };

  useEffect(() => {
    selectedDate && setSelectedDateText(dateFormatText(selectedDate));
  }, []);

  const dateFormatText = (filterDate: Date) => {
    return moment(filterDate).format('DD/MM/YYYY');
  };

  const [menuItems, setMenuItems] = useState([
    { id: '0', name: 'Appointment Status' },
    { id: '1', name: 'Date' },
    { id: '2', name: 'Doctor' },
    { id: '3', name: 'Speciality' },
  ]);
  const renderFilterSection = (id: number) => {
    const options =
      id === 0
        ? appointmentStatus
        : id === 1
        ? availabilityList
        : id === 2
        ? filterDoctorsList
        : filterSpecialtyList;
    const filterTypeValue =
      id === 0
        ? 'appointmentStatus'
        : id === 1
        ? 'availability'
        : id === 2
        ? 'doctor'
        : 'specialty';
    const optionsSelected =
      id === 0
        ? localFilter?.appointmentStatus
        : id === 1
        ? localFilter?.availability
        : id === 2
        ? localFilter?.doctorsList
        : localFilter?.specialtyList;

    return (
      <>
        <View style={[styles.optionsView]}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showCalander}
            onRequestClose={() => {
              setshowCalander(false);
            }}
            onDismiss={() => {
              setshowCalander(false);
            }}
          >
            <View style={styles.calendarMainView}>
              <View style={styles.calendarMainViewStyle}>
                <View>
                  <Text style={styles.availabilityTextStyle}>Availability</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setshowCalander(false);
                  }}
                >
                  <CloseCal style={styles.closeIconStyle} />
                </TouchableOpacity>
              </View>
              <View style={styles.calendarViewStyle} />
              <CalendarView
                styles={styles.calendarStyle}
                date={date}
                onPressDate={(date) => {
                  setSelectedDateText(dateFormatText(date));
                  const availability = availabilityFilterValue(
                    localFilter?.availability || [],
                    dateFormatText(date)
                  );
                  setLocalFilter({ ...localFilter, availability });
                  setSelectedDate(date);
                  setshowCalander(false);
                }}
                showWeekView={false}
              />
            </View>
          </Modal>
          {options.map((name, index) => (
            <Button
              title={name}
              style={[
                styles.buttonStyle,
                isOptionSelected(optionsSelected || [], name)
                  ? { backgroundColor: theme.colors.APP_GREEN }
                  : null,
              ]}
              titleTextStyle={[
                styles.buttonTextStyle,
                isOptionSelected(optionsSelected || [], name)
                  ? { color: theme.colors.WHITE }
                  : null,
              ]}
              onPress={() => {
                setFilterValues(filterTypeValue, name);
              }}
            />
          ))}
          {id === 1 && selectedDateText ? (
            <Button
              title={selectedDateText}
              style={[
                styles.buttonStyle,
                selectedDateText ? { backgroundColor: theme.colors.APP_GREEN } : null,
              ]}
              titleTextStyle={[
                styles.buttonTextStyle,
                selectedDateText ? { color: theme.colors.WHITE } : null,
              ]}
              onPress={() => {
                setSelectedDate(null);
                setSelectedDateText('');
                const availability = availabilityFilterValue(
                  localFilter?.availability || [],
                  selectedDateText,
                  false
                );
                setLocalFilter({ ...localFilter, availability });
              }}
            />
          ) : null}
          {id === 1 ? (
            <TouchableOpacity
              style={{ position: 'absolute', right: 10, top: 15 }}
              activeOpacity={1}
              onPress={() => {
                setshowCalander(!showCalander);
              }}
            >
              {showCalander ? <CalendarClose /> : <CalendarShow />}
            </TouchableOpacity>
          ) : null}
        </View>
      </>
    );
  };

  const isOptionSelected = (type: Array<string>, value: string) => {
    return type.includes(value) ? true : false;
  };

  const renderSelectedView = (selectedItem: string) => {
    switch (selectedItem) {
      case '0':
        return renderFilterSection(0);
      case '1':
        return renderFilterSection(1);
      case '2':
        return renderFilterSection(2);
      case '3':
        return renderFilterSection(3);
    }
  };

  // this holds the keys of the menuItems for the view to know which category is currently being rendered.
  const [selectedItem, setSelectedItem] = useState('0');
  const filtersCard = () => {
    return (
      <View style={styles.content}>
        <View style={styles.menuColumn}>
          {menuItems.map((item, index) => {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedItem(item.id)}
                style={[styles.menuItem, item.id === selectedItem ? styles.selectedMenuItem : null]}
              >
                <Text
                  style={[
                    item.id === selectedItem ? styles.selectedMenuItemText : styles.menuItemText,
                    { textAlign: 'center' },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View
            style={{ display: 'flex', backgroundColor: theme.colors.CARD_BG, height: '100%' }}
          />
        </View>
        <View style={styles.settingsColumn}>{renderSelectedView(selectedItem)}</View>
      </View>
    );
  };

  const closePop = () => {
    setFilter(localFilter);
    setIsFilterOpen(false);
  };
  const renderTopView = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'close'}
        title="FILTERS"
        rightComponent={
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              const initialAppointmentFilterObject: AppointmentFilterObject = {
                appointmentStatus: [],
                availability: [],
                doctorsList: [],
                specialtyList: [],
              };
              setLocalFilter(initialAppointmentFilterObject);
              setFilter(initialAppointmentFilterObject);
              setSelectedDate(null);
              setSelectedDateText('');
            }}
          >
            <Reload />
          </TouchableOpacity>
        }
        onPressLeftIcon={() => closePop()}
      />
    );
  };

  const bottomButton = () => {
    const filterLength =
      (localFilter && localFilter.availability?.length) ||
      (localFilter && localFilter.appointmentStatus?.length) ||
      (localFilter && localFilter.doctorsList?.length) ||
      (localFilter && localFilter.specialtyList?.length) ||
      0;
    return (
      <StickyBottomComponent
        style={{ backgroundColor: theme.colors.WHITE, elevation: 20, height: '12%' }}
      >
        <Button
          title={'APPLY FILTERS'}
          style={{ flex: 1, marginHorizontal: 40, marginTop: 15 }}
          onPress={() => {
            setFilter(localFilter);
            setIsFilterOpen(false);
          }}
          disabled={filterLength > 0 ? false : true}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderTopView()}
      <ScrollView style={{ flex: 1 }} bounces={false}>
        {filtersCard()}
        <View style={{ height: 160 }} />
      </ScrollView>
      {bottomButton()}
    </SafeAreaView>
  );
};
