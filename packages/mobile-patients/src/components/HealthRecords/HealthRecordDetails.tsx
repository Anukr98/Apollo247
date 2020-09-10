import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Download,
  LabTestIcon,
  RoundGreenTickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
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
import Pdf from 'react-native-pdf';
import { Image } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { string } from '@aph/mobile-patients/src/strings/string';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { MedicalTest } from '@aph/mobile-patients/src/components/HealthRecords/AddRecord';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';

const styles = StyleSheet.create({
  labelStyle: {
    color: theme.colors.SHERPA_BLUE,
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
    alignSelf: 'center',
    marginLeft: 6,
    marginTop: 2.5,
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
});

export interface HealthRecordDetailsProps extends NavigationScreenProps {}

export const HealthRecordDetails: React.FC<HealthRecordDetailsProps> = (props) => {
  const [showtopLine, setshowtopLine] = useState<boolean>(true);
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  const healthCheck = props.navigation.state.params
    ? props.navigation.state.params.healthCheck
    : false;
  const hospitalization = props.navigation.state.params
    ? props.navigation.state.params.hospitalization
    : false;
  const { currentPatient } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const { setLoading } = useUIElements();

  useEffect(() => {
    !!data.fileUrl ? setshowPopUp(false) : setshowPopUp(true);
  }, []);

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
      <View
        style={{
          marginTop: 24,
        }}
      >
        <CollapseCard
          heading="TOPLINE REPORT"
          collapse={showtopLine}
          onPress={() => setshowtopLine(!showtopLine)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            <View>
              <Text style={styles.descriptionStyle}>
                {data?.additionalNotes || data?.healthCheckSummary || data?.dischargeSummary}
              </Text>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderDownloadButton = () => {
    const buttonTitle = healthCheck
      ? 'HEALTH SUMMARY'
      : hospitalization
      ? 'DISCHARGE SUMMARY'
      : 'TEST REPORT';
    return (
      <View style={{ marginHorizontal: 40, marginBottom: 15, marginTop: 33 }}>
        <Button title={'DOWNLOAD ' + buttonTitle} onPress={downloadDocument}></Button>
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
      <View>
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
            {(
              (data.medicalRecordParameters && data.medicalRecordParameters) ||
              (data.labTestResults && data.labTestResults)
            ).map((item: any) => {
              const unit = MedicalTest.find((itm) => itm.key === item.unit);
              return (
                <View
                  style={[styles.cardViewStyle, { marginTop: 4, marginBottom: 4, paddingTop: 16 }]}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <LabTestIcon style={{ height: 20, width: 19, marginRight: 14 }} />
                    <Text style={{ ...viewStyles.text('SB', 16, '#02475B', 1, 21) }}>
                      {'Impressions'}
                    </Text>
                  </View>
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item.parameterName}</Text>
                  </View>
                  {detailRowView(
                    'Normal Range',
                    item.range ? item.range : `${item.minimum || ''} - ${item.maximum || 'N/A'}`
                  )}
                  {detailRowView('Units', unit ? unit.value : item.unit || 'N/A')}
                  {detailRowView('Result', item.result || 'N/A')}
                </View>
              );
            })}
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
        {(!!data.additionalNotes || !!data.healthCheckSummary || !!data.dischargeSummary) &&
          renderTopLineReport()}
        {(data.medicalRecordParameters && data.medicalRecordParameters.length > 0) ||
        (data.labTestResults && data.labTestResults.length > 0)
          ? renderDetailsFinding()
          : null}
        {!!data.fileUrl ? renderImage() : null}
        {!!data.fileUrl ? renderDownloadButton() : null}
      </View>
    );
  };

  const renderTestTopDetailsView = () => {
    const date_text = healthCheck
      ? 'Uploaded Date'
      : hospitalization
      ? 'Discharge Date'
      : 'CheckUp Date';
    return (
      <View style={styles.cardViewStyle}>
        {data?.labTestName ? (
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ ...viewStyles.text('SB', 23, '#02475B', 1, 30) }}>
              {data?.labTestName || data?.healthCheckType || data?.healthCheckName}
            </Text>
            <RoundGreenTickIcon style={styles.greenTickIconStyle} />
          </View>
        ) : null}
        {data?.labTestRefferedBy ? (
          <Text style={{ ...viewStyles.text('M', 16, '#0087BA', 1, 21), marginTop: 6 }}>
            {'Dr. ' + data?.labTestRefferedBy || 'Dr. -'}
          </Text>
        ) : null}
        {data?.doctorName ? (
          <Text style={{ ...viewStyles.text('M', 16, '#0087BA', 1, 21), marginTop: 6 }}>
            {data?.doctorName || 'Dr. -'}
          </Text>
        ) : null}
        {data?.siteDisplayName || data?.hospitalName ? (
          <Text style={{ ...viewStyles.text('M', 14, '#67909C', 1, 18), marginTop: 3 }}>
            {data?.siteDisplayName || data?.hospitalName}
          </Text>
        ) : null}
        {data?.healthCheckType || data?.healthCheckName ? (
          <Text style={{ ...viewStyles.text('M', 16, '#01475B', 1, 21), marginTop: 0 }}>
            {data?.healthCheckType || data?.healthCheckName}
          </Text>
        ) : null}
        <View style={styles.separatorLineStyle} />
        <Text style={{ ...viewStyles.text('M', 16, '#02475B', 1, 21) }}>{date_text}</Text>
        <Text style={{ ...viewStyles.text('R', 14, '#0087BA', 1, 18), marginTop: 3 }}>
          {'On '}
          <Text style={{ ...viewStyles.text('M', 14, '#02475B', 1, 18) }}>{`${moment(
            data?.date
          ).format('DD MMM YYYY')}`}</Text>
        </Text>
      </View>
    );
  };

  const getFileName = (file_name: string) => {
    const file_name_text = healthCheck
      ? 'HealthSummary_'
      : hospitalization
      ? 'DischargeSummary_'
      : 'TestReport_';
    return (
      file_name_text +
      moment(data?.date).format('DD MM YYYY') +
      '_Apollo 247' +
      new Date().getTime() +
      file_name
    );
  };

  const downloadDocument = () => {
    const file_name = g(data, 'testResultFiles', '0', 'fileName')
      ? g(data, 'testResultFiles', '0', 'fileName')
      : g(data, 'healthCheckFiles', '0', 'fileName')
      ? g(data, 'healthCheckFiles', '0', 'fileName')
      : g(data, 'hospitalizationFiles', '0', 'fileName')
      ? g(data, 'hospitalizationFiles', '0', 'fileName')
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
      .fetch('GET', data.fileUrl, {
        //some headers ..
      })
      .then((res) => {
        setLoading && setLoading(false);
        Platform.OS === 'ios'
          ? RNFetchBlob.ios.previewDocument(res.path())
          : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
      })
      .catch((err) => {
        CommonBugFender('ConsultDetails_renderFollowUp', err);
        console.log('error ', err);
        setLoading && setLoading(false);
      });
  };

  const headerRightComponent = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={downloadDocument}>
        <Download />
      </TouchableOpacity>
    );
  };

  if (data) {
    const headerTitle = healthCheck
      ? 'HEALTH SUMMARY'
      : hospitalization
      ? 'HOSPITALIZATION'
      : 'TEST RESULTS';
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            title={headerTitle}
            leftIcon="backArrow"
            rightComponent={!!data.fileUrl ? headerRightComponent() : null}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <ScrollView bounces={false}>
            {renderTestTopDetailsView()}
            {renderData()}
          </ScrollView>
          {showSpinner && <Spinner />}
        </SafeAreaView>
        {showPopUp && (
          <BottomPopUp
            title={`Hi ${(currentPatient && currentPatient.firstName!.toLowerCase()) || ''},`}
            description={'You do not have any images'}
          >
            <View style={{ height: 60, alignItems: 'flex-end' }}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.gotItStyles}
                onPress={() => {
                  setshowPopUp(false);
                }}
              >
                <Text style={styles.gotItTextStyles}>{string.LocalStrings.ok}</Text>
              </TouchableOpacity>
            </View>
          </BottomPopUp>
        )}
      </View>
    );
  }
  return <Spinner />;
};
