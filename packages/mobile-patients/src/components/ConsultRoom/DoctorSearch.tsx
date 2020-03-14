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
  DOCTOR_SPECIALITY_BY_FILTERS,
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
import {
  getNetStatus,
  isValidSearch,
  postWebEngageEvent,
  g,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
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
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import moment from 'moment';
import { getDoctorsBySpecialtyAndFilters } from '../../graphql/types/getDoctorsBySpecialtyAndFilters';
import { useAppCommonData } from '../AppCommonDataProvider';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import AsyncStorage from '@react-native-community/async-storage';

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
  const [showPastSearchSpinner, setshowPastSearchSpinner] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const {
    setGeneralPhysicians,
    locationDetails,
    setUrology,
    setDermatology,
    setEnt,
  } = useAppCommonData();

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

  const fetchDoctorData = (id: string, speciality: string) => {
    let geolocation = {} as any;
    if (locationDetails) {
      geolocation = {
        geolocation: {
          latitude: parseFloat(locationDetails.latitude ? locationDetails.latitude.toString() : ''),
          longitude: parseFloat(
            locationDetails.longitude ? locationDetails.longitude.toString() : ''
          ),
        },
      };
    }

    console.log(geolocation, 'geolocation');

    const FilterInput = {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
      specialty: id,
      ...geolocation,
    };
    console.log(FilterInput, 'FilterInput1111');

    client
      .query<getDoctorsBySpecialtyAndFilters>({
        query: DOCTOR_SPECIALITY_BY_FILTERS,
        fetchPolicy: 'no-cache',
        variables: {
          filterInput: FilterInput,
        },
      })
      .then(({ data }) => {
        console.log(data, 'dataaaaa');
        if (speciality === 'General Physician/ Internal Medicine')
          setGeneralPhysicians && setGeneralPhysicians({ id: id, data: data });
        else if (speciality === 'Urology') {
          setUrology && setUrology({ id: id, data: data });
        } else if (speciality === 'ENT') {
          setEnt && setEnt({ id: id, data: data });
        } else if (speciality === 'Dermatology') {
          setDermatology && setDermatology({ id: id, data: data });
        }

        // try {
        //   const filterGetData =
        //     data && data.getDoctorsBySpecialtyAndFilters
        //       ? data.getDoctorsBySpecialtyAndFilters
        //       : null;
        //   if (filterGetData) {
        //     if (filterGetData.doctors) {
        //       // setDoctorsList(filterGetData.doctors);
        //     }

        //     if (filterGetData.doctorsAvailability) {
        //       // setdoctorsAvailability(filterGetData.doctorsAvailability);
        //       setshowSpinner(false);
        //     }
        //     if (filterGetData.specialty) {
        //       // setspecialities(filterGetData.specialty);
        //       setshowSpinner(false);
        //     }

        //     if (filterGetData.doctorsNextAvailability) {
        //       // setdoctorsNextAvailability(filterGetData.doctorsNextAvailability);
        //       setshowSpinner(false);
        //     }
        //   }
        // } catch (e) {
        //   CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData_try', e);
        // }
      })
      .catch((e) => {
        // CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData', e);
        // setshowSpinner(false);
        console.log('Error 11111111', e);
      });
  };

  const postwebEngageSearchEvent = (searchInput: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_SEARCH] = {
      'Search Text': searchInput,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      Gender: g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.DOCTOR_SEARCH, eventAttributes);
  };

  const fetchSearchData = (searchTextString: string = searchText) => {
    if (searchTextString.length > 2) {
      postwebEngageSearchEvent(searchTextString);
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
          } catch (e) {
            CommonBugFender('DoctorSearch_fetchSearchData_try', e);
          }
        })
        .catch((e) => {
          CommonBugFender('DoctorSearch_fetchSearchData', e);
          console.log('Error occured while searching Doctor', e);
        });
    }
  };

  const fetchSpecialities = () => {
    console.log('fetchSpecialities');
    setshowSpinner(true);
    client
      .query<getAllSpecialties>({
        query: GET_ALL_SPECIALTIES,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          if (
            data &&
            data.getAllSpecialties &&
            Specialities !== data.getAllSpecialties &&
            data.getAllSpecialties.length
          ) {
            setSpecialities(data.getAllSpecialties);
            setLocalData(data.getAllSpecialties);
            setshowSpinner(false);
            AsyncStorage.setItem('SpecialistData', JSON.stringify(data.getAllSpecialties));
            AsyncStorage.setItem('APICalledDate', todayDate);
          }
        } catch (e) {
          CommonBugFender('DoctorSearch_fetchSpecialities_try', e);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorSearch_fetchSpecialities', e);
        setshowSpinner(false);
        console.log('Error occured', e);
      });
  };

  const fetchPastSearches = () => {
    setshowPastSearchSpinner(true);
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
          setshowPastSearchSpinner(false);
          if (data && data.getPatientPastSearches) {
            console.log('fetchPastSearches', data.getPatientPastSearches);
            setPastSearches(data.getPatientPastSearches);
          }
          !!searchText && fetchSearchData();
        } catch (e) {
          CommonBugFender('DoctorSearch_fetchPastSearches_try', e);
        }
      })
      .catch((e) => {
        setshowPastSearchSpinner(false);
        CommonBugFender('DoctorSearch_fetchPastSearches', e);
        console.log('Error occured', e);
        !!searchText && fetchSearchData();
      });
    // .finally(() => {
    //   callSpecialityAPI();
    //   !!searchText && fetchSearchData();
    // });
  };

  const todayDate = moment(new Date()).format('YYYY-MM-DD');
  const callSpecialityAPI = async () => {
    let isToday = false;
    const checkDate: any = await AsyncStorage.getItem('APICalledDate');
    if (checkDate == null) {
      AsyncStorage.setItem('APICalledDate', todayDate);
    }
    isToday = checkDate ? checkDate === todayDate : false;
    const specialistData = await AsyncStorage.getItem('SpecialistData');
    if (isToday && specialistData && specialistData.length) {
      if (specialistData) {
        setSpecialities(JSON.parse(specialistData));
        setLocalData(JSON.parse(specialistData));
        // fetchDoctorData(JSON.parse(specialistData)[0].id);
      }
      setshowSpinner(false);
    } else {
      fetchSpecialities();
    }
  };

  const setLocalData = (data) => {
    const Physicians = data.filter(
      (item) => item.name.toLowerCase() === 'General Physician/ Internal Medicine'.toLowerCase()
    );
    Physicians.length > 0 &&
      fetchDoctorData(Physicians[0].id, 'General Physician/ Internal Medicine');

    const Ent = data.filter((item) => item.name.toLowerCase() === 'ENT'.toLowerCase());
    Ent.length > 0 && fetchDoctorData(Ent[0].id, 'ENT');

    const Dermatology = data.filter(
      (item) => item.name.toLowerCase() === 'Dermatology'.toLowerCase()
    );
    Dermatology.length > 0 && fetchDoctorData(Dermatology[0].id, 'Dermatology');

    const Urology = data.filter((item) => item.name.toLowerCase() === 'Urology'.toLowerCase());
    Urology.length > 0 && fetchDoctorData(Urology[0].id, 'Urology');
  };

  useEffect(() => {
    getNetStatus()
      .then((status) => {
        if (status) {
          fetchPastSearches();
          callSpecialityAPI();
        } else {
          setshowSpinner(false);
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorSearch_getNetStatus', e);
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
              if (isValidSearch(value)) {
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
    if (showPastSearchSpinner) {
      return (
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      );
    } else if (pastSearch && PastSearches.length > 0) {
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

  const postSpecialityWEGEvent = (speciality: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.SPECIALITY_CLICKED] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      Gender: g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Speciality Name': speciality,
    };
    postWebEngageEvent(WebEngageEventName.SPECIALITY_CLICKED, eventAttributes);
  };

  const postDoctorClickWEGEvent = (
    doctorName: string,
    source: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED]['Source']
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED] = {
      'Doctor Name': doctorName,
      Source: source,
    };
    postWebEngageEvent(WebEngageEventName.DOCTOR_CLICKED, eventAttributes);
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
                CommonLogEvent(AppRoutes.DoctorSearch, rowData.name);
                postSpecialityWEGEvent(rowData.name);
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
      return <NeedHelpAssistant navigation={props.navigation} containerStyle={styles.helpView} />;
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
                postDoctorClickWEGEvent(rowData.fullName!, 'Search');
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
                postDoctorClickWEGEvent(rowData.fullName!, 'Search');
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
              {!showSpinner && renderHelpView()}
            </ScrollView>
          )
        ) : null}
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
