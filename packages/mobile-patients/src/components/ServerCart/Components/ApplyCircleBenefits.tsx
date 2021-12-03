import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CheckedIcon } from '../../ui/Icons';
import { CareCashbackBanner } from '../../ui/CareCashbackBanner';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { NavigationScreenProps } from 'react-navigation';

export interface ApplyCircleBenefitsProps extends NavigationScreenProps {}

export const ApplyCircleBenefits: React.FC<ApplyCircleBenefitsProps> = (props) => {
  const { cartCircleSubscriptionId } = useShoppingCart();
  // console.log('cartCircleSubscriptionId >>>>>> ', cartCircleSubscriptionId);

  const renderSelectCirclePlans = () => {
    return (
      <CircleMembershipPlans
        navigation={props.navigation}
        isConsultJourney={false}
        onSelectMembershipPlan={(plan) => {
          // if (plan && !coupon) {
          //   // if plan is selected
          //   fireCircleBuyNowEvent(currentPatient);
          //   setCircleMembershipCharges && setCircleMembershipCharges(plan?.currentSellingPrice);
          //   setCircleSubPlanId && setCircleSubPlanId(plan?.subPlanId);
          // } else {
          //   // if plan is removed
          //   setShowCareSelectPlans(false);
          //   setCircleMembershipCharges && setCircleMembershipCharges(0);
          // }
        }}
        source={'Pharma Cart'}
        from={string.banner_context.PHARMA_CART}
        circleEventSource={'Cart(Pharma)'}
      />
    );
  };

  const renderBenefitsApplied = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <CheckedIcon style={{ marginTop: 8, marginRight: 4 }} />
        <CareCashbackBanner
          bannerText={`benefits APPLIED!`}
          textStyle={styles.circleText}
          logoStyle={styles.circleLogo}
        />
      </View>
    );
  };
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.applyBenefits} onPress={() => {}}>
      {!!cartCircleSubscriptionId ? renderBenefitsApplied() : renderSelectCirclePlans()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  applyBenefits: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 15,
    marginTop: 10,
    padding: 10,
  },
  circleText: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 17),
    paddingTop: 12,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 40,
  },
});
