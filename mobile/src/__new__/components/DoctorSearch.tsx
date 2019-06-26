import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SectionList,
} from 'react-native';
import { theme } from '../theme/theme';
import { Header } from 'app/src/__new__/components/ui/Header';
import { TextInputComponent } from 'app/src/__new__/components/ui/TextInputComponent';
import { NavigationScreenProps } from 'react-navigation';
import { SectionHeaderComponent } from 'app/src/__new__/components/ui/SectionHeader';
import { DoctorCard } from './ui/DoctorCard';
import {
  GeneralPhysician,
  Paedatrician,
  Urologist,
  Neurologist,
  Mascot,
} from 'app/src/__new__/components/ui/Icons';
import firebase from 'react-native-firebase';

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
    height: 58,
    paddingHorizontal: 20,
  },
  listView: {
    marginBottom: 8,
    backgroundColor: 'white',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 10,
    marginLeft: 20,
    marginTop: 8,
  },
  rowTextStyles: {
    color: theme.colors.SEARCH_TITLE_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 16,
    ...theme.fonts.IBMPlexSansSemiBold(14),
  },
  listSpecialistView: {
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowSpecialistStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    paddingHorizontal: 9,
    paddingVertical: 12,
    color: theme.colors.SEARCH_TITLE_COLOR,
    textAlign: 'center',
  },
  TextStyle: {
    textAlign: 'center',
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.5,
    padding: 20,
    paddingTop: 28,
  },
  pastTextStyle: {
    textAlign: 'left',
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  separatorStyles: {
    backgroundColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    width: '100%',
    height: 2,
  },
  searchValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
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
  },
  titleBtnStyles: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: 'white',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 10,
    marginVertical: 10,
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

type Specialities = {
  name: string;
  image: any;
};

const Specialities: Specialities[] = [
  {
    image: <GeneralPhysician />,
    name: 'General Physician',
  },
  {
    image: <Paedatrician />,
    name: 'Paediatrician',
  },
  {
    image: <Urologist />,
    name: 'Urologist',
  },
  {
    image: <Neurologist />,
    name: 'Neurologist',
  },
  {
    image: <Urologist />,
    name: 'Urologist',
  },
  {
    image: <Neurologist />,
    name: 'Neurologist',
  },
];

type doctorsList = {
  title: string;
  image: any;
  doctorName: string;
  starDoctor: boolean;
  specialization: string;
  experience: string;
  education: string;
  location: string;
  time: string;
  available: boolean;
  data: [];
};

const doctorsList: doctorsList[] = [
  {
    title: 'Matching Doctors',
    data: [
      {
        image: <Neurologist />,
        // image: { ...AppImages.simran },
        doctorName: 'Dr. Simran Rai',
        starDoctor: true,
        specialization: 'GENERAL PHYSICIAN',
        experience: '7 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT NOW',
        available: true,
      },
    ],
  },
  {
    title: 'Other Suggested Doctors',
    data: [
      {
        image: <Neurologist />,
        // image: { ...AppImages.narayanRao },
        doctorName: 'Dr. Jayanth Reddy',
        starDoctor: true,
        specialization: 'GENERAL PHYSICIAN',
        experience: '5 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT IN 27 MINS',
        available: false,
      },
      {
        image: <Neurologist />,
        // image: { ...AppImages.rakhiSharma },
        doctorName: 'Dr. Rakhi Sharma',
        starDoctor: false,
        specialization: 'GENERAL PHYSICIAN',
        experience: '4 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT IN 36 MINS',
        available: false,
      },
    ],
  },
];

export interface doctorSearchProps extends NavigationScreenProps {}

export const DoctorSearch: React.FC<doctorSearchProps> = (props) => {
  const InputText = React.useRef<any>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [doctorName, setDoctorName] = useState<boolean>(false);
  const [pastSearch, setPastSearch] = useState<boolean>(true);
  const [needHelp, setNeedHelp] = useState<boolean>(true);
  const [speialistList, setSpeialistList] = useState<boolean>(true);

  useEffect(() => {
    firebase.analytics().setCurrentScreen('DoctorSearch');
  });

  const renderSearch = (styles: any) => {
    return (
      <View style={styles.searchContainer}>
        <Header
          title={'DOCTORS / SPECIALITIES'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          leftText={{ onPress: () => props.navigation.goBack(), isBack: false, title: '' }}
          onPress={() => props.navigation.goBack()}
        />
        <View style={styles.searchView}>
          <TextInputComponent
            ref={InputText}
            inputStyle={styles.searchValueStyle}
            autoCorrect={false}
            value={searchText}
            placeholder="Search doctors or specialities"
            underlineColorAndroid="transparent"
            onChangeText={(value: any) => {
              setSearchText(value);
              if (value === 'Simran') {
                setDoctorName(true);
                setSpeialistList(false);
              } else {
                setSpeialistList(true);
              }
            }}
            onFocus={() => {
              setPastSearch(false);
              setNeedHelp(false);
              setSpeialistList(false);
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
          <SectionHeaderComponent sectionTitle={'Past Searches'} style={{ marginBottom: 8 }} />
          <FlatList
            contentContainerStyle={{
              flexWrap: 'wrap',
            }}
            bounces={false}
            data={pastSearches}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => renderRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
          />
        </View>
      );
    }
  };

  const renderRow = (rowData: pastSearches, rowID: number) => {
    return (
      <View style={styles.listView}>
        <Text style={styles.rowTextStyles}>{rowData.search.toUpperCase()}</Text>
      </View>
    );
  };

  const renderSpecialist = (styles: any) => {
    if (speialistList) {
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={'Specialities'}
            style={{ marginBottom: 8, marginTop: 16 }}
          />
          <FlatList
            contentContainerStyle={{
              flexWrap: 'wrap',
              marginHorizontal: 12,
            }}
            bounces={false}
            data={Specialities}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => renderSpecialistRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
          />
        </View>
      );
    }
  };

  const renderSpecialistRow = (rowData: Specialities, rowID: number) => {
    return (
      <TouchableOpacity
        onPress={() => onClickSearch()}
        style={{ flex: 1, margin: 8 }}
        activeOpacity={1}
      >
        <View style={styles.listSpecialistView}>
          {rowData.image}
          {/* <Image {...rowData.image} style={{ marginTop: 10 }} /> */}
          <Text style={styles.rowSpecialistStyles}>{rowData.name.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const onClickSearch = () => {
    props.navigation.navigate('DoctorSearchListing');
  };

  const renderHelpView = (styles: any) => {
    if (needHelp) {
      return (
        <View style={styles.helpView}>
          <Mascot />
          {/* <Image {...AppImages.ic_mascot} style={{ height: 80, width: 80 }} /> */}
          {/* <Button
            title="Need Help?"
            style={styles.needhelpbuttonStyles}
            titleTextStyle={styles.titleBtnStyles}
          /> */}
        </View>
      );
    }
  };

  const renderDoctorSearches = (styles: any) => {
    if (doctorName) {
      return (
        <View>
          <SectionList
            contentContainerStyle={{
              flexWrap: 'wrap',
              marginTop: 12,
              marginBottom: 8,
            }}
            bounces={false}
            sections={doctorsList}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => renderSearchDoctorResultsRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
            renderSectionHeader={({ section }) => renderHeader(section)}
          />
        </View>
      );
    }
  };

  const renderHeader = (rowHeader: any) => {
    let sectionTitle = rowHeader.title;
    if (sectionTitle === 'Matching Doctors') {
      sectionTitle = sectionTitle + ' — ' + rowHeader.data.length;
    }
    return <SectionHeaderComponent sectionTitle={sectionTitle} />;
  };

  const renderSearchDoctorResultsRow = (rowData: doctorsList, rowID: number) => {
    return <DoctorCard rowData={rowData} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
      {renderSearch(styles)}
      <ScrollView style={{ flex: 1 }}>
        {renderPastSearch(styles)}
        {renderSpecialist(styles)}
        {renderHelpView(styles)}
        {renderDoctorSearches(styles)}
      </ScrollView>
    </SafeAreaView>
  );
};
