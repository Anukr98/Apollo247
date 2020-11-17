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
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  getPrescriptionDate,
  initialSortByDays,
  editDeleteData,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { deletePatientPrismMedicalRecords } from '@aph/mobile-patients/src/helpers/clientCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useApolloClient } from 'react-apollo-hooks';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances_response as MedicalInsuranceType } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
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

export interface InsuranceScreenProps
  extends NavigationScreenProps<{
    medicalInsuranceData: MedicalInsuranceType[];
    onPressBack: () => void;
  }> {}

export const InsuranceScreen: React.FC<InsuranceScreenProps> = (props) => {
  const medicalInsuranceData = props.navigation.getParam('medicalInsuranceData') || [];
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [localMedicalInsuranceData, setLocalInsuranceBillsData] = useState<Array<{
    key: string;
    data: MedicalInsuranceType[];
  }> | null>(null);

  useEffect(() => {
    if (medicalInsuranceData) {
      let finalData: { key: string; data: MedicalInsuranceType[] }[] = [];
      finalData = initialSortByDays('insurance', medicalInsuranceData, finalData);
      setLocalInsuranceBillsData(finalData);
    }
  }, [medicalInsuranceData]);

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

  const gotoPHRHomeScreen = () => {
    props.navigation.state.params?.onPressBack();
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
        title={'INSURANCE'}
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
          {'Insurance'}
        </Text>
      </View>
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const onHealthCardItemPress = (selectedItem: MedicalInsuranceType) => {
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      medicalInsurance: true,
    });
  };

  const onPressDeletePrismMedicalRecords = (selectedItem: any) => {
    setShowSpinner(true);
    deletePatientPrismMedicalRecords(
      client,
      selectedItem?.id,
      currentPatient?.id || '',
      MedicalRecordType.MEDICALINSURANCE
    )
      .then((status) => {
        if (status) {
          setShowSpinner(false);
          props.navigation.goBack();
        }
      })
      .catch((error) => {
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const onPressEditPrismMedicalRecords = (selectedItem: any) => {
    props.navigation.navigate(AppRoutes.AddRecord, {
      navigatedFrom: 'MedicalInsurance',
      recordType: MedicalRecordType.MEDICALINSURANCE,
      selectedRecordID: selectedItem?.id,
      selectedRecord: selectedItem,
    });
  };

  const renderMedicalInsuranceItems = (item: MedicalInsuranceType, index: number) => {
    const getSourceName = (source: string) => {
      return source === 'self' || source === '247self'
        ? string.common.patient_uploaded_text
        : source;
    };
    const prescriptionName = item?.insuranceCompany || '';
    const dateText = getPrescriptionDate(item?.startDateTime);
    const soureName = getSourceName(item?.source || '-');
    const selfUpload = true;
    const showEditDeleteOption =
      soureName === string.common.patient_uploaded_text || soureName === '-' ? true : false;
    return (
      <HealthRecordCard
        item={item}
        index={index}
        editDeleteData={editDeleteData()}
        showUpdateDeleteOption={showEditDeleteOption}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
        onDeletePress={(selectedItem) => onPressDeletePrismMedicalRecords(selectedItem)}
        // onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
        prescriptionName={prescriptionName}
        dateText={dateText}
        selfUpload={selfUpload}
        sourceName={soureName || ''}
      />
    );
  };

  const renderMedicalInsuranceData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localMedicalInsuranceData || []}
        renderItem={({ item, index }) => renderMedicalInsuranceItems(item, index)}
        ListEmptyComponent={<PhrNoDataComponent />}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
      />
    );
  };

  const renderAddButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={`ADD DATA`}
          onPress={() => {
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'MedicalInsurance',
              recordType: MedicalRecordType.MEDICALINSURANCE,
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
        {medicalInsuranceData?.length > 0 ? renderSearchAndFilterView() : null}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderMedicalInsuranceData()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
