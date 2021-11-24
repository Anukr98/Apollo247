import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProp, NavigationRoute, NavigationParams } from 'react-navigation';
import { LocationOnHeader } from '@aph/mobile-patients/src/components/LocationOnHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  SearchGreenIcon,
  LocationYellow,
  CrossGray,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  doRequestAndAccessLocation,
  getFormattedLocation,
  locationSearch,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import _ from 'lodash';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  getPlaceInfoByPincode,
  getPlaceInfoByPlaceId,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useApolloClient } from 'react-apollo-hooks';
import { PATIENT_PAST_LOCATIONS } from '@aph/mobile-patients/src/graphql/profiles';

const { width } = Dimensions.get('window');
interface SelectLocationProps {
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}
interface places {
  city: string;
  pincode: string;
}
interface GetPastLocationsResponse {
  pastLocations: places[] | [];
  popularCities: places[] | [];
}

interface GetPastLocations {
  getPatientPastLocations: GetPastLocationsResponse | null;
}

export const SelectLocation: React.FC<SelectLocationProps> = (props) => {
  const [searchedLocations, setSearchedLocations] = useState<any>([]);
  const [locationInput, setLocationInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<any>({});
  const showSearchedLocations = searchedLocations?.length > 0 && locationInput?.length > 2;
  const { setLocationDetails, locationDetails } = useAppCommonData();
  const isOnlineConsultMode = props?.navigation?.getParam('isOnlineConsultMode');
  const [pastLocations, setPastLocations] = useState<places[]>([]);
  const [popularCities, setPopularCities] = useState<places[]>([]);
  const patientId = props.navigation.getParam('patientId');
  const patientMobileNumber = props.navigation.getParam('patientMobileNumber');
  const goBack = props.navigation.getParam('goBack') || false;

  const client = useApolloClient();

  useEffect(() => {
    client
      .query<GetPastLocations>({
        query: PATIENT_PAST_LOCATIONS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: patientId,
          patientMobile: patientMobileNumber,
        },
      })
      .then((res) => {
        setPastLocations(res?.data?.getPatientPastLocations?.pastLocations || []);
        setPopularCities(res?.data?.getPatientPastLocations?.popularCities || []);
      })
      .catch((error) => {});
  }, []);

  const onPressLocation = (selectedAddress: any) => {
    //get lat long for the address
    fetchDetailsFromGooglePlacesId(selectedAddress);
  };

  //instead use the one with placeid.
  const fetchDetailsFromGooglePlacesId = (address: any) => {
    const placeId = address?.placeId;
    getPlaceInfoByPlaceId(placeId)
      .then(({ data }) => {
        try {
          const addrComponents = data?.result?.address_components || [];
          const coordinates = data?.result?.geometry?.location || {};
          const loc = getFormattedLocation(addrComponents, coordinates, '', true);
          setLocationDetails!(loc);
          props.navigation.state.params?.postEventClickSelectLocation &&
            props.navigation.state.params?.postEventClickSelectLocation(loc?.displayName || '');
          props.navigation.state.params?.goBackCallback &&
            props.navigation.state.params?.goBackCallback(loc);
          if (goBack) {
            props.navigation.goBack();
          }
        } catch (e) {
          console.log('FetchDetailsFromGooglePlacesId', e);
        }
      })
      .catch((error) => {
        CommonBugFender('LocationSearch_getPlaceInfoByPlaceId', error);
      });
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          leftIcon={'backArrow'}
          titleComponent={
            <LocationOnHeader
              navigation={props.navigation}
              isOnlineConsultMode={isOnlineConsultMode}
            />
          }
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={backDataFunctionality}
        />
        <View style={styles.seperator} />
      </View>
    );
  };

  const backDataFunctionality = async () => {
    props.navigation.goBack();
  };

  const renderTitle = (title: string) => {
    return (
      <Text style={{ ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE) }}>{title}</Text>
    );
  };

  const renderLocationSearch = () => {
    return (
      <View style={styles.row}>
        <SearchGreenIcon style={styles.searchIcon} />
        <TextInputComponent
          value={locationInput}
          conatinerstyles={{ paddingBottom: 3, width: width - 90 }}
          inputStyle={styles.searchValueStyle}
          placeholder="Search location"
          underlineColorAndroid="transparent"
          onChangeText={(value) => {
            setLocationInput(value);
            const search = _.debounce(searchLocation, 500);
            setSearchQuery((prevSearch: any) => {
              if (prevSearch.cancel) {
                prevSearch.cancel();
              }
              return search;
            });
            search(value);
          }}
        />
        {locationInput?.length > 2 && (
          <TouchableOpacity onPress={() => clearTextInput()}>
            <CrossGray style={styles.crossIcon} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const clearTextInput = () => {
    setLocationInput('');
    setSearchedLocations([]);
  };

  const searchLocation = async (location: string) => {
    if (location.length > 2) {
      try {
        const res = await locationSearch(location);
        setSearchedLocations(res);
      } catch (error) {
        CommonBugFender('SelectLocation', error);
      }
    }
  };
  const onPressCurrentLocation = () => {
    //if no permission then request
    doRequestAndAccessLocation(true)
      .then((response) => {
        //after getting permission, navigate to map screen (response undefined in case of deny)
        if (response) {
          setLocationDetails!(response);
          if (props.navigation.state.params?.goBackCallback) {
            props.navigation.state.params?.postEventClickSelectLocation &&
              props.navigation.state.params?.postEventClickSelectLocation(
                response?.displayName || ''
              );
            props.navigation.state.params?.goBackCallback(response);
            goBack && props.navigation.goBack();
          }
        } else {
          props.navigation.goBack();
        }
      })
      .catch((e) => {
        CommonBugFender('LocationSearch_doRequestAndAccessLocationModified', e);
      });
  };

  const renderUseCurrentLocation = () => {
    return (
      <Button
        title={'USE CURRENT LOCATION'}
        style={styles.currentLocationBtn}
        titleTextStyle={styles.btnTxt}
        leftIcon={<LocationYellow style={styles.locationIcon} />}
        onPress={onPressCurrentLocation}
      />
    );
  };

  const renderFlatlistData = (data: places[]) => {
    return (
      <FlatList
        style={styles.listDataContainer}
        contentContainerStyle={styles.listDataContentContainerStyle}
        data={data}
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        renderItem={({ item, index }) => renderCitiesAndLocations(item, index)}
        ListEmptyComponent={<Text>{'-'}</Text>}
      />
    );
  };

  const renderListHeaderComponent = () => {
    return (
      <View style={{ marginHorizontal: 20 }}>
        <View style={{ marginTop: 15 }}>{renderTitle('Looking for doctors in')}</View>
        {renderLocationSearch()}
        {renderUseCurrentLocation()}
        {showSearchedLocations && renderSearchedLocations()}
        {!showSearchedLocations && (
          <View style={{ marginTop: 21 }}>{renderTitle('Past Locations')}</View>
        )}
      </View>
    );
  };

  const setLocationByPincode = (pincode: string) => {
    if (pincode) {
      getPlaceInfoByPincode(pincode)
        .then((data) => {
          try {
            const addrComponents = data?.data?.results[0]?.address_components || [];
            const coordinates = data?.data?.results[0]?.geometry?.location || [];
            const loc = getFormattedLocation(addrComponents, coordinates, '', true);
            setLocationDetails!(loc);
            props.navigation.state.params?.postEventClickSelectLocation &&
              props.navigation.state.params?.postEventClickSelectLocation(loc?.displayName || '');
            props.navigation.state.params?.goBackCallback
              ? props.navigation.state.params?.goBackCallback(loc)
              : props.navigation.goBack();
            if (goBack) {
              props.navigation.goBack();
            }
          } catch (e) {
            console.log('LocationByPincodeData_Error', e);
          }
        })
        .catch((error) => {
          CommonBugFender('AddAddress_getPlaceInfoByPincode_error', error);
        });
    }
  };

  const renderCitiesAndLocations = (item: any, index: number) => {
    return (
      <View style={{ flex: 1 }}>
        <Button
          title={item?.city}
          style={styles.cityView}
          titleTextStyle={styles.cityTxt}
          onPress={() => setLocationByPincode(item?.pincode)}
        />
      </View>
    );
  };

  const renderSearchedLocations = () => {
    return (
      <FlatList
        style={styles.searchedLocationListContainer}
        data={searchedLocations}
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        renderItem={({ item, index }) => renderLocations(item, index)}
      />
    );
  };

  const renderLocations = (item: any, index: number) => {
    return (
      <TouchableOpacity key={index} onPress={() => onPressLocation(item)}>
        <Text style={styles.locationText}>{item?.name}</Text>
        <View style={styles.seperatorLine} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyles}>
      {renderHeader()}
      <ScrollView style={{ backgroundColor: 'white' }} bounces={false}>
        {renderListHeaderComponent()}
        {!showSearchedLocations ? (
          <View>
            <View style={styles.container}>{renderFlatlistData(pastLocations)}</View>
            <View style={{ marginHorizontal: 20 }}>{renderTitle('Popular cities')}</View>
            {renderFlatlistData(popularCities)}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeAreaViewStyles: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  seperator: {
    width: '100%',
    height: 0.5,
    backgroundColor: theme.colors.BORDER_BOTTOM_COLOR,
    opacity: 0.3,
  },
  searchValueStyle: {
    borderBottomWidth: 0,
    fontSize: 15,
    width: width - 90,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    marginTop: 12,
    width: width - 40,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  currentLocationBtn: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 15,
    width: width - 40,
  },
  btnTxt: {
    color: theme.colors.BUTTON_BG,
  },
  locationIcon: {
    marginRight: 10,
    width: 24,
    height: 24,
  },
  cityView: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 12,
    width: 'auto',
  },
  cityTxt: {
    ...theme.viewStyles.text('M', 12, theme.colors.SEARCH_UNDERLINE_COLOR),
  },
  crossIcon: {
    width: 14,
    height: 14,
    marginRight: 0,
    marginLeft: 5,
  },
  spaceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    ...theme.viewStyles.text('M', 15, theme.colors.LIGHT_BLUE),
    marginTop: 14,
  },
  seperatorLine: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.15,
    marginTop: 14,
  },
  searchedLocationListContainer: { flex: 1, marginTop: 10 },
  listDataContainer: { flex: 1, paddingHorizontal: 20, paddingBottom: 25 },
  listDataContentContainerStyle: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 10 },
});
