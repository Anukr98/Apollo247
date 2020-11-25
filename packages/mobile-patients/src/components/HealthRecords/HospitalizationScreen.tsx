import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SectionList,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response as HospitalizationType } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  g,
  postWebEngageEvent,
  initialSortByDays,
  editDeleteData,
  handleGraphQlError,
  phrSortWithDate,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  deletePatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  searchFilterViewStyle: {
    marginHorizontal: 20,
    marginVertical: 22,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  itemTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
    paddingHorizontal: 0,
  },
  selectedTextStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
  },
  sectionHeaderTitleStyle: {
    ...theme.viewStyles.text('SB', 18, theme.colors.LIGHT_BLUE, 1, 23.4),
    marginBottom: 3,
  },
});

export interface HospitalizationScreenProps
  extends NavigationScreenProps<{
    hospitalizationData: HospitalizationType[];
    onPressBack: () => void;
  }> {}

export const HospitalizationScreen: React.FC<HospitalizationScreenProps> = (props) => {
  const hospitalizationData = props.navigation?.getParam('hospitalizationData') || [];
  const [hospitalizationMainData, setHospitalizationMainData] = useState<any>(hospitalizationData);
  const [localHospitalizationData, setLocalHospitalizationData] = useState<Array<{
    key: string;
    data: HospitalizationType[];
  }> | null>(null);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [callApi, setCallApi] = useState(false);
  const [callPhrMainApi, setCallPhrMainApi] = useState(false);

  useEffect(() => {
    let finalData: { key: string; data: HospitalizationType[] }[] = [];
    finalData = initialSortByDays('hospitalizations', hospitalizationMainData, finalData);
    setLocalHospitalizationData(finalData);
  }, [hospitalizationMainData]);

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    gotoPHRHomeScreen();
    return true;
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });

    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });

    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (callApi) {
      getLatestHospitalizationRecords();
    }
  }, [callApi]);

  const gotoPHRHomeScreen = () => {
    if (!callApi && !callPhrMainApi) {
      props.navigation.state.params?.onPressBack();
    }
    props.navigation.goBack();
  };

  const renderProfileImage = () => {
    return (
      <ProfileImageComponent
        onPressProfileImage={gotoPHRHomeScreen}
        currentPatient={currentPatient}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        title={'HOSPITALIZATION'}
        leftIcon={'backArrow'}
        rightComponent={renderProfileImage()}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={gotoPHRHomeScreen}
      />
    );
  };

  const renderSearchAndFilterView = () => {
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, theme.colors.LIGHT_BLUE, 1, 30) }}>
          {'Hospitalization'}
        </Text>
      </View>
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const onHealthCardItemPress = (selectedItem: HospitalizationType) => {
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      hospitalization: true,
    });
  };

  const getLatestHospitalizationRecords = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id)
      .then((data: any) => {
        const hospitalizationsNewData = g(
          data,
          'getPatientPrismMedicalRecords',
          'hospitalizationsNew',
          'response'
        );
        setHospitalizationMainData(phrSortWithDate(hospitalizationsNewData));
        setShowSpinner(false);
        setCallPhrMainApi(true);
      })
      .catch((error) => {
        setShowSpinner(false);
        console.log('error getPatientPrismMedicalRecordsApi', error);
        currentPatient && handleGraphQlError(error);
      });
  };

  const onPressDeletePrismMedicalRecords = (selectedItem: any) => {
    setShowSpinner(true);
    deletePatientPrismMedicalRecords(
      client,
      selectedItem?.id,
      currentPatient?.id || '',
      MedicalRecordType.HOSPITALIZATION
    )
      .then((status) => {
        if (status) {
          getLatestHospitalizationRecords();
        } else {
          setShowSpinner(false);
        }
      })
      .catch((error) => {
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const onPressEditPrismMedicalRecords = (selectedItem: any) => {
    setCallApi(false);
    props.navigation.navigate(AppRoutes.AddRecord, {
      navigatedFrom: 'Hospitalization',
      recordType: MedicalRecordType.HOSPITALIZATION,
      selectedRecordID: selectedItem?.id,
      selectedRecord: selectedItem,
      onRecordAdded: onRecordAdded,
    });
  };

  const renderHospitalizationItems = (item: HospitalizationType, index: number) => {
    const getSourceName = (source: string) => {
      return source === 'self' || source === '247self'
        ? string.common.clicnical_document_text
        : source;
    };
    const prescriptionName = 'Dr. ' + item?.doctorName;
    const dateText =
      item?.dateOfHospitalization && item?.date
        ? `From ${moment(item?.dateOfHospitalization).format('DD MMM, YYYY')} to ${moment(
            item?.date
          ).format('DD MMM, YYYY')}`
        : moment(item?.date).format('DD MMM YYYY');
    const soureName = getSourceName(item?.source || '-');
    const selfUpload = true;
    const showEditDeleteOption =
      soureName === string.common.clicnical_document_text || soureName === '-' ? true : false;
    return (
      <HealthRecordCard
        item={item}
        index={index}
        editDeleteData={editDeleteData()}
        showUpdateDeleteOption={showEditDeleteOption}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
        onDeletePress={(selectedItem) => onPressDeletePrismMedicalRecords(selectedItem)}
        onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
        prescriptionName={prescriptionName}
        dateText={dateText}
        selfUpload={selfUpload}
        sourceName={soureName || ''}
      />
    );
  };

  const renderHospitalizationData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localHospitalizationData || []}
        renderItem={({ item, index }) => renderHospitalizationItems(item, index)}
        ListEmptyComponent={<PhrNoDataComponent />}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
      />
    );
  };

  const onRecordAdded = () => {
    setCallApi(true);
  };

  const renderAddButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={`ADD DATA`}
          onPress={() => {
            setCallApi(false);
            const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
              Source: 'Hospitalization',
            };
            postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'Hospitalization',
              recordType: MedicalRecordType.HOSPITALIZATION,
              onRecordAdded: onRecordAdded,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {hospitalizationMainData?.length > 0 ? renderSearchAndFilterView() : null}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderHospitalizationData()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
