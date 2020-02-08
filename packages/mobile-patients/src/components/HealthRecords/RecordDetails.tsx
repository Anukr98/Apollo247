import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Download,
  FileBig,
  MedicineRxIcon,
  PrescriptionThumbnail,
  ShareGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  Linking,
  ScrollView,
  CameraRoll,
  PermissionsAndroid,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { downloadDocuments } from '../../graphql/types/downloadDocuments';
import { DOWNLOAD_DOCUMENT } from '../../graphql/profiles';
import { useAllCurrentPatients, useAuth } from '../../hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import { BottomPopUp } from '../ui/BottomPopUp';
import { string } from '../../strings/string';
import { MedicalTest } from './AddRecord';
import { Button } from '../ui/Button';
import { AppRoutes } from '../NavigatorContainer';
import { useUIElements } from '../UIElementsProvider';
import { mimeType } from '../../helpers/mimeType';
import { Image } from 'react-native-elements';

const styles = StyleSheet.create({
  imageView: {
    ...theme.viewStyles.cardViewStyle,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    backgroundColor: theme.colors.WHITE,
  },
  doctorNameStyle: {
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.04,
    lineHeight: 20,
  },
  doctorDetailsStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  labelStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  descriptionStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  labelTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingTop: 8,
    paddingBottom: 3,
  },
  valuesTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingBottom: 16,
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
});

export interface RecordDetailsProps extends NavigationScreenProps {}

export const RecordDetails: React.FC<RecordDetailsProps> = (props) => {
  const [showtopLine, setshowtopLine] = useState<boolean>(true);
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  console.log('recorddetails', data);
  const { currentPatient } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [placeImage, setPlaceImage] = useState<any>();
  const client = useApolloClient();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();

  useEffect(() => {
    if (
      data.prismFileIds ||
      data.hospitalizationPrismFileIds ||
      data.healthCheckPrismFileIds ||
      data.testResultPrismFileIds
    ) {
      const prismFileds =
        (data.prismFileIds && data.prismFileIds.split(',')) ||
        (data.hospitalizationPrismFileIds &&
          (typeof data.hospitalizationPrismFileIds === 'string'
            ? data.hospitalizationPrismFileIds.split(',')
            : data.hospitalizationPrismFileIds)) ||
        (data.healthCheckPrismFileIds &&
          (typeof data.healthCheckPrismFileIds === 'string'
            ? data.healthCheckPrismFileIds.split(',')
            : data.healthCheckPrismFileIds)) ||
        (data.testResultPrismFileIds &&
          (typeof data.testResultPrismFileIds === 'string'
            ? data.testResultPrismFileIds.split(',')
            : data.testResultPrismFileIds));
      const urls = data.prescriptionImageUrl && data.prescriptionImageUrl.split(',');
      console.log('prismFileIds', urls && urls.join(','));
      setshowSpinner(true);
      client
        .query<downloadDocuments>({
          query: DOWNLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            downloadDocumentsInput: {
              patientId: currentPatient && currentPatient.id,
              fileIds: prismFileds,
            },
          },
        })
        .then(({ data }) => {
          setshowSpinner(false);
          console.log(data, 'DOWNLOAD_DOCUMENT');
          const uploadUrlscheck = data.downloadDocuments.downloadPaths!.map(
            (item, index) => item || (urls && urls.length <= index + 1 ? urls[index] : '')
          );
          setPlaceImage(uploadUrlscheck);
          console.log(uploadUrlscheck, 'DOWNLOAD_DOCUMENTcmple');
        })
        .catch((e) => {
          CommonBugFender('RecordDetails_DOWNLOAD_DOCUMENT', e);
          setshowSpinner(false);
          console.log('Error occured', e);
        })
        .finally(() => {
          setshowSpinner(false);
        });
    } else if (data.prescriptionImageUrl) {
      setPlaceImage(data.prescriptionImageUrl.split(','));
    } else {
      setshowPopUp(true);
    }
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

  const showMultiAlert = (files: { path: string; name: string }[]) => {
    if (files.length > 0) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Downloaded : ' + files[0].name,
        onPressOk: () => {
          hideAphAlert!();
          console.log('this file is opened', files);
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(files[0].path)
            : RNFetchBlob.android.actionViewIntent(files[0].path, mimeType(files[0].path));
          showMultiAlert(files.slice(1, files.length));
        },
      });
    }
  };

  const renderRecordDetails = () => {
    return (
      <View>
        <View style={styles.doctorDetailsStyle}>
          <MedicineRxIcon />
          <Text style={[styles.doctorNameStyle, { paddingTop: 7 }]}>Diabetes Tablets</Text>
          <Text style={styles.timeStyle}>09 Aug 2019</Text>
        </View>
        <View style={{ margin: 20 }}>
          <PrescriptionThumbnail style={{ flex: 1, width: '100%' }} />
        </View>
      </View>
    );
  };

  const renderDoctorDetails = () => {
    return (
      <View style={styles.doctorDetailsStyle}>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorNameStyle}>
              {(data.testName && data.testName) ||
                (data.issuingDoctor && data.issuingDoctor) ||
                (data.location && data.location) ||
                (data.diagnosisNotes && data.diagnosisNotes) ||
                (data.healthCheckName && data.healthCheckName) ||
                (data.labTestName && data.labTestName)}
            </Text>
            <Text style={styles.timeStyle}>
              {`Check-up Date: ${moment(
                (data.testDate && data.testDate) ||
                  (data.dateOfHospitalization && data.dateOfHospitalization) ||
                  (data.appointmentDate && data.appointmentDate) ||
                  (data.labTestDate && data.labTestDate)
              ).format('DD MMM YYYY')}\nReferring Doctor: Dr. ${
                !!data.referringDoctor
                  ? data.referringDoctor
                  : !!data.signingDocName
                  ? data.signingDocName
                  : '-'
              }`}
            </Text>
            {/* <Text style={styles.timeStyle}>
              {`Check-up Date: ${moment(
                (data.testDate && data.testDate) ||
                  (data.dateOfHospitalization && data.dateOfHospitalization) ||
                  (data.appointmentDate && data.appointmentDate) ||
                  (data.labTestDate && data.labTestDate)
              ).format('DD MMM YYYY')}\nSource: ${
                !!data.sourceName
                  ? data.sourceName
                  : !!data.source
                  ? data.source
                  : !!data.labTestSource
                  ? data.labTestSource
                  : '-'
              }\nReferring Doctor: Dr. ${
                !!data.referringDoctor
                  ? data.referringDoctor
                  : !!data.signingDocName
                  ? data.signingDocName
                  : '-'
              }`}
            </Text> */}
          </View>
          <View style={styles.imageView}>
            <FileBig />
          </View>
        </View>
      </View>
    );
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
                {(data.observations && data.observations) ||
                  (data.additionalNotes && data.additionalNotes) ||
                  (data.healthCheckSummary && data.healthCheckSummary)}
              </Text>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderDetailsFinding = () => {
    return (
      <View>
        <CollapseCard
          heading="DETAILED FINDINGS"
          collapse={showPrescription}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={{ marginTop: 11, marginBottom: 20 }}>
            {(
              (data.medicalRecordParameters && data.medicalRecordParameters) ||
              (data.labTestResultParameters && data.labTestResultParameters)
            ).map((item: any) => {
              const unit = MedicalTest.find((itm) => itm.key === item.unit);
              return (
                <View style={[styles.cardViewStyle, { marginTop: 4, marginBottom: 4 }]}>
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item.parameterName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={styles.labelTextStyle}>Result</Text>
                      <Text style={styles.valuesTextStyle}>{item.result}</Text>
                    </View>
                    <View>
                      <Text style={styles.labelTextStyle}>Units</Text>
                      <Text style={styles.valuesTextStyle}>{unit ? unit.value : item.unit}</Text>
                    </View>
                    <View>
                      <Text style={styles.labelTextStyle}>Normal Range</Text>
                      <Text style={styles.valuesTextStyle}>
                        {item.minimum} - {item.maximum}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderImage = () => {
    // const placeImage1 = placeImage.split(',');
    console.log(placeImage, 'placeImage1');
    // {
    //   placeImage.map((item: string, i: number) => console.log('hi', item));
    // }
    return (
      <View
        style={{
          marginTop: 15,
        }}
      >
        <ScrollView>
          {placeImage.map((item: string, i: number) => {
            if (item.indexOf('.pdf') > -1) {
              return (
                <View key={i} style={{ marginHorizontal: 20, marginBottom: 15 }}>
                  <Button
                    title={
                      'Open File' +
                      (item.indexOf('fileName=') > -1 ? ': ' + item.split('fileName=').pop() : '')
                    }
                    onPress={() =>
                      props.navigation.navigate(AppRoutes.RenderPdf, {
                        uri: item,
                        title: item.indexOf('fileName=') > -1 ? item.split('fileName=').pop() : '',
                      })
                    }
                  ></Button>
                </View>
              );
            } else {
              return (
                <View key={i} style={{ marginHorizontal: 20, marginBottom: 15 }}>
                  <Image
                    placeholderStyle={{
                      height: 425,
                      width: '100%',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                    }}
                    PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
                    source={{ uri: item }}
                    style={{
                      // flex: 1,
                      width: '100%',
                      height: 425,
                    }}
                    resizeMode="contain"
                  />
                </View>
              );
            }
          })}
        </ScrollView>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View>
        {(!!data.observations || !!data.additionalNotes || !!data.healthCheckSummary) &&
          renderTopLineReport()}
        {(data.medicalRecordParameters && data.medicalRecordParameters.length > 0) ||
        (data.labTestResultParameters && data.labTestResultParameters.length > 0)
          ? renderDetailsFinding()
          : null}
        {placeImage && renderImage()}
      </View>
    );
  };
  // const saveimageIos = (url: any) => {
  //   if (Platform.OS === 'ios') {
  //     Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  //   }
  // };

  if (data)
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            title="RECORD DETAILS"
            leftIcon="backArrow"
            // rightComponent={
            //   placeImage && (
            //     <View style={{ flexDirection: 'row' }}>
            //       <TouchableOpacity
            //         activeOpacity={1}
            //         onPress={() => {
            //           placeImage.forEach((item: string) => {
            //             let dirs = RNFetchBlob.fs.dirs;
            //             let fileDownloaded: { path: string; name: string }[] = [];
            //             setLoading && setLoading(true);
            //             let fileName: string =
            //               item
            //                 .split('/')
            //                 .pop()!
            //                 .split('=')
            //                 .pop() || 'Document';
            //             const downloadPath =
            //               Platform.OS === 'ios'
            //                 ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + fileName
            //                 : dirs.DownloadDir + '/' + fileName;
            //             RNFetchBlob.config({
            //               fileCache: true,
            //               path: downloadPath,
            //               addAndroidDownloads: {
            //                 title: fileName,
            //                 useDownloadManager: true,
            //                 path: downloadPath,
            //                 mime: mimeType(downloadPath),
            //                 notification: true,
            //                 description: 'File downloaded by download manager.',
            //               },
            //             })
            //               .fetch('GET', item, {
            //                 //some headers ..
            //               })
            //               .then((res) => {
            //                 setLoading && setLoading(false);
            //                 fileDownloaded.push({ path: res.path(), name: fileName });
            //                 if (fileDownloaded.length > 0) {
            //                   showMultiAlert(fileDownloaded);
            //                 }
            //               })
            //               .catch((err) => {
            //                 CommonBugFender('RecordDetails_DOWNLOAD', err);
            //                 console.log('error ', err);
            //                 setLoading && setLoading(false);
            //               });
            //           });
            //         }}
            //       >
            //         <Download />
            //       </TouchableOpacity>
            //     </View>
            //   )
            // }
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <ScrollView bounces={false}>
            {renderDoctorDetails()}
            {renderData()}
            {false && renderRecordDetails()}
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
  return <Spinner />;
};
