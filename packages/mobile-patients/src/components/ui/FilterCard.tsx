import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarClose, CalendarShow } from '@aph/mobile-patients/src/components/ui/Icons';
import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle, TouchableOpacity } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
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

type dataType = {
  label: string;
  options: string[];
  selectedOptions: string[];
}[];
export interface FilterCardProps extends NavigationScreenProps {
  cardContainer?: StyleProp<ViewStyle>;
  data: dataType;
  updateData: (data: dataType) => void;
}

export const FilterCard: React.FC<FilterCardProps> = (props) => {
  const [showCalander, setshowCalander] = useState<boolean>(false);
  const today = new Date().toISOString().slice(0, 10);
  const [dateSelected, setdateSelected] = useState<object>({
    [today]: {
      selected: true,
      selectedColor: theme.colors.APP_GREEN,
    },
  });

  useEffect(() => {
    console.log(props.data, 'props.data useEffect');
    setdata(props.data);
  }, [props.data]);
  const [data, setdata] = useState<dataType>(props.data);

  console.log(props.data, 'props.data');

  return (
    <View style={{ marginVertical: 20 }}>
      {data.map(({ label, options, selectedOptions }, index: number) => (
        <View style={[styles.cardContainer, props.cardContainer]}>
          <View style={styles.labelView}>
            <Text style={styles.leftText}>{label}</Text>
            {label === 'Availability' && (
              <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}>
                <TouchableOpacity activeOpacity={1} onPress={() => setshowCalander(!showCalander)}>
                  {showCalander ? <CalendarClose /> : <CalendarShow />}
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.rightText}>SELECT ALL</Text>
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
              {options.map((name: string, i: number) => (
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
                    const dataCopy = data;
                    dataCopy[index].selectedOptions.push(name);
                    console.log(dataCopy);
                    props.updateData(dataCopy);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};
