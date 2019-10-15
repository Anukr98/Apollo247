import { HealthMedicineCard } from '@aph/mobile-patients/src/components/HealthRecords/HealthMedicineCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AddFileIcon, NoData } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Button } from '../ui/Button';

const styles = StyleSheet.create({
  filterViewStyle: {
    height: 60,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export interface MedicalRecordsProps extends NavigationScreenProps {
  //onTabCount: (count: number) => void;
  MedicalRecordData: any;
  renderDeleteMedicalOrder: (id: string) => void;
}

export const MedicalRecords: React.FC<MedicalRecordsProps> = (props) => {
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    //props.onTabCount(props.MedicalRecordData.length);
  }, [currentPatient, client]);

  const renderFilter = () => {
    return (
      <View style={styles.filterViewStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.navigation.navigate(AppRoutes.AddRecord)}
        >
          <AddFileIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCards = () => {
    return (
      <View>
        {props.MedicalRecordData && props.MedicalRecordData.length == 0 ? (
          <View style={{ justifyContent: 'center', flexDirection: 'column' }}>
            <View
              style={{
                marginTop: 38,
                height: 60,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 25,
              }}
            >
              <NoData />
            </View>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(12),
                color: '#02475b',
                marginBottom: 25,
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              You don’t have any records with us right now. {'\n'}Add a record to keep everything
              handy in one place!
            </Text>
            <View style={{ marginLeft: 60, marginRight: 60, marginBottom: 20 }}>
              <Button
                title="ADD RECORD"
                onPress={() => props.navigation.navigate(AppRoutes.AddRecord)}
              />
            </View>
          </View>
        ) : (
          <View>
            {props.MedicalRecordData &&
              props.MedicalRecordData.map((item: any) => {
                if (item)
                  return (
                    <HealthMedicineCard
                      data={item}
                      onClickCard={() => {
                        props.navigation.navigate(AppRoutes.RecordDetails, {
                          data: item,
                        });
                      }}
                      onPressDelete={() => {
                        Alert.alert(
                          'Delete Record',
                          '',
                          [
                            {
                              text: 'Cancel',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                            { text: 'OK', onPress: () => props.renderDeleteMedicalOrder(item.id) },
                          ],
                          { cancelable: false }
                        );
                      }}
                    />
                  );
              })}
          </View>
        )}
      </View>
    );
  };
  return (
    <View>
      {props.MedicalRecordData && props.MedicalRecordData.length > 0 && renderFilter()}
      {renderCards()}
    </View>
  );
};
