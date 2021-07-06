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
import { DIAGNOSTICS_GROUPPLAN, Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  DiagnosticsCartItem,
  LineItems,
  PatientItems,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { diagnosticsDisplayPrice } from '@aph/mobile-patients/src/utils/commonUtils';

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
    diagPatientLineItems,
    addPatientItems,
    removePatientLineItem,
    isDiagnosticCircleSubscription,
  } = useDiagnosticsCart();

  const patientListToShow = allCurrentPatients?.filter(
    (item: any) => !!item?.id && item?.id != '+ADD MEMBER'
  );

  const array = itemsInCart?.map((item: any, index: number) => {
    item.isSelected = true;
    return { ...item };
  });

  const patientListArray = patientListToShow?.map((item: any, index: number) => {
    item.isPatientSelected = false;
    return { ...item };
  });

  const [itemsSelected, setItemsSelected] = useState(array);

  const [showSelectedPatient, setShowSelectedPatient] = useState<any>(patientListArray);

  function _setSelectedPatient(patientDetails: any, ind: number) {
    let arr = showSelectedPatient?.map((newItem: any, index: number) => {
      if (ind == index && patientDetails != null) {
        newItem.isPatientSelected = !newItem?.isPatientSelected;
      }
      return { ...newItem };
    });
    setShowSelectedPatient(arr);
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

  const isItemMappedToPatient = (patientID: string, itemId: string): any => {
    console.log({ diagPatientLineItems });
    const patientIdex = diagPatientLineItems?.find(
      (patient: PatientItems) => patient?.patientID === patientID
    );
    return patientIdex?.lineItems?.some(
      (lineItem: LineItems) => lineItem?.itemId === parseInt(itemId)
    );
  };

  const extractPriceByGroupPlan = (cartItem: DiagnosticsCartItem): LineItems => {
    const itemsPriceAndPlan: LineItems = {
      mrp: 0,
      itemId: 0,
      price: 0,
      groupPlan: DIAGNOSTICS_GROUPPLAN.ALL,
    };
    if (isDiagnosticCircleSubscription && cartItem.diagnosticPricing.isCircleDiscountGreater) {
      itemsPriceAndPlan.itemId =
        typeof cartItem.itemId == 'string' ? parseInt(cartItem.itemId) : cartItem.itemId;
      itemsPriceAndPlan.price = cartItem.diagnosticPricing.circlePrice;
      itemsPriceAndPlan.groupPlan = cartItem.diagnosticPricing.groupPlan;
      itemsPriceAndPlan.mrp = cartItem.diagnosticPricing.circleMrp;
    } else {
      itemsPriceAndPlan.itemId =
        typeof cartItem.itemId == 'string' ? parseInt(cartItem.itemId) : cartItem.itemId;
      itemsPriceAndPlan.price = cartItem.diagnosticPricing.allPrice;
      itemsPriceAndPlan.groupPlan =
        cartItem.diagnosticPricing.groupPlan === DIAGNOSTICS_GROUPPLAN.CIRCLE
          ? cartItem.diagnosticPricing.nonCirclePlan
          : cartItem.diagnosticPricing.groupPlan;
      itemsPriceAndPlan.mrp = cartItem.diagnosticPricing.allMrp;
    }
    return itemsPriceAndPlan;
  };

  function _selectCartItem(ind: number, patientId: string, test: any) {
    const pp = isItemMappedToPatient(patientId, test?.id);
    console.log({ test });
    console.log({ itemsSelected });
    console.log({ pp });
    let arr = itemsSelected?.lineItems?.map((newItem: any, index: number) => {
      if (ind == index) {
        newItem.isSelected = !newItem?.isSelected;
      }
      return { ...newItem };
    });
    setItemsSelected(arr);

    !!patientId && addPatientItems?.(patientId, test?.id, arr);
  }

  const renderCartItemList = (test: any, index: number, findItemInCart: any) => {
    console.log('po');
    const itemName = test?.name;
    const priceToShow = diagnosticsDisplayPrice(test, isCircleSubscribed)?.priceToShow;
    return (
      <TouchableOpacity
        onPress={() => _selectCartItem(index, findItemInCart?.id, test)}
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

  const renderSeparator = () => {
    return <Spearator />;
  };

  const renderFooterComponent = () => {
    return <View style={{ height: 40 }} />;
  };

  const renderCartItems = (patientDetails: any) => {
    console.log({ showSelectedPatient });
    console.log({ patientDetails });
    const findItem = showSelectedPatient?.find((items: any) => items?.id === patientDetails?.id);

    return (
      <View>
        {!!findItem && findItem?.isPatientSelected ? (
          <View>
            <FlatList
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.cartItemsFlatList}
              keyExtractor={keyExtractor}
              data={itemsSelected || []}
              renderItem={({ item, index }) => renderCartItemList(item, index, findItem)}
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
