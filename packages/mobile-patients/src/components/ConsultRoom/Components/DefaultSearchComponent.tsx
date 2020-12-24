import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getAllSpecialties_getAllSpecialties } from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import { getPastSearches_getPastSearches } from '@aph/mobile-patients/src/graphql/types/getPastSearches';
import { NavigationScreenProps } from 'react-navigation';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { SymptomTrackerCard } from '@aph/mobile-patients/src/components/ConsultRoom/Components/SymptomTrackerCard';

interface defaultSearchProps extends NavigationScreenProps {
  consultedDoctors: any;
  pastSearches: (getPastSearches_getPastSearches | null)[];
  topSpecialities: getAllSpecialties_getAllSpecialties[];
  postSymptomTrackEvent: (() => void) | null;
  postSpecialityEvent: ((speciality: string, specialityId: string) => void) | null;
}

export const DefaultSearchComponent: React.FC<defaultSearchProps> = (props) => {
  const {
    consultedDoctors,
    pastSearches,
    topSpecialities,
    postSymptomTrackEvent,
    postSpecialityEvent,
  } = props;

  const renderTrackSymptoms = () => {
    return (
      <SymptomTrackerCard
        style={styles.symptomTrackerView}
        onPressTrack={() => {
          props.navigation.navigate(AppRoutes.SymptomTracker);
          postSymptomTrackEvent!();
        }}
      />
    );
  };

  const renderConsultedDoctors = () => {
    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.title}>{string.common.consultedDoctors}</Text>
        {consultedDoctors?.map((item: any, index: number) => {
          return (
            <View>
              {index === 3 && renderTrackSymptoms()}
              <TouchableOpacity
                style={styles.doctorCard}
                onPress={() => {
                  props.navigation.navigate(AppRoutes.DoctorDetails, {
                    doctorId: item?.id,
                    callSaveSearch: 'true',
                  });
                }}
              >
                <Image
                  resizeMode="cover"
                  source={{ uri: item?.photoUrl }}
                  style={styles.doctorProfileIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTxt}>{item?.displayName}</Text>
                  <Text style={styles.itemSubTxt}>{item?.specialty?.name?.toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
        {consultedDoctors?.length === 3 && renderTrackSymptoms()}
      </View>
    );
  };

  const renderPastSearches = () => {
    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.title}>{string.common.pastSearches}</Text>
        {pastSearches?.map((item: any, index: number) => {
          return (
            <View>
              {index === 3 &&
                consultedDoctors?.length < 4 &&
                consultedDoctors?.length !== 3 &&
                renderTrackSymptoms()}
              <TouchableOpacity
                style={styles.doctorCard}
                onPress={() => {
                  if (item?.searchType === 'DOCTOR') {
                    CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move clicked');
                    props.navigation.navigate(AppRoutes.DoctorDetails, {
                      doctorId: item?.typeId,
                      callSaveSearch: 'false',
                    });
                  }
                  if (item?.searchType === 'SPECIALTY') {
                    CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move  SPECIALTY clicked');
                    if (item?.typeId && item?.name) onClickSearch(item?.typeId, item?.name);
                  }
                }}
              >
                <Image
                  resizeMode="cover"
                  source={{ uri: item?.image }}
                  style={styles.doctorProfileIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTxt}>{item?.name}</Text>
                  <Text style={styles.itemSubTxt}>{item?.specialty?.toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
        {pastSearches?.length === 3 && renderTrackSymptoms()}
      </View>
    );
  };

  const renderTopSpecialities = () => {
    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.title}>{string.common.topSpecialities}</Text>
        {topSpecialities?.map((item: any, index: number) => {
          return (
            <View>
              {index === 3 &&
                pastSearches?.length < 4 &&
                pastSearches?.length !== 3 &&
                consultedDoctors?.length < 4 &&
                renderTrackSymptoms()}
              <TouchableOpacity
                style={styles.doctorCard}
                onPress={() => {
                  postSpecialityEvent!(item?.name, item?.id);
                  onClickSearch(item?.id, item?.name, item?.specialistPluralTerm || '');
                }}
              >
                <Image
                  resizeMode="contain"
                  source={{ uri: item?.image }}
                  style={styles.doctorProfileIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTxt}>{item?.name}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  const onClickSearch = (id: string, name: string, specialistPluralTerm?: string) => {
    props.navigation.navigate('DoctorSearchListing', {
      specialityId: id,
      specialityName: name,
      callSaveSearch: 'false',
      specialistPluralTerm,
    });
  };

  return (
    <View style={styles.container}>
      {consultedDoctors?.length > 0 && renderConsultedDoctors()}
      {pastSearches?.length > 0 && renderPastSearches()}
      {topSpecialities?.length > 0 && renderTopSpecialities()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 16,
  },
  title: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
    marginBottom: 16,
    flexWrap: 'wrap',
    marginHorizontal: 20,
  },
  doctorCard: {
    ...theme.viewStyles.cardViewStyle,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  doctorProfileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  itemTxt: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
    flexWrap: 'wrap',
  },
  itemSubTxt: {
    ...theme.viewStyles.text('M', 11, theme.colors.SKY_BLUE),
    flexWrap: 'wrap',
    marginTop: 2,
  },
  symptomTrackerView: {
    borderWidth: 1,
    borderColor: theme.colors.ORANGE_BORDER,
    marginTop: 2,
    marginBottom: 10,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    paddingHorizontal: 5,
  },
});
