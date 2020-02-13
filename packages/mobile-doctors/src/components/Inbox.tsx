import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { DoctorCard } from '@aph/mobile-doctors/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  ApploLogo,
  Notification,
  RoundIcon,
  Search,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { Platform, SafeAreaView, Text, TextInput, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

export interface PatientsProps extends NavigationScreenProps {}

export const Inbox: React.FC<PatientsProps> = (props) => {
  const _data = [
    { id: 1, name: 'Dr. Sanjeev Shah', speciality: '2 ', type: true },
    { id: 2, name: 'Dr. Sheetal Sharma', speciality: '2 ', type: false },
    { id: 3, name: 'Dr. Alok Mehta', speciality: '3 ', type: false },
    { id: 4, name: 'Dr. Rahul Sharma', speciality: '1 ', type: true },
    { id: 5, name: 'Dr. Smita Rao', speciality: '2 ', type: false },
    { id: 6, name: 'Dr. Ajay Khanna', speciality: '2 ', type: true },
    { id: 7, name: 'Dr. Ranjith Kumar', speciality: '2 ', type: false },
    { id: 8, name: 'Dr. Sai Rao', speciality: '2 ', type: true },
    { id: 9, name: 'Dr. Muqeet ', speciality: '2 ', type: true },
    { id: 10, name: 'Dr. Kumar ', speciality: '1 ', type: true },
  ];
  const [data, setData] = useState(_data);
  const [doctorSearchText, setDoctorSearchText] = useState<string>('');
  const [modelvisible, setmodelvisible] = useState(false);

  const renderNeedHelpModal = () => {
    return modelvisible ? <NeedHelpCard onPress={() => setmodelvisible(false)} /> : null;
  };

  const renderMainHeader = () => {
    return (
      <Header
        leftIcons={[
          {
            icon: <ApploLogo />,
          },
        ]}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => setmodelvisible(true),
          },
          {
            icon: <Notification />,
            onPress: () => props.navigation.push(AppRoutes.NotificationScreen),
          },
        ]}
      />
    );
  };
  const searchFilterFunction = (searchText: string) => {
    setDoctorSearchText(searchText);
    if (!searchText) {
      setData(_data);
      return;
    }
    const newData = data!.filter((item) => {
      const itemData = `${item.name.toUpperCase()}`;

      const textData = searchText.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });

    setData(newData);
  };

  const renderDoctorGreeting = () => {
    return (
      <View style={{ backgroundColor: '#ffffff' }}>
        <Text
          style={{
            ...theme.fonts.IBMPlexSansSemiBold(24),
            color: '#02475b',
            marginLeft: 20,
            marginBottom: 14,
            marginTop: 12,
          }}
        >{`here are all your chats with other doctors `}</Text>

        <View
          style={{
            flexDirection: 'row',
            ...theme.fonts.IBMPlexSansMedium(14),
            color: '#01475b',
            paddingBottom: 4,
            height: 44,
            width: '90%',
            borderColor: '#fff',
            borderWidth: 1,
            marginBottom: 20,
            borderRadius: 28,
            backgroundColor: '#fff',
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowRadius: 10,
            shadowOpacity: 0.2,
            elevation: 5,
            marginLeft: 20,
          }}
        >
          <View
            style={{
              //alignItems: 'flex-end',
              //alignSelf: 'flex-end',
              paddingLeft: 20,
              paddingTop: 10,
              // paddingBottom: 12,
            }}
          >
            <Search />
          </View>
          <TextInput
            placeholder="Search Doctor"
            placeholderTextColor="rgba(1, 71, 91, 0.3)"
            value={doctorSearchText}
            onChangeText={(text) => searchFilterFunction(text)}
            //onChange={(text) => filterDoctors(text.nativeEvent.text.replace(/\\/g, ''))}
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              marginLeft: 12,
              color: '#01475b',
              width: '90%',
              ...Platform.select({
                ios: {
                  marginBottom: 2,
                },
                android: {
                  marginBottom: -2,
                },
              }),
            }}
          ></TextInput>
        </View>
      </View>
    );
  };
  const renderTabPage = () => {
    return (
      <>
        <ScrollView bounces={false}>
          {data!.map((_doctor, i, array) => {
            return (
              <DoctorCard
                doctorname={_doctor.name}
                consults={_doctor.speciality}
                lastconsult="Last Consult: 17/07/2019 "
                todayvale="today"
                onPress={() => props.navigation.push(AppRoutes.ChatDoctor)}
              />
            );
          })}
        </ScrollView>
      </>
    );
  };

  return (
    <SafeAreaView style={[theme.viewStyles.container]}>
      {renderMainHeader()}
      <View style={{ marginBottom: 0 }}>{renderDoctorGreeting()}</View>
      {renderTabPage()}
      {renderNeedHelpModal()}
    </SafeAreaView>
  );
};
