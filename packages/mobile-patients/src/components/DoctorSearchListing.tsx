import { DoctorCard, doctorCardProps } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  DoctorImage,
  DropdownGreen,
  Filter,
  LocationOff,
  Reload,
  SortIncreasing,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { string } from '@aph/mobile-patients/src/strings/string';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SectionListData,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  topView: {
    height: 155,
    backgroundColor: 'white',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    borderTopWidth: 0,
  },
  headingText: {
    paddingBottom: 8,
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  descriptionText: {
    color: theme.colors.CARD_DESCRIPTION,
    paddingBottom: 20,
    ...theme.fonts.IBMPlexSansMedium(17),
  },
  filterView: {
    height: 44,
    flexDirection: 'row',
    backgroundColor: '#f7f8f5',
    paddingHorizontal: 20,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  filterItemView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  itemLabelText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 4,
  },
});

type doctorsList = {
  title: string;
  data: {
    image: any;
    doctorName: string;
    starDoctor: boolean;
    specialization: string;
    experience: string;
    education: string;
    location: string;
    time: string;
    available: boolean;
  }[];
};

const style = { width: 80, height: 80 };
const DoctorsList: doctorsList[] = [
  {
    title: 'Our Star Doctors',
    data: [
      {
        image: <DoctorImage style={style} />,
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
    title: 'From Your Past Consults',
    data: [
      {
        image: <DoctorImage style={style} />,
        doctorName: 'Dr. Rakhi Sharma',
        starDoctor: false,
        specialization: 'GENERAL PHYSICIAN',
        experience: '4 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT NOW',
        available: true,
      },
    ],
  },
  {
    title: 'More Apollo Doctors In Hyderabad',
    data: [
      {
        image: <DoctorImage style={style} />,
        doctorName: 'Dr. Rahul Nerlekar',
        starDoctor: false,
        specialization: 'GENERAL PHYSICIAN',
        experience: '4 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT IN 45 MINS',
        available: false,
      },
    ],
  },
  {
    title: 'Apollo Doctors In Other Cities',
    data: [
      {
        image: <DoctorImage style={style} />,
        doctorName: 'Dr. Ranjan Gopal',
        starDoctor: false,
        specialization: 'GENERAL PHYSICIAN',
        experience: '4 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT IN 45 MINS',
        available: false,
      },
    ],
  },
];

export interface DoctorSearchListingProps extends NavigationScreenProps {}

export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const RightHeader = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <LocationOff />
        <TouchableOpacity
          style={{ marginLeft: 20 }}
          onPress={() => props.navigation.navigate('FilterScene')}
        >
          <Filter />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTopView = () => {
    return (
      <View>
        <View style={styles.topView}>
          <Header
            leftIcon="backArrow"
            container={{ borderBottomWidth: 0 }}
            rightComponent={() => <RightHeader />}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={styles.headingText}>{string.LocalStrings.okay}</Text>
            <Text style={styles.descriptionText}>
              {string.LocalStrings.best_general_physicians_text}
            </Text>
          </View>
        </View>
        <View style={styles.filterView}>
          <View style={styles.filterItemView}>
            <Text style={styles.itemLabelText}>{string.LocalStrings.all_consults}</Text>
            <DropdownGreen />
          </View>
          <View style={styles.filterItemView}>
            <Text style={styles.itemLabelText}>{string.LocalStrings.distance}</Text>
            <SortIncreasing />
          </View>
          <View style={styles.filterItemView}>
            <Reload />
          </View>
        </View>
      </View>
    );
  };

  const renderSearchDoctorResultsRow = (rowData: doctorCardProps['rowData']) => {
    return <DoctorCard rowData={rowData} />;
  };

  const renderHeader = (rowHeader: SectionListData<{ title: string }>) => {
    let sectionTitle = rowHeader.title;
    if (sectionTitle === 'Matching Doctors') {
      sectionTitle = sectionTitle + ' — ' + rowHeader.data.length;
    }
    return <SectionHeaderComponent sectionTitle={sectionTitle} />;
  };

  const renderDoctorSearches = () => {
    return (
      <View>
        <SectionList
          contentContainerStyle={{
            flexWrap: 'wrap',
            marginTop: 12,
            marginBottom: 8,
          }}
          bounces={false}
          sections={DoctorsList}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => renderSearchDoctorResultsRow(item)}
          keyExtractor={(_, index) => index.toString()}
          renderSectionHeader={({ section }) => renderHeader(section)}
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
      <ScrollView style={{ flex: 1 }}>
        {renderTopView()}
        {renderDoctorSearches()}
      </ScrollView>
    </SafeAreaView>
  );
};
