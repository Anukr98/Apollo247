import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { FilterCard } from '@aph/mobile-patients/src/components/ui/FilterCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import firebase from 'react-native-firebase';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { Reload, CalendarShow, CalendarClose } from '@aph/mobile-patients/src/components/ui/Icons';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { Calendar } from 'react-native-calendars';
import console = require('console');

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  cardContainer: {
    padding: 20,
    paddingBottom: 0,
    paddingTop: 16,
    marginVertical: 4,
    backgroundColor: '#f7f8f5',
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
});

export interface FilterSceneProps extends NavigationScreenProps {}
export const FilterScene: React.FC<FilterSceneProps> = (props) => {
  const filterData = strings.doctor_search_listing.filter_data.map((obj: object) => {
    obj['selectedOptions'] = [];
    return obj;
  });
  const [data, setData] = useState<any>(filterData);
  const [showCalander, setshowCalander] = useState<boolean>(false);
  const today = new Date().toISOString().slice(0, 10);
  const [dateSelected, setdateSelected] = useState<object>({
    [today]: {
      selected: true,
      selectedColor: theme.colors.APP_GREEN,
    },
  });

  // const { currentUser } = useAuth();

  const filterCardsView = () => {
    return (
      <View style={{ marginVertical: 20 }}>
        {data.map(({ label, options, selectedOptions }, index) => {
          console.log(selectedOptions, '1234567890');
          const allSelected = options.length > 0 && options.length === selectedOptions.length;
          return (
            <View style={styles.cardContainer}>
              <View style={styles.labelView}>
                <Text style={styles.leftText}>{label}</Text>
                {label === 'Availability' && (
                  <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}>
                    <TouchableOpacity onPress={() => setshowCalander(!showCalander)}>
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
                <Calendar
                  style={styles.calendarStyle}
                  theme={{
                    backgroundColor: '#f7f8f5',
                    calendarBackground: '#f7f8f5',
                    textSectionTitleColor: '#80a3ad',
                    selectedDayBackgroundColor: '#00adf5',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: theme.colors.LIGHT_BLUE,
                    dayTextColor: theme.colors.APP_GREEN,
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#00adf5',
                    selectedDotColor: '#ffffff',
                    arrowColor: theme.colors.LIGHT_BLUE,
                    monthTextColor: theme.colors.LIGHT_BLUE,
                    indicatorColor: 'blue',
                    textDayFontFamily: 'IBMPlexSans-SemiBold',
                    textMonthFontFamily: 'IBMPlexSans-SemiBold',
                    textDayHeaderFontFamily: 'IBMPlexSans-SemiBold',
                    // textDayFontWeight: '300',
                    textMonthFontWeight: 'normal',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 14,
                    textMonthFontSize: 14,
                    textDayHeaderFontSize: 14,
                  }}
                  hideExtraDays={true}
                  firstDay={1}
                  markedDates={dateSelected}
                  onDayPress={(day: any) => {
                    console.log(day, '234567890');
                    setdateSelected({
                      [day.dateString]: { selected: true, selectedColor: theme.colors.APP_GREEN },
                    });
                  }}
                />
              ) : (
                <View style={styles.optionsView}>
                  {options.map((name) => (
                    <Button
                      title={name}
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
                        console.log('onpress');

                        const selectedData = [...data][index]['selectedOptions'];
                        const dataCopy = [...data];

                        if (selectedData.includes(name)) {
                        } else {
                          console.log(selectedData, 'selectedDataselectedData1');
                          selectedData.push(name);
                          console.log(selectedData, 'selectedDataselectedData2');
                          dataCopy[index] = {
                            ...dataCopy[index],
                            selectedOptions: selectedOptions,
                          };
                          console.log(dataCopy, 'dataCopy');
                        }
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

  const renderTopView = () => {
    return (
      <Header
        leftIcon={'close'}
        title="FILTERS"
        rightComponent={() => <Reload />}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const bottomButton = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title={'APPLY FILTERS'}
          style={{ flex: 1, marginHorizontal: 40 }}
          onPress={() => props.navigation.goBack()}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderTopView()}
      <ScrollView style={{ flex: 1 }}>
        {filterCardsView()}
        <View style={{ height: 80 }} />
      </ScrollView>
      {bottomButton()}
    </SafeAreaView>
  );
};
