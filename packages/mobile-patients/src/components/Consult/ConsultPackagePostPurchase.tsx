import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { default as Moment, default as moment } from 'moment';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { ConsultPackageTnc } from './ConsultPackageTnC';
import { ConsultPackageFAQ } from './ConsultPackageFAQ';
import { ConsultPackageHowItWorks } from './ConsultPackageHowItWorks';
import { GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  Text,
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';
import {
  renderConsultPackagePostPurchaseShimmerTop,
  renderConsultPackagePostPurchaseShimmerBottom,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { useApolloClient } from 'react-apollo-hooks';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

import { NavigationScreenProps, ScrollView } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  detailContainer: {
    marginHorizontal: 21,
    marginTop: 21,
    flex: 1,
    marginBottom: 16,
  },
  mySpecialtyPackageContainer: {
    ...theme.viewStyles.cardViewStyle,
  },
  bannerBackground: {
    width: '100%',
    height: 100,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
  },

  packageTitle: {
    ...theme.viewStyles.text('M', 16, theme.colors.WHITE),
    marginLeft: 25,
  },
  packageInfoContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginVertical: 16,
  },

  consultationBookedTitle: { ...theme.viewStyles.text('R', 12, theme.colors.PLATINUM_GREY) },
  consultationBooked: { ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE), marginTop: 5 },
  validTillTitle: { ...theme.viewStyles.text('R', 12, theme.colors.PLATINUM_GREY) },
  validTill: { ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE), marginTop: 5 },

  mySpecialtiesContainer: {
    ...theme.viewStyles.cardViewStyle,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 18,
  },
  mySpecialtiesTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
    marginBottom: 10,
  },
  mySpecialtiesItem: {
    paddingVertical: 15,
    paddingHorizontal: 19,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginVertical: 6,
    flexDirection: 'row',
  },
  mySpecialtiesItemIcon: {
    width: 30,
    height: 30,
  },
  mySpecialtiesItemName: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE),
  },
  noSpecialities: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE),
    opacity: 0.5,
  },
  mySpecialtiesItemBookConsultaion: {
    marginTop: 8,
    ...theme.viewStyles.text('M', 12, theme.colors.TANGERINE_YELLOW),
  },
  mySpecialtiesItemLeftCount: {
    ...theme.viewStyles.text('R', 12, theme.colors.APP_GREEN),
  },
  vericalSeparator: {
    width: 0.5,
    height: 40,
    marginLeft: -10,
    backgroundColor: theme.colors.SHERPA_BLUE,
    opacity: 0.2,
    marginVertical: 16,
  },
  morePopup: {
    ...theme.viewStyles.cardViewStyle,
    position: 'absolute',
    top: 100,
    right: 16,
    padding: 16,
  },
  cancelCTA: {
    ...theme.viewStyles.text('M', 15, theme.colors.TANGERINE_YELLOW),
  },
});

export interface ConsultPackagePostPurchaseProps
  extends NavigationScreenProps<{
    planId?: string;
    onSubscriptionCancelled: () => void;
  }> {}

export const ConsultPackagePostPurchase: React.FC<ConsultPackagePostPurchaseProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const _onSubscriptionCancelled = props.navigation.getParam('onSubscriptionCancelled');
  const [showMorePopup, setShowMorePopup] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [consultationsBooked, setConsultationsBooked] = useState<number>(0);
  const [validTill, setValidTill] = useState<any>();
  const [specialities, setSpecialities] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [faq, setFaq] = useState([]);
  const [subscriptionId, setSubscriptionId] = useState<string>();
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>();
  const [planName, setPlanName] = useState<string>('');
  const [postPurchaseBackgroundImageUrl, setPostPurchaseBackgroundImageUrl] = useState<string>('');
  const planId = props.navigation.getParam('planId') || '';
  const [isCancellable, setIsCancellable] = useState<true>();

  const renderHeader = (props) => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.consultPackageList.packageDetail}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
        rightIcon={
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              alignContent: 'flex-end',
              alignItems: 'flex-end',
              marginRight: -10,
            }}
            onPress={() => {
              setShowMorePopup(!showMorePopup);
            }}
          >
            <More style={{ alignSelf: 'flex-end' }} />
          </TouchableOpacity>
        }
      />
    );
  };

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      getUserSubscriptionsWithBenefits();
    });

    return () => {
      didFocus && didFocus.remove();
    };
  }, []);

  const getUserSubscriptionsWithBenefits = () => {
    const mobile_number = g(currentPatient, 'mobileNumber');
    setLoading(true);

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
          const groupPlans = g(
            data,
            'data',
            'GetAllUserSubscriptionsWithPlanBenefitsV2',
            'response'
          );

          if (groupPlans) {
            Object.keys(groupPlans).forEach((plan_name) => {
              if (plan_name === 'APOLLO') {
                let desiredPlan = groupPlans[plan_name]?.find(
                  (plan: any) =>
                    plan.plan_vertical === 'Consult' &&
                    (plan.status === 'active' || plan.status === 'deferred_active') &&
                    plan.sub_plan_id === planId
                );
                if (desiredPlan) {
                  setValidTill(desiredPlan.subscriptionEndDate);
                  setTermsAndConditions(desiredPlan?.meta?.terms_and_conditions);
                  setFaq(desiredPlan?.meta?.freqeuntly_asked_questions);
                  setSubscriptionId(desiredPlan?.subscription_id);
                  setSubscriptionDetails(desiredPlan?.subscription_details);

                  setIsCancellable(desiredPlan?.cancellation?.is_cancellable);

                  setPlanName(desiredPlan?.name);
                  setPostPurchaseBackgroundImageUrl(
                    desiredPlan?.post_purchase_background_image_url
                  );

                  let totalUsed = 0;
                  let spec: any[] = [];
                  desiredPlan?.benefits?.forEach((benefit: any) => {
                    totalUsed += benefit?.attribute_type.used;
                    spec.push({
                      name: benefit?.attribute,
                      icon: benefit?.cta_action?.meta?.benefit_icon_urls?.mobile_version,
                      total: benefit?.attribute_type?.total,
                      left: benefit?.attribute_type?.remaining,
                      benefitId: benefit?._id,
                    });
                  });

                  setConsultationsBooked(totalUsed);

                  setSpecialities(spec);
                } else {
                  showAphAlert!({
                    title: 'Uh oh.. :(',
                    description: "Seems like the plan dosen't exists anymore.",
                    onPressOutside: () => props.navigation.goBack(),
                    onPressOk: () => {
                      props.navigation.goBack();
                      hideAphAlert!();
                    },
                  });
                }
              }
            });
          }
        })
        .catch((error) => {
          showAphAlert!({
            title: 'Uh oh.. :(',
            description: "Couldn't load the plan details. Please check internet connection.",
            onPressOutside: () => props.navigation.goBack(),
            onPressOk: () => {
              props.navigation.goBack();
              hideAphAlert!();
            },
          });
        })
        .finally(() => {
          setLoading(false);
        });
  };

  const renderMySpecialtyPackage = () => {
    return (
      <View style={styles.mySpecialtyPackageContainer}>
        {/* bg image  */}
        <ImageBackground
          source={{ uri: postPurchaseBackgroundImageUrl }}
          style={styles.bannerBackground}
        >
          <Text style={styles.packageTitle}>{planName} </Text>
        </ImageBackground>
        <View style={{ margin: 5, flexDirection: 'row' }}>
          <View style={styles.packageInfoContainer}>
            <Text style={styles.consultationBookedTitle}>Consultations Booked </Text>
            <Text style={styles.consultationBooked}>{consultationsBooked}</Text>
          </View>
          <View style={styles.vericalSeparator} />
          <View style={styles.packageInfoContainer}>
            <Text style={styles.validTillTitle}>Valid Till </Text>
            <Text style={styles.validTill}>{moment(validTill).format('D MMM YYYY')} </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMySpecialities = () => {
    return (
      <View style={styles.mySpecialtiesContainer}>
        <Text style={styles.mySpecialtiesTitle}>MY SPECIALITIES</Text>
        {specialities.length == 0 ? (
          <Text style={styles.noSpecialities}>No Specialities to show </Text>
        ) : null}
        <ScrollView
          style={{ maxHeight: 250 }}
          showsHorizontalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {specialities.map((specialty: any) => (
            <View style={styles.mySpecialtiesItem}>
              <Image source={{ uri: specialty.icon }} style={styles.mySpecialtiesItemIcon} />
              <View style={{ flex: 5, marginLeft: 20 }}>
                <Text style={styles.mySpecialtiesItemName}>{specialty.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate(AppRoutes.ConfirmPackageConsult, {
                      specialityName: specialty.name,
                      benefitId: specialty?.benefitId,
                      subscriptionId: subscriptionId,
                      subscriptionDetails: subscriptionDetails,
                    });
                  }}
                  disabled={specialty.left <= 0 ? true : false}
                >
                  <Text style={styles.mySpecialtiesItemBookConsultaion}>BOOK CONSULTATION</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.mySpecialtiesItemLeftCount}>
                {specialty.left}/ {specialty.total} left
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderPackagePurchaseDetails = () => {
    return (
      <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
        {renderMySpecialtyPackage()}

        {renderMySpecialities()}
        {/* How does it work ?  */}
        <ConsultPackageHowItWorks />

        {/* FAQ map */}
        <ConsultPackageFAQ faq={faq} />

        {/* Terms & Condition  */}
        <ConsultPackageTnc tncText={termsAndConditions} />
      </ScrollView>
    );
  };

  const showLoadingShimmer = () => {
    return (
      <View>
        {renderConsultPackagePostPurchaseShimmerTop()}
        <View style={{ marginHorizontal: 21 }}>
          <ConsultPackageHowItWorks />
        </View>
        {renderConsultPackagePostPurchaseShimmerBottom()}
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderHeader(props)}

      {loading ? showLoadingShimmer() : renderPackagePurchaseDetails()}

      {showMorePopup ? (
        <TouchableOpacity
          style={styles.morePopup}
          onPress={() => {
            setShowMorePopup(false);
            if (isCancellable) {
              props.navigation.navigate(AppRoutes.ConsultPackageCancellation, {
                subscriptionId: subscriptionId,
                onSubscriptionCancelled: () => {
                  navigateToHome(props.navigation);
                },
              });
            } else {
              showAphAlert!({
                title: 'Uh oh.. :(',
                description: 'This subscription plan is not cancellable.',
              });
            }
          }}
        >
          <Text style={styles.cancelCTA}>{string.consultPackageList.cancelSubscription}</Text>
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
};
