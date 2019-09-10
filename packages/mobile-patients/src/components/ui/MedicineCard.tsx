import {
  AddIcon,
  CheckedIcon,
  CheckUnselectedIcon,
  DropdownGreen,
  MedicineIcon,
  MedicineRxIcon,
  RemoveIcon,
  Minus,
  Plus,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    padding: 16,
    paddingBottom: 0,
  },
  rowSpaceBetweenView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexStyle: {
    flex: 1,
  },
  medicineTitle: {
    flex: 1,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
  },
  separator: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    height: 1,
    opacity: 0.1,
    marginBottom: 7,
    marginTop: 7,
  },
  verticalSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
  },
  unitAndRupeeText: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.33,
  },
  takeRegularView: {
    backgroundColor: '#f7f8f5',
    borderRadius: 5,
    padding: 8,
    paddingLeft: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
    flexDirection: 'row',
  },
  alreadySubscribedView: {
    padding: 12,
    flexDirection: 'column',
  },
  packOfTextStyle: {
    marginTop: 4,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
  },
  unitDropdownContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  editAndSubscriptionViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  unitAndPriceView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personNameTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    marginRight: 4,
  },
  personSelectionView: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  outOfStockStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.INPUT_FAILURE_TEXT,
    marginTop: 4,
  },
});

export interface MedicineCardProps {
  medicineName: string;
  personName?: string;
  price: number;
  subscriptionStatus: 'already-subscribed' | 'subscribed-now' | 'unsubscribed';
  packOfCount?: number;
  unit: number;
  isInStock: boolean;
  isPrescriptionRequired: boolean;
  isCardExpanded: boolean;
  onPress: () => void;
  onChangeUnit: (unit: number) => void;
  onChangeSubscription: (status: MedicineCardProps['subscriptionStatus']) => void;
  onPressRemove: () => void;
  onPressAdd: () => void;
  onEditPress: () => void;
  onAddSubscriptionPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const MedicineCard: React.FC<MedicineCardProps> = (props) => {
  const [dropDownVisible, setDropDownVisible] = useState(false);
  const {
    isCardExpanded,
    packOfCount,
    medicineName,
    personName,
    price,
    unit,
    isInStock,
    containerStyle,
    subscriptionStatus,
    isPrescriptionRequired,
    onChangeUnit,
    onPressRemove,
    onPressAdd,
    onPress,
    onChangeSubscription,
    onEditPress,
    onAddSubscriptionPress,
  } = props;

  const renderTitleAndIcon = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <Text numberOfLines={1} style={styles.medicineTitle}>
          {medicineName}
        </Text>
        {isInStock
          ? isCardExpanded
            ? renderTouchable(<RemoveIcon />, () => onPressRemove())
            : renderTouchable(<AddIcon />, () => onPressAdd())
          : null}
      </View>
    );
  };

  const renderSubscription = () => {
    if (subscriptionStatus == 'already-subscribed') {
      return (
        <View style={[styles.takeRegularView, styles.alreadySubscribedView]}>
          <Text style={styles.subscriptionTextStyle}>{'You have subscribed to this already'}</Text>
          <View style={styles.editAndSubscriptionViewStyle}>
            {renderTouchable(<Text style={theme.viewStyles.yellowTextStyle}>{'EDIT'}</Text>, () =>
              onEditPress()
            )}
            {renderTouchable(
              <Text style={theme.viewStyles.yellowTextStyle}>{'ADD NEW SUBSCRIPTION'}</Text>,
              () => onAddSubscriptionPress()
            )}
          </View>
        </View>
      );
    }
    return (
      <View style={styles.takeRegularView}>
        <Text style={styles.subscriptionTextStyle}>{'Need to take this regularly ?'}</Text>
        {renderTouchable(
          subscriptionStatus == 'subscribed-now' ? <CheckedIcon /> : <CheckUnselectedIcon />,
          () =>
            onChangeSubscription(
              subscriptionStatus == 'subscribed-now' ? 'unsubscribed' : 'subscribed-now'
            )
        )}
      </View>
    );
  };

  const renderTouchable = (item: Element, onPress: () => void) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        {item}
      </TouchableOpacity>
    );
  };

  const renderUnitDropdownAndPrice = () => {
    return (
      <View style={styles.unitAndPriceView}>
        <View style={[styles.unitDropdownContainer, { marginRight: 6 }]}>
          <TouchableOpacity
            activeOpacity={1}
            style={[{ flex: 1, alignSelf: 'flex-start' }]}
            // style={styles.unitDropdownContainer}
            onPress={() => onChangeUnit(unit - 1)}
          >
            <Minus />
          </TouchableOpacity>
          <Text style={styles.unitAndRupeeText}>{`${unit} UNIT`}</Text>
          <TouchableOpacity
            activeOpacity={1}
            style={[{ flex: 1, alignItems: 'flex-end' }]}
            // style={styles.unitDropdownContainer}
            onPress={() => onChangeUnit(unit + 1)}
          >
            <Plus />
          </TouchableOpacity>
        </View>
        <View style={styles.verticalSeparator} />
        <View style={[styles.flexStyle, { alignItems: 'flex-end' }]}>
          <Text style={styles.unitAndRupeeText}>{`Rs. ${price}`}</Text>
        </View>
      </View>
    );
  };

  const renderMedicineIcon = () => {
    return isPrescriptionRequired ? (
      <MedicineRxIcon style={{ marginRight: 12 }} />
    ) : (
      <MedicineIcon style={{ marginRight: 12 }} />
    );
  };

  const renderPersonSelectionView = () => {
    return (
      !!personName && (
        <View style={styles.personSelectionView}>
          <Text style={styles.personNameTextStyle}>{`For ${personName}`}</Text>
          <DropdownGreen />
        </View>
      )
    );
  };

  const renderOutOfStock = () => {
    return !isInStock && <Text style={styles.outOfStockStyle}>Out Of Stock</Text>;
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, containerStyle, { zIndex: -1 }]}
      onPress={() => onPress()}
    >
      {renderPersonSelectionView()}
      <View style={{ flexDirection: 'row' }}>
        {renderMedicineIcon()}
        <View style={styles.flexStyle}>
          {renderTitleAndIcon()}
          {renderOutOfStock()}
          {isCardExpanded ? (
            <>
              {!!packOfCount && (
                <Text style={styles.packOfTextStyle}>{`Pack of ${packOfCount}`}</Text>
              )}
              <View style={[styles.separator, { marginTop: 0 }]} />
              {renderUnitDropdownAndPrice()}
            </>
          ) : null}
        </View>
      </View>
      <View style={{ height: 13 }} />
    </TouchableOpacity>
  );
};
