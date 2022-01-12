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
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  g,
  postConsultPastSearchSpecialityClicked,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useShoppingCart } from '../../ShoppingCartProvider';

interface defaultSearchProps extends NavigationScreenProps {
  consultedDoctors: any;
  pastSearches: (getPastSearches_getPastSearches | null)[];
  topSpecialities: getAllSpecialties_getAllSpecialties[];
  postSymptomTrackEvent: (() => void) | null;
  postSpecialityEvent: ((speciality: string, specialityId: string, source?: string) => void) | null;
  isOnlineConsultMode?: boolean;
  locationFlagOnlineConsultation?: boolean;
  postEventClickSelectLocation?: (
    specialityName?: string | '',
    specialityId?: string | '',
    screen?: string | '',
    city?: string | ''
  ) => void;
}

export const DefaultSearchComponent: React.FC<defaultSearchProps> = (props) => {
  const {
    consultedDoctors,
    pastSearches,
    topSpecialities,
    postSymptomTrackEvent,
    postSpecialityEvent,
    isOnlineConsultMode,
    locationFlagOnlineConsultation,
  } = props;
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { locationDetails } = useAppCommonData();
  const { circleSubscriptionId, circleSubPlanId } = useShoppingCart();

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
                  props.navigation.navigate(AppRoutes.SlotSelection, {
                    doctorId: item?.id,
                    callSaveSearch: 'false',
                    showBookAppointment: true,
                    consultModeSelected: isOnlineConsultMode
                      ? string.consultModeTab.VIDEO_CONSULT
                      : string.consultModeTab.HOSPITAL_VISIT,
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
          const isSearchTypeDoctor = item?.searchType === 'DOCTOR';
          const isSearchTypeSpeciality = item?.searchType === 'SPECIALTY';
          return (
            <View>
              {index === 3 &&
                consultedDoctors?.length < 4 &&
                consultedDoctors?.length !== 3 &&
                renderTrackSymptoms()}
              <TouchableOpacity
                style={styles.doctorCard}
                onPress={() => {
                  if (isSearchTypeDoctor) {
                    CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move clicked');
                    postConsultPastSearchSpecialityClicked(
                      currentPatient,
                      allCurrentPatients,
                      item,
                      {
                        circleSubscriptionId: circleSubscriptionId,
                        circleSubPlanId: circleSubPlanId,
                      },
                      true
                    );
                    props.navigation.navigate(AppRoutes.SlotSelection, {
                      doctorId: item?.typeId,
                      callSaveSearch: 'false',
                      showBookAppointment: true,
                      consultModeSelected: isOnlineConsultMode
                        ? string.consultModeTab.VIDEO_CONSULT
                        : string.consultModeTab.HOSPITAL_VISIT,
                    });
                  }
                  if (isSearchTypeSpeciality) {
                    CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move  SPECIALTY clicked');
                    if (locationDetails || isOnlineConsultMode) {
                      postConsultPastSearchSpecialityClicked(
                        currentPatient,
                        allCurrentPatients,
                        item,
                        {
                          circleSubscriptionId: circleSubscriptionId,
                          circleSubPlanId: circleSubPlanId,
                        }
                      );
                      if (item?.typeId && item?.name) {
                        postSpecialityEvent?.(item?.name, item?.typeId, 'Past searches');
                        onClickSearch(
                          item?.typeId,
                          item?.name,
                          '',
                          isOnlineConsultMode && !locationFlagOnlineConsultation
                            ? string.doctor_search_listing.avaliablity
                            : string.doctor_search_listing.location
                        );
                      }
                    } else {
                      props.navigation.navigate(AppRoutes.SelectLocation, {
                        isOnlineConsultMode: isOnlineConsultMode,
                        patientId: g(currentPatient, 'id') || '',
                        patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
                        goBackCallback: (loc: any) => {
                          postConsultPastSearchSpecialityClicked(
                            currentPatient,
                            allCurrentPatients,
                            item,
                            {
                              circleSubscriptionId: circleSubscriptionId,
                              circleSubPlanId: circleSubPlanId,
                            }
                          );
                          if (item?.typeId && item?.name) {
                            postSpecialityEvent?.(item?.name, item?.typeId, 'Past searches');
                            onClickSearch(
                              item?.typeId,
                              item?.name,
                              '',
                              isOnlineConsultMode
                                ? string.doctor_search_listing.avaliablity
                                : string.doctor_search_listing.location
                            );
                          }
                        },
                        postEventClickSelectLocation: (city: string | '') =>
                          props.postEventClickSelectLocation &&
                          props.postEventClickSelectLocation(item?.name, item?.typeId, '', city),
                      });
                    }
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
                  <Text style={isSearchTypeDoctor ? styles.itemSubTxt : styles.smallText}>
                    {isSearchTypeDoctor ? item?.specialty?.toUpperCase() : item?.symptoms}
                  </Text>
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
                  if (locationDetails || isOnlineConsultMode) {
                    postSpecialityEvent!(item?.name, item?.id);
                    onClickSearch(
                      item?.id,
                      item?.name,
                      item?.specialistPluralTerm || '',
                      isOnlineConsultMode && !locationFlagOnlineConsultation
                        ? string.doctor_search_listing.avaliablity
                        : string.doctor_search_listing.location
                    );
                  } else {
                    props.navigation.navigate(AppRoutes.SelectLocation, {
                      isOnlineConsultMode: isOnlineConsultMode,
                      patientId: g(currentPatient, 'id') || '',
                      patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
                      goBackCallback: (loc: any) => {
                        postSpecialityEvent!(item?.name, item?.id);
                        onClickSearch(
                          item?.id,
                          item?.name,
                          item?.specialistPluralTerm || '',
                          isOnlineConsultMode
                            ? string.doctor_search_listing.avaliablity
                            : string.doctor_search_listing.location
                        );
                      },
                    });
                  }
                }}
              >
                <Image
                  resizeMode="contain"
                  source={{ uri: item?.image }}
                  style={styles.doctorProfileIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTxt}>{item?.name}</Text>
                  <Text style={styles.smallText}>{item?.symptoms}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  const onClickSearch = (
    id: string,
    name: string,
    specialistPluralTerm?: string,
    sortBy?: string
  ) => {
    props.navigation.navigate('DoctorSearchListing', {
      specialityId: id,
      specialityName: name,
      callSaveSearch: 'false',
      specialistPluralTerm,
      sortBy: sortBy,
      city: locationDetails?.city,
      isOnlineConsultMode,
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
  smallText: {
    ...theme.viewStyles.text('M', 10, theme.colors.GRAY),
    flexWrap: 'wrap',
    marginTop: 2,
  },
});
