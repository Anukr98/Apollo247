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
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  searchTestDropdown: {
    margin: 0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        zIndex: 1,
      },
      android: {
        elevation: 12,
        zIndex: 2,
      },
    }),
  },
  inputView: {
    borderRadius: 0,
    borderBottomColor: '#30c1a3',
    borderBottomWidth: 1,
    color: '#01475b',
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 10,
  },
  tabTitle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansSemiBold(13),
    textAlign: 'center',
  },
  tabViewstyle: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  doneButtonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '50%',
    marginHorizontal: '25%',
  },
});

export interface AddTestPopupProps {
  searchTestVal?: string;
  onClose: () => void;
  onPressDone: (searchTestVal: string, tempTestArray: string[]) => void;
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

  const [tempTestArray, settempTestArray] = useState<string[]>([]);
  const tabsData = [{ title: 'ADD BLOOD TEST' }, { title: 'SCANS & HEALTH CHECK' }];
  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);

  const client = useApolloClient();

  const getTempTestArray = (Testitemname: any) => {
    settempTestArray([...new Set(tempTestArray.concat(Testitemname))]);
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
            options={istestsSearchList!.map(
              (item: any, i) =>
                ({
                  optionText: item!.itemname,
                  onPress: () => {
                    Keyboard.dismiss();
                    console.log('selval:', item!.itemname, i);
                    getTempTestArray(item);
                    setsearchTestVal(item!.itemname);
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
    if (search_value.length >= 1) {
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
    }
  };
  return (
    <AphOverlay
      headingViewStyle={{
        paddingVertical: 0,
      }}
      onClose={() => {
        // setIsTest(false);
        // setsearchTestVal('');
        // settestsSearchList([]);
        // settempTestArray([]);
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
                <View style={{ top: -38, bottom: 0, marginLeft: -20 }}>
                  {isSearchTestListVisible && GetSearchResultOfTests()}
                </View>
                <View style={{ marginRight: 20 }}>
                  {tempTestArray &&
                    tempTestArray!.map((item: any, index: any) => {
                      console.log('......tempTestArray:', tempTestArray);
                      return (
                        <ChipIconView
                          title={item.itemname}
                          onPress={(e: any) => {
                            console.log('deleted');
                            settempTestArray(tempTestArray.slice(1));
                            setsearchTestVal('');
                            console.log('delete tempTestArray:', tempTestArray);
                          }}
                        />
                      );
                    })}
                </View>
              </View>
              <View style={{ backgroundColor: '#ffffff' }}>
                <View style={styles.doneButtonStyle}>
                  <Button
                    title={strings.buttons.done}
                    disabled={!searchTestVal || !tempTestArray}
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
