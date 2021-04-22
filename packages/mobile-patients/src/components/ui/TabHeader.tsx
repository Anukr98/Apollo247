import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CartIcon, HomeIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { LocationSearchHeader } from '@aph/mobile-patients/src/components/ui/LocationSearchHeader';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';

const styles = StyleSheet.create({
  labelView: {
    position: 'absolute',
    top: -10,
    right: -8,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
});

export interface TabHeaderProps {
  containerStyle?: StyleProp<ViewStyle>;
  hideHomeIcon?: boolean;
  locationVisible?: boolean;
  onLocationPress?: () => void;
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
}

export const TabHeader: React.FC<TabHeaderProps> = (props) => {
  const { cartItems } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const cartItemsCount = cartItems.length + diagnosticCartItems.length;

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        {
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingTop: 16,
          paddingBottom: 12,
          paddingHorizontal: 20,
          backgroundColor: theme.colors.WHITE,
        },
        props.containerStyle,
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigateToHome(props.navigation);
        }}
      >
        {!props.hideHomeIcon ? <HomeIcon /> : null}
      </TouchableOpacity>
      <View style={{ flexDirection: 'row' }}>
        {props.locationVisible && (
          <LocationSearchHeader
            onLocationProcess={() => props.onLocationPress && props.onLocationPress()}
          />
        )}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.navigation.navigate(AppRoutes.MedAndTestCart)}
        >
          <CartIcon style={{}} />
          {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
        </TouchableOpacity>
      </View>
    </View>
  );
};
