import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Afternoon,
  AfternoonUnselected,
  Evening,
  EveningUnselected,
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
  timeTo12HrFormat,
  g,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import moment from 'moment';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { WebEngageEventName, WebEngageEvents } from '../../helpers/webEngageEvents';
import { useAllCurrentPatients } from '../../hooks/authHooks';

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
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.MONTH);
  const [availableSlots, setavailableSlots] = useState<string[] | null>([]);
  const [NextAvailableSlot, setNextAvailableSlot] = useState<string>('');

  const [
    selectedClinic,
    setselectedClinic,
  ] = useState<getDoctorDetailsById_getDoctorDetailsById_doctorHospital | null>(
    props.clinics && props.clinics.length > 0 ? props.clinics[0] : null
  );
  const { currentPatient } = useAllCurrentPatients();

  const client = useApolloClient();

  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);

  useEffect(() => {
    if (NextAvailableSlot && timeArray) {
      for (const i in timeArray) {
        if (timeArray[i].time.length > 0) {
          if (timeArray[i].time.includes(NextAvailableSlot)) {
            setselectedtiming(timeArray[i].label);
            props.setselectedTimeSlot(NextAvailableSlot);
            props.setshowSpinner?.(false);
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
          props.setshowSpinner?.(false);
        }
      })
      .catch((e: any) => {
        CommonBugFender('ConsultPhysical_checkAvailabilitySlot', e);
        props.setshowSpinner && props.setshowSpinner(false);
      });
  };

  useEffect(() => {
    fetchPhysicalSlots(date);
    checkAvailabilitySlot();
  }, []);

  const setTimeArrayData = async (availableSlots: string[], selectedDate: Date = date) => {
    if (availableSlots?.length === 0) props.setshowSpinner?.(false);
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
            setTimeArrayData(data.getDoctorPhysicalAvailableSlots.availableSlots, selectedDate);
            setavailableSlots(data.getDoctorPhysicalAvailableSlots.availableSlots);
          }
        } catch (e) {
          CommonBugFender('ConsultPhysical_fetchPhysicalSlots_try', e);
          props.setshowSpinner?.(false);
        }
      })
      .catch((e: any) => {
        CommonBugFender('ConsultPhysical_fetchPhysicalSlots', e);
        props.setshowSpinner(false);
      });
  };

  useEffect(() => {
    if (!timeArray || !selectedtiming) {
      return;
    }
    const selectedTabSlots = (timeArray || []).find((item) => item.label == selectedtiming);
    if (selectedTabSlots && selectedTabSlots.time.length == 0) {
      const data: getDoctorDetailsById_getDoctorDetailsById = props.doctor!;
      const eventAttributes: WebEngageEvents[WebEngageEventName.NO_SLOTS_FOUND] = {
        'Doctor Name': g(data, 'fullName')!,
        'Speciality ID': g(data, 'specialty', 'id')!,
        'Speciality Name': g(data, 'specialty', 'name')!,
        'Doctor Category': g(data, 'doctorType')!,
        'Consult Date Time': moment().toDate(),
        'Consult Mode': 'Physical',
        'Hospital Name': g(data, 'doctorHospital', '0' as any, 'facility', 'name')!,
        'Hospital City': g(data, 'doctorHospital', '0' as any, 'facility', 'city')!,
        'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        Relation: g(currentPatient, 'relation'),
        'Patient Age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Patient Gender': g(currentPatient, 'gender'),
        'Customer ID': g(currentPatient, 'id'),
      };
      postWebEngageEvent(WebEngageEventName.NO_SLOTS_FOUND, eventAttributes);
    }
  }, [selectedtiming, timeArray]);

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
        {renderTimings()}
      </View>
    </View>
  );
};
