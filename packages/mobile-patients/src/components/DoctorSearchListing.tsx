import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
// import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { SPECIALITY_DOCTOR_FILTERS } from '@aph/mobile-patients/src/graphql/profiles';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
// import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import {
  getSpecialtyDoctorsWithFilters,
  getSpecialtyDoctorsWithFiltersVariables,
  getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors,
} from '@aph/mobile-patients/src/graphql/types/getSpecialtyDoctorsWithFilters';
import { filterInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';

const styles = StyleSheet.create({
  topView: {
    height: 155,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    elevation: 2,
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

export interface DoctorSearchListingProps extends NavigationScreenProps {}
export type filterDataType = { label: string; options: string[]; selectedOptions?: string[] };

export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const filterData = strings.doctor_search_listing.filter_data.map((obj: filterDataType) => {
    obj.selectedOptions = [];
    return obj;
  });
  const tabs = [
    { title: 'All Consults' },
    { title: 'Online Consults' },
    { title: 'Clinic Visits' },
  ];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  // const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  // const [currentLocation, setcurrentLocation] = useState<string>('');
  const [doctorsList, setDoctorsList] = useState<
    (getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors | null)[]
  >([]);
  const [FilterData, setFilterData] = useState<object[]>(filterData);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);

  const FilterInput: filterInput = {
    specialty: props.navigation.state.params!.speciality,
  };

  FilterData.forEach((obj: filterDataType) => {
    if (obj.selectedOptions!.length > 0) {
      FilterInput[obj.label.toLowerCase().split(' ')[0]] = obj.selectedOptions;
    }
  });
  console.log(
    props.navigation.state.params,
    'speciality',
    FilterData,
    'FilterDataFilterDataFilterData',
    FilterInput
  );
  const { data, error } = useQuery<
    getSpecialtyDoctorsWithFilters,
    getSpecialtyDoctorsWithFiltersVariables
  >(SPECIALITY_DOCTOR_FILTERS, {
    variables: {
      filterInput: FilterInput,
    },
  });
  if (error) {
    console.log('error', error);
    //Alert.alert('Error', 'Unable to get the data');
  } else {
    console.log('data', data);
    if (
      data &&
      data.getSpecialtyDoctorsWithFilters &&
      data.getSpecialtyDoctorsWithFilters.doctors &&
      doctorsList !== data.getSpecialtyDoctorsWithFilters.doctors
    ) {
      setDoctorsList(data.getSpecialtyDoctorsWithFilters.doctors);
      setshowSpinner(false);
    }
  }

  // const fetchCurrentLocation = () => {
  //   setshowLocationpopup(true);

  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       console.log(position.coords.latitude);
  //       console.warn(position.coords.longitude);
  //       // this.setState({
  //       //   region: {
  //       //     latitude: position.coords.latitude,
  //       //     longitude: position.coords.longitude,
  //       //     latitudeDelta: 0.001 * 5,
  //       //     longitudeDelta: 0.001 * 5,
  //       //   },
  //       // });
  //       const searchstring = position.coords.latitude + ',' + position.coords.longitude;
  //       const key = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';
  //       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchstring}&sensor=true&key=${key}`;
  //       axios
  //         .get(url)
  //         .then((obj) => {
  //           console.log(obj);
  //         })
  //         .catch((error) => {
  //           console.log(error);
  //         });
  //     },
  //     (error) => {
  //       console.warn(error.code, error.message);
  //     },
  //     { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
  //   );
  // };

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
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          backgroundColor: theme.colors.CARD_BG,
          borderRadius: 0,
        }}
      >
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
            marginTop: 155,
            backgroundColor: theme.colors.CARD_BG,
          }}
          data={tabs}
          onChange={(selectedTab: string) => setselectedTab(selectedTab)}
          selectedTab={selectedTab}
        />
      </View>
    );
  };

  const renderSearchDoctorResultsRow = (
    rowData: getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors | null
  ) => {
    if (rowData) return <DoctorCard rowData={rowData} navigation={props.navigation} />;
    return null;
  };

  const renderDoctorSearches = (filter?: string) => {
    console.log(doctorsList, 'doctorsList');
    const doctors = filter
      ? doctorsList.filter(
          (obj: getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors | null) =>
            obj[filter] === true
        )
      : doctorsList;
    if (doctors.length === 0 && !showSpinner) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 64 }}>
          <Card
            cardContainer={{
              marginHorizontal: 64,
              shadowRadius: 0,
              shadowOffset: { width: 0, height: 0 },
              shadowColor: 'white',
            }}
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
              marginTop: 20,
              marginBottom: 8,
            }}
            bounces={false}
            data={doctors}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => renderSearchDoctorResultsRow(item)}
          />
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
          {selectedTab === tabs[0].title && renderDoctorSearches()}
          {selectedTab === tabs[1].title && renderDoctorSearches('availableForVirtualConsultation')}
          {selectedTab === tabs[2].title &&
            renderDoctorSearches('availableForPhysicalConsultation')}
        </ScrollView>
        {/* {showLocationpopup && (
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
        )} */}
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
