import {
  getAge,
  nameFormater,
  checkPatientAge,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
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
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  DiagnosticPatientCartItem,
  DiagnosticsCartItem,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { diagnosticsDisplayPrice } from '@aph/mobile-patients/src/utils/commonUtils';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

const { SHERPA_BLUE, WHITE, APP_GREEN } = theme.colors;

interface PatientListProps {
  itemsInCart: DiagnosticsCartItem[] | any;
  isCircleSubscribed: boolean;
  patientSelected: any;
  onPressSelectedPatient: (item: any) => void;
}

export const PatientList: React.FC<PatientListProps> = (props) => {
  const { isCircleSubscribed, onPressSelectedPatient, patientSelected, itemsInCart } = props;
  const { allCurrentPatients } = useAllCurrentPatients();

  const {
    patientCartItems,
    addPatientCartItem,
    setPatientCartItems,
    cartItems,
    setDiagnosticSlot,
  } = useDiagnosticsCart();

  const patientListToShow = allCurrentPatients?.filter(
    (item: any) => !!item?.id && item?.id != '+ADD MEMBER'
  );

  const selectedItemsCart = [...itemsInCart];
  console.log({ selectedItemsCart });

  const array = selectedItemsCart?.map((item: any, index: number) => {
    item.isSelected = true;
    return { ...item };
  });

  console.log({ itemsInCart });
  // console.log({ array });
  const patientListArray = patientListToShow?.map((item: any, index: number) => {
    item.isPatientSelected = false;
    return { ...item };
  });

  const [itemsSelected, setItemsSelected] = useState(array);

  const [showSelectedPatient, setShowSelectedPatient] = useState<any>(patientListArray);

  console.log({ patientCartItems });

  const removeItems = (patientId: string, id?: string) => {
    const findPatient = patientCartItems?.find((item) => item?.patientId == patientId);
    if (!!findPatient) {
      if (!!id) {
        //check for the item passed
      } else {
        //direclty remove the entry
        const newCartItems = patientCartItems?.filter((item) => item?.patientId !== patientId);
        setPatientCartItems?.(newCartItems);
      }
    }
  };

  const addItems = (patientId: string, itemToAdd: DiagnosticsCartItem[]) => {
    const findPatientIndex =
      !!patientCartItems &&
      patientCartItems?.find(
        (patient: DiagnosticPatientCartItem) => patient?.patientId === patientId
      );
    console.log({ findPatientIndex });
    //if already exists
    if (!!findPatientIndex) {
      //find the patient , and then search for the item.
      // if (
      //   patientCartItems?.[findPatientIndex]?.cartItems?.find((item) => item?.id == itemToAdd?.id)
      // ) {
      //   return;
      // }
      console.log('push here..');
      // const newCartItems = [itemToAdd, ...cartItems];
      // setCartItems(newCartItems);
    } else {
      console.log({ patientId });
      console.log({ cartItems });
      console.log({ patientCartItems });
      const patientCartItemsObj: DiagnosticPatientCartItem = {
        patientId: patientId,
        cartItems: cartItems,
      };
      const newCartItems = [patientCartItemsObj, ...patientCartItems];
      setPatientCartItems?.(newCartItems);
    }

    //empty the slots and areas everytime due to dependency of api.
    setDiagnosticSlot?.(null);
  };

  function _setSelectedPatient(patientDetails: any, ind: number) {
    let arr = showSelectedPatient?.map((newItem: any, index: number) => {
      if (ind == index && patientDetails != null) {
        newItem.isPatientSelected = !newItem?.isPatientSelected;
      }
      return { ...newItem };
    });
    setShowSelectedPatient(arr); //to show the highlighted

    const findSelectedItem = arr?.find((item: any) => item?.id == patientDetails?.id);
    if (findSelectedItem?.isPatientSelected) {
      //check here, if item is already selected => unselect
      addItems(patientDetails?.id, cartItems);
    } else {
      removeItems(patientDetails?.id);
    }

    //if patient is valid
    onPressSelectedPatient(patientDetails);
  }

  const renderPatientListItem = (item: any, index: number) => {
    const patientName = `${item?.firstName || ''} ${item?.lastName || ''}`;
    const genderAgeText = `${nameFormater(item?.gender, 'title') || ''}, ${
      item?.dateOfBirth ? getAge(item?.dateOfBirth) || '' : ''
    }`;
    const patientSalutation = !!item?.gender
      ? item?.gender === Gender.FEMALE
        ? 'Ms.'
        : item?.gender === Gender.MALE
        ? 'Mr.'
        : ''
      : '';
    const findItem = showSelectedPatient?.find((items: any) => items?.id === item?.id);
    const showGreenBg = !!findItem && findItem?.isPatientSelected;

    function _selectPatient(patient: any, index: number) {
      const isInvalidUser = checkPatientAge(patient);
      if (isInvalidUser) {
        _setSelectedPatient?.(null, index);
      } else {
        _setSelectedPatient?.(item, index);
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
          onPress={() => _selectPatient(item, index)}
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

  function _selectCartItem(selectedTest: any, ind: number, selectedPatientDetails: any) {
    //find the item in addPatientCartItems  ~ selectedPatientDetails
    // find the selected and add it accordingly

    let arr = itemsSelected?.map((newItem: any, index: number) => {
      if (ind == index) {
        newItem.isSelected = !newItem?.isSelected;
      }
      return { ...newItem };
    });

    addPatientCartItem?.(selectedPatientDetails?.id, arr);
    setItemsSelected(arr);
  }

  const renderCartItemList = (test: any, index: number, selectedPatientDetails: any) => {
    console.log({ test });
    const itemName = test?.name;
    const priceToShow = diagnosticsDisplayPrice(test, isCircleSubscribed)?.priceToShow;
    return (
      <TouchableOpacity
        onPress={() => _selectCartItem(test, index, selectedPatientDetails)}
        style={[
          styles.patientSelectTouch,
          {
            backgroundColor: !!test?.isSelected && test?.isSelected ? '#F5FFFD' : colors.WHITE,
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

    console.log({ findPatientCartMapping });
    return (
      <View>
        {!!findPatientCartMapping ? (
          <View>
            <FlatList
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.cartItemsFlatList}
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

  const renderSeparator = () => {
    return <Spearator />;
  };

  const renderFooterComponent = () => {
    return <View style={{ height: 40 }} />;
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
    width: 20,
    resizeMode: 'contain',
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
