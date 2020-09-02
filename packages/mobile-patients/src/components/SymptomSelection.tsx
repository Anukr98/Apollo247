import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, BackHandler, FlatList, Text, TouchableOpacity } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '../theme/colors';
import { CheckUnselectedIcon, CheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

interface SymptomSelectionProps extends NavigationScreenProps {}

const defaultSymptoms = [
  { text: 'Vomiting', description: 'Lorem ipsum dolor sit amet, consectetur' },
  { text: 'Fever', description: 'Lorem ipsum dolor sit amet, consectetur' },
  { text: 'Cold', description: 'Lorem ipsum dolor sit amet, consectetur' },
  { text: 'Cough', description: 'Lorem ipsum dolor sit amet, consectetur' },
  { text: 'Wheezing', description: 'Lorem ipsum dolor sit amet, consectetur' },
];
var selectedSymtomsArr: string[] = [];

export const SymptomSelection: React.FC<SymptomSelectionProps> = (props) => {
  const [symptoms, setSymptoms] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [refreshFlatList, setRefreshFlatList] = useState<boolean>(false);

  useEffect(() => {
    return function cleanup() {
        selectedSymtomsArr = [];
    }
}, [])

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    props.navigation.goBack();
    return false;
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          leftIcon="backArrow"
          container={styles.headerContainer}
          leftComponent={renderSearchInput()}
          onPressLeftIcon={backDataFunctionality}
        />
      </View>
    );
  };

  const renderSearchInput = () => {
    return (
      <TextInputComponent
        onChangeText={(symptoms) => setSymptoms(symptoms)}
        placeholder={string.symptomChecker.typeSymptomOrChooseFromList}
        inputStyle={styles.inputStyle}
        autoFocus={true}
      />
    );
  };

  const renderSymptomsList = () => {
    return (
      <FlatList
        style={{ marginTop: 24 }}
        data={defaultSymptoms}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item, index }) => renderSymptoms(item, index)}
        extraData={refreshFlatList}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  const renderSymptoms = (
      item: any, 
      index: number
      ) => {
    return (
      <TouchableOpacity 
        key={index} 
        style={styles.symptomsContainer}
        onPress={() => {
            symptomSelectionHandler(item);
        }}
        >
        {!symptoms && selectedSymtomsArr.includes(item.text) ? <CheckedIcon/> : !symptoms ? <CheckUnselectedIcon/> : <View/>}
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Text style={styles.itemTxt}>{item.text}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const symptomSelectionHandler = (item: any) => {
        if(symptoms){
            // single symptom selection
            props.navigation.goBack();
        } else {
            if(selectedSymtomsArr.includes(item.text)){
                selectedSymtomsArr.splice(selectedSymtomsArr.indexOf(item.text), 1);
            } else {
                selectedSymtomsArr = selectedSymtomsArr.concat(item.text)
            }
            setSelectedSymptoms(selectedSymtomsArr);
            setRefreshFlatList(!refreshFlatList);
        }
  }

  const renderBottomButton = () => {
    return (
      <Button
        title={string.symptomChecker.addSelectedSymptom}
        style={styles.bottomBtn}
        titleTextStyle={styles.bottomBtnTxt}
        onPress={() => {}}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSymptomsList()}
      {renderBottomButton()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    backgroundColor: 'white',
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    borderBottomWidth: 0,
    paddingBottom: 0,
    paddingLeft: 10,
    paddingRight: 20,
    marginTop: 2.5,
  },
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: colors.SEARCH_UNDERLINE_COLOR,
  },
  symptomsContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTxt: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: colors.LIGHT_BLUE,
    flexWrap: 'wrap',
  },
  itemDescription: {
    ...theme.fonts.IBMPlexSansRegular(10),
    color: colors.LIGHT_BLUE,
    opacity: 0.6,
  },
  bottomBtn: {
    backgroundColor: colors.OFF_WHITE,
    height: 50,
  },
  bottomBtnTxt: {
    color: colors.APP_YELLOW,
  },
});
