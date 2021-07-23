import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DeleteIcon, CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import moment from 'moment';
import { fireCirclePlanRemovedEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { postAppsFlyerCircleAddRemoveCartEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';

export interface CircleCartItemProps {
  currentPatient: any;
}

export const CircleCartItem: React.FC<CircleCartItemProps> = (props) => {
  const {
    circlePlanSelected,
    setCirclePlanSelected,
    setIsCircleSubscription,
    setCircleMembershipCharges,
  } = useShoppingCart();
  const { setIsDiagnosticCircleSubscription } = useDiagnosticsCart();

  const renderImage = () => {
    return (
      <View style={{ width: 50, justifyContent: 'center' }}>
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
      circlePlanSelected?.valid_duration
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
                {`${circlePlanSelected?.durationInMonth} month plan`}
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
                postAppsFlyerCircleAddRemoveCartEvent(
                  circlePlanSelected,
                  'Pharma Cart',
                  'remove',
                  props?.currentPatient
                );
                fireCirclePlanRemovedEvent(props?.currentPatient);
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
        <Text style={styles.price}>₹{circlePlanSelected?.currentSellingPrice}</Text>
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
