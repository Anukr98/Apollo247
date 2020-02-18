import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Afternoon,
  AfternoonUnselected,
  DropdownGreen,
  Evening,
  EveningUnselected,
  Location,
  LocationOff,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { getDoctorPhysicalAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorPhysicalAvailableSlots';
import {
  divideSlots,
  getNetStatus,
  timeTo12HrFormat,
  doRequestAndAccessLocation,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  AsyncStorage,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Permissions from 'react-native-permissions';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import moment from 'moment';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  CommonLogEvent,
  CommonScreenLog,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useAppCommonData } from '../AppCommonDataProvider';
import { useUIElements } from '../UIElementsProvider';

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
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  date: Date;
  setDate: (arg0: Date) => void;
  setselectedTimeSlot: (arg0: string) => void;
  selectedTimeSlot: string;
  setshowSpinner: (arg0: boolean) => void;
  setshowOfflinePopup: (arg0: boolean) => void;
  scrollToSlots: (top?: number) => void;
  setselectedClinic: (
    arg0: getDoctorDetailsById_getDoctorDetailsById_doctorHospital | null
  ) => void;
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
  const [NextAvailableSlot, setNextAvailableSlot] = useState<string>('');

  const [
    selectedClinic,
    setselectedClinic,
  ] = useState<getDoctorDetailsById_getDoctorDetailsById_doctorHospital | null>(
    props.clinics && props.clinics.length > 0 ? props.clinics[0] : null
  );
  const { locationForDiagnostics, locationDetails, setLocationDetails } = useAppCommonData();
  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();

  const client = useApolloClient();

  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);

  useEffect(() => {
    CommonScreenLog('Consult Physical', 'Consult Physical');
    if (NextAvailableSlot && timeArray) {
      for (const i in timeArray) {
        if (timeArray[i].time.length > 0) {
          if (timeArray[i].time.includes(NextAvailableSlot)) {
            setselectedtiming(timeArray[i].label);
            props.setselectedTimeSlot(NextAvailableSlot);
            break;
          }
        }
        props.scrollToSlots(350);
      }
    }
  }, [NextAvailableSlot, timeArray]);

  const checkAvailabilitySlot = () => {
    props.setshowSpinner && props.setshowSpinner(true);
    const todayDate = new Date().toISOString().slice(0, 10);
    getNextAvailableSlots(client, props.doctor ? [props.doctor.id] : [], todayDate)
      .then(({ data }: any) => {
        try {
          props.setshowSpinner && props.setshowSpinner(false);
          if (data[0] && data[0]!.physicalAvailableSlot) {
            const nextSlot = data[0]!.physicalAvailableSlot;
            const date2: Date = new Date(nextSlot);
            setNextAvailableSlot(nextSlot);
            setDate(date2);
            props.setDate(date2);
            fetchPhysicalSlots(date2);
          }
        } catch (e) {
          CommonBugFender('ConsultPhysical_checkAvailabilitySlot_try', e);
        }
      })
      .catch((e: any) => {
        CommonBugFender('ConsultPhysical_checkAvailabilitySlot', e);
        props.setshowSpinner && props.setshowSpinner(false);
        console.log('error', e);
      });
  };

  const findDistance = (searchstring: string) => {
    const key = AppConfig.Configuration.GOOGLE_API_KEY;

    const destination = selectedClinic
      ? `${selectedClinic.facility.latitude},${selectedClinic.facility.longitude}` //`${selectedClinic.facility.streetLine1}, ${selectedClinic.facility.city}`
      : '';
    const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${searchstring}&destinations=${destination}&mode=driving&language=pl-PL&sensor=true&key=${key}`;
    console.log(distanceUrl, 'distanceUrl');

    Axios.get(distanceUrl)
      .then((obj) => {
        console.log(obj, 'objobj');

        if (obj.data.rows.length > 0 && obj.data.rows[0].elements.length > 0) {
          const value = obj.data.rows[0].elements[0].distance
            ? obj.data.rows[0].elements[0].distance.value
            : 0;
          setdistance(`${(value / 1000).toFixed(1)} Kms`);
        }
      })
      .catch((error) => {
        CommonBugFender('ConsultPhysical_findDistance', error);
        console.log(error);
      });
  };

  const fetchLocation = useCallback(() => {
    if (!locationDetails) {
      doRequestAndAccessLocation()
        .then((response) => {
          console.log('response', { response });
          setLocationDetails!(response);
          findDistance(`${response.latitude}, ${response.longitude}`);
        })
        .catch((e) => {
          CommonBugFender('ConsultPhysical_fetchLocation', e);
          showAphAlert!({
            title: 'Uh oh! :(',
            description: 'Unable to access location.',
          });
        });
    } else {
      findDistance(`${locationDetails.latitude}, ${locationDetails.longitude}`);
    }

    // AsyncStorage.getItem('location').then(async (item) => {
    //   const location = item ? JSON.parse(item) : null;
    //   console.log(location, 'location');

    //   if (location && location.latlong) {
    //     findDistance(`${location.latlong.lat}, ${location.latlong.lng}`);
    //   } else {
    //     await Permissions.request('location')
    //       .then((response) => {
    //         if (response === 'authorized') {
    //           Geolocation.getCurrentPosition(
    //             (position) => {
    //               findDistance(position.coords.latitude + ',' + position.coords.longitude);
    //             },
    //             (error) => console.log(JSON.stringify(error)),
    //             { enableHighAccuracy: false, timeout: 2000 }
    //           );
    //         }
    //       })
    //       .catch((error) => {
    //         console.log(error, 'error permission');
    //       });
    //   }
    // });
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
      CommonBugFender('ConsultPhysical_requestLocationPermission_try', err);
      console.log(err);
    }
  }, [fetchLocation]);

  useEffect(() => {
    fetchPhysicalSlots(date);
    checkAvailabilitySlot();
  }, []);

  useEffect(() => {
    getNetStatus()
      .then((status) => {
        if (status) {
          Platform.OS === 'android' ? requestLocationPermission() : fetchLocation();
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultPhysical_getNetStatus', e);
      });
  }, [requestLocationPermission, fetchLocation]);

  const setTimeArrayData = async (availableSlots: string[], selectedDate: Date = date) => {
    setselectedtiming(timeArray[0].label);
    const array = await divideSlots(availableSlots, selectedDate);
    settimeArray(array);
  };

  const fetchPhysicalSlots = (selectedDate: Date) => {
    const availableDate = moment(selectedDate).format('YYYY-MM-DD');
    props.setshowSpinner(true);
    client
      .query<getDoctorPhysicalAvailableSlots>({
        query: GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS,
        variables: {
          DoctorPhysicalAvailabilityInput: {
            availableDate: availableDate,
            doctorId: props.doctor ? props.doctor.id : '',
            facilityId: selectedClinic ? selectedClinic.facility.id : '',
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          if (
            data &&
            data.getDoctorPhysicalAvailableSlots &&
            data.getDoctorPhysicalAvailableSlots.availableSlots
          ) {
            props.setshowSpinner(false);
            setTimeArrayData(data.getDoctorPhysicalAvailableSlots.availableSlots, selectedDate);
            setavailableSlots(data.getDoctorPhysicalAvailableSlots.availableSlots);
          }
        } catch (e) {
          CommonBugFender('ConsultPhysical_fetchPhysicalSlots_try', e);
        }
      })
      .catch((e: any) => {
        CommonBugFender('ConsultPhysical_fetchPhysicalSlots', e);
        props.setshowSpinner(false);
        console.log('error', e);
      });
  };
  const renderTimings = () => {
    return (
      <View>
        <TabsComponent
          style={{
            backgroundColor: theme.colors.CARD_BG,
            ...theme.viewStyles.mediumSeparatorStyle,
          }}
          data={timings}
          onChange={(selectedtiming: string) => {
            setselectedtiming(selectedtiming);
          }}
          selectedTab={selectedtiming}
          showIcons={true}
        />
        <View style={styles.optionsView}>
          {timeArray && timeArray.length > 0
            ? timeArray.map((value) => {
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
                        {`${
                          props.doctor ? props.doctor!.fullName : ''
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
    return (
      <View style={{ marginTop: 10 }}>
        <View style={{ paddingTop: 5, paddingBottom: 10 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              CommonLogEvent('CONSULT_PHYSICAL', 'Login clicked');
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
          fetchPhysicalSlots(selectedDate);
        }}
        calendarType={type}
        onCalendarTypeChanged={(type) => {
          setType(type);
        }}
      />
    );
  };
  const Popup = () => {
    return (
      <View>
        <View
          style={{
            width: 300,
            borderRadius: 10,
            backgroundColor: 'white',
            marginRight: 20,
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
                  props.setselectedClinic(item);
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
