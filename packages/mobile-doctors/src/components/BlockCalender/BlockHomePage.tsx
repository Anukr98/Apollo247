import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-doctors/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  AddPlus,
  BackArrow,
  DropdownGreen,
  Remove,
  Selected,
  UnSelected,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import { RadioButtons } from '@aph/mobile-doctors/src/components/ui/RadioButtons';
import { StickyBottomComponent } from '@aph/mobile-doctors/src/components/ui/StickyBottomComponent';
import {
  ADD_BLOCKED_CALENDAR_ITEM,
  BLOCK_MULTIPLE_CALENDAR_ITEMS,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { ConsultMode, BlockMultipleItems } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  ConvertDateToWeekDay,
  ConvertDateTimeToUtc,
  FormatDateToString,
  getDateArray,
} from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { AddIconLabel } from '@aph/mobile-doctors/src/components/ui/AddIconLabel';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { AddBlockedCalendarItemVariables } from '@aph/mobile-doctors/src/graphql/types/AddBlockedCalendarItem';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  labelText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 0.5, undefined, 0.02),
    marginBottom: 6,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 18, '#01475b'),
  },
});

export interface BlockHomePageProps extends NavigationScreenProps {}

export const BlockHomePage: React.FC<BlockHomePageProps> = (props) => {
  const { showAphAlert } = useUIElements();

  type OptionsType = {
    key: string;
    value: string;
  };
  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });
  const options: OptionsType[] = [
    {
      key: 'personal leave',
      value: 'Personal Leave',
    },
    {
      key: 'Busy',
      value: 'Busy',
    },
    {
      key: 'Out of office',
      value: 'Out of office',
    },
  ];
  const daysArray = [
    {
      label: 'For a day',
      key: '1',
    },
    {
      label: 'For a duration',
      key: '2',
    },
  ];

  const blockOptions = [
    {
      label: 'Block the entire day',
      key: '1',
    },
    {
      label: 'Block consult hours',
      key: '2',
    },
    {
      label: 'Block custom time',
      key: '3',
    },
  ];
  type CalendarItem = { start: string; end: string; consultMode: ConsultMode };

  const [selectedReason, setselectedReason] = useState<OptionsType>(options[0]);
  const [selectedBlockOption, setselectedBlockOption] = useState(blockOptions[0].key);
  const [selectedDay, setselectedDay] = useState<string>(daysArray[0].key);
  const [startDate, setstartDate] = useState<Date>();
  const [endDate, setendDate] = useState<Date>();
  const [selectedConsultations, setselectedConsultations] = useState<CalendarItem[]>([]);
  const [startDayConsults, setstartDayConsults] = useState<CalendarItem[]>([]);
  const [customTime, setcustomTime] = useState<
    { start: Date | undefined; end: Date | undefined }[]
  >([{ start: undefined, end: undefined }]);
  const [AllDates, setAllDates] = useState<Date[]>([]);
  const [isValidTime, setisValidTime] = useState<boolean>(true);

  const { doctorDetails } = useAuth();
  const consultHours =
    doctorDetails && doctorDetails.consultHours && doctorDetails.consultHours.length
      ? doctorDetails.consultHours
      : [];
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  const client = useApolloClient();
  const todayDate = new Date().toISOString().split('T')[0];

  const getStartDayConsults = (startDate: Date) => {
    return consultHours
      .map((item) => {
        if (item) {
          const todayDate = FormatDateToString(startDate);
          return (
            item.weekDay === ConvertDateToWeekDay(startDate) && {
              start: ConvertDateTimeToUtc(todayDate, item.startTime),
              end: ConvertDateTimeToUtc(todayDate, item.endTime),
              consultMode: item.consultMode,
            }
          );
        }
      })
      .filter((i) => i !== false);
  };

  const showErrorMessage = (error: any) => {
    let message = '';
    try {
      message = error.message.split(':')[1].trim();
    } catch (error) {}
    console.log(message, 'message', error.message);

    if (message == 'BLOCKED_CALENDAR_ITEM_OVERLAPS') {
      renderErrorPopup(strings.block_homepage.duplicate_blockig_alert);
    } else if (message === 'INVALID_DATES') {
      renderErrorPopup(strings.block_homepage.cant_block_past_slots);
    } else {
      renderErrorPopup(
        `${strings.alerts.something_went_wrong} ${
          message ? `${strings.alerts.error_code} ${message}.` : ''
        }`
      );
    }
  };

  const navigateWithData = (res: any) => {
    console.log('bbh', res.data, res.data.addBlockedCalendarItem);

    props.navigation.state.params &&
      props.navigation.state.params.onAddBlockCalendar &&
      res.data &&
      (res.data.addBlockedCalendarItem || res.data.blockMultipleCalendarItems) &&
      props.navigation.state.params.onAddBlockCalendar(
        (res.data.addBlockedCalendarItem && res.data.addBlockedCalendarItem.blockedCalendar) ||
          (res.data.blockMultipleCalendarItems &&
            res.data.blockMultipleCalendarItems.blockedCalendar)
      );
    props.navigation.goBack();
  };

  const SaveBlockCalendar = () => {
    setshowSpinner(true);
    const date = startDate ? startDate.toISOString() : '';
    let variables: any = {
      doctorId: doctorDetails ? doctorDetails.id : '',
    };
    if (selectedBlockOption === blockOptions[0].key) {
      // let endDateTime;
      // if (selectedDay === daysArray[0].key && startDate) {
      //   endDateTime = moment(date.split('T')[0] + '23:59:00', 'YYYY-MM-DDHH:mm:ss').toISOString();
      // } else {
      //   endDateTime = endDate
      //     ? moment(
      //         endDate.toISOString().split('T')[0] + '12:59:00',
      //         'YYYY-MM-DDhh:mm:ss'
      //       ).toISOString()
      //     : //moment(endDate.toISOString().split('T')[0] + ' 23:59', 'YYYY-MM-DD HH:MM').toISOString()
      //       '';
      // }
      variables = {
        ...variables,
        start: moment(startDate)
          .startOf('day')
          .toISOString(),
        end: moment(startDate)
          .startOf('day')
          .add(23, 'h')
          .add(59, 'm')
          .toISOString(), // selectedDay === daysArray[0].key ? date : endDate ? endDate.toISOString() : '',
        reason: selectedReason.key,
      };
      console.log(variables, 'variables');
      client
        .mutate({
          mutation: ADD_BLOCKED_CALENDAR_ITEM,
          variables: variables,
        })
        .then((res) => {
          setshowSpinner(false);
          console.log(res, 'res ADD_BLOCKED_CALENDAR_ITEM');
          navigateWithData(res);
        })
        .catch((err) => {
          CommonBugFender('Add_Blocked_Calender_Item_BlockHomePage', err);
          setshowSpinner(false);
          console.log(err, 'err ADD_BLOCKED_CALENDAR_ITEM');
          showErrorMessage(err);
        });
    } else {
      console.log(selectedConsultations, consultHours, 'consultHours');
      if (selectedBlockOption === blockOptions[1].key) {
        variables = {
          ...variables,
          reason: '',
          itemDetails: selectedConsultations,
        };
      } else {
        let consults: ({ start: string; end: string } | undefined | null)[] = [];
        if (daysArray[0].key === selectedDay && startDate) {
          const date = FormatDateToString(startDate);

          consults = customTime.map((item) => {
            console.log(
              date,
              moment(item.start).format('HH:mm:ss'),
              moment(item.end).format('HH:mm:ss'),
              'moment(item.start)'
            );
            if (item.start && item.end) {
              return {
                start: item.start.toISOString(),
                end: item.end.toISOString(),
              };
            }
          });
        } else if (daysArray[1].key === selectedDay && startDate && endDate) {
          AllDates.forEach((date) => {
            const array = customTime.map((item) => {
              return {
                start: ConvertDateTimeToUtc(
                  FormatDateToString(date),
                  moment(item.start).format('HH:mm:ss')
                ),
                end: ConvertDateTimeToUtc(
                  FormatDateToString(date),
                  moment(item.end).format('HH:mm:ss')
                ),
              };
            });

            consults.concat(array);
          });
        }
        console.log(consults, 'consults customTime', customTime);
        variables = {
          ...variables,
          reason: '',
          itemDetails: consults,
        };
      }
      console.log(variables, selectedConsultations, 'itemDetails');
      client
        .mutate({
          mutation: BLOCK_MULTIPLE_CALENDAR_ITEMS,
          variables: { blockCalendarInputs: variables },
        })
        .then((res) => {
          setshowSpinner(false);
          console.log(res, 'res BLOCK_MULTIPLE_CALENDAR_ITEMS');
          navigateWithData(res);
        })
        .catch((err) => {
          setshowSpinner(false);
          CommonBugFender('Add_Blocked_Multiple_Calender_Item_BlockHomePage', err);
          console.log(err, 'err BLOCK_MULTIPLE_CALENDAR_ITEMS');
          // setshowSpinner(false);
          showErrorMessage(err);
        });
    }
  };

  console.log(startDayConsults, 'startDayConsults', consultHours);

  const renderReasons = () => {
    return (
      <MaterialMenu
        options={options}
        selectedText={selectedReason && selectedReason.key.toString()}
        menuContainerStyle={{ alignItems: 'flex-end', marginLeft: width / 2 - 95 }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 16, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        bottomPadding={{ paddingBottom: 20 }}
        onPress={(selectedReason) => {
          setselectedReason(selectedReason);
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                styles.placeholderTextStyle,
                selectedReason !== undefined ? null : styles.placeholderStyle,
              ]}
            >
              {selectedReason !== undefined
                ? selectedReason.value
                : strings.block_homepage.sele_option}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderConsultHours = (item: CalendarItem) => {
    let isSelected: boolean = false;
    let selected = JSON.parse(JSON.stringify(selectedConsultations));
    selected.forEach((i: CalendarItem) => {
      if (item && i.start == item.start) isSelected = true;
    });
    return (
      <View style={{ flexDirection: 'row', marginBottom: 22 }}>
        <TouchableOpacity
          onPress={() => {
            if (isSelected) {
              selected = selected.filter((i) => i.start !== item.start);
            } else {
              selected.push(item);
            }
            console.log(selected, 'pushed');

            setselectedConsultations(selected);
          }}
        >
          {isSelected ? <Selected /> : <UnSelected />}
        </TouchableOpacity>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
            marginLeft: 22,
          }}
        >
          {moment(item.start).format('hh:mm A')} - {moment(item.end).format('hh:mm A')}
        </Text>
        <View
          style={{
            borderRightWidth: 1,
            borderColor: theme.colors.LIGHT_BLUE,
            marginHorizontal: 14,
            marginVertical: 2,
          }}
        />
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
            textTransform: 'capitalize',
          }}
        >
          {item.consultMode}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    checkIsValid(customTime);
  }, [customTime]);
  const checkIsValid = (customTime: { start: Date | undefined; end: Date | undefined }[]) => {
    const minutesOfDay = (m: Date) => {
      return m.getMinutes() + m.getHours() * 60;
    };

    let isValid: boolean = true;

    customTime.forEach((time) => {
      if (time && time.start && time.end) {
        if (minutesOfDay(time.start) > minutesOfDay(time.end) && isValid) {
          isValid = false;
        }
      }
    });

    setisValidTime(isValid);
  };

  const renderBlockOptions = () => {
    console.log(customTime, 'vmdfio');

    return (
      <View>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 0.5, undefined, 0.02),
            marginTop: 32,
          }}
        >
          {strings.block_homepage.which_would_block}
        </Text>
        <RadioButtons
          data={blockOptions}
          selectedItem={selectedBlockOption}
          setselectedItem={setselectedBlockOption}
          containerStyle={{ marginTop: 8 }}
          // horizontal
          disabled={!(daysArray[0].key === selectedDay ? startDate : startDate && endDate)}
        >
          {selectedBlockOption === blockOptions[0].key ? (
            <View style={{ marginLeft: 32 }}>
              <Text style={styles.labelText}>{strings.block_homepage.reason_optional}</Text>
              {renderReasons()}
            </View>
          ) : selectedBlockOption === blockOptions[1].key ? (
            <View style={{ marginLeft: 32 }}>
              <Text
                style={{
                  ...theme.viewStyles.text('S', 14, theme.colors.SHARP_BLUE, 1, undefined, 0.02),
                  paddingBottom: 12,
                }}
              >
                {strings.block_homepage.these_are_active_consult}
              </Text>
              {startDate && daysArray[0].key === selectedDay
                ? getStartDayConsults(startDate).map(
                    (item, index) => item && renderConsultHours(item)
                  )
                : AllDates &&
                  AllDates.length &&
                  startDate &&
                  endDate &&
                  AllDates.map((date) => {
                    const consults = getStartDayConsults(date);
                    if (consults.length)
                      return (
                        <View>
                          <View
                            style={{
                              borderBottomColor: 'rgba(0,0,0,0.2)',
                              borderBottomWidth: 1,
                              paddingBottom: 7,
                              marginBottom: 12,
                            }}
                          >
                            <Text style={theme.viewStyles.text('M', 12, theme.colors.SHARP_BLUE)}>
                              {moment(date).format('ddd, DD/MM/YYYY')}
                            </Text>
                          </View>
                          <View>
                            {getStartDayConsults(date).map(
                              (item, index) => item && renderConsultHours(item)
                            )}
                          </View>
                        </View>
                      );
                  })}
            </View>
          ) : (
            <View style={{ marginLeft: 23, marginRight: 16 }}>
              {customTime.map((item, index) => {
                return (
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <DatePicker
                        value={item.start}
                        label={strings.common.from}
                        placeholder={strings.common.from}
                        containerStyle={{ marginTop: 10 }}
                        placeholderStyle={{ fontSize: 20 }}
                        placeholderViewStyle={{ borderBottomWidth: 2 }}
                        onChangeDate={(time) => {
                          setcustomTime([
                            ...customTime.filter((i) => i !== item),
                            { start: time, end: item.end },
                          ]);
                        }}
                        mode={'time'}
                        showCalendarIcon={false}
                        minimumDate={
                          moment(startDate).format('DDMMYYYY') ===
                          moment(new Date()).format('DDMMYYYY')
                            ? new Date()
                            : undefined
                        }
                        maximumDate={item.end}
                      />
                    </View>
                    <View
                      style={{
                        width: 40,
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginHorizontal: 16,
                        paddingBottom: 7,
                      }}
                    >
                      <Text style={theme.viewStyles.text('M', 20, theme.colors.SHARP_BLUE)}>-</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <DatePicker
                        value={item.end}
                        label={strings.common.to}
                        placeholder={strings.common.to}
                        containerStyle={{ marginTop: 10 }}
                        placeholderStyle={{ fontSize: 20 }}
                        placeholderViewStyle={{ borderBottomWidth: 2 }}
                        minimumDate={item.start}
                        onChangeDate={(time) => {
                          setcustomTime([
                            ...customTime.filter((i) => i !== item),
                            { start: item.start, end: time },
                          ]);
                        }}
                        mode={'time'}
                        showCalendarIcon={false}
                      />
                    </View>
                  </View>
                );
              })}
              {!isValidTime && (
                <Text
                  style={{
                    ...theme.viewStyles.text('S', 14, theme.colors.INPUT_BORDER_FAILURE),
                    marginTop: 20,
                  }}
                >
                  {strings.block_homepage.end_time_should_greater}
                </Text>
              )}
              <AddIconLabel
                opacity={isValidTime ? 1 : 0.5}
                onPress={() => {
                  if (isValidTime) {
                    setcustomTime([...customTime, { start: undefined, end: undefined }]);
                  }
                }}
                label={strings.block_homepage.add_another_slot}
                style={{ marginTop: 32 }}
              />
            </View>
          )}
        </RadioButtons>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          shadowColor: '#808080',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 16,
          backgroundColor: colors.CARD_BG,
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.goBack(),
          },
        ]}
        headerText={strings.buttons.block_calendar}
        rightIcons={[
          {
            icon: <Remove />,
            onPress: () => {},
          },
        ]}
      />
    );
  };

  const getDates = (startDate: Date, endDate: Date) => {
    const all = getDateArray(startDate, endDate);
    console.log(all, 'allallllllllllll');
    setAllDates(all);
  };

  const renderRadioButtons = () => {
    return (
      <RadioButtons
        data={daysArray}
        selectedItem={selectedDay}
        setselectedItem={setselectedDay}
        containerStyle={{ marginTop: 8 }}
        horizontal
      >
        {selectedDay === daysArray[0].key ? (
          <View>
            <DatePicker
              value={startDate}
              label={strings.block_homepage.which_day_would_block}
              placeholder={strings.common.select_date}
              containerStyle={{ marginTop: 32 }}
              minimumDate={new Date()}
              onChangeDate={(date) => {
                setstartDate(date);
                const value = getStartDayConsults(date);
                setstartDayConsults(value);
                setselectedConsultations([]);
              }}
            />
          </View>
        ) : (
          <View>
            <DatePicker
              value={startDate}
              label={strings.common.from}
              placeholder={strings.block_homepage.sel_from_date}
              containerStyle={{ marginTop: 32 }}
              onChangeDate={(date) => {
                setstartDate(date);
                date && endDate && getDates(date, endDate);
              }}
              minimumDate={new Date()}
            />
            <DatePicker
              value={endDate}
              label={strings.common.to}
              placeholder={strings.block_homepage.sel_to_date}
              containerStyle={{ marginTop: 24.5 }}
              minimumDate={startDate}
              onChangeDate={(date) => {
                {
                  setendDate(date);
                  date && startDate && getDates(startDate, date);
                }
              }}
            />
          </View>
        )}
      </RadioButtons>
    );
  };
  console.log(isValidTime, 'isValidTime');

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          <View
            style={{
              marginHorizontal: 20,
            }}
          >
            {renderRadioButtons()}
            {renderBlockOptions()}
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>
        <StickyBottomComponent>
          <Button
            title={strings.buttons.block_calendar}
            style={{ flex: 1, marginHorizontal: 71 }}
            onPress={SaveBlockCalendar}
            disabled={
              !(
                (daysArray[0].key === selectedDay ? startDate : startDate && endDate) &&
                (blockOptions[0].key === selectedBlockOption ||
                  (blockOptions[1].key === selectedBlockOption
                    ? selectedConsultations.length > 0
                    : blockOptions[2].key === selectedBlockOption &&
                      customTime.filter(
                        (item) => item.start === undefined || item.end === undefined
                      ).length === 0 &&
                      isValidTime))
              )
            }
          />
        </StickyBottomComponent>
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
