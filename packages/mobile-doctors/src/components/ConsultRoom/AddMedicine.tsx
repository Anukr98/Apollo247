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
  Alert,
} from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  searchMedicineApi,
  MedicineProduct,
  addMedicineList,
} from '@aph/mobile-doctors/src/components/ApiCall';
import { AxiosResponse } from 'axios';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
});

export interface ProfileProps extends NavigationScreenProps {}

export const AddMedicine: React.FC<ProfileProps> = (props) => {
  const [doctorSearchText, setDoctorSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
  const onPressDoctorSearchListItem = (text: string, id: number) => {
    Keyboard.dismiss();
    console.log('text', text); //remove this line later
    setDoctorSearchText(text);
    addMedicineList({
      medicineName: text,
      medicineDosage: '3 tablets',
      medicineToBeTaken: 'AFTER_FOOD',
      medicineInstructions: 'No instructions',
      medicineTimings: 'MORNING',
      medicineConsumptionDurationInDays: '3',
      id: id,
    });
    props.navigation.pop();
  };
  const formatSuggestionsText = (text: string, searchKey: string) => {
    return (
      <Highlighter
        style={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansMedium(18),
        }}
        searchWords={[searchKey]}
        textToHighlight={text}
      />
    );
  };
  const renderSuggestionCard = () => (
    <View style={{ marginTop: 2 }}>
      {medicineList!.length > 0 ? (
        <ScrollView>
          {medicineList!.map((item, i) => {
            const drName = ` ${item!.name}`;
            return (
              <TouchableOpacity
                onPress={() => onPressDoctorSearchListItem(item.name, item.id)}
                style={{ marginHorizontal: 16, marginTop: 8 }}
                key={i}
              >
                {formatSuggestionsText(drName, doctorSearchText)}
                {i < medicineList!.length - 1 ? (
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
        </ScrollView>
      ) : null}
    </View>
  );
  const showGenericALert = (e: { response: AxiosResponse }) => {
    const error = e && e.response && e.response.data.message;
    console.log({ errorResponse: e.response, error }); //remove this line later
    Alert.alert('Error', error || 'Unknown error occurred.');
  };
  const filterDoctors = (searchText: string) => {
    if (searchText != '' && !/^[A-Za-z .]+$/.test(searchText)) {
      return;
    }

    setDoctorSearchText(searchText);
    console.log(searchText);
    if (!(searchText && searchText.length > 2)) {
      setMedicineList([]);
      return;
    }
    setIsLoading(true);
    searchMedicineApi(searchText)
      .then(({ data }) => {
        console.log('medicineList', data);
        setIsLoading(false);
        setMedicineList(data.products || []);
      })
      .catch((e) => {
        setIsLoading(false);
        showGenericALert(e);
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
                width: '90%',
                color: '#01475b',
                paddingBottom: 4,
              }}
              placeholder="Search Medicine"
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
