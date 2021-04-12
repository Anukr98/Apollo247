import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CartIcon, HomeIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import {
  NavigationActions,
  NavigationRoute,
  NavigationScreenProp,
  StackActions,
} from 'react-navigation';
import { LocationSearchHeader } from '@aph/mobile-patients/src/components/ui/LocationSearchHeader';

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
        // onPress={() => props.navigation.popToTop()}
        onPress={() => {
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
            })
          );
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
          // style={{ right: 20 }}
        >
          <CartIcon style={{}} />
          {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
        </TouchableOpacity>
        {/* <NotificationIcon /> */}
      </View>
    </View>
  );
};
