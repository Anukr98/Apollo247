import { isValidSearch } from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { SearchAreaIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';

const {
  SHERPA_BLUE,
  APP_YELLOW,
  CARD_BG,
  WHITE,
  APP_GREEN,
  searchAreaPlaceholderTextColor,
  CLEAR,
} = theme.colors;

interface SelectAreaOverlayProps {
  onPressChangeAddress: () => void;
  onPressDone: (selectedPatient: any) => void;
  onPressClose: () => void;
  addressText?: string;
}

export const SelectAreaOverlay: React.FC<SelectAreaOverlayProps> = (props) => {
  const {
    onPressDone,
    onPressChangeAddress: onPressAddNewProfile,
    onPressClose,
    addressText,
  } = props;
  const { areaSelected, diagnosticAreas } = useDiagnosticsCart();
  const localAreas = diagnosticAreas.map((item: any) => ({ key: item.id, value: item.area }));
  const [searchAreaResult, setSearchAreaResult] = useState<any>([]);

  const { currentPatient } = useAllCurrentPatients();
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [isSearchFocus, SetIsSearchFocus] = useState(false);
  const _searchInputRef = useRef(null);
  const sampleCollectionText = `Sample Collection for ${currentPatient?.firstName ||
    currentPatient?.lastName ||
    ''}`;
  const address_text = addressText;

  const renderPatientListItem = ({ index, item }) => {
    const patientName = item?.value || '';
    const showGreenBg = selectedArea?.key
      ? selectedArea?.key === item?.key
      : (areaSelected as any)?.key === item?.key;
    const itemViewStyle = [
      styles.areaItemViewStyle,
      index === 0 && { marginTop: 24 },
      showGreenBg && { backgroundColor: APP_GREEN },
      index === localAreas?.length - 1 && { marginBottom: 20 },
    ];
    return item?.id === '+ADD MEMBER' ? null : (
      <TouchableOpacity
        activeOpacity={1}
        style={itemViewStyle}
        onPress={() => setSelectedArea(item)}
      >
        <Text style={[styles.areaNameTextStyle, showGreenBg && { color: WHITE }]}>
          {patientName}
        </Text>
      </TouchableOpacity>
    );
  };

  const onSearchArea = () => {
    const _searchAreaResult = localAreas?.filter((item) => {
      const itemData = `${item?.value?.toUpperCase()}`;
      const textData = searchText?.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setSearchAreaResult(_searchAreaResult);
  };

  const onSearchTextChange = (value: string) => {
    SetIsSearchFocus(true);
    if (isValidSearch(value)) {
      setSearchText(value);
      if (!(value && value.length > 2)) {
        setSearchAreaResult([]);
        return;
      }
      const search = _.debounce(onSearchArea, 300);
      search();
    }
  };

  return (
    <Overlay
      isVisible
      onRequestClose={onPressClose}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onPressClose} />
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            <View style={styles.mainViewStyle}>
              <Text style={styles.sampleCollectionTextStyle}>{sampleCollectionText}</Text>
              <View style={styles.sampleCollectionViewStyle}>
                <Text style={styles.addressTextStyle}>{address_text}</Text>
                <Text style={styles.addressChangeTextStyle} onPress={onPressAddNewProfile}>
                  {string.diagnostics.changeAddressText}
                </Text>
              </View>
              <Text style={styles.sampleCollectionTextStyle}>
                {string.diagnostics.selectAreaLocalityText}
              </Text>
              <View style={styles.patientListCardStyle}>
                <View style={styles.searchBarViewStyle}>
                  <SearchAreaIcon />
                  <TextInput
                    placeholder={'Search Area'}
                    autoCapitalize={'none'}
                    style={styles.textInputStyle}
                    selectionColor={theme.colors.TURQUOISE_LIGHT_BLUE}
                    numberOfLines={1}
                    ref={_searchInputRef}
                    onFocus={() => SetIsSearchFocus(true)}
                    value={searchText}
                    placeholderTextColor={searchAreaPlaceholderTextColor}
                    underlineColorAndroid={'transparent'}
                    onChangeText={(value) => onSearchTextChange(value)}
                  />
                </View>
                <FlatList
                  bounces={false}
                  keyExtractor={(_, index) => index.toString()}
                  data={searchText?.length > 2 ? searchAreaResult : localAreas || []}
                  renderItem={renderPatientListItem}
                />
              </View>
              <Button
                title={'DONE'}
                onPress={() => onPressDone(selectedArea || areaSelected)}
                style={styles.doneButtonViewStyle}
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Overlay>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: CLEAR,
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: CLEAR,
  },
  mainViewStyle: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  sampleCollectionViewStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
    alignItems: 'center',
  },
  sampleCollectionTextStyle: {
    ...text('M', 17, SHERPA_BLUE, 1, 24),
  },
  addressChangeTextStyle: {
    flex: 1,
    textAlign: 'right',
    ...text('B', 13, APP_YELLOW, 1, 24),
  },
  addressTextStyle: {
    flex: 1,
    ...text('R', 12, SHERPA_BLUE, 0.8, 18),
  },
  patientListCardStyle: {
    ...cardViewStyle,
    height: 300,
    backgroundColor: CARD_BG,
    marginTop: 12,
    marginBottom: 35,
  },
  doneButtonViewStyle: { width: '90%', alignSelf: 'center', marginBottom: 16 },
  areaItemViewStyle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...cardViewStyle,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  areaNameTextStyle: {
    ...text('M', 16, APP_GREEN, 1, 20.8, -0.36),
  },
  genderAgeTextStyle: {
    ...text('M', 12, APP_GREEN, 1, 15.6, -0.36),
  },
  textInputStyle: {
    ...text('R', 14, SHERPA_BLUE, 1, 18),
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 1,
  },
  searchBarViewStyle: {
    ...cardViewStyle,
    backgroundColor: WHITE,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
});
