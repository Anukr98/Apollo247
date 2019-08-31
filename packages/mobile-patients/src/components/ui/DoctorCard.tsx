import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { getDoctorDetailsById_getDoctorDetailsById_specialty } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
// import { Star } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '../../theme/theme';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots,
} from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { useQuery } from 'react-apollo-hooks';
import { NEXT_AVAILABLE_SLOT } from '@aph/mobile-patients/src/graphql/profiles';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import Moment from 'moment';

const styles = StyleSheet.create({
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    ...theme.viewStyles.cardViewStyle,
    marginBottom: 12,
    borderRadius: 10,
  },
  buttonView: {
    height: 44,
    backgroundColor: theme.colors.BUTTON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_TEXT,
  },
  availableView: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  imageView: {
    margin: 16,
    width: 80,
  },
  doctorNameStyles: {
    paddingTop: 32,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
    textTransform: 'uppercase',
  },
  doctorLocation: {
    marginBottom: 16,
    paddingTop: 2,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
  educationTextStyles: {
    paddingTop: 12,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
});

type rowData = {
  id?: string;
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  qualification?: string | null;
  mobileNumber?: string;
  experience?: string | null;
  specialization?: string | null;
  languages?: string | null;
  city?: string | null;
  awards?: string | null;
  photoUrl?: string | null;
  specialty?: getDoctorDetailsById_getDoctorDetailsById_specialty;
  registrationNumber?: string;
  onlineConsultationFees?: string;
  physicalConsultationFees?: string;
};

export interface DoctorCardProps extends NavigationScreenProps {
  rowData: rowData | null;
  onPress?: (doctorId: string) => void;
  displayButton?: boolean;
  style?: StyleProp<ViewStyle>;
  doctorAvailalbeSlots?:
    | (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[]
    | null;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const [availableInMin, setavailableInMin] = useState<number>();
  const [availableTime, setavailableTime] = useState<string>('');

  const [doctorAvailalbeSlots, setdoctorAvailalbeSlots] = useState<
    (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[] | null
  >([]);
  const rowData = props.rowData;

  const setAvailability = useCallback(
    (
      doctorAvailalbeSlots:
        | (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[]
        | null
    ) => {
      console.log(doctorAvailalbeSlots, 'doctorAvailalbeSlots', rowData);
      const filterData = doctorAvailalbeSlots
        ? doctorAvailalbeSlots.filter((item) => {
            if (item && rowData) {
              return item.doctorId === rowData.id;
            }
          })
        : [];
      console.log(filterData, 'filterData');
      if (filterData.length > 0 && filterData[0]!.availableSlot) {
        const nextSlot = filterData[0] ? filterData[0]!.availableSlot : ''; //availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!

        console.log(nextSlot, 'nextSlot dd');
        // const ISOFormat = nextSlot; //`${todayDate}T${nextSlot}:48.000Z`;
        const formatedTime = Moment(new Date(nextSlot), 'HH:mm:ss.SSSz').format('HH:mm');
        let timeDiff: number = 0;
        const time = formatedTime.split(':');
        const today: Date = new Date();
        const date2: Date = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          Number(time[0]),
          Number(time[1])
        );
        if (date2 && today) {
          timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
        }
        if (timeDiff < 0) {
          const availableTime = Moment(new Date(nextSlot), 'HH:mm:ss.SSSz').format('h:mm A');
          setavailableTime(availableTime);
        }
        setavailableInMin(timeDiff);
      }
    },
    [rowData]
  );

  useEffect(() => {
    if (props.doctorAvailalbeSlots && props.doctorAvailalbeSlots !== doctorAvailalbeSlots) {
      setdoctorAvailalbeSlots(props.doctorAvailalbeSlots);
      setAvailability(props.doctorAvailalbeSlots);
    }
  }, [props.doctorAvailalbeSlots, doctorAvailalbeSlots, setAvailability]);

  // const todayDate = new Date().toISOString().slice(0, 10);
  // const availability = useQuery<GetDoctorNextAvailableSlot>(NEXT_AVAILABLE_SLOT, {
  //   fetchPolicy: 'no-cache',
  //   variables: {
  //     DoctorNextAvailableSlotInput: {
  //       doctorIds: props.rowData ? [props.rowData.id] : [],
  //       availableDate: todayDate,
  //     },
  //   },
  // });

  // if (availability.error) {
  //   console.log('error', availability.error);
  // } else {
  //   if (
  //     availability &&
  //     availability.data &&
  //     availability.data.getDoctorNextAvailableSlot &&
  //     availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
  //     availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots.length > 0 &&
  //     availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
  //     availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!.availableSlot &&
  //     availableInMin === undefined
  //   ) {
  //     const nextSlot = availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!
  //       .availableSlot;
  //     console.log(nextSlot, 'nextSlot dd');
  //     // const ISOFormat = nextSlot; //`${todayDate}T${nextSlot}:48.000Z`;
  //     const formatedTime = Moment(new Date(nextSlot), 'HH:mm:ss.SSSz').format('HH:mm');
  //     let timeDiff: number = 0;
  //     const time = formatedTime.split(':');
  //     const today: Date = new Date();
  //     const date2: Date = new Date(
  //       today.getFullYear(),
  //       today.getMonth(),
  //       today.getDate(),
  //       Number(time[0]),
  //       Number(time[1])
  //     );
  //     if (date2 && today) {
  //       timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
  //     }
  //     if (timeDiff < 0) {
  //       const availableTime = Moment(new Date(nextSlot), 'HH:mm:ss.SSSz').format('h:mm A');
  //       setavailableTime(availableTime);
  //     }
  //     setavailableInMin(timeDiff);
  //   }
  // }

  const navigateToDetails = (id: string, params?: {}) => {
    props.navigation.navigate(AppRoutes.DoctorDetails, {
      doctorId: id,
      ...params,
    });
  };

  const availabilityText = () => {
    if (availableInMin) {
      if (availableInMin === 0) {
        return 'AVAILABLE NOW';
      } else if (availableInMin > 0 && availableInMin <= 15) {
        return ` AVAILABLE IN ${availableInMin} MINS`;
      } else if (availableInMin > 15 && availableInMin <= 45) {
        return `AVAILABLE IN ${availableInMin} MINS`;
      } else if (availableInMin > 45 && availableInMin <= 60) {
        return `AVAILABLE IN 1 HOUR`;
      } else if (availableInMin > 60) {
        return `TODAY ${Moment(new Date(), 'h:mm a').format('h:mm a')}`;
      }
    }
  };

  if (rowData) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.doctorView, props.style]}
        onPress={() => {
          props.onPress ? props.onPress(rowData.id!) : navigateToDetails(rowData.id!);
        }}
      >
        <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            {props.displayButton && availableInMin !== undefined ? (
              <CapsuleView
                title={availabilityText()}
                style={styles.availableView}
                isActive={Number(availableInMin) >= 60 || availableInMin < 0 ? false : true}
              />
            ) : null}
            <View style={styles.imageView}>
              {/* {rowData.image} */}
              {rowData.photoUrl &&
                rowData.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) && (
                  <Image
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                    source={{ uri: rowData.photoUrl }}
                  />
                )}

              {/* {rowData.isStarDoctor ? (
              <Star style={{ height: 28, width: 28, position: 'absolute', top: 66, left: 30 }} />
            ) : null} */}
            </View>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.doctorNameStyles}>
                Dr. {rowData.firstName} {rowData.lastName}
              </Text>
              <Text style={styles.doctorSpecializationStyles}>
                {rowData.specialty ? rowData.specialty.name : ''} | {rowData.experience} YRS
              </Text>
              <Text style={styles.educationTextStyles}>{rowData.qualification}</Text>
              <Text style={styles.doctorLocation}>{rowData.city}</Text>
            </View>
          </View>
          {props.displayButton && (
            <View style={{ overflow: 'hidden' }}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.buttonView}
                onPress={() =>
                  availableInMin && availableInMin < 60
                    ? navigateToDetails(rowData.id ? rowData.id : '', { showBookAppointment: true })
                    : navigateToDetails(rowData.id ? rowData.id : '')
                }
              >
                <Text style={styles.buttonText}>
                  {availableInMin && availableInMin < 60
                    ? string.common.consult_now
                    : string.common.book_apointment}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
  return null;
};

DoctorCard.defaultProps = {
  displayButton: true,
};
