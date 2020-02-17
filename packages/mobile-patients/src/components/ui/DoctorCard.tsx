import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AvailabilityCapsule } from '@aph/mobile-patients/src/components/ui/AvailabilityCapsule';
import { DoctorPlaceholderImage } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
import { getDoctorDetailsById_getDoctorDetailsById_specialty } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability } from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import {
  DoctorType,
  SEARCH_TYPE,
  ConsultMode,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { saveSearch } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
// import { Star } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
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
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  doctorNameStyles: {
    paddingTop: 32,
    paddingLeft: 0,
    textTransform: 'capitalize',
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
  fullName?: string | null;
  qualification?: string | null;
  mobileNumber?: string;
  experience?: string | null;
  specialization?: string | null;
  languages?: string | null;
  city?: string | null;
  awards?: string | null;
  photoUrl?: string | null;
  thumbnailUrl?: string | null;
  specialty?: getDoctorDetailsById_getDoctorDetailsById_specialty;
  registrationNumber?: string;
  onlineConsultationFees?: string;
  physicalConsultationFees?: string;
};

export interface DoctorCardProps extends NavigationScreenProps {
  rowData: any;
  // | SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors
  // | getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors
  // | getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor
  // | null;
  onPress?: (doctorId: string) => void;
  displayButton?: boolean;
  style?: StyleProp<ViewStyle>;
  // doctorAvailalbeSlots?:
  //   | (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[]
  //   | null;
  saveSearch?: boolean;
  doctorsNextAvailability?:
    | (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability | null)[]
    | null;
  numberOfLines?: number;
  availableModes?: ConsultMode | null;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const [availableInMin, setavailableInMin] = useState<number>();
  const [availableTime, setavailableTime] = useState<string>('');

  // const [doctorAvailalbeSlots, setdoctorAvailalbeSlots] = useState<
  //   (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[] | null
  // >([]);
  const [doctorsNextAvailability, setdoctorsNextAvailability] = useState<
    | (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability | null)[]
    | null
  >([]);
  const rowData = props.rowData;
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();

  // const setAvailability = useCallback(
  //   (
  //     doctorAvailalbeSlots:
  //       | (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[]
  //       | null
  //   ) => {
  //     const filterData = doctorAvailalbeSlots
  //       ? doctorAvailalbeSlots.filter((item) => {
  //           if (item && rowData) {
  //             return item.doctorId === rowData.id;
  //           }
  //         })
  //       : [];
  //     if (filterData.length > 0 && filterData[0]!.availableSlot) {
  //       const nextSlot = filterData[0] ? filterData[0]!.availableSlot : ''; //availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!
  //       let timeDiff: number = 0;
  //       const today: Date = new Date();
  //       const date2: Date = new Date(nextSlot);
  //       if (date2 && today) {
  //         timeDiff = Math.ceil(((date2 as any) - (today as any)) / 60000);
  //       }
  //       setavailableTime(nextSlot);
  //       setavailableInMin(timeDiff);
  //     }
  //   },
  //   [rowData]
  // );

  const setNextAvailability = useCallback(
    (
      doctorAvailalbeSlots:
        | (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability | null)[]
        | null
    ) => {
      const filterData = doctorAvailalbeSlots
        ? doctorAvailalbeSlots.filter((item) => {
            if (item && rowData) {
              return item.doctorId === rowData.id;
            }
          })
        : [];
      let nextSlot;
      if (props.availableModes) {
        nextSlot =
          props.availableModes === ConsultMode.ONLINE
            ? filterData[0]!.onlineSlot
            : props.availableModes === ConsultMode.PHYSICAL
            ? filterData[0]!.physicalSlot
            : null;
        console.log(props.availableModes, nextSlot);
      } else if (filterData.length > 0 && filterData[0]!.referenceSlot) {
        nextSlot = filterData[0] ? filterData[0]!.referenceSlot : ''; //availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!
      }
      if (nextSlot) {
        let timeDiff: number = 0;
        const today: Date = new Date();
        const date2: Date = new Date(nextSlot);
        if (date2 && today) {
          timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
        }
        setavailableTime(nextSlot);
        setavailableInMin(timeDiff);
      }
    },
    [rowData]
  );

  useEffect(() => {
    // if (props.doctorAvailalbeSlots && props.doctorAvailalbeSlots !== doctorAvailalbeSlots) {
    //   setdoctorAvailalbeSlots(props.doctorAvailalbeSlots);
    //   setAvailability(props.doctorAvailalbeSlots);
    // } else
    if (props.doctorsNextAvailability && props.doctorsNextAvailability != doctorsNextAvailability) {
      setdoctorsNextAvailability(props.doctorsNextAvailability);
      setNextAvailability(props.doctorsNextAvailability);
    }
  }, [
    // props.doctorAvailalbeSlots,
    // doctorAvailalbeSlots,
    // setAvailability,
    props.doctorsNextAvailability,
    doctorsNextAvailability,
    setNextAvailability,
  ]);

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
    if (props.saveSearch) {
      const searchInput = {
        type: SEARCH_TYPE.DOCTOR,
        typeId: props.rowData ? props.rowData.id : '',
        patient: currentPatient && currentPatient.id ? currentPatient.id : '',
      };
      client
        .mutate<saveSearch>({
          mutation: SAVE_SEARCH,
          variables: {
            saveSearchInput: searchInput,
          },
        })
        .then(({ data }) => {
          console.log(data, 'saveSearch result');
        })
        .catch((error) => {
          CommonBugFender('DoctorCard_navigateToDetails', error);
          console.log('Error occured', { error });
        });
    }
    props.navigation.navigate(AppRoutes.DoctorDetails, {
      doctorId: id,
      ...params,
    });
  };

  if (rowData) {
    const doctorClinics = rowData.doctorHospital.filter((item: any) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });
    const clinicAddress =
      doctorClinics.length > 0 && rowData.doctorType !== DoctorType.PAYROLL
        ? `${doctorClinics[0].facility.name}${doctorClinics[0].facility.name ? ', ' : ''}${
            doctorClinics[0].facility.city
          }`
        : '';

    return (
      <TouchableOpacity
        key={rowData.id}
        activeOpacity={1}
        style={[styles.doctorView, props.style]}
        onPress={() => {
          props.onPress ? props.onPress(rowData.id!) : navigateToDetails(rowData.id!);
        }}
      >
        <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <AvailabilityCapsule availableTime={availableTime} styles={styles.availableView} />
            {/* {props.displayButton &&
            availableInMin !== undefined ? (
              <CapsuleView
                upperCase
                title={nextAvailability(availableTime)}
                style={styles.availableView}
                isActive={Number(availableInMin) > 15 || availableInMin < 0 ? false : true}
              />
            ) : null} */}
            <View style={styles.imageView}>
              {/* {rowData.image} */}
              {rowData.thumbnailUrl &&
              rowData.thumbnailUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/) ? (
                <Image
                  style={{
                    height: 80,
                    borderRadius: 40,
                    width: 80,
                  }}
                  source={{
                    uri: rowData.thumbnailUrl,
                  }}
                  resizeMode={'contain'}
                />
              ) : (
                <DoctorPlaceholderImage />
              )}

              {/* {rowData.isStarDoctor ? (
              <Star style={{ height: 28, width: 28, position: 'absolute', top: 66, left: 30 }} />
            ) : null} */}
            </View>
            <View style={{ flex: 1, paddingRight: 16, marginBottom: 16 }}>
              <Text style={styles.doctorNameStyles}>{rowData.fullName}</Text>
              <Text style={styles.doctorSpecializationStyles}>
                {rowData.specialty && rowData.specialty.name ? rowData.specialty.name : ''} |{' '}
                {rowData.experience} YR
                {Number(rowData.experience) != 1 ? 'S' : ''}
              </Text>
              {rowData.specialty && rowData.specialty.userFriendlyNomenclature ? (
                <Text style={styles.doctorSpecializationStyles}>
                  {rowData.specialty.userFriendlyNomenclature}
                </Text>
              ) : null}
              <Text style={styles.educationTextStyles} numberOfLines={props.numberOfLines}>
                {rowData.qualification}
              </Text>
              {!!clinicAddress && (
                <Text style={styles.doctorLocation} numberOfLines={props.numberOfLines}>
                  {clinicAddress}
                </Text>
              )}
            </View>
          </View>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            {props.displayButton && (
              <View style={{ overflow: 'hidden' }}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.buttonView}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.DoctorSearchListing, 'Consult now clicked');
                    availableInMin && availableInMin < 60 && availableInMin > 0
                      ? navigateToDetails(rowData.id ? rowData.id : '', {
                          showBookAppointment: true,
                        })
                      : navigateToDetails(rowData.id ? rowData.id : '', {
                          showBookAppointment: true,
                        });
                  }}
                >
                  <Text style={styles.buttonText}>
                    {availableInMin && availableInMin < 60 && availableInMin > 0
                      ? string.common.consult_now
                      : string.common.book_apointment}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return null;
};

DoctorCard.defaultProps = {
  displayButton: true,
};
