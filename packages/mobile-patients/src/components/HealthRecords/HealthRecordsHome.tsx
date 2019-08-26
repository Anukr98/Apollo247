import { NavigationScreenProps } from 'react-navigation';
import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, TouchableOpacity, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { UserIntro } from '@aph/mobile-patients/src/components/ui/UserIntro';
import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { NotificationIcon, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { HealthConsultView } from '@aph/mobile-patients/src/components/HealthRecords/HealthConsultView';
import { filterDataType } from '@aph/mobile-patients/src/components/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { AddFilePopup } from '@aph/mobile-patients/src/components/HealthRecords/AddFilePopup';
import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

const styles = StyleSheet.create({
  filterViewStyle: {
    height: 60,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

const filterData: filterDataType[] = [
  {
    label: 'See Only',
    options: ['Online Consults', 'Clinic Visits', 'Prescriptions'],
    selectedOptions: [],
  },
];
export interface HealthRecordsHomeProps extends NavigationScreenProps {}

export const HealthRecordsHome: React.FC<HealthRecordsHomeProps> = (props) => {
  const tabs = strings.health_records_home.tabs;

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [FilterData, setFilterData] = useState<filterDataType[]>(filterData);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);

  const renderFilter = () => {
    return (
      <View style={styles.filterViewStyle}>
        <TouchableOpacity onPress={() => setDisplayFilter(true)}>
          <Filter />
        </TouchableOpacity>
      </View>
    );
  };

  const renderConsults = () => {
    return (
      <View>
        {renderFilter()}
        <HealthConsultView
          onPressOrder={() => {
            setdisplayOrderPopup(true);
          }}
          onClickCard={() => {
            props.navigation.navigate(AppRoutes.ConsultDetails);
          }}
        />
        <HealthConsultView />
        <HealthConsultView />
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          <View
            style={{
              height: 280,
              // justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              <UserIntro
                description={strings.health_records_home.description}
                style={{
                  height: 236,
                }}
              >
                <View
                  style={{
                    // height: 83,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                  }}
                >
                  <View style={{ marginVertical: 20 }}>
                    <ApolloLogo />
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 16 }}>
                    <NotificationIcon />
                  </View>
                </View>
              </UserIntro>
            </View>
            <View>
              <TabsComponent
                style={{
                  height: 43,
                  marginTop: 236,
                  backgroundColor: theme.colors.CARD_BG,
                  ...theme.viewStyles.shadowStyle,
                }}
                textStyle={{
                  paddingTop: 12,
                }}
                data={tabs}
                onChange={(selectedTab: string) => setselectedTab(selectedTab)}
                selectedTab={selectedTab}
              />
            </View>
          </View>
          {selectedTab === tabs[0].title ? renderConsults() : null}
        </ScrollView>
      </SafeAreaView>
      {displayFilter && (
        <FilterScene
          onClickClose={(data: filterDataType[]) => {
            setDisplayFilter(false);
            setFilterData(data);
          }}
          setData={(data) => {
            setFilterData(data);
          }}
          data={FilterData}
        />
      )}
      {displayOrderPopup && (
        <AddFilePopup
          onClickClose={() => {
            setdisplayOrderPopup(false);
          }}
          getData={(data: (PickerImage | PickerImage[])[]) => {
            console.log(data);
          }}
        />
      )}
    </View>
  );
};
