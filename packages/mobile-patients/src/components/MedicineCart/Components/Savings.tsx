import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { Down } from '@aph/mobile-patients/src/components/ui/Icons';

export interface SavingsProps {}

export const Savings: React.FC<SavingsProps> = (props) => {
  const { couponDiscount, productDiscount, deliveryCharges, isCareSubscribed } = useShoppingCart();
  const deliveryFee = AppConfig.Configuration.DELIVERY_CHARGES;
  const [showCareDetails, setShowCareDetails] = useState(true);

  function getSavings() {
    return Number(
      (
        (couponDiscount && couponDiscount) +
        (productDiscount && productDiscount) +
        (deliveryCharges == 0 ? deliveryFee : 0)
      ).toFixed(2)
    );
  }

  function saveMessage() {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          console.log('isCareSubscribed: ', isCareSubscribed);
          if (isCareSubscribed) setShowCareDetails(!showCareDetails);
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <Text style={{ ...theme.fonts.IBMPlexSansRegular(13), lineHeight: 17, color: '#02475B' }}>
            You{' '}
            <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(13), lineHeight: 17, color: '#00B38E' }}>
              saved ₹{getSavings()}
            </Text>{' '}
            on your purchase
          </Text>
          {
            isCareSubscribed &&
            <Down style={{
              height: 15,
              transform: [{ rotate: showCareDetails ? '180deg' : '0deg'}],
            }} />
          }
        </View>
      </TouchableOpacity>
    );
  }

  function careSubscribeMessage() {
    return (
      <View style={styles.careMessageCard}>
        <Text style={{ ...theme.fonts.IBMPlexSansRegular(13), lineHeight: 17, color: '#02475B' }}>
          You could{' '}
          <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(13), lineHeight: 17, color: '#00B38E' }}>
            saved ₹{getSavings()}
          </Text>{' '}
          on your purchase with CARE
        </Text>
      </View>
    );
  }

  function renderCareLogo() {
    return (
      <View style={{
        borderRadius: 4,
        backgroundColor: '#F0533B',
        justifyContent: 'center',
        paddingHorizontal: 3,
        marginRight: 10,
      }}>
        <Text style={theme.viewStyles.text('M', 11, '#FFFFFF', 1, 13)}>CARE</Text>
      </View>
    );
  }

  function careSavings() {
    return (
      <View style={styles.careSavingsContainer}>
        <View style={styles.rowSpaceBetween}>
          <View style={{
            flexDirection: 'row',
          }}>
            {renderCareLogo()}
            <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>Membership Cashback</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>₹10</Text>
        </View>
        <View style={[
          styles.rowSpaceBetween,
          { marginTop: 10 }
        ]}>
          <View style={{flexDirection: 'row'}}>
            {renderCareLogo()}
            <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>Delivery</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>₹50</Text>
        </View>
        <View style={[
          styles.rowSpaceBetween,
          { marginTop: 10 }
        ]}>
          <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>Cart Savings</Text>
          <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>₹10</Text>
        </View>
        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmount}>₹70</Text>
        </View>
      </View>
    )
  }

  return getSavings() && getSavings() != 0 ? (
    <View style={styles.savingsCard}>
      {saveMessage()}
      { showCareDetails && careSavings() }
      { !isCareSubscribed && careSubscribeMessage() }
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  savingsCard: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 0,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderColor: '#00B38E',
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  careMessageCard: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 5,
    marginHorizontal: 18,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    paddingHorizontal: 15,
    paddingVertical: 9,
    elevation: 3,
  },
  careSavingsContainer: {
    borderTopColor: '#979797',
    borderTopWidth: 0.5,
    paddingVertical: 10,
    marginTop: 10,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalAmountContainer: {
    borderTopColor: '#979797',
    borderTopWidth: 0.5,
    paddingTop: 5,
    marginTop: 10,
  },
  totalAmount: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 20),
    textAlign: 'right'
  },
});
