import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CircleLogo, Down, Up } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ListItem } from 'react-native-elements';

export interface CartSavingsProps {}

export const CartSavings: React.FC<CartSavingsProps> = (props) => {
  const {
    cartTotalCashback,
    serverCartAmount,
    cartCircleSubscriptionId,
    cartSubscriptionDetails,
  } = useShoppingCart();
  const [savingDetailsVisible, setSavingDetailsVisible] = useState(true);

  const cartSavings = serverCartAmount?.cartSavings || 0;
  const couponSavings = serverCartAmount?.couponSavings || 0;
  const deliveryCharges = serverCartAmount?.deliveryCharges || 0;
  const isDeliveryFree = serverCartAmount?.isDeliveryFree || 0;
  const totalCashBack = serverCartAmount?.totalCashBack || 0;
  const circleMembershipCashback = serverCartAmount?.circleSavings?.membershipCashBack || 0;
  const circleDeliverySavings = serverCartAmount?.circleSavings?.circleDelivery || 0;
  const deliverySavings = isDeliveryFree || circleDeliverySavings > 0 ? deliveryCharges : 0;
  const totalSavings =
    cartSavings + couponSavings + deliverySavings + totalCashBack + circleMembershipCashback;
  const deliveryFeeSavings = deliveryCharges ? 0 : AppConfig.Configuration.DELIVERY_CHARGES;
  const totalCouldSaveByCircle = deliveryFeeSavings + cartTotalCashback + cartSavings;

  const renderYouSavedCard = () => {
    return (
      !!totalSavings && (
        <View style={styles.youSavedCard}>
          <ListItem
            onPress={() => setSavingDetailsVisible(!savingDetailsVisible)}
            containerStyle={savingDetailsVisible ? styles.youSavedItem : styles.youSavedHidden}
            bottomDivider={savingDetailsVisible}
            title={
              <Text>
                <Text style={styles.sherpaBlueText}>{'You'}</Text>
                <Text style={styles.saveText}>{` saved ₹${totalSavings.toFixed(2)} `}</Text>
                <Text style={styles.sherpaBlueText}>{'on your purchase.'}</Text>
              </Text>
            }
            rightIcon={savingDetailsVisible ? <Up /> : <Down />}
            Component={TouchableOpacity}
          />
          {savingDetailsVisible && renderSavingDetails()}
        </View>
      )
    );
  };

  const renderSavingDetails = () => {
    return (
      <>
        {!!circleMembershipCashback && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={
              <Text>
                <Text style={styles.yellowText}>{'Circle '}</Text>
                <Text style={styles.sherpaBlueText}>{'Membership Cashback'}</Text>
              </Text>
            }
            rightTitle={`₹${circleMembershipCashback.toFixed(2)}`}
            rightTitleStyle={styles.yellowText}
          />
        )}
        {!!circleDeliverySavings && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={
              <Text>
                <Text style={styles.yellowText}>{'Circle '}</Text>
                <Text style={styles.sherpaBlueText}>{'Delivery'}</Text>
              </Text>
            }
            rightTitle={`₹${circleDeliverySavings.toFixed(2)}`}
            rightTitleStyle={styles.yellowText}
          />
        )}
        {!!cartSavings && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={'Product Discount'}
            rightTitle={`₹${cartSavings.toFixed(2)}`}
            rightTitleStyle={styles.sherpaBlueText}
          />
        )}
        {!!couponSavings && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={'Coupon Savings'}
            rightTitle={`₹${couponSavings.toFixed(2)}`}
            rightTitleStyle={styles.sherpaBlueText}
          />
        )}
        {!circleDeliverySavings && !!isDeliveryFree && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={'Delivery Savings'}
            rightTitle={`₹${deliveryCharges.toFixed(2)}`}
            rightTitleStyle={styles.sherpaBlueText}
          />
        )}
        <ListItem
          topDivider
          containerStyle={styles.listItemTotal}
          rightTitle={`₹${totalSavings.toFixed(2)}`}
          rightTitleStyle={styles.sherpaBlueBoldText}
        />
      </>
    );
  };

  const renderYouCouldSaveCard = () => {
    if (!cartCircleSubscriptionId && !cartSubscriptionDetails?.currentSellingPrice) {
      return (
        totalCouldSaveByCircle > totalSavings && (
          <View style={styles.youCouldSaveCard}>
            <Text style={styles.youText}>
              <Text>{'You could'}</Text>
              <Text style={styles.saveText}>{` save ₹${totalCouldSaveByCircle.toFixed(2)} `}</Text>
              <Text>{'on your purchase with'}</Text>
            </Text>
            <CircleLogo style={styles.circleLogo} />
          </View>
        )
      );
    }
  };

  return (
    <>
      {renderYouSavedCard()}
      {renderYouCouldSaveCard()}
    </>
  );
};

const { APP_GREEN, WHITE, CARD_BG, LIGHT_BLUE, APP_YELLOW, SHERPA_BLUE } = theme.colors;
const { card, text } = theme.viewStyles;
const styles = StyleSheet.create({
  youSavedCard: {
    ...card(14, 12, 5, WHITE),
    marginBottom: 0,
    borderColor: APP_GREEN,
    borderWidth: 1,
  },
  youCouldSaveCard: {
    ...card(14, 12, 5, CARD_BG),
    marginTop: 0,
    flexDirection: 'row',
  },
  youText: {
    ...text('R', 13, LIGHT_BLUE, 1, 17),
  },
  saveText: {
    ...text('SB', 13, APP_GREEN, 1, 17),
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 45,
    height: 20,
  },
  youSavedItem: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 10,
    marginBottom: 10,
  },
  youSavedHidden: {
    padding: 0,
  },
  listItem: {
    padding: 0,
    margin: 0,
  },
  listItemTotal: {
    padding: 0,
    paddingTop: 5,
    marginTop: 10,
  },
  sherpaBlueText: {
    ...text('R', 14, SHERPA_BLUE, 1, 24),
  },
  yellowText: {
    ...text('R', 14, APP_YELLOW, 1, 24),
  },
  sherpaBlueBoldText: {
    ...text('SB', 14, LIGHT_BLUE, 1, 24),
  },
});
