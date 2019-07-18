import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DoctorCard, DoctorCardProps } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DoctorImage, Filter, LocationOff } from '@aph/mobile-patients/src/components/ui/Icons';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import axios from 'axios';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  SectionList,
  SectionListData,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
});

type doctorsList = {
  title: string;
  data: {
    availableForPhysicalConsultation: boolean;
    availableForVirtualConsultation: boolean;
    awards: string;
    city: string;
    education: string;
    experience: string;
    firstName: string;
    id: string;
    inviteStatus: string;
    isProfileComplete: boolean;
    isStarDoctor: boolean;
    languages: string;
    lastName: string;
    mobileNumber: string;
    onlineConsultationFees: string;
    package: string;
    photoUrl: string;
    physicalConsultationFees: string;
    registrationNumber: string;
    services: string;
    speciality: string;
    specialization: string;
    typeOfConsult: string;
    // image: any;
    // doctorName: string;
    // starDoctor: boolean;
    // specialization: string;
    // experience: string;
    // education: string;
    // location: string;
    // time: string;
    // available: boolean;
  }[];
};

const style = { width: 80, height: 80 };
const DoctorsList: doctorsList[] = [
  {
    title: 'Our Star Doctors',
    data: [
      {
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        awards: '',
        city: 'hyderabad',
        education: 'MBBS',
        experience: '7',
        firstName: 'Simran',
        id: 'string',
        inviteStatus: '',
        isProfileComplete: false,
        isStarDoctor: true,
        languages: '',
        lastName: 'rao',
        mobileNumber: '',
        onlineConsultationFees: '800',
        package: '',
        photoUrl: '',
        physicalConsultationFees: '300',
        registrationNumber: '34567',
        services: '',
        speciality: '',
        specialization: 'GENERAL PHYSICIAN',
        typeOfConsult: '',
      },
    ],
  },
  // {
  //   title: 'From Your Past Consults',
  //   data: [
  //     {
  //       image: <DoctorImage style={style} />,
  //       doctorName: 'Dr. Rakhi Sharma',
  //       starDoctor: false,
  //       specialization: 'GENERAL PHYSICIAN',
  //       experience: '4 YRS',
  //       education: 'MBBS, Internal Medicine',
  //       location: 'Apollo Hospitals, Jubilee Hills',
  //       time: 'CONSULT NOW',
  //       available: true,
  //     },
  //   ],
  // },
  // {
  //   title: 'More Apollo Doctors In Hyderabad',
  //   data: [
  //     {
  //       image: <DoctorImage style={style} />,
  //       doctorName: 'Dr. Rahul Nerlekar',
  //       starDoctor: false,
  //       specialization: 'GENERAL PHYSICIAN',
  //       experience: '4 YRS',
  //       education: 'MBBS, Internal Medicine',
  //       location: 'Apollo Hospitals, Jubilee Hills',
  //       time: 'BOOK APPOINTMENT',
  //       available: false,
  //     },
  //   ],
  // },
  // {
  //   title: 'Apollo Doctors In Other Cities',
  //   data: [
  //     {
  //       image: <DoctorImage style={style} />,
  //       doctorName: 'Dr. Ranjan Gopal',
  //       starDoctor: false,
  //       specialization: 'GENERAL PHYSICIAN',
  //       experience: '4 YRS',
  //       education: 'MBBS, Internal Medicine',
  //       location: 'Apollo Hospitals, Jubilee Hills',
  //       time: 'BOOK APPOINTMENT',
  //       available: true,
  //     },
  //   ],
  // },
  // {
  //   title: 'Apollo Doctors In Other Cities',
  //   data: [
  //     {
  //       image: <DoctorImage style={style} />,
  //       doctorName: 'Dr. Ranjan Gopal',
  //       starDoctor: false,
  //       specialization: 'GENERAL PHYSICIAN',
  //       experience: '4 YRS',
  //       education: 'MBBS, Internal Medicine',
  //       location: 'Apollo Hospitals, Jubilee Hills',
  //       time: 'CONSULT NOW',
  //       available: true,
  //     },
  //   ],
  // },
];

export interface DoctorSearchListingProps extends NavigationScreenProps {}

export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const tabs = ['All Consults', 'Online Consults', 'Clinic Visits'];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0]);
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');

  const fetchCurrentLocation = () => {
    // setshowLocationpopup(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position.coords.latitude);
        console.warn(position.coords.longitude);
        // this.setState({
        //   region: {
        //     latitude: position.coords.latitude,
        //     longitude: position.coords.longitude,
        //     latitudeDelta: 0.001 * 5,
        //     longitudeDelta: 0.001 * 5,
        //   },
        // });
        const searchstring = position.coords.latitude + ',' + position.coords.longitude;
        const key = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchstring}&sensor=true&key=${key}`;
        axios
          .get(url)
          .then((obj) => {
            console.log(obj);
          })
          .catch((error) => {
            console.log(error);
          });
      },
      (error) => {
        console.warn(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const RightHeader = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => fetchCurrentLocation()}>
          <LocationOff />
        </TouchableOpacity>
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
            <Text style={styles.headingText}>{string.common.okay}</Text>
            <Text style={styles.descriptionText}>{string.common.best_general_physicians_text}</Text>
          </View>
        </View>
        <TabsComponent
          style={{
            backgroundColor: theme.colors.CARD_BG,
          }}
          data={tabs}
          onChange={(selectedTab: string) => setselectedTab(selectedTab)}
          selectedTab={selectedTab}
        />
      </View>
    );
  };

  const renderSearchDoctorResultsRow = (rowData: DoctorCardProps['rowData']) => {
    return <DoctorCard rowData={rowData} navigation={props.navigation} />;
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
            marginTop: 20,
            marginBottom: 8,
          }}
          bounces={false}
          sections={DoctorsList}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => renderSearchDoctorResultsRow(item)}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
    );
  };
  return (
    <SafeAreaView
      style={{
        ...theme.viewStyles.container,
      }}
    >
      {renderTopView()}

      <ScrollView style={{ flex: 1 }} bounces={false}>
        {selectedTab === tabs[0] && (
          <View>
            <Card
              cardContainer={{ marginTop: 64, marginHorizontal: 64 }}
              heading={'Uh oh! :('}
              description={
                'There is no General Physician available for Physical Consult. Please you try Online Consultation.'
              }
              descriptionTextStyle={{ fontSize: 14 }}
              headingTextStyle={{ fontSize: 14 }}
            />
          </View>
        )}
        {selectedTab === tabs[1] && renderDoctorSearches()}
      </ScrollView>
      {showLocationpopup && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 40,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              width: 230,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: theme.colors.CARD_HEADER,
                ...theme.fonts.IBMPlexSansMedium(14),
              }}
            >
              Current Location
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 7 }}>
                <TextInputComponent
                  conatinerstyles={{ flex: 1 }}
                  value={currentLocation}
                  onChangeText={(value) => {
                    setcurrentLocation(value);
                  }}
                />
              </View>
              <View
                style={{
                  marginLeft: 20,
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <LocationOff />
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
