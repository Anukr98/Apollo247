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
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import moment from 'moment';
import RNFetchBlob from 'react-native-fetch-blob';

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
});

export interface RecordDetailsProps extends NavigationScreenProps {}

export const RecordDetails: React.FC<RecordDetailsProps> = (props) => {
  const [showtopLine, setshowtopLine] = useState<boolean>(true);
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  console.log(data, 'data');

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
            <Text style={styles.doctorNameStyle}>{data.testName}</Text>
            <Text style={styles.timeStyle}>
              {`Check-up Date: ${moment(data.testDate).format('DD MMM YYYY')}\nSource: ${
                !!data.sourceName ? data.sourceName : '-'
              }\nReferring Doctor: Dr. ${!!data.referringDoctor ? data.referringDoctor : '-'}`}
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
              <Text style={styles.descriptionStyle}>{data.observations}</Text>
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
            {data.medicalRecordParameters.map((item: any) => {
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
                      <Text style={styles.valuesTextStyle}>{item.unit}</Text>
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
    const urls = data.documentURLs.split(',');
    console.log(urls, 'urls');
    return (
      <View
        style={{
          marginTop: 15,
        }}
      >
        {urls.map((item: string) => (
          <View style={{ marginHorizontal: 20, marginBottom: 15 }}>
            <Image
              source={{ uri: item }}
              style={{
                // flex: 1,
                width: '100%',
                height: 425,
              }}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>
    );
  };

  const renderData = () => {
    return (
      <View>
        {!!data.observations && renderTopLineReport()}
        {data.medicalRecordParameters && data.medicalRecordParameters.length
          ? renderDetailsFinding()
          : null}
        {!!data.documentURLs && renderImage()}
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
            rightComponent={
              <View style={{ flexDirection: 'row' }}>
                {/* <TouchableOpacity activeOpacity={1} style={{ marginRight: 20 }} onPress={() => {}}>
                  <ShareGreen />
                </TouchableOpacity> */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    console.log('pdf url', data.documentURLs);

                    let dirs = RNFetchBlob.fs.dirs;
                    console.log('dirs', dirs);
                    if (Platform.OS == 'ios') {
                    }

                    console.log(
                      'pdf downloadDest',
                      data.documentURLs && data.documentURLs.split('/').pop()
                    );

                    setLoading(true);
                    RNFetchBlob.config({
                      fileCache: true,
                      addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: false,
                        mime: 'application/pdf',
                        //path:  RNFetchBlob.fs.dirs.DownloadDir + rowData.transferInfo.pdfUrl &&
                        //rowData.transferInfo.pdfUrl.split('/').pop(),
                        path: Platform.OS === 'ios' ? dirs.MainBundleDir : dirs.DownloadDir,
                        description: 'File downloaded by download manager.',
                      },
                    })
                      .fetch('GET', data.documentURLs, {
                        //some headers ..
                      })
                      .then((res) => {
                        setLoading(false);
                        // the temp file path
                        console.log('The file saved to res ', res);
                        console.log('The file saved to ', res.path());

                        // RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
                        // RNFetchBlob.ios.openDocument(res.path());
                        Alert.alert('Download Complete');
                        Platform.OS === 'ios'
                          ? RNFetchBlob.ios.previewDocument(res.path())
                          : RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
                      })
                      .catch((err) => {
                        console.log('error ', err);
                        setLoading(false);
                        // ...
                      });
                  }}
                >
                  <Download />
                </TouchableOpacity>
              </View>
            }
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <ScrollView bounces={false}>
            {renderDoctorDetails()}
            {renderData()}
            {false && renderRecordDetails()}
          </ScrollView>
          {loading && <Spinner />}
        </SafeAreaView>
      </View>
    );
  return <Spinner />;
};
