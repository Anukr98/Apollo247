import AddTestPopupStyles from '@aph/mobile-doctors/src/components/ui/AddTestPopup.styles';
import { AphOverlay } from '@aph/mobile-doctors/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { ChipIconView } from '@aph/mobile-doctors/src/components/ui/ChipIconView';
import { DropDown, Option } from '@aph/mobile-doctors/src/components/ui/DropDown';
import { AddPlus } from '@aph/mobile-doctors/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { SEARCH_DIAGNOSTICS } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import {
  searchDiagnostics,
  searchDiagnosticsVariables,
  searchDiagnostics_searchDiagnostics_diagnostics,
} from '@aph/mobile-doctors/src/graphql/types/searchDiagnostics';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { ActivityIndicator, Alert, Keyboard, View } from 'react-native';

const styles = AddTestPopupStyles;

export interface AddTestPopupProps {
  searchTestVal?: string;
  onClose: () => void;
  onPressDone: (
    searchTestVal: string,
    tempTestArray: searchDiagnostics_searchDiagnostics_diagnostics[]
  ) => void;
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
    (searchDiagnostics_searchDiagnostics_diagnostics | null)[] | null
  >([]);

  const [isSearchTestListVisible, setisSearchTestListVisible] = useState<boolean>(false);

  const [tempTestArray, settempTestArray] = useState<
    searchDiagnostics_searchDiagnostics_diagnostics[]
  >([]);
  const tabsData = [
    { title: 'ADD TEST' },
    //  { title: 'SCANS & HEALTH CHECK' }
  ];
  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);

  const client = useApolloClient();

  useEffect(() => {
    if (props.searchTestVal) {
      GetSearchDiagnostics(props.searchTestVal.replace(/\s+/g, ' '));
    }
  }, []);

  const getTempTestArray = (
    Testitemname: searchDiagnostics_searchDiagnostics_diagnostics | null
  ) => {
    if (Testitemname) {
      if (tempTestArray.length > 0) {
        console.log('length is greater than  zero');
        for (let i = 0; i < tempTestArray.length; i++) {
          console.log('for loop');
          if (tempTestArray[i].itemName === Testitemname.itemName) {
            Alert.alert(strings.common.alert, 'Test existed in the list.');
            console.log('same test name');
          } else {
            console.log(' test name not same');
            settempTestArray([...tempTestArray, Testitemname].filter((i) => i.itemName !== ''));
          }
        }
      } else {
        console.log('length is zero');
        settempTestArray([Testitemname].filter((i) => i.itemName !== ''));
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
                  optionText: item!.itemName,
                  onPress: () => {
                    Keyboard.dismiss();
                    // getTempTestArray(item);
                    getTempTestArray(item);
                    setsearchTestVal('');
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
                itemRemarks: '',
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
            console.log(searchTestResp, dataArray, 'sdfghjk');
            settestsSearchList(dataArray);
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
          {/* {selectedTab == 'ADD TEST' ? ( */}
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
                    GetSearchDiagnostics(value.replace(/\s+/g, ' '));
                  }}
                  autoFocus={true}
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
                            title={item.itemName || ''}
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
                  disabled={!tempTestArray.length}
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
          {/* ) : (
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
          )} */}
        </View>
      </View>
    </AphOverlay>
  );
};
