import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { AddIcon, RemoveIconOrange } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { isEmptyObject, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Header } from '../../ui/Header';
import { SearchInput } from '../../ui/SearchInput';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import string from '@aph/mobile-patients/src/strings/strings.json';
const icon_gps = require('@aph/mobile-patients/src/components/ui/icons/ic_gps_fixed.webp');

export interface DiagnosticLocationProps {
  goBack: () => void;
}

export const DiagnosticLocation: React.FC<DiagnosticLocationProps> = (props) => {
  const { cartItems, modifiedOrderItemIds, modifiedOrder } = useDiagnosticsCart();
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState<string>('');

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
          // onSubmitEditing={() => {
          //   if (searchText.length > 3) {
          //     const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
          //       keyword: searchText,
          //       Source: 'Pharmacy Home',
          //     };
          //     postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);
          //     props.navigation.navigate(AppRoutes.MedicineListing, { searchText });
          //   }
          // }}
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
            //   if (isValidSearch(value) && value.length >= 3) {
            //     setMedicineSearchLoading(true);
            //   }
            setSearchText(value);
          }}
          placeholder="Search for your location"
          // _itemsNotFound={itemsNotFound}
          inputStyle={{
            height: 48,
            paddingVertical: 8,
            fontSize: 15,
            lineHeight: 22,
            fontWeight: '600',
          }}
          inputContainerStyle={{
            borderColor: isSearchFocused ? colors.APP_GREEN : 'rgba(0, 0, 0, 0.1)',
            borderWidth: isSearchFocused ? 1.5 : 1,
          }}
          containerStyle={{ marginBottom: 15, marginTop: 5 }}
          _rightIconStyle={{ height: 27, width: 27, resizeMode: 'contain' }}
        />
      </>
    );
  };

  //1. highlight search bar on focus -> done (remove the highlight when clicked outside the dabbad)
  //2. change search icon
  //3. increase height + decrease font size

  const renderCurrentLocation = () => {
    return (
      <TouchableOpacity
        style={styles.currentLocationContainer}
        onPress={() => console.log('po')}
        // disabled={isCurrentLocationDisable}
      >
        <View style={{ flexDirection: 'row' }}>
          <Image source={icon_gps} style={[styles.currentLocationIcon]} />
          <View style={{ marginHorizontal: '4%' }}>
            <Text style={[styles.currentLocationHeadingText]}>
              {string.addressSelection.USE_CURRENT_LOCATION_TEXT}
            </Text>
            <Text style={[styles.currentLocationSubHeadingText]}>
              {string.addressSelection.USE_GPS_TEXT}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {renderLocationHeader()}
      {renderSearchBar()}
      {renderCurrentLocation()}
    </View>
  );
};

const styles = StyleSheet.create({
  currentLocationContainer: { backgroundColor: 'pink', width: '40%' },
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
  currentLocationIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    alignSelf: 'center',
    justifyContent: 'center',
    tintColor: theme.colors.APP_YELLOW_COLOR,
  },
});
