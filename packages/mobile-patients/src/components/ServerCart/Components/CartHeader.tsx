import React from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface CartHeaderProps extends NavigationScreenProps {}

export const CartHeader: React.FC<CartHeaderProps> = (props) => {
  const headerRightComponent = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          // setCoupon!(null);
          navigateToScreenWithEmptyStack(props.navigation, AppRoutes.Medicine);
        }}
      >
        <Text style={styles.addItems}>ADD ITEMS</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Header
      container={styles.header}
      leftIcon={'backArrow'}
      title={'YOUR CART'}
      rightComponent={headerRightComponent()}
      onPressLeftIcon={() => {
        CommonLogEvent(AppRoutes.MedicineCart, 'Go back to add items');
        // setCoupon!(null);
        props.navigation.goBack();
      }}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  addItems: { ...theme.fonts.IBMPlexSansSemiBold(13), color: theme.colors.APP_YELLOW },
});
