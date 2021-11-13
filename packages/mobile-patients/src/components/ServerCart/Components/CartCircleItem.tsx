import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DeleteIcon, CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import moment from 'moment';
import { postAppsFlyerCircleAddRemoveCartEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
import {
  fireCirclePlanRemovedEvent,
  fireCleverTapCirclePlanRemovedEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

export interface CartCircleItemProps {}

export const CartCircleItem: React.FC<CartCircleItemProps> = (props) => {
  const {
    circlePlanSelected,
    setCirclePlanSelected,
    setIsCircleSubscription,
    setCircleMembershipCharges,
    cartSubscriptionDetails,
  } = useShoppingCart();
  const { setIsDiagnosticCircleSubscription } = useDiagnosticsCart();
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const { setUserActionPayload } = useServerCart();

  const renderImage = () => {
    return (
      <View style={{ width: 50, justifyContent: 'center', marginRight: 20, marginLeft: 15 }}>
        <CircleLogo
          style={{
            resizeMode: 'contain',
            width: 40,
            height: 30,
          }}
        />
      </View>
    );
  };

  const renderProduct = () => {
    const validTill = moment(new Date(), 'DD/MM/YYYY').add(
      'days',
      cartSubscriptionDetails?.validDuration
    );
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', marginBottom: 5, justifyContent: 'space-between' }}>
          <View>
            <View style={{ flex: 0.85 }}>
              <Text style={theme.viewStyles.text('SB', 15, 'rgb(1,28,36)', 1, 20)}>
                {'Circle Membership Plan'}
              </Text>
            </View>
            <View style={{ flex: 0.85 }}>
              <Text style={theme.viewStyles.text('SB', 13, 'rgb(1,28,36)', 1, 20)}>
                {`${cartSubscriptionDetails?.durationInMonth} month plan`}
              </Text>
            </View>
            <View style={{ flex: 0.85, marginTop: 10 }}>
              <Text style={theme.viewStyles.text('R', 12, 'rgb(1,28,36)', 0.6, 20)}>
                {`Valid till: ${moment(validTill).format('D MMM YYYY')}`}
              </Text>
            </View>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                fireCirclePlanRemovedEvent(currentPatient);
                const circleSource = 'Cart(Pharma)';
                setUserActionPayload?.({
                  subscription: {
                    userSubscriptionId: null,
                    planId: null,
                    subPlanId: null,
                    TYPE: null,
                    subscriptionApplied: false,
                  },
                });
                fireCleverTapCirclePlanRemovedEvent(
                  currentPatient,
                  circleSource,
                  circlePlanSelected,
                  allCurrentPatients
                );
                postAppsFlyerCircleAddRemoveCartEvent(
                  circlePlanSelected,
                  circleSource,
                  'remove',
                  currentPatient
                );
                setCirclePlanSelected && setCirclePlanSelected(null);
                setIsCircleSubscription && setIsCircleSubscription(false);
                setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
                setCircleMembershipCharges && setCircleMembershipCharges(0);
                AsyncStorage.removeItem('circlePlanSelected');
              }}
              style={styles.delete}
            >
              <DeleteIcon />
            </TouchableOpacity>
            {renderPrice()}
          </View>
        </View>
      </View>
    );
  };

  const renderPrice = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <Text style={styles.price}>₹{cartSubscriptionDetails?.currentSellingPrice}</Text>
      </View>
    );
  };

  return (
    <View style={{ ...styles.card, backgroundColor: '#fff' }}>
      {renderImage()}
      {renderProduct()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  delete: {
    flex: 0.15,
    marginBottom: 13,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  price: {
    color: '#02475B',
    ...theme.fonts.IBMPlexSansSemiBold(16),
    lineHeight: 19,
    letterSpacing: 0.33,
  },
});
