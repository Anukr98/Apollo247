import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CalendarClose, CalendarShow, Reload } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
} from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { CalendarView } from '@aph/mobile-patients/src/components/ui/CalendarView';
import moment from 'moment';

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
    paddingBottom: 20,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 11,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  calendarStyle: {
    backgroundColor: '#f7f8f5',
    shadowRadius: 0,
  },
  //start
  content: {
    flexDirection: 'row',
    // flex: 0.7,
  },

  // menu Column - left
  menuColumn: {
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
  //end
});

type dataType = {
  label: string;
  options: string[];
  selectedOptions: string[];
}[];

export interface FilterSceneProps {
  onClickClose: (arg0: filterDataType[]) => void;
  data: filterDataType[];
  setData: (arg0: filterDataType[]) => void;
  filterLength: () => void;
}
export const FilterScene: React.FC<FilterSceneProps> = (props) => {
  const [data, setData] = useState<filterDataType[]>(props.data);
  const [showCalander, setshowCalander] = useState<boolean>(false);
  const today = new Date().toISOString().slice(0, 10);
  const [dateSelected, setdateSelected] = useState<object>({
    [today]: {
      selected: true,
      selectedColor: theme.colors.APP_GREEN,
    },
  });
  const [date, setDate] = useState<Date>(new Date());

  // const { currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState([
    { id: '1', name: 'City' },
    { id: '2', name: 'Brands' },
    { id: '3', name: 'Experience' },
    { id: '4', name: 'Availability' },
    { id: '5', name: 'Fees' },
    { id: '6', name: 'Gender' },
    { id: '7', name: 'Language' },
  ]);
  const renderFilterSection = (id: number) => {
    const sectionData = data[id];
    const { label, options, selectedOptions } = sectionData;
    return (
      <>
        {label.length ? (
          <View style={styles.settingsView}>
            <Text style={styles.leftText}>{label}</Text>
          </View>
        ) : null}
        <View
          style={[
            styles.optionsView,
            !showCalander && label === 'Availability' ? { paddingHorizontal: 20 } : {},
          ]}
        >
          {selectedOptions &&
            options &&
            options.length > 0 &&
            options.map((name) => (
              <Button
                title={name.replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())}
                style={[
                  styles.buttonStyle,
                  selectedOptions.includes(name)
                    ? { backgroundColor: theme.colors.APP_GREEN }
                    : null,
                ]}
                titleTextStyle={[
                  styles.buttonTextStyle,
                  selectedOptions.includes(name) ? { color: theme.colors.WHITE } : null,
                ]}
                onPress={() => {
                  let selectedData = [...data][id]['selectedOptions'] || [];
                  const dataCopy = [...data];

                  if (selectedData.includes(name)) {
                    selectedData = selectedData.filter((item: string) => item !== name);
                  } else {
                    selectedData.push(name);
                  }
                  dataCopy[id] = {
                    ...dataCopy[id],
                    selectedOptions: selectedData,
                  };
                  setData(dataCopy);
                }}
              />
            ))}
        </View>
      </>
    );
  };
  const renderSelectedView = (selectedItem: string) => {
    switch (selectedItem) {
      case '1':
        return null;
      case '2':
        return null;
      case '3':
        return renderFilterSection(0);
      case '4':
        return renderFilterSection(1);
      case '5':
        return renderFilterSection(2);
      case '6':
        return renderFilterSection(3);
      case '7':
        return renderFilterSection(4);
      default:
        return renderFilterSection(0);
    }
  };
  // this holds the keys of the menuItems for the view to know which category is currently being rendered.
  const [selectedItem, setSelectedItem] = useState('1');
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
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={{ marginLeft: 10 }}>1</Text>
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
  const filterCardsView = () => {
    console.log('data===>', data);
    return (
      <View style={{ marginVertical: 16 }}>
        {data.map(({ label, options, selectedOptions }: filterDataType, index: number) => {
          console.log(selectedOptions, '1234567890');
          const allSelected =
            options.length > 0 && selectedOptions && options.length === selectedOptions.length;
          return (
            <View
              style={[
                styles.cardContainer,
                label === 'Availability' ? { paddingHorizontal: 0 } : {},
              ]}
            >
              <View
                style={[
                  styles.labelView,
                  label === 'Availability' ? { paddingBottom: 5, paddingHorizontal: 20 } : {},
                ]}
              >
                <Text style={styles.leftText}>{label}</Text>
                {label === 'Availability' && (
                  <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        setshowCalander(!showCalander);
                        const selectedData = [];

                        if (!showCalander) {
                          const selectedDate = moment(date).format('YYYY-MM-DD');
                          selectedData.push(selectedDate);
                        }
                        const dataCopy = [...data];
                        dataCopy[index] = {
                          ...dataCopy[index],
                          selectedOptions: selectedData,
                        };
                        setData(dataCopy);
                      }}
                    >
                      {showCalander ? <CalendarClose /> : <CalendarShow />}
                    </TouchableOpacity>
                  </View>
                )}
                <Text
                  style={styles.rightText}
                  onPress={() => {
                    const dataCopy = [...data];
                    dataCopy[index] = {
                      ...dataCopy[index],
                      selectedOptions: allSelected ? [] : dataCopy[index].options,
                    };
                    console.log(dataCopy, 'dataCopy');
                    setData(dataCopy);
                  }}
                >
                  {allSelected ? 'DESELECT ALL' : 'SELECT ALL'}
                </Text>
              </View>
              {showCalander && label === 'Availability' ? (
                <CalendarView
                  styles={styles.calendarStyle}
                  date={date}
                  minDate={new Date()}
                  onPressDate={(date) => {
                    // setDate(date);
                    console.log(date, 'selected date ');
                    const selectedDate = moment(date).format('YYYY-MM-DD');
                    const selectedData = [...data][index]['selectedOptions'] || [];
                    const dataCopy = [...data];
                    selectedData.push(selectedDate);
                    dataCopy[index] = {
                      ...dataCopy[index],
                      selectedOptions: selectedData,
                    };

                    setData(dataCopy);

                    setDate(date);
                  }}
                  showWeekView={false}
                  // calendarType={type}
                  // onCalendarTypeChanged={(type) => {
                  //   setType(type);
                  // }}
                  // minDate={new Date()}
                />
              ) : (
                // <Calendar
                //   style={styles.calendarStyle}
                //   theme={{
                //     backgroundColor: '#f7f8f5',
                //     calendarBackground: '#f7f8f5',
                //     textSectionTitleColor: '#80a3ad',
                //     selectedDayBackgroundColor: '#00adf5',
                //     selectedDayTextColor: '#ffffff',
                //     todayTextColor: theme.colors.LIGHT_BLUE,
                //     dayTextColor: theme.colors.APP_GREEN,
                //     textDisabledColor: '#d9e1e8',
                //     dotColor: '#00adf5',
                //     selectedDotColor: '#ffffff',
                //     arrowColor: theme.colors.LIGHT_BLUE,
                //     monthTextColor: theme.colors.LIGHT_BLUE,
                //     indicatorColor: 'blue',
                //     textDayFontFamily: 'IBMPlexSans-SemiBold',
                //     textMonthFontFamily: 'IBMPlexSans-SemiBold',
                //     textDayHeaderFontFamily: 'IBMPlexSans-SemiBold',
                //     // textDayFontWeight: '300',
                //     textMonthFontWeight: 'normal',
                //     textDayHeaderFontWeight: '300',
                //     textDayFontSize: 14,
                //     textMonthFontSize: 14,
                //     textDayHeaderFontSize: 14,
                //   }}
                //   hideExtraDays={true}
                //   firstDay={1}
                //   markedDates={{ dateSelected }}
                //   onDayPress={(day: DateObject) => {
                //     console.log(day, '234567890');
                //     setdateSelected({
                //       [day.dateString]: { selected: true, selectedColor: theme.colors.APP_GREEN },
                //     });
                //   }}
                // />
                <View
                  style={[
                    styles.optionsView,
                    !showCalander && label === 'Availability' ? { paddingHorizontal: 20 } : {},
                  ]}
                >
                  {selectedOptions &&
                    options &&
                    options.length > 0 &&
                    options.map((name) => (
                      <Button
                        title={name.replace(
                          /\w+/g,
                          (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()
                        )}
                        style={[
                          styles.buttonStyle,
                          selectedOptions.includes(name)
                            ? { backgroundColor: theme.colors.APP_GREEN }
                            : null,
                        ]}
                        titleTextStyle={[
                          styles.buttonTextStyle,
                          selectedOptions.includes(name) ? { color: theme.colors.WHITE } : null,
                        ]}
                        onPress={() => {
                          let selectedData = [...data][index]['selectedOptions'] || [];
                          const dataCopy = [...data];

                          if (selectedData.includes(name)) {
                            selectedData = selectedData.filter((item: string) => item !== name);
                          } else {
                            selectedData.push(name);
                          }
                          dataCopy[index] = {
                            ...dataCopy[index],
                            selectedOptions: selectedData,
                          };
                          setData(dataCopy);
                        }}
                      />
                    ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };
  const closePop = () => {
    const filterData = data.map((obj) => {
      if (obj) obj.selectedOptions = [];
      return obj;
    });
    setData(filterData);
    props.setData(filterData);
    props.onClickClose(data);
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
              console.log(data, 'data1111111111');
              const filterData = data.map((obj) => {
                if (obj) obj.selectedOptions = [];
                return obj;
              });
              setData(filterData);
              props.setData(filterData);
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
    let length = 0;
    data.forEach((item) => {
      if (item.selectedOptions) length += item.selectedOptions.length;
    });
    console.log(length, 'length');
    if (length == 0) {
      props.filterLength();
    }
    return (
      <StickyBottomComponent
        style={{ backgroundColor: theme.colors.WHITE, elevation: 20, height: '12%' }}
      >
        <Button
          title={'APPLY FILTERS'}
          style={{ flex: 1, marginHorizontal: 40, marginTop: 15 }}
          onPress={() => {
            props.setData(data);
            props.onClickClose(data);
          }}
          disabled={length > 0 ? false : true}
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
