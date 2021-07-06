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
  onPressSelectedPatient?: (item: any) => void;
}

export const PatientList: React.FC<PatientListProps> = (props) => {
  const { isCircleSubscribed } = props;
  const { allCurrentPatients } = useAllCurrentPatients();
  const {
    patientCartItems,
    cartItems,
    setPatientCartItems,
    setDiagnosticSlot,
    removePatientCartItem,
    addPatientCartItem,
  } = useDiagnosticsCart();

  const patientListToShow = allCurrentPatients?.filter(
    (item: any) => !!item?.id && item?.id != '+ADD MEMBER'
  );

  const [showSelectedPatients, setShowSelectedPatients] = useState(patientListToShow);
  const [itemsSelected, setItemsSelected] = useState(patientCartItems);
  const keyExtractor = useCallback((_, index: number) => `${index}`, []);
  const keyExtractor1 = useCallback((_, index: number) => `${index}`, []);

  const renderFooterComponent = () => {
    return <View style={{ height: 40 }} />;
  };

  const renderSeparator = () => {
    return <Spearator />;
  };

  const addItems = (patientId: string, listofItems: DiagnosticsCartItem[]) => {
    console.log({ patientId });
    const findPatient =
      !!patientCartItems &&
      patientCartItems?.find(
        (patient: DiagnosticPatientCartItem) => patient?.patientId === patientId
      );
    console.log({ findPatient });
    const findPatientIndex =
      !!patientCartItems &&
      patientCartItems?.findIndex(
        (patient: DiagnosticPatientCartItem) => patient?.patientId === patientId
      );
    console.log({ findPatientIndex });

    console.log({ listofItems });
    //if already exists
    if (!!findPatient) {
      const getSelectedCartItemsForPatient = findPatient?.cartItems?.filter(
        (item) => item?.isSelected
      );
      console.log({ getSelectedCartItemsForPatient });
      //unselect the patient.
      if (getSelectedCartItemsForPatient?.length == 0) {
        removeItems(findPatient?.patientId);
        console.log('skskjhks');
        //set the selectedPatientList....
      } else {
        //find the patient , and then search for the item.
        // if (
        //   patientCartItems?.[findPatientIndex]?.cartItems?.find((item) => item?.id == itemToAdd?.id)
        // ) {
        //   return;
        // }
        // const isItemPresent = findPatientIndex?.cartItems?.find(
        //   (item) => Number(item?.id) == Number(itemToAdd?.id)
        // );
        // console.log({ isItemPresent });
        console.log({ patientCartItems });
        console.log({ listofItems });

        patientCartItems[findPatientIndex].cartItems = listofItems; //just update the list with selected item attribute
        console.log({ patientCartItems });
        setPatientCartItems?.(patientCartItems);
      }
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

  function _onPressPatient(patient: any, index: number) {
    const isInvalidUser = checkPatientAge(patient);
    if (isInvalidUser) {
      _setSelectedPatient?.(null, index);
    } else {
      _setSelectedPatient?.(patient, index);
    }
  }

  function _setSelectedPatient(patientDetails: any, ind: number) {
    let arr = showSelectedPatients?.map((newItem: any, index: number) => {
      if (ind == index && patientDetails != null) {
        newItem.isPatientSelected = !newItem?.isPatientSelected;
      }
      return { ...newItem };
    });
    setShowSelectedPatients(arr); //to show the highlighted

    //find the selectedItem
    const findSelectedItem = arr?.find((item: any) => item?.id == patientDetails?.id);
    if (findSelectedItem?.isPatientSelected) {
      console.log('eyeyeyey');
      //check here, if item is already selected => unselect
      let newCartItems = [cartItems, { isSelected: true }];
      console.log({ newCartItems });
      console.log('fkjfkjfk');
      addPatientCartItem?.(patientDetails?.id, newCartItems);
    } else {
      removePatientCartItem?.(patientDetails?.id);
    }
  }

  function _onPressSelectTest(selectedTest: any, ind: number, selectedPatientDetails: any) {
    console.log('on opress test');
    console.log({ selectedTest });
    //find the item in addPatientCartItems  ~ selectedPatientDetails
    // find the selected and add it accordingly
    console.log({ selectedPatientDetails });
    const selectedPatientIndex = patientCartItems?.findIndex(
      (item) => item?.patientId == selectedPatientDetails?.patientId
    );
    const getPatientDetailsCopy = [...patientCartItems];
    console.log({ selectedPatientDetails });

    const arr = getPatientDetailsCopy?.[selectedPatientIndex]?.cartItems?.map(
      (newItem: any, index: number) => {
        console.log({ newItem });
        if (ind == index) {
          newItem.isSelected = !newItem?.isSelected;
        }
        return { ...newItem };
      }
    );
    console.log('offfff');
    console.log({ patientCartItems });
    console.log({ arr });
    addPatientCartItem?.(selectedPatientDetails?.patientId, arr!); //just change the flag here.
    setItemsSelected(arr!);
  }

  const renderCartItemList = (test: any, index: number, selectedPatientDetails: any) => {
    console.log({ test });
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

  const renderPatientListItem = (item: any, index: number) => {
    console.log('inside the patient list  itemmmm');
    console.log({ patientCartItems });
    console.log({ item });
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

    const findItem = showSelectedPatients?.find((items: any) => items?.id === item?.id);

    const showGreenBg = !!findItem && findItem?.isPatientSelected;

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
