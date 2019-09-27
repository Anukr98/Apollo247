import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  GET_ALL_SPECIALTIES,
  GET_PATIENT_PAST_SEARCHES,
  NEXT_AVAILABLE_SLOT,
  SAVE_SEARCH,
  SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots,
} from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { getPastSearches_getPastSearches } from '@aph/mobile-patients/src/graphql/types/getPastSearches';
import { getPatientPastSearches } from '@aph/mobile-patients/src/graphql/types/getPatientPastSearches';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { saveSearch } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import {
  SearchDoctorAndSpecialtyByName,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties,
} from '@aph/mobile-patients/src/graphql/types/SearchDoctorAndSpecialtyByName';
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Mutation } from 'react-apollo';
import { useApolloClient } from 'react-apollo-hooks';
import {
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: 'white',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  searchView: {
    // height: 58,
    paddingHorizontal: 20,
  },
  searchValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  listView: {
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 16,
    width: 'auto',
    backgroundColor: 'white',
    // shadowOffset: { width: 0, height: 5 },
    marginHorizontal: 8,
  },
  rowTextStyles: {
    color: theme.colors.SEARCH_TITLE_COLOR,
    paddingHorizontal: 12,
    ...theme.fonts.IBMPlexSansSemiBold(14),
  },
  listSpecialistView: {
    ...theme.viewStyles.cardViewStyle,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    // paddingBottom: 12,
  },
  rowSpecialistStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    paddingHorizontal: 9,
    paddingTop: 11,
    paddingBottom: 12,
    color: theme.colors.SEARCH_TITLE_COLOR,
    textAlign: 'center',
  },
  helpView: {
    marginTop: 40,
    marginBottom: 20,
  },
});

type pastSearches = {
  search: string;
};

const pastSearches: pastSearches[] = [
  {
    search: 'Dr. Alok Mehta',
  },
  {
    search: 'Cardiology',
  },
  {
    search: 'Paediatrician',
  },
  {
    search: 'DR. PARUL VAIDYA',
  },
];

let doctorIds: (string | undefined)[] = [];
let abortController;
export interface DoctorSearchProps extends NavigationScreenProps {}

export const DoctorSearch: React.FC<DoctorSearchProps> = (props) => {
  const params = props.navigation.state.params ? props.navigation.state.params!.searchText : '';
  const MoveDoctor = props.navigation.state.params ? props.navigation.state.params!.MoveDoctor : '';

  const [searchText, setSearchText] = useState<string>(params);
  const [pastSearch, setPastSearch] = useState<boolean>(true);
  const [needHelp, setNeedHelp] = useState<boolean>(true);
  const [displaySpeialist, setdisplaySpeialist] = useState<boolean>(true);
  const [Specialities, setSpecialities] = useState<getAllSpecialties_getAllSpecialties[]>([]);
  const [searchSpecialities, setsearchSpecialities] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties | null)[] | null
  >([]);
  const [PastSearches, setPastSearches] = useState<(getPastSearches_getPastSearches | null)[]>([]);
  const [doctorsList, setdoctorsList] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null)[] | null
  >([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [possibleMatches, setpossibleMatches] = useState<
    SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches
  >();
  const [otherDoctors, setotherDoctors] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors | null)[] | null
  >();
  const [doctorAvailalbeSlots, setdoctorAvailalbeSlots] = useState<
    (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[] | null
  >([]);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [isSearching, setisSearching] = useState<boolean>(false);

  // const [doctorIds, setdoctorIds] = useState<string[]>([]);

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();

  const fetchNextSlots = (doctorIds: (string | undefined)[]) => {
    //console.log(doctorIds, 'doctorIds fetchNextSlots');
    const todayDate = new Date().toISOString().slice(0, 10);

    getNextAvailableSlots(client, doctorIds, todayDate)
      .then(({ data }: any) => {
        console.log(data, 'data res');
        if (data) {
          if (doctorAvailalbeSlots !== data) {
            setdoctorAvailalbeSlots(data);
            setshowSpinner(false);
          }
        }
      })
      .catch((e: string) => {
        setshowSpinner(false);
        console.log('Error occured ', e);
      });

    // client
    //   .query<GetDoctorNextAvailableSlot>({
    //     query: NEXT_AVAILABLE_SLOT,
    //     variables: {
    //       DoctorNextAvailableSlotInput: {
    //         doctorIds: doctorIds,
    //         availableDate: todayDate,
    //       },
    //     },
    //     fetchPolicy: 'no-cache',
    //   })
    //   .then(({ data }) => {
    //     if (data) {
    //       if (
    //         data &&
    //         data.getDoctorNextAvailableSlot &&
    //         data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
    //         doctorAvailalbeSlots !== data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    //       ) {
    //         setdoctorAvailalbeSlots(data.getDoctorNextAvailableSlot.doctorAvailalbeSlots);
    //       }
    //     }
    //   })
    //   .catch((e: string) => {
    //     console.log('Error occured while searching Doctor', e);
    //   });

    // const availability = useQuery<GetDoctorNextAvailableSlot>(NEXT_AVAILABLE_SLOT, {
    //   fetchPolicy: 'no-cache',
    //   variables: {
    //     DoctorNextAvailableSlotInput: {
    //       doctorIds: doctorIds,
    //       availableDate: todayDate,
    //     },
    //   },
    // });
    // if (availability.error) {
    //   console.log('error', availability.error);
    // } else {
    //   //console.log('doctorIds fetchNextSlots result', availability);
    //   if (availability.data) {
    //     if (
    //       availability &&
    //       availability.data &&
    //       availability.data.getDoctorNextAvailableSlot &&
    //       availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
    //       doctorAvailalbeSlots !== availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    //     ) {
    //       console.log(
    //         availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots,
    //         'doctorIds fetchNextSlots doctorAvailalbeSlots'
    //       );
    //       setdoctorAvailalbeSlots(
    //         availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    //       );
    //     }
    //   }
    // }
  };
  //= new AbortController();

  const fetchSearchData = (searchTextString: string = searchText) => {
    // abortController && abortController.abort();
    // console.log(abortController, 'signal');

    // abortController = new AbortController();
    // console.log('fetchSearchData searchText', searchTextString, abortController);
    setisSearching(true);
    client
      .query<SearchDoctorAndSpecialtyByName>({
        query: SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
        fetchPolicy: 'no-cache',
        variables: {
          searchText: searchTextString,
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        // context: {
        //   fetchOptions: {
        //     signal: abortController.signal,
        //   },
        // },
      })
      .then(({ data }) => {
        console.log('searchText', searchText, searchTextString, data);
        const searchData =
          data && data.SearchDoctorAndSpecialtyByName ? data.SearchDoctorAndSpecialtyByName : null;
        if (searchData) {
          if (doctorsList !== searchData.doctors) {
            doctorIds = searchData.doctors
              ? searchData.doctors.map((item) => {
                  if (item) return item.id;
                })
              : [];
            setdoctorsList(searchData.doctors);
          }
          if (searchData.possibleMatches && possibleMatches !== searchData.possibleMatches) {
            const ids = searchData.possibleMatches.doctors
              ? searchData.possibleMatches.doctors.map((item) => {
                  if (item) return item.id;
                })
              : [];
            doctorIds.push(...ids);
            setpossibleMatches(searchData.possibleMatches);
          }
          if (searchSpecialities !== searchData.specialties) {
            setsearchSpecialities(searchData.specialties);
          }
          if (searchData.otherDoctors && otherDoctors !== searchData.otherDoctors) {
            const ids = searchData.otherDoctors
              ? searchData.otherDoctors.map((item) => {
                  if (item) return item.id;
                })
              : [];
            doctorIds.push(...ids);
            setotherDoctors(searchData.otherDoctors);
          }
          doctorIds.length > 0 ? fetchNextSlots(doctorIds) : setshowSpinner(false);
        }
        setisSearching(false);
      })
      .catch((e: string) => {
        console.log('Error occured while searching Doctor', e);
      });
  };

  // const newData = useQuery<SearchDoctorAndSpecialtyByName>(SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME, {
  //   fetchPolicy: 'no-cache',
  //   variables: {
  //     searchText: searchText,
  //     patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
  //   },
  // });
  // if (newData.error) {
  //   console.log('newData.error', JSON.stringify(newData.error));
  // } else {
  //   // console.log('newData.data doctor', newData.data);
  //   if (
  //     newData.data &&
  //     newData.data.SearchDoctorAndSpecialtyByName &&
  //     doctorsList !== newData.data.SearchDoctorAndSpecialtyByName.doctors
  //   ) {
  //     doctorIds = newData.data.SearchDoctorAndSpecialtyByName.doctors
  //       ? newData.data.SearchDoctorAndSpecialtyByName.doctors.map((item) => {
  //           if (item) return item.id;
  //         })
  //       : [];
  //     setdoctorsList(newData.data.SearchDoctorAndSpecialtyByName.doctors);
  //   }
  //   if (
  //     newData.data &&
  //     newData.data.SearchDoctorAndSpecialtyByName &&
  //     newData.data.SearchDoctorAndSpecialtyByName.possibleMatches &&
  //     possibleMatches !== newData.data.SearchDoctorAndSpecialtyByName.possibleMatches
  //   ) {
  //     const ids = newData.data.SearchDoctorAndSpecialtyByName.possibleMatches.doctors
  //       ? newData.data.SearchDoctorAndSpecialtyByName.possibleMatches.doctors.map((item) => {
  //           if (item) return item.id;
  //         })
  //       : [];
  //     doctorIds.push(...ids);
  //     setpossibleMatches(newData.data.SearchDoctorAndSpecialtyByName.possibleMatches);
  //   }
  //   if (
  //     newData.data &&
  //     newData.data.SearchDoctorAndSpecialtyByName &&
  //     searchSpecialities !== newData.data.SearchDoctorAndSpecialtyByName.specialties
  //   ) {
  //     setsearchSpecialities(newData.data.SearchDoctorAndSpecialtyByName.specialties);
  //   }
  //   if (
  //     newData.data &&
  //     newData.data.SearchDoctorAndSpecialtyByName &&
  //     newData.data.SearchDoctorAndSpecialtyByName.otherDoctors &&
  //     otherDoctors !== newData.data.SearchDoctorAndSpecialtyByName.otherDoctors
  //   ) {
  //     const ids = newData.data.SearchDoctorAndSpecialtyByName.otherDoctors
  //       ? newData.data.SearchDoctorAndSpecialtyByName.otherDoctors.map((item) => {
  //           if (item) return item.id;
  //         })
  //       : [];
  //     doctorIds.push(...ids);
  //     setotherDoctors(newData.data.SearchDoctorAndSpecialtyByName.otherDoctors);
  //   }
  //   fetchNextSlots(doctorIds);
  // }

  // const { data, error } = useQuery<SearchDoctorAndSpecialty, SearchDoctorAndSpecialtyVariables>(
  //   SEARCH_DOCTOR_AND_SPECIALITY,
  //   {
  //     variables: { searchText: searchText },
  //   }
  // );
  // if (error) {
  //   console.log('error', error);
  // } else {
  //   console.log('data doctor', data);
  // if (
  //   data &&
  //   data.SearchDoctorAndSpecialty &&
  //   doctorsList !== data.SearchDoctorAndSpecialty.doctors
  // ) {
  //   setdoctorsList(data.SearchDoctorAndSpecialty.doctors);
  //   searchText === '' && setallDoctors(data.SearchDoctorAndSpecialty.doctors)
  // }
  // if (
  //   data &&
  //   data.SearchDoctorAndSpecialty &&
  //   searchSpecialities !== data.SearchDoctorAndSpecialty.specialties
  // ) {
  //   console.log(
  //     data.SearchDoctorAndSpecialty.specialties,
  //     'data.SearchDoctorAndSpecialty.specialties'
  //   );
  //   setsearchSpecialities(data.SearchDoctorAndSpecialty.specialties);
  // }
  // if (
  //   data &&
  //   data.SearchDoctorAndSpecialty &&
  //   possibleMatches !== data.SearchDoctorAndSpecialty.possibleMatches
  // ) {
  //   setpossibleMatches(data.SearchDoctorAndSpecialty.possibleMatches);
  // }
  // }

  const fetchSpecialities = () => {
    client
      .query<getAllSpecialties>({
        query: GET_ALL_SPECIALTIES,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data && data.getAllSpecialties && Specialities !== data.getAllSpecialties) {
          console.log('data', data.getAllSpecialties);
          setSpecialities(data.getAllSpecialties);
          setshowSpinner(false);
        }
      })
      .catch((e: string) => {
        setshowSpinner(false);
        console.log('Error occured', e);
      });
  };

  // const getData = useQuery<getAllSpecialties, getAllSpecialties_getAllSpecialties>(
  //   GET_ALL_SPECIALTIES,
  //   {
  //     fetchPolicy: 'no-cache',
  //   }
  // );
  // //console.log(getData.loading, 'getData.loading');
  // if (getData.error) {
  //   setshowSpinner(showSpinner - 1);
  //   console.log('getData.error', getData.error);
  // } else {
  //   if (
  //     getData.data &&
  //     getData.data.getAllSpecialties &&
  //     Specialities !== getData.data.getAllSpecialties
  //   ) {
  //     console.log('getData.data', getData.data.getAllSpecialties);
  //     setSpecialities(getData.data.getAllSpecialties);
  //     setshowSpinner(showSpinner - 1);
  //   }
  // }
  //console.log(currentPatient && currentPatient.id ? currentPatient.id : '', 'currentPatient');

  // const pastData = useQuery<getPatientPastSearches>(GET_PATIENT_PAST_SEARCHES, {
  //   fetchPolicy: 'no-cache',
  //   variables: {
  //     patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
  //   },
  // });
  // if (pastData.error) {
  //   console.log('pastData.error', pastData.error);
  // } else {
  //   console.log(pastData, 'pastDatapastDatapastData');
  //   if (
  //     pastData.data &&
  //     pastData.data.getPatientPastSearches &&
  //     PastSearches !== pastData.data.getPatientPastSearches
  //   ) {
  //     setshowSpinner(showSpinner - 1);
  //     //console.log('pastData.data', pastData.data.getPatientPastSearches);
  //     setPastSearches(pastData.data.getPatientPastSearches);
  //   }
  // }

  const fetchPastSearches = () => {
    client
      .query<getPatientPastSearches>({
        query: GET_PATIENT_PAST_SEARCHES,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data && data.getPatientPastSearches && PastSearches !== data.getPatientPastSearches) {
          //console.log('data', data.getPatientPastSearches);
          setPastSearches(data.getPatientPastSearches);
        }
        fetchSpecialities();
        fetchSearchData(searchText);
      })
      .catch((e: string) => {
        setshowSpinner(false);
        console.log('Error occured', e);
        // setshowSpinner(false);
      });
  };

  useEffect(() => {
    getNetStatus().then((status) => {
      if (status) {
        fetchPastSearches();
      } else {
        setshowSpinner(false);
        setshowOfflinePopup(true);
      }
    });
  }, []);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', backDataFunctionality);
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    });

    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, []);

  const backDataFunctionality = async () => {
    console.log('backDataFunctionality hardwareBackPress');
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    const movedata = props.navigation.state.params ? props.navigation.state.params!.MoveDoctor : '';
    if (movedata == 'MoveDoctor') {
      props.navigation.push(AppRoutes.SymptomChecker);
    } else {
      props.navigation.goBack();
    }
    return false;
  };
  const renderSearch = () => {
    const hasError =
      searchText.length > 2 &&
      doctorsList &&
      doctorsList.length === 0 &&
      !showSpinner &&
      !isSearching &&
      searchSpecialities &&
      searchSpecialities.length === 0
        ? true
        : false;
    console.log(hasError, 'hasError', showSpinner);

    return (
      <View style={styles.searchContainer}>
        <Header
          title={'DOCTORS / SPECIALITIES'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => backDataFunctionality()}
        />
        <View style={styles.searchView}>
          <TextInputComponent
            conatinerstyles={{ paddingBottom: 0 }}
            inputStyle={[
              styles.searchValueStyle,
              hasError
                ? {
                    borderBottomColor: '#e50000',
                  }
                : {},
            ]}
            textInputprops={
              hasError
                ? {
                    selectionColor: '#e50000',
                  }
                : {}
            }
            value={searchText}
            placeholder="Search doctors or specialities"
            underlineColorAndroid="transparent"
            onChangeText={(value) => {
              setSearchText(value);
              if (value.length > 2) {
                fetchSearchData(value);
                // setDoctorName(true);
                setdisplaySpeialist(true);
              } else {
                setdisplaySpeialist(false);
              }
            }}
            onFocus={() => {
              if (searchText.length < 3) {
                setPastSearch(false);
                setNeedHelp(false);
                setdisplaySpeialist(false);
              }
            }}
            onBlur={() => {
              if (searchText === '' || searchText.length < 3) {
                setPastSearch(true);
                setNeedHelp(true);
                setdisplaySpeialist(true);
              }
            }}
          />
          {hasError ? (
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(12),
                color: '#890000',
                paddingVertical: 8,
              }}
            >
              Sorry, we couldn’t find what you are looking for :(
            </Text>
          ) : (
            <View
              style={{
                paddingBottom: 19,
              }}
            />
          )}
        </View>
      </View>
    );
  };

  const renderPastSearch = () => {
    if (pastSearch && PastSearches.length > 0) {
      return (
        <View>
          <SectionHeaderComponent sectionTitle={'Past Searches'} style={{ marginBottom: 0 }} />
          <FlatList
            contentContainerStyle={
              {
                // flexWrap: 'wrap',
                // marginHorizontal: 12,
              }
            }
            horizontal={true}
            bounces={false}
            data={PastSearches}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => renderRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      );
    }
  };

  const renderRow = (rowData: getPastSearches_getPastSearches | null, rowID: number) => {
    if (rowData) {
      return (
        <Button
          title={(rowData && rowData.name && rowData.name.toUpperCase()) || ''}
          style={[
            styles.listView,
            rowID === 0 ? { marginLeft: 20 } : null,
            rowID + 1 === PastSearches.length ? { marginRight: 20 } : null,
          ]}
          titleTextStyle={styles.rowTextStyles}
          onPress={() => {
            if (rowData.searchType === 'DOCTOR') {
              props.navigation.navigate(AppRoutes.DoctorDetails, { doctorId: rowData.typeId });
            }
            if (rowData.searchType === 'SPECIALTY') {
              if (rowData.typeId && rowData.name) onClickSearch(rowData.typeId, rowData.name);
              // props.navigation.navigate('DoctorSearchListing', { speciality: rowData.name });
            }
          }}
        />
      );
    } else return null;
  };

  const renderSpecialist = () => {
    // const SpecialitiesList = Specialities;

    const SpecialitiesList = searchText.length > 2 ? searchSpecialities : Specialities;
    //  console.log(SpecialitiesList, 'SpecialitiesList');
    if (SpecialitiesList && SpecialitiesList.length > 0 && displaySpeialist) {
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={
              searchText.length > 2
                ? `Matching Specialities — ${searchSpecialities && searchSpecialities.length}`
                : 'Specialities'
            }
            style={{
              marginBottom: 0,
              marginTop:
                PastSearches.length > 0
                  ? searchText.length > 0 && doctorsList && doctorsList.length === 0
                    ? 24
                    : 8
                  : 24,
            }}
          />
          <FlatList
            contentContainerStyle={{
              // flexWrap: 'wrap',
              marginHorizontal: 12,
            }}
            bounces={false}
            data={SpecialitiesList}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) =>
              renderSpecialistRow(item, index, SpecialitiesList.length, searchText.length > 2)
            }
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
          />
        </View>
      );
    }
  };

  const renderSpecialistRow = (
    rowData: getAllSpecialties_getAllSpecialties | null,
    rowID: number,
    length: number,
    isSearchResult?: boolean
  ) => {
    if (rowData)
      return (
        <Mutation<saveSearch> mutation={SAVE_SEARCH}>
          {(mutate, { loading, data, error }) => (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                onClickSearch(rowData.id, rowData.name);
                const searchInput = {
                  type: SEARCH_TYPE.SPECIALTY,
                  typeId: rowData.id,
                  patient: currentPatient && currentPatient.id ? currentPatient.id : '',
                };
                if (isSearchResult) {
                  mutate({
                    variables: {
                      saveSearchInput: searchInput,
                    },
                  });
                }
              }}
              style={{
                // flex: 1,
                width: '50%',
                paddingHorizontal: 8,
                marginVertical: 8,
                marginTop: rowID === 0 || rowID === 1 ? 16 : 8,
                marginBottom: length === rowID + 1 || (length - 1) % 2 === 1 ? 16 : 8,
                height: 100,
              }}
              key={rowID}
            >
              <View style={styles.listSpecialistView}>
                {rowData.image && (
                  <Image
                    source={{
                      uri:
                        // 'https://apollouatstg.blob.core.windows.net/specialties/drawable-xxxhdpi/ic_cardiology.png',
                        rowData.image,
                    }}
                    resizeMode={'contain'}
                    style={{ height: 36, width: 36 }}
                  />
                )}
                {/* {SpecialityImages[rowID % 4]} */}
                <Text style={styles.rowSpecialistStyles}>{rowData.name!.toUpperCase()}</Text>
              </View>
              {data ? console.log(data, 'savesearch data') : null}
              {error ? console.log(error, 'savesearch error') : null}
            </TouchableOpacity>
          )}
        </Mutation>
      );
    else return null;
  };

  const onClickSearch = (id: string, name: string) => {
    props.navigation.navigate('DoctorSearchListing', {
      specialityId: id,
      specialityName: name,
    });
  };

  const renderHelpView = () => {
    if (needHelp) {
      return;
      <NeedHelpAssistant navigation={props.navigation} containerStyle={styles.helpView} />;
    }
  };

  const renderDoctorSearches = () => {
    // console.log('doctorsList aaaa', doctorsList);

    if (searchText.length > 2 && doctorsList && doctorsList.length > 0) {
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={'Matching Doctors — ' + doctorsList.length}
            style={{ marginBottom: 0 }}
          />
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{
              marginTop: 20,
              marginBottom: 8,
            }}
            bounces={false}
            data={doctorsList}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => renderSearchDoctorResultsRow(item)}
          />
        </View>
      );
    }
  };

  const renderSearchDoctorResultsRow = (
    rowData: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null
  ) => {
    if (rowData)
      return (
        <Mutation<saveSearch> mutation={SAVE_SEARCH}>
          {(mutate, { loading, data, error }) => (
            <DoctorCard
              saveSearch={true}
              doctorAvailalbeSlots={doctorAvailalbeSlots}
              rowData={rowData}
              navigation={props.navigation}
              onPress={() => {
                const searchInput = {
                  type: SEARCH_TYPE.DOCTOR,
                  typeId: rowData.id,
                  patient: currentPatient && currentPatient.id ? currentPatient.id : '',
                };
                mutate({
                  variables: {
                    saveSearchInput: searchInput,
                  },
                });
                props.navigation.navigate(AppRoutes.DoctorDetails, {
                  doctorId: rowData.id,
                });
              }}
            >
              {data ? console.log(data, 'savesearch doctor data ') : null}
              {error ? console.log(error, 'savesearch doctor error') : null}
            </DoctorCard>
          )}
        </Mutation>
      );
    return null;
  };

  const renderPossibleDoctorResultsRow = (
    rowData: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors | null
  ) => {
    if (rowData)
      return (
        <Mutation<saveSearch> mutation={SAVE_SEARCH}>
          {(mutate, { loading, data, error }) => (
            <DoctorCard
              doctorAvailalbeSlots={doctorAvailalbeSlots}
              rowData={rowData}
              navigation={props.navigation}
              onPress={() => {
                const searchInput = {
                  type: SEARCH_TYPE.DOCTOR,
                  typeId: rowData.id,
                  patient: currentPatient && currentPatient.id ? currentPatient.id : '',
                };
                mutate({
                  variables: {
                    saveSearchInput: searchInput,
                  },
                });
                props.navigation.navigate(AppRoutes.DoctorDetails, {
                  doctorId: rowData.id,
                });
              }}
            >
              {data ? console.log(data, 'savesearch doctor data ') : null}
              {error ? console.log(error, 'savesearch doctor error') : null}
            </DoctorCard>
          )}
        </Mutation>
      );
    return null;
  };

  const renderPossibleMatches = () => {
    return (
      <View>
        {possibleMatches && possibleMatches.doctors && possibleMatches.doctors.length > 0 && (
          <View>
            <SectionHeaderComponent
              sectionTitle={'Possible Doctors — ' + possibleMatches.doctors.length}
              style={{ marginBottom: 0 }}
            />
            <FlatList
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{
                marginTop: 16,
                marginBottom: 8,
              }}
              bounces={false}
              data={possibleMatches.doctors}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) => renderPossibleDoctorResultsRow(item)}
            />
          </View>
        )}
        {possibleMatches && possibleMatches.specialties && possibleMatches.specialties.length > 0 && (
          <View>
            <SectionHeaderComponent
              sectionTitle={`Possible Specialities — ${possibleMatches.specialties.length}`}
              style={{
                marginBottom: 0,
                marginTop: 4,
              }}
            />
            <FlatList
              contentContainerStyle={{
                // flexWrap: 'wrap',
                marginHorizontal: 12,
              }}
              bounces={false}
              data={possibleMatches.specialties}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) =>
                renderSpecialistRow(item, index, possibleMatches.specialties!.length, true)
              }
              keyExtractor={(_, index) => index.toString()}
              numColumns={2}
            />
          </View>
        )}
      </View>
    );
  };

  const renderOtherSUggestedDoctors = () => {
    if (otherDoctors)
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={'Other Suggested Doctors'}
            style={{ marginBottom: 0, marginTop: 4 }}
          />
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{
              marginTop: 16,
              marginBottom: 8,
            }}
            bounces={false}
            data={otherDoctors}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => renderPossibleDoctorResultsRow(item)}
          />
        </View>
      );
    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        {doctorsList && renderSearch()}
        {!showSpinner ? (
          isSearching ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator animating={true} size="large" color="green" />
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              bounces={false}
              keyboardDismissMode="on-drag"
              onScrollBeginDrag={Keyboard.dismiss}
            >
              {props.navigation.state.params!.MoveDoctor == 'MoveDoctor'
                ? null
                : renderPastSearch()}
              {/* {renderPastSearch()} */}
              {renderDoctorSearches()}
              {renderSpecialist()}
              {searchText.length > 2 &&
                doctorsList &&
                doctorsList.length === 0 &&
                searchSpecialities &&
                searchSpecialities.length === 0 &&
                possibleMatches &&
                renderPossibleMatches()}
              {doctorsList &&
                searchText.length > 2 &&
                doctorsList.length === 1 &&
                otherDoctors &&
                renderOtherSUggestedDoctors()}
              {renderHelpView()}
            </ScrollView>
          )
        ) : null}
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
