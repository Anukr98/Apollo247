import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { LabTestIcon, RoundGreenTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GET_LAB_RESULT_PDF } from '@aph/mobile-patients/src/graphql/profiles';
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
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import {
  getLabResultpdf,
  getLabResultpdfVariables,
} from '@aph/mobile-patients/src/graphql/types/getLabResultpdf';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';

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
    backgroundColor: '#02475B',
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
    backgroundColor: '#02475B',
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
    ...theme.viewStyles.text('SB', 18, '#0087BA', 1, 23.4),
    marginTop: 11,
  },
});

export interface HealthRecordDetailsProps extends NavigationScreenProps {}

export const HealthRecordDetails: React.FC<HealthRecordDetailsProps> = (props) => {
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState<boolean>(false);
  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
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
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading } = useUIElements();
  const client = useApolloClient();

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  });
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
      console.log('error', error);
    }
  };

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
          headingStyle={{ ...viewStyles.text('SB', 18, '#02475B', 1, 23) }}
          labelViewStyle={styles.collapseCardLabelViewStyle}
          onPress={() => setShowAdditionalNotes(!showAdditionalNotes)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12, paddingTop: 12 }]}>
            <View>
              <Text style={styles.descriptionStyle}>
                {data?.additionalNotes ||
                  data?.healthCheckSummary ||
                  data?.dischargeSummary ||
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
          console.log(e);
          currentPatient &&
            handleGraphQlError(
              e,
              'Something went wrong while downloading test report. Please try again.'
            );
        });
    }
  };

  const renderDownloadButton = () => {
    const buttonTitle = healthCheck
      ? 'HEALTH SUMMARY'
      : hospitalization
      ? 'DISCHARGE SUMMARY'
      : prescriptions
      ? 'PRESCRIPTION'
      : medicalBill
      ? 'BILLS'
      : medicalInsurance
      ? 'INSURANCE REPORT'
      : 'TEST REPORT';
    return (
      <View style={{ marginHorizontal: 40, marginBottom: 15, marginTop: 33 }}>
        <Button
          title={'DOWNLOAD ' + buttonTitle}
          onPress={() => (labResults ? downloadPDFTestReport() : downloadDocument())}
        ></Button>
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
          headingStyle={{ ...viewStyles.text('SB', 18, '#02475B', 1, 23) }}
          labelViewStyle={styles.collapseCardLabelViewStyle}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={{ marginTop: 11, marginBottom: 20 }}>
            <View style={[styles.cardViewStyle, { marginTop: 4, marginBottom: 4, paddingTop: 16 }]}>
              {data?.sumInsured ? (
                <View>
                  <Text style={{ ...viewStyles.text('SB', 16, '#02475B', 1, 21) }}>
                    {'Insurance Amount'}
                  </Text>
                  <Text style={styles.insuranceAmountTextStyle}>{'Rs ' + data?.sumInsured}</Text>
                </View>
              ) : (
                <>
                  <View style={{ flexDirection: 'row' }}>
                    <LabTestIcon style={{ height: 20, width: 19, marginRight: 14 }} />
                    <Text style={{ ...viewStyles.text('SB', 16, '#02475B', 1, 21) }}>
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
                        {detailRowView(
                          'Normal Range',
                          item.range
                            ? item.range
                            : `${item.minimum || ''} - ${item.maximum || 'N/A'}`
                        )}
                        {detailRowView('Units', unit || 'N/A')}
                        {detailRowView('Result', '')}
                        <Text style={styles.resultTextStyle}>{item.result || 'N/A'}</Text>
                      </>
                    );
                  })}
                </>
              )}
            </View>
          </View>
        </CollapseCard>
      </View>
    );
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
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log(`number of pages: ${numberOfPages}, fb:${filePath}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`current page: ${page}`);
                }}
                onError={(error) => {
                  console.log(error);
                }}
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
      <View>
        {data?.labTestResults?.length > 0 || data?.sumInsured ? renderDetailsFinding() : null}
        {data?.additionalNotes ||
        data?.healthCheckSummary ||
        data?.dischargeSummary ||
        data?.notes ||
        data?.diagnosisNotes
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
      : 'Checkup Date';
    const getSourceName = (
      labTestSource: string,
      siteDisplayName: string,
      healthCheckSource: string
    ) => {
      if (
        labTestSource === 'self' ||
        labTestSource === '247self' ||
        siteDisplayName === 'self' ||
        siteDisplayName === '247self' ||
        healthCheckSource === 'self' ||
        healthCheckSource === '247self'
      ) {
        return 'Clinical Document';
      }
      return siteDisplayName || labTestSource || healthCheckSource;
    };
    const renderDateView = () => {
      return hospitalization && data.dateOfHospitalization !== 0 ? (
        <Text style={{ ...viewStyles.text('R', 14, '#0087BA', 1, 18), marginTop: 3 }}>
          {'From '}
          <Text style={{ ...viewStyles.text('M', 14, '#02475B', 1, 18) }}>{`${moment(
            data?.dateOfHospitalization
          ).format('DD MMM, YYYY')}`}</Text>
          {' to '}
          <Text style={{ ...viewStyles.text('M', 14, '#02475B', 1, 18) }}>{`${moment(
            data?.date
          ).format('DD MMM, YYYY')}`}</Text>
        </Text>
      ) : medicalInsurance && data.endDateTime !== 0 ? (
        <Text style={{ ...viewStyles.text('R', 14, '#0087BA', 1, 18), marginTop: 3 }}>
          {'From '}
          <Text style={{ ...viewStyles.text('M', 14, '#02475B', 1, 18) }}>{`${moment(
            data?.startDate
          ).format('DD MMM, YYYY')}`}</Text>
          {' to '}
          <Text style={{ ...viewStyles.text('M', 14, '#02475B', 1, 18) }}>{`${moment(
            data?.endDateTime
          ).format('DD MMM, YYYY')}`}</Text>
        </Text>
      ) : (
        <Text style={{ ...viewStyles.text('R', 14, '#0087BA', 1, 18), marginTop: 3 }}>
          {'On '}
          <Text style={{ ...viewStyles.text('M', 14, '#02475B', 1, 18) }}>{`${moment(
            data?.date || data?.startDate
          ).format('DD MMM, YYYY')}`}</Text>
        </Text>
      );
    };
    return (
      <View style={styles.cardViewStyle}>
        {data?.labTestName ||
        data?.prescriptionName ||
        data?.healthCheckName ||
        (hospitalization && (data?.doctorName || data?.doctorName === '')) ||
        data?.hospitalName ||
        data?.insuranceCompany ? (
          <Text style={{ ...viewStyles.text('SB', 23, '#02475B', 1, 30) }}>
            {data?.labTestName ||
              data?.healthCheckName ||
              data?.prescriptionName ||
              data?.hospitalName ||
              data?.insuranceCompany ||
              'Dr. ' + data?.doctorName ||
              'Dr. '}{' '}
            <RoundGreenTickIcon style={styles.greenTickIconStyle} />
          </Text>
        ) : null}
        {data?.labTestRefferedBy ? (
          <Text style={{ ...viewStyles.text('M', 16, '#0087BA', 1, 21), marginTop: 6 }}>
            {'Dr. ' + data?.labTestRefferedBy || 'Dr. -'}
          </Text>
        ) : null}
        {medicalBill && data?.bill_no ? (
          <Text style={{ ...viewStyles.text('M', 16, '#0087BA', 1, 21), marginTop: 6 }}>
            {data?.bill_no}
          </Text>
        ) : null}
        {medicalInsurance && data?.policyNumber ? (
          <Text style={{ ...viewStyles.text('M', 16, '#0087BA', 1, 21), marginTop: 6 }}>
            {data?.policyNumber}
          </Text>
        ) : null}
        {prescriptions && data?.prescriptionName !== data?.prescribedBy ? (
          <Text style={{ ...viewStyles.text('M', 16, '#0087BA', 1, 21), marginTop: 6 }}>
            {'Dr. ' + data?.prescribedBy || 'Dr. -'}
          </Text>
        ) : null}
        {hospitalization ? null : data?.doctorName ? (
          <Text style={{ ...viewStyles.text('M', 16, '#0087BA', 1, 21), marginTop: 6 }}>
            {'Dr. ' + data?.doctorName || 'Dr. -'}
          </Text>
        ) : null}
        {prescriptions ? (
          <Text style={{ ...viewStyles.text('R', 14, '#67909C', 1, 18.2), marginTop: 6 }}>
            {'Clinical Document'}
          </Text>
        ) : (
          <Text style={{ ...viewStyles.text('R', 14, '#67909C', 1, 18.2), marginTop: 3 }}>
            {getSourceName(
              data?.labTestSource || '-',
              data?.siteDisplayName || '-',
              data?.source || '-'
            )}
          </Text>
        )}
        <View style={styles.separatorLineStyle} />
        <Text style={{ ...viewStyles.text('M', 16, '#02475B', 1, 21) }}>{date_text}</Text>
        {renderDateView()}
      </View>
    );
  };

  const getFileName = (file_name: string) => {
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
      : 'TestReport_';
    return labResults
      ? file_name_text +
          moment(data?.date).format('DD MM YYYY') +
          '_Apollo 247' +
          new Date().getTime() +
          '.pdf'
      : file_name_text +
          moment(data?.date).format('DD MM YYYY') +
          '_Apollo 247' +
          new Date().getTime() +
          file_name;
  };

  const downloadDocument = (pdfUrl: string = '') => {
    const webEngageSource = healthCheck
      ? 'Health Check'
      : hospitalization
      ? 'Discharge Summary'
      : prescriptions
      ? 'Prescription'
      : 'Lab Test';
    const webEngageEventName: WebEngageEventName = healthCheck
      ? WebEngageEventName.PHR_DOWNLOAD_HEALTH_CHECKS
      : hospitalization
      ? WebEngageEventName.PHR_DOWNLOAD_HOSPITALIZATIONS
      : prescriptions
      ? WebEngageEventName.PHR_DOWNLOAD_PRESCRIPTIONS
      : WebEngageEventName.PHR_DOWNLOAD_LAB_TESTS;
    const file_name = g(data, 'testResultFiles', '0', 'fileName')
      ? g(data, 'testResultFiles', '0', 'fileName')
      : g(data, 'healthCheckFiles', '0', 'fileName')
      ? g(data, 'healthCheckFiles', '0', 'fileName')
      : g(data, 'hospitalizationFiles', '0', 'fileName')
      ? g(data, 'hospitalizationFiles', '0', 'fileName')
      : g(data, 'prescriptionFiles', '0', 'fileName')
      ? g(data, 'prescriptionFiles', '0', 'fileName')
      : '';
    const dirs = RNFetchBlob.fs.dirs;

    const fileName: string = getFileName(file_name);
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
      .fetch('GET', labResults ? pdfUrl : data.fileUrl, {
        //some headers ..
      })
      .then((res) => {
        setLoading && setLoading(false);
        (!medicalBill || !medicalInsurance) &&
          postWebEngagePHR(webEngageSource, webEngageEventName);
        Platform.OS === 'ios'
          ? RNFetchBlob.ios.previewDocument(res.path())
          : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
      })
      .catch((err) => {
        CommonBugFender('ConsultDetails_renderFollowUp', err);
        console.log('error ', err);
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
      : 'TEST REPORTS DETAIL';
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <SafeAreaView
          style={{
            ...theme.viewStyles.container,
          }}
        >
          <Header
            title={headerTitle}
            leftIcon="backArrow"
            rightComponent={renderProfileImage()}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <ScrollView bounces={false}>
            {renderTestTopDetailsView()}
            {renderData()}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }
  return <Spinner />;
};
