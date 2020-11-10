import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, SectionList } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  getPrescriptionDate,
  initialSortByDays,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills_response as MedicalBillsType } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
import moment from 'moment';
import _ from 'lodash';

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
    ...theme.viewStyles.text('SB', 18, '#02475B', 1, 23.4),
    marginBottom: 3,
  },
});

export interface BillScreenProps
  extends NavigationScreenProps<{
    medicalBillsData: MedicalBillsType[];
    onPressBack: () => void;
  }> {}

export const BillScreen: React.FC<BillScreenProps> = (props) => {
  const medicalBillsData = props.navigation?.getParam('medicalBillsData') || [];
  const { currentPatient } = useAllCurrentPatients();
  const [localMedicalBillsData, setLocalMedicalBillsData] = useState<Array<{
    key: string;
    data: MedicalBillsType[];
  }> | null>(null);

  useEffect(() => {
    if (medicalBillsData) {
      let finalData: { key: string; data: MedicalBillsType[] }[] = [];
      finalData = initialSortByDays('bills', medicalBillsData, finalData);
      setLocalMedicalBillsData(finalData);
    }
  }, [medicalBillsData]);

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
        title={'BILLS'}
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
        <Text style={{ ...theme.viewStyles.text('SB', 23, '#02475B', 1, 30) }}>{'Bills'}</Text>
      </View>
    );
  };

  const onHealthCardItemPress = (selectedItem: MedicalBillsType) => {
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      medicalBill: true,
    });
  };

  const renderMedicalBillItems = (item: MedicalBillsType, index: number) => {
    // For Next Phase
    // const editDeleteData = ConsultRxEditDeleteArray.map((i) => {
    //   return { key: i.key, value: i.title };
    // });
    const getSourceName = (source: string) => {
      if (source === 'self' || source === '247self') {
        return 'Clinical Document';
      }
      return source;
    };
    const prescriptionName = item?.hospitalName || '';
    const dateText = getPrescriptionDate(item?.billDateTime);
    const soureName = getSourceName(item?.source || '-');
    const selfUpload = true;
    return (
      <HealthRecordCard
        item={item}
        index={index}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
        prescriptionName={prescriptionName}
        dateText={dateText}
        selfUpload={selfUpload}
        sourceName={soureName || ''}
      />
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const renderMedicalBillsData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localMedicalBillsData || []}
        renderItem={({ item, index }) => renderMedicalBillItems(item, index)}
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
              navigatedFrom: 'MedicalBill',
              recordType: MedicalRecordType.MEDICALBILL,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {medicalBillsData?.length > 0 ? renderSearchAndFilterView() : null}
          {renderMedicalBillsData()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
