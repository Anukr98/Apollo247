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
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { ConsultMode } from '@aph/mobile-doctors/src/graphql/types/globalTypes';

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
  type OptionsType = {
    key: string;
    value: string;
  };
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

  const [selectedReason, setselectedReason] = useState<OptionsType>(options[0]);
  const [selectedBlockOption, setselectedBlockOption] = useState(blockOptions[0].key);
  const [selectedDay, setselectedDay] = useState<string>(daysArray[0].key);
  const [startDate, setstartDate] = useState<Date>();
  const [endDate, setendDate] = useState<Date>();
  const [selectedConsultations, setselectedConsultations] = useState<
    { start: string; end: string; consultMode: ConsultMode }[]
  >([]);
  const [customTime, setcustomTime] = useState<{}[]>([{ start: '', end: '' }]);

  const { doctorDetails } = useAuth();
  console.log(doctorDetails, 'doctorDetails');
  const consultHours =
    doctorDetails && doctorDetails.consultHours && doctorDetails.consultHours.length
      ? doctorDetails.consultHours
      : [];

  const client = useApolloClient();
  const todayDate = new Date().toISOString().split('T')[0];

  const todayConsultHours = consultHours.map((item) => {
    return (
      item &&
      item.weekDay ===
        moment(todayDate, 'YYYY-MM-DD')
          .format('dddd')
          .toUpperCase() && {
        start: moment(todayDate + item.startTime, 'YYYY-MM-DDHH:mm:ss').toISOString(),
        end: moment(todayDate + item.endTime, 'YYYY-MM-DDHH:mm:ss').toISOString(),
        consultMode: item.consultMode,
      }
    );
  });

  const renderReasons = () => {
    console.log(selectedReason, 'setselectedReason2');

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
          // console.log(selectedReason, 'selectedReason');

          setselectedReason(selectedReason);
          // onRelationSelect(selectedRelation, (profileData && profileData.relation!) || '')
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                styles.placeholderTextStyle,
                ,
                selectedReason !== undefined ? null : styles.placeholderStyle,
              ]}
            >
              {selectedReason !== undefined ? selectedReason.value : 'Select an Option'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  console.log(moment(todayDate, 'YYYY-MM-DD').format('dddd'), 'dddddddddd');

  const renderBlockOptions = () => {
    return (
      <View>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 0.5, undefined, 0.02),
            marginTop: 32,
          }}
        >
          Which of these would you like to block?
        </Text>
        <RadioButtons
          data={blockOptions}
          selectedItem={selectedBlockOption}
          setselectedItem={setselectedBlockOption}
          containerStyle={{ marginTop: 8 }}
          // horizontal
        >
          {selectedBlockOption === blockOptions[0].key ? (
            <View style={{ marginLeft: 32 }}>
              <Text style={styles.labelText}>Reason (optional)</Text>
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
                These are your active consult hours for the selected day. Select which ones you’d
                like to block:
              </Text>
              {todayConsultHours.map(
                (item, index) =>
                  item && (
                    <View style={{ flexDirection: 'row', marginBottom: 22 }}>
                      <TouchableOpacity
                        onPress={() => {
                          let selected = JSON.parse(JSON.stringify(selectedConsultations));
                          // const data = {
                          //   start: moment(
                          //     todayDate + item.startTime,
                          //     'YYYY-MM-DDHH:mm:ss'
                          //   ).toISOString(),
                          //   end: moment(
                          //     todayDate + item.endTime,
                          //     'YYYY-MM-DDHH:mm:ss'
                          //   ).toISOString(),
                          //   consultMode: item.consultMode,
                          // };
                          // console.log(data, 'dataaaaaaaaa');

                          if (selectedConsultations.includes(item)) {
                            selected = selected.filter((i) => i !== item);
                          } else {
                            selected.push(item);
                          }
                          setselectedConsultations(selected);
                        }}
                      >
                        {selectedConsultations.includes(item) ? <Selected /> : <UnSelected />}
                      </TouchableOpacity>
                      <Text
                        style={{
                          ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
                          marginLeft: 22,
                        }}
                      >
                        {moment(item.start).format('hh:mm A')} -{' '}
                        {moment(item.end).format('HH:mm A')}
                        {/* {item.endTime} */}
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
                  )
              )}
            </View>
          ) : (
            <View style={{ marginLeft: 23, marginRight: 16 }}>
              {customTime.map((item) => {
                return (
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <DatePicker
                        label={'From'}
                        placeholder={''}
                        containerStyle={{ marginTop: 10 }}
                        placeholderStyle={{ fontSize: 20 }}
                        placeholderViewStyle={{ borderBottomWidth: 2 }}
                        minimumDate={new Date()}
                        onChangeDate={(time) => console.log(time)}
                        mode={'time'}
                        showCalendarIcon={false}
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
                        label={'To'}
                        placeholder={''}
                        containerStyle={{ marginTop: 10 }}
                        placeholderStyle={{ fontSize: 20 }}
                        placeholderViewStyle={{ borderBottomWidth: 2 }}
                        minimumDate={new Date()}
                        onChangeDate={(time) => console.log(time)}
                        mode={'time'}
                        showCalendarIcon={false}
                      />
                    </View>
                  </View>
                );
              })}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  marginTop: 18,
                  marginLeft: 20,
                  alignItems: 'center',
                }}
                onPress={() => {
                  const timeArray = JSON.parse(JSON.stringify(customTime));
                  timeArray.push({ start: '', end: '' });
                  setcustomTime(timeArray);
                }}
              >
                <AddPlus />
                <Text
                  style={{
                    ...theme.viewStyles.yellowTextStyle,
                    fontSize: 14,
                    marginLeft: 8,
                  }}
                >
                  ADD ANOTHER TIME SLOT
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </RadioButtons>
      </View>
    );
  };

  const SaveBlockCalendar = () => {
    const date = startDate ? startDate.toISOString() : '';
    let variables = {
      doctorId: doctorDetails ? doctorDetails.id : '',
      reason: selectedReason.key,
    };
    if (selectedBlockOption === blockOptions[0].key) {
      let endDateTime;
      if (selectedDay === daysArray[0].key && startDate) {
        endDateTime = moment(date.split('T')[0] + '23:59:00', 'YYYY-MM-DDHH:mm:ss').toISOString();
      } else {
        endDateTime = endDate
          ? moment(
              endDate.toISOString().split('T')[0] + '12:59:00',
              'YYYY-MM-DDhh:mm:ss'
            ).toISOString()
          : //moment(endDate.toISOString().split('T')[0] + ' 23:59', 'YYYY-MM-DD HH:MM').toISOString()
            '';
      }
      variables = {
        ...variables,
        start: date,
        end: endDateTime, // selectedDay === daysArray[0].key ? date : endDate ? endDate.toISOString() : '',
      };
      console.log(variables, 'variables');

      client
        .mutate({
          mutation: ADD_BLOCKED_CALENDAR_ITEM,
          variables: variables,
        })
        .then((res) => console.log(res, 'res ADD_BLOCKED_CALENDAR_ITEM'))
        .catch((err) => console.log(err, 'err ADD_BLOCKED_CALENDAR_ITEM'));
    } else {
      console.log(selectedConsultations, consultHours, 'consultHours');

      // const itemDetails = selectedConsultations.map((i) => {
      //   if (consultHours && consultHours.length > i && consultHours[i] && startDate)
      //     return {
      //       start: moment(
      //         moment(startDate).format('YYYY-MM-DD') + consultHours[i].startTime,
      //         'YYYY-MM-DDhh:mm:ss'
      //       ).toISOString(),
      //       end: moment(
      //         moment(startDate).format('YYYY-MM-DD') + consultHours[i].startTime,
      //         'YYYY-MM-DDhh:mm:ss'
      //       ).toISOString(),
      //       // consultHours[i]
      //       //   ? moment(
      //       //       moment(endDate).format('YYYY-MM-DD') + consultHours[i].endTime,
      //       //       'YYYY-MM-DDhh:mm:ss'
      //       //     ).toISOString()
      //       //   : '',
      //       consultMode: consultHours[i].consultMode,
      //     };
      // });

      variables = {
        ...variables,
        itemDetails: selectedConsultations,
      };
      console.log(variables, selectedConsultations, 'itemDetails');

      client
        .mutate({
          mutation: BLOCK_MULTIPLE_CALENDAR_ITEMS,
          variables: variables,
        })
        .then((res) => console.log(res, 'res ADD_BLOCKED_CALENDAR_ITEM'))
        .catch((err) => console.log(err, 'err ADD_BLOCKED_CALENDAR_ITEM'));
    }
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
        headerText="BLOCK CALENDAR"
        rightIcons={[
          {
            icon: <Remove />,
            onPress: () => {},
          },
        ]}
      />
    );
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
              label={'Which day would you like to block your calendar for?'}
              placeholder={'Select a date'}
              containerStyle={{ marginTop: 32 }}
              minimumDate={new Date()}
              onChangeDate={setstartDate}
            />
          </View>
        ) : (
          <View>
            <DatePicker
              label={'From'}
              placeholder={'Select from date'}
              containerStyle={{ marginTop: 32 }}
              onChangeDate={setstartDate}
              minimumDate={new Date()}
            />
            <DatePicker
              label={'To'}
              placeholder={'Select to date'}
              containerStyle={{ marginTop: 24.5 }}
              onChangeDate={setendDate}
              minimumDate={startDate}
            />
          </View>
        )}
      </RadioButtons>
    );
  };

  console.log(startDate, 'startDate moment');

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#f7f7f7',
      }}
    >
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
          title="BLOCK CALENDAR"
          style={{ flex: 1, marginHorizontal: 71 }}
          onPress={() => {
            SaveBlockCalendar();
          }}
        />
      </StickyBottomComponent>
    </SafeAreaView>
  );
};
