import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  BackHandler,
  View,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import _ from 'lodash';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  handleGraphQlError,
  postCleverTapEvent,
  postCleverTapPHR,
  postWebEngageEvent,
  removeObjectProperty,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import RNFetchBlob from 'rn-fetch-blob';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

const styles = StyleSheet.create({
  cardViewStyle: {
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
  safeAreaViewStyle: {
    ...theme.viewStyles.container,
    backgroundColor: 'white',
  },
  mainViewStyle: {
    flex: 1,
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
  },
  recordNameContainer: {
    flexDirection: 'column',
    marginTop: 20,
    width: '95%',
    left: 5,
    justifyContent: 'space-between',
  },
  doctorInputContainer: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: 'grey',
    width: '100%',
  },
  fieldTitle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: '#01475B',
  },
  otpContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    left: 5,
  },
  enterNumberText: {
    ...viewStyles.text('M', 16, '#02475B', 1, 21),
    marginTop: 20,
  },
  iconContainer: {
    right: 25,
    alignContent: 'center',
  },
  warningMessageContainer: {
    ...viewStyles.text('M', 13, '#01475B', 1, 21),
    left: 5,
  },
  warningMessage: {
    marginTop: 5,
    width: '85%',
    justifyContent: 'center',
    left: 30,
  },
  submitBtn: {
    marginTop: 25,
    width: '40%',
    left: 120,
  },
  renderItemContainer: {
    width: '90%',
    marginTop: 10,
    left: 20,
    borderRadius: 15,
    height: 60,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  renderBtnContainer: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    left: 15,
  },
  handleSelectionBtn: {
    bottom: 2,
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  handleSelectionText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    bottom: 2,
  },
});

export interface CowinProfileSelectionProps
  extends NavigationScreenProps<{
    beneficiaryIDData: any;
    cowinToken: any;
  }> {}

export const CowinProfileSelection: React.FC<CowinProfileSelectionProps> = (props) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [vaccinationStatus, setVaccinationStatus] = useState<string>('');
  const [beneficiaryIDMainData, setbeneficiaryIDMainData] = useState<any>([]);
  const [title, setTitle] = useState<string>('');
  const [regID, setRegID] = useState<string>('');
  const [spinner, setSpinner] = useState<boolean>(false);
  const beneficiaryIDData = props.navigation?.getParam('beneficiaryIDData') || [];
  const token = props.navigation?.getParam('cowinToken') || '';
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    var localData: [] = [];
    if (beneficiaryIDData.length > 0) {
      beneficiaryIDData.map((item: any) => {
        item.id = item.beneficiary_reference_id;
        localData.push(item);
      });
      setbeneficiaryIDMainData(localData);
    }
  }, [beneficiaryIDData]);

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

  const handleSelection = (item: any) => {
    setTitle(item.name);
    setRegID(item.beneficiary_reference_id);
    setSelectedItem(item.id);
    setVaccinationStatus(item.vaccination_status);
  };

  const axiosGetData = () => {
    setSpinner!(true);
    // COWIN Certificate download API
    const fetchConfig = {
      method: 'GET',
      headers: {
        accept: 'application/pdf',
        Authorization: `Bearer ${token}`,
      },
    };
    fetch(
      `https://cdn-api.co-vin.in/api/v2/registration/certificate/download?beneficiary_reference_id=${regID}`,
      fetchConfig
    )
      .then((data: any) => {
        setSpinner!(false);
        const eventAttributes: CleverTapEvents[CleverTapEventName.PHR_DOWNLOAD_VACCINATION_REPORT] = {
          Source: 'Cowin Profile Selection',
        };
        postCleverTapEvent(CleverTapEventName.PHR_DOWNLOAD_VACCINATION_REPORT, eventAttributes);
        downloadDocument(data?.url);
      })
      .catch((error) => {
        setSpinner!(false);
        Alert.alert('Oh Sorry... :(', 'Your certificate is not ready yet..!!', [
          { text: 'OK', onPress: () => onGoBack() },
        ]);
      });
  };

  const downloadDocument = (url: any) => {
    setSpinner!(true);
    const dirs = RNFetchBlob.fs.dirs;
    const fileName: string = 'COWIN_CERTIFICATE' + '.pdf';
    const downloadPath =
      Platform.OS === 'ios'
        ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + fileName
        : dirs.DownloadDir + '/' + fileName;
    RNFetchBlob.config({
      fileCache: true,
      path: downloadPath,
      addAndroidDownloads: {
        title: fileName,
        useDownloadManager: true,
        notification: true,
        path: downloadPath,
        mediaScannable: true,
        mime: 'application/pdf',
      },
    })
      .fetch('GET', url, {
        Authorization: `Bearer ${token}`,
        //some headers ..
      })
      .then((res) => {
        setSpinner!(false);
        Platform.OS === 'ios'
          ? RNFetchBlob.ios.previewDocument(res.path())
          : Alert.alert('Hello!', 'Your vaccination certificate is downloaded');
      })
      .catch((err) => {
        setSpinner!(false);
        CommonBugFender('Cowin_Certificate_Download', err);
        handleGraphQlError(err);
      })
      .finally(() => {
        setSpinner && setSpinner!(false);
      });
  };

  const renderItems = (item: any, index: any) => {
    const isSelected = selectedItem === item.id;
    return (
      <View
        key={index}
        style={[
          styles.renderItemContainer,
          { backgroundColor: isSelected ? '#00B38E' : '#F0F0F0' },
        ]}
      >
        <TouchableOpacity onPress={() => handleSelection(item)} style={styles.renderBtnContainer}>
          <Text style={[styles.handleSelectionBtn, { color: isSelected ? 'white' : '#01475B' }]}>
            {item.name}
          </Text>
          <Text style={[styles.handleSelectionText, { color: isSelected ? 'white' : '#01475B' }]}>
            {item.beneficiary_reference_id}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  const renderProfiles = () => {
    return (
      <View>
        <FlatList
          data={beneficiaryIDMainData}
          renderItem={({ item, index }) => renderItems(item, index)}
          keyExtractor={keyExtractor}
        />
      </View>
    );
  };

  const renderSelectProfileMessage = () => {
    return (
      <View style={styles.cardViewStyle}>
        <View style={[styles.otpContainer]}>
          <Text style={{ ...viewStyles.text('M', 13, '#02475B', 1, 21) }}>
            {string.common.cowinSelectProfile}
          </Text>
        </View>
      </View>
    );
  };

  const renderViewAndDownloadCertificate = () => {
    const vaccinationBool =
      vaccinationStatus === 'Partially Vaccinated' || vaccinationStatus === 'Vaccinated'
        ? false
        : true;
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          disabled={vaccinationBool}
          style={{ width: '100%' }}
          title={'View and Download Certificate'}
          onPress={() => {
            axiosGetData();
          }}
        />
      </StickyBottomComponent>
    );
  };

  const onGoBack = () => {
    props.navigation.navigate(AppRoutes.HealthRecordsHome);
  };

  const renderProfilesView = () => {
    return (
      <>
        <ScrollView style={{ flex: 1, bottom: 40 }} bounces={false}>
          {renderProfiles()}
        </ScrollView>
        {renderViewAndDownloadCertificate()}
      </>
    );
  };

  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          title={'SELECT PROFILE'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
        {renderSelectProfileMessage()}
        {renderProfilesView()}
        {spinner && <Spinner />}
      </SafeAreaView>
    </View>
  );
};
