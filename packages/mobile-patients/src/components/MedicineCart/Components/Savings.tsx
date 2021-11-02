import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CircleLogo, Down, Up } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ListItem } from 'react-native-elements';

export interface SavingsProps {}

export const Savings: React.FC<SavingsProps> = (props) => {
  const {
    couponDiscount,
    productDiscount,
    isCircleSubscription,
    cartTotalCashback,
    circleMembershipCharges,
    coupon,
    deliveryCharges,
  } = useShoppingCart();
  const [savingDetailsVisible, setSavingDetailsVisible] = useState(true);
  const deliveryFeeSavings = deliveryCharges ? 0 : AppConfig.Configuration.DELIVERY_CHARGES;
  const totalSaved =
    coupon && !coupon?.circleBenefits
      ? deliveryFeeSavings + productDiscount + couponDiscount
      : isCircleSubscription || circleMembershipCharges
      ? deliveryFeeSavings + productDiscount + couponDiscount + cartTotalCashback
      : productDiscount;
  const totalCouldSaveByCircle =
    AppConfig.Configuration.DELIVERY_CHARGES +
    cartTotalCashback +
    productDiscount +
    (coupon?.circleBenefits ? couponDiscount : 0);

  const renderYouSavedCard = () => {
    return (
      !!totalSaved && (
        <View style={styles.youSavedCard}>
          <ListItem
            onPress={() => setSavingDetailsVisible(!savingDetailsVisible)}
            containerStyle={savingDetailsVisible ? styles.youSavedItem : styles.youSavedHidden}
            bottomDivider={savingDetailsVisible}
            title={
              <Text>
                <Text style={styles.sherpaBlueText}>{'You'}</Text>
                <Text style={styles.saveText}>{` saved ₹${totalSaved.toFixed(2)} `}</Text>
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
    const isCircle = isCircleSubscription || (circleMembershipCharges && !coupon);
    return (
      <>
        {!!isCircle && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={
              <Text>
                <Text style={styles.yellowText}>{'Circle '}</Text>
                <Text style={styles.sherpaBlueText}>{'Membership Cashback'}</Text>
              </Text>
            }
            rightTitle={`₹${cartTotalCashback.toFixed(2)}`}
            rightTitleStyle={styles.yellowText}
          />
        )}
        {!!isCircle && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={
              <Text>
                <Text style={styles.yellowText}>{'Circle '}</Text>
                <Text style={styles.sherpaBlueText}>{'Delivery'}</Text>
              </Text>
            }
            rightTitle={`₹${deliveryFeeSavings.toFixed(2)}`}
            rightTitleStyle={styles.yellowText}
          />
        )}
        {!!productDiscount && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={'Product Discount'}
            rightTitle={`₹${productDiscount.toFixed(2)}`}
            rightTitleStyle={styles.sherpaBlueText}
          />
        )}
        {!!couponDiscount && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={'Coupon Savings'}
            rightTitle={`₹${couponDiscount.toFixed(2)}`}
            rightTitleStyle={styles.sherpaBlueText}
          />
        )}
        {!isCircle && !!deliveryFeeSavings && (
          <ListItem
            containerStyle={styles.listItem}
            titleStyle={styles.sherpaBlueText}
            title={'Delivery Savings'}
            rightTitle={`₹${deliveryFeeSavings.toFixed(2)}`}
            rightTitleStyle={styles.sherpaBlueText}
          />
        )}
        <ListItem
          topDivider
          containerStyle={styles.listItemTotal}
          title={<Text />}
          rightTitle={`₹${totalSaved.toFixed(2)}`}
          rightTitleStyle={styles.sherpaBlueBoldText}
        />
      </>
    );
  };

  const renderYouCouldSaveCard = () => {
    return (
      totalCouldSaveByCircle > totalSaved && (
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
