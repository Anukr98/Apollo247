import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Input, InputProps } from 'react-native-elements';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextStyle,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  Platform,
  Text,
  Image,
  Alert,
} from 'react-native';

import {
  dataSavedUserID,
  g,
  getNetStatus,
  isValidSearch,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import Menu, { MenuItem } from 'react-native-material-menu';
import { WhiteSearchIcon } from './Icons';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import { Spearator } from './BasicComponents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Mutation } from 'react-apollo';
import { useApolloClient } from 'react-apollo-hooks';
import { getDoctorList } from '@aph/mobile-patients/src/graphql/types/getDoctorList';
import {
  GET_ALL_SPECIALTIES,
  GET_PATIENT_PAST_SEARCHES,
  SAVE_SEARCH,
  GET_DOCTOR_LIST,
  GET_PATIENT_ALL_CONSULTED_DOCTORS,
} from '@aph/mobile-patients/src/graphql/profiles';
import _ from 'lodash';
var allSettled = require('promise.allsettled');

const styles = StyleSheet.create({
  menuContainer: {
    width: '80%',
    marginHorizontal: -10,
    borderRadius: 10,
    maxHeight: 300,
    marginTop: 50,
    flexDirection: 'column',
    ...theme.viewStyles.shadowStyle,
    alignItems: 'center',
  },

  inputContainerStyle: {
    borderColor: '#fff',
    ...theme.fonts.IBMPlexSansMedium(18),
    borderRadius: 5,
    backgroundColor: '#f7f8f5',
    color: theme.colors.SHERPA_BLUE,
    marginHorizontal: 10,
    paddingHorizontal: 12,
  },
  inputStyle: {
    ...theme.viewStyles.text('M', 14, '#0087BA'),
  },
  hospitalItemContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  cityName: {
    ...theme.viewStyles.text('R', 13, '#02475B'),
  },
  stateLabel: {
    ...theme.viewStyles.text('M', 10, theme.colors.SKY_BLUE),
    marginHorizontal: 20,
  },
});

export interface HospitalCityChooserProps {
  menuContainerStyle?: StyleProp<ViewStyle> | undefined;
  showMenu?: boolean;
  menuHidden?: () => void;
  onCityChoosed?: (any) => void;
  dataList: string[];
}

export const HospitalCityChooser: React.FC<HospitalCityChooserProps> = (props) => {
  const menuRef = React.useRef<any>(null);
  const client = useApolloClient();
  const [searchText, setSearchText] = useState<string>('');
  const [isSearching, setisSearching] = useState<boolean>(false);
  const [cityList, setCityList] = useState(props.dataList);
  const [isSearchFocused, setSearchFocused] = useState<boolean>(false);

  useEffect(() => {
    if (props.showMenu) {
      showMenu();
    }
  }, [props.showMenu]);

  const hideMenu = () => {
    menuRef.current.hide();
  };

  const showMenu = () => {
    menuRef.current.show();
  };
  const rigthIconView = <WhiteSearchIcon />;

  const renderSearchInput = () => {
    return (
      <SearchInput
        inputContainerStyle={styles.inputContainerStyle}
        inputStyle={styles.inputStyle}
        onChangeText={(value) => {
          if (isValidSearch(value)) {
            setSearchText(value);

            const search = _.debounce(searchCityLocaly, 300);
            search(value);
            if (value.length > 2) {
              setSearchFocused(false);
            } else {
              setSearchFocused(true);
            }
          }
        }}
        onBlur={() => {
          setSearchFocused(false);
          setSearchText('');
        }}
        _isSearchFocused={isSearchFocused}
        placeholder="Search city"
        _rigthIconView={rigthIconView}
        _itemsNotFound={false}
      />
    );
  };

  const searchCityLocaly = (searchTextString: string = searchText) => {
    if (searchTextString.length > 1) {
      const filteredData = props.dataList.filter((item: any) => {
        let searchDataItem = item;
        return searchDataItem.toLowerCase().includes(searchTextString.toLowerCase());
      });

      if (filteredData.length !== 0) {
        setCityList(filteredData);
      }
    } else {
      setCityList(props.dataList);
    }
  };

  const renderCityListItem = () => {
    return cityList.map(function(item, i) {
      return (
        <>
          <TouchableOpacity
            key={i}
            style={styles.hospitalItemContainer}
            onPress={() => {
              props.onCityChoosed(item);
              hideMenu();
            }}
          >
            <Text style={styles.cityName}>{item}</Text>
          </TouchableOpacity>
          <Spearator />
        </>
      );
    });
  };

  const renderCityList = () => {
    return (
      <View>
        {/* <Text style={styles.stateLabel}>State</Text> */}
        {renderCityListItem()}
        {/* <Text style={styles.stateLabel}>City Name</Text>
        {renderCityListItem()} */}
      </View>
    );
  };

  return (
    <Menu
      ref={menuRef}
      button={
        <TouchableOpacity activeOpacity={1} onPress={showMenu}>
          {props.children}
        </TouchableOpacity>
      }
      style={[styles.menuContainer, props.menuContainerStyle]}
      onHidden={() => {
        props.menuHidden && props.menuHidden();
      }}
    >
      {renderSearchInput()}
      {isSearching ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator animating={true} size="large" color="green" />
        </View>
      ) : (
        <ScrollView>{renderCityList()}</ScrollView>
      )}
    </Menu>
  );
};
