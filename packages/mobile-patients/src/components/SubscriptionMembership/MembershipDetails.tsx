import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  DownOrange,
  UpOrange,
  EllipseBulletPoint,
  ExclamationGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { HdfcConnectPopup } from './HdfcConnectPopup';
import { Hdfc_values } from '@aph/mobile-patients/src/strings/strings.json';
import {
  useAppCommonData,
  CirclePlanSummary,
  CircleGroup,
  PlanBenefits,
  BenefitCtaAction,
  CicleSubscriptionData,
  GroupPlan,
  SubscriptionData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  g,
  postWebEngageEvent,
  setCircleMembershipType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AvailNowPopup } from './AvailNowPopup';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  WebEngageEvents,
  WebEngageEventName,
  HdfcBenefitInfo,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { MembershipBanner } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/MembershipBanner';
import { InactivePlanBenefits } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/InactivePlanBenefits';
import { TermsAndConditions } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/TermsAndConditions';
import { WhatWillYouGet } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/WhatWillYouGet';
import { CouponsUnlocked } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/CouponsUnlocked';
import { CardContent } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/CardContent';
import { BenefitsConsumedTab } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/BenefitsConsumedTab';
import { CircleSavings } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/CircleSavings';
import { FAQComponent } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/FAQComponent';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';
import { UserConstentPopup } from '@aph/mobile-patients/src/components/SubscriptionMembership/UserConsentPopup';
import { DiabeticQuestionairePopup } from '@aph/mobile-patients/src/components/SubscriptionMembership/DiabeticQuestionairePopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useApolloClient } from 'react-apollo-hooks';
import {
  addDiabeticQuestionnaire,
  addDiabeticQuestionnaireVariables,
} from '@aph/mobile-patients/src/graphql/types/addDiabeticQuestionnaire';
import {
  ADD_DIABETIC_QUESTIONNAIRE,
  GET_CIRCLE_SAVINGS_OF_USER_BY_MOBILE,
  GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 10,
    marginVertical: 4,
    padding: 16,
  },
  tabsContainer: {
    ...theme.viewStyles.cardViewStyle,
    elevation: 4,
    borderRadius: 0,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
    marginTop: 15,
  },
  arrowStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  sectionsHeading: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eligibleText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 17, 0.35),
    width: '90%',
  },
  horizontalLine: {
    marginVertical: 20,
    borderTopColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopWidth: 1,
  },
  redeemButtonText: {
    ...theme.viewStyles.text('B', 15, '#FC9916', 1, 20, 0.35),
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  redeemableCardsHeading: {
    ...theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0.35),
    width: '80%',
    marginBottom: 10,
  },
  redeemableCardsText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 20, 0.35),
    width: '75%',
  },
  bulletPointsContainer: {
    width: '75%',
    marginBottom: 5,
  },
  ellipseBulletPointStyle: {
    resizeMode: 'contain',
    width: 7,
    height: 7,
    alignSelf: 'center',
    marginRight: 10,
  },
  bottomContainer: {
    backgroundColor: '#FC9916',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  howToAvail: {
    flexDirection: 'row',
    marginTop: 15,
    width: '80%',
  },
  oneVectorStyle: {
    marginRight: 10,
    marginTop: 5,
  },
  bulletStyle: {
    resizeMode: 'contain',
    width: 10,
    height: 10,
    alignSelf: 'center',
    marginRight: 10,
  },
  safeAreaStyle: {
    flex: 1,
    backgroundColor: theme.colors.CARD_BG,
  },
  inactivePlanText: {
    ...theme.viewStyles.text('M', 13, '#EA5F65', 1, 17, 0.35),
  },
  benefitsAvailableHeading: {
    ...theme.viewStyles.text('B', 17, '#02475B', 1, 20, 0.35),
    paddingHorizontal: 20,
  },
  membershipBanner: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
  },
  circleIconsStyle: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export interface MembershipDetailsProps extends NavigationScreenProps {
  membershipType: string;
  isActive: boolean;
}

export const MembershipDetails: React.FC<MembershipDetailsProps> = (props) => {
  const membershipType = props.navigation.getParam('membershipType');
  const isCirclePlan = membershipType === Circle.planName;

  const {
    hdfcUserSubscriptions,
    circleSubscription,
    hdfcUpgradeUserSubscriptions,
    totalCircleSavings,
    setTotalCircleSavings,
    setHdfcUserSubscriptions,
    setCircleSubscription,
    setHdfcUpgradeUserSubscriptions,
  } = useAppCommonData();
  const {
    setHdfcPlanName,
    setIsFreeDelivery,
    setIsCircleSubscription,
    circleSubscriptionId,
    hdfcSubscriptionId,
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const planName = g(hdfcUserSubscriptions, 'name');
  const plan = planName?.substring(0, planName?.indexOf('+'));
  const upgradePlanName = hdfcUpgradeUserSubscriptions[0]?.name;
  const premiumPlanName = hdfcUpgradeUserSubscriptions[1]?.name;
  const membershipDetails =
    membershipType === planName ? hdfcUserSubscriptions : hdfcUpgradeUserSubscriptions;
  const isCanUpgradeTo = membershipType === upgradePlanName || membershipType === premiumPlanName;
  const isActivePlan = !!membershipDetails?.isActive;
  const benefits = isCanUpgradeTo
    ? hdfcUpgradeUserSubscriptions[0]?.benefits
    : membershipDetails?.benefits;
  const coupons = isCanUpgradeTo
    ? hdfcUpgradeUserSubscriptions[1]?.coupons
    : membershipDetails?.coupons;
  const areBenefitsAvailable = !!benefits?.length;
  const areCouponsAvailable = !!coupons?.length;
  const [selectedTab, setSelectedTab] = useState<string>('Benefits Available');
  const [isActiveCouponVisible, setIsActiveCouponVisible] = useState<boolean>(true);
  const [isHowToAvailVisible, setIsHowToAvailVisible] = useState<boolean>(true);
  const [showHdfcConnectPopup, setShowHdfcConnectPopup] = useState<boolean>(false);
  const [showAvailPopup, setShowAvailPopup] = useState<boolean>(false);
  const [benefitId, setBenefitId] = useState<string>('');
  const [showUserConstentPopUp, setShowUserConsentPopup] = useState<boolean>(false);
  const [showDiabeticQuestionaire, setShowDiabeticQuestionaire] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [upgradePlans, setUpgradePlans] = useState<SubscriptionData[]>([]);
  const client = useApolloClient();

  useEffect(() => {
    fetchCircleSavings();
    getUserSubscriptionsWithBenefits();
  }, []);

  useEffect(() => {
    if (upgradePlans.length) {
      setHdfcUpgradeUserSubscriptions && setHdfcUpgradeUserSubscriptions(upgradePlans);
    }
  }, [upgradePlans]);

  const getUserSubscriptionsWithBenefits = () => {
    setLoading(true);
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
          setLoading(false);
          const groupPlans = g(
            data,
            'data',
            'GetAllUserSubscriptionsWithPlanBenefitsV2',
            'response'
          );
          if (groupPlans) {
            const hdfcPlan = groupPlans?.HDFC;
            const circlePlan = groupPlans?.APOLLO;

            if (hdfcPlan) {
              const hdfcSubscription = setSubscriptionData(hdfcPlan[0]);
              setHdfcUserSubscriptions && setHdfcUserSubscriptions(hdfcSubscription);

              const subscriptionName = g(hdfcSubscription, 'name')
                ? g(hdfcSubscription, 'name')
                : '';
              if (g(hdfcSubscription, 'isActive')) {
                setHdfcPlanName && setHdfcPlanName(subscriptionName);
              }
              if (
                subscriptionName === Hdfc_values.PLATINUM_PLAN &&
                !!g(hdfcSubscription, 'isActive')
              ) {
                setIsFreeDelivery && setIsFreeDelivery(true);
              }
            }

            if (circlePlan) {
              const circleSubscription = setCircleSubscriptionData(circlePlan[0]);
              if (!!circlePlan[0]?._id) {
                setIsCircleSubscription && setIsCircleSubscription(true);
              }
              setCircleSubscription && setCircleSubscription(circleSubscription);
            }
          }
        })
        .catch((e) => {
          setLoading(false);
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

  const setSubscriptionData = (plan: any, isUpgradePlan?: boolean) => {
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
      };
      const upgradeToPlan = g(plan, 'can_upgrade_to');
      if (g(upgradeToPlan, '_id')) {
        setSubscriptionData(upgradeToPlan, true);
      }

      if (!!isUpgradePlan) {
        setUpgradePlans([...upgradePlans, subscription]);
      }
      return subscription;
    } catch (e) {
      console.log('ERROR: ', e);
    }
  };

  const fetchCircleSavings = async () => {
    setLoading(true);
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      CommonBugFender('MyMembership_fetchCircleSavings', error);
    }
  };

  const upgradeTransactionValue =
    membershipType === upgradePlanName
      ? g(hdfcUserSubscriptions, 'upgradeTransactionValue')
      : membershipType === premiumPlanName
      ? hdfcUpgradeUserSubscriptions[0]?.upgradeTransactionValue
      : 0;

  const renderTabComponent = () => {
    return (
      <ScrollView bounces={false}>
        {renderMembershipBanner()}
        {renderCoupons()}
        <TabsComponent
          style={styles.tabsContainer}
          onChange={(title) => {
            setSelectedTab(title);
          }}
          data={[{ title: 'Benefits Available' }, { title: 'Benefits Consumed' }]}
          selectedTab={selectedTab}
          selectedTitleStyle={theme.viewStyles.text('B', 16, '#02475B')}
        />
        {selectedTab == 'Benefits Available' ? renderBenefitsAvailable() : renderBenefitsConsumed()}
      </ScrollView>
    );
  };

  const renderActivePlans = () => {
    return (
      areBenefitsAvailable &&
      benefits.map((value) => {
        const {
          headerContent,
          description,
          ctaLabel,
          benefitCtaAction,
          icon,
          availableCount,
        } = value;
        const { action, message, type, webEngageEvent } = benefitCtaAction;
        const ctaLabelName = ctaLabel.toUpperCase();
        return renderRedeemableCards(
          headerContent,
          description,
          ctaLabelName,
          action,
          message,
          type,
          icon,
          availableCount,
          value._id,
          webEngageEvent
        );
      })
    );
  };

  const renderBenefitsAvailable = () => {
    return (
      <ScrollView
        contentContainerStyle={{
          padding: 10,
          backgroundColor: '#FFFFFF',
        }}
        bounces={false}
      >
        {isActivePlan ? (
          renderActivePlans()
        ) : (
          <InactivePlanBenefits benefits={benefits} isActivePlan={isActivePlan} />
        )}

        {renderTermsAndConditions()}
      </ScrollView>
    );
  };

  const renderTermsAndConditions = () => <TermsAndConditions isCirclePlan={isCirclePlan} />;

  const renderRedeemableCards = (
    heading: string,
    bodyText: string,
    ctaLabel: string,
    action: string,
    message: string,
    type: string,
    icon: string | null,
    availableCount: number,
    id: string,
    webengageevent: string
  ) => {
    return (
      <View style={[styles.cardStyle, { marginVertical: 10 }]}>
        <CardContent
          heading={heading}
          bodyText={bodyText}
          icon={icon}
          isActivePlan={isActivePlan}
        />
        {ctaLabel !== 'NULL' && (
          <TouchableOpacity
            onPress={() => {
              handleCtaClick(type, action, message, availableCount, id, webengageevent);
            }}
          >
            <Text style={styles.redeemButtonText}>{ctaLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: 'Hi',
      description: message,
      onPressOk: () => {
        hideAphAlert!();
      },
    });
  };

  const handleWebengageEvents = (event: string) => {
    const eventAttributes: HdfcBenefitInfo = {
      Plan: plan,
      'User ID': g(currentPatient, 'id'),
    };
    const eventName = Hdfc_values.WEBENGAGE_EVENT_NAMES;
    if (event === eventName.HDFCDocOnCallClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_DOC_ON_CALL_CLICK, eventAttributes);
    } else if (event === eventName.HDFCCovidCareClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_COVID_CARE_CLICK, eventAttributes);
    } else if (event === eventName.HDFCDigitizationPHRClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_DIGITIZATION_PHR_CLICK, eventAttributes);
    } else if (event === eventName.HDFCConciergeClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_CONCIERGE_CLICK, eventAttributes);
    } else if (event === eventName.HDFCDietitianClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_DIETITIAN_CLICK, eventAttributes);
    } else if (event === eventName.HDFCDiagnosticClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_DIAGNOSTIC_CLICK, eventAttributes);
    } else if (event === eventName.HDFCDigitalVaultClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_DIGITAL_VAULT_CLICK, eventAttributes);
    } else if (event === eventName.HDFC7000DoctorsClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_7000_DOCTORS_CLICK, eventAttributes);
    } else if (event === eventName.HDFCFreeMedClick) {
      postWebEngageEvent(WebEngageEventName.HDFC_FREE_MED_CHECK_CLICK, eventAttributes);
    }
  };

  const handleCircleWebengageEvents = (attribute: string) => {
    const circleMembershipType = setCircleMembershipType(
      circleSubscription?.startDate!,
      circleSubscription?.endDate!
    );
    const circleEventAttributes: WebEngageEvents[WebEngageEventName.MY_MEMBERSHIP_VIEW_DETAILS_CLICKED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Circle Member': circleSubscriptionId ? 'Yes' : 'No',
      'Membership Type': circleMembershipType,
      'Circle Membership Start Date': circleSubscription?.startDate!,
      'Circle Membership End Date': circleSubscription?.endDate!,
    };

    const attributeName = string.circleMembershipBenefits;
    if (attribute == attributeName.PHARMA_CASHBACK) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_PHARMACY_CASHBACK_BENEFITS_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.FREE_DELIVERY) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_FREE_DELIVERY_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.DOCTOR_HELPLINE) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_DOCTOR_HELPLINE_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.DIAGNOSTICS_SAMPLE_COLLECTION) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_DIAGNOSTICS_HOME_SAMPLE_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.DIAGNOSTICS_DISCOUNT) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_DIAGNOSTICS_DISCOUNTS_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.DOC_ON_CALL) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_DOC_ON_CALL_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.PRO_HEALTH) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_PRO_HEALTH_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.ADVANCE_DIABETES) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_ADVANCED_DIABETES_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.COVID_CARE) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_COVID_CARE_CLICKED,
        circleEventAttributes
      );
    } else if (attribute === attributeName.DIGITALIZATION_PHR) {
      postWebEngageEvent(
        WebEngageEventName.MY_MEMBERSHIP_DIGITALIZATION_OF_PHR_CLICKED,
        circleEventAttributes
      );
    }
  };

  const handleCtaClick = (
    type: string,
    action: string,
    message: string,
    availableCount: number,
    id: string,
    webengageevent: string | null,
    attribute: string
  ) => {
    if (webengageevent) {
      handleWebengageEvents(webengageevent);
      const eventAttributes: WebEngageEvents[WebEngageEventName.HDFC_REDEEM_CLICKED] = {
        'User ID': g(currentPatient, 'id'),
        Benefit: type == Hdfc_values.WHATSAPP_OPEN_CHAT ? type : action,
      };
      postWebEngageEvent(WebEngageEventName.HDFC_REDEEM_CLICKED, eventAttributes);
    }

    if (isCirclePlan) {
      handleCircleWebengageEvents(attribute);
    }

    if (type == Hdfc_values.REDIRECT) {
      if (action == Hdfc_values.SPECIALITY_LISTING) {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      } else if (action == Hdfc_values.PHARMACY_LANDING) {
        props.navigation.navigate('MEDICINES');
      } else if (action == Hdfc_values.PHR) {
        props.navigation.navigate('HEALTH RECORDS');
      } else if (action == Hdfc_values.DOC_LISTING_WITH_PAYROLL_DOCS_SELECTED) {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      } else if (action == Hdfc_values.DIAGNOSTICS_LANDING) {
        props.navigation.navigate('TESTS');
      } else if ((action = Hdfc_values.DIETECIAN_LANDING)) {
        props.navigation.navigate('DoctorSearchListing', {
          specialities: Hdfc_values.DIETICS_SPECIALITY_NAME,
        });
      }
    } else if (type == Hdfc_values.CALL_API) {
      if (action == Hdfc_values.CALL_EXOTEL_API) {
        if (availableCount > 0) {
          setBenefitId(id);
          setShowHdfcConnectPopup(true);
        } else {
          renderAlert(
            'Hey, looks like you have exhausted the monthly usage limit for this benefit. If you feel this is an error, please raise a ticket on the Help section.'
          );
        }
      }
    } else if (type == Hdfc_values.ADVANCED_DIABETES) {
      if (action == Hdfc_values.FILL_FORM) {
        setShowUserConsentPopup(true);
      }
    } else if (type == Hdfc_values.WHATSAPP_OPEN_CHAT) {
      Linking.openURL(`whatsapp://send?text=${message}&phone=91${action}`);
    } else {
      props.navigation.navigate(AppRoutes.ConsultRoom);
    }
  };

  const renderBenefitsConsumed = () => {
    const benefitsConsumed = benefits.filter((benefit) => {
      return benefit.attributeType?.type !== 'unlimited';
    });

    if (benefitsConsumed.length) {
      return <BenefitsConsumedTab benefitsConsumed={benefitsConsumed} />;
    } else {
      return <></>;
    }
  };

  const renderBottomContainer = () => {
    const buttonText = isCanUpgradeTo ? 'AVAIL NOW' : isActivePlan ? 'EXPLORE NOW' : 'ACTIVATE NOW';
    return (
      <TouchableOpacity
        style={styles.bottomContainer}
        onPress={() => {
          if (isCanUpgradeTo) {
            setShowAvailPopup(true);
          } else {
            props.navigation.navigate(AppRoutes.ConsultRoom, {});
          }
        }}
      >
        <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0.35)}>{buttonText}</Text>
      </TouchableOpacity>
    );
  };

  const renderSubscribeContent = () => {
    return (
      <ScrollView
        contentContainerStyle={{
          marginHorizontal: 10,
          paddingBottom: 20,
        }}
        bounces={false}
      >
        {renderMembershipBanner()}
        {areBenefitsAvailable && renderWhatWillYouGet()}
        {renderHowToAvail()}
      </ScrollView>
    );
  };

  const renderWhatWillYouGet = () => (
    <WhatWillYouGet benefits={benefits} getEllipseBulletPoint={getEllipseBulletPoint} />
  );

  const renderHowToAvail = () => {
    return (
      <View style={styles.cardStyle}>
        <TouchableOpacity
          onPress={() => {
            setIsHowToAvailVisible(!isHowToAvailVisible);
          }}
          style={styles.sectionsHeading}
        >
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <ExclamationGreen
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
                marginRight: 10,
              }}
            />
            <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0.35)}>
              How To Avail
            </Text>
          </View>
          {isHowToAvailVisible ? (
            <DownOrange style={styles.arrowStyle} />
          ) : (
            <UpOrange style={styles.arrowStyle} />
          )}
        </TouchableOpacity>
        {isHowToAvailVisible && renderHowToAvailContent()}
      </View>
    );
  };

  const renderHowToAvailContent = () => {
    const canUpgradeMembership = upgradePlanName;
    const smallCaseName = canUpgradeMembership ? canUpgradeMembership.toLowerCase() : '';
    const displayPlanName = !!smallCaseName
      ? smallCaseName.charAt(0).toUpperCase() + smallCaseName.slice(1)
      : ''; // capitalize first character
    return (
      <View
        style={{
          marginTop: 15,
        }}
      >
        <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>
          {`Complete transactions worth Rs.${upgradeTransactionValue} or more on the Apollo 24|7 app to unlock ${displayPlanName} membership​`}
        </Text>
      </View>
    );
  };

  const getEllipseBulletPoint = (text: string) => {
    return (
      <View style={{ flexDirection: 'row', marginBottom: 15 }}>
        <EllipseBulletPoint style={styles.bulletStyle} />
        <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>{text}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title={'SUBSCRIPTION DETAILS'}
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderInactivePlansContainer = () => {
    return (
      <ScrollView bounces={false}>
        {renderMembershipBanner()}
        {renderInactivePlanMessage()}
        <Text style={styles.benefitsAvailableHeading}>Benefits Available</Text>
        {renderBenefitsAvailable()}
      </ScrollView>
    );
  };

  const renderInactivePlanMessage = () => {
    return (
      <View
        style={[
          styles.cardStyle,
          {
            marginHorizontal: 20,
            marginBottom: 20,
          },
        ]}
      >
        <Text style={theme.viewStyles.text('M', 14, '#02475B', 1, 17, 0.35)}>
          Complete your first transaction to unlock your benefits
        </Text>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, '#02475B', 1, 27, 0.35),
            marginTop: 5,
          }}
        >
          How to Unlock
        </Text>
        <Text
          style={{
            ...theme.viewStyles.text('R', 13, '#007C9D', 1, 17, 0.35),
            marginTop: 6,
          }}
        >
          {`Make a single transaction worth Rs ${membershipDetails?.minTransactionValue} or more on Virtual Consultations or Pharmacy Orders`}
        </Text>
      </View>
    );
  };

  const renderCoupons = () => {
    return areCouponsAvailable && <CouponsUnlocked coupons={coupons} />;
  };

  const renderMembershipBanner = () => <MembershipBanner membershipType={membershipType} />;

  const renderHdfcMembershipDetails = () => {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          {isCanUpgradeTo
            ? renderSubscribeContent()
            : isActivePlan
            ? renderTabComponent()
            : renderInactivePlansContainer()}
        </ScrollView>
        {renderBottomContainer()}
      </View>
    );
  };

  const onPressUserConsent = () => {
    setShowUserConsentPopup(false);
    setShowDiabeticQuestionaire(true);
  };

  const submitQuestionaire = (type: string, duration: string) => {
    setLoading!(true);
    client
      .mutate<addDiabeticQuestionnaire, addDiabeticQuestionnaireVariables>({
        mutation: ADD_DIABETIC_QUESTIONNAIRE,
        variables: {
          addDiabeticQuestionnaireInput: {
            patientId: g(currentPatient, 'id'),
            plan: circleSubscription?.name,
            diabetic_type: type,
            diabetic_year: duration,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setLoading!(false);
        const getResponse = g(response, 'data', 'addDiabeticQuestionnaire');
        if (getResponse?.success) {
          setShowDiabeticQuestionaire(false);
          showAphAlert!({
            title: 'Thanks!',
            description: 'Your information has been submitted',
          });
        }
      })
      .catch((error) => {
        setLoading!(false);
        setShowDiabeticQuestionaire(false);
        console.log(error);
        showAphAlert!({
          title: string.common.uhOh,
          description: 'Error while connecting to the Doctor, Please try again',
        });
      });
  };

  const renderCircleBenefits = (circleBenefits: any) => {
    const totalSavingsDone = totalCircleSavings?.totalSavings! + totalCircleSavings?.callsUsed!;
    return circleBenefits?.map((value: any) => {
      const {
        headerContent,
        description,
        benefitCtaAction,
        icon,
        availableCount,
        _id,
        attribute,
      } = value;
      const { action, message, type, webEngageEvent } = benefitCtaAction;
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            handleCtaClick(type, action, message, availableCount, _id, null, attribute);
          }}
          style={[styles.cardStyle, { marginVertical: 10 }]}
        >
          <CardContent
            heading={headerContent}
            bodyText={description}
            icon={icon}
            isActivePlan={true}
          />
        </TouchableOpacity>
      );
    });
  };

  const renderCirclePlan = () => {
    return (
      <ScrollView bounces={false}>
        {renderMembershipBanner()}
        <CircleSavings navigation={props.navigation} />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            padding: 15,
          }}
        >
          <Text style={theme.viewStyles.text('M', 14, '#02475B', 1, 18, 0.35)}>
            AVAILABLE BENEFITS
          </Text>
          {renderCircleBenefits(circleSubscription?.benefits)}
          <FAQComponent />
          {renderTermsAndConditions()}
        </View>
      </ScrollView>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeAreaStyle}>
        {renderHeader()}
        {isCirclePlan ? renderCirclePlan() : renderHdfcMembershipDetails()}
      </SafeAreaView>
      {showHdfcConnectPopup && (
        <HdfcConnectPopup
          onClose={() => setShowHdfcConnectPopup(false)}
          benefitId={benefitId || ''}
          successCallback={() => {
            getUserSubscriptionsWithBenefits();
          }}
          userSubscriptionId={hdfcSubscriptionId}
        />
      )}
      {showAvailPopup && (
        <AvailNowPopup
          onClose={() => setShowAvailPopup(false)}
          transactionAmount={upgradeTransactionValue}
          planName={upgradePlanName}
          navigation={props.navigation}
        />
      )}
      {showUserConstentPopUp ? (
        <UserConstentPopup
          heading={Hdfc_values.DIABETES_CONSENT.HEADING}
          subHeading={Hdfc_values.DIABETES_CONSENT.SUBHEADING}
          ctaText={Hdfc_values.DIABETES_CONSENT.CTA}
          onClose={() => setShowUserConsentPopup(false)}
          onPressConfirm={() => {
            onPressUserConsent();
          }}
          navigation={props.navigation}
        />
      ) : null}
      {showDiabeticQuestionaire ? (
        <DiabeticQuestionairePopup
          heading={Hdfc_values.ADVANCE_DIABETES_QUESTIONAIRE.HEADING}
          subHeading={Hdfc_values.ADVANCE_DIABETES_QUESTIONAIRE.SUBHEADING}
          ctaText={Hdfc_values.ADVANCE_DIABETES_QUESTIONAIRE.CTA}
          questions={Hdfc_values.ADVANCE_DIABETES_QUESTIONAIRE.QUESTIONAIRE}
          onClose={() => setShowDiabeticQuestionaire(false)}
          onPressSubmit={(typeOfDiabetes, durationOfDiabetes) =>
            submitQuestionaire(typeOfDiabetes, durationOfDiabetes)
          }
          navigation={props.navigation}
        />
      ) : null}
      {loading && <Spinner />}
    </View>
  );
};
