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
    // ...theme.viewStyles.container,
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
  cardContainer: {
    padding: 20,
    paddingBottom: 0,
    // paddingTop: 16,
    marginVertical: 4,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: '#f7f8f5',
    // shadowColor: '#4c808080',
    // shadowOffset: { width: 0, height: 5 },
    // shadowOpacity: 0.2,
    // elevation: 2,
  },
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  rightText: {
    color: theme.colors.APP_YELLOW,
    ...theme.fonts.IBMPlexSansSemiBold(13),
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
  brandStyle: {
    width: '46%',
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    marginHorizontal: 4,
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
  //start
  content: {
    flexDirection: 'row',
    // flex: 0.7,
  },
  sectionHeaderStyles: {
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 10,
    marginVertical: 5,
  },
  checkboxViewStyle: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('M', 15, '#02475b'),
    marginLeft: 9,
  },
  searchInputStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // menu Column - left
  menuColumn: {
    width: '33%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.CARD_BG,
  },
  menuItem: {
    paddingVertical: 21,
    paddingRight: 12,
    paddingLeft: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: theme.colors.CARD_BG,
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

  // settings column -right
  settingsColumn: {
    flex: 1,
    padding: 15,
  },
  settingsView: {
    justifyContent: 'center',
    backgroundColor: theme.colors.WHITE,
  },
  selectedMenuItemText: {
    ...theme.viewStyles.text('M', 14, theme.colors.BONDI_BLUE),
  },
  availabilityTextStyle: {
    ...theme.viewStyles.text('M', 15, '#02475b'),
  },
  //end
});

type dataType = {
  label: string;
  options: string[];
  selectedOptions: string[];
}[];

export interface AppointmentFilterScenedsProps {
  onClickClose: (arg0: filterDataType[]) => void;
  data: filterDataType[];
  setData: (arg0: filterDataType[]) => void;
  filterLength: () => void;
}

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
  const [availabilityList, setAvailabilityList] = useState(strings.appointments.availabilityList);
  const appointmentStatus = strings.appointments.appointmentStatus;
  const [showCalander, setshowCalander] = useState<boolean>(false);
  const [localFilter, setLocalFilter] = useState<AppointmentFilterObject>(_.cloneDeep(filter));
  const [date, setDate] = useState<Date>(new Date());

  const filterValues = (valueList: Array<string>, value: string) => {
    if (valueList.includes(value)) {
      valueList = valueList.filter((val) => val !== value);
    } else {
      valueList.push(value);
    }
    return valueList;
  };

  const setFilterValues = (type: string, value: string) => {
    if (type === 'appointmentStatus') {
      const appointmentStatus = filterValues(localFilter?.appointmentStatus || [], value);
      setLocalFilter({ ...localFilter, appointmentStatus });
    } else if (type === 'availability') {
      const availability = filterValues(localFilter?.availability || [], value);
      setLocalFilter({ ...localFilter, availability });
    } else if (type === 'doctor') {
      const doctorsList = filterValues(localFilter?.doctorsList || [], value);
      setLocalFilter({ ...localFilter, doctorsList });
    } else if (type === 'specialty') {
      const specialtyList = filterValues(localFilter?.specialtyList || [], value);
      setLocalFilter({ ...localFilter, specialtyList });
    }
  };

  useEffect(() => {
    selectedDate && setFilterValues('availability', moment(selectedDate).format('dd/MM/yyyy'));
  }, [selectedDate]);

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
              <View
                style={{
                  width: '97.4%',
                  height: 42,
                  backgroundColor: theme.colors.CARD_BG,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                }}
              >
                <View>
                  <Text style={styles.availabilityTextStyle}>Availability</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setshowCalander(false);
                  }}
                >
                  <CloseCal
                    style={{
                      width: 28,
                      height: 28,
                    }}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  borderBottomWidth: 0.1,
                  borderBottomColor: 'rgba(2, 71, 91, 0.3)',
                }}
              />
              <CalendarView
                styles={styles.calendarStyle}
                date={date}
                onPressDate={(date) => {
                  const selectedDate = moment(date).format('YYYY-MM-DD');
                  setAvailabilityList([...availabilityList, selectedDate]);
                  setFilterValues('availability', selectedDate);
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
                //   label === 'Availability' && id === 3 ? { marginRight: 10 } : null,
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
      default:
        return renderFilterSection(0);
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
        <View style={styles.settingsColumn}>
          {/* Option 1: AGE */}
          {renderSelectedView(selectedItem)}
        </View>
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
              setAvailabilityList(strings.appointments.availabilityList);
              setFilter(initialAppointmentFilterObject);
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
