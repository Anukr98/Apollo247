import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Mascot } from '@aph/mobile-patients/src/components/ui/Icons';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  GET_PAST_SEARCHES,
  GET_SPECIALTIES,
  SEARCH_DOCTOR_AND_SPECIALITY,
} from '@aph/mobile-patients/src/graphql/profiles';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '../theme/theme';
import { Button } from './ui/Button';
import { DoctorCard, DoctorCardProps } from './ui/DoctorCard';

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
    width: '100%',
    height: 212,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needhelpbuttonStyles: {
    backgroundColor: 'white',
    height: 50,
    width: 120,
    marginTop: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 15,
  },
  titleBtnStyles: {
    color: theme.colors.SKY_BLUE,
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
  const [Specialities, setSpecialities] = useState<object[]>([]);
  const [seatchSpecialities, setseatchSpecialities] = useState<object[]>([]);
  const [PastSearches, setPastSearches] = useState<object[]>([]);

  const [doctorsList, setdoctorsList] = useState<object[]>([]);

  const { data, error } = useQuery(SEARCH_DOCTOR_AND_SPECIALITY, {
    variables: { searchText: searchText },
  });
  if (error) {
    console.log('error', error);
  } else {
    console.log('data doctor', data);
    if (data.SearchDoctorAndSpecialty && doctorsList !== data.SearchDoctorAndSpecialty.doctors) {
      setdoctorsList(data.SearchDoctorAndSpecialty.doctors);
    }
    if (
      data.SearchDoctorAndSpecialty &&
      seatchSpecialities !== data.SearchDoctorAndSpecialty.specialties
    ) {
      console.log(
        data.SearchDoctorAndSpecialty.specialties,
        'data.SearchDoctorAndSpecialty.specialties'
      );
      setseatchSpecialities(data.SearchDoctorAndSpecialty.specialties);
    }
  }

  const getData = useQuery(GET_SPECIALTIES, {});
  console.log(getData.loading, 'getData.loading');
  if (getData.error) {
    console.log('getData.error', getData.error);
  } else {
    if (
      getData.data &&
      getData.data.getSpecialties &&
      Specialities !== getData.data.getSpecialties
    ) {
      console.log('getData.data', getData.data.getSpecialties);

      setSpecialities(getData.data.getSpecialties);
    }
  }

  const pastData = useQuery(GET_PAST_SEARCHES, {});
  if (pastData.error) {
    console.log('pastData.error', pastData.error);
  } else {
    console.log(pastData, 'pastDatapastDatapastData');
    if (
      pastData.data &&
      pastData.data.getPastSearches &&
      PastSearches !== pastData.data.getPastSearches
    ) {
      console.log('pastData.data', pastData.data.getPastSearches);
      setPastSearches(pastData.data.getPastSearches);
    }
  }

  const renderSearch = (styles: any) => {
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
            conatinerstyles={{ paddingBottom: 19 }}
            inputStyle={styles.searchValueStyle}
            autoCorrect={false}
            value={searchText}
            placeholder="Search doctors or specialities"
            underlineColorAndroid="transparent"
            onChangeText={(value) => {
              setSearchText(value);
              if (value === '') {
                // setDoctorName(true);
                setdisplaySpeialist(false);
              } else {
                setdisplaySpeialist(true);
              }
            }}
            onFocus={() => {
              setPastSearch(false);
              setNeedHelp(false);
              setdisplaySpeialist(false);
            }}
            onBlur={() => {
              if (searchText === '') {
                setPastSearch(true);
                setNeedHelp(true);
                setdisplaySpeialist(true);
              }
            }}
          />
        </View>
      </View>
    );
  };

  const renderPastSearch = (styles: any) => {
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

  const renderRow = (rowData: pastSearches, rowID: number) => {
    return (
      <Button
        title={rowData.name.toUpperCase()}
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
  };

  const renderSpecialist = (styles: any) => {
    const SpecialitiesList = searchText.length > 0 ? seatchSpecialities : Specialities;
    console.log(SpecialitiesList, 'SpecialitiesList');
    if (SpecialitiesList.length > 0 && displaySpeialist) {
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={
              searchText.length > 0
                ? `Matching Specialities — ${seatchSpecialities.length}`
                : 'Specialities'
            }
            style={{
              marginBottom: 0,
              marginTop: searchText.length > 0 && doctorsList.length === 0 ? 24 : 8,
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
            renderItem={({ item, index }) => renderSpecialistRow(item, index, SpecialitiesList)}
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
          />
        </View>
      );
    }
  };

  const renderSpecialistRow = (rowData: any, rowID: number, Specialities: any) => {
    return (
      <TouchableOpacity
        onPress={() => onClickSearch(rowData.name)}
        style={{
          // flex: 1,
          width: '50%',
          paddingHorizontal: 8,
          marginVertical: 8,
          marginTop: rowID === 0 || rowID === 1 ? 16 : 8,
          marginBottom:
            Specialities.length === rowID + 1 || (Specialities.length - 1) % 2 === 1 ? 16 : 8,
          height: 100,
        }}
        activeOpacity={1}
        key={rowData.id}
      >
        <View style={styles.listSpecialistView}>
          <Image source={{ uri: rowData.image }} style={{ height: 44, width: 44 }} />
          {/* {SpecialityImages[rowID % 4]} */}
          <Text style={styles.rowSpecialistStyles}>{rowData.name.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const onClickSearch = (speciality: string) => {
    props.navigation.navigate('DoctorSearchListing', { speciality });
  };

  const renderHelpView = (styles: any) => {
    if (needHelp) {
      return (
        <View style={styles.helpView}>
          <Mascot style={{ height: 80, width: 80 }} />
          <Button
            title="Need Help?"
            style={styles.needhelpbuttonStyles}
            titleTextStyle={styles.titleBtnStyles}
          />
        </View>
      );
    }
  };

  const renderDoctorSearches = (styles: any) => {
    if (searchText.length > 0 && doctorsList.length > 0) {
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={'Matching Doctors — ' + doctorsList.length}
            style={{ marginBottom: 0 }}
          />

          <FlatList
            contentContainerStyle={{
              marginTop: 20,
              marginBottom: 8,
            }}
            bounces={false}
            data={doctorsList}
            onEndReachedThreshold={0.5}
            renderItem={({ item }: { item: any }) => renderSearchDoctorResultsRow(item)}
          />
          {/* <SectionList
            contentContainerStyle={{
              // flexWrap: 'wrap',
              marginTop: 12,
              marginBottom: 8,
            }}
            bounces={false}
            sections={doctorsList}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => renderSearchDoctorResultsRow(item)}
            keyExtractor={(_, index) => index.toString()}
            renderSectionHeader={({ section }) => renderHeader(section)}
          /> */}
        </View>
      );
    }
  };

  const renderSearchDoctorResultsRow = (rowData: DoctorCardProps['rowData']) => {
    return <DoctorCard rowData={rowData} navigation={props.navigation} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
      {renderSearch(styles)}
      <ScrollView style={{ flex: 1 }} bounces={false}>
        {renderPastSearch(styles)}
        {renderDoctorSearches(styles)}
        {renderSpecialist(styles)}
        {renderHelpView(styles)}
      </ScrollView>
    </SafeAreaView>
  );
};
