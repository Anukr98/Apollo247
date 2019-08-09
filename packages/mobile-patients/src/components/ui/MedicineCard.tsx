import {
  AddIcon,
  CheckedIcon,
  CheckUnselectedIcon,
  DropdownGreen,
  MedicineIcon,
  MedicineRxIcon,
  RemoveIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { DropDown, Option } from './DropDown';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    padding: 16,
    paddingBottom: 0,
  },
  rowSpaceBetweenView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexStyle: {
    flex: 1,
  },
  medicineTitle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
  },
  priceText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansBold(12),
    lineHeight: 20,
  },
  stripText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
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
  editAndAddSubscriptionTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: theme.colors.APP_YELLOW,
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
});

export interface MedicineCardProps {
  id: number;
  sku: string;
  medicineName: string;
  personName?: string;
  price: number;
  subscriptionStatus: 'already-subscribed' | 'subscribed-now' | 'unsubscribed';
  packOfCount?: number;
  unit: number;
  isInStock: boolean;
  isPrescriptionRequired: boolean;
  isCardExpanded: boolean;
  isAddedToCart: boolean;
  onPress: (id: number, sku: string) => void;
  onChangeUnit: (id: number, unit: number) => void;
  onChangeSubscription: (id: number, status: MedicineCardProps['subscriptionStatus']) => void;
  onPressRemove: (id: number) => void;
  onPressAdd: (id: number) => void;
  onEditPress: (id: number) => void;
  onAddSubscriptionPress: (id: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const MedicineCard: React.FC<MedicineCardProps> = (props) => {
  const {
    id,
    sku,
    isCardExpanded,
    packOfCount,
    medicineName,
    personName,
    price,
    unit,
    isAddedToCart,
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
        {isCardExpanded
          ? renderTouchable(<RemoveIcon />, () => onPressRemove(id))
          : renderTouchable(<AddIcon />, () => onPressAdd(id))}
      </View>
    );
  };

  const renderSubscription = () => {
    if (subscriptionStatus == 'already-subscribed') {
      return (
        <View style={[styles.takeRegularView, styles.alreadySubscribedView]}>
          <Text style={styles.subscriptionTextStyle}>{'You have subscribed to this already'}</Text>
          <View style={styles.editAndSubscriptionViewStyle}>
            {renderTouchable(
              <Text style={styles.editAndAddSubscriptionTextStyle}>{'EDIT'}</Text>,
              () => onEditPress(id)
            )}
            {renderTouchable(
              <Text style={styles.editAndAddSubscriptionTextStyle}>{'ADD NEW SUBSCRIPTION'}</Text>,
              () => onAddSubscriptionPress(id)
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
              id,
              subscriptionStatus == 'subscribed-now' ? 'unsubscribed' : 'subscribed-now'
            )
        )}
      </View>
    );
  };

  const renderTouchable = (item: Element, onPress: () => void) => {
    return <TouchableOpacity onPress={onPress}>{item}</TouchableOpacity>;
  };

  const renderUnitDropdownOptions = () => {
    const MAX_UNITS = 5;
    const options: Option[] = [...Array.from({ length: MAX_UNITS })].map(
      (_, i) =>
        ({
          optionText: `${i + 1} UNIT`,
          onPress: () => onChangeUnit(id, i + 1),
        } as Option)
    );
    return <DropDown options={options} />;
  };

  const renderUnitDropdownAndPrice = () => {
    return (
      <View style={styles.unitAndPriceView}>
        <View style={styles.flexStyle}>
          <TouchableOpacity
            style={styles.unitDropdownContainer}
            onPress={() => onChangeUnit(id, 1)}
          >
            <Text style={styles.unitAndRupeeText}>{`${unit} UNIT`}</Text>
            <DropdownGreen style={{ marginRight: 7 }} />
          </TouchableOpacity>
          {/* {renderUnitDropdownOptions()} */}
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
      personName && (
        <View style={styles.personSelectionView}>
          <Text style={styles.personNameTextStyle}>{`For ${personName}`}</Text>
          <DropdownGreen />
        </View>
      )
    );
  };

  return (
    <TouchableOpacity
      style={[styles.containerStyle, containerStyle]}
      onPress={() => onPress(id, sku)}
    >
      {renderPersonSelectionView()}
      <View style={{ flexDirection: 'row' }}>
        {renderMedicineIcon()}
        <View style={styles.flexStyle}>
          {renderTitleAndIcon()}
          {isCardExpanded ? (
            <>
              {(packOfCount || 10) && (
                <Text style={styles.packOfTextStyle}>{`Pack of ${packOfCount || 10}`}</Text>
              )}
              <View style={[styles.separator, { marginTop: 0 }]} />
              {renderUnitDropdownAndPrice()}
            </>
          ) : null}
        </View>
      </View>
      {isCardExpanded ? (
        <>
          <View style={[styles.separator, { marginBottom: 8 }]} />
          {renderSubscription()}
        </>
      ) : null}
      {!isCardExpanded && <View style={{ height: 13 }} />}
    </TouchableOpacity>
  );
};
