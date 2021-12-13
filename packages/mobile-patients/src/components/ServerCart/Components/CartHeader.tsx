import React from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { navigateToScreenWithEmptyStack, postCleverTapEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CleverTapEventName, CleverTapEvents } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import AsyncStorage from '@react-native-community/async-storage';

export interface CartHeaderProps extends NavigationScreenProps {}

export const CartHeader: React.FC<CartHeaderProps> = (props) => {

  const shoppingCart = useShoppingCart()
  const { currentPatient } = useAllCurrentPatients()

  const postPharmacyCartAddItemsClicked = async () => {
    let prescription_required = false, total_discount = 0, subtotal = 0;
    for (let i = 0; i < shoppingCart?.serverCartItems?.length; i++) {
      if (shoppingCart?.serverCartItems[i]?.isPrescriptionRequired === '1') {
        prescription_required = true;
        break;
      }
    }
    shoppingCart?.serverCartItems?.forEach(item => {
      subtotal += item?.price
      if(item?.sellingPrice)
        total_discount += (item?.price - item?.sellingPrice)
    })
    const pincode = shoppingCart?.addresses?.find(item => item?.id === shoppingCart?.cartAddressId)?.zipcode
    const eventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CART_ADD_ITEMS_CLICKED] = {
      user: currentPatient?.firstName,
      mobile_number: currentPatient?.mobileNumber,
      user_type: await AsyncStorage.getItem("PharmacyUserType"),
      circle_member: shoppingCart?.pharmacyCircleAttributes?.['Circle Membership Added'],
      circle_membership_value: shoppingCart?.pharmacyCircleAttributes?.['Circle Membership Value'] ? shoppingCart?.pharmacyCircleAttributes?.['Circle Membership Value'] : 0,
      cartItems: shoppingCart?.serverCartItems,
      prescription_required,
      total_discount,
      total_items_in_cart: shoppingCart?.serverCartItems?.length,
      subtotal,
      coupon: shoppingCart?.cartCoupon ? shoppingCart?.cartCoupon?.coupon : null,
      customerId: currentPatient?.id,
      pincode,
      order_value: shoppingCart?.serverCartAmount?.estimatedAmount
    }
    postCleverTapEvent(CleverTapEventName.PHARMACY_CART_ADD_ITEMS_CLICKED, eventAttributes)
  }

  const headerRightComponent = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          // setCoupon!(null);
          postPharmacyCartAddItemsClicked()
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
        CommonLogEvent(AppRoutes.ServerCart, 'Go back to add items');
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
