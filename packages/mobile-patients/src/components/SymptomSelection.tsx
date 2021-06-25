import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  BackHandler,
  FlatList,
  Text,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { CheckUnselectedIcon, CheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import _ from 'lodash';
import {
  fetchAutocompleteSymptoms,
  AutoCompleteSymptomsParams,
  DefaultSymptoms,
  AutoCompleteSymptoms,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { Message } from '@aph/mobile-patients/src/components/SymptomTracker';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  g,
  postCleverTapEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

interface SymptomSelectionProps extends NavigationScreenProps {
  chatId: string;
  goBackCallback: () => void;
  defaultSymptoms: DefaultSymptoms[];
  storedMessages: Message[];
}
interface Symptoms {
  name: string;
  id: string;
}

var selectedSymtomsArr: string[] = [];
var selectedSymtomsIdsArr: string[] = [];

export const SymptomSelection: React.FC<SymptomSelectionProps> = (props) => {
  const chatId = props.navigation.getParam('chatId');
  const defaultSymptoms = props.navigation.getParam('defaultSymptoms');
  const storedMessages = props.navigation.getParam('storedMessages');

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSymptomsIds, setSelectedSymptomsIds] = useState<string[]>([]);
  const [refreshFlatList, setRefreshFlatList] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<any>({});
  const [symptoms, setSymptoms] = useState<AutoCompleteSymptoms[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();

  const patientInfoAttributes = {
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient ID': g(currentPatient, 'id'),
    'Patient Name': g(currentPatient, 'firstName'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Date of Birth': g(currentPatient, 'dateOfBirth'),
    Email: g(currentPatient, 'emailAddress'),
    Relation: g(currentPatient, 'relation'),
  };

  useEffect(() => {
    return function cleanup() {
      selectedSymtomsArr = [];
      selectedSymtomsIdsArr = [];
    };
  }, []);

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
        onChangeText={(symptoms) => {
          const search = _.debounce(fetchSymptoms, 500);
          setSearchQuery((prevSearch: any) => {
            if (prevSearch.cancel) {
              prevSearch.cancel();
            }
            return search;
          });
          search(symptoms);
        }}
        placeholder={
          selectedSymptoms?.length > 0
            ? string.symptomChecker.removeSelectionPlaceholder
            : string.symptomChecker.typeSymptomOrChooseFromList
        }
        inputStyle={styles.inputStyle}
        autoFocus={true}
        editable={selectedSymptoms?.length === 0}
      />
    );
  };

  const fetchSymptoms = async (searchString: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.SYMPTOM_TRACKER_SEARCH_SYMPTOMS] = {
      ...patientInfoAttributes,
      'Search String': searchString,
    };
    postWebEngageEvent(WebEngageEventName.SYMPTOM_TRACKER_SEARCH_SYMPTOMS, eventAttributes);
    setLoading(true);
    const queryParams: AutoCompleteSymptomsParams = {
      text: searchString,
      filter: 'symptoms',
    };

    try {
      const res = await fetchAutocompleteSymptoms(chatId, queryParams);
      if (res?.data?.results) {
        setSymptoms(res.data.results);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      CommonBugFender('AutoCompleteSymptomsApi', error);
    }
  };

  const renderSymptomsList = () => {
    return (
      <FlatList
        style={{ marginTop: 24 }}
        data={symptoms.length > 0 ? symptoms : defaultSymptoms}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item, index }) => renderSymptoms(item, index)}
        extraData={refreshFlatList}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
    );
  };

  const renderSymptoms = (item: any, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.symptomsContainer}
        onPress={() => {
          const eventAttributes:
            | WebEngageEvents[WebEngageEventName.SYMPTOM_TRACKER_SUGGESTED_SYMPTOMS_CLICKED]
            | CleverTapEvents[CleverTapEventName.SYMPTOM_TRACKER_SUGGESTED_SYMPTOMS_CLICKED] = {
            ...patientInfoAttributes,
            'Symptom Clicked': item.name,
          };
          postWebEngageEvent(
            WebEngageEventName.SYMPTOM_TRACKER_SUGGESTED_SYMPTOMS_CLICKED,
            eventAttributes
          );
          postCleverTapEvent(
            CleverTapEventName.SYMPTOM_TRACKER_SUGGESTED_SYMPTOMS_CLICKED,
            eventAttributes
          );
          symptomSelectionHandler(item);
        }}
      >
        {symptoms.length === 0 && selectedSymptoms.includes(item.name) ? (
          <CheckedIcon style={{ marginRight: 15 }} />
        ) : symptoms.length === 0 ? (
          <CheckUnselectedIcon style={{ marginRight: 15 }} />
        ) : (
          <View />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTxt}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const symptomSelectionHandler = (item: any) => {
    if (symptoms.length !== 0) {
      // single symptom selection
      const { navigation } = props;
      navigation.goBack();
      navigation.state.params!.goBackCallback(item, chatId, storedMessages);
    } else {
      Keyboard.dismiss();
      if (selectedSymtomsArr.includes(item.name)) {
        selectedSymtomsArr.splice(selectedSymtomsArr.indexOf(item.name), 1);
        selectedSymtomsIdsArr.splice(selectedSymtomsIdsArr.indexOf(item.id), 1);
      } else {
        selectedSymtomsArr = selectedSymtomsArr.concat(item.name);
        selectedSymtomsIdsArr = selectedSymtomsIdsArr.concat(item.id);
      }
      setSelectedSymptoms(selectedSymtomsArr);
      setSelectedSymptomsIds(selectedSymtomsIdsArr);
      setRefreshFlatList(!refreshFlatList);
    }
  };

  const renderBottomButton = () => {
    return (
      <Button
        title={string.symptomChecker.addSelectedSymptom}
        style={styles.bottomBtn}
        titleTextStyle={styles.bottomBtnTxt}
        onPress={() => {
          const newObj = {
            name: selectedSymptoms.join(', '),
            id: selectedSymptomsIds.toString(),
          };
          const { navigation } = props;
          const eventAttributes:
            | WebEngageEvents[WebEngageEventName.SYMPTOM_TRACKER_ADD_SELECTED_SYMPTOMS_CLICKED]
            | CleverTapEvents[CleverTapEventName.SYMPTOM_TRACKER_ADD_SELECTED_SYMPTOMS_CLICKED] = {
            ...patientInfoAttributes,
            'Selected Symptoms': selectedSymptoms.join(', '),
          };
          postWebEngageEvent(
            WebEngageEventName.SYMPTOM_TRACKER_ADD_SELECTED_SYMPTOMS_CLICKED,
            eventAttributes
          );
          postCleverTapEvent(
            CleverTapEventName.SYMPTOM_TRACKER_ADD_SELECTED_SYMPTOMS_CLICKED,
            eventAttributes
          );
          navigation.goBack();
          navigation.state.params!.goBackCallback(newObj, chatId, storedMessages);
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {loading && <Spinner />}
      {renderSymptomsList()}
      {selectedSymptoms.length > 0 && renderBottomButton()}
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
    height: 62,
    borderRadius: 0,
  },
  bottomBtnTxt: {
    color: colors.APP_YELLOW,
  },
});
