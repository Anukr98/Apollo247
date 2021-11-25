import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageBackground,
  Linking,
} from 'react-native';
import {
  NavigationScreenProps,
  StackActions,
  NavigationActions,
  ScrollView,
} from 'react-navigation';
import { fireCirclePurchaseEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  EllipseBulletPoint,
  LockIcon,
  HdfcBankLogo,
  CircleLogo,
  ExpiredBanner,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  useAppCommonData,
  PlanBenefits,
  SubscriptionData,
  CirclePlanSummary,
  CircleGroup,
  BenefitCtaAction,
  CicleSubscriptionData,
  GroupPlan,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';

import {
  g,
  postWebEngageEvent,
  setCircleMembershipType,
  isValidImageUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AvailNowPopup } from './AvailNowPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { CircleMembershipActivation } from '@aph/mobile-patients/src/components/ui/CircleMembershipActivation';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_CIRCLE_SAVINGS_OF_USER_BY_MOBILE,
  GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';
import { Hdfc_values } from '@aph/mobile-patients/src/strings/strings.json';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { postCircleWEGEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import AsyncStorage from '@react-native-community/async-storage';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  ellipseBullet: {
    resizeMode: 'contain',
    width: 10,
    height: 10,
    alignSelf: 'center',
    marginRight: 10,
  },
  ellipseBulletContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  membershipCardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  planName: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 20, 0.35),
    marginRight: 10,
  },
  medalIcon: {
    width: 30,
    height: 35,
    position: 'absolute',
    right: 16,
    top: 20,
  },
  lockIcon: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
    position: 'absolute',
    right: 16,
    top: 20,
  },
  corporateIcon: {
    resizeMode: 'contain',
    width: 80,
    height: 50,
    position: 'absolute',
    right: 10,
  },
  subTextContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  viewMoreText: {
    ...theme.viewStyles.text('B', 12, '#00B38E', 1, 20, 0.35),
    position: 'absolute',
    bottom: 16,
    right: 20,
  },
  membershipButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#FC9916',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  helpIconStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  headerContainer: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    marginBottom: 20,
  },
  healthyLifeContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hdfcLogo: {
    resizeMode: 'contain',
    width: 100,
    height: 20,
  },
  corpLogo: {
    resizeMode: 'contain',
    width: 100,
    height: 30,
    position: 'absolute',
    right: -10,
  },
  currentBenefits: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 20, 0.35),
    paddingLeft: 20,
    paddingBottom: 10,
  },
  otherPlans: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 20, 0.35),
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 10,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 30,
    position: 'absolute',
    right: 0,
  },
  expiredBanner: {
    position: 'absolute',
    resizeMode: 'contain',
    width: 70,
    height: 67,
  },
  separatorStyle: {
    height: 0.5,
    width: '110%',
    marginTop: 11,
    backgroundColor: '#D6CEE3',
  },
  npMembershipText: {
    width: '75%',
    textAlign: 'center',
    alignSelf: 'center',
  },
  activateSeparator: {
    width: '90%',
    marginVertical: 10,
    marginBottom: 18,
    alignSelf: 'center',
  },
  activateMembershipCtaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f1ec',
  },
  corporateCtaText: {
    fontSize: 13,
    lineHeight: 24,
    marginVertical: 8,
  },
  corporateCta: {
    width: '90%',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export interface MyMembershipProps extends NavigationScreenProps {
  source?: string;
}

export const MyMembership: React.FC<MyMembershipProps> = (props) => {
  const {
    hdfcUserSubscriptions,
    hdfcUpgradeUserSubscriptions,
    circleSubscription,
    setTotalCircleSavings,
    setHdfcUpgradeUserSubscriptions,
    setHdfcUserSubscriptions,
    setCircleSubscription,
    isRenew,
    healthCredits,
    corporateSubscriptions,
    setCorporateSubscriptions,
    activeUserSubscriptions,
  } = useAppCommonData();
  const {
    circleSubscriptionId,
    setHdfcPlanName,
    setIsFreeDelivery,
    setIsCircleSubscription,
    isCircleExpired,
    circlePlanValidity,
  } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();

  const showHdfcSubscriptions = !!hdfcUserSubscriptions?.name;
  const canUpgradeMultiplePlans = !!(hdfcUpgradeUserSubscriptions.length > 1);
  const source = props.navigation.getParam('source');
  const premiumPlan = canUpgradeMultiplePlans ? hdfcUpgradeUserSubscriptions[1] : {};
  const canUpgrade = !!hdfcUpgradeUserSubscriptions.length;
  const isActive = !!hdfcUserSubscriptions?.isActive;
  const upgradePlanName = hdfcUpgradeUserSubscriptions?.[0]?.name;
  const [showAvailPopup, setShowAvailPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [upgradeTransactionValue, setUpgradeTransactionValue] = useState<number>(0);
  const subscription_name = showHdfcSubscriptions ? hdfcUserSubscriptions?.name : '';
  const client = useApolloClient();
  const [upgradePlans, setUpgradePlans] = useState<SubscriptionData[]>([]);
  const planValidity = useRef<string>('');
  const planPurchased = useRef<boolean | undefined>(false);
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(false);
  const [showCircleActivation, setShowCircleActivation] = useState<boolean>(false);
  const [showCorporateActivation, setShowCorporateActivation] = useState<boolean>(false);
  const [corporatePlan, setCorporatePlan] = useState<any[]>([]);

  const [consultPlan, setConsultPlan] = useState<any[]>([]);

  useEffect(() => {
    if (showHdfcSubscriptions) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.HDFC_MY_MEMBERSHIP_VIEWED] = {
        'User ID': g(currentPatient, 'id'),
        Plan: subscription_name?.substring(0, subscription_name.indexOf('+')),
      };
      postWebEngageEvent(WebEngageEventName.HDFC_MY_MEMBERSHIP_VIEWED, eventAttributes);
    }
    fetchCircleSavings();
    getUserSubscriptionsWithBenefits();
  }, []);

  const fetchCircleSavings = async () => {
    try {
      const res = await client.query({
        query: GET_CIRCLE_SAVINGS_OF_USER_BY_MOBILE,
        variables: {
          mobile_number: currentPatient?.mobileNumber,
        },
        fetchPolicy: 'no-cache',
      });
      const savings = res?.data?.GetCircleSavingsOfUserByMobile?.response?.savings;
      const circlebenefits = res?.data?.GetCircleSavingsOfUserByMobile?.response?.benefits;
      const consultSavings = savings?.consult || 0;
      const pharmaSavings = savings?.pharma || 0;
      const diagnosticsSavings = savings?.diagnostics || 0;
      const deliverySavings = savings?.delivery || 0;
      const totalSavings = consultSavings + pharmaSavings + diagnosticsSavings + deliverySavings;
      const docOnCallBenefit = circlebenefits?.filter(
        (value) => value?.attribute === Circle.DOC_ON_CALL
      );
      setTotalCircleSavings &&
        setTotalCircleSavings({
          consultSavings,
          pharmaSavings,
          diagnosticsSavings,
          deliverySavings,
          totalSavings,
          callsTotal: docOnCallBenefit?.[0]?.attribute_type?.total,
          callsUsed: docOnCallBenefit?.[0]?.attribute_type?.used,
        });
    } catch (error) {
      CommonBugFender('MyMembership_fetchCircleSavings', error);
    }
  };

  useEffect(() => {
    if (upgradePlans.length) {
      setHdfcUpgradeUserSubscriptions && setHdfcUpgradeUserSubscriptions(upgradePlans);
    }
  }, [upgradePlans]);

  const handleBack = async () => {
    if (source) {
      props.navigation.navigate('MY ACCOUNT');
    } else {
      props.navigation.goBack();
    }
    return false;
  };

  const renderCircleSubscriptionPlans = () => {
    return (
      <CircleMembershipPlans
        navigation={props.navigation}
        isModal={true}
        closeModal={() => setShowCirclePlans(false)}
        buyNow={true}
        membershipPlans={circleSubscription?.planSummary}
        source={'Consult'}
        from={strings.banner_context.MEMBERSHIP_DETAILS}
        healthCredits={healthCredits}
        onPurchaseWithHCCallback={(res: any) => {
          fireCirclePurchaseEvent(
            currentPatient,
            res?.data?.CreateUserSubscription?.response?.end_date
          );
          planPurchased.current =
            res?.data?.CreateUserSubscription?.response?.status === 'PAYMENT_FAILED' ? false : true;
          planValidity.current = res?.data?.CreateUserSubscription?.response?.end_date;
          setShowCircleActivation(true);
        }}
        screenName={'My Membership'}
        circleEventSource={'My Account-My membership section'}
      />
    );
  };
  const renderCircleMembershipActivated = () => (
    <CircleMembershipActivation
      visible={showCircleActivation}
      closeModal={(planActivated) => {
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [
              NavigationActions.navigate({
                routeName: AppRoutes.ConsultRoom,
                params: {
                  skipAutoQuestions: true,
                },
              }),
            ],
          })
        );
        setShowCircleActivation(false);
      }}
      defaultCirclePlan={{}}
      navigation={props.navigation}
      circlePaymentDone={planPurchased.current}
      circlePlanValidity={{ endDate: planValidity.current }}
      source={'Consult'}
      from={strings.banner_context.MEMBERSHIP_DETAILS}
      circleEventSource={'Membership Details'}
    />
  );

  const getUserSubscriptionsWithBenefits = () => {
    setshowSpinner(true);
    const mobile_number = g(currentPatient, 'mobileNumber');
    mobile_number &&
      client
        .query<
          GetAllUserSubscriptionsWithPlanBenefitsV2,
          GetAllUserSubscriptionsWithPlanBenefitsV2Variables
        >({
          query: GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
          variables: { mobile_number },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          setshowSpinner(false);
          const groupPlans = g(
            data,
            'data',
            'GetAllUserSubscriptionsWithPlanBenefitsV2',
            'response'
          );
          if (groupPlans) {
            let hdfcPlan = null;
            let circlePlan = null;
            let corprPlan = null;
            for (let [key, value] of Object.entries(groupPlans)) {
              if (key === 'HDFC') hdfcPlan = value;
              else if (key === 'APOLLO') circlePlan = value;
              else corprPlan = value;
            }

            let corporatePlan: SubscriptionData[] = [];
            Object.keys(groupPlans).forEach((plan_name) => {
              if (plan_name !== 'APOLLO' && plan_name !== 'HDFC') {
                groupPlans[plan_name]?.forEach((subscription: any) => {
                  const plan = setSubscriptionData(subscription, false, true);
                  corporatePlan.push(plan);
                });
              }
            });

            if (corporatePlan.length) {
              AsyncStorage.setItem('isCorporateSubscribed', 'yes');
            } else {
              AsyncStorage.setItem('isCorporateSubscribed', 'no');
            }
            setCorporateSubscriptions && setCorporateSubscriptions(corporatePlan);

            if (hdfcPlan) {
              const hdfcSubscription = setSubscriptionData(hdfcPlan[0]);
              setHdfcUserSubscriptions && setHdfcUserSubscriptions(hdfcSubscription);

              const subscriptionName = g(hdfcSubscription, 'name')
                ? g(hdfcSubscription, 'name')
                : '';
              if (g(hdfcSubscription, 'isActive')) {
                setHdfcPlanName && setHdfcPlanName(subscriptionName!);
              }
              if (
                subscriptionName === Hdfc_values.PLATINUM_PLAN &&
                !!g(hdfcSubscription, 'isActive')
              ) {
                setIsFreeDelivery && setIsFreeDelivery(true);
              }
            }

            if (circlePlan) {
              if (circlePlan?.[0]?.plan_id === 'CIRCLEPlan') {
                const circleSubscription = setCircleSubscriptionData(circlePlan?.[0]);

                if (!!circlePlan?.[0]?._id) {
                  if (circlePlan?.[0]?.status === 'disabled') {
                    setIsCircleSubscription && setIsCircleSubscription(false);
                  } else {
                    setIsCircleSubscription && setIsCircleSubscription(true);
                  }
                }

                setCircleSubscription && setCircleSubscription(circleSubscription);
              }

              let consultSubscriptionPlans = circlePlan?.filter((plan) => {
                return plan.plan_vertical === 'Consult' && plan.status === 'active';
              });

              setConsultPlan(consultSubscriptionPlans);
            }

            if (corprPlan) {
              setShowCorporateActivation(true);
              setCorporatePlan(corprPlan);
            }
          }
        })
        .catch((e) => {
          setshowSpinner(false);
          CommonBugFender('ConsultRoom_getUserSubscriptionsWithBenefits', e);
        });
  };

  const setCircleSubscriptionData = (plan: any) => {
    const planSummary: CirclePlanSummary[] = [];
    const summary = plan?.plan_summary;
    if (summary && summary.length) {
      summary.forEach((value) => {
        const plan_summary: CirclePlanSummary = {
          price: value?.price,
          renewMode: value?.renew_mode,
          starterPack: !!value?.starter_pack,
          benefitsWorth: value?.benefits_worth,
          availableForTrial: !!value?.available_for_trial,
          specialPriceEnabled: value?.special_price_enabled,
          subPlanId: value?.subPlanId,
          durationInMonth: value?.durationInMonth,
          currentSellingPrice: value?.currentSellingPrice,
          icon: value?.icon,
        };
        planSummary.push(plan_summary);
      });
    }

    const group = plan?.group;
    const groupDetailsData: CircleGroup = {
      _id: group?._id,
      name: group?.name,
      isActive: group?.is_active,
    };

    const benefits = plan.benefits;
    const circleBenefits: PlanBenefits[] = [];
    if (benefits && benefits.length) {
      benefits.forEach((item) => {
        const ctaAction = item?.cta_action;
        const benefitCtaAction: BenefitCtaAction = {
          type: ctaAction?.type,
          action: ctaAction?.meta?.action,
          message: ctaAction?.meta?.message,
          webEngageEvent: ctaAction?.meta?.webEngage,
        };
        const benefit: PlanBenefits = {
          _id: item?._id,
          attribute: item?.attribute,
          headerContent: item?.header_content,
          description: item?.description,
          ctaLabel: item?.cta_label,
          ctaAction: item?.cta_action?.cta_action,
          benefitCtaAction,
          attributeType: item?.attribute_type,
          availableCount: item?.available_count,
          refreshFrequency: item?.refresh_frequency,
          icon: item?.icon,
        };
        circleBenefits.push(benefit);
      });
    }

    const circleSubscptionData: CicleSubscriptionData = {
      _id: plan?._id,
      name: plan?.name,
      planId: plan?.plan_id,
      activationModes: plan?.activation_modes,
      status: plan?.status,
      subscriptionStatus: plan?.subscriptionStatus,
      subPlanIds: plan?.sub_plan_ids,
      planSummary: planSummary,
      groupDetails: groupDetailsData,
      benefits: circleBenefits,
      endDate: plan?.subscriptionEndDate,
      startDate: plan?.start_date,
    };

    return circleSubscptionData;
  };

  const setSubscriptionData = (plan: any, isUpgradePlan?: boolean, isCorporatePlan?: boolean) => {
    try {
      const group = plan.group;
      const groupData: GroupPlan = {
        _id: group!._id || '',
        name: group!.name || '',
        isActive: group!.is_active,
      };
      const benefits = plan.benefits;
      const planBenefits: PlanBenefits[] = [];
      if (benefits && benefits.length) {
        benefits.forEach((item) => {
          const ctaAction = g(item, 'cta_action');
          if (
            g(ctaAction, 'meta', 'action') === strings.common.CorporateVaccineBenefit &&
            isCorporatePlan
          ) {
            AsyncStorage.setItem('VaccinationCmsIdentifier', item?.cms_identifier);
            AsyncStorage.setItem('VaccinationSubscriptionId', plan?._id);
          }
          const benefitCtaAction: BenefitCtaAction = {
            type: g(ctaAction, 'type'),
            action: g(ctaAction, 'meta', 'action'),
            message: g(ctaAction, 'meta', 'message'),
            webEngageEvent: g(ctaAction, 'meta', 'webEngage'),
          };
          const benefit: PlanBenefits = {
            _id: item!._id,
            attribute: item!.attribute,
            headerContent: item!.header_content,
            description: item!.description,
            ctaLabel: item!.cta_label,
            ctaAction: g(item, 'cta_action', 'cta_action'),
            benefitCtaAction,
            attributeType: item!.attribute_type,
            availableCount: item!.available_count,
            refreshFrequency: item!.refresh_frequency,
            icon: item!.icon,
            cmsIdentifier: item?.cms_identifier,
          };
          planBenefits.push(benefit);
        });
      }
      const isActive = plan!.subscriptionStatus === Hdfc_values.ACTIVE_STATUS;
      const subscription: SubscriptionData = {
        _id: plan!._id || '',
        name: plan!.name || '',
        planId: plan!.plan_id || '',
        benefitsWorth: plan!.benefits_worth || '',
        activationModes: plan!.activation_modes,
        price: plan!.price,
        minTransactionValue: plan?.plan_summary?.[0]?.min_transaction_value,
        status: plan!.status || '',
        subscriptionStatus: plan!.subscriptionStatus || '',
        isActive,
        group: groupData,
        benefits: planBenefits,
        coupons: plan!.coupons ? plan!.coupons : [],
        upgradeTransactionValue: plan?.plan_summary?.[0]?.upgrade_transaction_value,
        isCorporate: !!isCorporatePlan,
        corporateIcon: !!isCorporatePlan ? plan?.group_logo_url?.mobile_version : '',
      };
      const upgradeToPlan = g(plan, 'can_upgrade_to');
      if (g(upgradeToPlan, '_id')) {
        setSubscriptionData(upgradeToPlan, true);
      }

      if (!!isUpgradePlan) {
        setUpgradePlans([...upgradePlans, subscription]);
      }
      return subscription;
    } catch (e) {}
  };

  const getEllipseBulletPoint = (text: string, index: number, isExpired: boolean) => {
    return (
      <View style={[styles.ellipseBulletContainer, index === 2 ? { width: '75%' } : {}]}>
        <EllipseBulletPoint style={styles.ellipseBullet} />
        <Text
          style={theme.viewStyles.text('B', 13, isExpired ? '#979797' : '#007C9D', 1, 20, 0.35)}
        >
          {text}
        </Text>
      </View>
    );
  };

  const renderCardBody = (
    benefits: PlanBenefits[],
    subscriptionName: string,
    isCanUpgradeToPlan: boolean,
    isExpired: boolean,
    isCorporate: boolean,
    planId?: string
  ) => {
    return (
      <View style={styles.subTextContainer}>
        <Text
          style={[
            theme.viewStyles.text('R', 12, isExpired ? '#979797' : '#000000', 1, 20, 0.35),
            { marginBottom: 5 },
          ]}
        >
          {isCanUpgradeToPlan ? `Key Benefits you get...` : `Benefits Available`}
        </Text>
        {benefits.slice(0, 3).map((value, index) => {
          return getEllipseBulletPoint(value.headerContent, index, isExpired);
        })}
        <Text
          onPress={() => {
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: subscriptionName,
              isActive: isActive,
              isExpired: isExpired,
              comingFrom: 'My Memberships',
              isCorporatePlan: !!isCorporate,
              planId: planId || '',
              circleEventSource: 'My Account-My membership section',
            });
          }}
          style={styles.viewMoreText}
        >
          VIEW MORE
        </Text>
      </View>
    );
  };

  const fireCircleViewMoreWebengageEvent = () => {
    const circleMembershipType = setCircleMembershipType(
      circleSubscription?.startDate!,
      circleSubscription?.endDate!
    );
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.MY_MEMBERSHIP_VIEW_DETAILS_CLICKED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Circle Member': circleSubscriptionId ? 'Yes' : 'No',
      'Membership Type': circleMembershipType,
      'Circle Membership Start Date': circleSubscription?.startDate!,
      'Circle Membership End Date': circleSubscription?.endDate!,
    };
    postWebEngageEvent(
      WebEngageEventName.MY_MEMBERSHIP_VIEW_DETAILS_CLICKED,
      CircleEventAttributes
    );
  };

  const renderBottomButtons = (
    isActive: boolean,
    subscriptionName: string,
    isCanUpgradeToPlan: boolean,
    isCorporate: boolean,
    planId?: string
  ) => {
    const isCare = subscriptionName === Circle.planName;
    const buttonText = isCare
      ? isRenew
        ? 'RENEW NOW'
        : 'GO TO HOMEPAGE'
      : isCanUpgradeToPlan
      ? 'HOW TO AVAIL'
      : isActive
      ? 'EXPLORE'
      : 'ACTIVATE NOW';
    const premiumPlanName = premiumPlan?.name;

    const transactionValue =
      subscriptionName === upgradePlanName
        ? g(hdfcUserSubscriptions, 'upgradeTransactionValue')
        : subscriptionName === premiumPlanName
        ? hdfcUpgradeUserSubscriptions?.upgradeTransactionValue
        : 0;
    return (
      <View style={styles.membershipButtons}>
        <TouchableOpacity
          style={{ padding: 10 }}
          onPress={() => {
            if (!isCare) {
              const eventAttributes: WebEngageEvents[WebEngageEventName.HDFC_PLAN_DETAILS_VIEWED] = {
                'User ID': g(currentPatient, 'id'),
                Plan: subscription_name?.substring(0, subscription_name.indexOf('+')),
              };
              postWebEngageEvent(WebEngageEventName.HDFC_PLAN_DETAILS_VIEWED, eventAttributes);
            }
            if (isCare) {
              fireCircleViewMoreWebengageEvent();
            }

            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: subscriptionName,
              isActive: isActive,
              comingFrom: 'My Memberships',
              isCorporatePlan: !!isCorporate,
              planId: planId || '',
              circleEventSource: 'My Account-My membership section',
            });
          }}
        >
          <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>VIEW DETAILS</Text>
        </TouchableOpacity>
        {!isCorporate && (
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              if (isCanUpgradeToPlan) {
                const eventAttributes: WebEngageEvents[WebEngageEventName.HDFC_HOW_TO_AVAIL_CLICKED] = {
                  'User ID': g(currentPatient, 'id'),
                  Plan: subscription_name?.substring(0, subscription_name.indexOf('+')),
                };
                postWebEngageEvent(WebEngageEventName.HDFC_HOW_TO_AVAIL_CLICKED, eventAttributes);
                setUpgradeTransactionValue(transactionValue);
                setShowAvailPopup(true);
              } else if (isRenew) {
                setShowCirclePlans(true);
              } else {
                props.navigation.navigate(AppRoutes.ConsultRoom, {});
                if (isActive && !isCare) {
                  const eventAttributes: WebEngageEvents[WebEngageEventName.HDFC_EXPLORE_PLAN_CLICKED] = {
                    'User ID': g(currentPatient, 'id'),
                    Plan: subscription_name?.substring(0, subscription_name.indexOf('+')),
                  };
                  postWebEngageEvent(WebEngageEventName.HDFC_EXPLORE_PLAN_CLICKED, eventAttributes);
                }
              }
            }}
          >
            <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderConsultPackageCards = () => {
    return (
      <View>
        {consultPlan?.map((pkg: any) => {
          return renderConsultPackageCard(pkg);
        })}
      </View>
    );
  };

  const renderConsultPackageCard = (pkg: any) => {
    return (
      <View style={styles.cardStyle}>
        <View style={styles.membershipCardContainer}>
          <Text style={[styles.planName, theme.viewStyles.text('B', 14, '#02475B', 1, 20, 0.35)]}>
            {pkg?.name}
          </Text>
        </View>
        {pkg?.benefits && pkg?.benefits?.length > 0 ? (
          <View style={styles.subTextContainer}>
            <Text
              style={[theme.viewStyles.text('R', 12, '#000000', 1, 20, 0.35), { marginBottom: 5 }]}
            >
              Key Benefits you get...
            </Text>
            {pkg?.benefits?.map((benefit: any, i: number) => {
              return getEllipseBulletPoint(benefit?.header_content, i, false);
            })}
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.membershipButtons, { padding: 10, marginBottom: -1 }]}
          onPress={() => {
            props.navigation.navigate(AppRoutes.ConsultPackagePostPurchase, {
              planId: pkg?.sub_plan_id,
              onSubscriptionCancelled: () => {
                props.navigation.goBack();
              },
            });
          }}
        >
          <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>VIEW DETAILS</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCorporateMembershipCards = () => {
    return (
      <View>
        {corporateSubscriptions?.map((subscription: SubscriptionData) => {
          return renderMembershipCard(
            subscription,
            false,
            true,
            subscription?.corporateIcon,
            subscription?.planId
          );
        })}
      </View>
    );
  };

  const renderMembershipCard = (
    subscription: any,
    isCanUpgradeToPlan: boolean,
    isCorporate?: boolean,
    corporateIcon?: string,
    planId?: string
  ) => {
    const planBenefits = subscription?.benefits;
    const isCare = subscription?.name === Circle.planName;
    const isactive = isCare ? true : subscription?.isActive;
    const isCircleExpiredPlan =
      isCare && subscription?.subscriptionStatus === Circle.EXPIRED_STATUS;
    return (
      <View style={styles.cardStyle}>
        {isCircleExpiredPlan && <ExpiredBanner style={styles.expiredBanner} />}
        <View style={styles.healthyLifeContainer}>
          {!isCare && !isCorporate && (
            <Text style={theme.viewStyles.text('B', 12, '#164884', 1, 20, 0.35)}>
              #ApolloHealthyLife
            </Text>
          )}
          {!isCorporate &&
            (isCare ? (
              <CircleLogo style={styles.circleLogo} />
            ) : (
              <HdfcBankLogo style={styles.hdfcLogo} />
            ))}
        </View>
        <View style={styles.membershipCardContainer}>
          <Text
            style={[
              styles.planName,
              theme.viewStyles.text(
                'B',
                14,
                isCircleExpiredPlan ? '#979797' : '#02475B',
                1,
                20,
                0.35
              ),
            ]}
          >
            {subscription?.name}
          </Text>
          {!isCare && !isCorporate && (isCanUpgradeToPlan || !isActive) ? (
            <LockIcon style={styles.lockIcon} />
          ) : (
            <></>
          )}
          {!!isCorporate && !!corporateIcon && isValidImageUrl(corporateIcon) && (
            <Image
              style={styles.corporateIcon}
              source={{
                uri: corporateIcon,
              }}
              resizeMode={'contain'}
            />
          )}
        </View>
        {!!planBenefits?.length &&
          renderCardBody(
            planBenefits,
            subscription?.name,
            isCanUpgradeToPlan,
            isCircleExpiredPlan,
            !!isCorporate,
            planId
          )}
        {isCircleExpiredPlan || isRenew
          ? renderUpgradeButton()
          : renderBottomButtons(
              isactive,
              subscription?.name,
              isCanUpgradeToPlan,
              !!isCorporate,
              planId
            )}
      </View>
    );
  };

  const renderCorporateCard = () => {
    return (
      <View style={styles.cardStyle}>
        <View style={styles.healthyLifeContainer}>
          <Text style={[styles.planName, theme.viewStyles.text('B', 14, '#02475B', 1, 20, 0.35)]}>
            CORPORATE MEMBERSHIP
          </Text>
          <ImageBackground
            source={{
              uri: corporatePlan?.[0]?.group_logo_url?.mobile_version,
            }}
            resizeMode="contain"
            style={styles.corpLogo}
          />
        </View>
        <View style={styles.subTextContainer}>
          <Text
            style={[theme.viewStyles.text('R', 12, '#000000', 1, 20, 0.35), { marginBottom: 5 }]}
          >
            Key Benefits you get...
          </Text>
          {corporatePlan.map((value: any, i: number) => {
            return getEllipseBulletPoint(value.name, i, false);
          })}
        </View>
        <TouchableOpacity
          style={[styles.membershipButtons, { padding: 10, marginBottom: -1 }]}
          onPress={() => {
            Linking.openURL('https://www.apollo247.com/my-membership').catch((e: any) =>
              CommonBugFender(`${AppRoutes.MyMembership}_Linking.openURL`, e)
            );
          }}
        >
          <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>
            VIEW DETAILS ON WEB
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderUpgradeButton = () => {
    return (
      <TouchableOpacity
        style={[styles.membershipButtons, { padding: 10 }]}
        onPress={() => {
          setShowCirclePlans(true);
          postCircleWEGEvent(
            currentPatient,
            'Expired',
            'renew',
            circlePlanValidity,
            circleSubscriptionId,
            'My Membership'
          );
        }}
      >
        <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>RENEW NOW</Text>
      </TouchableOpacity>
    );
  };

  const renderAvailNowPopup = () => {
    return (
      <AvailNowPopup
        onClose={() => setShowAvailPopup(false)}
        transactionAmount={upgradeTransactionValue}
        planName={upgradePlanName}
        navigation={props.navigation}
      />
    );
  };

  const renderActivateCorporateCta = () => {
    return (
      <View style={styles.activateMembershipCtaContainer}>
        <View style={[styles.separatorStyle, styles.activateSeparator]} />
        <Button
          title={'ACTIVATE CORPORATE MEMBERSHIP'}
          onPress={() => {
            props.navigation.navigate(AppRoutes.ActivateCorporateMembership);
          }}
          titleTextStyle={styles.corporateCtaText}
          style={styles.corporateCta}
        />
      </View>
    );
  };

  const renderNoMembershipText = () => {
    return (
      <Text style={[styles.currentBenefits, styles.npMembershipText]}>
        You do not have any Membership Subscriptions currenly.
      </Text>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'MY MEMBERSHIP'}
          container={styles.headerContainer}
          onPressLeftIcon={() => handleBack()}
        />

        {showCircleActivation && renderCircleMembershipActivated()}
        {showCirclePlans && renderCircleSubscriptionPlans()}
        <ScrollView bounces={false} style={{ marginBottom: 100 }}>
          <View>
            <View>
              {!!hdfcUserSubscriptions?._id ||
              !!corporateSubscriptions?.length ||
              !!consultPlan?.length ||
              isCircleExpired ? (
                <Text style={styles.currentBenefits}>CURRENT BENEFITS</Text>
              ) : (
                renderNoMembershipText()
              )}
              {(!!circleSubscriptionId || isCircleExpired) &&
              circleSubscription?.planId === 'CIRCLEPlan'
                ? renderMembershipCard(circleSubscription, false)
                : null}
              {hdfcUserSubscriptions?._id
                ? renderMembershipCard(hdfcUserSubscriptions, false)
                : null}
              {!!corporateSubscriptions?.length && renderCorporateMembershipCards()}

              {!!consultPlan?.length ? renderConsultPackageCards() : null}
            </View>
            {canUpgrade && (
              <View>
                <Text style={styles.otherPlans}>OTHER PLANS</Text>
                {hdfcUpgradeUserSubscriptions.map((subscription: SubscriptionData) => {
                  return renderMembershipCard(subscription, true);
                })}
                <View style={{ marginTop: 15 }} />
              </View>
            )}
          </View>
        </ScrollView>
        {showAvailPopup && renderAvailNowPopup()}
        {showSpinner && <Spinner />}
      </SafeAreaView>
      {corporateSubscriptions?.length == 0 && renderActivateCorporateCta()}
    </View>
  );
};
