import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextStyle,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  Platform,
  Text,
  Image,
  Alert,
} from 'react-native';
import { isValidSearch } from '@aph/mobile-patients/src/helpers/helperFunctions';
import Menu, { MenuItem } from 'react-native-material-menu';
import { WhiteSearchIcon } from './Icons';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import { Spearator } from './BasicComponents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import _ from 'lodash';
import { CheckUnselectedIcon, CheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';

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
  hospitalItemContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  hospitalName: {
    ...theme.viewStyles.text('R', 13, '#02475B'),
  },
  hospitalLocality: {
    ...theme.viewStyles.text('R', 12, '#000', 0.5),
  },
  hospitalCollectionLabel: {
    ...theme.viewStyles.text('M', 10, theme.colors.SKY_BLUE),
    marginHorizontal: 20,
  },
  noHospitalSitesLabel: {
    ...theme.viewStyles.text('M', 10, theme.colors.APP_RED),
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputStyle: {
    ...theme.viewStyles.text('M', 14, '#0087BA'),
  },
  checkboxViewStyle: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('R', 12, '#02475b'),
    marginLeft: 8,
  },
  siteFilterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
  },
  filterCheckbox: { height: 18, width: 18 },
});

export interface HospitalChooserMaterialMenuProps {
  menuContainerStyle?: StyleProp<ViewStyle> | undefined;
  showMenu?: boolean;
  menuHidden?: () => void;
  onHospitalChoosed?: (any) => void;
  dataList: [];
}

export const HospitalChooserMaterialMenu: React.FC<HospitalChooserMaterialMenuProps> = (props) => {
  const menuRef = React.useRef<any>(null);
  const [isSearchFocused, setSearchFocused] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isSearching, setisSearching] = useState<boolean>(false);
  const [siteList, setSiteList] = useState(props.dataList);
  const [isCorporateChecked, setCorporatChecked] = useState<boolean>(true);
  const [isPayBySelfChecked, setPayBySelfChecked] = useState<boolean>(false);

  useEffect(() => {
    if (props.showMenu) {
      showMenu();
    }
  }, [props.showMenu]);

  useEffect(() => {
    setSiteList(props.dataList);
  }, [props.dataList]);

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
            const search = _.debounce(searchHospitalLocaly, 300);
            search(value);
            if (value.length > 2) {
              setSearchFocused(false);
            } else {
              setSearchFocused(true);
            }
          }
        }}
        _isSearchFocused={true}
        onBlur={() => {
          setSearchFocused(false);
          setSearchText('');
        }}
        placeholder="Search for hospital or clinic"
        _rigthIconView={rigthIconView}
        _itemsNotFound={false}
      />
    );
  };

  const searchHospitalLocaly = (searchTextString: string = searchText) => {
    if (searchTextString.length > 1) {
      const filteredData = props.dataList.filter((item: any) => {
        let searchDataItem = item;
        return searchDataItem.name.toLowerCase().includes(searchTextString.toLowerCase())
          ? true
          : false;
      });

      if (filteredData.length !== 0) {
        setSiteList(filteredData);
      }
    } else {
      setSiteList(props.dataList);
    }
  };

  const filterByCorporate = (forCorporate: boolean) => {
    if (forCorporate == false) {
      setSiteList(props.dataList);
      return;
    }
    const filteredData = props.dataList.filter((item: any) => {
      let searchDataItem = item;
      return searchDataItem.is_corporate_site;
    });

    setSiteList(filteredData);
  };

  const filterByPayBySelf = (payBySelf: boolean) => {
    if (payBySelf == false) {
      setSiteList(props.dataList);
      return;
    }

    const filteredData = props.dataList.filter((item: any) => {
      let searchDataItem = item;
      return !searchDataItem?.is_corporate_site;
    });

    setSiteList(filteredData);
  };

  const renderHopitalListItem = () => {
    return siteList.map(function(item, i) {
      return (
        <>
          <TouchableOpacity
            key={i}
            style={styles.hospitalItemContainer}
            onPress={() => {
              props.onHospitalChoosed(item);
              hideMenu();
            }}
          >
            <Text style={styles.hospitalName}>{item.name}</Text>
            <Text style={styles.hospitalLocality}>{item.locality}</Text>
          </TouchableOpacity>
          <Spearator />
        </>
      );
    });
  };

  const renderFilterStrip = () => {
    return (
      <View style={styles.siteFilterContainer}>
        <TouchableOpacity
          onPress={() => {
            setPayBySelfChecked(false);
            if (isCorporateChecked == false) {
              setCorporatChecked(true);
              filterByCorporate(true);
            } else {
              setCorporatChecked(false);
              filterByCorporate(false);
            }
          }}
          activeOpacity={1}
          style={styles.checkboxViewStyle}
        >
          {isCorporateChecked ? (
            <CheckedIcon style={styles.filterCheckbox} />
          ) : (
            <CheckUnselectedIcon style={styles.filterCheckbox} />
          )}
          <Text style={styles.checkboxTextStyle}>Corporate Sponsored </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCorporatChecked(false);
            if (isPayBySelfChecked == false) {
              setPayBySelfChecked(true);
              filterByPayBySelf(true);
            } else {
              setPayBySelfChecked(false);
              filterByPayBySelf(false);
            }
          }}
          activeOpacity={1}
          style={[styles.checkboxViewStyle, { marginLeft: 15 }]}
        >
          {isPayBySelfChecked ? (
            <CheckedIcon style={styles.filterCheckbox} />
          ) : (
            <CheckUnselectedIcon style={styles.filterCheckbox} />
          )}
          <Text style={styles.checkboxTextStyle}>Pay by Self </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDataList = () => {
    return (
      <View>
        {siteList != null && siteList.length > 0 ? (
          renderHopitalListItem()
        ) : (
          <Text style={styles.noHospitalSitesLabel}>{string.vaccineBooking.no_sites_in_city}</Text>
        )}
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
        <ScrollView>
          <>
            {renderFilterStrip()}
            {renderDataList()}
          </>
        </ScrollView>
      )}
    </Menu>
  );
};
