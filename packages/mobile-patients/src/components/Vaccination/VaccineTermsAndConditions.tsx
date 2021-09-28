import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '../../theme/colors';
import { ScrollView } from 'react-native-gesture-handler';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { CheckBoxFilled, CheckBox } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import AsyncStorage from '@react-native-community/async-storage';

export interface VaccineTermsAndConditionsProps
  extends NavigationScreenProps<{
    isCorporateSubscription?: boolean;
    cmsIdentifier?: string;
    subscriptionId?: string;
    subscriptionInclusionId?: string;
    isVaccineSubscription?: boolean;
  }> {}

const styles = StyleSheet.create({
  headingSection: {
    backgroundColor: colors.WHITE,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    marginVertical: 20,
  },
  headingOne: { ...theme.viewStyles.text('B', 20, '#02475B', 1, 30, 0.35), marginBottom: 10 },
  headingSubtext: { ...theme.viewStyles.text('SB', 13, '#02475B', 1, 20, 0.35), width: '85%' },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginBottom: 90,
    padding: 16,
  },
  tncText: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 19, 0.35),
  },
  checkBoxStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  bottomSectionStyle: {
    ...theme.viewStyles.shadowStyle,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tncCheckText: {
    width: '50%',
    alignSelf: 'center',
    ...theme.viewStyles.text('M', 13, '#02475B', 1, 15, 0.35),
  },
  proceedCta: { width: '30%', alignSelf: 'center' },
  errorText: {
    ...theme.viewStyles.text('R', 13, '#FF748E', 1, 15, 0.35),
    marginTop: 10,
  },
});

export const VaccineTermsAndConditions: React.FC<VaccineTermsAndConditionsProps> = (props) => {
  const isCorporateSubscription = props.navigation.getParam('isCorporateSubscription');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const cmsIdentifier = props.navigation.getParam('cmsIdentifier');
  const subscriptionId = props.navigation.getParam('subscriptionId');
  const subscriptionInclusionId = props.navigation.getParam('subscriptionInclusionId');
  const excludeProfileListIds = props.navigation.getParam('excludeProfileListIds');
  const remainingVaccineSlots = props.navigation.getParam('remainingVaccineSlots');

  useEffect(() => {
    if (isChecked) setIsError(false);
  }, [isChecked]);

  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.vaccineBooking.tnc_header_text}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderTopSection = () => {
    return (
      <View style={styles.headingSection}>
        <Text style={styles.headingOne}>{string.vaccineBooking.tnc_heading}</Text>
        <Text style={styles.headingSubtext}>{string.vaccineBooking.tnc_subheading}</Text>
      </View>
    );
  };

  const renderTncContent = () => {
    return string.vaccineBooking.tnc_content.map((value: string) => {
      return (
        <Text style={[styles.tncText, { marginBottom: 15 }]}>
          {'\u25CF  '}
          {value}
        </Text>
      );
    });
  };

  const renderTnC = () => {
    const tncLink = AppConfig.Configuration.APOLLO_TERMS_CONDITIONS.replace('?isMobile=true', '');
    const privacyLink = AppConfig.Configuration.APOLLO_PRIVACY_POLICY.replace('?isMobile=true', '');
    return (
      <View style={styles.cardStyle}>
        {renderTncContent()}
        <Text
          style={[styles.tncText, { marginTop: 10 }]}
        >{`All ${string.vaccineBooking.tnc_header_text}`}</Text>
        <Text style={styles.tncText}>{`(${tncLink}) and`}</Text>
        <Text style={styles.tncText}>Privacy policy</Text>
        <Text style={styles.tncText}>{`(${privacyLink})`}</Text>
      </View>
    );
  };

  const renderCheckBox = () => {
    return (
      <TouchableOpacity
        style={{ alignSelf: 'center' }}
        onPress={() => {
          setIsChecked(!isChecked);
        }}
      >
        {isChecked ? (
          <CheckBoxFilled style={styles.checkBoxStyle} />
        ) : (
          <CheckBox style={styles.checkBoxStyle} />
        )}
      </TouchableOpacity>
    );
  };

  const renderCheckBoxText = () => {
    return (
      <Text style={styles.tncCheckText}>
        I agree to the{' '}
        <Text
          onPress={() => {
            props.navigation.navigate(AppRoutes.CommonWebView, {
              url: AppConfig.Configuration.APOLLO_TERMS_CONDITIONS,
              isGoBack: true,
            });
          }}
          style={{ textDecorationLine: 'underline' }}
        >
          Terms and Conditions
        </Text>{' '}
        of Apollo247
      </Text>
    );
  };

  const renderProceedCta = () => {
    return (
      <Button
        title="PROCEED"
        style={styles.proceedCta}
        onPress={async () => {
          if (!isChecked) {
            setIsError(true);
          } else {
            const vaccinationCmsIdentifier: any = await AsyncStorage.getItem(
              'VaccinationCmsIdentifier'
            );
            const vaccinationSubscriptionId: any = await AsyncStorage.getItem(
              'VaccinationSubscriptionId'
            );
            AsyncStorage.setItem('hasAgreedVaccineTnC', 'yes');
            props.navigation.navigate(AppRoutes.BookedVaccineScreen, {
              cmsIdentifier: vaccinationCmsIdentifier || '',
              subscriptionId: vaccinationSubscriptionId || '',
              isVaccineSubscription: !!vaccinationCmsIdentifier,
              isCorporateSubscription: !!isCorporateSubscription,
              comingFrom: AppRoutes.VaccineTermsAndConditions,
              subscriptionInclusionId: subscriptionInclusionId || '',
            });
          }
        }}
      />
    );
  };

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent
        backgroundColor={colors.WHITE}
        style={[styles.bottomSectionStyle, isError ? { height: 130 } : {}]}
      >
        <View style={styles.flexRow}>
          {renderCheckBox()}
          {renderCheckBoxText()}
          {renderProceedCta()}
        </View>
        {isError && <Text style={styles.errorText}>{string.vaccineBooking.tnc_error}</Text>}
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderHeader()}
      <ScrollView>
        {renderTopSection()}
        {renderTnC()}
      </ScrollView>
      {renderBottomButtons()}
    </SafeAreaView>
  );
};
