import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  Cancel,
  PlaceHolderDoctor,
  Selected,
  UnSelected,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  commonView: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  buttonView: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fed6a2',
    // width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    //marginTop: 32,
    marginLeft: 20,
    marginRight: 20,
  },
  buttonViewfull: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fc9916',
    // width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: 20,
    marginRight: 20,
    //marginTop: 32,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },
});

export interface ProfileProps extends NavigationScreenProps {}

export const ShareConsult: React.FC<ProfileProps> = (props) => {
  const [doctorSearchText, setDoctorSearchText] = useState<string>('');
  const _data = [
    { id: 1, name: 'Dr. Sanjeev Shah', speciality: 'GENERAL PHYSICIAN' },
    { id: 2, name: 'Dr. Sheetal Sharma', speciality: 'Paediatrician' },
    { id: 3, name: 'Dr. Alok Mehta', speciality: 'Cardiology' },
    { id: 4, name: 'Dr. Rahul Sharma', speciality: 'GENERAL PHYSICIAN' },
    { id: 5, name: 'Dr. Smita Rao', speciality: 'GENERAL PHYSICIAN' },
    { id: 6, name: 'Dr. Ajay Khanna', speciality: 'Cardiology' },
    { id: 7, name: 'Dr. Ranjith Kumar', speciality: 'GENERAL PHYSICIAN' },
    { id: 8, name: 'Dr. Sai Rao', speciality: 'GENERAL PHYSICIAN' },
    { id: 9, name: 'Dr. Muqeet ', speciality: 'Cardiology' },
    { id: 10, name: 'Dr. Kumar ', speciality: 'GENERAL PHYSICIAN' },
  ];
  const [data, setData] = useState(_data);
  // const [pickData, setPickData] = useState<{ [id: string]: boolean }>({});
  const [selectedId, setSelectedId] = useState<number>(0);
  const isEnabled = selectedId != 0;

  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          backgroundColor: '#ffffff',
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={strings.case_sheet.share_case_sheet}
        rightIcons={[
          {
            icon: <Cancel />,
          },
        ]}
      ></Header>
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
  const renderDoctorsData = () => {
    const [heightList, setHeightList] = useState<number>(height - 250);
    return (
      <ScrollView bounces={false} style={{ height: heightList }}>
        {data!.map((_doctor, i, array) => {
          return (
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 20,
                justifyContent: 'space-between',
                marginRight: 20,
                marginTop: 20,
              }}
            >
              <View style={{ height: 48, width: 48 }}>
                <PlaceHolderDoctor />
              </View>
              <View style={{ flex: 2, marginLeft: 12 }}>
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(16),
                    marginBottom: 4,
                  }}
                >
                  {_doctor.name}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(10),
                    opacity: 0.6,
                  }}
                >
                  {_doctor.speciality}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedId(_doctor.id)}>
                <View>{!(_doctor.id == selectedId) ? <UnSelected /> : <Selected />}</View>
              </TouchableOpacity>
              {/* <TouchableOpacity
                  onPress={() => setPickData({ ...pickData!, [_doctor.id]: !pickData[_doctor.id] })}
                >
                  <View>{!pickData[_doctor.id] ? <UnSelected /> : <Selected />}</View>
                </TouchableOpacity> */}
            </View>
          );
        })}
      </ScrollView>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          backgroundColor: '#ffffff',
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowRadius: 10,
          shadowOpacity: 0.2,
          elevation: 5,
        }}
      >
        {showHeaderView()}
        <View style={styles.commonView}>
          <View
            style={{
              borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
              borderBottomWidth: 2,
              flexDirection: 'row',
              alignItems: 'center',
              width: '90%',
              paddingBottom: 0,
              margin: 20,
            }}
          >
            <TextInput
              style={{
                ...theme.fonts.IBMPlexSansMedium(18),
                width: '90%',
                color: '#01475b',
                paddingBottom: 4,
              }}
              placeholder={strings.case_sheet.search}
              placeholderTextColor="rgba(1, 71, 91, 0.3)"
              value={doctorSearchText}
              onChangeText={(text) => searchFilterFunction(text)}
              //onChange={(text) => filterDoctors(text.nativeEvent.text.replace(/\\/g, ''))}
              //onChangeText={(doctorSearchText) => setDoctorSearchText(doctorSearchText)}
            />
          </View>
        </View>
      </View>

      <View style={{ backgroundColor: '#f7f7f7' }}>
        {renderDoctorsData()}
        <View style={{ backgroundColor: '#ffffff', marginBottom: 14 }}>
          <View
            style={{
              justifyContent: 'flex-end',
              zIndex: 1,
              marginLeft: 20,
              marginRight: 20,
            }}
          >
            <TextInput
              placeholder={strings.case_sheet.write_message}
              placeholderTextColor="rgba(2, 71, 91, 0.6)"
              editable={selectedId != 0}
              style={{ marginTop: 16, marginBottom: 16, ...theme.fonts.IBMPlexSansMedium(13) }}
            />
            <Button
              title={strings.case_sheet.send}
              titleTextStyle={styles.titleTextStyle}
              style={selectedId != 0 ? styles.buttonViewfull : styles.buttonView}
              //onPress={() => props.navigation.push(AppRoutes.NeedHelpDonePage)}
              disabled={!isEnabled}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
