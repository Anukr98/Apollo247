import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Afternoon,
  AfternoonUnselected,
  CrossPopup,
  DropdownGreen,
  Evening,
  EveningUnselected,
  Location,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { Mutation } from 'react-apollo';
import { BOOK_APPOINTMENT } from '@aph/mobile-patients/src/graphql/profiles';
import moment from 'moment';

import {
  bookAppointment,
  bookAppointmentVariables,
  bookAppointment_bookAppointment_appointment,
} from '@aph/mobile-patients/src/graphql/types/bookAppointment';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  selectedButtonView: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  selectedButtonText: {
    color: theme.colors.WHITE,
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 7,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  horizontalSeparatorStyle: {
    borderRightWidth: 0.5,
    borderRightColor: theme.colors.SEPARATOR_LINE,
    marginHorizontal: 16,
  },
});

export interface ConsultOverlayProps extends NavigationScreenProps {
  // dispalyoverlay: boolean;
  setdispalyoverlay: (arg0: boolean) => void;
  // setdispalyoverlay: () => void;
  navigation: any;
  patientId: string;
  doctor: {};
}
export const ConsultOverlay: React.FC<ConsultOverlayProps> = (props) => {
  const tabs = ['Consult Online', 'Visit Clinic'];
  const today = new Date().toISOString().slice(0, 10);
  const onlineCTA = ['Consult Now', 'Schedule For Later'];
  const timings = [
    {
      title: 'Morning',
      selectedIcon: <Morning />,
      unselectedIcon: <MorningUnselected />,
    },
    {
      title: 'Afternoon',
      selectedIcon: <Afternoon />,
      unselectedIcon: <AfternoonUnselected />,
    },
    {
      title: 'Evening',
      selectedIcon: <Evening />,
      unselectedIcon: <EveningUnselected />,
    },
    {
      title: 'Night',
      selectedIcon: <Night />,
      unselectedIcon: <NightUnselected />,
    },
  ];
  const timeArray = {
    Morning: ['7:00 am', '7:40 am', '8:20 am', '9:00 am', '9:40 am'],
    Afternoon: ['10:00 am', '10:40 am', '11:20 am', '9:00 am', '11:40 am'],
    Evening: ['1:00 pm', '1:30 pm', '3:00 pm', '3:40 pm'],
    Night: ['5:00 pm', '5:30 pm', '6:00 pm', '7:00 pm'],
  };
  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);

  const [selectedTab, setselectedTab] = useState<string>(tabs[0]);
  const [selectedCTA, setselectedCTA] = useState<string>(onlineCTA[0]);
  // const [descriptionText, setdescriptionText] = useState<string>(onlineCTA[0]);
  const [dateSelected, setdateSelected] = useState<object>({
    [today]: {
      selected: true,
      selectedColor: theme.colors.APP_GREEN,
    },
  });

  const descriptionText = `${
    props.doctor ? `${props.doctor.salutation}. ${props.doctor.firstName}` : 'Doctor'
  } is available in 15mins!\nWould you like to consult now or schedule for later?`;

  const renderCalendar = () => {
    return (
      <Calendar
        style={{
          ...theme.viewStyles.cardContainer,
          backgroundColor: theme.colors.CARD_BG,
          // marginHorizontal: 0
        }}
        theme={{
          backgroundColor: theme.colors.CARD_BG,
          calendarBackground: theme.colors.CARD_BG,
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
    );
  };

  const renderTimings = () => {
    return (
      <View>
        <TabsComponent
          style={{
            backgroundColor: theme.colors.CARD_BG,
            // borderRadius: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: 'rgba(2, 71, 91, 0.3)',
          }}
          data={timings}
          onChange={(selectedtiming: string) => setselectedtiming(selectedtiming)}
          selectedTab={selectedtiming}
          showIcons={true}
        />
        {/* <FilterCard data={timeArray[selectedtiming]} /> */}
        <View style={styles.optionsView}>
          {timeArray[selectedtiming].map((name: any, index: number) => (
            <Button
              title={name}
              style={[
                styles.buttonStyle,
                index === 0 ? { backgroundColor: theme.colors.APP_GREEN } : null,
              ]}
              titleTextStyle={[
                styles.buttonTextStyle,
                index === 0 ? { color: theme.colors.WHITE } : null,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderLocation = () => {
    return (
      <View style={{ marginTop: 10 }}>
        <View style={{ paddingTop: 5, paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => {}}>
            <View style={styles.placeholderViewStyle}>
              <Text style={[styles.placeholderTextStyle]}>
                {props.clinics && props.clinics.length > 0 ? props.clinics[0].name : ''}
              </Text>
              <DropdownGreen size="sm" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 21, marginBottom: 4, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.SHERPA_BLUE,
                ...theme.fonts.IBMPlexSansMedium(13),
              }}
            >
              {props.clinics && props.clinics.length > 0
                ? `${props.clinics[0].addressLine1}, ${props.clinics[0].addressLine2},\n${props.clinics[0].city}`
                : ''}
            </Text>
          </View>
          {/* <View style={styles.horizontalSeparatorStyle} />
          <View style={{ width: 64, alignItems: 'flex-end' }}>
            <Location />
            <Text
              style={{
                color: theme.colors.SHERPA_BLUE,
                ...theme.fonts.IBMPlexSansMedium(12),
              }}
            >
              2.7 Kms
            </Text>
          </View> */}
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          // backgroundColor: 'white',
          alignItems: 'flex-end',
        }}
      >
        <TouchableOpacity
          onPress={() => props.setdispalyoverlay(false)}
          style={{
            marginTop: 38,
            backgroundColor: 'white',
            height: 28,
            width: 28,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
          }}
        >
          <CrossPopup />
        </TouchableOpacity>
      </View>
      <View
        // isVisible={props.dispalyoverlay}
        // windowBackgroundColor="rgba(0, 0, 0, .41)"
        // overlayBackgroundColor={theme.colors.DEFAULT_BACKGROUND_COLOR}

        // onBackdropPress={() => props.setdispalyoverlay(false)}
        style={{
          backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
          marginTop: 16,
          width: width - 40,
          height: 'auto',
          maxHeight: height - 98,
          padding: 0,
          // margin: 0,
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <TabsComponent
          style={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          data={tabs}
          onChange={(selectedTab: string) => setselectedTab(selectedTab)}
          selectedTab={selectedTab}
        />
        <ScrollView bounces={false}>
          {selectedTab === tabs[0] ? (
            <View>
              <View
                style={{
                  ...theme.viewStyles.cardContainer,
                  paddingHorizontal: 16,
                  paddingTop: 15,
                  paddingBottom: 20,
                  marginTop: 20,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.SHERPA_BLUE,
                    ...theme.fonts.IBMPlexSansMedium(14),
                  }}
                >
                  {descriptionText}
                </Text>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}
                >
                  <Button
                    title="Consult Now"
                    style={[
                      {
                        flex: 2,
                        // width: 'auto',
                        paddingHorizontal: 12,
                        backgroundColor: theme.colors.WHITE,
                      },
                      selectedCTA === onlineCTA[0] ? styles.selectedButtonView : null,
                    ]}
                    titleTextStyle={[
                      {
                        color: theme.colors.APP_GREEN,
                      },
                      selectedCTA === onlineCTA[0] ? styles.selectedButtonText : null,
                    ]}
                    onPress={() => setselectedCTA(onlineCTA[0])}
                  />
                  <View style={{ width: 16 }} />
                  <Button
                    title="Schedule For Later"
                    // style={{ width: 'auto', paddingHorizontal: 12 }}
                    style={[
                      {
                        flex: 3,
                        // width: 'auto',
                        paddingHorizontal: 12,
                        backgroundColor: theme.colors.WHITE,
                      },
                      selectedCTA === onlineCTA[1] ? styles.selectedButtonView : null,
                    ]}
                    titleTextStyle={[
                      {
                        color: theme.colors.APP_GREEN,
                      },
                      selectedCTA === onlineCTA[1] ? styles.selectedButtonText : null,
                    ]}
                    onPress={() => setselectedCTA(onlineCTA[1])}
                  />
                </View>
              </View>
              {selectedCTA === onlineCTA[1] && (
                <View>
                  {renderCalendar()}
                  <View
                    style={{
                      ...theme.viewStyles.cardContainer,
                      paddingHorizontal: 16,
                      marginTop: 16,
                    }}
                  >
                    {renderTimings()}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View
                style={{
                  ...theme.viewStyles.cardContainer,
                  paddingHorizontal: 0,
                  marginTop: 20,
                  marginBottom: 16,
                }}
              >
                {renderCalendar()}
              </View>
              <View
                style={{
                  ...theme.viewStyles.cardContainer,
                  paddingHorizontal: 16,
                  marginBottom: 16,
                }}
              >
                {renderLocation()}
                {renderTimings()}
              </View>
            </View>
          )}
          <View style={{ height: 96 }} />
        </ScrollView>
        <StickyBottomComponent
          defaultBG
          style={{
            paddingHorizontal: 16,
            height: 66,
            marginTop: 10,
          }}
        >
          <Mutation<bookAppointment, bookAppointmentVariables> mutation={BOOK_APPOINTMENT}>
            {(mutate, { loading, data, error }) => (
              <Button
                title="PAY Rs. 299"
                onPress={() => {
                  // props.setdispalyoverlay(false);
                  const formatDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');

                  const appointmentInput: bookAppointment_bookAppointment_appointment = {
                    patientId: props.patientId,
                    doctorId: props.doctor ? props.doctor.id : '',
                    appointmentDate: formatDate,
                    appointmentTime: '14:30:00Z',
                    appointmentType: selectedTab === tabs[0] ? 'ONLINE' : 'PHYSICAL',
                    hospitalId: '1',
                  };
                  console.log(appointmentInput, 'appointmentInput');
                  mutate({
                    variables: {
                      appointmentInput: appointmentInput,
                    },
                  });
                }}
              >
                {data
                  ? (console.log('bookAppointment data', data), props.setdispalyoverlay(false))
                  : null}
                {/* {loading ? setVerifyingPhoneNumber(false) : null} */}
                {error ? console.log('bookAppointment error', error) : null}
              </Button>
            )}
          </Mutation>
        </StickyBottomComponent>
      </View>
    </View>
  );
};
