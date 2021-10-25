import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import {
  doRequestAndAccessLocationModified,
  g,
  getFormattedLocation,
  getNetStatus,
  isValidSearch,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AddressCard } from '@aph/mobile-patients/src/components/Medicines/Components/AddressCard';
import _ from 'lodash';
import {
  autoCompletePlaceSearch,
  getPlaceInfoByPlaceId,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { LocationIcon, PolygonIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { SafeAreaView } from 'react-navigation';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
const icon_gps = require('@aph/mobile-patients/src/components/ui/icons/ic_gps_fixed.webp');
const screenHeight = Dimensions.get('window').height;

type addressType = savePatientAddress_savePatientAddress_patientAddress;
interface DiagnosticLocationProps {
  addressList: any;
  onPressSelectAddress: (address: addressType) => void;
  goBack: (response: any | null) => void;
  onPressSearchLocation: (selectedLocation: any) => void;
}

export const DiagnosticLocation: React.FC<DiagnosticLocationProps> = (props) => {
  const { addressList, onPressSelectAddress, goBack, onPressSearchLocation } = props;

  const [isSearchFocused, setSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [searchState, setSearchState] = useState<'load' | 'success' | 'fail' | undefined>();
  const [searchQuery, setSearchQuery] = useState({});

  //0 -> show current location option
  //1 -> permission denied (clicked on deny option) ~ denied
  //2 -> unable to get permission (denied entirely / don't ask again -> show setting options) ~ restricted
  //3 -> unable to fetch location (error in fetching the current location response) ~ when location option is disabled in case of android & again cancelled it.
  const [showPermissionView, setShowPermissionView] = useState<0 | 1 | 2 | 3>(0);
  const [permissionText, setPermissionText] = useState<string>('');
  const [permissionCTA, setPermissionCTA] = useState<string>('');

  useEffect(() => {
    getPermissionMapping();
  }, [showPermissionView]);

  function getPermissionMapping() {
    switch (showPermissionView) {
      case 0:
        setPermissionText('');
        setPermissionCTA('');
        break;
      case 1:
        setPermissionText(string.diagnosticsLocation.permissionDenied);
        setPermissionCTA(string.diagnosticsLocation.permissionDeniedCTA);
        break;
      case 2:
        setPermissionText(string.diagnosticsLocation.unableToGetPermission);
        setPermissionCTA(string.diagnosticsLocation.unableToGetPermissionCTA);
        break;
      case 3:
        setPermissionText(string.diagnosticsLocation.unableToFetchLocation);
        setPermissionCTA('');
        break;
      default:
        setPermissionText('');
        setPermissionCTA('');
        break;
    }
  }

  function sortAddresses(addresses: addressType[]) {
    //1. filter out the addresses with lat-lng as null
    //2. show the default addresses at top based on last action preformed irrespective of address
    //3. sort rest of them based on date.
    if (addresses) {
      const filterAddressesWithLatLng = addresses?.filter(
        (item) =>
          !!item?.latitude &&
          Number(item?.latitude) !== 0 &&
          !!item?.longitude &&
          Number(item?.longitude) !== 0
      );
      const array1 = filterAddressesWithLatLng?.filter((item) => item?.defaultAddress);
      const array2 = filterAddressesWithLatLng?.filter((item) => !item?.defaultAddress);
      const nonDefaultSortedArray2 =
        array2?.length > 0
          ? array2?.sort(
              (a: addressType, b: addressType) =>
                new Date(!!b?.updatedDate ? b?.updatedDate : b?.createdDate).valueOf() -
                new Date(!!a?.updatedDate ? a?.updatedDate : b?.createdDate).valueOf()
            )
          : [];
      const sortedAddresses = array1?.concat(nonDefaultSortedArray2);
      return sortedAddresses;
    } else {
      return [];
    }
  }

  /**
   * google api to return autosearch results
   */
  const onSearchAddress = (searchText: string) => {
    getNetStatus()
      .then((status) => {
        setshowSpinner(true);
        setSearchState('load');
        if (status) {
          autoCompletePlaceSearch(searchText)
            .then((obj) => {
              setSearchState('success');
              try {
                if (obj?.data?.predictions) {
                  const address = obj?.data?.predictions?.map(
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
                  setshowSpinner(false);
                  setLocationSuggestion(address as any);
                }
              } catch (e) {
                setLocationSuggestion([]);
                setSearchState('fail');
                CommonBugFender('DiagnosticLocationSearch_onSearchAddress', e);
              }
            })
            .catch((error) => {
              setSearchState('fail');
              setshowSpinner(false);
              setLocationSuggestion([]);
              CommonBugFender('DiagnosticLocationSearch_onSearchAddress', error);
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

  /**
   * on press current location
   */
  const onPressCurrentLocation = () => {
    //set focus to false if already true;
    isSearchFocused && setSearchFocused(false);

    //if no permission then request
    setshowSpinner(true);
    doRequestAndAccessLocationModified(false, true, false)
      .then((response) => {
        //if response, then -> populate on homepage
        if (response) {
          //go back to home page , if already given
          goBack(response);
        } else {
          //no location...
          // if neever.... on ios... response is undefined.
          setShowPermissionView(2);
        }
      })
      .catch((e) => {
        if (Platform.OS == 'android') {
          e === 'denied'
            ? setShowPermissionView(1)
            : e === 'restricted'
            ? setShowPermissionView(2)
            : setShowPermissionView(3);
        } else {
          e === 'denied' ? setShowPermissionView(2) : setShowPermissionView(3);
        }

        //if goes in error then show the prompt that we are unable to fetch your location. -> thrid view
        CommonBugFender('DiagnosticLocation_doRequestAndAccessLocation', e);
      })
      .finally(() => {
        setshowSpinner(false);
      });
  };

  function _performPermissionCTAAction() {
    switch (showPermissionView) {
      case 1:
        //1 -> permission denied
        onPressCurrentLocation();
        break;
      case 2:
        //2 -> unable to get permission (denied entirely -> show setting options) //denied in case of ios
        Alert.alert('Location', 'Enable location access from settings', [
          {
            text: 'Cancel',
            onPress: () => {
              AsyncStorage.setItem('settingsCalled', 'false');
            },
          },
          {
            text: 'Ok',
            onPress: () => {
              AsyncStorage.setItem('settingsCalled', 'true');
              Linking.openSettings();
              //reset to current location.
              setShowPermissionView(0);
            },
          },
        ]);
        break;
      default:
        break;
    }
  }

  /**
   * get items from lat-lng
   */
  const fetchDetailsFromGooglePlacesId = (address: any) => {
    const placeId = address?.placeId;
    setshowSpinner(true);
    getPlaceInfoByPlaceId(placeId)
      .then(({ data }) => {
        try {
          const addrComponents = g(data, 'result', 'address_components') || [];
          const coordinates = g(data, 'result', 'geometry', 'location')! || {};
          const loc = getFormattedLocation(addrComponents, coordinates, '', true);
          setSearchFocused(false);
          onPressSearchLocation(loc);
        } catch (e) {
          CommonBugFender('getPlaceInfoByPlaceId_then_DiagnosticLocation', e);
          //what error needs to be shown?
        }
      })
      .catch((error) => {
        CommonBugFender('getPlaceInfoByPlaceId_DiagnosticLocation', error);
        //what error needs to be shown?
      })
      .finally(() => {
        setshowSpinner(false);
      });
  };

  function _onPressSuggestion(selectedItem: any) {
    fetchDetailsFromGooglePlacesId(selectedItem);
  }

  const renderLocationHeader = () => {
    return (
      <Header
        container={{
          borderBottomWidth: 0,
        }}
        leftIcon={'backArrow'}
        title={'SAMPLE COLLECTION LOCATION'}
        titleStyle={{ alignItems: 'center' }}
        onPressLeftIcon={() => goBack(null)}
      />
    );
  };

  const renderSearchBar = () => {
    return (
      <>
        <SearchInput
          _isSearchFocused={isSearchFocused}
          autoFocus={false}
          onSubmitEditing={() => {}}
          value={searchText}
          onFocus={() => {
            setSearchFocused(true);
          }}
          onBlur={() => {
            if (locationSuggestion?.length > 2) {
              //if not put the check then touch was not responding.
            } else {
              setSearchFocused(false);
              setSearchText('');
            }
          }}
          onChangeText={(value) => {
            if (isValidSearch(value)) {
              setSearchText(value);
              if (!(value && value?.length > 2)) {
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
          placeholder={string.diagnostics.diagnosticSearchLocation}
          _itemsNotFound={false}
          inputStyle={styles.searchTextStyle}
          inputContainerStyle={{
            borderColor: isSearchFocused ? colors.APP_GREEN : 'rgba(0, 0, 0, 0.1)',
            borderWidth: isSearchFocused ? 1.5 : 1,
          }}
          containerStyle={styles.searchInputContainer}
          _rightIconStyle={styles.searchIconStyle}
          _rigthIconView={<View />}
        />
      </>
    );
  };

  const renderCurrentLocation = () => {
    return (
      <View style={styles.currentLocationContainer}>
        <TouchableOpacity style={styles.currentLocationTouch} onPress={onPressCurrentLocation}>
          <View style={styles.centerRowStyle}>
            <Image source={icon_gps} style={[styles.currentLocationIcon]} />
            <View style={{ marginHorizontal: '4%' }}>
              <Text style={[styles.currentLocationHeadingText]}>
                {nameFormater(string.addressSelection.USE_CURRENT_LOCATION_TEXT, 'title')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPermissionView = () => {
    return (
      <>
        {!!permissionText && permissionText !== '' ? (
          <View style={styles.permissionOuterView}>
            {showPermissionView === 3 && <PolygonIcon style={styles.toolTipStyle} />}
            <View style={styles.premissionLeftView}>
              <View style={styles.flexRowCenter}>
                <LocationIcon style={{ tintColor: colors.WHITE }} />
                <Text style={styles.permissionText}>{permissionText}</Text>
              </View>
              {!!permissionCTA && permissionCTA !== '' ? (
                <TouchableOpacity
                  style={styles.permissionOptionTouch}
                  onPress={_performPermissionCTAAction}
                >
                  <Text style={styles.permissionOptionText}>
                    {nameFormater(permissionCTA, 'upper')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}
      </>
    );
  };

  const renderSavedAddressesView = () => {
    return (
      <View style={styles.addressViewContainer}>
        <Text style={styles.addressText}>
          {nameFormater(string.diagnosticsLocation.savedAddressText, 'upper')}
        </Text>
        {renderSavedAddresses()}
      </View>
    );
  };

  const renderSavedAddresses = () => {
    return (
      <View style={styles.savedAddressView}>
        <FlatList
          numColumns={2}
          bounces={false}
          data={sortAddresses(addressList)}
          keyExtractor={(_, index) => `${index}`}
          renderItem={({ item, index }) => renderAddressCard(item, index)}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderAddressCard = (item: addressType, index: number) => {
    return (
      <View style={{ flex: 1 }}>
        <AddressCard
          source={'Diagnostics'}
          item={item}
          onPressSelectAddress={(item) => onPressSelectAddress(item as addressType)}
        />
      </View>
    );
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
      <TouchableOpacity activeOpacity={1} onPress={() => _onPressSuggestion(item)}>
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
        <Text style={styles.noSuggestionText}>{string.diagnosticsLocation.noResults}</Text>
      </View>
    );
  };

  const renderSeparatorView = () => {
    return <View style={styles.separatorView} />;
  };

  return (
    <View style={{ flex: 1 }}>
      {renderLocationHeader()}
      {renderSearchBar()}
      {showPermissionView === 3 && renderCurrentLocation()}
      {showPermissionView === 0 ? renderCurrentLocation() : renderPermissionView()}
      {renderSeparatorView()}
      <SafeAreaView style={[theme.viewStyles.container, { backgroundColor: colors.WHITE }]}>
        {isSearchFocused ? null : renderSavedAddressesView()}
        {!!searchText &&
          searchText?.length > 2 &&
          locationSuggestion?.length > 0 &&
          renderSearchSuggestions()}
        {searchState == 'success' &&
          searchText.length > 2 &&
          locationSuggestion.length == 0 &&
          renderNoSuggestionView()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
  currentLocationContainer: { height: 30, justifyContent: 'center' },
  currentLocationHeadingText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 19,
    color: theme.colors.APP_YELLOW,
    textAlign: 'center',
  },
  currentLocationSubHeadingText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: theme.colors.APP_YELLOW,
  },
  currentLocationIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
    justifyContent: 'center',
    tintColor: theme.colors.APP_YELLOW,
  },
  currentLocationTouch: { width: '60%', marginHorizontal: 20 },
  centerRowStyle: { flexDirection: 'row', alignItems: 'center' },
  searchTextStyle: {
    height: 48,
    paddingVertical: 8,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  searchInputContainer: { marginBottom: 8, marginTop: 5 },
  searchIconStyle: { height: 27, width: 27, resizeMode: 'contain' },
  locationRowOuterContainer: { paddingLeft: '4%', paddingTop: '5%' },
  locationRowInnerContainer: {
    flexDirection: 'row',
    minHeight: screenHeight / 15,
    flex: 1,
    paddingBottom: 5,
  },
  locationHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 19,
  },
  locationSubHeadingText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: theme.colors.SHERPA_BLUE,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  noSuggestionContainer: {
    justifyContent: 'center',
    height: 30,
    marginHorizontal: 20,
  },
  noSuggestionText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: theme.colors.SHERPA_BLUE,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  permissionText: {
    color: theme.colors.WHITE,
    padding: 13,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  permissionOuterView: {
    backgroundColor: theme.colors.SHERPA_BLUE,
    justifyContent: 'center',
    marginTop: 3,
  },
  premissionLeftView: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexRowCenter: { flexDirection: 'row', alignItems: 'center' },
  permissionOptionTouch: {
    backgroundColor: colors.WHITE,
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 25,
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 4,
  },
  permissionOptionText: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 17,
  },
  addressViewContainer: { marginHorizontal: 16 },
  addressText: { ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.5, 16), marginLeft: 4 },
  bottomViewStyle: { backgroundColor: colors.WHITE, marginTop: 12 },
  savedAddressView: { flexGrow: 1, marginVertical: 16 },
  separatorView: {
    marginTop: 4,
    height: 12,
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    marginBottom: 16,
  },
  toolTipStyle: {
    height: 20,
    width: 20,
    marginTop: -10,
    resizeMode: 'contain',
    marginBottom: -10,
    marginLeft: 16,
  },
});
