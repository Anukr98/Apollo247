import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Badge } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, WhiteSearchIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';

export interface Props {
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  movedFrom?: 'registration' | 'deeplink' | 'home' | 'productdetail' | 'brandPages';
}

export const MedicineListingHeader: React.FC<Props> = ({ navigation, movedFrom }) => {
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { cartItems } = useShoppingCart();

  const onBackPress = () => {
    if (movedFrom === 'registration') {
      navigation.replace(AppRoutes.ConsultRoom);
    } else {
      navigation.goBack();
    }
  };

  const paddingView = <View style={styles.paddingView} />;

  const renderHeaderCenterView = () => {
    return (
      <TouchableOpacity style={{ marginLeft: '-75%' }} onPress={onPressApolloIcon}>
        <ApolloLogo style={styles.apolloLogo} />
      </TouchableOpacity>
    );
  };

  const onPressApolloIcon = () => {
    navigation.replace(AppRoutes.ConsultRoom);
  };

  const renderHeaderRightView = () => {
    const cartItemsCount = cartItems.length + diagnosticCartItems.length;
    const onPressCartIcon = () => {
      navigation.navigate(
        diagnosticCartItems.length ? AppRoutes.MedAndTestCart : AppRoutes.MedicineCart
      );
    };
    const onPressSearchIcon = () => {
      navigation.navigate(AppRoutes.MedicineSearch);
    };

    const icons = [
      <TouchableOpacity onPress={onPressSearchIcon}>
        <WhiteSearchIcon />
      </TouchableOpacity>,
      <TouchableOpacity onPress={onPressCartIcon}>
        <CartIcon />
        {cartItemsCount > 0 && <Badge label={cartItemsCount} />}
      </TouchableOpacity>,
    ];

    return (
      <View style={styles.headerRightView}>
        {icons.map((icon, index, array) => [icon, index + 1 !== array.length && paddingView])}
      </View>
    );
  };

  return (
    <Header
      leftIcon="backArrow"
      onPressLeftIcon={onBackPress}
      titleComponent={renderHeaderCenterView()}
      rightComponent={renderHeaderRightView()}
      container={styles.headerContainer}
    />
  );
};

const { card } = theme.viewStyles;
const styles = StyleSheet.create({
  headerContainer: {
    ...card(0, 0, 0, '#fff', 6),
    borderBottomWidth: 0,
    zIndex: 1,
  },
  apolloLogo: {
    resizeMode: 'contain',
    height: 50,
    width: 50,
  },
  headerRightView: { justifyContent: 'flex-end', flexDirection: 'row' },
  paddingView: { width: 20, height: 0 },
});
