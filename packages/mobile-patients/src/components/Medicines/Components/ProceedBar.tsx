import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TatCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/TatCard';

export interface ProceedBarProps {
  onPressSelectDeliveryAddress?: () => void;
  onPressAddDeliveryAddress?: () => void;
  onPressPlaceOrder?: () => void;
  onPressChangeAddress?: () => void;
  onPressTatCard?: () => void;
  onPressProceed?: () => void;
  vdcType?: string;
  screen?: string;
  disableButton?: boolean;
  selectedMedicineOption?: string;
  deliveryTime?: string;
}

export const ProceedBar: React.FC<ProceedBarProps> = (props) => {
  const { deliveryAddressId, addresses } = useShoppingCart();
  const {
    onPressSelectDeliveryAddress,
    onPressAddDeliveryAddress,
    onPressPlaceOrder,
    onPressTatCard,
    onPressChangeAddress,
    vdcType,
    screen,
    disableButton,
    selectedMedicineOption,
    onPressProceed,
    deliveryTime,
  } = props;
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);

  function getTitle() {
    return selectedMedicineOption == 'search'
      ? 'PROCEED'
      : !deliveryAddressId
      ? addresses?.length
        ? string.selectDeliveryAddress
        : string.addDeliveryAddress
      : string.placeOrder;
  }

  function onPressButton() {
    return selectedMedicineOption == 'search'
      ? onPressProceed?.()
      : !deliveryAddressId
      ? addresses?.length
        ? onPressSelectDeliveryAddress?.()
        : onPressAddDeliveryAddress?.()
      : onPressPlaceOrder?.();
  }

  const renderButton = () => {
    return (
      <Button
        disabled={disableButton}
        title={getTitle()}
        onPress={() => onPressButton()}
        titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
        style={{ flex: 1, borderRadius: 5 }}
      />
    );
  };

  const renderTatCard = () => {
    if (
      selectedAddress &&
      screen != 'summary' &&
      selectedMedicineOption != 'search' &&
      deliveryTime != undefined
    ) {
      return (
        <TatCard
          deliveryTime={deliveryTime}
          isNonCartOrder={true}
          deliveryAddress={formatSelectedAddress(selectedAddress!)}
          onPressChangeAddress={onPressChangeAddress!}
          onPressTatCard={onPressTatCard}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderTatCard()}
      <View style={styles.subContainer}>{renderButton()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.WHITE,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  subContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 9,
  },
});
