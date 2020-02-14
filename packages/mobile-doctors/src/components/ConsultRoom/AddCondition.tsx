import { addDiagonsisList, MedicineProduct } from '@aph/mobile-doctors/src/components/ApiCall';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Cancel } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { SEARCH_DIAGNOSIS } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  searchDiagnosis,
  searchDiagnosisVariables,
  searchDiagnosis_searchDiagnosis,
} from '@aph/mobile-doctors/src/graphql/types/searchDiagnosis';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
});

export interface ProfileProps extends NavigationScreenProps {}

export const AddCondition: React.FC<ProfileProps> = (props) => {
  const [doctorSearchText, setDoctorSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosisList, setDiagnosisList] = useState<any>([]);
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
        headerText={strings.consult.add_condition}
        rightIcons={[
          {
            icon: <Cancel />,
            onPress: () => props.navigation.pop(),
          },
        ]}
      ></Header>
    );
  };
  const onPressDoctorSearchListItem = (text: string) => {
    Keyboard.dismiss();
    console.log('text', text); //remove this line later
    setDoctorSearchText(text);
    addDiagonsisList({
      name: text,
      __typename: 'Diagnosis',
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
      {diagnosisList!.length > 0 ? (
        <ScrollView>
          {diagnosisList!.map((item: searchDiagnosis_searchDiagnosis, i: any) => {
            const drName = ` ${item!.name}`;
            return (
              <TouchableOpacity
                onPress={() => onPressDoctorSearchListItem(` ${item!.name}`)}
                style={{ marginHorizontal: 16, marginTop: 8 }}
                key={i}
              >
                {formatSuggestionsText(drName, doctorSearchText)}
                {i < diagnosisList!.length - 1 ? (
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

  const filterDoctors = (searchText: string) => {
    if (searchText != '' && !/^[A-Za-z .]+$/.test(searchText)) {
      return;
    }

    setDoctorSearchText(searchText);
    console.log(searchText);
    if (!(searchText && searchText.length > 2)) {
      setDiagnosisList([]);
      return;
    }
    setIsLoading(true);
    // do api call
    client
      .query<searchDiagnosis, searchDiagnosisVariables>({
        query: SEARCH_DIAGNOSIS,
        variables: { searchString: searchText },
      })

      .then((_data) => {
        console.log('flitered array', _data.data.searchDiagnosis!);

        setDiagnosisList(_data.data.searchDiagnosis!);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log('Error occured while searching for searchDiagnosis', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while searching for searchDiagnosis', errorMessage, error);
        setIsLoading(false);
        Alert.alert(strings.common.error, errorMessage);
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
              placeholder={strings.consult.search_condition}
              placeholderTextColor="rgba(1, 71, 91, 0.3)"
              value={doctorSearchText}
              onChange={(text) => filterDoctors(text.nativeEvent.text.replace(/\\/g, ''))}
            />
          </View>
        </View>
      </View>
      {isLoading ? <Loader flex1 /> : null}
      <View style={{ marginTop: 10 }}>{renderSuggestionCard()}</View>
    </SafeAreaView>
  );
};
