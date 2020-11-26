import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ImageBackground,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
const { width } = Dimensions.get('window');
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { NavigationScreenProps } from 'react-navigation';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_PLAN_DETAILS_BY_PLAN_ID,
  GET_ONEAPOLLO_USER,
  GET_CIRCLE_SAVINGS_OF_USER_BY_MOBILE,
} from '@aph/mobile-patients/src/graphql/profiles';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { CircleMembershipActivation } from '@aph/mobile-patients/src/components/ui/CircleMembershipActivation';

interface CircleBannerProps extends NavigationScreenProps {
  planActivationCallback?: (() => void) | null;
  comingFrom?: string;
  nonSubscribedText?: string;
  nonSubscribedSubText?: string;
}
export const CircleBannerComponent: React.FC<CircleBannerProps> = (props) => {
  const { planActivationCallback } = props;
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(false);
  const [showCircleActivation, setShowCircleActivation] = useState<boolean>(false);
  const [membershipPlans, setMembershipPlans] = useState<any>([]);
  const [healthCredits, setHealthCredits] = useState<number>(0);
  const [totalCircleSavings, setTotalCircleSavings] = useState<number>(0);
  const { circleSubscriptionId, selectDefaultPlan, defaultCirclePlan } = useShoppingCart();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const defaultPlanSellingPrice = defaultCirclePlan?.currentSellingPrice;
  const monthlySavings = AppConfig.Configuration.CIRCLE_STATIC_MONTHLY_SAVINGS;

  useEffect(() => {
    if (!circleSubscriptionId) {
      //not subscribed
      fetchHealthCredits();
    } else {
      //subscribed
      fetchCircleSavings();
    }
  }, [circleSubscriptionId]);

  const fetchCarePlans = async () => {
    try {
      const res = await client.query<GetPlanDetailsByPlanId>({
        query: GET_PLAN_DETAILS_BY_PLAN_ID,
        fetchPolicy: 'no-cache',
        variables: {
          plan_id: AppConfig.Configuration.CIRCLE_PLAN_ID,
        },
      });
      const membershipPlans = res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary;
      if (membershipPlans) {
        setMembershipPlans(membershipPlans);
        selectDefaultPlan && selectDefaultPlan(membershipPlans);
      }
    } catch (error) {
      CommonBugFender('CircleMembershipPlans_GetPlanDetailsByPlanId', error);
    }
  };

  const fetchHealthCredits = async () => {
    try {
      const res = await client.query({
        query: GET_ONEAPOLLO_USER,
        variables: {
          patientId: currentPatient?.id,
        },
        fetchPolicy: 'no-cache',
      });
      if (res?.data?.getOneApolloUser) {
        setHealthCredits(res?.data?.getOneApolloUser?.availableHC);
      }
      fetchCarePlans();
    } catch (error) {
      CommonBugFender('fetchingOneApolloUser', error);
      setHealthCredits(0);
    }
  };

  const fetchCircleSavings = async () => {
    try {
      const res = await client.query({
        query: GET_CIRCLE_SAVINGS_OF_USER_BY_MOBILE,
        variables: {
          mobile_number: currentPatient?.mobileNumber,
        },
        fetchPolicy: 'no-cache',
      });
      const consultSavings =
        res?.data?.GetCircleSavingsOfUserByMobile?.response?.savings?.consult || 0;
      const pharmaSavings =
        res?.data?.GetCircleSavingsOfUserByMobile?.response?.savings?.pharma || 0;
      const diagnosticsSavings =
        res?.data?.GetCircleSavingsOfUserByMobile?.response?.savings?.diagnostics || 0;
      const deliverySavings =
        res?.data?.GetCircleSavingsOfUserByMobile?.response?.savings?.delivery || 0;
      const totalSavings = consultSavings + pharmaSavings + diagnosticsSavings + deliverySavings;

      setTotalCircleSavings(totalSavings);
    } catch (error) {
      CommonBugFender('CircleBannerComponent_fetchCircleSavings', error);
    }
  };

  const renderConditionalViews = () => {
    if (!circleSubscriptionId) {
      return (
        <View style={{ paddingLeft: 6 }}>
          <View style={[styles.row, { marginTop: 20 }]}>
            {props.comingFrom == 'diagnostics' ? null : <CircleLogo style={styles.circleLogo} />}
            {props.nonSubscribedText ? (
              <View style={{ width: '55%' }}>
                <Text style={styles.headerText}>{props.nonSubscribedText}</Text>
              </View>
            ) : (
              <Text style={styles.title}>MEMBERS</Text>
            )}
          </View>
          {props.nonSubscribedText ? (
            <Text style={styles.subText}>{props.nonSubscribedSubText}</Text>
          ) : (
            <Text style={styles.title}>
              SAVE {string.common.Rs}
              {monthlySavings} MONTHLY!
            </Text>
          )}
        </View>
      );
    }
    if (totalCircleSavings === 0) {
      return (
        <View>
          <View style={styles.row}>
            <CircleLogo style={styles.circleLogo} />
            <Text style={styles.title}>MEMBERS SAVE BIG!</Text>
          </View>
          <Text style={styles.title}>YOU COULD SAVE</Text>
          <Text style={styles.title}>
            {string.common.Rs}
            {monthlySavings} TOO
          </Text>
        </View>
      );
    }
    return (
      <View>
        <View style={styles.row}>
          <Text style={styles.title}>BEING A PART OF</Text>
          <CircleLogo style={[styles.circleLogo, { marginLeft: 3 }]} />
        </View>
        <Text style={[styles.title, { marginTop: -5 }]}>YOU HAVE SAVED</Text>
        <Text style={[styles.title, { fontSize: 20, marginTop: 3 }]}>
          {string.common.Rs}
          {totalCircleSavings}
        </Text>
      </View>
    );
  };
  const renderUpgradeBtn = () => {
    return (
      <TouchableOpacity
        style={styles.upgradeBtnView}
        onPress={() => {
          if (healthCredits >= defaultPlanSellingPrice) {
            setShowCircleActivation(true);
          } else if (defaultPlanSellingPrice) {
            setShowCirclePlans(true);
          }
        }}
      >
        <View style={[styles.row, { marginTop: 6 }]}>
          <Text style={styles.upgradeText}>UPGRADE TO</Text>
          <CircleLogo style={styles.smallCircleLogo} />
        </View>
        {healthCredits >= defaultPlanSellingPrice ? (
          <Text style={{ ...theme.viewStyles.text('R', 8, theme.colors.LIGHT_BLUE) }}>
            For{' '}
            <Text style={{ ...theme.viewStyles.text('M', 8, theme.colors.LIGHT_BLUE) }}>
              {defaultPlanSellingPrice} Health Credits
            </Text>
          </Text>
        ) : defaultPlanSellingPrice ? (
          <Text style={[styles.upgradeText, { color: theme.colors.LIGHT_BLUE, marginTop: -5 }]}>
            Starting at {string.common.Rs}
            {defaultPlanSellingPrice}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };
  const renderCircleSubscriptionPlans = () => {
    return (
      <CircleMembershipPlans
        navigation={props.navigation}
        isModal={true}
        closeModal={() => setShowCirclePlans(false)}
        buyNow={true}
        membershipPlans={membershipPlans}
      />
    );
  };

  const renderCircleMembershipActivated = () => (
    <CircleMembershipActivation
      visible={showCircleActivation}
      closeModal={(planActivated) => {
        setShowCircleActivation(false);
        if (planActivated) {
          planActivationCallback && planActivationCallback();
        }
      }}
      defaultCirclePlan={defaultCirclePlan}
      healthCredits={healthCredits}
      navigation={props.navigation}
    />
  );
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@aph/mobile-patients/src/components/ui/icons/circleBanner.png')}
        style={[styles.banner, { height: props.comingFrom == 'diagnostics' ? 180 : 150 }]}
        imageStyle={{ borderRadius: 16 }}
      >
        {renderConditionalViews()}
        {!circleSubscriptionId ? (
          <View style={styles.bottomView}>
            {renderUpgradeBtn()}
            {healthCredits >= defaultPlanSellingPrice ? (
              <Text style={styles.regularText}>
                {string.circleDoctors.availableHealthCredits}: {healthCredits}
              </Text>
            ) : null}
          </View>
        ) : null}
        {showCirclePlans && renderCircleSubscriptionPlans()}
        {renderCircleMembershipActivated()}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    paddingTop: 16,
  },
  banner: {
    height: 150,
    width: width - 40,
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 13,
  },
  row: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleLogo: {
    width: 50,
    height: 30,
    marginRight: 3,
  },
  title: {
    ...theme.viewStyles.text('M', 14, theme.colors.WHITE, 1, 22),
  },
  upgradeBtnView: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingBottom: 5,
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
  },
  upgradeText: {
    ...theme.viewStyles.text('SB', 9, theme.colors.APP_YELLOW, 1),
  },
  smallCircleLogo: {
    width: 40,
    height: 20,
  },
  regularText: {
    ...theme.viewStyles.text('R', 8, theme.colors.LIGHT_BLUE),
    left: 12,
    marginTop: 2,
  },
  bottomView: {
    position: 'absolute',
    bottom: 10,
    left: 13,
  },
  headerText: {
    ...theme.viewStyles.text('SB', 20, theme.colors.WHITE, 1, 25),
  },
  subText: { ...theme.viewStyles.text('M', 10, theme.colors.WHITE, 1, 24) },
});
