import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GET_PATIENT_PAST_CONSULTED_DOCTORS } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getPatientPastConsultedDoctorsVariables,
  getPatientPastConsultedDoctors,
  getPatientPastConsultedDoctors_getPatientPastConsultedDoctors,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultedDoctors';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  DoctorPlaceholderImage,
  EllipseBulletPoint,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  renderConsultedDoctorsShimmer,
  renderConsultedDoctorsTitleShimmer,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { myConsultedDoctorsClickedWEBEngage } from '@aph/mobile-patients/src/helpers/CommonEvents';
import {
  useAppCommonData,
  appGlobalCache,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';

const { width } = Dimensions.get('window');
export const cardWidth = width / 2 - 25;

interface ConsultedDoctorProps extends NavigationScreenProps {}

export const ConsultedDoctorsCard: React.FC<ConsultedDoctorProps> = (props) => {
  const client = useApolloClient();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  const [loading, setLoading] = useState<boolean>(true);
  const [doctors, setDoctors] = useState<
    (getPatientPastConsultedDoctors_getPatientPastConsultedDoctors | null)[]
  >([]);
  const [doctorsCache, setDoctorsCache] = useState<
    getPatientPastConsultedDoctors_getPatientPastConsultedDoctors[]
  >([]);
  const { myDoctorsCount, setMyDoctorsCount } = useAppCommonData();

  useEffect(() => {
    currentPatient && getPastConsultedDoctors();
  }, []);

  const getPastConsultedDoctors = async () => {
    const doc = (await appGlobalCache.get('pastDoctors')) || JSON.stringify([]);
    setDoctorsCache(JSON.parse(doc));
    try {
      const res = await client.query<
        getPatientPastConsultedDoctors,
        getPatientPastConsultedDoctorsVariables
      >({
        query: GET_PATIENT_PAST_CONSULTED_DOCTORS,
        fetchPolicy: 'no-cache',
        variables: {
          patientMobile: currentPatient?.mobileNumber,
        },
      });
      if (res) {
        setDoctors(res?.data?.getPatientPastConsultedDoctors);
        setDoctorsCache(res?.data?.getPatientPastConsultedDoctors || []);
        appGlobalCache.set(
          'pastDoctors',
          JSON.stringify(res?.data?.getPatientPastConsultedDoctors) || JSON.stringify([])
        );
      }
      setMyDoctorsCount && setMyDoctorsCount(res?.data?.getPatientPastConsultedDoctors?.length);
      setLoading(false);
    } catch (error) {
      CommonBugFender('getPastConsultedDoctors', error);
      setLoading(false);
    }
  };

  const renderDoctorsCard = (item: any, index: number) => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        key={index}
        style={[
          styles.container,
          {
            marginLeft: index === 0 ? 20 : 10,
            marginRight: index === doctors?.length - 1 ? 20 : 0,
          },
        ]}
        onPress={() => onClickDoctorCard(item)}
      >
        <View style={styles.row}>
          {renderProfilePic(item)}
          <View style={styles.infoContainer}>
            <Text numberOfLines={1} style={styles.doctorName}>
              {item?.fullName}
            </Text>
            <Text numberOfLines={1} style={styles.speciality}>
              {item?.specialty?.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProfilePic = (
    item: getPatientPastConsultedDoctors_getPatientPastConsultedDoctors
  ) => {
    return (
      <View>
        {item?.thumbnailUrl ? (
          <Image
            style={styles.doctorProfile}
            source={{
              uri: item.thumbnailUrl!,
            }}
            resizeMode={'cover'}
          />
        ) : (
          <EllipseBulletPoint style={styles.doctorProfile} />
        )}
      </View>
    );
  };

  const onClickDoctorCard = (
    item: getPatientPastConsultedDoctors_getPatientPastConsultedDoctors
  ) => {
    myConsultedDoctorsClickedWEBEngage(currentPatient, item, allCurrentPatients, 'Home Page');
    item?.allowBookingRequest
      ? props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
          doctorId: item?.id,
          cleverTapAppointmentAttributes: {
            source: 'My Doctors',
            appointmentCTA: 'NA',
          },
        })
      : props.navigation.navigate(AppRoutes.DoctorDetails, {
          doctorId: item?.id,
          cleverTapAppointmentAttributes: {
            source: 'My Doctors',
            appointmentCTA: 'NA',
          },
        });
  };
  return (
    <View>
      {doctorsCache === null || doctorsCache == undefined ? (
        renderConsultedDoctorsShimmer()
      ) : (
        <FlatList
          data={doctorsCache}
          keyExtractor={(_, index) => `${index}`}
          renderItem={({ item, index }) => renderDoctorsCard(item, index)}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    flex: 1,
    height: 58,
    width: cardWidth,
    marginBottom: 20,
    marginLeft: 20,
    backgroundColor: theme.colors.ICE_BERG_FLAT,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.D4_GRAY,
    borderRadius: 6,
  },
  doctorProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorName: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE),
  },
  speciality: {
    ...theme.viewStyles.text('R', 11, theme.colors.SKY_BLUE),
  },
  infoContainer: {
    marginLeft: 5,
    width: cardWidth - 60,
  },
  myDoctorsTitle: {
    ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE),
    paddingHorizontal: 20,
  },
});
