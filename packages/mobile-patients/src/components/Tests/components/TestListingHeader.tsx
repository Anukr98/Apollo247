import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Badge } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, WhiteSearchIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  calculateDiagnosticCartItems,
  isEmptyObject,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';

export interface Props {
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  movedFrom?: 'registration' | 'deeplink' | 'home' | 'testDetails';
  headerText?: string;
}

export const TestListingHeader: React.FC<Props> = ({ navigation, movedFrom, headerText }) => {
  const { cartItems: diagnosticCartItems, modifiedOrder, patientCartItems } = useDiagnosticsCart();
  const { cartItems } = useShoppingCart();
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);

  const onBackPress = () => {
    if (movedFrom === 'registration') {
      navigation.replace(AppRoutes.ConsultRoom);
    } else if (movedFrom == 'deeplink') {
      navigation.replace(AppRoutes.ConsultRoom);
    } else {
      navigation.goBack();
    }
  };

  const paddingView = <View style={styles.paddingView} />;

  const renderHeaderCenterView = () => {
    return (
      <>
        {headerText ? (
          <Text
            style={[
              styles.titleTextStyle,
              { textAlign: movedFrom == 'testDetails' ? 'center' : 'left' },
            ]}
          >
            {headerText}
          </Text>
        ) : null}
      </>
    );
  };

  const renderHeaderRightView = () => {
    const cartItemsCount = isModifyFlow
      ? diagnosticCartItems?.length
      : calculateDiagnosticCartItems(diagnosticCartItems, patientCartItems)?.length;
    const onPressCartIcon = () => {
      if (isModifyFlow) {
        navigation.navigate(AppRoutes.CartPage, {
          orderDetails: modifiedOrder,
        });
      } else {
        navigation.navigate(AppRoutes.MedAndTestCart);
      }
    };
    const onPressSearchIcon = () => {
      navigation.navigate(AppRoutes.SearchTestScene);
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
    marginLeft: '-75%',
  },
  headerRightView: { justifyContent: 'flex-end', flexDirection: 'row' },
  paddingView: { width: 20, height: 0 },
  titleTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.5,
  },
});
