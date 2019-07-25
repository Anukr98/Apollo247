import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DoctorCard, DoctorCardProps } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Filter, LocationOff } from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { SPECIALITY_DOCTOR_FILTERS } from '@aph/mobile-patients/src/graphql/profiles';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import strings from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  topView: {
    height: 155,
    backgroundColor: 'white',
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    shadowOffset: { width: 0, height: 0 },
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

export interface DoctorSearchListingProps extends NavigationScreenProps {}

export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const filterData = strings.doctor_search_listing.filter_data.map((obj: object) => {
    obj.selectedOptions = [];
    return obj;
  });
  const tabs = ['All Consults', 'Online Consults', 'Clinic Visits'];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0]);
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const [doctorsList, setDoctorsList] = useState<[]>([]);
  const [FilterData, setFilterData] = useState<[]>(filterData);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);

  const filterInput: any = {
    specialty: props.navigation.state.params!.speciality,
    // city: [],
    // experience: [],
    // availability: [],
    // gender: [],
    // language: [],
  };
  FilterData.map((obj: { label: string; options: []; selectedOptions: [] }) => {
    if (obj.selectedOptions.length > 0) {
      filterInput[obj.label.toLowerCase().split(' ')[0]] = obj.selectedOptions;
    }
  });

  // {
  //   specialty: 'general physician',
  //   city: [],
  //   experience: [],
  //   availability: [],
  //   gender: [],
  //   language: [],
  // },
  console.log(
    props.navigation.state.params,
    'speciality',
    FilterData,
    'FilterDataFilterDataFilterData',
    filterInput
  );
  const { data, error } = useQuery(SPECIALITY_DOCTOR_FILTERS, {
    variables: {
      filterInput,
    },
  });
  if (error) {
    console.log('error', error);
    //Alert.alert('Error', 'Unable to get the data');
  } else {
    console.log('data', data);
    if (
      data.getSpecialtyDoctorsWithFilters &&
      data.getSpecialtyDoctorsWithFilters.doctors &&
      doctorsList !== data.getSpecialtyDoctorsWithFilters.doctors
    ) {
      setDoctorsList(data.getSpecialtyDoctorsWithFilters.doctors);
      setshowSpinner(false);
    }
  }

  const fetchCurrentLocation = () => {
    setshowLocationpopup(true);

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
        {/* <TouchableOpacity onPress={() => fetchCurrentLocation()}> */}
        {/* <LocationOff /> */}
        {/* </TouchableOpacity> */}
        <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => setDisplayFilter(true)}>
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
            <Text style={styles.descriptionText}>
              {string.common.best_doctor_text}
              {props.navigation.state.params!.speciality}
            </Text>
          </View>
        </View>
        <TabsComponent
          style={{
            ...theme.viewStyles.cardViewStyle,
            backgroundColor: theme.colors.CARD_BG,
            borderRadius: 0,
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

  const renderDoctorSearches = (filter: string) => {
    console.log(doctorsList, 'doctorsList');
    const doctors = filter ? doctorsList.filter((obj) => obj[filter] === true) : doctorsList;
    if (doctors.length === 0 && !showSpinner) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 64 }}>
          <Card
            cardContainer={{ marginHorizontal: 64 }}
            heading={'Uh oh! :('}
            description={
              filter === 'availableForPhysicalConsultation'
                ? `There is no ${
                    props.navigation.state.params!.speciality
                  } available for Physical Consult. Please you try Online Consultation.`
                : `There is no ${
                    props.navigation.state.params!.speciality
                  } available to match your filters. Please try again with different filters.`
            }
            descriptionTextStyle={{ fontSize: 14 }}
            headingTextStyle={{ fontSize: 14 }}
          />
        </View>
      );
    }
    return (
      <View>
        {doctors.length > 0 && (
          <FlatList
            contentContainerStyle={{
              // flexWrap: 'wrap',
              marginTop: 20,
              marginBottom: 8,
            }}
            bounces={false}
            data={doctors}
            onEndReachedThreshold={0.5}
            renderItem={({ item }: { item: any }) => renderSearchDoctorResultsRow(item)}
            // keyExtractor={(_, index) => index.toString()}
            // numColumns={2}
          />

          // <SectionList
          //   contentContainerStyle={{
          //     flexWrap: 'wrap',
          //     marginTop: 20,
          //     marginBottom: 8,
          //   }}
          //   bounces={false}
          //   sections={doctorsList}
          //   onEndReachedThreshold={0.5}
          //   renderItem={({ item }) => renderSearchDoctorResultsRow(item)}
          //   keyExtractor={(_, index) => index.toString()}
          // />
        )}
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        {renderTopView()}

        <ScrollView style={{ flex: 1 }} bounces={false}>
          {selectedTab === tabs[0] && renderDoctorSearches()}
          {selectedTab === tabs[1] && renderDoctorSearches('availableForVirtualConsultation')}
          {selectedTab === tabs[2] && renderDoctorSearches('availableForPhysicalConsultation')}
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
      {displayFilter && (
        <FilterScene
          onClickClose={(data: []) => {
            setDisplayFilter(false);
            setFilterData(data);
          }}
          data={FilterData}
        />
      )}
      {showSpinner && <Spinner />}
    </View>
  );
};
