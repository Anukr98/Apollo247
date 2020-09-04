import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarView } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CalendarClose, CalendarShow, Reload } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
    marginVertical: 4,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: '#f7f8f5',
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
});

export interface FilterHealthRecordSceneProps {
  onClickClose: (arg0: filterDataType[]) => void;
  data: filterDataType[];
  setData: (arg0: filterDataType[]) => void;
  filterLength: () => void;
}
export const FilterHealthRecordScene: React.FC<FilterHealthRecordSceneProps> = (props) => {
  const [data, setData] = useState<filterDataType[]>(props.data);
  const [showCalander, setshowCalander] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());

  const filterCardsView = () => {
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
                />
              ) : (
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
    const length = data.filter((d) => d.selectedOptions).length;
    if (length == 0) {
      props.filterLength();
    }
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