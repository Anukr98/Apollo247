import { MedicineProduct } from '@aph/mobile-doctors/src/components/ApiCall';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Cancel, Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import Highlighter from 'react-native-highlight-words';

import { getDoctorsForStarDoctorProgram as getDoctorsForStarDoctorProgramData } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { DoctorProfile, Doctor } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { SEARCH_DOCTOR_AND_SPECIALITY } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  SearchDoctorAndSpecialty,
  SearchDoctorAndSpecialtyVariables,
  SearchDoctorAndSpecialty_SearchDoctorAndSpecialty,
} from '@aph/mobile-doctors/src/graphql/types/SearchDoctorAndSpecialty';
import { useApolloClient } from 'react-apollo-hooks';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: theme.colors.INPUT_TEXT,
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
  },
  inputView: {
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#30c1a3',
    color: '#01475b',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },
  buttonView: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fed6a2',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },
  buttonViewfull: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fc9916',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },
  dropDownCardStyle: {
    marginTop: Platform.OS == 'android' ? -35 : -35,
    marginBottom: 26,
    paddingTop: 16,
    paddingBottom: 15,
    //position: Platform.OS == 'android' ? 'relative' : 'absolute',
    top: 0,
    zIndex: 2,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'flex-end',
    ...theme.viewStyles.whiteRoundedCornerCard,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    position: 'absolute',
  },
  commonView: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    marginBottom: 16,
  },
  commonText: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(16),
    marginLeft: 20,
    marginRight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  commonSubText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    opacity: 0.4,
    marginTop: 10,
    marginBottom: 9,
  },
});

export interface ProfileProps extends NavigationScreenProps {}

export const TransferConsult: React.FC<ProfileProps> = (props) => {
  const [selectreason, setSelectReason] = useState<string>('Select a reason');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [doctorvalue, setDoctorValue] = useState<string>('');
  const [filteredStarDoctors, setFilteredStarDoctors] = useState<SearchDoctorAndSpecialty[] | null>(
    []
  );
  const [filterSpeciality, setfilterSpeciality] = useState<SearchDoctorAndSpecialty[] | null>([]);
  const [doctorsCard, setDoctorsCard] = useState<boolean>(false);
  const isEnabled = selectreason != 'Select a reason' && value.length > 0 && doctorvalue.length > 0;
  const client = useApolloClient();
  const sysmptonsList = [
    {
      id: '1',
      firstName: 'Fever ',
      secondName: '2days ',
      thirdName: 'Night',
      fourthName: 'High',
    },
    {
      id: '1',
      firstName: 'Cold ',
      secondName: '2days ',
      thirdName: 'Night',
      fourthName: 'High',
    },
  ];

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
        headerText="TRANSFER CONSULT"
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
    setDropdownOpen(false);
    setSelectReason(text);
  };
  const onPressDoctorSearchListItemDoctor = (text: string) => {
    setDoctorsCard(false);
    setDoctorValue(text);
  };

  const renderDropdownCard = () => (
    <View style={{ marginTop: 2 }}>
      <View style={styles.dropDownCardStyle}>
        {sysmptonsList!.map((_doctor, i, array) => {
          //const doctor = _doctor!.associatedDoctor!;

          const drName = ` ${_doctor.firstName!}`;

          return (
            <TouchableOpacity
              onPress={() => onPressDoctorSearchListItem(` ${_doctor.firstName}`)}
              style={{ marginHorizontal: 16 }}
              key={i}
            >
              {formatSuggestionsText(drName, '')}
              {i < array!.length - 1 ? (
                <View
                  style={{
                    marginTop: 8,
                    marginBottom: 7,
                    height: 1,
                    opacity: 0.1,
                  }}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const formatSuggestionsText = (text: string, searchKey: string) => {
    return (
      <Highlighter
        style={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansMedium(18),
        }}
        highlightStyle={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansBold(18),
        }}
        searchWords={[searchKey]}
        textToHighlight={text}
      />
    );
  };
  const filterDoctors = (searchText: string) => {
    if (searchText != '' && !/^[A-Za-z .]+$/.test(searchText)) {
      return;
    }

    setDoctorValue(searchText);
    console.log(searchText);
    if (searchText == '') {
      setFilteredStarDoctors([]);
      setfilterSpeciality([]);
      setDoctorsCard(doctorsCard);
      return;
    }
    // do api call
    client
      .query<SearchDoctorAndSpecialty, SearchDoctorAndSpecialtyVariables>({
        query: SEARCH_DOCTOR_AND_SPECIALITY,
        variables: { searchText: searchText },
      })

      .then((_data) => {
        console.log('flitered array', _data.data.SearchDoctorAndSpecialty!.doctors);
        console.log('flitered array1', _data.data.SearchDoctorAndSpecialty!);

        // const doctorProfile = _data.map((i: DoctorProfile) => i.profile);
        setFilteredStarDoctors(_data.data.SearchDoctorAndSpecialty!.doctors);
        setfilterSpeciality(_data.data.SearchDoctorAndSpecialty!.specialties);
        setDoctorsCard(!doctorsCard);
      })
      .catch((e) => {
        console.log('Error occured while searching for Doctors', e);
        //Alert.alert('Error', 'Error occured while searching for Doctors');
      });
  };
  const renderSuggestionCardDoctor = () => (
    <View style={{ marginTop: 2 }}>
      <View style={styles.dropDownCardStyle}>
        <>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(12),
              color: '#02475b',
              opacity: 0.3,
              marginLeft: 16,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Doctor
          </Text>
          {filteredStarDoctors!.map((_doctor, i, array) => {
            console.log('_doctor', _doctor);
            const drName = ` ${_doctor.firstName + _doctor.lastName}`;
            return (
              <TouchableOpacity
                onPress={() =>
                  onPressDoctorSearchListItemDoctor(` ${_doctor.firstName + _doctor.lastName}`)
                }
                style={{ marginHorizontal: 16 }}
                key={i}
              >
                {formatSuggestionsText(drName, '')}
                {i < array!.length - 1 ? (
                  <View
                    style={{
                      marginTop: 8,
                      marginBottom: 7,
                      height: 1,
                      opacity: 0.1,
                    }}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(12),
              color: '#02475b',
              opacity: 0.3,
              marginLeft: 16,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Speciality
          </Text>
          {filterSpeciality!.map((_doctor, i, array) => {
            console.log('_doctor', _doctor);
            const drName = ` ${_doctor.name}`;
            return (
              <TouchableOpacity
                onPress={() => onPressDoctorSearchListItemDoctor(` ${_doctor.name}`)}
                style={{ marginHorizontal: 16 }}
                key={i}
              >
                {formatSuggestionsText(drName, '')}
                {i < array!.length - 1 ? (
                  <View
                    style={{
                      marginTop: 8,
                      marginBottom: 7,
                      height: 1,
                      opacity: 0.1,
                    }}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.commonView}>{showHeaderView()}</View>
      <ScrollView bounces={false} style={styles.container}>
        <View style={styles.commonView}>
          <Text style={styles.commonText}>Why do you want to transfer this consult?</Text>
          <View style={{ marginRight: 20, marginLeft: 20, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setDropdownOpen(!isDropdownOpen)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {selectreason == 'Select a reason' ? (
                  <Text style={styles.commonSubText}>{selectreason}</Text>
                ) : (
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(16),
                      color: '#02475b',
                      marginTop: 10,
                      marginBottom: 9,
                    }}
                  >
                    {selectreason}
                  </Text>
                )}
                <View style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                  {!isDropdownOpen ? <Down /> : <Up />}
                </View>
              </View>
            </TouchableOpacity>
            <View style={[styles.inputStyle]} />
          </View>
        </View>

        {isDropdownOpen ? <View style={{ top: 0 }}>{renderDropdownCard()}</View> : null}

        <View style={[styles.commonView, { zIndex: -1 }]}>
          <Text style={styles.commonText}>Whom do you want to transfer this consult to?</Text>
          <View style={{ marginRight: 20, marginLeft: 20, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setDropdownOpen(isDropdownOpen)}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                  <Up />
                </View>
                <TextInput
                  multiline={true}
                  placeholder="Search for Doctor/Speciality"
                  placeholderTextColor="rgba(2, 71, 91, 0.6)"
                  value={doctorvalue}
                  onChangeText={(doctorvalue) => setDoctorValue(doctorvalue)}
                  onChange={(text) => filterDoctors(text.nativeEvent.text.replace(/\\/g, ''))}
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(16),
                    marginLeft: 12,
                    color: '#01475b',
                    width: '90%',
                    ...Platform.select({
                      ios: {
                        marginBottom: 2,
                      },
                      android: {
                        marginBottom: -2,
                      },
                    }),
                  }}
                ></TextInput>
              </View>
            </TouchableOpacity>
            <View style={[styles.inputStyle]} />
          </View>
        </View>
        {!doctorsCard ? null : <View style={{ marginTop: 0 }}>{renderSuggestionCardDoctor()}</View>}
        <View style={{ zIndex: -1 }}>
          <View style={[styles.commonView, { marginBottom: 32 }]}>
            <Text style={styles.commonText}>Add a Note (optional)</Text>

            <TextInputComponent
              placeholder="Enter here…"
              inputStyle={styles.inputView}
              multiline={true}
              value={value}
              onChangeText={(value) => setValue(value)}
              autoCorrect={true}
            />
          </View>
          <View style={{ marginBottom: 30 }}>
            <Button
              title="TRANSFER CONSULT"
              titleTextStyle={styles.titleTextStyle}
              style={
                value == '' && doctorvalue == '' && selectreason != 'Select a reason'
                  ? styles.buttonView
                  : styles.buttonViewfull
              }
              //onPress={() => props.navigation.push(AppRoutes.NeedHelpDonePage)}
              disabled={!isEnabled}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
