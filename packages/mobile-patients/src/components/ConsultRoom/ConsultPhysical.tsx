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
  LocationOff,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Platform, PermissionsAndroid, AsyncStorage } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CalendarView, CALENDAR_TYPE } from '../ui/CalendarView';
import { useQuery } from 'react-apollo-hooks';
import { getDoctorPhysicalAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorPhysicalAvailableSlots';
import { GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';
import { divideSlots, timeTo12HrFormat } from '@aph/mobile-patients/src/helpers/helperFunctions';
import Permissions from 'react-native-permissions';
import Moment from 'moment';

const styles = StyleSheet.create({
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
    ...theme.fonts.IBMPlexSansMedium(13),
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
  setshowSpinner?: (arg0: boolean) => void;
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

  const fetchLocation = useCallback(() => {
    console.log('fetchLocation');

    Permissions.request('location')
      .then((response) => {
        console.log(response, 'permission response');
        if (response === 'authorized') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              let searchstring = '';
              AsyncStorage.getItem('location').then((item) => {
                const latlong = item ? JSON.parse(item) : null;
                console.log(item, 'AsyncStorage item', latlong);
                if (latlong) {
                  searchstring = `${latlong.lat}, ${latlong.lng}`;
                } else {
                  searchstring = position.coords.latitude + ', ' + position.coords.longitude;
                }
                console.log(searchstring, ' AsyncStorage searchstring');

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
                // }
              });
            },
            (error) => console.log(JSON.stringify(error)),
            { enableHighAccuracy: false, timeout: 2000 }
          );
        }
        //response is an object mapping type to permission
        // this.setState({
        //   cameraPermission: response.camera,
        //   photoPermission: response.photo,
        // });
      })
      .catch((error) => {
        console.log(error, 'error permission');
      });
  }, [selectedClinic]);

  const requestLocationPermission = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location', granted);
        fetchLocation();
      } else {
        console.log('location permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  }, [fetchLocation]);

  useEffect(() => {
    console.log('didmout');
    Platform.OS === 'android' ? requestLocationPermission() : fetchLocation();
  }, [requestLocationPermission]);

  const setTimeArrayData = (availableSlots: string[]) => {
    const array = divideSlots(availableSlots, date);
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
    props.setshowSpinner && props.setshowSpinner(false);
  } else {
    console.log(availabilityData.data, 'availableSlots');
    if (
      availabilityData &&
      availabilityData.data &&
      availabilityData.data.getDoctorPhysicalAvailableSlots &&
      availabilityData.data.getDoctorPhysicalAvailableSlots.availableSlots &&
      availableSlots !== availabilityData.data.getDoctorPhysicalAvailableSlots.availableSlots
    ) {
      props.setshowSpinner && props.setshowSpinner(false);
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
            ...theme.viewStyles.mediumSeparatorStyle,
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
            activeOpacity={1}
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
            {distance === '' ? <LocationOff /> : <Location />}
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
        onPressDate={(selectedDate) => {
          setDate(selectedDate);
          props.setDate(selectedDate);
          props.setselectedTimeSlot('');

          if (
            Moment(selectedDate).format('YYYY-MM-DD') !== Moment(date).format('YYYY-MM-DD') &&
            props.setshowSpinner
          )
            props.setshowSpinner(true);
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
