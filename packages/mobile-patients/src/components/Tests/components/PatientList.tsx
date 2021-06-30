import {
  getAge,
  nameFormater,
  checkPatientAge,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Check,
  UnCheck,
  WhiteChevronRightIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { DiagnosticsCartItem } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { diagnosticsDisplayPrice } from '@aph/mobile-patients/src/utils/commonUtils';

const { SHERPA_BLUE, WHITE, APP_GREEN } = theme.colors;

interface PatientListProps {
  itemsInCart: DiagnosticsCartItem[];
  isCircleSubscribed: boolean;
  patientSelected: any;
  onPressSelectedPatient: (item: any) => void;
}

export const PatientList: React.FC<PatientListProps> = (props) => {
  const { isCircleSubscribed, onPressSelectedPatient, patientSelected } = props;
  const { allCurrentPatients } = useAllCurrentPatients();
  const patientListToShow = allCurrentPatients?.filter(
    (item: any) => !!item?.id && item?.id != '+ADD MEMBER'
  );

  const [showSelectedPatient, setShowSelectedPatient] = useState<any>(patientSelected);

  function _setSelectedPatient(item: any) {
    setShowSelectedPatient(item);
    onPressSelectedPatient(item);
  }

  const renderPatientListItem = (item: any, index: number) => {
    const patientName = `${item?.firstName || ''} ${item?.lastName || ''}`;
    const genderAgeText = `${item?.gender || ''}, ${
      item?.dateOfBirth ? getAge(item?.dateOfBirth) || '' : ''
    }`;
    const patientSalutation = !!item?.gender
      ? item?.gender === Gender.FEMALE
        ? 'Ms.'
        : item?.gender === Gender.MALE
        ? 'Mr.'
        : ''
      : '';
    const showGreenBg = showSelectedPatient?.id === item?.id;

    function _selectPatient(patient: any) {
      const isInvalidUser = checkPatientAge(patient);
      if (isInvalidUser) {
        _setSelectedPatient?.(null);
      } else {
        _setSelectedPatient?.(item);
      }
    }

    const itemViewStyle = [
      styles.patientItemViewStyle,
      index === 0 && { marginTop: 12 },
      showGreenBg && { backgroundColor: APP_GREEN },
    ];
    return (
      <View style={{ flex: 1, marginBottom: index === patientListToShow?.length - 1 ? 16 : 0 }}>
        <TouchableOpacity
          activeOpacity={1}
          style={itemViewStyle}
          onPress={() => _selectPatient(item)}
        >
          <Text style={[styles.patientNameTextStyle, showGreenBg && { color: WHITE }]}>
            {patientSalutation} {patientName}
          </Text>
          <Text style={[styles.genderAgeTextStyle, showGreenBg && { color: WHITE }]}>
            {genderAgeText}
          </Text>
          <WhiteChevronRightIcon
            style={[
              styles.arrowStyle,
              showGreenBg && { tintColor: WHITE, transform: [{ rotate: '270deg' }] },
            ]}
          />
        </TouchableOpacity>
        {renderCartItems(item)}
      </View>
    );
  };

  //add a logic to unselect & select multiple items. push in array wrt to patient id
  const [itemSelected, setItemSelected] = useState<boolean>(true);

  function _selectCartItem() {
    // console.log('select item');
    // setItemSelected(!itemSelected);
  }

  const renderCartItemList = (test: DiagnosticsCartItem, index: number) => {
    const itemName = test?.name;
    const priceToShow = diagnosticsDisplayPrice(test, isCircleSubscribed)?.priceToShow;
    return (
      <TouchableOpacity
        onPress={() => _selectCartItem()}
        style={[
          styles.patientSelectTouch,
          {
            backgroundColor: itemSelected ? '#F5FFFD' : colors.WHITE,
          },
        ]}
      >
        <View style={{ width: '70%' }}>
          <Text numberOfLines={1} style={styles.itemNameText}>
            {nameFormater(itemName, 'title')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.itemNameText, { marginRight: 8 }]}>
            {string.common.Rs}
            {priceToShow}
          </Text>
          {itemSelected ? <Check /> : <UnCheck />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => {
    return <Spearator />;
  };

  const renderFooterComponent = () => {
    return <View style={{ height: 40 }} />;
  };

  const renderCartItems = (item: any) => {
    return (
      <View>
        {patientSelected?.id === item?.id ? (
          <View>
            <FlatList
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.cartItemsFlatList}
              keyExtractor={keyExtractor}
              data={props.itemsInCart || []}
              renderItem={({ item, index }) => renderCartItemList(item, index)}
              ItemSeparatorComponent={renderSeparator}
            />
          </View>
        ) : null}
      </View>
    );
  };

  const keyExtractor = useCallback((_, index: number) => `${index}`, []);

  const keyExtractor1 = useCallback((_, index: number) => `${index}`, []);

  return (
    <View style={styles.mainViewStyle}>
      <FlatList
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ marginBottom: 20 }}
        keyExtractor={keyExtractor1}
        data={patientListToShow || []}
        renderItem={({ item, index }) => renderPatientListItem(item, index)}
        ListFooterComponent={renderFooterComponent}
      />
    </View>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  mainViewStyle: {
    flexGrow: 1,
    marginVertical: 16,
  },
  patientItemViewStyle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...cardViewStyle,
    padding: 12,
    marginTop: 10,
    minHeight: 45,
  },
  patientNameTextStyle: {
    ...text('SB', 14, SHERPA_BLUE, 1, 19, 0),
    width: '70%',
  },
  genderAgeTextStyle: {
    ...text('M', 12, SHERPA_BLUE, 1, 15.6, -0.36),
  },
  arrowStyle: {
    tintColor: SHERPA_BLUE,
    height: 17,
    width: 17,
    resizeMode: 'contain',
    marginRight: 10,
  },
  itemNameText: {
    ...text('M', 14.5, '#313131', 1, 19.1),
  },
  cartItemsFlatList: {
    borderColor: 'rgba(2,71,91,0.2)',
    borderWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.WHITE,
    marginBottom: 10,
    borderStyle: 'solid',
  },
  patientSelectTouch: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
});
