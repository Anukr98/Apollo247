import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { CircleLogo } from '../../ui/Icons';
import { isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface DiscountPercentageProps {
  discount: any;
  isOnlyCircle: boolean;
  discountPrice: number;
}

const DiscountPercentage: React.FC<DiscountPercentageProps> = (props) => {
  const { discount, isOnlyCircle, discountPrice } = props;
  return (
    <>
      {!!discount && discount > 0 ? (
        <View
          style={[
            styles.percentageDiscountView,
            {
              marginHorizontal: isOnlyCircle ? 12 : 4,
            },
          ]}
        >
          {discountPrice > 0 && (
            <Text style={styles.percentageDiscountText}>
              {Number(discountPrice).toFixed(0)}% off {isOnlyCircle && '+ '}
            </Text>
          )}
          {isOnlyCircle && (
            <>
              <CircleLogo style={styles.circleLogoIcon} />
              <Text style={styles.percentageDiscountText}>{Number(discount).toFixed(0)}% off</Text>
            </>
          )}
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  percentageDiscountView: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  percentageDiscountText: {
    ...theme.viewStyles.text('B', 10, theme.colors.DISCOUNT_GREEN, 1, 13),
    textAlign: 'center',
  },
  circleLogoIcon: {
    height: 15,
    width: isSmallDevice ? 26 : 28,
    resizeMode: 'contain',
  },
});

export default React.memo(DiscountPercentage);
