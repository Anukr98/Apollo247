import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Dimensions, Text } from 'react-native';
import { NavigationScreenProps, NavigationEvents } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  BOOK_PACKAGE_CONSULT,
  GET_APPOINTMENT_DATA,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import {
  bookFreeAppointmentForPharmacy,
  bookFreeAppointmentForPharmacyVariables,
} from '@aph/mobile-patients/src/graphql/types/bookFreeAppointmentForPharmacy';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import {
  extractPatientDetails,
  navigateToHome,
} from '@aph/mobile-patients/src/helpers/helperFunctions';

import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { ConsultPatientSelector } from '@aph/mobile-patients/src/components/Consult/Components/ConsultPatientSelector';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

const { width } = Dimensions.get('window');
interface ConfirmPackageConsultProp extends NavigationScreenProps {
  specialityName: string;
}

export const ConfirmPackageConsult: React.FC<ConfirmPackageConsultProp> = (props) => {
  const client = useApolloClient();
  const { showAphAlert } = useUIElements();
  const oneTapPatient = props.navigation.getParam('oneTapPatient');
  const [loading, setLoading] = useState<boolean>(false);
  const [patient, setPatient] = useState<object>(oneTapPatient);
  const [visiblity, setVisiblity] = useState<boolean>(true);

  const specialityName = props.navigation.getParam('specialityName');
  const benefitId = props.navigation.getParam('benefitId');
  const subscriptionId = props.navigation.getParam('subscriptionId');
  const subscriptionDetails = props.navigation.getParam('subscriptionDetails');
  const { homeScreenParamsOnPop } = useAppCommonData();

  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.consultPackages.consultConfirmation}
        container={styles.headerContainer}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderProceedButton = () => {
    return (
      <View style={styles.bottomBtnContainer}>
        <Button
          title={string.consultPackages.bookConsult}
          style={styles.viewAvailableSlotsBtn}
          disabled={!patient}
          onPress={() => !!patient && bookConsult()}
        />
      </View>
    );
  };

  const bookConsult = async () => {
    const subscriptionDetailsInput = {
      specialtyName: specialityName,
      benefitId: benefitId,
      userSubscriptionId: subscriptionId,

      planId: subscriptionDetails?.plan_id,
      subPlanId: subscriptionDetails?.sub_plan_id,
      paymentOrderId: subscriptionDetails?.order_id,
      subscriptionSubPlanId: subscriptionDetails?._id,
    };

    const inputVariable = {
      patientId: patient?.id,
      subscriptionDetailsInput: subscriptionDetailsInput,
    };

    setLoading?.(true);
    try {
      const data = await client.mutate<
        bookFreeAppointmentForPharmacy,
        bookFreeAppointmentForPharmacyVariables
      >({
        mutation: BOOK_PACKAGE_CONSULT,
        variables: inputVariable,
        context: { headers: { 'x-api-key': AppConfig.Configuration.Consult_Free_Book_Key } },
      });

      const { isError, doctorName, appointmentId, error } =
        data?.data?.bookFreeAppointmentForPharmacy || {};
      if (!isError) {
        handleOrderSuccess(doctorName!, appointmentId!);
      } else {
        setLoading?.(false);
        showAphAlert?.({
          title: 'Error',
          description: error || '',
        });
      }
    } catch (error) {
      setLoading?.(false);
      showAphAlert?.({
        title: 'Error',
        description: string.common.somethingWentWrong,
      });
    }
  };

  const handleOrderSuccess = (doctorName: string, appointmentId: string) => {
    client
      .query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        try {
          const appointmentData = _data?.data?.getAppointmentData?.appointmentsHistory;
          if (!!appointmentData && !!appointmentData?.[0]?.doctorInfo) {
            const params = {
              isFreeConsult: true,
              doctorName: doctorName,
              appointmentData: appointmentData?.[0],
              skipAutoQuestions: false,
            };
            homeScreenParamsOnPop.current = params;
            navigateToHome(props.navigation, params);
          }
        } catch (error) {
          props.navigation.navigate('APPOINTMENTS');
        }
      })
      .catch((e) => {
        props.navigation.navigate('APPOINTMENTS');
      })
      .finally(() => setLoading?.(false));
  };

  const { patientName, patientSalutation, genderAgeText } = extractPatientDetails(patient);
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <NavigationEvents
        onDidFocus={() => setVisiblity(true)}
        onDidBlur={() => setVisiblity(false)}
      />
      <View style={styles.container}>
        {renderHeader()}
        <Text style={styles.availabilityText}>{string.consultPackages.doctorBookingInfo} </Text>
        <View style={styles.cardView}>
          <Text style={styles.heading}>{string.consultPackages.speciality}</Text>
          <Text style={styles.value}>{specialityName}</Text>
          <Text style={{ ...styles.heading, paddingTop: 20 }}>
            {string.consultPackages.patientName}
          </Text>
          <Text style={styles.value}>
            {patientSalutation + ', ' + patientName + ', ' + genderAgeText}
          </Text>
        </View>
      </View>
      {renderProceedButton()}
      {loading && <Spinner />}
      <ConsultPatientSelector
        navigation={props.navigation}
        visiblity={visiblity}
        setPatient={(patient) => {
          setPatient(patient);
          setVisiblity(false);
        }}
        onCloseClicked={() => {
          props.navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.CARD_BG,
  },
  headerContainer: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  bottomBtnContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  viewAvailableSlotsBtn: {
    width: width - 36,
    marginTop: 6,
  },
  availabilityText: {
    ...theme.viewStyles.text('M', 16, theme.colors.APP_GREEN, 1, 20),
    textAlign: 'center',
    paddingTop: 46,
    paddingBottom: 34,
  },
  cardView: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 24,
  },
  heading: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18.2),
  },
  value: {
    ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE, 1, 18.2),
    paddingTop: 6,
  },
});
