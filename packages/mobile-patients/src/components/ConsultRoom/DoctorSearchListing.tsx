import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Filter, LocationOff, LocationOn } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  DOCTOR_SPECIALITY_BY_FILTERS,
  NEXT_AVAILABLE_SLOT,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots,
} from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import {
  getDoctorsBySpecialtyAndFilters,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty,
} from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import { ConsultMode, Gender, Range } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { default as string } from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Animated,
  AsyncStorage,
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
    borderRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 0,
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
const key = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';
export interface DoctorSearchListingProps extends NavigationScreenProps {}
export type filterDataType = {
  label: string;
  options: string[];
  selectedOptions: string[]; // | { minimum: number; maximum: number }[];
};

export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const filterData: filterDataType[] = [
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
  const [doctorsAvailability, setdoctorsAvailability] = useState<
    | (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability | null)[]
    | null
  >([]);

  const [FilterData, setFilterData] = useState<filterDataType[]>([...filterData]);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [locationSearchList, setlocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );
  const [doctorAvailalbeSlots, setdoctorAvailalbeSlots] = useState<
    (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[] | null
  >([]);
  const [doctorIds, setdoctorIds] = useState<(string | null)[]>([]);
  const [
    specialities,
    setspecialities,
  ] = useState<getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty | null>(
    null
  );

  const [scrollY] = useState(new Animated.Value(0));
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
      } else {
        console.log('location permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    Platform.OS === 'android' && requestLocationPermission();
    fetchCurrentLocation();
    getNetStatus().then((status) => {
      if (status) {
        fetchSpecialityFilterData();
      } else {
        setshowSpinner(false);
      }
    });
  }, []);

  const fetchNextSlots = (doctorIds: (string | null)[]) => {
    console.log(doctorIds, 'doctorIds fetchNextSlots');
    const todayDate = new Date().toISOString().slice(0, 10);
    // const availability = useQuery<GetDoctorNextAvailableSlot>(NEXT_AVAILABLE_SLOT, {
    //   fetchPolicy: 'no-cache',
    //   variables: {
    //     DoctorNextAvailableSlotInput: {
    //       doctorIds: doctorIds,
    //       availableDate: todayDate,
    //     },
    //   },
    // });

    // if (availability.error) {
    //   console.log('error', availability.error);
    // } else {
    //   console.log('doctorIds fetchNextSlots result', availability);
    //   if (
    //     availability &&
    //     availability.data &&
    //     availability.data.getDoctorNextAvailableSlot &&
    //     availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
    //     doctorAvailalbeSlots !== availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    //   ) {
    //     setdoctorAvailalbeSlots(availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots);
    //   }
    // }

    client
      .query<GetDoctorNextAvailableSlot>({
        query: NEXT_AVAILABLE_SLOT,
        variables: {
          DoctorNextAvailableSlotInput: {
            doctorIds: doctorIds,
            availableDate: todayDate,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data) {
          if (
            data &&
            data.getDoctorNextAvailableSlot &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
            doctorAvailalbeSlots !== data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
          ) {
            setdoctorAvailalbeSlots(data.getDoctorNextAvailableSlot.doctorAvailalbeSlots);
          }
        }
      })
      .catch((e: string) => {
        console.log('Error occured while searching Doctor', e);
      });
  };

  const fetchSpecialityFilterData = () => {
    console.log('FilterData1111111', FilterData);
    const experienceArray: Range[] = [];
    if (FilterData[1].selectedOptions && FilterData[1].selectedOptions.length > 0)
      FilterData[1].selectedOptions.forEach((element: string) => {
        const splitArray = element.split(' - ');
        let object: Range | null = {};
        if (splitArray.length > 0)
          object = {
            minimum: Number(splitArray[0].replace('+', '')),
            maximum: splitArray.length > 1 ? Number(element.split(' - ')[1]) : -1,
          };
        if (object) {
          experienceArray.push(object);
        }
      });

    const feesArray: Range[] = [];
    if (FilterData[3].selectedOptions && FilterData[3].selectedOptions.length > 0)
      FilterData[3].selectedOptions.forEach((element: string) => {
        const splitArray = element.split(' - ');
        console.log(splitArray, 'splitArray');
        let object: Range | null = {};
        if (splitArray.length > 0)
          object = {
            minimum: Number(splitArray[0].replace('+', '')),
            maximum: splitArray.length > 1 ? Number(element.split(' - ')[1]) : -1,
          };

        if (object) {
          feesArray.push(object);
        }
      });

    let availableNow = {};
    const availabilityArray: string[] = [];
    const today = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
    console.log('moment', moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'));
    if (FilterData[2].selectedOptions && FilterData[2].selectedOptions.length > 0)
      FilterData[2].selectedOptions.forEach((element: string) => {
        if (element === 'Now') {
          // availabilityArray.push(today);
          availableNow = {
            availableNow: moment(new Date())
              .utc()
              .format('YYYY-MM-DD hh:mm'),
          };
        } else if (element === 'Today') {
          availabilityArray.push(today);
        } else if (element === 'Tomorrow') {
          availabilityArray.push(
            moment(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
              'YYYY-MM-DD'
            )
          );
        } else if (element === 'Next 3 Days') {
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
        } else {
          availabilityArray.push(element);
        }
        // new Date().getTime() + 24 * 60 * 60 * 1000;
      });
    console.log(
      experienceArray,
      'experienceArray',
      availabilityArray,
      'availabilityArray',
      feesArray,
      'feesArray',
      availableNow,
      'availableNow'
    );

    const FilterInput = {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
      specialty: props.navigation.state.params ? props.navigation.state.params!.specialityId : '',
      city: FilterData[0].selectedOptions,
      experience: experienceArray,
      availability: availabilityArray,
      fees: feesArray,
      gender: FilterData[4].selectedOptions,
      language: FilterData[5].selectedOptions,
      ...availableNow,
    };

    console.log(
      props.navigation.state.params,
      'speciality',
      FilterData,
      'FilterDataFilterDataFilterData',
      FilterInput
    );
    client
      .query<getDoctorsBySpecialtyAndFilters>({
        query: DOCTOR_SPECIALITY_BY_FILTERS,
        fetchPolicy: 'no-cache',
        variables: {
          filterInput: FilterInput,
        },
      })
      .then(({ data }) => {
        console.log('getDoctorsBySpecialtyAndFilters ', data);
        const filterGetData =
          data && data.getDoctorsBySpecialtyAndFilters
            ? data.getDoctorsBySpecialtyAndFilters
            : null;
        if (filterGetData && filterGetData.doctors && doctorsList !== filterGetData.doctors) {
          const ids = filterGetData.doctors
            ? filterGetData.doctors.map((item) => item && item.id)
            : [];
          const prevIds = [...doctorIds];
          if (ids !== prevIds) {
            prevIds.push(...ids);
            setdoctorIds(prevIds);
            fetchNextSlots(prevIds);
          }
          console.log(doctorIds, 'doctorIds otherDoctors', filterGetData.doctors);
          setDoctorsList(filterGetData.doctors);
          setshowSpinner(false);
        }

        if (
          filterGetData &&
          filterGetData.doctorsAvailability &&
          doctorsAvailability !== filterGetData.doctorsAvailability
        ) {
          setdoctorsAvailability(filterGetData.doctorsAvailability);
          setshowSpinner(false);
        }
        if (filterGetData && filterGetData.specialty && specialities !== filterGetData.specialty) {
          setspecialities(filterGetData.specialty);
          setshowSpinner(false);
        }
      })
      .catch((e: string) => {
        setshowSpinner(false);
        console.log('Error occured while searching Doctor', e);
      });

    // const { data, error } = useQuery<getDoctorsBySpecialtyAndFilters>(DOCTOR_SPECIALITY_BY_FILTERS, {
    //   fetchPolicy: 'no-cache',
    //   variables: {
    //     filterInput: FilterInput,
    //   },
    // });
    // if (error) {
    //   setshowSpinner(false);
    //   console.log('error', error);
    // } else {
    //   console.log('getDoctorsBySpecialtyAndFilters ', data);
    //   const filterGetData =
    //     data && data.getDoctorsBySpecialtyAndFilters ? data.getDoctorsBySpecialtyAndFilters : null;
    //   if (filterGetData && filterGetData.doctors && doctorsList !== filterGetData.doctors) {
    //     const ids = filterGetData.doctors ? filterGetData.doctors.map((item) => item && item.id) : [];
    //     const prevIds = [...doctorIds];
    //     if (ids !== prevIds) {
    //       prevIds.push(...ids);
    //       setdoctorIds(prevIds);
    //       fetchNextSlots(prevIds);
    //     }
    //     console.log(doctorIds, 'doctorIds otherDoctors', filterGetData.doctors);
    //     setDoctorsList(filterGetData.doctors);
    //     setshowSpinner(false);
    //   }

    //   if (
    //     filterGetData &&
    //     filterGetData.doctorsAvailability &&
    //     doctorsAvailability !== filterGetData.doctorsAvailability
    //   ) {
    //     setdoctorsAvailability(filterGetData.doctorsAvailability);
    //     setshowSpinner(false);
    //   }
    //   if (filterGetData && filterGetData.specialty && specialities !== filterGetData.specialty) {
    //     setspecialities(filterGetData.specialty);
    //     setshowSpinner(false);
    //   }
    // }
  };

  const handleScroll = () => {
    // console.log(e, 'jvjhvhm');
  };

  const findAddressFromLocationString = (searchstring: string, key: string) => {
    return new Promise((resolve, reject) => {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchstring}&sensor=true&key=${key}`;
      axios
        .get(url)
        .then(resolve)
        .catch(reject);
    });
  };

  const autoSearch = (searchText: string) => {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchText}&key=${key}`
      )
      .then((obj) => {
        console.log(obj, 'places');
        if (obj.data.predictions) {
          const address = obj.data.predictions.map(
            (item: {
              place_id: string;
              structured_formatting: {
                main_text: string;
              };
            }) => {
              return { name: item.structured_formatting.main_text, placeId: item.place_id };
            }
          );
          console.log(address, 'address');
          setlocationSearchList(address);
          // setcurrentLocation(address.toUpperCase());
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const saveLatlong = (placeId: string) => {
    axios
      .get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${key}`)
      .then((obj) => {
        try {
          console.log(obj, 'places details');
          if (obj.data.result.geometry && obj.data.result.geometry.location) {
            console.log(obj.data.result.geometry.location, 'obj.data.geometry.location');

            AsyncStorage.setItem('location', JSON.stringify(obj.data.result.geometry.location));
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchCurrentLocation = () => {
    // setshowLocationpopup(true);
    AsyncStorage.getItem('location').then((item) => {
      const latlong = item ? JSON.parse(item) : null;
      console.log(item, 'AsyncStorage item', latlong);
      if (latlong) {
        findAddressFromLocationString(`${latlong.lat}, ${latlong.lng}`, key)
          .then((response: any) => {
            console.log(response, 'lat long');
            if (
              response.data.results.length &&
              response.data.results[0].address_components.length
            ) {
              const address = response.data.results[0].address_components[0].short_name;
              console.log(address, 'address');
              setcurrentLocation(address.toUpperCase());
            }
          })
          .catch((error) => console.log(error));
        // searchstring = `${latlong.lat}, ${latlong.lng}`;
      } else {
        // searchstring = position.coords.latitude + ', ' + position.coords.longitude;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const searchstring = position.coords.latitude + ',' + position.coords.longitude;
            console.log(searchstring, 'getCurrentPosition searchstring');

            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchstring}&sensor=true&key=${key}`;
            axios
              .get(url)
              .then((obj) => {
                console.log(obj);
                if (
                  obj.data.results.length > 0 &&
                  obj.data.results[0].address_components.length > 0
                ) {
                  const address = obj.data.results[0].address_components[0].short_name;
                  console.log(
                    address,
                    'address',
                    obj.data.results[0].geometry.location,
                    'location'
                  );
                  setcurrentLocation(address.toUpperCase());
                  AsyncStorage.setItem(
                    'location',
                    JSON.stringify(obj.data.results[0].geometry.location)
                  );
                }
              })
              .catch((error) => {
                console.log(error, 'geocode error');
              });
          },
          (error) => {
            console.log(error.code, error.message, 'getCurrentPosition error');
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      }
    });
  };

  const RightHeader = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {currentLocation === '' ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setshowLocationpopup(true);
              fetchCurrentLocation();
            }}
          >
            <LocationOff />
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setshowLocationpopup(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {currentLocation ? (
                <Text
                  style={{
                    color: theme.colors.SHERPA_BLUE,
                    ...theme.fonts.IBMPlexSansSemiBold(13),
                    textTransform: 'uppercase',
                  }}
                >
                  {currentLocation}
                </Text>
              ) : null}
              <LocationOn />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={1}
          style={{ marginLeft: 20 }}
          onPress={() => setDisplayFilter(true)}
        >
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
    rowData: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null,
    index: number
  ) => {
    if (rowData)
      return (
        <DoctorCard
          key={index}
          rowData={rowData}
          navigation={props.navigation}
          doctorAvailalbeSlots={doctorAvailalbeSlots}
        />
      );
    return null;
  };
  const consultionType = (id: string, filter: ConsultMode) => {
    doctorsAvailability;
    let filterType = false;
    doctorsAvailability &&
      doctorsAvailability.forEach((element) => {
        if (
          element &&
          element.doctorId === id &&
          element.availableModes &&
          element.availableModes.includes(filter)
        ) {
          filterType = true;
        }
      });
    return filterType;
  };

  const renderDoctorSearches = (filter?: ConsultMode) => {
    const doctors = filter
      ? doctorsList.filter(
          (obj: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null) => {
            return consultionType(obj!.id, filter) || consultionType(obj!.id, ConsultMode.BOTH);
          }
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
              elevation: 0,
            }}
            heading={'Uh oh! :('}
            description={
              filter === ConsultMode.PHYSICAL
                ? `There is no ${
                    specialities && specialities.specialistSingularTerm
                      ? specialities.specialistSingularTerm
                      : ''
                  } available for Physical Consult. Please you try Online Consultation.`
                : `There is no ${
                    specialities && specialities.specialistSingularTerm
                      ? specialities.specialistSingularTerm
                      : ''
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
            renderItem={({ item, index }) => renderSearchDoctorResultsRow(item, index)}
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
          top: Platform.OS === 'ios' ? 80 : 56,
          backgroundColor: headColor,
          justifyContent: 'flex-end',
          flexDirection: 'column',
          transform: [{ translateY: headMov }],
          zIndex: 2,
          elevation: 2,
        }}
      >
        <Animated.View style={{ paddingHorizontal: 20, top: 0, opacity: imgOp }}>
          <Text style={styles.headingText}>{string.common.okay}</Text>
          <Text style={styles.descriptionText}>
            {string.common.best_doctor_text}
            {specialities && specialities.specialistPluralTerm
              ? specialities.specialistPluralTerm
              : ''}
          </Text>
        </Animated.View>

        <TabsComponent
          style={{
            backgroundColor: theme.colors.CARD_BG,
          }}
          data={tabs}
          onChange={(selectedTab: string) => setselectedTab(selectedTab)}
          selectedTab={selectedTab}
        />
      </Animated.View>
    );
  };

  const renderPopup = () => {
    console.log(showLocationpopup, 'showLocationpopup', locationSearchList);
    if (showLocationpopup) {
      return (
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0, //40
            bottom: 0,
            alignItems: 'center',
            zIndex: 15,
            elevation: 15,
          }}
          onPress={() => setshowLocationpopup(false)}
        >
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              width: 235,
              padding: 16,
              marginTop: 40,
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
                  // conatinerstyles={{ flex: 1, height: 64 }}
                  value={currentLocation}
                  onChangeText={(value) => {
                    setcurrentLocation(value);
                    autoSearch(value);
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
                <LocationOn />
              </View>
            </View>
            <View>
              {locationSearchList.map((item, i) => (
                <View
                  key={i}
                  style={{
                    borderBottomWidth: 0.5,
                    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
                    paddingVertical: 7,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.LIGHT_BLUE,
                      ...theme.fonts.IBMPlexSansMedium(18),
                    }}
                    onPress={() => {
                      setcurrentLocation(item.name);
                      saveLatlong(item.placeId);
                      setshowLocationpopup(false);
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  console.log(FilterData, 'FilterData', showSpinner, 'displayFilter', displayFilter);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
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
            paddingTop: 215,
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
          {selectedTab === tabs[0].title && renderDoctorSearches()}
          {selectedTab === tabs[1].title && renderDoctorSearches(ConsultMode.ONLINE)}
          {selectedTab === tabs[2].title && renderDoctorSearches(ConsultMode.PHYSICAL)}
        </Animated.ScrollView>
      </SafeAreaView>
      {displayFilter ? (
        <FilterScene
          onClickClose={() => {
            setDisplayFilter(false);
          }}
          setData={(selecteddata) => {
            console.log('selecteddata', selecteddata);
            setshowSpinner(true);
            setFilterData(selecteddata);
          }}
          filterLength={() => {
            setTimeout(() => {
              setshowSpinner(false);
            }, 500);
          }}
          data={[...FilterData]}
        />
      ) : null}
      {showSpinner && <Spinner />}
      {renderAnimatedView()}
      {renderTopView()}
      {renderPopup()}
    </View>
  );
};
