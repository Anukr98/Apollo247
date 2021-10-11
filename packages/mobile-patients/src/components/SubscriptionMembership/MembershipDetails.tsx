import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Image,
} from 'react-native';
import {
  NavigationScreenProps,
  ScrollView,
  StackActions,
  NavigationActions,
} from 'react-navigation';
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
import { Hdfc_values, Circle } from '@aph/mobile-patients/src/strings/strings.json';
import {
  useAppCommonData,
  CirclePlanSummary,
  CircleGroup,
  PlanBenefits,
  BenefitCtaAction,
  CicleSubscriptionData,
  GroupPlan,
  SubscriptionData,
  CorporateBenefits,
  CorporateSubscriptionData,
  CorporateFaq,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  CircleEventSource,
  g,
  getUserType,
  postCleverTapEvent,
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
import {
  CommonBugFender,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';
import AsyncStorage from '@react-native-community/async-storage';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CircleMembershipActivation } from '@aph/mobile-patients/src/components/ui/CircleMembershipActivation';
import { fireCirclePurchaseEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { postCircleWEGEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
import { getCorporateMembershipData } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

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
  corporatePlanStyle: {
    backgroundColor: theme.colors.WHITE,
    padding: 10,
  },
  corporateImageStyle: {
    width: 100,
    height: 65,
    resizeMode: 'contain',
    marginBottom: 7,
  },
  corporateBanner: {
    width: 200,
    height: 180,
    resizeMode: 'contain',
  },
  benefitsAvailableContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  subscribeContent: {
    marginHorizontal: 10,
    paddingBottom: 20,
  },
  flexRow: {
    flexDirection: 'row',
  },
  excalmationIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },
});

export interface MembershipDetailsProps extends NavigationScreenProps {
  membershipType: string;
  isActive: boolean;
  source?: string;
  isRenew: boolean;
  isExpired?: boolean;
  comingFrom?: string;
  isCorporatePlan?: boolean;
  planId?: string;
  circleEventSource?: CircleEventSource;
}

export const MembershipDetails: React.FC<MembershipDetailsProps> = (props) => {
  const [membershipType, setMembershipType] = useState(props.navigation.getParam('membershipType'));
  const comingFrom = props.navigation.getParam('comingFrom');
  const isCorporatePlan = props.navigation.getParam('isCorporatePlan');
  const circleEventSource = props.navigation.getParam('circleEventSource');
  const [planId, setPlanId] = useState(props.navigation.getParam('planId'));
  const isCirclePlan = membershipType === Circle.planName;
  const source = props.navigation.getParam('source');
  const isExpired = props.navigation.getParam('isExpired');
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(false);
  const [showCircleActivation, setShowCircleActivation] = useState<boolean>(false);
  const {
    hdfcUserSubscriptions,
    circleSubscription,
    hdfcUpgradeUserSubscriptions,
    totalCircleSavings,
    setTotalCircleSavings,
    setHdfcUserSubscriptions,
    setCircleSubscription,
    setHdfcUpgradeUserSubscriptions,
    healthCredits,
    isRenew,
    corporateSubscriptions,
    setCorporateSubscriptions,
  } = useAppCommonData();
  const {
    setHdfcPlanName,
    setIsFreeDelivery,
    setIsCircleSubscription,
    circleSubscriptionId,
    hdfcSubscriptionId,
    circlePlanValidity,
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
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
  const [isHowToAvailVisible, setIsHowToAvailVisible] = useState<boolean>(true);
  const [showHdfcConnectPopup, setShowHdfcConnectPopup] = useState<boolean>(false);
  const [showAvailPopup, setShowAvailPopup] = useState<boolean>(false);
  const [benefitId, setBenefitId] = useState<string>('');
  const [showUserConstentPopUp, setShowUserConsentPopup] = useState<boolean>(false);
  const [showDiabeticQuestionaire, setShowDiabeticQuestionaire] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [upgradePlans, setUpgradePlans] = useState<SubscriptionData[]>([]);
  const client = useApolloClient();
  const planValidity = useRef<string>('');
  const planPurchased = useRef<boolean | undefined>(false);
  const [currentCorporatePlan, setCurrentCorporatePlan] = useState<CorporateSubscriptionData>(null);
  const [corporateIndex, setCorporateIndex] = useState<number>(-1);
  const [agreedToVaccineTnc, setAgreedToVaccineTnc] = useState<string>('');

  useEffect(() => {
    isCirclePlan && postViewCircleWEGEvent();
    fetchCircleSavings();
    getUserSubscriptionsWithBenefits();
    if (isCorporatePlan && planId) {
      getCorporateCMSData();
    }
  }, []);

  useEffect(() => {
    if (isCorporatePlan && planId) {
      getCorporateCMSData();
    }
  }, [planId]);

  useEffect(() => {
    if (upgradePlans.length) {
      setHdfcUpgradeUserSubscriptions && setHdfcUpgradeUserSubscriptions(upgradePlans);
    }
  }, [upgradePlans]);

  useEffect(() => {
    const checkVaccineTncAgreed = async () => {
      const hasAgreedVaccineTnC = await AsyncStorage.getItem('hasAgreedVaccineTnC');
      if (hasAgreedVaccineTnC) {
        setAgreedToVaccineTnc(hasAgreedVaccineTnC);
      }
    };
    checkVaccineTncAgreed();
  }, []);

  const getCorporateCMSData = async () => {
    try {
      setLoading(true);
      const res: any = await getCorporateMembershipData(planId);
      if (res?.data?.success) {
        const data = res?.data;
        const corporateData = data?.corporateData;
        const packageData = data?.packageData;
        const benefits = packageData?.packageBenefitData;
        const corporateFaqs = packageData?.packFAQs;
        const copyCorporateSubscriptions = [...corporateSubscriptions];
        const subscriptionIndex = corporateSubscriptions?.findIndex(
          (subscription) => subscription?.name === data?.packageData?.packName
        );
        setCorporateIndex(subscriptionIndex);
        let tempCorporateData = corporateSubscriptions[subscriptionIndex];
        let corporateBenefits: CorporateBenefits[] = [];
        if (benefits?.length) {
          benefits?.forEach((item: any) => {
            const benefit: CorporateBenefits = {
              benefitName: item?.benefitName,
              benefitShortDesc: item?.benefitShortDesc,
              benefitIdentifier: item?.benefitIdentifier,
              benefitImage: item?.benefitImage,
              benefitCTALabel: item?.benefitCTALabel,
              benefitCTAType: item?.benefitCTAType,
              benefitCTAAction: item?.benefitCTAAction?.meta?.actionMobile,
            };
            corporateBenefits.push(benefit);
          });
        }
        let faqs: CorporateFaq[] = [];
        if (corporateFaqs?.length) {
          corporateFaqs?.forEach((item: any) => {
            const faq = {
              faqQuestion: item?.packFaqQuestion,
              faqAnswer: item?.packFaqAnswer,
            };
            faqs.push(faq);
          });
        }
        const corporateDetails: CorporateSubscriptionData = {
          ...tempCorporateData,
          corporateName: corporateData?.corporateName,
          corporateLogo: corporateData?.corporateLogo,
          bannerImage: packageData?.packWebBanner, // need to change to packageData?.packMobileBanner
          packageName: packageData?.packName,
          bannerText: packageData?.packShortDesc,
          packFAQs: faqs,
          packageBenefitData: corporateBenefits,
        };
        setCurrentCorporatePlan(corporateDetails);
        copyCorporateSubscriptions[parseInt(subscriptionIndex)] = corporateDetails;
        setCorporateSubscriptions?.(copyCorporateSubscriptions);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      renderAlert('Something went wrong, please try again later', true);
      CommonBugFender('getCorporateCMSData_MembershipDetails', error);
    }
  };

  const postViewCircleWEGEvent = () => {
    postCircleWEGEvent(
      currentPatient,
      isExpired ? 'Expired' : isRenew ? 'About to Expire' : 'Not Expiring',
      'viewed',
      circlePlanValidity,
      circleSubscriptionId,
      comingFrom
    );
  };

  const handleBack = async () => {
    if (source) {
      props.navigation.navigate(AppRoutes.MyMembership, { source: source });
    } else {
      props.navigation.goBack();
    }
    return false;
  };

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

            let corporatePlan: SubscriptionData[] = [];
            Object.keys(groupPlans).forEach((plan_name) => {
              if (plan_name !== 'APOLLO' && plan_name !== 'HDFC') {
                groupPlans[plan_name]?.forEach((subscription: any) => {
                  const plan = setSubscriptionData(subscription, false, true);
                  corporatePlan.push(plan!);
                });
              }
            });
            if (corporatePlan.length) AsyncStorage.setItem('isCorporateSubscribed', 'yes');
            setCorporateSubscriptions && setCorporateSubscriptions(corporatePlan);

            if (hdfcPlan) {
              const hdfcSubscription = setSubscriptionData(hdfcPlan[0]);
              setHdfcUserSubscriptions && setHdfcUserSubscriptions(hdfcSubscription!);

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
              const circleSubscription = setCircleSubscriptionData(circlePlan?.[0]);
              fireCircleMembershipPageViewed(circlePlan?.[0]);
              if (!!circlePlan?.[0]?._id) {
                if (circlePlan?.[0]?.status === 'disabled') {
                  setIsCircleSubscription && setIsCircleSubscription(false);
                } else {
                  setIsCircleSubscription && setIsCircleSubscription(true);
                }
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

  const fireCircleMembershipPageViewed = (_circleData: any) => {
    const circlePriceAndDuration = _circleData?.plan_summary?.find(
      (_item: any) => _item?.subPlanId === circlePlanValidity?.plan_id
    );
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_MEMBERSHIP_PAGE_VIEWED] = {
      navigation_source: circleEventSource,
      circle_planid: circlePlanValidity?.plan_id,
      circle_end_date: circlePlanValidity?.endDate,
      circle_start_date: circlePlanValidity?.startDate,
      customer_id: currentPatient?.id,
      duration_in_month: circlePriceAndDuration?.durationInMonth,
      user_type: getUserType(allCurrentPatients),
      price: circlePriceAndDuration?.price,
      source_identifier: circlePlanValidity?.source_identifier,
      corporate_name: currentPatient?.partnerId,
    };
    postCleverTapEvent(CleverTapEventName.CIRCLE_MEMBERSHIP_PAGE_VIEWED, cleverTapEventAttributes);
  };

  const setCircleSubscriptionData = (plan: any) => {
    const planSummary: CirclePlanSummary[] = [];
    const summary = plan?.plan_summary;
    if (summary && summary.length) {
      summary.forEach((value: any) => {
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
      benefits.forEach((item: any) => {
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

  const setSubscriptionData = (plan: any, isUpgradePlan?: boolean, isCorporate?: boolean) => {
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
        benefits.forEach((item: any) => {
          const ctaAction = g(item, 'cta_action');
          if (
            g(ctaAction, 'meta', 'action') === string.common.CorporateVaccineBenefit &&
            isCorporatePlan
          ) {
            AsyncStorage.setItem('VaccinationCmsIdentifier', item?.cms_identifier);
            AsyncStorage.setItem('VaccinationSubscriptionId', plan?._id);
            setMembershipType(plan?.name);
            setPlanId(plan?.plan_id);
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
        isCorporate: !!isCorporate,
        corporateIcon: !!isCorporate ? plan?.group_logo_url?.mobile_version : '',
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
        (value: any) => value?.attribute === Circle.DOC_ON_CALL
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
      benefits?.map((value: any) => {
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
      <ScrollView contentContainerStyle={styles.benefitsAvailableContainer} bounces={false}>
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
              handleCtaClick(type, action, message, availableCount, id, webengageevent, '');
            }}
          >
            <Text style={styles.redeemButtonText}>{ctaLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAlert = (message: string, goBack?: boolean) => {
    showAphAlert!({
      title: 'Hi',
      description: message,
      onPressOk: () => {
        hideAphAlert!();
        if (goBack) props.navigation.goBack();
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

  const onPressHealthPro = async () => {
    const deviceToken = (await AsyncStorage.getItem('jwt')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';
    const healthProWithParams = AppConfig.Configuration.APOLLO_PRO_HEALTH_URL.concat(
      '&utm_token=',
      currentDeviceToken,
      '&utm_mobile_number=',
      currentPatient && g(currentPatient, 'mobileNumber') ? currentPatient.mobileNumber : ''
    );

    try {
      props.navigation.navigate(AppRoutes.CovidScan, {
        covidUrl: healthProWithParams,
      });
    } catch (e) {
      setBugFenderLog('CONSULT_ROOM_FAILED_OPEN_URL', healthProWithParams);
    }
  };

  const handleCtaClick = (
    type: string,
    action: string,
    message: string | null,
    availableCount: number | null,
    id: string | null,
    webengageevent: string | null,
    attribute: string | null,
    identifierCms?: string
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
      handleCircleWebengageEvents(attribute || '');
      fireCircleBenefitClickedEvents(action);
    }

    if (type == Hdfc_values.REDIRECT) {
      if (action === string.common.CorporateVaccineBenefit) {
        const currentBenefit = corporateSubscriptions[corporateIndex]?.benefits?.find(
          (value) => value?.cmsIdentifier === identifierCms
        );
        if (agreedToVaccineTnc === 'yes') {
          props.navigation.navigate(AppRoutes.BookedVaccineScreen, {
            cmsIdentifier: currentBenefit?.cmsIdentifier || '',
            subscriptionId: corporateSubscriptions[corporateIndex]?._id || '',
            isVaccineSubscription: true,
            isCorporateSubscription: true,
          });
        } else {
          props.navigation.navigate(AppRoutes.VaccineTermsAndConditions, {
            isCorporateSubscription: true,
          });
        }
      } else if (action == 'MEMBERSHIP_DETAIL_CIRCLE') {
        if (circleSubscriptionId) {
          props.navigation.push(AppRoutes.MembershipDetails, {
            membershipType: 'CIRCLE PLAN',
            isActive: circleSubscription?.groupDetails?.isActive,
            isExpired: circleSubscription?.subscriptionStatus === Circle.EXPIRED_STATUS,
            comingFrom: AppRoutes.MembershipDetails,
          });
        }
      } else if (action == Hdfc_values.SPECIALITY_LISTING) {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      } else if (action == Hdfc_values.PHARMACY_LANDING) {
        props.navigation.navigate(
          'MEDICINES',
          isCirclePlan ? { comingFrom: AppRoutes.MembershipDetails } : {}
        );
      } else if (action == Hdfc_values.PHR) {
        props.navigation.navigate('HEALTH RECORDS');
      } else if (action == Hdfc_values.DOC_LISTING_WITH_PAYROLL_DOCS_SELECTED) {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      } else if (action == Hdfc_values.DIAGNOSTICS_LANDING) {
        props.navigation.navigate(
          'TESTS',
          isCirclePlan ? { comingFrom: AppRoutes.MembershipDetails } : {}
        );
      } else if (action == Hdfc_values.DIETECIAN_LANDING) {
        props.navigation.navigate('DoctorSearchListing', {
          specialities: Hdfc_values.DIETICS_SPECIALITY_NAME,
        });
      } else if (action == Hdfc_values.PRO_HEALTH) {
        onPressHealthPro();
      } else {
        props.navigation.navigate(AppRoutes.ConsultRoom);
      }
    } else if (type == Hdfc_values.CALL_API) {
      if (action == Hdfc_values.CALL_EXOTEL_API) {
        if (availableCount && availableCount > 0) {
          setBenefitId(id || '');
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

  const fireCircleBenefitClickedEvents = (action: string) => {
    const circlePriceAndDuration = circleSubscription?.planSummary?.find(
      (_item) => _item?.subPlanId === circlePlanValidity?.plan_id
    );
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_BENIFIT_CLICKED] = {
      navigation_source: 'Circle Membership page',
      circle_planid: circlePlanValidity?.plan_id,
      circle_end_date: circlePlanValidity?.endDate,
      circle_start_date: circlePlanValidity?.startDate,
      customer_id: currentPatient?.id,
      duration_in_month: circlePriceAndDuration?.durationInMonth,
      user_type: getUserType(allCurrentPatients),
      price: circlePriceAndDuration?.price,
    };
    postCleverTapEvent(CleverTapEventName.CIRCLE_BENIFIT_CLICKED, cleverTapEventAttributes);
  };

  const renderBenefitsConsumed = () => {
    const benefitsConsumed = benefits?.filter((benefit: any) => {
      return benefit?.attributeType?.type !== 'unlimited';
    });

    if (benefitsConsumed?.length) {
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
      <ScrollView contentContainerStyle={styles.subscribeContent} bounces={false}>
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
          <View style={styles.flexRow}>
            <ExclamationGreen style={styles.excalmationIcon} />
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
        onPressLeftIcon={() => handleBack()}
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

  const renderMembershipBanner = () => (
    <MembershipBanner
      membershipType={membershipType}
      isExpired={isExpired}
      onRenewClick={() => {
        setShowCirclePlans(true);
        postCircleWEGEvent(
          currentPatient,
          isExpired ? 'Expired' : 'About to Expire',
          'renew',
          circlePlanValidity,
          circleSubscriptionId,
          'Membership Details Circle Banner'
        );
      }}
    />
  );

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
            if (!isExpired) {
              handleCtaClick(type, action, message, availableCount, _id, null, attribute);
            }
          }}
          style={[styles.cardStyle, { marginVertical: 10 }]}
        >
          <CardContent
            heading={headerContent}
            bodyText={description}
            icon={icon}
            isActivePlan={true}
            isExpired={isExpired}
          />
        </TouchableOpacity>
      );
    });
  };

  const renderCirclePlan = () => {
    return (
      <ScrollView bounces={false}>
        {renderMembershipBanner()}
        <CircleSavings
          navigation={props.navigation}
          isRenew={props.isRenew}
          isExpired={isExpired}
        />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            padding: 15,
          }}
        >
          <Text
            style={theme.viewStyles.text('M', 14, isExpired ? '#979797' : '#02475B', 1, 18, 0.35)}
          >
            AVAILABLE BENEFITS
          </Text>
          {renderCircleBenefits(circleSubscription?.benefits)}
          <FAQComponent data={Circle.FAQ} />
          {renderTermsAndConditions()}
        </View>
      </ScrollView>
    );
  };

  const renderCorporatePlan = () => {
    return (
      <ScrollView bounces={false}>
        {renderCorporateBanner()}
        <View style={styles.corporatePlanStyle}>
          {!!currentCorporatePlan?.packageBenefitData?.length && (
            <>
              <Text
                style={theme.viewStyles.text('SB', 15, '#02475B', 1, 30, 0.35)}
              >{`Dedicated benefits for You`}</Text>
              {renderCorporateBenefits()}
            </>
          )}
          {!!currentCorporatePlan?.packFAQs?.length && (
            <FAQComponent data={currentCorporatePlan?.packFAQs} />
          )}
        </View>
      </ScrollView>
    );
  };

  const renderCorporateBenefits = () => {
    return currentCorporatePlan?.packageBenefitData?.map((benefit: any) => {
      return (
        <View style={[styles.cardStyle, { marginVertical: 10 }]}>
          <CardContent
            heading={benefit?.benefitName}
            bodyText={benefit?.benefitShortDesc}
            icon={benefit?.benefitImage}
            isActivePlan={true}
            isExpired={false}
            imageStyle={styles.corporateImageStyle}
            isCorporateCard={true}
          />
          {!!benefit.benefitCTALabel && (
            <TouchableOpacity
              onPress={() => {
                handleCtaClick(
                  benefit?.benefitCTAType,
                  benefit?.benefitCTAAction,
                  null,
                  null,
                  null,
                  null,
                  null,
                  benefit?.benefitIdentifier
                );
              }}
            >
              <Text style={styles.redeemButtonText}>{benefit.benefitCTALabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    });
  };

  const renderCorporateBanner = () => {
    const corporateStyles = StyleSheet.create({
      bannerContainer: {
        flexDirection: 'row',
        backgroundColor: '#BDEDFF',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 10,
        height: 220,
      },
      infoContainer: { width: '50%' },
      corporateLogo: { width: 60, height: 40 },
      subTextContainer: {
        ...theme.viewStyles.text('SB', 18, '#02475B', 1, 30, 0.35),
        paddingVertical: 5,
      },
      bannerText: {
        ...theme.viewStyles.text('M', 15, '#02475B', 1, 18, 0.35),
        paddingBottom: 5,
      },
      packageName: {
        ...theme.viewStyles.text('SB', 19, '#02475B', 1, 25, 0.35),
        paddingTop: 10,
      },
    });
    return (
      <View style={corporateStyles.bannerContainer}>
        <View style={corporateStyles.infoContainer}>
          <Image
            style={corporateStyles.corporateLogo}
            source={{ uri: currentCorporatePlan?.corporateLogo }}
          />
          <Text style={corporateStyles.subTextContainer}>
            Hi
            <Text
              style={theme.viewStyles.text('SB', 18, '#3b8ca3', 1, 30, 0.35)}
            >{` ${currentPatient?.firstName}`}</Text>
            !
          </Text>
          <Text style={corporateStyles.bannerText}>{currentCorporatePlan?.bannerText}</Text>
          <Text style={corporateStyles.packageName}>{currentCorporatePlan?.packageName}</Text>
        </View>
        <Image style={styles.corporateBanner} source={{ uri: currentCorporatePlan?.bannerImage }} />
      </View>
    );
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
        from={string.banner_context.MEMBERSHIP_DETAILS}
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
        screenName={'Membership Details'}
        circleEventSource={'Membership Details'}
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
      from={string.banner_context.MEMBERSHIP_DETAILS}
      circleEventSource={'Membership Details'}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeAreaStyle}>
        {renderHeader()}
        {!loading &&
          (isCirclePlan
            ? renderCirclePlan()
            : isCorporatePlan
            ? renderCorporatePlan()
            : renderHdfcMembershipDetails())}
      </SafeAreaView>
      {showHdfcConnectPopup && (
        <HdfcConnectPopup
          onClose={() => setShowHdfcConnectPopup(false)}
          benefitId={benefitId || ''}
          successCallback={() => {
            getUserSubscriptionsWithBenefits();
          }}
          userSubscriptionId={isCirclePlan ? circleSubscriptionId : hdfcSubscriptionId}
        />
      )}
      {showAvailPopup && (
        <AvailNowPopup
          onClose={() => setShowAvailPopup(false)}
          transactionAmount={upgradeTransactionValue!}
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
      {showCircleActivation && renderCircleMembershipActivated()}
      {showCirclePlans && renderCircleSubscriptionPlans()}
      {loading && <Spinner />}
    </View>
  );
};
