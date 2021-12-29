import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { default as Moment, default as moment } from 'moment';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Text, SafeAreaView, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import HTML from 'react-native-render-html';
import { ConsultPatientSelector } from '@aph/mobile-patients/src/components/Consult/Components/ConsultPatientSelector';
import {
  renderConsultPackageDeatilShimmerTop,
  renderConsultPackagePostPurchaseShimmerBottom,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { postCleverTapEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CircleCheckIcon,
  CircleUncheckIcon,
  FamilyPackageIcon,
  SingleUserPackageIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { NavigationScreenProps, ScrollView, NavigationEvents } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getConsultPackageDetailPrePurchase } from '@aph/mobile-patients/src/helpers/apiCalls';
import { ConsultPackageTnc } from '@aph/mobile-patients/src/components/Consult/ConsultPackageTnC';
import { ConsultPackageFAQ } from '@aph/mobile-patients/src/components/Consult/ConsultPackageFAQ';
import { ConsultPackageHowItWorks } from '@aph/mobile-patients/src/components/Consult/ConsultPackageHowItWorks';

export interface ConsultPackageDetailProps
  extends NavigationScreenProps<{
    planId?: string;
    isOneTap?: boolean;
  }> {}

const styles = StyleSheet.create({
  packageName: {
    ...theme.viewStyles.text('M', 16, theme.colors.BLACK_COLOR),
  },

  detailContainer: {
    marginHorizontal: 21,
    marginTop: 21,
    flex: 1,
    marginBottom: 16,
  },

  packageDescription: {
    marginVertical: 14,
    alignSelf: 'center',
    textAlign: 'center',
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
  },

  proceedToPayButton: {
    marginBottom: 0,
    position: 'absolute',
    bottom: 0,
  },

  planItemContainer: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 16,
    flexDirection: 'row',
    paddingVertical: 12,
    marginVertical: 7,
    marginHorizontal: 5,
  },
  planItemContainerSelected: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 16,
    flexDirection: 'row',
    paddingVertical: 12,
    marginHorizontal: 5,
    marginVertical: 7,
    borderColor: theme.colors.APP_GREEN,
    borderWidth: 1,
  },
  singleUserPackageUserIcon: { height: 14, width: 14, marginHorizontal: 8 },
  familyPackageUserIcon: { height: 18, width: 18, marginHorizontal: 8 },

  planTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
    marginRight: 24,
  },
  planBenefitsTitle: {
    marginTop: 16,
    marginBottom: 5,
    alignSelf: 'center',
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 5,
    padding: 25,
  },
  benefitItemContainer: { flexDirection: 'row', marginVertical: 8, marginRight: 32 },
  benefitTitle: {
    ...theme.viewStyles.text('M', 15, theme.colors.SHERPA_BLUE),
  },
  benefitSubTitle: {
    marginTop: 5,

    ...theme.viewStyles.text('R', 12, theme.colors.BORDER_BOTTOM_COLOR),
  },
  howDoesItWorkContainer: {
    marginVertical: 16,
    marginHorizontal: 5,
  },
  howDoesItWorkIcon: {
    width: 35,
    height: 40,
  },
  howDoesItWorkTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
    marginLeft: 16,
  },
  howDoesItWorkSeparator: {
    height: 0.5,
    marginVertical: 10,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.25,
  },
  howDoesItWorkTnCTextItem: {
    ...theme.viewStyles.text('R', 13, theme.colors.SHERPA_BLUE),
    opacity: 0.85,
    marginLeft: 10,
  },

  faqTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
  },

  faqContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 20,
    marginHorizontal: 5,
  },
  faqItemContainer: {
    marginVertical: 12,
  },
  faqQuestion: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
  },
  faqAnswer: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE),
    marginTop: 8,
    opacity: 0.8,
  },
  tncContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 20,
    marginVertical: 24,
    marginHorizontal: 5,
  },

  tncTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
    marginBottom: 5,
  },
  tnc: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE),
    opacity: 0.8,
  },
  tncAccordianIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginRight: 16,
    marginTop: 16,
  },
  banner: { width: '100%', height: 139, borderRadius: 5 },
});

export const ConsultPackageDetail: React.FC<ConsultPackageDetailProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [packageDetailData, setPackageDetailData] = useState<any>();
  const [selectedPlanIndex, setSeletectedPlanIndex] = useState<number>(-1);
  const planId = props.navigation.getParam('planId') || '';
  const isOneTap = props.navigation.getParam('isOneTap') || false;
  const { currentPatient } = useAllCurrentPatients();
  const [showPatientSelector, setShowPatientSelector] = useState<boolean>(false);
  const [patient, setPatient] = useState<object>();
  const [visiblity, setVisiblity] = useState<boolean>(true);
  const { showAphAlert, hideAphAlert } = useUIElements();

  useEffect(() => {
    setLoading(true);
    getConsultPackageDetailPrePurchase(planId)
      .then((response) => {
        const { Plandata } = response?.data;
        if (response?.data?.Packagedata && Plandata) {
          if (Plandata?.length == 1) {
            setSeletectedPlanIndex(0);
          } else {
            const preSelectedIndex = Plandata?.findIndex((plan: any) => !!plan?.PlanPreSelected);
            !!preSelectedIndex && preSelectedIndex > -1 && setSeletectedPlanIndex(preSelectedIndex);
          }
          setPackageDetailData(response?.data);
        } else {
          showAphAlert?.({
            title: 'Oops!',
            description: 'This package is not available.Please choose another one.',
            onPressOutside: () => props.navigation.goBack(),
            onPressOk: () => {
              hideAphAlert!();
              props.navigation.goBack();
            },
          });
        }
      })
      .catch((error) => {
        showAphAlert?.({
          title: 'Oops!',
          description: "Couldn't load package information.Please try another one ",
          onPressOutside: () => props.navigation.goBack(),
          onPressOk: () => {
            hideAphAlert!();
            props.navigation.goBack();
          },
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const renderHeader = (props) => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.consultPackageList.packageDetail}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderPackageDetail = () => {
    return (
      <View style={styles.detailContainer}>
        <NavigationEvents
          onDidFocus={() => setVisiblity(true)}
          onDidBlur={() => setVisiblity(false)}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image
            source={{ uri: packageDetailData?.Packagedata?.PackageMobileBanner }}
            style={styles.banner}
          />
          <HTML
            html={packageDetailData?.Packagedata?.PackageLongDescription || ''}
            baseFontStyle={styles.packageDescription}
            ignoredStyles={[
              'line-height',
              'margin-bottom',
              'color',
              'text-align',
              'font-size',
              'font-family',
            ]}
          />

          {/* map of packages */}
          {packageDetailData?.Plandata?.map((plan: any, index: number) => (
            <TouchableOpacity
              style={
                selectedPlanIndex == index
                  ? styles.planItemContainerSelected
                  : styles.planItemContainer
              }
              onPress={() => {
                setSeletectedPlanIndex(index);
              }}
            >
              {selectedPlanIndex == index ? <CircleCheckIcon /> : <CircleUncheckIcon />}

              {plan?.PlanType === 'Multiple' ? (
                <FamilyPackageIcon style={styles.familyPackageUserIcon} />
              ) : (
                <SingleUserPackageIcon style={styles.singleUserPackageUserIcon} />
              )}
              {/* Family @ ₹3000 for 12 Months */}
              <Text style={styles.planTitle}>{plan?.PlanName}</Text>
            </TouchableOpacity>
          ))}
          {/* Plan Benefits  map */}

          {packageDetailData?.Plandata?.[selectedPlanIndex]?.planBenefitData &&
          packageDetailData?.Plandata?.[selectedPlanIndex]?.planBenefitData.length > 0 ? (
            <>
              <Text style={styles.planBenefitsTitle}>PLAN BENEFITS</Text>
              <View style={styles.benefitsContainer}>
                {packageDetailData?.Plandata?.[selectedPlanIndex]?.planBenefitData?.map(
                  (benefit: any) => (
                    <View style={styles.benefitItemContainer}>
                      <Image
                        source={{ uri: benefit?.IconImage }}
                        style={{ width: 56, height: 56 }}
                      />
                      <View style={{ marginHorizontal: 15 }}>
                        <Text style={styles.benefitTitle}>{benefit?.Title}</Text>
                        <HTML
                          html={benefit?.Description || ''}
                          baseFontStyle={styles.benefitSubTitle}
                          ignoredStyles={[
                            'line-height',
                            'margin-bottom',
                            'color',
                            'text-align',
                            'font-size',
                            'font-family',
                          ]}
                        />
                      </View>
                    </View>
                  )
                )}
              </View>
            </>
          ) : null}

          {/* How does it work ?  */}
          <ConsultPackageHowItWorks />

          {/* FAQ map */}
          <ConsultPackageFAQ faq={packageDetailData?.Packagedata?.PackageFaq} />

          {/* Terms & Condition  */}
          <ConsultPackageTnc tncText={packageDetailData?.Packagedata?.PackageTermConditions} />

          <View style={{ height: 30 }} />
        </ScrollView>
        {/* Proceed to Pay */}
        <Button
          title={
            isOneTap ? string.consultPackageList.bookOneTap : string.consultPackageList.prodeedToPay
          }
          style={styles.proceedToPayButton}
          disabled={disableProceedToPay()}
          onPress={onProceedToPay}
        />
      </View>
    );
  };

  const onProceedToPay = () => {
    ///select patient for onetap
    if (isOneTap) {
      setShowPatientSelector(true);
    } else {
      props.navigation.navigate(AppRoutes.PackageCheckout, {
        packageDetailData,
        selectedPlanIndex,
      });
    }

    logProceedToPayClickEvent();
  };
  const logProceedToPayClickEvent = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'New user': !currentPatient?.isConsulted,
      'Selling Source': 'direct',
      'Package Name': packageDetailData?.Packagedata?.PackageCMSIdentifier,
      'Plan Name': packageDetailData?.Plandata[selectedPlanIndex]?.PlanName,
      'Plan Price': packageDetailData?.Plandata[selectedPlanIndex]?.PlanPrice,
      'Plan Type': packageDetailData?.Plandata[selectedPlanIndex]?.PlanType,
    };
    if (isOneTap) {
      eventAttributes['Vertical'] = 'one-tap';
      postCleverTapEvent(CleverTapEventName.CONSULT_PACKAGE_BOOK_ONE_TAP_CLICKED, eventAttributes);
    } else {
      postCleverTapEvent(
        CleverTapEventName.CONSULT_PACKAGE_PROCEED_TO_PAY_CLICKED,
        eventAttributes
      );
    }
  };

  const disableProceedToPay = () => {
    if (
      !packageDetailData?.Plandata?.[0]?.planBenefitData ||
      packageDetailData?.Plandata?.[0]?.planBenefitData.length == 0 ||
      selectedPlanIndex == -1
    ) {
      return true;
    } else {
      return false;
    }
  };

  const onPatientSelected = (patient: any) => {
    setPatient(patient);
    props.navigation.navigate(AppRoutes.PackageCheckout, {
      packageDetailData,
      selectedPlanIndex,
      oneTapPatient: patient,
    });
  };

  const renderLoadingShimmer = () => {
    return (
      <View>
        {renderConsultPackageDeatilShimmerTop()}
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

      {loading ? renderLoadingShimmer() : renderPackageDetail()}

      {showPatientSelector ? (
        <ConsultPatientSelector
          navigation={props.navigation}
          visiblity={visiblity}
          setPatient={(patient) => {
            onPatientSelected(patient);
            setVisiblity(false);
          }}
          onCloseClicked={() => {
            setShowPatientSelector(false);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
};
