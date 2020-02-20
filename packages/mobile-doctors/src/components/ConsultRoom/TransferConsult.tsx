import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Cancel, Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import {
  INITIATE_TRANSFER_APPONITMENT,
  SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { TRANSFER_INITIATED_TYPE } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  initiateTransferAppointment,
  initiateTransferAppointmentVariables,
} from '@aph/mobile-doctors/src/graphql/types/initiateTransferAppointment';
import {
  SearchDoctorAndSpecialtyByName,
  SearchDoctorAndSpecialtyByNameVariables,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties,
} from '@aph/mobile-doctors/src/graphql/types/SearchDoctorAndSpecialtyByName';
import { getLocalData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import Pubnub from 'pubnub';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
//import { doctorDetails } from '@aph/mobile-doctors/src/hooks/authHooks';

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
    // marginTop: Platform.OS == 'android' ? -35 : -35,
    marginTop: -35,
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

export interface ProfileProps
  extends NavigationScreenProps<{
    AppointmentId: string;

    // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  }> {
  // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const TransferConsult: React.FC<ProfileProps> = (props) => {
  const client = useApolloClient();
  const [selectreason, setSelectReason] = useState<string>('Select a reason');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [doctorvalue, setDoctorValue] = useState<string>('');
  const [doctorSpeciality, setDoctorSpeciality] = useState<string>('');
  const [experience, setExperience] = useState<string | null>('');
  const [photourl, setPhotourl] = useState<string | null>('');
  const [filteredStarDoctors, setFilteredStarDoctors] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null)[] | null
  >([]);
  const [filterSpeciality, setfilterSpeciality] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties | null)[] | null
  >([]);
  const [doctorsCard, setDoctorsCard] = useState<boolean>(false);
  const [doctorid, setDoctorId] = useState<string>('');
  const [hospitalId, setHospitalId] = useState<string>('');
  const [specialityId, setSpecialityId] = useState<string>('');
  const [oldDoctorId, setOldDoctorId] = useState<string>('');
  const isEnabled = selectreason != 'Select a reason' && value.length > 0 && doctorvalue.length > 0;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const transferconsult = '^^#transferconsult';

  const config: Pubnub.PubnubConfig = {
    subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
    publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
    ssl: true,
  };
  const pubnub = new Pubnub(config);
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
  useEffect(() => {
    getLocalData()
      .then((data) => {
        console.log('data', data);
        setOldDoctorId((data.doctorDetails! || {}).id);
      })
      .catch(() => {});
    console.log('DoctirNAME', oldDoctorId);
  });

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
        headerText={strings.transfer_consult.transfer_consult}
        rightIcons={[
          {
            icon: <Cancel />,
            onPress: () => props.navigation.pop(),
          },
        ]}
      ></Header>
    );
  };
  const onPressDoctorSearchListItem = (text: string, id: string) => {
    setDropdownOpen(false);
    setSelectReason(text);
    //setDoctorId(id);
  };
  const onPressDoctorSearchListItemDoctor = (
    text: string,
    id: string,
    specilty: string,
    ex: string | null,
    photo: string | null,
    hospitalId: string,
    specilityId: string
  ) => {
    console.log('hospitalId', hospitalId);
    setDoctorsCard(false);
    setDoctorValue(text);
    setDoctorSpeciality(specilty);
    setExperience(ex);
    setPhotourl(photo);
    setDoctorId(id);
    setHospitalId(hospitalId);
    setSpecialityId(specilityId);
  };

  const onPressDoctorSearchListItemSpeciality = (text: string, id: string, imageurl: string) => {
    console.log('id', id);
    setDoctorsCard(false);
    //   setDoctorValue(text);
    setDoctorSpeciality(text);
    setSpecialityId(id);
    setPhotourl(imageurl);
  };

  const renderDropdownCard = () => (
    <View style={{ marginTop: 2 }}>
      <View style={styles.dropDownCardStyle}>
        {sysmptonsList.map((_doctor, i, array) => {
          //const doctor = _doctor!.associatedDoctor!;

          const drName = ` ${_doctor.firstName}`;

          return (
            <TouchableOpacity
              onPress={() => onPressDoctorSearchListItem(_doctor.firstName, _doctor.id)}
              style={{ marginHorizontal: 16 }}
              key={i}
            >
              {formatSuggestionsText(drName, '')}
              {i < array.length - 1 ? (
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
    if (!(searchText && searchText.length > 2)) {
      setFilteredStarDoctors([]);
      setfilterSpeciality([]);
      return;
    }
    // do api call
    client
      .query<SearchDoctorAndSpecialtyByName, SearchDoctorAndSpecialtyByNameVariables>({
        query: SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
        variables: { searchText: searchText },
      })

      .then((_data) => {
        console.log('flitered array', _data.data.SearchDoctorAndSpecialtyByName!.doctors);
        console.log('flitered array1', _data.data.SearchDoctorAndSpecialtyByName!);
        // const doctorProfile = _data.map((i: DoctorProfile) => i.profile);
        setFilteredStarDoctors(_data.data.SearchDoctorAndSpecialtyByName!.doctors);
        setfilterSpeciality(_data.data.SearchDoctorAndSpecialtyByName!.specialties);
        setDoctorsCard(!doctorsCard);
      })
      .catch((e) => {
        console.log('Error occured while searching for Doctors', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while searching for Doctors', errorMessage, error);
        Alert.alert(strings.common.error, errorMessage);
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
            {strings.transfer_consult.doctor}
          </Text>
          {filteredStarDoctors!.map(
            (
              _doctor: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null,
              i,
              array
            ) => {
              console.log('_doctor', _doctor);
              const drName = _doctor!.firstName + _doctor!.lastName;

              return (
                <TouchableOpacity
                  onPress={() =>
                    onPressDoctorSearchListItemDoctor(
                      _doctor!.firstName + _doctor!.lastName,
                      _doctor!.id,
                      g(_doctor, 'specialty', 'name') || '',
                      _doctor!.experience,
                      _doctor!.photoUrl,
                      _doctor!.doctorHospital[0].facility.id,
                      g(_doctor, 'specialty', 'id') || ''
                    )
                  }
                  style={{ marginHorizontal: 16 }}
                  key={i}
                >
                  {formatSuggestionsText(drName, '')}
                  {i < array.length - 1 ? (
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
            }
          )}
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
            {strings.account.speciality}
          </Text>
          {filterSpeciality!.map(
            (
              _doctor: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties | null,
              i,
              array
            ) => {
              console.log('_doctor', _doctor);
              const drName = ` ${_doctor!.name}`;
              const id = ` ${_doctor!.id}`;
              const imageurl = ` ${_doctor!.image}`;
              return (
                <TouchableOpacity
                  onPress={() => onPressDoctorSearchListItemSpeciality(drName, id, imageurl)}
                  style={{ marginHorizontal: 16 }}
                  key={i}
                >
                  {formatSuggestionsText(drName, '')}
                  {i < array.length - 1 ? (
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
            }
          )}
        </>
      </View>
    </View>
  );
  const rendertransferdetails = (doctorId: string) => {
    console.log('doctorDetails!.id', doctorId);
    console.log('app', props.navigation.getParam('AppointmentId'));
    console.log('oldDoctorId', oldDoctorId);
    // do api call
    setIsLoading(true);
    client
      .mutate<initiateTransferAppointment, initiateTransferAppointmentVariables>({
        mutation: INITIATE_TRANSFER_APPONITMENT,
        variables: {
          TransferAppointmentInput: {
            appointmentId: props.navigation.getParam('AppointmentId'),
            transferInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
            transferInitiatedId: oldDoctorId,
            transferredDoctorId: doctorId,
            transferredSpecialtyId: specialityId,
            transferReason: selectreason,
            transferNotes: value,
          },
        },
      })
      .then((_data) => {
        setIsLoading(false);
        console.log('data', _data);
        const transferObject = {
          appointmentId: props.navigation.getParam('AppointmentId'),
          transferDateTime: g(_data, 'data', 'initiateTransferAppointment', 'doctorNextSlot'),
          photoUrl: photourl,
          doctorId: doctorId,
          specialtyId: specialityId,
          doctorName: doctorvalue,
          experience: experience + strings.transfer_consult.yrs,
          specilty: doctorSpeciality,
          hospitalDoctorId: hospitalId,
          transferId: g(_data, 'data', 'initiateTransferAppointment', 'transferAppointment', 'id'),
        };
        pubnub.publish(
          {
            message: {
              id: oldDoctorId,
              message: transferconsult,
              transferInfo: transferObject,
            },
            channel: props.navigation.getParam('AppointmentId'), //chanel
            storeInHistory: true,
          },
          (status, response) => {}
        );
        props.navigation.push(AppRoutes.Appointments);
      })
      .catch((e) => {
        setIsLoading(false);
        console.log('Error occured while searching for Initiate transfer apppointment', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log(
          'Error occured while searching for Initiate transfera apppointment',
          errorMessage,
          error
        );
        Alert.alert(strings.common.error, errorMessage);
      });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.commonView}>{showHeaderView()}</View>
      <ScrollView bounces={false} style={styles.container}>
        <View style={styles.commonView}>
          <Text style={styles.commonText}>{strings.transfer_consult.transfer_this_consult}</Text>
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
          <Text style={styles.commonText}>{strings.transfer_consult.whom_you_want_transfer}</Text>
          <View style={{ marginRight: 20, marginLeft: 20, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setDropdownOpen(isDropdownOpen)}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                  <Up />
                </View>
                <TextInput
                  multiline={true}
                  placeholder={strings.transfer_consult.search_for_doctor}
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
            <Text style={styles.commonText}>{strings.transfer_consult.add_note}</Text>

            <TextInputComponent
              placeholder={strings.transfer_consult.enter_here}
              inputStyle={styles.inputView}
              multiline={true}
              value={value}
              onChangeText={(value) => setValue(value)}
              autoCorrect={true}
            />
          </View>
          {isLoading ? <Loader flex1 /> : null}
          <View style={{ marginBottom: 30 }}>
            <Button
              title={strings.transfer_consult.transfer_consult}
              titleTextStyle={styles.titleTextStyle}
              style={
                value == '' && doctorvalue == '' && selectreason != 'Select a reason'
                  ? styles.buttonView
                  : styles.buttonViewfull
              }
              onPress={() => rendertransferdetails(doctorid)}
              disabled={!isEnabled}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
