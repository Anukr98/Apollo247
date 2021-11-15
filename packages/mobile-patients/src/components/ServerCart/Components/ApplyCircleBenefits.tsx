import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CheckedIcon } from '../../ui/Icons';
import { CareCashbackBanner } from '../../ui/CareCashbackBanner';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { NavigationScreenProps } from 'react-navigation';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

export interface ApplyCircleBenefitsProps extends NavigationScreenProps {}

export const ApplyCircleBenefits: React.FC<ApplyCircleBenefitsProps> = (props) => {
  const {
    isCircleCart,
    cartSubscriptionDetails,
    serverCartAmount,
    cartCircleSubscriptionId,
  } = useShoppingCart();
  const { setUserActionPayload } = useServerCart();

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
    if (!!cartSubscriptionDetails?.subscriptionApplied) {
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
    } else {
      return (
        <TouchableOpacity
          onPress={() => {
            setUserActionPayload?.({
              coupon: '',
              subscription: {
                subscriptionApplied: cartCircleSubscriptionId ? true : false,
              },
            });
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.circleApplyContainer} />
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.applyText}>Apply </Text>
              <CareCashbackBanner
                bannerText={`benefits instead`}
                textStyle={styles.circleText}
                logoStyle={styles.circleLogo}
              />
            </View>
          </View>
          <Text style={styles.useCircleText}>
            {`Use your Circle membership instead & get `}
            <Text
              style={{ ...theme.viewStyles.text('SB', 12, '#02475B', 1, 17) }}
            >{`₹${serverCartAmount?.totalCashBack?.toFixed(2)} Cashback and Free delivery `}</Text>
            <Text>on this order</Text>
          </Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.applyBenefits} onPress={() => {}}>
      {isCircleCart ? renderBenefitsApplied() : renderSelectCirclePlans()}
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
  circleApplyContainer: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#00B38E',
    borderRadius: 5,
    marginTop: 9,
    marginRight: 10,
  },
  applyText: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 17),
    paddingTop: 12,
  },
  useCircleText: {
    ...theme.viewStyles.text('R', 12, '#02475B', 1, 17),
    marginLeft: 25,
  },
});
