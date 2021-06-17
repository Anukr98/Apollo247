import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getNetStatus,
  isValidSearch,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AddressCard } from '@aph/mobile-patients/src/components/Medicines/Components/AddressCard';
import { FlatList } from 'react-native-gesture-handler';
import { getPatientAddressList_getPatientAddressList_addressList } from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import _ from 'lodash';
import { autoCompletePlaceSearch } from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { LocationIcon } from '@aph/mobile-patients/src/components/ui/Icons';
const icon_gps = require('@aph/mobile-patients/src/components/ui/icons/ic_gps_fixed.webp');
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

type addressType = getPatientAddressList_getPatientAddressList_addressList;
export interface DiagnosticLocationProps {
  addressList: any;
  goBack: () => void;
  onPressEditAddress: (address: addressType) => void;
  onPressSelectAddress: (address: addressType) => void;
}

export const DiagnosticLocation: React.FC<DiagnosticLocationProps> = (props) => {
  const { addressList, onPressSelectAddress } = props;
  const { cartItems, modifiedOrderItemIds, modifiedOrder } = useDiagnosticsCart();
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [searchState, setSearchState] = useState<'load' | 'success' | 'fail' | undefined>();
  const [searchQuery, setSearchQuery] = useState({});

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

  //google api to give autosearch results
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
                  setLocationSuggestion(address);
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

  const renderLocationHeader = () => {
    return (
      <Header
        container={{
          borderBottomWidth: 0,
        }}
        leftIcon={'backArrow'}
        title={'SAMPLE COLLECTION LOCATION'}
        titleStyle={{ alignItems: 'center' }}
        onPressLeftIcon={() => props.goBack()}
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
            setSearchFocused(false);
            //   setMedicineList([]); //set google api suggestions to false
            setSearchText('');
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
          placeholder="Search for your location"
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

  //1. highlight search bar on focus -> done (remove the highlight when clicked outside the dabbad)
  //2. change search icon
  //3. increase height + decrease font size

  const renderCurrentLocation = () => {
    return (
      <View style={styles.currentLocationContainer}>
        <TouchableOpacity
          style={styles.currentLocationTouch}
          onPress={() => console.log('po')}
          // disabled={isCurrentLocationDisable}
        >
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
      <View style={styles.permissionOuterView}>
        <View style={styles.premissionLeftView}>
          <View style={styles.flexRowCenter}>
            <LocationIcon style={{ tintColor: 'white' }} />
            <Text style={styles.permissionText}>Location Permission is Denied</Text>
          </View>
          <TouchableOpacity
            style={styles.permissionOptionTouch}
            onPress={() => console.log('perform permsio')}
          >
            <Text style={styles.permissionOptionText}>GRANT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSeparatorView = () => {
    return <View style={styles.separatorView} />;
  };

  const renderSavedAddressesView = () => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <Text
          style={{ ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.5, 16), marginLeft: 4 }}
        >
          {nameFormater(string.diagnosticsLocation.savedAddressText, 'upper')}
        </Text>
        {renderSavedAddresses()}
      </View>
    );
  };

  const renderSavedAddresses = () => {
    return (
      <View style={{ flexGrow: 1, marginVertical: 16 }}>
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
      <TouchableOpacity activeOpacity={1} onPress={() => console.log('pressed location')}>
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

  return (
    <View>
      {renderLocationHeader()}
      {renderSearchBar()}
      {renderCurrentLocation()}
      {renderPermissionView()}
      {renderSeparatorView()}
      {isSearchFocused ? null : renderSavedAddressesView()}
      {!!searchText &&
        searchText?.length > 2 &&
        locationSuggestion?.length > 0 &&
        renderSearchSuggestions()}
      {searchState == 'success' &&
        searchText.length > 2 &&
        locationSuggestion.length == 0 &&
        renderNoSuggestionView()}
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
  separatorView: { marginTop: 4, height: 12, backgroundColor: '#F7F8F5', marginBottom: 16 },
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
    backgroundColor: 'white',
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
});
