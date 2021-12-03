import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CartIcon, HomeIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { LocationSearchHeader } from '@aph/mobile-patients/src/components/ui/LocationSearchHeader';
import {
  g,
  getCleverTapCircleMemberValues,
  getUserType,
  navigateToHome,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import moment from 'moment';
import { getUniqueId } from 'react-native-device-info';
import { CleverTapEventName } from '../../helpers/CleverTapEvents';

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
  screenAsSource?: string;
}

export const TabHeader: React.FC<TabHeaderProps> = (props) => {
  const { serverCartItems } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const cartItemsCount = serverCartItems.length + diagnosticCartItems.length;
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { pharmacyCircleAttributes } = useShoppingCart();

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const cleverTapEventForHomeIconClick = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Nav src': props.screenAsSource,
      'Circle Member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        undefined,
      'Device Id': getUniqueId(),
    };
    postCleverTapEvent(CleverTapEventName.HOME_ICON_CLICKED, eventAttributes);
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
          cleverTapEventForHomeIconClick();
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
