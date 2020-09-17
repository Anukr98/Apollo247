import { AddTestPopupStyles } from '@aph/mobile-doctors/src/components/ui/AddTestPopup.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { ChipIconView } from '@aph/mobile-doctors/src/components/ui/ChipIconView';
import { DropDown, Option } from '@aph/mobile-doctors/src/components/ui/DropDown';
import { AddPlus, Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SEARCH_DIAGNOSTICS } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import {
  searchDiagnostics,
  searchDiagnosticsVariables,
  searchDiagnostics_searchDiagnostics_diagnostics,
} from '@aph/mobile-doctors/src/graphql/types/searchDiagnostics';
import { string } from '@aph/mobile-doctors/src/strings/string';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const styles = AddTestPopupStyles;

export interface AddTestPopupProps {
  searchTestVal?: string;
  instructionVal?: string;
  onClose: () => void;
  onPressDone: (
    searchTestVal: string,
    tempTestArray: searchDiagnostics_searchDiagnostics_diagnostics[],
    instuction?: string
  ) => void;
  data?:
    | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
    | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription;
  onAddnew?: (
    data:
      | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
      | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
  ) => void;
  hasInstructions?: boolean;
}

export const AddTestPopup: React.FC<AddTestPopupProps> = (props) => {
  const { hasInstructions, instructionVal } = props;
  const [searchTestVal, setsearchTestVal] = useState<string>(props.searchTestVal || '');
  const [instuction, setInstruction] = useState<string>(instructionVal || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [istestsSearchList, settestsSearchList] = useState<
    (searchDiagnostics_searchDiagnostics_diagnostics | null)[] | null
  >([]);

  const [isSearchTestListVisible, setisSearchTestListVisible] = useState<boolean>(false);

  const [tempTestArray, settempTestArray] = useState<
    searchDiagnostics_searchDiagnostics_diagnostics[]
  >([]);

  const client = useApolloClient();
  const handleBack = async () => {
    props.onClose();
    return false;
  };

  useEffect(() => {
    if (props.searchTestVal) {
      if (!hasInstructions) {
        GetSearchDiagnostics(props.searchTestVal.replace(/\s+/g, ' '));
      } else {
        getTempTestArray({
          __typename: 'Diagnostics',
          id: '',
          itemId: -1,
          itemName: props.searchTestVal,
          gender: '',
          rate: -1,
          itemRemarks: `Add “${props.searchTestVal}”`,
          city: '',
          state: '',
          itemType: null,
          fromAgeInDays: -1,
          toAgeInDays: -1,
          testPreparationData: '',
          collectionType: null,
        } as searchDiagnostics_searchDiagnostics_diagnostics);
      }
    }
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const getTempTestArray = (
    Testitemname: searchDiagnostics_searchDiagnostics_diagnostics | null
  ) => {
    if (Testitemname) {
      if (tempTestArray.length > 0 && !hasInstructions) {
        for (let i = 0; i < tempTestArray.length; i++) {
          if (tempTestArray[i].itemName === Testitemname.itemName) {
            Alert.alert(strings.common.alert, 'Test existed in the list.');
          } else {
            settempTestArray([...tempTestArray, Testitemname].filter((i) => i.itemName !== ''));
          }
        }
      } else {
        settempTestArray([Testitemname].filter((i) => i.itemName !== ''));
      }
    }
    // settempTestArray([...new Set(tempTestArray.concat(Testitemname))]);
  };

  const GetSearchResultOfTests = () => {
    return istestsSearchList && istestsSearchList.length != 0 ? (
      <View style={styles.searchTestDropdown}>
        <DropDown
          viewStyles={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
          }}
          containerStyle={{ height: 300, margin: 0 }}
          options={istestsSearchList.map(
            (item, i) =>
              ({
                optionText: item!.itemId === -1 ? item!.itemRemarks : item!.itemName,
                onPress: () => {
                  Keyboard.dismiss();
                  // getTempTestArray(item);
                  getTempTestArray(item);
                  setsearchTestVal(hasInstructions ? item!.itemName : '');
                  // isSearchTestListVisible;
                  setisSearchTestListVisible(!isSearchTestListVisible);
                },
                icon: <AddPlus />,
              } as Option)
          )}
        />
      </View>
    ) : null;
  };

  const GetSearchDiagnostics = (search_value: string) => {
    setsearchTestVal(search_value);
    if (search_value.length > 2) {
      setLoading(true);
      setisSearchTestListVisible(true);
      client
        .query<searchDiagnostics, searchDiagnosticsVariables>({
          query: SEARCH_DIAGNOSTICS,
          variables: { searchText: search_value, patientId: '', city: '' },
          fetchPolicy: 'no-cache',
        })
        .then((_data) => {
          if (_data && _data.data && _data.data.searchDiagnostics.diagnostics) {
            const dataArray: (searchDiagnostics_searchDiagnostics_diagnostics | null)[] = [];
            const searchTestResp = _data.data.searchDiagnostics.diagnostics.filter(
              (i) => i !== null
            );
            if (
              searchTestResp.findIndex(
                (i) => i && (i.itemName || '').toLowerCase() === search_value.trim().toLowerCase()
              ) === -1
            ) {
              dataArray.push({
                __typename: 'Diagnostics',
                id: '',
                itemId: -1,
                itemName: search_value.trim(),
                gender: '',
                rate: -1,
                itemRemarks: `Add “${search_value.trim()}”`,
                city: '',
                state: '',
                itemType: null,
                fromAgeInDays: -1,
                toAgeInDays: -1,
                testPreparationData: '',
                collectionType: null,
              } as searchDiagnostics_searchDiagnostics_diagnostics);
            }

            dataArray.push(...searchTestResp);
            settestsSearchList(dataArray);
          }

          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
          settestsSearchList([
            {
              __typename: 'Diagnostics',
              id: '',
              itemId: -1,
              itemName: search_value.trim(),
              gender: '',
              rate: -1,
              itemRemarks: `Add “${search_value.trim()}”`,
              city: '',
              state: '',
              itemType: null,
              fromAgeInDays: -1,
              toAgeInDays: -1,
              testPreparationData: '',
              collectionType: null,
            } as searchDiagnostics_searchDiagnostics_diagnostics,
          ]);
        });
    } else {
      settestsSearchList([]);
      setisSearchTestListVisible(false);
    }
  };

  const renderInstruction = () => {
    return (
      <View>
        <Text style={styles.instructionText}>{string.smartPrescr.additional_instru}</Text>
        <TextInput
          placeholder={strings.smartPrescr.type_here}
          style={styles.additionalInstrInputstyle}
          placeholderTextColor={theme.colors.placeholderTextColor}
          textAlignVertical={'top'}
          multiline={true}
          value={instuction}
          onChange={(text) => setInstruction(text.nativeEvent.text)}
          selectionColor={theme.colors.INPUT_CURSOR_COLOR}
        />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerStyles}>
        <Text style={styles.medNameStyles}>{'ADD TEST'}</Text>
      </View>
    );
  };

  const renderButton = () => {
    return tempTestArray.length > 0 && !isSearchTestListVisible ? (
      <View style={styles.buttonContainer}>
        <View style={styles.doneButtonStyle}>
          <Button
            title={strings.buttons.done}
            disabled={!tempTestArray.length}
            onPress={() => {
              props.onPressDone(searchTestVal, tempTestArray, instuction);
            }}
          />
        </View>
      </View>
    ) : null;
  };

  const renderSearchInput = () => {
    return (
      <TextInput
        placeholder={strings.smartPrescr.search_test}
        style={styles.inputView}
        placeholderTextColor={theme.colors.placeholderTextColor}
        textAlignVertical={'top'}
        autoFocus={true}
        multiline={true}
        value={searchTestVal}
        onChangeText={(value) => {
          GetSearchDiagnostics(value.replace(/\s+/g, ' '));
        }}
        selectionColor={theme.colors.INPUT_CURSOR_COLOR}
      />
    );
  };

  const renderTestList = () => {
    return (
      <View
        style={{
          marginTop: 16,
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {tempTestArray &&
          tempTestArray.map((item, index) => {
            return (
              <ChipIconView
                containerStyle={{ marginRight: 10 }}
                title={item.itemName || ''}
                onPress={() => {
                  settempTestArray(tempTestArray.filter((i) => i.itemName !== item.itemName));
                  setsearchTestVal('');
                  setisSearchTestListVisible(false);
                }}
              />
            );
          })}
      </View>
    );
  };

  return (
    <View style={styles.mainView}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <View
          style={{
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              alignItems: 'flex-end',
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                props.onClose();
              }}
              style={styles.touchableCloseIcon}
            >
              <Remove style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.contenteView}>
            {renderHeader()}
            <ScrollView bounces={false}>
              <View style={styles.scrollViewStyles}>
                {renderSearchInput()}
                {loading ? (
                  <ActivityIndicator
                    animating={true}
                    size="large"
                    color="green"
                    style={styles.listSpinner}
                  />
                ) : (
                  <View>
                    {isSearchTestListVisible && GetSearchResultOfTests()}
                    {!isSearchTestListVisible
                      ? hasInstructions && tempTestArray.length > 0
                        ? renderInstruction()
                        : renderTestList()
                      : null}
                  </View>
                )}
              </View>
            </ScrollView>
            {renderButton()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
