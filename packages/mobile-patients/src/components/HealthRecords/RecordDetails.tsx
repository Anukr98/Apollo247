import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  FileBig,
  MedicineRxIcon,
  PrescriptionThumbnail,
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
import { Image } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { AppRoutes } from '../NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { MedicalTest } from './AddRecord';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';

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
  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  const { showAphAlert, hideAphAlert } = useUIElements();

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
              {(data.prescriptionName && data.prescriptionName) ||
                (data.labTestName && data.labTestName)}
            </Text>
            <Text style={styles.timeStyle}>
              {`Check-up Date: ${moment(data.date && data.date).format(
                'DD MMM YYYY'
              )}\nReferring Doctor: Dr. ${
                !!data.prescribedBy
                  ? data.prescribedBy
                  : !!data.labTestRefferedBy
                  ? data.labTestRefferedBy
                  : '-'
              }`}
            </Text>
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
                  (data.notes && data.notes)}
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
              (data.labTestResults && data.labTestResults)
            ).map((item: any) => {
              const unit = MedicalTest.find((itm) => itm.key === item.unit);
              return (
                <View style={[styles.cardViewStyle, { marginTop: 4, marginBottom: 4 }]}>
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item.parameterName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.labelTextStyle}>Result</Text>
                      <Text style={styles.valuesTextStyle}>{item.result}</Text>
                    </View>
                    <View style={{ flex: 0.5 }}>
                      <Text style={styles.labelTextStyle}>Units</Text>
                      <Text style={styles.valuesTextStyle}>{unit ? unit.value : item.unit}</Text>
                    </View>
                    <View style={{ flex: 0.7 }}>
                      <Text style={styles.labelTextStyle}>Normal Range</Text>
                      <Text style={styles.valuesTextStyle}>
                        {item.range ? item.range : `${item.minimum || ''} - ${item.maximum || ''}`}
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
    const fileName = g(data, 'testResultFiles', '0', 'fileName')
      ? ': ' + g(data, 'testResultFiles', '0', 'fileName')
      : g(data, 'prescriptionFiles', '0', 'fileName')
      ? ': ' + g(data, 'prescriptionFiles', '0', 'fileName')
      : '';
    const file_name = g(data, 'testResultFiles', '0', 'fileName')
      ? g(data, 'testResultFiles', '0', 'fileName')
      : g(data, 'prescriptionFiles', '0', 'fileName')
      ? g(data, 'prescriptionFiles', '0', 'fileName')
      : '';
    return (
      <View
        style={{
          marginTop: 15,
        }}
      >
        <ScrollView>
          {file_name && file_name.toLowerCase().endsWith('.pdf') ? (
            <View style={{ marginHorizontal: 20, marginBottom: 15, marginTop: 50 }}>
              <Button
                title={'Open File' + fileName}
                onPress={() =>
                  props.navigation.navigate(AppRoutes.RenderPdf, {
                    uri: data.fileUrl,
                    title: file_name,
                  })
                }
              ></Button>
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
              style={{ marginHorizontal: 20, marginBottom: 15 }}
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
                  // flex: 1,
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
        {(!!data.observations || !!data.additionalNotes || !!data.healthCheckSummary) &&
          renderTopLineReport()}
        {(data.medicalRecordParameters && data.medicalRecordParameters.length > 0) ||
        (data.labTestResults && data.labTestResults.length > 0)
          ? renderDetailsFinding()
          : null}
        {!!data.fileUrl ? renderImage() : null}
      </View>
    );
  };

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
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <ScrollView bounces={false}>
            {renderDoctorDetails()}
            {renderData()}
            {false && renderRecordDetails()}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  return <Spinner />;
};
