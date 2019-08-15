import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Filter, LocationOff, LocationOn } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { DOCTOR_SPECIALITY_BY_FILTERS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDoctorsBySpecialtyAndFilters,
  getDoctorsBySpecialtyAndFiltersVariables,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_consultHours,
} from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import { ConsultMode, Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { default as string } from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import {
  Animated,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  topView: {
    height: 56,
    // ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    zIndex: 3,
    elevation: 3,
    backgroundColor: theme.colors.WHITE,
    borderBottomWidth: 0,
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
export type filterDataType = {
  label: string;
  options: string[];
  selectedOptions?: string[]; // | { minimum: number; maximum: number }[];
};

export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const specialityName = props.navigation.state.params
    ? props.navigation.state.params!.specialityName
    : '';
  const filterData: filterDataType = [
    {
      label: 'City',
      options: ['Hyderabad', 'Chennai'],
      selectedOptions: [],
    },
    {
      label: 'Experience In Years',
      options: ['0 - 5', '6 - 10', '11 - 15', '15+'],
      selectedOptions: [],
    },
    {
      label: 'Availability',
      options: ['Now', 'Today', 'Tomorrow', 'Next 3 Days'],
      selectedOptions: [],
    },
    {
      label: 'Fees In Rupees',
      options: ['100 - 500', '501 - 1000', '1000+'],
      selectedOptions: [],
    },
    {
      label: 'Gender',
      options: [Gender.MALE, Gender.FEMALE],
      selectedOptions: [],
    },
    {
      label: 'Language',
      options: ['Hindi', 'English', 'Telugu'],
      selectedOptions: [],
    },
  ];
  // strings.doctor_search_listing.filter_data.map((obj: filterDataType) => {
  //   obj.selectedOptions = [];
  //   return obj;
  // });
  const tabs = [
    { title: 'All Consults' },
    { title: 'Online Consults' },
    { title: 'Clinic Visits' },
  ];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const [doctorsList, setDoctorsList] = useState<
    (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[]
  >([]);
  const [FilterData, setFilterData] = useState<filterDataType[]>(filterData);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [scrollY] = useState(new Animated.Value(0));

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
        // alert('You can use the location');
      } else {
        console.log('location permission denied');
        // alert('Location permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log('didmout');
    Platform.OS === 'android' && requestLocationPermission();
  }, []);

  console.log('FilterData1111111', FilterData);
  let experienceArray = [];
  if (FilterData[1].selectedOptions && FilterData[1].selectedOptions.length > 0)
    FilterData[1].selectedOptions.forEach((element) => {
      const splitArray = element.split(' - ');
      const object =
        splitArray.length > 0
          ? {
              minimum: splitArray.length > 0 ? Number(splitArray[0].replace('+', '')) : '',
              maximum: splitArray.length > 1 ? Number(element.split(' - ')[1]) : -1,
            }
          : null;
      if (object) {
        experienceArray.push(object);
      }
    });

  let feesArray = [];
  if (FilterData[3].selectedOptions && FilterData[3].selectedOptions.length > 0)
    FilterData[3].selectedOptions.forEach((element) => {
      const splitArray = element.split(' - ');
      console.log(splitArray, 'splitArray');
      const object =
        splitArray.length > 0
          ? {
              minimum: splitArray.length > 0 ? Number(splitArray[0].replace('+', '')) : '',
              maximum: splitArray.length > 1 ? Number(element.split(' - ')[1]) : -1,
            }
          : null;
      if (object) {
        feesArray.push(object);
      }
    });

  let availabilityArray = [];
  const today = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  console.log('moment', moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'));
  if (FilterData[2].selectedOptions && FilterData[2].selectedOptions.length > 0)
    FilterData[2].selectedOptions.forEach((element) => {
      if (element === 'Now') {
        availabilityArray.push(today);
      }
      if (element === 'Today') {
        availabilityArray.push(today);
      }
      if (element === 'Tomorrow') {
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        );
      }
      if (element === 'Next 3 Days') {
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        );
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        );
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        );
      }
      new Date().getTime() + 24 * 60 * 60 * 1000;
    });
  console.log(
    experienceArray,
    'experienceArray',
    availabilityArray,
    'availabilityArray',
    feesArray,
    'feesArray'
  );
  const FilterInput = {
    specialty: props.navigation.state.params ? props.navigation.state.params!.specialityId : '',
    city: FilterData[0].selectedOptions,
    experience: experienceArray,
    availability: availabilityArray,
    fees: feesArray,
    gender: FilterData[4].selectedOptions,
    language: FilterData[5].selectedOptions,
  };

  // FilterData.forEach((obj) => {
  //   if (obj.selectedOptions!.length > 0) {
  //     FilterInput[obj.label.toLowerCase().split(' ')[0]] = obj.selectedOptions;
  //   }
  // });
  console.log(
    props.navigation.state.params,
    'speciality',
    FilterData,
    'FilterDataFilterDataFilterData',
    FilterInput
  );
  const { data, error } = useQuery<
    getDoctorsBySpecialtyAndFilters,
    getDoctorsBySpecialtyAndFiltersVariables
  >(DOCTOR_SPECIALITY_BY_FILTERS, {
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
      data.getDoctorsBySpecialtyAndFilters &&
      data.getDoctorsBySpecialtyAndFilters.doctors &&
      doctorsList !== data.getDoctorsBySpecialtyAndFilters.doctors
    ) {
      setDoctorsList(data.getDoctorsBySpecialtyAndFilters.doctors);
      setshowSpinner(false);
    }
  }

  const handleScroll = () => {
    // console.log(e, 'jvjhvhm');
  };

  const fetchCurrentLocation = () => {
    // setshowLocationpopup(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const searchstring = position.coords.latitude + ',' + position.coords.longitude;
        const key = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchstring}&sensor=true&key=${key}`;
        axios
          .get(url)
          .then((obj) => {
            console.log(obj);
            if (obj.data.results.length > 0 && obj.data.results[0].address_components.length > 0) {
              const address = obj.data.results[0].address_components[0].short_name;
              console.log(address, 'address');
              setcurrentLocation(address.toUpperCase());
            }
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
        {currentLocation === '' ? (
          <TouchableOpacity onPress={() => fetchCurrentLocation()}>
            <LocationOff />
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: theme.colors.SHERPA_BLUE,
                ...theme.fonts.IBMPlexSansSemiBold(13),
              }}
            >
              {currentLocation}
            </Text>
            <TouchableOpacity onPress={() => setshowLocationpopup(true)}>
              <LocationOn />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => setDisplayFilter(true)}>
          <Filter />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTopView = () => {
    return (
      <View style={styles.topView}>
        <Header
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          rightComponent={<RightHeader />}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
      </View>
    );
  };

  const renderSearchDoctorResultsRow = (
    rowData: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null
  ) => {
    if (rowData) return <DoctorCard rowData={rowData} navigation={props.navigation} />;
    return null;
  };
  const consultionType = (
    consultHours:
      | (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_consultHours | null)[]
      | null,
    filter: ConsultMode
  ) => {
    let filterType = false;
    consultHours &&
      consultHours.forEach((element) => {
        if (element && element.consultMode === filter) {
          filterType = true;
        }
      });
    return filterType;
  };

  const renderDoctorSearches = (filter?: ConsultMode) => {
    console.log(doctorsList, 'doctorsList');
    const doctors = filter
      ? doctorsList.filter(
          (obj: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null) => {
            return consultionType(obj!.consultHours, filter);
          }
        )
      : doctorsList;
    console.log(doctors, 'doctors after filter');
    if (doctors.length === 0 && !showSpinner) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 64 }}>
          <Card
            cardContainer={{
              marginHorizontal: 64,
              shadowRadius: 0,
              shadowOffset: { width: 0, height: 0 },
              shadowColor: 'white',
              elevation: 0,
            }}
            heading={'Uh oh! :('}
            description={
              filter === ConsultMode.PHYSICAL
                ? `There is no ${specialityName} available for Physical Consult. Please you try Online Consultation.`
                : `There is no ${specialityName} available to match your filters. Please try again with different filters.`
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

  const headMov = scrollY.interpolate({
    inputRange: [0, 180, 181],
    outputRange: [0, -105, -105],
  });
  const headColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['white', 'white'],
  });
  const imgOp = scrollY.interpolate({
    inputRange: [0, 90, 91],
    outputRange: [1, 0, 0],
  });

  const renderAnimatedView = () => {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          height: 156,
          width: '100%',
          top: 80,
          backgroundColor: headColor,
          justifyContent: 'flex-end',
          flexDirection: 'column',
          transform: [{ translateY: headMov }],
          zIndex: 2,
          elevation: 2,
        }}
      >
        {/* <Animated.Text>
          <Text>Hey, Hi</Text>
        </Animated.Text> */}
        {/* <Text>hello</Text> */}

        <Animated.View style={{ paddingHorizontal: 20, top: 0, opacity: imgOp }}>
          <Text style={styles.headingText}>{string.common.okay}</Text>
          <Text style={styles.descriptionText}>
            {string.common.best_doctor_text}
            {specialityName}
          </Text>
        </Animated.View>

        <TabsComponent
          style={{
            // marginTop: 180,
            backgroundColor: theme.colors.CARD_BG,
          }}
          data={tabs}
          onChange={(selectedTab: string) => setselectedTab(selectedTab)}
          selectedTab={selectedTab}
        />
      </Animated.View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <Animated.ScrollView
          style={{ flex: 1 }}
          bounces={false}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: 208,
          }}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } },
              },
            ],
            { listener: handleScroll }
          )}
        >
          {/* <ScrollView style={{ flex: 1 }} bounces={false}> */}
          {selectedTab === tabs[0].title && renderDoctorSearches()}
          {selectedTab === tabs[1].title && renderDoctorSearches(ConsultMode.ONLINE)}
          {selectedTab === tabs[2].title && renderDoctorSearches(ConsultMode.PHYSICAL)}
        </Animated.ScrollView>
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
          onClickClose={(data: filterDataType[]) => {
            setDisplayFilter(false);
            setFilterData(data);
          }}
          setData={() => {
            setFilterData(data);
          }}
          data={FilterData}
        />
      )}
      {showSpinner && <Spinner />}
      {renderAnimatedView()}
      {renderTopView()}
    </View>
  );
};
