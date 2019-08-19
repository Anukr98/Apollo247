import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  GET_ALL_SPECIALTIES,
  GET_PAST_SEARCHES,
  SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
  SAVE_SEARCH,
  GET_PATIENT_PAST_SEARCHES,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import {
  getPastSearches,
  getPastSearches_getPastSearches,
} from '@aph/mobile-patients/src/graphql/types/getPastSearches';
import { SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors } from '@aph/mobile-patients/src/graphql/types/SearchDoctorAndSpecialty';
import {
  SearchDoctorAndSpecialtyByName,
  SearchDoctorAndSpecialtyByNameVariables,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors,
} from '@aph/mobile-patients/src/graphql/types/SearchDoctorAndSpecialtyByName';
import { saveSearch } from '@aph/mobile-patients/src/graphql/types/saveSearch';

import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { theme } from '../theme/theme';
import { Button } from './ui/Button';
import { DoctorCard } from './ui/DoctorCard';
import { NeedHelpAssistant } from './ui/NeedHelpAssistant';
import { Mutation } from 'react-apollo';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { getPatientPastSearches } from '@aph/mobile-patients/src/graphql/types/getPatientPastSearches';

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

export interface DoctorSearchProps extends NavigationScreenProps {}

export const DoctorSearch: React.FC<DoctorSearchProps> = (props) => {
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
  const [allDoctors, setallDoctors] = useState<
    (SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors | null)[] | null
  >([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [possibleMatches, setpossibleMatches] = useState<
    SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches
  >();
  const [otherDoctors, setotherDoctors] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors | null)[] | null
  >();
  const { currentPatient } = useAllCurrentPatients();

  const newData = useQuery<SearchDoctorAndSpecialtyByName, SearchDoctorAndSpecialtyByNameVariables>(
    SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
    {
      variables: { searchText: searchText },
    }
  );
  if (newData.error) {
    console.log('newData.error', newData.error);
  } else {
    console.log('newData.data doctor', newData.data);
    if (
      newData.data &&
      newData.data.SearchDoctorAndSpecialtyByName &&
      doctorsList !== newData.data.SearchDoctorAndSpecialtyByName.doctors
    ) {
      setdoctorsList(newData.data.SearchDoctorAndSpecialtyByName.doctors);
      // searchText === '' && setallDoctors(newData.data.SearchDoctorAndSpecialtyByName.doctors)
    }
    if (
      newData.data &&
      newData.data.SearchDoctorAndSpecialtyByName &&
      newData.data.SearchDoctorAndSpecialtyByName.possibleMatches &&
      possibleMatches !== newData.data.SearchDoctorAndSpecialtyByName.possibleMatches
    ) {
      setpossibleMatches(newData.data.SearchDoctorAndSpecialtyByName.possibleMatches);
    }
    if (
      newData.data &&
      newData.data.SearchDoctorAndSpecialtyByName &&
      searchSpecialities !== newData.data.SearchDoctorAndSpecialtyByName.specialties
    ) {
      console.log(
        newData.data.SearchDoctorAndSpecialtyByName.specialties,
        'newData.data.SearchDoctorAndSpecialtyByName.specialties'
      );
      setsearchSpecialities(newData.data.SearchDoctorAndSpecialtyByName.specialties);
    }
    if (
      newData.data &&
      newData.data.SearchDoctorAndSpecialtyByName &&
      newData.data.SearchDoctorAndSpecialtyByName.otherDoctors &&
      otherDoctors !== newData.data.SearchDoctorAndSpecialtyByName.otherDoctors
    ) {
      setotherDoctors(newData.data.SearchDoctorAndSpecialtyByName.otherDoctors);
    }
  }

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

  const getData = useQuery<getAllSpecialties, getAllSpecialties_getAllSpecialties>(
    GET_ALL_SPECIALTIES,
    {}
  );
  console.log(getData.loading, 'getData.loading');
  if (getData.error) {
    console.log('getData.error', getData.error);
  } else {
    if (
      getData.data &&
      getData.data.getAllSpecialties &&
      Specialities !== getData.data.getAllSpecialties
    ) {
      console.log('getData.data', getData.data.getAllSpecialties);
      setSpecialities(getData.data.getAllSpecialties);
      setshowSpinner(false);
    }
  }

  const pastData = useQuery<getPatientPastSearches>(GET_PATIENT_PAST_SEARCHES, {
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
  });
  if (pastData.error) {
    console.log('pastData.error', pastData.error);
  } else {
    console.log(pastData, 'pastDatapastDatapastData');
    if (
      pastData.data &&
      pastData.data.getPatientPastSearches &&
      PastSearches !== pastData.data.getPatientPastSearches
    ) {
      console.log('pastData.data', pastData.data.getPatientPastSearches);
      setPastSearches(pastData.data.getPatientPastSearches);
    }
  }

  const renderSearch = () => {
    return (
      <View style={styles.searchContainer}>
        <Header
          title={'DOCTORS / SPECIALITIES'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <View style={styles.searchView}>
          <TextInputComponent
            conatinerstyles={{ paddingBottom: 0 }}
            inputStyle={[
              styles.searchValueStyle,
              searchText.length > 2 &&
              doctorsList &&
              doctorsList.length === 0 &&
              searchSpecialities &&
              searchSpecialities.length === 0
                ? {
                    borderBottomColor: '#e50000',
                  }
                : {},
            ]}
            textInputprops={
              searchText.length > 2 &&
              doctorsList &&
              doctorsList.length === 0 &&
              searchSpecialities &&
              searchSpecialities.length === 0
                ? {
                    selectionColor: '#e50000',
                  }
                : {}
            }
            autoCorrect={false}
            // value={searchText}
            placeholder="Search doctors or specialities"
            underlineColorAndroid="transparent"
            onChangeText={(value) => {
              setSearchText(value);
              if (value.length > 2) {
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
          {searchText.length > 2 &&
          doctorsList &&
          doctorsList.length === 0 &&
          searchSpecialities &&
          searchSpecialities.length === 0 ? (
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
    if (pastSearch) {
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
              props.navigation.navigate('DoctorSearchListing', { speciality: rowData.name });
            }
          }}
        />
      );
    } else return null;
  };

  const renderSpecialist = () => {
    // const SpecialitiesList = Specialities;

    const SpecialitiesList = searchText.length > 2 ? searchSpecialities : Specialities;
    console.log(SpecialitiesList, 'SpecialitiesList');
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
              marginTop: searchText.length > 0 && doctorsList && doctorsList.length === 0 ? 24 : 8,
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
              onPress={() => {
                onClickSearch(rowData);
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
              activeOpacity={1}
              key={rowID}
            >
              <View style={styles.listSpecialistView}>
                {rowData.image && (
                  <Image source={{ uri: rowData.image }} style={{ height: 44, width: 44 }} />
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

  const onClickSearch = (speciality: getAllSpecialties_getAllSpecialties) => {
    props.navigation.navigate('DoctorSearchListing', {
      specialityId: speciality.id,
      specialityName: speciality.name,
    });
  };

  const renderHelpView = () => {
    if (needHelp) {
      return <NeedHelpAssistant containerStyle={styles.helpView} />;
    }
  };

  const renderDoctorSearches = () => {
    console.log('doctorsList aaaa', doctorsList);

    if (searchText.length > 2 && doctorsList && doctorsList.length > 0) {
      console.log('doctorsList');
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
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        {doctorsList && renderSearch()}
        {showSpinner ? null : (
          <ScrollView style={{ flex: 1 }} bounces={false} keyboardDismissMode="on-drag">
            {renderPastSearch()}
            {renderDoctorSearches()}
            {renderSpecialist()}
            {renderHelpView()}
            {searchText.length > 2 &&
              doctorsList &&
              doctorsList.length === 0 &&
              searchSpecialities &&
              searchSpecialities.length === 0 &&
              possibleMatches &&
              renderPossibleMatches()}
            {doctorsList &&
              doctorsList.length === 1 &&
              otherDoctors &&
              renderOtherSUggestedDoctors()}
          </ScrollView>
        )}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
