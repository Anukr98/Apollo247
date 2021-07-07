import {
  nameFormater,
  checkPatientAge,
  extractPatientDetails,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AddPatientCircleIcon,
  Check,
  MinusPatientCircleIcon,
  UnCheck,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { DiagnosticsCartItem } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { diagnosticsDisplayPrice } from '@aph/mobile-patients/src/utils/commonUtils';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

const { SHERPA_BLUE, WHITE, APP_GREEN } = theme.colors;

interface PatientListProps {
  itemsInCart: DiagnosticsCartItem[] | any;
  isCircleSubscribed: boolean;
  patientSelected: any;
  patientListToShow: any;
  onPressSelectedPatient?: (item: any) => void;
  isFocus: boolean;
}

export const PatientList: React.FC<PatientListProps> = (props) => {
  const { isCircleSubscribed, patientListToShow, isFocus } = props;
  const {
    patientCartItems,
    cartItems,
    removePatientCartItem,
    addPatientCartItem,
    setPatientCartItems,
  } = useDiagnosticsCart();

  const [itemsSelected, setItemsSelected] = useState(patientCartItems);
  const keyExtractor = useCallback((_, index: number) => `${index}`, []);
  const keyExtractor1 = useCallback((_, index: number) => `${index}`, []);

  // useEffect(() => {
  //   console.log('ahjahj');
  //   console.log(isFocus);
  //   console.log({ cartItems });
  //   if (isFocus && cartItems?.length > 0) {
  //     var itemsNotPresent = [] as any;
  //     const ss = patientCartItems?.map((pItem) => {
  //       const uu = cartItems?.map((cItem) => {
  //         itemsNotPresent = pItem?.cartItems?.filter((item) => item?.id != cItem?.id);
  //         console.log({ itemsNotPresent });
  //         return itemsNotPresent;
  //       });
  //       const pp = [uu, ...pItem?.cartItems];
  //       console.log({ pp });
  //       var obj = {
  //         patientId: pItem?.patientId,
  //         cartItems: [itemsNotPresent, ...pItem?.cartItems],
  //       };
  //       return obj;
  //     });
  //     console.log({ ss });
  //     setPatientCartItems?.(ss);
  //   }
  // }, [cartItems, isFocus]);

  const renderFooterComponent = () => {
    return <View style={{ height: 40 }} />;
  };

  const renderSeparator = () => {
    return <Spearator />;
  };

  function _onPressPatient(patient: any, index: number) {
    const isInvalidUser = checkPatientAge(patient);
    if (isInvalidUser) {
      _setSelectedPatient?.(null, index);
    } else {
      _setSelectedPatient?.(patient, index);
    }
  }

  function _setSelectedPatient(patientDetails: any, ind: number) {
    let arr = patientListToShow?.map((newItem: any, index: number) => {
      if (ind == index && patientDetails != null) {
        newItem.isPatientSelected = !newItem?.isPatientSelected;
      }
      return { ...newItem };
    });

    //find the selectedItem
    const findSelectedItem = arr?.find((item: any) => item?.id == patientDetails?.id);
    if (findSelectedItem?.isPatientSelected) {
      //check here, if item is already selected => unselect
      let newCartItems = [cartItems, { isSelected: true }];
      addPatientCartItem?.(patientDetails?.id, newCartItems);
    } else {
      removePatientCartItem?.(patientDetails?.id);
    }
  }

  function _onPressSelectTest(selectedTest: any, ind: number, selectedPatientDetails: any) {
    console.log({ selectedTest });
    const selectedPatientIndex = patientCartItems?.findIndex(
      (item) => item?.patientId == selectedPatientDetails?.patientId
    );

    const getPatientDetailsCopy = JSON.parse(JSON.stringify(patientCartItems)); //created a deep copy

    const arr = getPatientDetailsCopy?.[selectedPatientIndex]?.cartItems?.map(
      (newItem: any, index: number) => {
        if (ind == index) {
          newItem.isSelected = !newItem?.isSelected;
        }
        return { ...newItem };
      }
    );
    console.log({ arr });
    addPatientCartItem?.(selectedPatientDetails?.patientId, arr!); //just change the flag here.
    setItemsSelected(arr!);
  }

  const renderCartItemList = (test: any, index: number, selectedPatientDetails: any) => {
    const itemName = test?.name;
    const priceToShow = diagnosticsDisplayPrice(test, isCircleSubscribed)?.priceToShow;
    return (
      <TouchableOpacity
        onPress={() => _onPressSelectTest(test, index, selectedPatientDetails)}
        style={[
          styles.patientSelectTouch,
          {
            backgroundColor: !!test?.isSelected && test?.isSelected ? '#F5FFFD' : colors.WHITE,
          },
        ]}
      >
        <View style={{ width: '70%' }}>
          <Text numberOfLines={1} style={styles.itemNameText}>
            {nameFormater(itemName, 'default')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.itemNameText, { marginRight: 8 }]}>
            {string.common.Rs}
            {priceToShow}
          </Text>
          {!!test?.isSelected && test?.isSelected ? (
            <Check style={styles.checkBoxIcon} />
          ) : (
            <UnCheck style={styles.checkBoxIcon} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCartItems = (patientDetails: any) => {
    const findPatientCartMapping =
      !!patientCartItems &&
      patientCartItems?.find((item) => item?.patientId === patientDetails?.id);

    return (
      <View>
        {!!findPatientCartMapping ? (
          <View style={styles.cartItemsFlatList}>
            <FlatList
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyExtractor={keyExtractor}
              data={findPatientCartMapping?.cartItems || []}
              renderItem={({ item, index }) =>
                renderCartItemList(item, index, findPatientCartMapping)
              }
              ItemSeparatorComponent={renderSeparator}
            />
          </View>
        ) : null}
      </View>
    );
  };

  const renderPatientListItem = (item: any, index: number) => {
    const { patientName, genderAgeText, patientSalutation } = extractPatientDetails(item);
    const isPresent =
      !!patientCartItems && patientCartItems?.find((cart) => cart?.patientId == item?.id);
    const showGreenBg = isPresent;

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
          onPress={() => _onPressPatient(item, index)}
        >
          <Text style={[styles.patientNameTextStyle, showGreenBg && { color: WHITE }]}>
            {patientSalutation} {patientName}
          </Text>
          <Text style={[styles.genderAgeTextStyle, showGreenBg && { color: WHITE }]}>
            {genderAgeText}
          </Text>
          <View style={styles.arrowIconView}>
            {!showGreenBg ? (
              <AddPatientCircleIcon style={[styles.arrowStyle]} />
            ) : (
              <MinusPatientCircleIcon style={[styles.arrowStyle, { tintColor: WHITE }]} />
            )}
          </View>
        </TouchableOpacity>
        {renderCartItems(item)}
      </View>
    );
  };

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
    marginTop: 16,
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
    width: 20,
    resizeMode: 'contain',
  },
  itemNameText: {
    ...text('M', 14.5, '#313131', 1, 19.1),
  },
  cartItemsFlatList: {
    borderColor: 'rgba(2,71,91,0.2)',
    borderWidth: 1.5,
    marginLeft: 4,
    marginRight: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.WHITE,
    borderStyle: 'solid',
  },
  patientSelectTouch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  checkBoxIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  arrowIconView: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
