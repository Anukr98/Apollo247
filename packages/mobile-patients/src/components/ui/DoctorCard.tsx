import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { getDoctorDetailsById_getDoctorDetailsById_specialty } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
// import { Star } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import React, { useState } from 'react';
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
import { GetDoctorNextAvailableSlot } from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { useQuery } from 'react-apollo-hooks';
import { NEXT_AVAILABLE_SLOT } from '@aph/mobile-patients/src/graphql/profiles';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';

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
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const [availableInMin, setavailableInMin] = useState<Number>(0);

  const todayDate = new Date().toISOString().slice(0, 10);
  const availability = useQuery<GetDoctorNextAvailableSlot>(NEXT_AVAILABLE_SLOT, {
    // fetchPolicy: 'no-cache',
    variables: {
      DoctorNextAvailableSlotInput: {
        doctorIds: props.rowData ? [props.rowData.id] : [],
        availableDate: todayDate,
      },
    },
  });

  if (availability.error) {
    console.log('error', availability.error);
  } else {
    console.log(availability.data, 'availabilityData', 'availableSlots');
    if (
      availability &&
      availability.data &&
      availability.data.getDoctorNextAvailableSlot &&
      availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
      availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots.length > 0 &&
      availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
      availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!.availableSlot &&
      availableInMin === 0
    ) {
      const nextSlot = availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!
        .availableSlot;
      console.log(nextSlot, 'nextSlot');
      let timeDiff: Number = 0;
      const time = nextSlot.split(':');
      let today: Date = new Date();
      let date2: Date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        Number(time[0]),
        Number(time[1])
      );
      if (date2 && today) {
        timeDiff = Math.round((date2 - today) / 60000);
      }
      console.log(timeDiff, 'timeDiff');
      setavailableInMin(timeDiff);
    }
  }

  const rowData = props.rowData;
  if (rowData)
    return (
      <TouchableOpacity
        style={[styles.doctorView, props.style]}
        onPress={() => {
          props.onPress
            ? props.onPress(rowData.id!)
            : props.navigation.navigate(AppRoutes.DoctorDetails, {
                doctorId: rowData.id ? rowData.id : '',
              });
        }}
      >
        <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            {props.displayButton && availableInMin ? (
              <CapsuleView
                title={`AVAILABLE IN ${
                  availableInMin >= 60
                    ? `${Number(availableInMin / 60)} ${
                        Number(availableInMin / 60) > 1 ? 'Hours' : 'Hour'
                      }`
                    : `${availableInMin} MINS`
                }`}
                style={styles.availableView}
                isActive={Number(availableInMin) >= 60 ? false : true}
              />
            ) : null}
            <View style={styles.imageView}>
              {/* {rowData.image} */}
              {rowData.photoUrl && (
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
              <View style={styles.buttonView}>
                <Text style={styles.buttonText}>{string.common.consult_now}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  return null;
};

DoctorCard.defaultProps = {
  displayButton: true,
};
