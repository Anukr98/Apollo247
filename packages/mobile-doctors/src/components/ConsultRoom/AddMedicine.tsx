import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Cancel } from '@aph/mobile-doctors/src/components/ui/Icons';
import { GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram } from '@aph/mobile-doctors/src/graphql/types/getDoctorsForStarDoctorProgram';
import { getDoctorsForStarDoctorProgram as getDoctorsForStarDoctorProgramData } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { DoctorProfile, Doctor } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
});

export interface ProfileProps extends NavigationScreenProps {}

export const AddMedicine: React.FC<ProfileProps> = (props) => {
  const [doctorSearchText, setDoctorSearchText] = useState<string>('');
  const [filteredStarDoctors, setFilteredStarDoctors] = useState<Doctor[] | null>([]);
  const client = useApolloClient();
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
        headerText="ADD MEDICINE"
        rightIcons={[
          {
            icon: <Cancel />,
            //onPress: () => props.navigation.push(AppRoutes.NeedHelpAppointment),
          },
        ]}
      ></Header>
    );
  };
  const onPressDoctorSearchListItem = (text: string) => {
    Keyboard.dismiss();

    setDoctorSearchText(text);
    setFilteredStarDoctors([]);
  };
  const formatSuggestionsText = (text: string, searchKey: string) => {
    return (
      <Highlighter
        style={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansMedium(18),
        }}
        // highlightStyle={{
        //   color: theme.colors.darkBlueColor(),
        //   ...theme.fonts.IBMPlexSansBold(18),
        // }}
        searchWords={[searchKey]}
        textToHighlight={text}
      />
    );
  };
  const renderSuggestionCard = () => (
    <View style={{ marginTop: 2 }}>
      {filteredStarDoctors!.length > 0 ? (
        <View>
          {filteredStarDoctors!.map((item, i) => {
            const drName = ` ${item!.firstName}`;
            return (
              <TouchableOpacity
                onPress={() => onPressDoctorSearchListItem(`Dr. ${item!.firstName}`)}
                style={{ marginHorizontal: 16, marginTop: 8 }}
                key={i}
              >
                {formatSuggestionsText(drName, doctorSearchText)}
                {i < filteredStarDoctors!.length - 1 ? (
                  <View
                    style={{
                      marginTop: 10,
                      marginBottom: 7,
                      height: 1,
                      opacity: 0.1,
                      borderStyle: 'solid',
                      borderWidth: 0.5,
                      borderColor: theme.colors.darkBlueColor(),
                    }}
                  ></View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
  const filterDoctors = (searchText: string) => {
    if (searchText != '' && !/^[A-Za-z .]+$/.test(searchText)) {
      return;
    }

    setDoctorSearchText(searchText);
    console.log(searchText);
    if (searchText == '') {
      setFilteredStarDoctors([]);
      return;
    }
    // do api call
    // client
    //   .query<GetDoctorsForStarDoctorProgram, GetDoctorsForStarDoctorProgramVariables>({
    //     query: GET_DOCTORS_FOR_STAR_DOCTOR_PROGRAM,
    //     variables: { searchString: searchText.replace('Dr. ', '') },
    //   })
    getDoctorsForStarDoctorProgramData.data.getDoctorsForStarDoctorProgram!(
      searchText.replace('Dr. ', '')
    )
      .then((_data) => {
        console.log('flitered array', _data);
        // const doctorProfile =
        //   (_data.data.getDoctorsForStarDoctorProgram &&
        //     _data.data.getDoctorsForStarDoctorProgram.map((i) => i!.profile)) ||
        //   [];
        const doctorProfile = _data.map((i: DoctorProfile) => i.profile);
        setFilteredStarDoctors(doctorProfile);
      })
      .catch((e) => {
        console.log('Error occured while searching for Doctors', e);
        //Alert.alert('Error', 'Error occured while searching for Doctors');
      });
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
        <View
          style={{
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
              autoFocus
              style={{
                ...theme.fonts.IBMPlexSansMedium(18),
                width: '80%',
                color: '#01475b',
                paddingBottom: 4,
              }}
              placeholder="Search Condition"
              placeholderTextColor="rgba(1, 71, 91, 0.3)"
              value={doctorSearchText}
              onChange={(text) => filterDoctors(text.nativeEvent.text.replace(/\\/g, ''))}
            />
          </View>
        </View>
      </View>
      <View style={{ marginTop: 10 }}>{renderSuggestionCard()}</View>
    </SafeAreaView>
  );
};
