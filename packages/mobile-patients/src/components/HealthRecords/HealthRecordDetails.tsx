import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  LabTestIcon,
  RoundGreenTickIcon,
  PhrRestrictionBlackIcon,
  PhrSymptomIcon,
  PhrMedicationBlackIcon,
  PhrAllergyBlackIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  BackHandler,
  View,
} from 'react-native';
import {
  GET_DIAGNOSTICS_ORDER_BY_DISPLAY_ID,
  GET_LAB_RESULT_PDF,
} from '@aph/mobile-patients/src/graphql/profiles';
import string from '@aph/mobile-patients/src/strings/strings.json';
import Pdf from 'react-native-pdf';
import { useApolloClient } from 'react-apollo-hooks';
import { Image } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  g,
  handleGraphQlError,
  postWebEngagePHR,
  getSourceName,
  HEALTH_CONDITIONS_TITLE,
  removeObjectProperty,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import {
  getLabResultpdf,
  getLabResultpdfVariables,
} from '@aph/mobile-patients/src/graphql/types/getLabResultpdf';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import _ from 'lodash';
import {
  getPatientPrismMedicalRecordsApi,
  getPatientPrismSingleMedicalRecordApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import {
  getDiagnosticOrderDetailsByDisplayID,
  getDiagnosticOrderDetailsByDisplayIDVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetailsByDisplayID';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';

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
    width: 14,
    height: 14,
    resizeMode: 'center',
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
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
    height: 0.5,
    marginBottom: 23,
    marginTop: 16,
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
  doctorTextStyle: { ...viewStyles.text('M', 16, theme.colors.SKY_BLUE, 1, 21), marginTop: 6 },
  sourceTextStyle: { ...viewStyles.text('R', 14, '#67909C', 1, 18.2), marginTop: 3 },
  safeAreaViewStyle: {
    ...theme.viewStyles.container,
  },
  mainViewStyle: {
    flex: 1,
  },
});

export interface HealthRecordDetailsProps extends NavigationScreenProps {}

export const HealthRecordDetails: React.FC<HealthRecordDetailsProps> = (props) => {
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState<boolean>(false);
  const [data, setData] = useState<any>(
    props.navigation.state.params ? props.navigation.state.params.data : {}
  );
  const labResults = props.navigation.state.params
    ? props.navigation.state.params.labResults
    : false;
  const healthCheck = props.navigation.state.params
    ? props.navigation.state.params.healthCheck
    : false;
  const hospitalization = props.navigation.state.params
    ? props.navigation.state.params.hospitalization
    : false;
  const prescriptions = props.navigation.state.params
    ? props.navigation.state.params.prescriptions
    : false;
  const medicalBill = props.navigation.state.params
    ? props.navigation.state.params.medicalBill
    : false;
  const medicalInsurance = props.navigation.state.params
    ? props.navigation.state.params.medicalInsurance
    : false;
  const healthCondition = props.navigation.state.params
    ? props.navigation.state.params.healthCondition
    : false;
  const healthHeaderTitle = props.navigation.state.params
    ? props.navigation.state.params.healthHeaderTitle
    : '';
  const healthrecordId = props.navigation.state.params
    ? props.navigation.state.params?.healthrecordId
    : '';
  const healthRecordType = props.navigation.state.params
    ? props.navigation.state.params?.healthRecordType
    : '';
  const prescriptionSource = props.navigation.state.params
    ? props.navigation.state.params?.prescriptionSource
    : null;
  const [apiError, setApiError] = useState(false);
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();

  //for deeplink
  const movedFrom = props.navigation.getParam('movedFrom');
  const displayId = props.navigation.getParam('id');

  const propertyName = g(data, 'testResultFiles')
    ? 'testResultFiles'
    : g(data, 'healthCheckFiles')
    ? 'healthCheckFiles'
    : g(data, 'hospitalizationFiles')
    ? 'hospitalizationFiles'
    : g(data, 'prescriptionFiles')
    ? 'prescriptionFiles'
    : g(data, 'insuranceFiles')
    ? 'insuranceFiles'
    : g(data, 'billFiles')
    ? 'billFiles'
    : g(data, 'medicationFiles')
    ? 'medicationFiles'
    : g(data, 'attachmentList')
    ? 'attachmentList'
    : g(data, 'familyHistoryFiles')
    ? 'familyHistoryFiles'
    : '';

  const webEngageSource = healthCheck
    ? 'Health Check'
    : hospitalization
    ? 'Discharge Summary'
    : prescriptions
    ? 'Prescription'
    : medicalBill
    ? 'Bills'
    : medicalInsurance
    ? 'Insurance'
    : 'Lab Test';

  const webEngageEventName: WebEngageEventName = healthCheck
    ? WebEngageEventName.PHR_DOWNLOAD_HEALTH_CHECKS
    : hospitalization
    ? WebEngageEventName.PHR_DOWNLOAD_HOSPITALIZATIONS
    : prescriptions
    ? WebEngageEventName.PHR_DOWNLOAD_DOCTOR_CONSULTATION
    : medicalBill
    ? WebEngageEventName.PHR_DOWNLOAD_BILLS
    : medicalInsurance
    ? WebEngageEventName.PHR_DOWNLOAD_INSURANCE
    : healthCondition
    ? healthHeaderTitle === HEALTH_CONDITIONS_TITLE.ALLERGY
      ? WebEngageEventName.PHR_DOWNLOAD_ALLERGY
      : healthHeaderTitle === HEALTH_CONDITIONS_TITLE.MEDICAL_CONDITION
      ? WebEngageEventName.PHR_DOWNLOAD_MEDICAL_CONDITION
      : healthHeaderTitle === HEALTH_CONDITIONS_TITLE.FAMILY_HISTORY
      ? WebEngageEventName.PHR_DOWNLOAD_FAMILY_HISTORY
      : WebEngageEventName.PHR_DOWNLOAD_TEST_REPORT
    : WebEngageEventName.PHR_DOWNLOAD_TEST_REPORT;

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  });

  useEffect(() => {
    if (!!movedFrom && !!displayId && movedFrom == 'deeplink') {
      fetchDiagnosticOrderDetails(displayId);
    }
  }, []);

  const getOrderDetails = async (displayId: string) => {
    const res = await client.query<
      getDiagnosticOrderDetailsByDisplayID,
      getDiagnosticOrderDetailsByDisplayIDVariables
    >({
      query: GET_DIAGNOSTICS_ORDER_BY_DISPLAY_ID,
      variables: {
        displayId: Number(displayId),
      },
      fetchPolicy: 'no-cache',
    });
    return res;
  };

  const fetchDiagnosticOrderDetails = async (displayId: string) => {
    setLoading?.(true);
    try {
      const res = await getOrderDetails(displayId);
      const { data } = res;
      const getData = g(data, 'getDiagnosticOrderDetailsByDisplayID', 'ordersList');
      const visitId = getData?.visitNo;
      if (currentPatient?.id === getData?.patientId) {
        if (!!visitId) {
          fetchTestReportResult(visitId);
        } else {
          setLoading?.(false);
          renderError(string.diagnostics.unableToFetchReport, true);
        }
      } else {
        setLoading?.(false);
        renderError(string.diagnostics.incorrectUserReport, false);
      }
    } catch (error) {
      CommonBugFender('RecordDetails_fetchDiagnosticOrderDetails_try', error);
      setLoading?.(false);
      renderError(string.diagnostics.unableToFetchReport, true);
    }
  };

  const fetchTestReportResult = useCallback((visitId: string) => {
    getPatientPrismMedicalRecordsApi(
      client,
      currentPatient?.id,
      [MedicalRecordType.TEST_REPORT],
      'Diagnostics'
    )
      .then((data: any) => {
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'labResults',
          'response'
        );
        let resultForVisitNo = labResultsData?.find((item: any) => item?.identifier == visitId);
        if (!!resultForVisitNo) {
          setData(resultForVisitNo);
          setLoading?.(false);
        } else {
          setLoading?.(false);
          renderError(string.diagnostics.responseUnavailableForReport, false);
        }
      })
      .catch((error) => {
        CommonBugFender('OrderedTestStatus_fetchTestReportsData', error);
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setLoading?.(false));
  }, []);

  const requestReadSmsPermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (resuts) {
      }
    } catch (error) {
      CommonBugFender('RecordDetails_requestReadSmsPermission_try', error);
    }
  };

  useEffect(() => {
    // calling this api only for search records
    if (healthrecordId) {
      setLoading && setLoading(true);
      getPatientPrismSingleMedicalRecordApi(
        client,
        currentPatient?.id,
        [healthRecordType],
        healthrecordId,
        prescriptionSource
      )
        .then((_data: any) => {
          switch (healthRecordType) {
            case MedicalRecordType.PRESCRIPTION:
              const prescriptionsData = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'prescriptions',
                'response',
                '0' as any
              );
              setData(prescriptionsData);
              break;
            case MedicalRecordType.TEST_REPORT:
              const labResultsData = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'labResults',
                'response',
                '0' as any
              );
              setData(labResultsData);
              break;
            case MedicalRecordType.HOSPITALIZATION:
              const hospitalizationsData = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'hospitalizations',
                'response',
                '0' as any
              );
              setData(hospitalizationsData);
              break;
            case MedicalRecordType.MEDICALBILL:
              const medicalBills = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'medicalBills',
                'response',
                '0' as any
              );
              setData(medicalBills);
              break;
            case MedicalRecordType.MEDICALINSURANCE:
              const medicalInsurances = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'medicalInsurances',
                'response',
                '0' as any
              );
              setData(medicalInsurances);
              break;
            case MedicalRecordType.ALLERGY:
              const medicalAllergie = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'allergies',
                'response',
                '0' as any
              );
              setData(medicalAllergie);
              break;
            case MedicalRecordType.MEDICATION:
              const medicalMedication = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'medications',
                'response',
                '0' as any
              );
              setData(medicalMedication);
              break;
            case MedicalRecordType.HEALTHRESTRICTION:
              const medicalHealthRestriction = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'healthRestrictions',
                'response',
                '0' as any
              );
              setData(medicalHealthRestriction);
              break;
            case MedicalRecordType.MEDICALCONDITION:
              const medicalCondition = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'medicalConditions',
                'response',
                '0' as any
              );
              setData(medicalCondition);
              break;
            case MedicalRecordType.FAMILY_HISTORY:
              const medicalFamilyHistory = g(
                _data,
                'getPatientPrismMedicalRecords_V2',
                'familyHistory',
                'response',
                '0' as any
              );
              setData(medicalFamilyHistory);
              break;
          }
          data ? setApiError(false) : setApiError(true);
        })
        .catch((error) => {
          setApiError(true);
          CommonBugFender('HealthRecordsHome_fetchTestData', error);
          currentPatient && handleGraphQlError(error);
        })
        .finally(() => setLoading && setLoading(false));
    }
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

  const renderTopLineReport = () => {
    return (
      <View>
        <CollapseCard
          heading="ADDITIONAL NOTES"
          collapse={showAdditionalNotes}
          containerStyle={
            !showAdditionalNotes && {
              ...theme.viewStyles.cardViewStyle,
              marginHorizontal: 8,
            }
          }
          headingStyle={{ ...viewStyles.text('SB', 18, theme.colors.LIGHT_BLUE, 1, 23) }}
          labelViewStyle={styles.collapseCardLabelViewStyle}
          onPress={() => setShowAdditionalNotes(!showAdditionalNotes)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12, paddingTop: 12 }]}>
            <View>
              <Text style={styles.descriptionStyle}>
                {data?.additionalNotes ||
                  data?.healthCheckSummary ||
                  data?.notes ||
                  data?.diagnosisNotes}
              </Text>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const downloadPDFTestReport = () => {
    if (currentPatient?.id) {
      setLoading && setLoading(true);
      if (Platform.OS === 'android') {
        if (!!data?.fileUrl) {
          downloadDocument();
        }
      }
      client
        .query<getLabResultpdf, getLabResultpdfVariables>({
          query: GET_LAB_RESULT_PDF,
          variables: {
            patientId: currentPatient?.id,
            recordId: data?.id,
          },
        })
        .then(({ data }: any) => {
          if (data?.getLabResultpdf?.url) {
            downloadDocument(data?.getLabResultpdf?.url);
          }
        })
        .catch((e: any) => {
          setLoading?.(false);
          currentPatient && handleGraphQlError(e, 'Report is yet not available');
        });
    }
  };

  const renderDownloadButton = () => {
    const buttonTitle = healthCheck
      ? 'HEALTH SUMMARY'
      : hospitalization
      ? 'DISCHARGE SUMMARY'
      : prescriptions
      ? data?.source !== '247selfConsultation'
        ? 'PRESCRIPTION'
        : 'MEDICAL FILE'
      : medicalBill
      ? 'BILLS'
      : medicalInsurance
      ? 'INSURANCE REPORT'
      : healthCondition
      ? 'HEALTH CONDITION REPORT'
      : 'TEST REPORT';
    const btnTitle = labResults && Platform.OS === 'ios' ? 'SAVE ' : 'DOWNLOAD ';
    return (
      <View style={{ marginHorizontal: 40, marginBottom: 15, marginTop: 33 }}>
        {!!data.fileUrl && labResults && Platform.OS === 'ios' ? (
          <Button
            title={'SAVE ATTACHMENT'}
            style={{ marginBottom: 20 }}
            onPress={() => downloadDocument()}
          />
        ) : null}
        <Button
          title={btnTitle + buttonTitle}
          onPress={() => (labResults ? downloadPDFTestReport() : downloadDocument())}
        />
      </View>
    );
  };

  const renderDetailsFinding = () => {
    const detailRowView = (name: string, value: string) => {
      return (
        <View style={styles.detailViewRowStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.blueCirleViewStyle} />
            <Text style={styles.labelTextStyle}>{name}</Text>
          </View>
          <Text style={styles.valuesTextStyle}>{value}</Text>
        </View>
      );
    };

    const renderInsuranceAmount = () => {
      return (
        <View>
          <Text style={{ ...viewStyles.text('SB', 16, theme.colors.LIGHT_BLUE, 1, 21) }}>
            {'Insurance Amount'}
          </Text>
          <Text style={styles.insuranceAmountTextStyle}>{'Rs ' + data?.sumInsured}</Text>
        </View>
      );
    };

    const renderTestReportDetails = () => {
      return (
        <>
          <View style={{ flexDirection: 'row' }}>
            <LabTestIcon style={{ height: 20, width: 19, marginRight: 14 }} />
            <Text style={{ ...viewStyles.text('SB', 16, theme.colors.LIGHT_BLUE, 1, 21) }}>
              {'Impressions'}
            </Text>
          </View>
          {data?.labTestResults?.map((item: any) => {
            const unit = item?.unit;
            return (
              <>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>{item.parameterName}</Text>
                </View>
                {detailRowView('Normal Range', item.range ? item.range : 'N/A')}
                {detailRowView('Units', unit || 'N/A')}
                {detailRowView('Result', '')}
                <Text style={styles.resultTextStyle}>{item.result || 'N/A'}</Text>
              </>
            );
          })}
        </>
      );
    };

    const renderDurationView = () => {
      return (
        <>
          {detailRowView('Duration', data?.endDateTime ? '' : 'Active')}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.resultTextStyle}>
              {'Started: ' + moment(data?.startDateTime).format('DD MMM YYYY')}
            </Text>
            {data?.endDateTime ? (
              <Text style={styles.resultTextStyle}>
                {'Ended: ' + moment(data?.endDateTime).format('DD MMM YYYY')}
              </Text>
            ) : null}
          </View>
        </>
      );
    };

    const renderAllergiesDetails = () => {
      return (
        <>
          <View style={{ flexDirection: 'row' }}>
            <PhrAllergyBlackIcon style={{ height: 21.27, width: 18, marginRight: 10 }} />
            <Text style={{ ...viewStyles.text('SB', 16, theme.colors.LIGHT_BLUE, 1, 21) }}>
              {'Impressions'}
            </Text>
          </View>
          <>
            {detailRowView('Severity', data?.severity || 'N/A')}
            {renderDurationView()}
            {detailRowView('Reaction Type', '')}
            <Text style={styles.resultTextStyle}>{data?.reactionToAllergy || 'N/A'}</Text>
          </>
        </>
      );
    };

    const renderMedicationDetails = () => {
      const dosagText =
        data?.morning && data?.noon && data?.evening
          ? 'Morning, Noon, Evening'
          : data?.morning && data?.noon
          ? 'Morning, Noon'
          : data?.morning && data?.evening
          ? 'Morning, Evening'
          : data?.noon && data?.evening
          ? 'Noon, Evening'
          : data?.noon
          ? 'Noon'
          : data?.evening
          ? 'Evening'
          : data?.morning
          ? 'Morning'
          : '';
      return (
        <>
          <View style={{ flexDirection: 'row' }}>
            <PhrMedicationBlackIcon style={{ height: 19.65, width: 18, marginRight: 9 }} />
            <Text style={{ ...viewStyles.text('SB', 16, theme.colors.LIGHT_BLUE, 1, 21) }}>
              {'Impressions'}
            </Text>
          </View>
          <>
            {detailRowView('Medical Condition Name', data?.medicalCondition || 'N/A')}
            {renderDurationView()}
            {detailRowView('Dosage Level', dosagText || 'N/A')}
            {detailRowView('Frequency', '')}
            <Text style={styles.resultTextStyle}>{data?.notes || 'N/A'}</Text>
          </>
        </>
      );
    };

    const renderMedicalConditionDetails = () => {
      return (
        <>
          <View style={{ flexDirection: 'row' }}>
            <PhrSymptomIcon style={{ height: 20, width: 19.96, marginRight: 11.04 }} />
            <Text style={{ ...viewStyles.text('SB', 16, theme.colors.LIGHT_BLUE, 1, 21) }}>
              {'Impressions'}
            </Text>
          </View>
          <>
            {renderDurationView()}
            {detailRowView('Nature of Condition', data?.illnessType || 'N/A')}
            {detailRowView('Medically Relevant Details', '')}
            <Text style={styles.resultTextStyle}>{data?.notes || 'N/A'}</Text>
          </>
        </>
      );
    };

    const renderRestrictionDetails = () => {
      return (
        <>
          <View style={{ flexDirection: 'row' }}>
            <PhrRestrictionBlackIcon style={{ height: 18, width: 18, marginRight: 14 }} />
            <Text style={{ ...viewStyles.text('SB', 16, theme.colors.LIGHT_BLUE, 1, 21) }}>
              {'Impressions'}
            </Text>
          </View>
          <>
            {renderDurationView()}
            {detailRowView('Nature of Condition', data?.nature || 'N/A')}
          </>
        </>
      );
    };

    return (
      <View style={{ marginBottom: showPrescription ? 0 : 15 }}>
        <CollapseCard
          heading="DETAILED FINDINGS"
          collapse={showPrescription}
          containerStyle={
            !showPrescription && {
              ...theme.viewStyles.cardViewStyle,
              marginHorizontal: 8,
            }
          }
          headingStyle={{ ...viewStyles.text('SB', 18, theme.colors.LIGHT_BLUE, 1, 23) }}
          labelViewStyle={styles.collapseCardLabelViewStyle}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={{ marginTop: 11, marginBottom: 20 }}>
            <View style={[styles.cardViewStyle, { marginTop: 4, marginBottom: 4, paddingTop: 16 }]}>
              {data?.sumInsured
                ? renderInsuranceAmount()
                : data?.allergyName
                ? renderAllergiesDetails()
                : data?.medicineName
                ? renderMedicationDetails()
                : data?.restrictionName
                ? renderRestrictionDetails()
                : data?.medicalConditionName
                ? renderMedicalConditionDetails()
                : renderTestReportDetails()}
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderError = (message: string, redirectToOrders: boolean) => {
    showAphAlert?.({
      unDismissable: true,
      title: string.common.uhOh,
      description: message,
      onPressOk: () => {
        hideAphAlert?.();
        redirectToOrders
          ? props.navigation.navigate(AppRoutes.YourOrdersTest)
          : props.navigation.navigate(AppRoutes.ConsultRoom);
      },
    });
  };

  const renderImage = () => {
    const file_name = g(data, 'testResultFiles', '0', 'fileName')
      ? g(data, 'testResultFiles', '0', 'fileName')
      : g(data, 'healthCheckFiles', '0', 'fileName')
      ? g(data, 'healthCheckFiles', '0', 'fileName')
      : g(data, 'hospitalizationFiles', '0', 'fileName')
      ? g(data, 'hospitalizationFiles', '0', 'fileName')
      : g(data, 'prescriptionFiles', '0', 'fileName')
      ? g(data, 'prescriptionFiles', '0', 'fileName')
      : g(data, 'insuranceFiles', '0', 'fileName')
      ? g(data, 'insuranceFiles', '0', 'fileName')
      : g(data, 'billFiles', '0', 'fileName')
      ? g(data, 'billFiles', '0', 'fileName')
      : g(data, 'medicationFiles', '0', 'fileName')
      ? g(data, 'medicationFiles', '0', 'fileName')
      : g(data, 'attachmentList', '0', 'fileName')
      ? g(data, 'attachmentList', '0', 'fileName')
      : g(data, 'familyHistoryFiles', '0', 'fileName')
      ? g(data, 'familyHistoryFiles', '0', 'fileName')
      : '';
    return (
      <View
        style={{
          marginTop: 0,
        }}
      >
        <ScrollView>
          {file_name && file_name.toLowerCase().endsWith('.pdf') ? (
            <View style={{ marginHorizontal: 20, marginBottom: 15, marginTop: 30 }}>
              <Pdf
                key={data.fileUrl}
                source={{ uri: data.fileUrl }}
                style={{
                  height: 425,
                  width: '100%',
                  backgroundColor: 'transparent',
                }}
              />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                props.navigation.navigate(AppRoutes.ImageSliderScreen, {
                  images: [data.fileUrl],
                  heading: file_name || 'Image',
                });
              }}
              style={{ marginHorizontal: 20, marginBottom: 15, marginTop: 15 }}
            >
              <Image
                placeholderStyle={{
                  height: 425,
                  width: '100%',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
                PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
                source={{ uri: data.fileUrl }}
                style={{
                  width: '100%',
                  height: 425,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View style={{ marginBottom: 20 }}>
        {data?.labTestResults?.length > 0 ||
        data?.sumInsured ||
        data?.allergyName ||
        data?.medicineName ||
        data?.restrictionName ||
        data?.medicalConditionName
          ? renderDetailsFinding()
          : null}
        {data?.additionalNotes || data?.healthCheckSummary || data?.notes || data?.diagnosisNotes
          ? renderTopLineReport()
          : null}
        {!!data.fileUrl ? renderImage() : null}
        {!!data.fileUrl || labResults ? renderDownloadButton() : null}
      </View>
    );
  };

  const renderTestTopDetailsView = () => {
    const date_text = healthCheck
      ? 'Uploaded Date'
      : hospitalization
      ? 'Discharge Date'
      : medicalInsurance
      ? 'Insurance Date'
      : healthCondition && data?.recordDateTime
      ? 'Updated'
      : 'Checkup Date';
    const renderDateView = () => {
      return hospitalization && data?.dateOfHospitalization !== 0 ? (
        <Text style={{ ...viewStyles.text('R', 14, theme.colors.SKY_BLUE, 1, 18), marginTop: 3 }}>
          {'From '}
          <Text style={{ ...viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18) }}>{`${moment(
            data?.dateOfHospitalization
          ).format(string.common.date_placeholder_text)}`}</Text>
          {' to '}
          <Text style={{ ...viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18) }}>{`${moment(
            data?.date
          ).format(string.common.date_placeholder_text)}`}</Text>
        </Text>
      ) : medicalInsurance && data?.endDateTime !== 0 ? (
        <Text style={{ ...viewStyles.text('R', 14, theme.colors.SKY_BLUE, 1, 18), marginTop: 3 }}>
          {'From '}
          <Text style={{ ...viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18) }}>{`${moment(
            data?.startDateTime
          ).format(string.common.date_placeholder_text)}`}</Text>
          {' to '}
          <Text style={{ ...viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18) }}>{`${moment(
            data?.endDateTime
          ).format(string.common.date_placeholder_text)}`}</Text>
        </Text>
      ) : (
        <Text style={{ ...viewStyles.text('R', 14, theme.colors.SKY_BLUE, 1, 18), marginTop: 3 }}>
          {'On '}
          <Text style={{ ...viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18) }}>{`${moment(
            data?.date || data?.startDateTime || data?.billDateTime
          ).format(string.common.date_placeholder_text)}`}</Text>
        </Text>
      );
    };
    return (
      <View style={styles.cardViewStyle}>
        {data?.labTestName ||
        data?.prescriptionName ||
        data?.healthCheckName ||
        (!hospitalization && data?.hospitalName) ||
        data?.insuranceCompany ||
        data?.allergyName ||
        data?.medicineName ||
        data?.restrictionName ||
        data?.medicalConditionName ? (
          <Text style={styles.recordNameTextStyle}>
            {data?.labTestName ||
              data?.healthCheckName ||
              data?.prescriptionName ||
              data?.hospitalName ||
              data?.insuranceCompany ||
              data?.allergyName ||
              data?.medicineName ||
              data?.restrictionName ||
              data?.medicalConditionName}{' '}
            <RoundGreenTickIcon style={styles.greenTickIconStyle} />
          </Text>
        ) : null}
        {hospitalization && (data?.doctorName || data?.doctorName === '') ? (
          <Text style={styles.recordNameTextStyle}>
            {'Dr. ' + data?.doctorName || 'Dr. '}{' '}
            <RoundGreenTickIcon style={styles.greenTickIconStyle} />
          </Text>
        ) : null}
        {data?.diseaseName ? (
          <Text style={styles.recordNameTextStyle}>{data?.diseaseName}</Text>
        ) : null}
        {data?.labTestRefferedBy ? (
          <Text style={styles.doctorTextStyle}>{'Dr. ' + data?.labTestRefferedBy || 'Dr. -'}</Text>
        ) : null}
        {data?.familyMember ? (
          <Text style={styles.doctorTextStyle}>{_.capitalize(data?.familyMember) || ''}</Text>
        ) : null}
        {medicalBill && data?.bill_no ? (
          <Text style={styles.doctorTextStyle}>{data?.bill_no}</Text>
        ) : null}
        {medicalInsurance && data?.policyNumber ? (
          <Text style={styles.doctorTextStyle}>{data?.policyNumber}</Text>
        ) : null}
        {prescriptions && data?.prescriptionName !== data?.prescribedBy ? (
          <Text style={styles.doctorTextStyle}>
            {data?.prescribedBy ? 'Dr. ' + data?.prescribedBy : 'Dr. -'}
          </Text>
        ) : null}
        {data?.suggestedByDoctor ? (
          <Text style={styles.doctorTextStyle}>{'Dr. ' + data?.suggestedByDoctor || 'Dr. -'}</Text>
        ) : null}
        {data?.doctorTreated ? (
          <Text style={styles.doctorTextStyle}>{'Dr. ' + data?.doctorTreated || 'Dr. -'}</Text>
        ) : null}
        {hospitalization ? null : data?.doctorName ? (
          <Text style={styles.doctorTextStyle}>{'Dr. ' + data?.doctorName || 'Dr. -'}</Text>
        ) : null}
        {medicalInsurance || hospitalization || data?.diseaseName ? null : (
          <Text style={styles.sourceTextStyle}>
            {getSourceName(data?.labTestSource, data?.siteDisplayName, data?.source) ===
            string.common.clicnical_document_text
              ? string.common.clicnical_document_text
              : data?.siteDisplayName || '-'}
          </Text>
        )}
        {data?.age ? (
          <Text style={styles.sourceTextStyle}>
            {data?.age === 1 ? `${data?.age} Yr` : `${data?.age} Yrs`}
          </Text>
        ) : null}
        {hospitalization ? (
          <Text style={styles.sourceTextStyle}>
            {data?.hospitalName &&
            getSourceName(data?.source) === string.common.clicnical_document_text
              ? data?.hospitalName
              : data?.siteDisplayName || '-'}
          </Text>
        ) : null}
        <View style={styles.separatorLineStyle} />
        <Text style={{ ...viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 21) }}>
          {date_text}
        </Text>
        {renderDateView()}
      </View>
    );
  };

  const getFileName = (file_name: string, pdfUrl: string) => {
    const file_name_text = healthCheck
      ? 'HealthSummary_'
      : hospitalization
      ? 'DischargeSummary_'
      : prescriptions
      ? 'Prescription_'
      : medicalBill
      ? 'Bill_'
      : medicalInsurance
      ? 'InsuranceReport_'
      : healthCondition
      ? 'HealthConditionReport_'
      : 'TestReport_';
    const labResultFileName = `${file_name_text}${moment(data?.date).format(
      'DD MM YYYY'
    )}_Apollo 247${new Date().getTime()}${pdfUrl ? '.pdf' : file_name}`;
    return labResults
      ? labResultFileName
      : file_name_text +
          moment(data?.date).format('DD MM YYYY') +
          '_Apollo 247' +
          new Date().getTime() +
          file_name;
  };

  const downloadDocument = (pdfUrl: string = '') => {
    const file_name = g(data, 'testResultFiles', '0', 'fileName')
      ? g(data, 'testResultFiles', '0', 'fileName')
      : g(data, 'healthCheckFiles', '0', 'fileName')
      ? g(data, 'healthCheckFiles', '0', 'fileName')
      : g(data, 'hospitalizationFiles', '0', 'fileName')
      ? g(data, 'hospitalizationFiles', '0', 'fileName')
      : g(data, 'prescriptionFiles', '0', 'fileName')
      ? g(data, 'prescriptionFiles', '0', 'fileName')
      : g(data, 'insuranceFiles', '0', 'fileName')
      ? g(data, 'insuranceFiles', '0', 'fileName')
      : g(data, 'billFiles', '0', 'fileName')
      ? g(data, 'billFiles', '0', 'fileName')
      : g(data, 'medicationFiles', '0', 'fileName')
      ? g(data, 'medicationFiles', '0', 'fileName')
      : g(data, 'attachmentList', '0', 'fileName')
      ? g(data, 'attachmentList', '0', 'fileName')
      : g(data, 'familyHistoryFiles', '0', 'fileName')
      ? g(data, 'familyHistoryFiles', '0', 'fileName')
      : '';

    const eventInputData = removeObjectProperty(data, propertyName);

    const dirs = RNFetchBlob.fs.dirs;

    const fileName: string = getFileName(file_name, pdfUrl);
    const downloadPath =
      Platform.OS === 'ios'
        ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + (fileName || 'Apollo_TestReport.pdf')
        : dirs.DownloadDir + '/' + (fileName || 'Apollo_TestReport.pdf');
    setLoading && setLoading(true);
    RNFetchBlob.config({
      fileCache: true,
      path: downloadPath,
      addAndroidDownloads: {
        title: fileName,
        useDownloadManager: true,
        notification: true,
        path: downloadPath,
        mime: mimeType(downloadPath),
        description: 'File downloaded by download manager.',
      },
    })
      .fetch('GET', labResults ? pdfUrl || data?.fileUrl : data.fileUrl, {
        //some headers ..
      })
      .then((res) => {
        setLoading && setLoading(false);
        postWebEngagePHR(currentPatient, webEngageEventName, webEngageSource, eventInputData);
        Platform.OS === 'ios'
          ? RNFetchBlob.ios.previewDocument(res.path())
          : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
      })
      .catch((err) => {
        CommonBugFender('ConsultDetails_renderFollowUp', err);
        currentPatient && handleGraphQlError(err);
        setLoading && setLoading(false);
      })
      .finally(() => {
        setLoading && setLoading(false);
      });
  };

  const renderProfileImage = () => {
    return (
      <ProfileImageComponent
        currentPatient={currentPatient}
        onPressProfileImage={() => props.navigation.pop(2)}
      />
    );
  };

  const onGoBack = () => {
    if (movedFrom == 'deeplink') {
      navigateToHome(props.navigation);
    } else {
      props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
      props.navigation.goBack();
    }
  };

  if (data) {
    const headerTitle = healthCheck
      ? 'HEALTH SUMMARY'
      : hospitalization
      ? 'HOSPITALIZATION'
      : prescriptions
      ? 'DOCTOR CONSULTATIONS DETAILS'
      : medicalBill
      ? 'BILL'
      : medicalInsurance
      ? 'INSURANCE'
      : healthCondition
      ? healthHeaderTitle || 'Health Condition'
      : 'TEST REPORTS DETAIL';
    return (
      <View style={styles.mainViewStyle}>
        <SafeAreaView style={styles.safeAreaViewStyle}>
          <Header
            title={headerTitle}
            leftIcon="backArrow"
            rightComponent={renderProfileImage()}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={onGoBack}
          />
          <ScrollView bounces={false}>
            {renderTestTopDetailsView()}
            {renderData()}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }
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
