import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

const { text, card } = theme.viewStyles;
const { WHITE } = theme.colors;

const styles = StyleSheet.create({
  proceedToCheckout: {
    ...card(0, 0, 0),
    backgroundColor: '#3F3F3F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export interface AddedToCartToastProps {
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
}

export const AddedToCartToast: React.FC<AddedToCartToastProps> = (props) => {
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();

  const onPressGoToCart = () => {
    props.navigation.navigate(
      diagnosticCartItems.length ? AppRoutes.MedAndTestCart : AppRoutes.MedicineCart
    );
  };
  return (
    <View style={styles.proceedToCheckout}>
      <Text style={text('M', 13, WHITE, 1, 20)}>Added to cart successfully</Text>
      <TouchableOpacity onPress={onPressGoToCart}>
        <Text style={text('M', 13, '#FCB716', 1, 20)}>GO TO CART</Text>
      </TouchableOpacity>
    </View>
  );
};
