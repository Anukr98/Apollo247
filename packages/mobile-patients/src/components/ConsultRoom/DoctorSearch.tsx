import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  GET_ALL_SPECIALTIES,
  GET_PATIENT_PAST_SEARCHES,
  SAVE_SEARCH,
  SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import { getPastSearches_getPastSearches } from '@aph/mobile-patients/src/graphql/types/getPastSearches';
import { getPatientPastSearches } from '@aph/mobile-patients/src/graphql/types/getPatientPastSearches';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { saveSearch } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import {
  SearchDoctorAndSpecialtyByName,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability,
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
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { ArrowRight } from '../ui/Icons';
import { CommonScreenLog, CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';

const { width } = Dimensions.get('window');

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
    marginHorizontal: 8,
  },
  rowTextStyles: {
    color: theme.colors.SEARCH_TITLE_COLOR,
    paddingHorizontal: 12,
    ...theme.fonts.IBMPlexSansSemiBold(14),
  },
  listSpecialistView: {
    ...theme.viewStyles.cardViewStyle,
    flexDirection: 'row',
  },
  rowSpecialistStyles: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginLeft: 16,
    marginTop: 12,
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'left',
    height: 24,
    width: width - 168,
    lineHeight: 24,
    paddingRight: 1,
  },
  rowDescriptionSpecialistStyles: {
    ...theme.fonts.IBMPlexSansMedium(12),
    marginLeft: 16,
    color: theme.colors.LIGHT_BLUE,
    textAlign: 'left',
    height: 24,
    width: width - 168,
    opacity: 0.6,
    lineHeight: 20,
    letterSpacing: 0.04,
    paddingRight: 1,
  },
  helpView: {
    marginTop: 40,
    marginBottom: 20,
  },
});
let timeout: NodeJS.Timeout;

// let doctorIds: (string | undefined)[] = [];
export interface DoctorSearchProps extends NavigationScreenProps {}

export const DoctorSearch: React.FC<DoctorSearchProps> = (props) => {
  // const params = props.navigation.state.params ? props.navigation.state.params!.searchText : '';
  // const MoveDoctor = props.navigation.state.params ? props.navigation.state.params!.MoveDoctor : '';

  const [searchText, setSearchText] = useState<string>('');
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
    | (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability | null)[]
    | null
  >([]);
  const [OtherDoctorAvailalbeSlots, setOtherDoctorAvailalbeSlots] = useState<
    | (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability | null)[]
    | null
  >([]);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [isSearching, setisSearching] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();

  // const fetchNextSlots = (doctorIds: (string | undefined)[]) => {
  //   const todayDate = new Date().toISOString().slice(0, 10);

  //   getNextAvailableSlots(client, doctorIds, todayDate)
  //     .then(({ data }: any) => {
  //       try {
  //         console.log(data, 'data res');
  //         if (data) {
  //           if (doctorAvailalbeSlots !== data) {
  //             // setdoctorAvailalbeSlots(data);
  //             setshowSpinner(false);
  //           }
  //         }
  //       } catch {}
  //     })
  //     .catch((e: string) => {
  //       setshowSpinner(false);
  //       console.log('Error occured ', e);
  //     });
  // };

  // const getIds = (list: any) => {
  //   if (list)
  //     return list.map((item: any) => {
  //       if (item) return item.id;
  //     });
  //   return [];
  // };

  const fetchSearchData = (searchTextString: string = searchText) => {
    if (searchTextString.length > 2) {
      setisSearching(true);
      client
        .query<SearchDoctorAndSpecialtyByName>({
          query: SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
          fetchPolicy: 'no-cache',
          variables: {
            searchText: searchTextString,
            patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
          },
        })
        .then(({ data }) => {
          try {
            const searchData =
              data && data.SearchDoctorAndSpecialtyByName
                ? data.SearchDoctorAndSpecialtyByName
                : null;
            if (searchData) {
              if (searchData.doctors) {
                console.log(searchData.doctors, 'searchData.doctors', searchTextString);
                // doctorIds = getIds(searchData.doctors);
                setdoctorsList(searchData.doctors);
                setdoctorAvailalbeSlots(searchData.doctorsNextAvailability);
              }
              if (searchData.possibleMatches) {
                // const ids = getIds(searchData.possibleMatches.doctors);
                // doctorIds.push(...ids);
                setpossibleMatches(searchData.possibleMatches);
              }
              if (searchData.specialties) {
                setsearchSpecialities(searchData.specialties);
              }
              if (searchData.otherDoctors) {
                // const ids = getIds(searchData.otherDoctors);
                // doctorIds.push(...ids);
                setotherDoctors(searchData.otherDoctors);
                setOtherDoctorAvailalbeSlots(searchData.otherDoctorsNextAvailability);
              }
              // doctorIds.length > 0 ? fetchNextSlots(doctorIds) :
              setshowSpinner(false);
            }
            setisSearching(false);
          } catch {}
        })
        .catch((e: string) => {
          console.log('Error occured while searching Doctor', e);
        });
    }
  };

  const fetchSpecialities = () => {
    client
      .query<getAllSpecialties>({
        query: GET_ALL_SPECIALTIES,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          if (data && data.getAllSpecialties && Specialities !== data.getAllSpecialties) {
            setSpecialities(data.getAllSpecialties);
            setshowSpinner(false);
          }
        } catch {}
      })
      .catch((e: string) => {
        setshowSpinner(false);
        console.log('Error occured', e);
      });
  };

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
        try {
          if (data && data.getPatientPastSearches) {
            // console.log('fetchPastSearches', data.getPatientPastSearches);
            setPastSearches(data.getPatientPastSearches);
          }
        } catch {}
      })
      .catch((e: string) => {
        console.log('Error occured', e);
      })
      .finally(() => {
        fetchSpecialities();
        !!searchText && fetchSearchData();
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
      !!searchText && fetchSearchData();
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    });

    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, [searchText]);

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    // const movedata = props.navigation.state.params ? props.navigation.state.params!.MoveDoctor : '';
    // if (movedata == 'MoveDoctor') {
    //   props.navigation.push(AppRoutes.SymptomChecker);
    // } else {
    CommonLogEvent(AppRoutes.DoctorSearch, 'Go back clicked');
    props.navigation.goBack();
    // }
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
              console.log(timeout, 'timeout');
              if (timeout) clearTimeout(timeout);
              timeout = setTimeout(() => {
                fetchSearchData(value);
              }, 300);
              if (value.length > 2) {
                // fetchSearchData(value);
                // setDoctorName(true);
                setdisplaySpeialist(true);
                setisSearching(true);
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
              CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move clicked');
              props.navigation.navigate(AppRoutes.DoctorDetails, { doctorId: rowData.typeId });
            }
            if (rowData.searchType === 'SPECIALTY') {
              CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move  SPECIALTY clicked');
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
    // console.log(SpecialitiesList, 'SpecialitiesList');
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
            numColumns={1}
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
                CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Speciality clicked');
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
                width: '100%',
                paddingHorizontal: 20,
                marginVertical: 8,
                marginTop: rowID === 0 ? 16 : 6,
                marginBottom: length === rowID + 1 ? 16 : 6,
                // height: 100,
              }}
              key={rowID}
            >
              <View style={styles.listSpecialistView}>
                {rowData.image && (
                  <Image
                    source={{
                      // uri: 'https://apollouatstg.blob.core.windows.net/hospitals/ic_cardiology.png',
                      uri: rowData.image,
                    }}
                    resizeMode={'contain'}
                    style={{
                      height: 40,
                      width: 40,
                      marginVertical: 14,
                      marginLeft: 16,
                    }}
                  />
                )}
                <View>
                  <Text numberOfLines={1} style={styles.rowSpecialistStyles}>
                    {rowData.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.rowDescriptionSpecialistStyles}>
                    {rowData.userFriendlyNomenclature}
                  </Text>
                </View>
                <ArrowRight
                  style={{
                    height: 24,
                    width: 24,
                    marginVertical: 22,
                  }}
                  resizeMode={'contain'}
                />
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
              doctorsNextAvailability={doctorAvailalbeSlots}
              // doctorAvailalbeSlots={doctorAvailalbeSlots}
              rowData={rowData}
              navigation={props.navigation}
              onPress={() => {
                CommonLogEvent(AppRoutes.DoctorSearch, 'renderSearchDoctorResultsRow clicked');
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
              {/* {data ? console.log(data, 'savesearch doctor data ') : null}
              {error ? console.log(error, 'savesearch doctor error') : null} */}
            </DoctorCard>
          )}
        </Mutation>
      );
    return null;
  };

  const renderPossibleDoctorResultsRow = (
    rowData: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors | null,
    isPossibleDoctor: boolean = false
  ) => {
    if (rowData)
      return (
        <Mutation<saveSearch> mutation={SAVE_SEARCH}>
          {(mutate, { loading, data, error }) => (
            <DoctorCard
              doctorsNextAvailability={
                isPossibleDoctor
                  ? possibleMatches
                    ? possibleMatches.doctorsNextAvailability
                    : []
                  : OtherDoctorAvailalbeSlots
              }
              // doctorAvailalbeSlots={doctorAvailalbeSlots}
              rowData={rowData}
              navigation={props.navigation}
              onPress={() => {
                CommonLogEvent(AppRoutes.DoctorSearch, 'renderPossibleDoctorResultsRow clicked');
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
              renderItem={({ item }) => renderPossibleDoctorResultsRow(item, true)}
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
                marginHorizontal: 12,
              }}
              bounces={false}
              data={possibleMatches.specialties}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) =>
                renderSpecialistRow(item, index, possibleMatches.specialties!.length, true)
              }
              keyExtractor={(_, index) => index.toString()}
              numColumns={1}
            />
          </View>
        )}
      </View>
    );
  };

  const renderOtherSUggestedDoctors = () => {
    if (otherDoctors && otherDoctors.length)
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
              {// props.navigation.state.params!.MoveDoctor == 'MoveDoctor'
              // ? null
              // :
              renderPastSearch()}
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
