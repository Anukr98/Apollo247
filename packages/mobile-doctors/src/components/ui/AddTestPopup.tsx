import AddTestPopupStyles from '@aph/mobile-doctors/src/components/ui/AddTestPopup.styles';
import { AphOverlay } from '@aph/mobile-doctors/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { ChipIconView } from '@aph/mobile-doctors/src/components/ui/ChipIconView';
import { DropDown, Option } from '@aph/mobile-doctors/src/components/ui/DropDown';
import { AddPlus } from '@aph/mobile-doctors/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { SEARCH_DIAGNOSTIC } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import {
  searchDiagnostic,
  searchDiagnosticVariables,
  searchDiagnostic_searchDiagnostic,
} from '@aph/mobile-doctors/src/graphql/types/searchDiagnostic';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { ActivityIndicator, Alert, Keyboard, Text, View } from 'react-native';

const styles = AddTestPopupStyles;

export interface AddTestPopupProps {
  searchTestVal?: string;
  onClose: () => void;
  onPressDone: (searchTestVal: string, tempTestArray: searchDiagnostic_searchDiagnostic[]) => void;
  data?:
    | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
    | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription;
  onAddnew?: (
    data:
      | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
      | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
  ) => void;
}

export const AddTestPopup: React.FC<AddTestPopupProps> = (props) => {
  const [searchTestVal, setsearchTestVal] = useState<string>(props.searchTestVal || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [istestsSearchList, settestsSearchList] = useState<
    (searchDiagnostic_searchDiagnostic | null)[] | null
  >([]);

  const [isSearchTestListVisible, setisSearchTestListVisible] = useState<boolean>(false);

  const [tempTestArray, settempTestArray] = useState<searchDiagnostic_searchDiagnostic[]>([]);
  const tabsData = [{ title: 'ADD BLOOD TEST' }, { title: 'SCANS & HEALTH CHECK' }];
  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);

  const client = useApolloClient();

  const getTempTestArray = (Testitemname: searchDiagnostic_searchDiagnostic | null) => {
    if (Testitemname) {
      if (tempTestArray.length > 0) {
        console.log('length is greater than  zero');
        for (let i = 0; i < tempTestArray.length; i++) {
          console.log('for loop');
          if (tempTestArray[i] === Testitemname) {
            Alert.alert(strings.common.alert, 'Test existed in the list.');
            console.log('same test name');
          } else {
            console.log(' test name not same');
            settempTestArray([...new Set(tempTestArray.concat(Testitemname))]);
          }
        }
      } else {
        console.log('length is zero');
        settempTestArray([...new Set(tempTestArray.concat(Testitemname))]);
      }
    }
    // settempTestArray([...new Set(tempTestArray.concat(Testitemname))]);

    console.log('temparr', '.....vlaue', tempTestArray, '//////');
  };

  const GetSearchResultOfTests = () => {
    return (
      istestsSearchList &&
      istestsSearchList.length != 0 && (
        <View style={styles.searchTestDropdown}>
          <DropDown
            viewStyles={{
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
            }}
            containerStyle={{ height: 200 }}
            options={istestsSearchList.map(
              (item, i) =>
                ({
                  optionText: item!.itemname,
                  onPress: () => {
                    Keyboard.dismiss();
                    // getTempTestArray(item);
                    getTempTestArray(item!.itemname);
                    setsearchTestVal(g(item, 'itemname') || '');
                    // isSearchTestListVisible;
                    setisSearchTestListVisible(!isSearchTestListVisible);
                  },
                  icon: <AddPlus />,
                } as Option)
            )}
          />
        </View>
      )
    );
  };

  const GetSearchDiagnostics = (search_value: string) => {
    console.log(search_value);
    if (search_value.length > 2) {
      setLoading(true);
      client
        .query<searchDiagnostic, searchDiagnosticVariables>({
          query: SEARCH_DIAGNOSTIC,
          variables: { searchString: search_value },
          fetchPolicy: 'no-cache',
        })
        .then((_data) => {
          if (_data && _data.data && _data.data.searchDiagnostic) {
            const searchTestResp = _data.data.searchDiagnostic;
            console.log('SearchResults :', searchTestResp);
            // getSearchListOptions(searchTestResp);
            settestsSearchList(searchTestResp);
          }

          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
          console.log('Error occured while fetching Diagnostic results.');
        });
    } else {
      settestsSearchList([]);
      setisSearchTestListVisible(false);
    }
  };
  return (
    <AphOverlay
      headingViewStyle={{
        paddingVertical: 0,
      }}
      onClose={() => {
        props.onClose();
      }}
      isVisible={true}
      customHeader={
        <View
          style={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: 'hidden',
            backgroundColor: theme.colors.WHITE,
            paddingVertical: 18,
          }}
        >
          <TabsComponent
            titleStyle={styles.tabTitle}
            selectedTitleStyle={styles.tabTitle}
            tabViewStyle={styles.tabViewstyle}
            onChange={(title) => {
              setSelectedTab(title);
            }}
            data={tabsData}
            selectedTab={selectedTab}
          />
        </View>
      }
    >
      <View
        style={{
          flex: 1,
          borderRadius: 10,
          backgroundColor: '#f7f7f7',
        }}
      >
        <View style={{ flex: 1 }}>
          {selectedTab == 'ADD BLOOD TEST' ? (
            <View>
              <View
                style={{
                  marginVertical: 20,
                  padding: 20,
                  backgroundColor: '#ffffff',
                  zIndex: 16,
                  elevation: 16,
                  shadowColor: '#808080',
                  shadowOffset: { width: 2, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  // marginBottom: 100,
                }}
              >
                <View>
                  <TextInputComponent
                    placeholder={strings.smartPrescr.search_test}
                    inputStyle={styles.inputView}
                    multiline={true}
                    value={searchTestVal}
                    onChangeText={(value) => {
                      setsearchTestVal(value);
                      GetSearchDiagnostics(value);
                      setisSearchTestListVisible(true);
                    }}
                    autoCorrect={true}
                  />
                </View>
                {loading ? (
                  <ActivityIndicator animating={true} size="small" color="green" />
                ) : (
                  <>
                    <View style={{ top: -38, bottom: 0, marginLeft: -20 }}>
                      {isSearchTestListVisible && GetSearchResultOfTests()}
                    </View>
                    <View style={{ marginRight: 20 }}>
                      {tempTestArray &&
                        tempTestArray.map((item, index) => {
                          console.log('......tempTestArray:', tempTestArray);
                          return (
                            <ChipIconView
                              title={item}
                              onPress={(e: any) => {
                                console.log('deleted');
                                settempTestArray(tempTestArray.slice(1));
                                setsearchTestVal('');
                                console.log('delete tempTestArray:', tempTestArray);
                                setisSearchTestListVisible(false);
                              }}
                            />
                          );
                        })}
                    </View>
                  </>
                )}
              </View>
              <View style={{ backgroundColor: '#ffffff' }}>
                <View style={styles.doneButtonStyle}>
                  <Button
                    title={strings.buttons.done}
                    disabled={searchTestVal ? false : !tempTestArray.length}
                    onPress={() => {
                      props.onPressDone(searchTestVal, tempTestArray);
                      //   settestsSearchList([]);
                      //   settempTestArray([]);
                      //   setsearchTestVal('');
                    }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View>
              <View style={{ marginVertical: 20, padding: 20, backgroundColor: '#ffffff' }}>
                <View style={{ alignItems: 'center', ...theme.fonts.IBMPlexSansMedium(20) }}>
                  <Text>Coming Soon.</Text>
                </View>
              </View>
              <View style={styles.doneButtonStyle}>
                <Button title={strings.buttons.done} />
              </View>
            </View>
          )}
        </View>
      </View>
    </AphOverlay>
  );
};
