import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CalendarClose, CalendarShow, Reload } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import { ScrollView } from 'react-native-gesture-handler';
import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
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
  },
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

  // const { currentUser } = useAuth();

  const filterCardsView = () => {
    return (
      <View style={{ marginVertical: 16 }}>
        {data.map(({ label, options, selectedOptions }: filterDataType, index: number) => {
          console.log(selectedOptions, '1234567890');
          const allSelected =
            options.length > 0 && selectedOptions && options.length === selectedOptions.length;
          return (
            <View style={styles.cardContainer}>
              <View
                style={[styles.labelView, label === 'Availability' ? { paddingBottom: 5 } : {}]}
              >
                <Text style={styles.leftText}>{label}</Text>
                {label === 'Availability' && (
                  <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setshowCalander(!showCalander)}>
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
                  markedDates={{ dateSelected }}
                  onDayPress={(day: DateObject) => {
                    console.log(day, '234567890');
                    setdateSelected({
                      [day.dateString]: { selected: true, selectedColor: theme.colors.APP_GREEN },
                    });
                  }}
                />
              ) : (
                <View style={styles.optionsView}>
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
                          console.log('onpress');
                          let selectedData = [...data][index]['selectedOptions'] || [];
                          const dataCopy = [...data];

                          if (selectedData.includes(name)) {
                            selectedData = selectedData.filter((item: string) => item !== name);
                            console.log(name, 'name', selectedData, 'selectedData');
                          } else {
                            console.log(selectedData, 'selectedDataselectedData1');
                            selectedData.push(name);
                          }
                          console.log(selectedData, 'selectedDataselectedData');
                          dataCopy[index] = {
                            ...dataCopy[index],
                            selectedOptions: selectedData,
                          };
                          console.log(dataCopy, 'dataCopy');
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
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'close'}
        title="FILTERS"
        rightComponent={
          <TouchableOpacity activeOpacity={1}
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
        onPressLeftIcon={() => props.onClickClose(data)}
      />
    );
  };

  const bottomButton = () => {
    let length = 0;
    data.forEach((item) => {
      if (item.selectedOptions) length += item.selectedOptions.length;
    });
    console.log(length, 'length');
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title={'APPLY FILTERS'}
          style={{ flex: 1, marginHorizontal: 40 }}
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
        {filterCardsView()}
        <View style={{ height: 80 }} />
      </ScrollView>
      {bottomButton()}
    </SafeAreaView>
  );
};
