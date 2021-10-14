import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  BackHandler,
  Keyboard,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { LocationIcon, SearchIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  doRequestAndAccessLocation,
  findAddrComponents,
  g,
  getFormattedLocation,
  getNetStatus,
  isValidSearch,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Input } from 'react-native-elements';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { FlatList } from 'react-native-gesture-handler';
import _ from 'lodash';
import {
  autoCompletePlaceSearch,
  getPlaceInfoByPincode,
  getPlaceInfoByPlaceId,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';

const icon_gps = require('@aph/mobile-patients/src/components/ui/icons/ic_gps_fixed.webp');
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export interface LocationSearchProps
  extends NavigationScreenProps<{
    goBackCallback: () => void;
  }> {}

export const LocationSearch: React.FC<LocationSearchProps> = (props) => {
  const [searchText, setSearchText] = useState<string>('');
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [searchState, setSearchState] = useState<'load' | 'success' | 'fail' | undefined>();
  const [searchQuery, setSearchQuery] = useState({});
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [isCurrentLocationDisable, setCurrentLocationDisable] = useState<boolean>(false);

  const { pharmacyLocation } = useAppCommonData();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    props.navigation.goBack();
    return true;
  };

  const onPressCurrentLocation = () => {
    //if no permission then request
    setshowSpinner!(true);
    doRequestAndAccessLocation(true)
      .then((response) => {
        //after getting permission, navigate to map screen (response undefined in case of deny)
        if (response) {
          isCurrentLocationDisable && setCurrentLocationDisable(false);
          props.navigation.goBack(); //pass the new location.
          props.navigation.state.params!.goBackCallback(response);
        } else {
          if (pharmacyLocation) {
            //get pincode from pharam's pincode.
            isCurrentLocationDisable && setCurrentLocationDisable(false);
            const zipcode = pharmacyLocation?.pincode;
            //call the api to get lat,long + address from pincode.
            getPlaceInfoByPincode(zipcode)
              .then((data) => {
                const addrComponents = data?.data?.results[0]?.address_components || [];
                const coordinates = data?.data?.results[0]?.geometry?.location || [];

                const city =
                  findAddrComponents('locality', addrComponents) ||
                  findAddrComponents('administrative_area_level_2', addrComponents);

                const addressData: LocationData = {
                  displayName: pharmacyLocation?.displayName || '',
                  latitude:
                    typeof coordinates.lat == 'string' ? Number(coordinates.lat) : coordinates.lat,
                  longitude:
                    typeof coordinates.lng == 'string' ? Number(coordinates.lng) : coordinates.lng,
                  area:
                    [
                      findAddrComponents('route', addrComponents),
                      findAddrComponents('sublocality_level_2', addrComponents),
                      findAddrComponents('sublocality_level_1', addrComponents),
                    ]
                      .filter((i) => i)
                      .join(', ') || pharmacyLocation?.area,
                  city: city || pharmacyLocation?.city,
                  state:
                    findAddrComponents('administrative_area_level_1', addrComponents) ||
                    pharmacyLocation?.state,
                  country:
                    findAddrComponents('country', addrComponents) || pharmacyLocation?.country,
                  pincode:
                    findAddrComponents('postal_code', addrComponents) || pharmacyLocation?.pincode,
                  lastUpdated: new Date().getTime(),
                };
                props.navigation.goBack(); //pass the new location.
                props.navigation.state.params!.goBackCallback(addressData);
              })
              .catch((error) => {
                CommonBugFender('AddAddress_getPlaceInfoByPincode_error', error);
                //go back, and hit service again with api...
              })
              .finally(() => {
                setshowSpinner!(false);
              });
          } else {
            // no pharma location is there, then if clicks then ? disable it?
            setshowSpinner!(false);
            setCurrentLocationDisable(true);
          }
        }
      })
      .catch((e) => {
        CommonBugFender('LocationSearch_doRequestAndAccessLocationModified', e);
      })
      .finally(() => {
        setshowSpinner!(false);
      });
  };

  const onPressLocation = (selectedAddress: any) => {
    //get lat long for the address
    isCurrentLocationDisable && setCurrentLocationDisable(false);
    fetchDetailsFromGooglePlacesId(selectedAddress);
  };

  //instead use the one with placeid.
  const fetchDetailsFromGooglePlacesId = (address: any) => {
    const placeId = address?.placeId;
    setshowSpinner!(true);
    getPlaceInfoByPlaceId(placeId)
      .then(({ data }) => {
        try {
          const addrComponents = g(data, 'result', 'address_components') || [];
          const coordinates = g(data, 'result', 'geometry', 'location')! || {};
          const loc = getFormattedLocation(addrComponents, coordinates, '', true);
          props.navigation.goBack(); //pass the new location.
          props.navigation.state.params!.goBackCallback(loc);
        } catch (e) {}
      })
      .catch((error) => {})
      .finally(() => {
        setshowSpinner!(false);
      });
  };

  const onSearchAddress = (searchText: string) => {
    getNetStatus()
      .then((status) => {
        setshowSpinner!(true);
        setSearchState('load');
        if (status) {
          autoCompletePlaceSearch(searchText)
            .then((obj) => {
              setSearchState('success');
              try {
                if (obj.data.predictions) {
                  const address = obj.data.predictions.map(
                    (item: {
                      place_id: string;
                      structured_formatting: {
                        main_text: string;
                        secondary_text: string;
                      };
                    }) => {
                      return {
                        address1: item?.structured_formatting?.main_text,
                        address2: item?.structured_formatting?.secondary_text,
                        placeId: item?.place_id,
                      };
                    }
                  );
                  setshowSpinner!(false);
                  setLocationSuggestion(address);
                }
              } catch (e) {
                setLocationSuggestion([]);
                setSearchState('fail');
                CommonBugFender('LocationSearch_try', e);
              }
            })
            .catch((error) => {
              setSearchState('fail');
              setshowSpinner!(false);
              setLocationSuggestion([]);
              CommonBugFender('LocationSearch_autoSearch', error);
            });
        }
      })
      .catch((e) => {
        setshowSpinner!(false);
        setSearchState('fail');
        setLocationSuggestion([]);
        CommonBugFender('LocationSearch_getNetStatus_autoSearch', e);
      });
  };

  const renderSearchView = () => {
    return (
      <View style={styles.cardStyle}>
        {renderSearchBar()}
        {renderCurrentLocationView()}
        {/**
         * only to be shown when typed
         */}
        {!!searchText && searchText.length > 2 && locationSuggestion.length > 0 && (
          <>
            {renderHorizontalLine()}
            {renderSearchSuggestions()}
          </>
        )}
        {/**
         * When no suggestions..
         */}
        {/**
         * clear after value is zero.
         */}
        {searchState == 'success' &&
          searchText.length > 2 &&
          locationSuggestion.length == 0 &&
          renderNoSuggestionView()}
      </View>
    );
  };

  const leftIconView = <SearchIcon style={styles.searchIconStyle} />;
  const renderSearchBar = () => {
    return (
      <View style={styles.searchBarContainer}>
        <Input
          value={searchText}
          autoCapitalize="none"
          spellCheck={false}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            setSearchFocused(false);
            setLocationSuggestion([]);
            setSearchText('');
            setSearchState('success');
          }}
          onChangeText={(value) => {
            if (isValidSearch(value)) {
              setSearchText(value);
              if (!(value && value.length > 2)) {
                setLocationSuggestion([]);
                return;
              }
              const search = _.debounce(onSearchAddress, 300);
              if (value.length >= 3) {
                setSearchState('load');
              }
              setSearchQuery((prevSearch: any) => {
                if (prevSearch.cancel) {
                  prevSearch.cancel();
                }
                return search;
              });
              search(value);
            }
          }}
          leftIcon={isSearchFocused ? <View /> : leftIconView}
          autoCorrect={false}
          placeholder="Search street, area"
          underlineColorAndroid="transparent"
          inputStyle={{
            ...theme.fonts.IBMPlexSansMedium(13),
            paddingBottom: 0,
          }}
          inputContainerStyle={[styles.inputContainerStyle]}
          containerStyle={{}}
        />
      </View>
    );
  };

  const renderCurrentLocationView = () => {
    return (
      <TouchableOpacity
        style={styles.currentLocationContainer}
        onPress={onPressCurrentLocation}
        disabled={isCurrentLocationDisable}
      >
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={icon_gps}
            style={[styles.currentLocationIcon, { opacity: isCurrentLocationDisable ? 0.4 : 1 }]}
          />
          <View style={{ marginHorizontal: '4%' }}>
            <Text
              style={[
                styles.currentLocationHeadingText,
                { opacity: isCurrentLocationDisable ? 0.4 : 1 },
              ]}
            >
              {string.addressSelection.USE_CURRENT_LOCATION_TEXT}
            </Text>
            <Text
              style={[
                styles.currentLocationSubHeadingText,
                {
                  opacity: isCurrentLocationDisable ? 0.4 : 1,
                },
              ]}
            >
              {string.addressSelection.USE_GPS_TEXT}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHorizontalLine = () => {
    return <Spearator style={styles.horizontalLineStyle} />;
  };

  const renderSearchSuggestions = () => {
    return (
      <FlatList
        onScroll={() => Keyboard.dismiss()}
        keyboardShouldPersistTaps="always"
        data={locationSuggestion}
        renderItem={({ item, index }) => renderLocationView(item, index, locationSuggestion)}
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        ItemSeparatorComponent={() => <Spearator />}
      />
    );
  };

  const renderLocationView = (item: any, index: number | string, locationSuggestion: any) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => onPressLocation(item)}>
        <View style={styles.locationRowOuterContainer}>
          {/**height: screenHeight/12.5 */}
          <View style={styles.locationRowInnerContainer}>
            <LocationIcon style={{ resizeMode: 'contain', tintColor: theme.colors.SHERPA_BLUE }} />
            <View style={{ width: '87%', marginHorizontal: 5 }}>
              <Text style={styles.locationHeadingText}>{item?.address1}</Text>
              <Text numberOfLines={1} style={styles.locationSubHeadingText}>
                {item?.address2}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNoSuggestionView = () => {
    return (
      <View style={styles.noSuggestionContainer}>
        <Text style={styles.noSuggestionText}>{string.addressSelection.NO_RESULTS_FOUND}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'SET DELIVERY LOCATION'}
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          onPressLeftIcon={() => handleBack()}
        />
        {renderSearchView()}
        {showSpinner && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    paddingLeft: 10,
    paddingRight: 10,
  },
  currentLocationIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    alignSelf: 'center',
    justifyContent: 'center',
    tintColor: theme.colors.APP_YELLOW_COLOR,
  },
  searchIconStyle: {
    height: 23,
    width: 23,
    tintColor: theme.colors.SHERPA_BLUE,
    marginRight: 5,
  },
  searchBarContainer: {
    backgroundColor: theme.colors.WHITE,
    flexDirection: 'row',
  },
  inputContainerStyle: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.SHERPA_BLUE,
  },
  currentLocationContainer: { paddingLeft: '4%', paddingTop: 1 },
  currentLocationHeadingText: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    lineHeight: 21,
    color: theme.colors.APP_YELLOW_COLOR,
  },
  currentLocationSubHeadingText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: theme.colors.APP_YELLOW_COLOR,
  },
  horizontalLineStyle: { width: screenWidth - 40, marginTop: '5%', marginLeft: -10, opacity: 0.2 },
  locationRowOuterContainer: { paddingLeft: '4%', paddingTop: '5%' },
  locationRowInnerContainer: {
    flexDirection: 'row',
    minHeight: screenHeight / 12.5,
    flex: 1,
    paddingBottom: 5,
  },
  locationHeadingText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 19,
  },
  locationSubHeadingText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: theme.colors.SHERPA_BLUE,
    flexWrap: 'wrap',
    lineHeight: 15,
  },
  noSuggestionContainer: {
    backgroundColor: theme.colors.SHERPA_BLUE,
    marginBottom: -16,
    marginLeft: -10,
    width: screenWidth - 40,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  noSuggestionText: {
    color: theme.colors.WHITE,
    padding: 13,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
});
