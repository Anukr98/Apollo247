import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { NudgeMessage } from '@aph/mobile-patients/src/components/Medicines/Components/NudgeMessage';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';

export interface CircleBottomContainerProps {
  onPressUpgradeTo: () => void;
  onPressGoToCart: () => void;
}

export const CircleBottomContainer: React.FC<CircleBottomContainerProps> = (props) => {
  const { onPressUpgradeTo, onPressGoToCart } = props;
  const {
    pharmaHomeNudgeMessage,
    isCircleCart,
    serverCartAmount,
    serverCartItems,
  } = useShoppingCart();
  const showNudgeMessage =
    pharmaHomeNudgeMessage?.show === 'yes' &&
    ((isCircleCart && !!pharmaHomeNudgeMessage?.nudgeMessage) ||
      (!isCircleCart && !!pharmaHomeNudgeMessage?.nudgeMessageNonCircle));
  const totalCashback = serverCartAmount?.totalCashBack || 0;
  const cartTotal = serverCartAmount?.cartTotal || 0;
  const cartSavings = serverCartAmount?.cartSavings || 0;
  const estimatedAmount = serverCartAmount?.estimatedAmount || 0;

  const renderCartDiscount = () => {
    const cartDiscountPercent = getDiscountPercentage(cartTotal, cartTotal - cartSavings);
    return (
      <>
        {cartDiscountPercent ? (
          <View style={{ flexDirection: 'row', marginLeft: 10 }}>
            <Text style={circleStyles.priceStrikeOff}>
              ({string.common.Rs}
              {convertNumberToDecimal(cartTotal)})
            </Text>
            <Text style={circleStyles.discountPercentage}>{cartDiscountPercent}% off</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderNudgeMessageSection = () => {
    if (showNudgeMessage) {
      return <NudgeMessage nudgeMessage={pharmaHomeNudgeMessage} />;
    } else return null;
  };

  const renderItemsCount = () => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={theme.viewStyles.text('R', 13, '#02475B', 1, 24, 0)}>
        {!!isCircleCart ? 'Items' : 'Total items'}
      </Text>
      <Text style={theme.viewStyles.text('SB', 16, '#02475B', 1, 20, 0)}>
        {serverCartItems?.length}
      </Text>
    </View>
  );

  const renderCashbackSection = () =>
    isCircleCart ? renderCircleCashback() : renderUpgradeToCircle();

  const renderCircleCashback = () => (
    <View style={{ width: '60%' }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0)}>
          MRP{'  '}
          {string.common.Rs}
          {cartSavings ? (cartTotal - cartSavings)?.toFixed(2) : cartTotal?.toFixed(2)}
        </Text>
        {renderCartDiscount()}
      </View>
      <View style={{ flexDirection: 'row' }}>
        <CircleLogo style={circleStyles.circleLogoTwo} />
        <Text style={theme.viewStyles.text('R', 12, '#02475B', 1, 25, 0)}>
          cashback {string.common.Rs}
          {totalCashback?.toFixed(2)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Text style={theme.viewStyles.text('R', 12, '#02475B', 1, 25, 0)}>
          Effective price for you{' '}
        </Text>
        <Text style={theme.viewStyles.text('SB', 12, '#02475B', 1, 25, 0)}>
          {string.common.Rs}
          {convertNumberToDecimal(estimatedAmount - totalCashback)}
        </Text>
      </View>
    </View>
  );

  const renderUpgradeToCircle = () => (
    <TouchableOpacity activeOpacity={1} onPress={onPressUpgradeTo} style={circleStyles.upgrade}>
      <View style={circleStyles.upgradeTo}>
        <Text style={theme.viewStyles.text('M', 13, '#FCB716')}>UPGRADE TO</Text>
        <CircleLogo style={circleStyles.circleLogo} />
      </View>
      <Text style={theme.viewStyles.text('R', 12, '#02475B', 1, 17, 0)}>
        {`Get Circle Cashback of ₹${totalCashback.toFixed(2)}`}
      </Text>
    </TouchableOpacity>
  );

  const renderEstimatedAmount = () => (
    <View style={{ marginTop: 13 }}>
      <Text style={theme.viewStyles.text('SB', 16, '#02475B', 1, 20, 0)}>₹{estimatedAmount}</Text>
    </View>
  );

  const renderGoToCartCta = () => (
    <TouchableOpacity style={circleStyles.cartButton} onPress={onPressGoToCart}>
      <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0)}>GO TO CART</Text>
      {!isCircleCart && totalCashback > 1 && (
        <Text style={theme.viewStyles.text('M', 12, '#02475B', 1, 20, 0)}>
          {`Buy for ${string.common.Rs}${serverCartAmount?.cartTotal}`}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderSeparator = () => {
    isCircleCart ? <View style={circleStyles.separator}></View> : null;
  };

  return (
    <View style={[circleStyles.container, { backgroundColor: 'white' }]}>
      {renderNudgeMessageSection()}
      <View style={circleStyles.content}>
        {renderItemsCount()}
        {renderSeparator()}
        {totalCashback > 1 ? renderCashbackSection() : renderEstimatedAmount()}
        {renderGoToCartCta()}
      </View>
    </View>
  );
};

const circleStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    ...theme.viewStyles.cardContainer,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  upgrade: {
    borderWidth: 2,
    borderColor: '#FCB716',
    borderRadius: 8,
    padding: 5,
    backgroundColor: '#FFFFFF',
  },
  upgradeTo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 35,
    height: 23,
    marginLeft: 5,
  },
  cartButton: {
    backgroundColor: '#FCB716',
    borderRadius: 8,
    padding: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  circleLogoTwo: {
    resizeMode: 'contain',
    width: 35,
    height: 25,
    marginRight: 4,
  },
  priceStrikeOff: {
    ...theme.viewStyles.text('M', 13, '#01475b', 1, 20, 0.35),
    textDecorationLine: 'line-through',
    color: '#01475b',
    opacity: 0.6,
    paddingRight: 5,
  },
  discountPercentage: {
    ...theme.viewStyles.text('M', 13, '#00B38E', 1, 20, 0.35),
  },
  separator: {
    borderLeftWidth: 2,
    borderLeftColor: colors.DEFAULT_BACKGROUND_COLOR,
    marginTop: 6,
    marginBottom: 6,
  },
});
