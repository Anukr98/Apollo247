import { AddIconLabel } from '@aph/mobile-doctors/src/components/ui/AddIconLabel';
import { AddMedicinePopUp } from '@aph/mobile-doctors/src/components/ui/AddMedicinePopUp';
import { AddTestPopup } from '@aph/mobile-doctors/src/components/ui/AddTestPopup';
import { AphOverlay } from '@aph/mobile-doctors/src/components/ui/AphOverlay';
import { BottomButtons } from '@aph/mobile-doctors/src/components/ui/BottomButtons';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  ArrowRight,
  BackArrow,
  Edit,
  RoundIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { SmartPrescriptionCard } from '@aph/mobile-doctors/src/components/ui/SmartPrescriptionCard';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import {
  ADD_DOCTOR_FAVOURITE_ADVICE,
  ADD_DOCTOR_FAVOURITE_TEST,
  GET_DOCTOR_FAVOURITE_ADVICE_LIST,
  GET_DOCTOR_FAVOURITE_MEDICINE_LIST,
  GET_DOCTOR_FAVOURITE_TEST_LIST,
  SAVE_DOCTORS_FAVOURITE_MEDICINE,
  UPDATE_DOCTOR_FAVOURITE_ADVICE,
  UPDATE_DOCTOR_FAVOURITE_MEDICINE,
  UPDATE_DOCTOR_FAVOURITE_TEST,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  AddDoctorFavouriteAdvice,
  AddDoctorFavouriteAdviceVariables,
} from '@aph/mobile-doctors/src/graphql/types/AddDoctorFavouriteAdvice';
import {
  AddDoctorFavouriteTest,
  AddDoctorFavouriteTestVariables,
} from '@aph/mobile-doctors/src/graphql/types/AddDoctorFavouriteTest';
import {
  GetDoctorFavouriteAdviceList,
  GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteAdviceList';
import {
  GetDoctorFavouriteMedicineList,
  GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import {
  GetDoctorFavouriteTestList,
  GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteTestList';
import {
  MEDICINE_FORM_TYPES,
  SaveDoctorsFavouriteMedicineInput,
  UpdateDoctorsFavouriteMedicineInput,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  SaveDoctorsFavouriteMedicine,
  SaveDoctorsFavouriteMedicineVariables,
} from '@aph/mobile-doctors/src/graphql/types/SaveDoctorsFavouriteMedicine';
import {
  UpdateDoctorFavouriteAdvice,
  UpdateDoctorFavouriteAdviceVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdateDoctorFavouriteAdvice';
import {
  UpdateDoctorFavouriteMedicine,
  UpdateDoctorFavouriteMedicineVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdateDoctorFavouriteMedicine';
import {
  UpdateDoctorFavouriteTest,
  UpdateDoctorFavouriteTestVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdateDoctorFavouriteTest';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { medUsageType } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import SmartPrescriptionStyles from '@aph/mobile-doctors/src/components/Account/SmartPrescription.styles';

const styles = SmartPrescriptionStyles;

export interface ProfileProps extends NavigationScreenProps {
  overlayDisplay: (renderDisplay: React.ReactNode) => void;
}

export const SmartPrescription: React.FC<ProfileProps> = (props) => {
  const [isAddMedicine, setIsAddMedicine] = useState<boolean>(false);
  const [isAdvice, setIsAdvice] = useState<boolean>(false);
  const [isTest, setIsTest] = useState<boolean>(false);

  const [dataMed, setDataMed] = useState<
    GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
  >();

  const [favAdvice, setfavAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [adviceList, setadviceList] = useState<
    (GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList | null)[] | null
  >([]);
  const [testsList, settestsList] = useState<
    (GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList | null)[] | null
  >([]);

  const [medicineList, setmedicineList] = useState<
    (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[] | null
  >([]);

  const [favAdviceId, setfavAdviceId] = useState<string>('');
  const [favAdviceInstruction, setfavAdviceInstruction] = useState<string>('');
  const [searchTestVal, setsearchTestVal] = useState<string>('');
  const [isSearchTestListVisible, setisSearchTestListVisible] = useState<boolean>(false);

  const client = useApolloClient();

  const [EditTestId, setEditTestId] = useState<string>('');
  const [showNeedHelp, setshowNeedHelp] = useState(false);

  useEffect(() => {
    GetFavouriteMedicineList();
    GetFavouriteTestList();
    GetFavouriteAdviceList();
  }, []);

  const GetFavouriteMedicineList = () => {
    client
      .query<GetDoctorFavouriteMedicineList>({
        query: GET_DOCTOR_FAVOURITE_MEDICINE_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (
          _data &&
          _data.data &&
          _data.data.getDoctorFavouriteMedicineList &&
          _data.data.getDoctorFavouriteMedicineList.medicineList
        ) {
          const tempmedicineList = _data.data.getDoctorFavouriteMedicineList!.medicineList;

          console.log('MedicineList', tempmedicineList);

          setmedicineList(tempmedicineList);
        }
        setLoading(false);
      })
      .catch((e) => {
        CommonBugFender('Get_Doctor_Favourite_Medicine_List_SmartPrescription', e);
        setLoading(false);
        console.log('error Medicine List', e);
      });
  };

  const GetFavouriteTestList = () => {
    setLoading(true);
    client
      .query<GetDoctorFavouriteTestList>({
        query: GET_DOCTOR_FAVOURITE_TEST_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (
          _data &&
          _data.data &&
          _data.data.getDoctorFavouriteTestList &&
          _data.data.getDoctorFavouriteTestList.testList
        ) {
          const TestList = _data.data.getDoctorFavouriteTestList!.testList;
          console.log('TestList :', TestList);
          settestsList(TestList);
          console.log(testsList);
        }

        setLoading(false);
      })
      .catch((e) => {
        CommonBugFender('Get_Doctor_Favourite_Test_List_SmartPrescription', e);
        setLoading(false);
        console.log('Error occured while fetching Tests List', e);
      });
  };

  const GetFavouriteAdviceList = () => {
    setLoading(true);
    client
      .query<GetDoctorFavouriteAdviceList>({
        query: GET_DOCTOR_FAVOURITE_ADVICE_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (
          _data &&
          _data.data &&
          _data.data.getDoctorFavouriteAdviceList &&
          _data.data.getDoctorFavouriteAdviceList.adviceList
        ) {
          const GetAdviceList = _data.data.getDoctorFavouriteAdviceList!.adviceList;
          console.log('Advice List : ', _data.data);
          console.log('GetAdviceList  :', GetAdviceList);
          setadviceList && setadviceList(GetAdviceList);
        }

        setLoading(false);
      })
      .catch((e) => {
        CommonBugFender('Get_Doctor_Favourite_Advice_List_SmartPrescription', e);
        setLoading(false);
        console.log('Error occured while fetching Advice List', e);
      });
  };

  const updateFavouriteTest = (
    updateTestId: string,
    updateTestName: string,
    tempTestArray: string[]
  ) => {
    console.log('updateTestId-----', updateTestId, 'updateTestName-----', updateTestName);
    // tempTestArray.push(tempTestArray);
    const AddingTest = tempTestArray!.map((ele: string) => ele).join(',');
    console.log('AddingTest---', AddingTest);

    setLoading(true);
    client
      .mutate<UpdateDoctorFavouriteTest, UpdateDoctorFavouriteTestVariables>({
        mutation: UPDATE_DOCTOR_FAVOURITE_TEST,
        variables: {
          id: updateTestId,
          itemname: AddingTest
            ? AddingTest.replace(/\s+/g, ' ')
            : updateTestName.replace(/\s+/g, ' '),
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setLoading(false);
        console.log('Updated Tests:', _data);
        GetFavouriteTestList();
        setEditTestId('');
      })
      .catch((error) => {
        CommonBugFender('Update_Doctor_Favourite_Test_SmartPrescription', e);
        console.log(error);
        setLoading(false);
        setEditTestId('');
        Alert.alert(strings.common.error, strings.smartPrescr.update_test_error);
      });
  };

  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowRadius: 10,
          shadowOpacity: 0.2,
          elevation: 5,
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={strings.smartPrescr.smart_prescr_header}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => setshowNeedHelp(true),
          },
        ]}
      />
    );
  };

  const FavoriteMedicines = () => {
    return (
      <View>
        <Text style={styles.subheading}>{strings.smartPrescr.fav_med}</Text>
        <View style={styles.containerListStyle}>
          {medicineList!.map((item, i) => (
            <View key={i}>
              <SmartPrescriptionCard
                title={item!.medicineName}
                onPressTitle={() => {
                  item && setDataMed(item);
                  setIsAddMedicine(true);
                }}
                onPressrightIcon={() => {
                  item && setDataMed(item);
                  // setIsAddMedicine(false);
                  setIsAddMedicine(true);
                }}
                rightIcon={<ArrowRight />}
              ></SmartPrescriptionCard>
            </View>
          ))}

          <AddIconLabel
            label={strings.smartPrescr.add_medicine}
            style={{ marginLeft: 0, marginTop: 9 }}
            onPress={() => {
              setDataMed(undefined);
              setIsAddMedicine(true);
            }}
          />
        </View>
      </View>
    );
  };

  const FavoriteTests = () => {
    return (
      <View>
        <Text style={styles.subheading}>{strings.smartPrescr.fav_test}</Text>
        <View style={styles.containerListStyle}>
          {testsList!.map((item, i) => (
            <View key={i}>
              <SmartPrescriptionCard
                title={item!.itemname}
                onPressTitle={() => {
                  setIsTest(true);
                  setsearchTestVal(item!.itemname || '');
                  setEditTestId(item!.id || '');
                }}
                onPressrightIcon={() => {
                  setIsTest(true);
                  setsearchTestVal(item!.itemname || '');
                  setEditTestId(item!.id || '');
                }}
                rightIcon={<ArrowRight />}
              />
            </View>
          ))}

          <AddIconLabel
            label={strings.smartPrescr.add_test}
            style={{ marginLeft: 0, marginTop: 9 }}
            onPress={() => setIsTest(true)}
          />
        </View>
      </View>
    );
  };

  const FavoriteAdvice = () => {
    return (
      <View>
        <Text style={styles.subheading}>{strings.smartPrescr.fav_advice}</Text>

        <View style={styles.containerListStyle}>
          {adviceList!.map((item, i) => (
            <View key={i}>
              <SmartPrescriptionCard
                title={item!.instruction}
                onPressTitle={() => {
                  setfavAdviceId(item!.id);
                  setfavAdviceInstruction(item!.instruction);

                  setIsAdvice(true);
                  setfavAdvice(item!.instruction);
                  console.log(item && item.id, item!.instruction);
                }}
                onPressrightIcon={() => {
                  setfavAdviceId(item!.id);
                  setfavAdviceInstruction(item!.instruction);

                  setIsAdvice(true);
                  setfavAdvice(item!.instruction);
                  console.log(item && item.id, item!.instruction);
                }}
                rightIcon={<Edit />}
              />
            </View>
          ))}

          <AddIconLabel
            label={strings.smartPrescr.add_advice}
            style={{ marginLeft: 0, marginTop: 9 }}
            onPress={() => {
              setfavAdviceId('');
              setfavAdviceInstruction('');
              setIsAdvice(true);
              console.log('aaa----', favAdviceId, favAdviceInstruction);
            }}
          />
        </View>
      </View>
    );
  };
  const addAdvice = (favAdvice: string) => {
    console.log('favAdvice:', favAdvice);
    if (favAdvice.length != 0) {
      setLoading(true);
      client
        .mutate<AddDoctorFavouriteAdvice, AddDoctorFavouriteAdviceVariables>({
          mutation: ADD_DOCTOR_FAVOURITE_ADVICE,
          variables: { instruction: favAdvice.replace(/\s+/g, ' ') },
          fetchPolicy: 'no-cache',
        })
        .then((_data) => {
          const result = _data.data!.addDoctorFavouriteAdvice;
          setLoading(false);
          console.log('Add advice result : ' + result);
          setfavAdvice('');
          setIsAdvice(false);
          GetFavouriteAdviceList();
        })
        .catch((e) => {
          setLoading(false);
          CommonBugFender('Add_Doctor_Favourite_Advice_SmartPrescription', e);
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          console.log('Error occured while adding advice', errorMessage, error);
          Alert.alert(strings.common.error, errorMessage);
        });
    } else {
      Alert.alert(strings.common.failed, strings.smartPrescr.pls_add_advice);
    }
  };

  const UpdateAdvice = (id: string, updatedAdvice: string) => {
    console.log('update advice :', updatedAdvice);
    if (updatedAdvice.length != 0) {
      setLoading(true);
      client
        .mutate<UpdateDoctorFavouriteAdvice, UpdateDoctorFavouriteAdviceVariables>({
          mutation: UPDATE_DOCTOR_FAVOURITE_ADVICE,
          variables: { id: id, instruction: updatedAdvice.replace(/\s+/g, ' ') },
          fetchPolicy: 'no-cache',
        })
        .then((_data) => {
          const res = _data.data!.updateDoctorFavouriteAdvice;
          setLoading(false);
          console.log('Updated advice result : ', res);
          setfavAdvice('');
          //   setFavUpdateAdvice('');
          setIsAdvice(false);
          GetFavouriteAdviceList();
        })
        .catch((e) => {
          setLoading(false);
          CommonBugFender('Update_Doctor_Favourite_Advice_SmartPrescription', e);
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          console.log('Error occured while adding advice', errorMessage, error);
          Alert.alert(strings.common.error, errorMessage);
        });
    } else {
      Alert.alert(strings.common.failed, strings.smartPrescr.pls_add_advice);
    }
  };

  // ----------------Save Doctor Favorite Medicine-----------

  const Save_Doctor_FavouriteMedicine = (data: SaveDoctorsFavouriteMedicineInput) => {
    console.log(' in save method..', data);

    setLoading(true);
    client
      .mutate<SaveDoctorsFavouriteMedicine, SaveDoctorsFavouriteMedicineVariables>({
        mutation: SAVE_DOCTORS_FAVOURITE_MEDICINE,
        variables: {
          saveDoctorsFavouriteMedicineInput: data,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setLoading(false);
        const resp = _data.data;
        console.log('Updated...:', resp);

        GetFavouriteMedicineList();

        setIsAddMedicine(false);
      })
      .catch((e: string) => {
        setLoading(false);
        CommonBugFender('Save_Doctor_Favourite_Medicine_SmartPrescription', e);
        console.log(e);
        Alert.alert(strings.common.error, strings.smartPrescr.add_med_error);

        setIsAddMedicine(false);
      });
  };

  // --------------Update Doctor Favourite Medicine -------------

  const update_Doctor_FavouriteMedicine = (data: UpdateDoctorsFavouriteMedicineInput) => {
    setLoading(true);
    client
      .mutate<UpdateDoctorFavouriteMedicine, UpdateDoctorFavouriteMedicineVariables>({
        mutation: UPDATE_DOCTOR_FAVOURITE_MEDICINE,
        variables: {
          updateDoctorsFavouriteMedicineInput: data,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setLoading(false);
        const resp = _data.data;
        console.log('Updated...:', resp);
        GetFavouriteMedicineList();
      })
      .catch((e: string) => {
        setLoading(false);
        CommonBugFender('Update_Doctor_Favourite_Medicine_SmartPrescription', e);
        console.log(e);
        Alert.alert(strings.common.error, strings.smartPrescr.update_med_error);
      });
  };
  // -----------------------Buttons view------------
  // const renderButtonsView = () => {
  //   return (
  //     <BottomButtons
  //       whiteButtontitle={strings.buttons.cancel}
  //       cancelFun={() => {
  //         console.log('cancel');
  //       }}
  //       yellowButtontitle={strings.buttons.save}
  //       successFun={() => {
  //         console.log('successFun');
  //       }}
  //       viewStyles={{
  //         backgroundColor: '#f7f7f7',
  //         marginTop: 10,
  //       }}
  //     />
  //   );
  // };

  const AddFavouriteTest = (searchTestVal: string, tempTestArray: string[]) => {
    const AddingTest = tempTestArray!.map((ele: string) => ele).join(',');
    console.log('AddingTest---', AddingTest);

    if (searchTestVal != '') {
      setLoading(true);
      client
        .mutate<AddDoctorFavouriteTest, AddDoctorFavouriteTestVariables>({
          mutation: ADD_DOCTOR_FAVOURITE_TEST,
          variables: {
            itemname: AddingTest
              ? AddingTest.replace(/\s+/g, ' ')
              : searchTestVal.replace(/\s+/g, ' '),
          },
        })
        .then((_data) => {
          setLoading(false),
            console.log('Added Favourite test', _data.data!.addDoctorFavouriteTest);
          GetFavouriteTestList();
          setisSearchTestListVisible(!isSearchTestListVisible);
          setIsTest(!isTest);
        })
        .catch((e) => {
          setLoading(false);
          CommonBugFender('Add_Doctor_Favourite_Test_SmartPrescription', e);
          console.log('error', JSON.stringify(e.message));
          const errorMsg = JSON.stringify(e.message);
          if (errorMsg === 'Network error: Network request failed') {
            Alert.alert(strings.common.error, strings.smartPrescr.add_test_error);
          } else {
            Alert.alert(strings.common.alert, strings.smartPrescr.existed_test_error);
          }
        });
    } else {
      Alert.alert(strings.common.alert, strings.smartPrescr.pls_add_test);
    }
  };
  const showTestPopup = () => {
    return (
      <AddTestPopup
        searchTestVal={searchTestVal}
        onClose={() => {
          setIsTest(false);
          setsearchTestVal('');
        }}
        onPressDone={(searchTestVal, tempTestArray) => {
          if (EditTestId != '') {
            updateFavouriteTest(EditTestId, searchTestVal, tempTestArray);
          } else {
            AddFavouriteTest(searchTestVal, tempTestArray);
          }
          setsearchTestVal('');
          setIsTest(!isTest);
        }}
      />
    );
  };

  const showAdvice = () => {
    console.log('favAdvice:', favAdviceId, favAdviceInstruction);
    return (
      <AphOverlay
        headingViewStyle={{
          ...theme.viewStyles.cardContainer,
          zIndex: 1,
        }}
        heading={strings.smartPrescr.fav_advice.toUpperCase()}
        onClose={() => {
          setfavAdvice('');
          setIsAdvice(false);
        }}
        isVisible={true}
      >
        <View style={styles.AphInnerView}>
          <TextInputComponent
            placeholder={strings.smartPrescr.fav_advice_placeholder}
            inputStyle={styles.inputArea}
            multiline={true}
            value={favAdvice}
            onChangeText={(value) => setfavAdvice(value)}
            autoCorrect={true}
          />
        </View>
        <BottomButtons
          whiteButtontitle={strings.buttons.cancel}
          disabledOrange={!favAdvice}
          cancelFun={() => {
            setfavAdvice('');
            console.log('cancel');
            setIsAdvice(false);
          }}
          yellowButtontitle={strings.smartPrescr.add_advice}
          successFun={() => {
            if (favAdviceId != '') {
              console.log('UpdateAdvice');

              UpdateAdvice(favAdviceId, favAdvice);
            } else {
              console.log(' && :', favAdviceId, favAdvice);
              addAdvice(favAdvice);
            }
            console.log('successFun:', favAdvice);
          }}
        />
      </AphOverlay>
    );
  };
  return (
    <View style={theme.viewStyles.container}>
      {isTest && showTestPopup()}
      {isAdvice && showAdvice()}
      {isAddMedicine && (
        <AddMedicinePopUp
          data={dataMed}
          onClose={() => {
            setIsAddMedicine(false);
          }}
          onAddnew={(data) => {
            console.log('AddMedicine:...', data, '.......', data.id);
            if (data.id != '') {
              console.log('update_Doctor_FavouriteMedicine');

              update_Doctor_FavouriteMedicine({
                ...(data as UpdateDoctorsFavouriteMedicineInput),
                medicineConsumptionDurationInDays: Number(data.medicineConsumptionDurationInDays),
                medicineFormTypes:
                  medUsageType(data.medicineUnit!) === 'Apply'
                    ? MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT
                    : MEDICINE_FORM_TYPES.OTHERS,
              });
            } else {
              console.log('Save_Doctor_FavouriteMedicine');
              Save_Doctor_FavouriteMedicine({
                externalId: data.externalId,
                medicineConsumptionDuration: data.medicineConsumptionDuration,
                medicineConsumptionDurationInDays: Number(data.medicineConsumptionDurationInDays),
                medicineConsumptionDurationUnit: data.medicineConsumptionDurationUnit,
                medicineDosage: data.medicineDosage!,
                medicineFormTypes:
                  medUsageType(data.medicineUnit!) === 'Apply'
                    ? MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT
                    : MEDICINE_FORM_TYPES.OTHERS,
                medicineFrequency: data.medicineFrequency,
                medicineInstructions: data.medicineInstructions,
                medicineName: data.medicineName!,
                medicineTimings: data.medicineTimings!,
                medicineToBeTaken: data.medicineToBeTaken,
                medicineUnit: data.medicineUnit!,
              });
            }
          }}
        />
      )}
      <SafeAreaView style={theme.viewStyles.container}>
        <View>{showHeaderView()}</View>
        <ScrollView bounces={false} contentContainerStyle={{ padding: 20 }}>
          {FavoriteMedicines()}
          {FavoriteTests()}
          {FavoriteAdvice()}
          {/* {renderButtonsView()} */}
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner />}
      {showNeedHelp && <NeedHelpCard onPress={() => setshowNeedHelp(false)} />}
    </View>
  );
};
