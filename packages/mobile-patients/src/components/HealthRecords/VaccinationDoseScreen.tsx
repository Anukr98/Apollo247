import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { RoundGreenTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  BackHandler,
  View,
  Platform,
} from 'react-native';
import string from '@aph/mobile-patients/src/strings/strings.json';

import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import _ from 'lodash';

import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import moment from 'moment';
import { buildVaccineApolloClient } from '@aph/mobile-patients/src/components/Vaccination/VaccinationApolloClient';

const styles = StyleSheet.create({
  labelStyle: {
    color: '#00B38E',
    lineHeight: 21,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  descriptionStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
    marginTop: 26,
    marginLeft: 18,
  },
  collapseCardLabelViewStyle: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  blueCirleViewStyle: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 12,
  },
  detailViewRowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  greenTickIconStyle: {
    width: 20,
    height: 20,
    left: 1,
  },
  verticleLine: {
    height: '80%',
    width: 2,
    backgroundColor: '#02475B',
    alignSelf: 'center',
  },
  dateViewContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '70%',
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginBottom: 15,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 29,
  },
  registrationID: {
    ...viewStyles.text('R', 14, '#0087BA', 1, 21),
    top: 5,
  },
  labelTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansRegular(14),
    paddingRight: 10,
  },
  valuesTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 16,
    textAlign: 'right',
    flex: 1,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  separatorLineStyle: {
    backgroundColor: '#02475B',
    opacity: 0.2,
    height: 0.5,
    marginBottom: 23,
    marginTop: 16,
  },
  vaccinationDateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  resultTextStyle: {
    textAlign: 'left',
    marginLeft: 18,
    marginTop: 10,
    color: theme.colors.SKY_BLUE,
    lineHeight: 15,
    flex: 1,
    ...theme.fonts.IBMPlexSansRegular(13),
  },
  insuranceAmountTextStyle: {
    ...theme.viewStyles.text('SB', 18, theme.colors.SKY_BLUE, 1, 23.4),
    marginTop: 11,
  },
  recordNameTextStyle: {
    ...viewStyles.text('SB', 23, theme.colors.LIGHT_BLUE, 1, 30),
    marginRight: 10,
  },
  covidTypeTextStyle: {
    ...viewStyles.text('SB', 16, '#0087BA', 1, 30),
    marginRight: 10,
  },
  doctorTextStyle: { ...viewStyles.text('M', 13, '#02475B', 1, 21) },
  safeAreaViewStyle: {
    ...theme.viewStyles.container,
  },
  mainViewStyle: {
    flex: 1,
  },
  imagePlaceHolderStyle: {
    height: 425,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  imageStyle: {
    width: '100%',
    height: 425,
  },
  imageViewStyle: {
    marginHorizontal: 30,
    marginBottom: 15,
    marginTop: 15,
    backgroundColor: 'transparent',
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
  },
  pdfStyle: {
    height: 425,
    width: '100%',
    backgroundColor: 'transparent',
  },
});

export interface VaccinationDoseScreenProps extends NavigationScreenProps {}

export const VaccinationDoseScreen: React.FC<VaccinationDoseScreenProps> = (props) => {
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState<boolean>(false);
  const [data, setData] = useState<any>(
    props.navigation.state.params ? props.navigation.state.params.data : {}
  );
  const [apiError, setApiError] = useState(false);
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [fileNamePDF, setFileNamePDF] = useState<string>('');
  const [pdfFileUrl, setPdfFileUrl] = useState<string>('');
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { authToken } = useAuth();
  const apolloVaccineClient = buildVaccineApolloClient(authToken);

  //for deeplink
  const movedFrom = props.navigation.getParam('movedFrom');

  useEffect(() => {
    console.log(data, 'data');
  }, []);

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    onGoBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const renderTestTopDetailsView = () => {
    const dataFormatter = moment(data?.dateOfImmunization).format('ll');
    const source = data?.source === '247self' ? ' \u25CF ' + 'Self upload' : '';
    return (
      <View style={styles.cardViewStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.recordNameTextStyle}>
            {data.batchno === '1' ? 'Dose 1' : 'Dose 2' || 'N/A'}
          </Text>
          <RoundGreenTickIcon style={styles.greenTickIconStyle} />
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text style={styles.covidTypeTextStyle}>{data?.vaccineName || 'N/A'}</Text>
          <Text style={styles.doctorTextStyle}>
            {`${data?.vaccine_location + source}` || 'N/A'}
          </Text>
        </View>
        <View style={styles.separatorLineStyle} />
        <Text style={{ ...viewStyles.text('M', 16, '#02475B', 1, 21) }}>{'Vaccination Date'}</Text>
        <View style={styles.vaccinationDateContainer}>
          <Text style={{ ...viewStyles.text('R', 14, theme.colors.SKY_BLUE, 1, 18) }}>{'On '}</Text>
          <View style={styles.dateViewContainer}>
            <Text style={{ ...viewStyles.text('SB', 14, '#02475B', 1, 18) }}>
              {dataFormatter || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.separatorLineStyle} />
        <Text style={{ ...viewStyles.text('M', 16, '#02475B', 1, 21) }}>{'Registration ID'}</Text>
        <Text style={styles.registrationID}>{data?.registrationId || 'N/A'}</Text>
      </View>
    );
  };

  const onGoBack = () => {
    props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };

  const renderDownloadCowinCertificate = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={'DOWNLOAD COWIN CERTIFICATE'}
          onPress={() => {
            props.navigation.navigate(AppRoutes.CowinCertificateOTPScreen);
          }}
        />
      </StickyBottomComponent>
    );
  };
  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          title={'VACCINATION DETAILS'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
        <ScrollView bounces={false}>{renderTestTopDetailsView()}</ScrollView>
        {renderDownloadCowinCertificate()}
      </SafeAreaView>
    </View>
  );
  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
        {apiError ? (
          <PhrNoDataComponent noDataText={string.common.phr_api_error_text} phrErrorIcon />
        ) : null}
      </SafeAreaView>
    </View>
  );
};
