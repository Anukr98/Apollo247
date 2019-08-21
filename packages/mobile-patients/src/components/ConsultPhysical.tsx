import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Afternoon,
  AfternoonUnselected,
  DropdownGreen,
  Evening,
  EveningUnselected,
  Location,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CalendarView, CALENDAR_TYPE } from './ui/CalendarView';
import moment from 'moment';
import { useQuery } from 'react-apollo-hooks';
import { getDoctorPhysicalAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorPhysicalAvailableSlots';
import { GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';

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
    ...theme.fonts.IBMPlexSansMedium(15),
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
    borderRightColor: 'rgba(2, 71, 91, 0.3)',
    marginHorizontal: 5,
    marginBottom: 5,
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
});

type TimeArray = {
  label: string;
  time: string[];
}[];

export interface ConsultPhysicalProps {
  doctor?: getDoctorDetailsById_getDoctorDetailsById | null;
  timeArray?: TimeArray;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  date: Date;
  setDate: (arg0: Date) => void;
  setselectedTimeSlot: (arg0: string) => void;
  selectedTimeSlot: string;
}
export const ConsultPhysical: React.FC<ConsultPhysicalProps> = (props) => {
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
  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [distance, setdistance] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.MONTH);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [availableSlots, setavailableSlots] = useState<string[] | null>([]);
  const [
    selectedClinic,
    setselectedClinic,
  ] = useState<getDoctorDetailsById_getDoctorDetailsById_doctorHospital | null>(
    props.clinics && props.clinics.length > 0 ? props.clinics[0] : null
  );

  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const searchstring = position.coords.latitude + ',' + position.coords.longitude;
      const key = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';

      const destination = selectedClinic
        ? `${selectedClinic.facility.streetLine1}, ${selectedClinic.facility.city}` // `${selectedClinic.facility.latitude},${selectedClinic.facility.longitude}`
        : '';
      const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${searchstring}&destinations=${destination}&mode=driving&language=pl-PL&sensor=true&key=${key}`;
      Axios.get(distanceUrl)
        .then((obj) => {
          console.log(obj, 'distanceUrl');
          if (obj.data.rows.length > 0 && obj.data.rows[0].elements.length > 0) {
            const value = obj.data.rows[0].elements[0].distance
              ? obj.data.rows[0].elements[0].distance.value
              : 0;
            console.log(`${(value / 1000).toFixed(1)} Kms`, 'distance');
            setdistance(`${(value / 1000).toFixed(1)} Kms`);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }, [props.clinics, selectedClinic]);

  const timeTo12HrFormat = (time: string) => {
    const IOSFormat = `${date.toISOString().split('T')[0]}T${time}:00.000Z`;
    const formatedSlot = moment(new Date(IOSFormat), 'HH:mm:ss.SSSz').format('HH:mm');
    const time_array = formatedSlot.split(':');
    let ampm = 'am';
    if (Number(time_array[0]) >= 12) {
      ampm = 'pm';
    }
    if (Number(time_array[0]) > 12) {
      time_array[0] = (Number(time_array[0]) - 12).toString();
    }
    return time_array[0].replace(/^00/, '12').replace(/^0/, '') + ':' + time_array[1] + ' ' + ampm;
  };

  const setTimeArrayData = (availableSlots: string[]) => {
    let array: TimeArray = [
      { label: 'Morning', time: [] },
      { label: 'Afternoon', time: [] },
      { label: 'Evening', time: [] },
      { label: 'Night', time: [] },
    ];
    console.log(availableSlots, 'setTimeArrayData');
    const morningStartTime = moment('06:00', 'HH:mm');
    const morningEndTime = moment('12:00', 'HH:mm');
    const afternoonStartTime = moment('12:01', 'HH:mm');
    const afternoonEndTime = moment('17:00', 'HH:mm');
    const eveningStartTime = moment('17:01', 'HH:mm');
    const eveningEndTime = moment('21:00', 'HH:mm');
    const nightStartTime = moment('21:01', 'HH:mm');
    const nightEndTime = moment('05:59', 'HH:mm');

    availableSlots.forEach((slot) => {
      const IOSFormat = `${date.toISOString().split('T')[0]}T${slot}:00.000Z`;
      const formatedSlot = moment(new Date(IOSFormat), 'HH:mm:ss.SSSz').format('HH:mm');
      console.log(new Date() < new Date(IOSFormat), 'IOSFormat......');
      const slotTime = moment(formatedSlot, 'HH:mm');
      if (new Date() < new Date(IOSFormat)) {
        if (slotTime.isBetween(nightEndTime, afternoonStartTime)) {
          array[0] = {
            label: 'Morning',
            time: [...array[0].time, slot],
          };
        } else if (slotTime.isBetween(morningEndTime, eveningStartTime)) {
          array[1] = {
            ...array[1],
            time: [...array[1].time, slot],
          };
        } else if (slotTime.isBetween(afternoonEndTime, nightStartTime)) {
          array[2] = {
            ...array[2],
            time: [...array[2].time, slot],
          };
        } else if (
          slotTime.isBetween(eveningEndTime, moment('23:59', 'HH:mm')) ||
          slotTime.isSame(moment('00:00', 'HH:mm')) ||
          slotTime.isBetween(moment('00:00', 'HH:mm'), morningStartTime)
        ) {
          array[3] = {
            ...array[3],
            time: [...array[3].time, slot],
          };
        }
      }
    });
    console.log(array, 'array', timeArray, 'timeArray');
    if (array !== timeArray) settimeArray(array);
  };

  const availableDate = date.toISOString().split('T')[0];
  console.log(availableDate, 'dateeeeeeee', props.doctor, 'doctorId');
  const availabilityData = useQuery<getDoctorPhysicalAvailableSlots>(
    GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS,
    {
      fetchPolicy: 'no-cache',
      variables: {
        DoctorPhysicalAvailabilityInput: {
          availableDate: availableDate,
          doctorId: props.doctor ? props.doctor.id : '',
          facilityId: selectedClinic ? selectedClinic.facility.id : '',
        },
      },
    }
  );

  if (availabilityData.error) {
    console.log('error', availabilityData.error);
  } else {
    console.log(availabilityData.data, 'availableSlots');
    if (
      availabilityData &&
      availabilityData.data &&
      availabilityData.data.getDoctorPhysicalAvailableSlots &&
      availabilityData.data.getDoctorPhysicalAvailableSlots.availableSlots &&
      availableSlots !== availabilityData.data.getDoctorPhysicalAvailableSlots.availableSlots
    ) {
      setTimeArrayData(availabilityData.data.getDoctorPhysicalAvailableSlots.availableSlots);
      console.log(availableSlots, 'availableSlots1111');

      setavailableSlots(availabilityData.data.getDoctorPhysicalAvailableSlots.availableSlots);
    }
  }

  const renderTimings = () => {
    // console.log(timeArray, 'timeArray123456789', selectedtiming);
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
          onChange={(selectedtiming: string) => {
            setselectedtiming(selectedtiming);
            // setselectedTimeSlot('');
          }}
          selectedTab={selectedtiming}
          showIcons={true}
        />
        <View style={styles.optionsView}>
          {timeArray && timeArray.length > 0
            ? timeArray.map((value) => {
                console.log(
                  value,
                  selectedtiming,
                  value.label === selectedtiming,
                  'selectedtiming'
                );
                if (value.label === selectedtiming) {
                  if (value.time.length > 0) {
                    return value.time.map((name: string, index: number) => (
                      <Button
                        key={index}
                        title={timeTo12HrFormat(name)}
                        style={[
                          styles.buttonStyle,
                          props.selectedTimeSlot === name
                            ? { backgroundColor: theme.colors.APP_GREEN }
                            : null,
                        ]}
                        titleTextStyle={[
                          styles.buttonTextStyle,
                          props.selectedTimeSlot === name ? { color: theme.colors.WHITE } : null,
                        ]}
                        onPress={() => props.setselectedTimeSlot(name)}
                      />
                    ));
                  } else {
                    return (
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(14),
                          color: theme.colors.SKY_BLUE,
                          paddingTop: 16,
                        }}
                      >
                        {`Dr. ${
                          props.doctor ? props.doctor!.firstName : ''
                        } is not available in the ${selectedtiming.toLowerCase()} slot :(`}
                      </Text>
                    );
                  }
                }
              })
            : null}
        </View>
      </View>
    );
  };

  const renderLocation = () => {
    console.log(selectedClinic, 'selectedClinic');
    return (
      <View style={{ marginTop: 10 }}>
        <View style={{ paddingTop: 5, paddingBottom: 10 }}>
          <TouchableOpacity
            onPress={() => {
              console.log('TouchableOpacity onpress');
              setShowPopup(!showPopup);
            }}
          >
            <View style={styles.placeholderViewStyle}>
              <Text style={[styles.placeholderTextStyle]}>
                {selectedClinic ? selectedClinic.facility.name : ''}
              </Text>
              <DropdownGreen size="sm" />
            </View>
          </TouchableOpacity>
          {showPopup && Popup()}
        </View>
        <View style={{ marginTop: 6, marginBottom: 4, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.SHERPA_BLUE,
                ...theme.fonts.IBMPlexSansMedium(13),
                paddingTop: 5,
                lineHeight: 20,
              }}
            >
              {selectedClinic
                ? `${selectedClinic.facility.streetLine1}, ${
                    selectedClinic.facility.streetLine2
                      ? `${selectedClinic.facility.streetLine2}, `
                      : ''
                  }${selectedClinic.facility.city}`
                : ''}
            </Text>
          </View>
          <View style={styles.horizontalSeparatorStyle} />
          <View style={{ width: 70, alignItems: 'flex-end' }}>
            <Location />
            <Text
              style={{
                color: theme.colors.SHERPA_BLUE,
                ...theme.fonts.IBMPlexSansMedium(12),
                paddingTop: 2,
                lineHeight: 20,
              }}
            >
              {distance}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCalendar = () => {
    return (
      <CalendarView
        date={date}
        minDate={new Date()}
        onPressDate={(date) => {
          setDate(date);
          props.setDate(date);
          props.setselectedTimeSlot('');
        }}
        calendarType={type}
        onCalendarTypeChanged={(type) => {
          setType(type);
        }}
      />
    );
  };
  const Popup = () => {
    console.log(showPopup, 'Popup');

    return (
      <View>
        <View
          style={{
            width: 300,
            borderRadius: 10,
            backgroundColor: 'white',
            marginRight: 20,
            // shadowColor: '#808080',
            // shadowOffset: { width: 0, height: 5 },
            // shadowOpacity: 0.8,
            // shadowRadius: 10,
            // elevation: 5,
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          {props.clinics.map((item) => (
            <View style={styles.textViewStyle}>
              <Text
                style={styles.textStyle}
                onPress={() => {
                  setselectedClinic(item);
                  setShowPopup(false);
                }}
              >
                {`${item.facility.streetLine1}, ${
                  item.facility.streetLine2 ? `${item.facility.streetLine2}, ` : ''
                }${item.facility.city}`}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  console.log(showPopup, 'showPopup');
  return (
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
  );
};
